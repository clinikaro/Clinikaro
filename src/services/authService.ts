import { AppUser, AppMode, PatientScreen } from '../types';
import { auth, getCurrentUserToken, logOut } from '../firebase';
import { dataService, isSuperAdminEmail } from './dataService';

const SESSION_STORAGE_KEY = 'mdd_current_user';
const SESSION_TOKEN_KEY = 'curayu_session_token';
const GUEST_SESSION_KEY = 'curayu_guest_session';

export interface AuthInitResult {
  user: AppUser | null;
  isGuest: boolean;
  initialMode: AppMode;
  initialPath: string;
}

class AuthService {
  /**
   * Determine user destination dashboard/home URL based on role
   */
  getDestinationUrlForRole(role: string): string {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'doctor':
        return '/doctor';
      case 'reception':
        return '/reception';
      case 'patient':
      default:
        return '/home';
    }
  }

  /**
   * Determine corresponding AppMode based on role
   */
  getAppModeForRole(role: string): AppMode {
    switch (role) {
      case 'admin':
        return 'admin';
      case 'doctor':
        return 'doctor';
      case 'reception':
        return 'reception';
      case 'patient':
      default:
        return 'patient';
    }
  }

  /**
   * Securely persist session with server cookie and token
   */
  async persistSession(user: AppUser, idToken?: string): Promise<void> {
    try {
      // 1. Get Firebase token if available and not passed
      let token = idToken || user.token;
      if (!token) {
        token = (await getCurrentUserToken()) || undefined;
      }

      const userToStore: AppUser = {
        ...user,
        token: token || user.token,
        tokenExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      };

      // 2. Call server endpoint to set secure HttpOnly session cookie
      try {
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            user: userToStore,
            idToken: token
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            try {
              localStorage.setItem(SESSION_TOKEN_KEY, data.token);
              // Also sync cookie for client-side accessibility if needed
              document.cookie = `curayu_client_session=${encodeURIComponent(data.token)}; path=/; max-age=604800; SameSite=Lax`;
            } catch {}
          }
        }
      } catch (serverErr) {
        console.warn("Session cookie API sync warning (proceeding with local security):", serverErr);
      }

      // 3. Persist in local storage for instant offline recovery
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userToStore));
      sessionStorage.removeItem(GUEST_SESSION_KEY);
    } catch (e) {
      console.error("Failed to persist session securely:", e);
    }
  }

  /**
   * Verify session with server endpoint
   */
  async verifyServerSession(token?: string): Promise<AppUser | null> {
    try {
      const headers: Record<string, string> = {};
      const authToken = token || localStorage.getItem(SESSION_TOKEN_KEY);
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/auth/session', {
        method: 'GET',
        headers
      });

      if (!res.ok) return null;
      const data = await res.json();
      if (data.authenticated && data.user) {
        return data.user as AppUser;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Initialize and verify session on app startup.
   * Runs BEFORE any view is rendered so login page never flashes during refresh.
   */
  async initAuthSession(): Promise<AuthInitResult> {
    const isGuest = typeof window !== 'undefined' && sessionStorage.getItem(GUEST_SESSION_KEY) === 'true';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

    if (isGuest) {
      return {
        user: null,
        isGuest: true,
        initialMode: 'patient',
        initialPath: currentPath === '/login' ? '/home' : currentPath
      };
    }

    try {
      // 1. Wait for Firebase Auth state to finish restoring from browser storage
      await Promise.race([
        auth.authStateReady(),
        new Promise((resolve) => setTimeout(resolve, 1200)) // Max wait 1.2s
      ]);

      const fbUser = auth.currentUser;

      // 2. If Firebase user is authenticated:
      if (fbUser) {
        const userEmail = (fbUser.email || '').trim().toLowerCase();
        let role: 'admin' | 'doctor' | 'reception' | 'patient' = 'patient';
        let docId: string | undefined;
        let docName: string | undefined;
        let clinId: string | undefined;
        let clinName: string | undefined;

        if (isSuperAdminEmail(userEmail)) {
          role = 'admin';
        } else {
          const matchedDoc = dataService.findDoctorByEmail(userEmail);
          if (matchedDoc) {
            role = 'doctor';
            docId = matchedDoc.id;
            docName = matchedDoc.name;
            clinId = matchedDoc.clinicId;
            clinName = matchedDoc.clinicName;
          } else if (userEmail.includes('reception') || userEmail.includes('staff') || userEmail.includes('desk')) {
            role = 'reception';
            const matchedClinic = dataService.findClinicByAuthorizedGmail(userEmail);
            clinId = matchedClinic?.id;
            clinName = matchedClinic?.name;
          }
        }

        const idToken = (await getCurrentUserToken()) || undefined;

        const resolvedUser: AppUser = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || (role === 'admin' ? 'SaaS Suvidha Super Admin' : role === 'doctor' ? docName || 'Doctor' : 'Registered User'),
          email: fbUser.email || null,
          phoneNumber: fbUser.phoneNumber || null,
          photoURL: fbUser.photoURL || null,
          provider: 'google',
          role,
          doctorId: docId,
          doctorName: docName,
          clinicId: clinId,
          clinicName: clinName,
          token: idToken
        };

        // Sync with server session cookie
        await this.persistSession(resolvedUser, idToken);

        const targetMode = this.getAppModeForRole(role);
        const targetPath = this.getDestinationUrlForRole(role);

        return {
          user: resolvedUser,
          isGuest: false,
          initialMode: targetMode,
          initialPath: currentPath === '/login' ? targetPath : currentPath
        };
      }

      // 3. If no Firebase user, verify with server session (checks cookie or signed token)
      const serverUser = await this.verifyServerSession();
      if (serverUser) {
        const targetMode = this.getAppModeForRole(serverUser.role);
        const targetPath = this.getDestinationUrlForRole(serverUser.role);
        return {
          user: serverUser,
          isGuest: false,
          initialMode: targetMode,
          initialPath: currentPath === '/login' ? targetPath : currentPath
        };
      }

      // 4. Check cached user in localStorage
      const cached = localStorage.getItem(SESSION_STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as AppUser;
          // Verify expiry
          if (parsed && parsed.uid && (!parsed.tokenExpiresAt || parsed.tokenExpiresAt > Date.now())) {
            const targetMode = this.getAppModeForRole(parsed.role);
            const targetPath = this.getDestinationUrlForRole(parsed.role);
            return {
              user: parsed,
              isGuest: false,
              initialMode: targetMode,
              initialPath: currentPath === '/login' ? targetPath : currentPath
            };
          }
        } catch {}
      }

    } catch (e) {
      console.warn("Auth initialization note:", e);
    }

    // Default: Not logged in -> Show login
    return {
      user: null,
      isGuest: false,
      initialMode: 'login',
      initialPath: '/login'
    };
  }

  /**
   * Complete logout: clears server session cookie, Firebase auth, and local state
   */
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {}

    try {
      await logOut();
    } catch (e) {
      console.warn("Firebase logout warning:", e);
    }

    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem('mdd_my_booked_tokens');
      localStorage.removeItem('mdd_patient_phone');
      localStorage.removeItem('mdd_guest_tokens');
      sessionStorage.removeItem(GUEST_SESSION_KEY);
      // Clear cookie
      document.cookie = 'curayu_session=; path=/; max-age=0';
      document.cookie = 'curayu_client_session=; path=/; max-age=0';
    } catch {}
  }
}

export const authService = new AuthService();

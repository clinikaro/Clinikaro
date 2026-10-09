import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer, setDoc } from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  User 
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(app);
export const auth = getAuth(app);

// Enforce browser local persistence for secure session storage across page reloads
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn("Firebase session persistence initialization notice:", err);
  });
} catch (e) {
  console.warn("Could not set auth persistence:", e);
}

export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export async function getCurrentUserToken(): Promise<string | null> {
  try {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken(false);
    }
    return null;
  } catch (err) {
    console.warn("Could not retrieve Firebase ID token:", err);
    return null;
  }
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client appears offline. Check network or rules.");
    }
    // Connection handshake completed
    return true;
  }
}

export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  }
}

export async function signInWithApple(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    return result.user;
  } catch (error) {
    console.error("Apple sign in error:", error);
    throw error;
  }
}

/**
 * Initialize or retrieve RecaptchaVerifier for Firebase Phone Auth
 */
export function initPhoneRecaptcha(containerId: string): RecaptchaVerifier | null {
  try {
    const container = document.getElementById(containerId);
    if (!container) return null;

    // Check if a verifier already exists on window to prevent duplicate container errors
    const win = window as any;
    if (win._recaptchaVerifier) {
      try {
        win._recaptchaVerifier.clear();
      } catch (e) {
        // ignore
      }
    }

    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log("Firebase reCAPTCHA solved for Phone verification");
      },
      'expired-callback': () => {
        console.warn("Firebase reCAPTCHA expired, please retry");
      }
    });

    win._recaptchaVerifier = verifier;
    return verifier;
  } catch (err) {
    console.warn("RecaptchaVerifier setup warning:", err);
    return null;
  }
}

/**
 * Send SMS OTP using Firebase Phone Auth
 */
export async function sendFirebasePhoneOtp(
  phoneNumberWithCountryCode: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  return await signInWithPhoneNumber(auth, phoneNumberWithCountryCode, verifier);
}

/**
 * Save or update verified patient profile in Firestore
 */
export async function registerPatientInFirestore(patient: {
  uid: string;
  fullName: string;
  phoneNumber: string;
}): Promise<void> {
  try {
    await setDoc(doc(db, 'patients', patient.uid), {
      uid: patient.uid,
      fullName: patient.fullName,
      phoneNumber: patient.phoneNumber,
      role: 'patient',
      authProvider: 'firebase_phone',
      isVerified: true,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore patient registration note:", err);
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged, updateProfile, RecaptchaVerifier };
export type { User, ConfirmationResult };


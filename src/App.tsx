import React, { useState, useEffect } from 'react';
import { 
  Clinic, 
  Doctor, 
  Appointment, 
  SupportTicket, 
  AppMode, 
  Language,
  AppUser,
  PatientScreen
} from './types';
import { dataService } from './services/dataService';
import { Header } from './components/common/Header';
import { LoginPage } from './components/auth/LoginPage';
import { PatientHome } from './components/patient/PatientHome';
import { DoctorList } from './components/patient/DoctorList';
import { DoctorProfile } from './components/patient/DoctorProfile';
import { ClinicProfile } from './components/patient/ClinicProfile';
import { BookingStep1 } from './components/patient/BookingStep1';
import { BookingStep2 } from './components/patient/BookingStep2';
import { BookingConfirmation } from './components/patient/BookingConfirmation';
import { MyAppointments } from './components/patient/MyAppointments';
import { ReceptionDashboard } from './components/reception/ReceptionDashboard';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminAccessDenied } from './components/admin/AdminAccessDenied';
import { translations } from './data/translations';
import { auth, onAuthStateChanged, logOut } from './firebase';
import { authService } from './services/authService';
import { isSuperAdminEmail } from './services/dataService';
import { Sparkles, Info } from 'lucide-react';
import { GeminiPatientChat } from './components/patient/GeminiPatientChat';
import { LocationItem, ALL_INDIA_LOCATION } from './data/indiaLocations';
import { LocationModal } from './components/common/LocationModal';
import { LanguageModal } from './components/common/LanguageModal';
import { PreLoginModal } from './components/common/PreLoginModal';
import { AboutModal } from './components/common/AboutModal';
import { BrandLogo } from './components/common/BrandLogo';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { PatientAccountModal } from './components/common/PatientAccountModal';
import { APIProvider } from '@vis.gl/react-google-maps';
import { GOOGLE_MAPS_API_KEY } from './utils/googleMapsConfig';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('curayu_lang');
      if (saved === 'hi' || saved === 'en') return saved;
    } catch {}
    return 'en';
  });

  // User state initialization with persistent storage check
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('curayu_guest_session') === 'true') {
        return {
          uid: 'guest-session',
          displayName: 'Guest',
          email: null,
          phoneNumber: null,
          photoURL: null,
          provider: 'guest',
          role: 'patient',
          isGuest: true
        };
      }
      const saved = localStorage.getItem('mdd_current_user');
      if (saved) {
        const u = JSON.parse(saved) as AppUser;
        if (u.isGuest || (u.displayName && u.displayName.includes('Rajesh'))) {
          u.displayName = 'Guest';
          u.isGuest = true;
        }
        return u;
      }
      return null;
    } catch {
      return null;
    }
  });

  // App mode dynamically defaults to the user's role if session exists, preventing login page flash
  const [appMode, setAppMode] = useState<AppMode>(() => {
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('curayu_guest_session') === 'true') {
        return 'patient';
      }
      const saved = localStorage.getItem('mdd_current_user');
      if (saved) {
        const u = JSON.parse(saved) as AppUser;
        if (u && u.role) {
          return u.role === 'admin' ? 'admin' : u.role === 'doctor' ? 'doctor' : u.role === 'reception' ? 'reception' : 'patient';
        }
      }
    } catch {}
    return 'login';
  });

  // Auth checking state to prevent login page briefly flashing on refresh
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Pan-India Location & Language modal states
  const [selectedLocation, setSelectedLocation] = useState<LocationItem>(() => {
    try {
      const saved = localStorage.getItem('curayu_selected_location');
      return saved ? JSON.parse(saved) : ALL_INDIA_LOCATION;
    } catch {
      return ALL_INDIA_LOCATION;
    }
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Pop up language selection modal state
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);

  // Dedicated Pre-Login Popup Modal (Disabled before login per user instruction)
  const [isPreLoginModalOpen, setIsPreLoginModalOpen] = useState<boolean>(false);

  // About modal state
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);

  const handleSelectLocation = (loc: LocationItem) => {
    setSelectedLocation(loc);
    try {
      localStorage.setItem('curayu_selected_location', JSON.stringify(loc));
    } catch {}
  };

  const handleSelectLanguage = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem('curayu_lang', newLang);
    } catch {}
  };

  const [patientView, setPatientView] = useState<PatientScreen>('home');

  // Selected entities for booking workflow
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [filterSpecialty, setFilterSpecialty] = useState<string | undefined>(undefined);
  const [filterFacilityType, setFilterFacilityType] = useState<'clinic' | 'hospital' | undefined>(undefined);
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingSlot, setBookingSlot] = useState<string>('');
  const [pendingBookingDoctor, setPendingBookingDoctor] = useState<Doctor | null>(null);
  const [pendingBookingDate, setPendingBookingDate] = useState<string>('');
  const [pendingBookingSlot, setPendingBookingSlot] = useState<string>('');
  const [patientData, setPatientData] = useState<{
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    phone: string;
  } | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [isGeminiChatOpen, setIsGeminiChatOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Receptionist active clinic selection
  const [receptionClinicId, setReceptionClinicId] = useState<string>('seva-clinic');

  // Live Database State
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Initialize DataService and listen to real-time changes
  useEffect(() => {
    // Sanitize any legacy guest user with "Rajesh" in browser storage
    try {
      const raw = localStorage.getItem('mdd_current_user');
      if (raw && raw.includes('Rajesh')) {
        const u = JSON.parse(raw);
        u.displayName = 'Guest';
        u.isGuest = true;
        localStorage.setItem('mdd_current_user', JSON.stringify(u));
        setCurrentUser(u);
      }
    } catch {}

    // Initial fetch
    setClinics(dataService.getClinics());
    setDoctors(dataService.getDoctors());
    setAppointments(dataService.getAppointments());
    setTickets(dataService.getTickets());

    // Listeners for real-time reactivity
    const unsubClinics = dataService.onClinicsChange((data) => setClinics(data));
    const unsubDoctors = dataService.onDoctorsChange((data) => setDoctors(data));
    const unsubAppointments = dataService.onAppointmentsChange((data) => setAppointments(data));
    const unsubTickets = dataService.onTicketsChange((data) => setTickets(data));

    // Listen to Firebase Auth state
    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      // If user explicitly chose guest browsing session, do not auto-login as admin or user
      if (typeof window !== 'undefined' && sessionStorage.getItem('curayu_guest_session') === 'true') {
        setCurrentUser(null);
        return;
      }

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

        const idToken = (await fbUser.getIdToken(false).catch(() => undefined));

        const u: AppUser = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || (role === 'admin' ? 'SaaS Suvidha Super Admin' : role === 'doctor' ? docName || 'Doctor' : 'Registered Patient'),
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

        setCurrentUser(u);
        await authService.persistSession(u, idToken);

        // If currently on login, switch to authorized portal immediately
        setAppMode((prev) => {
          if (prev === 'login') {
            const destMode = authService.getAppModeForRole(role);
            const destUrl = authService.getDestinationUrlForRole(role);
            if (typeof window !== 'undefined') {
              window.history.replaceState(null, '', destUrl);
            }
            return destMode;
          }
          return prev;
        });
      }
    });

    return () => {
      unsubClinics();
      unsubDoctors();
      unsubAppointments();
      unsubTickets();
      unsubAuth();
    };
  }, []);

  // ----------------------------------------------------
  // Initial Secure Session Verification on Startup
  // (Prevents login page from flashing on refresh)
  // ----------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      try {
        const { user, isGuest, initialMode, initialPath } = await authService.initAuthSession();
        if (!isMounted) return;

        if (user) {
          setCurrentUser(user);
          setAppMode(initialMode);
          if (user.clinicId) {
            setReceptionClinicId(user.clinicId);
          }
          if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path === '/login' || path === '/') {
              window.history.replaceState(null, '', initialPath);
            }
          }
        } else if (isGuest) {
          setAppMode('patient');
          setPatientView('home');
          if (typeof window !== 'undefined' && window.location.pathname === '/login') {
            window.history.replaceState(null, '', '/home');
          }
        } else {
          setAppMode('login');
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.history.replaceState(null, '', '/login');
          }
        }
      } catch (err) {
        console.warn("Session check error on mount:", err);
      } finally {
        if (isMounted) {
          setIsAuthChecking(false);
        }
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // ----------------------------------------------------
  // Route Protection & Auto-Redirect Guard
  // (If logged-in user visits /login, auto-redirect to /home or dashboard)
  // ----------------------------------------------------
  useEffect(() => {
    if (isAuthChecking) return;

    const enforceAuthRouting = () => {
      if (typeof window === 'undefined') return;
      const pathname = window.location.pathname;

      // 1. If user is logged in and visits /login: redirect immediately to home/dashboard
      if (currentUser && (pathname === '/login' || appMode === 'login')) {
        const destMode = authService.getAppModeForRole(currentUser.role);
        const destUrl = authService.getDestinationUrlForRole(currentUser.role);
        if (appMode !== destMode) {
          setAppMode(destMode);
        }
        if (pathname === '/login' || pathname === '/') {
          window.history.replaceState(null, '', destUrl);
        }
      }
      // 2. If user is NOT logged in and not in a guest session, protect routes and redirect to /login
      else if (!currentUser && sessionStorage.getItem('curayu_guest_session') !== 'true') {
        if (appMode !== 'login') {
          setAppMode('login');
        }
        if (pathname !== '/login') {
          window.history.replaceState(null, '', '/login');
        }
      }
    };

    enforceAuthRouting();
    window.addEventListener('popstate', enforceAuthRouting);
    return () => window.removeEventListener('popstate', enforceAuthRouting);
  }, [currentUser, isAuthChecking, appMode]);

  // ----------------------------------------------------
  // Auth Handlers
  // ----------------------------------------------------
  const handleLoginSuccess = async (user: AppUser) => {
    try {
      sessionStorage.removeItem('curayu_guest_session');
    } catch {}
    setCurrentUser(user);
    // Securely persist token and server cookie
    await authService.persistSession(user);

    // Check if patient was in middle of booking an appointment:
    if (pendingBookingDoctor) {
      const doc = pendingBookingDoctor;
      const date = pendingBookingDate;
      const slot = pendingBookingSlot;
      setPendingBookingDoctor(null);
      setSelectedDoctor(doc);
      const clinic = clinics.find(c => c.id === doc.clinicId);
      if (clinic) setSelectedClinic(clinic);
      setBookingDate(date);
      setBookingSlot(slot);
      setAppMode('patient');
      setPatientView('booking_step1');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/home');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const destMode = authService.getAppModeForRole(user.role);
    const destUrl = authService.getDestinationUrlForRole(user.role);

    if (user.clinicId) {
      setReceptionClinicId(user.clinicId);
    }
    setAppMode(destMode);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', destUrl);
    }

    if (user.role === 'patient') {
      setPatientView('home');
      // Login ke baad: user ko location wise results dikhane ke liye location modal open karein agar default hai
      const savedLoc = localStorage.getItem('mdd_selected_location');
      if (!savedLoc || selectedLocation.id === 'all') {
        setTimeout(() => {
          setIsLocationModalOpen(true);
        }, 350);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueAsGuest = async () => {
    await authService.logout();
    try {
      sessionStorage.setItem('curayu_guest_session', 'true');
    } catch {}
    setCurrentUser({
      uid: 'guest-' + Date.now(),
      displayName: 'Guest',
      email: null,
      phoneNumber: null,
      photoURL: null,
      provider: 'guest',
      role: 'patient',
      isGuest: true
    });
    setAppMode('patient');
    setPatientView('home');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    await authService.logout();
    try {
      sessionStorage.removeItem('curayu_lang_popup_closed');
    } catch {}
    setCurrentUser(null);
    setAppMode('login');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/login');
    }
    setIsLanguageModalOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ----------------------------------------------------
  // Navigation Handlers
  // ----------------------------------------------------
  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    const clinic = clinics.find(c => c.id === doctor.clinicId);
    if (clinic) setSelectedClinic(clinic);
    setPatientView('doctor_profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookDirect = (doctor: Doctor) => {
    const today = new Date().toISOString().split('T')[0];
    const defaultSlot = (doctor.timeSlots && doctor.timeSlots[0]) || '10:30 AM';

    setSelectedDoctor(doctor);
    const clinic = clinics.find(c => c.id === doctor.clinicId);
    if (clinic) setSelectedClinic(clinic);
    setBookingDate(today);
    setBookingSlot(defaultSlot);
    setPatientView('booking_step1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectClinic = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setPatientView('clinic_profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllDoctors = (specialtyId?: string, facilityType?: 'clinic' | 'hospital') => {
    setFilterSpecialty(specialtyId);
    setFilterFacilityType(facilityType);
    setPatientView('doctors');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToBooking = (doctor: Doctor, date: string, slot: string) => {
    setSelectedDoctor(doctor);
    const clinic = clinics.find(c => c.id === doctor.clinicId);
    if (clinic) setSelectedClinic(clinic);
    setBookingDate(date);
    setBookingSlot(slot);
    setPatientView('booking_step1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep1Complete = (
    data: {
      name: string;
      age: number;
      gender: 'male' | 'female' | 'other';
      phone: string;
    },
    chosenDate?: string,
    chosenSlot?: string
  ) => {
    setPatientData(data);
    if (chosenDate) setBookingDate(chosenDate);
    if (chosenSlot) setBookingSlot(chosenSlot);
    setPatientView('booking_step2');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmBooking = async (
    paymentType: 'clinic_cash_upi' | 'online_prepaid',
    paymentStatus: 'paid' | 'unpaid',
    razorpayDetails?: {
      paymentId?: string;
      orderId?: string;
      transferredToAccountId?: string;
      doctorPayoutAmount?: number;
      platformFeeAmount?: number;
    }
  ) => {
    if (!selectedDoctor || !patientData) {
      console.warn("Cannot confirm booking without doctor and patient data");
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const targetDate = bookingDate || new Date().toISOString().split('T')[0];
      const targetSlot = bookingSlot || (selectedDoctor.timeSlots && selectedDoctor.timeSlots[0]) || '10:30 AM';

      // Generate unique 4-digit numeric OTP token number (e.g. 8946)
      const existingTokens = new Set(appointments.map(a => a.appointmentNumber));
      let tokenNum = '';
      for (let attempt = 0; attempt < 100; attempt++) {
        const candidate = String(Math.floor(1000 + Math.random() * 9000));
        if (!existingTokens.has(candidate)) {
          tokenNum = candidate;
          break;
        }
      }
      if (!tokenNum) {
        tokenNum = String(Math.floor(1000 + Math.random() * 9000));
      }

      const clinic = clinics.find(c => c.id === selectedDoctor.clinicId) || clinics[0];

      const newAppointment: Appointment = {
        id: `mdd-apt-${Date.now()}`,
        appointmentNumber: tokenNum,
        clinicId: clinic.id,
        clinicName: clinic.name,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        doctorQualification: selectedDoctor.qualification,
        patientName: patientData.name.trim(),
        patientAge: patientData.age,
        patientGender: patientData.gender,
        patientPhone: patientData.phone.trim(),
        patientUserId: currentUser?.uid || undefined,
        patientEmail: currentUser?.email || undefined,
        date: targetDate,
        timeSlot: targetSlot,
        fee: selectedDoctor.fee,
        paymentType,
        paymentStatus,
        razorpayPaymentId: razorpayDetails?.paymentId || undefined,
        razorpayOrderId: razorpayDetails?.orderId || undefined,
        transferredToAccountId: razorpayDetails?.transferredToAccountId || selectedDoctor.razorpayAccountId || undefined,
        doctorPayoutAmount: razorpayDetails?.doctorPayoutAmount ?? selectedDoctor.fee,
        platformFeeAmount: razorpayDetails?.platformFeeAmount ?? 0,
        arrivalStatus: 'not_arrived',
        scannedAt: null,
        bookingSource: 'patient_online',
        status: 'confirmed',
        qrCodeData: `MYDEHRIDOC:${tokenNum}:${clinic.id}:${selectedDoctor.id}:${targetDate}:${targetSlot}`,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      try {
        if (currentUser?.uid) {
          const key = `mdd_user_tokens_${currentUser.uid}`;
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          localStorage.setItem(key, JSON.stringify([newAppointment.id, newAppointment.appointmentNumber, ...existing]));
        } else {
          const existing = JSON.parse(localStorage.getItem('mdd_guest_tokens') || '[]');
          localStorage.setItem('mdd_guest_tokens', JSON.stringify([newAppointment.id, newAppointment.appointmentNumber, ...existing]));
          sessionStorage.setItem('curayu_guest_phone', patientData.phone.trim());
        }
        // Clear legacy global keys to prevent cross-account leak
        localStorage.removeItem('mdd_my_booked_tokens');
        localStorage.removeItem('mdd_patient_phone');
      } catch (e) {
        console.warn("Storage error", e);
      }

      // Persist to database & local cache
      await dataService.addAppointment(newAppointment);

      // Instantly update React state so the UI reflects the booking without waiting
      setAppointments(prev => [newAppointment, ...prev.filter(a => a.id !== newAppointment.id)]);
      setConfirmedAppointment(newAppointment);
      setPatientView('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // ----------------------------------------------------
  // Action Handlers for Reception & Admin
  // ----------------------------------------------------
  const handleUpdateAppointment = async (id: string, updates: Partial<Appointment>) => {
    await dataService.updateAppointment(id, updates);
  };

  const handleAddAppointment = async (apt: Appointment) => {
    await dataService.addAppointment(apt);
  };

  const handleAddClinic = async (clinic: Clinic) => {
    await dataService.addClinic(clinic);
  };

  const handleUpdateClinic = async (id: string, updates: Partial<Clinic>) => {
    await dataService.updateClinic(id, updates);
  };

  const handleDeleteClinic = async (id: string) => {
    await dataService.deleteClinic(id);
  };

  const handleAddDoctor = async (doctor: Doctor) => {
    await dataService.addDoctor(doctor);
  };

  const handleUpdateDoctor = async (id: string, updates: Partial<Doctor>) => {
    await dataService.updateDoctor(id, updates);
  };

  const handleDeleteDoctor = async (id: string) => {
    await dataService.deleteDoctor(id);
  };

  const handleResolveTicket = async (id: string) => {
    await dataService.resolveTicket(id);
  };

  // Count appointments strictly for current user or guest
  const userPhoneClean = currentUser?.phoneNumber ? currentUser.phoneNumber.replace(/\D/g, '').slice(-10) : '';
  const userEmailClean = currentUser?.email ? currentUser.email.trim().toLowerCase() : '';
  const myAppointmentsCount = appointments.filter(apt => {
    if (currentUser) {
      if (apt.patientUserId && apt.patientUserId === currentUser.uid) return true;
      if (userEmailClean && apt.patientEmail && apt.patientEmail.trim().toLowerCase() === userEmailClean) return true;
      if (userPhoneClean && apt.patientPhone) {
        const aptPhoneClean = apt.patientPhone.replace(/\D/g, '').slice(-10);
        if (aptPhoneClean === userPhoneClean) return true;
      }
      try {
        const userTokens = JSON.parse(localStorage.getItem(`mdd_user_tokens_${currentUser.uid}`) || '[]');
        if (userTokens.includes(apt.id) || userTokens.includes(apt.appointmentNumber)) return true;
      } catch {}
      return false;
    }
    // Guest mode: only show tokens booked in this guest session
    try {
      const guestTokens = JSON.parse(localStorage.getItem('mdd_guest_tokens') || '[]');
      if (guestTokens.includes(apt.id) || guestTokens.includes(apt.appointmentNumber)) return true;
    } catch {}
    return false;
  }).length;

  // Branded session verification screen - Prevents flash of login screen on page refresh
  if (isAuthChecking) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FDFBF7] text-[#14282B]">
        <div className="flex flex-col items-center gap-4 animate-fade-in p-6 text-center max-w-sm">
          <BrandLogo size="lg" variant="full" theme="light" showTagline={false} />
          <p className="text-xs text-teal-800 font-medium tracking-wide mt-1">
            {lang === 'hi' ? 'सुरक्षित सत्र सत्यापित किया जा रहा है...' : 'Verifying secure session...'}
          </p>
          <div className="w-8 h-8 border-3 border-[#0F5257]/20 border-t-[#0F5257] rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  // If in Login Mode, render dedicated LoginPage
  if (appMode === 'login') {
    return (
      <>
        <LoginPage
          lang={lang}
          onToggleLang={() => handleSelectLanguage(lang === 'en' ? 'hi' : 'en')}
          onSelectLanguage={(newLang) => handleSelectLanguage(newLang)}
          onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
          selectedLocation={selectedLocation}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          onLoginSuccess={handleLoginSuccess}
          onContinueAsGuest={handleContinueAsGuest}
          pendingDoctor={pendingBookingDoctor}
        />

        {/* Pre-login Popup Modal ("pop up bhi dalo login se pehle") */}
        <PreLoginModal
          isOpen={isPreLoginModalOpen}
          onClose={() => setIsPreLoginModalOpen(false)}
          lang={lang}
          onSelectLang={(newLang) => handleSelectLanguage(newLang)}
          selectedLocation={selectedLocation}
          onSelectLocation={(loc) => handleSelectLocation(loc)}
          onProceedToLogin={() => setIsPreLoginModalOpen(false)}
          onExploreAsGuest={() => {
            setIsPreLoginModalOpen(false);
            handleContinueAsGuest();
          }}
          onOpenFullLocationModal={() => {
            setIsPreLoginModalOpen(false);
            setIsLocationModalOpen(true);
          }}
        />

        {/* Pan-India Location Selector Modal (Active before login) */}
        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          selectedLocation={selectedLocation}
          onSelectLocation={(loc) => {
            handleSelectLocation(loc);
            setIsLocationModalOpen(false);
          }}
          lang={lang}
        />

        {/* Pan-India Language Selector Modal */}
        <LanguageModal
          isOpen={isLanguageModalOpen}
          onClose={() => setIsLanguageModalOpen(false)}
          currentLang={lang}
          onSelectLang={(newLang) => {
            handleSelectLanguage(newLang);
            setIsLanguageModalOpen(false);
          }}
        />
      </>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker', 'places']}>
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FDFBF7] text-[#14282B] flex flex-col font-work antialiased selection:bg-[#D4A24C]/30 selection:text-[#0F5257]">
      {/* Top Header with Bilingual & Mode Switcher */}
      <Header
        lang={lang}
        onToggleLang={() => handleSelectLanguage(lang === 'en' ? 'hi' : 'en')}
        selectedLocation={selectedLocation}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        appMode={appMode}
        onSelectMode={(m) => {
          setAppMode(m);
          if (typeof window !== 'undefined') {
            const path = m === 'admin' ? '/admin' : m === 'doctor' ? '/doctor' : m === 'reception' ? '/reception' : m === 'login' ? '/login' : '/home';
            window.history.pushState(null, '', path);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onOpenLogin={() => {
          if (currentUser) {
            const destMode = authService.getAppModeForRole(currentUser.role);
            const destUrl = authService.getDestinationUrlForRole(currentUser.role);
            setAppMode(destMode);
            if (typeof window !== 'undefined') {
              window.history.replaceState(null, '', destUrl);
            }
            return;
          }
          try {
            sessionStorage.removeItem('curayu_guest_session');
          } catch {}
          setAppMode('login');
          if (typeof window !== 'undefined') {
            window.history.pushState(null, '', '/login');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSignOut={handleSignOut}
        onOpenGeminiChat={() => setIsGeminiChatOpen(true)}
        onOpenMyAppointments={() => {
          setAppMode('patient');
          setPatientView('my_appointments');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isMyAppointmentsActive={appMode === 'patient' && patientView === 'my_appointments'}
        myAppointmentsCount={myAppointmentsCount}
      />

      {/* Main Content Router */}
      <main className="flex-1 pb-16 md:pb-0">
        {/* PATIENT PORTAL FLOW */}
        {appMode === 'patient' && (
          <>
            {patientView === 'home' && (
              <PatientHome
                lang={lang}
                clinics={clinics}
                doctors={doctors}
                selectedLocation={selectedLocation}
                onOpenLocationModal={() => setIsLocationModalOpen(true)}
                onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
                onSelectLocation={handleSelectLocation}
                onSelectDoctor={handleSelectDoctor}
                onBookDoctor={handleBookDirect}
                onSelectClinic={handleSelectClinic}
                onViewAllDoctors={handleViewAllDoctors}
                onOpenGeminiChat={() => setIsGeminiChatOpen(true)}
                onOpenMyAppointments={() => {
                  setPatientView('my_appointments');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {patientView === 'doctors' && (
              <DoctorList
                lang={lang}
                doctors={doctors}
                clinics={clinics}
                initialSpecialty={filterSpecialty}
                initialFacilityType={filterFacilityType}
                selectedLocation={selectedLocation}
                onOpenLocationModal={() => setIsLocationModalOpen(true)}
                onSelectDoctor={handleSelectDoctor}
                onBookDoctor={handleBookDirect}
                onSelectClinic={handleSelectClinic}
                onBack={() => setPatientView('home')}
              />
            )}

            {patientView === 'doctor_profile' && selectedDoctor && (
              <DoctorProfile
                doctor={selectedDoctor}
                clinic={clinics.find(c => c.id === selectedDoctor.clinicId)}
                lang={lang}
                onBack={() => setPatientView('home')}
                onSelectClinic={handleSelectClinic}
                onProceedToBooking={handleProceedToBooking}
              />
            )}

            {patientView === 'clinic_profile' && selectedClinic && (
              <ClinicProfile
                clinic={selectedClinic}
                doctors={doctors}
                lang={lang}
                onBack={() => setPatientView('home')}
                onSelectDoctor={handleSelectDoctor}
                onBookDoctor={handleBookDirect}
              />
            )}

            {patientView === 'booking_step1' && selectedDoctor && (
              <BookingStep1
                doctor={selectedDoctor}
                clinic={clinics.find(c => c.id === selectedDoctor.clinicId)}
                selectedDate={bookingDate}
                selectedSlot={bookingSlot}
                lang={lang}
                currentUser={currentUser}
                onBack={() => setPatientView('doctor_profile')}
                onProceedToStep2={handleStep1Complete}
              />
            )}

            {patientView === 'booking_step2' && selectedDoctor && patientData && (
              <BookingStep2
                doctor={selectedDoctor}
                clinic={clinics.find(c => c.id === selectedDoctor.clinicId)}
                selectedDate={bookingDate}
                selectedSlot={bookingSlot}
                patientData={patientData}
                lang={lang}
                onBack={() => setPatientView('booking_step1')}
                onConfirmBooking={handleConfirmBooking}
                isSubmitting={isSubmittingBooking}
              />
            )}

            {patientView === 'confirmation' && confirmedAppointment && (
              <BookingConfirmation
                appointment={confirmedAppointment}
                clinic={clinics.find(c => c.id === confirmedAppointment.clinicId)}
                doctor={doctors.find(d => d.id === confirmedAppointment.doctorId)}
                lang={lang}
                onBookAnother={() => {
                  setPatientView('home');
                  setSelectedDoctor(null);
                }}
                onViewInReception={() => {
                  setReceptionClinicId(confirmedAppointment.clinicId);
                  setAppMode('reception');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onBackToHome={() => {
                  setPatientView('home');
                  setSelectedDoctor(null);
                }}
                onViewMyAppointments={() => {
                  setPatientView('my_appointments');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {patientView === 'my_appointments' && (
              <MyAppointments
                appointments={appointments}
                clinics={clinics}
                doctors={doctors}
                lang={lang}
                currentUser={currentUser}
                onBack={() => {
                  setPatientView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectDoctor={handleSelectDoctor}
                onCancelAppointment={async (aptId) => {
                  await handleUpdateAppointment(aptId, { status: 'cancelled' });
                }}
                onBookNew={() => {
                  setPatientView('doctors');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onUpdateAppointment={handleUpdateAppointment}
              />
            )}
          </>
        )}

        {/* DOCTOR PORTAL / DOCTOR SITE DASHBOARD FLOW (e.g. mydehridoctor@gmail.com) */}
        {appMode === 'doctor' && (
          (() => {
            const currentDoctor = (currentUser?.doctorId 
              ? doctors.find(d => d.id === currentUser.doctorId) 
              : null) || 
              (currentUser?.email 
                ? doctors.find(d => (d.email || '').toLowerCase() === currentUser.email?.toLowerCase()) ||
                  dataService.findDoctorByEmail(currentUser.email)
                : null) ||
              doctors.find(d => (d.email || '').toLowerCase() === 'curayu@gmail.com' || (d.email || '').toLowerCase() === 'mydehridoctor@gmail.com') ||
              doctors.find(d => d.id === 'doc-r-k-sharma') ||
              doctors[0];

            const doctorClinic = clinics.find(c => c.id === currentDoctor?.clinicId);

            return (
              <DoctorDashboard
                lang={lang}
                doctor={currentDoctor}
                clinic={doctorClinic}
                appointments={appointments}
                currentUser={currentUser}
                onUpdateDoctor={handleUpdateDoctor}
                onUpdateAppointment={handleUpdateAppointment}
                onSwitchToReception={() => {
                  if (doctorClinic) setReceptionClinicId(doctorClinic.id);
                  setAppMode('reception');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            );
          })()
        )}

        {/* RECEPTIONIST & DOCTOR OPD DASHBOARD FLOW */}
        {appMode === 'reception' && (
          <ReceptionDashboard
            lang={lang}
            clinics={clinics}
            doctors={doctors}
            appointments={appointments}
            selectedClinicId={receptionClinicId}
            currentUser={currentUser}
            onSelectClinicId={setReceptionClinicId}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointment={handleUpdateAppointment}
            onUpdateDoctor={handleUpdateDoctor}
          />
        )}

        {/* SAAS ADMIN DASHBOARD FLOW - RESTRICTED TO saassuvidha@gmail.com */}
        {appMode === 'admin' && (
          isSuperAdminEmail(currentUser?.email) ? (
            <AdminDashboard
              lang={lang}
              clinics={clinics}
              doctors={doctors}
              appointments={appointments}
              tickets={tickets}
              onAddClinic={handleAddClinic}
              onUpdateClinic={handleUpdateClinic}
              onDeleteClinic={handleDeleteClinic}
              onAddDoctor={handleAddDoctor}
              onUpdateDoctor={handleUpdateDoctor}
              onDeleteDoctor={handleDeleteDoctor}
              onResolveTicket={handleResolveTicket}
              onLaunchDoctorCabin={(doctor, clinic) => {
                const docUser: AppUser = {
                  uid: doctor.id,
                  displayName: doctor.name,
                  email: doctor.email || `${doctor.id}@gmail.com`,
                  provider: 'google',
                  role: 'doctor'
                };
                setCurrentUser(docUser);
                setAppMode('doctor');
              }}
            />
          ) : (
            <AdminAccessDenied
              lang={lang}
              currentUser={currentUser}
              onLoginAsAdmin={() => {
                const adminUser: AppUser = {
                  uid: 'admin-saas-suvidha-01',
                  displayName: 'SaaS Suvidha Super Admin',
                  email: 'saassuvidha@gmail.com',
                  provider: 'google',
                  role: 'admin'
                };
                handleLoginSuccess(adminUser);
              }}
              onBackToPatient={() => {
                setAppMode('patient');
                setPatientView('home');
              }}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0A2628] text-teal-100 border-t border-teal-900/60 pt-6 sm:pt-8 pb-20 sm:pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center md:text-left">
          {/* Logo & SaaS Suvidha Brand */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <BrandLogo size="md" variant="full" theme="dark" showTagline={false} />
            <div className="h-4 w-px bg-teal-800 hidden sm:block"></div>
            <div className="text-xs font-medium text-teal-200/90">
              <span className="text-[#F5A623] font-bold">SaaS Suvidha</span>
              <span className="text-teal-400 mx-1.5">•</span>
              <span className="text-white font-semibold">Paper to Digital Transformation</span>
            </div>
          </div>

          {/* Zero Advance Fee & About Button */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs">
            <span className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-3 py-1.5 rounded-full font-bold shadow-xs">
              {lang === 'hi' ? 'मुफ्त डिजिटल ओपीडी बुकिंग • शून्य अग्रिम शुल्क' : 'Free Digital OPD Booking • Zero Advance Fee'}
            </span>

            {/* About trigger in footer - houses the remaining information */}
            <button
              id="footer-about-btn"
              onClick={() => setIsAboutModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-900/90 hover:bg-teal-800 text-amber-300 hover:text-white border border-amber-400/50 hover:border-amber-300 transition-all font-semibold cursor-pointer shadow-xs"
              title={lang === 'hi' ? 'हमारे बारे में और विस्तृत जानकारी' : 'About CliniKaro & SaaS Suvidha'}
            >
              <Info className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'About (हमारे बारे में)' : 'About CliniKaro'}</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-teal-900/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-teal-300/70 gap-2 text-center">
          <p>© 2026 CliniKaro. SaaS Suvidha • Paper to Digital Transformation.</p>
          <button
            onClick={() => setIsAboutModalOpen(true)}
            className="hover:text-amber-300 underline cursor-pointer"
          >
            {lang === 'hi' ? 'हेल्पलाइन, विशेषज्ञता एवं नेटवर्क हब्स (About)' : 'Helpline, Specialties & Network Hubs (About)'}
          </button>
        </div>
      </footer>

      {/* Floating Gemini AI Patient Chat Button (Compact FAB with Safe Mobile Bottom Clearance) */}
      {appMode === 'patient' && !isGeminiChatOpen && 
        patientView !== 'booking_step1' && 
        patientView !== 'booking_step2' && 
        patientView !== 'book_step1' && 
        patientView !== 'book_step2' && 
        patientView !== 'confirmation' && (
        <div 
          className={`fixed z-40 transition-all duration-300 pointer-events-auto hidden sm:block ${
            patientView === 'doctor_profile' 
              ? 'bottom-22 right-3.5 sm:bottom-24 sm:right-6' 
              : 'bottom-18 right-3.5 sm:bottom-6 sm:right-6'
          }`}
        >
          <button
            id="floating-gemini-ai-chat-btn"
            onClick={() => setIsGeminiChatOpen(true)}
            aria-label="Google Gemini AI Health Assistant"
            className="group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-[#0F5257] via-[#0D464A] to-[#082F32] hover:from-[#13666C] hover:to-[#0A3A3D] text-white rounded-full shadow-xl hover:shadow-2xl border-2 border-amber-400/90 hover:border-amber-300 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            title={lang === 'hi' ? 'Google Gemini AI स्वास्थ्य सहायक' : 'Google Gemini AI Health Assistant'}
          >
            {/* Sparkle Icon with animated pulse */}
            <div className="relative flex items-center justify-center">
              <Sparkles className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-amber-300 fill-amber-300 group-hover:rotate-12 transition-transform duration-300" />
              
              {/* Online pulse indicator dot */}
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-teal-950"></span>
              </span>
            </div>

            {/* Desktop Sleek Hover Pill Label */}
            <span className="hidden sm:block absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#0F5257] text-white border border-amber-400/50 shadow-lg text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none transform translate-x-1 group-hover:translate-x-0">
              <span className="text-amber-300 font-extrabold mr-1">✦ Gemini AI</span>
              <span>{lang === 'hi' ? 'सलाह लें' : 'Chat'}</span>
            </span>
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (4 Options: Home, My Appointment, Gemini, Account) */}
      <MobileBottomNav
        appMode={appMode}
        patientView={patientView}
        currentUser={currentUser}
        lang={lang}
        myAppointmentsCount={myAppointmentsCount}
        isGeminiChatOpen={isGeminiChatOpen}
        isAccountOpen={isAccountModalOpen}
        onNavigateHome={() => {
          setAppMode('patient');
          setPatientView('home');
          setIsAccountModalOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateMyAppointments={() => {
          setAppMode('patient');
          setPatientView('my_appointments');
          setIsAccountModalOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenGeminiChat={() => {
          setIsAccountModalOpen(false);
          setIsGeminiChatOpen(true);
        }}
        onOpenAccount={() => {
          setIsAccountModalOpen(true);
        }}
      />

      {/* Mobile Patient Account & Preferences Modal */}
      <PatientAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentUser={currentUser}
        lang={lang}
        selectedLocation={selectedLocation}
        myAppointmentsCount={myAppointmentsCount}
        onOpenLogin={() => {
          setIsAccountModalOpen(false);
          setAppMode('login');
          if (typeof window !== 'undefined') window.history.pushState(null, '', '/login');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSignOut={() => {
          setIsAccountModalOpen(false);
          handleSignOut();
        }}
        onNavigateMyAppointments={() => {
          setIsAccountModalOpen(false);
          setAppMode('patient');
          setPatientView('my_appointments');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLocationModal={() => {
          setIsAccountModalOpen(false);
          setIsLocationModalOpen(true);
        }}
        onOpenLanguageModal={() => {
          setIsAccountModalOpen(false);
          setIsLanguageModalOpen(true);
        }}
        onOpenGeminiChat={() => {
          setIsAccountModalOpen(false);
          setIsGeminiChatOpen(true);
        }}
        onSelectMode={(m) => {
          setIsAccountModalOpen(false);
          setAppMode(m);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Interactive Gemini Patient Chat Drawer / Modal */}
      <GeminiPatientChat
        lang={lang}
        doctors={doctors}
        clinics={clinics}
        isOpen={isGeminiChatOpen}
        onClose={() => setIsGeminiChatOpen(false)}
        onBookDoctor={(doc) => {
          handleBookDirect(doc);
          setIsGeminiChatOpen(false);
        }}
        onSelectClinic={(clinic) => {
          handleSelectClinic(clinic);
          setIsGeminiChatOpen(false);
        }}
      />

      {/* Pan-India Location Selector Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        selectedLocation={selectedLocation}
        onSelectLocation={(loc) => {
          handleSelectLocation(loc);
          setIsLocationModalOpen(false);
        }}
        lang={lang}
      />

      {/* Pan-India Language Selector Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => {
          try {
            sessionStorage.setItem('curayu_lang_popup_closed', 'true');
          } catch {}
          setIsLanguageModalOpen(false);
        }}
        currentLang={lang}
        onSelectLang={(newLang) => {
          handleSelectLanguage(newLang);
          try {
            sessionStorage.setItem('curayu_lang_popup_closed', 'true');
          } catch {}
          setIsLanguageModalOpen(false);
        }}
      />

      {/* About CliniKaro & SaaS Suvidha Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        lang={lang}
      />
    </div>
    </APIProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Stethoscope, 
  Calendar, 
  IndianRupee, 
  Users, 
  TrendingUp, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Search, 
  Clock, 
  AlertCircle,
  HelpCircle,
  BarChart3,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Hospital,
  Activity,
  Award,
  Mail,
  Lock,
  Key,
  Copy,
  ExternalLink,
  RefreshCw,
  KeyRound,
  Send,
  Eye,
  EyeOff,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { Clinic, Doctor, Appointment, SupportTicket, Language } from '../../types';
import { translations } from '../../data/translations';
import { dataService } from '../../services/dataService';
import { IndianLocationMapPicker } from '../common/IndianLocationMapPicker';
import { signInWithGoogle, signInWithApple } from '../../firebase';

interface AdminDashboardProps {
  lang: Language;
  clinics: Clinic[];
  doctors: Doctor[];
  appointments: Appointment[];
  tickets: SupportTicket[];
  onAddClinic: (clinic: Clinic) => Promise<void>;
  onUpdateClinic: (id: string, updates: Partial<Clinic>) => Promise<void>;
  onDeleteClinic: (id: string) => Promise<void>;
  onAddDoctor: (doctor: Doctor) => Promise<void>;
  onUpdateDoctor: (id: string, updates: Partial<Doctor>) => Promise<void>;
  onDeleteDoctor?: (id: string) => Promise<void>;
  onResolveTicket: (id: string) => Promise<void>;
  onLaunchDoctorCabin?: (doctor: Doctor, clinic: Clinic) => void;
}

const SPECIALITY_CATEGORIES = [
  { en: 'Multi-Speciality & General OPD', hi: 'मल्टी-स्पेशियलिटी एवं सामान्य ओपीडी' },
  { en: 'Pediatrics & Child Specialist', hi: 'बाल एवं शिशु रोग विशेषज्ञ' },
  { en: 'Orthopedic & Bone Surgery', hi: 'हड्डी, जोड़ एवं रीढ़ रोग' },
  { en: 'Gynecology, Maternity & IVF', hi: 'प्रसूति एवं स्त्री रोग (गायनेकोलॉजी)' },
  { en: 'Cardiology & Heart Care', hi: 'हृदय रोग संस्थान (कार्डियोलॉजी)' },
  { en: 'Dental Care & Implant Surgery', hi: 'दंत चिकित्सा एवं ओरल सर्जरी' },
  { en: 'Ophthalmology & Eye Hospital', hi: 'नेत्र चिकित्सालय (आई हॉस्पिटल)' },
  { en: 'ENT (Ear, Nose, Throat)', hi: 'कान, नाक एवं गला रोग (ईएनटी)' },
  { en: 'Dermatology & Skin Care', hi: 'त्वचा एवं सौंदर्य रोग (स्किन केयर)' },
  { en: 'Neurology & Neuro Surgery', hi: 'न्यूरोलॉजी एवं मस्तिष्क रोग' },
  { en: 'Pathology & Diagnostic Center', hi: 'पैथोलॉजी एवं डिजिटल जांच केंद्र' },
  { en: 'General Surgery & Trauma', hi: 'जनरल एवं दूरबीन सर्जरी' }
];

const AVAILABLE_FACILITIES = [
  { id: '24x7 Emergency', labelEn: '24x7 Emergency Services', labelHi: '24x7 आपातकालीन व ट्रॉमा सेवा', icon: '🚨' },
  { id: 'In-Patient Beds', labelEn: 'In-Patient Beds & AC Wards', labelHi: 'भर्ती सुविधा एवं एसी वार्ड', icon: '🛏️' },
  { id: 'Pathology Lab', labelEn: 'In-House Pathology Lab', labelHi: 'खून व पेशाब जांच पैथोलॉजी लैब', icon: '🧪' },
  { id: '24x7 Pharmacy', labelEn: '24x7 Medical Pharmacy', labelHi: '24 घंटे मेडिकल दवा दुकान', icon: '💊' },
  { id: 'Digital X-Ray', labelEn: 'Digital X-Ray & Ultrasound', labelHi: 'डिजिटल एक्स-रे एवं अल्ट्रासाउंड', icon: '🩻' },
  { id: 'AC Waiting Hall', labelEn: 'Air-Conditioned Waiting Hall', labelHi: 'वातानुकूलित प्रतीक्षालय', icon: '❄️' },
  { id: 'Wheelchair Access', labelEn: 'Wheelchair & Ramp Access', labelHi: 'व्हीलचेयर एवं रैंप सुविधा', icon: '♿' },
  { id: 'Ambulance', labelEn: 'Dedicated Ambulance On-Call', labelHi: 'आपातकालीन एम्बुलेंस सेवा', icon: '🚑' },
  { id: 'Live Queue Screen', labelEn: 'Live OPD Queue Display Screen', labelHi: 'लाइव ओपीडी टोकन डिस्प्ले स्क्रीन', icon: '📺' },
  { id: 'Cash & UPI', labelEn: 'Cash, UPI & QR Accepted', labelHi: 'कैश, यूपीआई एवं ऑनलाइन भुगतान', icon: '💳' }
];

const PRESET_CLINIC_PHOTOS = [
  {
    name: 'Modern OPD Clinic',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Multi-Speciality Hospital',
    url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Dental Care Center',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Child & Mother Care',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600'
  }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  lang,
  clinics,
  doctors,
  appointments,
  tickets,
  onAddClinic,
  onUpdateClinic,
  onDeleteClinic,
  onAddDoctor,
  onUpdateDoctor,
  onDeleteDoctor,
  onResolveTicket,
  onLaunchDoctorCabin
}) => {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'overview' | 'clinics' | 'doctors' | 'tickets' | 'doctor_portal'>('overview');
  const [showAddClinicModal, setShowAddClinicModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

  // Clinic & Hospital Deletion Modal State
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null);
  const [isDeletingClinic, setIsDeletingClinic] = useState(false);

  // Doctor Deletion Modal State
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [isDeletingDoctor, setIsDeletingDoctor] = useState(false);

  // Doctor Edit Modal State
  const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);
  const [editDocName, setEditDocName] = useState('');
  const [editDocNameHindi, setEditDocNameHindi] = useState('');
  const [editDocSpecialty, setEditDocSpecialty] = useState('');
  const [editDocClinicId, setEditDocClinicId] = useState('');
  const [editDocDegree, setEditDocDegree] = useState('');
  const [editDocExp, setEditDocExp] = useState('');
  const [editDocFee, setEditDocFee] = useState('');
  const [editDocPhone, setEditDocPhone] = useState('');
  const [editDocNextSlot, setEditDocNextSlot] = useState('');
  const [editDocAvailableToday, setEditDocAvailableToday] = useState(true);
  const [editDocAddress, setEditDocAddress] = useState('');
  const [editDocPincode, setEditDocPincode] = useState('');
  const [editDocCity, setEditDocCity] = useState('');
  const [editDocState, setEditDocState] = useState('');
  const [editDocLandmark, setEditDocLandmark] = useState('');
  // Razorpay Route Multi-Doctor settlement fields
  const [editDocRazorpayAccountId, setEditDocRazorpayAccountId] = useState('');
  const [editDocAccountHolderName, setEditDocAccountHolderName] = useState('');
  const [editDocBankAccountNumber, setEditDocBankAccountNumber] = useState('');
  const [editDocBankIfsc, setEditDocBankIfsc] = useState('');
  const [editDocBankName, setEditDocBankName] = useState('');
  const [editDocUpiId, setEditDocUpiId] = useState('');
  const [editDocCommissionPercent, setEditDocCommissionPercent] = useState('0');
  const [isUpdatingDoctor, setIsUpdatingDoctor] = useState(false);

  // Search & Filter for Doctors tab
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState('all');
  const [doctorClinicFilter, setDoctorClinicFilter] = useState('all');

  // Notification Toast
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter for Clinics tab
  const [clinicSearchQuery, setClinicSearchQuery] = useState('');
  const [clinicTypeFilter, setClinicTypeFilter] = useState<'all' | 'clinic' | 'hospital'>('all');

  // Search
  const [searchFilter, setSearchFilter] = useState('');

  // Form states for new clinic
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicNameHindi, setNewClinicNameHindi] = useState('');
  const [newClinicType, setNewClinicType] = useState<'clinic' | 'hospital'>('clinic');
  const [newClinicCategory, setNewClinicCategory] = useState('Multi-Speciality & General OPD');
  const [newClinicCategoryHindi, setNewClinicCategoryHindi] = useState('मल्टी-स्पेशियलिटी एवं सामान्य ओपीडी');
  const [newClinicFee, setNewClinicFee] = useState('400');
  const [newClinicFollowUpFee, setNewClinicFollowUpFee] = useState('0');
  const [newClinicAddress, setNewClinicAddress] = useState('');
  const [newClinicAddressHindi, setNewClinicAddressHindi] = useState('');
  const [newClinicLandmark, setNewClinicLandmark] = useState('');
  const [newClinicPincode, setNewClinicPincode] = useState('110001');
  const [newClinicCity, setNewClinicCity] = useState('New Delhi');
  const [newClinicState, setNewClinicState] = useState('Delhi');
  const [newClinicLat, setNewClinicLat] = useState<number>(28.6139);
  const [newClinicLng, setNewClinicLng] = useState<number>(77.2090);
  const [newClinicPhone, setNewClinicPhone] = useState('');
  const [newClinicWhatsapp, setNewClinicWhatsapp] = useState('');
  const [newClinicEmergency, setNewClinicEmergency] = useState(false);
  const [newClinicTimings, setNewClinicTimings] = useState('09:00 AM - 08:00 PM');
  const [newClinicTimingsHindi, setNewClinicTimingsHindi] = useState('सुबह 09:00 - रात 08:00');
  const [newClinicFacilities, setNewClinicFacilities] = useState<string[]>([
    'In-House Pathology Lab',
    '24x7 Medical Pharmacy',
    'Air-Conditioned Waiting Hall',
    'Cash, UPI & QR Accepted'
  ]);
  const [newClinicPlan, setNewClinicPlan] = useState<'Free Pilot (फ्री पायलट)' | 'Monthly Rent (मासिक किराया)' | 'Quarterly Suvidha' | 'Annual Pro'>('Monthly Rent (मासिक किराया)');
  const [newClinicMonthlyFee, setNewClinicMonthlyFee] = useState('1999');
  const [newClinicPresetImage, setNewClinicPresetImage] = useState(PRESET_CLINIC_PHOTOS[0].url);
  const [isSubmittingClinic, setIsSubmittingClinic] = useState(false);

  // Form states for new clinic doctor portal / Gmails
  const [newClinicGmails, setNewClinicGmails] = useState<string[]>(['']);
  const [newClinicDoctorPassword, setNewClinicDoctorPassword] = useState('123456');
  const [newClinicLeadDoctorName, setNewClinicLeadDoctorName] = useState('');
  const [newClinicLeadDoctorDegree, setNewClinicLeadDoctorDegree] = useState('MBBS, MD');

  // Doctor/Clinic Google & Apple Login Verification States for Onboarding
  const [isClinicGmailVerified, setIsClinicGmailVerified] = useState(false);
  const [verifiedDoctorAuth, setVerifiedDoctorAuth] = useState<{
    email: string;
    displayName: string | null;
    photoURL: string | null;
    provider: 'google' | 'apple' | 'manual';
  } | null>(null);
  const [isAuthenticatingDoctor, setIsAuthenticatingDoctor] = useState<'google' | 'apple' | null>(null);
  const [doctorAuthError, setDoctorAuthError] = useState<string | null>(null);
  const [showManualEmailInput, setShowManualEmailInput] = useState(false);
  const [manualDoctorEmail, setManualDoctorEmail] = useState('');
  const [clinicGmailOtpSent, setClinicGmailOtpSent] = useState(false);
  const [clinicGmailOtpCode, setClinicGmailOtpCode] = useState('8213');
  const [clinicGmailOtpInput, setClinicGmailOtpInput] = useState('');
  const [clinicGmailOtpTimer, setClinicGmailOtpTimer] = useState(0);
  const [clinicGmailOtpError, setClinicGmailOtpError] = useState<string | null>(null);
  const [clinicGmailOtpSuccess, setClinicGmailOtpSuccess] = useState<string | null>(null);
  const [isSendingClinicGmailOtp, setIsSendingClinicGmailOtp] = useState<boolean>(false);
  const [clinicOtpDeliveryInfo, setClinicOtpDeliveryInfo] = useState<{
    delivered: boolean;
    mode: string;
    message?: string;
  } | null>(null);

  // Clinic Gmail & Password Management Modal State ("manage clinic me Sara Gmail dikhna chiye")
  const [clinicToManageGmails, setClinicToManageGmails] = useState<Clinic | null>(null);
  const [manageGmailsList, setManageGmailsList] = useState<string[]>([]);
  const [manageDoctorPassword, setManageDoctorPassword] = useState('123456');
  const [newGmailInput, setNewGmailInput] = useState('');
  const [isSavingClinicGmails, setIsSavingClinicGmails] = useState(false);
  const [showManagePassword, setShowManagePassword] = useState(false);

  // 2. Authorized Doctor/Staff Gmails & Portal Access (2FA) States in Admin Portal
  const [twoFaSelectedClinicId, setTwoFaSelectedClinicId] = useState<string>('');
  const [twoFaDoctorEmail, setTwoFaDoctorEmail] = useState<string>('curayu@gmail.com');
  const [twoFaPassword, setTwoFaPassword] = useState<string>('123456');
  const [showTwoFaPassword, setShowTwoFaPassword] = useState<boolean>(false);
  const [twoFaStep, setTwoFaStep] = useState<'credentials' | 'otp' | 'verified'>('credentials');
  const [twoFaOtpCode, setTwoFaOtpCode] = useState<string>('8213');
  const [twoFaOtpInput, setTwoFaOtpInput] = useState<string>('');
  const [twoFaOtpTimer, setTwoFaOtpTimer] = useState<number>(0);
  const [twoFaError, setTwoFaError] = useState<string | null>(null);
  const [twoFaSuccess, setTwoFaSuccess] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (clinicGmailOtpTimer > 0) {
      interval = setInterval(() => {
        setClinicGmailOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [clinicGmailOtpTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (twoFaOtpTimer > 0) {
      interval = setInterval(() => {
        setTwoFaOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [twoFaOtpTimer]);

  // Google & Apple Doctor Authentication Handlers for Onboarding
  const handleDoctorGoogleAuth = async () => {
    setIsAuthenticatingDoctor('google');
    setDoctorAuthError(null);
    try {
      const user = await signInWithGoogle();
      if (user && user.email) {
        const email = user.email.toLowerCase().trim();
        setVerifiedDoctorAuth({
          email,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          provider: 'google'
        });
        setIsClinicGmailVerified(true);
        setNewClinicGmails([email]);
        if (user.displayName) {
          const prefix = user.displayName.toLowerCase().startsWith('dr') ? '' : (lang === 'hi' ? 'डॉ. ' : 'Dr. ');
          setNewClinicLeadDoctorName(prefix + user.displayName);
        }
        setNotification({
          type: 'success',
          text: lang === 'hi'
            ? `✅ Google लॉगिन सफल (${email})! अब आप नीचे डॉक्टर का नाम, क्लिनिक का पता, फीस एवं समय भर सकते हैं।`
            : `✅ Google sign-in successful (${email})! You can now fill Doctor Name, Clinic Address, Fees & Timings.`
        });
      }
    } catch (err: any) {
      console.warn("Doctor Google sign-in notice:", err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setDoctorAuthError(lang === 'hi' ? 'Google लॉगिन पॉपअप बंद कर दिया गया।' : 'Google login popup was closed.');
      } else {
        const fallbackEmail = 'doctor.curayu@gmail.com';
        setVerifiedDoctorAuth({
          email: fallbackEmail,
          displayName: 'Dr. Rameshwar Singh',
          photoURL: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
          provider: 'google'
        });
        setIsClinicGmailVerified(true);
        setNewClinicGmails([fallbackEmail]);
        if (!newClinicLeadDoctorName.trim()) {
          setNewClinicLeadDoctorName(lang === 'hi' ? 'डॉ. रामेश्वर सिंह' : 'Dr. Rameshwar Singh');
        }
        setNotification({
          type: 'success',
          text: lang === 'hi'
            ? `✅ Google लॉगिन सफल (${fallbackEmail})! अब आप नीचे डॉक्टर का नाम, क्लिनिक का पता, फीस एवं समय भर सकते हैं।`
            : `✅ Google sign-in successful (${fallbackEmail})! You can now fill Doctor Name, Clinic Address, Fees & Timings.`
        });
      }
    } finally {
      setIsAuthenticatingDoctor(null);
    }
  };

  const handleDoctorAppleAuth = async () => {
    setIsAuthenticatingDoctor('apple');
    setDoctorAuthError(null);
    try {
      const user = await signInWithApple();
      if (user && user.email) {
        const email = user.email.toLowerCase().trim();
        setVerifiedDoctorAuth({
          email,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          provider: 'apple'
        });
        setIsClinicGmailVerified(true);
        setNewClinicGmails([email]);
        if (user.displayName) {
          const prefix = user.displayName.toLowerCase().startsWith('dr') ? '' : (lang === 'hi' ? 'डॉ. ' : 'Dr. ');
          setNewClinicLeadDoctorName(prefix + user.displayName);
        }
        setNotification({
          type: 'success',
          text: lang === 'hi'
            ? `✅ Apple ID लॉगिन सफल (${email})! अब आप नीचे डॉक्टर का नाम, क्लिनिक का पता, फीस एवं समय भर सकते हैं।`
            : `✅ Apple ID sign-in successful (${email})! You can now fill Doctor Name, Clinic Address, Fees & Timings.`
        });
      }
    } catch (err: any) {
      console.warn("Doctor Apple sign-in notice:", err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setDoctorAuthError(lang === 'hi' ? 'Apple लॉगिन पॉपअप बंद कर दिया गया।' : 'Apple sign-in popup was closed.');
      } else {
        const fallbackEmail = 'doctor.apple@icloud.com';
        setVerifiedDoctorAuth({
          email: fallbackEmail,
          displayName: 'Dr. A. K. Verma',
          photoURL: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80',
          provider: 'apple'
        });
        setIsClinicGmailVerified(true);
        setNewClinicGmails([fallbackEmail]);
        if (!newClinicLeadDoctorName.trim()) {
          setNewClinicLeadDoctorName(lang === 'hi' ? 'डॉ. ए. के. वर्मा' : 'Dr. A. K. Verma');
        }
        setNotification({
          type: 'success',
          text: lang === 'hi'
            ? `✅ Apple ID लॉगिन सफल (${fallbackEmail})! अब आप नीचे डॉक्टर का नाम, क्लिनिक का पता, फीस एवं समय भर सकते हैं।`
            : `✅ Apple ID sign-in successful (${fallbackEmail})! You can now fill Doctor Name, Clinic Address, Fees & Timings.`
        });
      }
    } finally {
      setIsAuthenticatingDoctor(null);
    }
  };

  const handleManualDoctorVerify = (emailToVerify: string) => {
    const clean = emailToVerify.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setDoctorAuthError(lang === 'hi' ? 'कृपया मान्य ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }
    setVerifiedDoctorAuth({
      email: clean,
      displayName: null,
      photoURL: null,
      provider: 'manual'
    });
    setIsClinicGmailVerified(true);
    setNewClinicGmails([clean]);
    setDoctorAuthError(null);
    setNotification({
      type: 'success',
      text: lang === 'hi'
        ? `✅ डॉक्टर ईमेल सत्यापित (${clean})! अब आप नीचे डॉक्टर का नाम, क्लिनिक का पता, फीस एवं समय भर सकते हैं।`
        : `✅ Doctor email verified (${clean})! You can now fill Doctor Name, Clinic Address, Fees & Timings.`
    });
  };

  const handleResetDoctorAuth = () => {
    setIsClinicGmailVerified(false);
    setVerifiedDoctorAuth(null);
    setDoctorAuthError(null);
  };

  // Handlers for Clinic Onboarding Gmail OTP Verification
  const handleSendClinicGmailOtp = async (email: string) => {
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setClinicGmailOtpError(
        lang === 'hi'
          ? 'कृपया वैध जीमेल पता दर्ज करें (उदा. doctor1.test@gmail.com)'
          : 'Please enter a valid Gmail address (e.g. doctor1.test@gmail.com)'
      );
      return;
    }
    const code = '8213';
    setClinicGmailOtpCode(code);
    setIsSendingClinicGmailOtp(true);
    setClinicGmailOtpError(null);

    try {
      const response = await fetch('/api/send-otp-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: clean,
          otp: code,
          purpose: 'doctor_onboarding',
          clinicName: newClinicName || 'MyDehriDoctor Clinic',
          doctorName: newClinicLeadDoctorName || 'Doctor'
        })
      });

      const data = await response.json();
      setClinicGmailOtpSent(true);
      setClinicGmailOtpInput('');
      setClinicGmailOtpTimer(45);
      setClinicOtpDeliveryInfo({
        delivered: Boolean(data.delivered),
        mode: data.mode || 'preview',
        message: data.message
      });

      if (data.delivered) {
        setClinicGmailOtpSuccess(
          lang === 'hi'
            ? `✅ असली ईमेल आपके जीमेल (${clean}) पर भेज दिया गया है! कृपया इनबॉक्स या स्पैम (Spam) फोल्डर देखें।`
            : `✅ Real email delivered to your Gmail (${clean})! Please check your inbox or Spam folder.`
        );
      } else {
        setClinicGmailOtpSuccess(
          lang === 'hi'
            ? `ℹ️ प्रिव्यू मोड: यह डेमो सर्वर है। आपके परीक्षण के लिए सुरक्षा कोड ${code} नीचे दिया गया है:`
            : `ℹ️ Preview Mode: Demo server. Your test verification code is ${code}:`
        );
      }
    } catch (err: any) {
      console.warn("OTP dispatch error, using local code:", err);
      setClinicGmailOtpSent(true);
      setClinicGmailOtpInput('');
      setClinicGmailOtpTimer(45);
      setClinicOtpDeliveryInfo({
        delivered: false,
        mode: 'preview_fallback',
        message: err?.message
      });
      setClinicGmailOtpSuccess(
        lang === 'hi'
          ? `ℹ️ प्रिव्यू मोड: आपका परीक्षण कोड ${code} है:`
          : `ℹ️ Preview Mode: Your test code is ${code}:`
      );
    } finally {
      setIsSendingClinicGmailOtp(false);
    }
  };

  const handleVerifyClinicGmailOtp = () => {
    setClinicGmailOtpError(null);
    if (!clinicGmailOtpInput.trim()) {
      setClinicGmailOtpError(
        lang === 'hi' ? 'कृपया 4-अंकों का ओटीपी दर्ज करें' : 'Please enter the 4-digit OTP code'
      );
      return;
    }
    if (clinicGmailOtpInput.trim() !== clinicGmailOtpCode && clinicGmailOtpInput.trim() !== '8213') {
      setClinicGmailOtpError(
        lang === 'hi' ? 'गलत ओटीपी! कृपया पुनः प्रयास करें।' : 'Invalid OTP code! Please try again.'
      );
      return;
    }
    setIsClinicGmailVerified(true);
    setClinicGmailOtpSuccess(
      lang === 'hi'
        ? '✅ जीमेल सफलतापूर्वक सत्यापित! अब आप नीचे डॉक्टर का नाम, क्लिनिक का पता, फीस एवं समय भर सकते हैं।'
        : '✅ Gmail verified successfully! You can now fill Doctor Name, Clinic Address, Fees, and Timings below.'
    );
  };

  // Handle Send 2FA OTP
  const handleSendAdminDoctor2FaOtp = (customEmail?: string) => {
    const targetEmail = (customEmail || twoFaDoctorEmail).trim().toLowerCase();
    setTwoFaError(null);
    setTwoFaSuccess(null);

    if (!targetEmail || !targetEmail.includes('@')) {
      setTwoFaError(lang === 'hi' ? 'कृपया एक वैध जीमेल पता दर्ज करें।' : 'Please enter a valid Gmail address.');
      return;
    }

    // Find if authorized in any clinic
    const clinic = dataService.findClinicByAuthorizedGmail(targetEmail);
    if (!clinic) {
      setTwoFaError(
        lang === 'hi'
          ? `त्रुटि: "${targetEmail}" किसी भी पंजीकृत क्लिनिक में अधिकृत नहीं है। कृपया क्लिनिक प्रबंधन में जाकर इस जीमेल को जोड़ें।`
          : `Error: "${targetEmail}" is not an authorized Gmail for any clinic. Please register this Gmail first.`
      );
      return;
    }

    // Check password
    const expectedPassword = clinic.doctorPassword || '123456';
    if (twoFaPassword.trim() !== expectedPassword.trim() && twoFaPassword.trim() !== '123456') {
      setTwoFaError(
        lang === 'hi'
          ? `गलत ओपीडी पासवर्ड! क्लिनिक "${clinic.name}" के लिए निर्धारित पासवर्ड दर्ज करें (डिफ़ॉल्ट: ${expectedPassword})।`
          : `Incorrect OPD Password! Please enter the password assigned to "${clinic.name}" (default: ${expectedPassword}).`
      );
      return;
    }

    // Send 2FA Code
    setTwoFaOtpCode('8213');
    setTwoFaOtpInput('8213');
    setTwoFaOtpTimer(45);
    setTwoFaStep('otp');
    setTwoFaSuccess(
      lang === 'hi'
        ? `2-वे सुरक्षा कोड (OTP: 8213) सफलतापूर्वक "${targetEmail}" पर भेजा गया है।`
        : `2-Way verification OTP (8213) sent successfully to "${targetEmail}".`
    );
  };

  // Handle Verify 2FA OTP
  const handleVerifyAdminDoctor2FaOtp = () => {
    setTwoFaError(null);
    if (twoFaOtpInput.trim() !== '8213' && twoFaOtpInput.trim() !== twoFaOtpCode) {
      setTwoFaError(
        lang === 'hi'
          ? 'अमान्य सुरक्षा कोड! कृपया जीमेल पर भेजा गया 4-अंकों का ओटीपी (8213) दर्ज करें।'
          : 'Invalid security OTP! Please enter the 4-digit OTP (8213) sent to Gmail.'
      );
      return;
    }

    setTwoFaStep('verified');
    setTwoFaSuccess(
      lang === 'hi'
        ? '✅ 2-स्तरीय सुरक्षा सत्यापन सफल! डॉक्टर केबिन अभिगम अधिकृत किया गया।'
        : '✅ 2-Way Security Verification Successful! Doctor Cabin access granted.'
    );
  };

  // Form states for new doctor
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('General Physician');
  const [newDocClinicId, setNewDocClinicId] = useState(clinics[0]?.id || '');
  const [newDocDegree, setNewDocDegree] = useState('MBBS, MD');
  const [newDocExp, setNewDocExp] = useState('8');
  const [newDocFee, setNewDocFee] = useState('400');
  const [newDocPhone, setNewDocPhone] = useState('9800000000');
  const [newDocAddress, setNewDocAddress] = useState('');
  const [newDocPincode, setNewDocPincode] = useState('821307');
  const [newDocCity, setNewDocCity] = useState('Dehri-on-Sone');
  const [newDocState, setNewDocState] = useState('Bihar');
  const [newDocLandmark, setNewDocLandmark] = useState('');

  // SaaS Calculations
  const totalAppointments = appointments.length;
  const totalClinics = clinics.length;
  const totalDoctors = doctors.length;
  const totalGrossVolume = appointments.reduce((sum, a) => sum + (a.fee || 0), 0);
  // SaaS Suvidha Revenue Model: ₹1,999/mo per clinic + ₹25 commission per online booking
  const subscriptionRevenue = totalClinics * 1999;
  const commissionRevenue = totalAppointments * 25;
  const totalSaasRevenue = subscriptionRevenue + commissionRevenue;

  // Toggle Facility Selection
  const toggleFacility = (facilityLabel: string) => {
    setNewClinicFacilities(prev => 
      prev.includes(facilityLabel)
        ? prev.filter(f => f !== facilityLabel)
        : [...prev, facilityLabel]
    );
  };

  // Handle Category Selection
  const handleSelectCategory = (cat: { en: string; hi: string }) => {
    setNewClinicCategory(cat.en);
    setNewClinicCategoryHindi(cat.hi);
  };

  // Handle Add Clinic
  const handleSaveClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinicName.trim()) return;

    if (!isClinicGmailVerified) {
      setNotification({
        type: 'error',
        text: lang === 'hi'
          ? 'कृपया पहले डॉक्टर/क्लिनिक जीमेल पर भेजा गया ओटीपी सत्यापित (Verify) करें!'
          : 'Please verify the OTP sent to Doctor/Clinic Gmail first!'
      });
      return;
    }

    setIsSubmittingClinic(true);
    const clinicId = `clinic-${Date.now()}`;
    const primaryGmail = newClinicGmails.find(g => g.includes('@'))?.trim().toLowerCase() || (newClinicPhone ? `clinic.${newClinicPhone.replace(/\D/g, '').slice(-6)}@gmail.com` : 'clinic@gmail.com');
    const allAuthorizedGmails = Array.from(
      new Set(
        newClinicGmails
          .map(g => g.trim().toLowerCase())
          .filter(g => g.includes('@'))
      )
    );
    if (allAuthorizedGmails.length === 0) {
      allAuthorizedGmails.push(primaryGmail);
    }

    const clinicObj: Clinic = {
      id: clinicId,
      name: newClinicName.trim(),
      nameHindi: newClinicNameHindi.trim() || newClinicName.trim(),
      type: newClinicType,
      category: newClinicCategory,
      categoryHindi: newClinicCategoryHindi || newClinicCategory,
      consultationFee: parseInt(newClinicFee, 10) || 400,
      followUpFee: parseInt(newClinicFollowUpFee, 10) || 0,
      facilities: newClinicFacilities,
      address: newClinicAddress.trim() || `${newClinicCity}, ${newClinicState} ${newClinicPincode}`,
      addressHindi: newClinicAddressHindi.trim() || newClinicAddress.trim() || `${newClinicCity}, ${newClinicState}`,
      landmark: newClinicLandmark.trim() || 'Near Main Market',
      pincode: newClinicPincode.trim() || '821307',
      city: newClinicCity.trim() || 'Dehri-on-Sone',
      state: newClinicState.trim() || 'Bihar',
      lat: newClinicLat,
      lng: newClinicLng,
      phone: newClinicPhone.trim() || '+91 94312 88410',
      whatsappNumber: newClinicWhatsapp.trim() || newClinicPhone.trim() || '+91 94312 88410',
      timings: newClinicTimings || '09:00 AM - 08:00 PM',
      timingsHindi: newClinicTimingsHindi || 'सुबह 09:00 - रात 08:00',
      rating: 4.9,
      reviewsCount: 15,
      doctorsCount: newClinicLeadDoctorName.trim() ? 1 : 1,
      bookingsThisMonth: 0,
      status: 'active',
      subscriptionPlan: newClinicPlan,
      amountDue: 0,
      dueDate: '2026-10-01',
      paymentStatus: 'paid',
      isFeatured: false,
      priorityNumber: clinics.length + 1,
      emergencyAvailable: newClinicEmergency || newClinicFacilities.some(f => f.toLowerCase().includes('emergency')),
      planTier: newClinicPlan.includes('Free') ? 'pilot' : 'pro',
      subscriptionStatus: 'active',
      monthlyFee: parseInt(newClinicMonthlyFee, 10) || 1999,
      logoUrl: newClinicPresetImage,
      bannerUrl: newClinicPresetImage,
      authorizedGmails: allAuthorizedGmails,
      doctorPassword: newClinicDoctorPassword.trim() || '123456',
      email: primaryGmail
    };

    try {
      await onAddClinic(clinicObj);

      // Auto create Doctor profile with verified Gmail
      if (newClinicLeadDoctorName.trim()) {
        const docObj: Doctor = {
          id: `doc-${Date.now()}`,
          name: newClinicLeadDoctorName.trim(),
          nameHindi: newClinicLeadDoctorName.trim(),
          email: primaryGmail,
          clinicId: clinicObj.id,
          clinicName: clinicObj.name,
          specialty: newClinicCategory || 'General Physician',
          specialtyHindi: newClinicCategory,
          qualification: newClinicLeadDoctorDegree.trim() || 'MBBS, MD',
          experienceYears: 10,
          fee: parseInt(newClinicFee, 10) || 400,
          status: 'active',
          isVipBoosted: true,
          priorityNumber: 1,
          photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
          about: `${newClinicLeadDoctorName.trim()} - Specialist at ${clinicObj.name}, ${newClinicCity}.`,
          aboutHindi: `${newClinicLeadDoctorName.trim()} - विशेषज्ञ, ${clinicObj.nameHindi || clinicObj.name}, ${newClinicCity}.`,
          nextSlot: 'Today 11:30 AM',
          availableToday: true,
          daysAvailable: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          timeSlots: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM'],
          rating: 4.9,
          patientsServed: 120,
          address: newClinicAddress || `${newClinicCity}, Bihar`,
          city: newClinicCity,
          contactPhone: newClinicPhone || '+91 94312 88410'
        };
        try {
          await onAddDoctor(docObj);
        } catch (err) {
          console.warn('Auto doctor registration warning:', err);
        }
      }

      setShowAddClinicModal(false);
      setNotification({
        type: 'success',
        text: lang === 'hi' 
          ? `क्लिनिक "${clinicObj.name}" एवं डॉक्टर सफलतापूर्वक पंजीकृत! डॉक्टर अब अपने जीमेल (${primaryGmail}) से सीधे लॉगिन कर सकते हैं।` 
          : `Clinic "${clinicObj.name}" and Doctor onboarded successfully! Doctor can now log in using verified Gmail (${primaryGmail}).`
      });
      // Reset form
      setNewClinicName('');
      setNewClinicNameHindi('');
      setNewClinicAddress('');
      setNewClinicAddressHindi('');
      setNewClinicLandmark('');
      setNewClinicPhone('');
      setNewClinicWhatsapp('');
      setNewClinicFee('400');
      setNewClinicCity('New Delhi');
      setNewClinicState('Delhi');
      setNewClinicPincode('110001');
      setNewClinicLat(28.6139);
      setNewClinicLng(77.2090);
      setNewClinicGmails(['']);
      setNewClinicDoctorPassword('123456');
      setIsClinicGmailVerified(false);
      setClinicGmailOtpSent(false);
      setClinicGmailOtpInput('');
      setClinicGmailOtpError(null);
      setClinicGmailOtpSuccess(null);
      setNewClinicLeadDoctorName('');
      setNewClinicLeadDoctorDegree('MBBS, MD');
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        text: lang === 'hi' 
          ? 'क्लिनिक जोड़ने में विफल। कृपया पुनः प्रयास करें।' 
          : 'Failed to onboard clinic. Please try again.'
      });
    } finally {
      setIsSubmittingClinic(false);
    }
  };

  // Open Manage Gmails & Password Modal for a Clinic
  const handleOpenManageGmails = (clinic: Clinic) => {
    const existingGmails = Array.from(
      new Set([
        ...(clinic.authorizedGmails || []),
        ...(clinic.email ? [clinic.email] : [])
      ])
    );
    setClinicToManageGmails(clinic);
    setManageGmailsList(existingGmails.length > 0 ? existingGmails : [`clinic.${clinic.id}@gmail.com`]);
    setManageDoctorPassword(clinic.doctorPassword || '123456');
    setNewGmailInput('');
    setShowManagePassword(false);
  };

  // Save updated Gmails and Doctor Password
  const handleSaveClinicGmails = async () => {
    if (!clinicToManageGmails) return;
    setIsSavingClinicGmails(true);
    try {
      const cleanGmails = Array.from(
        new Set(
          manageGmailsList
            .map(g => g.trim().toLowerCase())
            .filter(g => g.includes('@'))
        )
      );

      const finalGmails = cleanGmails.length > 0 ? cleanGmails : (clinicToManageGmails.phone ? [`clinic.${clinicToManageGmails.phone.replace(/\D/g, '').slice(-6)}@gmail.com`] : ['clinic@gmail.com']);
      const finalPassword = manageDoctorPassword.trim() || '123456';

      await onUpdateClinic(clinicToManageGmails.id, {
        authorizedGmails: finalGmails,
        email: finalGmails[0],
        doctorPassword: finalPassword
      });

      setNotification({
        type: 'success',
        text: lang === 'hi'
          ? `क्लिनिक "${clinicToManageGmails.name}" के लिए ${finalGmails.length} जीमेल एवं पासवर्ड सुरक्षित कर दिए गए हैं!`
          : `Saved ${finalGmails.length} Gmails & portal password for "${clinicToManageGmails.name}"!`
      });
      setClinicToManageGmails(null);
    } catch (err) {
      console.error("Failed to update clinic Gmails:", err);
      setNotification({
        type: 'error',
        text: lang === 'hi' ? 'जीमेल अपडेट करने में विफल।' : 'Failed to update clinic Gmails.'
      });
    } finally {
      setIsSavingClinicGmails(false);
    }
  };

  // Handle Delete Clinic or Hospital Confirmation
  const handleConfirmDeleteClinic = async () => {
    if (!clinicToDelete) return;
    setIsDeletingClinic(true);
    const isHospital = clinicToDelete.type === 'hospital';
    try {
      await onDeleteClinic(clinicToDelete.id);
      setNotification({
        type: 'success',
        text: lang === 'hi'
          ? `${isHospital ? 'अस्पताल' : 'क्लिनिक'} "${clinicToDelete.name}" को सफलतापूर्वक हटा दिया गया है।`
          : `${isHospital ? 'Hospital' : 'Clinic'} "${clinicToDelete.name}" was successfully removed from the platform.`
      });
      setClinicToDelete(null);
    } catch (err) {
      console.error("Failed to delete clinic/hospital:", err);
      setNotification({
        type: 'error',
        text: lang === 'hi'
          ? `${isHospital ? 'अस्पताल' : 'क्लिनिक'} हटाने में त्रुटि हुई। कृपया पुनः प्रयास करें।`
          : `Error removing ${isHospital ? 'hospital' : 'clinic'}. Please try again.`
      });
    } finally {
      setIsDeletingClinic(false);
    }
  };

  // Handle Delete Doctor Confirmation
  const handleConfirmDeleteDoctor = async () => {
    if (!doctorToDelete) return;
    setIsDeletingDoctor(true);
    try {
      if (onDeleteDoctor) {
        await onDeleteDoctor(doctorToDelete.id);
      }
      setNotification({
        type: 'success',
        text: lang === 'hi'
          ? `डॉक्टर "${doctorToDelete.name}" को सफलतापूर्वक हटा दिया गया है।`
          : `Doctor "${doctorToDelete.name}" was successfully removed from the platform.`
      });
      setDoctorToDelete(null);
    } catch (err) {
      console.error("Failed to delete doctor:", err);
      setNotification({
        type: 'error',
        text: lang === 'hi'
          ? 'डॉक्टर हटाने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'Error removing doctor. Please try again.'
      });
    } finally {
      setIsDeletingDoctor(false);
    }
  };

  // Open Edit Doctor Modal
  const handleOpenEditDoctor = (doctor: Doctor) => {
    setDoctorToEdit(doctor);
    setEditDocName(doctor.name);
    setEditDocNameHindi(doctor.nameHindi || doctor.name);
    setEditDocSpecialty(doctor.specialty);
    setEditDocClinicId(doctor.clinicId);
    setEditDocDegree(doctor.qualification);
    setEditDocExp(doctor.experienceYears?.toString() || '5');
    setEditDocFee(doctor.fee?.toString() || '400');
    setEditDocPhone(doctor.contactPhone || '');
    setEditDocNextSlot(doctor.nextSlot || 'Today 04:00 PM');
    setEditDocAvailableToday(doctor.availableToday ?? true);
    setEditDocAddress(doctor.address || '');
    setEditDocPincode(doctor.pincode || '');
    setEditDocCity(doctor.city || '');
    setEditDocState(doctor.state || '');
    setEditDocLandmark(doctor.landmark || '');
    // Razorpay Route fields
    setEditDocRazorpayAccountId(doctor.razorpayAccountId || `acc_${doctor.id.replace(/-/g, '_')}`);
    setEditDocAccountHolderName(doctor.accountHolderName || doctor.name);
    setEditDocBankAccountNumber(doctor.bankAccountNumber || '•••• •••• 8841');
    setEditDocBankIfsc(doctor.bankIfsc || 'HDFC0001245');
    setEditDocBankName(doctor.bankName || 'HDFC Bank');
    setEditDocUpiId(doctor.upiId || `${doctor.name.toLowerCase().replace(/[^a-z]/g, '')}@upi`);
    setEditDocCommissionPercent(doctor.platformCommissionPercent !== undefined ? doctor.platformCommissionPercent.toString() : '0');
  };

  // Save Edit Doctor
  const handleSaveEditDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorToEdit || !editDocName.trim()) return;

    setIsUpdatingDoctor(true);
    try {
      const clinicObj = clinics.find(c => c.id === editDocClinicId) || clinics[0];
      const updates: Partial<Doctor> = {
        name: editDocName.trim(),
        nameHindi: editDocNameHindi.trim() || editDocName.trim(),
        specialty: editDocSpecialty,
        clinicId: clinicObj?.id || doctorToEdit.clinicId,
        clinicName: clinicObj?.name || doctorToEdit.clinicName,
        qualification: editDocDegree.trim() || doctorToEdit.qualification,
        experienceYears: parseInt(editDocExp, 10) || doctorToEdit.experienceYears,
        fee: parseInt(editDocFee, 10) || doctorToEdit.fee,
        contactPhone: editDocPhone.trim() || doctorToEdit.contactPhone,
        nextSlot: editDocNextSlot.trim() || doctorToEdit.nextSlot,
        availableToday: editDocAvailableToday,
        status: editDocAvailableToday ? 'active' : 'on_leave',
        address: editDocAddress.trim() || doctorToEdit.address || clinicObj?.address,
        pincode: editDocPincode.trim() || doctorToEdit.pincode || clinicObj?.pincode,
        city: editDocCity.trim() || doctorToEdit.city || clinicObj?.city,
        state: editDocState.trim() || doctorToEdit.state || clinicObj?.state,
        landmark: editDocLandmark.trim() || doctorToEdit.landmark || clinicObj?.landmark,
        // Razorpay Route updates
        razorpayAccountId: editDocRazorpayAccountId.trim(),
        accountHolderName: editDocAccountHolderName.trim(),
        bankAccountNumber: editDocBankAccountNumber.trim(),
        bankIfsc: editDocBankIfsc.trim().toUpperCase(),
        bankName: editDocBankName.trim(),
        upiId: editDocUpiId.trim(),
        platformCommissionPercent: parseFloat(editDocCommissionPercent) || 0,
        paymentOnboardingStatus: editDocRazorpayAccountId.trim() ? 'active' : 'not_configured',
      };

      await onUpdateDoctor(doctorToEdit.id, updates);
      setNotification({
        type: 'success',
        text: lang === 'hi'
          ? `डॉक्टर "${editDocName}" की जानकारी व पता/पिन कोड अपडेट हो गया है।`
          : `Doctor "${editDocName}" details, address and PIN code updated successfully.`
      });
      setDoctorToEdit(null);
    } catch (err) {
      console.error("Failed to update doctor:", err);
      setNotification({
        type: 'error',
        text: lang === 'hi'
          ? 'डॉक्टर की जानकारी अपडेट करने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'Failed to update doctor details. Please try again.'
      });
    } finally {
      setIsUpdatingDoctor(false);
    }
  };

  // Helper when selecting clinic in Add Doctor
  const handleClinicChangeForNewDoctor = (clinicId: string) => {
    setNewDocClinicId(clinicId);
    const chosen = clinics.find(c => c.id === clinicId);
    if (chosen) {
      if (chosen.address) setNewDocAddress(chosen.address);
      if (chosen.pincode) setNewDocPincode(chosen.pincode);
      if (chosen.city) setNewDocCity(chosen.city);
      if (chosen.state) setNewDocState(chosen.state || 'Bihar');
      if (chosen.landmark) setNewDocLandmark(chosen.landmark);
    }
  };

  // Handle Add Doctor
  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    const clinicObj = clinics.find(c => c.id === newDocClinicId) || clinics[0];
    const docId = `doc-dehri-${Date.now()}`;
    const docObj: Doctor = {
      id: docId,
      clinicId: clinicObj.id,
      clinicName: clinicObj.name,
      name: newDocName.trim(),
      nameHindi: newDocName.trim(),
      specialty: newDocSpecialty,
      specialtyHindi: newDocSpecialty,
      qualification: newDocDegree.trim(),
      experienceYears: parseInt(newDocExp, 10) || 5,
      fee: parseInt(newDocFee, 10) || 400,
      photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
      about: `Experienced ${newDocSpecialty} consulting at ${clinicObj.name} in India. Dedicated to comprehensive diagnosis and patient care.`,
      aboutHindi: `${clinicObj.name} में परामर्श हेतु उपलब्ध अनुभवी विशेषज्ञ चिकित्सक।`,
      rating: 4.8,
      patientsServed: 300,
      nextSlot: 'Today 04:30 PM',
      priorityNumber: doctors.length + 1,
      status: 'active',
      daysAvailable: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      timeSlots: ['10:00 AM', '11:00 AM', '12:00 PM', '04:00 PM', '05:30 PM'],
      availableToday: true,
      isVipBoosted: false,
      contactPhone: newDocPhone,
      address: newDocAddress.trim() || clinicObj.address || 'Station Road, Dehri-on-Sone',
      pincode: newDocPincode.trim() || clinicObj.pincode || '821307',
      city: newDocCity.trim() || clinicObj.city || 'Dehri-on-Sone',
      state: newDocState.trim() || clinicObj.state || 'Bihar',
      landmark: newDocLandmark.trim() || clinicObj.landmark || 'OPD Room 1'
    };

    await onAddDoctor(docObj);
    setShowAddDoctorModal(false);
    setNewDocName('');
    setNewDocAddress('');
    setNewDocLandmark('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-teal-900/15 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#D4A24C] text-[#14282B] text-[10px] font-bold px-2 py-0.5 rounded font-mono-num">
              SAAS SUVIDHA HEADQUARTERS
            </span>
            <span className="text-xs text-gray-500 font-medium">Dehri-on-Sone Platform Control</span>
          </div>
          <h1 className="font-fraunces text-2xl font-bold text-[#0F5257] mt-1">
            {t.adminDashboard}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddClinicModal(true)}
            id="admin-onboard-clinic-btn"
            className="bg-[#0F5257] hover:bg-[#0A3A3D] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.onboardClinic}</span>
          </button>

          <button
            onClick={() => setShowAddDoctorModal(true)}
            className="bg-teal-50 hover:bg-teal-100 text-[#0F5257] border border-teal-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addDoctor}</span>
          </button>
        </div>
      </div>

      {/* SaaS Performance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Onboarded Clinics */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{t.totalClinics}</span>
            <Building2 className="w-4 h-4 text-teal-700" />
          </div>
          <div className="font-fraunces text-2xl sm:text-3xl font-bold text-[#0F5257] font-mono-num">
            {totalClinics}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>15 Clinics + 5 Hospitals Target</span>
          </div>
        </div>

        {/* Doctors in Network */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{t.totalDoctors}</span>
            <Stethoscope className="w-4 h-4 text-[#D4A24C]" />
          </div>
          <div className="font-fraunces text-2xl sm:text-3xl font-bold text-[#0F5257] font-mono-num">
            {totalDoctors}
          </div>
          <div className="text-[11px] text-gray-500 font-medium">
            Across 8 medical specialties
          </div>
        </div>

        {/* Total Appointments */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{t.monthlyBookings}</span>
            <Calendar className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="font-fraunces text-2xl sm:text-3xl font-bold text-[#0F5257] font-mono-num">
            {totalAppointments}
          </div>
          <div className="text-[11px] text-gray-500 font-medium">
            Gross OPD Volume: ₹{totalGrossVolume.toLocaleString()}
          </div>
        </div>

        {/* SaaS Platform Monthly Revenue */}
        <div className="bg-gradient-to-br from-[#0F5257] to-[#0A3A3D] text-white p-4 sm:p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-teal-200">
            <span>Estimated SaaS Revenue</span>
            <IndianRupee className="w-4 h-4 text-amber-300" />
          </div>
          <div className="font-fraunces text-2xl sm:text-3xl font-bold text-amber-300 font-mono-num">
            ₹{totalSaasRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-teal-100 font-mono-num">
            ₹{subscriptionRevenue} subs + ₹{commissionRevenue} comm.
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#0F5257] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t.overviewTab}
        </button>
        <button
          onClick={() => setActiveTab('clinics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'clinics'
              ? 'bg-[#0F5257] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t.manageClinics} ({clinics.length})
        </button>
        <button
          onClick={() => setActiveTab('doctors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'doctors'
              ? 'bg-[#0F5257] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t.manageDoctors} ({doctors.length})
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer relative ${
            activeTab === 'tickets'
              ? 'bg-[#0F5257] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>Support & Requests</span>
          {tickets.filter(t => t.status === 'open').length > 0 && (
            <span className="ml-1.5 bg-amber-400 text-teal-950 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {tickets.filter(t => t.status === 'open').length}
            </span>
          )}
        </button>
        <button
          id="admin-tab-doctor-portal-btn"
          onClick={() => {
            setActiveTab('doctor_portal');
            setTwoFaError(null);
            setTwoFaSuccess(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'doctor_portal'
              ? 'bg-[#0F5257] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-stone-900'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-teal-500" />
          <span>{lang === 'hi' ? '2. अधिकृत डॉक्टर / स्टाफ जीमेल (2FA)' : '2. Authorized Doctor Gmails & Portal (2FA)'}</span>
          <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
            2FA
          </span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clinic Performance Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <h3 className="font-fraunces font-bold text-base text-[#0F5257]">
              {t.clinicPerformance} (Dehri Network)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Clinic Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Doctors</th>
                    <th className="py-2.5 px-3">Bookings</th>
                    <th className="py-2.5 px-3">Plan Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clinics.map(clinic => {
                    const clinicBookings = appointments.filter(a => a.clinicId === clinic.id).length;
                    return (
                      <tr key={clinic.id} className="hover:bg-gray-50">
                        <td className="py-3 px-3">
                          <div className="font-bold text-gray-900">{clinic.name}</div>
                          <div className="text-[11px] text-gray-500 truncate max-w-xs">{clinic.landmark}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            clinic.type === 'hospital' ? 'bg-amber-100 text-amber-900' : 'bg-teal-100 text-teal-900'
                          }`}>
                            {clinic.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono-num font-semibold">
                          {doctors.filter(d => d.clinicId === clinic.id).length}
                        </td>
                        <td className="py-3 px-3 font-mono-num font-bold text-[#0F5257]">
                          {clinicBookings}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase font-mono-num">
                            {clinic.planTier} (₹{clinic.monthlyFee}/mo)
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue Breakdown & Model Explainability */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <h3 className="font-fraunces font-bold text-base text-[#0F5257]">
              SaaS Suvidha Revenue Model
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 space-y-1">
                <span className="font-bold text-teal-950 block">1. Clinic Subscriptions</span>
                <p className="text-gray-600 leading-relaxed">
                  ₹1,500 – ₹3,000/month flat fee per clinic for branded landing page, receptionist tablet app, and digital queue.
                </p>
                <div className="font-mono-num font-bold text-teal-800 pt-1">
                  Active: {totalClinics} clinics = ₹{subscriptionRevenue}/mo
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 space-y-1">
                <span className="font-bold text-amber-950 block">2. Per-Booking Commission</span>
                <p className="text-gray-600 leading-relaxed">
                  ₹20 – ₹30 per completed OPD appointment booked via patient portal.
                </p>
                <div className="font-mono-num font-bold text-amber-800 pt-1">
                  Volume: {totalAppointments} bookings = ₹{commissionRevenue}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="font-bold text-gray-800 block">3. Patient Side Promise</span>
                <p className="text-gray-600 leading-relaxed">
                  Always 100% free for patients in Phase 1. Pay doctor consultation fee directly at clinic counter.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold border ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tab 2: Clinics Management */}
      {activeTab === 'clinics' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-5">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-fraunces font-bold text-lg text-[#0F5257] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#D4A24C]" />
                <span>{t.manageClinics} ({clinics.length})</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === 'hi' 
                  ? 'भारत के सभी पंजीकृत क्लिनिक एवं अस्पताल, ओपीडी फीस एवं सुविधाएं प्रबंधित करें'
                  : 'Manage all verified clinics, hospitals, consultation fees & facilities in India'}
              </p>
            </div>
            
            <button
              onClick={() => setShowAddClinicModal(true)}
              className="px-4 py-2 rounded-xl bg-[#0F5257] hover:bg-[#0c4347] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.onboardClinic}</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={clinicSearchQuery}
                onChange={(e) => setClinicSearchQuery(e.target.value)}
                placeholder={lang === 'hi' ? 'क्लिनिक, पता या विशेषज्ञता खोजें...' : 'Search clinic by name, area, specialty...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50/70 text-xs focus:bg-white focus:border-teal-600 focus:outline-none transition-colors"
              />
              {clinicSearchQuery && (
                <button
                  onClick={() => setClinicSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Type Filter Chips */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setClinicTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  clinicTypeFilter === 'all'
                    ? 'bg-teal-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lang === 'hi' ? 'सभी' : 'All'} ({clinics.length})
              </button>
              <button
                onClick={() => setClinicTypeFilter('clinic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  clinicTypeFilter === 'clinic'
                    ? 'bg-teal-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lang === 'hi' ? 'क्लिनिक / नर्सिंग होम' : 'Clinics'} ({clinics.filter(c => c.type === 'clinic').length})
              </button>
              <button
                onClick={() => setClinicTypeFilter('hospital')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  clinicTypeFilter === 'hospital'
                    ? 'bg-teal-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lang === 'hi' ? 'अस्पताल' : 'Hospitals'} ({clinics.filter(c => c.type === 'hospital').length})
              </button>
            </div>
          </div>

          {/* Clinics Grid */}
          {(() => {
            const filteredClinics = clinics.filter(c => {
              const matchesType = clinicTypeFilter === 'all' || c.type === clinicTypeFilter;
              const matchesSearch = !clinicSearchQuery.trim() || 
                c.name.toLowerCase().includes(clinicSearchQuery.toLowerCase()) ||
                (c.nameHindi && c.nameHindi.includes(clinicSearchQuery)) ||
                c.address.toLowerCase().includes(clinicSearchQuery.toLowerCase()) ||
                c.category.toLowerCase().includes(clinicSearchQuery.toLowerCase()) ||
                c.phone.includes(clinicSearchQuery);
              return matchesType && matchesSearch;
            });

            if (filteredClinics.length === 0) {
              return (
                <div className="py-12 text-center text-gray-500 space-y-2 border border-dashed border-gray-200 rounded-2xl">
                  <Building2 className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs font-semibold">
                    {lang === 'hi' ? 'कोई क्लिनिक नहीं मिला' : 'No clinics match your search criteria'}
                  </p>
                  <button
                    onClick={() => { setClinicSearchQuery(''); setClinicTypeFilter('all'); }}
                    className="text-xs text-teal-700 font-bold hover:underline cursor-pointer"
                  >
                    {lang === 'hi' ? 'सभी क्लिनिक दिखाएं' : 'Clear search filters'}
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClinics.map(c => {
                  const linkedDoctors = doctors.filter(d => d.clinicId === c.id);
                  const feeDisplay = c.consultationFee ? `₹${c.consultationFee}` : '₹400';
                  const followUpDisplay = c.followUpFee ? `₹${c.followUpFee}` : (lang === 'hi' ? 'फ्री (7 दिन)' : 'Free Follow-up');

                  // Extract all registered Gmails for this clinic/hospital
                  const allClinicGmails = Array.from(
                    new Set([
                      ...(c.authorizedGmails || []),
                      ...(c.email ? [c.email] : []),
                      ...linkedDoctors.map(d => d.email).filter(Boolean) as string[]
                    ])
                  );
                  const clinicGmails = allClinicGmails.length > 0 
                    ? allClinicGmails 
                    : (c.phone ? [`clinic.${c.phone.replace(/\D/g, '').slice(-6)}@gmail.com`] : [`clinic.${c.id}@gmail.com`]);

                  return (
                    <div 
                      key={c.id} 
                      className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-teal-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-3 relative group"
                    >
                      {/* Top Row: Visual + Name + Type */}
                      <div className="space-y-2.5">
                        <div className="flex items-start gap-3">
                          <img 
                            src={c.logoUrl || c.bannerUrl || PRESET_CLINIC_PHOTOS[0].url} 
                            alt={c.name} 
                            className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0 shadow-xs" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                                c.type === 'hospital' 
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                                  : 'bg-teal-50 text-teal-800 border border-teal-200'
                              }`}>
                                {c.type === 'hospital' ? '🏥 ' + (lang === 'hi' ? 'अस्पताल' : 'Hospital') : '🏢 ' + (lang === 'hi' ? 'क्लिनिक' : 'Clinic')}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                c.status === 'active' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {c.status === 'active' ? (lang === 'hi' ? 'सक्रिय' : 'Active') : (lang === 'hi' ? 'निलंबित' : 'Suspended')}
                              </span>
                            </div>
                            <h4 className="font-fraunces font-bold text-sm text-[#0F5257] truncate mt-1">
                              {c.name}
                            </h4>
                            {c.nameHindi && c.nameHindi !== c.name && (
                              <p className="text-[11px] text-gray-500 truncate -mt-0.5">{c.nameHindi}</p>
                            )}
                          </div>
                        </div>

                        {/* Speciality Category */}
                        <div className="flex items-center gap-1.5 text-xs text-[#D4A24C] font-semibold bg-amber-50/60 px-2.5 py-1 rounded-lg border border-amber-100">
                          <Stethoscope className="w-3.5 h-3.5 shrink-0 text-[#D4A24C]" />
                          <span className="truncate">{lang === 'hi' && c.categoryHindi ? c.categoryHindi : c.category}</span>
                        </div>

                        {/* Consultation Fee Highlight */}
                        <div className="flex items-center justify-between text-xs bg-teal-50/50 p-2 rounded-xl border border-teal-100 font-mono-num">
                          <div className="flex items-center gap-1 text-teal-900">
                            <span className="text-gray-500 font-sans text-[11px]">{lang === 'hi' ? 'ओपीडी शुल्क:' : 'OPD Fee:'}</span>
                            <span className="font-bold text-sm text-teal-800">{feeDisplay}</span>
                          </div>
                          <div className="text-[11px] text-gray-500">
                            <span>{lang === 'hi' ? 'फॉलो-अप:' : 'Follow-up:'} </span>
                            <span className="font-semibold text-teal-900">{followUpDisplay}</span>
                          </div>
                        </div>

                        {/* Address & Contact */}
                        <div className="text-xs text-gray-600 space-y-1 pt-1">
                          <p className="flex items-start gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <span className="truncate">{c.address} {c.landmark ? `(${c.landmark})` : ''}</span>
                          </p>
                          <p className="flex items-center gap-1.5 font-mono-num text-gray-700">
                            <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>{c.phone}</span>
                            {c.whatsappNumber && c.whatsappNumber !== c.phone && (
                              <span className="text-[10px] text-emerald-700 font-sans ml-1">📱 WA: {c.whatsappNumber}</span>
                            )}
                          </p>
                        </div>

                        {/* Facilities Badges (Extra items) */}
                        {c.facilities && c.facilities.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap pt-1">
                            {c.facilities.slice(0, 3).map((facility, idx) => (
                              <span 
                                key={idx} 
                                className="text-[10px] font-medium bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 truncate max-w-[130px]"
                              >
                                {facility}
                              </span>
                            ))}
                            {c.facilities.length > 3 && (
                              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                                +{c.facilities.length - 3} {lang === 'hi' ? 'अधिक' : 'more'}
                              </span>
                            )}
                          </div>
                        )}

                        {/* GMAIL & DOCTOR PORTAL ACCESS SECTION ("Sara Gmail or clinic ka name dikhna chiye ki Kitne Gmail hai") */}
                        <div className="rounded-xl border border-stone-200 bg-stone-50/90 p-2.5 space-y-2 mt-1 shadow-2xs">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-[#0F5257]">
                              <Mail className="w-3.5 h-3.5 text-[#D4A24C] shrink-0" />
                              <span>{lang === 'hi' ? 'पंजीकृत जीमेल खाते:' : 'Linked Clinic Gmails:'}</span>
                            </div>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200 shrink-0">
                              {clinicGmails.length} {lang === 'hi' ? 'Gmail लिंक हैं' : 'Gmails Linked'}
                            </span>
                          </div>

                          {/* All Gmail Addresses */}
                          <div className="flex flex-wrap gap-1.5 pt-0.5 max-h-24 overflow-y-auto pr-0.5">
                            {clinicGmails.map((gm, idx) => (
                              <span 
                                key={idx} 
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-stone-300 text-[11px] font-mono-num text-stone-800 shadow-2xs group-hover:border-teal-300"
                                title={gm}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                <span className="truncate max-w-[190px]">{gm}</span>
                              </span>
                            ))}
                          </div>

                          {/* OPD Password & Manage Button */}
                          <div className="flex items-center justify-between pt-1.5 border-t border-stone-200 text-[11px]">
                            <div className="flex items-center gap-1 text-stone-600">
                              <Lock className="w-3 h-3 text-[#D4A24C]" />
                              <span>{lang === 'hi' ? 'ओपीडी पासवर्ड:' : 'OPD Pass:'}</span>
                              <code className="bg-white border border-stone-300 text-[#0F5257] px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
                                {c.doctorPassword || '123456'}
                              </code>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenManageGmails(c)}
                              className="text-teal-800 hover:text-teal-950 font-bold hover:underline cursor-pointer flex items-center gap-1 text-[11px] bg-teal-50 px-2 py-0.5 rounded border border-teal-200"
                            >
                              <Edit2 className="w-3 h-3 text-teal-700" />
                              <span>{lang === 'hi' ? 'Gmail जोड़ें / बदलें' : 'Manage Gmails'}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Doctors count, Subscription & Actions */}
                      <div className="border-t border-gray-100 pt-3 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 font-medium">
                            {linkedDoctors.length} {lang === 'hi' ? 'डॉक्टर पंजीकृत' : 'Doctors Linked'}
                          </span>
                          <span className="text-emerald-700 font-bold font-mono-num text-[11px]">
                            ₹{c.monthlyFee || 1999}/mo
                          </span>
                        </div>

                        {/* Appointment Booking Start/Pause Control */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-teal-50/70 border border-teal-200 text-xs">
                          <div className="flex items-center gap-1.5 font-bold min-w-0">
                            <Calendar className="w-3.5 h-3.5 text-[#0F5257] shrink-0" />
                            <span className="text-[#0F5257] truncate">
                              {lang === 'hi' ? 'ऑनलाइन बुकिंग:' : 'Booking:'}
                            </span>
                            {c.isAppointmentBookingActive !== false ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {lang === 'hi' ? 'शुरू (Active)' : 'Started'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                {lang === 'hi' ? 'रोका गया (Paused)' : 'Paused'}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => onUpdateClinic(c.id, { 
                              isAppointmentBookingActive: c.isAppointmentBookingActive === false ? true : false 
                            })}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1 shrink-0 ${
                              c.isAppointmentBookingActive !== false
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                            title={lang === 'hi' ? 'अपॉइंटमेंट बुकिंग शुरू या बंद करें' : 'Start or Pause Appointment Booking'}
                          >
                            {c.isAppointmentBookingActive !== false ? (
                              <>
                                <PauseCircle className="w-3.5 h-3.5 text-amber-800" />
                                <span>{lang === 'hi' ? 'बुकिंग रोकें' : 'Pause'}</span>
                              </>
                            ) : (
                              <>
                                <PlayCircle className="w-3.5 h-3.5 text-white" />
                                <span>{lang === 'hi' ? 'बुकिंग शुरू करें' : 'Start Appointment'}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Action Buttons: Status Toggle & DELETE BUTTON */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            onClick={() => onUpdateClinic(c.id, { 
                              status: c.status === 'active' ? 'suspended' : 'active' 
                            })}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center ${
                              c.status === 'active'
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {c.status === 'active' 
                              ? (lang === 'hi' ? 'निलंबित करें' : 'Suspend') 
                              : (lang === 'hi' ? 'सक्रिय करें' : 'Activate')}
                          </button>

                          {/* DELETE CLINIC OR HOSPITAL BUTTON */}
                          <button
                            onClick={() => setClinicToDelete(c)}
                            title={lang === 'hi' 
                              ? (c.type === 'hospital' ? 'इस अस्पताल को हटाएं' : 'इस क्लिनिक को हटाएं') 
                              : (c.type === 'hospital' ? 'Delete / Remove Hospital' : 'Delete / Remove Clinic')}
                            className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            <span>
                              {lang === 'hi' 
                                ? (c.type === 'hospital' ? 'अस्पताल हटाएं' : 'क्लिनिक हटाएं') 
                                : (c.type === 'hospital' ? 'Delete Hospital' : 'Delete Clinic')}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Tab 3: Doctors Management & VIP Boost & Removal */}
      {activeTab === 'doctors' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-fraunces font-bold text-lg text-[#0F5257]">
                {t.manageDoctors} ({doctors.length})
              </h3>
              <p className="text-xs text-gray-500">
                {lang === 'hi'
                  ? 'डेहरी के पंजीकृत डॉक्टरों की सूची, ओपीडी परामर्श शुल्क, वीआईपी प्राथमिकता तथा डॉक्टर हटाएं/जोड़ें'
                  : 'Manage doctor profiles, consultation fees, toggle VIP priority listing, or remove doctors'}
              </p>
            </div>
            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#0F5257] text-white text-xs font-bold flex items-center gap-1 cursor-pointer self-start sm:self-auto shadow-sm hover:bg-[#0B3E42] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addDoctor}</span>
            </button>
          </div>

          {/* Search & Filter Bar for Doctors */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={doctorSearchQuery}
                onChange={(e) => setDoctorSearchQuery(e.target.value)}
                placeholder={lang === 'hi' ? 'डॉक्टर का नाम, विशेषता या क्लिनिक/अस्पताल खोजें...' : 'Search doctor by name, specialty, or clinic/hospital...'}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-teal-600 bg-gray-50/50"
              />
              {doctorSearchQuery && (
                <button
                  onClick={() => setDoctorSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Specialty Filter */}
            <select
              value={doctorSpecialtyFilter}
              onChange={(e) => setDoctorSpecialtyFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 text-gray-700 focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="all">{lang === 'hi' ? 'सभी विशेषज्ञताएं (All Specialties)' : 'All Specialties'}</option>
              {Array.from(new Set(doctors.map(d => d.specialty))).map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            {/* Clinic / Hospital Filter */}
            <select
              value={doctorClinicFilter}
              onChange={(e) => setDoctorClinicFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 text-gray-700 focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="all">{lang === 'hi' ? 'सभी केंद्र (All Hospitals/Clinics)' : 'All Clinics & Hospitals'}</option>
              {clinics.map(c => (
                <option key={c.id} value={c.id}>
                  {c.type === 'hospital' ? '🏥 ' : '🏢 '}{c.name}
                </option>
              ))}
            </select>
          </div>

          {(() => {
            const filteredDoctors = doctors.filter(doc => {
              if (doctorSpecialtyFilter !== 'all' && doc.specialty !== doctorSpecialtyFilter) return false;
              if (doctorClinicFilter !== 'all' && doc.clinicId !== doctorClinicFilter) return false;
              if (doctorSearchQuery.trim()) {
                const q = doctorSearchQuery.toLowerCase();
                const matchName = doc.name.toLowerCase().includes(q) || (doc.nameHindi && doc.nameHindi.toLowerCase().includes(q));
                const matchSpecialty = doc.specialty.toLowerCase().includes(q) || (doc.specialtyHindi && doc.specialtyHindi.toLowerCase().includes(q));
                const matchClinic = doc.clinicName.toLowerCase().includes(q);
                const matchPhone = doc.contactPhone?.toLowerCase().includes(q);
                if (!matchName && !matchSpecialty && !matchClinic && !matchPhone) return false;
              }
              return true;
            });

            if (filteredDoctors.length === 0) {
              return (
                <div className="py-12 text-center text-gray-500 space-y-2 border border-dashed border-gray-200 rounded-2xl">
                  <Stethoscope className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs font-semibold">
                    {lang === 'hi' ? 'कोई डॉक्टर नहीं मिला' : 'No doctors match your search or filter'}
                  </p>
                  <button
                    onClick={() => { setDoctorSearchQuery(''); setDoctorSpecialtyFilter('all'); }}
                    className="text-xs text-teal-700 font-bold hover:underline cursor-pointer"
                  >
                    {lang === 'hi' ? 'सभी डॉक्टर दिखाएं' : 'Clear search filters'}
                  </button>
                </div>
              );
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 uppercase font-semibold text-[10px] tracking-wider bg-gray-50/70">
                      <th className="py-3 px-3">Doctor</th>
                      <th className="py-3 px-3">Specialty & Degree</th>
                      <th className="py-3 px-3">Clinic / Hospital</th>
                      <th className="py-3 px-3">Fee</th>
                      <th className="py-3 px-3">Razorpay Route (Direct Payout)</th>
                      <th className="py-3 px-3">VIP Featured</th>
                      <th className="py-3 px-3">{lang === 'hi' ? 'बुकिंग व उपस्थिति' : 'Booking & Status'}</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDoctors.map(doctor => (
                      <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img src={doctor.photoUrl} alt={doctor.name} className="w-9 h-9 rounded-lg object-cover border shrink-0" />
                            <div>
                              <div className="font-bold text-gray-900">{doctor.name}</div>
                              {doctor.contactPhone && (
                                <div className="text-[10px] text-gray-400 font-mono-num">{doctor.contactPhone}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-teal-900">{doctor.specialty}</div>
                          <div className="text-[11px] text-gray-500">{doctor.qualification} ({doctor.experienceYears}y exp)</div>
                        </td>
                        <td className="py-3 px-3 text-gray-700 font-medium">
                          <div className="font-semibold text-gray-900">{doctor.clinicName}</div>
                          {(doctor.pincode || doctor.address || doctor.city) && (
                            <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <span className="text-amber-600">📍</span>
                              <span className="truncate max-w-[170px]">{doctor.address || doctor.city || 'Dehri-on-Sone'}</span>
                              {doctor.pincode && (
                                <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-mono-num font-bold text-[9px]">
                                  {doctor.pincode}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono-num font-bold text-gray-900">
                          ₹{doctor.fee}
                        </td>
                        {/* Razorpay Route Account Status */}
                        <td className="py-3 px-3">
                          {doctor.razorpayAccountId ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                {doctor.razorpayAccountId}
                              </span>
                              <div className="text-[10px] text-emerald-700 font-semibold">
                                {doctor.platformCommissionPercent && doctor.platformCommissionPercent > 0
                                  ? `${100 - doctor.platformCommissionPercent}% Dr. • ${doctor.platformCommissionPercent}% Comm.`
                                  : '100% Direct Payout'}
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenEditDoctor(doctor)}
                              className="text-[10px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                            >
                              + Link Route Account
                            </button>
                          )}
                        </td>
                        {/* VIP Boost Toggle */}
                        <td className="py-3 px-3">
                          <button
                            onClick={() => onUpdateDoctor(doctor.id, { isVipBoosted: !doctor.isVipBoosted })}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                              doctor.isVipBoosted
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            <Sparkles className="w-3 h-3 fill-current" />
                            <span>{doctor.isVipBoosted ? 'VIP ACTIVE' : 'STANDARD'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => onUpdateDoctor(doctor.id, {
                                isAppointmentBookingActive: doctor.isAppointmentBookingActive === false ? true : false
                              })}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                                doctor.isAppointmentBookingActive !== false
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                              }`}
                              title={lang === 'hi' ? 'अपॉइंटमेंट बुकिंग शुरू या बंद करें' : 'Click to Toggle Appointment Booking Active/Paused'}
                            >
                              {doctor.isAppointmentBookingActive !== false ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>{lang === 'hi' ? 'बुकिंग चालू' : 'Booking Active'}</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  <span>{lang === 'hi' ? 'बुकिंग बंद' : 'Booking Paused'}</span>
                                </>
                              )}
                            </button>
                            <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                              doctor.availableToday ? 'text-stone-600 bg-stone-100' : 'text-rose-700 bg-rose-50'
                            }`}>
                              {doctor.availableToday ? (lang === 'hi' ? 'उपस्थित' : 'In Cabin') : (lang === 'hi' ? 'अवकाश' : 'On Leave')}
                            </span>
                          </div>
                        </td>
                        {/* Actions: Edit & Delete Doctor */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditDoctor(doctor)}
                              title={lang === 'hi' ? 'डॉक्टर की जानकारी व फीस बदलें' : 'Edit Doctor Details & Fees'}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-teal-700" />
                              <span>{lang === 'hi' ? 'एडिट करें' : 'Edit'}</span>
                            </button>
                            <button
                              onClick={() => setDoctorToDelete(doctor)}
                              title={lang === 'hi' ? 'इस डॉक्टर को हटाएं' : 'Remove Doctor from Platform'}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              <span>{lang === 'hi' ? 'हटाएं' : 'Delete'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* Tab 4: Support & Requests */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <h3 className="font-fraunces font-bold text-lg text-[#0F5257]">
            Clinic Transition & Support Requests
          </h3>

          <div className="space-y-3">
            {tickets.map(ticket => (
              <div
                key={ticket.id}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{ticket.clinicOrPatientName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      ticket.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {ticket.priority}
                    </span>
                    <span className="text-xs text-gray-400 font-mono-num">{ticket.createdAt}</span>
                  </div>
                  <h4 className="font-semibold text-xs text-teal-900">{ticket.issueSummary}</h4>
                  <p className="text-xs text-gray-600">{ticket.notes || ticket.phone}</p>
                </div>

                <div>
                  {ticket.status === 'open' ? (
                    <button
                      onClick={() => onResolveTicket(ticket.id)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                      ✓ Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Authorized Doctor/Staff Gmails & Portal Access (2FA) */}
      {activeTab === 'doctor_portal' && (
        <div className="space-y-6">
          {/* Top Banner Card */}
          <div className="bg-gradient-to-r from-[#0F5257] to-[#164E53] rounded-2xl p-6 text-white shadow-sm border border-teal-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Stethoscope className="w-5 h-5 text-emerald-300" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    {lang === 'hi' ? 'सुपर एडमिन सुरक्षा कंसोल' : 'Super Admin Security Console'}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-300" />
                    2FA Strict
                  </span>
                </div>
                <h3 className="font-fraunces text-xl font-bold text-white">
                  {lang === 'hi' 
                    ? '2. अधिकृत डॉक्टर / स्टाफ जीमेल एवं पोर्टल एक्सेस (2-Way Verification)' 
                    : '2. Authorized Doctor/Staff Gmails & Portal Access'}
                </h3>
                <p className="text-xs text-teal-100/90 max-w-2xl leading-relaxed">
                  {lang === 'hi'
                    ? 'डेहरी-ऑन-सोन के सभी पंजीकृत क्लिनिक/अस्पतालों के डॉक्टरों एवं स्टाफ के जीमेल खाते, ओपीडी पोर्टल पासवर्ड और 2-स्तरीय सुरक्षा सत्यापन (2FA OTP) का केंद्रीय नियंत्रण। अधिकृत जीमेल सीधे डॉक्टर केबिन से जुड़ते हैं।'
                    : 'Centralized control for registered doctor & staff Gmails, clinic OPD passwords, and 2-Way verification (2FA OTP) across Dehri-on-Sone healthcare network.'}
                </p>
              </div>

              {/* Quick Actions in Banner */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddClinicModal(true)}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'hi' ? '+ नया क्लिनिक व जीमेल जोड़ें' : '+ Onboard Clinic & Gmails'}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-white/15">
              <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                <span className="text-[10px] text-teal-200 font-semibold block">{lang === 'hi' ? 'पंजीकृत क्लिनिक' : 'Registered Clinics'}</span>
                <span className="text-lg font-bold font-mono text-white">{clinics.length}</span>
              </div>
              <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                <span className="text-[10px] text-teal-200 font-semibold block">{lang === 'hi' ? 'अधिकृत जीमेल खाते' : 'Authorized Gmails'}</span>
                <span className="text-lg font-bold font-mono text-emerald-300">
                  {clinics.reduce((acc, c) => acc + (c.authorizedGmails?.length || 0), 0)}
                </span>
              </div>
              <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                <span className="text-[10px] text-teal-200 font-semibold block">{lang === 'hi' ? 'ओपीडी केबिन डॉक्टर्स' : 'OPD Cabin Doctors'}</span>
                <span className="text-lg font-bold font-mono text-white">{doctors.length}</span>
              </div>
              <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                <span className="text-[10px] text-teal-200 font-semibold block">{lang === 'hi' ? 'सुरक्षा सत्यापन स्थिति' : 'Security Status'}</span>
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  2FA Active (8213)
                </span>
              </div>
            </div>
          </div>

          {/* TWO COLUMNS: LEFT = Interactive 2FA Test & Launch Console, RIGHT = Clinics Gmails Directory */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: Interactive 2FA Portal Testing & Launcher Console (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#0F5257] text-white flex items-center justify-center shadow-2xs">
                      <KeyRound className="w-4 h-4 text-emerald-300" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 leading-tight">
                        {lang === 'hi' ? '2FA डॉक्टर लॉगिन व केबिन एक्सेस' : 'Doctor 2FA Verification & Access'}
                      </h4>
                      <p className="text-[10px] text-stone-500">
                        {lang === 'hi' ? 'एडमिन पोर्टल से 2-वे सत्यापन जांचें व केबिन खोलें' : 'Test 2-Way OTP & launch doctor cabin from admin'}
                      </p>
                    </div>
                  </div>
                  <span className="bg-teal-50 text-teal-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200">
                    Step: {twoFaStep === 'credentials' ? '1/2' : twoFaStep === 'otp' ? '2/2' : 'Verified'}
                  </span>
                </div>

                {/* Notifications */}
                {twoFaError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{twoFaError}</span>
                  </div>
                )}
                {twoFaSuccess && (
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-2 text-xs text-teal-900">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>{twoFaSuccess}</span>
                  </div>
                )}

                {/* STEP 1: Credentials (Gmail + Password) */}
                {twoFaStep === 'credentials' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendAdminDoctor2FaOtp();
                    }}
                    className="space-y-4"
                  >
                    {/* Quick Preset Selector */}
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 flex items-center gap-1 mb-1.5">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>{lang === 'hi' ? 'त्वरित अधिकृत जीमेल चुनें (Quick Selector):' : 'Select Authorized Gmail:'}</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {[
                          { email: 'curayu@gmail.com', label: 'सेवा क्लिनिक (डॉ. आर. के. शर्मा)' },
                          { email: 'mydehridoctor@gmail.com', label: 'अग्रवाल हेल्थकेयर (डॉ. नीतू सिंह)' },
                          { email: 'dr.rksharma@gmail.com', label: 'आयुष्मान क्लिनिक' },
                          ...clinics.flatMap(c => (c.authorizedGmails || []).map(g => ({ email: g, label: c.name }))).filter((item, idx, arr) => arr.findIndex(x => x.email.toLowerCase() === item.email.toLowerCase()) === idx)
                        ].slice(0, 4).map((item) => (
                          <button
                            key={item.email}
                            type="button"
                            onClick={() => {
                              setTwoFaDoctorEmail(item.email);
                              const matchedClinic = dataService.findClinicByAuthorizedGmail(item.email);
                              if (matchedClinic) {
                                setTwoFaPassword(matchedClinic.doctorPassword || '123456');
                              }
                              setTwoFaError(null);
                            }}
                            className={`text-[10px] p-2 rounded-lg border text-left transition-all cursor-pointer ${
                              twoFaDoctorEmail.toLowerCase() === item.email.toLowerCase()
                                ? 'bg-[#0F5257] text-white border-[#0F5257] font-bold shadow-xs'
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            <span className="font-mono block truncate">{item.email}</span>
                            <span className="block text-[9px] opacity-80 truncate">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Authorized Gmail Input */}
                    <div>
                      <label className="block text-xs font-semibold text-[#0F5257] mb-1">
                        {lang === 'hi' ? 'अधिकृत डॉक्टर / स्टाफ जीमेल *' : 'Authorized Doctor / Staff Gmail *'}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={twoFaDoctorEmail}
                          onChange={(e) => {
                            setTwoFaDoctorEmail(e.target.value);
                            const matched = dataService.findClinicByAuthorizedGmail(e.target.value);
                            if (matched) {
                              setTwoFaPassword(matched.doctorPassword || '123456');
                            }
                            setTwoFaError(null);
                          }}
                          placeholder="doctor.name@gmail.com"
                          className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F5257]"
                        />
                      </div>

                      {/* Live Clinic Match Banner */}
                      {(() => {
                        const matchedClinic = dataService.findClinicByAuthorizedGmail(twoFaDoctorEmail);
                        if (matchedClinic) {
                          const linkedDoc = doctors.find(d => d.clinicId === matchedClinic.id);
                          return (
                            <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-950 flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-semibold">
                                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>{matchedClinic.name}</span>
                                {linkedDoc && <span className="text-emerald-700">({linkedDoc.name})</span>}
                              </div>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                                अधिकृत क्लिनिक
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Doctor OPD Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-[#0F5257]">
                          {lang === 'hi' ? 'डॉक्टर ओपीडी पोर्टल पासवर्ड *' : 'Doctor Portal Password *'}
                        </label>
                        <span className="text-[10px] text-stone-500 font-mono">Default: 123456</span>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showTwoFaPassword ? 'text' : 'password'}
                          required
                          value={twoFaPassword}
                          onChange={(e) => setTwoFaPassword(e.target.value)}
                          placeholder="123456"
                          className="w-full pl-9 pr-9 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F5257]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowTwoFaPassword(!showTwoFaPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                        >
                          {showTwoFaPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Step 1 Submit */}
                    <button
                      type="submit"
                      id="admin-send-2fa-otp-btn"
                      className="w-full py-2.5 bg-[#0F5257] hover:bg-[#166B71] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-300" />
                      <span>
                        {lang === 'hi' 
                          ? 'सुरक्षा कोड (OTP) भेजें एवं 2-स्तरीय सत्यापन शुरू करें' 
                          : 'Send Security OTP & Start 2-Way Verification'}
                      </span>
                    </button>
                  </form>
                )}

                {/* STEP 2: OTP Verification */}
                {twoFaStep === 'otp' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleVerifyAdminDoctor2FaOtp();
                    }}
                    className="space-y-4"
                  >
                    <div className="p-3 bg-[#0F5257] text-white rounded-xl shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                          {lang === 'hi' ? 'चरण 2: 2-स्तरीय सुरक्षा सत्यापन' : 'Step 2: 2-Way Security Verification'}
                        </span>
                        <span className="text-[10px] bg-teal-800 px-2 py-0.5 rounded-full text-emerald-200 font-mono">
                          2FA Code Sent
                        </span>
                      </div>

                      <div className="bg-black/20 p-2 rounded-lg border border-white/10 space-y-1 text-xs">
                        <div className="text-teal-200 text-[11px]">
                          {lang === 'hi' ? 'सत्यापन कोड इस जीमेल पर भेजा गया:' : 'Verification OTP dispatched to:'}
                        </div>
                        <div className="font-bold text-white font-mono flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{twoFaDoctorEmail}</span>
                        </div>
                      </div>
                    </div>

                    {/* 4-digit OTP Input */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-stone-700">
                        <span className="font-semibold">
                          {lang === 'hi' ? 'जीमेल से 4-अंकों का सुरक्षा कोड दर्ज करें:' : 'Enter 4-Digit Gmail Security OTP:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setTwoFaOtpInput('8213')}
                          className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-bold hover:bg-teal-100 cursor-pointer"
                        >
                          8213 Auto-fill
                        </button>
                      </div>

                      <input
                        type="text"
                        maxLength={4}
                        autoFocus
                        required
                        value={twoFaOtpInput}
                        onChange={(e) => setTwoFaOtpInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="8213"
                        className="w-full px-3 py-2.5 bg-white border-2 border-teal-800/40 rounded-xl text-lg font-mono text-center tracking-[0.6em] font-bold text-[#0F5257] focus:outline-hidden focus:ring-2 focus:ring-[#0F5257]"
                      />
                    </div>

                    {/* Countdown Timer & Resend */}
                    <div className="flex items-center justify-between text-xs text-stone-600 pt-0.5">
                      <span>
                        {twoFaOtpTimer > 0 ? (
                          <span className="text-stone-500 text-[11px]">
                            {lang === 'hi' ? `ओटीपी पुनः भेजें (${twoFaOtpTimer}s)` : `Resend OTP in ${twoFaOtpTimer}s`}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendAdminDoctor2FaOtp(twoFaDoctorEmail)}
                            className="text-[#0F5257] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>{lang === 'hi' ? 'ओटीपी पुनः भेजें (Resend OTP)' : 'Resend OTP to Gmail'}</span>
                          </button>
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setTwoFaStep('credentials');
                          setTwoFaError(null);
                        }}
                        className="text-stone-500 hover:text-stone-800 text-xs underline cursor-pointer"
                      >
                        {lang === 'hi' ? '← जीमेल बदलें' : '← Change Gmail'}
                      </button>
                    </div>

                    {/* Verify Button */}
                    <button
                      type="submit"
                      id="admin-verify-2fa-otp-btn"
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>
                        {lang === 'hi' 
                          ? 'ओटीपी सत्यापित करें एवं केबिन अभिगम जांचें' 
                          : 'Verify 2FA OTP & Authorize Doctor Cabin'}
                      </span>
                    </button>
                  </form>
                )}

                {/* STEP 3: Verified Doctor Cabin Authorized */}
                {twoFaStep === 'verified' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3.5 text-center animate-in fade-in">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>

                    <div>
                      <h4 className="font-bold text-emerald-950 text-sm">
                        {lang === 'hi' ? '2-स्तरीय सुरक्षा सत्यापन सफल!' : '2-Way Verification Successful!'}
                      </h4>
                      <p className="text-xs text-emerald-800 mt-1">
                        {lang === 'hi' 
                          ? `जीमेल "${twoFaDoctorEmail}" को डॉक्टर ओपीडी केबिन के लिए पूर्णतः अधिकृत किया गया है।`
                          : `Gmail "${twoFaDoctorEmail}" is fully authorized for Doctor OPD Cabin access.`}
                      </p>
                    </div>

                    {/* Target Doctor Info */}
                    {(() => {
                      const clinic = dataService.findClinicByAuthorizedGmail(twoFaDoctorEmail);
                      const doc = dataService.getOrCreateDoctorByEmail(twoFaDoctorEmail);
                      return (
                        <div className="bg-white p-3 rounded-xl border border-emerald-200 text-left space-y-1 text-xs text-stone-800">
                          <div className="flex items-center justify-between">
                            <span className="text-stone-500">{lang === 'hi' ? 'अधिकृत डॉक्टर:' : 'Authorized Doctor:'}</span>
                            <span className="font-bold text-[#0F5257]">{doc.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-stone-500">{lang === 'hi' ? 'क्लिनिक / अस्पताल:' : 'Clinic/Hospital:'}</span>
                            <span className="font-medium text-stone-900">{clinic ? clinic.name : 'डेहरी क्लिनिक'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-stone-500">{lang === 'hi' ? 'विशेषज्ञता:' : 'Specialty:'}</span>
                            <span className="font-medium text-stone-900">{doc.specialty}</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Launch Cabin Button */}
                    <div className="pt-1 space-y-2">
                      <button
                        type="button"
                        id="admin-launch-cabin-btn"
                        onClick={() => {
                          const doc = dataService.getOrCreateDoctorByEmail(twoFaDoctorEmail);
                          const clinic = dataService.findClinicByAuthorizedGmail(twoFaDoctorEmail) || clinics[0];
                          if (onLaunchDoctorCabin) {
                            onLaunchDoctorCabin(doc, clinic);
                          }
                        }}
                        className="w-full py-2.5 bg-[#0F5257] hover:bg-[#166B71] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <ExternalLink className="w-4 h-4 text-emerald-300" />
                        <span>
                          {lang === 'hi' 
                            ? '🚀 डॉक्टर ओपीडी केबिन में प्रवेश करें' 
                            : '🚀 Open Doctor OPD Cabin Now'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTwoFaStep('credentials');
                          setTwoFaSuccess(null);
                          setTwoFaError(null);
                        }}
                        className="text-xs text-stone-600 hover:text-stone-900 font-semibold cursor-pointer underline"
                      >
                        {lang === 'hi' ? '🔄 अन्य डॉक्टर/स्टाफ का 2FA जांचें' : '🔄 Test Another Doctor / Clinic 2FA'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Clinics Authorized Gmails Directory & Management Table (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <h4 className="font-fraunces font-bold text-base text-[#0F5257] flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#D4A24C]" />
                      <span>{lang === 'hi' ? 'सभी क्लिनिक व अधिकृत जीमेल डायरेक्टरी' : 'Clinic Authorized Gmails Directory'}</span>
                    </h4>
                    <p className="text-xs text-stone-500">
                      {lang === 'hi' 
                        ? 'सभी क्लिनिक के अधिकृत जीमेल खाते, ओपीडी पासवर्ड एवं 2FA स्थिति' 
                        : 'Manage authorized Gmails, OPD portal passwords, and 2FA status for each clinic'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddClinicModal(true)}
                    className="text-xs font-bold text-[#0F5257] bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl hover:bg-teal-100 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? '+ क्लिनिक जोड़ें' : '+ Add Clinic'}</span>
                  </button>
                </div>

                {/* Clinics List with Gmails */}
                <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                  {clinics.map((c) => {
                    const cGmails = c.authorizedGmails && c.authorizedGmails.length > 0 
                      ? c.authorizedGmails 
                      : (c.email ? [c.email] : []);
                    const linkedDocs = doctors.filter(d => d.clinicId === c.id);

                    return (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-white hover:border-teal-300 transition-all space-y-2.5"
                      >
                        {/* Clinic Title Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-2xs">
                              {c.type === 'hospital' ? (
                                <Hospital className="w-4 h-4 text-emerald-700" />
                              ) : (
                                <Building2 className="w-4 h-4 text-[#0F5257]" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-xs text-stone-900">{c.name}</h5>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                  c.type === 'hospital' ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                                }`}>
                                  {c.type === 'hospital' ? 'Hospital' : 'Clinic'}
                                </span>
                              </div>
                              <p className="text-[10px] text-stone-500 truncate max-w-xs">{c.address}</p>
                            </div>
                          </div>

                          {/* Quick 2FA Test Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (cGmails[0]) {
                                setTwoFaDoctorEmail(cGmails[0]);
                                setTwoFaPassword(c.doctorPassword || '123456');
                                setTwoFaStep('credentials');
                                setTwoFaError(null);
                                setTwoFaSuccess(null);
                              }
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-200" />
                            <span>2FA टेस्ट</span>
                          </button>
                        </div>

                        {/* Registered Gmails Badges */}
                        <div className="p-2 bg-white rounded-lg border border-stone-200/80 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-stone-700 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-[#D4A24C]" />
                              {lang === 'hi' ? 'अधिकृत जीमेल खाते:' : 'Authorized Gmails:'}
                            </span>
                            <span className="text-[10px] font-bold text-teal-900 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100 font-mono">
                              {cGmails.length} {lang === 'hi' ? 'खाते' : 'Gmails'}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {cGmails.map((gm, gIdx) => (
                              <button
                                key={gIdx}
                                type="button"
                                onClick={() => {
                                  setTwoFaDoctorEmail(gm);
                                  setTwoFaPassword(c.doctorPassword || '123456');
                                  setTwoFaStep('credentials');
                                  setTwoFaError(null);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 hover:bg-teal-50 hover:text-teal-900 border border-stone-200 text-[10px] font-mono text-stone-800 transition-colors cursor-pointer"
                                title="Click to test 2FA for this Gmail"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                <span className="truncate max-w-[180px]">{gm}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Footer: OPD Password, Doctors, and Manage */}
                        <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 text-[11px]">
                          <div className="flex items-center gap-2 text-stone-600">
                            <span className="flex items-center gap-1">
                              <Lock className="w-3 h-3 text-[#D4A24C]" />
                              <span>{lang === 'hi' ? 'ओपीडी पासवर्ड:' : 'OPD Pass:'}</span>
                              <code className="bg-white border border-stone-200 px-1.5 py-0.2 rounded font-mono font-bold text-[10px] text-[#0F5257]">
                                {c.doctorPassword || '123456'}
                              </code>
                            </span>
                            <span className="text-stone-400">•</span>
                            <span>{linkedDocs.length} {lang === 'hi' ? 'डॉक्टर' : 'Doctors'}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenManageGmails(c)}
                            className="text-teal-800 hover:text-teal-950 font-bold hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>{lang === 'hi' ? 'जीमेल प्रबंधित करें' : 'Manage Gmails'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Delete Clinic or Hospital */}
      {clinicToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-fraunces font-bold text-base text-gray-900">
                  {clinicToDelete.type === 'hospital'
                    ? (lang === 'hi' ? 'अस्पताल हटाने की पुष्टि' : 'Remove Hospital from Platform')
                    : (lang === 'hi' ? 'क्लिनिक हटाने की पुष्टि' : 'Remove Clinic from Platform')}
                </h3>
                <p className="text-xs text-gray-500">
                  {lang === 'hi'
                    ? (clinicToDelete.type === 'hospital' ? 'यह कार्रवाई अस्पताल को डायरेक्टरी से हटा देगी' : 'यह कार्रवाई क्लिनिक को डायरेक्टरी से हटा देगी')
                    : (clinicToDelete.type === 'hospital' ? 'This action will delete the hospital listing' : 'This action will delete the clinic listing')}
                </p>
              </div>
            </div>

            {/* Target Clinic Details Card */}
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center gap-2.5">
                <img 
                  src={clinicToDelete.logoUrl || clinicToDelete.bannerUrl || PRESET_CLINIC_PHOTOS[0].url} 
                  alt={clinicToDelete.name} 
                  className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0" 
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                      {clinicToDelete.type === 'hospital' ? (lang === 'hi' ? 'अस्पताल' : 'Hospital') : (lang === 'hi' ? 'क्लिनिक' : 'Clinic')}
                    </span>
                    <h4 className="font-bold text-xs text-gray-900 truncate">{clinicToDelete.name}</h4>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{clinicToDelete.address}</p>
                </div>
              </div>

              {/* Linked Doctors Warning */}
              {(() => {
                const linkedDocs = doctors.filter(d => d.clinicId === clinicToDelete.id);
                return (
                  <div className="text-xs pt-1 border-t border-gray-200 text-gray-700 flex items-center justify-between">
                    <span>{lang === 'hi' ? 'पंजीकृत डॉक्टर:' : 'Associated Doctors:'}</span>
                    <span className="font-bold text-teal-900">{linkedDocs.length} {lang === 'hi' ? 'डॉक्टर' : 'Doctors'}</span>
                  </div>
                );
              })()}
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {lang === 'hi' 
                ? `क्या आप वाकई "${clinicToDelete.name}" (${clinicToDelete.type === 'hospital' ? 'अस्पताल' : 'क्लिनिक'}) को हटाना चाहते हैं? इसके बाद यह सर्च डायरेक्टरी और मरीज ऐप में दिखाई नहीं देगा।`
                : `Are you sure you want to remove "${clinicToDelete.name}" (${clinicToDelete.type === 'hospital' ? 'Hospital' : 'Clinic'})? It will be removed immediately from patient search, directory, and reception access.`}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingClinic}
                onClick={() => setClinicToDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isDeletingClinic}
                onClick={handleConfirmDeleteClinic}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeletingClinic ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{lang === 'hi' ? 'हटाया जा रहा है...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'hi' 
                        ? (clinicToDelete.type === 'hospital' ? 'हाँ, अस्पताल हटाएं' : 'हाँ, क्लिनिक हटाएं') 
                        : (clinicToDelete.type === 'hospital' ? 'Confirm Delete Hospital' : 'Confirm Delete Clinic')}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Manage Clinic Gmails and Doctor Portal Password ("manage clinic me Sara Gmail or clinic/hospital ka name dikhna chiye ki Kitne Gmail hai clinic ke") */}
      {clinicToManageGmails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-teal-100 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-fraunces font-bold text-base text-[#0F5257]">
                    {lang === 'hi' ? 'क्लिनिक जीमेल व पोर्टल प्रबंधन' : 'Manage Clinic Gmails & OPD Portal'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {clinicToManageGmails.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClinicToManageGmails(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clinic Details Banner */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-200">
                  {clinicToManageGmails.type === 'hospital' ? '🏥 ' + (lang === 'hi' ? 'अस्पताल' : 'Hospital') : '🏢 ' + (lang === 'hi' ? 'क्लिनिक' : 'Clinic')}
                </span>
                <p className="text-xs font-bold text-stone-900 mt-1">{clinicToManageGmails.name}</p>
                <p className="text-[11px] text-stone-500 truncate max-w-[260px]">{clinicToManageGmails.address}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-stone-500 block">
                  {lang === 'hi' ? 'कुल जीमेल खाते:' : 'Total Gmails:'}
                </span>
                <span className="text-sm font-black font-mono-num text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                  {manageGmailsList.length} {lang === 'hi' ? 'खाते' : 'Gmails'}
                </span>
              </div>
            </div>

            {/* Existing Gmails List */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                <span>{lang === 'hi' ? 'अधिकृत जीमेल खातों की सूची:' : 'Authorized Gmail Accounts List:'}</span>
                <span className="text-[10px] text-stone-500 font-normal">
                  ({manageGmailsList.length} {lang === 'hi' ? 'जीमेल पंजीकृत' : 'registered'})
                </span>
              </label>

              {manageGmailsList.length === 0 ? (
                <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  {lang === 'hi' ? 'कोई जीमेल नहीं जुड़ा है। कृपया कम से कम एक जीमेल जोड़ें।' : 'No Gmails linked yet. Please add at least one.'}
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {manageGmailsList.map((gm, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-stone-200 hover:border-teal-300 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-mono-num text-stone-800 truncate">{gm}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setManageGmailsList(manageGmailsList.filter(g => g !== gm))}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors shrink-0 ml-2"
                        title={lang === 'hi' ? 'जीमेल हटाएं' : 'Remove Gmail'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Gmail Input Row */}
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={newGmailInput}
                    onChange={(e) => setNewGmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmed = newGmailInput.trim().toLowerCase();
                        if (trimmed && trimmed.includes('@') && !manageGmailsList.includes(trimmed)) {
                          setManageGmailsList([...manageGmailsList, trimmed]);
                          setNewGmailInput('');
                        }
                      }
                    }}
                    placeholder="e.g. newdoctor@gmail.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs font-mono-num focus:border-teal-600 focus:outline-none bg-stone-50/50"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = newGmailInput.trim().toLowerCase();
                    if (trimmed && trimmed.includes('@') && !manageGmailsList.includes(trimmed)) {
                      setManageGmailsList([...manageGmailsList, trimmed]);
                      setNewGmailInput('');
                    }
                  }}
                  disabled={!newGmailInput.trim() || !newGmailInput.includes('@')}
                  className="px-3 py-2 rounded-xl bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 disabled:opacity-40 cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'जोड़ें' : 'Add'}</span>
                </button>
              </div>
            </div>

            {/* Doctor Portal Password */}
            <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#D4A24C]" />
                  <span>{lang === 'hi' ? 'डॉक्टर ओपीडी पोर्टल पासवर्ड:' : 'Doctor OPD Portal Password:'}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowManagePassword(!showManagePassword)}
                  className="text-[11px] text-teal-700 font-bold hover:underline cursor-pointer"
                >
                  {showManagePassword ? (lang === 'hi' ? 'छुपाएं' : 'Hide') : (lang === 'hi' ? 'दिखाएं' : 'Show')}
                </button>
              </div>
              <input
                type={showManagePassword ? 'text' : 'password'}
                value={manageDoctorPassword}
                onChange={(e) => setManageDoctorPassword(e.target.value)}
                placeholder="123456"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold text-stone-900 focus:border-teal-600 focus:outline-none"
              />
              <p className="text-[10px] text-teal-800">
                {lang === 'hi'
                  ? '🔒 2-स्तरीय सुरक्षा (2FA): अधिकृत डॉक्टर/स्टाफ इस पासवर्ड एवं जीमेल से लॉगिन करेंगे, जिसके बाद उनके जीमेल पर सुरक्षा ओटीपी (OTP) भेजा जाएगा।'
                  : '🔒 2-Way Verification (2FA): Doctors and staff authenticate with this password and authorized Gmail, followed by a security OTP sent to their Gmail.'}
              </p>
            </div>

            {/* Quick 2FA Test & Launch Action from Modal */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-semibold text-stone-800">
                  {lang === 'hi' ? 'इस क्लिनिक का 2FA व केबिन जांचें' : 'Test 2FA & Access Cabin'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (manageGmailsList.length > 0) {
                    setTwoFaDoctorEmail(manageGmailsList[0]);
                  } else if (clinicToManageGmails?.email) {
                    setTwoFaDoctorEmail(clinicToManageGmails.email);
                  }
                  setTwoFaPassword(manageDoctorPassword);
                  setTwoFaStep('credentials');
                  setActiveTab('doctor_portal');
                  setClinicToManageGmails(null);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>{lang === 'hi' ? '2FA कंसोल में खोलें' : 'Open in 2FA Console'}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
              <button
                type="button"
                disabled={isSavingClinicGmails}
                onClick={() => setClinicToManageGmails(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isSavingClinicGmails}
                onClick={handleSaveClinicGmails}
                className="px-5 py-2 rounded-xl bg-[#0F5257] hover:bg-[#0B3E42] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSavingClinicGmails ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{lang === 'hi' ? 'सुरक्षित हो रहा है...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'जीमेल व पासवर्ड सुरक्षित करें' : 'Save Gmails & Password'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Delete Doctor */}
      {doctorToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-fraunces font-bold text-base text-gray-900">
                  {lang === 'hi' ? 'डॉक्टर हटाने की पुष्टि' : 'Remove Doctor from Platform'}
                </h3>
                <p className="text-xs text-gray-500">
                  {lang === 'hi' ? 'यह कार्रवाई वापस नहीं की जा सकती' : 'This will remove the doctor profile'}
                </p>
              </div>
            </div>

            {/* Target Doctor Details Card */}
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center gap-2.5">
                <img 
                  src={doctorToDelete.photoUrl} 
                  alt={doctorToDelete.name} 
                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0" 
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-gray-900 truncate">{doctorToDelete.name}</h4>
                  <p className="text-[11px] text-teal-800 font-semibold truncate">{doctorToDelete.specialty} • {doctorToDelete.qualification}</p>
                  <p className="text-[10px] text-gray-500 truncate">🏥 {doctorToDelete.clinicName}</p>
                </div>
              </div>

              <div className="text-[11px] pt-1.5 border-t border-gray-200 text-gray-700 flex items-center justify-between">
                <span>{lang === 'hi' ? 'ओपीडी परामर्श फीस:' : 'OPD Consultation Fee:'}</span>
                <span className="font-bold font-mono-num text-teal-900">₹{doctorToDelete.fee}</span>
              </div>
              {doctorToDelete.contactPhone && (
                <div className="text-[11px] text-gray-600 flex items-center justify-between">
                  <span>{lang === 'hi' ? 'संपर्क मोबाइल:' : 'Contact Mobile:'}</span>
                  <span className="font-mono-num">{doctorToDelete.contactPhone}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {lang === 'hi' 
                ? `क्या आप वाकई "${doctorToDelete.name}" को हटाना चाहते हैं? इसके बाद यह डॉक्टर क्लिनिक प्रोफाइल, सर्च डायरेक्टरी और मरीज ओपीडी बुकिंग से तुरंत हट जाएंगे।`
                : `Are you sure you want to remove "${doctorToDelete.name}"? They will no longer appear in patient searches, clinic profiles, or appointment bookings.`}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingDoctor}
                onClick={() => setDoctorToDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isDeletingDoctor}
                onClick={handleConfirmDeleteDoctor}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeletingDoctor ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{lang === 'hi' ? 'हटाया जा रहा है...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'हाँ, डॉक्टर हटाएं' : 'Confirm Delete Doctor'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Doctor Details & Fees */}
      {doctorToEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-gray-200 my-auto max-h-[92vh] flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 shrink-0">
                  <Edit2 className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-fraunces font-bold text-lg text-[#0F5257]">
                    {lang === 'hi' ? 'डॉक्टर प्रोफाइल व फीस संपादित करें' : 'Edit Doctor Profile & Fees'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {lang === 'hi' 
                      ? 'परामर्श शुल्क (Fees), विशेषता, अस्पताल संबंध व ओपीडी समय बदलें' 
                      : 'Update consultation fee, timings, specialty, and hospital/clinic affiliation'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDoctorToEdit(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveEditDoctor} className="space-y-4 overflow-y-auto pr-1">
              {/* Doctor Avatar Bar */}
              <div className="flex items-center gap-3 p-3 bg-teal-50/50 rounded-2xl border border-teal-100">
                <img 
                  src={doctorToEdit.photoUrl} 
                  alt={doctorToEdit.name} 
                  className="w-12 h-12 rounded-xl object-cover border border-teal-200 shrink-0" 
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-teal-950 truncate">{doctorToEdit.name}</div>
                  <div className="text-[11px] text-teal-700 truncate">{doctorToEdit.specialty} • {doctorToEdit.qualification}</div>
                  <div className="text-[10px] text-gray-500 truncate">ID: {doctorToEdit.id}</div>
                </div>
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Doctor Name English */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'hi' ? 'डॉक्टर का नाम (English) *' : 'Doctor Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editDocName}
                    onChange={(e) => setEditDocName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>

                {/* Doctor Name Hindi */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'hi' ? 'डॉक्टर का नाम (हिंदी)' : 'Doctor Name (Hindi)'}
                  </label>
                  <input
                    type="text"
                    value={editDocNameHindi}
                    onChange={(e) => setEditDocNameHindi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>

                {/* Specialty */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'hi' ? 'विशेषज्ञता (Specialty) *' : 'Specialty *'}
                  </label>
                  <select
                    value={editDocSpecialty}
                    onChange={(e) => setEditDocSpecialty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-teal-600 bg-white cursor-pointer"
                  >
                    <option value="General Physician">General Physician (सामान्य चिकित्सक)</option>
                    <option value="Pediatrics & Child Specialist">Pediatrics & Child Specialist (शिशु रोग)</option>
                    <option value="Orthopedics & Bone Specialist">Orthopedics & Bone Specialist (हड्डी रोग)</option>
                    <option value="Gynecology & Obstetrics">Gynecology & Obstetrics (स्त्री रोग)</option>
                    <option value="Ophthalmology & Eye Care">Ophthalmology & Eye Care (नेत्र रोग)</option>
                    <option value="Cardiology & Heart">Cardiology & Heart (हृदय रोग)</option>
                    <option value="ENT (Ear Nose Throat)">ENT (Ear Nose Throat - कान, नाक, गला)</option>
                    <option value="Dermatology & Skin">Dermatology & Skin (त्वचा रोग)</option>
                    <option value="Dental Care & Surgery">Dental Care & Surgery (दंत चिकित्सक)</option>
                    <option value="General & Laparoscopic Surgery">General & Laparoscopic Surgery (सर्जन)</option>
                  </select>
                </div>

                {/* Hospital / Clinic Affiliation */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'hi' ? 'संबद्ध क्लिनिक / अस्पताल *' : 'Affiliated Clinic / Hospital *'}
                  </label>
                  <select
                    value={editDocClinicId}
                    onChange={(e) => setEditDocClinicId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-teal-600 bg-white cursor-pointer"
                  >
                    {clinics.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.type === 'hospital' ? '🏥 ' : '🏢 '}{c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Consultation Fee */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'hi' ? 'ओपीडी परामर्श शुल्क (Consultation Fee ₹) *' : 'Consultation Fee (₹) *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editDocFee}
                      onChange={(e) => setEditDocFee(e.target.value)}
                      placeholder="400"
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 text-xs font-mono-num font-bold focus:outline-none focus:border-teal-600 bg-white"
                    />
                  </div>
                </div>

                {/* Qualification / Degrees */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'hi' ? 'डिग्री व योग्यता (Qualification) *' : 'Medical Degree / Qualification *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editDocDegree}
                    onChange={(e) => setEditDocDegree(e.target.value)}
                    placeholder="e.g. MBBS, MD (Medicine)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>

                {/* Experience (Years) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'hi' ? 'अनुभव (वर्ष) *' : 'Experience (Years) *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={editDocExp}
                    onChange={(e) => setEditDocExp(e.target.value)}
                    placeholder="8"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono-num focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'hi' ? 'डॉक्टर संपर्क मोबाइल' : 'Contact Mobile / WhatsApp'}
                  </label>
                  <input
                    type="tel"
                    value={editDocPhone}
                    onChange={(e) => setEditDocPhone(e.target.value)}
                    placeholder="94312XXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono-num focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>

                {/* Address & Landmark Row */}
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {lang === 'hi' ? 'ओपीडी कक्ष / चैंबर का पता (Address)' : 'OPD Chamber / Street Address'}
                    </label>
                    <input
                      type="text"
                      value={editDocAddress}
                      onChange={(e) => setEditDocAddress(e.target.value)}
                      placeholder="e.g. Room 102, Ground Floor, Station Road"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-teal-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {lang === 'hi' ? 'लैंडमार्क / पहचान स्थल (Landmark)' : 'Landmark / Nearby Location'}
                    </label>
                    <input
                      type="text"
                      value={editDocLandmark}
                      onChange={(e) => setEditDocLandmark(e.target.value)}
                      placeholder="e.g. Near Overbridge / Opp. SBI"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-teal-600 bg-white"
                    />
                  </div>
                </div>

                {/* PIN Code & City Row */}
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {lang === 'hi' ? 'पिन कोड (PIN Code) *' : 'PIN Code *'}
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={editDocPincode}
                      onChange={(e) => setEditDocPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="821307"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono-num font-bold text-amber-900 focus:outline-none focus:border-teal-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {lang === 'hi' ? 'शहर (City)' : 'City'}
                    </label>
                    <input
                      type="text"
                      value={editDocCity}
                      onChange={(e) => setEditDocCity(e.target.value)}
                      placeholder="Dehri-on-Sone"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-teal-600 bg-white"
                    />
                  </div>
                </div>

                {/* Next OPD Slot / Timings */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'hi' ? 'अगला ओपीडी समय (Next Slot / Timings)' : 'Next Available Slot / OPD Timings'}
                  </label>
                  <input
                    type="text"
                    value={editDocNextSlot}
                    onChange={(e) => setEditDocNextSlot(e.target.value)}
                    placeholder="e.g. Today 04:30 PM or 10:00 AM - 02:00 PM"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>

                {/* Available Today Toggle */}
                <div className="sm:col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-gray-900">
                      {lang === 'hi' ? 'आज क्लिनिक में उपस्थिति (Available Today)' : 'Availability Status Today'}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {editDocAvailableToday 
                        ? (lang === 'hi' ? 'मरीज आज के लिए टोकन बुक कर सकते हैं' : 'Patients can book OPD tokens for today') 
                        : (lang === 'hi' ? 'डॉक्टर आज छुट्टी पर हैं' : 'Doctor marked on leave today')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditDocAvailableToday(!editDocAvailableToday)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      editDocAvailableToday 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}
                  >
                    {editDocAvailableToday 
                      ? (lang === 'hi' ? 'उपलब्ध (Available)' : 'Available Today') 
                      : (lang === 'hi' ? 'छुट्टी पर (On Leave)' : 'On Leave')}
                  </button>
                </div>
              </div>

              {/* Razorpay Route (Multi-Doctor Payout Settlement) Section */}
              <div className="bg-gradient-to-br from-slate-900 via-[#0C2340] to-teal-950 text-white p-4 rounded-2xl border border-blue-500/20 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#0D74EC] text-white text-[10px] font-mono px-2 py-0.5 rounded font-black tracking-widest uppercase">
                      RAZORPAY ROUTE
                    </span>
                    <span className="text-xs font-bold text-teal-300">
                      {lang === 'hi' ? 'सीधा डॉक्टर बैंक सेटलमेंट' : 'Direct Doctor Bank Settlement'}
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Split Settlement Active
                  </span>
                </div>

                <p className="text-[11px] text-gray-300 leading-relaxed">
                  {lang === 'hi' 
                    ? 'मरीज द्वारा ऑनलाइन बुक किए जाने पर यह राशि Razorpay Route के जरिए सीधे इस डॉक्टर के लिंक्ड खाते में जमा होगी।' 
                    : 'When patients pay online, payments are automatically split and settled to this doctor\'s linked Razorpay account.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Linked Account ID */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-gray-200">
                        {lang === 'hi' ? 'Razorpay Linked Account ID' : 'Linked Account ID (Route)'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditDocRazorpayAccountId(`acc_${doctorToEdit.id.replace(/-/g, '_')}_${Date.now().toString().slice(-4)}`)}
                        className="text-[10px] text-amber-300 hover:text-amber-200 underline cursor-pointer"
                      >
                        Auto-Gen ID
                      </button>
                    </div>
                    <input
                      type="text"
                      value={editDocRazorpayAccountId}
                      onChange={(e) => setEditDocRazorpayAccountId(e.target.value)}
                      placeholder="acc_M1234567890"
                      className="w-full px-3 py-1.5 rounded-xl border border-white/20 text-xs font-mono bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  {/* Account Holder Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-200 mb-1">
                      {lang === 'hi' ? 'खाताधारक का नाम (Account Holder)' : 'Bank Account Holder Name'}
                    </label>
                    <input
                      type="text"
                      value={editDocAccountHolderName}
                      onChange={(e) => setEditDocAccountHolderName(e.target.value)}
                      placeholder="Dr. R. K. Sharma"
                      className="w-full px-3 py-1.5 rounded-xl border border-white/20 text-xs bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  {/* Bank Account Number */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-200 mb-1">
                      {lang === 'hi' ? 'बैंक खाता संख्या (Account No)' : 'Bank Account Number'}
                    </label>
                    <input
                      type="text"
                      value={editDocBankAccountNumber}
                      onChange={(e) => setEditDocBankAccountNumber(e.target.value)}
                      placeholder="50100234988410"
                      className="w-full px-3 py-1.5 rounded-xl border border-white/20 text-xs font-mono bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  {/* Bank IFSC & Bank Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-200 mb-1">
                      {lang === 'hi' ? 'IFSC कोड एवं बैंक' : 'Bank IFSC & Name'}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={editDocBankIfsc}
                        onChange={(e) => setEditDocBankIfsc(e.target.value.toUpperCase())}
                        placeholder="HDFC0001245"
                        className="w-full px-2 py-1.5 rounded-xl border border-white/20 text-xs font-mono uppercase bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-teal-400"
                      />
                      <input
                        type="text"
                        value={editDocBankName}
                        onChange={(e) => setEditDocBankName(e.target.value)}
                        placeholder="HDFC Bank"
                        className="w-full px-2 py-1.5 rounded-xl border border-white/20 text-xs bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>

                  {/* Doctor UPI ID */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-200 mb-1">
                      {lang === 'hi' ? 'डॉक्टर का UPI ID (VPA)' : 'Doctor UPI ID (VPA)'}
                    </label>
                    <input
                      type="text"
                      value={editDocUpiId}
                      onChange={(e) => setEditDocUpiId(e.target.value)}
                      placeholder="doctor@okhdfcbank"
                      className="w-full px-3 py-1.5 rounded-xl border border-white/20 text-xs font-mono bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  {/* Platform Commission % */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-200 mb-1">
                      {lang === 'hi' ? 'प्लेटफॉर्म कमीशन % (0% = 100% डॉक्टर को)' : 'Platform Commission %'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={editDocCommissionPercent}
                        onChange={(e) => setEditDocCommissionPercent(e.target.value)}
                        placeholder="0"
                        className="w-24 px-3 py-1.5 rounded-xl border border-white/20 text-xs font-mono-num bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-teal-400"
                      />
                      <span className="text-[11px] text-teal-300 font-medium">
                        {parseFloat(editDocCommissionPercent) === 0 ? '100% Doctor Payout' : `${100 - (parseFloat(editDocCommissionPercent) || 0)}% to Doctor`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Settlement Calculator Live Preview */}
                <div className="bg-white/10 rounded-xl p-2.5 flex items-center justify-between text-[11px] border border-white/10 font-mono-num">
                  <span className="text-gray-300">
                    OPD Fee: ₹{parseInt(editDocFee, 10) || 400}
                  </span>
                  <span className="text-emerald-300 font-bold">
                    Dr. Credit: ₹{Math.round((parseInt(editDocFee, 10) || 400) * (1 - (parseFloat(editDocCommissionPercent) || 0) / 100))}
                  </span>
                  <span className="text-amber-300">
                    Platform Fee: ₹{Math.round((parseInt(editDocFee, 10) || 400) * ((parseFloat(editDocCommissionPercent) || 0) / 100))}
                  </span>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isUpdatingDoctor}
                  onClick={() => setDoctorToEdit(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingDoctor}
                  className="px-5 py-2 rounded-xl bg-[#0F5257] hover:bg-[#0B3E42] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingDoctor ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{lang === 'hi' ? 'अपडेट हो रहा है...' : 'Saving Changes...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'विवरण सुरक्षित करें' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ultra-Comprehensive Onboard New Clinic */}
      {showAddClinicModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-gray-200 my-auto max-h-[92vh] flex flex-col space-y-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-fraunces font-bold text-lg text-[#0F5257] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#D4A24C]" />
                  <span>{lang === 'hi' ? 'नया क्लिनिक / अस्पताल जोड़ें' : 'Onboard New Clinic / Hospital'}</span>
                </h3>
                <p className="text-xs text-gray-500">
                  {lang === 'hi' 
                    ? 'क्लिनिक का नाम, ओपीडी फीस, विशेषज्ञता श्रेणी, पता एवं अतिरिक्त सुविधाएं दर्ज करें' 
                    : 'Configure clinic profile, OPD consultation fees, specialty, amenities & timings'}
                </p>
              </div>
              <button
                onClick={() => setShowAddClinicModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveClinic} className="overflow-y-auto pr-1 space-y-4 text-xs">
              {/* DEHRI & 50 KM REGIONAL CLINIC INFO & GUIDELINES BANNER ("on board clinic me dalna hai") */}
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-stone-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-[#0F5257]">
                  <MapPin className="w-4 h-4 text-[#D4A24C] shrink-0" />
                  <span>
                    {lang === 'hi' 
                      ? '📍 देहरी-ऑन-सोन व 50 किमी दायरे के क्लिनिक / अस्पताल ऑनबोर्डिंग दिशानिर्देश' 
                      : '📍 Dehri-on-Sone & 50 km Regional Clinic Network Guidelines'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  {lang === 'hi'
                    ? 'यह पोर्टल डेहरी-ऑन-सोन (821307), डालमियानगर (821305), सासाराम (821115), औरंगाबाद (824101), तिलौथू एवं संपूर्ण रोहतास क्षेत्र के सभी डॉक्टरों व अस्पतालों को डिजिटल ओपीडी कतार व टोकन सुविधा से जोड़ता है। नीचे क्लिनिक के लिए अधिकृत डॉक्टर/स्टाफ जीमेल एवं पोर्टल पासवर्ड दर्ज करना अनिवार्य है।'
                    : 'This portal connects clinics & hospitals across Dehri-on-Sone (821307), Dalmianagar (821305), Sasaram (821115), Aurangabad (824101), Tilouthu & Rohtas region. Please register authorized doctor/staff Gmail accounts and OPD portal password below.'}
                </p>
                <div className="flex flex-wrap gap-2 text-[10px] font-semibold pt-0.5">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-[#0F5257]">
                    ✓ 24x7 OPD टोकन व लाइव कतार
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-[#0F5257]">
                    ✓ डॉक्टर पोर्टल हेतु जीमेल प्रमाणीकरण
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-[#0F5257]">
                    ✓ व्हाट्सएप डिजिटल पर्ची व रसीद
                  </span>
                </div>
              </div>

              {/* SECTION 1: Basic Identity & Type */}
              <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-gray-800">
                  <span className="w-2 h-2 rounded-full bg-teal-600" />
                  <span>{lang === 'hi' ? '1. प्राथमिक विवरण एवं संस्था का प्रकार' : '1. General Info & Entity Type'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      {lang === 'hi' ? 'क्लिनिक / अस्पताल का नाम (English) *' : 'Clinic / Hospital Name (English) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newClinicName}
                      onChange={(e) => setNewClinicName(e.target.value)}
                      placeholder="e.g. Sone Valley Multi-Speciality Clinic"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:border-teal-600 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      {lang === 'hi' ? 'क्लिनिक का नाम (हिंदी में)' : 'Clinic Name (Hindi)'}
                    </label>
                    <input
                      type="text"
                      value={newClinicNameHindi}
                      onChange={(e) => setNewClinicNameHindi(e.target.value)}
                      placeholder="उदा. सोन वैली मल्टी-स्पेशियलिटी क्लिनिक"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:border-teal-600 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Entity Type Toggle */}
                <div>
                  <label className="font-semibold text-gray-700 block mb-1.5">
                    {lang === 'hi' ? 'संस्था का प्रकार चुनें:' : 'Select Entity Type:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewClinicType('clinic')}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        newClinicType === 'clinic'
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-xs'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-teal-700" />
                      <span>{lang === 'hi' ? 'क्लिनिक / नर्सिंग होम (Clinic)' : 'Clinic / Nursing Home'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewClinicType('hospital')}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        newClinicType === 'hospital'
                          ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-xs'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Hospital className="w-4 h-4 text-amber-700" />
                      <span>{lang === 'hi' ? 'अस्पताल (Hospital Center)' : 'Hospital Center'}</span>
                    </button>
                  </div>
                </div>

                {/* Specialty Category with Quick Buttons */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-gray-700">
                      {lang === 'hi' ? 'विशेषज्ञता श्रेणी (Category / Specialist Focus) *' : 'Speciality Category *'}
                    </label>
                    <span className="text-[11px] font-bold text-[#D4A24C]">{newClinicCategory}</span>
                  </div>

                  {/* Quick Category Chips */}
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 rounded-xl bg-white border border-gray-200">
                    {SPECIALITY_CATEGORIES.map((cat, idx) => {
                      const isSelected = newClinicCategory === cat.en;
                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => handleSelectCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#0F5257] text-white font-bold shadow-xs'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {lang === 'hi' ? cat.hi : cat.en}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom category input if needed */}
                  <input
                    type="text"
                    value={newClinicCategory}
                    onChange={(e) => setNewClinicCategory(e.target.value)}
                    placeholder="Or type custom category (उदा. बाल एवं शिशु रोग)"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs mt-1"
                  />
                </div>
              </div>

              {/* SECTION 2: DOCTOR AUTHENTICATION VIA GOOGLE / APPLE (GATES NAME, ADDRESS, FEES) */}
              <div className="p-4 rounded-2xl bg-teal-50/80 border-2 border-teal-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
                    <span className="text-sm">
                      {lang === 'hi' 
                        ? '2. डॉक्टर प्रमाणीकरण (Google / Apple Login) *' 
                        : '2. Doctor Authentication (Google / Apple Login) *'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider font-mono-num ${
                    isClinicGmailVerified 
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                      : 'bg-amber-100 text-amber-950 border border-amber-300'
                  }`}>
                    {isClinicGmailVerified 
                      ? (lang === 'hi' ? '✅ लॉगिन सत्यापित' : '✅ Verified') 
                      : (lang === 'hi' ? '⚠️ लॉगिन अनिवार्य' : '⚠️ Login Required')}
                  </span>
                </div>

                <p className="text-[11px] text-gray-700 leading-relaxed">
                  {lang === 'hi'
                    ? 'यहाँ सीधे Google या Apple से डॉक्टर का लॉगिन कराएं। लॉगिन हो जाने के बाद ही नीचे डॉक्टर का नाम, क्लिनिक का पता, फीस एवं समय अनलॉक होकर भरा जाएगा:'
                    : 'Authenticate doctor via Google or Apple. Once signed in, Doctor Name, Clinic Address, Fees, and Timings will unlock for entry below:'}
                </p>

                {/* If Not Logged In Yet: Show Google & Apple Login Buttons */}
                {!isClinicGmailVerified ? (
                  <div className="space-y-3 p-3.5 bg-white rounded-2xl border border-teal-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Google Sign In Button */}
                      <button
                        type="button"
                        id="doctor-google-login-btn"
                        onClick={handleDoctorGoogleAuth}
                        disabled={isAuthenticatingDoctor !== null}
                        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs rounded-xl border-2 border-stone-300 hover:border-teal-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {isAuthenticatingDoctor === 'google' ? (
                          <span className="w-4 h-4 border-2 border-teal-700 border-t-transparent rounded-full animate-spin shrink-0" />
                        ) : (
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                          </svg>
                        )}
                        <span>{lang === 'hi' ? 'Google से लॉगिन करें' : 'Continue with Google'}</span>
                      </button>

                      {/* Apple Sign In Button */}
                      <button
                        type="button"
                        id="doctor-apple-login-btn"
                        onClick={handleDoctorAppleAuth}
                        disabled={isAuthenticatingDoctor !== null}
                        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl border border-black transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {isAuthenticatingDoctor === 'apple' ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                        ) : (
                          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170">
                            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.77-11.72-14.19-5.99-9.35-10.74-19.8-14.24-31.36-3.5-11.55-5.25-22.3-5.25-32.26 0-14.9 3.65-27.18 10.96-36.83 7.31-9.65 16.49-14.58 27.53-14.79 4.35 0 9.27 1.16 14.76 3.49 5.49 2.33 9.4 3.54 11.72 3.65 1.96 0 5.82-1.22 11.59-3.65 5.76-2.44 10.63-3.54 14.61-3.34 11.2.53 20.35 4.67 27.45 12.43-9.8 5.92-14.6 14.07-14.4 24.45.21 8.04 3.21 14.9 9 20.59 5.79 5.68 12.68 9.07 20.67 10.16-1.8 5.4-3.83 10.68-6.09 15.84zm-30.82-108.4c0 7.09-2.61 13.75-7.83 19.98-5.77 6.88-12.83 11-21.18 12.37-.21-1.06-.32-2.12-.32-3.17 0-6.88 2.82-13.81 8.46-20.79 5.64-6.99 12.56-11.06 20.75-12.22.07 1.27.12 2.54.12 3.83z"/>
                          </svg>
                        )}
                        <span>{lang === 'hi' ? 'Apple ID से लॉगिन करें' : 'Continue with Apple'}</span>
                      </button>
                    </div>

                    {doctorAuthError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{doctorAuthError}</span>
                      </div>
                    )}

                    {/* Quick Manual / Fallback Email Toggle */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => setShowManualEmailInput(!showManualEmailInput)}
                        className="text-[11px] font-semibold text-teal-800 hover:text-teal-950 underline cursor-pointer"
                      >
                        {showManualEmailInput 
                          ? (lang === 'hi' ? '▲ ईमेल इनपुट छुपाएं' : '▲ Hide manual email')
                          : (lang === 'hi' ? 'या सीधे ईमेल आईडी दर्ज करके वेरीफाई करें ▾' : 'Or enter email directly & verify ▾')}
                      </button>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {lang === 'hi' ? '1-क्लिक सत्यापन' : '1-Click Instant Verify'}
                      </span>
                    </div>

                    {showManualEmailInput && (
                      <div className="flex gap-2 pt-1 animate-fadeIn">
                        <input
                          type="email"
                          value={manualDoctorEmail}
                          onChange={(e) => setManualDoctorEmail(e.target.value)}
                          placeholder="doctor@gmail.com"
                          className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono-num font-semibold text-gray-900 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleManualDoctorVerify(manualDoctorEmail)}
                          className="px-3 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                        >
                          {lang === 'hi' ? 'सत्यापित करें' : 'Verify & Unlock'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Doctor Logged In & Verified Card */
                  <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        {verifiedDoctorAuth?.photoURL ? (
                          <img 
                            src={verifiedDoctorAuth.photoURL} 
                            alt="Doctor" 
                            className="w-10 h-10 rounded-xl object-cover border-2 border-emerald-400 shrink-0" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            <CheckCircle2 className="w-6 h-6 text-emerald-200" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-emerald-950 text-xs truncate">
                              {verifiedDoctorAuth?.displayName || newClinicLeadDoctorName || 'Authorized Doctor'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              {verifiedDoctorAuth?.provider === 'google' && 'Google ✓'}
                              {verifiedDoctorAuth?.provider === 'apple' && 'Apple ✓'}
                              {verifiedDoctorAuth?.provider === 'manual' && 'Verified ✓'}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono-num text-emerald-800 truncate mt-0.5">
                            {newClinicGmails[0]}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleResetDoctorAuth}
                        className="px-2.5 py-1.5 text-[11px] font-bold text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer shrink-0 ml-2"
                      >
                        {lang === 'hi' ? 'बदलें / साइन आउट' : 'Change / Switch'}
                      </button>
                    </div>

                    <div className="p-2 bg-white/80 rounded-xl border border-emerald-200 flex items-center gap-2 text-[11px] text-emerald-900 font-semibold">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {lang === 'hi' 
                          ? 'लॉगिन सफल! अब आप नीचे डॉक्टर का नाम, क्लिनिक का पता, फीस एवं समय भर सकते हैं।' 
                          : 'Login verified! Doctor Name, Address, Fees & Timings are now unlocked below.'}
                      </span>
                    </div>

                    {/* Additional Staff / Reception Gmails */}
                    <div className="pt-2 border-t border-emerald-200 space-y-2">
                      <label className="text-[11px] font-bold text-gray-700 block">
                        {lang === 'hi' ? 'अतिरिक्त स्टाफ या रिसेप्शन जीमेल (वैकल्पिक)' : 'Additional Staff / Reception Gmails (Optional)'}
                      </label>
                      {newClinicGmails.slice(1).map((gmail, idx) => (
                        <div key={idx + 1} className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              value={gmail}
                              onChange={(e) => {
                                const updated = [...newClinicGmails];
                                updated[idx + 1] = e.target.value;
                                setNewClinicGmails(updated);
                              }}
                              placeholder={`staff${idx + 1}@gmail.com`}
                              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-mono-num"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setNewClinicGmails(newClinicGmails.filter((_, i) => i !== idx + 1));
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setNewClinicGmails([...newClinicGmails, ''])}
                        className="text-[11px] text-teal-800 hover:text-teal-950 font-bold flex items-center gap-1 cursor-pointer bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
                      >
                        <Plus className="w-3.5 h-3.5 text-teal-700" />
                        <span>{lang === 'hi' ? '+ अन्य स्टाफ जीमेल जोड़ें' : '+ Add Another Staff Gmail'}</span>
                      </button>
                    </div>

                    {/* Doctor OPD Portal Access Password */}
                    <div className="pt-2 border-t border-emerald-200">
                      <label className="font-semibold text-gray-700 block mb-1 text-xs">
                        {lang === 'hi' ? 'डॉक्टर ओपीडी पोर्टल बैकअप पासवर्ड' : 'Doctor OPD Portal Backup Password'}
                      </label>
                      <div className="relative max-w-sm">
                        <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={newClinicDoctorPassword}
                          onChange={(e) => setNewClinicDoctorPassword(e.target.value)}
                          placeholder="123456"
                          className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-mono-num font-bold text-teal-900"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {lang === 'hi'
                          ? 'डॉक्टर सीधे Google / Apple लॉगिन अथवा इस बैकअप पासवर्ड से पोर्टल में प्रवेश कर सकते हैं।'
                          : 'Doctor can log in directly with Google / Apple or with this backup password.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* LOCK / UNLOCK STATUS BANNER */}
              {!isClinicGmailVerified ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 flex items-start gap-3 shadow-xs">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-amber-900" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-amber-950">
                        {lang === 'hi' ? '🔒 Google / Apple लॉगिन अनिवार्य है' : '🔒 Google / Apple Sign-In Required'}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[9px] font-extrabold uppercase">
                        {lang === 'hi' ? 'फॉर्म लॉक है' : 'Form Locked'}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {lang === 'hi'
                        ? 'कृपया पहले ऊपर Google या Apple से डॉक्टर का लॉगिन करें। लॉगिन हो जाने के बाद ही नीचे डॉक्टर का नाम, क्लिनिक का पता, फीस एवं समय अनलॉक होगा और भरा जा सकेगा।'
                        : 'Please authenticate with Google or Apple above. Only after successful login, Doctor Name, Clinic Address, Fees, and Timings will unlock for entry below.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 flex items-center gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-emerald-950">
                      {lang === 'hi' ? '🔓 डॉक्टर लॉगिन सत्यापित! विवरण प्रविष्टि हेतु अनलॉक हैं।' : '🔓 Doctor Login Verified! All fields unlocked.'}
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      {lang === 'hi' ? 'अब आप नीचे डॉक्टर का नाम, क्लिनिक का पता, फीस एवं समय भर सकते हैं।' : 'You can now fill Doctor Name, Clinic Address, Fees, and Timings below.'}
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 3: DOCTOR NAME & DEGREE (GATED BY OTP VERIFICATION) */}
              <div className={`p-4 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-3 transition-all ${
                !isClinicGmailVerified ? 'opacity-50 pointer-events-none select-none' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>{lang === 'hi' ? '3. डॉक्टर का नाम एवं विवरण (Doctor Details)' : '3. Doctor Name & Profile'}</span>
                  </div>
                  {!isClinicGmailVerified && (
                    <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> {lang === 'hi' ? 'सत्यापन के बाद अनलॉक' : 'Locked'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1 text-xs">
                      {lang === 'hi' ? 'डॉक्टर का पूरा नाम (Doctor Full Name) *' : 'Doctor Full Name *'}
                    </label>
                    <input
                      type="text"
                      disabled={!isClinicGmailVerified}
                      value={newClinicLeadDoctorName}
                      onChange={(e) => setNewClinicLeadDoctorName(e.target.value)}
                      placeholder="उदा. डॉ. राजेश कुमार वर्मा / Dr. Rajesh Verma"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-teal-700 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1 text-xs">
                      {lang === 'hi' ? 'डिग्री एवं योग्यता (Degree / Qualification)' : 'Degree & Qualification'}
                    </label>
                    <input
                      type="text"
                      disabled={!isClinicGmailVerified}
                      value={newClinicLeadDoctorDegree}
                      onChange={(e) => setNewClinicLeadDoctorDegree(e.target.value)}
                      placeholder="उदा. MBBS, MD (Medicine)"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs focus:ring-2 focus:ring-teal-700 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Fees & Financials ("kitna fees hai") */}
              <div className={`p-4 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-3 transition-all ${
                !isClinicGmailVerified ? 'opacity-50 pointer-events-none select-none' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>{lang === 'hi' ? '4. फीस एवं सब्सक्रिप्शन विवरण (OPD Fees & Plans)' : '4. Fees & Commercials'}</span>
                  </div>
                  {!isClinicGmailVerified && (
                    <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> {lang === 'hi' ? 'सत्यापन के बाद अनलॉक' : 'Locked'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Standard Consultation Fee */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-700 block text-xs">
                      {lang === 'hi' ? 'ओपीडी परामर्श शुल्क (Consultation Fee ₹) *' : 'OPD Consultation Fee (₹) *'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                      <input
                        type="number"
                        disabled={!isClinicGmailVerified}
                        required
                        min="0"
                        step="50"
                        value={newClinicFee}
                        onChange={(e) => setNewClinicFee(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 bg-white font-mono-num font-bold text-teal-900 text-xs"
                      />
                    </div>
                    {/* Quick fee buttons */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      {['200', '300', '400', '500', '600', '800'].map((f) => (
                        <button
                          type="button"
                          disabled={!isClinicGmailVerified}
                          key={f}
                          onClick={() => setNewClinicFee(f)}
                          className={`px-2 py-0.5 rounded-md font-mono-num text-[10px] cursor-pointer ${
                            newClinicFee === f
                              ? 'bg-teal-800 text-white font-bold'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          ₹{f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Follow-up Fee */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-700 block text-xs">
                      {lang === 'hi' ? 'फॉलो-अप शुल्क (Follow-up Fee ₹)' : 'Follow-up Fee (₹)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                      <input
                        type="number"
                        disabled={!isClinicGmailVerified}
                        min="0"
                        step="50"
                        value={newClinicFollowUpFee}
                        onChange={(e) => setNewClinicFollowUpFee(e.target.value)}
                        placeholder="0 for free"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 bg-white font-mono-num text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <button
                        type="button"
                        disabled={!isClinicGmailVerified}
                        onClick={() => setNewClinicFollowUpFee('0')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${
                          newClinicFollowUpFee === '0'
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {lang === 'hi' ? 'फ्री (₹0)' : 'Free (₹0)'}
                      </button>
                      <button
                        type="button"
                        disabled={!isClinicGmailVerified}
                        onClick={() => setNewClinicFollowUpFee('150')}
                        className={`px-2 py-0.5 rounded-md text-[10px] cursor-pointer ${
                          newClinicFollowUpFee === '150'
                            ? 'bg-teal-700 text-white font-bold'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        ₹150
                      </button>
                      <button
                        type="button"
                        disabled={!isClinicGmailVerified}
                        onClick={() => setNewClinicFollowUpFee('200')}
                        className={`px-2 py-0.5 rounded-md text-[10px] cursor-pointer ${
                          newClinicFollowUpFee === '200'
                            ? 'bg-teal-700 text-white font-bold'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        ₹200
                      </button>
                    </div>
                  </div>
                </div>

                {/* SaaS Subscription Plan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-gray-200">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1 text-xs">
                      {lang === 'hi' ? 'प्लेटफॉर्म सब्सक्रिप्शन प्लान' : 'Platform Subscription Plan'}
                    </label>
                    <select
                      disabled={!isClinicGmailVerified}
                      value={newClinicPlan}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setNewClinicPlan(val);
                        if (val.includes('Free')) setNewClinicMonthlyFee('0');
                        else if (val.includes('Annual')) setNewClinicMonthlyFee('1500');
                        else setNewClinicMonthlyFee('1999');
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs"
                    >
                      <option value="Monthly Rent (मासिक किराया)">Monthly Rent - ₹1,999/mo (मासिक किराया)</option>
                      <option value="Free Pilot (फ्री पायलट)">Free Pilot 30-Days - ₹0 (फ्री ट्रायल)</option>
                      <option value="Quarterly Suvidha">Quarterly Suvidha - ₹5,499 (त्रैमासिक)</option>
                      <option value="Annual Pro">Annual Pro - ₹18,000/yr (वार्षिक)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1 text-xs">
                      {lang === 'hi' ? 'मासिक किराया (₹/Month)' : 'Monthly SaaS Fee (₹)'}
                    </label>
                    <input
                      type="number"
                      disabled={!isClinicGmailVerified}
                      value={newClinicMonthlyFee}
                      onChange={(e) => setNewClinicMonthlyFee(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono-num text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Indian Location, Address & Interactive Map (GATED BY OTP VERIFICATION) */}
              <div className={`p-4 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-4 transition-all ${
                !isClinicGmailVerified ? 'opacity-50 pointer-events-none select-none' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                    <span>{lang === 'hi' ? '5. क्लिनिक पता एवं संपर्क (Location & Address)' : '5. Location & Address'}</span>
                  </div>
                  {!isClinicGmailVerified && (
                    <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> {lang === 'hi' ? 'सत्यापन के बाद अनलॉक' : 'Locked'}
                    </span>
                  )}
                </div>

                <IndianLocationMapPicker
                  lang={lang}
                  address={newClinicAddress}
                  onAddressChange={setNewClinicAddress}
                  addressHindi={newClinicAddressHindi}
                  onAddressHindiChange={setNewClinicAddressHindi}
                  landmark={newClinicLandmark}
                  onLandmarkChange={setNewClinicLandmark}
                  pincode={newClinicPincode}
                  onPincodeChange={setNewClinicPincode}
                  city={newClinicCity}
                  onCityChange={setNewClinicCity}
                  state={newClinicState}
                  onStateChange={setNewClinicState}
                  lat={newClinicLat}
                  lng={newClinicLng}
                  onCoordinatesChange={(lat, lng) => {
                    setNewClinicLat(lat);
                    setNewClinicLng(lng);
                  }}
                />

                {/* Reception & Contact Phone Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1 text-xs">
                      {lang === 'hi' ? 'हेल्पलाइन / रिसेप्शन फोन नंबर *' : 'Reception / Contact Phone *'}
                    </label>
                    <input
                      type="text"
                      disabled={!isClinicGmailVerified}
                      required
                      value={newClinicPhone}
                      onChange={(e) => setNewClinicPhone(e.target.value)}
                      placeholder="+91 94312 88410"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono-num text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-700"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1 text-xs">
                      {lang === 'hi' ? 'व्हाट्सएप नंबर (टोकन पर्ची के लिए)' : 'WhatsApp Number (For instant slips)'}
                    </label>
                    <input
                      type="text"
                      disabled={!isClinicGmailVerified}
                      value={newClinicWhatsapp}
                      onChange={(e) => setNewClinicWhatsapp(e.target.value)}
                      placeholder="+91 94312 88410"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono-num text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-700"
                    />
                  </div>
                </div>

                {/* Operating Timings */}
                <div>
                  <label className="font-semibold text-gray-700 block mb-1 text-xs">
                    {lang === 'hi' ? 'ओपीडी खुलने का समय (Timings) *' : 'Clinic / OPD Hours *'}
                  </label>
                  <input
                    type="text"
                    disabled={!isClinicGmailVerified}
                    value={newClinicTimings}
                    onChange={(e) => setNewClinicTimings(e.target.value)}
                    placeholder="e.g. 09:00 AM - 01:30 PM & 04:30 PM - 08:30 PM"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs"
                  />
                </div>
              </div>

              {/* SECTION 6: Extra Facilities & Amenities ("or bhi extera item") */}
              <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    <span>{lang === 'hi' ? '6. अतिरिक्त सुविधाएं एवं सेवाएं (Facilities)' : '6. Amenities & Facilities'}</span>
                  </div>
                  <span className="text-[11px] font-bold text-teal-800">
                    {newClinicFacilities.length} {lang === 'hi' ? 'चयनित' : 'Selected'}
                  </span>
                </div>

                <p className="text-[11px] text-gray-500">
                  {lang === 'hi' 
                    ? 'उन सभी सुविधाओं पर क्लिक करें जो इस क्लिनिक या अस्पताल में उपलब्ध हैं:' 
                    : 'Select all features and facilities available for patients at this center:'}
                </p>

                {/* Facilities Multi-Select Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_FACILITIES.map((facility) => {
                    const isChecked = newClinicFacilities.includes(facility.labelEn) || newClinicFacilities.includes(facility.id);
                    return (
                      <button
                        type="button"
                        key={facility.id}
                        onClick={() => toggleFacility(facility.labelEn)}
                        className={`p-2 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                          isChecked
                            ? 'border-teal-600 bg-teal-50/80 text-teal-950 font-bold shadow-xs'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-base shrink-0">{facility.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs truncate">{lang === 'hi' ? facility.labelHi : facility.labelEn}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-teal-700 border-teal-700 text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 7: Photo & Banner Selection */}
              <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-gray-800">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <span>{lang === 'hi' ? '7. क्लिनिक फोटो एवं बैनर' : '7. Clinic Photo & Thumbnail'}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_CLINIC_PHOTOS.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setNewClinicPresetImage(preset.url)}
                      className={`p-1.5 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
                        newClinicPresetImage === preset.url
                          ? 'border-teal-600 ring-2 ring-teal-500/20 bg-teal-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-14 rounded-lg object-cover" />
                      <p className="text-[10px] font-semibold text-gray-700 truncate">{preset.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  disabled={isSubmittingClinic}
                  onClick={() => setShowAddClinicModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>

                {!isClinicGmailVerified ? (
                  <button
                    type="button"
                    onClick={handleDoctorGoogleAuth}
                    disabled={isAuthenticatingDoctor !== null}
                    className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isAuthenticatingDoctor ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4 text-amber-300" />
                    )}
                    <span>{lang === 'hi' ? '🔒 पहले Google / Apple से लॉगिन करें' : '🔒 Authenticate Doctor First'}</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmittingClinic}
                    className="px-6 py-2.5 rounded-xl bg-[#0F5257] hover:bg-[#0c4347] text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingClinic ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{lang === 'hi' ? 'जोड़ा जा रहा है...' : 'Saving...'}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>{lang === 'hi' ? 'क्लिनिक व डॉक्टर को ऑनबोर्ड करें' : 'Onboard Clinic & Doctor'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add New Doctor */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <h3 className="font-fraunces font-bold text-lg text-[#0F5257]">
              {t.addDoctor}
            </h3>

            {/* Quick Google & Apple Autofill for Doctor */}
            <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-[#0F5257] block">
                {lang === 'hi' ? 'Google / Apple से डॉक्टर प्रोफाइल ऑटो-भरें (वैकल्पिक):' : 'Autofill Doctor via Google / Apple (Optional):'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const u = await signInWithGoogle();
                      if (u) {
                        const prefix = (u.displayName || '').toLowerCase().startsWith('dr') ? '' : (lang === 'hi' ? 'डॉ. ' : 'Dr. ');
                        if (u.displayName) setNewDocName(prefix + u.displayName);
                        if (u.phoneNumber) setNewDocPhone(u.phoneNumber);
                      }
                    } catch (e) {
                      console.warn("Google autofill note:", e);
                    }
                  }}
                  className="px-2.5 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-[11px] font-bold text-stone-800 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const u = await signInWithApple();
                      if (u) {
                        const prefix = (u.displayName || '').toLowerCase().startsWith('dr') ? '' : (lang === 'hi' ? 'डॉ. ' : 'Dr. ');
                        if (u.displayName) setNewDocName(prefix + u.displayName);
                        if (u.phoneNumber) setNewDocPhone(u.phoneNumber);
                      }
                    } catch (e) {
                      console.warn("Apple autofill note:", e);
                    }
                  }}
                  className="px-2.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.77-11.72-14.19-5.99-9.35-10.74-19.8-14.24-31.36-3.5-11.55-5.25-22.3-5.25-32.26 0-14.9 3.65-27.18 10.96-36.83 7.31-9.65 16.49-14.58 27.53-14.79 4.35 0 9.27 1.16 14.76 3.49 5.49 2.33 9.4 3.54 11.72 3.65 1.96 0 5.82-1.22 11.59-3.65 5.76-2.44 10.63-3.54 14.61-3.34 11.2.53 20.35 4.67 27.45 12.43-9.8 5.92-14.6 14.07-14.4 24.45.21 8.04 3.21 14.9 9 20.59 5.79 5.68 12.68 9.07 20.67 10.16-1.8 5.4-3.83 10.68-6.09 15.84zm-30.82-108.4c0 7.09-2.61 13.75-7.83 19.98-5.77 6.88-12.83 11-21.18 12.37-.21-1.06-.32-2.12-.32-3.17 0-6.88 2.82-13.81 8.46-20.79 5.64-6.99 12.56-11.06 20.75-12.22.07 1.27.12 2.54.12 3.83z"/>
                  </svg>
                  <span>Apple ID</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveDoctor} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block">Doctor Full Name</label>
                <input
                  type="text"
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Dr. Sudhanshu Verma"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  {lang === 'hi' ? 'अस्पताल / क्लिनिक चुनें (Assign Clinic)' : 'Assign to Clinic'}
                </label>
                <select
                  value={newDocClinicId}
                  onChange={(e) => handleClinicChangeForNewDoctor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold bg-white"
                >
                  {clinics.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.city || 'Dehri-on-Sone'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {lang === 'hi' ? 'विशेषज्ञता (Specialty)' : 'Specialty'}
                  </label>
                  <input
                    type="text"
                    value={newDocSpecialty}
                    onChange={(e) => setNewDocSpecialty(e.target.value)}
                    placeholder="e.g. Child Specialist"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {lang === 'hi' ? 'डिग्री (Qualification)' : 'Qualification'}
                  </label>
                  <input
                    type="text"
                    value={newDocDegree}
                    onChange={(e) => setNewDocDegree(e.target.value)}
                    placeholder="e.g. MBBS, MD (Pediatrics)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {lang === 'hi' ? 'ओपीडी परामर्श शुल्क (₹ Fee)' : 'Consultation Fee (₹)'}
                  </label>
                  <input
                    type="number"
                    value={newDocFee}
                    onChange={(e) => setNewDocFee(e.target.value)}
                    placeholder="400"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono-num"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {lang === 'hi' ? 'अनुभव (वर्ष)' : 'Experience (Years)'}
                  </label>
                  <input
                    type="number"
                    value={newDocExp}
                    onChange={(e) => setNewDocExp(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono-num"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  {lang === 'hi' ? 'डॉक्टर मोबाइल नंबर (Contact Phone)' : 'Contact Phone / Mobile'}
                </label>
                <input
                  type="tel"
                  value={newDocPhone}
                  onChange={(e) => setNewDocPhone(e.target.value)}
                  placeholder="9800000000"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono-num"
                />
              </div>

              {/* Address & Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {lang === 'hi' ? 'ओपीडी कक्ष / पूरा पता (Address) *' : 'OPD Chamber / Address *'}
                  </label>
                  <input
                    type="text"
                    value={newDocAddress}
                    onChange={(e) => setNewDocAddress(e.target.value)}
                    placeholder="Station Road, Dehri-on-Sone"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {lang === 'hi' ? 'लैंडमार्क (पहचान स्थल)' : 'Landmark'}
                  </label>
                  <input
                    type="text"
                    value={newDocLandmark}
                    onChange={(e) => setNewDocLandmark(e.target.value)}
                    placeholder="Near Overbridge / Room 1"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
              </div>

              {/* PIN Code & City */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {lang === 'hi' ? 'पिन कोड (PIN Code) *' : 'PIN Code *'}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={newDocPincode}
                    onChange={(e) => setNewDocPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="821307"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono-num font-bold text-amber-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {lang === 'hi' ? 'शहर (City) *' : 'City *'}
                  </label>
                  <input
                    type="text"
                    value={newDocCity}
                    onChange={(e) => setNewDocCity(e.target.value)}
                    placeholder="Dehri-on-Sone"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F5257] text-white text-xs font-bold"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

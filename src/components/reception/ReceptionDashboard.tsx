import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Search, 
  Plus, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  UserPlus, 
  UserX,
  Printer, 
  User, 
  Phone, 
  Check, 
  X, 
  Camera, 
  RefreshCw, 
  Stethoscope, 
  ToggleLeft, 
  ToggleRight,
  Eye,
  Sliders,
  Sparkles,
  KeyRound,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Appointment, Clinic, Doctor, Language, AppUser } from '../../types';
import { translations } from '../../data/translations';
import { QrScannerView } from '../common/QrScannerView';
import { DuePaymentModal } from '../common/DuePaymentModal';

interface ReceptionDashboardProps {
  lang: Language;
  clinics: Clinic[];
  doctors: Doctor[];
  appointments: Appointment[];
  selectedClinicId: string;
  currentUser?: AppUser | null;
  onSelectClinicId: (id: string) => void;
  onAddAppointment: (apt: Appointment) => Promise<void>;
  onUpdateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  onUpdateDoctor: (doctorId: string, updates: Partial<Doctor>) => Promise<void>;
}

export const ReceptionDashboard: React.FC<ReceptionDashboardProps> = ({
  lang,
  clinics,
  doctors,
  appointments,
  selectedClinicId,
  currentUser,
  onSelectClinicId,
  onAddAppointment,
  onUpdateAppointment,
  onUpdateDoctor
}) => {
  const t = translations[lang];

  // Active clinic
  const currentClinic = clinics.find(c => c.id === selectedClinicId) || clinics[0];
  const clinicDoctors = doctors.filter(d => d.clinicId === currentClinic?.id);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [filterArrival, setFilterArrival] = useState<'all' | 'arrived' | 'scanned' | 'not_arrived'>('all');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Keyboard shortcut to quickly focus search bar ('/' or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setActiveTab('schedule');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Modals & Sub-views
  const [activeTab, setActiveTab] = useState<'schedule' | 'scanner' | 'availability'>('schedule');
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [selectedAptForDetail, setSelectedAptForDetail] = useState<Appointment | null>(null);
  const [duePaymentApt, setDuePaymentApt] = useState<Appointment | null>(null);

  // Scanner state
  const [scannerInput, setScannerInput] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'already_scanned' | 'invalid' | null;
    appointment?: Appointment;
    message?: string;
    isCrossClinic?: boolean;
    targetClinicId?: string;
    targetClinicName?: string;
  }>({ status: null });

  // Walk-in form state
  const [walkInDoctorId, setWalkInDoctorId] = useState(clinicDoctors[0]?.id || '');
  const [walkInName, setWalkInName] = useState('');
  const [walkInAge, setWalkInAge] = useState('');
  const [walkInGender, setWalkInGender] = useState<'male' | 'female' | 'other'>('male');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInSlot, setWalkInSlot] = useState(clinicDoctors[0]?.timeSlots[0] || '11:00 AM');
  const [walkInPaid, setWalkInPaid] = useState(true);
  const [walkInError, setWalkInError] = useState('');
  const [isSavingWalkIn, setIsSavingWalkIn] = useState(false);

  // Dedicated Patient Arrival Verification Modal state
  const [verifyModalApt, setVerifyModalApt] = useState<Appointment | null>(null);
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  // Today's date string (e.g. 2026-09-09)
  const todayStr = new Date().toISOString().split('T')[0];

  // Filter appointments for current clinic
  const clinicAppointments = appointments.filter(apt => apt.clinicId === currentClinic?.id);
  
  // Normalized Search & Filter
  const trimmedSearch = searchQuery.trim();
  const searchDigits = searchQuery.replace(/\D/g, '');

  const filteredAppointments = clinicAppointments.filter(apt => {
    let matchSearch = true;
    if (trimmedSearch) {
      const lowerSearch = trimmedSearch.toLowerCase();
      // 1. Patient Name matching (supports bilingual names like "Mohammad Alim (मो. अलीम)")
      const nameMatch = apt.patientName.toLowerCase().includes(lowerSearch);
      
      // 2. Phone matching (matches raw text OR normalized digit sequences like 98350...)
      const aptPhoneDigits = apt.patientPhone.replace(/\D/g, '');
      const phoneMatch = 
        apt.patientPhone.toLowerCase().includes(lowerSearch) ||
        (searchDigits.length >= 3 && aptPhoneDigits.includes(searchDigits));

      // 3. Appointment / Token Number matching (e.g. MDD-8941 or 8941)
      const tokenMatch = apt.appointmentNumber.toLowerCase().includes(lowerSearch);

      // 4. Doctor Name matching
      const doctorMatch = apt.doctorName.toLowerCase().includes(lowerSearch);

      matchSearch = nameMatch || phoneMatch || tokenMatch || doctorMatch;
    }

    const matchPay = filterPayment === 'all' || apt.paymentStatus === filterPayment;
    const isArrived = apt.arrivalStatus === 'scanned';
    const matchArr = filterArrival === 'all' 
      ? true 
      : filterArrival === 'arrived' 
      ? isArrived 
      : filterArrival === 'not_arrived' 
      ? !isArrived 
      : apt.arrivalStatus === filterArrival;

    return matchSearch && matchPay && matchArr;
  });

  // Open Walk-in modal prefilled with the search query (name or phone)
  const handleOpenWalkInWithSearch = () => {
    setShowWalkInModal(true);
    setWalkInDoctorId(clinicDoctors[0]?.id || '');
    const cleanDigits = searchQuery.replace(/\D/g, '');
    if (cleanDigits.length >= 5) {
      setWalkInPhone(cleanDigits.slice(-10));
      setWalkInName('');
    } else if (searchQuery.trim()) {
      setWalkInName(searchQuery.trim());
      setWalkInPhone('');
    }
  };

  // Visual text highlight helper for searched keywords
  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query.trim() || !text) return text;
    const cleanQ = query.trim();
    const lowerText = text.toLowerCase();
    const lowerQ = cleanQ.toLowerCase();
    const idx = lowerText.indexOf(lowerQ);

    if (idx !== -1) {
      const before = text.slice(0, idx);
      const match = text.slice(idx, idx + cleanQ.length);
      const after = text.slice(idx + cleanQ.length);
      return (
        <span>
          {before}
          <mark className="bg-amber-200 text-amber-950 font-bold px-0.5 rounded">{match}</mark>
          {after}
        </span>
      );
    }

    // Secondary check: if searching by numeric digits, match within phone numbers
    const qDigits = cleanQ.replace(/\D/g, '');
    if (qDigits.length >= 3) {
      const phoneIdx = text.indexOf(qDigits);
      if (phoneIdx !== -1) {
        const before = text.slice(0, phoneIdx);
        const match = text.slice(phoneIdx, phoneIdx + qDigits.length);
        const after = text.slice(phoneIdx + qDigits.length);
        return (
          <span>
            {before}
            <mark className="bg-amber-200 text-amber-950 font-bold px-0.5 rounded">{match}</mark>
            {after}
          </span>
        );
      }
    }

    return text;
  };

  // Summary counts - strictly only confirmed through code entry or QR scan
  const totalCount = clinicAppointments.length;
  const arrivedCount = clinicAppointments.filter(a => a.arrivalStatus === 'scanned').length;
  const paidCount = clinicAppointments.filter(a => a.paymentStatus === 'paid').length;
  const unpaidCount = clinicAppointments.filter(a => a.paymentStatus === 'unpaid').length;

  // Helper to extract appointment from any scanned QR text or token
  const parseAppointmentFromScan = (rawText: string): {
    match: Appointment | undefined;
    isCrossClinic: boolean;
    targetClinicId?: string;
    targetClinicName?: string;
  } => {
    const clean = rawText.trim();
    if (!clean) return { match: undefined, isCrossClinic: false };

    // 1. Check if standard format MYDEHRIDOC:token:clinicId:doctorId... or CLINIKARO...
    let extractedToken: string | null = null;
    let extractedClinicId: string | null = null;

    if (clean.toUpperCase().startsWith('MYDEHRIDOC:') || clean.toUpperCase().startsWith('CLINIKARO:')) {
      const parts = clean.split(':');
      for (const p of parts) {
        if (/^\d{4}$/.test(p)) {
          extractedToken = p;
          break;
        }
      }
      if (parts.length >= 3) extractedClinicId = parts[2];
    } else if (clean.toLowerCase().startsWith('upi://')) {
      // Scanned a UPI QR Code with appointment note or token
      const tokenMatch = clean.match(/(?:token|opd|otp)[-_:]*(\d{4})\b/i);
      if (tokenMatch) {
        extractedToken = tokenMatch[1];
      }
    } else {
      // Check 4-digit token match e.g. "8941" or "OTP 8941"
      const tokenMatch = clean.match(/(?:OTP|MDD|#)?[:\s-]*(\d{4})\b/i);
      if (tokenMatch) {
        extractedToken = tokenMatch[1];
      }
    }

    // Fallback: Check if string contains any 4-digit token
    if (!extractedToken) {
      const anyFourDigits = clean.match(/\b\d{4}\b/);
      if (anyFourDigits) {
        extractedToken = anyFourDigits[0];
      }
    }

    const cleanLower = clean.toLowerCase();

    // Search helper for a list of appointments
    const finder = (list: Appointment[]) => {
      return list.find(a => {
        // Direct ID match
        if (a.id.toLowerCase() === cleanLower) return true;
        
        // Exact 4-digit appointmentNumber / OTP match
        if (extractedToken && a.appointmentNumber === extractedToken) return true;
        if (/^\d{4}$/.test(clean) && a.appointmentNumber === clean) return true;

        // QR code data exact or includes match
        if (a.qrCodeData && (a.qrCodeData.toLowerCase() === cleanLower || a.qrCodeData.includes(clean) || clean.includes(a.qrCodeData))) return true;

        return false;
      });
    };

    // First search in active clinic's appointments
    const localMatch = finder(clinicAppointments);
    if (localMatch) {
      return { match: localMatch, isCrossClinic: false };
    }

    // If not found in current clinic, search across all clinics
    const globalMatch = finder(appointments);
    if (globalMatch) {
      const otherClinic = clinics.find(c => c.id === globalMatch.clinicId);
      return { 
        match: globalMatch, 
        isCrossClinic: true, 
        targetClinicId: globalMatch.clinicId,
        targetClinicName: otherClinic?.name || globalMatch.clinicName || 'Other Clinic'
      };
    }

    return { match: undefined, isCrossClinic: false };
  };

  // Handle QR code / token scan logic
  const handleProcessScan = async (scannedText: string) => {
    const clean = scannedText.trim();
    if (!clean) return;

    setScannerInput(clean);

    const { match, isCrossClinic, targetClinicId, targetClinicName } = parseAppointmentFromScan(clean);

    if (!match) {
      setScanResult({
        status: 'invalid',
        message: lang === 'hi' 
          ? `अमान्य क्यूआर कोड या 4-अंकों का OTP (${clean.slice(0, 32)})! यह पर्ची रिकॉर्ड में नहीं मिली।` 
          : `Invalid QR code or 4-digit OTP (${clean.slice(0, 32)})! Not found in appointments.`
      });
      return;
    }

    if (isCrossClinic) {
      setScanResult({
        status: 'invalid',
        appointment: match,
        isCrossClinic: true,
        targetClinicId,
        targetClinicName,
        message: lang === 'hi'
          ? `यह टोकन (${match.patientName}) "${targetClinicName}" के लिए बुक है, वर्तमान क्लिनिक के लिए नहीं।`
          : `This token for ${match.patientName} is registered for "${targetClinicName}", not current clinic.`
      });
      return;
    }

    if (match.arrivalStatus === 'scanned') {
      setScanResult({
        status: 'already_scanned',
        appointment: match,
        message: lang === 'hi'
          ? `यह पर्ची पहले ही सत्यापित हो चुकी है (${match.scannedAt || 'Earlier Today'})`
          : `This patient slip has already been verified earlier (${match.scannedAt || 'Today'}).`
      });
      return;
    }

    // Success - mark verified/scanned and update in Firestore!
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await onUpdateAppointment(match.id, {
      arrivalStatus: 'scanned',
      scannedAt: nowTime,
      status: 'confirmed'
    });

    setScanResult({
      status: 'success',
      appointment: { ...match, arrivalStatus: 'scanned', scannedAt: nowTime },
      message: lang === 'hi' 
        ? `सत्यापन सफल! मरीज ${match.patientName} की उपस्थिति दर्ज हो गई।` 
        : `Verified! Patient ${match.patientName} arrival confirmed.`
    });
  };

  // Dedicated Arrival Verification: verify by entered 4-digit OTP
  const handleVerifyAppointmentCode = async (apt: Appointment, inputCode: string) => {
    setVerifyError(null);
    setVerifySuccess(null);

    const cleanInput = inputCode.trim();
    if (!cleanInput) {
      setVerifyError(
        lang === 'hi'
          ? 'कृपया मरीज से पूछकर 4-अंकों का टोकन OTP दर्ज करें'
          : 'Please enter the 4-digit Token OTP provided by patient'
      );
      return;
    }

    if (!/^\d{4}$/.test(cleanInput)) {
      setVerifyError(
        lang === 'hi'
          ? 'OTP केवल 4 अंकों का होना चाहिए (उदा. 8941)'
          : 'OTP must be exactly 4 numeric digits (e.g. 8941)'
      );
      return;
    }

    const aptToken = (apt.appointmentNumber || '').trim();
    const isMatch = cleanInput === aptToken;

    if (!isMatch) {
      setVerifyError(
        lang === 'hi'
          ? `गलत OTP! दर्ज किया गया 4-अंकों का OTP "${cleanInput}" इस मरीज के रिकॉर्ड से मेल नहीं खाता। कृपया मरीज की पर्ची या SMS देखें।`
          : `Incorrect OTP! Entered 4-digit OTP "${cleanInput}" does not match this patient record. Please check patient slip or SMS.`
      );
      return;
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await onUpdateAppointment(apt.id, {
      arrivalStatus: 'scanned',
      scannedAt: nowTime,
      status: 'confirmed'
    });

    setVerifySuccess(
      lang === 'hi'
        ? `सत्यापन सफल! मरीज ${apt.patientName} की उपस्थिति सत्यापित हो गई।`
        : `Verified Successfully! Patient ${apt.patientName} confirmed as Arrived.`
    );

    setTimeout(() => {
      setVerifyModalApt(null);
      setVerifyCodeInput('');
      setVerifyError(null);
      setVerifySuccess(null);
      setIsCameraActive(false);
    }, 1200);
  };

  // Dedicated Arrival Verification: verify by QR code scan
  const handleScanQRCodeForApt = async (apt: Appointment) => {
    setVerifyError(null);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await onUpdateAppointment(apt.id, {
      arrivalStatus: 'scanned',
      scannedAt: nowTime,
      status: 'confirmed'
    });

    setVerifySuccess(
      lang === 'hi'
        ? `क्यूआर कोड स्कैन सफल! मरीज ${apt.patientName} उपस्थित दर्ज हो गए।`
        : `QR Code Verified! Patient ${apt.patientName} marked as Arrived.`
    );

    setTimeout(() => {
      setVerifyModalApt(null);
      setVerifyCodeInput('');
      setVerifyError(null);
      setVerifySuccess(null);
      setIsCameraActive(false);
    }, 1200);
  };

  // Reset verification to not arrived (in case of accidental entry)
  const handleResetVerification = async (apt: Appointment) => {
    await onUpdateAppointment(apt.id, {
      arrivalStatus: 'not_arrived',
      scannedAt: null
    });
    setVerifyModalApt(null);
    setVerifyCodeInput('');
    setVerifyError(null);
    setVerifySuccess(null);
    setIsCameraActive(false);
  };

  // Handle Walk-in Submission
  const handleSaveWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalkInError('');

    if (!walkInName.trim()) {
      setWalkInError(lang === 'hi' ? 'कृपया मरीज का नाम दर्ज करें' : 'Please enter patient name');
      return;
    }
    const ageNum = parseInt(walkInAge, 10);
    if (isNaN(ageNum) || ageNum <= 0) {
      setWalkInError(lang === 'hi' ? 'कृपया मान्य उम्र दर्ज करें' : 'Please enter valid age');
      return;
    }

    const docObj = clinicDoctors.find(d => d.id === walkInDoctorId) || clinicDoctors[0];
    if (!docObj) {
      setWalkInError('Please select a doctor');
      return;
    }

    setIsSavingWalkIn(true);
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

    const newApt: Appointment = {
      id: `mdd-apt-${Date.now()}`,
      appointmentNumber: tokenNum,
      clinicId: currentClinic.id,
      clinicName: currentClinic.name,
      doctorId: docObj.id,
      doctorName: docObj.name,
      doctorSpecialty: docObj.specialty,
      doctorQualification: docObj.qualification,
      patientName: walkInName.trim(),
      patientAge: ageNum,
      patientGender: walkInGender,
      patientPhone: walkInPhone.trim() || '9800000000',
      date: todayStr,
      timeSlot: walkInSlot,
      fee: docObj.fee,
      paymentType: 'clinic_cash_upi',
      paymentStatus: walkInPaid ? 'paid' : 'unpaid',
      arrivalStatus: 'not_arrived', // Must be verified by entering token code or scanning QR code!
      scannedAt: null,
      bookingSource: 'reception_walk_in',
      status: 'confirmed',
      qrCodeData: `MYDEHRIDOC:${tokenNum}:${currentClinic.id}:${docObj.id}:${todayStr}:${walkInSlot}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    await onAddAppointment(newApt);
    setIsSavingWalkIn(false);
    setShowWalkInModal(false);
    // Reset fields
    setWalkInName('');
    setWalkInAge('');
    setWalkInPhone('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Clinic Selector & Quick Mode Header */}
      <div className="bg-white rounded-2xl border border-teal-900/15 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F5257] to-[#0A3A3D] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-teal-100 text-teal-900 font-bold px-1.5 py-0.5 rounded">
                RECEPTION DESK
              </span>
              <span className="text-xs text-gray-400 font-mono-num">
                {new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="font-fraunces text-lg sm:text-2xl font-bold text-[#0F5257]">
              {currentClinic?.name}
            </h1>
          </div>
        </div>

        {/* Clinic Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium hidden md:inline">
            {lang === 'hi' ? 'क्लिनिक बदलें:' : 'Switch Clinic:'}
          </label>
          <select
            value={selectedClinicId}
            onChange={(e) => onSelectClinicId(e.target.value)}
            className="text-xs sm:text-sm font-semibold text-teal-950 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-700 cursor-pointer shadow-2xs"
            id="reception-clinic-switcher"
          >
            {clinics.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor Special Gmail Banner */}
      {currentUser?.role === 'doctor' && (
        <div className="bg-gradient-to-r from-teal-900 to-[#0F5257] text-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-teal-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-teal-950 flex items-center justify-center font-bold shrink-0">
              <Stethoscope className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-fraunces font-bold text-base text-amber-200">
                  {currentUser.displayName}
                </h2>
                <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {lang === 'hi' ? 'विशेष जीमेल अधिकृत' : 'Special Gmail Verified'}
                </span>
              </div>
              <p className="text-xs text-teal-200">
                {currentUser.clinicName || currentClinic.name} • {currentUser.email}
              </p>
            </div>
          </div>
          <div className="text-xs text-amber-200 bg-teal-800/80 px-3 py-1.5 rounded-xl border border-teal-700/60 font-medium">
            {lang === 'hi' ? 'आज का ओपीडी परामर्श नियंत्रण' : 'Live OPD OPD Queue Console'}
          </div>
        </div>
      )}

      {/* 4 Large Touch Friendly Quick Stat Chips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Appointments */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">{t.totalToday}</span>
            <span className="font-fraunces text-2xl font-bold text-[#0F5257] font-mono-num">
              {totalCount}
            </span>
          </div>
        </div>

        {/* Arrived / Scanned */}
        <div 
          onClick={() => setFilterArrival(filterArrival === 'arrived' ? 'all' : 'arrived')}
          className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3.5 cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">{t.arrivedCount}</span>
            <span className="font-fraunces text-2xl font-bold text-emerald-700 font-mono-num">
              {arrivedCount}
            </span>
          </div>
        </div>

        {/* Fee Paid */}
        <div 
          onClick={() => setFilterPayment(filterPayment === 'paid' ? 'all' : 'paid')}
          className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3.5 cursor-pointer hover:border-teal-300 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">{t.paidCount}</span>
            <span className="font-fraunces text-2xl font-bold text-teal-800 font-mono-num">
              {paidCount}
            </span>
          </div>
        </div>

        {/* Fee Unpaid (Pay at Desk) */}
        <div 
          onClick={() => setFilterPayment(filterPayment === 'unpaid' ? 'all' : 'unpaid')}
          className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3.5 cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">{t.unpaidCount}</span>
            <span className="font-fraunces text-2xl font-bold text-amber-700 font-mono-num">
              {unpaidCount}
            </span>
          </div>
        </div>
      </div>

      {/* Receptionist Dedicated Search Bar: Quick Patient & Phone Finder */}
      <div className="bg-white rounded-2xl border border-teal-900/15 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[#0F5257] px-2.5 py-1 rounded-md border border-teal-200 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#0F5257]" />
              <span>{lang === 'hi' ? 'मरीज त्वरित खोज' : 'Patient Search Desk'}</span>
            </span>
            {trimmedSearch ? (
              <span className="text-[11px] font-semibold text-teal-900 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-md font-mono-num flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  {filteredAppointments.length} {t.searchResultsFound}
                </span>
              </span>
            ) : (
              <span className="text-[11px] text-gray-500 font-medium hidden md:inline">
                {lang === 'hi' ? 'नाम, मोबाइल नंबर या टोकन संख्या से खोजें' : 'Search by name, 10-digit phone, or token'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {trimmedSearch ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t.clearSearch}</span>
              </button>
            ) : (
              <div className="text-[11px] text-gray-400 hidden sm:flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded font-mono text-[10px] text-gray-600">/</kbd>
                <span>{lang === 'hi' ? 'दबाकर सर्च करें' : 'to search'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Input Bar with High Visibility */}
        <div className="relative flex items-center">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-teal-800 pointer-events-none">
            <Search className="w-5 h-5 text-[#0F5257]" />
          </div>

          <input
            ref={searchInputRef}
            id="reception-patient-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'schedule') {
                setActiveTab('schedule');
              }
            }}
            placeholder={t.searchBarPlaceholder}
            className="w-full pl-11 pr-28 py-3 bg-[#FAF7F2]/60 hover:bg-white focus:bg-white border-2 border-teal-900/20 focus:border-[#0F5257] rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-teal-700/10 transition-all font-medium"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-gray-400 hover:text-gray-700 bg-gray-200/70 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-teal-50 border border-teal-200 rounded-lg text-[10px] font-bold text-[#0F5257]">
              <Phone className="w-3 h-3 text-[#D4A24C]" />
              <span>Name / Mobile / OTP #</span>
            </div>
          </div>
        </div>

        {/* Fast Suggestion Chips for Receptionist */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
          <span className="text-[11px] text-gray-400 font-medium">
            {lang === 'hi' ? 'त्वरित खोज:' : 'Quick search:'}
          </span>
          {clinicAppointments.slice(0, 3).map((apt) => (
            <button
              key={'name-' + apt.id}
              type="button"
              onClick={() => {
                setSearchQuery(apt.patientName.split(' ')[0]);
                setActiveTab('schedule');
              }}
              className="px-2 py-0.5 bg-stone-100 hover:bg-teal-50 text-stone-700 hover:text-teal-900 border border-stone-200 hover:border-teal-300 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
            >
              {apt.patientName.split(' ')[0]}
            </button>
          ))}
          {clinicAppointments.slice(0, 2).map((apt) => (
            <button
              key={'phone-' + apt.id}
              type="button"
              onClick={() => {
                setSearchQuery(apt.patientPhone);
                setActiveTab('schedule');
              }}
              className="px-2 py-0.5 bg-stone-100 hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200 hover:border-amber-300 rounded-md text-[11px] font-mono-num font-medium transition-colors cursor-pointer"
            >
              +{apt.patientPhone}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Subtabs & Large Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center bg-gray-200/70 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-white text-[#0F5257] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.todaysAppointments}
          </button>

          <button
            id="reception-open-qr-scanner-btn"
            onClick={() => setActiveTab('scanner')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'scanner'
                ? 'bg-[#0F5257] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{t.qrScanner}</span>
          </button>

          <button
            onClick={() => setActiveTab('availability')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'availability'
                ? 'bg-white text-[#0F5257] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{t.docAvailability}</span>
          </button>
        </div>

        {/* Prominent "+ Add Walk-in Appointment" button */}
        <button
          id="add-walk-in-btn"
          onClick={() => {
            setShowWalkInModal(true);
            setWalkInDoctorId(clinicDoctors[0]?.id || '');
          }}
          className="bg-[#D4A24C] hover:bg-[#B28333] text-[#14282B] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t.addWalkIn}</span>
        </button>
      </div>

      {/* Main Content Area based on Sub-tab */}

      {/* 1. Schedule & Today's Appointments List */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs space-y-4 p-4 sm:p-5">
          {/* Schedule Filter & Status Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-800">
                {lang === 'hi' ? 'दैनिक ओपीडी मरीज:' : 'Daily OPD Patients:'}
              </span>
              <span className="text-xs font-semibold font-mono-num text-teal-900 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-md">
                {filteredAppointments.length} / {totalCount} {lang === 'hi' ? 'मरीज' : 'patients'}
              </span>

              {trimmedSearch && (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs px-2 py-0.5 rounded-md">
                  <span>{lang === 'hi' ? 'सर्च फ़िल्टर:' : 'Search filter:'} <strong>"{trimmedSearch}"</strong></span>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-stone-400 hover:text-red-700 font-bold ml-1 cursor-pointer"
                    title="Clear filter"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
              <span className="text-gray-400 font-medium">{lang === 'hi' ? 'स्थिति:' : 'Status:'}</span>
              <button
                onClick={() => { setFilterPayment('all'); setFilterArrival('all'); }}
                className={`px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                  filterPayment === 'all' && filterArrival === 'all'
                    ? 'bg-teal-800 text-white border-teal-800 font-semibold'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setFilterArrival(filterArrival === 'not_arrived' ? 'all' : 'not_arrived')}
                className={`px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                  filterArrival === 'not_arrived' 
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' 
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Pending Arrival
              </button>
              <button
                onClick={() => setFilterPayment('unpaid')}
                className={`px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                  filterPayment === 'unpaid' 
                    ? 'bg-red-100 text-red-900 border-red-300 font-bold' 
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Fee Due
              </button>
            </div>
          </div>

          {/* Appointments Table / Cards */}
          {filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase font-semibold text-[10px] tracking-wider bg-gray-50/70">
                    <th className="py-3 px-3">{lang === 'hi' ? 'समय स्लॉट एवं स्थिति' : 'Time Slot & Status'}</th>
                    <th className="py-3 px-3">{t.patientCol}</th>
                    <th className="py-3 px-3">{t.doctorCol}</th>
                    <th className="py-3 px-3">{t.paymentCol}</th>
                    <th className="py-3 px-3">{t.arrivalCol}</th>
                    <th className="py-3 px-3 text-right">{t.actionCol}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAppointments.map((apt) => (
                    <tr 
                      key={apt.id} 
                      className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedAptForDetail(apt)}
                    >
                      {/* Time Slot & Status (Secret 4-digit OTP is patient-confidential) */}
                      <td className="py-3 px-3">
                        <div className="font-mono-num font-bold text-teal-950 text-xs">
                          {apt.timeSlot}
                        </div>
                        <div className="mt-1">
                          {apt.arrivalStatus === 'scanned' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{lang === 'hi' ? '✓ उपस्थित' : '✓ Arrived'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 text-[10px] font-medium px-2 py-0.5 rounded border border-amber-200/80">
                              <KeyRound className="w-2.5 h-2.5 text-amber-700" />
                              <span>{lang === 'hi' ? '🔒 4-अंक OTP भरें' : '🔒 4-digit OTP'}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Patient Details */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-900 text-sm">
                          {highlightMatch(apt.patientName, searchQuery)}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono-num flex items-center gap-1.5 mt-0.5">
                          <span>{apt.patientAge}y • {apt.patientGender}</span>
                          <span>•</span>
                          <span className="font-semibold text-teal-900">
                            +91 {highlightMatch(apt.patientPhone, searchQuery)}
                          </span>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-900">{highlightMatch(apt.doctorName, searchQuery)}</div>
                        <div className="text-[11px] text-[#D4A24C] font-medium">{apt.doctorSpecialty}</div>
                      </td>

                      {/* Payment Status Toggle / Settle Due */}
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        {apt.paymentStatus === 'paid' ? (
                          <button
                            onClick={() => onUpdateAppointment(apt.id, { paymentStatus: 'unpaid' })}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold border bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                            title={lang === 'hi' ? 'भुगतान सत्यापित (PAID)। अनपेड करने के लिए क्लिक करें।' : 'Fee Paid. Click to mark unpaid.'}
                          >
                            <span>₹ PAID</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setDuePaymentApt(apt)}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold border bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-xs transition-colors cursor-pointer flex items-center gap-1 animate-pulse"
                            title={lang === 'hi' ? 'बकाया शुल्क: Razorpay अथवा Cash विकल्प चुनें' : 'Due Fee: Select Razorpay or Cash'}
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>{`DUE ₹${apt.fee}`}</span>
                          </button>
                        )}
                      </td>

                      {/* Arrival / QR Status - OK ONLY when code is entered or QR is scanned */}
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        {apt.arrivalStatus === 'scanned' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setVerifyModalApt(apt);
                              setVerifyCodeInput('');
                              setVerifyError(null);
                              setVerifySuccess(null);
                              setIsCameraActive(false);
                            }}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200 shadow-2xs"
                            title={lang === 'hi' ? 'कोड / QR द्वारा सत्यापित। विवरण देखने या रीसेट करने के लिए क्लिक करें।' : 'Verified via QR / Code. Click to view verification details or reset.'}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>✓ ARRIVED</span>
                            {apt.scannedAt && (
                              <span className="text-[10px] text-emerald-700 font-mono-num font-normal">
                                ({apt.scannedAt})
                              </span>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            id={`verify-arrival-btn-${apt.appointmentNumber}`}
                            onClick={() => {
                              setVerifyModalApt(apt);
                              setVerifyCodeInput('');
                              setVerifyError(null);
                              setVerifySuccess(null);
                              setIsCameraActive(false);
                            }}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 hover:border-amber-400 shadow-2xs group"
                            title={lang === 'hi' ? 'मरीज उपस्थिति दर्ज करने के लिए कोड दर्ज करें या QR स्कैन करें' : 'Arrival pending. Click to enter code or scan QR.'}
                          >
                            <QrCode className="w-3.5 h-3.5 text-amber-700 group-hover:scale-110 transition-transform shrink-0" />
                            <span>{lang === 'hi' ? 'OTP / QR सत्यापन' : 'Enter OTP / Scan QR'}</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedAptForDetail(apt)}
                            className="p-1.5 text-gray-500 hover:text-teal-800 rounded-lg hover:bg-gray-100"
                            title="View Slip / Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAptForDetail(apt);
                              setTimeout(() => window.print(), 100);
                            }}
                            className="p-1.5 text-gray-500 hover:text-teal-800 rounded-lg hover:bg-gray-100"
                            title="Print Prescription Slip"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 px-4 space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FAF7F2] border border-[#E6E0D4] flex items-center justify-center text-[#0F5257]">
                {trimmedSearch ? (
                  <UserX className="w-7 h-7 text-amber-700" />
                ) : (
                  <Calendar className="w-7 h-7 text-teal-700 opacity-60" />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-800">
                  {trimmedSearch
                    ? `${t.noSearchMatches} "${trimmedSearch}"`
                    : (lang === 'hi'
                        ? 'कोई अपॉइंटमेंट उपलब्ध नहीं है'
                        : 'No appointments match your filters')}
                </h3>
                <p className="text-xs text-gray-500">
                  {trimmedSearch
                    ? (lang === 'hi'
                        ? 'कृपया मरीज का नाम या 10 अंकों का मोबाइल नंबर जांचें, अथवा सीधे काउंटर से नया वॉक-इन मरीज जोड़ें।'
                        : 'Check patient name spelling or 10-digit phone number, or register them directly as a walk-in.')
                    : (lang === 'hi'
                        ? 'इस क्लिनिक में वर्तमान फ़िल्टर के अनुसार कोई मरीज दर्ज नहीं है।'
                        : 'No patient appointments currently registered for this filter in this clinic.')}
                </p>
              </div>

              {trimmedSearch && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    {t.clearSearch}
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenWalkInWithSearch}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-teal-950 bg-[#D4A24C] hover:bg-[#B28333] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t.registerWalkInFromSearch}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. QR Scanner & Token Verification Screen */}
      {activeTab === 'scanner' && (
        <div className="bg-white rounded-2xl border border-teal-900/15 p-5 sm:p-7 shadow-xs space-y-6 max-w-2xl mx-auto">
          <div className="text-center space-y-1">
            <h2 className="font-fraunces text-2xl font-bold text-[#0F5257]">
              {t.qrScanner}
            </h2>
            <p className="text-xs text-gray-500">
              {lang === 'hi'
                ? 'मरीज की पर्ची का क्यूआर कोड कैमरा से स्कैन करें या टोकन नंबर दर्ज करें'
                : 'Scan patient digital QR code or enter appointment token number to verify'}
            </p>
          </div>

          {/* Real Working Camera & Image QR Scanner View */}
          <QrScannerView
            lang={lang}
            isActive={activeTab === 'scanner'}
            onScan={handleProcessScan}
          />

          {/* Manual Token Verification Input */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 block">
                {lang === 'hi' ? 'मरीज का 4-अंकों का टोकन OTP दर्ज करें अथवा QR कोड स्कैन करें:' : 'Enter Patient 4-Digit Token OTP or Scan QR code to Verify:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={scannerInput}
                  onChange={(e) => setScannerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleProcessScan(scannerInput);
                    }
                  }}
                  placeholder={lang === 'hi' ? '4-अंकों का OTP (उदा. 8941)' : '4-digit OTP (e.g. 8941)'}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono-num font-bold uppercase focus:outline-none focus:border-teal-700"
                  id="scanner-token-input"
                />
                <button
                  type="button"
                  id="scanner-verify-token-btn"
                  onClick={() => handleProcessScan(scannerInput)}
                  className="bg-[#0F5257] hover:bg-[#0A3A3D] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {lang === 'hi' ? 'सत्यापित करें' : 'Verify'}
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                {lang === 'hi' ? 'मरीज से उनकी पर्ची पर छपा 4-अंकों का कोड पूछें।' : 'Ask patient for the 4-digit code printed on their slip.'}
              </p>
            </div>
          </div>

          {/* Scan Results Display */}
          {scanResult.status && (
            <div className="pt-2 transition-all">
              {scanResult.status === 'success' && scanResult.appointment && (
                <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 text-emerald-950 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-fraunces font-bold text-base text-emerald-900">
                        {t.scanSuccess}
                      </h4>
                      <p className="text-xs text-emerald-800 font-medium">{scanResult.message}</p>
                    </div>
                  </div>

                  {/* Confirmed Patient Card */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs space-y-1 mt-2">
                    <div className="flex justify-between items-center font-bold text-gray-800">
                      <span>{scanResult.appointment.patientName}</span>
                      <span className="font-mono-num font-extrabold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-xs">
                        OTP #{scanResult.appointment.appointmentNumber}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      Slot: {scanResult.appointment.timeSlot} • +91 {scanResult.appointment.patientPhone}
                    </div>
                    <div className="flex justify-between items-center pt-1 text-[11px]">
                      <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
                        ARRIVED & SCANNED
                      </span>
                      <span className="font-bold font-mono-num text-[#0F5257]">
                        {scanResult.appointment.paymentStatus === 'paid' ? 'FEE PAID' : `COLLECT ₹${scanResult.appointment.fee}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {scanResult.status === 'already_scanned' && (
                <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-4 text-amber-950 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                    <div>
                      <h4 className="font-fraunces font-bold text-base text-amber-900">
                        {t.scanAlreadyUsed}
                      </h4>
                      <p className="text-xs text-amber-800">{scanResult.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {scanResult.status === 'invalid' && (
                <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 text-red-950 space-y-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                    <div>
                      <h4 className="font-fraunces font-bold text-base text-red-900">
                        {t.invalidQR}
                      </h4>
                      <p className="text-xs text-red-800">{scanResult.message}</p>
                    </div>
                  </div>

                  {scanResult.isCrossClinic && scanResult.targetClinicId && (
                    <div className="pt-2 border-t border-red-200 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs text-red-900 font-medium">
                        {lang === 'hi' ? 'यह पर्ची दूसरे क्लिनिक की है:' : 'This slip is from another clinic:'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectClinicId(scanResult.targetClinicId!);
                          const aptToScan = scanResult.appointment;
                          setTimeout(() => {
                            if (aptToScan) {
                              handleProcessScan(aptToScan.appointmentNumber);
                            }
                          }, 150);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0F5257] hover:bg-[#0A3A3D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        {lang === 'hi' 
                          ? `"${scanResult.targetClinicName}" पर स्विच करें और सत्यापित करें ➔` 
                          : `Switch to "${scanResult.targetClinicName}" & Verify ➔`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Doctor Availability & Slot Management */}
      {activeTab === 'availability' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-6">
          <div>
            <h2 className="font-fraunces text-xl font-bold text-[#0F5257]">
              {t.docAvailability}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === 'hi' 
                ? 'डॉक्टर की आज की उपस्थिति और समय स्लॉट को रिसेप्शन से तुरंत ऑन/ऑफ करें'
                : 'Toggle daily availability or leave status for clinic doctors'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clinicDoctors.map(doctor => (
              <div
                key={doctor.id}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={doctor.photoUrl}
                      alt={doctor.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                    />
                    <div>
                      <h3 className="font-fraunces font-bold text-sm text-[#0F5257]">
                        {doctor.name}
                      </h3>
                      <p className="text-xs text-[#D4A24C] font-semibold">
                        {doctor.specialty}
                      </p>
                    </div>
                  </div>

                  {/* Availability Toggle */}
                  <button
                    onClick={() => onUpdateDoctor(doctor.id, { availableToday: !doctor.availableToday })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      doctor.availableToday
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                  >
                    {doctor.availableToday 
                      ? (lang === 'hi' ? '✓ आज उपलब्ध' : '✓ AVAILABLE') 
                      : (lang === 'hi' ? '✗ आज अवकाश' : '✗ ON LEAVE')}
                  </button>
                </div>

                <div className="pt-2 border-t border-gray-200 text-xs">
                  <span className="text-gray-500 font-medium block mb-1">
                    {lang === 'hi' ? 'ओपीडी स्लॉट:' : 'Active OPD Slots:'}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {doctor.timeSlots.map(slot => (
                      <span key={slot} className="bg-white px-2 py-0.5 rounded border border-gray-200 text-[11px] font-mono-num font-medium">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Add Walk-in Appointment */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0F5257]" />
                <h3 className="font-fraunces font-bold text-lg text-[#0F5257]">
                  {t.addWalkIn}
                </h3>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              {lang === 'hi'
                ? 'क्लिनिक काउंटर पर मरीज का टोकन बनाएं। उपस्थिति कोड दर्ज करने या QR कोड स्कैन करने पर सत्यापित होगी।'
                : 'Create offline OPD token for patient. Arrival status is confirmed when code is entered or QR is scanned.'}
            </p>

            {walkInError && (
              <div className="bg-red-50 text-red-800 text-xs p-3 rounded-xl border border-red-200">
                {walkInError}
              </div>
            )}

            <form onSubmit={handleSaveWalkIn} className="space-y-3.5">
              {/* Select Doctor */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 block">
                  Select Doctor <span className="text-red-500">*</span>
                </label>
                <select
                  value={walkInDoctorId}
                  onChange={(e) => setWalkInDoctorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:border-teal-700"
                >
                  {clinicDoctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.specialty} (₹{doc.fee})
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 block">
                  Patient Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-teal-700"
                />
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">Age</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={walkInAge}
                    onChange={(e) => setWalkInAge(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono-num focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">Gender</label>
                  <select
                    value={walkInGender}
                    onChange={(e) => setWalkInGender(e.target.value as 'male' | 'female' | 'other')}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:border-teal-700"
                  >
                    <option value="male">Male (पुरुष)</option>
                    <option value="female">Female (महिला)</option>
                    <option value="other">Other (अन्य)</option>
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 block">
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9835012345"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono-num focus:outline-none focus:border-teal-700"
                />
              </div>

              {/* Time Slot Picker */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 block">Select Slot</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(clinicDoctors.find(d => d.id === walkInDoctorId)?.timeSlots || ['10:30 AM', '11:00 AM', '11:30 AM']).map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setWalkInSlot(slot)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono-num font-semibold border ${
                        walkInSlot === slot ? 'bg-[#0F5257] text-white border-[#0F5257]' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                <span className="font-semibold text-gray-800">Doctor Fee Payment:</span>
                <button
                  type="button"
                  onClick={() => setWalkInPaid(!walkInPaid)}
                  className={`px-3 py-1 rounded-lg font-bold border transition-colors ${
                    walkInPaid ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {walkInPaid ? 'PAID AT COUNTER' : 'UNPAID (COLLECT LATER)'}
                </button>
              </div>

              {/* Submit */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingWalkIn}
                  className="px-5 py-2 rounded-xl bg-[#0F5257] hover:bg-[#0A3A3D] text-white text-xs font-bold shadow transition-all"
                >
                  {isSavingWalkIn ? 'Saving...' : 'Save & Print Slip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Appointment Detail & Edit View */}
      {selectedAptForDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  APPOINTMENT DETAILS
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-stone-500 font-medium">Arrival Status:</span>
                  {selectedAptForDetail.arrivalStatus === 'scanned' ? (
                    <span className="font-mono-num font-bold text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      ✓ Arrived ({selectedAptForDetail.scannedAt || 'Today'})
                    </span>
                  ) : (
                    <span className="font-mono-num font-bold text-xs text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-300">
                      🔒 4-Digit OTP Required from Patient
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedAptForDetail(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Patient:</span>
                <span className="font-bold text-gray-900">{selectedAptForDetail.patientName} ({selectedAptForDetail.patientAge}y, {selectedAptForDetail.patientGender})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Phone:</span>
                <span className="font-mono-num font-semibold text-gray-900">+91 {selectedAptForDetail.patientPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Doctor:</span>
                <span className="font-semibold text-gray-900">{selectedAptForDetail.doctorName} ({selectedAptForDetail.doctorSpecialty})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Slot & Date:</span>
                <span className="font-mono-num font-bold text-teal-800">{selectedAptForDetail.date} | {selectedAptForDetail.timeSlot}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Fee & Status:</span>
                <span className="font-mono-num font-bold">
                  ₹{selectedAptForDetail.fee} ({selectedAptForDetail.paymentStatus.toUpperCase()})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Arrival / QR:</span>
                <span className="font-bold text-purple-900 uppercase">{selectedAptForDetail.arrivalStatus}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 space-y-2">
              {selectedAptForDetail.arrivalStatus !== 'scanned' && (
                <button
                  type="button"
                  onClick={() => {
                    const apt = selectedAptForDetail;
                    setSelectedAptForDetail(null);
                    setVerifyModalApt(apt);
                    setVerifyCodeInput('');
                    setVerifyError(null);
                    setVerifySuccess(null);
                    setIsCameraActive(false);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <KeyRound className="w-4 h-4 text-amber-300" />
                  <span>{lang === 'hi' ? '4-अंकों का OTP दर्ज करें / QR सत्यापन' : 'Enter 4-Digit OTP / Verify Arrival'}</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                {selectedAptForDetail.paymentStatus === 'paid' ? (
                  <button
                    onClick={() => {
                      const newStatus = 'unpaid';
                      onUpdateAppointment(selectedAptForDetail.id, { paymentStatus: newStatus });
                      setSelectedAptForDetail({ ...selectedAptForDetail, paymentStatus: newStatus });
                    }}
                    className="py-2.5 px-3 rounded-xl border border-red-300 bg-red-50 text-red-800 text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Mark as Unpaid
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const apt = selectedAptForDetail;
                      setDuePaymentApt(apt);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer animate-pulse"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? `DUE ₹${selectedAptForDetail.fee} भुगतान करें` : `Collect DUE ₹${selectedAptForDetail.fee}`}</span>
                  </button>
                )}

                <button
                  onClick={() => window.print()}
                  className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>

              <button
                onClick={() => {
                  if (confirm('Cancel this appointment?')) {
                    onUpdateAppointment(selectedAptForDetail.id, { status: 'cancelled' });
                    setSelectedAptForDetail(null);
                  }
                }}
                className="w-full py-2 px-3 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold border border-red-200"
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Dedicated Patient Arrival & QR Verification Modal */}
      {verifyModalApt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-teal-900/20 space-y-4 max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5 text-[#0F5257]" />
                </div>
                <div>
                  <h3 className="font-fraunces font-bold text-base text-[#0F5257]">
                    {lang === 'hi' ? 'मरीज उपस्थिति सत्यापन' : 'Verify Patient Arrival'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {lang === 'hi' ? 'टोकन कोड दर्ज करें अथवा क्यूआर स्कैन करें' : 'Enter token code or scan digital QR code'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setVerifyModalApt(null);
                  setVerifyCodeInput('');
                  setVerifyError(null);
                  setVerifySuccess(null);
                  setIsCameraActive(false);
                }}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient Context Card */}
            <div className="bg-gradient-to-br from-teal-50/70 to-stone-50 p-3.5 rounded-2xl border border-teal-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-teal-900 font-semibold font-mono-num bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                    Slot: {verifyModalApt.timeSlot}
                  </span>
                  <span className="text-xs text-stone-600 bg-stone-100 px-2 py-1 rounded-lg border border-stone-200 font-mono-num font-semibold">
                    🔒 OTP: ••••
                  </span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  verifyModalApt.arrivalStatus === 'scanned'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {verifyModalApt.arrivalStatus === 'scanned'
                    ? (lang === 'hi' ? '✓ सत्यापित (ARRIVED)' : '✓ ARRIVED')
                    : (lang === 'hi' ? 'सत्यापन प्रतीक्षारत' : 'Pending Verification')}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  {verifyModalApt.patientName}
                </h4>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {verifyModalApt.patientAge}y • {verifyModalApt.patientGender} • +91 {verifyModalApt.patientPhone}
                  </span>
                  <span className="font-bold font-mono-num text-[#0F5257]">
                    ₹{verifyModalApt.fee} {verifyModalApt.paymentStatus === 'paid' ? 'PAID' : 'DUE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {verifySuccess && (
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-3 text-emerald-950 flex items-center gap-2.5 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{verifySuccess}</span>
              </div>
            )}

            {verifyError && (
              <div className="bg-red-50 border border-red-300 rounded-2xl p-3 text-red-900 flex items-center gap-2 text-xs">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span className="font-medium">{verifyError}</span>
              </div>
            )}

            {/* If Already Verified, show status & reset option */}
            {verifyModalApt.arrivalStatus === 'scanned' ? (
              <div className="space-y-3 pt-1">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-900 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'hi' ? 'मरीज उपस्थिति सत्यापित है' : 'Patient Arrival Verified'}</span>
                  </div>
                  <p className="text-xs text-emerald-700 font-mono-num">
                    {lang === 'hi' ? 'सत्यापन समय:' : 'Verified at:'} {verifyModalApt.scannedAt || 'Today'}
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleResetVerification(verifyModalApt)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {lang === 'hi' ? 'उपस्थिति रीसेट करें (Not Arrived)' : 'Reset to Not Arrived'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyModalApt(null);
                      setVerifyCodeInput('');
                      setVerifyError(null);
                      setVerifySuccess(null);
                      setIsCameraActive(false);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    {lang === 'hi' ? 'बंद करें' : 'Done'}
                  </button>
                </div>
              </div>
            ) : (
              /* NOT YET VERIFIED: Must enter code or scan QR */
              <div className="space-y-4 pt-1">
                {/* Method 1: Enter Token OTP Code */}
                <div className="space-y-2 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-teal-800" />
                    <label className="text-xs font-bold text-stone-800 block">
                      {lang === 'hi' ? 'विकल्प 1: 4-अंकों का टोकन OTP दर्ज करें' : 'Option 1: Enter 4-digit Token OTP'}
                    </label>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {lang === 'hi'
                      ? 'मरीज से उनकी पर्ची या SMS में प्राप्त 4-अंकों का OTP पूछें और यहाँ भरें:'
                      : 'Ask patient for the 4-digit Token OTP code from their slip or SMS and enter below:'}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={verifyCodeInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setVerifyCodeInput(val);
                        setVerifyError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                           e.preventDefault();
                           handleVerifyAppointmentCode(verifyModalApt, verifyCodeInput);
                        }
                      }}
                      placeholder="• • • •"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-base font-mono-num tracking-[0.3em] font-extrabold text-center focus:outline-none focus:border-teal-700 bg-white shadow-inner"
                      id="patient-verify-code-input"
                      autoFocus
                    />
                    <button
                      type="button"
                      id="patient-confirm-verify-btn"
                      onClick={() => handleVerifyAppointmentCode(verifyModalApt, verifyCodeInput)}
                      className="bg-[#0F5257] hover:bg-[#0A3A3D] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'सत्यापित करें' : 'Verify'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500 pt-0.5">
                    {lang === 'hi'
                      ? '🔒 सत्यापन सुरक्षा हेतु OTP रिसेप्शनिस्ट को दिखाई नहीं देगा, मरीज द्वारा बताने पर ही भरें।'
                      : '🔒 For verification security, OTP is hidden and must be entered as provided by patient.'}
                  </p>
                </div>

                {/* Method 2: Scan QR Code */}
                <div className="space-y-2 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-teal-800" />
                      <label className="text-xs font-bold text-stone-800 block">
                        {lang === 'hi' ? 'विकल्प 2: पर्ची का QR कोड स्कैन करें' : 'Option 2: Scan Slip QR Code'}
                      </label>
                    </div>
                    {isCameraActive && (
                      <button
                        type="button"
                        onClick={() => setIsCameraActive(false)}
                        className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 underline cursor-pointer"
                      >
                        {lang === 'hi' ? 'कैमरा बंद करें' : 'Close Camera'}
                      </button>
                    )}
                  </div>
                  
                  {isCameraActive ? (
                    <div className="space-y-2 pt-1">
                      <QrScannerView
                        lang={lang}
                        compact={true}
                        isActive={isCameraActive}
                        onScan={(rawCode) => {
                          const { match } = parseAppointmentFromScan(rawCode);
                          if (match) {
                            if (match.id === verifyModalApt.id || match.appointmentNumber === verifyModalApt.appointmentNumber) {
                              handleScanQRCodeForApt(match);
                            } else {
                              setVerifyError(
                                lang === 'hi'
                                  ? `यह क्यूआर कोड दूसरे मरीज (${match.patientName}) का है, ${verifyModalApt.patientName} का नहीं!`
                                  : `This QR code belongs to ${match.patientName}, not ${verifyModalApt.patientName}!`
                              );
                            }
                          } else {
                            setVerifyError(
                              lang === 'hi'
                                ? `स्कैन किया गया क्यूआर अमान्य है। कृपया मरीज की पर्ची का QR कोड दिखाएं।`
                                : `Scanned QR code is invalid. Please align patient slip QR code.`
                            );
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      id="modal-open-camera-qr-btn"
                      onClick={() => setIsCameraActive(true)}
                      className="w-full py-2.5 px-3 rounded-xl border border-teal-700/40 bg-teal-50 hover:bg-teal-100 text-[#0F5257] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <Camera className="w-4 h-4 text-teal-800" />
                      <span>{lang === 'hi' ? 'कैमरा QR स्कैनर खोलें' : 'Open Camera QR Scanner'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Due Payment Modal: Razorpay & Cash with mandatory OTP / QR Scan */}
      {duePaymentApt && (
        <DuePaymentModal
          isOpen={Boolean(duePaymentApt)}
          onClose={() => setDuePaymentApt(null)}
          appointment={duePaymentApt}
          doctor={doctors.find(d => d.id === duePaymentApt.doctorId)}
          clinic={clinics.find(c => c.id === duePaymentApt.clinicId) || currentClinic}
          lang={lang}
          onPaymentSuccess={async (updates) => {
            await onUpdateAppointment(duePaymentApt.id, updates);
            if (selectedAptForDetail && selectedAptForDetail.id === duePaymentApt.id) {
              setSelectedAptForDetail({
                ...selectedAptForDetail,
                ...updates
              });
            }
            setDuePaymentApt(null);
          }}
        />
      )}
    </div>
  );
};

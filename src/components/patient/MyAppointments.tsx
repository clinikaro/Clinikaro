import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  CalendarCheck, 
  Clock, 
  MapPin, 
  Phone, 
  Stethoscope, 
  Search, 
  X, 
  Share2, 
  Printer, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  ArrowLeft, 
  Calendar, 
  User, 
  ShieldCheck, 
  XCircle, 
  ExternalLink,
  ChevronRight,
  Ticket,
  Copy,
  Check,
  RefreshCw,
  Users,
  Activity,
  Navigation,
  CreditCard
} from 'lucide-react';
import { Appointment, Clinic, Doctor, Language, AppUser } from '../../types';
import { translations } from '../../data/translations';
import { GoogleMapLinkButton } from '../common/GoogleMapLinkButton';
import { getGoogleMapsDirectionsUrl } from '../../utils/mapUtils';
import { DuePaymentModal } from '../common/DuePaymentModal';

interface MyAppointmentsProps {
  appointments: Appointment[];
  clinics: Clinic[];
  doctors: Doctor[];
  lang: Language;
  currentUser?: AppUser | null;
  onBack: () => void;
  onSelectDoctor: (doctor: Doctor) => void;
  onCancelAppointment: (appointmentId: string) => Promise<void>;
  onBookNew: () => void;
  onUpdateAppointment?: (id: string, updates: Partial<Appointment>) => Promise<void>;
}

export const MyAppointments: React.FC<MyAppointmentsProps> = ({
  appointments,
  clinics,
  doctors,
  lang,
  currentUser,
  onBack,
  onSelectDoctor,
  onCancelAppointment,
  onBookNew,
  onUpdateAppointment
}) => {
  const t = translations[lang];

  // Search by Phone or Token ID
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  
  // Due payment settlement modal state
  const [duePaymentApt, setDuePaymentApt] = useState<Appointment | null>(null);
  
  // Selected appointment for digital token slip modal
  const [selectedAptForSlip, setSelectedAptForSlip] = useState<Appointment | null>(null);
  const [modalQrUrl, setModalQrUrl] = useState<string>('');
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);

  // Scoped booked tokens for current user account or guest session (read dynamically)
  const scopedTokenKey = currentUser ? `mdd_user_tokens_${currentUser.uid}` : 'mdd_guest_tokens';
  const getScopedTokenIds = (): string[] => {
    try {
      const saved = localStorage.getItem(scopedTokenKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };
  const scopedTokenIds = getScopedTokenIds();
  const guestPhone = typeof window !== 'undefined' ? (sessionStorage.getItem('curayu_guest_phone') || '') : '';

  // Generate QR when modal opens
  useEffect(() => {
    if (selectedAptForSlip) {
      const payload = selectedAptForSlip.qrCodeData || 
        `MYDEHRIDOC:${selectedAptForSlip.appointmentNumber}:${selectedAptForSlip.clinicId}:${selectedAptForSlip.doctorId}:${selectedAptForSlip.date}`;
      QRCode.toDataURL(payload, {
        width: 240,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
        .then(url => setModalQrUrl(url))
        .catch(err => console.error('Error generating QR:', err));
    } else {
      setModalQrUrl('');
    }
  }, [selectedAptForSlip]);

  // Clean user phone & email for exact account matching
  const userPhoneClean = currentUser?.phoneNumber ? currentUser.phoneNumber.replace(/\D/g, '').slice(-10) : '';
  const userEmailClean = currentUser?.email ? currentUser.email.trim().toLowerCase() : '';

  // Filter appointments strictly for the logged-in account (or guest session)
  const myAppointments = appointments.filter(apt => {
    // 1. If user typed an explicit search query (token or phone or name or doctor)
    const cleanQuery = searchQuery.trim().toLowerCase();
    if (cleanQuery) {
      const matchToken = (apt.appointmentNumber || '').toLowerCase().includes(cleanQuery);
      const matchPhone = (apt.patientPhone || '').replace(/\D/g, '').includes(cleanQuery.replace(/\D/g, ''));
      const matchName = (apt.patientName || '').toLowerCase().includes(cleanQuery);
      const matchDoctor = (apt.doctorName || '').toLowerCase().includes(cleanQuery);
      return matchToken || matchPhone || matchName || matchDoctor;
    }

    // 2. If user is logged in: STRICTLY show appointments booked under THIS user's account
    if (currentUser) {
      // Primary check: Direct User ID match
      if (apt.patientUserId && apt.patientUserId === currentUser.uid) {
        return true;
      }
      // Secondary check: Direct Email match
      if (userEmailClean && apt.patientEmail && apt.patientEmail.trim().toLowerCase() === userEmailClean) {
        return true;
      }
      // Tertiary check: Verified 10-digit phone match
      if (userPhoneClean && apt.patientPhone) {
        const aptPhoneClean = apt.patientPhone.replace(/\D/g, '').slice(-10);
        if (aptPhoneClean === userPhoneClean) {
          return true;
        }
      }
      // Quaternary check: Locally booked while authenticated with this UID
      if (scopedTokenIds.includes(apt.id) || scopedTokenIds.includes(apt.appointmentNumber)) {
        return true;
      }

      return false;
    }

    // 3. If guest (not logged in):
    // Only show tokens booked during this guest session (if any)
    if (scopedTokenIds.length > 0) {
      if (scopedTokenIds.includes(apt.id) || scopedTokenIds.includes(apt.appointmentNumber)) {
        return true;
      }
    }

    // If guest hasn't booked anything, return false (0 appointments)
    return false;
  });

  // CRITICAL FIX: displayList is ONLY myAppointments! NEVER fall back to sample appointments (slice 0,4)!
  const displayList = myAppointments;

  // Filter by status tab
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredAppointments = displayList.filter(apt => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'cancelled') return apt.status === 'cancelled';
    if (statusFilter === 'completed') return apt.status === 'completed';
    if (statusFilter === 'upcoming') {
      return apt.status === 'confirmed' && apt.date >= todayStr;
    }
    return true;
  });

  // Copy token to clipboard
  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedTokenId(token);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  // Handle Cancel Appointment
  const handleCancel = async (apt: Appointment) => {
    const confirmText = lang === 'hi'
      ? `क्या आप सच में टोकन ${apt.appointmentNumber} रद्द करना चाहते हैं?`
      : `Are you sure you want to cancel appointment ${apt.appointmentNumber}?`;
    
    if (window.confirm(confirmText)) {
      setCancellingId(apt.id);
      try {
        await onCancelAppointment(apt.id);
        setCancelSuccessMsg(
          lang === 'hi'
            ? `अपॉइंटमेंट ${apt.appointmentNumber} सफलतापूर्वक रद्द कर दिया गया है।`
            : `Appointment ${apt.appointmentNumber} has been cancelled.`
        );
        setTimeout(() => setCancelSuccessMsg(null), 4000);
      } catch (e) {
        console.error("Cancel error:", e);
      } finally {
        setCancellingId(null);
      }
    }
  };

  // Share slip on WhatsApp
  const handleWhatsAppShare = (apt: Appointment) => {
    const text = encodeURIComponent(
      `*CliniKaro OPD Slip*\n` +
      `Token: ${apt.appointmentNumber}\n` +
      `Patient: ${apt.patientName} (${apt.patientAge}y, ${apt.patientGender})\n` +
      `Doctor: ${apt.doctorName} (${apt.doctorSpecialty})\n` +
      `Clinic: ${apt.clinicName}\n` +
      `Date & Slot: ${apt.date} | ${apt.timeSlot}\n` +
      `Status: ${apt.status.toUpperCase()} (${apt.paymentStatus === 'paid' ? 'Paid' : 'Pay at Clinic Counter ₹' + apt.fee})\n` +
      `Show QR code at clinic reception desk.\n` +
      `All India Helpline: +91 94312 88410`
    );
    window.open(`https://api.whatsapp.com/send?phone=${apt.patientPhone ? '91' + apt.patientPhone : ''}&text=${text}`, '_blank');
  };

  // Helper to calculate live waiting queue position and currently running appointment token
  const getAppointmentQueueInfo = (apt: Appointment) => {
    // Look at all non-cancelled appointments for this doctor on this appointment date
    const doctorDayApts = appointments
      .filter(a => a.doctorId === apt.doctorId && a.date === apt.date && a.status !== 'cancelled')
      .sort((a, b) => {
        if (a.timeSlot !== b.timeSlot) {
          return a.timeSlot.localeCompare(b.timeSlot);
        }
        return (a.createdAt || '').localeCompare(b.createdAt || '');
      });

    // Is there a patient currently inside the doctor cabin?
    const inCabinApt = doctorDayApts.find(a => a.consultationStatus === 'in_cabin');

    // Completed appointments today for this doctor
    const completedApts = doctorDayApts.filter(a => a.status === 'completed' || a.consultationStatus === 'completed');

    // Next patient to be called if none in cabin
    const nextWaitingApt = doctorDayApts.find(a => a.status !== 'completed' && a.consultationStatus !== 'completed');

    let currentRunningToken: string | null = null;
    let isDoctorActivelyServing = false;

    if (inCabinApt) {
      currentRunningToken = inCabinApt.appointmentNumber;
      isDoctorActivelyServing = true;
    } else if (completedApts.length > 0 && nextWaitingApt) {
      currentRunningToken = nextWaitingApt.appointmentNumber;
      isDoctorActivelyServing = true;
    } else if (nextWaitingApt) {
      currentRunningToken = nextWaitingApt.appointmentNumber;
      isDoctorActivelyServing = false;
    }

    const isCompleted = apt.status === 'completed' || apt.consultationStatus === 'completed';
    const isCancelled = apt.status === 'cancelled';
    const isInCabin = apt.consultationStatus === 'in_cabin' || (inCabinApt?.id === apt.id);

    let waitingNumber = 1;
    let patientsAheadCount = 0;
    let estimatedWaitMinutes = 0;

    if (!isCompleted && !isCancelled && !isInCabin) {
      const myIndex = doctorDayApts.findIndex(a => a.id === apt.id);
      if (myIndex >= 0) {
        const aheadApts = doctorDayApts.slice(0, myIndex).filter(a => a.status !== 'completed' && a.consultationStatus !== 'completed');
        patientsAheadCount = aheadApts.length;
      }
      waitingNumber = patientsAheadCount + 1;
      estimatedWaitMinutes = patientsAheadCount * 12; // Average 10-12 mins consultation in India
    }

    return {
      doctorDayApts,
      currentRunningToken,
      isDoctorActivelyServing,
      inCabinApt,
      isCompleted,
      isCancelled,
      isInCabin,
      waitingNumber,
      patientsAheadCount,
      estimatedWaitMinutes,
      totalToday: doctorDayApts.length,
      completedCount: completedApts.length
    };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-20">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5257] hover:text-[#D4A24C] transition-colors cursor-pointer mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'hi' ? 'वापस मुख्य पृष्ठ' : 'Back to Home'}</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F5257]">
              <Ticket className="w-4 h-4" />
            </div>
            <h1 className="font-fraunces text-2xl sm:text-3xl font-bold text-[#0F5257]">
              {lang === 'hi' ? 'मेरे अपॉइंटमेंट एवं डिजिटल पर्चियां' : 'My Appointments & OPD Slips'}
            </h1>
          </div>
          <p className="text-xs text-gray-500">
            {lang === 'hi'
              ? 'अपने सभी बुक किए गए ओपीडी टोकन, क्लिनिक स्थिति, समय एवं डिजिटल पर्ची यहां देखें।'
              : 'View booked OPD tokens, clinic arrival status, timings, and verified digital slips.'}
          </p>
        </div>

        <button
          onClick={onBookNew}
          className="self-start sm:self-auto py-2.5 px-4 rounded-xl bg-[#0F5257] hover:bg-[#0A3A3D] text-white text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{lang === 'hi' ? '+ नया टोकन बुक करें' : '+ Book New Appointment'}</span>
        </button>
      </div>

      {/* Patient Identification Status Card */}
      {currentUser ? (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-teal-950 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-800 text-amber-300 flex items-center justify-center font-bold font-mono-num text-sm shrink-0">
              <User className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#0F5257]">
                  {currentUser.displayName || currentUser.email || 'Patient User'}
                </span>
                <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.2 rounded inline-flex items-center gap-1 border border-emerald-300">
                  <ShieldCheck className="w-3 h-3" />
                  {lang === 'hi' ? 'सत्यापित मरीज' : 'Verified Patient'}
                </span>
              </div>
              <p className="text-gray-600 text-[11px] mt-0.5">
                {currentUser.phoneNumber ? `📱 +91 ${currentUser.phoneNumber.replace('+91', '')}` : currentUser.email}
              </p>
            </div>
          </div>

          <div className="text-right sm:text-right w-full sm:w-auto">
            <span className="text-[11px] text-teal-800 bg-white px-2.5 py-1 rounded-lg border border-teal-200 inline-block font-mono-num font-semibold">
              {myAppointments.length} {lang === 'hi' ? 'अपॉइंटमेंट मिले' : 'Bookings Found'}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold shrink-0">
              <Search className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <p className="font-bold text-sm text-amber-900">
                {lang === 'hi' ? 'मोबाइल नंबर या टोकन से पर्ची खोजें' : 'Retrieve Booking by Mobile or Token'}
              </p>
              <p className="text-amber-800/80 text-[11px] mt-0.5">
                {lang === 'hi'
                  ? 'यदि आपने बिना लॉगिन बुक किया था, तो नीचे अपना 10-अंकों का मोबाइल नंबर या टोकन संख्या (उदा. 1, 2) दर्ज करें।'
                  : 'Enter your 10-digit mobile number or Token # (e.g. 1, 2) below to access your slip.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instant Search / Lookup Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'hi'
                ? 'टोकन संख्या (उदा. 1, 2, 3), मोबाइल नंबर या मरीज के नाम से खोजें...'
                : 'Search by Token # (e.g. 1, 2, 3), mobile number, or patient name...'
            }
            className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-700 font-work"
            id="appointments-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Pills if saved for this specific account / session */}
        {scopedTokenIds.length > 0 && !searchQuery && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2.5 text-[11px] text-gray-500">
            <span>{lang === 'hi' ? 'हाल की पर्ची:' : 'Recent tokens:'}</span>
            {scopedTokenIds.slice(0, 3).map(id => (
              <button
                key={id}
                onClick={() => setSearchQuery(id)}
                className="bg-gray-100 hover:bg-teal-50 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200 font-mono-num cursor-pointer"
              >
                🎫 {id}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Success Notification Banner if cancelled */}
      {cancelSuccessMsg && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3.5 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{cancelSuccessMsg}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: 'all', label: lang === 'hi' ? 'सभी अपॉइंटमेंट' : 'All Appointments', count: displayList.length },
          { id: 'upcoming', label: lang === 'hi' ? 'आगामी व सक्रिय' : 'Upcoming & Active', count: displayList.filter(a => a.status === 'confirmed' && a.date >= todayStr).length },
          { id: 'completed', label: lang === 'hi' ? 'पूर्ण हो चुके' : 'Completed', count: displayList.filter(a => a.status === 'completed').length },
          { id: 'cancelled', label: lang === 'hi' ? 'रद्द' : 'Cancelled', count: displayList.filter(a => a.status === 'cancelled').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`py-2 px-3.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              statusFilter === tab.id
                ? 'bg-[#0F5257] text-white shadow-xs font-semibold'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] font-mono-num px-1.5 py-0.2 rounded-full font-bold ${
              statusFilter === tab.id ? 'bg-amber-400 text-teal-950' : 'bg-gray-100 text-gray-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-[#0F5257] flex items-center justify-center mx-auto border border-teal-100">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-fraunces text-xl font-bold text-[#0F5257]">
              {lang === 'hi' ? 'कोई अपॉइंटमेंट नहीं मिला' : 'No Appointments Found'}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {searchQuery
                ? (lang === 'hi'
                    ? `खोज "${searchQuery}" से मेल खाने वाला कोई टोकन या मोबाइल नंबर नहीं मिला। कृपया नंबर जांचें।`
                    : `No appointment matched "${searchQuery}". Please check the phone or token number.`)
                : currentUser
                  ? (lang === 'hi'
                      ? `${currentUser.displayName || currentUser.email || 'आपके खाते'} से अभी तक कोई अपॉइंटमेंट बुक नहीं हुआ है। जब आप अपॉइंटमेंट बुक करेंगे, तो केवल आपका बुक किया हुआ टोकन यहां दिखेगा।`
                      : `No appointments booked yet under ${currentUser.displayName || currentUser.email || 'your account'}. When you book an appointment, your confirmed token will appear here.`)
                  : (lang === 'hi'
                      ? 'अतिथि मोड: आपने अभी तक कोई अपॉइंटमेंट बुक नहीं किया है। डॉक्टर खोजें और नया टोकन बुक करें, या पहले से बुक किए गए खाते से लॉगिन करें।'
                      : 'Guest Mode: You haven’t booked any appointments yet. Book a new appointment or log in to access tokens booked under your account.')}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold cursor-pointer"
              >
                {lang === 'hi' ? 'खोज साफ करें' : 'Clear Search'}
              </button>
            )}
            <button
              onClick={onBookNew}
              className="py-2.5 px-5 rounded-xl bg-[#0F5257] hover:bg-[#0A3A3D] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              {lang === 'hi' ? 'भारत भर के डॉक्टर देखें व बुक करें' : 'Find & Book Doctors in India'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map(apt => {
            const clinic = clinics.find(c => c.id === apt.clinicId);
            const doctor = doctors.find(d => d.id === apt.doctorId);
            const isToday = apt.date === todayStr;
            const isUpcoming = apt.date >= todayStr && apt.status === 'confirmed';
            const isCancelled = apt.status === 'cancelled';
            const isCompleted = apt.status === 'completed';

            return (
              <div
                key={apt.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-sm hover:shadow-md ${
                  isToday 
                    ? 'border-teal-600 ring-2 ring-teal-500/20' 
                    : isCancelled
                    ? 'border-gray-200 opacity-80'
                    : 'border-gray-200 hover:border-teal-700'
                }`}
              >
                {/* Top Status Strip */}
                <div className={`px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b ${
                  isToday 
                    ? 'bg-teal-900 text-white font-medium' 
                    : isCancelled
                    ? 'bg-gray-100 text-gray-600'
                    : isCompleted
                    ? 'bg-blue-50 text-blue-900'
                    : 'bg-teal-50/70 text-teal-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-num font-bold text-xs bg-white text-[#0F5257] px-2.5 py-0.5 rounded-md border border-teal-200 inline-flex items-center gap-1.5 shadow-2xs">
                      <Ticket className="w-3 h-3 text-[#D4A24C]" />
                      <span className="text-[10px] text-gray-500 font-medium">OTP:</span>
                      <span className="tracking-wider font-extrabold">{apt.appointmentNumber}</span>
                    </span>

                    {isToday && (
                      <span className="bg-amber-400 text-teal-950 font-bold text-[10px] px-2 py-0.5 rounded font-mono-num">
                        {lang === 'hi' ? 'आज का अपॉइंटमेंट' : 'TODAY'}
                      </span>
                    )}

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isCancelled 
                        ? 'bg-red-100 text-red-800' 
                        : isCompleted
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {apt.status === 'confirmed' 
                        ? (lang === 'hi' ? 'पुष्टीकृत (Confirmed)' : 'Confirmed')
                        : apt.status === 'completed'
                        ? (lang === 'hi' ? 'परामर्श पूर्ण' : 'Completed')
                        : (lang === 'hi' ? 'रद्द' : 'Cancelled')}
                    </span>
                  </div>

                  {/* Arrival Status Badge */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-gray-500 hidden sm:inline">
                      {lang === 'hi' ? 'क्लिनिक आगमन:' : 'Arrival:'}
                    </span>
                    <span className={`font-semibold px-2 py-0.5 rounded ${
                      apt.arrivalStatus === 'scanned'
                        ? 'bg-emerald-600 text-white font-bold'
                        : apt.arrivalStatus === 'arrived'
                        ? 'bg-amber-500 text-teal-950 font-bold'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {apt.arrivalStatus === 'scanned'
                        ? (lang === 'hi' ? 'QR सत्यापित' : 'QR Verified')
                        : apt.arrivalStatus === 'arrived'
                        ? (lang === 'hi' ? 'काउंटर पर उपस्थित' : 'At Front Desk')
                        : (lang === 'hi' ? 'आगमन शेष (Not Arrived)' : 'Not Arrived')}
                    </span>
                  </div>
                </div>

                {/* Main Card Content */}
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Doctor Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={doctor?.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80'}
                        alt={apt.doctorName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-900/15 shrink-0 shadow-xs"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-fraunces font-bold text-base sm:text-lg text-[#0F5257] truncate">
                            {apt.doctorName}
                          </h3>
                        </div>
                        <p className="text-xs font-semibold text-[#D4A24C] truncate">
                          {apt.doctorSpecialty} {apt.doctorQualification && `• ${apt.doctorQualification}`}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 truncate">
                          <Building2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <span className="font-medium text-gray-700 truncate">{apt.clinicName}</span>
                          {clinic?.landmark && (
                            <span className="text-gray-400 text-[11px] truncate">({clinic.landmark})</span>
                          )}
                        </div>

                        {(clinic?.address || doctor?.address) && (
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-600 truncate">
                            <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">{lang === 'hi' && clinic?.addressHindi ? clinic.addressHindi : (clinic?.address || doctor?.address)}</span>
                            <GoogleMapLinkButton
                              target={{
                                clinicName: apt.clinicName,
                                name: apt.clinicName,
                                address: clinic?.address || doctor?.address,
                                city: clinic?.city || doctor?.city,
                                landmark: clinic?.landmark || doctor?.landmark,
                                pincode: clinic?.pincode || doctor?.pincode,
                                lat: clinic?.lat || doctor?.lat,
                                lng: clinic?.lng || doctor?.lng
                              }}
                              lang={lang}
                              variant="badge"
                              mode="directions"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Date, Time & Fee Block */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200/80 min-w-[180px] w-full sm:w-auto text-left sm:text-right space-y-1">
                      <div className="flex items-center sm:justify-end gap-1.5 text-xs font-bold text-teal-950">
                        <Calendar className="w-3.5 h-3.5 text-teal-700" />
                        <span>{apt.date}</span>
                      </div>
                      <div className="flex items-center sm:justify-end gap-1.5 text-xs font-mono-num font-semibold text-gray-700">
                        <Clock className="w-3.5 h-3.5 text-teal-700" />
                        <span>{apt.timeSlot}</span>
                      </div>
                      <div className="pt-1 border-t border-gray-200/60 flex items-center sm:justify-end gap-2 text-xs">
                        <span className="text-gray-500 text-[11px]">
                          {apt.paymentType === 'online_prepaid'
                            ? (lang === 'hi' ? 'ऑनलाइन भुगतान:' : 'Online Paid:')
                            : (lang === 'hi' ? 'क्लिनिक काउंटर फीस:' : 'Counter Fee:')}
                        </span>
                        <span className="font-mono-num font-bold text-[#0F5257]">
                          ₹{apt.fee}
                        </span>
                        {apt.paymentStatus === 'paid' ? (
                          <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                            PAID
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDuePaymentApt(apt);
                            }}
                            className="text-[10px] px-2.5 py-1 rounded-lg font-bold bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-xs flex items-center gap-1 transition-all cursor-pointer animate-pulse"
                            title={lang === 'hi' ? 'बकाया परामर्श शुल्क का भुगतान करें (Razorpay अथवा Cash)' : 'Pay Due Fee (Razorpay or Cash)'}
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>{lang === 'hi' ? `DUE ₹${apt.fee} - भुगतान करें` : `DUE ₹${apt.fee} - Pay Now`}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Live OPD Queue & Waiting Position Block */}
                  {(() => {
                    const queueInfo = getAppointmentQueueInfo(apt);
                    return (
                      <div className={`rounded-2xl p-3.5 border transition-all ${
                        queueInfo.isInCabin
                          ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/30'
                          : 'bg-gradient-to-r from-[#0F5257]/5 via-teal-900/5 to-amber-500/10 border-teal-900/15'
                      } space-y-3`}>
                        {/* Header bar of Queue Block */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-900/10 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-bold text-[#0F5257] tracking-wider uppercase flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-teal-700" />
                              <span>{lang === 'hi' ? 'लाइव ओपीडी कतार व वेटिंग स्थिति' : 'Live OPD Queue & Waiting Tracker'}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] font-mono-num text-gray-500">
                            <span className="bg-white/90 px-2 py-0.5 rounded-md border border-teal-200/60 font-medium">
                              {lang === 'hi'
                                ? `कुल कतार: ${queueInfo.totalToday} मरीज | पूर्ण: ${queueInfo.completedCount}`
                                : `Today's Queue: ${queueInfo.totalToday} | Completed: ${queueInfo.completedCount}`}
                            </span>
                          </div>
                        </div>

                        {/* 2 Main Visual Metric Pillars: 1) Currently Running Token, 2) Your Waiting Number */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Pillar 1: Currently Running Token (कितना नंबर अपॉइंटमेंट चल रहा है) */}
                          <div className="bg-white rounded-xl p-3 border border-teal-200/80 shadow-2xs space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span>{lang === 'hi' ? 'चल रहा अपॉइंटमेंट / टोकन:' : 'Now Serving / Running Token:'}</span>
                              </span>
                              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded font-mono-num">
                                LIVE
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {queueInfo.currentRunningToken ? (
                                <>
                                  <span className="font-mono-num font-black text-xl text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-300 tracking-wide shadow-2xs">
                                    {queueInfo.currentRunningToken}
                                  </span>
                                  <div className="text-xs leading-snug min-w-0">
                                    {queueInfo.isInCabin ? (
                                      <span className="font-bold text-emerald-700 block">
                                        {lang === 'hi' ? '🎉 आपका टोकन चल रहा है!' : '🎉 Your Turn Right Now!'}
                                      </span>
                                    ) : (
                                      <span className="font-medium text-gray-700 block truncate">
                                        {queueInfo.isDoctorActivelyServing 
                                          ? (lang === 'hi' ? 'डॉक्टर केबिन में परामर्श जारी' : 'In Cabin with Doctor') 
                                          : (lang === 'hi' ? 'परामर्श हेतु अगला टोकन' : 'Next Token in Line')}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-gray-400">
                                      {lang === 'hi' ? 'डॉक्टर: ' : 'Dr. '} {apt.doctorName}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="text-xs text-gray-500 font-medium py-1">
                                  {queueInfo.completedCount >= queueInfo.totalToday && queueInfo.totalToday > 0
                                    ? (lang === 'hi' ? '✓ आज के सभी परामर्श पूर्ण हो चुके हैं' : '✓ All consultations completed for today')
                                    : (lang === 'hi' ? 'परामर्श जल्द शुरू होने वाला है' : 'Consultation starting shortly')}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Pillar 2: Patient's Waiting Number (वेटिंग नंबर / कितने मरीज आगे हैं) */}
                          <div className="bg-white rounded-xl p-3 border border-amber-200/80 shadow-2xs space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-amber-700" />
                                <span>{lang === 'hi' ? 'आपकी वेटिंग संख्या (Waiting No.):' : 'Your Waiting Number:'}</span>
                              </span>
                              <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-1.5 py-0.2 rounded font-mono-num">
                                {queueInfo.isInCabin 
                                  ? (lang === 'hi' ? 'केबिन में' : 'IN CABIN')
                                  : queueInfo.isCompleted 
                                  ? (lang === 'hi' ? 'पूर्ण' : 'COMPLETED')
                                  : (lang === 'hi' ? 'कतार में' : 'WAITING')}
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5">
                              {queueInfo.isInCabin ? (
                                <div className="flex items-center gap-2 py-0.5">
                                  <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                                    ✓
                                  </span>
                                  <div>
                                    <span className="font-bold text-emerald-800 text-sm block">
                                      {lang === 'hi' ? 'अभी आपकी बारी है!' : 'Your Turn Now!'}
                                    </span>
                                    <span className="text-[11px] text-emerald-700">
                                      {lang === 'hi' ? 'केबिन में परामर्श जारी है' : 'Inside consultation cabin'}
                                    </span>
                                  </div>
                                </div>
                              ) : queueInfo.isCompleted ? (
                                <div className="flex items-center gap-2 py-0.5">
                                  <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                                    ✓
                                  </span>
                                  <div>
                                    <span className="font-bold text-blue-900 text-sm block">
                                      {lang === 'hi' ? 'परामर्श संपन्न हो चुका है' : 'Consultation Completed'}
                                    </span>
                                    <span className="text-[11px] text-gray-500">
                                      {lang === 'hi' ? 'दवाई पर्चा व निर्देश प्राप्त करें' : 'Rx and instructions saved'}
                                    </span>
                                  </div>
                                </div>
                              ) : queueInfo.isCancelled ? (
                                <div className="text-xs text-red-600 font-bold py-1">
                                  {lang === 'hi' ? 'अपॉइंटमेंट रद्द है' : 'Appointment Cancelled'}
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-baseline gap-1">
                                    <span className="font-mono-num font-black text-2xl text-[#0F5257] bg-teal-50 px-3 py-0.5 rounded-xl border border-teal-200 shadow-2xs">
                                      #{queueInfo.waitingNumber}
                                    </span>
                                  </div>
                                  <div className="text-xs leading-tight min-w-0">
                                    <span className="font-bold text-gray-900 block">
                                      {queueInfo.patientsAheadCount === 0 ? (
                                        <span className="text-emerald-700 font-black">
                                          {lang === 'hi' ? 'अगली बारी आपकी है! (You are next)' : 'You are NEXT in line!'}
                                        </span>
                                      ) : (
                                        <span>
                                          {lang === 'hi'
                                            ? `आपसे आगे: ${queueInfo.patientsAheadCount} मरीज`
                                            : `${queueInfo.patientsAheadCount} patient${queueInfo.patientsAheadCount > 1 ? 's' : ''} ahead`}
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-[11px] text-gray-500 font-mono-num block mt-0.5">
                                      {queueInfo.patientsAheadCount === 0
                                        ? (lang === 'hi' ? 'केबिन के बाहर तैयार रहें' : 'Please stay near cabin door')
                                        : (lang === 'hi'
                                            ? `अनुमानित प्रतीक्षा: ~${queueInfo.estimatedWaitMinutes} मिनट`
                                            : `Est. Wait: ~${queueInfo.estimatedWaitMinutes} mins`)}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Arrival Status Reminder */}
                        {!queueInfo.isCompleted && !queueInfo.isCancelled && !queueInfo.isInCabin && (
                          <div className="bg-white/90 rounded-xl px-3 py-2 border border-teal-200/60 flex items-center justify-between gap-2 text-[11px]">
                            <div className="flex items-center gap-1.5 text-gray-700">
                              {apt.arrivalStatus === 'scanned' ? (
                                <>
                                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span className="text-emerald-900 font-medium">
                                    {lang === 'hi'
                                      ? 'क्लिनिक उपस्थिति सत्यापित है (QR Verified)। डॉक्टर केबिन से आपको बुलाया जाएगा।'
                                      : 'Clinic arrival confirmed (QR Verified). You will be called into the cabin shortly.'}
                                  </span>
                                </>
                              ) : apt.arrivalStatus === 'arrived' ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span className="text-amber-900 font-medium">
                                    {lang === 'hi'
                                      ? 'आप रिसेप्शन पर उपस्थित हैं। जल्द ही आपका टोकन स्क्रीन पर आएगा।'
                                      : 'Present at reception. Your token will be called soon.'}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span className="text-stone-700">
                                    {lang === 'hi'
                                      ? 'क्लिनिक पहुंचकर रिसेप्शन काउंटर पर डिजिटल पर्ची या QR स्कैन कराएं ताकि डॉक्टर को आपकी उपस्थिति पता चले।'
                                      : 'Show your digital slip or QR code at reception upon arrival to confirm your presence.'}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Patient Details strip */}
                  <div className="bg-teal-50/50 rounded-xl p-3 border border-teal-900/10 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-700">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <span className="text-gray-400 text-[10px] block">{lang === 'hi' ? 'मरीज का नाम' : 'Patient Name'}</span>
                        <span className="font-bold text-[#0F5257]">{apt.patientName}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">{lang === 'hi' ? 'उम्र व लिंग' : 'Age & Gender'}</span>
                        <span className="font-medium">{apt.patientAge} yrs, {apt.patientGender}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">{lang === 'hi' ? 'मोबाइल नंबर' : 'Phone'}</span>
                        <span className="font-mono-num font-medium">+91 {apt.patientPhone}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyToken(apt.appointmentNumber)}
                      className="text-[11px] text-teal-800 hover:text-teal-950 flex items-center gap-1 font-medium bg-white px-2.5 py-1 rounded-lg border border-teal-200 cursor-pointer"
                      title="Copy Token"
                    >
                      {copiedTokenId === apt.appointmentNumber ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">{lang === 'hi' ? 'कॉपी हुआ' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{lang === 'hi' ? 'टोकन कॉपी' : 'Copy Token'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100">
                    {/* Primary Button: View Digital Slip */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedAptForSlip(apt)}
                        className="py-2 px-3.5 rounded-xl bg-[#0F5257] hover:bg-[#0A3A3D] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        id={`view-slip-${apt.id}`}
                      >
                        <Ticket className="w-3.5 h-3.5 text-[#D4A24C]" />
                        <span>{lang === 'hi' ? 'डिजिटल पर्ची व QR देखें' : 'View Digital OPD Slip & QR'}</span>
                      </button>

                      <button
                        onClick={() => handleWhatsAppShare(apt)}
                        className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {clinic?.phone && (
                        <a
                          href={`tel:${clinic.phone}`}
                          className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                          title="Call Clinic Reception"
                        >
                          <Phone className="w-3.5 h-3.5 text-teal-800" />
                          <span className="hidden md:inline">{lang === 'hi' ? 'क्लिनिक कॉल' : 'Call'}</span>
                        </a>
                      )}

                      {(clinic?.address || doctor?.address) && (
                        <a
                          href={getGoogleMapsDirectionsUrl({
                            clinicName: apt.clinicName,
                            name: apt.clinicName,
                            address: clinic?.address || doctor?.address,
                            city: clinic?.city || doctor?.city,
                            landmark: clinic?.landmark || doctor?.landmark,
                            pincode: clinic?.pincode || doctor?.pincode,
                            lat: clinic?.lat || doctor?.lat,
                            lng: clinic?.lng || doctor?.lng
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                          title="Get Directions on Google Maps"
                        >
                          <Navigation className="w-3.5 h-3.5 fill-current text-amber-600" />
                          <span>{lang === 'hi' ? 'रास्ता (Google Map)' : 'Google Map'}</span>
                          <ExternalLink className="w-3 h-3 text-amber-700/80" />
                        </a>
                      )}

                      {/* Doctor Profile / Book again */}
                      {doctor && (
                        <button
                          onClick={() => onSelectDoctor(doctor)}
                          className="py-2 px-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F5257] font-semibold text-xs transition-colors cursor-pointer"
                        >
                          {lang === 'hi' ? 'डॉक्टर प्रोफाइल' : 'Doctor Info'}
                        </button>
                      )}

                      {/* Cancel Appointment button for upcoming */}
                      {isUpcoming && (
                        <button
                          onClick={() => handleCancel(apt)}
                          disabled={cancellingId === apt.id}
                          className="py-2 px-2.5 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700 font-medium text-xs transition-colors cursor-pointer"
                        >
                          {cancellingId === apt.id 
                            ? (lang === 'hi' ? 'रद्द हो रहा...' : 'Cancelling...') 
                            : (lang === 'hi' ? 'अपॉइंटमेंट रद्द करें' : 'Cancel Booking')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================== */}
      {/* DIGITAL OPD SLIP MODAL DIALOG */}
      {/* ========================================================== */}
      {selectedAptForSlip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-teal-900/20 my-auto animate-fadeIn">
            {/* Modal Header Bar */}
            <div className="bg-[#0F5257] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#D4A24C]" />
                <h3 className="font-fraunces font-bold text-lg">
                  {lang === 'hi' ? 'डिजिटल ओपीडी पर्ची' : 'Digital OPD Token Slip'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAptForSlip(null)}
                className="w-8 h-8 rounded-full bg-teal-900/60 hover:bg-teal-900 text-teal-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Paper Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Clinic Header */}
              {(() => {
                const modalClinic = clinics.find(c => c.id === selectedAptForSlip.clinicId);
                const modalDoctor = doctors.find(d => d.id === selectedAptForSlip.doctorId);
                const slipAddress = modalClinic ? (lang === 'hi' && modalClinic.addressHindi ? modalClinic.addressHindi : modalClinic.address) : (modalDoctor?.address || 'OPD Clinic');

                return (
                  <div className="text-center pb-3 border-b-2 border-dashed border-gray-200 space-y-1">
                    <span className="bg-[#D4A24C] text-[#14282B] text-[10px] font-bold px-2 py-0.5 rounded font-mono-num">
                      CLINIKARO VERIFIED OPD
                    </span>
                    <h4 className="font-fraunces font-bold text-xl text-[#0F5257]">
                      {selectedAptForSlip.clinicName}
                    </h4>
                    <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{slipAddress}</span>
                    </p>
                    <div className="pt-1 flex justify-center">
                      <GoogleMapLinkButton
                        target={{
                          clinicName: selectedAptForSlip.clinicName,
                          name: selectedAptForSlip.clinicName,
                          address: modalClinic?.address || modalDoctor?.address,
                          city: modalClinic?.city || modalDoctor?.city,
                          landmark: modalClinic?.landmark || modalDoctor?.landmark,
                          pincode: modalClinic?.pincode || modalDoctor?.pincode,
                          lat: modalClinic?.lat || modalDoctor?.lat,
                          lng: modalClinic?.lng || modalDoctor?.lng
                        }}
                        lang={lang}
                        variant="badge"
                        mode="directions"
                      />
                    </div>
                  </div>
                );
              })()}

              {/* QR Code & Token Number Box */}
              <div className="bg-teal-50/70 border-2 border-teal-900/15 rounded-2xl p-4 text-center space-y-2.5">
                <span className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold block">
                  {lang === 'hi' ? 'ओपीडी टोकन संख्या (OTP कोड)' : 'OPD Token (OTP Code)'}
                </span>
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  {String(selectedAptForSlip.appointmentNumber).split('').map((digit, idx) => (
                    <span
                      key={idx}
                      className="w-10 h-12 flex items-center justify-center font-mono-num text-2xl font-black text-[#0F5257] bg-white border-2 border-teal-600/40 rounded-xl shadow-xs"
                    >
                      {digit}
                    </span>
                  ))}
                </div>

                {modalQrUrl ? (
                  <div className="bg-white p-2 rounded-2xl border border-teal-200 inline-block shadow-xs mt-1">
                    <img
                      src={modalQrUrl}
                      alt="OPD QR Code"
                      className="w-40 h-40 mx-auto"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center bg-gray-50 text-xs text-gray-400 mx-auto">
                    Loading QR...
                  </div>
                )}

                <div className="text-[11px] text-teal-950 font-medium bg-amber-100/70 border border-amber-300 rounded-xl p-2.5 leading-relaxed">
                  ⚠️ {lang === 'hi' 
                    ? 'क्लिनिक रिसेप्शनिस्ट को अपना टोकन OTP #' + selectedAptForSlip.appointmentNumber + ' बताएं या यह क्यूआर कोड दिखाएं। रिसेप्शनिस्ट तुरंत आपकी उपस्थिति दर्ज करेंगे।' 
                    : 'Tell the receptionist your Token OTP #' + selectedAptForSlip.appointmentNumber + ' or show this QR code at the desk to mark arrival.'}
                </div>
              </div>

              {/* Live Queue Status in Digital Slip */}
              {(() => {
                const modalQueue = getAppointmentQueueInfo(selectedAptForSlip);
                return (
                  <div className="bg-gradient-to-r from-teal-50 to-amber-50/60 p-3 rounded-2xl border border-teal-200/80 text-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#0F5257]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>{lang === 'hi' ? 'लाइव ओपीडी कतार (Live Queue)' : 'Live OPD Queue'}</span>
                      </span>
                      <span className="font-mono-num font-semibold text-gray-500 text-[10px]">
                        {lang === 'hi' ? `कुल कतार: ${modalQueue.totalToday}` : `Total in Queue: ${modalQueue.totalToday}`}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-white p-2 rounded-xl border border-teal-100 shadow-2xs">
                        <span className="text-[10px] text-gray-500 font-medium block">
                          {lang === 'hi' ? 'चल रहा अपॉइंटमेंट / टोकन' : 'Now Serving Token'}
                        </span>
                        <span className="font-mono-num font-black text-sm text-emerald-800">
                          {modalQueue.currentRunningToken || (lang === 'hi' ? 'शुरू होने वाला है' : 'Starting Soon')}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-amber-100 shadow-2xs">
                        <span className="text-[10px] text-gray-500 font-medium block">
                          {lang === 'hi' ? 'आपकी वेटिंग संख्या' : 'Your Waiting No.'}
                        </span>
                        <span className="font-mono-num font-black text-sm text-[#0F5257]">
                          {modalQueue.isInCabin
                            ? (lang === 'hi' ? 'केबिन में' : 'In Cabin')
                            : modalQueue.isCompleted
                            ? (lang === 'hi' ? 'पूर्ण' : 'Completed')
                            : `#${modalQueue.waitingNumber} (${modalQueue.patientsAheadCount} ${lang === 'hi' ? 'मरीज आगे' : 'ahead'})`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Doctor & Appointment Details */}
              <div className="space-y-2 text-xs">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{lang === 'hi' ? 'परामर्शदाता डॉक्टर:' : 'Consulting Doctor:'}</span>
                    <span className="font-bold text-[#0F5257]">{selectedAptForSlip.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{lang === 'hi' ? 'विशेषज्ञता:' : 'Specialty:'}</span>
                    <span className="font-semibold text-gray-700">{selectedAptForSlip.doctorSpecialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{lang === 'hi' ? 'तारीख व समय:' : 'OPD Date & Time:'}</span>
                    <span className="font-mono-num font-bold text-teal-900">
                      {selectedAptForSlip.date} ({selectedAptForSlip.timeSlot})
                    </span>
                  </div>
                </div>

                {/* Patient Info */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{lang === 'hi' ? 'मरीज का नाम:' : 'Patient Name:'}</span>
                    <span className="font-bold text-gray-800">{selectedAptForSlip.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{lang === 'hi' ? 'उम्र व लिंग:' : 'Age / Gender:'}</span>
                    <span className="font-medium text-gray-700">
                      {selectedAptForSlip.patientAge} yrs, {selectedAptForSlip.patientGender}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{lang === 'hi' ? 'मोबाइल नंबर:' : 'Mobile #:'}</span>
                    <span className="font-mono-num font-medium text-gray-700">
                      +91 {selectedAptForSlip.patientPhone}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-200">
                    <span className="text-gray-500">{lang === 'hi' ? 'शुल्क स्थिति:' : 'Fee Status:'}</span>
                    <span className="font-mono-num font-bold text-[#0F5257]">
                      ₹{selectedAptForSlip.fee} ({selectedAptForSlip.paymentStatus === 'paid' ? 'PAID' : 'PAY AT COUNTER'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="space-y-2 pt-2">
                {selectedAptForSlip.paymentStatus !== 'paid' && (
                  <button
                    type="button"
                    onClick={() => {
                      setDuePaymentApt(selectedAptForSlip);
                    }}
                    className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-teal-800 to-emerald-700 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer animate-pulse"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>
                      {lang === 'hi' 
                        ? `बकाया परामर्श शुल्क ₹${selectedAptForSlip.fee} का भुगतान करें (Razorpay / Cash)` 
                        : `Pay Due Consultation Fee ₹${selectedAptForSlip.fee} (Razorpay / Cash)`}
                    </span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleWhatsAppShare(selectedAptForSlip)}
                    className="py-3 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>WhatsApp Share</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="py-3 px-3 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-teal-800" />
                    <span>{lang === 'hi' ? 'प्रिंट / सेव' : 'Print Slip'}</span>
                  </button>
                </div>
              </div>

              {/* Helpline footer */}
              <div className="text-center text-[10px] text-gray-400 font-mono-num pt-2 border-t border-gray-100">
                CliniKaro All India OPD Helpline: +91 94312 88410 • Powered by SaaS Suvidha
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Due Payment Settlement Modal (Razorpay & Cash with OTP / QR scan) */}
      {duePaymentApt && (
        <DuePaymentModal
          isOpen={Boolean(duePaymentApt)}
          onClose={() => setDuePaymentApt(null)}
          appointment={duePaymentApt}
          doctor={doctors.find(d => d.id === duePaymentApt.doctorId)}
          clinic={clinics.find(c => c.id === duePaymentApt.clinicId)}
          lang={lang}
          onPaymentSuccess={async (updates) => {
            if (onUpdateAppointment) {
              await onUpdateAppointment(duePaymentApt.id, updates);
            }
            if (selectedAptForSlip && selectedAptForSlip.id === duePaymentApt.id) {
              setSelectedAptForSlip({
                ...selectedAptForSlip,
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

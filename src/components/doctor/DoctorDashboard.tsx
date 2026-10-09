import React, { useState, useEffect, useRef } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Printer, 
  QrCode, 
  Search, 
  Edit3, 
  Save, 
  ToggleLeft, 
  ToggleRight, 
  Eye, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Share2, 
  ArrowRight, 
  Activity, 
  FileText, 
  Bell, 
  Check, 
  X, 
  RefreshCw,
  MapPin,
  Award,
  Users,
  CreditCard,
  Building2,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import { Doctor, Appointment, Clinic, Language, AppUser } from '../../types';
import { translations } from '../../data/translations';

interface DoctorDashboardProps {
  lang: Language;
  doctor: Doctor;
  clinic: Clinic | undefined;
  appointments: Appointment[];
  currentUser?: AppUser | null;
  onUpdateDoctor: (doctorId: string, updates: Partial<Doctor>) => Promise<void>;
  onUpdateAppointment: (appointmentId: string, updates: Partial<Appointment>) => Promise<void>;
  onSwitchToReception?: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  lang,
  doctor,
  clinic,
  appointments,
  currentUser,
  onUpdateDoctor,
  onUpdateAppointment,
  onSwitchToReception
}) => {
  const t = translations[lang];

  // Active view tab in Doctor site
  const [activeTab, setActiveTab] = useState<'cabin' | 'schedule' | 'prescriptions' | 'analytics' | 'profile'>('cabin');

  // Filter state for appointments
  const [searchQuery, setSearchQuery] = useState('');
  const [queueFilter, setQueueFilter] = useState<'all' | 'waiting' | 'in_cabin' | 'completed'>('all');

  // Doctor OPD status state
  const [isAvailableToday, setIsAvailableToday] = useState(doctor.availableToday);
  const [opdNotice, setOpdNotice] = useState(doctor.opdNotice || '');
  const [isSavingNotice, setIsSavingNotice] = useState(false);
  const [noticeSavedMsg, setNoticeSavedMsg] = useState(false);

  // Active in-cabin patient
  const [inCabinPatientId, setInCabinPatientId] = useState<string | null>(null);

  // Clinical notes state for current consultation
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState('');
  const [prescriptionRx, setPrescriptionRx] = useState('');
  const [followUpDays, setFollowUpDays] = useState<number | null>(7);
  const [isSavingConsultation, setIsSavingConsultation] = useState(false);

  // Print Rx modal
  const [printRxAppointment, setPrintRxAppointment] = useState<Appointment | null>(null);

  // Doctor fee & schedule settings
  const [editableFee, setEditableFee] = useState(doctor.fee);
  const [editableSlots, setEditableSlots] = useState<string[]>(doctor.timeSlots || []);
  const [newSlotInput, setNewSlotInput] = useState('');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState(false);

  // Razorpay Route Bank Account & Settlement State
  const [isEditingBankDetails, setIsEditingBankDetails] = useState(false);
  const [bankHolderName, setBankHolderName] = useState(doctor.accountHolderName || doctor.name);
  const [bankAccNum, setBankAccNum] = useState(doctor.bankAccountNumber || '');
  const [bankIfscCode, setBankIfscCode] = useState(doctor.bankIfsc || '');
  const [bankInstitution, setBankInstitution] = useState(doctor.bankName || '');
  const [doctorVpa, setDoctorVpa] = useState(doctor.upiId || '');
  const [routeAccountId, setRouteAccountId] = useState(doctor.razorpayAccountId || '');
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankSuccessMsg, setBankSuccessMsg] = useState(false);

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBank(true);
    try {
      const generatedRouteId = routeAccountId.trim() || `acc_${doctor.id.replace(/-/g, '_')}`;
      await onUpdateDoctor(doctor.id, {
        razorpayAccountId: generatedRouteId,
        accountHolderName: bankHolderName.trim() || doctor.name,
        bankAccountNumber: bankAccNum.trim(),
        bankIfsc: bankIfscCode.trim().toUpperCase(),
        bankName: bankInstitution.trim() || 'Bank Account',
        upiId: doctorVpa.trim(),
        paymentOnboardingStatus: 'active'
      });
      setRouteAccountId(generatedRouteId);
      setIsEditingBankDetails(false);
      setBankSuccessMsg(true);
      setTimeout(() => setBankSuccessMsg(false), 4000);
    } catch (err) {
      console.error("Failed to update bank details:", err);
    } finally {
      setIsSavingBank(false);
    }
  };

  // Quick Diagnosis Tags
  const quickDiagnosisTags = [
    'Refractive Error (चश्मा जांच)',
    'Early Cataract (शुरुआती मोतियाबिंद)',
    'Allergic Conjunctivitis (आंख में लालिमा/एलर्जी)',
    'Dry Eye Syndrome (आंख का सूखापन)',
    'Glaucoma Screening (काला मोतिया जांच)',
    'Post-Op Follow-up (ऑपरेशन के बाद जांच)',
    'General Eye Strain (स्क्रीन विजन स्ट्रेन)'
  ];

  // Quick Medicine Prescriptions
  const quickRxList = [
    'Tab. Paracetamol 650mg (1-0-1) x 3 days',
    'Eye Drops Moxifloxacin 0.5% (1 drop 4 times daily) x 7 days',
    'Eye Drops Carboxymethylcellulose 0.5% (Lubricating - 4 times daily)',
    'Eye Drops Olopatadine 0.1% (Twice daily for allergy)',
    'Tab. Vitamin C + Zinc (0-1-0) x 15 days',
    'Rest eyes with 20-20-20 rule, avoid dusty wind'
  ];

  // Sync state if doctor prop updates
  useEffect(() => {
    setIsAvailableToday(doctor.availableToday);
    setOpdNotice(doctor.opdNotice || '');
    setEditableFee(doctor.fee);
    setEditableSlots(doctor.timeSlots || []);
  }, [doctor]);

  // Today's appointments for this doctor
  const todayStr = new Date().toISOString().split('T')[0];
  const doctorAppointments = appointments.filter(a => a.doctorId === doctor.id);
  const todayAppointments = doctorAppointments.filter(a => a.date === todayStr || true); // Include sample appointments for testing

  // Current in-cabin appointment
  const currentCabinAppointment = todayAppointments.find(a => 
    a.id === inCabinPatientId || a.consultationStatus === 'in_cabin'
  ) || null;

  // Sync current consultation details when active patient changes
  useEffect(() => {
    if (currentCabinAppointment) {
      setClinicalDiagnosis(currentCabinAppointment.clinicalNotes || '');
      setPrescriptionRx(currentCabinAppointment.prescriptionRx || '');
    } else {
      setClinicalDiagnosis('');
      setPrescriptionRx('');
    }
  }, [currentCabinAppointment?.id]);

  // Derived metrics
  const waitingPatients = todayAppointments.filter(a => 
    a.status !== 'cancelled' && a.status !== 'completed' && a.consultationStatus !== 'in_cabin'
  );
  const completedToday = todayAppointments.filter(a => a.status === 'completed');
  const totalRevenueToday = completedToday.reduce((sum, a) => sum + (a.fee || doctor.fee), 0);

  // Handle Toggle Availability
  const [isBookingActive, setIsBookingActive] = useState<boolean>(doctor.isAppointmentBookingActive !== false);

  const handleToggleAvailability = async () => {
    const nextState = !isAvailableToday;
    setIsAvailableToday(nextState);
    await onUpdateDoctor(doctor.id, { availableToday: nextState });
  };

  // Handle Toggle Online Booking Start / Pause
  const handleToggleBooking = async () => {
    const nextState = !isBookingActive;
    setIsBookingActive(nextState);
    await onUpdateDoctor(doctor.id, { isAppointmentBookingActive: nextState });
  };

  // Handle Save Notice
  const handleSaveNotice = async () => {
    setIsSavingNotice(true);
    await onUpdateDoctor(doctor.id, { opdNotice });
    setIsSavingNotice(false);
    setNoticeSavedMsg(true);
    setTimeout(() => setNoticeSavedMsg(false), 3000);
  };

  // Call Next Patient into Cabin
  const handleCallNextPatient = async () => {
    // If waiting patients exist, pick the first one
    const nextPatient = waitingPatients[0];
    if (!nextPatient) return;

    // If there was an active patient, complete them first or switch
    if (currentCabinAppointment && currentCabinAppointment.id !== nextPatient.id) {
      await onUpdateAppointment(currentCabinAppointment.id, {
        status: 'completed',
        consultationStatus: 'completed'
      });
    }

    setInCabinPatientId(nextPatient.id);
    await onUpdateAppointment(nextPatient.id, {
      arrivalStatus: 'arrived',
      consultationStatus: 'in_cabin'
    });
  };

  // Call Specific Patient into Cabin
  const handleCallPatient = async (apt: Appointment) => {
    if (currentCabinAppointment && currentCabinAppointment.id !== apt.id) {
      await onUpdateAppointment(currentCabinAppointment.id, {
        status: 'completed',
        consultationStatus: 'completed'
      });
    }

    setInCabinPatientId(apt.id);
    await onUpdateAppointment(apt.id, {
      arrivalStatus: 'arrived',
      consultationStatus: 'in_cabin'
    });
  };

  // Complete Consultation
  const handleCompleteConsultation = async () => {
    if (!currentCabinAppointment) return;
    setIsSavingConsultation(true);

    const followUpDateStr = followUpDays 
      ? new Date(Date.now() + followUpDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : undefined;

    await onUpdateAppointment(currentCabinAppointment.id, {
      status: 'completed',
      consultationStatus: 'completed',
      clinicalNotes: clinicalDiagnosis,
      prescriptionRx: prescriptionRx,
      followUpDate: followUpDateStr
    });

    setIsSavingConsultation(false);
    setInCabinPatientId(null);
    setClinicalDiagnosis('');
    setPrescriptionRx('');
  };

  // Save Schedule updates
  const handleSaveSchedule = async () => {
    setIsSavingSchedule(true);
    await onUpdateDoctor(doctor.id, {
      fee: Number(editableFee) || doctor.fee,
      timeSlots: editableSlots
    });
    setIsSavingSchedule(false);
    setScheduleSuccessMsg(true);
    setTimeout(() => setScheduleSuccessMsg(false), 3000);
  };

  // Add Time Slot
  const handleAddSlot = () => {
    if (!newSlotInput.trim()) return;
    if (!editableSlots.includes(newSlotInput.trim())) {
      setEditableSlots([...editableSlots, newSlotInput.trim()]);
    }
    setNewSlotInput('');
  };

  // Remove Time Slot
  const handleRemoveSlot = (slotToRemove: string) => {
    setEditableSlots(editableSlots.filter(s => s !== slotToRemove));
  };

  // Filtered Queue
  const filteredQueue = todayAppointments.filter(a => {
    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = a.patientName.toLowerCase().includes(q) ||
                    a.appointmentNumber.toLowerCase().includes(q) ||
                    a.patientPhone.includes(q);
      if (!match) return false;
    }

    // Tab filter
    if (queueFilter === 'waiting') {
      return a.status !== 'completed' && a.status !== 'cancelled' && a.consultationStatus !== 'in_cabin';
    }
    if (queueFilter === 'in_cabin') {
      return a.id === inCabinPatientId || a.consultationStatus === 'in_cabin';
    }
    if (queueFilter === 'completed') {
      return a.status === 'completed';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16 font-sans text-stone-900">
      {/* Top Doctor Profile Banner */}
      <section className="bg-gradient-to-r from-[#0F5257] via-[#0A3A3D] to-[#0A2628] text-white py-6 sm:py-8 px-4 sm:px-6 shadow-md border-b border-teal-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Doctor Card Details */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative shrink-0">
                <img 
                  src={doctor.photoUrl} 
                  alt={doctor.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-400/80 shadow-lg"
                />
                <span className="absolute -bottom-2 -right-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-900 flex items-center gap-1 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Doctor Site
                </span>
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold font-fraunces tracking-tight text-white">
                    {lang === 'hi' ? doctor.nameHindi || doctor.name : doctor.name}
                  </h1>
                  <span className="bg-amber-400/20 text-amber-300 text-xs px-2 py-0.5 rounded-full border border-amber-400/30 font-medium">
                    {lang === 'hi' ? doctor.specialtyHindi || doctor.specialty : doctor.specialty}
                  </span>
                  <span className="bg-teal-800/80 text-teal-200 text-xs px-2 py-0.5 rounded-full font-mono-num">
                    {doctor.email || 'mydehridoctor@gmail.com'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-teal-100 font-medium truncate max-w-xl">
                  {doctor.qualification} • {doctor.experienceYears}+ {lang === 'hi' ? 'वर्षों का अनुभव' : 'Years Experience'}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-teal-200/90 pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{clinic?.name || doctor.clinicName}</span>
                  </span>
                  <span>•</span>
                  <span className="font-mono-num font-bold text-amber-300">
                    ₹{doctor.fee} {lang === 'hi' ? 'परामर्श शुल्क' : 'OPD Fee'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: OPD Live Status & Switch Shortcuts */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-2.5 shrink-0">
              {/* Online Appointment Booking Start / Pause Toggle */}
              <div className="bg-[#0A3A3D]/90 p-2.5 rounded-xl border border-amber-500/40 flex items-center justify-between gap-3 w-full sm:w-auto shadow-2xs">
                <div className="text-left">
                  <span className="block text-[11px] font-bold text-amber-300">
                    {isBookingActive 
                      ? (lang === 'hi' ? '● बुकिंग चालू (Booking Active)' : '● Booking Active')
                      : (lang === 'hi' ? '⏸️ बुकिंग बंद (Booking Paused)' : '⏸️ Booking Paused')}
                  </span>
                  <span className="block text-[10px] text-teal-200/70">
                    {isBookingActive 
                      ? (lang === 'hi' ? 'मरीज ऑनलाइन बुक कर सकते हैं + Contact Now' : 'Patients can book + Contact Now')
                      : (lang === 'hi' ? 'मरीजों को केवल Contact Now दिखेगा' : 'Patients will only see Contact Now')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleBooking}
                  className="text-amber-400 hover:text-amber-300 transition-transform cursor-pointer"
                  title={lang === 'hi' ? 'ऑनलाइन अपॉइंटमेंट बुकिंग चालू/बंद करें' : 'Toggle Online Appointment Booking'}
                  id="doctor-toggle-booking-btn"
                >
                  {isBookingActive ? (
                    <ToggleRight className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-stone-400" />
                  )}
                </button>
              </div>

              {/* OPD Cabin Presence Toggle */}
              <div className="bg-[#0A3A3D]/90 p-2 rounded-xl border border-teal-700/80 flex items-center justify-between gap-3 w-full sm:w-auto">
                <div className="text-left">
                  <span className="block text-[11px] font-bold text-teal-200">
                    {isAvailableToday 
                      ? (lang === 'hi' ? 'केबिन में उपस्थित' : 'In Cabin')
                      : (lang === 'hi' ? 'अनुपस्थित / अवकाश' : 'On Leave Today')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleAvailability}
                  className="text-amber-400 hover:text-amber-300 transition-transform cursor-pointer"
                  title="Toggle In-Cabin Presence"
                  id="doctor-toggle-availability-btn"
                >
                  {isAvailableToday ? (
                    <ToggleRight className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-stone-400" />
                  )}
                </button>
              </div>

              {/* Navigation Shortcuts */}
              <div className="flex items-center gap-2">
                {onSwitchToReception && (
                  <button
                    onClick={onSwitchToReception}
                    className="px-3 py-1.5 rounded-lg bg-teal-800/80 hover:bg-teal-700 text-teal-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    id="doctor-view-reception-btn"
                  >
                    <Users className="w-3.5 h-3.5 text-teal-300" />
                    <span>{lang === 'hi' ? 'रिसेप्शन डेस्क' : 'Reception'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* OPD Notice Bar (Doctor can announce delay/emergencies to patients) */}
          <div className="mt-5 pt-4 border-t border-teal-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Bell className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-amber-300 font-bold whitespace-nowrap">
                {lang === 'hi' ? 'मरीज सूचना (OPD Delay Alert):' : 'OPD Notice for Patients:'}
              </span>
              <input 
                type="text"
                placeholder={lang === 'hi' ? 'जैसे: डॉक्टर 11:30 बजे से ओपीडी केबिन में उपलब्ध रहेंगे।' : 'e.g. Doctor is in minor surgery, OPD will resume at 11:30 AM.'}
                value={opdNotice}
                onChange={(e) => setOpdNotice(e.target.value)}
                className="flex-1 md:w-96 px-3 py-1.5 bg-[#062426] border border-teal-700 rounded-lg text-teal-100 text-xs placeholder:text-teal-400/50 focus:outline-hidden focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleSaveNotice}
                disabled={isSavingNotice}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
                id="doctor-save-notice-btn"
              >
                {isSavingNotice ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                <span>{noticeSavedMsg ? (lang === 'hi' ? 'सेव हुआ!' : 'Saved!') : (lang === 'hi' ? 'अपडेट करें' : 'Update Notice')}</span>
              </button>
            </div>

            <div className="text-teal-200/80 text-[11px] flex items-center gap-1.5 self-end md:self-auto">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{doctor.patientsServed.toLocaleString()}+ {lang === 'hi' ? 'मरीजों का सफल इलाज' : 'Patients Treated in India'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-2 py-2">
            <button
              onClick={() => setActiveTab('cabin')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'cabin'
                  ? 'bg-[#0F5257] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
              id="tab-doctor-cabin"
            >
              <Stethoscope className="w-4 h-4 text-amber-400" />
              <span>{lang === 'hi' ? 'केबिन व लाइव कतार' : 'OPD Cabin & Queue'}</span>
              {waitingPatients.length > 0 && (
                <span className="bg-amber-400 text-teal-950 text-[10px] font-black px-1.5 py-0.2 rounded-full font-mono-num">
                  {waitingPatients.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'bg-[#0F5257] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
              id="tab-doctor-schedule"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{lang === 'hi' ? 'परामर्श समय व फीस' : 'Timings & Slots'}</span>
            </button>

            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'prescriptions'
                  ? 'bg-[#0F5257] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
              id="tab-doctor-prescriptions"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>{lang === 'hi' ? 'पर्चे व परामर्श इतिहास' : 'Digital Prescriptions'}</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-[#0F5257] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
              id="tab-doctor-analytics"
            >
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>{lang === 'hi' ? 'क्लिनिकल रिपोर्ट' : 'Practice Metrics'}</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-[#0F5257] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
              id="tab-doctor-profile"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>{lang === 'hi' ? 'डॉक्टर प्रोफाइल' : 'Doctor Profile'}</span>
            </button>
          </div>

          {/* Quick Counter Badges */}
          <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-stone-600 pl-4 border-l border-stone-200">
            <div>
              <span className="text-stone-400 text-[11px] block">{lang === 'hi' ? 'आज कुल' : 'Today Total'}</span>
              <span className="font-mono-num font-bold text-[#0F5257] text-sm">{todayAppointments.length}</span>
            </div>
            <div>
              <span className="text-stone-400 text-[11px] block">{lang === 'hi' ? 'प्रतीक्षारत' : 'Waiting'}</span>
              <span className="font-mono-num font-bold text-amber-600 text-sm">{waitingPatients.length}</span>
            </div>
            <div>
              <span className="text-stone-400 text-[11px] block">{lang === 'hi' ? 'सम्पन्न' : 'Examined'}</span>
              <span className="font-mono-num font-bold text-emerald-600 text-sm">{completedToday.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* =================================================================== */}
        {/* TAB 1: OPD CABIN & QUEUE (The Heart of the Doctor's Cockpit)        */}
        {/* =================================================================== */}
        {activeTab === 'cabin' && (
          <div className="space-y-6">
            {/* Active Cabin Consultation Box */}
            <div className="bg-white rounded-2xl border-2 border-[#0F5257] shadow-md overflow-hidden">
              <div className="bg-[#0F5257] px-5 py-3.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-400 text-teal-950 flex items-center justify-center font-bold">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-fraunces font-bold text-base tracking-wide flex items-center gap-2">
                      <span>{lang === 'hi' ? 'डॉक्टर परामर्श केबिन (Active Consultation)' : 'Doctor Consultation Cabin'}</span>
                      {currentCabinAppointment ? (
                        <span className="bg-emerald-500 text-white text-[10px] font-sans font-bold px-2 py-0.5 rounded-full animate-pulse">
                          ● {lang === 'hi' ? 'मरीज अंदर है' : 'In Cabin'}
                        </span>
                      ) : (
                        <span className="bg-teal-800 text-teal-200 text-[10px] font-sans font-medium px-2 py-0.5 rounded-full">
                          {lang === 'hi' ? 'केबिन खाली है' : 'Ready for next patient'}
                        </span>
                      )}
                    </h2>
                  </div>
                </div>

                {/* Call Next Button in Header */}
                <button
                  onClick={handleCallNextPatient}
                  disabled={waitingPatients.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#0F5257] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  id="doctor-call-next-btn"
                >
                  <Users className="w-4 h-4 text-teal-950" />
                  <span>{lang === 'hi' ? 'अगला मरीज बुलाएं (Next Patient)' : 'Call Next Patient to Cabin'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cabin Interior Details */}
              <div className="p-5 sm:p-6 bg-gradient-to-b from-teal-50/40 to-white">
                {currentCabinAppointment ? (
                  <div className="space-y-6">
                    {/* Patient Overview Strip */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-teal-200 shadow-2xs">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-16 h-12 rounded-xl bg-[#0F5257] text-amber-300 flex flex-col items-center justify-center shrink-0 font-mono-num px-1 shadow-xs">
                          <span className="text-[9px] uppercase tracking-wider text-teal-200/80 font-medium">OTP</span>
                          <span className="font-bold text-sm leading-tight">{currentCabinAppointment.appointmentNumber.replace('MDD-', '')}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-fraunces font-bold text-lg text-[#0F5257]">
                              {currentCabinAppointment.patientName}
                            </h3>
                            <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium">
                              {currentCabinAppointment.patientAge} {lang === 'hi' ? 'वर्ष' : 'yrs'}, {currentCabinAppointment.patientGender}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-stone-500 pt-0.5">
                            <span className="flex items-center gap-1 font-mono-num">
                              <Phone className="w-3 h-3 text-stone-400" />
                              +91 {currentCabinAppointment.patientPhone}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              Slot: {currentCabinAppointment.timeSlot}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                          currentCabinAppointment.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {currentCabinAppointment.paymentStatus === 'paid' ? '₹300 Paid' : 'Collect ₹300 at Desk'}
                        </span>

                        <button
                          onClick={() => setPrintRxAppointment(currentCabinAppointment)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-stone-600" />
                          <span>{lang === 'hi' ? 'पर्चा देखें' : 'View Slip'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Doctor Clinical Notes Entry Pad */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Left: Diagnosis & Symptoms */}
                      <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                        <label className="block text-xs font-bold text-[#0F5257] uppercase tracking-wider">
                          {lang === 'hi' ? '1. रोग निदान एवं लक्षण (Diagnosis & Complaints)' : '1. Clinical Diagnosis & Findings'}
                        </label>

                        {/* Quick tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {quickDiagnosisTags.map((tag, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setClinicalDiagnosis(prev => prev ? `${prev}, ${tag}` : tag);
                              }}
                              className="text-[11px] px-2 py-0.5 rounded bg-teal-50 hover:bg-teal-100 text-[#0F5257] border border-teal-200 cursor-pointer transition-colors"
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>

                        <textarea
                          rows={3}
                          placeholder={lang === 'hi' ? 'मरीज की शिकायतें, दृष्टि जांच (RE/LE), व लक्षण दर्ज करें...' : 'Enter symptoms, eye examination (RE/LE findings), intraocular pressure...'}
                          value={clinicalDiagnosis}
                          onChange={(e) => setClinicalDiagnosis(e.target.value)}
                          className="w-full p-3 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0F5257] focus:bg-white"
                        />
                      </div>

                      {/* Right: Prescription Advice & Follow-up */}
                      <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                        <label className="block text-xs font-bold text-[#0F5257] uppercase tracking-wider">
                          {lang === 'hi' ? '2. दवाई परामर्श एवं निर्देश (Rx Prescription)' : '2. Medication & Advice (Rx)'}
                        </label>

                        {/* Quick Rx tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {quickRxList.slice(0, 4).map((rx, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setPrescriptionRx(prev => prev ? `${prev}\n• ${rx}` : `• ${rx}`);
                              }}
                              className="text-[10px] px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 cursor-pointer transition-colors truncate max-w-xs"
                            >
                              + {rx.split('(')[0]}
                            </button>
                          ))}
                        </div>

                        <textarea
                          rows={3}
                          placeholder={lang === 'hi' ? 'दवाइयों का नाम, खुराक (1-0-1), दिन एवं परहेज लिखें...' : 'Medications, dosage, eye drops frequency and lifestyle precautions...'}
                          value={prescriptionRx}
                          onChange={(e) => setPrescriptionRx(e.target.value)}
                          className="w-full p-3 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0F5257] focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Follow-up & Finish Action Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-amber-50/80 rounded-xl border border-amber-200/80">
                      <div className="flex items-center gap-2 text-xs text-amber-950">
                        <Clock className="w-4 h-4 text-amber-700" />
                        <span className="font-semibold">{lang === 'hi' ? 'अगली जांच (Next Follow-up):' : 'Next Follow-up:'}</span>
                        <div className="flex gap-1">
                          {[3, 7, 15, 30].map((days) => (
                            <button
                              key={days}
                              type="button"
                              onClick={() => setFollowUpDays(days)}
                              className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer transition-colors ${
                                followUpDays === days
                                  ? 'bg-[#0F5257] text-white'
                                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
                              }`}
                            >
                              {days} {lang === 'hi' ? 'दिन' : 'Days'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setPrintRxAppointment(currentCabinAppointment)}
                          className="flex-1 sm:flex-initial px-4 py-2.5 bg-white hover:bg-stone-50 text-[#0F5257] border border-teal-700/50 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Printer className="w-4 h-4 text-teal-800" />
                          <span>{lang === 'hi' ? 'डिजिटल पर्चा प्रिंट' : 'Print Rx Prescription'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleCompleteConsultation}
                          disabled={isSavingConsultation}
                          className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                          id="doctor-complete-consultation-btn"
                        >
                          {isSavingConsultation ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>
                            {lang === 'hi' 
                              ? 'परामर्श पूर्ण करें (Done)' 
                              : 'Complete Consultation & Save Rx'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-teal-100 text-[#0F5257] flex items-center justify-center">
                      <Stethoscope className="w-7 h-7 stroke-[2]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-fraunces font-bold text-lg text-stone-800">
                        {lang === 'hi' ? 'केबिन में कोई मरीज नहीं है' : 'No Patient in Consultation Cabin'}
                      </h3>
                      <p className="text-xs text-stone-500 max-w-md mx-auto">
                        {waitingPatients.length > 0 
                          ? (lang === 'hi' 
                              ? `प्रतीक्षालय में ${waitingPatients.length} मरीज टोकन के साथ उपस्थित हैं। पहले मरीज को केबिन में बुलाने हेतु नीचे बटन दबाएं।` 
                              : `There are ${waitingPatients.length} patients waiting in the lounge. Click below to call the next patient into your cabin.`)
                          : (lang === 'hi' 
                              ? 'आज की सभी बुकिंग्स पूर्ण हो चुकी हैं या कोई नया मरीज कतार में नहीं है।' 
                              : 'All scheduled patients for today are examined, or waiting queue is empty.')}
                      </p>
                    </div>

                    {waitingPatients.length > 0 && (
                      <div className="pt-2">
                        <button
                          onClick={handleCallNextPatient}
                          className="px-6 py-3 bg-[#0F5257] hover:bg-[#166B71] text-amber-300 hover:text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2 group"
                        >
                          <Users className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                          <span>
                            {lang === 'hi' 
                              ? `टोकन OTP #${waitingPatients[0].appointmentNumber} को बुलाएं (${waitingPatients[0].patientName})` 
                              : `Call Token OTP #${waitingPatients[0].appointmentNumber} (${waitingPatients[0].patientName})`}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Today's Full Patient Queue List */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-fraunces font-bold text-base text-[#0F5257] flex items-center gap-2">
                    <span>{lang === 'hi' ? 'आज की मरीज ओपीडी कतार (Today’s OPD Queue)' : 'Today’s Patient Queue'}</span>
                    <span className="bg-teal-100 text-[#0F5257] text-xs font-mono-num font-bold px-2 py-0.5 rounded-full">
                      {filteredQueue.length}
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    {lang === 'hi' ? 'टोकन क्रम, आगमन स्थिति एवं परामर्श स्थिति' : 'Live token sequence, clinic check-in status & examination actions'}
                  </p>
                </div>

                {/* Search & Tabs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input 
                      type="text"
                      placeholder={lang === 'hi' ? 'नाम या टोकन खोजें...' : 'Search token or name...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs w-full sm:w-48 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#0F5257]"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex rounded-lg bg-stone-100 p-1 border border-stone-200 text-xs font-medium">
                    <button
                      onClick={() => setQueueFilter('all')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        queueFilter === 'all' ? 'bg-white text-[#0F5257] font-bold shadow-2xs' : 'text-stone-600'
                      }`}
                    >
                      {lang === 'hi' ? 'सभी' : 'All'}
                    </button>
                    <button
                      onClick={() => setQueueFilter('waiting')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        queueFilter === 'waiting' ? 'bg-white text-[#0F5257] font-bold shadow-2xs' : 'text-stone-600'
                      }`}
                    >
                      {lang === 'hi' ? 'प्रतीक्षारत' : 'Waiting'} ({waitingPatients.length})
                    </button>
                    <button
                      onClick={() => setQueueFilter('completed')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        queueFilter === 'completed' ? 'bg-white text-[#0F5257] font-bold shadow-2xs' : 'text-stone-600'
                      }`}
                    >
                      {lang === 'hi' ? 'सम्पन्न' : 'Done'} ({completedToday.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Table or Cards */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">{lang === 'hi' ? 'टोकन (OTP)' : 'Token (OTP)'}</th>
                      <th className="px-4 py-3">Patient Details</th>
                      <th className="px-4 py-3">Slot Time</th>
                      <th className="px-4 py-3">Check-In Status</th>
                      <th className="px-4 py-3">Fee / Payment</th>
                      <th className="px-4 py-3">Cabin Status</th>
                      <th className="px-4 py-3 text-right">Doctor Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredQueue.length > 0 ? (
                      filteredQueue.map((apt) => {
                        const isInCabin = apt.id === inCabinPatientId || apt.consultationStatus === 'in_cabin';
                        const isDone = apt.status === 'completed';

                        return (
                          <tr 
                            key={apt.id} 
                            className={`hover:bg-stone-50/80 transition-colors ${
                              isInCabin ? 'bg-teal-50/50 font-medium' : ''
                            }`}
                          >
                            <td className="px-4 py-3 font-mono-num font-bold text-[#0F5257]">
                              <span className="bg-teal-50 text-teal-900 border border-teal-200 px-2 py-0.5 rounded-md text-xs inline-block">
                                {apt.appointmentNumber}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-stone-900">{apt.patientName}</div>
                              <div className="text-[11px] text-stone-500">
                                {apt.patientAge}y, {apt.patientGender} • +91 {apt.patientPhone}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono-num text-stone-700">
                              {apt.timeSlot}
                            </td>
                            <td className="px-4 py-3">
                              {apt.arrivalStatus === 'scanned' || apt.arrivalStatus === 'arrived' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                                  <Check className="w-3 h-3" />
                                  {lang === 'hi' ? 'क्लीनिक में उपस्थित' : 'In Clinic'}
                                </span>
                              ) : (
                                <span className="text-stone-400 text-[11px]">
                                  {lang === 'hi' ? 'अभी नहीं पहुंचे' : 'Not arrived'}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                apt.paymentStatus === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                ₹{apt.fee} {apt.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {isInCabin ? (
                                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                  ● In Cabin
                                </span>
                              ) : isDone ? (
                                <span className="text-stone-500 text-[11px] flex items-center gap-1 font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Completed
                                </span>
                              ) : (
                                <span className="text-amber-700 text-[11px] font-semibold">
                                  Waiting in Queue
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {!isInCabin && !isDone && (
                                  <button
                                    onClick={() => handleCallPatient(apt)}
                                    className="px-2.5 py-1 bg-[#0F5257] hover:bg-[#166B71] text-amber-300 hover:text-white font-semibold text-[11px] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                  >
                                    {lang === 'hi' ? 'केबिन बुलाएं' : 'Call into Cabin'}
                                  </button>
                                )}

                                <button
                                  onClick={() => setPrintRxAppointment(apt)}
                                  className="p-1 text-stone-500 hover:text-[#0F5257] rounded hover:bg-stone-100 transition-colors cursor-pointer"
                                  title="View OPD Prescription / Slip"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-stone-500">
                          {lang === 'hi' ? 'कोई मरीज रिकॉर्ड नहीं मिला।' : 'No patients found matching criteria.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: OPD TIMINGS & SLOTS MANAGEMENT                               */}
        {/* =================================================================== */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="font-fraunces font-bold text-lg text-[#0F5257]">
                {lang === 'hi' ? 'परामर्श समय एवं स्लॉट प्रबंधन (Doctor Schedule & Fee)' : 'OPD Timings, Slots & Consultation Fee'}
              </h3>
              <p className="text-xs text-stone-500">
                {lang === 'hi' 
                  ? 'मरीजों के ऑनलाइन अपॉइंटमेंट हेतु उपलब्ध समय स्लॉट और परामर्श शुल्क यहां से नियंत्रित करें।' 
                  : 'Configure your active appointment slots and fees visible to patients in India.'}
              </p>
            </div>

            {/* Fee Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 bg-teal-50/50 rounded-xl border border-teal-100">
              <div>
                <label className="block text-xs font-bold text-[#0F5257] mb-1">
                  {lang === 'hi' ? 'प्राथमिक परामर्श शुल्क (OPD Consultation Fee in ₹)' : 'Consultation Fee (₹)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-stone-500 font-bold">₹</span>
                  <input 
                    type="number"
                    value={editableFee}
                    onChange={(e) => setEditableFee(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono-num font-bold focus:outline-hidden focus:ring-2 focus:ring-[#0F5257]"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  {lang === 'hi' ? 'भारत में क्लिनिक में सामान्य शुल्क ₹300 - ₹500 रहता है।' : 'Typical specialist fee in India is ₹300 - ₹500.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F5257] mb-1">
                  {lang === 'hi' ? 'उपलब्ध दिन (Available Days)' : 'Days Available'}
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <span 
                      key={day}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                        doctor.daysAvailable.includes(day)
                          ? 'bg-[#0F5257] text-white border-[#0F5257]'
                          : 'bg-stone-100 text-stone-400 border-stone-200'
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Slot Chips */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#0F5257] uppercase tracking-wider">
                {lang === 'hi' ? 'सक्रिय ओपीडी स्लॉट (Active Consultation Time Slots)' : 'Active Time Slots'}
              </label>

              <div className="flex flex-wrap gap-2">
                {editableSlots.map((slot) => (
                  <div 
                    key={slot} 
                    className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-mono-num font-semibold"
                  >
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    <span>{slot}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSlot(slot)}
                      className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove slot"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Slot */}
              <div className="flex items-center gap-2 pt-2 max-w-sm">
                <input 
                  type="text" 
                  placeholder="e.g. 02:00 PM or 07:00 PM"
                  value={newSlotInput}
                  onChange={(e) => setNewSlotInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono-num focus:outline-hidden focus:ring-2 focus:ring-[#0F5257]"
                />
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Save Schedule Changes */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <div>
                {scheduleSuccessMsg && (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {lang === 'hi' ? 'समय एवं शुल्क सफलतापूर्वक अपडेट हुआ!' : 'Schedule & fees saved successfully!'}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveSchedule}
                disabled={isSavingSchedule}
                className="px-6 py-2.5 bg-[#0F5257] hover:bg-[#166B71] text-amber-300 hover:text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                id="doctor-save-schedule-btn"
              >
                {isSavingSchedule ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{lang === 'hi' ? 'परिवर्तन सुरक्षित करें' : 'Save Changes to Clinic Portal'}</span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: DIGITAL PRESCRIPTIONS & RX SLIP HISTORY                     */}
        {/* =================================================================== */}
        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="font-fraunces font-bold text-lg text-[#0F5257]">
                {lang === 'hi' ? 'डिजिटल पर्चा एवं परामर्श इतिहास (Digital OPD Prescriptions)' : 'Digital Prescriptions & Consultation History'}
              </h3>
              <p className="text-xs text-stone-500">
                {lang === 'hi' 
                  ? 'आपके द्वारा जारी किए गए सभी डिजिटल पर्चे, दवाइयां एवं मरीज इतिहास।' 
                  : 'View past consultation slips, diagnosis and prescribed medications.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctorAppointments.filter(a => a.status === 'completed' || a.clinicalNotes || a.prescriptionRx).map((apt) => (
                <div 
                  key={apt.id} 
                  className="p-4 rounded-xl border border-stone-200 hover:border-teal-400 bg-stone-50/60 hover:bg-white transition-all space-y-3 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono-num font-bold text-xs text-[#0F5257] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {apt.appointmentNumber}
                      </span>
                      <h4 className="font-fraunces font-bold text-stone-900 pt-1 text-sm">
                        {apt.patientName}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        {apt.patientAge}y, {apt.patientGender} • {apt.date} at {apt.timeSlot}
                      </p>
                    </div>

                    <button
                      onClick={() => setPrintRxAppointment(apt)}
                      className="px-2.5 py-1 bg-white hover:bg-stone-100 text-[#0F5257] border border-stone-300 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Rx</span>
                    </button>
                  </div>

                  {apt.clinicalNotes && (
                    <div className="text-xs bg-white p-2.5 rounded-lg border border-stone-200">
                      <span className="font-bold text-[#0F5257] block text-[10px] uppercase">Diagnosis / Notes:</span>
                      <span className="text-stone-700">{apt.clinicalNotes}</span>
                    </div>
                  )}

                  {apt.prescriptionRx && (
                    <div className="text-xs bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/80">
                      <span className="font-bold text-amber-900 block text-[10px] uppercase">Rx Advice:</span>
                      <pre className="text-stone-700 font-sans whitespace-pre-wrap">{apt.prescriptionRx}</pre>
                    </div>
                  )}

                  {apt.followUpDate && (
                    <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Next Follow-up on or before {apt.followUpDate}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {doctorAppointments.filter(a => a.status === 'completed' || a.clinicalNotes || a.prescriptionRx).length === 0 && (
              <div className="text-center py-8 text-stone-500 text-xs">
                {lang === 'hi' 
                  ? 'अभी तक कोई डिजिटल पर्चा पूर्ण नहीं हुआ है। केबिन में मरीज देखकर पर्चा जारी करें।' 
                  : 'No completed prescriptions logged yet. Examine a patient in the cabin to generate an Rx.'}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: PRACTICE & CLINIC METRICS                                   */}
        {/* =================================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                <span className="text-xs text-stone-500 font-medium uppercase tracking-wider block">
                  {lang === 'hi' ? 'आज कुल परामर्श' : 'Total Patients Today'}
                </span>
                <div className="text-2xl font-bold font-fraunces text-[#0F5257]">
                  {todayAppointments.length}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{completedToday.length} {lang === 'hi' ? 'सम्पन्न हो चुके' : 'Examined & Discharged'}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                <span className="text-xs text-stone-500 font-medium uppercase tracking-wider block">
                  {lang === 'hi' ? 'परामर्श फीस संग्रह (आज)' : 'OPD Fee Volume (Est.)'}
                </span>
                <div className="text-2xl font-bold font-fraunces text-amber-600">
                  ₹{totalRevenueToday.toLocaleString()}
                </div>
                <div className="text-[11px] text-stone-500">
                  ₹{doctor.fee} {lang === 'hi' ? 'प्रति परामर्श' : 'per consultation'}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                <span className="text-xs text-stone-500 font-medium uppercase tracking-wider block">
                  {lang === 'hi' ? 'मरीज संतुष्टि रेटिंग' : 'Patient Satisfaction'}
                </span>
                <div className="text-2xl font-bold font-fraunces text-emerald-700 flex items-center gap-1.5">
                  <span>{doctor.rating}</span>
                  <span className="text-amber-400 text-lg">★</span>
                </div>
                <div className="text-[11px] text-stone-500">
                  {doctor.patientsServed.toLocaleString()}+ {lang === 'hi' ? 'इलाज किए गए मरीज' : 'patients in India network'}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                <span className="text-xs text-stone-500 font-medium uppercase tracking-wider block">
                  {lang === 'hi' ? 'औसत परामर्श समय' : 'Avg. Consultation'}
                </span>
                <div className="text-2xl font-bold font-fraunces text-[#0F5257]">
                  12-15 min
                </div>
                <div className="text-[11px] text-teal-700 font-medium">
                  {lang === 'hi' ? 'कम प्रतीक्षा, सटीक जांच' : 'High clinical efficiency'}
                </div>
              </div>
            </div>

            {/* Local Dehri Healthcare Context */}
            <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E6E0D4] space-y-2">
              <h4 className="font-fraunces font-bold text-sm text-[#0F5257]">
                {lang === 'hi' ? 'डेहरी-ऑन-सोन क्लिनिकल नेटवर्क' : 'Dehri-on-Sone Clinical Network Notes'}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {lang === 'hi'
                  ? `आप ${clinic?.name || doctor.clinicName} के वरिष्ठ विशेषज्ञ के रूप में पंजीकृत हैं। मरीज CliniKaro पोर्टल या स्टेशन रोड क्लिनिक रिसेप्शन से टोकन लेकर आते हैं। सभी ओपीडी पर्चियां स्थानीय फार्मेसी एवं डायग्नोस्टिक सेंटर पर डिजिटल रूप से मान्य हैं।`
                  : `You are designated as the Chief Specialist at ${clinic?.name || doctor.clinicName}. Patients book via the CliniKaro digital platform or walk-in through the Station Road reception desk. All digital Rx slips are recognized by partner pharmacies and laboratories across Rohtas.`}
              </p>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: PUBLIC PROFILE PREVIEW                                      */}
        {/* =================================================================== */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-fraunces font-bold text-lg text-[#0F5257]">
                  {lang === 'hi' ? 'डॉक्टर का परिचय व क्रेडेंशियल्स' : 'Doctor Profile & Credentials'}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === 'hi' ? 'CliniKaro नेटवर्क पर आपका आधिकारिक विवरण और क्लिनिकल योग्यता।' : 'Your official credentials and clinical background in the CliniKaro healthcare network.'}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
              <div className="flex items-start gap-4">
                <img 
                  src={doctor.photoUrl} 
                  alt={doctor.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-stone-300"
                />
                <div className="space-y-1">
                  <h4 className="font-fraunces font-bold text-lg text-[#0F5257]">
                    {doctor.name} ({doctor.nameHindi})
                  </h4>
                  <p className="text-xs text-stone-600 font-semibold">
                    {doctor.qualification}
                  </p>
                  <p className="text-xs text-amber-800 font-medium">
                    {doctor.specialty} • {doctor.experienceYears}+ years
                  </p>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-3 space-y-2">
                <span className="font-bold text-xs text-[#0F5257] uppercase tracking-wider block">
                  About Dr. R. K. Sharma
                </span>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {doctor.about}
                </p>
                <p className="text-xs text-stone-600 leading-relaxed font-hindi">
                  {doctor.aboutHindi}
                </p>
              </div>
            </div>

            {/* Razorpay Route Direct Settlement & Bank Accounts */}
            <div className="rounded-2xl border-2 border-[#0F5257]/30 bg-gradient-to-br from-slate-900 via-[#0A2230] to-teal-950 text-white p-6 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0D74EC] flex items-center justify-center text-white shadow-sm shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-fraunces font-bold text-base text-white">
                        {lang === 'hi' ? 'Razorpay Route सीधा बैंक सेटलमेंट' : 'Razorpay Route Direct Settlement'}
                      </h4>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                        {doctor.paymentOnboardingStatus === 'active' || doctor.razorpayAccountId ? 'Active' : 'Not Configured'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">
                      {lang === 'hi'
                        ? 'मरीजों द्वारा दिए गए ऑनलाइन शुल्क का सीधा आपके बैंक खाते में 100% भुगतान।'
                        : 'Prepaid patient fees are split and transferred directly into your personal bank account.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingBankDetails(!isEditingBankDetails)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5 text-teal-300" />
                  <span>{isEditingBankDetails ? (lang === 'hi' ? 'बंद करें' : 'Close') : (lang === 'hi' ? 'बैंक खाता बदलें' : 'Update Bank Account')}</span>
                </button>
              </div>

              {bankSuccessMsg && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    {lang === 'hi'
                      ? 'आपके बैंक एवं Razorpay Route खाते का विवरण सुरक्षित कर लिया गया है।'
                      : 'Bank and Razorpay Route account details updated successfully!'}
                  </span>
                </div>
              )}

              {/* Status & Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider block font-medium">
                    Route Linked ID
                  </span>
                  <span className="font-mono text-xs font-bold text-teal-300 block truncate">
                    {doctor.razorpayAccountId || routeAccountId || `acc_${doctor.id.replace(/-/g, '_')}`}
                  </span>
                  <span className="text-[10px] text-gray-400">Razorpay Marketplace Node</span>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider block font-medium">
                    Settlement Model
                  </span>
                  <span className="font-bold text-emerald-300 block text-xs">
                    {doctor.platformCommissionPercent && doctor.platformCommissionPercent > 0
                      ? `${100 - doctor.platformCommissionPercent}% Payout (${doctor.platformCommissionPercent}% Platform)`
                      : '100% Direct to Doctor (0% Fee)'}
                  </span>
                  <span className="text-[10px] text-gray-400">Automated T+1 or Instant</span>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider block font-medium">
                    Prepaid Online Patients
                  </span>
                  <span className="font-mono-num font-bold text-amber-300 text-xs block">
                    {appointments.filter(a => a.doctorId === doctor.id && a.paymentStatus === 'paid' && a.paymentType === 'online_prepaid').length} Bookings Settled
                  </span>
                  <span className="text-[10px] text-gray-400">Via UPI / Cards / NetBanking</span>
                </div>
              </div>

              {/* Current Linked Bank Info / Form */}
              {!isEditingBankDetails ? (
                <div className="bg-black/20 border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-300 border-b border-white/10 pb-2">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-teal-400" />
                      {lang === 'hi' ? 'सत्यापित बैंक खाता (Settlement Bank)' : 'Verified Settlement Bank'}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono font-medium">
                      ✓ Ready for Direct Credits
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 text-[10px] block">Holder Name</span>
                      <span className="font-semibold text-white">{doctor.accountHolderName || doctor.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block">Bank Name</span>
                      <span className="font-semibold text-white">{doctor.bankName || 'HDFC Bank'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block">Account Number</span>
                      <span className="font-mono text-white">{doctor.bankAccountNumber || '•••• •••• 8841'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block">IFSC Code / UPI</span>
                      <span className="font-mono text-teal-300">{doctor.bankIfsc || 'HDFC0001245'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveBankDetails} className="bg-black/30 border border-white/15 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-teal-300">
                      {lang === 'hi' ? 'नया बैंक खाता विवरण भरें' : 'Update Settlement Bank Credentials'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Protected via 256-bit encryption
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Bank Account Holder Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={bankHolderName}
                        onChange={(e) => setBankHolderName(e.target.value)}
                        placeholder="Dr. R. K. Sharma"
                        className="w-full px-3 py-1.5 rounded-xl border border-white/20 text-xs bg-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Bank Name (e.g. SBI, HDFC, ICICI, PNB) *
                      </label>
                      <input
                        type="text"
                        required
                        value={bankInstitution}
                        onChange={(e) => setBankInstitution(e.target.value)}
                        placeholder="HDFC Bank"
                        className="w-full px-3 py-1.5 rounded-xl border border-white/20 text-xs bg-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Bank Account Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={bankAccNum}
                        onChange={(e) => setBankAccNum(e.target.value)}
                        placeholder="50100234988410"
                        className="w-full px-3 py-1.5 rounded-xl border border-white/20 text-xs font-mono bg-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Bank IFSC Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={bankIfscCode}
                        onChange={(e) => setBankIfscCode(e.target.value.toUpperCase())}
                        placeholder="HDFC0001245"
                        className="w-full px-3 py-1.5 rounded-xl border border-white/20 text-xs font-mono uppercase bg-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Doctor UPI ID (VPA - Optional)
                      </label>
                      <input
                        type="text"
                        value={doctorVpa}
                        onChange={(e) => setDoctorVpa(e.target.value)}
                        placeholder="drsharma@okhdfcbank"
                        className="w-full px-3 py-1.5 rounded-xl border border-white/20 text-xs font-mono bg-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Razorpay Route Linked Account ID
                      </label>
                      <input
                        type="text"
                        value={routeAccountId}
                        onChange={(e) => setRouteAccountId(e.target.value)}
                        placeholder={`acc_${doctor.id.replace(/-/g, '_')}`}
                        className="w-full px-3 py-1.5 rounded-xl border border-white/20 text-xs font-mono bg-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsEditingBankDetails(false)}
                      className="px-3.5 py-1.5 rounded-xl border border-white/20 text-xs text-gray-300 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingBank}
                      className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSavingBank ? (
                        <span>Saving...</span>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Save & Verify Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* =================================================================== */}
      {/* DIGITAL PRESCRIPTION MODAL                                          */}
      {/* =================================================================== */}
      {printRxAppointment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-300 p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0F5257]" />
                <h3 className="font-fraunces font-bold text-base text-[#0F5257]">
                  Official Digital OPD Prescription Slip
                </h3>
              </div>
              <button
                onClick={() => setPrintRxAppointment(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Prescription Layout */}
            <div className="p-6 bg-white border-2 border-stone-800 rounded-xl space-y-5 text-stone-900 font-sans">
              {/* Rx Clinic Header */}
              <div className="flex items-start justify-between border-b-2 border-stone-800 pb-4">
                <div>
                  <h2 className="font-fraunces font-bold text-xl text-[#0F5257]">
                    {doctor.name}
                  </h2>
                  <p className="text-xs font-semibold text-stone-800">
                    {doctor.qualification}
                  </p>
                  <p className="text-xs text-stone-600">
                    {doctor.specialty} • Reg. No: BI-MED-2012-0894
                  </p>
                  <p className="text-xs text-stone-500 font-medium">
                    {clinic?.name || doctor.clinicName} • Dehri-on-Sone, Rohtas
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-mono-num font-bold text-sm bg-teal-50 px-2.5 py-1 rounded border border-teal-300 text-[#0F5257]">
                    Token #{printRxAppointment.appointmentNumber}
                  </div>
                  <p className="text-[11px] text-stone-500 pt-1">
                    Date: {printRxAppointment.date}
                  </p>
                </div>
              </div>

              {/* Patient Demographics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2 border-b border-stone-200">
                <div>
                  <span className="text-stone-500 block text-[10px]">Patient Name:</span>
                  <span className="font-bold">{printRxAppointment.patientName}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Age / Gender:</span>
                  <span className="font-semibold">{printRxAppointment.patientAge}y / {printRxAppointment.patientGender}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Mobile:</span>
                  <span className="font-mono-num font-semibold">+91 {printRxAppointment.patientPhone}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Fee Status:</span>
                  <span className="font-bold text-emerald-700">₹{printRxAppointment.fee} (Verified)</span>
                </div>
              </div>

              {/* Clinical Findings */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#0F5257] uppercase tracking-wider block">
                  Diagnosis & Examination Findings:
                </span>
                <p className="text-xs text-stone-800 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                  {printRxAppointment.clinicalNotes || clinicalDiagnosis || 'Routine Eye Examination, visual acuity normal, no signs of acute inflammation.'}
                </p>
              </div>

              {/* Rx Medication Advice */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-fraunces font-bold text-base text-[#0F5257]">Rx</span>
                  <span className="text-[11px] text-stone-500">Prescribed Medication & Directions:</span>
                </div>
                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 text-xs font-mono">
                  {printRxAppointment.prescriptionRx || prescriptionRx || (
                    <span>
                      • Tab. Paracetamol 650mg (1-0-1) x 3 days<br/>
                      • Eye Drops Carboxymethylcellulose 0.5% (4 times daily) x 15 days<br/>
                      • Wear UV sunglasses in bright outdoor daylight
                    </span>
                  )}
                </div>
              </div>

              {/* Follow-up & Doctor Stamp */}
              <div className="flex items-end justify-between pt-4 border-t border-stone-200 text-xs">
                <div>
                  <span className="text-stone-500 block text-[10px]">Next Review Date:</span>
                  <span className="font-bold text-teal-900">
                    {printRxAppointment.followUpDate || 'After 7 days as needed'}
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-28 border-b border-stone-400 mx-auto" />
                  <span className="text-[11px] font-bold text-[#0F5257] block">
                    {doctor.name}
                  </span>
                  <span className="text-[9px] text-stone-500 block">
                    Authorized Medical Signature
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPrintRxAppointment(null)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-[#0F5257] hover:bg-[#166B71] text-amber-300 hover:text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Prescription</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

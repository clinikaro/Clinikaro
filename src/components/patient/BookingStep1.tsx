import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  ChevronRight, 
  ShieldCheck, 
  Building2,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { Doctor, Clinic, Language, AppUser } from '../../types';
import { translations } from '../../data/translations';
import { DateTimeSelector } from './DateTimeSelector';
import { GoogleMapLinkButton } from '../common/GoogleMapLinkButton';

interface BookingStep1Props {
  doctor: Doctor;
  clinic?: Clinic;
  selectedDate: string;
  selectedSlot: string;
  lang: Language;
  currentUser?: AppUser | null;
  onBack: () => void;
  onProceedToStep2: (
    patientData: {
      name: string;
      age: number;
      gender: 'male' | 'female' | 'other';
      phone: string;
    },
    chosenDate?: string,
    chosenSlot?: string
  ) => void;
}

export const BookingStep1: React.FC<BookingStep1Props> = ({
  doctor,
  clinic,
  selectedDate,
  selectedSlot,
  lang,
  currentUser,
  onBack,
  onProceedToStep2
}) => {
  const t = translations[lang];

  const isGuest = currentUser?.isGuest || currentUser?.displayName === 'Guest' || currentUser?.displayName?.includes('Rajesh');
  const initialName = isGuest ? '' : (currentUser?.displayName || '');
  const initialPhone = currentUser?.phoneNumber ? currentUser.phoneNumber.replace('+91', '').trim() : '';

  const [currentDate, setCurrentDate] = useState<string>(
    selectedDate || new Date().toISOString().split('T')[0]
  );
  const [currentSlot, setCurrentSlot] = useState<string>(
    selectedSlot || doctor.timeSlots[0] || '10:30 AM'
  );

  const [name, setName] = useState(initialName);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentDate) {
      setError(lang === 'hi' ? 'कृपया अपॉइंटमेंट की तारीख चुनें' : 'Please select an appointment date');
      return;
    }

    if (!currentSlot) {
      setError(lang === 'hi' ? 'कृपया समय स्लॉट चुनें' : 'Please select a time slot');
      return;
    }

    if (!name.trim()) {
      setError(lang === 'hi' ? 'कृपया मरीज का नाम दर्ज करें' : 'Please enter patient name');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 125) {
      setError(lang === 'hi' ? 'कृपया मान्य उम्र दर्ज करें' : 'Please enter valid age');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError(lang === 'hi' ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें' : 'Please enter a 10-digit mobile number');
      return;
    }

    onProceedToStep2(
      {
        name: name.trim(),
        age: ageNum,
        gender,
        phone: cleanPhone
      },
      currentDate,
      currentSlot
    );
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#0F5257] hover:text-[#D4A24C] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? 'वापस डॉक्टर प्रोफ़ाइल' : 'Back to Doctor'}</span>
        </button>
      </div>

      {/* Booking progress header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-[#D4A24C]">
          <span className="bg-[#D4A24C] text-[#14282B] w-5 h-5 rounded-full flex items-center justify-center font-mono-num text-[11px]">
            1
          </span>
          <span>{lang === 'hi' ? 'चरण 1: तारीख, समय एवं मरीज विवरण' : 'Step 1: Date, Timing & Patient Info'}</span>
        </div>
        <h1 className="font-fraunces text-2xl font-bold text-[#0F5257]">
          {lang === 'hi' ? 'अपॉइंटमेंट स्लॉट व विवरण भरें' : 'Choose Slot & Enter Details'}
        </h1>
        <p className="text-xs text-gray-500">
          {lang === 'hi' 
            ? 'अपनी सुविधानुसार क्लिनिक ओपीडी तारीख व समय चुनें और मरीज की जानकारी भरें।'
            : 'Select preferred OPD date, time slot, and patient details for instant clinic token.'}
        </p>
      </div>

      {/* Selected Doctor Summary Card */}
      <div className="bg-teal-50/70 border border-teal-900/15 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <img
            src={doctor.photoUrl}
            alt={doctor.name}
            className="w-14 h-14 rounded-xl object-cover border border-teal-900/20 shrink-0 shadow-2xs"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-fraunces font-bold text-sm text-[#0F5257] truncate">
              {lang === 'hi' && doctor.nameHindi ? doctor.nameHindi : doctor.name}
            </h4>
            <p className="text-xs text-[#D4A24C] font-semibold truncate">
              {lang === 'hi' && doctor.specialtyHindi ? doctor.specialtyHindi : doctor.specialty}
            </p>
            <p className="text-[11px] text-gray-700 font-medium truncate flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-teal-700 shrink-0" />
              <span>{clinic?.name || doctor.clinicName}</span>
            </p>
            {(doctor.address || clinic?.address) && (
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-600 truncate">
                <MapPin className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                <span className="truncate">{lang === 'hi' && clinic?.addressHindi ? clinic.addressHindi : (clinic?.address || doctor.address)}</span>
                <GoogleMapLinkButton
                  target={{
                    clinicName: clinic?.name || doctor.clinicName,
                    name: doctor.name,
                    address: clinic?.address || doctor.address,
                    city: clinic?.city || doctor.city,
                    landmark: clinic?.landmark || doctor.landmark,
                    pincode: clinic?.pincode || doctor.pincode,
                    lat: clinic?.lat || doctor.lat,
                    lng: clinic?.lng || doctor.lng
                  }}
                  lang={lang}
                  variant="badge"
                />
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-gray-500 block">{t.consultationFee}</span>
            <span className="font-fraunces text-lg font-bold text-[#0F5257] font-mono-num">
              ₹{doctor.fee}
            </span>
          </div>
        </div>
      </div>

      {/* Step 1A: Interactive Date & Timing Slot Selection */}
      <div className="bg-white rounded-2xl border-2 border-teal-900/15 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#0F5257] text-[#D4A24C] text-[11px] font-mono-num flex items-center justify-center font-bold">
              1
            </span>
            <h3 className="font-fraunces font-bold text-base text-[#0F5257]">
              {lang === 'hi' ? 'अपॉइंटमेंट की तारीख और समय चुनें' : 'Choose Appointment Date & Time'}
            </h3>
          </div>
          <span className="text-[10px] text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            {lang === 'hi' ? 'सक्रिय स्लॉट' : 'Live Slot'}
          </span>
        </div>

        <DateTimeSelector
          doctor={doctor}
          selectedDate={currentDate}
          selectedSlot={currentSlot}
          lang={lang}
          onSelectDate={setCurrentDate}
          onSelectSlot={setCurrentSlot}
        />
      </div>

      {/* Step 1B: Patient Details Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-teal-900/15 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <span className="w-5 h-5 rounded-full bg-[#0F5257] text-[#D4A24C] text-[11px] font-mono-num flex items-center justify-center font-bold">
            2
          </span>
          <h3 className="font-fraunces font-bold text-base text-[#0F5257]">
            {lang === 'hi' ? 'मरीज का विवरण दर्ज करें' : 'Enter Patient Details'}
          </h3>
        </div>

        {currentUser && (
          <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-xl flex items-center justify-between text-xs text-teal-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {lang === 'hi' ? 'पंजीकृत मरीज:' : 'Registered Patient:'}{' '}
                <strong className="text-[#0F5257]">{currentUser.displayName || currentUser.email}</strong>
              </span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
              {lang === 'hi' ? 'सत्यापित' : 'Verified'}
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-800 text-xs p-3 rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Patient Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 block">
            {t.patientName} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lang === 'hi' ? 'उदा. रामेश्वर सिंह' : 'e.g. Rameshwar Singh'}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-700 font-work"
              id="patient-name-input"
            />
          </div>
        </div>

        {/* Age & Gender in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Patient Age */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 block">
              {t.patientAge} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 35"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-700 font-mono-num"
              id="patient-age-input"
            />
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 block">
              {t.patientGender} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              {(['male', 'female', 'other'] as const).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                    gender === g
                      ? 'bg-[#0F5257] text-white border-[#0F5257] font-semibold'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {g === 'male' ? t.male : g === 'female' ? t.female : t.other}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Number */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 block">
            {t.patientPhone} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-500 font-mono-num">
              <span>+91</span>
              <span className="text-gray-300">|</span>
            </div>
            <input
              type="tel"
              required
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="9835012345"
              className="w-full pl-16 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-700 font-mono-num tracking-wide"
              id="patient-phone-input"
            />
          </div>
          <p className="text-[11px] text-gray-500 pt-0.5 leading-relaxed">
            {t.phoneNote}
          </p>
        </div>

        {/* Submit with Live Slot Summary */}
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-teal-900 bg-teal-50 px-3 py-2 rounded-xl">
            <span className="font-medium">
              {lang === 'hi' ? 'तारीख व समय:' : 'Selected Slot:'}{' '}
              <strong className="text-[#0F5257]">{currentDate} ({currentSlot})</strong>
            </span>
            <span className="font-bold text-[#0F5257] font-mono-num">
              ₹{doctor.fee}
            </span>
          </div>

          <button
            type="submit"
            id="proceed-to-payment-btn"
            className="w-full py-3.5 px-4 rounded-xl bg-[#0F5257] hover:bg-[#0A3A3D] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t.continueToPayment}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

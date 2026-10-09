import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  Star, 
  Clock, 
  Calendar, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  Award,
  ChevronRight,
  PhoneCall,
  AlertCircle
} from 'lucide-react';
import { Doctor, Clinic, Language } from '../../types';
import { translations } from '../../data/translations';
import { DateTimeSelector } from './DateTimeSelector';
import { ContactDoctorModal } from '../common/ContactDoctorModal';
import { isDoctorBookingAvailable } from '../../utils/bookingAvailability';
import { GoogleMapAddressCard } from '../common/GoogleMapAddressCard';
import { GoogleMapLinkButton } from '../common/GoogleMapLinkButton';

interface DoctorProfileProps {
  doctor: Doctor;
  clinic?: Clinic;
  lang: Language;
  onBack: () => void;
  onSelectClinic: (clinic: Clinic) => void;
  onProceedToBooking: (doctor: Doctor, selectedDate: string, selectedSlot: string) => void;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = ({
  doctor,
  clinic,
  lang,
  onBack,
  onSelectClinic,
  onProceedToBooking
}) => {
  const t = translations[lang];

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string>(doctor.timeSlots[0] || '10:30 AM');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const isBookingAllowed = isDoctorBookingAvailable(doctor, clinic);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#0F5257] hover:text-[#D4A24C] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? 'वापस जाएं' : 'Back'}</span>
        </button>
      </div>

      {/* Doctor Hero Card */}
      <div className="bg-white rounded-3xl border border-teal-900/10 p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {/* Doctor Image */}
          <div className="relative mx-auto sm:mx-0">
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-2 border-teal-900/10 shadow-sm"
            />
            {doctor.isVipBoosted && (
              <span className="absolute -bottom-2 -right-1 bg-[#D4A24C] text-[#14282B] text-xs font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 border border-amber-200">
                <Sparkles className="w-3 h-3 fill-current" />
                VIP
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-fraunces text-xl sm:text-3xl font-bold text-[#0F5257]">
                {lang === 'hi' && doctor.nameHindi ? doctor.nameHindi : doctor.name}
              </h1>
              <span title={t.verifiedBadge} className="inline-flex items-center">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
              </span>
            </div>

            <p className="text-sm font-semibold text-[#D4A24C]">
              {lang === 'hi' && doctor.specialtyHindi ? doctor.specialtyHindi : doctor.specialty}
            </p>

            <p className="text-xs text-gray-600 font-medium">
              {doctor.qualification}
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-3 text-xs pt-1 flex-wrap">
              <span className="bg-teal-50 text-teal-900 px-2.5 py-1 rounded-lg font-medium border border-teal-100 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-teal-700" />
                {doctor.experienceYears}+ {t.exp}
              </span>
              <span className="bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg font-medium border border-amber-100 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {doctor.rating} Rating ({doctor.patientsServed}+ patients)
              </span>
            </div>

            {/* Fee badge, Direct Contact button & Doctor Admin Toggle */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">{t.consultationFee}:</span>
                <span className="font-fraunces text-2xl font-bold text-[#0F5257] font-mono-num">
                  ₹{doctor.fee}
                </span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded">
                  {lang === 'hi' ? 'क्लिनिक पर भुगतान' : 'Pay at Clinic'}
                </span>
              </div>

              {/* Direct Contact Button in Hero */}
              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-[#8F520A] text-xs font-bold transition-all cursor-pointer shadow-2xs"
                id="doctor-profile-hero-contact-btn"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                <span>{lang === 'hi' ? 'सीधे संपर्क करें (Contact Now)' : 'Contact Now'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clinic Info Box */}
        {clinic && (
          <div 
            onClick={() => onSelectClinic(clinic)}
            className="mt-6 p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-teal-700 hover:bg-teal-50/30 transition-all cursor-pointer flex items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  {lang === 'hi' ? 'क्लिनिक / अस्पताल' : 'Consults At'}
                </p>
                <h4 className="font-fraunces font-bold text-sm text-[#0F5257]">
                  {lang === 'hi' && clinic.nameHindi ? clinic.nameHindi : clinic.name}
                </h4>
                <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span>{lang === 'hi' && clinic.addressHindi ? clinic.addressHindi : clinic.address}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <GoogleMapLinkButton
                target={{
                  clinicName: clinic.name,
                  name: doctor.name,
                  address: clinic.address,
                  city: clinic.city,
                  landmark: clinic.landmark,
                  pincode: clinic.pincode,
                  lat: clinic.lat || doctor.lat,
                  lng: clinic.lng || doctor.lng
                }}
                lang={lang}
                variant="badge"
              />
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </div>
          </div>
        )}
      </div>

      {/* About Section */}
      <div className="bg-white rounded-2xl border border-teal-900/10 p-5 sm:p-6 space-y-2">
        <h3 className="font-fraunces text-lg font-bold text-[#0F5257]">
          {t.aboutDoc}
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed font-work">
          {lang === 'hi' && doctor.aboutHindi ? doctor.aboutHindi : doctor.about}
        </p>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="bg-white rounded-2xl border border-teal-900/10 p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-fraunces text-lg font-bold text-[#0F5257] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#D4A24C]" />
            <span>{t.weeklySchedule}</span>
          </h3>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
            {doctor.availableToday ? (lang === 'hi' ? 'आज क्लिनिक खुला है' : 'Available Today') : (lang === 'hi' ? 'आज अवकाश है' : 'On Leave Today')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1 text-xs">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
            const isAvail = doctor.daysAvailable.includes(day);
            return (
              <div 
                key={day}
                className={`p-2.5 rounded-xl text-center border ${
                  isAvail 
                    ? 'bg-teal-50 text-teal-900 border-teal-200 font-semibold' 
                    : 'bg-gray-50 text-gray-400 border-gray-100'
                }`}
              >
                <div className="font-bold">{day}</div>
                <div className="text-[10px] mt-0.5">
                  {isAvail ? '10am - 7pm' : 'Closed'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinic/Hospital Location & Google Maps Navigation Section */}
      <GoogleMapAddressCard
        title={lang === 'hi' ? 'क्लिनिक/अस्पताल का पता एवं गूगल मैप्स नेविगेशन' : 'Clinic / Hospital Location & Google Maps Navigation'}
        name={clinic?.name || doctor.clinicName}
        nameHindi={clinic?.nameHindi}
        address={clinic?.address || doctor.address || 'OPD Clinic'}
        addressHindi={clinic?.addressHindi}
        landmark={clinic?.landmark || doctor.landmark}
        city={clinic?.city || doctor.city}
        state={clinic?.state || doctor.state}
        pincode={clinic?.pincode || doctor.pincode}
        phone={clinic?.phone || doctor.contactPhone}
        lat={clinic?.lat || doctor.lat}
        lng={clinic?.lng || doctor.lng}
        lang={lang}
        showMapPreview={true}
      />

      {/* Slot Picker for Booking OR Contact Notice if booking paused */}
      <div className="bg-white rounded-2xl border-2 border-teal-900/20 p-5 sm:p-6 space-y-4 shadow-sm" id="slot-picker-section">
        {!isBookingAllowed ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-fraunces font-bold text-amber-950 text-base">
                  {lang === 'hi' ? 'ऑनलाइन अपॉइंटमेंट बुकिंग वर्तमान में बंद है' : 'Online Appointment Booking Paused'}
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {lang === 'hi'
                    ? 'इस डॉक्टर / क्लिनिक द्वारा ऑनलाइन टोकन बुकिंग अस्थायी रूप से रोकी गई है। परामर्श, क्लिनिक उपलब्धता और ओपीडी पर्ची हेतु सीधे डॉक्टर या क्लिनिक रिसेप्शन से फोन या व्हाट्सएप पर संपर्क करें।'
                    : 'Online slot booking is temporarily paused for this doctor. You can easily consult and schedule your visit by contacting the doctor or clinic reception directly.'}
                </p>
              </div>
            </div>

            <div className="pt-1 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{lang === 'hi' ? 'अभी संपर्क करें (Contact Now)' : 'Contact Now (Call / WhatsApp)'}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h3 className="font-fraunces text-lg font-bold text-[#0F5257]">
                {t.selectTimeSlot}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === 'hi' ? 'तारीख और अपने अनुकूल समय स्लॉट का चयन करें' : 'Pick preferred date and time for clinic visit'}
              </p>
            </div>

            <DateTimeSelector
              doctor={doctor}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              lang={lang}
              onSelectDate={setSelectedDate}
              onSelectSlot={setSelectedSlot}
            />
          </>
        )}
      </div>

      {/* Sticky Bottom Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="text-xs text-gray-500">
              <span>{t.consultationFee}:</span>
              <span className="ml-1 text-sm font-bold text-[#0F5257] font-mono-num">
                ₹{doctor.fee}
              </span>
            </div>
            <div className="text-xs text-teal-900 font-semibold truncate">
              {isBookingAllowed ? `${selectedSlot} • ${selectedDate}` : (lang === 'hi' ? 'डायरेक्ट संपर्क उपलब्ध' : 'Direct Contact Available')}
            </div>
          </div>

          {!isBookingAllowed ? (
            /* When booking is paused, Contact Now replaces Book Appointment */
            <button
              id="doctor-contact-now-bottom-btn"
              onClick={() => setIsContactModalOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-5 sm:px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{lang === 'hi' ? 'संपर्क करें (Contact Now)' : 'Contact Now'}</span>
            </button>
          ) : (
            /* When booking is allowed, show Contact Now beside Book Appointment */
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                id="doctor-bottom-contact-btn"
                onClick={() => setIsContactModalOpen(true)}
                className="border border-amber-300 bg-amber-50 hover:bg-amber-100 text-[#8F520A] px-3.5 sm:px-4 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-2xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                title={lang === 'hi' ? 'सीधे डॉक्टर या क्लिनिक से संपर्क करें' : 'Contact Doctor & Clinic directly'}
              >
                <PhoneCall className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{lang === 'hi' ? 'संपर्क करें' : 'Contact Now'}</span>
              </button>

              <button
                id="doctor-book-appointment-btn"
                onClick={() => onProceedToBooking(doctor, selectedDate, selectedSlot)}
                className="bg-[#0F5257] hover:bg-[#0A3A3D] text-white px-5 sm:px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span>{t.bookNow}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Direct Contact Modal */}
      <ContactDoctorModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        doctor={doctor}
        clinic={clinic}
        lang={lang}
        onProceedToBooking={() => onProceedToBooking(doctor, selectedDate, selectedSlot)}
        isBookingAvailable={isBookingAllowed}
      />
    </div>
  );
};

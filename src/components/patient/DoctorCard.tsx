import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Calendar,
  Building2,
  ArrowRight,
  PhoneCall
} from 'lucide-react';
import { Doctor, Clinic, Language } from '../../types';
import { translations } from '../../data/translations';
import { ContactDoctorModal } from '../common/ContactDoctorModal';
import { isDoctorBookingAvailable } from '../../utils/bookingAvailability';
import { GoogleMapLinkButton } from '../common/GoogleMapLinkButton';

interface DoctorCardProps {
  doctor: Doctor;
  clinic?: Clinic;
  lang: Language;
  onSelectDoctor?: (doctor: Doctor) => void;
  onSelect?: (doctor: Doctor) => void;
  onBookDirect?: (doctor: Doctor) => void;
  onBook?: (doctor: Doctor) => void;
  onContact?: (doctor: Doctor) => void;
  distanceKm?: number | null;
  isSuggestion?: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  clinic,
  lang,
  onSelectDoctor,
  onSelect,
  onBookDirect,
  onBook,
  onContact,
  distanceKm,
  isSuggestion
}) => {
  const t = translations[lang];
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const isBookingAllowed = isDoctorBookingAvailable(doctor, clinic);

  const handleSelect = () => {
    if (onSelectDoctor) onSelectDoctor(doctor);
    else if (onSelect) onSelect(doctor);
  };
  const handleBook = () => {
    if (onBookDirect) onBookDirect(doctor);
    else if (onBook) onBook(doctor);
  };
  const handleContactClick = () => {
    if (onContact) {
      onContact(doctor);
    } else {
      setIsContactModalOpen(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-teal-900/10 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      {/* Card Header & Badges */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          {/* Doctor Image */}
          <div className="relative shrink-0">
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover border border-teal-900/10 shadow-xs group-hover:scale-102 transition-transform"
              loading="lazy"
            />
            {doctor.isVipBoosted && (
              <span 
                className="absolute -bottom-1 -right-1 bg-[#D4A24C] text-[#14282B] text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5"
                title={t.vipBadge}
              >
                <Sparkles className="w-2.5 h-2.5 fill-current" />
                VIP
              </span>
            )}
          </div>

          {/* Info Block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 
                onClick={handleSelect}
                className="font-fraunces font-bold text-base sm:text-lg text-[#0F5257] hover:text-[#D4A24C] cursor-pointer truncate transition-colors"
              >
                {lang === 'hi' && doctor.nameHindi ? doctor.nameHindi : doctor.name}
              </h3>
              <span title={t.verifiedBadge} className="inline-flex items-center">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              </span>
            </div>

            <p className="text-xs font-semibold text-[#D4A24C] mt-0.5">
              {lang === 'hi' && doctor.specialtyHindi ? doctor.specialtyHindi : doctor.specialty}
            </p>

            <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
              {doctor.qualification}
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1.5 flex-wrap">
              <span className="bg-teal-50 text-teal-800 text-[11px] px-2 py-0.5 rounded-md font-medium border border-teal-100">
                {doctor.experienceYears}+ {t.exp}
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-semibold text-[11px]">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                {doctor.rating} ({doctor.patientsServed}+)
              </span>
            </div>
          </div>
        </div>

        {/* Clinic & City Location tag */}
        <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <Building2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span className="truncate font-medium text-[#0F5257]">{doctor.clinicName}</span>
            {doctor.city && (
              <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 font-medium shrink-0 border border-teal-100">
                <MapPin className="w-2.5 h-2.5" />
                <span>{doctor.city}</span>
              </span>
            )}
            {distanceKm !== undefined && distanceKm !== null && (
              <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                isSuggestion
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                <MapPin className="w-2.5 h-2.5" />
                <span>{distanceKm} km {lang === 'hi' ? 'दूर' : 'away'}</span>
                {isSuggestion && (
                  <span className="text-[9px] text-amber-800 ml-0.5 font-semibold">
                    ({lang === 'hi' ? 'सुझाव' : 'Nearby'})
                  </span>
                )}
              </span>
            )}
            {doctor.pincode && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 font-mono font-bold shrink-0 border border-amber-200">
                PIN: {doctor.pincode}
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-teal-900 shrink-0 font-mono-num ml-2">
            ₹{doctor.fee}
          </span>
        </div>

        {/* Full address and Google Map navigation */}
        {(doctor.address || clinic?.address) && (
          <div className="mt-2 pt-2 border-t border-dashed border-gray-100 flex items-center justify-between gap-1.5 text-[11px]">
            <p className="text-gray-600 truncate flex items-center gap-1 min-w-0" title={doctor.address || clinic?.address}>
              <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="truncate">{doctor.address || (lang === 'hi' && clinic?.addressHindi ? clinic.addressHindi : clinic?.address)}</span>
            </p>
            <GoogleMapLinkButton
              target={{
                clinicName: doctor.clinicName || clinic?.name,
                name: doctor.name,
                address: doctor.address || clinic?.address,
                city: doctor.city || clinic?.city,
                landmark: doctor.landmark || clinic?.landmark,
                pincode: doctor.pincode || clinic?.pincode,
                lat: doctor.lat || clinic?.lat,
                lng: doctor.lng || clinic?.lng
              }}
              lang={lang}
              variant="badge"
            />
          </div>
        )}

        {/* Next Slot pill */}
        <div className="mt-2.5 bg-emerald-50 text-emerald-800 px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between border border-emerald-100/80">
          <span className="flex items-center gap-1.5 text-[11px] font-medium">
            <Clock className="w-3 h-3 text-emerald-600" />
            <span>{t.nextSlot}:</span>
            <span className="font-semibold">{doctor.nextSlot}</span>
          </span>
          <span className="text-[10px] bg-white text-emerald-700 font-bold px-1.5 py-0.5 rounded shadow-2xs">
            {doctor.availableToday ? (lang === 'hi' ? 'आज उपलब्ध' : 'Available Today') : (lang === 'hi' ? 'कल उपलब्ध' : 'Tomorrow')}
          </span>
        </div>
      </div>

      {/* Action footer */}
      <div className="bg-gray-50/80 px-3.5 py-3 border-t border-gray-100 flex items-center gap-2">
        <button
          onClick={handleSelect}
          className="flex-1 py-2 px-2 rounded-xl border border-teal-800/20 text-xs font-semibold text-[#0F5257] hover:bg-teal-50 transition-colors cursor-pointer text-center truncate"
        >
          {t.doctorProfile}
        </button>

        {/* When booking is paused, Contact Now takes the primary action spot */}
        {!isBookingAllowed ? (
          <button
            onClick={handleContactClick}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate"
          >
            <PhoneCall className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === 'hi' ? 'संपर्क करें' : 'Contact Now'}</span>
          </button>
        ) : (
          <>
            {/* When booking is allowed, show Contact Now beside Book Appointment */}
            <button
              onClick={handleContactClick}
              className="py-2 px-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-[#8F520A] text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 shadow-2xs"
              title={lang === 'hi' ? 'सीधे डॉक्टर या क्लिनिक से संपर्क करें' : 'Contact Doctor / Clinic directly'}
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="hidden xs:inline">{lang === 'hi' ? 'संपर्क' : 'Contact'}</span>
            </button>

            <button
              onClick={handleBook}
              className="flex-1 py-2 px-2.5 rounded-xl bg-[#0F5257] hover:bg-[#0A3A3D] text-white text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center justify-center gap-1 cursor-pointer truncate"
            >
              <span>{t.bookNow}</span>
              <ArrowRight className="w-3 h-3 shrink-0" />
            </button>
          </>
        )}
      </div>

      {/* Direct Contact Modal */}
      <ContactDoctorModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        doctor={doctor}
        clinic={clinic}
        lang={lang}
        onProceedToBooking={onBookDirect || onBook}
        isBookingAvailable={isBookingAllowed}
      />
    </div>
  );
};

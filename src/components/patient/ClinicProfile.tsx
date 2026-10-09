import React from 'react';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Star, 
  Calendar, 
  MessageCircle,
  Share2,
  Stethoscope
} from 'lucide-react';
import { Clinic, Doctor, Language } from '../../types';
import { translations } from '../../data/translations';
import { DoctorCard } from './DoctorCard';
import { GoogleMapAddressCard } from '../common/GoogleMapAddressCard';
import { GoogleMapLinkButton } from '../common/GoogleMapLinkButton';

interface ClinicProfileProps {
  clinic: Clinic;
  doctors: Doctor[];
  lang: Language;
  onBack: () => void;
  onSelectDoctor: (doctor: Doctor) => void;
  onBookDoctor: (doctor: Doctor) => void;
}

export const ClinicProfile: React.FC<ClinicProfileProps> = ({
  clinic,
  doctors,
  lang,
  onBack,
  onSelectDoctor,
  onBookDoctor
}) => {
  const t = translations[lang];

  // Doctors practicing at this clinic
  const clinicDoctors = doctors.filter(d => d.clinicId === clinic.id);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: clinic.name,
        text: `Book verified doctors at ${clinic.name} on CliniKaro.`,
        url: window.location.href
      }).catch(() => {});
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-20">
      {/* Back breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#0F5257] hover:text-[#D4A24C] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? 'वापस जाएं' : 'Back to Home'}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1 text-xs text-teal-800 hover:text-teal-950 font-medium px-2.5 py-1 rounded-lg border border-teal-200 bg-white"
        >
          <Share2 className="w-3.5 h-3.5 text-teal-700" />
          <span>{lang === 'hi' ? 'शेयर करें' : 'Share'}</span>
        </button>
      </div>

      {/* Clinic Branded Header Banner */}
      <div className="bg-white rounded-3xl border border-teal-900/10 overflow-hidden shadow-sm">
        {/* Banner image or styled header */}
        <div className="h-40 sm:h-48 w-full bg-gradient-to-r from-[#0F5257] to-[#0A3A3D] relative flex items-end p-6">
          <img
            src={clinic.bannerUrl}
            alt={clinic.name}
            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
          />
          <div className="relative z-10 flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
              clinic.type === 'hospital' ? 'bg-[#D4A24C] text-[#14282B]' : 'bg-teal-100 text-teal-900'
            }`}>
              {clinic.type === 'hospital' ? (lang === 'hi' ? 'अस्पताल' : 'HOSPITAL') : (lang === 'hi' ? 'क्लिनिक' : 'CLINIC')}
            </span>
            {clinic.emergencyAvailable && (
              <span className="text-xs bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">
                24x7 EMERGENCY & ICU
              </span>
            )}
          </div>
        </div>

        {/* Clinic info block */}
        <div className="p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <img
              src={clinic.logoUrl}
              alt={clinic.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-md -mt-14 sm:-mt-16 bg-white relative z-20 shrink-0"
            />

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-fraunces text-2xl sm:text-3xl font-bold text-[#0F5257]">
                  {lang === 'hi' && clinic.nameHindi ? clinic.nameHindi : clinic.name}
                </h1>
                <span title={t.verifiedBadge}>
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-[#D4A24C]">
                {lang === 'hi' && clinic.categoryHindi ? clinic.categoryHindi : clinic.category}
              </p>

              <div className="flex items-center gap-2 flex-wrap pt-1">
                <p className="text-xs text-gray-600 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <span>{lang === 'hi' && clinic.addressHindi ? clinic.addressHindi : clinic.address} ({clinic.landmark})</span>
                </p>
                <GoogleMapLinkButton
                  target={{
                    clinicName: clinic.name,
                    name: clinic.name,
                    address: clinic.address,
                    city: clinic.city,
                    landmark: clinic.landmark,
                    pincode: clinic.pincode,
                    lat: clinic.lat,
                    lng: clinic.lng
                  }}
                  lang={lang}
                  variant="badge"
                />
              </div>

              <div className="flex items-center gap-4 flex-wrap text-xs pt-1 text-gray-700">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-700" />
                  <span>{lang === 'hi' && clinic.timingsHindi ? clinic.timingsHindi : clinic.timings}</span>
                </div>
                <div className="flex items-center gap-1 font-mono-num font-semibold text-teal-900">
                  <Phone className="w-3.5 h-3.5 text-teal-700" />
                  <span>{clinic.phone}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{clinic.rating} ({clinic.reviewsCount} {lang === 'hi' ? 'संतुष्ट मरीज' : 'reviews'})</span>
                </div>
              </div>

              {/* Consultation Fee & Facilities */}
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold">
                  <span className="text-gray-500">{lang === 'hi' ? 'ओपीडी शुल्क:' : 'OPD Fee:'}</span>
                  <span className="font-bold text-sm text-teal-800 font-mono-num">₹{clinic.consultationFee || 400}</span>
                  {clinic.followUpFee !== undefined && (
                    <span className="text-[11px] text-teal-700 font-sans ml-1">
                      ({clinic.followUpFee > 0 ? `Follow-up: ₹${clinic.followUpFee}` : (lang === 'hi' ? 'फॉलो-अप फ्री' : 'Free Follow-up')})
                    </span>
                  )}
                </div>

                {clinic.facilities && clinic.facilities.map((fac, i) => (
                  <span 
                    key={i} 
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-medium border border-gray-200"
                  >
                    <span>✓</span>
                    <span>{fac}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clinic/Hospital Location & Google Maps Navigation */}
      <GoogleMapAddressCard
        title={lang === 'hi' ? `${clinic.type === 'hospital' ? 'अस्पताल' : 'क्लिनिक'} का पता एवं गूगल मैप्स नेविगेशन` : `${clinic.type === 'hospital' ? 'Hospital' : 'Clinic'} Location & Google Maps Navigation`}
        name={clinic.name}
        nameHindi={clinic.nameHindi}
        address={clinic.address}
        addressHindi={clinic.addressHindi}
        landmark={clinic.landmark}
        city={clinic.city}
        state={clinic.state}
        pincode={clinic.pincode}
        phone={clinic.phone}
        lat={clinic.lat}
        lng={clinic.lng}
        lang={lang}
        showMapPreview={true}
      />

      {/* Practicing Doctors at this Clinic */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-fraunces text-xl font-bold text-[#0F5257] flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#D4A24C]" />
              <span>{lang === 'hi' ? 'इस क्लिनिक के विशेषज्ञ डॉक्टर' : 'Doctors Available at this Center'}</span>
            </h2>
            <p className="text-xs text-gray-500">
              {lang === 'hi' ? 'डॉक्टर का चयन करें और सीधा अपॉइंटमेंट बुक करें' : 'Select doctor to check availability & book slot'}
            </p>
          </div>
          <span className="text-xs font-bold text-teal-900 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
            {clinicDoctors.length} {lang === 'hi' ? 'उपलब्ध' : 'Doctors'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clinicDoctors.map(doctor => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              clinic={clinic}
              lang={lang}
              onSelectDoctor={onSelectDoctor}
              onBookDirect={onBookDoctor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

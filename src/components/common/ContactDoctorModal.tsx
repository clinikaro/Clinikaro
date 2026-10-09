import React, { useEffect } from 'react';
import { 
  X, 
  PhoneCall, 
  MessageSquare, 
  MapPin, 
  Building2, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Navigation
} from 'lucide-react';
import { Doctor, Clinic, Language } from '../../types';
import { GoogleMapLinkButton } from './GoogleMapLinkButton';

interface ContactDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  clinic?: Clinic | null;
  lang: Language;
  onProceedToBooking?: (doctor: Doctor) => void;
  isBookingAvailable?: boolean;
}

export const ContactDoctorModal: React.FC<ContactDoctorModalProps> = ({
  isOpen,
  onClose,
  doctor,
  clinic,
  lang,
  onProceedToBooking,
  isBookingAvailable = true
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !doctor) return null;

  // Resolve direct phone numbers
  const doctorPhone = doctor.contactPhone?.trim() || '';
  const clinicPhone = clinic?.phone?.trim() || '';
  const primaryPhone = doctorPhone || clinicPhone || '9431288410';
  const cleanPhoneDigits = primaryPhone.replace(/\D/g, '').slice(-10);

  // WhatsApp number
  const rawWhatsApp = clinic?.whatsappNumber?.trim() || clinicPhone || doctorPhone || '9431288410';
  const cleanWhatsAppDigits = rawWhatsApp.replace(/\D/g, '').slice(-10);

  const doctorDisplayName = lang === 'hi' && doctor.nameHindi ? doctor.nameHindi : doctor.name;
  const clinicDisplayName = clinic 
    ? (lang === 'hi' && clinic.nameHindi ? clinic.nameHindi : clinic.name)
    : doctor.clinicName;
  const specialtyDisplay = lang === 'hi' && doctor.specialtyHindi ? doctor.specialtyHindi : doctor.specialty;

  const waMessage = encodeURIComponent(
    lang === 'hi'
      ? `नमस्ते ${doctor.name}, मैं ${clinicDisplayName} में आपके परामर्श / अपॉइंटमेंट के संबंध में संपर्क करना चाहता हूँ।`
      : `Hello ${doctor.name}, I would like to inquire about consultation and appointment at ${clinicDisplayName}.`
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-teal-900/10 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#0F5257] via-[#0D464A] to-[#0A3A3D] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-fraunces font-bold text-base sm:text-lg leading-tight">
                {lang === 'hi' ? 'डॉक्टर / क्लिनिक से संपर्क करें' : 'Contact Doctor & Clinic'}
              </h2>
              <p className="text-[11px] text-teal-200">
                {lang === 'hi' ? 'सीधे कॉल या व्हाट्सएप पर परामर्श करें' : 'Direct Call, WhatsApp & Clinic Info'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-teal-100 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Doctor Card Banner */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gradient-to-br from-teal-50/70 to-stone-50 border border-teal-100">
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-teal-800/20 shadow-xs shrink-0"
            />
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-fraunces font-bold text-base text-[#0F5257] truncate">
                  {doctorDisplayName}
                </h3>
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              </div>
              <p className="text-xs font-semibold text-[#D4A24C]">
                {specialtyDisplay}
              </p>
              <p className="text-[11px] text-stone-600 font-medium truncate">
                {doctor.qualification} • {doctor.experienceYears}+ {lang === 'hi' ? 'वर्ष अनुभव' : 'yrs exp'}
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="font-mono-num font-bold text-teal-900 bg-white px-2 py-0.5 rounded border border-teal-200">
                  ₹{doctor.fee} {lang === 'hi' ? 'परामर्श फीस' : 'Fee'}
                </span>
                <span className="text-[10px] text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-medium">
                  {lang === 'hi' ? 'क्लिनिक पर भुगतान' : 'Pay at Clinic'}
                </span>
              </div>
            </div>
          </div>

          {/* Appointment Status Alert Banner */}
          {!isBookingAvailable ? (
            <div className="rounded-2xl bg-amber-50/90 border border-amber-300 p-3.5 flex items-start gap-3 text-amber-900 shadow-2xs">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <p className="font-bold text-amber-950">
                  {lang === 'hi' ? 'ऑनलाइन पर्ची बुकिंग वर्तमान में रुकी है' : 'Online Token Booking Paused'}
                </p>
                <p className="text-amber-800 leading-relaxed text-[11px]">
                  {lang === 'hi' 
                    ? 'डॉक्टर अथवा क्लिनिक द्वारा ऑनलाइन स्लॉट बुकिंग अस्थायी रूप से बंद है। कृपया परामर्श या पर्ची हेतु नीचे दिए गए नंबर पर तुरंत कॉल या व्हाट्सएप करें।'
                    : 'Online slot booking is temporarily paused for this doctor. Please use the direct call or WhatsApp button below to confirm availability and schedule your visit.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-emerald-50/90 border border-emerald-300 p-3 flex items-center justify-between text-emerald-900 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold">
                  {lang === 'hi' ? 'ऑनलाइन बुकिंग एवं डायरेक्ट संपर्क दोनों चालू हैं' : 'Online Booking & Direct Contact Active'}
                </span>
              </div>
              <span className="text-[10px] bg-white text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                {doctor.availableToday ? (lang === 'hi' ? 'आज उपलब्ध' : 'Available Today') : (lang === 'hi' ? 'कल उपलब्ध' : 'Tomorrow')}
              </span>
            </div>
          )}

          {/* Primary Action Buttons: Phone & WhatsApp */}
          <div className="space-y-2.5 pt-1">
            {/* 1. Direct Phone Call Button */}
            <a
              href={`tel:+91${cleanPhoneDigits}`}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
                </div>
                <div className="text-left leading-tight">
                  <span className="text-[11px] text-emerald-100 font-medium block">
                    {lang === 'hi' ? 'सीधे फोन कॉल करें (One-Tap Call)' : 'One-Tap Direct Phone Call'}
                  </span>
                  <span className="text-base font-extrabold font-mono tracking-wide">
                    +91 {cleanPhoneDigits}
                  </span>
                </div>
              </div>
              <span className="text-xs bg-white text-emerald-900 font-extrabold px-3 py-1.5 rounded-xl shadow-xs shrink-0">
                {lang === 'hi' ? 'कॉल लगाएं' : 'Call Now'}
              </span>
            </a>

            {/* 2. Direct WhatsApp Chat Button */}
            <a
              href={`https://wa.me/91${cleanWhatsAppDigits}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left leading-tight">
                  <span className="text-[11px] text-emerald-50 font-medium block">
                    {lang === 'hi' ? 'व्हाट्सएप चैट व पर्ची पूछताछ' : 'WhatsApp Chat & OPD Inquiry'}
                  </span>
                  <span className="text-sm font-bold">
                    {lang === 'hi' ? 'मैसेज भेजें (WhatsApp)' : 'Chat on WhatsApp'}
                  </span>
                </div>
              </div>
              <span className="text-xs bg-white text-[#128C7E] font-extrabold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 shrink-0">
                <span>{lang === 'hi' ? 'चैट करें' : 'Open Chat'}</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          </div>

          {/* Clinic & Location Details */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2.5 text-xs text-stone-700">
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#0F5257] block text-sm">
                  {clinicDisplayName}
                </span>
                <p className="text-stone-600 text-xs mt-0.5">
                  {clinic ? (lang === 'hi' && clinic.addressHindi ? clinic.addressHindi : clinic.address) : (doctor.address || 'OPD Clinic')}
                </p>
                {(clinic?.landmark || doctor.landmark) && (
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    <span className="font-semibold">{lang === 'hi' ? 'लैंडमार्क: ' : 'Landmark: '}</span>
                    {clinic?.landmark || doctor.landmark}
                  </p>
                )}
                {(clinic?.city || doctor.city) && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900">
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{clinic?.city || doctor.city} {clinic?.pincode ? `(${clinic.pincode})` : ''}</span>
                  </span>
                )}
                <div className="pt-2">
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
                    variant="button"
                    mode="directions"
                  />
                </div>
              </div>
            </div>

            {/* Timings */}
            <div className="flex items-center gap-2 pt-2 border-t border-stone-200 text-stone-600">
              <Clock className="w-4 h-4 text-[#D4A24C] shrink-0" />
              <span>
                <strong className="text-stone-800">{lang === 'hi' ? 'ओपीडी समय: ' : 'OPD Timings: '}</strong>
                {clinic?.timings || '10:00 AM - 07:00 PM'} ({doctor.daysAvailable?.join(', ') || 'Mon-Sat'})
              </span>
            </div>
          </div>

          {/* If Booking is available, allow switching directly to booking flow */}
          {isBookingAvailable && onProceedToBooking && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onProceedToBooking(doctor);
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#0F5257] hover:bg-[#0A3A3D] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:shadow"
              >
                <span>{lang === 'hi' ? 'अथवा ऑनलाइन अपॉइंटमेंट बुक करें' : 'Or Book Online Appointment'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Emergency Helpline Note */}
          <div className="text-[11px] text-stone-500 bg-teal-50/60 p-2.5 rounded-xl border border-teal-100 text-center">
            <span>{lang === 'hi' ? 'आपातकालीन सहायता व 24x7 हेल्पलाइन: ' : 'Emergency & Pan-India Helpline: '}</span>
            <a href="tel:+919431288410" className="font-mono-num font-bold text-teal-900 underline hover:text-teal-950">
              112 / 9431288410
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

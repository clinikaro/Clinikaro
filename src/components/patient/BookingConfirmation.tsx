import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Share2, 
  Printer, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Stethoscope, 
  ExternalLink,
  RotateCcw,
  Sparkles,
  Ticket,
  ShieldCheck,
  Navigation
} from 'lucide-react';
import { Appointment, Clinic, Doctor, Language } from '../../types';
import { translations } from '../../data/translations';
import { GoogleMapLinkButton } from '../common/GoogleMapLinkButton';
import { getGoogleMapsDirectionsUrl } from '../../utils/mapUtils';

interface BookingConfirmationProps {
  appointment: Appointment;
  clinic?: Clinic;
  doctor?: Doctor;
  lang: Language;
  onBookAnother: () => void;
  onViewInReception?: () => void;
  onBackToHome: () => void;
  onViewMyAppointments?: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  appointment,
  clinic,
  doctor,
  lang,
  onBookAnother,
  onBackToHome,
  onViewMyAppointments
}) => {
  const t = translations[lang];
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // Generate real QR code data URL
    const payload = appointment.qrCodeData || `MYDEHRIDOC:${appointment.appointmentNumber}:${appointment.clinicId}:${appointment.doctorId}`;
    QRCode.toDataURL(payload, {
      width: 260,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Error generating QR:', err));

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0F5257', '#D4A24C', '#10B981']
      });
    } catch {
      // Confetti fallback
    }
  }, [appointment]);

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `*CliniKaro OPD Slip*\n` +
      `Token: ${appointment.appointmentNumber}\n` +
      `Patient: ${appointment.patientName} (${appointment.patientAge}y, ${appointment.patientGender})\n` +
      `Doctor: ${appointment.doctorName} (${appointment.doctorSpecialty})\n` +
      `Clinic: ${appointment.clinicName}\n` +
      `Date & Slot: ${appointment.date} | ${appointment.timeSlot}\n` +
      `Status: Confirmed (${appointment.paymentStatus === 'paid' ? 'Paid' : 'Pay at Clinic Counter ₹' + appointment.fee})\n` +
      `Show QR code at clinic reception desk.\n` +
      `All India Helpline: +91 94312 88410`
    );
    window.open(`https://api.whatsapp.com/send?phone=${appointment.patientPhone ? '91' + appointment.patientPhone : ''}&text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 space-y-6 pb-16">
      {/* Top success badge */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="font-fraunces text-2xl sm:text-3xl font-bold text-[#0F5257]">
          {t.bookingConfirmed}
        </h1>
        <p className="text-xs text-gray-500">
          {lang === 'hi' 
            ? 'आपकी डिजिटल ओपीडी पर्ची सफलतापूर्वक तैयार कर ली गई है' 
            : 'Your verified digital OPD prescription slip is ready'}
        </p>
      </div>

      {/* Signature Prescription Slip Card */}
      <div 
        id="printable-opd-slip"
        className="prescription-card rounded-3xl border-2 border-[#0F5257] overflow-hidden relative shadow-lg"
      >
        {/* Prescription Top Header with gold accent line */}
        <div className="bg-[#0F5257] text-white p-5 text-center relative border-b-4 border-[#D4A24C]">
          <div className="flex items-center justify-between text-xs text-teal-200 border-b border-teal-800/80 pb-2 mb-2">
            <span className="font-mono-num font-semibold uppercase tracking-wider">
              {appointment.bookingSource === 'reception_walk_in' ? 'WALK-IN OPD SLIP' : 'DIGITAL OPD SLIP'}
            </span>
            <span className="bg-[#D4A24C] text-[#14282B] text-[10px] font-bold px-2 py-0.5 rounded font-mono-num">
              CLINIKARO
            </span>
          </div>

          <div className="flex items-start justify-between gap-3 mt-1">
            <div>
              <h2 className="font-fraunces text-lg sm:text-xl font-bold text-white tracking-wide">
                {appointment.clinicName}
              </h2>
              <p className="text-[11px] text-teal-100/90 mt-0.5 font-work flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
                <span>{clinic ? (lang === 'hi' && clinic.addressHindi ? clinic.addressHindi : clinic.address) : 'Station Road, Dehri-on-Sone, Rohtas, Bihar'}</span>
              </p>
            </div>
            <GoogleMapLinkButton
              target={{
                clinicName: appointment.clinicName,
                name: appointment.clinicName,
                address: clinic?.address,
                city: clinic?.city,
                landmark: clinic?.landmark,
                pincode: clinic?.pincode,
                lat: clinic?.lat,
                lng: clinic?.lng
              }}
              lang={lang}
              variant="badge"
              mode="directions"
            />
          </div>
        </div>

        {/* Doctor & Patient Info Section */}
        <div className="p-5 space-y-4 bg-white">
          {/* Doctor Row */}
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                {lang === 'hi' ? 'चिकित्सक (DOCTOR)' : 'CONSULTING DOCTOR'}
              </span>
              <h3 className="font-fraunces font-bold text-base text-[#0F5257]">
                {appointment.doctorName}
              </h3>
              <p className="text-xs text-[#D4A24C] font-semibold">
                {appointment.doctorSpecialty}
              </p>
              {appointment.doctorQualification && (
                <p className="text-[10px] text-gray-500 font-mono-num">
                  {appointment.doctorQualification}
                </p>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                {t.consultationFee}
              </span>
              <span className="font-fraunces text-lg font-bold text-[#0F5257] font-mono-num">
                ₹{appointment.fee}
              </span>
              <span className={`block text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                appointment.paymentStatus === 'paid' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-900'
              }`}>
                {appointment.paymentStatus === 'paid' 
                  ? (lang === 'hi' ? 'शुल्क प्राप्त (PAID)' : 'PAID') 
                  : (lang === 'hi' ? 'काउंटर देय (UNPAID)' : 'DUE AT DESK')}
              </span>
            </div>
          </div>

          {/* Patient Details Row */}
          <div className="grid grid-cols-2 gap-3 text-xs border-b border-gray-100 pb-3">
            <div>
              <span className="text-gray-400 text-[10px] block uppercase font-medium">
                {t.patientName}
              </span>
              <span className="font-bold text-gray-800 text-sm">{appointment.patientName}</span>
              <span className="block text-gray-500 font-mono-num">
                {appointment.patientAge} Yrs, {appointment.patientGender.toUpperCase()}
              </span>
            </div>

            <div>
              <span className="text-gray-400 text-[10px] block uppercase font-medium">
                {lang === 'hi' ? 'तारीख एवं समय स्लॉट' : 'Date & Slot'}
              </span>
              <span className="font-bold text-gray-800">{appointment.date}</span>
              <span className="block font-mono-num text-teal-800 font-semibold">{appointment.timeSlot}</span>
            </div>
          </div>

          {/* Razorpay Route Payment Receipt Confirmation */}
          {appointment.paymentStatus === 'paid' && (
            <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3 text-xs text-emerald-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-emerald-900">
                    {lang === 'hi' ? 'Razorpay Route भुगतान सत्यापित (100% Secure)' : 'Razorpay Route Payment Verified'}
                  </span>
                  {appointment.razorpayPaymentId && (
                    <span className="font-mono text-[10px] bg-emerald-200/70 text-emerald-900 px-1.5 py-0.2 rounded font-bold">
                      {appointment.razorpayPaymentId}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-800/90">
                  {lang === 'hi'
                    ? `शुल्क ₹${appointment.fee} का निपटान सीधे ${appointment.doctorName} के लिंक्ड खाते में दर्ज किया गया है।`
                    : `Fee ₹${appointment.fee} settled directly to ${appointment.doctorName}'s verified Route account.`}
                </p>
              </div>
            </div>
          )}

          {/* Perforated Divider with cut-out notches */}
          <div className="prescription-card-perforated my-3 pt-3 flex items-center justify-center">
            <div className="prescription-notch-left -top-[13px]"></div>
            <div className="prescription-notch-right -top-[13px]"></div>
          </div>

          {/* QR Code & Token Block */}
          <div className="text-center space-y-2 py-1">
            <div className="inline-block p-3 rounded-2xl bg-white border-2 border-teal-900/20 shadow-inner">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Appointment QR Code"
                  className="w-44 h-44 sm:w-48 sm:h-48 mx-auto"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center bg-gray-50 text-xs text-gray-400">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Token Number in OTP Format */}
            <div className="space-y-1.5 text-center">
              <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold block">
                {lang === 'hi' ? 'टोकन संख्या (OTP कोड)' : 'Token # (OTP Code)'}
              </span>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                {String(appointment.appointmentNumber).split('').map((digit, idx) => (
                  <span 
                    key={idx}
                    className="w-10 h-12 sm:w-11 sm:h-12 flex items-center justify-center font-mono-num text-2xl font-extrabold text-[#0F5257] bg-teal-50/90 border-2 border-teal-700/30 rounded-xl shadow-xs"
                  >
                    {digit}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-teal-800 font-medium pt-0.5">
                {lang === 'hi' 
                  ? 'क्लिनिक रिसेप्शन काउंटर पर यह 4-अंकों का टोकन OTP बताएं या QR दिखाएं' 
                  : 'Share this 4-digit Token OTP or show QR at clinic reception desk'}
              </p>
            </div>

            {/* Note text: like a movie ticket */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-950 font-medium text-balance leading-relaxed">
              <span className="font-bold">⚠️ {lang === 'hi' ? 'महत्वपूर्ण सूचना:' : 'Important Notice:'} </span>
              {t.qrNote}
            </div>
          </div>
        </div>

        {/* Prescription Footer with helpdesk */}
        <div className="bg-gray-50 p-3 text-center border-t border-gray-100 text-[11px] text-gray-500 font-mono-num">
          <span>CliniKaro All India Helpdesk: +91 94312 88410 • Powered by SaaS Suvidha</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        {/* Direct Google Maps Navigation Button */}
        <a
          href={getGoogleMapsDirectionsUrl({
            clinicName: appointment.clinicName,
            name: appointment.clinicName,
            address: clinic?.address,
            city: clinic?.city,
            landmark: clinic?.landmark,
            pincode: clinic?.pincode,
            lat: clinic?.lat,
            lng: clinic?.lng
          })}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
          id="confirmation-google-maps-directions-btn"
        >
          <Navigation className="w-4 h-4 fill-current" />
          <span>{lang === 'hi' ? 'गूगल मैप्स पर क्लिनिक का रास्ता देखें (Get Directions)' : 'Get Directions to Clinic on Google Maps'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="py-3 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{t.shareWhatsApp}</span>
          </button>

          <button
            onClick={handlePrint}
            className="py-3 px-3 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-teal-800" />
            <span>{t.printSlip}</span>
          </button>
        </div>

        {onViewMyAppointments && (
          <button
            onClick={onViewMyAppointments}
            className="w-full py-3 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F5257] border border-teal-200 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
            id="confirmation-view-all-appointments-btn"
          >
            <Ticket className="w-4 h-4 text-[#D4A24C]" />
            <span>{lang === 'hi' ? 'मेरे सभी अपॉइंटमेंट और पर्ची देखें' : 'View in My Appointments & Slips'}</span>
          </button>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={onBookAnother}
            className="text-xs text-teal-800 hover:text-teal-950 font-semibold underline cursor-pointer"
          >
            {t.bookAnother}
          </button>

          <button
            onClick={onBackToHome}
            className="text-xs text-gray-500 hover:text-gray-800 font-semibold cursor-pointer"
          >
            {t.backToHome}
          </button>
        </div>
      </div>
    </div>
  );
};

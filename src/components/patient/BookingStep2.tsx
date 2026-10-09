import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Wallet, 
  CreditCard, 
  ShieldCheck, 
  Sparkles,
  Lock,
  IndianRupee,
  MapPin
} from 'lucide-react';
import { Doctor, Clinic, Language } from '../../types';
import { translations } from '../../data/translations';
import { RazorpayRouteModal } from '../common/RazorpayRouteModal';
import { GoogleMapLinkButton } from '../common/GoogleMapLinkButton';

interface BookingStep2Props {
  doctor: Doctor;
  clinic?: Clinic;
  selectedDate: string;
  selectedSlot: string;
  patientData: {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    phone: string;
  };
  lang: Language;
  onBack: () => void;
  onConfirmBooking: (
    paymentType: 'clinic_cash_upi' | 'online_prepaid', 
    paymentStatus: 'paid' | 'unpaid',
    razorpayDetails?: {
      paymentId?: string;
      orderId?: string;
      transferredToAccountId?: string;
      doctorPayoutAmount?: number;
      platformFeeAmount?: number;
    }
  ) => void;
  isSubmitting?: boolean;
}

export const BookingStep2: React.FC<BookingStep2Props> = ({
  doctor,
  clinic,
  selectedDate,
  selectedSlot,
  patientData,
  lang,
  onBack,
  onConfirmBooking,
  isSubmitting
}) => {
  const t = translations[lang];

  // Default is 'online_prepaid' (Recommended online booking)
  const [paymentChoice, setPaymentChoice] = useState<'clinic_cash_upi' | 'online_prepaid'>('online_prepaid');
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState<boolean>(false);

  const handleConfirm = () => {
    if (paymentChoice === 'online_prepaid') {
      setIsRazorpayModalOpen(true);
    } else {
      onConfirmBooking('clinic_cash_upi', 'unpaid');
    }
  };

  const handleRazorpaySuccess = (paymentDetails: {
    paymentId: string;
    orderId: string;
    transferredToAccountId?: string;
    doctorPayoutAmount: number;
    platformFeeAmount: number;
  }) => {
    setIsRazorpayModalOpen(false);
    onConfirmBooking('online_prepaid', 'paid', paymentDetails);
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
          <span>{lang === 'hi' ? 'तारीख, समय या विवरण बदलें' : 'Edit Date, Slot or Details'}</span>
        </button>
      </div>

      {/* Progress header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-[#D4A24C]">
          <span className="bg-[#D4A24C] text-[#14282B] w-5 h-5 rounded-full flex items-center justify-center font-mono-num text-[11px]">
            2
          </span>
          <span>{t.step2Title}</span>
        </div>
        <h1 className="font-fraunces text-2xl font-bold text-[#0F5257]">
          {lang === 'hi' ? 'भुगतान विकल्प एवं सारांश' : 'Payment Option & Summary'}
        </h1>
        <p className="text-xs text-gray-500">
          {t.step2Subtitle}
        </p>
      </div>

      {/* Booking Summary Card */}
      <div className="bg-white rounded-2xl border border-teal-900/10 p-5 shadow-xs space-y-3">
        <h3 className="font-fraunces font-bold text-sm text-[#0F5257] border-b border-gray-100 pb-2">
          {lang === 'hi' ? 'अपॉइंटमेंट सारांश' : 'Appointment Summary'}
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-400 block text-[11px]">{lang === 'hi' ? 'डॉक्टर' : 'Doctor'}</span>
            <span className="font-bold text-gray-900">{doctor.name}</span>
            <span className="block text-teal-700">{doctor.specialty}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[11px]">{lang === 'hi' ? 'क्लिनिक / अस्पताल' : 'Hospital / Clinic'}</span>
            <span className="font-semibold text-gray-900">{clinic?.name || doctor.clinicName}</span>
            {(clinic?.address || doctor.address) && (
              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-600 truncate">
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

          <div>
            <span className="text-gray-400 block text-[11px]">{lang === 'hi' ? 'तारीख व समय' : 'Date & Time'}</span>
            <span className="font-medium text-gray-900">{selectedDate}</span>
            <span className="block font-mono-num text-teal-800 font-bold">{selectedSlot}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[11px]">{lang === 'hi' ? 'मरीज' : 'Patient'}</span>
            <span className="font-semibold text-gray-900">{patientData.name}</span>
            <span className="block text-gray-500 font-mono-num">{patientData.age}y, {patientData.gender}</span>
          </div>
        </div>

        {/* Fee recap line */}
        <div className="mt-2 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-gray-800">{t.consultationFee}:</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 font-semibold ml-2 px-1.5 py-0.5 rounded">
              {lang === 'hi' ? 'डिजिटल ओपीडी पर्ची' : 'Instant Digital Token'}
            </span>
          </div>
          <span className="font-fraunces text-xl font-bold text-[#0F5257] font-mono-num">
            ₹{doctor.fee}
          </span>
        </div>
      </div>

      {/* Two Large Tappable Cards for Payment Mode */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-700">
          {lang === 'hi' ? 'भुगतान का तरीका चुनें:' : 'Select Payment Method:'}
        </p>

        {/* Card 1: Online Prepay (RECOMMENDED) */}
        <div
          onClick={() => setPaymentChoice('online_prepaid')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 relative ${
            paymentChoice === 'online_prepaid'
              ? 'bg-amber-50/70 border-[#D4A24C] shadow-md ring-1 ring-[#D4A24C]/40'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
          id="pay-online-card"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            paymentChoice === 'online_prepaid' ? 'bg-[#0F5257] text-amber-300' : 'bg-gray-100 text-gray-600'
          }`}>
            <CreditCard className="w-5 h-5" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-fraunces font-bold text-sm text-[#0F5257]">
                {t.payOnline}
              </h4>
              <span className="bg-[#D4A24C] text-[#14282B] text-[10px] font-bold px-2 py-0.5 rounded font-mono-num flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3 text-[#14282B]" />
                <span>{lang === 'hi' ? 'अनुशंसित' : 'RECOMMENDED'}</span>
              </span>
            </div>

            <p className="text-xs text-gray-600 font-work leading-relaxed">
              {t.payOnlineDesc}
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-teal-900 font-medium">
              <span>✓ PhonePe</span>
              <span>•</span>
              <span>✓ Google Pay</span>
              <span>•</span>
              <span>✓ Paytm</span>
              <span>•</span>
              <span>✓ Cards / UPI</span>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] bg-teal-50 text-teal-900 border border-teal-200/80 px-2 py-0.5 rounded-md font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>
                  {lang === 'hi'
                    ? `Razorpay Route द्वारा सीधा ${doctor.name} के बैंक खाते में सुरक्षित सेटलमेंट`
                    : `Razorpay Route Direct Settlement to ${doctor.name}`}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Pay at Clinic Reception */}
        <div
          onClick={() => setPaymentChoice('clinic_cash_upi')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 relative ${
            paymentChoice === 'clinic_cash_upi'
              ? 'bg-emerald-50/70 border-[#0F5257] shadow-md ring-1 ring-[#0F5257]/30'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
          id="pay-at-clinic-card"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            paymentChoice === 'clinic_cash_upi' ? 'bg-[#0F5257] text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            <Wallet className="w-5 h-5" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-fraunces font-bold text-sm text-[#14282B]">
                {t.payAtClinic}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono-num ${
                paymentChoice === 'clinic_cash_upi' 
                  ? 'bg-[#0F5257] text-white' 
                  : 'bg-stone-100 text-stone-700'
              }`}>
                {lang === 'hi' ? 'क्लिनिक काउंटर पर भुगतान' : 'PAY ON VISIT'}
              </span>
            </div>

            <p className="text-xs text-gray-600 font-work leading-relaxed">
              {t.payAtClinicDesc}
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-600 font-medium">
              <span>✓ Cash</span>
              <span>•</span>
              <span>✓ PhonePe / Google Pay at Counter Desk</span>
            </div>

            {/* Direct 1-Click Action Button when Pay at Clinic is active */}
            {paymentChoice === 'clinic_cash_upi' && (
              <div className="pt-2">
                <button
                  type="button"
                  id="direct-pay-at-clinic-confirm-btn"
                  disabled={isSubmitting}
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfirmBooking('clinic_cash_upi', 'unpaid');
                  }}
                  className="py-2 px-3.5 rounded-xl bg-[#0F5257] hover:bg-[#0A3A3D] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {isSubmitting 
                      ? (lang === 'hi' ? 'पर्ची तैयार हो रही है...' : 'Booking Slip...') 
                      : (lang === 'hi' ? '✓ क्लिनिक पर भुगतान चुनें एवं पर्ची बुक करें' : '✓ Confirm Booking (Pay at Clinic)')}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm & Book Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          id="confirm-booking-btn"
          onClick={handleConfirm}
          className="w-full py-4 px-4 rounded-xl bg-[#0F5257] hover:bg-[#0A3A3D] text-white text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>{lang === 'hi' ? 'पर्ची तैयार हो रही है...' : 'Generating Digital OPD Slip...'}</span>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 text-amber-300" />
              <span>
                {paymentChoice === 'online_prepaid'
                  ? (lang === 'hi' ? `Razorpay से ₹${doctor.fee} भुगतान करें` : `Pay ₹${doctor.fee} via Razorpay`)
                  : (lang === 'hi' ? 'क्लिनिक काउंटर पर भुगतान चुनें - ओपीडी पर्ची प्राप्त करें' : 'Confirm & Generate OPD Slip (Pay at Clinic)')}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Razorpay Route Modal */}
      {isRazorpayModalOpen && (
        <RazorpayRouteModal
          isOpen={isRazorpayModalOpen}
          onClose={() => setIsRazorpayModalOpen(false)}
          doctor={doctor}
          patientData={patientData}
          appointmentDate={selectedDate}
          appointmentSlot={selectedSlot}
          lang={lang}
          onPaymentSuccess={handleRazorpaySuccess}
        />
      )}
    </div>
  );
};

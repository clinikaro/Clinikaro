import React from 'react';
import { 
  X, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  PhoneCall, 
  MapPin, 
  Clock, 
  Sparkles, 
  FileText,
  Heart,
  Stethoscope,
  Mail
} from 'lucide-react';
import { Language } from '../../types';
import { BrandLogo } from './BrandLogo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-teal-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0F5257] to-[#0A3A3D] text-white p-5 sm:p-6 rounded-t-3xl relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" variant="full" theme="dark" showTagline={false} />
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 text-[#14282B]">
          {/* Key Taglines */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
                SaaS Suvidha
              </span>
              <h3 className="font-fraunces text-base sm:text-lg font-bold text-teal-950">
                Paper to Digital Transformation
              </h3>
              <p className="text-xs text-amber-900 font-medium">
                {lang === 'hi' 
                  ? 'परंपरागत पर्ची से मुक्त, सम्पूर्ण डिजिटल ओपीडी बुकिंग एवं टोकन प्रणाली।' 
                  : 'Empowering clinics & hospitals with instant digital OPD tokens and queue management.'}
              </p>
            </div>
            <div className="shrink-0 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs text-center">
              {lang === 'hi' ? 'मुफ्त डिजिटल ओपीडी • शून्य अग्रिम शुल्क' : 'Free Digital OPD • Zero Advance Fee'}
            </div>
          </div>

          {/* About Overview */}
          <div className="space-y-2">
            <h4 className="font-fraunces font-bold text-sm sm:text-base text-[#0F5257] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4A24C]" />
              <span>{lang === 'hi' ? 'CliniKaro के बारे में (About Us)' : 'About CliniKaro'}</span>
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-work">
              {lang === 'hi'
                ? 'CliniKaro (SaaS Suvidha द्वारा संचालित) भारत का अग्रणी डिजिटल ओपीडी बुकिंग व क्लिनिक प्रबंधन प्लेटफॉर्म है। हमारा उद्देश्य मरीजों को लम्बी कतारों से मुक्ति दिलाना तथा स्थानीय क्लीनिकों और अस्पतालों को आधुनिक डिजिटल टोकन प्रणाली से जोड़ना है।'
                : 'CliniKaro (powered by SaaS Suvidha) is a modern healthcare initiative driving paper-to-digital transformation for outpatient clinics, doctors, and hospitals across India. Patients can browse verified doctors, book digital appointments at zero advance fee, and present instant QR tokens at reception counters.'}
            </p>
          </div>

          {/* Core Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-[#0F5257]">
                  {lang === 'hi' ? 'शून्य अग्रिम शुल्क (Zero Advance Fee)' : 'Zero Advance Booking Fee'}
                </h5>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  {lang === 'hi' 
                    ? 'ऑनलाइन बुकिंग पूर्णतः निशुल्क है। परामर्श शुल्क सीधे क्लिनिक काउंटर पर ही देय है।' 
                    : '100% free online slot booking. Pay the consultation fee directly at the clinic counter.'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-[#0F5257]">
                  {lang === 'hi' ? 'सत्यापित विशेषज्ञ (Verified Doctors)' : 'Verified Specialists'}
                </h5>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  {lang === 'hi' 
                    ? 'AIIMS, IMS BHU, PMCH सहित शीर्ष संस्थानों से सत्यापित डिग्रीधारी चिकित्सक।' 
                    : 'Board-certified medical specialists with validated credentials across India.'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-[#0F5257]">
                  {lang === 'hi' ? 'बिना लाइन की सुविधा (Zero Queue)' : 'Zero Waiting Lines'}
                </h5>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  {lang === 'hi' 
                    ? 'डिजिटल क्यूआर कोड पर्ची से रिसेप्शन पर तुरंत सत्यापन और तय समय पर परामर्श।' 
                    : 'Show digital QR token at the reception desk for priority entry.'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-[#0F5257]">
                  {lang === 'hi' ? 'पेपरलेस रिकॉर्ड (Paperless OPD)' : 'Paper to Digital Transformation'}
                </h5>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  {lang === 'hi' 
                    ? 'पर्चे खोने का डर खत्म। अपने मोबाइल पर कभी भी पर्ची और प्रिस्क्रिप्शन देखें।' 
                    : 'All prescriptions, appointments, and token receipts stored securely on your phone.'}
                </p>
              </div>
            </div>
          </div>

          {/* Specialties & Hubs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 text-xs">
            <div>
              <span className="font-fraunces font-bold text-[#0F5257] block mb-1.5">
                {lang === 'hi' ? 'विशेषज्ञता सेवाएं (Specialties)' : 'Specialties Covered'}
              </span>
              <ul className="space-y-1 text-gray-600">
                <li>• Eye & Vision Care (नेत्र रोग)</li>
                <li>• Pediatrics & Child Care (शिशु रोग)</li>
                <li>• Orthopedic & Joint Care (हड्डी रोग)</li>
                <li>• Gynecology & Maternity (प्रसूति एवं स्त्री रोग)</li>
                <li>• General Medicine & Cardiology (हृदय व सामान्य रोग)</li>
              </ul>
            </div>

            <div>
              <span className="font-fraunces font-bold text-[#0F5257] block mb-1.5">
                {lang === 'hi' ? 'अखिल भारतीय नेटवर्क (Network Hubs)' : 'Pan-India Network Hubs'}
              </span>
              <ul className="space-y-1 text-gray-600">
                <li>• Delhi NCR & Northern Regional Hubs</li>
                <li>• Patna, Varanasi, Dehri, Sasaram & Eastern Hubs</li>
                <li>• Mumbai, Pune & Western Hubs</li>
                <li>• Bengaluru, Hyderabad & Southern Hubs</li>
                <li>• 500+ Partner Clinics & Hospital Centers</li>
              </ul>
            </div>
          </div>

          {/* Helpline & Support Desk */}
          <div className="bg-teal-900 text-teal-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-fraunces font-bold text-white text-sm block">
                {lang === 'hi' ? 'राष्ट्रीय सहायता एवं कस्टमर केयर' : 'National Support Desk & Helpline'}
              </span>
              <p className="text-teal-200/80">
                {lang === 'hi' 
                  ? 'किसी भी सहायता, डॉक्टर स्लॉट कन्फर्मेशन या क्लिनिक पंजीकरण के लिए संपर्क करें:' 
                  : 'For booking assistance, inquiries, or clinic onboarding:'}
              </p>
            </div>
            <div className="space-y-1 shrink-0">
              <a 
                href="tel:+919431288410" 
                className="flex items-center gap-1.5 text-amber-300 font-bold hover:underline font-mono"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>+91 94312 88410</span>
              </a>
              <a 
                href="mailto:saassuvidha@gmail.com" 
                className="flex items-center gap-1.5 text-teal-200 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>saassuvidha@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-3xl flex items-center justify-between text-xs text-gray-500">
          <span>© 2026 CliniKaro • SaaS Suvidha</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0F5257] hover:bg-[#0A3A3D] text-white rounded-xl font-semibold transition-colors cursor-pointer"
          >
            {lang === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

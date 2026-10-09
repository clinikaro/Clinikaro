import React, { useState } from 'react';
import { 
  X, 
  Stethoscope, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Building2,
  Phone,
  Globe
} from 'lucide-react';
import { Language } from '../../types';
import { LocationItem, POPULAR_CITIES, ALL_INDIA_LOCATION } from '../../data/indiaLocations';
import { INDIAN_LANGUAGES } from '../../data/languages';
import { BrandLogo } from './BrandLogo';

interface PreLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectLang: (lang: Language) => void;
  selectedLocation: LocationItem;
  onSelectLocation: (loc: LocationItem) => void;
  onProceedToLogin: () => void;
  onExploreAsGuest: () => void;
  onOpenFullLocationModal?: () => void;
}

export const PreLoginModal: React.FC<PreLoginModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectLang,
  selectedLocation,
  onSelectLocation,
  onProceedToLogin,
  onExploreAsGuest,
  onOpenFullLocationModal
}) => {
  if (!isOpen) return null;

  const isHindi = lang === 'hi' || lang === 'bho';

  // Key quick locations for instant selection across India
  const quickLocations = [
    ALL_INDIA_LOCATION,
    POPULAR_CITIES.find(c => c.id === 'delhi') || {
      id: 'delhi',
      name: 'New Delhi / NCR',
      nameHindi: 'नई दिल्ली / एनसीआर',
      state: 'Delhi',
      stateHindi: 'दिल्ली'
    },
    POPULAR_CITIES.find(c => c.id === 'mumbai') || {
      id: 'mumbai',
      name: 'Mumbai',
      nameHindi: 'मुंबई',
      state: 'Maharashtra',
      stateHindi: 'महाराष्ट्र'
    },
    POPULAR_CITIES.find(c => c.id === 'bengaluru') || {
      id: 'bengaluru',
      name: 'Bengaluru',
      nameHindi: 'बेंगलुरु',
      state: 'Karnataka',
      stateHindi: 'कर्नाटक'
    },
    POPULAR_CITIES.find(c => c.id === 'patna') || {
      id: 'patna',
      name: 'Patna',
      nameHindi: 'पटना',
      state: 'Bihar',
      stateHindi: 'बिहार',
      pincode: '800001',
      lat: 25.5941,
      lng: 85.1376
    },
    POPULAR_CITIES.find(c => c.id === 'dehri') || {
      id: 'dehri',
      name: 'Dehri-on-Sone',
      nameHindi: 'देहरी ऑन सोन',
      state: 'Bihar',
      stateHindi: 'बिहार',
      pincode: '821307',
      lat: 24.9089,
      lng: 84.1856
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prelogin-modal-title"
    >
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Mobile grab handle */}
        <div className="sm:hidden pt-2 pb-1 bg-[#0F5257] flex justify-center">
          <div className="w-10 h-1 bg-teal-300/40 rounded-full" />
        </div>

        {/* Header with CliniKaro Identity */}
        <div className="bg-gradient-to-r from-[#0F5257] via-[#0D464A] to-[#0A3A3D] text-white p-4 sm:p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <BrandLogo size="md" variant="full" theme="dark" showTagline={false} />

            <button
              onClick={onClose}
              className="text-teal-200 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close popup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-stone-800">
          {/* Welcome Alert & Location Proximity Banner */}
          <div className="bg-gradient-to-r from-amber-50 via-amber-100/40 to-teal-50/50 p-3.5 rounded-2xl border border-amber-300/80 space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
              <h3 id="prelogin-modal-title" className="font-bold text-sm text-[#0F5257]">
                {isHindi ? 'लॉगिन से पहले आवश्यक जानकारी' : 'Important Notice Before Login'}
              </h3>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              {isHindi 
                ? 'क्लिनिकारो (CliniKaro) पर आप अपने शहर के स्थानीय डॉक्टर व 50 किमी दायरे के नजदीकी अस्पतालों की डिजिटल पर्ची तुरंत प्राप्त कर सकते हैं।' 
                : 'CliniKaro connects you directly to local doctors in your town plus verified hospital suggestions within a 50 km radius.'}
            </p>
          </div>

          {/* Quick Language Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-teal-700" />
                <span>{isHindi ? 'अपनी भाषा चुनें:' : 'Preferred Language:'}</span>
              </label>
              <span className="text-[11px] text-teal-800 font-semibold">
                {lang === 'hi' ? 'हिन्दी चयनित' : lang === 'bho' ? 'भोजपुरी चयनित' : 'English Selected'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onSelectLang('hi')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  lang === 'hi'
                    ? 'bg-[#0F5257] text-white shadow-xs'
                    : 'bg-stone-50 text-stone-700 border border-stone-200 hover:border-teal-500'
                }`}
              >
                <span>🇮🇳</span>
                <span>हिन्दी</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectLang('en')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  lang === 'en'
                    ? 'bg-[#0F5257] text-white shadow-xs'
                    : 'bg-stone-50 text-stone-700 border border-stone-200 hover:border-teal-500'
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectLang('bho' as any)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  lang === ('bho' as any)
                    ? 'bg-[#0F5257] text-white shadow-xs'
                    : 'bg-stone-50 text-stone-700 border border-stone-200 hover:border-teal-500'
                }`}
              >
                <span>🗣️</span>
                <span>भोजपुरी</span>
              </button>
            </div>
          </div>

          {/* Quick Location Selection (Dehri, Sasaram, Aurangabad, etc.) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>{isHindi ? 'अपना शहर चुनें (50 किमी सुझाव सहित):' : 'Select City (Includes 50 km suggestions):'}</span>
              </label>
              {onOpenFullLocationModal && (
                <button
                  type="button"
                  onClick={onOpenFullLocationModal}
                  className="text-[11px] text-teal-800 font-bold hover:underline cursor-pointer"
                >
                  {isHindi ? 'अन्य शहर ▾' : 'Other cities ▾'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {quickLocations.map((loc) => {
                const isSelected = selectedLocation.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => onSelectLocation(loc)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/90 border-[#D4A24C] ring-2 ring-[#D4A24C] shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100/80 border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900 block truncate">
                        {isHindi ? loc.nameHindi : loc.name}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-stone-500 block truncate font-mono">
                      {loc.pincode ? `PIN: ${loc.pincode}` : loc.state}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Advantages Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-teal-800 font-bold text-xs">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>{isHindi ? 'बिना लाइन टोकन' : 'Zero Waiting'}</span>
              </div>
              <p className="text-[11px] text-stone-600">
                {isHindi ? 'घर बैठे डिजिटल पर्ची और लाइव ओपीडी नंबर।' : 'Live queue status & verified digital slip.'}
              </p>
            </div>

            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-teal-800 font-bold text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isHindi ? 'सत्यापित क्लिनिक' : '100% Verified'}</span>
              </div>
              <p className="text-[11px] text-stone-600">
                {isHindi ? 'डॉक्टरों की योग्यता व फीस की पूर्ण पारदर्शिता।' : 'Official fee transparency & verified degrees.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            id="prelogin-proceed-login"
            onClick={onProceedToLogin}
            className="flex-1 py-3 px-4 rounded-xl bg-[#0F5257] hover:bg-teal-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span>{isHindi ? 'लॉगिन के लिए आगे बढ़ें' : 'Proceed to Login'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="prelogin-explore-guest"
            onClick={onExploreAsGuest}
            className="py-3 px-4 rounded-xl bg-white hover:bg-stone-100 text-teal-900 font-bold text-xs sm:text-sm border border-stone-300 transition-all cursor-pointer text-center"
          >
            {isHindi ? 'सीधे डॉक्टर देखें (अतिथि)' : 'Browse as Guest'}
          </button>
        </div>
      </div>
    </div>
  );
};

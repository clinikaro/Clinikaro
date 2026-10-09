import React from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Ticket, 
  MapPin, 
  Globe, 
  LogOut, 
  LogIn, 
  PhoneCall, 
  Stethoscope, 
  Sparkles,
  ChevronRight,
  Shield,
  ClipboardList,
  CheckCircle2
} from 'lucide-react';
import { AppUser, Language, AppMode } from '../../types';
import { LocationItem } from '../../data/indiaLocations';
import { INDIAN_LANGUAGES } from '../../data/languages';
import { BrandLogo } from './BrandLogo';

interface PatientAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AppUser | null;
  lang: Language;
  selectedLocation: LocationItem;
  myAppointmentsCount?: number;
  onOpenLogin: () => void;
  onSignOut: () => void;
  onNavigateMyAppointments: () => void;
  onOpenLocationModal: () => void;
  onOpenLanguageModal: () => void;
  onOpenGeminiChat: () => void;
  onSelectMode: (mode: AppMode) => void;
}

export const PatientAccountModal: React.FC<PatientAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  lang,
  selectedLocation,
  myAppointmentsCount = 0,
  onOpenLogin,
  onSignOut,
  onNavigateMyAppointments,
  onOpenLocationModal,
  onOpenLanguageModal,
  onOpenGeminiChat,
  onSelectMode
}) => {
  if (!isOpen) return null;

  const currentLangOpt = INDIAN_LANGUAGES.find(l => l.code === lang) || INDIAN_LANGUAGES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0F5257] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <BrandLogo size="xs" variant="icon" theme="dark" />
            <div>
              <h2 className="font-fraunces font-bold text-lg text-white">
                {lang === 'hi' ? 'मरीज खाता व सेटिंग्स' : 'My Account & Preferences'}
              </h2>
              <p className="text-[11px] text-teal-200">
                {lang === 'hi' ? 'CliniKaro डिजिटल स्वास्थ्य सेवा' : 'CliniKaro Digital Health'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* User Profile Card */}
          {currentUser && !currentUser.isGuest && currentUser.displayName !== 'Guest' ? (
            <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#0F5257] text-amber-300 flex items-center justify-center text-lg font-bold font-fraunces shadow-xs">
                  {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-[#0F5257] truncate">
                      {currentUser.displayName || 'Patient User'}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      {currentUser.role === 'patient' 
                        ? (lang === 'hi' ? 'सत्यापित मरीज' : 'Verified')
                        : currentUser.role.toUpperCase()}
                    </span>
                  </div>
                  {currentUser.phoneNumber && (
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5 font-mono-num">
                      <Phone className="w-3 h-3 text-teal-700 shrink-0" />
                      <span>+91 {currentUser.phoneNumber.replace('+91', '')}</span>
                    </p>
                  )}
                  {currentUser.email && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 truncate font-mono-num">
                      <Mail className="w-3 h-3 text-teal-700 shrink-0" />
                      <span className="truncate">{currentUser.email}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                  <User className="w-6 h-6 text-amber-800" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-amber-950">
                    {lang === 'hi' ? 'नमस्ते! (Guest / अतिथि)' : 'Welcome! (Guest)'}
                  </h3>
                  <p className="text-xs text-amber-800/90 leading-tight mt-0.5">
                    {lang === 'hi' 
                      ? 'अतिथि सत्र सक्रिय है। लॉगिन करके आप अपनी पर्चियां व इतिहास सुरक्षित रख सकते हैं।'
                      : 'Guest mode is active. Sign in to permanently manage your OPD slips.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0F5257] hover:bg-[#0A3A3D] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>{lang === 'hi' ? 'लॉगिन / साइन इन करें' : 'Login / Sign In'}</span>
              </button>
            </div>
          )}

          {/* Quick Menu Options */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 px-1 block">
              {lang === 'hi' ? 'सुविधाएं व सेटिंग्स' : 'Services & Settings'}
            </span>

            {/* My Appointments */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateMyAppointments();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-teal-50/50 border border-gray-100 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#0F5257] flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 group-hover:text-[#0F5257]">
                    {lang === 'hi' ? 'मेरी अपॉइंटमेंट एवं पर्चियां' : 'My Appointments & OPD Slips'}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {lang === 'hi' ? 'टोकन नंबर, लाइव कतार व क्यूआर कोड' : 'Live queue status & token slip'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {myAppointmentsCount > 0 && (
                  <span className="bg-[#D4A24C] text-[#14282B] text-[10px] font-black px-2 py-0.5 rounded-full font-mono-num">
                    {myAppointmentsCount}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0F5257]" />
              </div>
            </button>

            {/* City / Location Preference */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLocationModal();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-teal-50/50 border border-gray-100 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 group-hover:text-[#0F5257]">
                    {lang === 'hi' ? 'शहर / स्थान' : 'City / Location'}
                  </p>
                  <p className="text-[11px] text-amber-700 font-semibold">
                    {lang === 'hi' ? selectedLocation.nameHindi : selectedLocation.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-teal-800 font-semibold">
                <span>{lang === 'hi' ? 'बदलें' : 'Change'}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0F5257]" />
              </div>
            </button>

            {/* Language Preference */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLanguageModal();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-teal-50/50 border border-gray-100 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  {currentLangOpt.scriptIcon}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 group-hover:text-[#0F5257]">
                    {lang === 'hi' ? 'भाषा' : 'Language'}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    {currentLangOpt.nativeName} ({currentLangOpt.name})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-teal-800 font-semibold">
                <span>{lang === 'hi' ? 'बदलें' : 'Change'}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0F5257]" />
              </div>
            </button>

            {/* Gemini AI Health Assistant */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenGeminiChat();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-teal-950 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-amber-900">
                      {lang === 'hi' ? 'Gemini AI स्वास्थ्य परामर्श' : 'Gemini AI Health Guide'}
                    </p>
                    <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                      Live
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800/80">
                    {lang === 'hi' ? 'लक्षण जांचें व सही डॉक्टर खोजें' : 'Ask medical doubts & check symptoms'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600" />
            </button>

            {/* Emergency Helpline */}
            <a
              href="tel:+919431288410"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-rose-50/50 border border-gray-100 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    {lang === 'hi' ? '24x7 हेल्पलाइन व सहायता' : '24x7 Emergency Helpline'}
                  </p>
                  <p className="text-[11px] text-rose-600 font-mono-num font-semibold">
                    +91 94312 88410 / 112
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-rose-700 font-semibold bg-rose-100 px-2 py-0.5 rounded-full">
                {lang === 'hi' ? 'कॉल करें' : 'Call'}
              </span>
            </a>
          </div>

          {/* Staff / Doctor / Admin console switch if authorized */}
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'doctor' || currentUser.role === 'reception') && (
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 px-1 block">
                {lang === 'hi' ? 'स्टाफ एवं प्रबंधन कंसोल' : 'Staff & Console Access'}
              </span>

              {currentUser.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectMode('admin');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#0A3A3D] text-amber-300 hover:text-white text-xs font-bold flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'hi' ? 'एडमिन कंसोल खोलें' : 'Open Admin Suite'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
              )}

              {currentUser.role === 'doctor' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectMode('doctor');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#0F5257] text-white text-xs font-bold flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'hi' ? 'डॉक्टर केबिन कंसोल' : 'Open Doctor Cabin'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
              )}

              {currentUser.role === 'reception' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectMode('reception');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-teal-800 text-white text-xs font-bold flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-teal-300" />
                    <span>{lang === 'hi' ? 'रिसेप्शन डेस्क खोलें' : 'Open Reception Desk'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-teal-300" />
                </button>
              )}
            </div>
          )}

          {/* Log Out Option if logged in */}
          {currentUser && (
            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-rose-200"
              >
                <LogOut className="w-4 h-4" />
                <span>{lang === 'hi' ? 'खाता लॉग आउट करें (Sign Out)' : 'Sign Out of Account'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

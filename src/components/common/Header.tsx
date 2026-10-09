import React from 'react';
import { 
  Building2, 
  Stethoscope, 
  ClipboardList, 
  ShieldCheck, 
  Globe, 
  PhoneCall, 
  CalendarCheck,
  UserCheck,
  LogIn,
  LogOut,
  Sparkles,
  Ticket,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { Language, AppMode, AppUser } from '../../types';
import { LocationItem } from '../../data/indiaLocations';
import { INDIAN_LANGUAGES } from '../../data/languages';
import { translations } from '../../data/translations';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  selectedLocation: LocationItem;
  onOpenLocationModal: () => void;
  onOpenLanguageModal: () => void;
  appMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  currentUser?: AppUser | null;
  onOpenLogin: () => void;
  onSignOut: () => void;
  onOpenGeminiChat?: () => void;
  onOpenMyAppointments?: () => void;
  isMyAppointmentsActive?: boolean;
  myAppointmentsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  selectedLocation,
  onOpenLocationModal,
  onOpenLanguageModal,
  appMode,
  onSelectMode,
  currentUser,
  onOpenLogin,
  onSignOut,
  onOpenGeminiChat,
  onOpenMyAppointments,
  isMyAppointmentsActive,
  myAppointmentsCount
}) => {
  const t = translations[lang] || translations.en;
  const currentLangOpt = INDIAN_LANGUAGES.find(l => l.code === lang) || INDIAN_LANGUAGES[0];

  return (
    <header className={`sticky top-0 z-50 bg-[#0F5257] text-white shadow-md border-b border-[#0A3A3D] w-full max-w-full overflow-hidden ${
      appMode === 'patient' ? 'hidden md:block' : ''
    }`}>
      {/* Top micro-bar for Helpline branding */}
      <div className="bg-[#0A3A3D] text-xs px-3 sm:px-4 py-1.5 flex justify-between items-center text-teal-100/90 border-b border-teal-900/50 w-full overflow-hidden">
        <div className="flex items-center gap-2 min-w-0 shrink truncate">
          <span className="text-amber-200/90 font-medium truncate">
            {lang === 'hi' || lang === 'bho' ? 'अखिल भारतीय डिजिटल क्लिनिक एवं अस्पताल नेटवर्क' : 'Pan-India Digital Clinic & Hospital Network'}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-[11px] shrink-0">
          <a 
            href="tel:+919431288410" 
            className="flex items-center gap-1 hover:text-white transition-colors text-amber-200/90"
          >
            <PhoneCall className="w-3 h-3 text-[#D4A24C] shrink-0" />
            <span className="font-mono-num hidden sm:inline">{t.emergencyHelpline}</span>
            <span className="font-mono-num sm:hidden">112 / 9431288410</span>
          </a>
          <span className="text-teal-700 hidden sm:inline">|</span>
          <span className="hidden md:inline text-teal-200/80">
            {t.poweredBy}
          </span>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-4 w-full overflow-hidden">
        {/* Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div 
            onClick={() => {
              if (currentUser?.role === 'doctor' || appMode === 'doctor') {
                onSelectMode('doctor');
              } else if (currentUser?.role === 'admin' || appMode === 'admin') {
                onSelectMode('admin');
              } else {
                onSelectMode('patient');
              }
            }} 
            className="cursor-pointer group select-none shrink-0"
            id="brand-logo-btn"
          >
            <BrandLogo size="md" variant="full" theme="dark" showTagline={false} />
          </div>
        </div>

        {/* Mode Switcher Tabs - Only displayed when inside Admin/Doctor portals, NOT on Patient Portal */}
        {currentUser?.role === 'admin' && appMode !== 'patient' && (
          <div className="hidden md:flex items-center bg-[#0A3A3D]/90 p-1 rounded-xl border border-amber-500/40 shrink-0 shadow-sm">
            <button
              id="nav-admin-mode-btn"
              onClick={() => onSelectMode('admin')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                appMode === 'admin'
                  ? 'bg-[#D4A24C] text-[#14282B] shadow-sm'
                  : 'text-amber-200 hover:text-white'
              }`}
              title="SaaS Suvidha Super Admin"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'hi' ? 'एडमिन कंसोल' : 'Admin Suite'}</span>
            </button>
            <button
              id="nav-doctor-mode-admin-btn"
              onClick={() => onSelectMode('doctor')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                appMode === 'doctor'
                  ? 'bg-[#0F5257] text-white shadow-sm border border-amber-400/50'
                  : 'text-teal-200 hover:text-white'
              }`}
              title="Doctor Site Console"
            >
              <Stethoscope className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'hi' ? 'डॉक्टर साइट' : 'Doctor Site'}</span>
            </button>
            <button
              id="nav-patient-mode-btn"
              onClick={() => onSelectMode('patient')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap text-teal-200 hover:text-white"
              title="Return to Patient Portal"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'मरीज व्यू' : 'Patient View'}</span>
            </button>
          </div>
        )}

        {currentUser?.role === 'doctor' && appMode !== 'patient' && (
          <div className="hidden md:flex items-center bg-[#0A3A3D]/90 p-1 rounded-xl border border-teal-700 shrink-0 shadow-sm">
            <button
              id="nav-doctor-mode-btn"
              onClick={() => onSelectMode('doctor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                appMode === 'doctor'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-teal-950 shadow-sm'
                  : 'text-amber-200 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'डॉक्टर साइट' : 'Doctor Site'}</span>
            </button>
            <button
              id="nav-reception-mode-btn"
              onClick={() => onSelectMode('reception')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                appMode === 'reception'
                  ? 'bg-white text-[#0F5257] shadow-sm'
                  : 'text-teal-200 hover:text-white'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'रिसेप्शन डेस्क' : 'Reception'}</span>
            </button>
          </div>
        )}

        {/* Action Controls: Appointments, Gemini AI Chat, Language, Auth */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Patient My Appointments Button - Desktop / Tablet (Mobile has ergonomic thumb-reach bottom bar) */}
          {onOpenMyAppointments && appMode === 'patient' && (
            <button
              id="header-my-appointments-btn"
              onClick={onOpenMyAppointments}
              className={`hidden sm:flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap ${
                isMyAppointmentsActive
                  ? 'bg-amber-400 text-teal-950 border-amber-300 font-bold shadow-sm'
                  : 'bg-[#0A3A3D] hover:bg-[#166B71] border-teal-700/60 text-teal-100 hover:text-white'
              }`}
              title={lang === 'hi' ? 'मेरे अपॉइंटमेंट और डिजिटल पर्ची देखें' : 'See My Appointments & OPD Slips'}
            >
              <Ticket className="w-3.5 h-3.5 text-[#D4A24C] shrink-0" />
              <span className="hidden md:inline">{lang === 'hi' ? 'मेरे अपॉइंटमेंट' : 'My Appointments'}</span>
              <span className="md:hidden">{lang === 'hi' ? 'पर्ची' : 'Appointments'}</span>
              {typeof myAppointmentsCount === 'number' && myAppointmentsCount > 0 && (
                <span className="bg-[#D4A24C] text-[#14282B] text-[10px] font-black px-1.5 py-0.2 rounded-full font-mono-num ml-0.5">
                  {myAppointmentsCount}
                </span>
              )}
            </button>
          )}

          {/* Gemini AI Health Guide Button - Desktop / Tablet (Mobile has bottom bar + floating FAB) */}
          {onOpenGeminiChat && (
            <button
              id="header-gemini-ai-btn"
              onClick={onOpenGeminiChat}
              className="hidden sm:flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/30 hover:from-amber-500/30 hover:to-amber-600/40 border border-[#D4A24C]/60 text-amber-300 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
              title={lang === 'hi' ? 'Google Gemini स्वास्थ्य सहायक' : 'Google Gemini Health Assistant'}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4A24C] fill-current shrink-0" />
              <span>{lang === 'hi' ? 'Gemini AI सलाह' : 'Gemini AI Health'}</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            id="header-language-toggle-btn"
            onClick={onOpenLanguageModal}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-[#0A3A3D] hover:bg-[#166B71] border border-teal-700/60 text-teal-100 hover:text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
            title={lang === 'hi' ? 'भाषा बदलें / Change Language' : 'Change Language'}
          >
            <Globe className="w-3.5 h-3.5 text-teal-300 shrink-0" />
            <span className="hidden xs:inline">{currentLangOpt.nativeName}</span>
            <span className="text-[10px] text-amber-300 font-bold ml-0.5">▾</span>
          </button>

          {/* User Auth Info / Login Button */}
          {(() => {
            const isGuestSession = typeof window !== 'undefined' && sessionStorage.getItem('curayu_guest_session') === 'true';
            const isGuest = currentUser?.isGuest || currentUser?.provider === 'guest' || currentUser?.displayName === 'Guest' || isGuestSession || currentUser?.displayName?.includes('Rajesh');

            if (currentUser || isGuestSession) {
              const displayName = isGuest ? 'Guest' : (currentUser?.displayName || currentUser?.email || 'User');
              const roleDisplay = isGuest ? (lang === 'hi' ? 'अतिथि (Guest)' : 'Guest') : (currentUser?.role || 'Patient');

              return (
                <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0A3A3D] px-2 sm:px-2.5 py-1 rounded-lg border border-teal-800 text-xs shrink-0">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div className="text-left leading-tight">
                    <p className="text-teal-100 font-semibold truncate max-w-[85px] sm:max-w-[110px] lg:max-w-[140px] text-[11px] sm:text-xs">
                      {displayName}
                    </p>
                    <span className="text-[9px] sm:text-[10px] text-amber-300 capitalize block">
                      {roleDisplay}
                    </span>
                  </div>
                  {/* Quick shortcut for logged-in Admin or Doctor when browsing Patient Portal */}
                  {appMode === 'patient' && currentUser?.role === 'admin' && !isGuest && (
                    <button
                      onClick={() => onSelectMode('admin')}
                      className="hidden xs:flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] sm:text-[11px] font-bold border border-amber-400/40 transition-colors cursor-pointer"
                      title="Open Admin Suite"
                    >
                      <ShieldCheck className="w-3 h-3 text-amber-300" />
                      <span>Admin</span>
                    </button>
                  )}
                  {appMode === 'patient' && currentUser?.role === 'doctor' && !isGuest && (
                    <button
                      onClick={() => onSelectMode('doctor')}
                      className="hidden xs:flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] sm:text-[11px] font-bold border border-amber-400/40 transition-colors cursor-pointer"
                      title="Open Doctor Console"
                    >
                      <Stethoscope className="w-3 h-3 text-amber-300" />
                      <span>Doctor</span>
                    </button>
                  )}
                  {appMode === 'patient' && currentUser?.role === 'reception' && !isGuest && (
                    <button
                      onClick={() => onSelectMode('reception')}
                      className="hidden xs:flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-teal-400/20 hover:bg-teal-400/30 text-teal-200 text-[10px] sm:text-[11px] font-bold border border-teal-400/40 transition-colors cursor-pointer"
                      title="Open Reception Console"
                    >
                      <ClipboardList className="w-3 h-3 text-teal-300" />
                      <span>OPD</span>
                    </button>
                  )}
                  <button
                    onClick={onSignOut}
                    className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-teal-900/60 hover:bg-rose-900/50 text-teal-200 hover:text-rose-200 text-[11px] font-medium transition-colors cursor-pointer"
                    title="Sign Out / लॉग आउट"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{lang === 'hi' ? 'लॉग आउट' : 'Sign Out'}</span>
                  </button>
                </div>
              );
            }

            return (
              <button
                id="header-login-btn"
                onClick={onOpenLogin}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#D4A24C] hover:bg-[#B28333] text-[#14282B] text-[11px] sm:text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span>{lang === 'hi' ? 'लॉगिन' : 'Login'}</span>
              </button>
            );
          })()}
        </div>
      </div>

      {/* Mobile Mode Switcher Bar - Only shown in Admin or Doctor/Reception mode */}
      {currentUser?.role === 'admin' && appMode !== 'patient' && (
        <div className="md:hidden grid grid-cols-3 bg-[#0A3A3D] border-t border-amber-900/60 px-2 py-1 gap-1 text-[11px]">
          <button
            onClick={() => onSelectMode('admin')}
            className={`py-1.5 px-1 rounded flex items-center justify-center gap-1 font-bold ${
              appMode === 'admin' ? 'bg-[#D4A24C] text-[#14282B]' : 'text-amber-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'एडमिन' : 'Admin'}</span>
          </button>
          <button
            onClick={() => onSelectMode('doctor')}
            className={`py-1.5 px-1 rounded flex items-center justify-center gap-1 font-bold ${
              appMode === 'doctor' ? 'bg-[#0F5257] text-white border border-amber-400/50' : 'text-teal-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'डॉक्टर' : 'Doctor'}</span>
          </button>
          <button
            onClick={() => onSelectMode('patient')}
            className="py-1.5 px-1 rounded flex items-center justify-center gap-1 font-medium text-teal-200 hover:text-white"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'मरीज व्यू' : 'Patient View'}</span>
          </button>
        </div>
      )}

      {(currentUser?.role === 'doctor' || currentUser?.role === 'reception') && appMode !== 'patient' && (
        <div className="md:hidden grid grid-cols-3 bg-[#0A3A3D] border-t border-teal-900 px-2 py-1 gap-1 text-[11px]">
          <button
            onClick={() => onSelectMode('doctor')}
            className={`py-1.5 px-1 rounded flex items-center justify-center gap-1 font-bold ${
              appMode === 'doctor' ? 'bg-[#D4A24C] text-[#14282B]' : 'text-amber-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'डॉक्टर' : 'Doctor'}</span>
          </button>
          <button
            onClick={() => onSelectMode('reception')}
            className={`py-1.5 px-1 rounded flex items-center justify-center gap-1 font-bold ${
              appMode === 'reception' ? 'bg-white text-[#0F5257]' : 'text-teal-200'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'रिसेप्शन' : 'Reception'}</span>
          </button>
          <button
            onClick={() => onSelectMode('patient')}
            className="py-1.5 px-1 rounded flex items-center justify-center gap-1 font-medium text-teal-200 hover:text-white"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'मरीज व्यू' : 'Patient View'}</span>
          </button>
        </div>
      )}
    </header>
  );
};



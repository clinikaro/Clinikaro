import React from 'react';
import { 
  Home, 
  CalendarCheck, 
  Sparkles, 
  User
} from 'lucide-react';
import { AppMode, PatientScreen, AppUser, Language } from '../../types';

interface MobileBottomNavProps {
  appMode: AppMode;
  patientView: PatientScreen;
  currentUser?: AppUser | null;
  lang: Language;
  myAppointmentsCount?: number;
  isGeminiChatOpen?: boolean;
  isAccountOpen?: boolean;
  onNavigateHome: () => void;
  onNavigateMyAppointments: () => void;
  onOpenGeminiChat: () => void;
  onOpenAccount: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  appMode,
  patientView,
  currentUser,
  lang,
  myAppointmentsCount = 0,
  isGeminiChatOpen = false,
  isAccountOpen = false,
  onNavigateHome,
  onNavigateMyAppointments,
  onOpenGeminiChat,
  onOpenAccount
}) => {
  // Strictly for patient mode on mobile
  if (appMode !== 'patient') {
    return null;
  }

  // If user is in an active multi-step booking checkout or confirmation or doctor profile with sticky fee bar,
  // hide bottom nav to avoid thumb obstruction and overlapping CTAs
  if (
    patientView === 'booking_step1' ||
    patientView === 'booking_step2' ||
    patientView === 'book_step1' ||
    patientView === 'book_step2' ||
    patientView === 'confirmation' ||
    patientView === 'doctor_profile'
  ) {
    return null;
  }

  const isHomeActive = patientView === 'home' && !isAccountOpen && !isGeminiChatOpen;
  const isAppointmentsActive = patientView === 'my_appointments' && !isAccountOpen && !isGeminiChatOpen;
  const isGeminiActive = isGeminiChatOpen;
  const isAccountActive = isAccountOpen;

  return (
    <nav 
      aria-label="Patient Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-teal-900/10 shadow-[0_-4px_25px_rgba(0,0,0,0.1)] px-2 py-1 select-none"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4px)' }}
    >
      <div className="grid grid-cols-4 items-center justify-around h-14 max-w-md mx-auto">
        {/* 1. Home */}
        <button
          type="button"
          id="mobile-nav-home-btn"
          onClick={onNavigateHome}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer ${
            isHomeActive
              ? 'text-[#0F5257] font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className={`p-1.5 rounded-full transition-all ${isHomeActive ? 'bg-teal-50' : ''}`}>
            <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5] text-[#0F5257]' : 'stroke-2'}`} />
          </div>
          <span className="text-[11px] tracking-tight mt-0.5 font-medium">
            {lang === 'hi' ? 'होम' : 'Home'}
          </span>
        </button>

        {/* 2. My Appointment */}
        <button
          type="button"
          id="mobile-nav-appointments-btn"
          onClick={onNavigateMyAppointments}
          className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer ${
            isAppointmentsActive
              ? 'text-[#0F5257] font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className={`p-1.5 rounded-full relative transition-all ${isAppointmentsActive ? 'bg-teal-50' : ''}`}>
            <CalendarCheck className={`w-5 h-5 ${isAppointmentsActive ? 'stroke-[2.5] text-[#0F5257]' : 'stroke-2'}`} />
            {myAppointmentsCount > 0 && (
              <span className="absolute -top-0.5 -right-1 bg-[#D4A24C] text-[#14282B] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono-num shadow-xs border border-white">
                {myAppointmentsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight mt-0.5 font-medium truncate max-w-[85px]">
            {lang === 'hi' ? 'अपॉइंटमेंट' : 'My Appointment'}
          </span>
        </button>

        {/* 3. Gemini (Gemenai) AI Health Guide */}
        <button
          type="button"
          id="mobile-nav-gemini-btn"
          onClick={onOpenGeminiChat}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer ${
            isGeminiActive
              ? 'text-[#B4650A] font-bold'
              : 'text-stone-600 hover:text-amber-800'
          }`}
        >
          <div className={`p-1.5 rounded-full relative transition-all ${
            isGeminiActive ? 'bg-amber-100 ring-2 ring-amber-400/50' : 'bg-amber-50'
          }`}>
            <Sparkles className="w-5 h-5 text-[#D4A24C] fill-[#D4A24C]" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>
          <span className="text-[11px] tracking-tight mt-0.5 font-bold text-amber-800">
            {lang === 'hi' ? 'जेमिनी' : 'Gemini'}
          </span>
        </button>

        {/* 4. Account */}
        <button
          type="button"
          id="mobile-nav-account-btn"
          onClick={onOpenAccount}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer ${
            isAccountActive
              ? 'text-[#0F5257] font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className={`p-1.5 rounded-full relative transition-all ${isAccountActive ? 'bg-teal-50' : ''}`}>
            <User className={`w-5 h-5 ${isAccountActive ? 'stroke-[2.5] text-[#0F5257]' : 'stroke-2'}`} />
            {currentUser && (
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            )}
          </div>
          <span className="text-[11px] tracking-tight mt-0.5 font-medium truncate max-w-[85px]">
            {lang === 'hi' ? 'खाता' : 'Account'}
          </span>
        </button>
      </div>
    </nav>
  );
};

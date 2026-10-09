import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { Language, AppUser } from '../../types';

interface AdminAccessDeniedProps {
  lang: Language;
  currentUser: AppUser | null;
  onLoginAsAdmin: () => void;
  onBackToPatient: () => void;
}

export const AdminAccessDenied: React.FC<AdminAccessDeniedProps> = ({
  lang,
  currentUser,
  onLoginAsAdmin,
  onBackToPatient
}) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl border-2 border-amber-300 shadow-xl p-6 sm:p-8 text-center space-y-6">
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 mx-auto flex items-center justify-center text-amber-800 shadow-inner">
          <Lock className="w-8 h-8 stroke-[2.5]" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-xs font-bold text-amber-900 font-mono-num">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            <span>AUTHENTICATION GUARD</span>
          </span>

          <h2 className="font-fraunces text-2xl font-bold text-[#0F5257]">
            {lang === 'hi' 
              ? 'सास सुविधा एडमिन: केवल अधिकृत जीमेल' 
              : 'SaaS Suvidha Admin: Restricted Access'}
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
            {lang === 'hi'
              ? 'यह एडमिन पेज केवल saassuvidha@gmail.com से ही खुलेगा। डेहरी के सभी क्लिनिकों का ऑनबोर्डिंग, रेंट बिलिंग और वीआईपी विजिबिलिटी केवल सास सुविधा टीम द्वारा ही प्रबंधित किया जा सकता है।'
              : 'This Admin page can ONLY be opened with saassuvidha@gmail.com. Clinic onboarding, subscription dues, and VIP boost settings are strictly reserved for the SaaS Suvidha team.'}
          </p>
        </div>

        {/* Current status display */}
        <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-stone-200 text-xs text-left space-y-1">
          <div className="text-stone-500 font-medium">
            {lang === 'hi' ? 'वर्तमान लॉगिन स्थिति:' : 'Current Logged-in Account:'}
          </div>
          <div className="font-mono text-stone-800 font-bold break-all">
            {currentUser?.email || currentUser?.displayName || (lang === 'hi' ? 'लॉगिन नहीं है' : 'Not Signed In')}
          </div>
          {currentUser && (
            <div className="text-[11px] text-amber-800 font-medium">
              {lang === 'hi' ? `भूमिका: ${currentUser.role}` : `Role: ${currentUser.role}`}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onLoginAsAdmin}
            className="w-full py-3 px-4 bg-[#0F5257] hover:bg-[#166B71] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-amber-300" />
            <span>
              {lang === 'hi'
                ? 'saassuvidha@gmail.com से लॉगिन करें'
                : 'Sign In as saassuvidha@gmail.com'}
            </span>
          </button>

          <button
            onClick={onBackToPatient}
            className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {lang === 'hi' ? 'मरीज / डॉक्टर पोर्टल पर वापस जाएं' : 'Return to Patient / Doctor Portal'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

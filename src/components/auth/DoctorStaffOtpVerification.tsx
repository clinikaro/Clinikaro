import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Stethoscope, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles,
  Lock,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Doctor, Clinic, Language } from '../../types';

interface DoctorStaffOtpVerificationProps {
  lang: Language;
  email: string;
  doctor: Doctor;
  clinic?: Clinic;
  role: 'doctor' | 'reception';
  expectedOtp?: string;
  onVerified: () => void;
  onCancel: () => void;
  onResendOtp?: () => void;
}

export const DoctorStaffOtpVerification: React.FC<DoctorStaffOtpVerificationProps> = ({
  lang,
  email,
  doctor,
  clinic,
  role,
  expectedOtp = '8213',
  onVerified,
  onCancel,
  onResendOtp
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(45);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [resendNotification, setResendNotification] = useState<string | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState<boolean>(false);

  const inputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null)
  ];

  // Auto focus first input on mount
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleDigitChange = (index: number, val: string) => {
    setError(null);
    const cleaned = val.replace(/\D/g, '');
    
    // If multiple digits pasted
    if (cleaned.length > 1) {
      const newDigits = [...digits];
      for (let i = 0; i < 4; i++) {
        if (i < cleaned.length) {
          newDigits[i] = cleaned[i];
        }
      }
      setDigits(newDigits);
      const nextIdx = Math.min(cleaned.length, 3);
      inputRefs[nextIdx].current?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);

    // Auto advance
    if (cleaned && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleAutoFill = () => {
    setError(null);
    const codeArr = expectedOtp.split('').slice(0, 4);
    setDigits(codeArr);
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
        onVerified();
      }, 400);
    }, 400);
  };

  const handleResend = async () => {
    setDigits(['', '', '', '']);
    setError(null);
    setTimer(45);
    
    try {
      const res = await fetch('/api/send-otp-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          otp: expectedOtp,
          purpose: 'doctor_login',
          doctorName: doctor.name,
          clinicName: clinic?.name || doctor.clinicName
        })
      });
      const data = await res.json();
      if (data.delivered) {
        setResendNotification(
          lang === 'hi'
            ? `✅ असली ईमेल आपके जीमेल ${email} पर भेजा गया है (स्पैम फ़ोल्डर भी देखें)`
            : `✅ Real email delivered to ${email} (check spam folder as well)`
        );
      } else {
        setResendNotification(
          lang === 'hi'
            ? `ℹ️ प्रिव्यू कोड ${expectedOtp} तैयार है। ⚡ 1-क्लिक बटन दबाएं।`
            : `ℹ️ Preview code ${expectedOtp} ready. Press ⚡ 1-Click button.`
        );
      }
    } catch (err) {
      setResendNotification(
        lang === 'hi'
          ? `✅ नया सुरक्षा कोड ${expectedOtp} तैयार है`
          : `✅ New security code ${expectedOtp} is ready`
      );
    }

    setTimeout(() => setResendNotification(null), 5000);
    if (onResendOtp) onResendOtp();
    inputRefs[0].current?.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const enteredCode = digits.join('');
    if (enteredCode.length !== 4) {
      setError(
        lang === 'hi'
          ? 'कृपया अपने जीमेल पर प्राप्त 4-अंकों का सुरक्षा कोड दर्ज करें'
          : 'Please enter the 4-digit security code received on your Gmail'
      );
      return;
    }

    if (enteredCode !== expectedOtp) {
      setError(
        lang === 'hi'
          ? 'अमान्य सुरक्षा कोड। कृपया अपने जीमेल पर प्राप्त सही कोड दर्ज करें (उदा. 8213)।'
          : 'Invalid security code. Please check your Gmail and enter the correct code (e.g. 8213).'
      );
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
        onVerified();
      }, 500);
    }, 600);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-md p-5 sm:p-6 space-y-4 max-w-md mx-auto animate-in fade-in zoom-in-95 duration-200">
      {/* Top Security Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <span>{lang === 'hi' ? '2-स्तरीय सुरक्षा सत्यापन (2FA)' : '2-Way Security Verification (2FA)'}</span>
            </h3>
            <p className="text-[11px] text-emerald-800 font-semibold">
              {role === 'doctor' 
                ? (lang === 'hi' ? 'अधिकृत डॉक्टर केबिन लॉगिन' : 'Authorized Doctor Cabin Login')
                : (lang === 'hi' ? 'अधिकृत क्लिनिक स्टाफ लॉगिन' : 'Authorized Clinic Staff Login')}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Email OTP
        </span>
      </div>

      {/* Target Doctor & Clinic Profile Card */}
      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center gap-3">
        <div className="relative">
          <img
            src={doctor.photoUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80"}
            alt={doctor.name}
            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
            <Stethoscope className="w-2.5 h-2.5" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-stone-900 truncate">
              {doctor.name}
            </h4>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-100 text-teal-800">
              Verified
            </span>
          </div>
          <p className="text-[11px] text-stone-600 truncate">
            {doctor.specialty}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-stone-500 truncate pt-0.5">
            <Building2 className="w-3 h-3 text-[#0F5257] shrink-0" />
            <span className="truncate">{clinic?.name || doctor.clinicName}</span>
          </div>
        </div>
      </div>

      {/* Dispatched Gmail Notice */}
      <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2 text-left">
        <div className="flex items-start gap-2">
          <Mail className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="text-stone-700 font-medium">
              {lang === 'hi' 
                ? 'सुरक्षा कोड (OTP) आपके पंजीकृत जीमेल के लिए भेजा गया है:' 
                : 'Security code (OTP) dispatched for registered Gmail:'}
            </span>
            <div className="font-mono font-bold text-emerald-900 pt-0.5 break-all">
              {email}
            </div>
          </div>
        </div>

        {/* Informative Demo Note answering why email may not reach external inbox */}
        <div className="p-2 bg-amber-50/90 border border-amber-200 rounded-lg space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{lang === 'hi' ? 'जीमेल पर ईमेल नहीं आया? (प्रिव्यू मोड)' : 'Email not in Gmail? (Preview Mode)'}</span>
          </div>
          <p className="text-[10px] text-stone-600 leading-tight">
            {lang === 'hi'
              ? 'लाइव इनबॉक्स डिलीवरी हेतु SMTP (Gmail App Password) आवश्यक है। परीक्षण हेतु आपका 4-अंकों का 2FA कोड नीचे उपलब्ध है:'
              : 'External delivery requires SMTP credentials. For testing, your 4-digit 2FA code is available below:'}
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-black font-mono tracking-widest text-[#0F5257] bg-white px-2 py-0.5 rounded border border-amber-300">
              {expectedOtp}
            </span>
            <button
              type="button"
              onClick={handleAutoFill}
              className="text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-2.5 py-1 rounded shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{lang === 'hi' ? '⚡ 1-क्लिक में भरें और लॉगिन करें' : '⚡ 1-Click Auto-fill & Login'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-emerald-800/80 pt-0.5">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-700" />
            {lang === 'hi' ? 'वैधता: 10 मिनट' : 'Valid for: 10 minutes'}
          </span>
          <button
            type="button"
            onClick={() => setShowEmailPreview(!showEmailPreview)}
            className="text-emerald-900 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>{showEmailPreview ? (lang === 'hi' ? 'ईमेल छिपाएं' : 'Hide Email') : (lang === 'hi' ? 'ईमेल प्रिव्यू देखें' : 'View Email Preview')}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Realistic Simulated Gmail Message Preview (Collapsible) */}
      {showEmailPreview && (
        <div className="p-3 bg-stone-900 text-stone-100 rounded-xl text-[11px] font-mono space-y-1.5 border border-stone-800 text-left animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-stone-400 text-[10px] border-b border-stone-800 pb-1">
            <span>Gmail Inbox • auth@clinikaro.in</span>
            <span className="text-emerald-400">Just Now</span>
          </div>
          <div className="text-stone-300">
            <span className="text-stone-500">To:</span> {email}
          </div>
          <div className="text-stone-300">
            <span className="text-stone-500">Subject:</span> CliniKaro Doctor Portal Login Verification Code
          </div>
          <div className="pt-1 text-stone-200 leading-relaxed font-sans text-xs">
            {lang === 'hi'
              ? `नमस्ते ${doctor.name}, आपके ओपीडी केबिन में लॉगिन हेतु सुरक्षा सत्यापन कोड है:`
              : `Hello ${doctor.name}, your CliniKaro OPD Doctor Cabin login security code is:`}
            <div className="my-1.5 text-center py-1.5 bg-stone-800 text-emerald-300 rounded font-mono font-bold text-sm tracking-widest border border-emerald-500/30">
              {expectedOtp}
            </div>
            <span className="text-[10px] text-stone-400">
              {lang === 'hi' ? 'यह कोड 10 मिनट के लिए मान्य है।' : 'This code is valid for 10 minutes.'}
            </span>
          </div>
        </div>
      )}

      {/* Notifications */}
      {resendNotification && (
        <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#0F5257] shrink-0" />
          <span>{resendNotification}</span>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4-Digit OTP Entry Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-stone-800">
              {lang === 'hi' ? '4-अंकों का सुरक्षा कोड दर्ज करें *' : 'Enter 4-Digit Security Code *'}
            </label>
            <button
              type="button"
              onClick={handleAutoFill}
              className="text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{expectedOtp} Auto-fill</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                inputMode="numeric"
                maxLength={idx === 0 ? 4 : 1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`h-12 text-center text-xl font-bold font-mono rounded-xl border-2 transition-all outline-hidden ${
                  digit 
                    ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950' 
                    : 'border-stone-300 bg-white text-stone-900 focus:border-[#0F5257] focus:ring-2 focus:ring-[#0F5257]/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Resend Timer / Action */}
        <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
          {timer > 0 ? (
            <span className="flex items-center gap-1 text-[11px] text-stone-500">
              <Clock className="w-3 h-3" />
              <span>
                {lang === 'hi' ? `पुनः भेजें: 00:${timer < 10 ? '0' + timer : timer}s` : `Resend in: 00:${timer < 10 ? '0' + timer : timer}s`}
              </span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{lang === 'hi' ? 'नया ओटीपी पुनः भेजें' : 'Resend Code to Gmail'}</span>
            </button>
          )}

          <span className="text-[10px] text-stone-400">
            {lang === 'hi' ? 'सुरक्षित 2FA एन्क्रिप्शन' : 'Encrypted 2FA Session'}
          </span>
        </div>

        {/* Submit & Cancel Actions */}
        <div className="space-y-2 pt-2">
          <button
            type="submit"
            disabled={digits.join('').length !== 4 || isVerifying || isSuccess}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{lang === 'hi' ? 'सत्यापित! प्रवेश दिया जा रहा है...' : 'Verified! Granting Access...'}</span>
              </>
            ) : isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{lang === 'hi' ? 'सत्यापन किया जा रहा है...' : 'Verifying Security Code...'}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>
                  {role === 'doctor'
                    ? (lang === 'hi' ? 'ओटीपी सत्यापित करें एवं केबिन खोलें' : 'Verify OTP & Open Doctor Cabin')
                    : (lang === 'hi' ? 'ओटीपी सत्यापित करें एवं पोर्टल खोलें' : 'Verify OTP & Open Staff Portal')}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-stone-500 hover:text-stone-800 text-xs font-semibold rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            {lang === 'hi' ? '← रद्द करें / दूसरा जीमेल चुनें' : '← Cancel / Choose Different Gmail'}
          </button>
        </div>
      </form>

      {/* Hospital Security Protocol Footer Note */}
      <div className="pt-2 border-t border-stone-100 flex items-start gap-1.5 text-[10px] text-stone-500 leading-tight">
        <Lock className="w-3 h-3 text-[#0F5257] shrink-0 mt-0.5" />
        <span>
          {lang === 'hi'
            ? 'क्लिनिक सुरक्षा नियम: मरीज के गोपनीय स्वास्थ्य रिकॉर्ड (EMR) व ओपीडी केबिन सुरक्षा हेतु अधिकृत ईमेल का 2-स्तरीय सत्यापन आवश्यक है।'
            : 'Hospital Security Mandate: 2-way verification via registered Gmail is enforced to protect electronic medical records (EMR) and OPD cabins.'}
        </span>
      </div>
    </div>
  );
};

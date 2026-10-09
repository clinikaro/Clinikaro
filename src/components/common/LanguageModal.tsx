import React from 'react';
import { Globe, X, Check, Sparkles } from 'lucide-react';
import { INDIAN_LANGUAGES } from '../../data/languages';
import { Language } from '../../types';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSelectLang
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lang-modal-title"
      >
        {/* Mobile grab handle */}
        <div className="sm:hidden pt-2 pb-1 bg-[#0F5257] flex justify-center">
          <div className="w-10 h-1 bg-teal-300/40 rounded-full" />
        </div>

        {/* Multilingual Selection Header */}
        <div className="bg-[#0F5257] text-white px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between border-b border-[#0A3A3D]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-teal-950 flex items-center justify-center font-bold shadow-sm shrink-0">
              <Globe className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 id="lang-modal-title" className="font-fraunces text-lg sm:text-xl font-bold leading-tight">
                Choose Language / भाषा चुनें
              </h2>
              <p className="text-xs text-teal-200/90 font-work mt-0.5">
                अपनी पसंदीदा भाषा चुनें • Select your preferred Indian language
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1.5 rounded-lg hover:bg-teal-800/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Sub-header */}
        <div className="bg-amber-50/90 px-5 py-2.5 border-b border-amber-200/70 text-xs text-amber-900 flex items-center justify-between">
          <span className="font-medium">
            🇮🇳 डॉक्टर पर्ची और पूरी सेवा अपनी भाषा में देखें
          </span>
          <span className="text-[11px] bg-amber-200/70 text-amber-950 font-bold px-2 py-0.5 rounded-full font-mono-num">
            {INDIAN_LANGUAGES.length} Languages
          </span>
        </div>

        {/* Language Grid - Large Touch Targets with Native Script Badges */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2.5 max-h-[60vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {INDIAN_LANGUAGES.map((langOpt) => {
              const isSelected = currentLang === langOpt.code;
              return (
                <button
                  key={langOpt.code}
                  id={`lang-select-${langOpt.code}`}
                  onClick={() => {
                    onSelectLang(langOpt.code as Language);
                    onClose();
                  }}
                  className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-gradient-to-r from-teal-50 to-amber-50/50 border-[#0F5257] ring-2 ring-[#0F5257] shadow-sm'
                      : 'bg-white hover:bg-teal-50/60 text-stone-800 border-stone-200 hover:border-teal-400'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Native Script Badge Icon */}
                    <div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg shrink-0 transition-transform group-hover:scale-105 ${
                        isSelected
                          ? 'bg-[#0F5257] text-amber-300 shadow-xs'
                          : 'bg-stone-100 text-[#0F5257] group-hover:bg-teal-100'
                      }`}
                    >
                      {langOpt.scriptIcon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-base text-stone-900 group-hover:text-[#0F5257] block truncate">
                          {langOpt.nativeName}
                        </span>
                        {langOpt.code === 'bho' && (
                          <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">
                            बिहार / यूपी
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-stone-500 block truncate">
                        {langOpt.name} • {langOpt.region}
                      </span>
                    </div>
                  </div>

                  {/* Radio / Selection Check */}
                  <div className="shrink-0 ml-2">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#0F5257] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-stone-300 group-hover:border-teal-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2.5 mt-2">
            <Sparkles className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-work">
              <strong>Google Gemini AI Assistant:</strong> आप किसी भी भाषा में डॉक्टर से संबंधित प्रश्न पूछ सकते हैं। एआई आपकी चुनी हुई भाषा में परामर्श देगा।
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500 hidden sm:inline font-work">
            भाषा कभी भी ऊपर दिए गए बटन से बदली जा सकती है
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0F5257] text-white rounded-xl font-bold text-xs hover:bg-[#166B71] transition-colors cursor-pointer shadow-xs"
          >
            जारी रखें (Done)
          </button>
        </div>
      </div>
    </div>
  );
};


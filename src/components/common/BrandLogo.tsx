import React, { useState } from 'react';
import logoImg from '../../assets/images/clinikaro_logo.png';

interface BrandLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'icon';
  theme?: 'dark' | 'light' | 'auto'; // dark: on dark teal background, light: on white/cream background
  showTagline?: boolean;
  taglineText?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  theme = 'dark',
  showTagline = false,
  taglineText
}) => {
  const [imgError, setImgError] = useState(false);

  // Dimension tokens
  const iconSizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-8 h-8',
    md: 'w-8 h-8 sm:w-10 sm:h-10',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
    xl: 'w-16 h-16 sm:w-20 sm:h-20'
  }[size];

  const titleSizeClasses = {
    xs: 'text-sm font-bold',
    sm: 'text-base font-bold',
    md: 'text-base sm:text-2xl font-bold tracking-tight',
    lg: 'text-2xl sm:text-3xl font-extrabold tracking-tight',
    xl: 'text-3xl sm:text-4xl font-black tracking-tight'
  }[size];

  const badgeSizeClasses = {
    xs: 'text-[9px] px-1 py-0.2',
    sm: 'text-[9px] sm:text-[10px] px-1.5 py-0.5',
    md: 'text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
    xl: 'text-sm px-3 py-1'
  }[size];

  const textColorClass = theme === 'light' ? 'text-[#0F5257]' : 'text-white';
  const subtextColorClass = theme === 'light' ? 'text-teal-800/80' : 'text-teal-200/90';

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {/* Golden-Amber Squircle Emblem matching user uploaded reference */}
      <div 
        className={`${iconSizeClasses} shrink-0 drop-shadow-md transition-transform flex items-center justify-center rounded-[25%] overflow-hidden bg-[#DF931A] shadow-sm`}
      >
        {!imgError ? (
          <img 
            src={logoImg} 
            alt="CliniKaro Logo" 
            className="w-full h-full object-cover rounded-[25%]"
            loading="eager"
            onError={() => {
              // Try public path first before falling back to SVG
              const fallbackImg = new Image();
              fallbackImg.src = '/logo.png';
              fallbackImg.onload = () => {
                // Image loaded
              };
              fallbackImg.onerror = () => {
                setImgError(true);
              };
            }}
          />
        ) : (
          <svg 
            viewBox="0 0 512 512" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Golden Amber Squircle with 25% curved corners */}
            <rect width="512" height="512" rx="128" fill="#DF931A" />
            
            {/* Heart Outline with smooth lobes */}
            <path
              d="M 240 168
                 C 214 116, 160 98, 158 98
                 C 102 112, 94 176, 96 186
                 C 98 248, 130 286, 240 332
                 C 350 286, 382 248, 384 186
                 C 386 176, 378 112, 322 98
                 C 320 98, 266 116, 240 168 Z"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="35"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Stethoscope Lower Tube Loop */}
            <path
              d="M 240 332
                 C 220 382, 214 400, 224 424
                 C 238 450, 280 450, 308 434
                 C 334 420, 344 394, 348 376"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="35"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Circular Stethoscope Diaphragm Ring */}
            <circle
              cx="370"
              cy="344"
              r="42"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="35"
            />
          </svg>
        )}
      </div>

      {/* Brand Typography & Hindi 'सुविधा' Badge */}
      {variant !== 'icon' && (
        <div className="flex flex-col leading-none shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className={`${titleSizeClasses} ${textColorClass} tracking-tight font-sans whitespace-nowrap`}>
              CliniKaro
            </span>
            <span 
              className={`bg-[#DF931A] text-[#0A3A3D] font-bold rounded-full border border-amber-300/40 shadow-xs inline-flex items-center justify-center shrink-0 ${badgeSizeClasses}`}
              style={{ fontWeight: 800 }}
            >
              सुविधा
            </span>
          </div>

          {showTagline && (
            <p className={`text-[10px] sm:text-[11px] ${subtextColorClass} font-medium mt-1 truncate max-w-[200px] sm:max-w-none`}>
              {taglineText || 'अखिल भारतीय डिजिटल क्लिनिक एवं डॉक्टर नेटवर्क'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

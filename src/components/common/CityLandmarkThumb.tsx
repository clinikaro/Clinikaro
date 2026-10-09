import React from 'react';

interface CityLandmarkThumbProps {
  cityId: string;
  cityName: string;
  className?: string;
}

export const CityLandmarkThumb: React.FC<CityLandmarkThumbProps> = ({
  cityId,
  cityName,
  className = 'w-9 h-9 sm:w-10 sm:h-10'
}) => {
  const normalizedId = cityId.toLowerCase();

  // Render authentic SVG monument art for each city
  const renderArt = () => {
    switch (normalizedId) {
      case 'ahmedabad':
        // Sidi Saiyyed Jali / Sabarmati
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#F97316" />
            <path d="M8 44V26C8 16 16 8 24 8C32 8 40 16 40 26V44H8Z" fill="#7C2D12" />
            <path d="M12 44V28C12 20 18 14 24 14C30 14 36 20 36 28V44H12Z" fill="#FDBA74" />
            <path d="M24 14V44M18 22C21 24 24 28 24 28C24 28 27 24 30 22M16 32C20 34 24 36 24 36C24 36 28 34 32 32" stroke="#7C2D12" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="24" cy="20" r="3" fill="#EA580C" />
          </svg>
        );

      case 'coimbatore':
        // Adiyogi Shiva Statue silhouette
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#1E293B" />
            <path d="M24 10C27 10 30 13 30 17C30 20 32 23 35 25C34 28 32 34 31 38H17C16 34 14 28 13 25C16 23 18 20 18 17C18 13 21 10 24 10Z" fill="#475569" />
            <path d="M24 12V34M20 22L24 25L28 22" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M28 8C32 10 34 14 33 18" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 44C16 38 21 37 24 37C27 37 32 38 34 44H14Z" fill="#334155" />
          </svg>
        );

      case 'lucknow':
        // Rumi Darwaza
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#CA8A04" />
            <path d="M6 44V26C6 14 16 6 24 6C32 6 42 14 42 26V44H6Z" fill="#713F12" />
            <path d="M14 44V30C14 22 18 16 24 16C30 16 34 22 34 30V44H14Z" fill="#FEF08A" />
            <circle cx="24" cy="12" r="2.5" fill="#FEF08A" />
            <path d="M20 44V34C20 31 22 28 24 28C26 28 28 31 28 34V44H20Z" fill="#854D0E" />
          </svg>
        );

      case 'kochi':
        // Chinese Fishing Nets on backwaters
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#D97706" />
            <path d="M0 32C10 32 14 36 24 36C34 36 38 32 48 32V48H0V32Z" fill="#0284C7" />
            <path d="M10 40L28 10L38 28" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
            <path d="M28 10L44 32" stroke="#78350F" strokeWidth="1.5" />
            <path d="M24 16L38 36M20 22L32 38" stroke="#FDE68A" strokeWidth="1" />
            <circle cx="12" cy="16" r="5" fill="#FEF3C7" opacity="0.8" />
          </svg>
        );

      case 'jaipur':
        // Hawa Mahal (Pink Palace facade)
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#BE185D" />
            <path d="M12 44V20L24 8L36 20V44H12Z" fill="#F43F5E" />
            <path d="M18 18H20V22H18V18ZM28 18H30V22H28V18ZM16 26H20V30H16V26ZM28 26H32V30H28V26ZM16 34H20V38H16V34ZM28 34H32V38H28V34ZM22 32H26V44H22V32Z" fill="#FEE2E2" />
            <circle cx="24" cy="14" r="2.5" fill="#FFE4E6" />
          </svg>
        );

      case 'nagpur':
        // Deekshabhoomi Stupa dome
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#0284C7" />
            <path d="M8 44H40V38C40 24 33 16 24 16C15 16 8 24 8 38V44Z" fill="#F8FAFC" />
            <rect x="22" y="8" width="4" height="8" rx="1" fill="#F8FAFC" />
            <circle cx="24" cy="8" r="2" fill="#FACC15" />
            <path d="M20 44V34C20 31 22 28 24 28C26 28 28 31 28 34V44H20Z" fill="#0284C7" />
            <path d="M0 42H48V48H0V42Z" fill="#15803D" />
          </svg>
        );

      case 'visakhapatnam':
      case 'vizag':
        // Coastal road & beach bay
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#38BDF8" />
            <path d="M0 24C12 24 18 32 30 30C38 28 42 22 48 20V48H0V24Z" fill="#0369A1" />
            <path d="M30 30C36 30 42 26 48 24V48H26C28 42 28 34 30 30Z" fill="#FCD34D" />
            <path d="M0 38C14 38 20 42 32 40L34 48H0V38Z" fill="#0284C7" />
            <circle cx="36" cy="12" r="4" fill="#FEF08A" />
          </svg>
        );

      case 'indore':
        // Rajwada Palace 7-storey facade
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#78350F" />
            <path d="M12 44V12H36V44H12Z" fill="#B45309" />
            <path d="M14 16H34M14 22H34M14 28H34M14 34H34" stroke="#FDE68A" strokeWidth="1.5" />
            <rect x="21" y="36" width="6" height="8" rx="1" fill="#451A03" />
            <path d="M8 44H40" stroke="#FDE68A" strokeWidth="2" />
          </svg>
        );

      case 'surat':
        // Modern Diamond Bourse & Tapi
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#0D9488" />
            <path d="M10 44V22L20 12V44H10Z" fill="#14B8A6" />
            <path d="M22 44V8L32 16V44H22Z" fill="#2DD4BF" />
            <path d="M34 44V26L40 30V44H34Z" fill="#5EEAD4" />
            <path d="M0 40H48V48H0V40Z" fill="#042F2E" />
          </svg>
        );

      case 'patna':
        // Historic Golghar
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#B45309" />
            <path d="M8 44C8 26 16 14 24 14C32 14 40 26 40 44H8Z" fill="#FBBF24" />
            <path d="M10 40C12 30 18 20 24 16C30 20 36 30 38 40" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="24" cy="12" r="2.5" fill="#FEF3C7" />
            <rect x="21" y="36" width="6" height="8" fill="#78350F" />
          </svg>
        );

      case 'dehri':
      case 'dehri-on-sone':
        // Rohtasgarh Hill Fort & Son River Bridge
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#065F46" />
            <path d="M4 30L16 16L28 26L44 14V48H4V30Z" fill="#047857" />
            <path d="M0 38H48V48H0V38Z" fill="#0284C7" />
            <path d="M4 36H44M8 36V44M16 36V44M24 36V44M32 36V44M40 36V44" stroke="#FDE68A" strokeWidth="1.5" />
          </svg>
        );

      case 'ranchi':
        // Tagore Hill / Hundru Falls & Birsa Munda heritage
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#065F46" />
            <path d="M4 44L20 18L32 30L44 16V44H4Z" fill="#047857" />
            <path d="M14 44L24 24L36 44H14Z" fill="#34D399" opacity="0.6" />
            <circle cx="36" cy="12" r="3.5" fill="#FDE047" />
            <path d="M22 28V44M26 34V44" stroke="#E0E7FF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'delhi':
      case 'new delhi / ncr':
      case 'new delhi':
        // India Gate
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#991B1B" />
            <path d="M10 44V14H38V44H32V24C32 20 28 16 24 16C20 16 16 20 16 24V44H10Z" fill="#FEF08A" />
            <rect x="8" y="10" width="32" height="4" rx="1" fill="#FEF08A" />
            <rect x="12" y="6" width="24" height="4" rx="1" fill="#FEF08A" />
          </svg>
        );

      case 'mumbai':
        // Gateway of India
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#1E3A8A" />
            <path d="M8 44V18H40V44H32V24C32 20 28 16 24 16C20 16 16 20 16 24V44H8Z" fill="#FBBF24" />
            <circle cx="12" cy="14" r="3" fill="#FBBF24" />
            <circle cx="36" cy="14" r="3" fill="#FBBF24" />
            <circle cx="24" cy="12" r="3.5" fill="#FDE68A" />
            <path d="M0 40H48V48H0V40Z" fill="#0284C7" />
          </svg>
        );

      case 'varanasi':
        // Kashi Vishwanath & Ghat
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#EA580C" />
            <path d="M18 44V22L24 8L30 22V44H18Z" fill="#FEF08A" />
            <path d="M0 38H48V48H0V38Z" fill="#0369A1" />
            <circle cx="36" cy="16" r="3" fill="#FEF08A" />
            <circle cx="24" cy="6" r="2" fill="#EF4444" />
          </svg>
        );

      case 'bengaluru':
      case 'bangalore':
        // Vidhana Soudha dome
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#047857" />
            <path d="M8 44V26H40V44H8Z" fill="#CBD5E1" />
            <path d="M16 26C16 18 20 12 24 12C28 12 32 18 32 26H16Z" fill="#E2E8F0" />
            <circle cx="24" cy="8" r="2.5" fill="#FACC15" />
            <path d="M12 44V32M20 44V32M28 44V32M36 44V32" stroke="#475569" strokeWidth="1.5" />
          </svg>
        );

      case 'kolkata':
        // Howrah Bridge
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#BE123C" />
            <path d="M4 36H44" stroke="#F1F5F9" strokeWidth="2.5" />
            <path d="M10 36L18 12L24 24L30 12L38 36" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
            <path d="M0 38H48V48H0V38Z" fill="#0284C7" />
          </svg>
        );

      case 'hyderabad':
        // Charminar
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#6B21A8" />
            <path d="M14 44V18H34V44H28V30C28 27 26 25 24 25C22 25 20 27 20 30V44H14Z" fill="#FDE047" />
            <rect x="10" y="8" width="4" height="36" fill="#FDE047" />
            <rect x="34" y="8" width="4" height="36" fill="#FDE047" />
            <circle cx="12" cy="7" r="2" fill="#FEF08A" />
            <circle cx="36" cy="7" r="2" fill="#FEF08A" />
          </svg>
        );

      case 'agra':
        // Taj Mahal
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#0F766E" />
            <path d="M16 44V26C16 18 20 12 24 12C28 12 32 18 32 26V44H16Z" fill="#FFFFFF" />
            <circle cx="24" cy="8" r="2" fill="#FEF08A" />
            <rect x="8" y="16" width="3" height="28" fill="#FFFFFF" />
            <rect x="37" y="16" width="3" height="28" fill="#FFFFFF" />
          </svg>
        );

      default:
        // Default India monument landmark pin
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="8" fill="#0F5257" />
            <circle cx="24" cy="20" r="8" fill="#D4A24C" />
            <path d="M24 28L18 38H30L24 28Z" fill="#D4A24C" />
            <circle cx="24" cy="20" r="3" fill="#0F5257" />
          </svg>
        );
    }
  };

  return (
    <div className={`${className} rounded-lg sm:rounded-xl overflow-hidden shrink-0 shadow-2xs border border-black/5`}>
      {renderArt()}
    </div>
  );
};

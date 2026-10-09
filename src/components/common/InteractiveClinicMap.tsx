import React, { useState } from 'react';
import { 
  Navigation, 
  ExternalLink, 
  Layers, 
  Maximize2
} from 'lucide-react';
import { Language } from '../../types';
import { getGoogleMapsUrl, getGoogleMapsDirectionsUrl } from '../../utils/mapUtils';

export interface InteractiveClinicMapProps {
  clinicName: string;
  clinicNameHindi?: string;
  address: string;
  addressHindi?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  lat?: number;
  lng?: number;
  type?: 'clinic' | 'hospital';
  lang: Language;
  height?: string;
  className?: string;
  showCardControls?: boolean;
}

export const InteractiveClinicMap: React.FC<InteractiveClinicMapProps> = ({
  clinicName,
  clinicNameHindi,
  address,
  addressHindi,
  landmark,
  city,
  state,
  pincode,
  phone,
  lat,
  lng,
  type = 'clinic',
  lang,
  height = '350px',
  className = '',
  showCardControls = true
}) => {
  const effectiveLat = (lat && !isNaN(lat) && lat !== 0) ? lat : 24.9087;
  const effectiveLng = (lng && !isNaN(lng) && lng !== 0) ? lng : 84.1852;

  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  const displayName = lang === 'hi' && clinicNameHindi ? clinicNameHindi : clinicName;
  const displayAddress = lang === 'hi' && addressHindi ? addressHindi : address;

  const targetPayload = {
    name: clinicName,
    clinicName,
    address,
    city,
    landmark,
    pincode,
    lat: effectiveLat,
    lng: effectiveLng
  };

  const directionsUrl = getGoogleMapsDirectionsUrl(targetPayload);
  const externalMapsUrl = getGoogleMapsUrl(targetPayload);

  // Search query prioritizing clinic name, address, landmark, city and state
  const queryParts = [
    displayName,
    displayAddress,
    landmark ? `Near ${landmark}` : '',
    city || 'Dehri-on-Sone',
    state || 'Bihar',
    pincode
  ].filter(Boolean);

  const activeQuery = queryParts.length > 0 ? queryParts.join(', ') : `${effectiveLat},${effectiveLng}`;

  // Official Google Maps Interactive Embed (Matches Image 2 signature Google Maps UI)
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(activeQuery)}&t=${mapType === 'satellite' ? 'k' : ''}&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className={`relative rounded-2xl overflow-hidden border-2 border-teal-900/20 shadow-md bg-stone-100 flex flex-col ${className}`}>
      {/* Top Header Bar matching Google Maps branding */}
      {showCardControls && (
        <div className="bg-[#0F5257] text-white px-3.5 py-2 flex items-center justify-between gap-2 z-10 border-b border-teal-800 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold truncate text-xs sm:text-sm text-white">
              {displayName}
            </span>
            <span className="text-[10px] text-amber-300 font-semibold px-1.5 py-0.2 rounded bg-teal-800/80 border border-teal-700/60 hidden xs:inline">
              {type === 'hospital' ? (lang === 'hi' ? 'अस्पताल' : 'Hospital') : (lang === 'hi' ? 'क्लिनिक' : 'Clinic')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Satellite / Roadmap Toggle */}
            <button
              type="button"
              onClick={() => setMapType(prev => prev === 'roadmap' ? 'satellite' : 'roadmap')}
              className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border ${
                mapType === 'satellite'
                  ? 'bg-amber-400 text-teal-950 border-amber-500 shadow-xs'
                  : 'bg-teal-800 text-teal-100 hover:bg-teal-700 border-teal-700'
              }`}
              title={lang === 'hi' ? 'सैटेलाइट या मैप दृश्य बदलें' : 'Toggle Satellite / Roadmap'}
            >
              <Layers className="w-3 h-3" />
              <span>{mapType === 'satellite' ? (lang === 'hi' ? 'मैप' : 'Map') : (lang === 'hi' ? 'सैटेलाइट' : 'Satellite')}</span>
            </button>

            {/* Direct Google Maps Navigation Button */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] sm:text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              title={lang === 'hi' ? 'गूगल मैप्स नेविगेशन' : 'Google Maps Directions'}
            >
              <Navigation className="w-3 h-3 fill-current" />
              <span>{lang === 'hi' ? 'दिशा' : 'Directions'}</span>
            </a>

            {/* External Fullscreen Google Maps */}
            <a
              href={externalMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-md bg-teal-800 hover:bg-teal-700 text-white transition-colors border border-teal-700 cursor-pointer"
              title={lang === 'hi' ? 'गूगल मैप्स में बड़ा देखें' : 'Open in Google Maps'}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Official Google Maps Interactive Embed (Matches Image 2 signature UI) */}
      <div style={{ height: height || '350px', width: '100%' }} className="relative bg-stone-200">
        <iframe
          title={`Google Map - ${displayName}`}
          src={embedUrl}
          className="w-full h-full border-0"
          style={{ minHeight: height || '350px' }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
};

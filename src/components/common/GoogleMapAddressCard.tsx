import React from 'react';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Building2, 
  Phone, 
  Compass, 
  CheckCircle2,
  Sparkles 
} from 'lucide-react';
import { Language } from '../../types';
import { getGoogleMapsUrl, getGoogleMapsDirectionsUrl } from '../../utils/mapUtils';
import { InteractiveClinicMap } from './InteractiveClinicMap';

interface GoogleMapAddressCardProps {
  title?: string;
  name: string;
  nameHindi?: string;
  address: string;
  addressHindi?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  lat?: number;
  lng?: number;
  lang: Language;
  showMapPreview?: boolean;
  className?: string;
}

export const GoogleMapAddressCard: React.FC<GoogleMapAddressCardProps> = ({
  title,
  name,
  nameHindi,
  address,
  addressHindi,
  landmark,
  city,
  state,
  pincode,
  phone,
  lat,
  lng,
  lang,
  showMapPreview = true,
  className = ''
}) => {
  const target = {
    name,
    nameHindi,
    clinicName: name,
    address,
    addressHindi,
    landmark,
    city,
    state,
    pincode,
    lat,
    lng
  };

  const googleMapsUrl = getGoogleMapsUrl(target);
  const directionsUrl = getGoogleMapsDirectionsUrl(target);

  const displayAddress = lang === 'hi' && addressHindi ? addressHindi : address;
  const displayName = lang === 'hi' && nameHindi ? nameHindi : name;

  return (
    <div className={`bg-white rounded-2xl border-2 border-teal-800/15 overflow-hidden shadow-xs hover:shadow-md transition-all ${className}`}>
      {/* Card Header */}
      <div className="bg-gradient-to-r from-[#0F5257] to-[#0A3A3D] text-white p-3.5 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-teal-950 flex items-center justify-center shrink-0 shadow-xs font-bold">
            <MapPin className="w-4 h-4 fill-current text-teal-950" />
          </div>
          <div>
            <h3 className="font-fraunces font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
              <span>{title || (lang === 'hi' ? 'क्लिनिक का पता एवं गूगल मैप्स' : 'Clinic Location & Google Maps')}</span>
            </h3>
            <p className="text-[11px] text-teal-200 truncate">
              {displayName}
            </p>
          </div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-teal-950 shadow-xs transition-colors shrink-0 whitespace-nowrap"
          title={lang === 'hi' ? 'गूगल मैप्स में खोलें' : 'Open in Google Maps'}
        >
          <ExternalLink className="w-3 h-3" />
          <span className="hidden xs:inline">{lang === 'hi' ? 'गूगल मैप्स' : 'Google Maps'}</span>
        </a>
      </div>

      {/* Address Details Block */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <Building2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-stone-800 leading-relaxed">
              <span className="font-bold text-[#0F5257]">{displayName}: </span>
              <span className="font-medium">{displayAddress}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 pl-6 text-xs">
            {landmark && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 font-medium text-[11px]">
                <span>🏛️ {lang === 'hi' ? 'लैंडमार्क:' : 'Landmark:'}</span>
                <span className="font-semibold">{landmark}</span>
              </span>
            )}
            {city && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-900 border border-teal-200/80 font-medium text-[11px]">
                <span>📍</span>
                <span className="font-semibold">{city}{state ? `, ${state}` : ''}</span>
              </span>
            )}
            {pincode && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-mono font-bold text-[11px]">
                PIN: {pincode}
              </span>
            )}
            {phone && (
              <a 
                href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold text-[11px] hover:bg-emerald-100 transition-colors"
              >
                <Phone className="w-3 h-3 text-emerald-700" />
                <span>{phone}</span>
              </a>
            )}
          </div>
        </div>

        {/* Interactive Google Maps Viewport (Replaced static placeholder) */}
        {showMapPreview && (
          <div className="pt-1">
            <InteractiveClinicMap
              clinicName={displayName}
              clinicNameHindi={nameHindi}
              address={displayAddress}
              addressHindi={addressHindi}
              landmark={landmark}
              city={city}
              state={state}
              pincode={pincode}
              phone={phone}
              lat={lat}
              lng={lng}
              lang={lang}
              height="340px"
              showCardControls={true}
            />
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="pt-1 flex flex-wrap items-center gap-2">
          {/* Direct Navigation Button */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            id="google-maps-directions-btn"
          >
            <Navigation className="w-3.5 h-3.5 fill-current" />
            <span>{lang === 'hi' ? 'गूगल मैप्स पर रास्ता देखें (Directions)' : 'Get Directions on Google Maps'}</span>
          </a>

          {/* Open Place in Google Maps Button */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl border border-teal-800/30 bg-teal-50/60 hover:bg-teal-100 text-teal-950 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shrink-0"
            id="google-maps-place-btn"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-700" />
            <span>{lang === 'hi' ? 'गूगल मैप्स में देखें' : 'View on Google Maps'}</span>
            <ExternalLink className="w-3 h-3 text-teal-600" />
          </a>
        </div>
      </div>
    </div>
  );
};

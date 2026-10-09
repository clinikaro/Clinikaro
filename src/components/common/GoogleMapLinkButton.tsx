import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Language } from '../../types';
import { getGoogleMapsUrl, getGoogleMapsDirectionsUrl, MapLocationTarget } from '../../utils/mapUtils';

interface GoogleMapLinkButtonProps {
  target: MapLocationTarget;
  lang: Language;
  variant?: 'badge' | 'button' | 'inline' | 'icon';
  mode?: 'search' | 'directions';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const GoogleMapLinkButton: React.FC<GoogleMapLinkButtonProps> = ({
  target,
  lang,
  variant = 'badge',
  mode = 'search',
  className = '',
  onClick
}) => {
  const url = mode === 'directions' ? getGoogleMapsDirectionsUrl(target) : getGoogleMapsUrl(target);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick(e);
  };

  if (variant === 'icon') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`w-7 h-7 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 flex items-center justify-center transition-colors shadow-2xs ${className}`}
        title={lang === 'hi' ? 'गूगल मैप्स पर देखें' : 'View on Google Maps'}
      >
        <MapPin className="w-3.5 h-3.5 text-teal-700" />
      </a>
    );
  }

  if (variant === 'button') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-bold transition-all shadow-2xs hover:shadow-xs ${className}`}
      >
        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>{lang === 'hi' ? 'गूगल मैप्स (Google Map)' : 'Google Maps'}</span>
        <ExternalLink className="w-3 h-3 text-teal-600 shrink-0" />
      </a>
    );
  }

  if (variant === 'inline') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 hover:text-teal-950 hover:underline ${className}`}
      >
        <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
        <span>{lang === 'hi' ? 'गूगल मैप पर देखें' : 'View on Google Map'}</span>
        <ExternalLink className="w-2.5 h-2.5 text-teal-600 shrink-0" />
      </a>
    );
  }

  // Default: 'badge' - compact pill suitable for doctor cards and clinic lists
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors shadow-2xs group shrink-0 ${className}`}
      title={lang === 'hi' ? 'गूगल मैप्स पर सटीक लोकेशन व रास्ता देखें' : 'View exact location on Google Maps'}
    >
      <MapPin className="w-2.5 h-2.5 text-amber-600 group-hover:scale-110 transition-transform shrink-0" />
      <span>Google Map</span>
      <ExternalLink className="w-2.5 h-2.5 text-amber-700/80 shrink-0" />
    </a>
  );
};

export interface MapLocationTarget {
  name?: string;
  nameHindi?: string;
  clinicName?: string;
  address?: string;
  addressHindi?: string;
  landmark?: string;
  pincode?: string;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
}

/**
 * Generates a direct Google Maps search / place link.
 * On mobile, this directly triggers Google Maps app or mobile browser.
 */
export function getGoogleMapsUrl(target?: MapLocationTarget | null): string {
  if (!target) return 'https://maps.google.com';

  if (
    typeof target.lat === 'number' && 
    typeof target.lng === 'number' && 
    !isNaN(target.lat) && 
    !isNaN(target.lng) && 
    target.lat !== 0
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${target.lat},${target.lng}`;
  }

  const queryParts = [
    target.clinicName || target.name,
    target.address,
    target.landmark ? `Near ${target.landmark}` : '',
    target.city,
    target.state,
    target.pincode
  ].filter(Boolean);

  const query = queryParts.join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || 'Clinic, India')}`;
}

/**
 * Generates a direct Google Maps navigation / directions URL.
 * Automatically initiates route navigation from user's current location to clinic.
 */
export function getGoogleMapsDirectionsUrl(target?: MapLocationTarget | null): string {
  if (!target) return 'https://maps.google.com';

  if (
    typeof target.lat === 'number' && 
    typeof target.lng === 'number' && 
    !isNaN(target.lat) && 
    !isNaN(target.lng) && 
    target.lat !== 0
  ) {
    return `https://www.google.com/maps/dir/?api=1&destination=${target.lat},${target.lng}`;
  }

  const destParts = [
    target.clinicName || target.name,
    target.address,
    target.city,
    target.state,
    target.pincode
  ].filter(Boolean);

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destParts.join(', ') || 'Clinic')}`;
}

/**
 * Generates an OpenStreetMap embed iframe URL for displaying the visual map tile with marker.
 */
export function getMapEmbedUrl(target?: MapLocationTarget | null, zoom = 15): string {
  const lat = target?.lat && !isNaN(target.lat) && target.lat !== 0 ? target.lat : 24.9087;
  const lng = target?.lng && !isNaN(target.lng) && target.lng !== 0 ? target.lng : 84.1852;
  const delta = 0.015 * Math.pow(2, 14 - zoom);

  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;
}

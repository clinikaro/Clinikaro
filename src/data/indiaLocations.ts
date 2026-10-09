export interface LocationItem {
  id: string;
  name: string;
  nameHindi: string;
  state: string;
  stateHindi: string;
  pincode?: string;
  isPopular?: boolean;
  tier?: 'metro' | 'tier-1' | 'tier-2' | 'tier-3';
  lat?: number;
  lng?: number;
}

export interface IndianState {
  name: string;
  nameHindi: string;
  code: string;
}

export const INDIAN_STATES: IndianState[] = [
  { name: 'Bihar', nameHindi: 'बिहार', code: 'BR' },
  { name: 'Uttar Pradesh', nameHindi: 'उत्तर प्रदेश', code: 'UP' },
  { name: 'Delhi', nameHindi: 'दिल्ली (एनसीआर)', code: 'DL' },
  { name: 'Jharkhand', nameHindi: 'झारखंड', code: 'JH' },
  { name: 'West Bengal', nameHindi: 'पश्चिम बंगाल', code: 'WB' },
  { name: 'Maharashtra', nameHindi: 'महाराष्ट्र', code: 'MH' },
  { name: 'Karnataka', nameHindi: 'कर्नाटक', code: 'KA' },
  { name: 'Tamil Nadu', nameHindi: 'तमिलनाडु', code: 'TN' },
  { name: 'Telangana', nameHindi: 'तेलंगाना', code: 'TS' },
  { name: 'Gujarat', nameHindi: 'गुजरात', code: 'GJ' },
  { name: 'Rajasthan', nameHindi: 'राजस्थान', code: 'RJ' },
  { name: 'Madhya Pradesh', nameHindi: 'मध्य प्रदेश', code: 'MP' },
  { name: 'Punjab', nameHindi: 'पंजाब', code: 'PB' },
  { name: 'Haryana', nameHindi: 'हरियाणा', code: 'HR' },
  { name: 'Odisha', nameHindi: 'ओडिशा', code: 'OD' },
  { name: 'Assam', nameHindi: 'असम', code: 'AS' },
  { name: 'Kerala', nameHindi: 'केरल', code: 'KL' },
  { name: 'Andhra Pradesh', nameHindi: 'आंध्र प्रदेश', code: 'AP' },
  { name: 'Chhattisgarh', nameHindi: 'छत्तीसगढ़', code: 'CG' },
  { name: 'Uttarakhand', nameHindi: 'उत्तराखंड', code: 'UK' },
  { name: 'Himachal Pradesh', nameHindi: 'हिमाचल प्रदेश', code: 'HP' },
  { name: 'Jammu and Kashmir', nameHindi: 'जम्मू और कश्मीर', code: 'JK' },
  { name: 'Goa', nameHindi: 'गोवा', code: 'GA' },
  { name: 'Chandigarh', nameHindi: 'चंडीगढ़', code: 'CH' }
];

export const ALL_INDIA_LOCATION: LocationItem = {
  id: 'all',
  name: 'All India',
  nameHindi: 'सम्पूर्ण भारत',
  state: 'India',
  stateHindi: 'भारत',
  isPopular: false
};

export const INDIAN_LOCATIONS: LocationItem[] = [
  ALL_INDIA_LOCATION,
  {
    id: 'delhi',
    name: 'New Delhi / NCR',
    nameHindi: 'नई दिल्ली / एनसीआर',
    state: 'Delhi',
    stateHindi: 'दिल्ली',
    isPopular: true,
    tier: 'metro',
    lat: 28.6139,
    lng: 77.2090
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    nameHindi: 'मुंबई',
    state: 'Maharashtra',
    stateHindi: 'महाराष्ट्र',
    isPopular: true,
    tier: 'metro',
    lat: 19.0760,
    lng: 72.8777
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    nameHindi: 'बेंगलुरु',
    state: 'Karnataka',
    stateHindi: 'कर्नाटक',
    isPopular: true,
    tier: 'metro',
    lat: 12.9716,
    lng: 77.5946
  },
  {
    id: 'patna',
    name: 'Patna',
    nameHindi: 'पटना',
    state: 'Bihar',
    stateHindi: 'बिहार',
    pincode: '800001',
    isPopular: true,
    tier: 'tier-1',
    lat: 25.5941,
    lng: 85.1376
  },
  {
    id: 'dehri',
    name: 'Dehri-on-Sone',
    nameHindi: 'डेहरी-ऑन-सोन',
    state: 'Bihar',
    stateHindi: 'बिहार',
    pincode: '821307',
    isPopular: true,
    tier: 'tier-3',
    lat: 24.9087,
    lng: 84.1852
  },
  {
    id: 'dalmianagar',
    name: 'Dalmianagar',
    nameHindi: 'डालमियानगर',
    state: 'Bihar',
    stateHindi: 'बिहार',
    pincode: '821305',
    isPopular: true,
    tier: 'tier-3',
    lat: 24.9180,
    lng: 84.1750
  },
  {
    id: 'sasaram',
    name: 'Sasaram',
    nameHindi: 'सासाराम',
    state: 'Bihar',
    stateHindi: 'बिहार',
    pincode: '821115',
    isPopular: true,
    tier: 'tier-3',
    lat: 24.9509,
    lng: 84.0289
  },
  {
    id: 'aurangabad-bihar',
    name: 'Aurangabad (Bihar)',
    nameHindi: 'औरंगाबाद (बिहार)',
    state: 'Bihar',
    stateHindi: 'बिहार',
    pincode: '824101',
    isPopular: true,
    tier: 'tier-3',
    lat: 24.7538,
    lng: 84.3742
  },
  {
    id: 'gaya',
    name: 'Gaya',
    nameHindi: 'गया',
    state: 'Bihar',
    stateHindi: 'बिहार',
    pincode: '823001',
    isPopular: true,
    tier: 'tier-2',
    lat: 24.7914,
    lng: 85.0002
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    nameHindi: 'हैदराबाद',
    state: 'Telangana',
    stateHindi: 'तेलंगाना',
    isPopular: true,
    tier: 'metro',
    lat: 17.3850,
    lng: 78.4867
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    nameHindi: 'कोलकाता',
    state: 'West Bengal',
    stateHindi: 'पश्चिम बंगाल',
    isPopular: true,
    tier: 'metro',
    lat: 22.5726,
    lng: 88.3639
  },
  {
    id: 'chennai',
    name: 'Chennai',
    nameHindi: 'चेन्नई',
    state: 'Tamil Nadu',
    stateHindi: 'तमिलनाडु',
    isPopular: true,
    tier: 'metro',
    lat: 13.0827,
    lng: 80.2707
  },
  {
    id: 'pune',
    name: 'Pune',
    nameHindi: 'पुणे',
    state: 'Maharashtra',
    stateHindi: 'महाराष्ट्र',
    isPopular: true,
    tier: 'tier-1',
    lat: 18.5204,
    lng: 73.8567
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    nameHindi: 'अहमदाबाद',
    state: 'Gujarat',
    stateHindi: 'गुजरात',
    isPopular: true,
    tier: 'tier-1',
    lat: 23.0225,
    lng: 72.5714
  },
  {
    id: 'varanasi',
    name: 'Varanasi',
    nameHindi: 'वाराणसी (बनारस)',
    state: 'Uttar Pradesh',
    stateHindi: 'उत्तर प्रदेश',
    isPopular: true,
    tier: 'tier-2',
    lat: 25.3176,
    lng: 82.9739
  },
  {
    id: 'lucknow',
    name: 'Lucknow',
    nameHindi: 'लखनऊ',
    state: 'Uttar Pradesh',
    stateHindi: 'उत्तर प्रदेश',
    isPopular: true,
    tier: 'tier-1',
    lat: 26.8467,
    lng: 80.9462
  },
  {
    id: 'kanpur',
    name: 'Kanpur',
    nameHindi: 'कानपुर',
    state: 'Uttar Pradesh',
    stateHindi: 'उत्तर प्रदेश',
    isPopular: false,
    tier: 'tier-1',
    lat: 26.4499,
    lng: 80.3319
  },
  {
    id: 'prayagraj',
    name: 'Prayagraj (Allahabad)',
    nameHindi: 'प्रयागराज',
    state: 'Uttar Pradesh',
    stateHindi: 'उत्तर प्रदेश',
    isPopular: false,
    tier: 'tier-2',
    lat: 25.4358,
    lng: 81.8463
  },
  {
    id: 'ranchi',
    name: 'Ranchi',
    nameHindi: 'राँची',
    state: 'Jharkhand',
    stateHindi: 'झारखंड',
    isPopular: true,
    tier: 'tier-2',
    lat: 23.3441,
    lng: 85.3096
  },
  {
    id: 'jamshedpur',
    name: 'Jamshedpur',
    nameHindi: 'जमशेदपुर',
    state: 'Jharkhand',
    stateHindi: 'झारखंड',
    isPopular: false,
    tier: 'tier-2',
    lat: 22.8046,
    lng: 86.2029
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    nameHindi: 'जयपुर',
    state: 'Rajasthan',
    stateHindi: 'राजस्थान',
    isPopular: true,
    tier: 'tier-1',
    lat: 26.9124,
    lng: 75.7873
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh',
    nameHindi: 'चंडीगढ़',
    state: 'Punjab / Haryana',
    stateHindi: 'पंजाब / हरियाणा',
    isPopular: true,
    tier: 'tier-2',
    lat: 30.7333,
    lng: 76.7794
  },
  {
    id: 'bhopal',
    name: 'Bhopal',
    nameHindi: 'भोपाल',
    state: 'Madhya Pradesh',
    stateHindi: 'मध्य प्रदेश',
    isPopular: false,
    tier: 'tier-2',
    lat: 23.2599,
    lng: 77.4126
  },
  {
    id: 'indore',
    name: 'Indore',
    nameHindi: 'इंदौर',
    state: 'Madhya Pradesh',
    stateHindi: 'मध्य प्रदेश',
    isPopular: true,
    tier: 'tier-1',
    lat: 22.7196,
    lng: 75.8577
  },
  {
    id: 'guwahati',
    name: 'Guwahati',
    nameHindi: 'गुवाहाटी',
    state: 'Assam',
    stateHindi: 'असम',
    isPopular: false,
    tier: 'tier-2',
    lat: 26.1445,
    lng: 91.7362
  },
  {
    id: 'bhubaneswar',
    name: 'Bhubaneswar',
    nameHindi: 'भुवनेश्वर',
    state: 'Odisha',
    stateHindi: 'ओडिशा',
    isPopular: false,
    tier: 'tier-2',
    lat: 20.2961,
    lng: 85.8245
  },
  {
    id: 'kochi',
    name: 'Kochi',
    nameHindi: 'कोच्चि',
    state: 'Kerala',
    stateHindi: 'केरल',
    isPopular: false,
    tier: 'tier-2',
    lat: 9.9312,
    lng: 76.2673
  },
  {
    id: 'nagpur',
    name: 'Nagpur',
    nameHindi: 'नागपुर',
    state: 'Maharashtra',
    stateHindi: 'महाराष्ट्र',
    isPopular: false,
    tier: 'tier-2',
    lat: 21.1458,
    lng: 79.0882
  }
];

export const POPULAR_CITIES: LocationItem[] = INDIAN_LOCATIONS.filter(
  loc => loc.id !== 'all' && loc.isPopular
);

export function findNearestIndianCity(lat: number, lng: number): LocationItem {
  let closest = INDIAN_LOCATIONS[1]; // default to first real city
  let minDistance = Number.MAX_VALUE;

  for (const loc of INDIAN_LOCATIONS) {
    if (!loc.lat || !loc.lng) continue;
    const dLat = (loc.lat - lat) * (Math.PI / 180);
    const dLng = (loc.lng - lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) *
        Math.cos(loc.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = 6371 * c; // Earth radius in km
    if (d < minDistance) {
      minDistance = d;
      closest = loc;
    }
  }

  return closest;
}

export function searchIndianCities(query: string): LocationItem[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return INDIAN_LOCATIONS;

  return INDIAN_LOCATIONS.filter(
    loc =>
      loc.name.toLowerCase().includes(clean) ||
      loc.nameHindi.includes(clean) ||
      loc.state.toLowerCase().includes(clean) ||
      loc.stateHindi.includes(clean)
  );
}

// Calculate straight-line distance in km using Haversine formula
export function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Resolve coordinate of a target clinic or doctor
export function resolveTargetCoordinates(target: {
  lat?: number;
  lng?: number;
  city?: string;
  pincode?: string;
  address?: string;
}): { lat: number; lng: number } | null {
  if (target.lat && target.lng) {
    return { lat: target.lat, lng: target.lng };
  }

  const cleanCity = target.city?.toLowerCase().trim() || '';
  const cleanAddr = target.address?.toLowerCase().trim() || '';
  const cleanPin = target.pincode?.trim() || '';

  // 1. Direct PIN matching with known locations
  if (cleanPin) {
    const byPin = INDIAN_LOCATIONS.find(loc => loc.pincode === cleanPin && loc.lat && loc.lng);
    if (byPin && byPin.lat && byPin.lng) {
      return { lat: byPin.lat, lng: byPin.lng };
    }
  }

  // 2. City name matching
  for (const loc of INDIAN_LOCATIONS) {
    if (!loc.lat || !loc.lng || loc.id === 'all') continue;
    const locNameLower = loc.name.toLowerCase();
    if (cleanCity && (cleanCity.includes(locNameLower) || locNameLower.includes(cleanCity) || loc.id === cleanCity)) {
      return { lat: loc.lat, lng: loc.lng };
    }
    if (cleanAddr && cleanAddr.includes(locNameLower)) {
      return { lat: loc.lat, lng: loc.lng };
    }
  }

  // 3. Common regional fallbacks
  if (cleanCity.includes('dehri') || cleanAddr.includes('dehri') || cleanPin === '821307') {
    return { lat: 24.9087, lng: 84.1852 };
  }
  if (cleanCity.includes('dalmia') || cleanAddr.includes('dalmia') || cleanPin === '821305') {
    return { lat: 24.9180, lng: 84.1750 };
  }
  if (cleanCity.includes('sasaram') || cleanAddr.includes('sasaram') || cleanPin === '821115') {
    return { lat: 24.9509, lng: 84.0289 };
  }
  if (cleanCity.includes('aurangabad') || cleanAddr.includes('aurangabad') || cleanPin === '824101') {
    return { lat: 24.7538, lng: 84.3742 };
  }
  if (cleanCity.includes('patna') || cleanAddr.includes('patna') || cleanPin.startsWith('800')) {
    return { lat: 25.5941, lng: 85.1376 };
  }
  if (cleanCity.includes('varanasi') || cleanAddr.includes('varanasi') || cleanCity.includes('kashi')) {
    return { lat: 25.3176, lng: 82.9739 };
  }
  if (cleanCity.includes('delhi') || cleanAddr.includes('delhi') || cleanPin.startsWith('110')) {
    return { lat: 28.6139, lng: 77.2090 };
  }
  if (cleanCity.includes('gaya') || cleanAddr.includes('gaya') || cleanPin === '823001') {
    return { lat: 24.7914, lng: 85.0002 };
  }

  return null;
}

// Calculate distance in km from a selected location to a clinic or doctor
export function getDistanceToLocation(
  currentLoc: LocationItem | undefined,
  target: { lat?: number; lng?: number; city?: string; pincode?: string; address?: string }
): number | null {
  if (!currentLoc || currentLoc.id === 'all' || !currentLoc.lat || !currentLoc.lng) {
    return null;
  }
  const coords = resolveTargetCoordinates(target);
  if (!coords) return null;
  return calculateDistanceKm(currentLoc.lat, currentLoc.lng, coords.lat, coords.lng);
}

// Check if a clinic or doctor is in the EXACT selected city/town
export function isExactLocationMatch(
  currentLoc: LocationItem | undefined,
  target: { lat?: number; lng?: number; city?: string; pincode?: string; address?: string }
): boolean {
  if (!currentLoc || currentLoc.id === 'all') return true;

  const cleanCity = target.city?.toLowerCase().trim() || '';
  const cleanAddr = target.address?.toLowerCase().trim() || '';
  const cleanPin = target.pincode?.trim() || '';
  const locName = currentLoc.name.toLowerCase();
  const locId = currentLoc.id.toLowerCase();

  // Exact PIN match
  if (currentLoc.pincode && cleanPin && currentLoc.pincode === cleanPin) {
    return true;
  }

  // Dehri & Dalmianagar twin city matching
  if ((locId === 'dehri' || locName.includes('dehri')) && (cleanCity.includes('dehri') || cleanAddr.includes('dehri') || cleanCity.includes('dalmianagar') || cleanAddr.includes('dalmianagar') || cleanPin === '821307' || cleanPin === '821305')) {
    return true;
  }

  // City or address direct match
  if (cleanCity && (cleanCity.includes(locName) || locName.includes(cleanCity) || cleanCity.includes(locId))) {
    return true;
  }
  if (cleanAddr && (cleanAddr.includes(locName) || cleanAddr.includes(locId))) {
    return true;
  }

  // Under 5 km considered same immediate city boundary
  const dist = getDistanceToLocation(currentLoc, target);
  if (dist !== null && dist <= 5) {
    return true;
  }

  return false;
}

// Check if a clinic or doctor is outside the primary city BUT within 50 km radius (Nearby suggestion)
export function isNearbyWithin50Km(
  currentLoc: LocationItem | undefined,
  target: { lat?: number; lng?: number; city?: string; pincode?: string; address?: string }
): { isNearby: boolean; distanceKm: number | null } {
  if (!currentLoc || currentLoc.id === 'all') {
    return { isNearby: false, distanceKm: null };
  }

  // If it's already an exact match for the local city, it is not a suggestion
  if (isExactLocationMatch(currentLoc, target)) {
    return { isNearby: false, distanceKm: null };
  }

  const dist = getDistanceToLocation(currentLoc, target);
  if (dist !== null && dist <= 50) {
    return { isNearby: true, distanceKm: dist };
  }

  return { isNearby: false, distanceKm: dist };
}

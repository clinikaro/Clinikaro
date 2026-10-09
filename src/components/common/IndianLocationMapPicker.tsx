import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Map, 
  AdvancedMarker, 
  Pin, 
  useMap 
} from '@vis.gl/react-google-maps';
import { 
  MapPin, 
  Search, 
  Crosshair, 
  ExternalLink, 
  Building2, 
  Globe2, 
  Check, 
  AlertCircle,
  Map as MapIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { 
  INDIAN_LOCATIONS, 
  INDIAN_STATES, 
  LocationItem, 
  findNearestIndianCity,
  searchIndianCities 
} from '../../data/indiaLocations';
import { Language } from '../../types';
import { 
  GOOGLE_MAPS_MAP_ID, 
  GMP_ATTRIBUTION_IDS 
} from '../../utils/googleMapsConfig';

interface IndianLocationMapPickerProps {
  lang: Language;
  address: string;
  onAddressChange: (val: string) => void;
  addressHindi?: string;
  onAddressHindiChange?: (val: string) => void;
  landmark: string;
  onLandmarkChange: (val: string) => void;
  pincode: string;
  onPincodeChange: (val: string) => void;
  city: string;
  onCityChange: (val: string) => void;
  state: string;
  onStateChange: (val: string) => void;
  lat?: number;
  lng?: number;
  onCoordinatesChange: (lat: number, lng: number) => void;
}

// Popular famous Indian cities across all regions (Metros & Major Hubs)
const QUICK_INDIAN_CITIES: { name: string; nameHindi: string; state: string; pin: string; lat: number; lng: number }[] = [
  { name: 'Dehri-on-Sone', nameHindi: 'डेहरी-ऑन-सोन', state: 'Bihar', pin: '821307', lat: 24.9087, lng: 84.1852 },
  { name: 'Patna', nameHindi: 'पटना', state: 'Bihar', pin: '800001', lat: 25.5941, lng: 85.1376 },
  { name: 'Varanasi', nameHindi: 'वाराणसी (काशी)', state: 'Uttar Pradesh', pin: '221001', lat: 25.3176, lng: 82.9739 },
  { name: 'New Delhi / NCR', nameHindi: 'नई दिल्ली', state: 'Delhi', pin: '110001', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', nameHindi: 'मुंबई', state: 'Maharashtra', pin: '400001', lat: 19.0760, lng: 72.8777 },
  { name: 'Bengaluru', nameHindi: 'बेंगलुरु', state: 'Karnataka', pin: '560001', lat: 12.9716, lng: 77.5946 },
  { name: 'Kolkata', nameHindi: 'कोलकाता', state: 'West Bengal', pin: '700001', lat: 22.5726, lng: 88.3639 },
  { name: 'Lucknow', nameHindi: 'लखनऊ', state: 'Uttar Pradesh', pin: '226001', lat: 26.8467, lng: 80.9462 },
  { name: 'Ranchi', nameHindi: 'राँची', state: 'Jharkhand', pin: '834001', lat: 23.3441, lng: 85.3096 },
  { name: 'Jaipur', nameHindi: 'जयपुर', state: 'Rajasthan', pin: '302001', lat: 26.9124, lng: 75.7873 },
  { name: 'Hyderabad', nameHindi: 'हैदराबाद', state: 'Telangana', pin: '500001', lat: 17.3850, lng: 78.4867 },
  { name: 'Ahmedabad', nameHindi: 'अहमदाबाद', state: 'Gujarat', pin: '380001', lat: 23.0225, lng: 72.5714 },
  { name: 'Pune', nameHindi: 'पुणे', state: 'Maharashtra', pin: '411001', lat: 18.5204, lng: 73.8567 },
  { name: 'Chennai', nameHindi: 'चेन्नई', state: 'Tamil Nadu', pin: '600001', lat: 13.0827, lng: 80.2707 },
  { name: 'Chandigarh', nameHindi: 'चंडीगढ़', state: 'Chandigarh', pin: '160017', lat: 30.7333, lng: 76.7794 },
  { name: 'Indore', nameHindi: 'इंदौर', state: 'Madhya Pradesh', pin: '452001', lat: 22.7196, lng: 75.8577 },
  { name: 'Kochi', nameHindi: 'कोच्चि', state: 'Kerala', pin: '682001', lat: 9.9312, lng: 76.2673 },
  { name: 'Guwahati', nameHindi: 'गुवाहाटी', state: 'Assam', pin: '781001', lat: 26.1445, lng: 91.7362 }
];

// Controller for syncing Google Map camera pan and zoom smoothly
const GoogleMapController: React.FC<{
  center: { lat: number; lng: number };
  zoom: number;
  triggerPan?: number;
}> = ({ center, zoom, triggerPan }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo(center);
    if (zoom) {
      map.setZoom(zoom);
    }
  }, [map, center.lat, center.lng, zoom, triggerPan]);

  return null;
};

export const IndianLocationMapPicker: React.FC<IndianLocationMapPickerProps> = ({
  lang,
  address,
  onAddressChange,
  addressHindi,
  onAddressHindiChange,
  landmark,
  onLandmarkChange,
  pincode,
  onPincodeChange,
  city,
  onCityChange,
  state,
  onStateChange,
  lat = 24.9087,
  lng = 84.1852,
  onCoordinatesChange
}) => {
  const [currentLat, setCurrentLat] = useState<number>(lat || 24.9087);
  const [currentLng, setCurrentLng] = useState<number>(lng || 84.1852);
  const [zoom, setZoom] = useState<number>(15);
  const [panTrigger, setPanTrigger] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [showCitySuggestions, setShowCitySuggestions] = useState<boolean>(false);

  // Sync internal coords if external props change
  useEffect(() => {
    if (lat && lng && (lat !== currentLat || lng !== currentLng)) {
      setCurrentLat(lat);
      setCurrentLng(lng);
    }
  }, [lat, lng]);

  const setCoordinates = useCallback((newLat: number, newLng: number, autoUpdateAddressText: boolean = false) => {
    const roundedLat = parseFloat(newLat.toFixed(5));
    const roundedLng = parseFloat(newLng.toFixed(5));
    setCurrentLat(roundedLat);
    setCurrentLng(roundedLng);
    onCoordinatesChange(roundedLat, roundedLng);

    if (autoUpdateAddressText) {
      const nearest = findNearestIndianCity(roundedLat, roundedLng);
      if (nearest && nearest.id !== 'all') {
        if (!city || city === '') {
          onCityChange(nearest.name);
          onStateChange(nearest.state);
          if (nearest.pincode && (!pincode || pincode === '110001')) {
            onPincodeChange(nearest.pincode);
          }
        }
      }
    }
  }, [city, pincode, onCityChange, onCoordinatesChange, onPincodeChange, onStateChange]);

  const filteredCities = useMemo(() => {
    if (!city) return INDIAN_LOCATIONS.filter(l => l.id !== 'all').slice(0, 8);
    const clean = city.toLowerCase().trim();
    return INDIAN_LOCATIONS.filter(
      l => l.id !== 'all' && (
        l.name.toLowerCase().includes(clean) || 
        l.nameHindi.includes(clean) || 
        l.state.toLowerCase().includes(clean)
      )
    ).slice(0, 10);
  }, [city]);

  const handleSelectIndianCity = (item: { name: string; nameHindi?: string; state: string; pin?: string; lat?: number; lng?: number }) => {
    onCityChange(item.name);
    onStateChange(item.state);
    if (item.pin) {
      onPincodeChange(item.pin);
    }
    if (item.lat && item.lng) {
      setCoordinates(item.lat, item.lng);
      setZoom(15);
      setPanTrigger(prev => prev + 1);
    }
    setShowCitySuggestions(false);
  };

  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError(lang === 'hi' ? 'ब्राउज़र में जीपीएस समर्थित नहीं है' : 'GPS not supported in browser');
      return;
    }
    setIsLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setCoordinates(latitude, longitude, true);
        setZoom(16);
        setPanTrigger(prev => prev + 1);
        const nearest = findNearestIndianCity(latitude, longitude);
        if (nearest && nearest.id !== 'all') {
          onCityChange(nearest.name);
          onStateChange(nearest.state);
          if (nearest.pincode) onPincodeChange(nearest.pincode);
        }
      },
      () => {
        setIsLocating(false);
        setLocateError(
          lang === 'hi'
            ? 'जीपीएस लोकेशन प्राप्त नहीं हो सकी। कृपया मानचित्र पर सीधे क्लिक करें।'
            : 'Could not fetch GPS. Click directly on Google Maps to drop pin.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSearchPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setLocateError(null);

    const matches = searchIndianCities(searchQuery).filter(l => l.id !== 'all');
    if (matches.length > 0 && typeof matches[0].lat === 'number' && typeof matches[0].lng === 'number') {
      const top = matches[0];
      setCoordinates(top.lat as number, top.lng as number, true);
      onCityChange(top.name);
      onStateChange(top.state);
      if (top.pincode) onPincodeChange(top.pincode);
      setZoom(15);
      setPanTrigger(prev => prev + 1);
      setIsSearching(false);
      return;
    }

    // Try Google Maps Geocoder if loaded in window
    if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
      const geocoder = new google.maps.Geocoder();
      const queryWithIndia = searchQuery.toLowerCase().includes('india') ? searchQuery : `${searchQuery}, India`;
      geocoder.geocode({ address: queryWithIndia, region: 'in' }, (results, status) => {
        setIsSearching(false);
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          setCoordinates(loc.lat(), loc.lng(), true);
          setZoom(16);
          setPanTrigger(prev => prev + 1);
          // If address component contains city or state, fill them
          const comps = results[0].address_components;
          const foundCity = comps.find(c => c.types.includes('locality'))?.long_name;
          const foundState = comps.find(c => c.types.includes('administrative_area_level_1'))?.long_name;
          const foundPin = comps.find(c => c.types.includes('postal_code'))?.long_name;
          if (foundCity) onCityChange(foundCity);
          if (foundState) onStateChange(foundState);
          if (foundPin) onPincodeChange(foundPin);
        } else {
          setLocateError(
            lang === 'hi' 
              ? 'स्थान नहीं मिला। कृपया निकटतम शहर या लैंडमार्क खोजें।' 
              : 'Location not found. Try searching by city, district or landmark.'
          );
        }
      });
    } else {
      setIsSearching(false);
      setLocateError(
        lang === 'hi'
          ? 'स्थान खोज के लिए कृपया मानचित्र पर सीधे क्लिक करें।'
          : 'Please click directly on the Google Map to drop the pin.'
      );
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`;

  return (
    <div className="space-y-4">
      {/* 1. SECTION TITLE WITH OFFICIAL GOOGLE MAPS BADGE */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 font-bold text-gray-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-sm font-fraunces text-emerald-950">
            {lang === 'hi' ? '3. गूगल मैप्स क्लिनिक स्थान एवं पता (Google Maps Location)' : '3. Google Maps Location, Address & Pin Selection'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0F5257] text-amber-300 border border-teal-800 flex items-center gap-1 shadow-2xs">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Google Maps Platform</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            🇮🇳 India OPD
          </span>
        </div>
      </div>

      {/* 2. QUICK SELECT POPULAR INDIAN CITIES */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-gray-700 flex items-center gap-1">
            <Globe2 className="w-3.5 h-3.5 text-teal-700" />
            <span>{lang === 'hi' ? 'भारत के प्रमुख शहर (गूगल मैप पर त्वरित जाएं):' : 'Popular Indian Cities (Jump Google Map Camera):'}</span>
          </label>
          <span className="text-[11px] text-gray-500">
            {lang === 'hi' ? 'क्लिक करते ही गूगल मैप स्वतः केंद्रित होगा' : 'Click to pan Google Map'}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 py-0.5">
          {QUICK_INDIAN_CITIES.map((c, idx) => {
            const isSelected = city.toLowerCase().includes(c.name.toLowerCase()) || (c.name.toLowerCase().includes(city.toLowerCase()) && city.length > 2);
            return (
              <button
                type="button"
                key={idx}
                onClick={() => handleSelectIndianCity(c)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 border ${
                  isSelected
                    ? 'bg-[#0F5257] text-white border-teal-800 shadow-xs ring-1 ring-amber-400'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-teal-500 hover:text-teal-900 hover:bg-teal-50/50'
                }`}
              >
                <span>📍</span>
                <span>{lang === 'hi' ? c.nameHindi : c.name}</span>
                {isSelected && <Check className="w-3 h-3 text-emerald-300 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. INTERACTIVE GOOGLE MAP SECTION */}
      <div className="rounded-2xl border-2 border-teal-900/20 bg-stone-50 overflow-hidden shadow-xs">
        {/* Google Map Header & Search Bar */}
        <div className="p-3 bg-gradient-to-r from-[#0F5257] to-[#0A3A3D] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-800 flex items-center justify-center text-amber-300 shrink-0">
              <MapIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span>{lang === 'hi' ? 'सत्यापित गूगल मैप: क्लिनिक पिन ड्रॉप करें' : 'Interactive Google Map: Drop Exact Clinic Pin'}</span>
              </div>
              <div className="text-[10px] text-teal-100">
                {lang === 'hi' ? 'गूगल मैप पर कहीं भी क्लिक करें या पिन को सही स्थान पर रखें' : 'Click anywhere on Google Map to place & update clinic pin'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {/* GPS Locate Button */}
            <button
              type="button"
              onClick={handleDetectCurrentLocation}
              disabled={isLocating}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-50"
              title="Use current GPS location"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? (lang === 'hi' ? 'खोज रहे हैं...' : 'Detecting...') : (lang === 'hi' ? 'मेरा GPS स्थान' : 'My GPS')}</span>
            </button>

            {/* Recenter Dehri Center */}
            <button
              type="button"
              onClick={() => {
                setCoordinates(24.9087, 84.1852);
                setZoom(15);
                setPanTrigger(prev => prev + 1);
              }}
              className="px-2 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-800 text-[11px] text-amber-300 font-medium transition-colors cursor-pointer flex items-center gap-1"
              title="Reset to Dehri Center"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{lang === 'hi' ? 'री-सेंटर' : 'Center'}</span>
            </button>
          </div>
        </div>

        {/* Place Search on Google Map */}
        <div className="p-2.5 bg-white border-b border-gray-200">
          <form onSubmit={handleSearchPlace} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'hi' ? 'गूगल मैप पर अस्पताल, सड़क, या शहर खोजें...' : 'Search Indian hospital, market, landmark or city on Google Maps...'}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-stone-50/50"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
            >
              <Search className="w-3 h-3 text-amber-300" />
              <span>{isSearching ? '...' : (lang === 'hi' ? 'खोजें' : 'Search')}</span>
            </button>
          </form>

          {locateError && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{locateError}</span>
            </div>
          )}
        </div>

        {/* REAL INTERACTIVE GOOGLE MAP CANVAS */}
        <div 
          className="relative w-full h-80 sm:h-96 bg-stone-200 select-none overflow-hidden"
          title={lang === 'hi' ? 'पिन रखने के लिए गूगल मैप पर क्लिक करें' : 'Click anywhere on Google Map to place clinic pin'}
        >
          <Map
            mapId={GOOGLE_MAPS_MAP_ID}
            defaultCenter={{ lat: currentLat, lng: currentLng }}
            defaultZoom={zoom}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapTypeControl={true}
            streetViewControl={true}
            fullscreenControl={true}
            zoomControl={true}
            internalUsageAttributionIds={GMP_ATTRIBUTION_IDS}
            onClick={(e) => {
              if (e.detail?.latLng) {
                setCoordinates(e.detail.latLng.lat, e.detail.latLng.lng, true);
              }
            }}
            className="w-full h-full"
          >
            <GoogleMapController 
              center={{ lat: currentLat, lng: currentLng }} 
              zoom={zoom} 
              triggerPan={panTrigger} 
            />

            {/* Draggable & Clickable Clinic Pin */}
            <AdvancedMarker
              position={{ lat: currentLat, lng: currentLng }}
              draggable={true}
              onDragEnd={(e) => {
                if (e.latLng) {
                  setCoordinates(e.latLng.lat(), e.latLng.lng(), true);
                }
              }}
              title={`${city || 'Clinic'} Location`}
            >
              <Pin
                background="#0F5257"
                borderColor="#FFFFFF"
                glyphColor="#FFFFFF"
                scale={1.4}
              >
                <span className="text-xs font-bold leading-none select-none">
                  🏥
                </span>
              </Pin>
            </AdvancedMarker>
          </Map>

          {/* Floating Instructions Overlay */}
          <div className="absolute top-2 left-2 pointer-events-none bg-stone-900/85 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md border border-white/10 z-10">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>{lang === 'hi' ? 'गूगल मैप पर क्लिक करें या पिन खींचें' : 'Click on Google Map or drag pin to position'}</span>
          </div>

          {/* Manual Zoom Overlay */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 shadow-lg z-10 pointer-events-auto">
            <button
              type="button"
              onClick={() => { setZoom(z => Math.min(20, z + 1)); setPanTrigger(p => p + 1); }}
              className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-gray-800 border border-gray-300 flex items-center justify-center font-bold text-base hover:text-teal-900 transition-colors shadow-xs cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { setZoom(z => Math.max(4, z - 1)); setPanTrigger(p => p + 1); }}
              className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-gray-800 border border-gray-300 flex items-center justify-center font-bold text-base hover:text-teal-900 transition-colors shadow-xs cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAP FOOTER: Coordinates and External Google Maps View */}
        <div className="p-2.5 bg-stone-100 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-mono text-[11px] text-gray-700">
            <span className="font-bold text-teal-900 bg-white px-2 py-0.5 rounded border border-gray-200">
              LAT: {currentLat.toFixed(5)}
            </span>
            <span className="font-bold text-teal-900 bg-white px-2 py-0.5 rounded border border-gray-200">
              LNG: {currentLng.toFixed(5)}
            </span>
            <span className="text-gray-500 hidden sm:inline">
              (Zoom: {zoom}x)
            </span>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:text-teal-950 hover:underline bg-white px-2.5 py-1 rounded-md border border-teal-200 shadow-2xs"
          >
            <ExternalLink className="w-3 h-3 text-teal-600" />
            <span>{lang === 'hi' ? 'गूगल मैप्स में खोलें' : 'Open in Google Maps'}</span>
          </a>
        </div>
      </div>

      {/* 4. ADDRESS & LOCATION DETAIL INPUT FIELDS */}
      <div className="space-y-3 pt-2">
        {/* Full Address Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-gray-700 block mb-1 text-xs">
              {lang === 'hi' ? 'पूरा पता (English Address) *' : 'Full Address (English) *'}
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder="e.g. Station Road, Dalmianagar / Near SBI Bank"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1 text-xs">
              {lang === 'hi' ? 'लैंडमार्क (पहचान स्थल / प्रमुख जगह)' : 'Landmark (Nearby prominent place)'}
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => onLandmarkChange(e.target.value)}
              placeholder={lang === 'hi' ? 'उदा. मेट्रो स्टेशन के पास, एसबीआई बैंक के सामने' : 'e.g. Opposite Bus Stand, Near Sun Temple'}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-700"
            />
          </div>
        </div>

        {/* PIN Code, City, State Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* PIN Code */}
          <div>
            <label className="font-semibold text-gray-700 block mb-1 text-xs">
              {lang === 'hi' ? 'पिन कोड (PIN Code) *' : 'PIN Code *'}
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={pincode}
              onChange={(e) => onPincodeChange(e.target.value.replace(/\D/g, ''))}
              placeholder="821307"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono-num text-xs font-bold text-amber-950 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
            />
          </div>

          {/* City / Town with auto-suggest */}
          <div className="relative">
            <label className="font-semibold text-gray-700 block mb-1 text-xs">
              {lang === 'hi' ? 'शहर / नगर (City / Town) *' : 'City / Town *'}
            </label>
            <input
              type="text"
              required
              value={city}
              onFocus={() => setShowCitySuggestions(true)}
              onChange={(e) => {
                onCityChange(e.target.value);
                setShowCitySuggestions(true);
              }}
              placeholder="e.g. Dehri-on-Sone, Patna, Varanasi, Delhi"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-700"
            />

            {/* City Dropdown suggestions */}
            {showCitySuggestions && filteredCities.length > 0 && (
              <div 
                className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto"
                onMouseLeave={() => setShowCitySuggestions(false)}
              >
                <div className="p-1 text-[10px] font-bold text-gray-400 px-2 border-b border-gray-100">
                  {lang === 'hi' ? 'सुझाए गए भारतीय शहर:' : 'Suggested Indian Cities:'}
                </div>
                {filteredCities.map(c => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => handleSelectIndianCity(c)}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-teal-50 hover:text-teal-900 transition-colors flex items-center justify-between border-b border-gray-50 last:border-0 cursor-pointer"
                  >
                    <span className="font-medium">{lang === 'hi' ? c.nameHindi : c.name}</span>
                    <span className="text-[10px] text-gray-500">{c.state}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* State Selection Dropdown */}
          <div>
            <label className="font-semibold text-gray-700 block mb-1 text-xs">
              {lang === 'hi' ? 'राज्य (State) *' : 'State *'}
            </label>
            <select
              value={state}
              onChange={(e) => {
                const selectedStateName = e.target.value;
                onStateChange(selectedStateName);
                const cityInState = INDIAN_LOCATIONS.find(loc => loc.state.toLowerCase() === selectedStateName.toLowerCase() && loc.lat && loc.lng);
                if (cityInState && cityInState.lat && cityInState.lng) {
                  setCoordinates(cityInState.lat, cityInState.lng);
                  setZoom(11);
                  setPanTrigger(prev => prev + 1);
                }
              }}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st.code} value={st.name}>
                  {lang === 'hi' ? `${st.nameHindi} (${st.name})` : st.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional Hindi Address */}
        {onAddressHindiChange && (
          <div>
            <label className="font-semibold text-gray-700 block mb-1 text-xs">
              {lang === 'hi' ? 'पता हिंदी में (वैकल्पिक)' : 'Address in Hindi (Optional)'}
            </label>
            <input
              type="text"
              value={addressHindi || ''}
              onChange={(e) => onAddressHindiChange(e.target.value)}
              placeholder="उदा. स्टेशन रोड, डालमियानगर के पास, रोहतास"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-700"
            />
          </div>
        )}
      </div>
    </div>
  );
};

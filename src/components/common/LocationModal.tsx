import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Navigation, 
  Check, 
  Building2, 
  Globe2 
} from 'lucide-react';
import { 
  INDIAN_LOCATIONS, 
  LocationItem, 
  ALL_INDIA_LOCATION,
  findNearestIndianCity 
} from '../../data/indiaLocations';
import { Language } from '../../types';
import { CityLandmarkThumb } from './CityLandmarkThumb';
import { POPULAR_FEATURED_CITIES, PopularCityItem } from '../patient/FamousCitiesSection';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: LocationItem;
  onSelectLocation: (loc: LocationItem) => void;
  lang: Language;
}

const DEFAULT_RECENT_SEARCHES = [
  'Patna',
  'Dehri-on-Sone',
  'New Delhi',
  'Mumbai',
  'Varanasi',
  'Kochi',
  'Jaipur',
  'Nagpur',
  'Visakhapatnam',
  'Indore',
  'Surat'
];

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  selectedLocation,
  onSelectLocation,
  lang
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  // Previously searched state synced with localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mdd_recent_searched_locations');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_RECENT_SEARCHES;
  });

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('mdd_recent_searched_locations');
    } catch {}
  };

  const addRecentSearch = (name: string) => {
    setRecentSearches(prev => {
      const updated = [name, ...prev.filter(item => item.toLowerCase() !== name.toLowerCase())].slice(0, 10);
      try {
        localStorage.setItem('mdd_recent_searched_locations', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const filteredLocations = useMemo(() => {
    const clean = searchQuery.trim().toLowerCase();
    if (!clean) return [];

    return INDIAN_LOCATIONS.filter(
      loc =>
        loc.name.toLowerCase().includes(clean) ||
        loc.nameHindi.includes(clean) ||
        loc.state.toLowerCase().includes(clean) ||
        loc.stateHindi.includes(clean) ||
        (loc.pincode && loc.pincode.includes(clean))
    );
  }, [searchQuery]);

  const isNumericPin = useMemo(() => {
    const clean = searchQuery.trim();
    return /^\d{3,6}$/.test(clean);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSelect = (loc: LocationItem) => {
    addRecentSearch(loc.name);
    onSelectLocation(loc);
    onClose();
  };

  const handlePopularCitySelect = (city: PopularCityItem) => {
    const matched = INDIAN_LOCATIONS.find(loc => loc.id === city.id) || {
      id: city.id,
      name: city.name,
      nameHindi: city.nameHindi,
      state: city.state,
      stateHindi: city.state,
      isPopular: true
    };
    handleSelect(matched);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setDetectError(
        lang === 'hi'
          ? 'आपके ब्राउज़र में स्थान सेवा समर्थित नहीं है'
          : 'Geolocation is not supported by your browser.'
      );
      return;
    }

    setIsDetecting(true);
    setDetectError(null);

    navigator.geolocation.getCurrentPosition(
      position => {
        setIsDetecting(false);
        const { latitude, longitude } = position.coords;
        const nearestCity = findNearestIndianCity(latitude, longitude);
        handleSelect(nearestCity);
      },
      () => {
        setIsDetecting(false);
        setDetectError(
          lang === 'hi'
            ? 'स्थान का पता नहीं चल सका। कृपया सूची से चुनें।'
            : 'Could not access GPS. Please pick a city from the list.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
      >
        {/* Header - Dark Charcoal Bar matching Image 2 */}
        <div className="bg-[#1E293B] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <h2 id="location-modal-title" className="font-sans text-base sm:text-lg font-bold text-white tracking-tight">
            {lang === 'hi' ? 'अपना क्षेत्र या शहर चुनें (Select your Area)' : 'Select your Area'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar matching Image 2 */}
        <div className="p-4 sm:p-5 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-xl p-1.5 border border-gray-200 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-2xs">
            <Search className="w-5 h-5 text-gray-400 ml-2 shrink-0" />
            
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={lang === 'hi' ? 'अपना क्षेत्र या पिन कोड लिखें' : 'Type your Area name or pincode'}
              className="bg-transparent flex-1 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none px-2 py-1 font-medium"
              autoFocus
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 p-1 mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Current Location Button with Green Compass Icon */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-emerald-50 text-emerald-600 border border-gray-200 hover:border-emerald-300 font-bold text-xs shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
              title="Use Current Location via GPS"
            >
              <Navigation className={`w-3.5 h-3.5 text-emerald-500 fill-emerald-100 ${isDetecting ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">
                {isDetecting ? (lang === 'hi' ? 'खोज रहे हैं...' : 'Detecting...') : (lang === 'hi' ? 'वर्तमान स्थान' : 'Current Location')}
              </span>
            </button>

            {/* Green Search Action Button */}
            <button
              type="button"
              onClick={() => {
                if (filteredLocations.length > 0) {
                  handleSelect(filteredLocations[0]);
                }
              }}
              className="w-9 h-9 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {detectError && (
            <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-md border border-rose-200 mt-2">
              {detectError}
            </p>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
          {/* PIN code quick match */}
          {isNumericPin && (
            <button
              onClick={() => {
                const pin = searchQuery.trim();
                handleSelect({
                  id: `pin-${pin}`,
                  name: `PIN ${pin}`,
                  nameHindi: `पिन ${pin}`,
                  state: 'Local Area',
                  stateHindi: 'स्थानीय क्षेत्र',
                  pincode: pin,
                  isPopular: false
                });
              }}
              className="w-full p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-1 rounded bg-emerald-600 text-white font-mono-num font-bold text-xs">
                  PIN
                </span>
                <span className="text-xs font-bold text-emerald-950">
                  {lang === 'hi' ? `पिन कोड ${searchQuery.trim()} के अनुसार डॉक्टर खोजें` : `Apply PIN code: ${searchQuery.trim()}`}
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-700">Apply →</span>
            </button>
          )}

          {/* Search Results if user is typing */}
          {searchQuery.trim() ? (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-400 block">
                {lang === 'hi' ? `खोज परिणाम (${filteredLocations.length})` : `Matching Locations (${filteredLocations.length})`}
              </span>

              {filteredLocations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredLocations.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelect(loc)}
                      className="p-2.5 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-between text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CityLandmarkThumb cityId={loc.id} cityName={loc.name} className="w-8 h-8 rounded-lg shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {lang === 'hi' ? loc.nameHindi : loc.name}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {lang === 'hi' ? loc.stateHindi : loc.state} {loc.pincode ? `• ${loc.pincode}` : ''}
                          </p>
                        </div>
                      </div>
                      {selectedLocation.id === loc.id && (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500 text-xs">
                  {lang === 'hi' ? 'कोई शहर या क्षेत्र नहीं मिला। कृपया अन्य नाम लिखें।' : 'No matching city found. Please try another area or PIN.'}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Previously Searched Section matching Image 2 */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-400 tracking-wide">
                      {lang === 'hi' ? 'हाल में खोजे गए क्षेत्र (Previously Searched)' : 'Previously Searched'}
                    </span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Clear</span>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const matched = INDIAN_LOCATIONS.find(loc => loc.name.toLowerCase() === term.toLowerCase() || loc.nameHindi === term);
                          if (matched) {
                            handleSelect(matched);
                          } else {
                            handleSelect({
                              id: `custom-${term.toLowerCase().replace(/\s+/g, '-')}`,
                              name: term,
                              nameHindi: term,
                              state: 'India',
                              stateHindi: 'भारत'
                            });
                          }
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200/90 rounded-xl text-xs font-medium text-gray-700 shadow-2xs hover:border-gray-300 transition-all cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Cities Section with Visual Cards matching Image 1 & 2 */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-gray-400 tracking-wide">
                    {lang === 'hi' ? 'प्रमुख लोकप्रिय शहर (Popular Cities)' : 'Popular Cities'}
                  </span>

                  {/* All India Quick Option */}
                  <button
                    type="button"
                    onClick={() => handleSelect(ALL_INDIA_LOCATION)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? '🇮🇳 सम्पूर्ण भारत' : 'All India'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {POPULAR_FEATURED_CITIES.map(city => {
                    const isSelected = selectedLocation.id === city.id || selectedLocation.name.toLowerCase() === city.name.toLowerCase();

                    return (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => handlePopularCitySelect(city)}
                        className={`p-2 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs group ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                            : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <CityLandmarkThumb cityId={city.id} cityName={city.name} className="w-8 h-8 rounded-lg shrink-0" />
                        <span className={`text-xs font-semibold truncate ${isSelected ? 'text-emerald-900' : 'text-gray-800'}`}>
                          {lang === 'hi' ? city.nameHindi.split(' ')[0] : city.name}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3] ml-auto shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

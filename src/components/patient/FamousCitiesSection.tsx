import React from 'react';
import { Plus, Check, ChevronRight } from 'lucide-react';
import { LocationItem, INDIAN_LOCATIONS } from '../../data/indiaLocations';
import { Language } from '../../types';
import { CityLandmarkThumb } from '../common/CityLandmarkThumb';

export interface PopularCityItem {
  id: string;
  name: string;
  nameHindi: string;
  state: string;
  famousFor: string;
  famousForHindi: string;
}

export const POPULAR_FEATURED_CITIES: PopularCityItem[] = [
  { id: 'delhi', name: 'Delhi NCR', nameHindi: 'दिल्ली / NCR', state: 'Delhi', famousFor: 'India Gate & Chole Bhature', famousForHindi: 'इंडिया गेट व छोले भटूरे' },
  { id: 'mumbai', name: 'Mumbai', nameHindi: 'मुंबई', state: 'Maharashtra', famousFor: 'Gateway of India & Vada Pav', famousForHindi: 'गेटवे ऑफ इंडिया व वड़ा पाव' },
  { id: 'bengaluru', name: 'Bengaluru', nameHindi: 'बेंगलुरु', state: 'Karnataka', famousFor: 'Vidhana Soudha & Filter Kaapi', famousForHindi: 'विधान सौध व फ़िल्टर कॉफ़ी' },
  { id: 'ranchi', name: 'Ranchi', nameHindi: 'राँची', state: 'Jharkhand', famousFor: 'Tagore Hill, Hundru & Dhuska', famousForHindi: 'टैगोर हिल, हुंडरू व धुस्का' },
  { id: 'patna', name: 'Patna', nameHindi: 'पटना', state: 'Bihar', famousFor: 'Golghar & Litti Chokha', famousForHindi: 'ऐतिहासिक गोलघर व लिट्टी चोखा' },
  { id: 'varanasi', name: 'Varanasi', nameHindi: 'बनारस / वाराणसी', state: 'Uttar Pradesh', famousFor: 'Ganga Ghats & Banarasi Paan', famousForHindi: 'पावन गंगा घाट व बनारसी पान' },
  { id: 'lucknow', name: 'Lucknow', nameHindi: 'लखनऊ', state: 'Uttar Pradesh', famousFor: 'Rumi Darwaza & Awadhi Biryani', famousForHindi: 'रूमी दरवाज़ा व अवधी स्वाद' },
  { id: 'kolkata', name: 'Kolkata', nameHindi: 'कोलकाता', state: 'West Bengal', famousFor: 'Howrah Bridge & Rosogolla', famousForHindi: 'हावड़ा ब्रिज व स्पंजी रसगुल्ला' },
  { id: 'hyderabad', name: 'Hyderabad', nameHindi: 'हैदराबाद', state: 'Telangana', famousFor: 'Charminar & Dum Biryani', famousForHindi: 'चारमीनार व दम बिरयानी' },
  { id: 'dehri', name: 'Dehri-on-Sone', nameHindi: 'डेहरी-ऑन-सोन', state: 'Bihar', famousFor: 'Rohtas Fort & Belgrami', famousForHindi: 'रोहतासगढ़ किला व बेलग्रामी' },
  { id: 'jaipur', name: 'Jaipur', nameHindi: 'जयपुर', state: 'Rajasthan', famousFor: 'Hawa Mahal & Dal Baati', famousForHindi: 'हवा महल व दाल बाटी चूरमा' },
  { id: 'ahmedabad', name: 'Ahmedabad', nameHindi: 'अहमदाबाद', state: 'Gujarat', famousFor: 'Sabarmati & Fafda-Jalebi', famousForHindi: 'साबरमती व फाफड़ा-जलेबी' },
  { id: 'agra', name: 'Agra', nameHindi: 'आगरा', state: 'Uttar Pradesh', famousFor: 'Taj Mahal & Agra Petha', famousForHindi: 'ताजमहल व मशहूर पंछी पेठा' },
  { id: 'indore', name: 'Indore', nameHindi: 'इन्दौर', state: 'Madhya Pradesh', famousFor: 'Rajwada & Sarafa Chaat', famousForHindi: 'राजवाड़ा व सराफा चाट' }
];

interface FamousCitiesSectionProps {
  lang: Language;
  selectedLocation: LocationItem;
  onSelectLocation: (location: LocationItem) => void;
  onOpenLocationModal: () => void;
}

export const FamousCitiesSection: React.FC<FamousCitiesSectionProps> = ({
  lang,
  selectedLocation,
  onSelectLocation,
  onOpenLocationModal
}) => {
  const handleCityClick = (city: PopularCityItem) => {
    const matched = INDIAN_LOCATIONS.find(loc => loc.id === city.id) || {
      id: city.id,
      name: city.name,
      nameHindi: city.nameHindi,
      state: city.state,
      stateHindi: city.state,
      isPopular: true
    };
    onSelectLocation(matched);

    const docSection = document.getElementById('browse-doctors-section');
    if (docSection) {
      docSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 my-4 sm:my-5" id="famous-cities-section">
      <div className="space-y-2">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-stone-700 font-sans tracking-tight">
              {lang === 'hi' ? 'प्रमुख लोकप्रिय शहर' : 'Popular Cities'}
            </h2>
            <span className="text-[11px] text-stone-400 hidden sm:inline">
              {lang === 'hi' ? '• प्रसिद्ध स्थल, धरोहर व खान-पान' : '• Famous heritage, monuments & iconic food'}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenLocationModal}
            className="text-xs font-bold text-[#0F5257] hover:text-teal-950 flex items-center gap-0.5 cursor-pointer transition-colors"
          >
            <span>{lang === 'hi' ? 'सभी शहर देखें' : 'View all cities'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* STRICTLY ONE SINGLE HORIZONTAL LINE - NO WRAPPING */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar items-center gap-2 sm:gap-2.5 py-1 scroll-smooth overscroll-x-contain">
          {POPULAR_FEATURED_CITIES.map(city => {
            const isSelected = selectedLocation.id === city.id || selectedLocation.name.toLowerCase() === city.name.toLowerCase();

            return (
              <button
                key={city.id}
                type="button"
                onClick={() => handleCityClick(city)}
                className={`group px-3 py-2 rounded-xl border flex items-center gap-2.5 shrink-0 flex-none transition-all cursor-pointer whitespace-nowrap text-left ${
                  isSelected
                    ? 'bg-amber-50/90 border-amber-400 text-teal-950 ring-2 ring-amber-400/50 shadow-sm'
                    : 'bg-white hover:bg-stone-50 border-stone-200/90 hover:border-stone-300 text-stone-800 shadow-2xs hover:shadow-xs'
                }`}
                title={lang === 'hi' ? `${city.nameHindi} (${city.famousForHindi})` : `${city.name} (${city.famousFor})`}
              >
                {/* Square Rounded Thumbnail Image matching user image */}
                <CityLandmarkThumb cityId={city.id} cityName={city.name} className="w-8 h-8 rounded-lg shrink-0 flex-none" />

                {/* City Name */}
                <div className="flex flex-col leading-tight">
                  <span className={`text-xs sm:text-sm font-semibold tracking-tight ${isSelected ? 'text-[#0F5257] font-bold' : 'text-stone-800'}`}>
                    {lang === 'hi' ? city.nameHindi : city.name}
                  </span>
                  <span className="text-[10px] text-stone-400 group-hover:text-stone-500 font-normal truncate max-w-[125px]">
                    {lang === 'hi' ? city.famousForHindi : city.famousFor}
                  </span>
                </div>

                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3] ml-0.5 shrink-0" />
                )}
              </button>
            );
          })}

          {/* "+ More" button at the end of the line */}
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-100/60 to-teal-50 hover:from-amber-500/20 hover:to-teal-100 text-[#0F5257] font-bold text-xs sm:text-sm border-2 border-dashed border-amber-400 hover:border-amber-500 shadow-2xs hover:shadow-xs shrink-0 flex-none flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            id="famous-cities-more-btn"
            title={lang === 'hi' ? 'अन्य सभी भारतीय शहर और राज्य देखें' : 'View all other Indian cities & states'}
          >
            <Plus className="w-4 h-4 text-amber-600 stroke-[3]" />
            <span>{lang === 'hi' ? '+ और शहर (More)' : '+ More Cities'}</span>
          </button>
        </div>
      </div>
    </section>
  );
};

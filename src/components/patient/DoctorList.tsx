import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowLeft, 
  SlidersHorizontal,
  Building2,
  CalendarCheck,
  RotateCcw,
  MapPin,
  ChevronDown,
  LayoutList,
  Map as MapIcon
} from 'lucide-react';
import { Doctor, Clinic, Language } from '../../types';
import { SPECIALTIES } from '../../data/seedData';
import { translations } from '../../data/translations';
import { DoctorCard } from './DoctorCard';
import { DoctorListMap } from './DoctorListMap';
import { LocationItem, ALL_INDIA_LOCATION, isExactLocationMatch, isNearbyWithin50Km } from '../../data/indiaLocations';

interface DoctorListProps {
  lang: Language;
  doctors: Doctor[];
  clinics: Clinic[];
  initialSpecialty?: string;
  initialFacilityType?: 'clinic' | 'hospital';
  initialViewMode?: 'list' | 'map';
  selectedLocation?: LocationItem;
  onOpenLocationModal?: () => void;
  onSelectDoctor: (doctor: Doctor) => void;
  onBookDoctor: (doctor: Doctor) => void;
  onSelectClinic?: (clinic: Clinic) => void;
  onBack: () => void;
}

export const DoctorList: React.FC<DoctorListProps> = ({
  lang,
  doctors,
  clinics,
  initialSpecialty,
  initialFacilityType,
  initialViewMode,
  selectedLocation = ALL_INDIA_LOCATION,
  onOpenLocationModal,
  onSelectDoctor,
  onBookDoctor,
  onSelectClinic,
  onBack
}) => {
  const t = translations[lang];

  const [viewMode, setViewMode] = useState<'list' | 'map'>(initialViewMode || 'list');
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(initialSpecialty || 'all');
  const [facilityType, setFacilityType] = useState<'all' | 'clinic' | 'hospital'>(initialFacilityType || 'all');
  const [maxFee, setMaxFee] = useState<number>(1000);
  const [onlyAvailableToday, setOnlyAvailableToday] = useState<boolean>(false);
  const [locationScope, setLocationScope] = useState<'all_eligible' | 'local_only' | 'nearby_50km'>('all_eligible');

  // Filter & Proximity evaluation logic
  const evaluatedDoctors = doctors
    .map(doc => {
      // Search matching (Name, Specialty, Clinic, City, PIN Code, Address, Landmark)
      const matchSearch =
        !search.trim() ||
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        Boolean(doc.nameHindi?.toLowerCase().includes(search.toLowerCase())) ||
        doc.specialty.toLowerCase().includes(search.toLowerCase()) ||
        Boolean(doc.specialtyHindi?.toLowerCase().includes(search.toLowerCase())) ||
        doc.clinicName.toLowerCase().includes(search.toLowerCase()) ||
        Boolean(doc.city && doc.city.toLowerCase().includes(search.toLowerCase())) ||
        Boolean(doc.pincode && doc.pincode.includes(search.trim())) ||
        Boolean(doc.address && doc.address.toLowerCase().includes(search.toLowerCase())) ||
        Boolean(doc.landmark && doc.landmark.toLowerCase().includes(search.toLowerCase()));

      // Specialty matching
      const matchSpecialty =
        selectedSpecialty === 'all' ||
        doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());

      // Facility matching
      const clinic = clinics.find(c => c.id === doc.clinicId);
      const matchFacility =
        facilityType === 'all' ||
        (clinic && clinic.type === facilityType);

      // Fee matching
      const matchFee = doc.fee <= maxFee;

      // Availability matching
      const matchAvail = !onlyAvailableToday || doc.availableToday;

      if (!matchSearch || !matchSpecialty || !matchFacility || !matchFee || !matchAvail) {
        return null;
      }

      // Location & Proximity:
      // If "all" India, include all
      if (!selectedLocation || selectedLocation.id === 'all') {
        return {
          doctor: doc,
          isExact: true,
          isNearby: false,
          distanceKm: null
        };
      }

      // Exact city match (e.g. Dehri)
      const isExact = isExactLocationMatch(selectedLocation, doc);
      // Nearby within 50 km (e.g. Sasaram ~16km, Aurangabad ~25km)
      const { isNearby, distanceKm } = isNearbyWithin50Km(selectedLocation, doc);

      // If neither exact nor within 50 km, strictly exclude!
      // (e.g. Patna 121 km, Delhi 810 km, Varanasi 130 km are hidden when Dehri is selected)
      if (!isExact && !isNearby) {
        return null;
      }

      return {
        doctor: doc,
        isExact,
        isNearby,
        distanceKm: isExact ? null : distanceKm
      };
    })
    .filter((item): item is { doctor: Doctor; isExact: boolean; isNearby: boolean; distanceKm: number | null } => item !== null);

  const localCount = evaluatedDoctors.filter(d => d.isExact).length;
  const nearbyCount = evaluatedDoctors.filter(d => d.isNearby).length;

  const filtered = evaluatedDoctors
    .filter(item => {
      if (!selectedLocation || selectedLocation.id === 'all') return true;
      if (locationScope === 'local_only') return item.isExact;
      if (locationScope === 'nearby_50km') return item.isNearby;
      return true; // 'all_eligible' includes exact + 50km suggestions
    })
    .sort((a, b) => {
      // Local doctors first, then nearby suggestions sorted by proximity
      if (a.isExact && !b.isExact) return -1;
      if (!a.isExact && b.isExact) return 1;
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      return 0;
    });

  const resetFilters = () => {
    setSearch('');
    setSelectedSpecialty('all');
    setFacilityType('all');
    setMaxFee(1000);
    setOnlyAvailableToday(false);
    setLocationScope('all_eligible');
  };

  // Clinics and doctors matching current query/filters for interactive map
  const matchingClinics = useMemo(() => {
    if (filtered.length > 0) {
      const clinicIdSet = new Set(filtered.map(f => f.doctor.clinicId));
      return clinics.filter(c => clinicIdSet.has(c.id));
    }
    return clinics.filter(c => {
      if (facilityType !== 'all' && c.type !== facilityType) return false;
      if (selectedLocation && selectedLocation.id !== 'all') {
        return c.city?.toLowerCase() === selectedLocation.name.toLowerCase();
      }
      return true;
    });
  }, [filtered, clinics, facilityType, selectedLocation]);

  const matchingDoctors = useMemo(() => {
    return filtered.map(f => f.doctor);
  }, [filtered]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Back Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#0F5257] hover:text-[#D4A24C] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? 'वापस मुख्य पृष्ठ' : 'Back to Home'}</span>
        </button>

        <span className="text-xs text-gray-500 font-mono-num">
          {filtered.length} {lang === 'hi' ? 'डॉक्टर उपलब्ध' : 'Doctors Found'}
        </span>
      </div>

      {/* Title & Search bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-fraunces text-2xl sm:text-3xl font-bold text-[#0F5257]">
                {selectedSpecialty !== 'all' 
                  ? SPECIALTIES.find(s => s.id === selectedSpecialty)?.[lang === 'hi' ? 'nameHindi' : 'name'] || 'Doctor Directory'
                  : (selectedLocation.id === 'all' 
                      ? (lang === 'hi' ? 'अखिल भारतीय डॉक्टर डायरेक्टरी' : 'Pan-India Doctors Directory')
                      : (lang === 'hi' ? `${selectedLocation.nameHindi} के सत्यापित डॉक्टर` : `Verified Doctors in ${selectedLocation.name}`))}
              </h1>

              {onOpenLocationModal && (
                <button
                  type="button"
                  onClick={onOpenLocationModal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3 h-3 text-teal-700" />
                  <span>{lang === 'hi' ? selectedLocation.nameHindi : selectedLocation.name}</span>
                  <ChevronDown className="w-3 h-3 text-teal-600" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedLocation.id === 'all'
                ? (lang === 'hi' ? 'भारत के प्रमुख शहरों के सत्यापित अस्पताल व क्लिनिक' : 'Covering leading medical hubs across India')
                : (lang === 'hi' ? `${selectedLocation.stateHindi || selectedLocation.state} का आधिकारिक नेटवर्क` : `Certified medical network in ${selectedLocation.state}`)}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setFacilityType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                facilityType === 'all' 
                  ? 'bg-[#0F5257] text-white border-[#0F5257]' 
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              {t.allPartners}
            </button>
            <button
              onClick={() => setFacilityType('clinic')}
              className={`px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                facilityType === 'clinic' 
                  ? 'bg-[#0F5257] text-white border-[#0F5257]' 
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              {t.exploreClinics}
            </button>
            <button
              onClick={() => setFacilityType('hospital')}
              className={`px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                facilityType === 'hospital' 
                  ? 'bg-[#0F5257] text-white border-[#0F5257]' 
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              {t.exploreHospitals}
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'hi' ? 'डॉक्टर का नाम, क्लिनिक या विशेषज्ञता खोजें...' : 'Filter by doctor name, hospital or specialty...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-teal-700"
          />
        </div>

        {/* Horizontal Specialty Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SPECIALTIES.map(spec => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecialty(spec.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 border transition-all cursor-pointer ${
                selectedSpecialty === spec.id
                  ? 'bg-[#0F5257] text-white border-[#0F5257] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-teal-600'
              }`}
            >
              {lang === 'hi' ? spec.nameHindi : spec.name}
            </button>
          ))}
        </div>

        {/* Secondary Filter Toggles: Today Only & Max Fee */}
        <div className="flex items-center justify-between gap-4 flex-wrap bg-teal-50/50 p-3 rounded-xl border border-teal-100 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Today only toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyAvailableToday}
                onChange={(e) => setOnlyAvailableToday(e.target.checked)}
                className="w-4 h-4 text-teal-700 rounded border-gray-300 focus:ring-teal-600"
              />
              <span className="font-medium text-gray-700">
                {lang === 'hi' ? 'केवल आज उपलब्ध डॉक्टर' : 'Available Today Only'}
              </span>
            </label>

            {/* Fee slider / quick chip */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{lang === 'hi' ? 'अधिकतम फीस:' : 'Max Fee:'}</span>
              <span className="font-bold text-teal-900 font-mono-num">₹{maxFee}</span>
              <input
                type="range"
                min="200"
                max="1000"
                step="50"
                value={maxFee}
                onChange={(e) => setMaxFee(Number(e.target.value))}
                className="w-24 accent-[#0F5257]"
              />
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-gray-500 hover:text-teal-800 text-xs font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'रीसेट करें' : 'Reset'}</span>
          </button>
        </div>

        {/* Location & 50km Proximity Selector Bar */}
        {selectedLocation.id !== 'all' && (
          <div className="bg-gradient-to-r from-amber-50 to-teal-50/50 border border-amber-200/90 p-3 rounded-xl flex items-center justify-between gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="font-bold text-amber-950">
                {lang === 'hi' ? 'स्थान दायरा:' : 'Location Radius:'}
              </span>
              <span className="text-gray-600 hidden sm:inline">
                {lang === 'hi' 
                  ? `${selectedLocation.nameHindi} के स्थानीय डॉक्टर + 50 किमी दायरे के नजदीकी क्लिनिक सुझाव` 
                  : `${selectedLocation.name} local doctors + nearby 50 km suggestions`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setLocationScope('all_eligible')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                  locationScope === 'all_eligible'
                    ? 'bg-[#0F5257] text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-teal-600'
                }`}
              >
                {lang === 'hi' ? `सभी (${localCount + nearbyCount})` : `All (${localCount + nearbyCount})`}
              </button>
              <button
                type="button"
                onClick={() => setLocationScope('local_only')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                  locationScope === 'local_only'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                📍 {lang === 'hi' ? `${selectedLocation.nameHindi} स्थानीय (${localCount})` : `${selectedLocation.name} Local (${localCount})`}
              </button>
              {nearbyCount > 0 && (
                <button
                  type="button"
                  onClick={() => setLocationScope('nearby_50km')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                    locationScope === 'nearby_50km'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  🚗 {lang === 'hi' ? `50 किमी सुझाव (${nearbyCount})` : `Within 50 km (${nearbyCount})`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* View Switcher: List View vs Interactive Google Map View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="font-fraunces text-base font-bold text-[#0F5257]">
            {viewMode === 'map'
              ? (lang === 'hi' ? 'गूगल मैप पर क्लीनिक एवं डॉक्टर' : 'Interactive Google Map View')
              : (lang === 'hi' ? 'उपलब्ध डॉक्टर सूची' : 'Doctor Directory')}
          </span>
          <span className="text-xs text-gray-500 font-mono-num bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
            {filtered.length} {lang === 'hi' ? 'डॉक्टर' : 'Docs'} • {matchingClinics.length} {lang === 'hi' ? 'क्लिनिक/अस्पताल' : 'Centers'}
          </span>
        </div>

        {/* View Toggle Tabs */}
        <div className="inline-flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#0F5257] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'सूची (List)' : 'List View'}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'map'
                ? 'bg-amber-400 text-teal-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'गूगल मैप (Google Map)' : 'Google Map View'}</span>
            <span className="text-[9px] bg-[#0F5257] text-white px-1.5 py-0.2 rounded-full font-bold ml-0.5">
              Live
            </span>
          </button>
        </div>
      </div>

      {/* Conditionally Render Map View or List View */}
      {viewMode === 'map' ? (
        <DoctorListMap
          clinics={matchingClinics}
          doctors={matchingDoctors}
          selectedLocation={selectedLocation}
          lang={lang}
          onSelectDoctor={onSelectDoctor}
          onBookDoctor={onBookDoctor}
          onSelectClinic={onSelectClinic}
        />
      ) : (
        /* Doctors List Output */
        filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(({ doctor, distanceKm, isNearby }) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                clinic={clinics.find(c => c.id === doctor.clinicId)}
                lang={lang}
                onSelectDoctor={onSelectDoctor}
                onBookDirect={onBookDoctor}
                distanceKm={distanceKm}
                isSuggestion={isNearby}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 space-y-3 p-6">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-fraunces text-lg font-bold text-gray-800">
              {lang === 'hi' ? 'कोई डॉक्टर नहीं मिला' : 'No Doctors Match This Filter'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {lang === 'hi' 
                ? 'कृपया फ़िल्टर रीसेट करें या किसी अन्य विशेषता में खोजें।' 
                : 'Try clearing your search query or adjusting the specialty and fee filters.'}
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-[#0F5257] text-white text-xs font-semibold hover:bg-teal-900 transition-colors"
            >
              {lang === 'hi' ? 'सभी डॉक्टर देखें' : 'View All Doctors'}
            </button>
          </div>
        )
      )}
    </div>
  );
};

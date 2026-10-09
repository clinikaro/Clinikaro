import React, { useState } from 'react';
import { 
  Search, 
  Building2, 
  Stethoscope, 
  MapPin, 
  Star, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  Eye, 
  Ear, 
  Sparkles, 
  Activity, 
  Smile, 
  Heart, 
  Bone, 
  Baby,
  PhoneCall,
  Sparkle,
  Ticket,
  Globe,
  ChevronDown
} from 'lucide-react';
import { Clinic, Doctor, Language } from '../../types';
import { LocationItem, POPULAR_CITIES, ALL_INDIA_LOCATION, isExactLocationMatch, isNearbyWithin50Km } from '../../data/indiaLocations';
import { SPECIALTIES } from '../../data/seedData';
import { translations } from '../../data/translations';
import { DoctorCard } from './DoctorCard';
import { BrandLogo } from '../common/BrandLogo';
import { FamousCitiesSection } from './FamousCitiesSection';
import { GoogleMapLinkButton } from '../common/GoogleMapLinkButton';

interface PatientHomeProps {
  lang: Language;
  selectedLocation: LocationItem;
  onOpenLocationModal: () => void;
  onOpenLanguageModal: () => void;
  onSelectLocation: (loc: LocationItem) => void;
  clinics: Clinic[];
  doctors: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
  onBookDoctor: (doctor: Doctor) => void;
  onSelectClinic: (clinic: Clinic) => void;
  onViewAllDoctors: (specialtyId?: string, facilityType?: 'clinic' | 'hospital') => void;
  onOpenGeminiChat?: (prefillQuery?: string) => void;
  onOpenMyAppointments?: () => void;
}

export const PatientHome: React.FC<PatientHomeProps> = ({
  lang,
  selectedLocation,
  onOpenLocationModal,
  onOpenLanguageModal,
  onSelectLocation,
  clinics,
  doctors,
  onSelectDoctor,
  onBookDoctor,
  onSelectClinic,
  onViewAllDoctors,
  onOpenGeminiChat,
  onOpenMyAppointments
}) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  // Doctor search & specialty matching helpers
  const matchesDoctorSearch = (doc: Doctor) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(q) ||
      Boolean(doc.nameHindi?.toLowerCase().includes(q)) ||
      doc.specialty.toLowerCase().includes(q) ||
      Boolean(doc.specialtyHindi?.toLowerCase().includes(q)) ||
      doc.clinicName.toLowerCase().includes(q) ||
      doc.about.toLowerCase().includes(q) ||
      Boolean(doc.city && doc.city.toLowerCase().includes(q)) ||
      Boolean(doc.pincode && doc.pincode.includes(searchQuery.trim())) ||
      Boolean(doc.address && doc.address.toLowerCase().includes(q)) ||
      Boolean(doc.landmark && doc.landmark.toLowerCase().includes(q))
    );
  };

  const matchesDoctorSpecialty = (doc: Doctor) => {
    return (
      selectedSpecialty === 'all' ||
      doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
    );
  };

  // 1. Primary local doctors: strictly located in the chosen location (e.g. Dehri)
  const primaryDoctors = doctors.filter(doc => {
    if (!matchesDoctorSearch(doc) || !matchesDoctorSpecialty(doc)) return false;
    return isExactLocationMatch(selectedLocation, doc);
  });

  // 2. Nearby suggested doctors within 50 km:
  // Shows clinics/doctors in neighboring towns like Sasaram (~16km), Aurangabad (~25km)
  // Strictly excludes far-away locations (>50km such as Patna, Delhi, Varanasi)
  const nearby50KmDoctors = selectedLocation.id === 'all'
    ? []
    : doctors
        .filter(doc => matchesDoctorSearch(doc) && matchesDoctorSpecialty(doc))
        .map(doc => {
          const { isNearby, distanceKm } = isNearbyWithin50Km(selectedLocation, doc);
          return isNearby ? { doctor: doc, distanceKm } : null;
        })
        .filter((item): item is { doctor: Doctor; distanceKm: number } => item !== null)
        .sort((a, b) => a.distanceKm - b.distanceKm);

  // 3. Primary local clinics: strictly in chosen location
  const primaryClinics = clinics.filter(c => isExactLocationMatch(selectedLocation, c));

  // 4. Nearby suggested clinics within 50 km
  const nearby50KmClinics = selectedLocation.id === 'all'
    ? []
    : clinics
        .map(c => {
          const { isNearby, distanceKm } = isNearbyWithin50Km(selectedLocation, c);
          return isNearby ? { clinic: c, distanceKm } : null;
        })
        .filter((item): item is { clinic: Clinic; distanceKm: number } => item !== null)
        .sort((a, b) => a.distanceKm - b.distanceKm);

  // Featured doctors to display first
  const featuredDoctors = primaryDoctors.slice(0, 6);
  const hasExactCityMatches = primaryDoctors.length > 0;

  // Icon mapper for specialty items
  const renderSpecialtyIcon = (iconName: string) => {
    switch (iconName) {
      case 'eye': return <Eye className="w-5 h-5 text-teal-700" />;
      case 'ear': return <Ear className="w-5 h-5 text-teal-700" />;
      case 'sparkles': return <Sparkles className="w-5 h-5 text-teal-700" />;
      case 'activity': return <Activity className="w-5 h-5 text-teal-700" />;
      case 'smile': return <Smile className="w-5 h-5 text-teal-700" />;
      case 'heart': return <Heart className="w-5 h-5 text-teal-700" />;
      case 'bone': return <Bone className="w-5 h-5 text-teal-700" />;
      case 'baby': return <Baby className="w-5 h-5 text-teal-700" />;
      default: return <Stethoscope className="w-5 h-5 text-teal-700" />;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0F5257] to-[#0A3A3D] text-white pt-6 sm:pt-8 pb-12 px-4 sm:px-6 relative overflow-hidden rounded-b-3xl shadow-lg">
        {/* Subtle decorative background watermarks */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/4 -bottom-20 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          {/* Mobile-only Top Brand Header (Shown on mobile where top nav is hidden) */}
          <div className="md:hidden flex items-center justify-between pb-3 mb-2 border-b border-teal-800/60 text-left">
            <BrandLogo size="sm" variant="full" theme="dark" showTagline={false} />

            <a 
              href="tel:+919431288410" 
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-teal-950/70 border border-teal-500/40 text-amber-300 hover:text-white transition-colors"
              title="Emergency Helpline: +91 94312 88410"
            >
              <PhoneCall className="w-3 h-3 text-[#D4A24C]" />
              <span className="font-mono-num font-semibold">112 / Help</span>
            </a>
          </div>

          <div className="inline-flex items-center gap-2 bg-[#D4A24C]/20 border border-[#D4A24C]/40 text-amber-300 px-3.5 py-1 rounded-full text-xs font-semibold">
            <Sparkle className="w-3.5 h-3.5 fill-current" />
            <span>
              {selectedLocation.id === 'all'
                ? (lang === 'hi' ? '🇮🇳 सम्पूर्ण भारत का डिजिटल स्वास्थ्य एवं क्लिनिक नेटवर्क' : '🇮🇳 Pan-India Digital Healthcare & Doctor Network')
                : (lang === 'hi' ? `📍 ${selectedLocation.nameHindi} (${selectedLocation.stateHindi}) का सत्यापित नेटवर्क` : `📍 Verified Clinics & Doctors in ${selectedLocation.name}`)}
            </span>
          </div>

          <h1 className="font-fraunces text-2xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-balance">
            {t.heroTitle}
          </h1>

          <p className="text-sm sm:text-base text-teal-100/90 font-work max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Search Bar with Symptoms */}
          <div className="pt-2 max-w-2xl mx-auto">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                onViewAllDoctors(selectedSpecialty !== 'all' ? selectedSpecialty : undefined);
              }}
              className="bg-white p-2 rounded-2xl shadow-xl flex items-center gap-2 border-2 border-[#D4A24C]/60 focus-within:border-[#D4A24C] transition-all"
            >
              <Search className="w-5 h-5 text-teal-800 ml-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full text-sm text-[#14282B] placeholder:text-gray-400 bg-transparent focus:outline-none py-1.5 px-1 font-work"
                id="main-doctor-search-input"
              />
              <button
                type="submit"
                id="main-doctor-search-submit"
                className="bg-[#0F5257] hover:bg-[#0A3A3D] text-white px-4 sm:px-6 py-2.5 rounded-xl font-medium text-xs sm:text-sm shrink-0 transition-colors shadow-sm cursor-pointer"
              >
                {t.searchBtn}
              </button>
            </form>

            {/* Quick symptom pill chips */}
            <div className="flex items-center gap-1.5 justify-center flex-wrap mt-3 text-xs text-teal-200">
              <span className="text-teal-300/80">{lang === 'hi' ? 'सुझाव:' : 'Popular:'}</span>
              {['Eye (आंख)', 'Heart (हार्ट)', 'Fever (बुखार)', 'Pregnancy (प्रसूति)', 'Bone (हड्डी)', 'Dental (दांत)'].map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSearchQuery(tag.split(' ')[0])}
                  className="bg-teal-900/40 hover:bg-teal-800/70 text-teal-100 text-[11px] px-2.5 py-0.5 rounded-full border border-teal-700/40 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Quick See My Appointments Option for Patient */}
            {onOpenMyAppointments && (
              <div className="pt-4 flex justify-center">
                <button
                  type="button"
                  onClick={onOpenMyAppointments}
                  className="inline-flex items-center gap-2 bg-[#0A3A3D]/90 hover:bg-[#0A3A3D] text-amber-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold border border-amber-400/40 hover:border-amber-400 transition-all shadow-sm cursor-pointer group"
                  id="hero-see-my-appointments-btn"
                >
                  <Ticket className="w-4 h-4 text-[#D4A24C] group-hover:scale-110 transition-transform" />
                  <span>{lang === 'hi' ? 'अपनी बुक की हुई डिजिटल पर्ची (Token) देखें' : 'View Your Booked Digital OPD Slips'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Location mismatch notice if user searched in city with 0 local doctors */}
      {selectedLocation.id !== 'all' && !hasExactCityMatches && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <p>
                {lang === 'hi'
                  ? `वर्तमान में ${selectedLocation.nameHindi} के स्थानीय डॉक्टर जोड़े जा रहे हैं। नीचे सम्पूर्ण भारत के शीर्ष सत्यापित डॉक्टर दिखाए जा रहे हैं:`
                  : `Currently expanding doctors in ${selectedLocation.name}. Showing top verified doctors across India below:`}
              </p>
            </div>
            <button
              onClick={() => onSelectLocation(ALL_INDIA_LOCATION)}
              className="px-3 py-1.5 bg-amber-400 text-teal-950 rounded-lg font-bold hover:bg-amber-300 transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              {lang === 'hi' ? 'सम्पूर्ण भारत देखें' : 'View All India'}
            </button>
          </div>
        </section>
      )}

      {/* Famous Indian Cities Section (Monument, Culture, Famous Food & Healthcare) */}
      <FamousCitiesSection
        lang={lang}
        selectedLocation={selectedLocation}
        onSelectLocation={onSelectLocation}
        onOpenLocationModal={onOpenLocationModal}
      />

      {/* Two Large Tappable Cards: Clinics vs Hospitals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Clinics Card */}
          <div 
            onClick={() => onViewAllDoctors(undefined, 'clinic')}
            className="bg-gradient-to-br from-white to-teal-50/50 p-5 rounded-2xl border-2 border-teal-800/20 hover:border-teal-700 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
            id="explore-clinics-card"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-900 text-[11px] font-bold px-2 py-0.5 rounded">
                  {selectedLocation.id === 'all' ? 'PAN-INDIA PARTNERS' : `${selectedLocation.name.toUpperCase()} PARTNERS`}
                </span>
                <h2 className="font-fraunces text-xl font-bold text-[#0F5257] group-hover:text-teal-900 transition-colors">
                  {lang === 'hi' ? 'प्राइवेट क्लिनिक (Clinics)' : 'Private Clinics (क्लिनिक)'}
                </h2>
                <p className="text-xs text-gray-600 font-work leading-relaxed">
                  {lang === 'hi' 
                    ? 'सेवा क्लिनिक, अपोलो स्पेक्ट्रा, काशी मेडिकेयर सहित शीर्ष स्पेशलिस्ट क्लिनिक।'
                    : 'Specialist consultation clinics like Seva Clinic, Apollo Spectra & Kashi Medicare.'}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:bg-[#0F5257] transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-teal-800 group-hover:text-teal-950">
              <span>{lang === 'hi' ? 'क्लिनिक डॉक्टर देखें' : 'Browse Clinic Doctors'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Hospitals Card */}
          <div 
            onClick={() => onViewAllDoctors(undefined, 'hospital')}
            className="bg-gradient-to-br from-white to-amber-50/40 p-5 rounded-2xl border-2 border-amber-600/30 hover:border-amber-500 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
            id="explore-hospitals-card"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded">
                  24x7 EMERGENCY & OPD
                </span>
                <h2 className="font-fraunces text-xl font-bold text-[#14282B] group-hover:text-amber-900 transition-colors">
                  {lang === 'hi' ? 'प्रमुख अस्पताल (Hospitals)' : 'Major Hospitals (अस्पताल)'}
                </h2>
                <p className="text-xs text-gray-600 font-work leading-relaxed">
                  {lang === 'hi' 
                    ? 'अखिल भारतीय स्तर पर 24 घंटे आपातकालीन सेवा व मल्टी-स्पेशियलिटी अस्पताल।'
                    : '24-hour emergency & multi-speciality hospital networks across India.'}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-[#D4A24C] text-[#14282B] flex items-center justify-center shrink-0 shadow-sm group-hover:bg-[#b28333] transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-amber-800 group-hover:text-amber-950">
              <span>{lang === 'hi' ? 'अस्पताल डॉक्टर देखें' : 'Browse Hospital Doctors'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Horizontal Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-fraunces text-lg sm:text-2xl font-bold text-[#0F5257]">
              {t.browseSpecialties}
            </h2>
            {selectedSpecialty !== 'all' && (
              <button 
                onClick={() => setSelectedSpecialty('all')}
                className="text-xs text-teal-700 hover:underline font-medium cursor-pointer"
              >
                ({lang === 'hi' ? 'रीसेट' : 'Clear'})
              </button>
            )}
          </div>
          <button 
            onClick={() => onViewAllDoctors(selectedSpecialty !== 'all' ? selectedSpecialty : undefined)}
            className="text-xs sm:text-sm font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1 group cursor-pointer"
          >
            <span>{lang === 'hi' ? 'सभी देखें' : 'View All'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Scrollable container */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {SPECIALTIES.map((spec) => {
            const isSelected = selectedSpecialty === spec.id;
            return (
              <button
                key={spec.id}
                onClick={() => setSelectedSpecialty(spec.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl min-w-[105px] sm:min-w-[120px] shrink-0 border transition-all text-center snap-start cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F5257] text-white border-[#0F5257] shadow-md scale-102'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-teal-700 hover:bg-teal-50/40'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-800'
                }`}>
                  {renderSpecialtyIcon(spec.icon)}
                </div>
                <span className="text-xs font-semibold line-clamp-1">
                  {lang === 'hi' ? spec.nameHindi : spec.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Verified Doctors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6" id="browse-doctors-section">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-fraunces text-lg sm:text-2xl font-bold text-[#0F5257]">
                {selectedLocation.id === 'all'
                  ? t.popularDoctors
                  : (lang === 'hi' ? `${selectedLocation.nameHindi} के प्रमुख डॉक्टर` : `Featured Doctors in ${selectedLocation.name}`)}
              </h2>
              <span className="bg-emerald-100 text-emerald-900 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                {featuredDoctors.length} {lang === 'hi' ? 'स्थानीय उपलब्ध' : 'Local Available'}
              </span>
              {selectedLocation.id !== 'all' && nearby50KmDoctors.length > 0 && (
                <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  +{nearby50KmDoctors.length} {lang === 'hi' ? '50km सुझाव' : '50km suggestions'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-work mt-0.5">
              {selectedLocation.id === 'all'
                ? (lang === 'hi' ? 'सम्पूर्ण भारत के शीर्ष सत्यापित डॉक्टर।' : 'Top verified doctors across all partner cities.')
                : (lang === 'hi' 
                    ? `सीधे ${selectedLocation.nameHindi} के स्थानीय डॉक्टर। (50 किमी दायरे के नजदीकी डॉक्टर नीचे सुझाव में देखें)` 
                    : `Doctors practicing directly in ${selectedLocation.name}. Nearby doctors within 50 km shown below as suggestions.`)}
            </p>
          </div>

          <button 
            onClick={() => onViewAllDoctors(selectedSpecialty !== 'all' ? selectedSpecialty : undefined)}
            className="text-xs sm:text-sm font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1 group cursor-pointer"
          >
            <span className="hidden sm:inline">{t.viewAllDoctors}</span>
            <span className="sm:hidden">{lang === 'hi' ? 'सभी' : 'All'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Doctor Grid */}
        {featuredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {featuredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                clinic={clinics.find(c => c.id === doctor.clinicId)}
                lang={lang}
                onSelect={onSelectDoctor}
                onBook={onBookDoctor}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center space-y-2">
            <p className="text-sm font-semibold text-gray-700">
              {lang === 'hi' 
                ? `${selectedLocation.nameHindi} में इस विशेषता के स्थानीय डॉक्टर उपलब्ध नहीं हैं।` 
                : `No local doctors found for this specialty in ${selectedLocation.name}.`}
            </p>
            {nearby50KmDoctors.length > 0 && (
              <p className="text-xs text-amber-800">
                {lang === 'hi' 
                  ? 'नीचे 50 किमी के दायरे में नजदीकी शहरों के डॉक्टर उपलब्ध हैं:' 
                  : 'Nearby doctors are available within 50 km below:'}
              </p>
            )}
          </div>
        )}
      </section>

      {/* 50 km Radius Doctor Suggestions Section */}
      {selectedLocation.id !== 'all' && nearby50KmDoctors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-amber-50/70 via-white to-teal-50/40 p-5 sm:p-6 rounded-3xl border border-amber-300/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-[#D4A24C] text-[#14282B] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                    {lang === 'hi' ? '50 किमी सुझाव' : '50 km Radius Suggestion'}
                  </span>
                  <h3 className="font-fraunces text-base sm:text-lg font-bold text-[#0F5257]">
                    {lang === 'hi' 
                      ? `${selectedLocation.nameHindi} के नजदीकी डॉक्टर (50 किमी के दायरे में)` 
                      : `Nearby Specialist Doctors within 50 km of ${selectedLocation.name}`}
                  </h3>
                </div>
                <p className="text-xs text-amber-950/80">
                  {lang === 'hi' 
                    ? `यदि स्थानीय स्लॉट व्यस्त हों, तो 50 किमी के सुगम दायरे में स्थित नजदीकी डॉक्टर (जैसे सासाराम, औरंगाबाद):` 
                    : `Specialists located in neighboring cities within 50 km driving radius (e.g., Sasaram, Aurangabad):`}
                </p>
              </div>

              <button
                onClick={() => onViewAllDoctors(selectedSpecialty !== 'all' ? selectedSpecialty : undefined)}
                className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 shrink-0"
              >
                <span>{lang === 'hi' ? 'सुझाव सूची देखें' : 'View All Suggestions'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearby50KmDoctors.map(({ doctor, distanceKm }) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  clinic={clinics.find(c => c.id === doctor.clinicId)}
                  lang={lang}
                  onSelect={onSelectDoctor}
                  onBook={onBookDoctor}
                  distanceKm={distanceKm}
                  isSuggestion={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Local Clinics Horizontal List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-fraunces text-lg sm:text-2xl font-bold text-[#0F5257]">
                {selectedLocation.id === 'all'
                  ? (lang === 'hi' ? 'अखिल भारतीय क्लिनिक एवं अस्पताल नेटवर्क' : 'Pan-India Clinics & Hospitals')
                  : (lang === 'hi' ? `${selectedLocation.nameHindi} के सत्यापित क्लिनिक एवं अस्पताल` : `Verified Clinics & Hospitals in ${selectedLocation.name}`)}
              </h2>
              <span className="bg-emerald-100 text-emerald-900 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                {primaryClinics.length} {lang === 'hi' ? 'स्थानीय केंद्र' : 'Local Centers'}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-work mt-0.5">
              {selectedLocation.id === 'all'
                ? (lang === 'hi' ? 'डिजिटल पर्ची और त्वरित सत्यापन के लिए केंद्र।' : 'Partner centers equipped with CliniKaro digital OPD.')
                : (lang === 'hi' 
                    ? `केवल ${selectedLocation.nameHindi} में स्थित अस्पताल और क्लिनिक। किसी अन्य शहर के केंद्र यहां नहीं दिखेंगे।` 
                    : `Medical centers strictly located in ${selectedLocation.name}.`)}
            </p>
          </div>
          <button 
            onClick={() => onViewAllDoctors(undefined, 'clinic')}
            className="text-xs sm:text-sm font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1 group cursor-pointer"
          >
            <span>{lang === 'hi' ? 'सभी देखें' : 'View All'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(primaryClinics.length > 0 ? primaryClinics : clinics.slice(0, 4)).map((clinic) => (
            <div 
              key={clinic.id}
              onClick={() => onSelectClinic(clinic)}
              className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-teal-700 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="h-32 rounded-xl overflow-hidden relative">
                  <img 
                    src={clinic.bannerUrl} 
                    alt={clinic.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                    clinic.type === 'hospital' ? 'bg-[#D4A24C] text-black font-semibold' : 'bg-[#0F5257]'
                  }`}>
                    {clinic.type === 'hospital' ? 'HOSPITAL' : 'CLINIC'}
                  </span>
                  {clinic.city && (
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-amber-300 backdrop-blur-xs">
                      📍 {clinic.city}
                    </span>
                  )}
                  {clinic.pincode && (
                    <span className="absolute bottom-2 right-2 text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-black/70 text-teal-200 backdrop-blur-xs">
                      {clinic.pincode}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#14282B] group-hover:text-teal-800 transition-colors line-clamp-1">
                    {lang === 'hi' ? clinic.nameHindi : clinic.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 line-clamp-1">
                    {lang === 'hi' ? clinic.categoryHindi : clinic.category}
                  </p>
                  {clinic.address && (
                    <div className="flex items-center justify-between gap-1 mt-1">
                      <p className="text-[10px] text-gray-500 truncate flex items-center gap-1 min-w-0" title={clinic.address}>
                        <MapPin className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                        <span className="truncate">{lang === 'hi' && clinic.addressHindi ? clinic.addressHindi : clinic.address}</span>
                      </p>
                      <GoogleMapLinkButton
                        target={{
                          clinicName: clinic.name,
                          name: clinic.name,
                          address: clinic.address,
                          city: clinic.city,
                          landmark: clinic.landmark,
                          pincode: clinic.pincode,
                          lat: clinic.lat,
                          lng: clinic.lng
                        }}
                        lang={lang}
                        variant="badge"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{clinic.rating}</span>
                </div>
                <span className="text-teal-800 font-semibold group-hover:underline">
                  {clinic.doctorsCount} {lang === 'hi' ? 'डॉक्टर' : 'Doctors'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 50 km Radius Nearby Clinic Suggestions Section */}
      {selectedLocation.id !== 'all' && nearby50KmClinics.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-teal-500/10 p-5 sm:p-6 rounded-3xl border border-amber-300/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-amber-400 text-teal-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                    {lang === 'hi' ? '50 किमी सुझाव' : '50 km Radius Suggestion'}
                  </span>
                  <h3 className="font-fraunces text-base sm:text-lg font-bold text-teal-950">
                    {lang === 'hi' 
                      ? `${selectedLocation.nameHindi} के नजदीकी अस्पताल व क्लिनिक (50 किमी दायरे में सुझाव)` 
                      : `Nearby Hospitals & Clinics within 50 km of ${selectedLocation.name}`}
                  </h3>
                </div>
                <p className="text-xs text-amber-900/90">
                  {lang === 'hi'
                    ? 'ये उच्च-स्तरीय अस्पताल 50 किमी के भीतर स्थित हैं। आपातकालीन, ट्रॉमा केयर या विशिष्ट भर्ती के लिए सुगम दूरी पर हैं:'
                    : 'Reputed partner hospitals situated within 50 km driving radius for trauma, emergency, or specialty care:'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearby50KmClinics.map(({ clinic, distanceKm }) => (
                <div 
                  key={clinic.id}
                  onClick={() => onSelectClinic(clinic)}
                  className="bg-white p-4 rounded-2xl border-2 border-amber-300 hover:border-teal-700 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="h-32 rounded-xl overflow-hidden relative">
                      <img 
                        src={clinic.bannerUrl} 
                        alt={clinic.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                        clinic.type === 'hospital' ? 'bg-[#D4A24C] text-black font-semibold' : 'bg-[#0F5257]'
                      }`}>
                        {clinic.type === 'hospital' ? 'HOSPITAL' : 'CLINIC'}
                      </span>
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400 text-teal-950 shadow-xs flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        {distanceKm} km {lang === 'hi' ? 'दूर' : 'away'}
                      </span>
                      {clinic.city && (
                        <span className="absolute bottom-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-amber-300 backdrop-blur-xs">
                          📍 {clinic.city}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-[#14282B] group-hover:text-teal-800 transition-colors line-clamp-1">
                        {lang === 'hi' ? clinic.nameHindi : clinic.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 line-clamp-1">
                        {lang === 'hi' ? clinic.categoryHindi : clinic.category}
                      </p>
                      <p className="text-[11px] text-amber-800 font-semibold mt-1 flex items-center gap-1.5">
                        <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded text-[10px]">
                          🚗 ~{Math.round(distanceKm * 1.6)} {lang === 'hi' ? 'मिनट दूरी' : 'mins drive'}
                        </span>
                        <span>•</span>
                        <span>{clinic.city}</span>
                      </p>
                      {clinic.address && (
                        <div 
                          className="flex items-center justify-between gap-1 mt-1.5 pt-1.5 border-t border-dashed border-amber-200/80"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="text-[10px] text-gray-600 truncate flex items-center gap-1 min-w-0" title={clinic.address}>
                            <MapPin className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                            <span className="truncate">{lang === 'hi' && clinic.addressHindi ? clinic.addressHindi : clinic.address}</span>
                          </p>
                          <GoogleMapLinkButton
                            target={{
                              clinicName: clinic.name,
                              name: clinic.name,
                              address: clinic.address,
                              city: clinic.city,
                              landmark: clinic.landmark,
                              pincode: clinic.pincode,
                              lat: clinic.lat,
                              lng: clinic.lng
                            }}
                            lang={lang}
                            variant="badge"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{clinic.rating}</span>
                    </div>
                    <span className="text-teal-800 font-semibold group-hover:underline">
                      {clinic.doctorsCount} {lang === 'hi' ? 'डॉक्टर उपलब्ध' : 'Doctors'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

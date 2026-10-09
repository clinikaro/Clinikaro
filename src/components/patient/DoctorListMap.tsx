import React, { useState, useEffect, useMemo } from 'react';
import { 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useAdvancedMarkerRef,
  useMap 
} from '@vis.gl/react-google-maps';
import { 
  Building2, 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Phone, 
  Star, 
  Calendar, 
  Stethoscope, 
  Maximize2,
  ChevronRight,
  Sparkles,
  Layers,
  Crosshair
} from 'lucide-react';
import { Clinic, Doctor, Language } from '../../types';
import { LocationItem } from '../../data/indiaLocations';
import { 
  GOOGLE_MAPS_API_KEY, 
  GOOGLE_MAPS_MAP_ID, 
  GMP_ATTRIBUTION_IDS 
} from '../../utils/googleMapsConfig';
import { getGoogleMapsDirectionsUrl, getGoogleMapsUrl } from '../../utils/mapUtils';

interface DoctorListMapProps {
  clinics: Clinic[];
  doctors: Doctor[];
  selectedLocation?: LocationItem;
  lang: Language;
  onSelectDoctor: (doctor: Doctor) => void;
  onBookDoctor: (doctor: Doctor) => void;
  onSelectClinic?: (clinic: Clinic) => void;
}

// Controller to handle smooth pan and zoom
const MapCameraController: React.FC<{ 
  target: { lat: number; lng: number } | null;
  boundsList: { lat: number; lng: number }[];
}> = ({ target, boundsList }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (target) {
      map.panTo(target);
      map.setZoom(16);
      return;
    }

    if (boundsList.length > 0 && typeof google !== 'undefined' && google.maps) {
      if (boundsList.length === 1) {
        map.panTo(boundsList[0]);
        map.setZoom(15);
      } else {
        const bounds = new google.maps.LatLngBounds();
        boundsList.forEach(pos => bounds.extend(pos));
        map.fitBounds(bounds, 60);
        const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
          if (map.getZoom() && map.getZoom()! > 16) {
            map.setZoom(16);
          }
        });
        return () => {
          google.maps.event.removeListener(listener);
        };
      }
    }
  }, [map, target, boundsList]);

  return null;
};

// Sub-component for individual marker with anchor reference for InfoWindow
const ClinicMarkerItem: React.FC<{
  clinic: Clinic;
  doctorsAtClinic: Doctor[];
  isSelected: boolean;
  onMarkerClick: () => void;
  onCloseInfo: () => void;
  lang: Language;
  onSelectDoctor: (doctor: Doctor) => void;
  onBookDoctor: (doctor: Doctor) => void;
}> = ({
  clinic,
  doctorsAtClinic,
  isSelected,
  onMarkerClick,
  onCloseInfo,
  lang,
  onSelectDoctor,
  onBookDoctor
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  const lat = clinic.lat || 24.9087;
  const lng = clinic.lng || 84.1852;
  const position = { lat, lng };

  const isHospital = clinic.type === 'hospital';
  const displayName = lang === 'hi' && clinic.nameHindi ? clinic.nameHindi : clinic.name;
  const displayAddress = lang === 'hi' && clinic.addressHindi ? clinic.addressHindi : clinic.address;

  const directionsUrl = getGoogleMapsDirectionsUrl({
    clinicName: clinic.name,
    name: clinic.name,
    address: clinic.address,
    city: clinic.city,
    landmark: clinic.landmark,
    pincode: clinic.pincode,
    lat,
    lng
  });

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        onClick={onMarkerClick}
        title={`${displayName} (${clinic.city})`}
      >
        <Pin
          background={isHospital ? '#D4A24C' : '#0F5257'}
          borderColor={isSelected ? '#10B981' : '#FFFFFF'}
          glyphColor="#FFFFFF"
          scale={isSelected ? 1.4 : 1.15}
        >
          <span className="text-xs font-bold leading-none select-none">
            {isHospital ? '🏥' : '🩺'}
          </span>
        </Pin>
      </AdvancedMarker>

      {isSelected && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={320}
          onCloseClick={onCloseInfo}
        >
          <div className="p-1 space-y-2 text-stone-800 font-sans max-h-80 overflow-y-auto">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-wider text-teal-800">
                <span className={`px-1.5 py-0.2 rounded ${isHospital ? 'bg-amber-100 text-amber-900' : 'bg-teal-50 text-teal-900'}`}>
                  {isHospital ? (lang === 'hi' ? 'अस्पताल' : 'Hospital') : (lang === 'hi' ? 'क्लिनिक' : 'Clinic')}
                </span>
                <span className="text-amber-600 font-bold flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-current" />
                  {clinic.rating} ({clinic.reviewsCount || 50}+)
                </span>
              </div>

              <h4 className="font-bold text-sm text-[#0F5257] leading-snug mt-1">
                {displayName}
              </h4>

              <p className="text-[11px] text-stone-600 leading-tight flex items-start gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                <span>{displayAddress} {clinic.landmark ? `(${clinic.landmark})` : ''}</span>
              </p>
            </div>

            {/* Doctors list at this clinic */}
            <div className="space-y-1.5 border-t border-stone-200 pt-1.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                {lang === 'hi' ? `उपलब्ध डॉक्टर (${doctorsAtClinic.length})` : `Doctors Available (${doctorsAtClinic.length})`}
              </span>

              {doctorsAtClinic.length === 0 ? (
                <p className="text-[11px] text-gray-500 italic">
                  {lang === 'hi' ? 'इस केंद्र पर सामान्य ओपीडी सेवा उपलब्ध है' : 'General OPD facility available'}
                </p>
              ) : (
                <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
                  {doctorsAtClinic.map(doc => (
                    <div 
                      key={doc.id}
                      className="p-1.5 rounded-lg bg-stone-50 border border-stone-200 hover:border-teal-700 flex items-center justify-between gap-2 text-xs transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#0F5257] text-[11px] truncate">{doc.name}</p>
                        <p className="text-[10px] text-teal-800 truncate">{doc.specialty} • ₹{doc.fee}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onSelectDoctor(doc)}
                          className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-medium"
                          title="View Profile"
                        >
                          {lang === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}
                        </button>
                        <button
                          onClick={() => onBookDoctor(doc)}
                          className="px-2 py-0.5 rounded bg-[#0F5257] hover:bg-[#0B3E42] text-white text-[10px] font-bold flex items-center gap-0.5"
                          title="Book Slot"
                        >
                          <Calendar className="w-2.5 h-2.5 text-amber-300" />
                          <span>{lang === 'hi' ? 'बुक' : 'Book'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Directions & Action footer */}
            <div className="pt-1.5 border-t border-stone-200 flex items-center justify-between gap-1 text-[11px]">
              {clinic.phone && (
                <a
                  href={`tel:${clinic.phone.replace(/[^0-9+]/g, '')}`}
                  className="inline-flex items-center gap-1 text-teal-800 font-semibold hover:underline"
                >
                  <Phone className="w-3 h-3 text-teal-600" />
                  <span className="font-mono text-[10px]">{clinic.phone}</span>
                </a>
              )}

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs ml-auto"
              >
                <Navigation className="w-2.5 h-2.5 fill-current" />
                <span>{lang === 'hi' ? 'गूगल मैप्स नेविगेशन' : 'Directions'}</span>
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const DoctorListMap: React.FC<DoctorListMapProps> = ({
  clinics,
  doctors,
  selectedLocation,
  lang,
  onSelectDoctor,
  onBookDoctor,
  onSelectClinic
}) => {
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [mapDisplayMode, setMapDisplayMode] = useState<'embed' | 'pins'>('embed');

  // Group doctors by clinic
  const clinicMapData = useMemo(() => {
    return clinics.map(clinic => {
      const doctorsAtClinic = doctors.filter(d => d.clinicId === clinic.id);
      return {
        clinic,
        doctorsAtClinic,
        lat: clinic.lat || 24.9087,
        lng: clinic.lng || 84.1852
      };
    });
  }, [clinics, doctors]);

  // Selected or active clinic for Google Maps Embed (Matches Image 2)
  const activeClinic = clinicMapData.find(c => c.clinic.id === selectedClinicId)?.clinic || clinicMapData[0]?.clinic;
  const activeEmbedQuery = activeClinic
    ? [
        lang === 'hi' && activeClinic.nameHindi ? activeClinic.nameHindi : activeClinic.name,
        lang === 'hi' && activeClinic.addressHindi ? activeClinic.addressHindi : activeClinic.address,
        activeClinic.landmark,
        activeClinic.city,
        activeClinic.state || 'Bihar'
      ].filter(Boolean).join(', ')
    : (selectedLocation && selectedLocation.id !== 'all' ? `${selectedLocation.name}, ${selectedLocation.state}` : 'Dehri-on-Sone, Bihar');

  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(activeEmbedQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // Determine initial center
  const defaultCenter = useMemo(() => {
    if (clinicMapData.length > 0) {
      return { lat: clinicMapData[0].lat, lng: clinicMapData[0].lng };
    }
    if (selectedLocation && selectedLocation.lat && selectedLocation.lng) {
      return { lat: selectedLocation.lat, lng: selectedLocation.lng };
    }
    return { lat: 24.9087, lng: 84.1852 };
  }, [clinicMapData, selectedLocation]);

  const allBoundsPositions = useMemo(() => {
    return clinicMapData.map(c => ({ lat: c.lat, lng: c.lng }));
  }, [clinicMapData]);

  const handleSelectClinic = (clinic: Clinic) => {
    setSelectedClinicId(clinic.id);
    const lat = clinic.lat || 24.9087;
    const lng = clinic.lng || 84.1852;
    setFlyTarget({ lat, lng });
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-teal-900/15 overflow-hidden shadow-md flex flex-col lg:flex-row h-[720px] relative">
      {/* Side Clinic Directory Drawer (Left on Desktop, Bottom Sheet on Mobile) */}
      <div className="w-full lg:w-80 xl:w-96 bg-stone-50 border-b lg:border-b-0 lg:border-r border-stone-200 flex flex-col h-64 sm:h-72 lg:h-full z-10">
        <div className="p-3.5 bg-gradient-to-r from-[#0F5257] to-[#0A3A3D] text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-fraunces font-bold text-sm sm:text-base flex items-center gap-1.5">
              <span>{lang === 'hi' ? 'सत्यापित अस्पताल व क्लिनिक मैप' : 'Verified Clinics & Hospitals'}</span>
            </h3>
            <p className="text-[11px] text-teal-200">
              {clinicMapData.length} {lang === 'hi' ? 'चिकित्सा केंद्र पाए गए' : 'centers pinned on Google Map'}
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedClinicId(null);
              setFlyTarget(null);
            }}
            className="p-1.5 rounded-lg bg-stone-800/60 hover:bg-stone-800 text-stone-200 text-[10px] font-medium border border-white/10 flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset Map Bounds"
          >
            <Crosshair className="w-3 h-3 text-amber-300" />
            <span className="hidden sm:inline">{lang === 'hi' ? 'पूरा मैप' : 'Fit All'}</span>
          </button>
        </div>

        {/* Scrollable list of clinic cards */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          {clinicMapData.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-xs">
              <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p>{lang === 'hi' ? 'इस फिल्टर के तहत कोई क्लिनिक नहीं मिला' : 'No centers match current filter'}</p>
            </div>
          ) : (
            clinicMapData.map(({ clinic, doctorsAtClinic }) => {
              const isSelected = selectedClinicId === clinic.id;
              const isHospital = clinic.type === 'hospital';
              const nameText = lang === 'hi' && clinic.nameHindi ? clinic.nameHindi : clinic.name;
              const addrText = lang === 'hi' && clinic.addressHindi ? clinic.addressHindi : clinic.address;

              return (
                <div
                  key={clinic.id}
                  onClick={() => handleSelectClinic(clinic)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 border-teal-700 shadow-sm ring-2 ring-teal-700/20'
                      : 'bg-white hover:bg-stone-100/70 border-stone-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isHospital ? 'bg-amber-100 text-amber-900' : 'bg-teal-100 text-teal-900'
                        }`}>
                          {isHospital ? 'Hospital' : 'Clinic'}
                        </span>
                        <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-current" />
                          {clinic.rating}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-[#0F5257] truncate mt-1">
                        {nameText}
                      </h4>

                      <p className="text-[11px] text-gray-600 line-clamp-1 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">{addrText}</span>
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded block">
                        {doctorsAtClinic.length} {lang === 'hi' ? 'डॉक्टर' : 'Docs'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-dashed border-stone-200 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 font-mono text-[10px]">
                      📍 {clinic.city}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectClinic(clinic);
                      }}
                      className="text-teal-800 font-bold text-[10px] hover:underline flex items-center gap-0.5"
                    >
                      <span>{lang === 'hi' ? 'मैप पर देखें' : 'Focus Pin'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Interactive Google Map Viewport */}
      <div className="flex-1 relative h-[450px] sm:h-[480px] lg:h-full bg-stone-100 flex flex-col">
        {/* Top Floating Map Controls Switcher */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-stone-900/90 backdrop-blur-xs p-1 rounded-xl border border-white/10 shadow-md">
          <button
            type="button"
            onClick={() => setMapDisplayMode('embed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              mapDisplayMode === 'embed'
                ? 'bg-amber-400 text-teal-950 shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>{lang === 'hi' ? 'गूगल मैप दृश्य' : 'Google Maps'}</span>
          </button>
          <button
            type="button"
            onClick={() => setMapDisplayMode('pins')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              mapDisplayMode === 'pins'
                ? 'bg-[#0F5257] text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'सभी पिन' : 'Pins View'}</span>
          </button>
        </div>

        {mapDisplayMode === 'embed' ? (
          /* Official Google Maps Interactive Embed (Matches Image 2) */
          <div className="w-full h-full relative bg-stone-200">
            <iframe
              title={`Google Map - ${activeClinic ? activeClinic.name : 'Dehri'}`}
              src={embedUrl}
              className="w-full h-full border-0"
              style={{ minHeight: '450px', height: '100%' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : (
          /* Advanced Multi-Marker Interactive Map */
          <Map
            mapId={GOOGLE_MAPS_MAP_ID}
            defaultCenter={defaultCenter}
            defaultZoom={14}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapTypeControl={true}
            streetViewControl={true}
            fullscreenControl={true}
            zoomControl={true}
            internalUsageAttributionIds={GMP_ATTRIBUTION_IDS}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          >
            <MapCameraController target={flyTarget} boundsList={allBoundsPositions} />

            {clinicMapData.map(({ clinic, doctorsAtClinic }) => (
              <ClinicMarkerItem
                key={clinic.id}
                clinic={clinic}
                doctorsAtClinic={doctorsAtClinic}
                isSelected={selectedClinicId === clinic.id}
                onMarkerClick={() => handleSelectClinic(clinic)}
                onCloseInfo={() => setSelectedClinicId(null)}
                lang={lang}
                onSelectDoctor={onSelectDoctor}
                onBookDoctor={onBookDoctor}
              />
            ))}
          </Map>
        )}

        {/* Legend Overlay at Top Right */}
        {mapDisplayMode === 'pins' && (
          <div className="absolute top-3 right-3 z-10 pointer-events-auto">
            <div className="bg-stone-900/85 backdrop-blur-xs text-white px-2.5 py-1.5 rounded-xl shadow-md border border-white/10 text-[10px] space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F5257] border border-white" />
                <span>{lang === 'hi' ? 'क्लिनिक (Clinic)' : 'Clinic Pin'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4A24C] border border-white" />
                <span>{lang === 'hi' ? 'अस्पताल (Hospital)' : 'Hospital Pin'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

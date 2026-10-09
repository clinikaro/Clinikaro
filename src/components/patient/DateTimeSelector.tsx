import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Sun, 
  Moon, 
  Check, 
  CalendarDays, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Doctor, Language } from '../../types';

interface DateTimeSelectorProps {
  doctor: Doctor;
  selectedDate: string;
  selectedSlot: string;
  lang: Language;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: string) => void;
  compact?: boolean;
}

export const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  doctor,
  selectedDate,
  selectedSlot,
  lang,
  onSelectDate,
  onSelectSlot,
  compact = false
}) => {
  const [slotCategory, setSlotCategory] = useState<'all' | 'morning' | 'evening'>('all');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Generate 7 days starting today
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().split('T')[0], [today]);

  const next7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dateFormatted = d.toISOString().split('T')[0];
      
      const dayShortEn = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayShortHi = d.toLocaleDateString('hi-IN', { weekday: 'short' });
      const dayName = lang === 'hi' ? dayShortHi : dayShortEn;

      const dateNum = d.getDate();
      const monthShort = d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { month: 'short' });

      // Check if day is in doctor.daysAvailable
      const isAvailableDay = doctor.daysAvailable.some(
        avail => avail.toLowerCase().startsWith(dayShortEn.toLowerCase().substring(0, 3))
      );

      return {
        dateFormatted,
        dayName,
        dayShortEn,
        dateNum,
        monthShort,
        displayDate: `${dateNum} ${monthShort}`,
        isToday: i === 0,
        isTomorrow: i === 1,
        isAvailableDay
      };
    });
  }, [today, lang, doctor.daysAvailable]);

  // Combine doctor's slots or fallback with realistic OPD clinic slots
  const allAvailableSlots = useMemo(() => {
    const defaultMorning = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM'];
    const defaultEvening = ['04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'];

    let baseSlots = doctor.timeSlots && doctor.timeSlots.length > 0 ? [...doctor.timeSlots] : [];
    
    // Ensure we have both morning and evening representation
    if (baseSlots.length < 4) {
      baseSlots = Array.from(new Set([...baseSlots, ...defaultMorning, ...defaultEvening]));
    }

    return baseSlots;
  }, [doctor.timeSlots]);

  // Group slots into Morning and Evening
  const { morningSlots, eveningSlots } = useMemo(() => {
    const morning: string[] = [];
    const evening: string[] = [];

    allAvailableSlots.forEach(slot => {
      const isPM = slot.includes('PM');
      const hourPart = parseInt(slot.split(':')[0], 10);

      // 12 PM is afternoon/midday OPD, < 12 PM is morning
      if (!isPM || hourPart === 12) {
        morning.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morningSlots: morning, eveningSlots: evening };
  }, [allAvailableSlots]);

  // Filtered slots according to category
  const visibleSlots = useMemo(() => {
    if (slotCategory === 'morning') return morningSlots;
    if (slotCategory === 'evening') return eveningSlots;
    return allAvailableSlots;
  }, [slotCategory, morningSlots, eveningSlots, allAvailableSlots]);

  // Selected date info
  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return null;
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return {
        formatted: d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        isToday: selectedDate === todayStr
      };
    }
    return { formatted: selectedDate, isToday: false };
  }, [selectedDate, lang, todayStr]);

  return (
    <div className="space-y-4">
      {/* 1. Date Selection Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#0F5257] flex items-center gap-1.5 uppercase tracking-wide">
            <Calendar className="w-3.5 h-3.5 text-[#D4A24C]" />
            <span>{lang === 'hi' ? 'अपॉइंटमेंट की तारीख चुनें' : 'Select Appointment Date'}</span>
          </label>
          <button
            type="button"
            onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
            className="text-[11px] font-semibold text-[#0F5257] hover:text-[#D4A24C] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <CalendarDays className="w-3 h-3" />
            <span>
              {showCustomDatePicker 
                ? (lang === 'hi' ? 'त्वरित तारीखें' : 'Quick Dates') 
                : (lang === 'hi' ? 'अन्य तारीख चुनें' : 'Pick Other Date')}
            </span>
          </button>
        </div>

        {/* Custom Date Input when toggled */}
        {showCustomDatePicker && (
          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs">
            <span className="text-teal-900 font-medium">
              {lang === 'hi' ? 'कैलेंडर से दिन चुनें:' : 'Choose from calendar:'}
            </span>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  onSelectDate(e.target.value);
                }
              }}
              className="px-3 py-1.5 bg-white border border-teal-300 rounded-lg font-mono-num text-xs font-semibold text-teal-950 focus:outline-none focus:ring-2 focus:ring-[#0F5257] cursor-pointer"
            />
          </div>
        )}

        {/* 7-day horizontal date pills */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {next7Days.map((item) => {
            const isSelected = selectedDate === item.dateFormatted;
            return (
              <button
                key={item.dateFormatted}
                type="button"
                onClick={() => {
                  onSelectDate(item.dateFormatted);
                  setShowCustomDatePicker(false);
                }}
                className={`flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer select-none text-center ${
                  isSelected
                    ? 'bg-[#0F5257] text-white border-[#0F5257] shadow-sm ring-2 ring-[#D4A24C]/40 scale-102'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-teal-700 hover:bg-teal-50/40'
                }`}
              >
                {/* Badge for Today / Tomorrow */}
                <div className="h-4 flex items-center justify-center">
                  {item.isToday ? (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      isSelected ? 'bg-amber-400 text-teal-950' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {lang === 'hi' ? 'आज' : 'Today'}
                    </span>
                  ) : item.isTomorrow ? (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      isSelected ? 'bg-amber-300 text-teal-950' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {lang === 'hi' ? 'कल' : 'Tomorrow'}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-medium">
                      {item.dayName}
                    </span>
                  )}
                </div>

                <div className="text-base sm:text-lg font-bold font-mono-num leading-tight mt-0.5">
                  {item.dateNum}
                </div>

                <div className="text-[10px] opacity-80 leading-tight">
                  {item.monthShort}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Timing Slot Selection Section */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between flex-wrap gap-1.5">
          <label className="text-xs font-bold text-[#0F5257] flex items-center gap-1.5 uppercase tracking-wide">
            <Clock className="w-3.5 h-3.5 text-[#D4A24C]" />
            <span>{lang === 'hi' ? 'ओपीडी समय स्लॉट चुनें' : 'Select OPD Time Slot'}</span>
          </label>

          {/* Morning / Evening Filter Chips */}
          <div className="flex items-center gap-1 bg-gray-100/90 p-0.5 rounded-lg border border-gray-200 text-[11px]">
            <button
              type="button"
              onClick={() => setSlotCategory('all')}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                slotCategory === 'all'
                  ? 'bg-white text-[#0F5257] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {lang === 'hi' ? 'सभी' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setSlotCategory('morning')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                slotCategory === 'morning'
                  ? 'bg-white text-[#0F5257] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Sun className="w-3 h-3 text-amber-500" />
              <span>{lang === 'hi' ? 'सुबह' : 'Morning'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSlotCategory('evening')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                slotCategory === 'evening'
                  ? 'bg-white text-[#0F5257] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Moon className="w-3 h-3 text-indigo-500" />
              <span>{lang === 'hi' ? 'शाम' : 'Evening'}</span>
            </button>
          </div>
        </div>

        {/* Slot Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {visibleSlots.map((slot) => {
            const isSelected = selectedSlot === slot;
            const isEvening = slot.includes('PM') && !slot.startsWith('12');

            return (
              <button
                key={slot}
                type="button"
                onClick={() => onSelectSlot(slot)}
                className={`py-2 px-2.5 rounded-xl text-xs font-mono-num font-semibold border transition-all flex items-center justify-between gap-1.5 cursor-pointer select-none min-h-[42px] ${
                  isSelected
                    ? 'bg-[#D4A24C] text-[#14282B] border-[#B28333] shadow-xs font-bold scale-102 ring-2 ring-[#0F5257]/30'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-teal-700 hover:bg-teal-50/40'
                }`}
              >
                <div className="flex items-center gap-1">
                  {isEvening ? (
                    <Moon className={`w-3 h-3 ${isSelected ? 'text-[#14282B]' : 'text-indigo-500'}`} />
                  ) : (
                    <Sun className={`w-3 h-3 ${isSelected ? 'text-[#14282B]' : 'text-amber-500'}`} />
                  )}
                  <span>{slot}</span>
                </div>

                {isSelected ? (
                  <span className="w-4 h-4 rounded-full bg-[#14282B] text-[#D4A24C] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 font-normal">
                    {lang === 'hi' ? 'उपलब्ध' : 'Free'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Real-Time Active Selection Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-amber-50/50 border border-teal-900/15 rounded-xl p-2.5 flex items-center justify-between text-xs text-teal-950">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#0F5257] text-[#D4A24C] flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-gray-500 block leading-tight">
              {lang === 'hi' ? 'चुना गया समय व तारीख:' : 'Selected Appointment:'}
            </span>
            <p className="font-semibold truncate text-[#0F5257]">
              {selectedDateObj?.formatted || selectedDate}
            </p>
          </div>
        </div>
        <div className="bg-white px-2.5 py-1 rounded-lg border border-teal-200 text-right shrink-0">
          <span className="text-[10px] text-gray-500 block leading-tight">
            {lang === 'hi' ? 'स्लॉट' : 'Slot'}
          </span>
          <span className="font-mono-num font-bold text-[#0F5257]">
            {selectedSlot}
          </span>
        </div>
      </div>
    </div>
  );
};

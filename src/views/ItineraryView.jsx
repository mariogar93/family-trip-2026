import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, 
  Plus, 
  ExternalLink, 
  ArrowRight, 
  Plane, 
  Bed, 
  Utensils, 
  Footprints, 
  MapPin, 
  Trash2, 
  Pencil, 
  X,
  Sparkles,
  ChevronRight,
  Compass,
  AlignLeft,
  Home,
  Bookmark,
  Calendar,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import TransitCard from '../components/TransitCard';
import TransitModal from '../components/TransitModal';
import LodgingModal from '../components/LodgingModal';

// Helper to parse dates like 2026-11-22 safely without NaN
function parseDayDetails(dateStr, dayNum = 1) {
  const weekdaysShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const weekdaysFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthsFull = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  if (!dateStr || typeof dateStr !== 'string') {
    return {
      weekdayShort: 'Día',
      weekdayFull: `Día ${dayNum}`,
      dayNumber: dayNum,
      monthName: 'noviembre',
      fullFormatted: `Día ${dayNum}`,
      isToday: false,
    };
  }

  // Handle format YYYY-MM-DD
  let dateObj = null;
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-').map(Number);
    if (parts.length >= 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    return {
      weekdayShort: 'Día',
      weekdayFull: `Día ${dayNum}`,
      dayNumber: dayNum,
      monthName: 'noviembre',
      fullFormatted: `Día ${dayNum} • ${dateStr}`,
      isToday: false,
    };
  }

  const now = new Date();
  const isToday = (
    now.getDate() === dateObj.getDate() &&
    now.getMonth() === dateObj.getMonth() &&
    now.getFullYear() === dateObj.getFullYear()
  );

  const dayOfWeek = dateObj.getDay();
  const monthIdx = dateObj.getMonth();

  return {
    weekdayShort: weekdaysShort[dayOfWeek] || 'Día',
    weekdayFull: weekdaysFull[dayOfWeek] || `Día ${dayNum}`,
    dayNumber: dateObj.getDate() || dayNum,
    monthName: monthsFull[monthIdx] || 'noviembre',
    fullFormatted: `${weekdaysFull[dayOfWeek] || 'Día'} ${dateObj.getDate()} de ${monthsFull[monthIdx] || 'noviembre'}`,
    isToday,
  };
}

// City segment bar definition for the trip
const CITY_SEGMENTS = [
  { id: 'madrid-1', city: 'Madrid', label: 'Madrid', color: '#ff4071', startIdx: 0, endIdx: 4 },
  { id: 'roma', city: 'Roma', label: 'Roma', color: '#f59e0b', startIdx: 4, endIdx: 9 },
  { id: 'barcelona', city: 'Barcelona', label: 'Barcelona', color: '#06b6d4', startIdx: 9, endIdx: 13 },
  { id: 'madrid-2', city: 'Madrid', label: 'Madrid', color: '#ff4071', startIdx: 13, endIdx: 14 },
];

export default function ItineraryView({ 
  itinerary = [], 
  places = [],
  activeMember, 
  isAdmin = false,
  selectedDayIndex = 1,
  onSelectDayIndex,
  onToggleActivity, 
  onAddActivity, 
  onDeleteActivity,
  onToggleVisitedPlace,
  onAddPlace,
  onUpdatePlace,
  onDeletePlace,
  transits = [],
  onAddTransit,
  onUpdateTransit,
  onDeleteTransit,
  lodgings = [],
  onAddLodging,
  onUpdateLodging,
  onDeleteLodging
}) {
  const [internalDayIndex, setInternalDayIndex] = useState(selectedDayIndex);
  const [viewMode, setViewMode] = useState('single'); // 'single' | 'all'
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showTransitModal, setShowTransitModal] = useState(false);
  const [editingTransit, setEditingTransit] = useState(null);
  const [showLodgingModal, setShowLodgingModal] = useState(false);
  const [activeLodgingForModal, setActiveLodgingForModal] = useState(null);

  // Sync internal with prop
  useEffect(() => {
    setInternalDayIndex(selectedDayIndex);
  }, [selectedDayIndex]);

  const activeDayIndex = onSelectDayIndex ? selectedDayIndex : internalDayIndex;
  const setDayIndex = (idx) => {
    setInternalDayIndex(idx);
    if (onSelectDayIndex) onSelectDayIndex(idx);
  };

  // Tab to switch between Places, Notes/Logistics, or Both
  const [daySectionTab, setDaySectionTab] = useState('both'); // 'places' | 'notes' | 'both'

  // Bucket list state & filters
  const [bucketCityFilter, setBucketCityFilter] = useState('Todas');
  const [showAddBucketModal, setShowAddBucketModal] = useState(false);
  const [bucketTitle, setBucketTitle] = useState('');
  const [bucketCity, setBucketCity] = useState('Madrid');
  const [bucketMapsUrl, setBucketMapsUrl] = useState('');
  const [assigningPlaceId, setAssigningPlaceId] = useState(null);

  const unassignedPlaces = (places || []).filter(p => !p.day_id && (!p.date_str || p.date_str === ''));
  const filteredBucketPlaces = unassignedPlaces.filter(p => {
    if (bucketCityFilter === 'Todas') return true;
    const loc = ((p.location || '') + ' ' + (p.title || '')).toLowerCase();
    const filter = bucketCityFilter.toLowerCase();
    return loc.includes(filter);
  });

  const handleCreateBucketPlace = async (e) => {
    e.preventDefault();
    if (!bucketTitle.trim() || !onAddPlace) return;
    await onAddPlace({
      title: bucketTitle.trim(),
      location: bucketCity.trim(),
      maps_url: bucketMapsUrl.trim() || null,
      day_id: null,
      date_str: ''
    });
    setBucketTitle('');
    setBucketMapsUrl('');
    setShowAddBucketModal(false);
  };

  const handleAssignToDay = async (placeId, targetDay) => {
    if (!onUpdatePlace || !targetDay) return;
    await onUpdatePlace(placeId, {
      day_id: targetDay.id,
      date_str: targetDay.date_str,
      location: targetDay.city || ''
    });
    setAssigningPlaceId(null);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#ff3b68', '#10b981', '#f59e0b']
    });
  };

  const handleUnassignToBucket = async (placeId) => {
    if (!onUpdatePlace) return;
    await onUpdatePlace(placeId, {
      day_id: null,
      date_str: ''
    });
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#06b6d4', '#ffffff']
    });
  };

  // Form for adding a place or plan to this day
  const [newItemType, setNewItemType] = useState('place'); // 'place' | 'act'
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newMapsUrl, setNewMapsUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const scrollContainerRef = useRef(null);
  const dayRefs = useRef({});

  const safeIndex = Math.min(Math.max(0, activeDayIndex), Math.max(0, itinerary.length - 1));
  const currentDay = itinerary[safeIndex] || itinerary[0];

  // Match lodging for current day based on check-in/out date range and city
  const currentDayLodging = lodgings.find(l => {
    if (!currentDay?.date_str) return false;
    const inDateRange = currentDay.date_str >= l.check_in_date && currentDay.date_str <= l.check_out_date;
    if (!inDateRange) return false;
    if (currentDay.city && l.city) {
      const c1 = currentDay.city.toLowerCase();
      const c2 = l.city.toLowerCase();
      return c1.includes(c2) || c2.includes(c1);
    }
    return true;
  }) || lodgings.find(l => {
    if (!currentDay?.date_str) return false;
    return currentDay.date_str >= l.check_in_date && currentDay.date_str <= l.check_out_date;
  });

  const isCheckInDay = currentDayLodging && currentDay?.date_str === currentDayLodging.check_in_date;

  // Auto scroll active day card into view in carousel
  useEffect(() => {
    if (dayRefs.current[safeIndex]) {
      dayRefs.current[safeIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [safeIndex]);

  // Toggle activity completion
  const handleToggleAct = async (activity) => {
    const newStatus = activity.status === 'completed' ? 'pending' : 'completed';
    await onToggleActivity(activity.id, newStatus, activeMember?.id);
    if (newStatus === 'completed') {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#ff3b68', '#ff758f', '#f59e0b', '#0d9488']
      });
    }
  };

  // Toggle place visited
  const handleTogglePlace = async (place) => {
    if (!onToggleVisitedPlace) return;
    const willBeVisited = !place.visited;
    await onToggleVisitedPlace(place.id, activeMember?.id);
    if (willBeVisited) {
      confetti({
        particleCount: 45,
        spread: 75,
        origin: { y: 0.75 },
        colors: ['#ff3b68', '#ff758f', '#10b981', '#f59e0b']
      });
    }
  };

  // Submit new item (Place or Plan)
  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !currentDay) return;

    if (newItemType === 'place' && onAddPlace) {
      await onAddPlace({
        title: newTitle.trim(),
        location: newLocation.trim() || currentDay.city,
        date_str: currentDay.date_str,
        day_id: currentDay.id,
        maps_url: newMapsUrl.trim() || null
      });
    } else if (onAddActivity) {
      await onAddActivity({
        day_id: currentDay.id,
        time_str: newTime.trim(),
        title: newTitle.trim(),
        location: newLocation.trim(),
        notes: newNotes.trim()
      });
    }

    setNewTitle('');
    setNewTime('');
    setNewLocation('');
    setNewMapsUrl('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const activities = currentDay?.activities || [];
  const dayPlaces = currentDay?.places || [];
  
  // Transits for this day
  const dayTransits = (transits || []).filter(t => {
    if (!currentDay) return false;
    if (t.day_id && Number(t.day_id) === Number(currentDay.id)) return true;
    if (t.date_str && currentDay.date_str && t.date_str.trim().toLowerCase() === currentDay.date_str.trim().toLowerCase()) return true;
    return false;
  });
  
  // Combine places & activities into a unified timeline list
  const combinedTimeline = [
    ...activities.map(a => ({ ...a, itemType: 'activity' })),
    ...dayPlaces.map(p => ({ ...p, itemType: 'place', time_str: p.description?.includes('PM') || p.description?.includes('AM') ? '' : '' }))
  ];

  const totalItemsCount = combinedTimeline.length;
  const completedItemsCount = 
    activities.filter(a => a.status === 'completed').length + 
    dayPlaces.filter(p => p.visited).length;

  const currentDayInfo = parseDayDetails(currentDay?.date_str, safeIndex + 1);

  return (
    <div className="pb-36 pt-0 space-y-4 relative">
      
      {/* 1. SUBHEADER: 14 DÍAS EN 3 CIUDADES + TOGGLE DÍA / TODO / BUCKET LIST */}
      <div className="flex items-center justify-between gap-2 px-1 pt-1">
        <span className="text-xs font-black tracking-wider uppercase text-zinc-400 dark:text-zinc-400 light:text-zinc-600 truncate">
          14 DÍAS EN 3 CIUDADES
        </span>

        {/* Switcher: Día / Todo / Bucket List */}
        <div className="flex p-0.5 rounded-xl bg-[#151926] dark:bg-[#151926] light:bg-zinc-200 border border-[#21283b] dark:border-[#21283b] light:border-zinc-300 text-xs font-bold shadow-sm flex-shrink-0">
          <button
            onClick={() => setViewMode('single')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'single'
                ? 'bg-[#232a3d] dark:bg-[#232a3d] light:bg-white text-white dark:text-white light:text-zinc-900 shadow-sm font-black'
                : 'text-zinc-400 dark:text-zinc-400 light:text-zinc-600 hover:text-white dark:hover:text-white light:hover:text-zinc-900'
            }`}
          >
            Día
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'all'
                ? 'bg-[#232a3d] dark:bg-[#232a3d] light:bg-white text-white dark:text-white light:text-zinc-900 shadow-sm font-black'
                : 'text-zinc-400 dark:text-zinc-400 light:text-zinc-600 hover:text-white dark:hover:text-white light:hover:text-zinc-900'
            }`}
          >
            Todo
          </button>
          <button
            onClick={() => setViewMode('bucket')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'bucket'
                ? 'bg-[#ff3b68] text-white shadow-sm font-black'
                : 'text-zinc-400 dark:text-zinc-400 light:text-zinc-600 hover:text-white dark:hover:text-white light:hover:text-zinc-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Bucket List</span>
            {unassignedPlaces.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                viewMode === 'bucket' ? 'bg-white text-[#ff3b68]' : 'bg-[#ff3b68] text-white'
              }`}>
                {unassignedPlaces.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. CALENDAR DATE STRIP CAROUSEL (SHOWN IN SINGLE & ALL VIEW) */}
      {viewMode !== 'bucket' && (
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 select-none"
        >
          {itinerary.map((day, idx) => {
            const isSelected = idx === safeIndex && viewMode === 'single';
            const info = parseDayDetails(day.date_str, idx + 1);

            return (
              <button
                key={day.id || idx}
                ref={el => dayRefs.current[idx] = el}
                onClick={() => {
                  setDayIndex(idx);
                  setViewMode('single');
                }}
                className={`relative min-w-[58px] sm:min-w-[64px] h-[72px] rounded-2xl flex flex-col items-center justify-center p-1.5 transition-all flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#ff3b68] text-white shadow-md shadow-[#ff3b68]/30 z-10 font-black'
                    : 'bg-[#151926] dark:bg-[#151926] light:bg-white text-zinc-300 dark:text-zinc-300 light:text-zinc-700 border border-[#21283b] dark:border-[#21283b] light:border-zinc-200 hover:border-zinc-500'
                }`}
              >
                {/* Weekday abbreviation (Dom, Lun, Mar...) */}
                <span className={`text-[11px] font-bold uppercase tracking-tight ${
                  isSelected ? 'text-white' : 'text-zinc-400 dark:text-zinc-400 light:text-zinc-500'
                }`}>
                  {info.weekdayShort}
                </span>

                {/* Day Number (22, 23, 24...) */}
                <span className="text-xl font-black leading-none mt-1">
                  {info.dayNumber}
                </span>

                {/* Small bottom dash indicator */}
                <div className={`w-3.5 h-0.5 rounded-full mt-1.5 ${
                  isSelected ? 'bg-white/80' : 'bg-zinc-700 dark:bg-zinc-700 light:bg-zinc-300'
                }`} />
              </button>
            );
          })}
        </div>
      )}

      {/* 4. MODE: SINGLE DAY DETAILED VIEW */}
      {viewMode === 'single' && currentDay && (
        <motion.div 
          key={currentDay.id || safeIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4 pt-1"
        >
          {/* DAY BANNER CARD (MATCHING REFERENCE SCREENSHOT - SLEEK GLASS WITH SUBTLE GLOW) */}
          <div 
            className="relative overflow-hidden rounded-3xl bg-[#121724] dark:bg-[#121724] light:bg-white border border-[#1e273c] dark:border-[#1e273c] light:border-zinc-200 p-5 shadow-xl light:shadow-md"
            style={{
              backgroundImage: 'radial-gradient(circle at 85% 75%, rgba(255, 59, 104, 0.08) 0%, transparent 60%)'
            }}
          >
            <div className="relative z-10 space-y-3">
              {/* Badges row */}
              <div className="flex items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#171e2e] dark:bg-[#171e2e] light:bg-zinc-100 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 border border-[#232d42] dark:border-[#232d42] light:border-zinc-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b68]" />
                  <span>Día {safeIndex + 1} de {itinerary.length}</span>
                </span>

                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#171e2e] dark:bg-[#171e2e] light:bg-zinc-100 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 border border-[#232d42] dark:border-[#232d42] light:border-zinc-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b68]" />
                  <span>{dayPlaces.filter(p => p.visited).length}/{dayPlaces.length} visitados</span>
                </span>
              </div>

              {/* Huge City Title & Hospedaje Button Row */}
              <div className="flex items-end justify-between gap-3 pt-1">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white dark:text-white light:text-zinc-900 tracking-tight leading-none">
                    {currentDay.city_to ? `${currentDay.city} ➔ ${currentDay.city_to}` : (currentDay.city || currentDay.title)}
                  </h2>

                  {/* Subtitle with Date (Clean - Temperature removed) */}
                  <p className="text-xs font-semibold text-[#7886a0] dark:text-[#7886a0] light:text-zinc-500 mt-1.5">
                    {currentDayInfo.fullFormatted}
                  </p>
                </div>

                {/* Hospedaje / Airbnb button: Solo icono de la casita */}
                {currentDayLodging ? (
                  <button
                    onClick={() => {
                      setActiveLodgingForModal(currentDayLodging);
                      setShowLodgingModal(true);
                    }}
                    className={`relative w-10 h-10 rounded-2xl flex items-center justify-center border transition-all cursor-pointer shadow-lg active:scale-90 group ${
                      isCheckInDay
                        ? 'bg-gradient-to-br from-[#ff3b68] to-rose-600 border-[#ff3b68] text-white shadow-[#ff3b68]/30'
                        : 'bg-[#181f30] dark:bg-[#181f30] light:bg-white border-[#253047] dark:border-[#253047] light:border-zinc-300 hover:border-[#ff3b68]/50 text-[#ff3b68]'
                    }`}
                    title={isCheckInDay ? `Check-in hoy: ${currentDayLodging.name}` : `Hospedaje: ${currentDayLodging.name}`}
                  >
                    <Home className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isCheckInDay ? 'text-white' : 'text-[#ff3b68]'
                    }`} />
                    {isCheckInDay && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#121724] animate-pulse" />
                    )}
                  </button>
                ) : isAdmin ? (
                  <button
                    onClick={() => {
                      setActiveLodgingForModal({
                        city: currentDay.city || 'Madrid',
                        check_in_date: currentDay.date_str || '',
                        check_out_date: currentDay.date_str || ''
                      });
                      setShowLodgingModal(true);
                    }}
                    className="w-10 h-10 rounded-2xl bg-[#181f30] hover:bg-[#222b42] border border-dashed border-[#2d3a56] flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
                    title="Añadir hospedaje para este día"
                  >
                    <Home className="w-5 h-5 text-zinc-400 hover:text-[#ff3b68]" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* 5. SECCIÓN 1: LUGARES A VISITAR (PROTAGONISTA - DESTACADO Y ESPACIOSO) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#ff3b68]" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#ff3b68]">
                  LUGARES A VISITAR ({places.length})
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditingTransit(null);
                      setShowTransitModal(true);
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#182032] dark:bg-[#182032] light:bg-sky-50 hover:bg-[#222c45] light:hover:bg-sky-100 border border-[#2b3752] light:border-sky-200 text-sky-400 light:text-sky-700 text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                    title="Añadir billete de avión o tren"
                  >
                    <Plane className="w-3.5 h-3.5" />
                    <span>+ Billete</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setNewItemType('place');
                    setShowAddModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[#ff3b68] hover:bg-[#ff2557] text-white text-xs font-bold shadow-md shadow-[#ff3b68]/30 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Añadir Lugar</span>
                </button>
              </div>
            </div>

            {/* Transit Tickets (Flights & Trains - Style from reference) */}
            {dayTransits.length > 0 && (
              <div className="space-y-2.5 mb-3">
                {dayTransits.map(transit => (
                  <TransitCard
                    key={`transit-${transit.id}`}
                    transit={transit}
                    isAdmin={isAdmin}
                    onEdit={(t) => {
                      setEditingTransit(t);
                      setShowTransitModal(true);
                    }}
                    onDelete={onDeleteTransit}
                  />
                ))}
              </div>
            )}

            {/* Places List: Hero prominent cards */}
            <div className="space-y-2.5">
              {dayPlaces.length > 0 ? (
                dayPlaces.map((place) => {
                  const isDone = Boolean(place.visited);
                  const mapUrl = place.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.title + ' ' + (place.location || currentDay.city || ''))}`;

                  return (
                    <div 
                      key={place.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#111520] dark:bg-[#111520] light:bg-white border border-[#1e2538] dark:border-[#1e2538] light:border-zinc-200 flex items-center justify-between gap-3.5 shadow-md light:shadow-sm hover:border-[#2a344c] light:hover:border-zinc-300 transition-all"
                    >
                      {/* Checkbox: Big rounded circular pill */}
                      <button
                        onClick={() => handleTogglePlace(place)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
                          isDone
                            ? 'bg-[#ff3b68] border-[#ff3b68] text-white shadow-md shadow-[#ff3b68]/30'
                            : 'bg-[#171e2c] dark:bg-[#171e2c] light:bg-zinc-100 border-[#2b364c] dark:border-[#2b364c] light:border-zinc-300 hover:border-[#ff3b68]'
                        }`}
                        title={isDone ? 'Marcado como visitado' : 'Marcar como visitado'}
                      >
                        {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>

                      {/* Title & Location */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-[15px] sm:text-base font-bold truncate leading-tight ${
                          isDone ? 'line-through text-zinc-500 dark:text-zinc-500 light:text-zinc-400' : 'text-white dark:text-white light:text-zinc-900'
                        }`}>
                          {place.title}
                        </h4>
                        {place.location && (
                          <p className="text-xs text-[#7886a0] dark:text-[#7886a0] light:text-zinc-500 truncate mt-1">
                            {place.location}
                          </p>
                        )}
                      </div>

                      {/* Right: Maps Link, Move to Bucket & Delete */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {onUpdatePlace && (
                          <button
                            onClick={() => handleUnassignToBucket(place.id)}
                            className="w-9 h-9 rounded-xl bg-[#171e2c] dark:bg-[#171e2c] light:bg-zinc-100 border border-[#263246] dark:border-[#263246] light:border-zinc-200 text-zinc-400 hover:text-amber-400 hover:bg-[#20293c] flex items-center justify-center transition-all cursor-pointer shadow-sm"
                            title="Mover a Bucket List (sin fecha fija)"
                          >
                            <Bookmark className="w-4 h-4 stroke-[2]" />
                          </button>
                        )}
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl bg-[#171e2c] dark:bg-[#171e2c] light:bg-zinc-100 border border-[#263246] dark:border-[#263246] light:border-zinc-200 text-[#ff3b68] hover:bg-[#ff3b68] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                          title="Abrir en Google Maps"
                        >
                          <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                        </a>
                        <button
                          onClick={() => onDeletePlace && onDeletePlace(place.id)}
                          className="p-2 text-zinc-400 dark:text-zinc-500 light:text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Eliminar lugar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-2xl bg-[#111520] dark:bg-[#111520] light:bg-white border border-[#1e2538] dark:border-[#1e2538] light:border-zinc-200 text-center">
                  <p className="text-xs text-[#7886a0] dark:text-[#7886a0] light:text-zinc-500">
                    No hay lugares registrados para este día.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 6. SECCIÓN 2: NOTAS Y LOGÍSTICA DEL DÍA (COMPACTO Y SECUNDARIO) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-[#ff3b68]" />
                  <h3 className="text-sm sm:text-[15px] font-bold text-white dark:text-white light:text-zinc-900 tracking-tight">
                    Notas y Logística del Día
                  </h3>
                </div>
                <p className="text-[11px] text-[#7886a0] dark:text-[#7886a0] light:text-zinc-500 mt-0.5">
                  Vuelos, trenes, check-in o actividades específicas
                </p>
              </div>

              <button
                onClick={() => {
                  setNewItemType('act');
                  setShowAddModal(true);
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#1b212e] dark:bg-[#1b212e] light:bg-zinc-100 hover:bg-[#252f42] light:hover:bg-zinc-200 text-zinc-200 dark:text-zinc-200 light:text-zinc-800 border border-[#293448] dark:border-[#293448] light:border-zinc-300 text-xs font-semibold transition-all cursor-pointer flex-shrink-0 flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>Añadir Nota</span>
              </button>
            </div>

            {/* Notes List: Distinctively compact rows */}
            <div className="space-y-1.5">
              {activities.length > 0 ? (
                activities.map((act) => {
                  const isDone = act.status === 'completed';
                  return (
                    <div 
                      key={act.id}
                      className="py-2.5 px-3.5 rounded-xl bg-[#0f131d] dark:bg-[#0f131d] light:bg-white border border-[#1b2233] dark:border-[#1b2233] light:border-zinc-200 flex items-center justify-between gap-3 shadow-none hover:border-[#273248] light:hover:border-zinc-300 transition-all"
                    >
                      {/* Checkbox: Compact rounded square */}
                      <button
                        onClick={() => handleToggleAct(act)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
                          isDone
                            ? 'bg-[#ff3b68] border-[#ff3b68] text-white'
                            : 'bg-[#161c28] dark:bg-[#161c28] light:bg-zinc-100 border-[#252f42] dark:border-[#252f42] light:border-zinc-300 hover:border-[#ff3b68]'
                        }`}
                        title={isDone ? 'Marcado como completado' : 'Marcar como completado'}
                      >
                        {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      {/* Title & Subtitle: Compact typography */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs sm:text-[13px] font-semibold truncate leading-tight ${
                          isDone ? 'line-through text-zinc-500 dark:text-zinc-500 light:text-zinc-400' : 'text-zinc-200 dark:text-zinc-200 light:text-zinc-800'
                        }`}>
                          {act.title}
                        </h4>
                        {(act.location || act.notes || act.time_str) && (
                          <p className="text-[11px] text-[#7886a0] dark:text-[#7886a0] light:text-zinc-500 truncate mt-0.5 leading-tight">
                            {act.time_str ? `${act.time_str} • ` : ''}
                            {act.location || act.notes}
                          </p>
                        )}
                      </div>

                      {/* Right: Only Delete, compact icon */}
                      <div className="flex items-center flex-shrink-0">
                        <button
                          onClick={() => onDeleteActivity && onDeleteActivity(act.id)}
                          className="p-1.5 text-zinc-400 dark:text-zinc-500 light:text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Eliminar nota"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-3 px-4 rounded-xl bg-[#0f131d] dark:bg-[#0f131d] light:bg-white border border-[#1b2233] dark:border-[#1b2233] light:border-zinc-200 text-center">
                  <p className="text-xs text-[#7886a0] dark:text-[#7886a0] light:text-zinc-500">
                    No hay notas o actividades registradas para este día.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 6. MODE: ALL DAYS OVERVIEW */}
      {viewMode === 'all' && (
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {itinerary.map((day, idx) => {
            const isTransferDay = Boolean(day.is_transfer || day.city_to);
            const acts = day.activities || [];
            const dayPlaces = day.places || [];
            const info = parseDayDetails(day.date_str, idx + 1);

            return (
              <div 
                key={day.id || idx}
                className="p-4 rounded-3xl bg-[#151926] dark:bg-[#151926] light:bg-white border border-[#21283b] dark:border-[#21283b] light:border-zinc-200 shadow-md space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#21283b]">
                  <div>
                    <span className="text-xs font-black text-[#ff4071] block uppercase tracking-wide">
                      {info.fullFormatted}
                    </span>

                    <h3 className="text-base font-black text-white dark:text-white light:text-zinc-900 mt-0.5">
                      {isTransferDay ? `${day.city} ➔ ${day.city_to} ✈️` : (day.city || day.title)}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDayIndex(idx);
                      setViewMode('single');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#21283b] text-white hover:bg-[#ff4071] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>Ver Día</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Items Summary */}
                <div className="space-y-1.5 text-xs">
                  {dayPlaces.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-[#0b0d14] dark:bg-[#0b0d14] light:bg-zinc-50 text-zinc-200 dark:text-zinc-200 light:text-zinc-800">
                      <span className="font-bold truncate flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#ff4071]" />
                        <span>{p.title}</span>
                      </span>
                      <span className={`text-[10px] font-bold ${p.visited ? 'text-[#ff3b68]' : 'text-zinc-400 dark:text-zinc-500 light:text-zinc-400'}`}>
                        {p.visited ? '✓ Visitado' : 'Pendiente'}
                      </span>
                    </div>
                  ))}

                  {acts.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-2 rounded-xl bg-[#0b0d14]/60 dark:bg-[#0b0d14]/60 light:bg-zinc-50 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 text-[11px]">
                      <span className="truncate">{a.title}</span>
                      <span className="text-zinc-500 font-mono">{a.time_str}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* 7. MODE: BUCKET LIST (LUGARES POR ASIGNAR) */}
      {viewMode === 'bucket' && (
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Header Card */}
          <div 
            className="p-5 rounded-3xl bg-[#121724] dark:bg-[#121724] light:bg-white border border-[#1e273c] dark:border-[#1e273c] light:border-zinc-200 shadow-xl space-y-3.5 relative overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(circle at 90% 20%, rgba(255, 59, 104, 0.12) 0%, transparent 60%)'
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff3b68]" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#ff3b68]">
                    Bolsa de Ideas & Deseos
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white dark:text-white light:text-zinc-900 tracking-tight mt-1">
                  Lugares por Asignar
                </h2>
                <p className="text-xs text-[#7886a0] dark:text-[#7886a0] light:text-zinc-500 mt-1 max-w-xs">
                  Sitios recomendados y planes flexibles sin día fijo. ¡Asígnalos a cualquier día sobre la marcha!
                </p>
              </div>

              <button
                onClick={() => setShowAddBucketModal(true)}
                className="px-4 py-2 rounded-2xl bg-[#ff3b68] hover:bg-[#ff2557] text-white text-xs font-black shadow-lg shadow-[#ff3b68]/30 transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Añadir Lugar</span>
              </button>
            </div>

            {/* City Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {['Todas', 'Madrid', 'Roma', 'Barcelona'].map(city => {
                const count = city === 'Todas' 
                  ? unassignedPlaces.length 
                  : unassignedPlaces.filter(p => ((p.location || '') + ' ' + (p.title || '')).toLowerCase().includes(city.toLowerCase())).length;
                const isSelected = bucketCityFilter === city;

                return (
                  <button
                    key={city}
                    onClick={() => setBucketCityFilter(city)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                      isSelected
                        ? 'bg-[#ff3b68] text-white shadow-sm'
                        : 'bg-[#181f2f] dark:bg-[#181f2f] light:bg-zinc-100 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:bg-[#20293d]'
                    }`}
                  >
                    <span>{city}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-[#0f131f] text-zinc-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Places List */}
          <div className="space-y-3">
            {filteredBucketPlaces.length > 0 ? (
              filteredBucketPlaces.map(place => {
                const isDone = Boolean(place.visited);
                const isAssigning = assigningPlaceId === place.id;
                const mapUrl = place.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.title + ' ' + (place.location || ''))}`;

                return (
                  <div
                    key={place.id}
                    className="p-4 rounded-2xl bg-[#111520] dark:bg-[#111520] light:bg-white border border-[#1e2538] dark:border-[#1e2538] light:border-zinc-200 shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleTogglePlace(place)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
                          isDone
                            ? 'bg-[#ff3b68] border-[#ff3b68] text-white shadow-md shadow-[#ff3b68]/30'
                            : 'bg-[#171e2c] dark:bg-[#171e2c] light:bg-zinc-100 border-[#2b364c] dark:border-[#2b364c] light:border-zinc-300 hover:border-[#ff3b68]'
                        }`}
                        title={isDone ? 'Marcado como visitado' : 'Marcar como visitado'}
                      >
                        {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>

                      {/* Title & Location */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-[15px] font-bold truncate leading-tight ${
                          isDone ? 'line-through text-zinc-500 dark:text-zinc-500 light:text-zinc-400' : 'text-white dark:text-white light:text-zinc-900'
                        }`}>
                          {place.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {place.location && (
                            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-400 light:text-zinc-600 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#ff3b68]" />
                              <span>{place.location}</span>
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#1b2233] dark:bg-[#1b2233] light:bg-zinc-100 text-amber-400 border border-[#263148] dark:border-[#263148] light:border-zinc-200">
                            Sin día fijo
                          </span>
                        </div>
                      </div>

                      {/* Maps link & Delete */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl bg-[#171e2c] dark:bg-[#171e2c] light:bg-zinc-100 border border-[#263246] dark:border-[#263246] light:border-zinc-200 text-[#ff3b68] hover:bg-[#ff3b68] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                          title="Abrir en Google Maps"
                        >
                          <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                        </a>
                        {isAdmin && (
                          <button
                            onClick={() => onDeletePlace && onDeletePlace(place.id)}
                            className="p-2 text-zinc-400 dark:text-zinc-500 light:text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Eliminar lugar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action: Assign to a Day */}
                    <div className="pt-2 border-t border-[#1a2133] dark:border-[#1a2133] light:border-zinc-100">
                      {!isAssigning ? (
                        <button
                          onClick={() => setAssigningPlaceId(place.id)}
                          className="w-full py-2 px-3 rounded-xl bg-[#171f30] dark:bg-[#171f30] light:bg-zinc-100 hover:bg-[#202b42] light:hover:bg-zinc-200 border border-[#27344e] dark:border-[#27344e] light:border-zinc-200 text-xs font-bold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#ff3b68]" />
                          <span>Asignar a un día del itinerario ➔</span>
                        </button>
                      ) : (
                        <div className="space-y-2 p-3 rounded-xl bg-[#0b0e17] dark:bg-[#0b0e17] light:bg-zinc-50 border border-[#20293d] dark:border-[#20293d] light:border-zinc-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-white dark:text-white light:text-zinc-900 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#ff3b68]" />
                              <span>Elige a qué día moverlo:</span>
                            </span>
                            <button
                              onClick={() => setAssigningPlaceId(null)}
                              className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>

                          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                            {itinerary.map((d, dIdx) => {
                              const info = parseDayDetails(d.date_str, dIdx + 1);
                              return (
                                <button
                                  key={d.id || dIdx}
                                  onClick={() => handleAssignToDay(place.id, d)}
                                  className="w-full p-2 rounded-lg bg-[#141a29] dark:bg-[#141a29] light:bg-white hover:bg-[#ff3b68] hover:text-white border border-[#232d44] dark:border-[#232d44] light:border-zinc-200 text-left transition-all cursor-pointer flex items-center justify-between text-xs group"
                                >
                                  <div className="font-bold">
                                    <span className="text-[#ff3b68] group-hover:text-white mr-1.5 font-black">
                                      Día {dIdx + 1}
                                    </span>
                                    <span className="text-zinc-200 dark:text-zinc-200 light:text-zinc-800 group-hover:text-white">
                                      {d.city || d.title}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-zinc-400 dark:text-zinc-400 light:text-zinc-500 group-hover:text-white/90">
                                    {info.fullFormatted}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 rounded-3xl bg-[#111520] dark:bg-[#111520] light:bg-white border border-[#1e2538] dark:border-[#1e2538] light:border-zinc-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#1b2233] dark:bg-[#1b2233] light:bg-zinc-100 flex items-center justify-center mx-auto text-[#ff3b68]">
                  <Bookmark className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white dark:text-white light:text-zinc-900">
                    No hay lugares pendientes {bucketCityFilter !== 'Todas' ? `en ${bucketCityFilter}` : ''}
                  </h4>
                  <p className="text-xs text-[#7886a0] dark:text-[#7886a0] light:text-zinc-500 mt-1 max-w-xs mx-auto">
                    {bucketCityFilter !== 'Todas' 
                      ? 'No hay sitios guardados para esta ciudad o ya están todos asignados a un día.'
                      : 'Todos los lugares están asignados a un día del itinerario o puedes agregar nuevas recomendaciones.'}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddBucketModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#ff3b68] text-white text-xs font-bold shadow-md hover:bg-[#ff2557] cursor-pointer"
                >
                  + Agregar Sitio a la Lista
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* MODAL: AÑADIR A BUCKET LIST */}
      {showAddBucketModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#131722] dark:bg-[#131722] light:bg-white rounded-3xl border border-[#ff3b68]/40 dark:border-[#ff3b68]/40 light:border-zinc-200 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white dark:text-white light:text-zinc-900">
                  Nuevo Lugar (Bucket List)
                </h3>
                <p className="text-xs text-[#7886a0] dark:text-[#7886a0] light:text-zinc-500 mt-0.5">
                  Guárdalo ahora y asígnalo a un día cuando quieran ir.
                </p>
              </div>
              <button 
                onClick={() => setShowAddBucketModal(false)}
                className="w-8 h-8 rounded-full bg-[#0b0e17] dark:bg-[#0b0e17] light:bg-zinc-100 flex items-center justify-center text-[#7886a0] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBucketPlace} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mb-1">
                  Nombre del Lugar o Monumento *
                </label>
                <input 
                  type="text" 
                  value={bucketTitle}
                  onChange={(e) => setBucketTitle(e.target.value)}
                  placeholder="Ej. Mercado de San Miguel, Mirador del Pincio..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0e17] dark:bg-[#0b0e17] light:bg-zinc-50 border border-[#212a3d] dark:border-[#212a3d] light:border-zinc-300 text-white dark:text-white light:text-zinc-900 text-xs font-bold focus:outline-none focus:border-[#ff3b68]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mb-1">
                  Ciudad / Ubicación
                </label>
                <select
                  value={bucketCity}
                  onChange={(e) => setBucketCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0e17] dark:bg-[#0b0e17] light:bg-zinc-50 border border-[#212a3d] dark:border-[#212a3d] light:border-zinc-300 text-white dark:text-white light:text-zinc-900 text-xs font-bold focus:outline-none focus:border-[#ff3b68]"
                >
                  <option value="Madrid">Madrid</option>
                  <option value="Roma">Roma</option>
                  <option value="Barcelona">Barcelona</option>
                  <option value="General / Ruta">General / En ruta</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mb-1">
                  Enlace de Google Maps (Opcional)
                </label>
                <input 
                  type="url" 
                  value={bucketMapsUrl}
                  onChange={(e) => setBucketMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0e17] dark:bg-[#0b0e17] light:bg-zinc-50 border border-[#212a3d] dark:border-[#212a3d] light:border-zinc-300 text-white dark:text-white light:text-zinc-900 text-xs font-bold focus:outline-none focus:border-[#ff3b68]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBucketModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1a2130] text-zinc-300 text-xs font-bold cursor-pointer hover:bg-[#252f44]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!bucketTitle.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[#ff3b68] hover:bg-[#ff2557] text-white text-xs font-black shadow-md shadow-[#ff3b68]/30 cursor-pointer disabled:opacity-50"
                >
                  Guardar en Bucket List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: AÑADIR ACTIVIDAD O LUGAR AL DÍA */}
      {showAddModal && currentDay && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#131722] dark:bg-[#131722] light:bg-white rounded-3xl border border-[#ff3b68]/40 dark:border-[#ff3b68]/40 light:border-zinc-200 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white dark:text-white light:text-zinc-900">
                  Añadir al Día
                </h3>
                <p className="text-xs text-[#7886a0] dark:text-[#7886a0] light:text-zinc-500 mt-0.5">
                  Para el {currentDayInfo.fullFormatted} en {currentDay.city}.
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-[#0b0e17] dark:bg-[#0b0e17] light:bg-zinc-100 flex items-center justify-center text-[#7886a0] dark:text-[#7886a0] light:text-zinc-500 hover:text-white dark:hover:text-white light:hover:text-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector: Lugar vs Plan */}
            <div className="flex p-1 bg-[#0b0e17] dark:bg-[#0b0e17] light:bg-zinc-100 rounded-2xl border border-[#1e2538] dark:border-[#1e2538] light:border-zinc-200 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setNewItemType('place')}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  newItemType === 'place'
                    ? 'bg-[#ff3b68] text-white font-black shadow-md shadow-[#ff3b68]/30'
                    : 'text-[#7886a0] dark:text-[#7886a0] light:text-zinc-600 hover:text-white dark:hover:text-white light:hover:text-zinc-900'
                }`}
              >
                <span>🏛️ Lugar</span>
              </button>
              <button
                type="button"
                onClick={() => setNewItemType('act')}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  newItemType === 'act'
                    ? 'bg-[#ff3b68] text-white font-black shadow-md shadow-[#ff3b68]/30'
                    : 'text-[#7886a0] dark:text-[#7886a0] light:text-zinc-600 hover:text-white dark:hover:text-white light:hover:text-zinc-900'
                }`}
              >
                <span>📝 Nota / Plan</span>
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mb-1">
                  {newItemType === 'place' ? 'Nombre del Lugar / Monumento' : 'Título del Plan o Logística'}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={newItemType === 'place' ? 'Ej. Fontana di Trevi, Museo del Prado...' : 'Ej. Vuelo a Roma, Check-in Hotel...'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0b0e17] dark:bg-[#0b0e17] light:bg-zinc-50 border border-[#1e2538] dark:border-[#1e2538] light:border-zinc-300 rounded-xl text-white dark:text-white light:text-zinc-900 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mb-1">
                    Hora (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 10:30 AM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0b0e17] dark:bg-[#0b0e17] light:bg-zinc-50 border border-[#1e2538] dark:border-[#1e2538] light:border-zinc-300 rounded-xl text-white dark:text-white light:text-zinc-900 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mb-1">
                    Ubicación
                  </label>
                  <select
                    value={newLocation || currentDay.city || 'Madrid'}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0b0e17] dark:bg-[#0b0e17] light:bg-zinc-50 border border-[#1e2538] dark:border-[#1e2538] light:border-zinc-300 rounded-xl text-white dark:text-white light:text-zinc-900 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                  >
                    <option value="Madrid">Madrid</option>
                    <option value="Barcelona">Barcelona</option>
                    <option value="Roma">Roma</option>
                    <option value="Venezia">Venezia</option>
                  </select>
                </div>
              </div>

              {newItemType === 'place' && (
                <div>
                  <label className="block text-xs font-bold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mb-1">
                    Google Maps URL (opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://maps.google.com/..."
                    value={newMapsUrl}
                    onChange={(e) => setNewMapsUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0b0e17] dark:bg-[#0b0e17] light:bg-zinc-50 border border-[#1e2538] dark:border-[#1e2538] light:border-zinc-300 rounded-xl text-white dark:text-white light:text-zinc-900 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                  />
                </div>
              )}

              {newItemType === 'act' && (
                <div>
                  <label className="block text-xs font-bold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mb-1">
                    Notas y Detalles (opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Terminal 2, recogida de llaves a las 15:00, llevar pasaporte..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0b0e17] dark:bg-[#0b0e17] light:bg-zinc-50 border border-[#1e2538] dark:border-[#1e2538] light:border-zinc-300 rounded-xl text-white dark:text-white light:text-zinc-900 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-[#1e2538] dark:border-[#1e2538] light:border-zinc-300 text-[#7886a0] dark:text-[#7886a0] light:text-zinc-700 hover:text-white dark:hover:text-white light:hover:text-zinc-900 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-[#ff3b68] hover:bg-[#ff2557] text-white shadow-md shadow-[#ff3b68]/30 cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transit Modal (Admin only) */}
      <TransitModal
        isOpen={showTransitModal}
        onClose={() => {
          setShowTransitModal(false);
          setEditingTransit(null);
        }}
        initialData={editingTransit}
        itinerary={itinerary}
        onSave={async (transitData) => {
          if (editingTransit) {
            await onUpdateTransit(editingTransit.id, {
              ...transitData,
              day_id: editingTransit.day_id || currentDay?.id,
              date_str: transitData.date_str || currentDay?.date_str
            });
          } else {
            await onAddTransit({
              ...transitData,
              day_id: currentDay?.id,
              date_str: transitData.date_str || currentDay?.date_str
            });
          }
          setShowTransitModal(false);
          setEditingTransit(null);
        }}
      />

      {/* Lodging Modal */}
      <LodgingModal
        isOpen={showLodgingModal}
        onClose={() => {
          setShowLodgingModal(false);
          setActiveLodgingForModal(null);
        }}
        lodging={activeLodgingForModal}
        isAdmin={isAdmin}
        allLodgings={lodgings}
        onSave={async (lodgingData) => {
          if (lodgingData.id) {
            await onUpdateLodging(lodgingData.id, lodgingData);
          } else {
            await onAddLodging(lodgingData);
          }
          setShowLodgingModal(false);
          setActiveLodgingForModal(null);
        }}
        onDelete={async (id) => {
          await onDeleteLodging(id);
          setShowLodgingModal(false);
          setActiveLodgingForModal(null);
        }}
      />
    </div>
  );
}

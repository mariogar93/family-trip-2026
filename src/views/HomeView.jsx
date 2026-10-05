import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  CalendarDays, 
  ExternalLink, 
  ArrowRight, 
  Gamepad2, 
  Trophy, 
  Wallet, 
  CheckCircle2, 
  Utensils, 
  Palette,
  Compass,
  Heart,
  Grid3X3,
  Binoculars,
  Crown,
  Plane,
  Train,
  Clock,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import PetAvatar, { PET_STATES } from '../components/PetAvatar';

// Automatic contextual state engine for the pet based on activities and games
function getAutomaticPetState({ itinerary = [], places = [], bingoData = {}, activeMember }) {
  const now = new Date();
  const hour = now.getHours();

  // Rule 1: Night hours (23:00 to 07:00) -> Sleeping
  if (hour >= 23 || hour < 7) {
    return 'sleeping';
  }

  // Rule 2: Happy / Celebrating
  // Trigger: Member claimed a bingo line or completed special challenges
  const hasClaimedBingoLine = (bingoData?.linesClaimed || []).some(
    lc => lc.member_id === activeMember?.id
  );
  if (hasClaimedBingoLine) {
    return 'happy';
  }

  // Rule 3: Exploring
  // Trigger: Member has visited at least 2 places today in itinerary
  const visitedCount = (places || []).filter(p => p.visited).length;
  if (visitedCount >= 2) {
    return 'exploring';
  }

  // Rule 4: Eating / Appetite
  // Trigger: Marked a bingo item today, OR it is past 13:00 and hasn't tasted any bingo dish yet
  const myBingoCompletions = (bingoData?.items || []).filter(item =>
    (item.completions || []).some(c => c.member_id === activeMember?.id)
  ).length;

  if (myBingoCompletions > 0 && hour >= 12 && hour <= 16) {
    return 'eating';
  }
  if (hour >= 13 && hour <= 15 && myBingoCompletions === 0) {
    return 'eating';
  }
  if (hour >= 20 && hour <= 22) {
    return 'eating';
  }

  // Rule 5: Default Base State -> Idle
  return 'idle';
}

// Friendly date formatter helper: "2026-11-21" -> "Sáb, 21 Nov"
function formatFriendlyDate(dateStr) {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    if (!isNaN(d.getTime())) {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return `${daysOfWeek[d.getDay()]}, ${day} ${months[d.getMonth()]}`;
    }
  }
  return dateStr;
}

export default function HomeView({
  settings = {},
  activeMember,
  itinerary = [],
  places = [],
  transits = [],
  bingoData = {},
  expenseData = {},
  onNavigateTab,
  onSelectItineraryDay
}) {
  const [isPetPetting, setIsPetPetting] = useState(false);

  // Automatic pet state resolved from real-time context
  const petState = getAutomaticPetState({ itinerary, places, bingoData, activeMember });
  const currentStateMeta = PET_STATES[petState] || PET_STATES.idle;

  // Find today's day or first day in itinerary
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  let todayDayIndex = itinerary.findIndex(d => {
    if (!d.date_str) return false;
    return d.date_str === todayIso;
  });

  if (todayDayIndex === -1 && itinerary.length > 0) {
    todayDayIndex = 0;
  }

  const activeDay = itinerary[todayDayIndex] || itinerary[0];

  // Places stats
  const totalPlaces = places.length;
  const visitedPlaces = places.filter(p => p.visited).length;
  const placesPercent = totalPlaces > 0 ? Math.round((visitedPlaces / totalPlaces) * 100) : 0;

  // Next unvisited place today (for What's Next)
  const todayPlaces = activeDay?.places || [];
  const nextUnvisitedPlace = todayPlaces.find(p => !p.visited);

  // Next upcoming transit (if any)
  const nextTransit = transits && transits.length > 0 ? transits[0] : null;

  // Bingo stats
  const allBingoItems = bingoData?.items || [];
  const totalBingo = allBingoItems.length;
  const completedBingo = allBingoItems.filter(i => (i.completions || []).some(c => c.member_id === activeMember?.id)).length;

  // Expenses total
  const totalExpenses = (expenseData?.expenses || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const currency = settings.currency_symbol || '€';

  // Handle petting the pet
  const handlePetInteraction = () => {
    setIsPetPetting(true);
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.35 },
      colors: ['#ff3b68', '#f59e0b', '#ec4899', '#3b82f6']
    });
    setTimeout(() => setIsPetPetting(false), 800);
  };

  // 4 compact games in 2x2 grid
  const primaryGames = [
    {
      id: 'missions',
      title: 'Misión del Día',
      tag: 'Reto Diario',
      icon: Compass,
      color: '#ff3b68',
      bgGrad: 'from-[#ff3b68]/15 to-transparent',
      borderColor: 'border-[#ff3b68]/30'
    },
    {
      id: 'bingo',
      title: 'Bingo Gastronómico',
      tag: 'Comidas Típicas',
      icon: Grid3X3,
      color: '#f59e0b',
      bgGrad: 'from-amber-500/15 to-transparent',
      borderColor: 'border-amber-500/30'
    },
    {
      id: 'details',
      title: 'Caza de Detalles y A-Z',
      tag: 'Curiosidades',
      icon: Binoculars,
      color: '#3b82f6',
      bgGrad: 'from-blue-500/15 to-transparent',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'colors',
      title: 'Reto de Colores',
      tag: 'Fotografía',
      icon: Palette,
      color: '#a855f7',
      bgGrad: 'from-purple-500/15 to-transparent',
      borderColor: 'border-purple-500/30'
    }
  ];

  return (
    <div className="pb-28 pt-1 space-y-4">
      
      {/* 1. PET HERO SHOWCASE BANNER (Clean, luxury, automatic state, fixed itinerary card) */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-[#181d2c] via-[#121622] to-[#0a0d14] dark:from-[#181d2c] dark:via-[#121622] dark:to-[#0a0d14] light:from-rose-50/70 light:via-white light:to-rose-50/30 border border-zinc-200/80 dark:border-[#21283b] shadow-xl pt-6 px-4 pb-4 transition-all">
        
        {/* Soft atmospheric gradient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#ff3b68]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Center: Prominent Pet Character Display */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center pb-2">
          
          {/* Clickable Bouncy Pet */}
          <motion.div
            animate={isPetPetting ? { scale: [1, 1.25, 0.95, 1.05, 1], rotate: [0, -6, 6, -3, 0] } : { y: [0, -6, 0] }}
            transition={isPetPetting ? { duration: 0.6 } : { repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            onClick={handlePetInteraction}
            className="cursor-pointer relative group my-1"
            title="¡Toca a tu mascota para acariciarla!"
          >
            {activeMember && (
              <PetAvatar
                petType={activeMember.pet_type}
                accessory={activeMember.pet_accessory}
                level={activeMember.pet_level}
                size="hero"
                animated
                state={petState}
              />
            )}

            {/* Heart reaction badge when clicked */}
            <AnimatePresence>
              {isPetPetting && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.5 }}
                  animate={{ opacity: 1, y: -30, scale: 1.3 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute -top-4 right-2 pointer-events-none z-20"
                >
                  <Heart className="w-8 h-8 text-rose-500 fill-rose-500 drop-shadow-lg" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Traveler & Pet Name + Level Pill (Separated) */}
          <div className="flex items-center gap-2 mt-2.5">
            <span className="text-base font-black text-zinc-900 dark:text-white tracking-tight">
              {activeMember?.pet_name || 'Compañero'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#ff3b68] text-white shadow-sm">
              Nv. {activeMember?.pet_level || 1}
            </span>
          </div>

          {/* Subdued Status Text Underneath */}
          <div className="mt-1 text-xs font-bold text-zinc-500 dark:text-zinc-400">
            <span>Estado: <strong className="text-zinc-700 dark:text-zinc-200">{currentStateMeta.label}</strong></span>
          </div>
        </div>

        {/* Fixed Floating Itinerary Action Card (Always Navigates to Itinerary) */}
        <div className="relative z-10 bg-white/95 dark:bg-[#151926]/95 light:bg-white rounded-2xl p-3.5 sm:p-4 shadow-md border border-zinc-200 dark:border-[#21283b] flex items-center justify-between gap-3 mt-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#ff3b68]">
              <Compass className="w-3.5 h-3.5" />
              <span>Itinerario del Día</span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white truncate mt-0.5">
              {activeDay?.city ? `Explorando ${activeDay.city}` : 'Plan de Viaje'}
            </h4>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              {formatFriendlyDate(activeDay?.date_str) || 'Hoy'} • {(activeDay?.places || []).length} paradas programadas
            </p>
          </div>

          <button
            onClick={() => {
              if (onSelectItineraryDay) onSelectItineraryDay(todayDayIndex);
              onNavigateTab('itinerary');
            }}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#ff3b68] to-orange-500 hover:from-[#e02854] hover:to-orange-400 text-white shadow-lg shadow-[#ff3b68]/30 flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Ver itinerario"
            aria-label="Ver itinerario"
          >
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 2. SECTION: WHAT'S NEXT (¿Qué es lo que sigue?) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#ff3b68]" /> ¿Qué es lo que sigue?
          </span>
          <span className="text-[10px] font-bold text-zinc-400">
            {activeDay?.city || 'En ruta'}
          </span>
        </div>

        {/* Primary Next Item Card */}
        {nextUnvisitedPlace ? (
          <div className="p-4 rounded-3xl bg-white dark:bg-[#131722] border border-zinc-200 dark:border-[#21283b] shadow-md hover:shadow-lg transition-all">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ff3b68]/10 text-[#ff3b68] border border-[#ff3b68]/20">
                <MapPin className="w-3 h-3" /> Siguiente Parada
              </span>
              <span className="text-[11px] font-bold text-zinc-400">
                {formatFriendlyDate(activeDay?.date_str) || 'Hoy'}
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 leading-snug">
              {nextUnvisitedPlace.name}
            </h4>
            
            {nextUnvisitedPlace.category && (
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
                {nextUnvisitedPlace.category} • {activeDay?.city || 'Ciudad'}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
              {nextUnvisitedPlace.maps_url ? (
                <a
                  href={nextUnvisitedPlace.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#ff3b68]" />
                  <span>Cómo llegar</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              ) : (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nextUnvisitedPlace.name} ${activeDay?.city || ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#ff3b68]" />
                  <span>Cómo llegar</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              )}

              <button
                onClick={() => {
                  if (onSelectItineraryDay) onSelectItineraryDay(todayDayIndex);
                  onNavigateTab('itinerary');
                }}
                className="px-3.5 py-2 rounded-xl bg-[#ff3b68] hover:bg-[#e02854] text-white text-xs font-black flex items-center gap-1 shadow-md shadow-[#ff3b68]/20 transition-all cursor-pointer"
              >
                <span>Ver día</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : nextTransit ? (
          <div className="p-4 rounded-3xl bg-white dark:bg-[#131722] border border-zinc-200 dark:border-[#21283b] shadow-md hover:shadow-lg transition-all">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/25">
                {nextTransit.type === 'train' ? <Train className="w-3 h-3" /> : <Plane className="w-3 h-3" />}
                Próximo Traslado
              </span>
              <span className="text-[11px] font-bold text-zinc-400">
                {formatFriendlyDate(nextTransit.date_str) || 'Pronto'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 mt-1">
              <div>
                <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                  {nextTransit.origin} ➔ {nextTransit.destination}
                </span>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Salida: {nextTransit.origin_time || '--:--'} • {nextTransit.notes || (nextTransit.type === 'train' ? 'Tren Alta Velocidad' : 'Vuelo')}
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('itinerary')}
                className="p-2.5 rounded-xl bg-[#ff3b68] text-white hover:bg-[#e02854] shadow-md shadow-[#ff3b68]/20 transition-all cursor-pointer flex-shrink-0"
                title="Ver billetes en itinerario"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/25 shadow-sm text-center">
            <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-500 mb-1" />
            <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
              ¡Todas las visitas de hoy completadas!
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Es un buen momento para una cena deliciosa o prepararse para la Gala Nocturna.
            </p>
            <button
              onClick={() => onNavigateTab('games', 'closing')}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Abrir Gala Nocturna</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. QUICK STATS AT A GLANCE (3 Cards) */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Places Card */}
        <button
          onClick={() => onNavigateTab('itinerary')}
          className="p-3 rounded-2xl bg-white dark:bg-[#131722] border border-zinc-200 dark:border-[#21283b] text-left hover:border-[#ff3b68]/50 transition-all cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#ff3b68]">
            <MapPin className="w-4 h-4" />
            <span className="text-[10px] font-black">{placesPercent}%</span>
          </div>
          <div className="mt-2">
            <span className="text-base font-black text-zinc-900 dark:text-white block leading-tight">
              {visitedPlaces}/{totalPlaces}
            </span>
            <span className="text-[10px] font-bold text-zinc-400">
              Lugares
            </span>
          </div>
        </button>

        {/* Bingo Card */}
        <button
          onClick={() => onNavigateTab('games', 'bingo')}
          className="p-3 rounded-2xl bg-white dark:bg-[#131722] border border-zinc-200 dark:border-[#21283b] text-left hover:border-amber-500/50 transition-all cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-amber-500">
            <Utensils className="w-4 h-4" />
            <span className="text-[10px] font-black">{totalBingo > 0 ? Math.round((completedBingo / totalBingo) * 100) : 0}%</span>
          </div>
          <div className="mt-2">
            <span className="text-base font-black text-zinc-900 dark:text-white block leading-tight">
              {completedBingo}/{totalBingo}
            </span>
            <span className="text-[10px] font-bold text-zinc-400">
              Platos Bingo
            </span>
          </div>
        </button>

        {/* Expenses Card */}
        <button
          onClick={() => onNavigateTab('expenses')}
          className="p-3 rounded-2xl bg-white dark:bg-[#131722] border border-zinc-200 dark:border-[#21283b] text-left hover:border-teal-500/50 transition-all cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-teal-400">
            <Wallet className="w-4 h-4" />
            <span className="text-[10px] font-black">{currency}</span>
          </div>
          <div className="mt-2">
            <span className="text-base font-black text-zinc-900 dark:text-white block leading-tight truncate">
              {totalExpenses.toFixed(0)}{currency}
            </span>
            <span className="text-[10px] font-bold text-zinc-400">
              Gastos
            </span>
          </div>
        </button>
      </div>

      {/* 4. SECTION: JUEGOS EN FAMILIA (Compact Cards + Full-Width Gala Banner) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5 text-[#ff3b68]" /> Juegos en Familia
          </span>
          <button
            onClick={() => onNavigateTab('games')}
            className="text-[11px] font-bold text-[#ff3b68] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            Ver todos <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* 2-Column Grid for Primary Games + Horizontal Banner for Gala */}
        <div className="grid grid-cols-2 gap-2.5">
          {primaryGames.map((g) => {
            const IconComponent = g.icon;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => onNavigateTab('games', g.id)}
                className={`p-3 rounded-2xl bg-gradient-to-br ${g.bgGrad} bg-white dark:bg-[#131722] border ${g.borderColor} text-left hover:scale-[1.01] transition-all cursor-pointer shadow-sm relative overflow-hidden group`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: g.color }}
                  >
                    <IconComponent className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <span 
                    className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full truncate max-w-[90px]"
                    style={{ backgroundColor: `${g.color}20`, color: g.color }}
                  >
                    {g.tag}
                  </span>
                </div>

                <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate">
                  {g.title}
                </h4>

                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-black" style={{ color: g.color }}>
                  <span>Jugar</span>
                  <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}

          {/* 5. GALA NOCTURNA: Full-Width Horizontal Card (Spans both columns) */}
          <button
            type="button"
            onClick={() => onNavigateTab('games', 'closing')}
            className="col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent bg-white dark:bg-[#131722] border border-amber-500/35 text-left hover:scale-[1.01] transition-all cursor-pointer shadow-sm flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-black flex items-center justify-center shadow-md flex-shrink-0">
                <Crown className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100">
                    Gala Nocturna
                  </h4>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    Fin de Jornada
                  </span>
                </div>
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  Votaciones familiares, anécdotas del día y premiaciones
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400 flex-shrink-0">
              <span className="hidden sm:inline">Votar ahora</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
}

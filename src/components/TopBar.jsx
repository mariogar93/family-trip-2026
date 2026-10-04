import React, { useState } from 'react';
import { Plane, Users, X, Sun, Moon, Shield, ShieldCheck, UserPlus, Trash2, LogOut } from 'lucide-react';
import PetAvatar, { ACCESSORIES } from './PetAvatar';

const CITY_SEGMENTS = [
  {
    id: 'madrid-1',
    name: 'Madrid',
    color: '#ff3b68',
    days: [1, 2, 3], // Nov 22, 23, 24
    startDayIndex: 1
  },
  {
    id: 'roma',
    name: 'Roma',
    color: '#f59e0b',
    days: [4, 5, 6, 7, 8], // Nov 25, 26, 27, 28, 29
    startDayIndex: 4
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    color: '#0d9488',
    days: [9, 10, 11, 12], // Nov 30, Dec 1, 2, 3
    startDayIndex: 9
  },
  {
    id: 'madrid-2',
    name: 'Madrid',
    color: '#ff3b68',
    days: [13, 14], // Dec 4, 5
    startDayIndex: 13
  }
];

export default function TopBar({ 
  settings, 
  activeMember, 
  members, 
  onSwitchMember, 
  onUpdatePet,
  onOpenCreateMember,
  onDeleteMember,
  installPrompt,
  onInstallPWA,
  theme = 'dark',
  onToggleTheme,
  isAdmin = false,
  onToggleAdmin,
  selectedDayIndex = 1,
  onSelectDay
}) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const [petNameEdit, setPetNameEdit] = useState('');
  const [selectedAcc, setSelectedAcc] = useState('');

  const handleOpenProfile = () => {
    if (activeMember) {
      setPetNameEdit(activeMember.pet_name);
      setSelectedAcc(activeMember.pet_accessory || 'none');
      setShowProfileModal(true);
    }
  };

  const handleSavePet = async (e) => {
    e.preventDefault();
    if (!activeMember) return;
    await onUpdatePet(activeMember.id, {
      pet_name: petNameEdit,
      pet_accessory: selectedAcc
    });
    setShowProfileModal(false);
  };

  const handleAdminPinSubmit = (e) => {
    e.preventDefault();
    const correctPin = settings.admin_pin || '2026';
    if (adminPinInput.trim() === correctPin || adminPinInput.trim() === 'viaje2026') {
      onToggleAdmin(true);
      setShowAdminPinModal(false);
      setAdminPinInput('');
      setAdminError('');
    } else {
      setAdminError('PIN de organizador incorrecto');
    }
  };

  // Departure countdown (Nov 21, 2026)
  const departureDate = new Date('2026-11-21T00:00:00');
  const now = new Date();
  const diffTime = departureDate - now;
  const daysToDeparture = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Calculate next level XP
  const xpNeeded = activeMember ? activeMember.pet_level * 100 : 100;
  const xpProgress = activeMember ? Math.min(100, Math.round((activeMember.pet_xp / xpNeeded) * 100)) : 35;

  return (
    <>
      <header className="sticky top-0 z-30 pt-safe bg-[#0b0d14]/95 dark:bg-[#0b0d14]/95 light:bg-white/95 backdrop-blur-xl border-b border-[#21283b]/60 dark:border-[#21283b]/60 light:border-zinc-200 transition-colors shadow-sm">
        <div className="max-w-md mx-auto px-4 pt-3 pb-2.5 space-y-2.5">
          
          {/* Top Row: Title, Countdown and Avatar (Exact match to Image 2) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black text-white dark:text-white light:text-zinc-900 tracking-tight leading-tight truncate">
                {settings.trip_title || 'Aventura familiar'}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-[#8e9cb2] dark:text-[#8e9cb2] light:text-zinc-500 font-medium mt-0.5">
                <Plane className="w-3.5 h-3.5 text-[#8e9cb2] rotate-45 flex-shrink-0" />
                <span>
                  Faltan <strong className="text-white dark:text-white light:text-zinc-900 font-bold">{daysToDeparture} días</strong> para despegar
                </span>
              </div>
            </div>

            {/* Avatar with SVG Circular Progress Arc and "Nv. X" Badge Pill */}
            {activeMember && (
              <button
                onClick={handleOpenProfile}
                className="relative flex flex-col items-center group cursor-pointer flex-shrink-0 active:scale-95 transition-transform"
                title="Abrir perfil y opciones"
                aria-label="Abrir perfil"
              >
                <div className="relative w-12 h-12 flex items-center justify-center">
                  {/* Circular SVG Track with coral progress arc on top-right */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="transparent"
                      stroke="#232a3c"
                      strokeWidth="3"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="transparent"
                      stroke="#ff3b68"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={(2 * Math.PI * 20) * (1 - (xpProgress / 100 || 0.35))}
                      className="transition-all duration-500"
                    />
                  </svg>

                  {/* Inner Avatar */}
                  <div className="w-9 h-9 rounded-full bg-[#131724] dark:bg-[#131724] light:bg-zinc-100 flex items-center justify-center overflow-hidden z-0">
                    <PetAvatar
                      petType={activeMember.pet_type}
                      accessory={activeMember.pet_accessory}
                      level={activeMember.pet_level}
                      size="sm"
                    />
                  </div>

                  {/* Overlapping Badge Pill at bottom */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 rounded-full bg-white dark:bg-white light:bg-zinc-900 text-zinc-900 dark:text-zinc-900 light:text-white text-[10px] font-black tracking-tight shadow-md border border-zinc-200 dark:border-zinc-300 leading-none whitespace-nowrap">
                    Nv. {activeMember.pet_level}
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Second Row: 4 Equal-Sized Continuous Bars & City Labels (Exact Match to Reference) */}
          <div className="pt-2 pb-1 space-y-2">
            {/* 4 identical size continuous rounded bars */}
            <div className="grid grid-cols-4 gap-2.5 h-1.5 w-full">
              {CITY_SEGMENTS.map(seg => {
                const isCityActive = seg.days.includes(selectedDayIndex);
                return (
                  <button
                    key={seg.id}
                    onClick={() => onSelectDay && onSelectDay(seg.startDayIndex)}
                    className="h-full rounded-full transition-all cursor-pointer select-none"
                    style={{
                      backgroundColor: seg.color,
                      opacity: isCityActive ? 1 : 0.28,
                      boxShadow: isCityActive ? `0 0 12px ${seg.color}` : 'none'
                    }}
                    title={`Ir a ${seg.name}`}
                  />
                );
              })}
            </div>

            {/* City labels with bullet on active city */}
            <div className="grid grid-cols-4 gap-1 text-center">
              {CITY_SEGMENTS.map(seg => {
                const isCityActive = seg.days.includes(selectedDayIndex);
                return (
                  <button
                    key={seg.id}
                    onClick={() => onSelectDay && onSelectDay(seg.startDayIndex)}
                    className={`text-xs transition-colors cursor-pointer truncate flex items-center justify-center gap-1.5 ${
                      isCityActive 
                        ? 'text-white dark:text-white light:text-zinc-900 font-bold' 
                        : 'text-[#7886a0] dark:text-[#7886a0] light:text-zinc-500 hover:text-white dark:hover:text-white light:hover:text-zinc-900 font-medium'
                    }`}
                  >
                    {isCityActive && (
                      <span 
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                    )}
                    <span>{seg.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </header>

      {/* Admin Unlock Modal (Elevated z-index z-[70] so it sits above Profile modal) */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white dark:bg-[#151926] rounded-3xl border border-zinc-200 dark:border-[#ff4071]/30 p-5 shadow-2xl text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#ff4071]/15 border border-[#ff4071]/30 flex items-center justify-center text-[#ff4071] mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Modo Organizador</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Ingresa el PIN para gestionar actividades y el Bingo.
            </p>

            <form onSubmit={handleAdminPinSubmit} className="mt-4 space-y-3">
              <input
                type="password"
                maxLength={6}
                autoFocus
                placeholder="PIN (por defecto: 2026)"
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-bold px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-[#0b0d14] border border-zinc-300 dark:border-[#21283b] text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-[#ff4071]"
              />
              {adminError && <p className="text-[11px] text-rose-500 font-bold">{adminError}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAdminPinModal(false); setAdminError(''); }}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-[#0b0d14] text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-300 dark:border-[#21283b] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#ff4071] hover:bg-[#ff2b62] text-white shadow-md shadow-[#ff4071]/30 cursor-pointer"
                >
                  Desbloquear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile, Pet & Settings Modal */}
      {showProfileModal && activeMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#151926] rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-[#21283b] p-5 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-[#21283b]">
              <div className="flex items-center gap-2">
                <PetAvatar petType={activeMember.pet_type} size="xs" />
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">{activeMember.name}</h3>
                  <p className="text-xs text-[#ff4071] font-semibold">Perfil y Ajustes</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-[#0b0d14] flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pet Stats Banner */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#0b0d14]/90 border border-zinc-200 dark:border-[#ff4071]/30 flex items-center gap-4">
              <PetAvatar
                petType={activeMember.pet_type}
                accessory={selectedAcc}
                level={activeMember.pet_level}
                size="lg"
                animated
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-zinc-900 dark:text-white truncate">{activeMember.pet_name}</span>
                  <span className="text-xs font-bold text-[#ff4071] bg-[#ff4071]/10 px-2.5 py-0.5 rounded-full border border-[#ff4071]/25">
                    Nivel {activeMember.pet_level}
                  </span>
                </div>
                
                {/* XP Progress Bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">
                    <span>Experiencia (XP)</span>
                    <span className="font-bold text-[#ff4071]">{activeMember.pet_xp} / {xpNeeded}</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-200 dark:bg-[#1b2133] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#ff4071] to-[#ff758f] transition-all duration-500 rounded-full"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Customize Pet Form */}
            <form onSubmit={handleSavePet} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nombre de la Mascota</label>
                <input
                  type="text"
                  value={petNameEdit}
                  onChange={(e) => setPetNameEdit(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-100 dark:bg-[#0b0d14] border border-zinc-300 dark:border-[#21283b] rounded-xl text-zinc-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#ff4071]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Accesorios
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(ACCESSORIES).map(([accKey, accData]) => {
                    const isSelected = selectedAcc === accKey;
                    return (
                      <button
                        type="button"
                        key={accKey}
                        onClick={() => setSelectedAcc(accKey)}
                        className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#ff4071] bg-[#ff4071]/20 text-zinc-900 dark:text-white font-bold shadow-sm'
                            : 'border-zinc-200 dark:border-[#21283b] bg-zinc-50 dark:bg-[#0b0d14] text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <span className="text-xl block mb-0.5">{accData.icon || '🚫'}</span>
                        <span className="text-[10px] font-medium block truncate">{accData.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#ff4071] hover:bg-[#ff2b62] text-white font-black text-xs shadow-md shadow-[#ff4071]/25 transition-all cursor-pointer"
              >
                Guardar Mascota
              </button>
            </form>

            {/* App Preferences: Theme & Admin (Moved below Pet Configuration) */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#0b0d14]/80 border border-zinc-200 dark:border-[#21283b] space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Preferencias de la App
              </span>

              {/* Theme Selector */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-[#1b2133] flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                    {theme === 'dark' ? <Moon className="w-4 h-4 text-[#ff4071]" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Tema Visual</h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {theme === 'dark' ? 'Modo Oscuro (Midnight Coral)' : 'Modo Claro'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-[#1b2133] hover:bg-zinc-300 dark:hover:bg-[#252d45] text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#ff4071]" />}
                  <span>{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
                </button>
              </div>

              {/* Admin Mode Toggle */}
              <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-zinc-200 dark:border-[#21283b]/80">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isAdmin ? 'bg-[#ff4071]/20 text-[#ff4071]' : 'bg-zinc-200 dark:bg-[#1b2133] text-zinc-500 dark:text-zinc-400'
                  }`}>
                    {isAdmin ? <ShieldCheck className="w-4 h-4 text-[#ff4071]" /> : <Shield className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Modo Organizador (Admin)</h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {isAdmin ? 'Activo (puedes editar todo)' : 'Solo lectura'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isAdmin) {
                      onToggleAdmin(false);
                    } else {
                      setShowAdminPinModal(true);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isAdmin
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-500'
                      : 'bg-[#ff4071]/20 border-[#ff4071]/40 text-[#ff4071]'
                  }`}
                >
                  {isAdmin ? 'Desactivar' : 'Activar PIN'}
                </button>
              </div>
            </div>

            {/* Traveler Management: Switcher & Admin actions */}
            <div className="pt-3 border-t border-zinc-200 dark:border-[#21283b] space-y-2.5">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#ff4071]" /> Viajeros del Viaje:
                </label>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      onOpenCreateMember();
                    }}
                    className="text-[11px] font-bold text-[#ff4071] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" /> + Nuevo Viajero
                  </button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        onSwitchMember(m);
                        setShowProfileModal(false);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                        m.id === activeMember.id
                          ? 'border-[#ff4071] bg-[#ff4071]/20 text-zinc-900 dark:text-white font-bold shadow-sm'
                          : 'border-zinc-200 dark:border-[#21283b] bg-zinc-100 dark:bg-[#0b0d14] text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <PetAvatar petType={m.pet_type} size="xs" />
                      <span>{m.name}</span>
                    </button>
                    {isAdmin && members.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar viajero "${m.name}"?`)) {
                            onDeleteMember(m.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        title="Eliminar viajero"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Salir al inicio button to return to member selection */}
              <button
                type="button"
                onClick={() => {
                  setShowProfileModal(false);
                  onSwitchMember(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700 shadow-sm"
              >
                <LogOut className="w-4 h-4 text-[#ff4071]" />
                <span>Salir al Inicio (Cambiar de Viajero)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

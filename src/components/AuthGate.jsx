import React, { useState } from 'react';
import { 
  Lock, 
  Sparkles, 
  UserPlus, 
  KeyRound, 
  ChevronRight, 
  Check, 
  Zap, 
  Heart, 
  Compass, 
  Sparkle, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Users, 
  LogOut 
} from 'lucide-react';
import PetAvatar, { PET_DATA } from './PetAvatar';

export default function AuthGate({ 
  isAuthenticated, 
  onAuthenticate, 
  onLogoutFamily,
  members, 
  activeMember, 
  onSelectMember, 
  onCreateMember, 
  onDeleteMember,
  showCreateModalExplicit = false,
  onCloseCreateModal,
  children 
}) {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(showCreateModalExplicit);

  // Sync with prop
  React.useEffect(() => {
    if (showCreateModalExplicit) {
      setShowAddMember(true);
    }
  }, [showCreateModalExplicit]);

  const takenPets = (members || []).map(m => m.pet_type);

  // New member form state (Name + Pet)
  const [newName, setNewName] = useState('');
  const [newPetType, setNewPetType] = useState('koala');
  const [newPetName, setNewPetName] = useState('');

  // Auto-pick the first available (untaken) pet
  React.useEffect(() => {
    if (takenPets.includes(newPetType) || !newPetType) {
      const firstFree = Object.keys(PET_DATA).find(k => !takenPets.includes(k));
      if (firstFree) setNewPetType(firstFree);
    }
  }, [members, showAddMember, showCreateModalExplicit]);

  // Handle Family Passcode Submit
  const handlePasscodeSubmit = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onAuthenticate();
      } else {
        setError(data.message || 'Contraseña incorrecta. Consulta con el organizador del viaje.');
      }
    } catch (err) {
      setError('Error al verificar contraseña. Revisa la conexión.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Create Member
  const handleCreateMember = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (takenPets.includes(newPetType)) {
      setError('Esa mascota ya fue elegida por otro familiar. Por favor elige otra diferente.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const selectedPet = PET_DATA[newPetType] || PET_DATA.koala;
      await onCreateMember({
        name: newName.trim(),
        avatar: '', // Removed traveler icon
        pet_type: newPetType,
        pet_name: newPetName.trim() || `${selectedPet.name.split(' ')[0]} de ${newName.trim()}`,
      });
      setShowAddMember(false);
      setNewName('');
      setNewPetName('');
      if (onCloseCreateModal) onCloseCreateModal();
    } catch (err) {
      setError('Error al crear perfil');
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: Family Gate Lock
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-black">
        <div className="w-full max-w-sm glass-panel rounded-3xl p-6 md:p-8 text-center shadow-2xl border border-emerald-500/20 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-[0_0_24px_rgba(16,185,129,0.35)]">
            <div className="w-full h-full bg-black/90 rounded-[22px] flex items-center justify-center text-4xl">
              ✈️
            </div>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">Aventura Familiar 2026</h1>
          <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mt-1">Portal Privado de Viaje</p>
          <p className="text-sm text-zinc-400 mt-3">
            Ingresa la contraseña familiar para acceder al itinerario, bingo de comidas y retos.
          </p>

          <form onSubmit={handlePasscodeSubmit} className="mt-6 space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoCapitalize="none"
                placeholder="Contraseña familiar"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3.5 pl-11 pr-11 bg-zinc-900 border border-zinc-700 rounded-2xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
              />
              <KeyRound className="w-5 h-5 text-emerald-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 rounded-xl p-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Entrar al Viaje
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Exclusivo para los viajeros de la familia</span>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Character Creation or Profile Picker
  const needsMemberSetup = !activeMember || members.length === 0 || showCreateModalExplicit || showAddMember;

  if (needsMemberSetup) {
    const isFirstTime = members.length === 0;
    const currentSelectedPet = PET_DATA[newPetType] || PET_DATA.koala;

    // Character Creation Form: JUST NAME & PET
    if (showAddMember || isFirstTime) {
      return (
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-3 sm:p-4 selection:bg-emerald-500 selection:text-black">
          <div className="w-full max-w-md bg-zinc-950/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 border border-emerald-500/30 shadow-2xl max-h-[92vh] overflow-y-auto">
            
            {/* Header with back button to picker if members exist */}
            <div className="relative text-center mb-4">
              {!isFirstTime && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMember(false);
                    if (onCloseCreateModal) onCloseCreateModal();
                  }}
                  className="absolute left-0 top-0 p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  title="Volver a lista de perfiles"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Perfiles</span>
                </button>
              )}
              <div className="inline-flex p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
                <Sparkle className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isFirstTime ? '¡Crea el Primer Perfil de Viajero!' : 'Nuevo Integrante del Viaje'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                {isFirstTime
                  ? 'Sé el primero en unirte a la aventura familiar. Escribe tu nombre y elige tu mascota de viaje.'
                  : 'Escribe tu nombre y elige la Mascota de Viaje única que te acompañará.'}
              </p>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              {/* Name input */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Tu Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sofía, Carlos, Mateo..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                />
              </div>

              {/* RPG Pet Selection Grid */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-400" /> Elige tu Mascota (Única)
                  </label>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {currentSelectedPet.badge}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PET_DATA).map(([typeKey, data]) => {
                    const isSelected = newPetType === typeKey;
                    const isTaken = takenPets.includes(typeKey);
                    const owner = isTaken ? members.find(m => m.pet_type === typeKey)?.name : null;

                    return (
                      <button
                        type="button"
                        key={typeKey}
                        disabled={isTaken}
                        onClick={() => !isTaken && setNewPetType(typeKey)}
                        className={`p-2 rounded-2xl text-center border transition-all relative ${
                          isTaken
                            ? 'opacity-40 border-zinc-800 bg-zinc-950/70 cursor-not-allowed'
                            : isSelected
                              ? 'border-emerald-400 bg-emerald-500/15 shadow-[0_0_14px_rgba(16,185,129,0.25)] scale-[1.03] cursor-pointer'
                              : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 cursor-pointer'
                        }`}
                        title={isTaken ? `Elegido por ${owner}` : data.name}
                      >
                        <span className="text-3xl block mb-1">{data.emoji}</span>
                        <div className="text-[11px] font-black text-white truncate">{data.name.split(' ')[0]}</div>
                        {isTaken ? (
                          <div className="text-[9px] font-bold text-amber-400 truncate mt-0.5">
                            🔒 {owner}
                          </div>
                        ) : (
                          <div className="text-[9px] text-zinc-400 truncate">{data.name.split(' ')[1] || ''}</div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Pet Preview */}
                <div className="mt-3 p-3 rounded-2xl bg-zinc-900/80 border border-emerald-500/25 flex items-center gap-3">
                  <PetAvatar
                    petType={newPetType}
                    level={1}
                    size="md"
                    animated
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white truncate">{currentSelectedPet.name}</span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {currentSelectedPet.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">
                      {currentSelectedPet.description}
                    </p>

                    <div className="mt-1.5 grid grid-cols-3 gap-1.5 text-[9px] font-bold text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 text-amber-400" />
                        <span>{currentSelectedPet.stats.energia}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-2.5 h-2.5 text-rose-400" />
                        <span>{currentSelectedPet.stats.apetito}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Compass className="w-2.5 h-2.5 text-cyan-400" />
                        <span>{currentSelectedPet.stats.curiosidad}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pet Name input */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Nombre de tu Mascota (opcional)</label>
                <input
                  type="text"
                  placeholder={`Ej. ${currentSelectedPet.name.split(' ')[0]}, Bolita, Capitán...`}
                  value={newPetName}
                  onChange={(e) => setNewPetName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                />
              </div>

              {/* Form buttons */}
              <div className="flex gap-2 pt-2">
                {!isFirstTime && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMember(false);
                      if (onCloseCreateModal) onCloseCreateModal();
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-700 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    ← Volver a Perfiles
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> {isFirstTime ? '¡Comenzar Aventura!' : 'Guardar Viajero'}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Traveler Picker Screen
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-black">
        <div className="w-full max-w-md bg-zinc-950/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-emerald-500/25">
          <div className="text-center mb-6">
            <span className="text-4xl">👋</span>
            <h2 className="text-2xl font-black text-white mt-2">¿Quién está usando la app?</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Selecciona tu perfil de viajero o crea uno nuevo para unirte al viaje.
            </p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="w-full glass-panel-interactive rounded-2xl p-3.5 flex items-center justify-between group border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900 cursor-pointer transition-all active:scale-[0.99]"
                  onClick={() => onSelectMember(member)}
                >
                  <div className="flex items-center gap-3">
                    <PetAvatar petType={member.pet_type} accessory={member.pet_accessory} level={member.pet_level} size="sm" />
                    <div className="text-left">
                      <div className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
                        {member.name}
                      </div>
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold">{member.pet_name}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-zinc-400">Nv. {member.pet_level || 1} ({member.pet_xp || 0} XP)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-emerald-400 transition-colors">
                    <span>Entrar</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAddMember(true)}
              className="w-full mt-4 py-3.5 px-4 rounded-2xl border border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> + Crear Nuevo Perfil de Viajero
            </button>

            {onLogoutFamily && (
              <div className="pt-3 border-t border-zinc-900 text-center">
                <button
                  type="button"
                  onClick={onLogoutFamily}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" /> Bloquear app / Cambiar contraseña
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return children;
}

import React, { useState, useEffect } from 'react';
import { Compass, Target, CloudRain, RefreshCw, Camera, Sparkles, Check, Users, Star, ArrowLeft, ArrowRight, Shield, List, X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function DailyMissionView({
  activeMember,
  isAdmin = false,
  selectedDayNumber = 1
}) {
  const [dayNumber, setDayNumber] = useState(selectedDayNumber);
  const [missionData, setMissionData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin All Missions Modal
  const [showAdminAllModal, setShowAdminAllModal] = useState(false);
  const [allMissionsList, setAllMissionsList] = useState([]);
  const [loadingAllMissions, setLoadingAllMissions] = useState(false);

  // Submissions modal & photo upload
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      setDayNumber(selectedDayNumber);
    }
  }, [selectedDayNumber, isAdmin]);

  const fetchMission = async (day) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/missions/daily/${day}`);
      const data = await res.json();
      setMissionData(data);
    } catch (err) {
      console.error('Error fetching mission', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMissionsAdmin = async () => {
    setLoadingAllMissions(true);
    try {
      const res = await fetch('/api/missions/all');
      const data = await res.json();
      setAllMissionsList(data.days || []);
    } catch (e) {
      console.error('Error fetching all missions', e);
    } finally {
      setLoadingAllMissions(false);
    }
  };

  useEffect(() => {
    fetchMission(dayNumber);
  }, [dayNumber]);

  useEffect(() => {
    if (showAdminAllModal) {
      fetchAllMissionsAdmin();
    }
  }, [showAdminAllModal]);

  const handleBreakSeal = async () => {
    try {
      const res = await fetch(`/api/missions/daily/${dayNumber}/open`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ff3b68', '#f59e0b', '#ffffff']
        });
        fetchMission(dayNumber);
      }
    } catch (e) {
      alert('Error al abrir la misión');
    }
  };

  const handleChangeMission = async () => {
    if (!window.confirm('¿Quieres cambiar la misión de hoy por otra alternativa? (Solo se puede cambiar una vez por día)')) return;
    try {
      const res = await fetch(`/api/missions/daily/${dayNumber}/change`, { method: 'POST' });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        fetchMission(dayNumber);
      }
    } catch (e) {
      alert('Error al cambiar la misión');
    }
  };

  const handleRainMode = async () => {
    if (!window.confirm('¿Activar modo de contingencia por lluvia? Se asignará un reto bajo techo.')) return;
    try {
      const res = await fetch(`/api/missions/daily/${dayNumber}/rain`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchMission(dayNumber);
      }
    } catch (e) {
      alert('Error al activar modo lluvia');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitPhoto = async (e) => {
    e.preventDefault();
    if (!photoFile || !activeMember) {
      alert('Por favor selecciona una foto');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      formData.append('member_id', activeMember.id);
      formData.append('note', note);

      const res = await fetch(`/api/missions/daily/${dayNumber}/submit`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 90,
          spread: 90,
          origin: { y: 0.65 },
          colors: ['#ff3b68', '#3b82f6', '#fbbf24']
        });
        setShowSubmitModal(false);
        setPhotoFile(null);
        setPreviewUrl('');
        setNote('');
        fetchMission(dayNumber);
      }
    } catch (err) {
      alert('Error al subir prueba de la misión');
    } finally {
      setSubmitting(false);
    }
  };

  const mission = missionData?.mission;
  const state = missionData?.state || { status: 'sealed', changed_count: 0, is_rain_mode: 0 };
  const submissions = missionData?.submissions || [];
  const hasSubmitted = submissions.some(s => s.member_id === activeMember?.id);

  return (
    <div className="space-y-3.5 pb-6">
      {/* Day Selector Bar */}
      <div className="flex items-center justify-between bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 p-2.5 px-3.5 rounded-2xl shadow-sm">
        {isAdmin ? (
          <>
            <button
              onClick={() => setDayNumber(prev => Math.max(1, prev - 1))}
              disabled={dayNumber <= 1}
              className="p-1.5 rounded-xl bg-zinc-800/60 dark:bg-zinc-800/60 light:bg-zinc-100 hover:bg-zinc-700 light:hover:bg-zinc-200 disabled:opacity-30 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 cursor-pointer"
              title="Día anterior"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#ff3b68] flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> Modo Admin (Día {dayNumber}/14)
              </span>
              <h3 className="text-xs font-black text-zinc-100 dark:text-zinc-100 light:text-zinc-900">
                Misión del Día {dayNumber}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setDayNumber(prev => Math.min(14, prev + 1))}
                disabled={dayNumber >= 14}
                className="p-1.5 rounded-xl bg-zinc-800/60 dark:bg-zinc-800/60 light:bg-zinc-100 hover:bg-zinc-700 light:hover:bg-zinc-200 disabled:opacity-30 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 cursor-pointer"
                title="Día siguiente"
              >
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowAdminAllModal(true)}
                className="p-1.5 rounded-xl bg-[#ff3b68]/15 hover:bg-[#ff3b68]/25 text-[#ff3b68] text-xs font-bold ml-1 cursor-pointer"
                title="Ver todas las misiones"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* Normal user mode: locked strictly to today's mission */
          <div className="w-full flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#ff3b68] block">
                Reto Familiar de Hoy
              </span>
              <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                Día {selectedDayNumber} del Viaje
              </h3>
            </div>

            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border ${
              state.status === 'sealed'
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                : 'bg-[#ff3b68]/10 text-[#ff3b68] border-[#ff3b68]/30 shadow-sm'
            }`}>
              {state.status === 'sealed' ? '🔒 Sellada' : '✨ En curso'}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500 animate-pulse">
          Cargando sobre de la misión... 📜
        </div>
      ) : (
        <>
          {/* WAX SEALED ENVELOPE (State: sealed) */}
          {state.status === 'sealed' ? (
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 rounded-3xl bg-gradient-to-b from-[#2a1b18] via-[#1a1210] to-[#0f0b0a] dark:from-[#2a1b18] dark:via-[#1a1210] dark:to-[#0f0b0a] light:from-[#fffdf7] light:via-[#fbf5e8] light:to-[#f5ebdb] border-2 border-amber-900/60 dark:border-amber-900/60 light:border-amber-300 shadow-2xl relative overflow-hidden text-center cursor-pointer group"
              onClick={handleBreakSeal}
            >
              {/* Paper texture overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

              <div className="my-3 flex justify-center">
                {/* 3D Wax Seal Stamp in Frambuesa/Crimson */}
                <motion.div
                  whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
                  whileTap={{ scale: 0.9 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff3b68] via-[#c9184a] to-[#800f2f] border-4 border-[#ff708f]/50 shadow-[0_0_30px_rgba(255,59,104,0.5)] flex flex-col items-center justify-center relative cursor-pointer"
                >
                  <div className="w-18 h-18 rounded-full border-2 border-dashed border-white/60 flex items-center justify-center flex-col">
                    <span className="text-xl">🎯</span>
                    <span className="text-[9px] font-black text-white uppercase tracking-widest mt-0.5">DÍA {dayNumber}</span>
                  </div>
                </motion.div>
              </div>

              <h2 className="text-base font-black text-amber-200 dark:text-amber-200 light:text-amber-950 mt-4">
                Misión Secreta de la Jornada
              </h2>
              <p className="text-xs text-amber-100/70 dark:text-amber-100/70 light:text-amber-900/80 max-w-xs mx-auto mt-1 leading-relaxed">
                El sobre está sellado con cera real. Toca el sello para abrir la misión que toda la familia deberá cumplir hoy.
              </p>

              <button
                type="button"
                onClick={handleBreakSeal}
                className="mt-5 px-5 py-2.5 rounded-2xl bg-[#ff3b68] hover:bg-[#e02854] text-white font-black text-xs shadow-lg shadow-[#ff3b68]/30 inline-flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Romper Sello y Revelar (+{mission?.xp_reward || 30} XP)</span>
              </button>
            </motion.div>
          ) : (
            /* OPENED ENVELOPE / REVEALED MISSION */
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-5 rounded-3xl bg-zinc-950/90 dark:bg-zinc-950/90 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 shadow-xl relative overflow-hidden"
            >
              {/* Rain mode pill indicator */}
              {state.is_rain_mode === 1 && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-blue-500/20 dark:bg-blue-500/20 light:bg-blue-50 border border-blue-500/40 dark:border-blue-500/40 light:border-blue-200 text-blue-400 dark:text-blue-300 light:text-blue-700 text-[10px] font-extrabold flex items-center gap-1">
                  <CloudRain className="w-3 h-3" /> Modo Lluvia Activado
                </div>
              )}

              {/* Mission Header without any icon box */}
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#ff3b68] bg-[#ff3b68]/10 dark:bg-[#ff3b68]/10 light:bg-rose-50 px-2 py-0.5 rounded-md border border-[#ff3b68]/20 light:border-rose-200">
                      {mission?.code} • {mission?.city || 'General'}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-0.5">
                      {[...Array(mission?.difficulty || 1)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      ))}
                    </span>
                  </div>

                  <h2 className="text-base font-black text-zinc-100 dark:text-zinc-100 light:text-zinc-900 mt-1">
                    {mission?.title}
                  </h2>
                </div>
              </div>

              {/* Mission Description */}
              <p className="text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mt-3 leading-relaxed bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-zinc-50 p-3 rounded-2xl border border-zinc-800/60 dark:border-zinc-800/60 light:border-zinc-200">
                {mission?.description}
              </p>

              {/* Mission Stats */}
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-[#ff3b68] font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Recompensa: +{mission?.xp_reward || 30} XP
                </span>

                <div className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-400 light:text-zinc-600 font-bold">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>{submissions.length} completados</span>
                </div>
              </div>

              {/* Action Buttons: Submit Photo, Rain contingency, Change */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full py-2.5 rounded-2xl bg-[#ff3b68] hover:bg-[#e02854] text-white font-black text-xs shadow-md shadow-[#ff3b68]/30 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>{hasSubmitted ? 'Subir otra foto del reto' : '¡Completar Misión con Foto!'}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleChangeMission}
                    disabled={state.changed_count >= 1}
                    className="flex-1 py-2 px-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/90 dark:hover:bg-zinc-700/90 disabled:opacity-40 text-zinc-800 dark:text-zinc-200 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer border border-zinc-300 dark:border-zinc-700 shadow-sm transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Cambiar ({state.changed_count >= 1 ? '0' : '1'}/1 hoy)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRainMode}
                    className="flex-1 py-2 px-2 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/15 dark:hover:bg-sky-500/25 text-sky-800 dark:text-sky-300 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer border border-sky-300 dark:border-sky-500/40 shadow-sm transition-colors"
                  >
                    <CloudRain className="w-3 h-3" />
                    <span>Hoy Llueve (Techo)</span>
                  </button>
                </div>
              </div>

              {/* Family submissions gallery for this mission */}
              {submissions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200">
                  <div className="text-[11px] font-black text-zinc-400 dark:text-zinc-400 light:text-zinc-600 uppercase tracking-wider mb-2">
                    Fotos del Equipo de Hoy ({submissions.length})
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {submissions.map((sub) => (
                      <div key={sub.id} className="relative rounded-2xl overflow-hidden flex-shrink-0 w-28 h-28 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 group shadow">
                        <img src={sub.photo_url} alt="Misión" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                          <span className="text-[10px] font-black text-white truncate">
                            {sub.member_name || 'Viajero'}
                          </span>
                          {sub.note && (
                            <span className="text-[8px] text-zinc-300 truncate">
                              "{sub.note}"
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </>
      )}

      {/* Admin All Missions Modal */}
      {showAdminAllModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-zinc-950 dark:bg-zinc-950 light:bg-white rounded-3xl border border-zinc-750 dark:border-zinc-700 light:border-zinc-200 p-4 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
              <div>
                <h3 className="text-sm font-black text-zinc-100 dark:text-zinc-100 light:text-zinc-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#ff3b68]" />
                  <span>Roadmap de Misiones (Admin)</span>
                </h3>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
                  Supervisa la misión asignada a cada día del viaje.
                </p>
              </div>
              <button
                onClick={() => setShowAdminAllModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-200 dark:hover:text-white light:hover:text-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 my-3 pr-1">
              {loadingAllMissions ? (
                <div className="p-8 text-center text-xs text-zinc-500">Cargando misiones...</div>
              ) : (
                allMissionsList.map(item => (
                  <div
                    key={item.day_number}
                    className="p-3 rounded-2xl bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 flex items-center justify-center text-xs font-black text-[#ff3b68] flex-shrink-0">
                        D{item.day_number}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-zinc-100 dark:text-zinc-100 light:text-zinc-900 truncate flex items-center gap-1.5">
                          <span>{item.mission?.title || 'Misión'}</span>
                          <span className="text-[9px] font-normal text-amber-400 bg-amber-500/10 px-1 rounded">
                            {item.city}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-400 light:text-zinc-600 truncate">
                          Código: <span className="font-bold text-zinc-300 dark:text-zinc-300 light:text-zinc-800">{item.mission?.code}</span> • {item.state?.status === 'sealed' ? '🔒 Sellada' : '✨ Abierta'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setDayNumber(item.day_number);
                        setShowAdminAllModal(false);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-zinc-300 text-zinc-200 dark:text-zinc-200 light:text-zinc-800 text-xs font-bold cursor-pointer flex-shrink-0"
                    >
                      Ver
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-950 dark:bg-zinc-950 light:bg-white rounded-3xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 p-5 shadow-2xl">
            <h3 className="text-base font-black text-zinc-100 dark:text-zinc-100 light:text-zinc-900 mb-1">
              Prueba de Misión 📸
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-3">
              Muestra cómo cumpliste el reto: <span className="text-[#ff3b68] font-bold">"{mission?.title}"</span>
            </p>

            <form onSubmit={handleSubmitPhoto} className="space-y-3">
              {previewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-[#ff3b68]/40 max-h-48 mx-auto">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPreviewUrl(''); }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="block p-5 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#ff3b68] bg-zinc-50 dark:bg-zinc-900/60 text-center cursor-pointer transition-colors">
                  <Camera className="w-8 h-8 mx-auto text-[#ff3b68] mb-1" />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Tomar o subir foto</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Abre la cámara de tu teléfono</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                </label>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mb-1">
                  Nota o anécdota (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Lo logramos justo frente al café..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-50 border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 rounded-xl text-zinc-100 dark:text-zinc-100 light:text-zinc-900 text-xs outline-none focus:ring-1 focus:ring-[#ff3b68]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2 rounded-xl border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !photoFile}
                  className="flex-1 py-2 rounded-xl bg-[#ff3b68] hover:bg-[#e02854] disabled:opacity-40 text-white font-black text-xs shadow-md shadow-[#ff3b68]/25 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Enviar (+{mission?.xp_reward || 30} XP)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

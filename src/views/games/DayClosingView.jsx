import React, { useState, useEffect } from 'react';
import { Trophy, Award, Heart, Smile, Utensils, Sparkles, Check, Users, Eye, Plus, Star, Crown, ChevronRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const FIXED_CATEGORIES = [
  { id: 'best_photo', label: 'Foto del Día', icon: '📸', desc: 'La mejor captura estética o emotiva' },
  { id: 'funniest', label: 'Momento más Gracioso', icon: '😂', desc: 'La risa o situación más cómica de la jornada' },
  { id: 'best_bite', label: 'Mejor Bocado', icon: '🍕', desc: 'La comida o postre insuperable de hoy' },
  { id: 'pillar', label: 'Pilar del Día', icon: '🛡️', desc: 'La persona con más paciencia, humor o energía' }
];

export default function DayClosingView({
  activeMember,
  members = [],
  isAdmin = false,
  selectedDayNumber = 1
}) {
  const [dayNumber, setDayNumber] = useState(selectedDayNumber);
  const [closingData, setClosingData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Nominate Modal
  const [showNominateModal, setShowNominateModal] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [nominationTitle, setNominationTitle] = useState('');
  const [submittingNomination, setSubmittingNomination] = useState(false);

  // Voting state
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [myVotes, setMyVotes] = useState({
    best_photo: null,
    funniest: null,
    best_bite: null,
    pillar: null,
    surprise: null,
    mission_winner: null
  });
  const [submittingVote, setSubmittingVote] = useState(false);

  const fetchClosing = async (day) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/closing/${day}`);
      const data = await res.json();
      setClosingData(data);
    } catch (e) {
      console.error('Error fetching closing data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosing(dayNumber);
  }, [dayNumber]);

  const handleNominate = async (e) => {
    e.preventDefault();
    if (!photoFile || !activeMember) {
      alert('Selecciona una foto para nominar');
      return;
    }

    setSubmittingNomination(true);
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      formData.append('member_id', activeMember.id);
      formData.append('title', nominationTitle || 'Foto del día');

      const res = await fetch(`/api/closing/${dayNumber}/nominate`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#ff3b68', '#f59e0b']
        });
        setShowNominateModal(false);
        setPhotoFile(null);
        setPreviewUrl('');
        setNominationTitle('');
        fetchClosing(dayNumber);
      } else {
        alert(data.error || 'Error al nominar foto');
      }
    } catch (err) {
      alert('Error al nominar foto');
    } finally {
      setSubmittingNomination(false);
    }
  };

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    if (!activeMember) return;

    setSubmittingVote(true);
    try {
      const res = await fetch(`/api/closing/${dayNumber}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voter_id: activeMember.id,
          votes: myVotes
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#ff3b68', '#fbbf24']
        });
        setShowVoteModal(false);
        fetchClosing(dayNumber);
      }
    } catch (err) {
      alert('Error al enviar votos');
    } finally {
      setSubmittingVote(false);
    }
  };

  const handleReveal = async () => {
    try {
      const res = await fetch(`/api/closing/${dayNumber}/reveal`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 150,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#ff3b68', '#10b981', '#ffffff']
        });
        fetchClosing(dayNumber);
      }
    } catch (e) {
      alert('Error al revelar resultados');
    }
  };

  const closing = closingData?.closing || { status: 'open', surprise_category: 'Mayor despiste del día' };
  const nominations = closingData?.nominations || [];
  const missionSubmissions = closingData?.missionSubmissions || [];
  const votes = closingData?.votes || [];
  const results = closingData?.results || {};

  const myNominationsCount = nominations.filter(n => n.member_id === activeMember?.id).length;
  const hasVoted = votes.some(v => v.voter_id === activeMember?.id);
  const isRevealed = closing.status === 'revealed' || closing.status === 'closed';

  return (
    <div className="space-y-3.5 pb-6">
      {/* Day Selector & Status */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 p-2 px-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 dark:text-amber-400">
              Gala Familiar de Cierre
            </span>
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
              Votaciones Día {dayNumber}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            isRevealed
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/35'
              : 'bg-[#ff3b68]/15 text-[#ff3b68] border-[#ff3b68]/35'
          }`}>
            {isRevealed ? '👑 Resultados Revelados' : '🗳️ Votación Abierta'}
          </span>
        </div>
      </div>

      {/* REVEALED RESULTS PODIUM */}
      {isRevealed ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-3"
        >
          <div className="p-4 rounded-3xl bg-gradient-to-b from-amber-500/15 via-white to-amber-50/50 dark:from-amber-500/15 dark:via-zinc-950/80 dark:to-zinc-950/90 border-2 border-amber-500/40 text-center shadow-xl">
            <div className="text-3xl mb-1">🎉</div>
            <h2 className="text-base font-black text-amber-600 dark:text-amber-300">
              ¡Ganadores de la Noche!
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              La familia ha hablado. ¡Felicitaciones a los coronados de hoy!
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Best Photo Winner */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-xl flex-shrink-0">
                📸
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black uppercase text-pink-600 dark:text-pink-400">Foto del Día</div>
                <div className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate">
                  {results.best_photo ? (results.best_photo.winner?.target_name || 'Foto con más votos') : 'Premio desierto'}
                </div>
              </div>
              <div className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                +50 XP 🏅
              </div>
            </div>

            {/* Funniest Moment */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-xl flex-shrink-0">
                😂
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black uppercase text-yellow-600 dark:text-yellow-400">Momento más Gracioso</div>
                <div className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate">
                  {results.funniest ? (results.funniest.winner?.target_name || 'Ganador') : 'Premio desierto'}
                </div>
              </div>
              <div className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                +50 XP 🏅
              </div>
            </div>

            {/* Best Bite */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-xl flex-shrink-0">
                🍕
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black uppercase text-red-600 dark:text-red-400">Mejor Bocado</div>
                <div className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate">
                  {results.best_bite ? (results.best_bite.winner?.target_name || 'Plato estrella') : 'Premio desierto'}
                </div>
              </div>
              <div className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                +50 XP 🏅
              </div>
            </div>

            {/* Pillar of the day */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-xl flex-shrink-0">
                🛡️
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">Pilar del Día</div>
                <div className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate">
                  {results.pillar ? (results.pillar.winner?.target_name || 'Miembro con más paciencia') : 'Premio desierto'}
                </div>
              </div>
              <div className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                +50 XP 🏅
              </div>
            </div>

            {/* Surprise Category */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950/90 border border-purple-200 dark:border-purple-500/30 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xl flex-shrink-0">
                ✨
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">{closing.surprise_category}</div>
                <div className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate">
                  {results.surprise ? (results.surprise.winner?.target_name || 'Ganador sorpresa') : 'Premio desierto'}
                </div>
              </div>
              <div className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                +50 XP 🏅
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* VOTING & NOMINATION MODE */
        <div className="space-y-3.5">
          {/* Action cards: Nominate & Vote */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setPhotoFile(null);
                setPreviewUrl('');
                setNominationTitle('');
                setShowNominateModal(true);
              }}
              disabled={myNominationsCount >= 2}
              className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 hover:border-[#ff3b68]/50 text-left transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">📸</span>
                <span className="text-[10px] font-bold text-[#ff3b68]">{myNominationsCount}/2 fotos</span>
              </div>
              <div className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                Nominar Foto
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Sube hasta 2 candidatas
              </div>
            </button>

            <button
              onClick={() => setShowVoteModal(true)}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-[#ff3b68]/10 via-white to-rose-50/30 dark:from-[#ff3b68]/20 dark:via-zinc-950/90 dark:to-zinc-950/90 border border-[#ff3b68]/35 text-left transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">🗳️</span>
                <span className="text-[10px] font-bold text-[#ff3b68]">
                  {hasVoted ? 'Modificar voto' : 'Pendiente'}
                </span>
              </div>
              <div className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                Emitir Voto Secreto
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                5 categorías + Misión
              </div>
            </button>
          </div>

          {/* Admin Reveal Button */}
          {isAdmin && (
            <button
              onClick={handleReveal}
              className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>Revelar Resultados de la Familia</span>
            </button>
          )}

          {/* Gallery of Today's Nominated Photos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs px-1 font-bold text-zinc-600 dark:text-zinc-400">
              <span>Fotos Nominadas para hoy ({nominations.length})</span>
            </div>

            {nominations.length === 0 ? (
              <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/60 text-center text-xs text-zinc-500">
                Aún no hay fotos nominadas. ¡Sé el primero en postular tu mejor foto de hoy!
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {nominations.map((nom) => (
                  <div key={nom.id} className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-square group shadow">
                    <img src={nom.photo_url} alt="Nominada" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-2.5">
                      <span className="text-xs font-black text-white truncate">{nom.title}</span>
                      <span className="text-[10px] text-zinc-300">Por {nom.member_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nominate Photo Modal */}
      {showNominateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl border border-[#ff3b68]/30 p-5 shadow-2xl">
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-1">
              Nominar Foto del Día 📸
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
              Postula una foto tomada hoy para que la familia vote en la gala nocturna.
            </p>

            <form onSubmit={handleNominate} className="space-y-3">
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
                  <Plus className="w-8 h-8 mx-auto text-[#ff3b68] mb-1" />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Elegir o tomar foto</span>
                  <input type="file" accept="image/*" capture="environment" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setPhotoFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }} className="hidden" />
                </label>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Título de la foto</label>
                <input
                  type="text"
                  placeholder="Ej: Atardecer en Plaza Mayor..."
                  value={nominationTitle}
                  onChange={(e) => setNominationTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNominateModal(false)}
                  className="flex-1 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs font-bold hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingNomination || !photoFile}
                  className="flex-1 py-2 rounded-xl bg-[#ff3b68] hover:bg-[#e02854] disabled:opacity-40 text-white font-black text-xs shadow-md shadow-[#ff3b68]/25 cursor-pointer"
                >
                  Nominar (+15 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secret Vote Modal */}
      {showVoteModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-700 p-4 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                Votación Secreta 🗳️
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Elige a tus favoritos para cada categoría de hoy.
              </p>
            </div>

            <form onSubmit={handleVoteSubmit} className="flex-1 overflow-y-auto space-y-3.5 my-3 pr-1">
              {/* 1. Best Photo */}
              <div>
                <label className="block text-xs font-black text-pink-600 dark:text-pink-400 mb-1">
                  📸 Foto del Día
                </label>
                <select
                  value={myVotes.best_photo?.target_id || ''}
                  onChange={(e) => {
                    const nom = nominations.find(n => n.id === Number(e.target.value));
                    setMyVotes(prev => ({
                      ...prev,
                      best_photo: nom ? { nominee_type: 'photo', target_id: nom.id, target_name: nom.title } : null
                    }));
                  }}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs"
                >
                  <option value="">Seleccionar foto nominada...</option>
                  {nominations.map(n => (
                    <option key={n.id} value={n.id}>{n.title} (por {n.member_name})</option>
                  ))}
                </select>
              </div>

              {/* 2. Funniest Member or Moment */}
              <div>
                <label className="block text-xs font-black text-yellow-600 dark:text-yellow-400 mb-1">
                  😂 Momento más Gracioso (Persona)
                </label>
                <select
                  value={myVotes.funniest?.target_name || ''}
                  onChange={(e) => {
                    setMyVotes(prev => ({
                      ...prev,
                      funniest: { nominee_type: 'person', target_name: e.target.value }
                    }));
                  }}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs"
                >
                  <option value="">Seleccionar persona más divertida hoy...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.name}>{m.avatar} {m.name}</option>
                  ))}
                </select>
              </div>

              {/* 3. Best Bite */}
              <div>
                <label className="block text-xs font-black text-red-600 dark:text-red-400 mb-1">
                  🍕 Mejor Bocado
                </label>
                <input
                  type="text"
                  placeholder="¿Qué comida o postre fue el mejor hoy?"
                  value={myVotes.best_bite?.target_name || ''}
                  onChange={(e) => {
                    setMyVotes(prev => ({
                      ...prev,
                      best_bite: { nominee_type: 'dish', target_name: e.target.value }
                    }));
                  }}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-1 focus:ring-[#ff3b68]"
                />
              </div>

              {/* 4. Pillar of the Day */}
              <div>
                <label className="block text-xs font-black text-blue-600 dark:text-blue-400 mb-1">
                  🛡️ Pilar de Paciencia y Espíritu
                </label>
                <select
                  value={myVotes.pillar?.target_name || ''}
                  onChange={(e) => {
                    setMyVotes(prev => ({
                      ...prev,
                      pillar: { nominee_type: 'person', target_name: e.target.value }
                    }));
                  }}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs"
                >
                  <option value="">Seleccionar miembro pilar...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.name}>{m.avatar} {m.name}</option>
                  ))}
                </select>
              </div>

              {/* 5. Rotating Surprise */}
              <div>
                <label className="block text-xs font-black text-purple-600 dark:text-purple-400 mb-1">
                  ✨ Sorpresa: {closing.surprise_category}
                </label>
                <select
                  value={myVotes.surprise?.target_name || ''}
                  onChange={(e) => {
                    setMyVotes(prev => ({
                      ...prev,
                      surprise: { nominee_type: 'person', target_name: e.target.value }
                    }));
                  }}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs"
                >
                  <option value="">Seleccionar miembro...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.name}>{m.avatar} {m.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVoteModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs font-bold hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingVote}
                  className="flex-1 py-2.5 rounded-xl bg-[#ff3b68] hover:bg-[#e02854] text-white font-black text-xs shadow-md shadow-[#ff3b68]/25 cursor-pointer"
                >
                  Confirmar Voto (+10 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

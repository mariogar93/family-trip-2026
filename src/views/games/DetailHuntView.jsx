import React, { useState, useEffect } from 'react';
import { Search, MapPin, Camera, Sparkles, Check, Users, Lock, Compass, Trophy, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const CITIES = ['Madrid', 'Roma', 'Barcelona'];
const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

export const EQUITABLE_5_LETTER_WORDS = [
  'VIAJE',
  'MUNDO',
  'PLAYA',
  'RUTAS',
  'FAROS',
  'MAPAS',
  'HOTEL',
  'BARCO',
  'VUELO',
  'AVION',
  'PLAZA',
  'FOTOS'
];

function getPersonalEquitableWord(member) {
  if (!member) return 'VIAJE';
  const idx = Math.abs(Number(member.id) || 0) % EQUITABLE_5_LETTER_WORDS.length;
  return EQUITABLE_5_LETTER_WORDS[idx];
}

export default function DetailHuntView({ activeMember, isAdmin = false }) {
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'alphabet'
  const [selectedCity, setSelectedCity] = useState('Madrid');

  // Personal equitable 5-letter word for each member
  const defaultWord = getPersonalEquitableWord(activeMember);
  const [customWord, setCustomWord] = useState(() => {
    return localStorage.getItem(`word_challenge_${activeMember?.id}`) || defaultWord;
  });

  useEffect(() => {
    const saved = localStorage.getItem(`word_challenge_${activeMember?.id}`);
    setCustomWord(saved || getPersonalEquitableWord(activeMember));
  }, [activeMember?.id]);

  const activeChallengeWord = (customWord || defaultWord).toUpperCase().slice(0, 5);
  const challengeLetters = activeChallengeWord.split('');

  // Details state
  const [details, setDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Alphabet state
  const [alphabetData, setAlphabetData] = useState({ entries: {}, claimedCount: 0, isViajeCompleted: false });
  const [loadingAlphabet, setLoadingAlphabet] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [wordHint, setWordHint] = useState('');

  // Upload modal state
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load details
  const fetchDetails = async (city) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/details/${city}`);
      const data = await res.json();
      setDetails(data.details || []);
    } catch (e) {
      console.error('Error fetching details', e);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Load alphabet
  const fetchAlphabet = async () => {
    setLoadingAlphabet(true);
    try {
      const res = await fetch('/api/alphabet');
      const data = await res.json();
      setAlphabetData(data);
    } catch (e) {
      console.error('Error fetching alphabet', e);
    } finally {
      setLoadingAlphabet(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'details') {
      fetchDetails(selectedCity);
    } else {
      fetchAlphabet();
    }
  }, [activeTab, selectedCity]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCompleteDetail = async (e) => {
    e.preventDefault();
    if (!selectedDetail || !photoFile || !activeMember) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('detail_id', selectedDetail.id);
      formData.append('member_id', activeMember.id);
      formData.append('photo', photoFile);

      const res = await fetch('/api/details/complete', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.65 },
          colors: ['#ff3b68', '#10b981', '#ffffff']
        });
        setSelectedDetail(null);
        setPhotoFile(null);
        setPreviewUrl('');
        fetchDetails(selectedCity);
      } else {
        alert(data.message || 'Error al reclamar detalle');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitLetter = async (e) => {
    e.preventDefault();
    if (!selectedLetter || !photoFile || !activeMember) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('letter', selectedLetter);
      formData.append('member_id', activeMember.id);
      formData.append('city', selectedCity);
      formData.append('word_hint', wordHint);
      formData.append('photo', photoFile);

      const res = await fetch('/api/alphabet/submit', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.65 },
          colors: ['#3b82f6', '#10b981', '#ffffff']
        });
        setSelectedLetter(null);
        setPhotoFile(null);
        setPreviewUrl('');
        setWordHint('');
        fetchAlphabet();
      }
    } catch (err) {
      alert('Error al registrar letra');
    } finally {
      setSubmitting(false);
    }
  };

  const completedDetailsCount = details.filter(d => !!d.completed_by_id).length;

  return (
    <div className="space-y-3.5 pb-6">
      {/* Top Mode Selector: Detalles Urbanos vs Abecedario */}
      <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900/90 rounded-2xl border border-zinc-200 dark:border-zinc-800 gap-1 text-xs font-bold shadow-inner">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
            activeTab === 'details'
              ? 'bg-[#ff3b68] text-white shadow-md font-black'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold'
          }`}
        >
          <span>Detalles Urbanos</span>
        </button>

        <button
          onClick={() => setActiveTab('alphabet')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
            activeTab === 'alphabet'
              ? 'bg-[#ff3b68] text-white shadow-md font-black'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold'
          }`}
        >
          <span>Abecedario A-Z</span>
        </button>
      </div>

      {activeTab === 'details' ? (
        /* ================= 1. DETALLES URBANOS (3x4) ================= */
        <div className="space-y-3">
          {/* City switcher */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 grid grid-cols-3 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 shadow-inner">
              {CITIES.map(city => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                    selectedCity === city
                      ? 'bg-[#ff3b68] text-white font-black shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold'
                  }`}
                >
                  <span>{city}</span>
                </button>
              ))}
            </div>
            <div className="px-3 py-1.5 rounded-2xl bg-[#ff3b68]/10 border border-[#ff3b68]/25 text-[#ff3b68] text-xs font-black flex-shrink-0">
              {completedDetailsCount}/12 hallados
            </div>
          </div>

          <div className="text-[11px] text-zinc-600 dark:text-zinc-400 px-1">
            ⚡ <span className="font-bold text-zinc-800 dark:text-zinc-200">Regla de oro:</span> El primero en fotografiar el detalle gana <span className="text-[#ff3b68] font-bold">+30 XP</span> y bloquea la casilla para toda la familia.
          </div>

          {/* 3x4 Grid (12 Items) */}
          <div className="grid grid-cols-3 gap-2">
            {details.map((detail) => {
              const isFound = !!detail.completed_by_id;

              return (
                <motion.div
                  key={detail.id}
                  whileHover={{ scale: isFound ? 1 : 1.02 }}
                  whileTap={{ scale: isFound ? 1 : 0.96 }}
                  onClick={() => {
                    if (!isFound) {
                      setSelectedDetail(detail);
                      setPhotoFile(null);
                      setPreviewUrl('');
                    }
                  }}
                  className={`aspect-square p-2 rounded-2xl flex flex-col items-center justify-between text-center relative border overflow-hidden transition-all ${
                    isFound
                      ? 'bg-rose-50/50 dark:bg-zinc-900/40 border-[#ff3b68]/40 shadow-[0_0_12px_rgba(255,59,104,0.15)]'
                      : 'bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80 hover:border-[#ff3b68]/50 cursor-pointer shadow-sm'
                  }`}
                >
                  {isFound ? (
                    <>
                      {/* Photo preview backdrop */}
                      <img 
                        src={detail.photo_url} 
                        alt="Descubierto" 
                        className="absolute inset-0 w-full h-full object-cover opacity-35" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      
                      <div className="relative z-10 w-full flex justify-end">
                        <span className="w-5 h-5 rounded-full bg-[#ff3b68] text-white flex items-center justify-center text-[10px] font-black shadow">
                          ✓
                        </span>
                      </div>

                      <div className="relative z-10 w-full">
                        <span className="text-lg block mb-0.5">{detail.icon || '🔍'}</span>
                        <span className="text-[10px] font-black text-white leading-tight line-clamp-2">
                          {detail.title}
                        </span>
                        <div className="text-[8px] font-bold text-rose-300 mt-1 truncate">
                          Por {detail.member_name}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full flex justify-between items-center text-[10px] text-zinc-500">
                        <span>#0{detail.position || 1}</span>
                        <span className="text-[#ff3b68] font-bold">+30 XP</span>
                      </div>

                      <div>
                        <span className="text-2xl block mb-1">{detail.icon || '🔍'}</span>
                        <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2">
                          {detail.title}
                        </span>
                      </div>

                      <span className="text-[9px] font-extrabold text-[#ff3b68] bg-[#ff3b68]/10 px-2 py-0.5 rounded-md border border-[#ff3b68]/20">
                        ¡Buscar!
                      </span>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Submit Detail Photo Modal */}
          {selectedDetail && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl border border-[#ff3b68]/30 p-5 shadow-2xl text-center">
                <div className="text-4xl mb-2">{selectedDetail.icon}</div>
                <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                  {selectedDetail.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  ¡Sube la foto del detalle encontrado en las calles de {selectedCity} y sé el primero en reclamarlo! (+30 XP)
                </p>

                <form onSubmit={handleCompleteDetail} className="space-y-3 mt-4">
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
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Fotografiar detalle</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Haz clic aquí para abrir cámara</span>
                      <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDetail(null)}
                      className="flex-1 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs font-bold hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !photoFile}
                      className="flex-1 py-2.5 rounded-xl bg-[#ff3b68] hover:bg-[#e02854] disabled:opacity-40 text-white font-black text-xs shadow-md shadow-[#ff3b68]/25 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Reclamar (+30 XP)
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= 2. ABECEDARIO DEL VIAJE (A-Z) ================= */
        <div className="space-y-3">
          {/* Personal Word Challenge Progress Banner */}
          <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-zinc-900/90 border border-rose-200 dark:border-[#ff3b68]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <div className="flex items-center gap-1.5 text-[#ff3b68] text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#ff3b68]" />
                <span>Reto Equitativo (5 Letras): {activeMember?.name || 'Viajero'}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">Palabra:</span>
                <select
                  value={activeChallengeWord}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomWord(val);
                    if (activeMember?.id) {
                      localStorage.setItem(`word_challenge_${activeMember.id}`, val);
                    }
                  }}
                  className="px-2 py-0.5 rounded-lg text-xs font-black bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-[#ff3b68] cursor-pointer outline-none shadow-sm"
                >
                  {EQUITABLE_5_LETTER_WORDS.map(w => (
                    <option key={w} value={w}>{w} (5 letras)</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-1.5 items-center justify-end">
              {challengeLetters.map((letter, idx) => {
                const isFound = !!alphabetData.entries?.[letter];
                return (
                  <span
                    key={`${letter}-${idx}`}
                    className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center transition-all ${
                      isFound
                        ? 'bg-[#ff3b68] text-white shadow-sm scale-105 ring-2 ring-[#ff3b68]/30'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    {letter}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-zinc-600 dark:text-zinc-400 font-bold">
              Letras registradas en letreros: <span className="text-[#ff3b68] font-black">{alphabetData.claimedCount}/27</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-bold">+25 XP por letra</span>
          </div>

          {/* 27 Alphabet Grid */}
          <div className="grid grid-cols-6 gap-1.5">
            {ALPHABET.map((letter) => {
              const entry = alphabetData.entries?.[letter];
              const isClaimed = !!entry;

              return (
                <button
                  type="button"
                  key={letter}
                  onClick={() => {
                    setSelectedLetter(letter);
                    setWordHint(entry?.word_hint || '');
                    setPhotoFile(null);
                    setPreviewUrl(entry?.photo_url || '');
                  }}
                  className={`aspect-square rounded-2xl p-1 flex flex-col items-center justify-center transition-all relative border cursor-pointer ${
                    isClaimed
                      ? 'bg-rose-50 dark:bg-rose-500/15 border-[#ff3b68]/50 shadow-[0_0_8px_rgba(255,59,104,0.2)]'
                      : 'bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800 hover:border-[#ff3b68]/40 shadow-sm'
                  }`}
                >
                  <span className={`text-base font-black ${
                    isClaimed ? 'text-[#ff3b68]' : 'text-zinc-900 dark:text-zinc-100'
                  }`}>
                    {letter}
                  </span>

                  {isClaimed ? (
                    <span className="text-[8px] font-bold text-[#ff3b68] truncate max-w-full px-0.5">
                      {entry.member_name?.slice(0, 5)}
                    </span>
                  ) : (
                    <span className="text-[8px] text-zinc-400 dark:text-zinc-500">Libre</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Alphabet Photo Modal */}
          {selectedLetter && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl border border-[#ff3b68]/30 p-5 shadow-2xl text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#ff3b68]/15 border border-[#ff3b68]/30 flex items-center justify-center text-2xl font-black text-[#ff3b68] mx-auto mb-2">
                  {selectedLetter}
                </div>
                <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                  Letra "{selectedLetter}" en las Calles
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Fotografía un letrero, placa de calle o tienda que empiece o contenga esta letra.
                </p>

                <form onSubmit={handleSubmitLetter} className="space-y-3 mt-4">
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
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Tomar foto del letrero</span>
                      <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-400 text-left mb-1">
                      Palabra o lugar (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Farmacia, Calle Alcalá, Trattoria..."
                      value={wordHint}
                      onChange={(e) => setWordHint(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLetter(null)}
                      className="flex-1 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs font-bold hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !photoFile}
                      className="flex-1 py-2.5 rounded-xl bg-[#ff3b68] hover:bg-[#e02854] disabled:opacity-40 text-white font-black text-xs shadow-md shadow-[#ff3b68]/25 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Registrar (+25 XP)
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

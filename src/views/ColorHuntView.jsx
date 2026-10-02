import React, { useState } from 'react';
import { Camera, Sparkles, Plus, Image as ImageIcon, Check, X, Users, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function ColorHuntView({ 
  colorChallenges = [], 
  activeMember, 
  onSubmitColorPhoto 
}) {
  const [selectedCountry, setSelectedCountry] = useState('España');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredChallenges = colorChallenges.filter(
    c => !c.country || c.country.toLowerCase() === selectedCountry.toLowerCase()
  );

  const handleOpenSubmit = (challenge) => {
    setSelectedChallenge(challenge);
    setPhotoFile(null);
    setPreviewUrl('');
    setCaption('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChallenge || !activeMember || !photoFile) {
      alert('Por favor toma o selecciona una foto');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitColorPhoto(selectedChallenge.id, activeMember.id, photoFile, caption);
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.65 },
        colors: [selectedChallenge.color_hex || '#10b981', '#10b981', '#ffffff']
      });
      setSelectedChallenge(null);
    } catch (err) {
      alert('Error al subir foto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-safe pt-1 space-y-3.5">
      {/* 0. Country Toggle: España vs Italia */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 grid grid-cols-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900/90 light:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 light:border-zinc-200 shadow-inner">
          <button
            onClick={() => setSelectedCountry('España')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
              selectedCountry === 'España'
                ? 'bg-[#ff3b68] text-white shadow-md font-black'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-bold'
            }`}
          >
            <span>España</span>
          </button>

          <button
            onClick={() => setSelectedCountry('Italia')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
              selectedCountry === 'Italia'
                ? 'bg-[#ff3b68] text-white shadow-md font-black'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-bold'
            }`}
          >
            <span>Italia</span>
          </button>
        </div>
      </div>
      {/* 1. Banner Header */}
      <div className="p-4 rounded-3xl bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff3b68] bg-[#ff3b68]/10 px-2 py-0.5 rounded-full border border-[#ff3b68]/20 flex items-center gap-1 w-fit">
              <Sparkles className="w-3 h-3 text-[#ff3b68]" /> Cacería Fotográfica Familiar
            </span>
            <h2 className="text-lg font-black text-zinc-100 dark:text-zinc-100 light:text-zinc-900 mt-1">
              Reto de Colores del Viaje 🎨
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mt-0.5">
              Encuentren objetos o lugares en las calles con cada color y ganen <span className="text-[#ff3b68] font-bold">+50 XP</span> por cada foto.
            </p>
          </div>
          <div className="text-3xl">🌈</div>
        </div>
      </div>

      {/* 2. Challenge Cards Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredChallenges.map((challenge) => {
          const submissions = challenge.submissions || [];
          const mySubmission = submissions.find(s => s.member_id === activeMember?.id);

          return (
            <div
              key={challenge.id}
              className="p-4 rounded-3xl bg-zinc-950/90 dark:bg-zinc-950/90 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 shadow-md relative overflow-hidden"
            >
              {/* Color accent strip */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5" 
                style={{ backgroundColor: challenge.color_hex }}
              />

              <div className="flex items-start justify-between gap-3 mt-1">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl shadow-inner flex-shrink-0 border border-white/20"
                    style={{ backgroundColor: challenge.color_hex }}
                  />
                  <div>
                    <h3 className="text-sm font-black text-zinc-100 dark:text-zinc-100 light:text-zinc-900">
                      {challenge.color_name}
                    </h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mt-0.5">
                      {challenge.prompt}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenSubmit(challenge)}
                  className="px-3 py-1.5 rounded-xl bg-[#ff3b68] hover:bg-[#e02854] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-[#ff3b68]/25 transition-all flex-shrink-0 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{mySubmission ? 'Otra foto' : 'Subir foto'}</span>
                </button>
              </div>

              {/* Submissions Gallery Carousel */}
              {submissions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200">
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-2 font-bold">
                    <Users className="w-3 h-3 text-[#ff3b68]" />
                    <span>Fotos del equipo ({submissions.length})</span>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {submissions.map((sub) => (
                      <div key={sub.id} className="relative rounded-xl overflow-hidden flex-shrink-0 w-24 h-24 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 group shadow">
                        <img src={sub.photo_url} alt="Submission" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                          <span className="text-[10px] font-bold text-white truncate">
                            {sub.member_name || sub.author_name || 'Viajero'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Photo Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl border border-[#ff3b68]/30 p-5 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-lg border" style={{ backgroundColor: selectedChallenge.color_hex }} />
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                {selectedChallenge.color_name}
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">{selectedChallenge.prompt}</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {previewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-[#ff3b68]/40 mb-3 max-h-48 mx-auto">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPreviewUrl(''); }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="block p-5 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#ff3b68] bg-zinc-50 dark:bg-zinc-900/60 text-center cursor-pointer transition-colors">
                  <Camera className="w-8 h-8 mx-auto text-[#ff3b68] mb-1" />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Tomar o subir foto</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Haz clic aquí para abrir tu cámara</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                </label>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Comentario divertido (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. Encontrado en el mercado de las flores..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedChallenge(null)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !photoFile}
                  className="flex-1 py-2.5 rounded-xl bg-[#ff3b68] hover:bg-[#e02854] disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-[#ff3b68]/25 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Enviar Foto (+50 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

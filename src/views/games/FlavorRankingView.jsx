import React, { useState, useEffect } from 'react';
import { Utensils, Star, ThumbsUp, ThumbsDown, Camera, Plus, Filter, Flame, Award, Heart, Check, Euro } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const FLAVOR_CATEGORIES = ['Todos', 'Salado', 'Callejero', 'Dulce', 'Helado', 'Café/Chocolate', 'Bebida'];
const CITIES = ['Todas', 'Madrid', 'Roma', 'Barcelona'];

export default function FlavorRankingView({ activeMember }) {
  const [flavors, setFlavors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterCity, setFilterCity] = useState('Todas');
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'repeat' | 'recent'

  // Create review modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [dishName, setDishName] = useState('');
  const [category, setCategory] = useState('Salado');
  const [city, setCity] = useState('Madrid');
  const [price, setPrice] = useState('');
  const [score, setScore] = useState(9);
  const [wouldRepeat, setWouldRepeat] = useState(1);
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Rate existing modal
  const [ratingItem, setRatingItem] = useState(null);
  const [rateScore, setRateScore] = useState(9);
  const [rateRepeat, setRateRepeat] = useState(1);

  const fetchFlavors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/flavors');
      const data = await res.json();
      setFlavors(data.flavors || []);
    } catch (e) {
      console.error('Error fetching flavors', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlavors();
  }, []);

  const handleCreateFlavor = async (e) => {
    e.preventDefault();
    if (!dishName.trim() || !activeMember) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', dishName.trim());
      formData.append('category', category);
      formData.append('city', city);
      formData.append('price', price || 0);
      formData.append('rating', score);
      formData.append('would_repeat', wouldRepeat);
      formData.append('created_by', activeMember.id);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await fetch('/api/flavors', {
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
        setShowAddModal(false);
        setDishName('');
        setPrice('');
        setPhotoFile(null);
        setPreviewUrl('');
        fetchFlavors();
      }
    } catch (err) {
      alert('Error al registrar sabor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!ratingItem || !activeMember) return;

    try {
      await fetch(`/api/flavors/${ratingItem.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: activeMember.id,
          score: rateScore,
          would_repeat: rateRepeat
        })
      });
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#10b981', '#3b82f6']
      });
      setRatingItem(null);
      fetchFlavors();
    } catch (err) {
      alert('Error al puntuar plato');
    }
  };

  // Filter and sort
  const filteredFlavors = flavors.filter(f => {
    if (filterCategory !== 'Todos' && f.category !== filterCategory) return false;
    if (filterCity !== 'Todas' && f.city !== filterCity) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'score') return b.avg_score - a.avg_score;
    if (sortBy === 'repeat') return b.repeat_percent - a.repeat_percent;
    return b.id - a.id;
  });

  return (
    <div className="space-y-3.5 pb-6">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 p-3 rounded-2xl shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-pink-400">
            Crítica Gastronómica Familiar
          </span>
          <h2 className="text-sm font-black text-zinc-100 dark:text-zinc-100 light:text-zinc-900">
            Ranking de Sabores 🍕
          </h2>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white text-xs font-black flex items-center gap-1 shadow-md shadow-pink-500/25 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Evaluar Plato (10s)</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-2">
        {/* Categories */}
        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
          {FLAVOR_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-zinc-100 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-900 dark:text-white font-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cities & Sort */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex gap-1">
            {CITIES.map(c => (
              <button
                key={c}
                onClick={() => setFilterCity(c)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                  filterCity === c
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-[11px] p-1 outline-none"
          >
            <option value="score">Mayor Puntuación ⭐</option>
            <option value="repeat">Más Recomendados 👍</option>
            <option value="recent">Más Recientes 🕒</option>
          </select>
        </div>
      </div>

      {/* Flavor Cards List */}
      <div className="space-y-2.5">
        {filteredFlavors.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 text-center text-xs text-zinc-500">
            Aún no hay platos evaluados en esta categoría. ¡Sube el primero en 10 segundos!
          </div>
        ) : (
          filteredFlavors.map((flavor, index) => {
            const hasMyRating = (flavor.ratings || []).some(r => r.member_id === activeMember?.id);

            return (
              <motion.div
                key={flavor.id}
                whileHover={{ scale: 1.01 }}
                className="p-3.5 rounded-2xl bg-zinc-950/90 dark:bg-zinc-950/90 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 shadow-md flex gap-3 relative overflow-hidden"
              >
                {/* Photo thumbnail */}
                {flavor.photo_url ? (
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-800">
                    <img src={flavor.photo_url} alt={flavor.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-zinc-900 flex items-center justify-center text-3xl flex-shrink-0 border border-zinc-800">
                    🍲
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-black uppercase tracking-wider text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20">
                          {flavor.category} • {flavor.city}
                        </span>
                        {flavor.price > 0 && (
                          <span className="text-[9px] text-zinc-400 font-bold">
                            {flavor.price} €
                          </span>
                        )}
                      </div>

                      {/* Rank badge for top 3 */}
                      {index < 3 && (
                        <span className="text-xs font-black text-amber-400">
                          #{index + 1} 🏆
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs font-black text-zinc-100 dark:text-zinc-100 light:text-zinc-900 mt-1 truncate">
                      {flavor.name}
                    </h3>
                  </div>

                  {/* Ratings summary */}
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-800/60 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-amber-400 flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{flavor.avg_score}</span>
                        <span className="text-[10px] text-zinc-500 font-normal">/10</span>
                      </span>

                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{flavor.repeat_percent}% repetiría</span>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setRatingItem(flavor);
                        setRateScore(9);
                        setRateRepeat(1);
                      }}
                      className={`text-[10px] font-black px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                        hasMyRating
                          ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                      }`}
                    >
                      {hasMyRating ? 'Tu nota ✓' : '+ Puntuar (+10 XP)'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Flavor Modal (10s Review) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-950 dark:bg-zinc-950 light:bg-white rounded-3xl border border-pink-500/30 p-5 shadow-2xl">
            <h3 className="text-base font-black text-zinc-100 dark:text-zinc-100 light:text-zinc-900 mb-1">
              Evaluar Plato en 10s 🍕
            </h3>
            <p className="text-xs text-zinc-400 mb-3">
              Rápido, divertido y al grano para el ranking familiar.
            </p>

            <form onSubmit={handleCreateFlavor} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Nombre del plato o postre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pizza Carbonara, Gelato Pistacho..."
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 text-xs outline-none focus:ring-1 focus:ring-pink-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 text-xs"
                  >
                    {FLAVOR_CATEGORIES.filter(c => c !== 'Todos').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Ciudad</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 text-xs"
                  >
                    <option value="Madrid">Madrid</option>
                    <option value="Roma">Roma</option>
                    <option value="Barcelona">Barcelona</option>
                  </select>
                </div>
              </div>

              {/* Price & Score Slider */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Precio aproximado (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Ej: 12"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Puntuación: <span className="text-amber-400 font-black">{score}/10</span></label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full mt-2 accent-pink-500"
                  />
                </div>
              </div>

              {/* Would repeat toggle */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">¿Volverías a pedirlo?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWouldRepeat(1)}
                    className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border transition-all ${
                      wouldRepeat === 1
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>¡Totalmente Sí!</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWouldRepeat(0)}
                    className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border transition-all ${
                      wouldRepeat === 0
                        ? 'bg-red-500 text-white border-red-400 shadow'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Paso la próxima</span>
                  </button>
                </div>
              </div>

              {/* Photo */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Foto del plato (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setPhotoFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:bg-zinc-800 file:text-zinc-200"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-black text-xs shadow-md shadow-pink-500/25 cursor-pointer"
                >
                  Guardar (+20 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rate Item Modal */}
      {ratingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-950 rounded-3xl border border-zinc-700 p-5 shadow-2xl text-center">
            <h3 className="text-base font-black text-zinc-100">
              ¿Qué tal estuvo "{ratingItem.name}"?
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 mb-4">
              Agrega tu propia nota para promediar la puntuación familiar.
            </p>

            <form onSubmit={handleRateSubmit} className="space-y-4">
              <div>
                <div className="text-2xl font-black text-amber-400 mb-1">
                  {rateScore} / 10 ⭐
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rateScore}
                  onChange={(e) => setRateScore(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRateRepeat(1)}
                  className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 border ${
                    rateRepeat === 1 ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Repetiría</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRateRepeat(0)}
                  className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 border ${
                    rateRepeat === 0 ? 'bg-red-500 text-white border-red-400' : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>No repetiría</span>
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingItem(null)}
                  className="flex-1 py-2 rounded-xl border border-zinc-700 text-zinc-400 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 text-black font-black text-xs shadow-md cursor-pointer"
                >
                  Confirmar (+10 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

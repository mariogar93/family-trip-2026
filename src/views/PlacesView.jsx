import React, { useState } from 'react';
import { MapPin, CheckCircle, Circle, Plus, ExternalLink, Calendar, Trash2, Plane } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import TransitCard from '../components/TransitCard';
import TransitModal from '../components/TransitModal';

export default function PlacesView({ 
  places = [], 
  itinerary = [],
  activeMember, 
  isAdmin = false,
  onToggleVisited, 
  onAddPlace,
  onDeletePlace,
  transits = [],
  onAddTransit,
  onUpdateTransit,
  onDeleteTransit
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransitModal, setShowTransitModal] = useState(false);
  const [editingTransit, setEditingTransit] = useState(null);
  const [title, setTitle] = useState('');
  const [placeLocation, setPlaceLocation] = useState('Madrid');
  const [dateStr, setDateStr] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');

  const visitedCount = places.filter(p => Boolean(p.visited)).length;

  const handleToggle = async (place) => {
    const isNowVisited = !place.visited;
    await onToggleVisited(place.id, activeMember?.id);
    if (isNowVisited) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
    }
  };

  const handleCreatePlace = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const searchQuery = placeLocation.trim() 
      ? `${title.trim()}, ${placeLocation.trim()}` 
      : title.trim();
    const computedUrl = mapsUrl.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;

    await onAddPlace({
      title: title.trim(),
      location: placeLocation.trim(),
      date_str: dateStr.trim(),
      maps_url: computedUrl,
    });

    setTitle('');
    setPlaceLocation('');
    setDateStr('');
    setMapsUrl('');
    setShowAddModal(false);
  };

  return (
    <div className="pb-safe pt-1 space-y-3.5">
      {/* Header Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-950/80 light:bg-white border border-zinc-200 dark:border-zinc-800/80 light:border-zinc-200 shadow-sm flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 light:text-zinc-900">
            Lugares del Viaje
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 light:text-zinc-500 mt-0.5">
            {visitedCount} de {places.length} lugares visitados
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {isAdmin && (
            <button
              onClick={() => {
                setEditingTransit(null);
                setShowTransitModal(true);
              }}
              className="px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 light:text-sky-600 text-xs font-black flex items-center gap-1 border border-sky-500/30 transition-all cursor-pointer"
              title="Añadir billete de avión o tren"
            >
              <Plane className="w-3.5 h-3.5" />
              <span>+ Billete</span>
            </button>
          )}

          <button
            onClick={() => {
              if (itinerary.length > 0 && !dateStr) {
                setDateStr(itinerary[0].date_str || '');
                setPlaceLocation(itinerary[0].city || '');
              }
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#ff3b68] hover:bg-[#e02854] text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#ff3b68]/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Añadir Lugar</span>
          </button>
        </div>
      </div>

      {/* Transit Boarding Passes Section (Style from reference) */}
      {transits.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-sky-400 light:text-sky-600 flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5" />
              <span>Billetes y Trayectos ({transits.length})</span>
            </span>
          </div>

          <div className="space-y-2.5">
            {transits.map(transit => (
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
        </div>
      )}

      {/* Simple Places List */}
      <div className="space-y-2.5">
        <AnimatePresence>
          {places.map((place) => {
            const isVisited = Boolean(place.visited);

            return (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-3.5 rounded-3xl transition-all border flex items-center justify-between gap-3 ${
                  isVisited
                    ? 'bg-zinc-50/80 dark:bg-zinc-950/60 light:bg-zinc-50/80 border-[#ff3b68]/30'
                    : 'bg-white dark:bg-zinc-950/90 light:bg-white border-zinc-200 dark:border-zinc-800/80 light:border-zinc-200 shadow-sm hover:border-[#ff3b68]/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => handleToggle(place)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                      isVisited
                        ? 'bg-[#ff3b68] text-white shadow-[0_0_10px_rgba(255,59,104,0.4)]'
                        : 'bg-zinc-100 dark:bg-zinc-900 light:bg-zinc-100 border border-zinc-300 dark:border-zinc-700 light:border-zinc-300 text-zinc-400 hover:text-[#ff3b68]'
                    }`}
                    title={isVisited ? 'Marcar como pendiente' : 'Marcar como visitado'}
                  >
                    {isVisited ? <CheckCircle className="w-4 h-4 stroke-[2.5]" /> : <Circle className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0">
                    <h3 className={`text-sm font-bold truncate ${
                      isVisited 
                        ? 'text-zinc-400 line-through' 
                        : 'text-zinc-900 dark:text-zinc-100 light:text-zinc-900'
                    }`}>
                      {place.title}
                    </h3>

                    <div className="flex items-center gap-2 flex-wrap text-[11px] mt-0.5">
                      {place.location && (
                        <span className="font-bold text-zinc-600 dark:text-zinc-300 light:text-zinc-600">
                          {place.location}
                        </span>
                      )}

                      {place.location && place.date_str && (
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      )}

                      {place.date_str && (
                        <span className="text-emerald-600 dark:text-emerald-400 light:text-emerald-700 font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span>{place.date_str}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {place.maps_url && (
                    <a
                      href={place.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 light:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 light:border-zinc-200 text-emerald-600 dark:text-emerald-400 light:text-emerald-700 hover:scale-105 transition-all"
                      title="Abrir en Google Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {isAdmin && onDeletePlace && (
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar lugar "${place.title}"?`)) {
                          onDeletePlace(place.id);
                        }
                      }}
                      className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      title="Eliminar lugar (Admin)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {places.length === 0 && (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-zinc-950/50 light:bg-white border border-dashed border-zinc-300 dark:border-zinc-800/60 light:border-zinc-300 text-zinc-500 dark:text-zinc-400 light:text-zinc-500 text-xs">
            No hay lugares guardados aún. Añade los lugares que quieran visitar.
          </div>
        )}
      </div>

      {/* Simple Add Place Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl border border-[#ff3b68]/30 p-5 shadow-2xl">
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-1">
              Añadir Lugar al Viaje
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Indica el nombre, la ciudad o zona donde se ubica y la fecha programada.
            </p>

            <form onSubmit={handleCreatePlace} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nombre del Lugar
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Coliseo Romano, Parque del Retiro..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Ciudad o Ubicación
                </label>
                <select
                  value={placeLocation}
                  onChange={(e) => setPlaceLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                >
                  <option value="Madrid">Madrid</option>
                  <option value="Barcelona">Barcelona</option>
                  <option value="Roma">Roma</option>
                  <option value="Venezia">Venezia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Fecha / Día (opcional)
                </label>
                {itinerary.length > 0 ? (
                  <select
                    value={dateStr}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDateStr(val);
                      const matchingDay = itinerary.find(d => d.date_str === val);
                      if (matchingDay && !placeLocation) {
                        setPlaceLocation(matchingDay.city || '');
                      }
                    }}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                  >
                    <option value="">Sin fecha fija</option>
                    {itinerary.map((day, idx) => (
                      <option key={day.id || idx} value={day.date_str}>
                        {day.date_str} — {day.city || day.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Ej. 14 Octubre, 15/10..."
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 light:bg-zinc-50 border border-zinc-300 dark:border-zinc-700 light:border-zinc-300 rounded-xl text-zinc-900 dark:text-zinc-100 light:text-zinc-900 text-xs outline-none focus:border-[#ff3b68]"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 light:text-zinc-700 mb-1">
                  Enlace de Google Maps (opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/... (se genera auto si lo dejas vacío)"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 light:bg-zinc-50 border border-zinc-300 dark:border-zinc-700 light:border-zinc-300 rounded-xl text-zinc-900 dark:text-zinc-100 light:text-zinc-900 text-xs outline-none focus:border-[#ff3b68]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-700 light:border-zinc-300 text-zinc-500 dark:text-zinc-400 light:text-zinc-600 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-[#ff3b68] hover:bg-[#e02854] text-white shadow-md shadow-[#ff3b68]/30 cursor-pointer"
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
            await onUpdateTransit(editingTransit.id, transitData);
          } else {
            await onAddTransit(transitData);
          }
          setShowTransitModal(false);
          setEditingTransit(null);
        }}
      />
    </div>
  );
}

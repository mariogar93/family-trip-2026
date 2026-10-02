import React, { useState, useEffect } from 'react';
import { Plane, Train, X, Check, Clock, MapPin, Calendar, FileText } from 'lucide-react';

export default function TransitModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  itinerary = []
}) {
  const [type, setType] = useState('flight');
  const [origin, setOrigin] = useState('');
  const [originTime, setOriginTime] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationTime, setDestinationTime] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'flight');
      setOrigin(initialData.origin || '');
      setOriginTime(initialData.origin_time || '');
      setDestination(initialData.destination || '');
      setDestinationTime(initialData.destination_time || '');
      setDateStr(initialData.date_str || '');
      setNotes(initialData.notes || '');
    } else {
      setType('flight');
      setOrigin('');
      setOriginTime('');
      setDestination('');
      setDestinationTime('');
      setDateStr(itinerary[0]?.date_str || '');
      setNotes('');
    }
  }, [initialData, isOpen, itinerary]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      alert('Por favor ingresa origen y destino');
      return;
    }

    onSave({
      type,
      origin: origin.trim(),
      origin_time: originTime.trim(),
      destination: destination.trim(),
      destination_time: destinationTime.trim(),
      date_str: dateStr.trim(),
      notes: notes.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
              {initialData ? 'Editar Trayecto' : 'Añadir Billete / Trayecto'}
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Ficha básica de traslado (avión o tren)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Vehicle Type Selector: Avión vs Tren */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Tipo de Transporte
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setType('flight')}
                className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'flight'
                    ? 'bg-[#ff3b68] text-white shadow-md'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Plane className="w-3.5 h-3.5 rotate-12" />
                <span>Avión ✈️</span>
              </button>

              <button
                type="button"
                onClick={() => setType('train')}
                className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'train'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Train className="w-3.5 h-3.5" />
                <span>Tren 🚆</span>
              </button>
            </div>
          </div>

          {/* Origin & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Desde (Origen) *
              </label>
              <input
                type="text"
                placeholder="Ej: SFO o MAD"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs font-bold outline-none focus:border-[#ff3b68]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Hora Salida
              </label>
              <input
                type="text"
                placeholder="Ej: 09:25 AM"
                value={originTime}
                onChange={(e) => setOriginTime(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs font-bold outline-none focus:border-[#ff3b68]"
              />
            </div>
          </div>

          {/* Destination & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Hacia (Destino) *
              </label>
              <input
                type="text"
                placeholder="Ej: DXB o BCN"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs font-bold outline-none focus:border-[#ff3b68]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Hora Llegada
              </label>
              <input
                type="text"
                placeholder="Ej: 02:15 PM"
                value={destinationTime}
                onChange={(e) => setDestinationTime(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs font-bold outline-none focus:border-[#ff3b68]"
              />
            </div>
          </div>

          {/* Date & Optional Notes */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Fecha / Día
              </label>
              <input
                type="text"
                placeholder="Ej: 14 Oct"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs font-medium outline-none focus:border-[#ff3b68]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Notas (Vuelo / Tren)
              </label>
              <input
                type="text"
                placeholder="Ej: Iberia IB3140"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs font-medium outline-none focus:border-[#ff3b68]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#ff3b68] hover:bg-[#e02854] text-white font-black text-xs shadow-md shadow-[#ff3b68]/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Guardar Cambios' : 'Crear Billete'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

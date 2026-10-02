import React from 'react';
import { Plane, Train, Edit2, Trash2, Calendar, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper to format origin / destination codes & cities cleanly
function splitLocation(loc = '') {
  const parts = loc.trim().split(/\s*[-–]\s*|\s+/);
  if (parts.length >= 2) {
    const first = parts[0].toUpperCase();
    if (first.length >= 3 && first.length <= 4) {
      return { code: first, label: parts.slice(1).join(' ') };
    }
  }
  if (loc.length <= 4) {
    return { code: loc.toUpperCase(), label: '' };
  }
  return { code: loc.slice(0, 3).toUpperCase(), label: loc };
}

export default function TransitCard({
  transit,
  isAdmin = false,
  onEdit,
  onDelete
}) {
  const isTrain = transit.type === 'train';
  const originInfo = splitLocation(transit.origin);
  const destInfo = splitLocation(transit.destination);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="relative rounded-3xl bg-white dark:bg-[#101524] border border-zinc-200 dark:border-[#20293d] shadow-lg hover:shadow-xl transition-all select-none overflow-hidden"
    >
      {/* Top Header Accent Pill */}
      <div className="px-4 sm:px-5 pt-3.5 pb-3 flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
            isTrain
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25'
              : 'bg-[#ff3b68]/10 text-[#ff3b68] border border-[#ff3b68]/25'
          }`}>
            {isTrain ? <Train className="w-3.5 h-3.5" /> : <Plane className="w-3.5 h-3.5 rotate-45" />}
            <span>{isTrain ? 'Tren Alta Velocidad' : 'Vuelo Comercial'}</span>
          </span>

          {transit.date_str && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
              <Calendar className="w-3 h-3 text-zinc-400" />
              <span>{transit.date_str}</span>
            </span>
          )}
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit?.(transit)}
              className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs transition-colors cursor-pointer"
              title="Editar billete"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`¿Eliminar billete ${transit.origin} ➔ ${transit.destination}?`)) {
                  onDelete?.(transit.id);
                }
              }}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 text-xs transition-colors cursor-pointer"
              title="Eliminar billete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Boarding Pass Body */}
      <div className="px-5 py-4 flex items-center justify-between gap-3">
        {/* Origin */}
        <div className="min-w-[70px] text-left">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white block leading-none">
            {originInfo.code}
          </span>
          {originInfo.label && (
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block truncate max-w-[110px] mt-1">
              {originInfo.label}
            </span>
          )}
          <div className="flex items-center gap-1 text-xs font-black text-[#ff3b68] mt-1.5">
            <Clock className="w-3 h-3" />
            <span>{transit.origin_time || '--:--'}</span>
          </div>
        </div>

        {/* Middle Trajectory Visual */}
        <div className="flex-1 flex flex-col items-center justify-center px-1 sm:px-2 pt-1">
          <div className="w-full max-w-[130px] flex items-center justify-center relative mb-3">
            {/* Dashed Line */}
            <div className="w-full border-t-2 border-dashed border-zinc-300 dark:border-zinc-700" />
            
            {/* Center Vehicle Floating Badge */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
              isTrain
                ? 'bg-amber-500 text-white shadow-amber-500/30'
                : 'bg-[#ff3b68] text-white shadow-[#ff3b68]/30'
            }`}>
              {isTrain ? (
                <Train className="w-3.5 h-3.5" />
              ) : (
                <Plane className="w-3.5 h-3.5 rotate-45" />
              )}
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 text-center whitespace-nowrap block">
            Trayecto Directo
          </span>
        </div>

        {/* Destination */}
        <div className="min-w-[70px] text-right">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white block leading-none">
            {destInfo.code}
          </span>
          {destInfo.label && (
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block truncate max-w-[110px] mt-1 ml-auto">
              {destInfo.label}
            </span>
          )}
          <div className="flex items-center justify-end gap-1 text-xs font-black text-zinc-800 dark:text-zinc-200 mt-1.5">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>{transit.destination_time || '--:--'}</span>
          </div>
        </div>
      </div>

      {/* Ticket Perforation Notch (Left & Right) with Dashed Divider */}
      <div className="relative flex items-center my-0">
        {/* Left cutout circle notch */}
        <div className="w-4 h-6 -ml-2 rounded-r-full bg-zinc-100 dark:bg-[#07090e] border-y border-r border-zinc-200 dark:border-[#20293d]" />
        
        {/* Dashed tear line */}
        <div className="flex-1 border-b border-dashed border-zinc-200 dark:border-zinc-800 mx-2" />
        
        {/* Right cutout circle notch */}
        <div className="w-4 h-6 -mr-2 rounded-l-full bg-zinc-100 dark:bg-[#07090e] border-y border-l border-zinc-200 dark:border-[#20293d]" />
      </div>

      {/* Bottom Stub: Notes & Details */}
      <div className="px-5 py-2.5 bg-zinc-50/70 dark:bg-zinc-950/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Detalles:
          </span>
          <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300 truncate max-w-[240px]">
            {transit.notes || 'Pase emitido para el grupo familiar'}
          </span>
        </div>

        <div className="text-[10px] font-black uppercase tracking-widest text-[#ff3b68] flex items-center gap-0.5">
          <span>Confirmado</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </motion.div>
  );
}

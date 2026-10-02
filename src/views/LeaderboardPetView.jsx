import React, { useState } from 'react';
import { Trophy, Sparkles, Flame, Image as ImageIcon, Medal, Crown } from 'lucide-react';
import PetAvatar from '../components/PetAvatar';

export default function LeaderboardPetView({ 
  members, 
  activeMember, 
  photoFeed = []
}) {
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard' or 'photos'

  const sortedMembers = [...members].sort((a, b) => {
    if (b.pet_level !== a.pet_level) return b.pet_level - a.pet_level;
    return b.pet_xp - a.pet_xp;
  });

  return (
    <div className="pb-safe pt-1 space-y-3.5 select-none">
      {/* 1. Header Banner */}
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1 w-fit">
              <Trophy className="w-3 h-3 text-amber-500" /> Clasificación Familiar
            </span>
            <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100 mt-1">
              Podio & Liga de Mascotas
            </h2>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Crown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Sub-Tabs */}
      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'leaderboard'
              ? 'bg-[#ff3b68] text-white shadow-md font-black'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Podio Familiar ({sortedMembers.length})
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'photos'
              ? 'bg-[#ff3b68] text-white shadow-md font-black'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Álbum de Recuerdos ({photoFeed.length})
        </button>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-3">
          {/* Top 3 Architectural Podium */}
          {sortedMembers.length > 0 && (
            <div className="p-4 rounded-3xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 shadow-md">
              <div className="grid grid-cols-3 gap-2 items-end pt-2 pb-1">
                {/* 2nd Place (Left) */}
                {sortedMembers[1] ? (
                  <div className="flex flex-col items-center text-center">
                    <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-0.5">
                      🥈 2º
                    </span>
                    <PetAvatar 
                      petType={sortedMembers[1].pet_type} 
                      accessory={sortedMembers[1].pet_accessory} 
                      level={sortedMembers[1].pet_level} 
                      size="sm" 
                    />
                    <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate w-full mt-2">
                      {sortedMembers[1].name}
                    </span>
                    <span className="text-[10px] font-black text-[#ff3b68] mt-0.5">
                      {sortedMembers[1].pet_xp} XP
                    </span>

                    {/* Podium Step 2 */}
                    <div className="w-full mt-2 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-center shadow-sm">
                      <span className="text-sm sm:text-base font-black text-zinc-700 dark:text-zinc-200 block leading-tight">
                        2.º
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                        Lugar
                      </span>
                    </div>
                  </div>
                ) : <div />}

                {/* 1st Place (Center - Taller) */}
                {sortedMembers[0] && (
                  <div className="flex flex-col items-center text-center -mt-3 z-10">
                    <span className="text-xs font-black text-amber-500 mb-1 flex items-center gap-1">
                      👑 1.º Lugar
                    </span>
                    <div className="relative">
                      <PetAvatar 
                        petType={sortedMembers[0].pet_type} 
                        accessory={sortedMembers[0].pet_accessory} 
                        level={sortedMembers[0].pet_level} 
                        size="md" 
                        animated 
                      />
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-[10px] font-black shadow-md">
                        1
                      </div>
                    </div>
                    <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate w-full mt-2">
                      {sortedMembers[0].name}
                    </span>
                    <span className="text-[11px] font-black text-amber-500 mt-0.5">
                      {sortedMembers[0].pet_xp} XP
                    </span>

                    {/* Podium Step 1 (Tallest with gold glow) */}
                    <div className="w-full mt-2 py-5 rounded-2xl bg-gradient-to-b from-amber-500/25 via-amber-500/10 to-amber-500/5 border-2 border-amber-400/60 text-center shadow-md">
                      <span className="text-base sm:text-lg font-black text-amber-500 block leading-tight">
                        1.º
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                        Lugar
                      </span>
                    </div>
                  </div>
                )}

                {/* 3rd Place (Right) */}
                {sortedMembers[2] ? (
                  <div className="flex flex-col items-center text-center">
                    <span className="text-xs font-black text-amber-700 dark:text-amber-500 mb-1 flex items-center gap-0.5">
                      🥉 3º
                    </span>
                    <PetAvatar 
                      petType={sortedMembers[2].pet_type} 
                      accessory={sortedMembers[2].pet_accessory} 
                      level={sortedMembers[2].pet_level} 
                      size="sm" 
                    />
                    <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate w-full mt-2">
                      {sortedMembers[2].name}
                    </span>
                    <span className="text-[10px] font-black text-[#ff3b68] mt-0.5">
                      {sortedMembers[2].pet_xp} XP
                    </span>

                    {/* Podium Step 3 */}
                    <div className="w-full mt-2 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-center shadow-sm">
                      <span className="text-xs sm:text-sm font-black text-amber-700 dark:text-amber-500 block leading-tight">
                        3.º
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                        Lugar
                      </span>
                    </div>
                  </div>
                ) : <div />}
              </div>
            </div>
          )}

          {/* Full ranking list without user emojis */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 px-1 block">
              Tabla de Clasificación
            </span>

            {sortedMembers.map((m, idx) => (
              <div
                key={m.id}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  m.id === activeMember?.id
                    ? 'bg-white dark:bg-zinc-900 border-[#ff3b68]/40 shadow-sm ring-1 ring-[#ff3b68]/20'
                    : 'bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                    idx === 0 
                      ? 'bg-amber-400 text-black shadow-sm' 
                      : idx === 1 
                        ? 'bg-zinc-300 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' 
                        : idx === 2 
                          ? 'bg-amber-700/30 text-amber-700 dark:text-amber-400' 
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}>
                    {idx + 1}
                  </span>

                  <PetAvatar petType={m.pet_type} accessory={m.pet_accessory} level={m.pet_level} size="xs" />

                  <div className="min-w-0">
                    <div className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate">
                      {m.name}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">
                      Mascota: {m.pet_name || 'Compañero'}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-black text-[#ff3b68]">{m.pet_xp} XP</span>
                  <span className="text-[10px] text-zinc-400 block font-semibold">Nivel {m.pet_level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos Album View */}
      {activeTab === 'photos' && (
        <div className="space-y-3">
          {photoFeed.length > 0 ? (
            photoFeed.map((photo, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-3xl bg-white dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 shadow-md space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 block">
                      {photo.author_name}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {photo.tag || 'Foto de viaje'}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#ff3b68]">{photo.title}</span>
                </div>

                <div className="rounded-2xl overflow-hidden max-h-64 border border-zinc-200 dark:border-zinc-800">
                  <img src={photo.photo_url} alt={photo.title} className="w-full h-full object-cover" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-950/50 border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-500 text-xs">
              Aún no hay fotos en el álbum. ¡Toma fotos al completar casillas del Bingo o Retos de Colores para verlas aquí!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

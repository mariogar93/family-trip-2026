import React, { useState } from 'react';
import { Compass, Binoculars, Palette, Crown, Grid3X3 } from 'lucide-react';
import { motion } from 'framer-motion';
import BingoView from './BingoView';
import ColorHuntView from './ColorHuntView';
import DailyMissionView from './games/DailyMissionView';
import DetailHuntView from './games/DetailHuntView';
import DayClosingView from './games/DayClosingView';

export default function GamesView({
  bingoData,
  activeMember,
  members = [],
  isAdmin,
  activeSubTab: controlledSubTab,
  onSelectSubTab,
  onToggleBingoItem,
  onCompleteBingoItem,
  onUnmarkBingoItem,
  onAddBingoItem,
  onClaimLine,
  colorChallenges,
  onSubmitColorPhoto,
  selectedDayIndex = 0
}) {
  const [internalSubTab, setInternalSubTab] = useState('missions');
  const activeSubTab = controlledSubTab !== undefined ? controlledSubTab : internalSubTab;
  const setActiveSubTab = onSelectSubTab || setInternalSubTab;

  const gameTabs = [
    { 
      id: 'missions', 
      title: 'Misión del Día', 
      subtitle: 'Reto secreto de hoy con sello y lacre de cera', 
      icon: Compass,
      tag: 'Misión Diaria'
    },
    { 
      id: 'bingo', 
      title: 'Bingo Gastronómico', 
      subtitle: 'Descubre y desbloquea comidas típicas a ciegas', 
      icon: Grid3X3,
      tag: 'Cartón Bingo'
    },
    { 
      id: 'details', 
      title: 'Caza de Detalles y A-Z', 
      subtitle: '12 curiosidades urbanas y letreros callejeros', 
      icon: Binoculars,
      tag: 'Exploración & A-Z'
    },
    { 
      id: 'colors', 
      title: 'Reto de Colores', 
      subtitle: 'Captura los colores tradicionales de cada país', 
      icon: Palette,
      tag: 'Fotografía'
    },
    { 
      id: 'closing', 
      title: 'Gala Nocturna', 
      subtitle: 'Nominaciones y votaciones secretas de la jornada', 
      icon: Crown,
      tag: 'Coronación'
    }
  ];

  const currentDayNumber = (selectedDayIndex || 0) + 1;
  const activeGame = gameTabs.find(t => t.id === activeSubTab) || gameTabs[0];

  return (
    <div className="space-y-3.5 pb-24">
      {/* 1. Small Game Cards Selector (Distinctive Lucide Icons Only) */}
      <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-2xl bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 shadow-md">
        {gameTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              aria-label={tab.title}
              title={tab.title}
              className={`flex-1 h-12 sm:h-13 rounded-xl flex items-center justify-center transition-all relative cursor-pointer select-none ${
                isActive
                  ? 'bg-[#ff3b68] text-white shadow-lg shadow-[#ff3b68]/35 scale-[1.04]'
                  : 'text-zinc-400 dark:text-zinc-400 light:text-zinc-500 hover:text-zinc-100 dark:hover:text-white light:hover:text-zinc-900 hover:bg-zinc-800/60 dark:hover:bg-zinc-800/60 light:hover:bg-zinc-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.9]'}`} />
              {isActive && (
                <motion.div
                  layoutId="activeGameIndicator"
                  className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white shadow-sm"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Active Game Title Header (Shown Underneath Cards) */}
      <div className="px-1 flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-black text-zinc-100 dark:text-zinc-100 light:text-zinc-900 tracking-tight flex items-center gap-1.5">
            <span>{activeGame.title}</span>
            <span className="text-[10px] font-bold text-[#ff3b68] bg-[#ff3b68]/10 dark:bg-[#ff3b68]/10 light:bg-rose-50 px-2 py-0.5 rounded-full border border-[#ff3b68]/25 light:border-rose-200">
              {activeGame.tag}
            </span>
          </h2>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mt-0.5">
            {activeGame.subtitle}
          </p>
        </div>
      </div>

      {/* 3. Render Selected Game Content */}
      {activeSubTab === 'missions' && (
        <DailyMissionView
          activeMember={activeMember}
          isAdmin={isAdmin}
          selectedDayNumber={currentDayNumber}
        />
      )}

      {activeSubTab === 'bingo' && (
        <BingoView
          bingoData={bingoData}
          activeMember={activeMember}
          isAdmin={isAdmin}
          onToggleBingoItem={onToggleBingoItem}
          onCompleteBingoItem={onCompleteBingoItem}
          onUnmarkBingoItem={onUnmarkBingoItem}
          onAddBingoItem={onAddBingoItem}
          onClaimLine={onClaimLine}
        />
      )}

      {activeSubTab === 'details' && (
        <DetailHuntView
          activeMember={activeMember}
          isAdmin={isAdmin}
        />
      )}

      {activeSubTab === 'colors' && (
        <ColorHuntView
          colorChallenges={colorChallenges}
          activeMember={activeMember}
          onSubmitColorPhoto={onSubmitColorPhoto}
        />
      )}

      {activeSubTab === 'closing' && (
        <DayClosingView
          activeMember={activeMember}
          members={members}
          isAdmin={isAdmin}
          selectedDayNumber={currentDayNumber}
        />
      )}
    </div>
  );
}

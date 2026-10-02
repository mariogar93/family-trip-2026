import React from 'react';
import { CalendarDays, Gamepad2, Home, Wallet, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'itinerary', label: 'Itinerario', icon: CalendarDays },
    { id: 'games', label: 'Juegos', icon: Gamepad2, hasNotification: true },
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'expenses', label: 'Gastos', icon: Wallet },
    { id: 'trophy', label: 'Trofeos', icon: Trophy },
  ];

  return (
    <div 
      className="fixed left-3 right-3 sm:left-4 sm:right-4 max-w-[420px] mx-auto z-40 pointer-events-none"
      style={{
        bottom: 'max(1.75rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))'
      }}
    >
      <nav 
        className="pointer-events-auto mx-auto h-[64px] px-3.5 rounded-full bg-[#0d121f]/65 dark:bg-[#0a0e18]/65 light:bg-white/75 backdrop-blur-2xl border border-white/[0.12] dark:border-white/[0.12] light:border-zinc-300/80 flex items-center justify-between gap-1 shadow-2xl transition-all"
        style={{
          boxShadow: '0 20px 50px -6px rgba(0, 0, 0, 0.8), 0 0 30px -2px rgba(255, 59, 104, 0.2)'
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (isActive) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                aria-label={tab.label}
                className="relative h-11 px-4 sm:px-5 rounded-full bg-[#ff3b68] text-white flex items-center gap-2 font-black shadow-lg shadow-[#ff3b68]/40 select-none cursor-pointer transition-transform active:scale-95 flex-shrink-0"
              >
                <Icon className="w-5 h-5 stroke-[2] flex-shrink-0" />
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.18 }}
                  className="text-xs sm:text-sm font-black tracking-tight whitespace-nowrap overflow-hidden"
                >
                  {tab.label}
                </motion.span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              className="relative w-11 sm:w-12 h-11 flex items-center justify-center rounded-full text-[#8e9cb2] hover:text-white dark:hover:text-white light:text-zinc-500 light:hover:text-zinc-900 transition-all select-none cursor-pointer active:scale-90 flex-shrink-0"
            >
              <Icon className="w-5.5 h-5.5 stroke-[1.8]" />
              {tab.hasNotification && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#ff3b68] ring-2 ring-[#0a0e18] dark:ring-[#0a0e18] light:ring-white" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

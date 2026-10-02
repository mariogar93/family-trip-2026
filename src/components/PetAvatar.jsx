import React, { useState, useEffect } from 'react';

const PET_DATA = {
  koala: {
    id: 'koala',
    name: 'Koala Turista',
    emoji: '🐨',
    badge: 'Zen & Relajado',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Viaja con calma, disfruta la brisa, ama las vistas panorámicas y las buenas siestas.',
    stats: { energia: 65, apetito: 85, curiosidad: 90 }
  },
  panda: {
    id: 'panda',
    name: 'Panda Glotón',
    emoji: '🐼',
    badge: 'Crítico Culinario',
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-emerald-600',
    description: 'Su misión principal en cada país es probar todos los bocadillos, panes y postres del Bingo.',
    stats: { energia: 70, apetito: 100, curiosidad: 80 }
  },
  pato: {
    id: 'pato',
    name: 'Pato Mochilero',
    emoji: '🦆',
    badge: 'Guía de Ruta',
    color: '#eab308',
    gradient: 'from-amber-400 to-emerald-500',
    description: 'Siempre tiene su mochila al hombro y los boletos listos. Le fascina el agua y los parques.',
    stats: { energia: 90, apetito: 80, curiosidad: 85 }
  },
  zorro: {
    id: 'zorro',
    name: 'Zorro Explorador',
    emoji: '🦊',
    badge: 'Descubridor Secreto',
    color: '#f97316',
    gradient: 'from-orange-500 to-emerald-600',
    description: 'Astuto explorador de miradores, tiendas escondidas y rincones llenos de magia.',
    stats: { energia: 95, apetito: 75, curiosidad: 98 }
  },
  pinguino: {
    id: 'pinguino',
    name: 'Pingüino Fotógrafo',
    emoji: '🐧',
    badge: 'Maestro de la Cámara',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-teal-500',
    description: 'Experto en posar y encuadrar las mejores tomas para los retos de fotos.',
    stats: { energia: 80, apetito: 70, curiosidad: 95 }
  },
  gato: {
    id: 'gato',
    name: 'Gato Curioso',
    emoji: '🐱',
    badge: 'Cazador de Souvenirs',
    color: '#a855f7',
    gradient: 'from-purple-500 to-emerald-600',
    description: 'Investiga cada mercadillo y callejón colonial buscando objetos brillantes.',
    stats: { energia: 85, apetito: 80, curiosidad: 100 }
  },
  leon: {
    id: 'leon',
    name: 'León Aventurero',
    emoji: '🦁',
    badge: 'Líder Valiente',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    description: 'El primero en subir a la cima de la montaña y liderar al grupo en las caminatas.',
    stats: { energia: 100, apetito: 90, curiosidad: 90 }
  },
  oso: {
    id: 'oso',
    name: 'Oso Montañero',
    emoji: '🐻',
    badge: 'Guardián del Grupo',
    color: '#854d0e',
    gradient: 'from-stone-600 to-emerald-700',
    description: 'Fuerte y cariñoso, cuida el equipaje de todos y disfruta de un buen banquete familiar.',
    stats: { energia: 85, apetito: 95, curiosidad: 75 }
  },
  conejo: {
    id: 'conejo',
    name: 'Conejo Veloz',
    emoji: '🐰',
    badge: 'Hiperactivo',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    description: 'Lleno de energía inagotable, no se cansa de recorrer museos y plazas sin parar.',
    stats: { energia: 100, apetito: 85, curiosidad: 90 }
  }
};

const ACCESSORIES = {
  none: { label: 'Sin accesorio', icon: '' },
  sunglasses: { label: 'Gafas de Sol VIP', icon: '🕶️' },
  safari: { label: 'Sombrero Safari', icon: '🤠' },
  camera: { label: 'Cámara Réflex', icon: '📷' },
  medal: { label: 'Medalla de Oro', icon: '🥇' },
  backpack: { label: 'Mochila Trotamundos', icon: '🎒' }
};

const PET_STATES = {
  idle: {
    id: 'idle',
    label: 'Listo para Aventura',
    icon: '🐾',
    title: 'Compañero de Viaje',
    subtitle: 'Esperando el siguiente plan familiar'
  },
  exploring: {
    id: 'exploring',
    label: 'Explorando',
    icon: '🧭',
    title: '¡En Marcha!',
    subtitle: 'Visitando lugares del itinerario'
  },
  eating: {
    id: 'eating',
    label: 'Con Apetito',
    icon: '🍽️',
    title: 'Antojo de Tapas',
    subtitle: 'Momento de probar algo del Bingo'
  },
  sleeping: {
    id: 'sleeping',
    label: 'Descansando',
    icon: '😴',
    title: 'Recargando Baterías',
    subtitle: 'Zzz... descansando para mañana'
  },
  happy: {
    id: 'happy',
    label: 'Celebrando',
    icon: '🎉',
    title: '¡Celebrando Logros!',
    subtitle: '¡Misión o reto familiar completado!'
  }
};

export { PET_DATA, ACCESSORIES, PET_STATES };

export default function PetAvatar({ 
  petType = 'koala', 
  accessory = 'none', 
  level = 1, 
  size = 'md', 
  animated = false,
  state = 'idle' // 'idle' | 'exploring' | 'eating' | 'sleeping' | 'happy'
}) {
  const [gifFailed, setGifFailed] = useState(false);
  const [accGifFailed, setAccGifFailed] = useState(false);

  const pet = PET_DATA[petType] || PET_DATA.koala;
  const acc = ACCESSORIES[accessory] || ACCESSORIES.none;
  const stateMeta = PET_STATES[state] || PET_STATES.exploring;

  const sizeClasses = {
    xs: 'w-7 h-7 text-base rounded-xl',
    sm: 'w-10 h-10 text-xl rounded-2xl',
    md: 'w-14 h-14 text-3xl rounded-2xl',
    lg: 'w-20 h-20 text-5xl rounded-3xl',
    xl: 'w-28 h-28 text-6xl rounded-3xl',
    hero: 'w-32 h-32 sm:w-36 sm:h-36 text-7xl rounded-[30px]',
  }[size] || 'w-14 h-14 text-3xl rounded-2xl';

  const badgeSizes = {
    xs: 'text-[8px] px-1 -bottom-1 -right-1',
    sm: 'text-[9px] px-1.5 -bottom-1 -right-1',
    md: 'text-[11px] px-2 -bottom-1.5 -right-1.5',
    lg: 'text-xs px-2.5 -bottom-2 -right-2',
    xl: 'text-sm px-3 -bottom-2 -right-2',
    hero: 'text-sm px-3.5 py-0.5 -bottom-2.5 -right-2',
  }[size] || 'text-[11px] px-1.5';

  // Path to state gif: e.g. /pets/pinguino/exploring.gif, fallback to idle.gif
  const activeGifState = state === 'sleeping' ? 'idle' : (state || 'idle');
  const gifSrc = `/pets/${petType}/${activeGifState}.gif`;
  const accGifSrc = accessory && accessory !== 'none' ? `/pets/accessories/${accessory}.gif` : null;

  useEffect(() => {
    setGifFailed(false);
  }, [gifSrc]);

  useEffect(() => {
    setAccGifFailed(false);
  }, [accGifSrc]);

  const isHero = size === 'hero' || size === 'xl';

  return (
    <div className={`relative inline-flex items-center justify-center p-1 shadow-lg flex-shrink-0 bg-gradient-to-br ${pet.gradient} rounded-[24px] ${isHero ? 'rounded-[34px]' : ''} ${animated ? 'animate-pet' : ''}`}>
      <div className={`flex items-center justify-center bg-zinc-950/85 dark:bg-zinc-950/85 light:bg-white/90 backdrop-blur-md ${sizeClasses} relative overflow-visible select-none`}>
        


        {/* GIF Renderer with Graceful Illustrated Fallback */}
        {!gifFailed ? (
          <img
            src={gifSrc}
            alt={pet.name}
            onError={() => setGifFailed(true)}
            className="w-full h-full object-contain transform hover:scale-105 transition-transform"
          />
        ) : (
          <div className="relative flex items-center justify-center">
            <span className="transform hover:scale-110 transition-transform drop-shadow-md">
              {pet.emoji}
            </span>
          </div>
        )}

        {/* Accessory Overlay */}
        {acc.icon && (
          <span className={`absolute ${isHero ? '-top-3 -right-2 text-2xl' : '-top-2 -right-1.5 text-sm md:text-base'} drop-shadow-md select-none`}>
            {!accGifFailed && accGifSrc ? (
              <img
                src={accGifSrc}
                alt={acc.label}
                onError={() => setAccGifFailed(true)}
                className={isHero ? 'w-8 h-8 object-contain' : 'w-6 h-6 object-contain'}
              />
            ) : (
              acc.icon
            )}
          </span>
        )}

        {/* Level Indicator Pill */}
        {level !== undefined && !isHero && (
          <span className={`absolute ${badgeSizes} font-black rounded-full bg-black text-emerald-400 border border-emerald-500/50 shadow-md flex items-center gap-0.5 tracking-tight`}>
            <span className="text-[9px] text-zinc-400 font-normal">Nv</span>{level}
          </span>
        )}
      </div>
    </div>
  );
}

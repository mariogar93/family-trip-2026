import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

export default function PWAInstallBanner({ installPrompt, onInstall }) {
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);
  }, []);

  if (isStandalone || dismissed) {
    return null;
  }

  // If Android/Chrome install prompt is ready
  if (installPrompt) {
    return (
      <div className="mx-4 my-2 p-3 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 border border-teal-500/40 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">📱</span>
          <div>
            <h4 className="text-xs font-bold text-white">Instala la App en tu Móvil</h4>
            <p className="text-[10px] text-teal-400">Úsala a pantalla completa y sin conexión</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onInstall}
            className="py-1.5 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow transition-all flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> Instalar
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // If iOS Safari instructions
  if (isIOS) {
    return (
      <div className="mx-4 my-2 p-3 rounded-2xl bg-slate-900/90 border border-teal-500/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl">📲</span>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white">Instala la App en tu iPhone</h4>
            <p className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5 truncate">
              Toca <Share className="w-3 h-3 text-teal-400 inline" /> y luego "Agregar a Inicio" <PlusSquare className="w-3 h-3 text-teal-400 inline" />
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-slate-500 hover:text-white flex-shrink-0 ml-2"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return null;
}

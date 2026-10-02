import React, { useState, useMemo, useEffect } from 'react';
import { Utensils, Camera, Check, Sparkles, X, Trophy, Plus, Crown, Medal, Award, Flame, Eye, EyeOff, Search, Edit2, Trash2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const FOOD_ICONS = [
  '🥘', '🍕', '🍝', '🍷', '☕', '🍨', '🥐', '🧀', 
  '🥩', '🥪', '🍰', '🍤', '🥗', '🍦', '🍺', '🍹', 
  '🥖', '🍮', '🥓', '🍋', '🍫', '🥣', '🧆', '🐙'
];

const CATEGORIES = [
  'Plato Fuerte',
  'Tapas / Aperitivo',
  'Postre / Dulce',
  'Bebida',
  'Street Food / Al paso',
  'Desayuno',
  'Especial'
];

export const STANDARD_HINTS = [
  { label: 'Postre o dulce típico', icon: '🍰' },
  { label: 'Helado de sabor curioso o artesanal', icon: '🍨' },
  { label: 'Comida en puesto callejero / Street Food', icon: '🥪' },
  { label: 'Fruta exótica o local', icon: '🍋' },
  { label: 'Plato fuerte tradicional', icon: '🥘' },
  { label: 'Tapa o aperitivo clásico', icon: '🍤' },
  { label: 'Bebida o cóctel emblemático', icon: '🍷' },
  { label: 'Pasta o arroz artesanal', icon: '🍝' },
  { label: 'Desayuno o bollería local', icon: '🥐' },
  { label: 'Especialidad marina o de mercado', icon: '🐙' },
  { label: 'Embutido o queso curado', icon: '🧀' },
  { label: 'Café o infusión tradicional', icon: '☕' }
];

function seededShuffle(array, seed) {
  const arr = [...array];
  let m = arr.length;
  let t, i;
  let s = Math.abs(seed) || 1;

  while (m) {
    s = (s * 9301 + 49297) % 233280;
    i = Math.floor((s / 233280) * m--);
    t = arr[m];
    arr[m] = arr[i];
    arr[i] = t;
  }
  return arr;
}

function normalizeText(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function cleanWord(w) {
  let s = (w || '').trim().toLowerCase();
  if (s.endsWith('es') && s.length > 4) s = s.slice(0, -2);
  else if (s.endsWith('s') && s.length > 3) s = s.slice(0, -1);
  return s;
}

const COMMON_SYNONYMS = {
  calamar: ['calamares', 'bocadillo de calamares'],
  calamares: ['calamar', 'bocadillo de calamares'],
  croqueta: ['croquetas'],
  croquetas: ['croqueta'],
  patata: ['patatas', 'bravas', 'patatas bravas'],
  patatas: ['patata', 'bravas', 'patatas bravas'],
  bravas: ['patatas bravas', 'patatas'],
  tortilla: ['tortilla espanola', 'tortilla de patatas', 'pincho de tortilla'],
  churro: ['churros', 'chocolate'],
  churros: ['churro', 'chocolate con churros'],
  helado: ['gelato', 'gelato artesanal'],
  gelato: ['helado', 'gelato artesanal'],
  pizza: ['margherita', 'calzone'],
  carbonara: ['pasta', 'pasta carbonara'],
  espagueti: ['pasta', 'spaghetti'],
  espaguetis: ['pasta', 'spaghetti'],
  spaghetti: ['pasta', 'espagueti'],
  lasana: ['lasagna'],
  lasaña: ['lasagna'],
  lasagna: ['lasaña'],
  tiramisu: ['tiramisu tradicional'],
  spritz: ['aperol', 'aperol spritz'],
  aperol: ['spritz', 'aperol spritz'],
  focaccia: ['focaccia con romero'],
  limoncello: ['limon', 'chupito'],
  cafe: ['espresso', 'cappuccino'],
  espresso: ['cafe'],
  cappuccino: ['cafe', 'capuchino'],
  capuchino: ['cafe', 'cappuccino'],
  cerveza: ['cana', 'caña'],
  vino: ['tinto', 'sangria']
};

function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

function isFlexibleMatch(userInput, dishTitle) {
  const normInput = normalizeText(userInput);
  const normTitle = normalizeText(dishTitle);

  if (normTitle.includes(normInput) || normInput.includes(normTitle)) {
    return true;
  }

  const inputWords = normInput.split(/\s+/).map(cleanWord).filter(w => w.length >= 3);
  const titleWords = normTitle.split(/\s+/).map(cleanWord).filter(w => w.length >= 3);

  for (const iw of inputWords) {
    for (const tw of titleWords) {
      if (iw === tw || tw.includes(iw) || iw.includes(tw)) {
        return true;
      }
      const syns = COMMON_SYNONYMS[iw] || [];
      if (syns.some(syn => tw.includes(cleanWord(syn)) || cleanWord(syn).includes(tw))) {
        return true;
      }
      if (Math.abs(iw.length - tw.length) <= 2 && iw.length >= 4) {
        if (levenshteinDistance(iw, tw) <= 1) {
          return true;
        }
      }
    }
  }

  return false;
}

export default function BingoView({ 
  bingoData = { items: [], winners: [], linesClaimed: [], countries: ['España', 'Italia'] }, 
  activeMember, 
  isAdmin = false,
  onToggleBingoItem,
  onCompleteBingoItem,
  onUnmarkBingoItem,
  onAddBingoItem,
  onClaimLine
}) {
  const completeBingoItem = onCompleteBingoItem || onToggleBingoItem;
  const unmarkBingoItem = onUnmarkBingoItem || onToggleBingoItem;
  const [selectedCountry, setSelectedCountry] = useState('España');
  const [isBlindMode, setIsBlindMode] = useState(true);
  const [guessInput, setGuessInput] = useState('');
  const [guessFeedback, setGuessFeedback] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Admin Modals
  const [showAdminAddModal, setShowAdminAddModal] = useState(false);
  const [showAdminCatalogModal, setShowAdminCatalogModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [dishTitle, setDishTitle] = useState('');
  const [dishIcon, setDishIcon] = useState(STANDARD_HINTS[0].icon);
  const [dishCategory, setDishCategory] = useState('Plato Fuerte');
  const [dishHintCategory, setDishHintCategory] = useState(STANDARD_HINTS[0].label);
  const [dishCountry, setDishCountry] = useState('España');

  const effectiveBlindMode = isAdmin ? isBlindMode : true;

  // Catalog items (from server or bingoData)
  const [catalogItems, setCatalogItems] = useState([]);
  const [catalogCountryFilter, setCatalogCountryFilter] = useState('España');

  // Winner Celebration Banner
  const [celebrationData, setCelebrationData] = useState(null);

  // Filter items for current selected country
  const countryItems = useMemo(() => {
    return (bingoData.items || []).filter(item => (item.country || 'España') === selectedCountry);
  }, [bingoData.items, selectedCountry]);

  // Generate unique shuffled board for active member (16 items)
  const shuffledBoard = useMemo(() => {
    if (!countryItems.length) return [];
    const seed = (activeMember?.id || 1) * 31 + selectedCountry.length * 17;
    return seededShuffle(countryItems, seed).slice(0, 16);
  }, [countryItems, activeMember?.id, selectedCountry]);

  // Check if current user has completed an item
  const isItemCompletedByMe = (item) => {
    if (!activeMember || !item) return false;
    return (item.completions || []).some(c => c.member_id === activeMember.id);
  };

  // Find winner for current country
  const countryWinners = useMemo(() => {
    return (bingoData.winners || []).filter(w => (w.country || 'España') === selectedCountry);
  }, [bingoData.winners, selectedCountry]);

  const countryChampion = countryWinners.find(w => w.rank === 1);

  // Fetch full catalog for admin
  const fetchCatalog = async () => {
    try {
      const res = await fetch('/api/bingo/catalog');
      const data = await res.json();
      setCatalogItems(data.items || []);
    } catch (e) {
      console.error('Error fetching catalog', e);
    }
  };

  useEffect(() => {
    if (showAdminCatalogModal) {
      fetchCatalog();
    }
  }, [showAdminCatalogModal]);

  // Check Lines & Diagonals
  useEffect(() => {
    if (!activeMember || shuffledBoard.length < 16) return;

    const lines = [
      { key: 'row-0', indices: [0, 1, 2, 3], name: 'Fila 1' },
      { key: 'row-1', indices: [4, 5, 6, 7], name: 'Fila 2' },
      { key: 'row-2', indices: [8, 9, 10, 11], name: 'Fila 3' },
      { key: 'row-3', indices: [12, 13, 14, 15], name: 'Fila 4' },
      { key: 'col-0', indices: [0, 4, 8, 12], name: 'Columna 1' },
      { key: 'col-1', indices: [1, 5, 9, 13], name: 'Columna 2' },
      { key: 'col-2', indices: [2, 6, 10, 14], name: 'Columna 3' },
      { key: 'col-3', indices: [3, 7, 11, 15], name: 'Columna 4' },
      { key: 'diag-0', indices: [0, 5, 10, 15], name: 'Diagonal Principal' },
      { key: 'diag-1', indices: [3, 6, 9, 12], name: 'Diagonal Inversa' }
    ];

    lines.forEach(async (line) => {
      const isComplete = line.indices.every(idx => isItemCompletedByMe(shuffledBoard[idx]));
      if (!isComplete) return;

      const alreadyClaimed = (bingoData.linesClaimed || []).some(
        lc => lc.country === selectedCountry && lc.member_id === activeMember.id && lc.line_key === line.key
      );

      if (!alreadyClaimed) {
        await handleClaimLineInternal(line.key, line.name);
      }
    });
  }, [shuffledBoard, bingoData.items, activeMember?.id]);

  const handleClaimLineInternal = async (lineKey, lineName) => {
    try {
      const res = await onClaimLine({
        country: selectedCountry,
        member_id: activeMember.id,
        line_key: lineKey
      });

      if (res && res.success) {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#ff3b68', '#10b981', '#fbbf24', '#ffffff']
        });

        setCelebrationData({
          title: res.isWinner ? `¡CAMPEÓN DE ${selectedCountry.toUpperCase()}!` : '¡LÍNEA DE BINGO!',
          lineName,
          bonus_xp: res.bonus_xp,
          isWinner: res.isWinner
        });
      }
    } catch (e) {
      console.error('Error claiming line:', e);
    }
  };

  const handleTileClick = (item) => {
    setSelectedItem(item);
    setPhotoFile(null);
    const myComp = (item.completions || []).find(c => c.member_id === activeMember?.id);
    setPreviewUrl(myComp?.photo_url || '');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedItem || !activeMember) return;
    setSubmitting(true);
    try {
      await completeBingoItem(selectedItem.id, activeMember.id, photoFile);
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#ff3b68', '#f59e0b', '#3b82f6']
      });
      setSelectedItem(null);
    } catch (err) {
      alert('Error al guardar foto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnmarkItem = async () => {
    if (!selectedItem || !activeMember) return;
    setSubmitting(true);
    try {
      await unmarkBingoItem(selectedItem.id, activeMember.id);
      setSelectedItem(null);
    } catch (err) {
      alert('Error al desmarcar casilla');
    } finally {
      setSubmitting(false);
    }
  };

  // Blind guess logic
  const handleTestGuess = async (e) => {
    e?.preventDefault();
    if (!guessInput.trim() || !activeMember) return;

    // 1. Search in user's current 4x4 board using flexible smart matching
    const matchedTile = shuffledBoard.find(item => isFlexibleMatch(guessInput, item.title));

    if (matchedTile) {
      const alreadyCompleted = isItemCompletedByMe(matchedTile);
      if (!alreadyCompleted) {
        await completeBingoItem(matchedTile.id, activeMember.id, null);
      }

      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.65 },
        colors: ['#ff3b68', '#f59e0b', '#3b82f6']
      });

      setGuessFeedback({
        type: 'success',
        text: alreadyCompleted
          ? `"${matchedTile.title}" ya estaba marcado. ¡Aquí puedes gestionar tu foto!`
          : `🎉 ¡BINGO! Acertaste "${matchedTile.title}" (+10 XP). ¡Sube tu foto si quieres!`
      });

      const myExistingComp = (matchedTile.completions || []).find(c => c.member_id === activeMember.id);
      const completedTile = {
        ...matchedTile,
        completions: [
          ...(matchedTile.completions || []).filter(c => c.member_id !== activeMember.id),
          { member_id: activeMember.id, photo_url: myExistingComp?.photo_url || null }
        ]
      };

      setSelectedItem(completedTile);
      setPhotoFile(null);
      setPreviewUrl(myExistingComp?.photo_url || '');
      setGuessInput('');
      return;
    }

    // 2. Search in all country items (not in this user's board)
    const matchInCountry = countryItems.find(item => isFlexibleMatch(guessInput, item.title));

    if (matchInCountry) {
      setGuessFeedback({
        type: 'info',
        text: `😋 ¡Qué rico! "${matchInCountry.title}" es comida típica de ${selectedCountry}, pero no está en tu cartón de hoy. ¡Sigue probando!`
      });
    } else {
      setGuessFeedback({
        type: 'warning',
        text: `🤔 No encontramos "${guessInput}" en el menú de ${selectedCountry}. Intenta con el ingrediente o nombre principal.`
      });
    }
    setGuessInput('');
  };

  // Admin Create Item
  const handleCreateAdminItem = async (e) => {
    e.preventDefault();
    if (!dishTitle.trim()) return;
    await onAddBingoItem({
      title: dishTitle.trim(),
      icon: dishIcon,
      category: dishCategory,
      hint_category: dishHintCategory,
      country: selectedCountry
    });
    setDishTitle('');
    setShowAdminAddModal(false);
    fetchCatalog();
  };

  // Admin Edit Item
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem || !dishTitle.trim()) return;
    try {
      await fetch(`/api/bingo/item/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: dishTitle.trim(),
          icon: dishIcon,
          category: dishCategory,
          hint_category: dishHintCategory,
          country: dishCountry
        })
      });
      setEditingItem(null);
      fetchCatalog();
      if (onAddBingoItem) {
        // Trigger parent refresh
        onAddBingoItem({ refreshOnly: true });
      }
    } catch (err) {
      alert('Error al actualizar plato');
    }
  };

  // Admin Delete Item
  const handleDeleteItem = async (id, title) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${title}" del catálogo?`)) return;
    try {
      await fetch(`/api/bingo/item/${id}`, { method: 'DELETE' });
      fetchCatalog();
      if (onAddBingoItem) {
        onAddBingoItem({ refreshOnly: true });
      }
    } catch (err) {
      alert('Error al eliminar plato');
    }
  };

  const myCompletedCount = shuffledBoard.filter(isItemCompletedByMe).length;

  return (
    <div className="pb-safe pt-1 space-y-3.5">
      {/* 1. Clear Country Toggle: España vs Italia + Organizer Buttons */}
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

        {isAdmin && (
          <div className="flex gap-1">
            <button
              onClick={() => {
                setCatalogCountryFilter(selectedCountry);
                setShowAdminCatalogModal(true);
              }}
              className="px-2.5 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Ver y editar todo el catálogo"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span className="hidden sm:inline">Catálogo</span>
            </button>

            <button
              onClick={() => {
                setDishTitle('');
                setDishIcon('🍕');
                setDishCategory('Plato Fuerte');
                setDishHintCategory('Especialidad gastronómica');
                setDishCountry(selectedCountry);
                setShowAdminAddModal(true);
              }}
              className="px-2.5 py-2 rounded-2xl bg-[#ff3b68]/15 hover:bg-[#ff3b68]/25 border border-[#ff3b68]/35 text-[#ff3b68] text-xs font-extrabold flex items-center gap-1 cursor-pointer flex-shrink-0"
              title="Añadir plato al Bingo de este país"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Plato</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Blind Mode Toggle & Progress Pill */}
      <div className="flex items-center justify-between bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 p-2.5 px-3.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-300">
            Tu Cartón: <span className="text-[#ff3b68] font-black">{myCompletedCount}/16</span>
          </span>
          <span className="text-[10px] text-zinc-500">• {isAdmin ? (effectiveBlindMode ? 'Modo a Ciegas' : 'Modo Visible') : 'Modo Misterio'}</span>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsBlindMode(!isBlindMode)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
              effectiveBlindMode
                ? 'bg-[#ff3b68]/15 border-[#ff3b68]/40 text-[#ff3b68]'
                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200'
            }`}
          >
            {effectiveBlindMode ? <EyeOff className="w-3.5 h-3.5 text-[#ff3b68]" /> : <Eye className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />}
            <span>{effectiveBlindMode ? 'A Ciegas' : 'Visible'}</span>
          </button>
        )}
      </div>

      {/* 3. Blind Guess Input: "¿Qué probaste hoy?" */}
      <form onSubmit={handleTestGuess} className="space-y-1.5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            placeholder={`¿Qué probaste hoy en ${selectedCountry}? Ej: Calamares, Carbonara...`}
            className="w-full pl-3.5 pr-24 py-2.5 bg-white dark:bg-zinc-950/90 border border-zinc-300 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-zinc-100 text-xs font-medium outline-none focus:border-[#ff3b68] focus:ring-1 focus:ring-[#ff3b68] shadow-inner"
          />
          <button
            type="submit"
            disabled={!guessInput.trim()}
            className="absolute right-1.5 px-3.5 py-1.5 rounded-xl bg-[#ff3b68] hover:bg-[#e02854] disabled:opacity-40 text-white text-xs font-black flex items-center gap-1 shadow-md shadow-[#ff3b68]/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Probar</span>
          </button>
        </div>

        {/* Feedback alert */}
        <AnimatePresence>
          {guessFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between ${
                guessFeedback.type === 'success'
                  ? 'bg-rose-500/20 dark:bg-rose-500/20 light:bg-rose-50 text-rose-300 dark:text-rose-300 light:text-rose-800 border border-rose-500/30 light:border-rose-200'
                  : guessFeedback.type === 'warning'
                  ? 'bg-amber-500/20 dark:bg-amber-500/20 light:bg-amber-50 text-amber-300 dark:text-amber-300 light:text-amber-800 border border-amber-500/30 light:border-amber-200'
                  : 'bg-blue-500/20 dark:bg-blue-500/20 light:bg-blue-50 text-blue-300 dark:text-blue-300 light:text-blue-800 border border-blue-500/30 light:border-blue-200'
              }`}
            >
              <span>{guessFeedback.text}</span>
              <button 
                type="button" 
                onClick={() => setGuessFeedback(null)}
                className="text-zinc-400 hover:text-white ml-2 text-xs cursor-pointer"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* 4. Winner Banner or Challenge Header */}
      {countryChampion ? (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#ff3b68]/15 to-amber-500/10 border border-amber-400/30 shadow-lg flex items-center gap-3 relative overflow-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-xl flex-shrink-0">
            👑
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider">
              <span>Gran Campeón de {selectedCountry}</span>
              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-xs font-black text-zinc-100 dark:text-zinc-100 light:text-zinc-900 truncate">
              {countryChampion.member_name} fue el primer ganador del Bingo
            </p>
          </div>
        </motion.div>
      ) : null}

      {/* 5. 4x4 Bingo Grid (16 Tiles) - High contrast & crystal clear */}
      <div className="grid grid-cols-4 gap-2">
        {shuffledBoard.map((item, index) => {
          const isCompleted = isItemCompletedByMe(item);
          const hasPhotos = (item.completions || []).some(c => !!c.photo_url);

          return (
            <motion.button
              key={`${item.id}-${index}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleTileClick(item)}
              className={`aspect-square p-2 rounded-2xl flex flex-col items-center justify-center text-center transition-all relative border-2 cursor-pointer select-none overflow-hidden ${
                isCompleted
                  ? 'bg-[#ff3b68] border-[#ff3b68] text-white shadow-lg shadow-[#ff3b68]/30 ring-2 ring-[#ff3b68]/40'
                  : 'bg-white dark:bg-[#131722] border-zinc-200 dark:border-[#222a3d] hover:border-[#ff3b68] shadow-sm text-zinc-900 dark:text-zinc-100'
              }`}
            >
              {isCompleted && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white text-[#ff3b68] flex items-center justify-center shadow-md">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              {hasPhotos && (
                <div className="absolute bottom-1 left-1 text-[10px]">
                  📸
                </div>
              )}

              {/* Icon */}
              <span className="text-2xl sm:text-3xl block mb-1">
                {isCompleted || !effectiveBlindMode ? (item.icon || '🍽️') : '❓'}
              </span>

              {/* Title / Clue - Clean text without background */}
              {isCompleted || !effectiveBlindMode ? (
                <span className={`text-[11px] sm:text-xs leading-tight line-clamp-2 px-0.5 ${
                  isCompleted 
                    ? 'text-white font-black' 
                    : 'text-zinc-950 dark:text-zinc-50 font-black'
                }`}>
                  {item.title}
                </span>
              ) : (
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-tight line-clamp-2 px-0.5 leading-tight text-zinc-600 dark:text-zinc-400 bg-transparent shadow-none">
                  {item.hint_category || item.category || 'Misterio'}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="text-center text-[10px] text-zinc-500">
        {isBlindMode ? 'Modo a Ciegas activado: escribe lo que comas o toca una casilla al probarla.' : 'Cada casilla completada otorga +10 XP.'} Completa 4 en fila o diagonal para la bonificación mayor.
      </div>

      {/* Completion & Mystery Modal */}
      {selectedItem && (() => {
        const isItemCompleted = isItemCompletedByMe(selectedItem);

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl border border-[#ff3b68]/30 p-5 shadow-2xl text-center">
              {isItemCompleted ? (
                /* === 1. COMPLETED / REVEALED TILE MODAL === */
                <>
                  <div className="text-4xl mb-2">
                    {selectedItem.icon || '🍽️'}
                  </div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 leading-snug">
                    {selectedItem.title}
                  </h3>
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#ff3b68] bg-[#ff3b68]/10 px-2.5 py-0.5 rounded-full mt-1 border border-[#ff3b68]/20">
                    {selectedItem.hint_category || selectedItem.category || 'Especialidad'}
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                    ¡Casilla completada (+10 XP)! Puedes adjuntar o actualizar la foto familiar para el álbum de viaje.
                  </p>

                  <div className="mt-4">
                    {previewUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border border-[#ff3b68]/40 mb-3 max-h-44 mx-auto">
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
                      <label className="block p-4 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#ff3b68] bg-zinc-50 dark:bg-zinc-900/60 cursor-pointer mb-3 transition-colors">
                        <Camera className="w-6 h-6 mx-auto text-[#ff3b68] mb-1" />
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                          {previewUrl ? 'Cambiar foto' : 'Subir foto del plato (opcional)'}
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Guárdala en el diario del viaje</span>
                        <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                      </label>
                    )}
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(null)}
                        className="flex-1 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                      >
                        Cerrar
                      </button>
                      {photoFile && (
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={handleSavePhoto}
                          className="flex-1 py-2.5 rounded-xl bg-[#ff3b68] hover:bg-[#e02854] text-white font-black text-xs shadow-md shadow-[#ff3b68]/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          <span>Guardar Foto</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleUnmarkItem}
                      className="w-full py-2.5 rounded-xl text-[11px] font-black text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer border border-rose-500/25"
                    >
                      Desmarcar esta casilla
                    </button>
                  </div>
                </>
              ) : (
                /* === 2. MYSTERY UNCOMPLETED MODAL (NEVER SPOILS DISH NAME) === */
                <>
                  <div className="text-5xl mb-3">
                    ❓
                  </div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 leading-snug">
                    {selectedItem.hint_category || selectedItem.category || 'Misterio Gastronómico'}
                  </h3>
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full mt-1.5 border border-amber-500/20">
                    Pista Secreta
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2.5 leading-relaxed">
                    ¿Qué delicia típica de {selectedCountry} se esconderá aquí? 
                    <br /><br />
                    Para no arruinar la sorpresa, escribe lo que pruebes en el buscador superior <strong>"¿Qué probaste hoy?"</strong> para desbloquearla (+10 XP) y agregar su foto familiar.
                  </p>

                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-black text-zinc-900 dark:text-white transition-colors cursor-pointer"
                    >
                      ¡A buscar en los menús!
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* Line Winner Celebration Modal */}
      {celebrationData && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-zinc-950 rounded-3xl border-2 border-[#ff3b68] p-6 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="text-5xl mb-3 animate-bounce">
              {celebrationData.isWinner ? '🏆' : '🎉'}
            </div>
            <h2 className="text-xl font-black text-white leading-tight">
              {celebrationData.title}
            </h2>
            <p className="text-xs text-zinc-300 mt-2">
              Completaste la <span className="font-bold text-[#ff3b68]">{celebrationData.lineName}</span> en el Bingo de {selectedCountry}.
            </p>
            <div className="my-4 p-3 rounded-2xl bg-[#ff3b68]/15 border border-[#ff3b68]/35 text-[#ff3b68] font-extrabold text-sm">
              +{celebrationData.bonus_xp} XP para tu Mascota! 🚀
            </div>

            <button
              onClick={() => setCelebrationData(null)}
              className="w-full py-3 rounded-2xl bg-[#ff3b68] hover:bg-[#e02854] text-white font-black text-xs shadow-lg shadow-[#ff3b68]/30 cursor-pointer"
            >
              ¡Genial, gracias!
            </button>
          </motion.div>
        </div>
      )}

      {/* Admin Add Item Modal */}
      {showAdminAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 light:bg-white rounded-3xl border border-[#ff3b68]/40 p-5 shadow-2xl">
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 light:text-zinc-900 mb-1">
              Añadir Plato a Bingo ({selectedCountry})
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 light:text-zinc-500 mb-3">
              Agrega una comida o bebida típica para este país.
            </p>

            <form onSubmit={handleCreateAdminItem} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 light:text-zinc-700 mb-1">
                  Nombre del Plato
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Tiramisú, Croquetas de Jamón..."
                  value={dishTitle}
                  onChange={(e) => setDishTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 light:bg-zinc-50 border border-zinc-300 dark:border-zinc-700 light:border-zinc-300 rounded-xl text-zinc-900 dark:text-zinc-100 light:text-zinc-900 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 light:text-zinc-700 mb-1">
                  Pista para Modo a Ciegas
                </label>
                <select
                  value={dishHintCategory}
                  onChange={(e) => {
                    const chosen = e.target.value;
                    setDishHintCategory(chosen);
                    const match = STANDARD_HINTS.find(h => h.label === chosen);
                    if (match) setDishIcon(match.icon);
                  }}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 light:bg-zinc-50 border border-zinc-300 dark:border-zinc-700 light:border-zinc-300 rounded-xl text-zinc-900 dark:text-zinc-100 light:text-zinc-900 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                >
                  {STANDARD_HINTS.map(h => (
                    <option key={h.label} value={h.label}>
                      {h.icon} {h.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 light:text-zinc-700 mb-1">
                  Icono ({dishIcon})
                </label>
                <div className="grid grid-cols-6 gap-1.5 p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 light:bg-zinc-50 border border-zinc-200 dark:border-zinc-800 light:border-zinc-200 max-h-28 overflow-y-auto">
                  {FOOD_ICONS.map(icon => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setDishIcon(icon)}
                      className={`text-xl p-1.5 rounded-xl transition-all cursor-pointer ${
                        dishIcon === icon
                          ? 'bg-[#ff3b68]/25 border-2 border-[#ff3b68] scale-110'
                          : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminAddModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-extrabold bg-[#ff3b68] hover:bg-[#e02854] text-white shadow-md shadow-[#ff3b68]/25 cursor-pointer"
                >
                  Añadir al Bingo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Full Catalog Modal */}
      {showAdminCatalogModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-700 p-4 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                  Catálogo Gastronómico 📋
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Edita o elimina los platos disponibles en cada país.
                </p>
              </div>
              <button
                onClick={() => setShowAdminCatalogModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Country Selector in Catalog */}
            <div className="flex gap-2 my-3">
              <button
                onClick={() => setCatalogCountryFilter('España')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  catalogCountryFilter === 'España'
                    ? 'bg-[#ff3b68] text-white font-extrabold shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                España ({catalogItems.filter(i => (i.country || 'España') === 'España').length})
              </button>
              <button
                onClick={() => setCatalogCountryFilter('Italia')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  catalogCountryFilter === 'Italia'
                    ? 'bg-[#ff3b68] text-white font-extrabold shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Italia ({catalogItems.filter(i => i.country === 'Italia').length})
              </button>
            </div>

            {/* Dishes list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {catalogItems
                .filter(i => (i.country || 'España') === catalogCountryFilter)
                .map(item => (
                  <div 
                    key={item.id}
                    className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 shadow-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                          Pista: <span className="text-purple-600 dark:text-purple-300 font-bold">{item.hint_category || item.category}</span> • {item.completions_count || 0} completados
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setDishTitle(item.title);
                          setDishIcon(item.icon || '🍽️');
                          setDishCategory(item.category || 'Plato Fuerte');
                          setDishHintCategory(item.hint_category || 'Especialidad');
                          setDishCountry(item.country || 'España');
                        }}
                        className="p-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 cursor-pointer"
                        title="Editar plato"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.title)}
                        className="p-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-500 cursor-pointer"
                        title="Eliminar plato"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl border border-[#ff3b68]/40 p-5 shadow-2xl">
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-1">
              Editar Plato
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3 mt-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={dishTitle}
                  onChange={(e) => setDishTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Pista Modo a Ciegas
                </label>
                <select
                  value={dishHintCategory}
                  onChange={(e) => {
                    const chosen = e.target.value;
                    setDishHintCategory(chosen);
                    const match = STANDARD_HINTS.find(h => h.label === chosen);
                    if (match) setDishIcon(match.icon);
                  }}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-[#ff3b68]"
                >
                  {STANDARD_HINTS.map(h => (
                    <option key={h.label} value={h.label}>
                      {h.icon} {h.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  País
                </label>
                <select
                  value={dishCountry}
                  onChange={(e) => setDishCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs outline-none"
                >
                  <option value="España">España</option>
                  <option value="Italia">Italia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Icono ({dishIcon})
                </label>
                <div className="grid grid-cols-6 gap-1.5 p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-300 dark:border-zinc-800 max-h-24 overflow-y-auto">
                  {FOOD_ICONS.map(icon => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setDishIcon(icon)}
                      className={`text-xl p-1.5 rounded-xl transition-all cursor-pointer ${
                        dishIcon === icon ? 'bg-[#ff3b68]/25 border-2 border-[#ff3b68]' : ''
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-extrabold bg-[#ff3b68] hover:bg-[#e02854] text-white shadow-md shadow-[#ff3b68]/25 cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

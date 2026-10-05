import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Key, 
  Wifi, 
  MapPin, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  X,
  Calendar,
  ArrowRight
} from 'lucide-react';

// Format date helper: "2026-11-21" -> { dayNumber: 21, monthShort: "NOV", weekday: "Sábado", full: "21 Nov 2026" }
function formatStayDate(dateStr) {
  if (!dateStr) return { dayNumber: '--', monthShort: '---', weekday: 'Fecha', full: 'Por definir' };
  const parts = String(dateStr).split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return { dayNumber: '--', monthShort: '---', weekday: 'Fecha', full: String(dateStr) };
  }
  
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  if (isNaN(d.getTime())) {
    return { dayNumber: '--', monthShort: '---', weekday: 'Fecha', full: String(dateStr) };
  }
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  return {
    dayNumber: d.getDate(),
    monthShort: months[d.getMonth()] || '---',
    weekday: weekdays[d.getDay()] || 'Fecha',
    full: `${d.getDate()} ${months[d.getMonth()] || ''} ${d.getFullYear()}`
  };
}

export default function LodgingModal({
  isOpen,
  onClose,
  lodging,
  isAdmin = false,
  onSave,
  onDelete
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null); // 'door' | 'wifi' | null

  // Form state
  const [city, setCity] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [airbnbUrl, setAirbnbUrl] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('15:00');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [doorCode, setDoorCode] = useState('');
  const [wifiName, setWifiName] = useState('');
  const [wifiPass, setWifiPass] = useState('');

  // Sync state when lodging changes
  useEffect(() => {
    if (lodging) {
      setCity(lodging.city || '');
      setName(lodging.name || '');
      setAddress(lodging.address || '');
      setMapsUrl(lodging.maps_url || '');
      setAirbnbUrl(lodging.airbnb_url || '');
      setCheckInDate(lodging.check_in_date || '');
      setCheckInTime(lodging.check_in_time || '15:00');
      setCheckOutDate(lodging.check_out_date || '');
      setCheckOutTime(lodging.check_out_time || '11:00');
      setDoorCode(lodging.door_code || '');
      setWifiName(lodging.wifi_name || '');
      setWifiPass(lodging.wifi_pass || '');
      setIsEditing(!lodging.id);
    } else {
      setIsEditing(true);
      setCity('');
      setName('');
      setAddress('');
      setMapsUrl('');
      setAirbnbUrl('');
      setCheckInDate('');
      setCheckInTime('15:00');
      setCheckOutDate('');
      setCheckOutTime('11:00');
      setDoorCode('');
      setWifiName('');
      setWifiPass('');
    }
  }, [lodging, isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!city.trim() || !name.trim() || !checkInDate.trim() || !checkOutDate.trim()) {
      alert('Por favor completa al menos la ciudad, el nombre y las fechas de check-in y check-out');
      return;
    }

    onSave({
      id: lodging?.id,
      city: city.trim(),
      name: name.trim(),
      address: address.trim(),
      maps_url: mapsUrl.trim() || (address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : ''),
      airbnb_url: airbnbUrl.trim(),
      check_in_date: checkInDate.trim(),
      check_in_time: checkInTime.trim() || '15:00',
      check_out_date: checkOutDate.trim(),
      check_out_time: checkOutTime.trim() || '11:00',
      door_code: doorCode.trim(),
      wifi_name: wifiName.trim(),
      wifi_pass: wifiPass.trim()
    });
    setIsEditing(false);
  };

  const inDateInfo = formatStayDate(lodging?.check_in_date);
  const outDateInfo = formatStayDate(lodging?.check_out_date);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-[#111624] text-zinc-900 dark:text-zinc-100 rounded-3xl border border-zinc-200 dark:border-[#212b42] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-[#1e263d] bg-zinc-50 dark:bg-[#141b2c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ff3b68]/15 border border-[#ff3b68]/30 flex items-center justify-center text-[#ff3b68]">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">
                {isEditing ? (lodging?.id ? 'Editar Hospedaje' : 'Nuevo Hospedaje') : 'Hospedaje'}
              </h2>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                {isEditing ? 'Configuración del alojamiento' : (lodging?.city || 'Alojamiento')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isEditing && isAdmin && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-[#1f2940] transition-colors cursor-pointer"
                title="Editar datos"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-[#1f2940] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[78vh] overflow-y-auto space-y-4">
          {!isEditing ? (
            /* ================= VIEW MODE ================= */
            <div className="space-y-4">
              
              {/* Hotel / Airbnb Title & City Badge */}
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ff3b68]/10 dark:bg-[#ff3b68]/15 text-[#ff3b68] border border-[#ff3b68]/30">
                  {lodging?.city}
                </span>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                  {lodging?.name}
                </h3>
              </div>

              {/* 1. HERO FECHAS DE ESTANCIA (MÁXIMA PRESENCIA VISUAL) */}
              <div className="relative overflow-hidden p-4 rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-[#161f36] dark:to-[#121727] border border-zinc-200 dark:border-[#263454] shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  
                  {/* Check-in Box */}
                  <div className="flex-1 bg-white dark:bg-[#0d1220]/80 border border-zinc-200 dark:border-[#212d47] rounded-2xl p-3 text-center shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      CHECK-IN
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white leading-none mt-1">
                      {inDateInfo.dayNumber}
                    </div>
                    <div className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-tight mt-0.5">
                      {inDateInfo.monthShort}
                    </div>
                    <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-1 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{lodging?.check_in_time || '15:00'}</span>
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="flex flex-col items-center justify-center px-1">
                    <div className="w-8 h-8 rounded-full bg-zinc-200/80 dark:bg-[#1b253d] border border-zinc-300 dark:border-[#293859] flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                      <ArrowRight className="w-4 h-4 text-[#ff3b68]" />
                    </div>
                  </div>

                  {/* Check-out Box */}
                  <div className="flex-1 bg-white dark:bg-[#0d1220]/80 border border-zinc-200 dark:border-[#212d47] rounded-2xl p-3 text-center shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      CHECK-OUT
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white leading-none mt-1">
                      {outDateInfo.dayNumber}
                    </div>
                    <div className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-tight mt-0.5">
                      {outDateInfo.monthShort}
                    </div>
                    <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-1 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>{lodging?.check_out_time || '11:00'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. CÓDIGO DE ACCESO / CERRADURA */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#161e31] border border-zinc-200 dark:border-[#232f4a] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-zinc-800 dark:text-zinc-200">
                    <Key className="w-4 h-4 text-[#ff3b68]" />
                    <span>Código de Acceso / Llaves</span>
                  </div>
                  {lodging?.door_code && (
                    <button
                      onClick={() => handleCopy(lodging.door_code, 'door')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-200/80 hover:bg-zinc-300 dark:bg-[#222d45] dark:hover:bg-[#2c3a59] text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'door' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#0d121e] border border-zinc-200 dark:border-[#212c44] font-mono text-sm font-black text-amber-600 dark:text-amber-300 tracking-wide select-all break-words shadow-inner">
                  {lodging?.door_code || 'Sin código configurado'}
                </div>
              </div>

              {/* 3. RED WI-FI */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#161e31] border border-zinc-200 dark:border-[#232f4a] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-zinc-800 dark:text-zinc-200">
                    <Wifi className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span>Conexión Wi-Fi</span>
                  </div>
                  {lodging?.wifi_pass && (
                    <button
                      onClick={() => handleCopy(lodging.wifi_pass, 'wifi')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-200/80 hover:bg-zinc-300 dark:bg-[#222d45] dark:hover:bg-[#2c3a59] text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'wifi' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">¡Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                          <span>Copiar clave</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0d121e] border border-zinc-200 dark:border-[#212c44]">
                    <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Red (SSID)</div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-white font-mono truncate mt-0.5">
                      {lodging?.wifi_name || 'No especificada'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0d121e] border border-zinc-200 dark:border-[#212c44]">
                    <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Contraseña</div>
                    <div className="text-xs font-bold text-cyan-600 dark:text-cyan-300 font-mono truncate mt-0.5">
                      {lodging?.wifi_pass || 'No especificada'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. DIRECCIÓN Y GOOGLE MAPS */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#161e31] border border-zinc-200 dark:border-[#232f4a] space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-zinc-800 dark:text-zinc-200">
                  <MapPin className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  <span>Dirección</span>
                </div>

                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {lodging?.address || 'Dirección no configurada'}
                </p>

                {(lodging?.maps_url || lodging?.address) && (
                  <a
                    href={lodging?.maps_url || `https://maps.google.com/?q=${encodeURIComponent(lodging?.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 dark:bg-[#1f283d] dark:hover:bg-[#293652] dark:text-white dark:border-[#2b3754] text-xs font-black transition-all shadow-sm cursor-pointer"
                  >
                    <span>Abrir en Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  </a>
                )}
              </div>

              {/* 5. ENLACE AIRBNB / RESERVA DEL HOTEL (AL FINAL, DESPUÉS DE LA DIRECCIÓN) */}
              {lodging?.airbnb_url && (
                <a
                  href={lodging.airbnb_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 border border-rose-200 dark:from-[#ff385c]/15 dark:to-[#ff3b68]/15 dark:hover:from-[#ff385c]/25 dark:hover:to-[#ff3b68]/25 dark:border-[#ff385c]/30 dark:hover:border-[#ff385c]/60 text-zinc-900 dark:text-white transition-all shadow-sm group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#ff385c] text-white flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
                      <Home className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black text-zinc-900 dark:text-white">Ver Reserva en Airbnb / Web</div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Abrir detalles, anfitrión y comprobante</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#ff385c] group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}
            </div>
          ) : (
            /* ================= EDIT MODE ================= */
            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej. Madrid"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0e1320] border border-zinc-300 dark:border-[#232f4a] text-zinc-900 dark:text-white text-xs focus:border-[#ff3b68] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Nombre del Alojamiento *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Airbnb Gran Vía"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0e1320] border border-zinc-300 dark:border-[#232f4a] text-zinc-900 dark:text-white text-xs focus:border-[#ff3b68] outline-none"
                  />
                </div>
              </div>

              {/* Fechas de Check-in y Check-out */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-[#0d121e] border border-zinc-200 dark:border-[#1e263d]">
                <div>
                  <label className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                    Check-in (Fecha y Hora) *
                  </label>
                  <div className="space-y-1.5">
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#141b2c] border border-zinc-300 dark:border-[#232f4a] text-zinc-900 dark:text-white text-xs"
                    />
                    <input
                      type="text"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      placeholder="15:00"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#141b2c] border border-zinc-300 dark:border-[#232f4a] text-zinc-900 dark:text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                    Check-out (Fecha y Hora) *
                  </label>
                  <div className="space-y-1.5">
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#141b2c] border border-zinc-300 dark:border-[#232f4a] text-zinc-900 dark:text-white text-xs"
                    />
                    <input
                      type="text"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      placeholder="11:00"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#141b2c] border border-zinc-300 dark:border-[#232f4a] text-zinc-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Acceso y Cerradura */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Código de Entrada / Smart Lock / Llaves
                </label>
                <input
                  type="text"
                  value={doorCode}
                  onChange={(e) => setDoorCode(e.target.value)}
                  placeholder="Ej. Teclado: 4821# | Portal: 1984"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0e1320] border border-zinc-300 dark:border-[#232f4a] text-zinc-900 dark:text-white text-xs font-mono focus:border-[#ff3b68] outline-none"
                />
              </div>

              {/* Wi-Fi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Red Wi-Fi (SSID)
                  </label>
                  <input
                    type="text"
                    value={wifiName}
                    onChange={(e) => setWifiName(e.target.value)}
                    placeholder="Nombre de la red"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0e1320] border border-zinc-300 dark:border-[#232f4a] text-zinc-900 dark:text-white text-xs font-mono focus:border-[#ff3b68] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Contraseña Wi-Fi
                  </label>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0e1320] border border-zinc-300 dark:border-[#232f4a] text-zinc-900 dark:text-white text-xs font-mono focus:border-[#ff3b68] outline-none"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Dirección Completa
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej. Calle Gran Vía 42, 3º Izq"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0e1320] border border-zinc-300 dark:border-[#232f4a] text-zinc-900 dark:text-white text-xs focus:border-[#ff3b68] outline-none"
                />
              </div>

              {/* Link Google Maps */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Enlace de Google Maps (opcional)
                </label>
                <input
                  type="url"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0e1320] border border-zinc-300 dark:border-[#232f4a] text-zinc-900 dark:text-white text-xs focus:border-[#ff3b68] outline-none"
                />
              </div>

              {/* Link de Airbnb / Hotel */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Enlace de Airbnb / Reserva del Hotel
                </label>
                <input
                  type="url"
                  value={airbnbUrl}
                  onChange={(e) => setAirbnbUrl(e.target.value)}
                  placeholder="https://www.airbnb.com/rooms/... o https://booking.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0e1320] border border-zinc-300 dark:border-[#232f4a] text-zinc-900 dark:text-white text-xs focus:border-[#ff3b68] outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                {lodging?.id && onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('¿Eliminar este hospedaje?')) {
                        onDelete(lodging.id);
                        onClose();
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  {lodging?.id && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-[#1e263d] dark:hover:bg-[#283350] text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#ff3b68] hover:bg-[#ff4d77] text-white text-xs font-black shadow-md shadow-[#ff3b68]/20 transition-all cursor-pointer"
                  >
                    Guardar Hospedaje
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'family_trip.db');
const db = new Database(dbPath);

console.log('🔄 Iniciando carga del itinerario actualizado en la base de datos...');

// 1. DÍAS DEL ITINERARIO
const UPDATED_DAYS = [
  { day_number: 1, city: 'Madrid', city_to: null, is_transfer: 0, title: 'Despegue hacia Europa ✈️', date_str: '2026-11-21', notes: 'Vuelo internacional y preparativos de viaje' },
  { day_number: 2, city: 'Madrid', city_to: null, is_transfer: 0, title: 'Llegada y Atardecer en Debod 🌅', date_str: '2026-11-22', notes: 'Instalación en C/ de Ferraz, Templo de Debod y paseo nocturno por Gran Vía' },
  { day_number: 3, city: 'Madrid', city_to: null, is_transfer: 0, title: 'Madrid de los Austrias y Eje Central 🏰', date_str: '2026-11-23', notes: 'Palacio Real y Almudena (exteriores), Plaza Mayor y tapeo en La Latina' },
  { day_number: 4, city: 'Madrid', city_to: null, is_transfer: 0, title: 'Paisaje de la Luz y El Retiro 🌳', date_str: '2026-11-24', notes: 'Paseo del Prado (exterior), Parque del Retiro, Palacio de Cristal y Barrio de Las Letras' },
  { day_number: 5, city: 'Madrid', city_to: 'Roma', is_transfer: 1, title: 'Vuelo Madrid ➔ Roma y San Giovanni ✈️', date_str: '2026-11-25', notes: 'Vuelo a Roma FCO (13:05 - 15:30), base en San Giovanni / Ponte Lungo y paseo vespertino' },
  { day_number: 6, city: 'Roma', city_to: null, is_transfer: 0, title: 'Vaticano, Plazas Barrocas y Panteón 🏛️', date_str: '2026-11-26', notes: 'Entradas pagadas: Museos Vaticanos (08:30 AM) y Panteón de Agripa (06:00 PM)' },
  { day_number: 7, city: 'Roma', city_to: null, is_transfer: 0, title: 'Alba en Trevi, Coliseo y Trastévere ⚔️', date_str: '2026-11-27', notes: 'Fontana di Trevi al alba, Coliseo y Foro Romano (08:30 AM entrada pagada) y atardecer en Trastévere' },
  { day_number: 8, city: 'Roma', city_to: 'Florencia', is_transfer: 1, title: 'Escapada en Tren a Florencia 🚄🎨', date_str: '2026-11-28', notes: 'Tren alta velocidad Roma ↔ Florencia. Duomo, Piazza della Signoria, Ponte Vecchio y Oltrarno' },
  { day_number: 9, city: 'Roma', city_to: null, is_transfer: 0, title: 'Miradores, Plaza de España y Paseo Relajado 🍨', date_str: '2026-11-29', notes: 'Plaza de España, Trinità dei Monti, Villa Borghese, mirador del Pincio y helado artesanal' },
  { day_number: 10, city: 'Roma', city_to: 'Barcelona', is_transfer: 1, title: 'Vuelo Roma ➔ Barcelona y Barrio Gótico ✈️', date_str: '2026-11-30', notes: 'Vuelo a Barcelona BCN (12:35 - 14:25), base en Poblenou, Barri Gòtic y tapeo en El Born' },
  { day_number: 11, city: 'Barcelona', city_to: 'Peñíscola', is_transfer: 1, title: 'Escapada en Tren a Peñíscola 🚄🌊', date_str: '2026-12-01', notes: 'Tren ida y vuelta a Peñíscola. Casco histórico medieval, murallas sobre el mar y arroz marinero' },
  { day_number: 12, city: 'Barcelona', city_to: null, is_transfer: 0, title: 'Park Güell, Gràcia y Passeig de Gràcia 🦎', date_str: '2026-12-02', notes: 'Entrada pagada: Park Güell Zona Monumental (09:15 AM). Vila de Gràcia y fachadas de Gaudí' },
  { day_number: 13, city: 'Barcelona', city_to: null, is_transfer: 0, title: 'Sagrada Família, Boqueria y Montjuïc ⛪', date_str: '2026-12-03', notes: 'Sagrada Família (exterior), Mercat de la Boqueria y mirador panorámico de Montjuïc' },
  { day_number: 14, city: 'Barcelona', city_to: 'Madrid', is_transfer: 1, title: 'Regreso en AVE y Tour Santiago Bernabéu 🚄⚽', date_str: '2026-12-04', notes: 'AVE BCN ➔ MAD (06:35 - 09:52 AM). Entrada confirmada: Tour Santiago Bernabéu (01:30 PM)' },
  { day_number: 15, city: 'Madrid', city_to: null, is_transfer: 0, title: 'Últimas Compras y Vuelo de Regreso ✈️', date_str: '2026-12-05', notes: 'Paseo final por Calle Arenal / Sol y vuelo internacional de regreso a casa' }
];

// Actualizar o insertar días
db.transaction(() => {
  UPDATED_DAYS.forEach(day => {
    const existing = db.prepare('SELECT id FROM itinerary_days WHERE day_number = ?').get(day.day_number);
    if (existing) {
      db.prepare(`
        UPDATE itinerary_days 
        SET city = ?, city_to = ?, is_transfer = ?, title = ?, date_str = ?, notes = ?
        WHERE id = ?
      `).run(day.city, day.city_to, day.is_transfer, day.title, day.date_str, day.notes, existing.id);
    } else {
      db.prepare(`
        INSERT INTO itinerary_days (day_number, city, city_to, is_transfer, title, date_str, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(day.day_number, day.city, day.city_to, day.is_transfer, day.title, day.date_str, day.notes);
    }
  });
})();

// Mapear day_number a day_id
const daysInDb = db.prepare('SELECT id, day_number, date_str FROM itinerary_days').all();
const dayIdMap = {};
daysInDb.forEach(d => { dayIdMap[d.day_number] = d.id; });

// 2. BILLETES DE TREN Y AVIÓN (TRANSITS)
const UPDATED_TRANSITS = [
  {
    day_number: 1,
    date_str: '2026-11-21',
    type: 'flight',
    origin: 'SJO San José (Costa Rica)',
    origin_time: '21:20',
    destination: 'MAD Madrid-Barajas T4',
    destination_time: '14:15 (+1)',
    notes: 'Iberojet • Vuelo internacional hacia Madrid'
  },
  {
    day_number: 5,
    date_str: '2026-11-25',
    type: 'flight',
    origin: 'MAD Madrid-Barajas T4',
    origin_time: '13:05',
    destination: 'FCO Roma Fiumicino T3',
    destination_time: '15:30',
    notes: 'Iberia • Vuelo directo Madrid ➔ Roma'
  },
  {
    day_number: 8,
    date_str: '2026-11-28',
    type: 'train',
    origin: 'Roma Termini',
    origin_time: '06:55',
    destination: 'Firenze Santa Maria Novella',
    destination_time: '08:31',
    notes: 'Frecciarossa / Italo • Escapada a Florencia (Ida)'
  },
  {
    day_number: 8,
    date_str: '2026-11-28',
    type: 'train',
    origin: 'Firenze Santa Maria Novella',
    origin_time: '20:03',
    destination: 'Roma Termini',
    destination_time: '21:43',
    notes: 'Frecciarossa / Italo • Retorno de Florencia a Roma'
  },
  {
    day_number: 10,
    date_str: '2026-11-30',
    type: 'flight',
    origin: 'FCO Roma Fiumicino T1',
    origin_time: '12:35',
    destination: 'BCN Barcelona-El Prat T1',
    destination_time: '14:25',
    notes: 'Vuelo directo Roma ➔ Barcelona'
  },
  {
    day_number: 11,
    date_str: '2026-12-01',
    type: 'train',
    origin: 'Barcelona Sants',
    origin_time: '07:40',
    destination: 'Benicarló-Peñíscola',
    destination_time: '09:35',
    notes: 'Tren Regional Exprés / Larga Distancia • Escapada a Peñíscola (Ida)'
  },
  {
    day_number: 11,
    date_str: '2026-12-01',
    type: 'train',
    origin: 'Benicarló-Peñíscola',
    origin_time: '19:03',
    destination: 'Barcelona Sants',
    destination_time: '20:57',
    notes: 'Tren Regional Exprés / Larga Distancia • Retorno a Barcelona'
  },
  {
    day_number: 14,
    date_str: '2026-12-04',
    type: 'train',
    origin: 'Barcelona Sants',
    origin_time: '06:35',
    destination: 'Madrid Puerta de Atocha',
    destination_time: '09:52',
    notes: 'AVE Alta Velocidad • Traslado matutino para el Bernabéu'
  },
  {
    day_number: 15,
    date_str: '2026-12-05',
    type: 'flight',
    origin: 'MAD Madrid-Barajas T4',
    origin_time: '16:00',
    destination: 'SJO San José (Costa Rica)',
    destination_time: '21:45',
    notes: 'Iberojet • Vuelo internacional de regreso a casa'
  }
];

db.prepare('DELETE FROM transits').run();
const insertTransit = db.prepare(`
  INSERT INTO transits (day_id, date_str, type, origin, origin_time, destination, destination_time, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
UPDATED_TRANSITS.forEach(t => {
  insertTransit.run(
    dayIdMap[t.day_number] || null,
    t.date_str,
    t.type,
    t.origin,
    t.origin_time,
    t.destination,
    t.destination_time,
    t.notes
  );
});

// 3. LUGARES A VISITAR (PLACES)
// REGLA: ÚNICAMENTE los 5 lugares con entrada pagada llevan hora en el título. Los demás SIN HORA.
const UPDATED_PLACES = [
  // --- MADRID ETAPA 1 ---
  {
    day_number: 2,
    date_str: '2026-11-22',
    title: 'Templo de Debod',
    category: 'Monumento',
    location: 'Calle de Ferraz, Madrid',
    description: 'Templo egipcio s. II a.C. donado a España. El mejor mirador al atardecer sobre la Casa de Campo.',
    maps_url: 'https://maps.google.com/?q=Templo+de+Debod+Madrid'
  },
  {
    day_number: 2,
    date_str: '2026-11-22',
    title: 'Jardines de Sabatini & Gran Vía',
    category: 'Paseo',
    location: 'Plaza de España / Gran Vía, Madrid',
    description: 'Paseo nocturno con iluminación, jardines geométricos y vistas al neón Schweppes del Edificio Carrión.',
    maps_url: 'https://maps.google.com/?q=Jardines+de+Sabatini+Madrid'
  },
  {
    day_number: 3,
    date_str: '2026-11-23',
    title: 'Palacio Real y Catedral de la Almudena (Exteriores)',
    category: 'Monumento',
    location: 'Plaza de la Armería, Madrid',
    description: 'Recorrido exterior por la Plaza de la Armería, fachada neogótica de la Almudena, Plaza de Oriente y Teatro Real.',
    maps_url: 'https://maps.google.com/?q=Palacio+Real+Madrid'
  },
  {
    day_number: 3,
    date_str: '2026-11-23',
    title: 'Plaza de la Villa y Plaza Mayor',
    category: 'Histórico',
    location: 'Centro Histórico, Madrid',
    description: 'Rincón medieval de los Austrias (s. XV), soportales de la Plaza Mayor y paradas gastronómicas.',
    maps_url: 'https://maps.google.com/?q=Plaza+Mayor+Madrid'
  },
  {
    day_number: 3,
    date_str: '2026-11-23',
    title: 'Puerta del Sol y Fuente de Cibeles',
    category: 'Plaza',
    location: 'Sol - Alcalá, Madrid',
    description: 'Kilómetro Cero, estatua del Oso y el Madroño y caminata por Calle Alcalá hasta Cibeles.',
    maps_url: 'https://maps.google.com/?q=Puerta+del+Sol+Madrid'
  },
  {
    day_number: 3,
    date_str: '2026-11-23',
    title: 'Barrio de La Latina (Cava Baja)',
    category: 'Gastronomía',
    location: 'Calle Cava Baja, Madrid',
    description: 'Ruta nocturna de tapas tradicionales y vinos en tabernas clásicas madrileñas.',
    maps_url: 'https://maps.google.com/?q=Calle+Cava+Baja+Madrid'
  },
  {
    day_number: 4,
    date_str: '2026-11-24',
    title: 'Paseo del Prado (Exterior Museo) y Puerta de Alcalá',
    category: 'Cultura',
    location: 'Paseo del Prado, Madrid',
    description: 'Fachada y jardines del Prado, Fuente de Neptuno y fotografía ante la monumental puerta de Carlos III.',
    maps_url: 'https://maps.google.com/?q=Puerta+de+Alcala+Madrid'
  },
  {
    day_number: 4,
    date_str: '2026-11-24',
    title: 'Parque de El Retiro y Palacio de Cristal',
    category: 'Parque',
    location: 'Parque del Retiro, Madrid',
    description: 'Estanque Grande, monumento a Alfonso XII y arquitectura de hierro y vidrio en el Palacio de Cristal.',
    maps_url: 'https://maps.google.com/?q=Palacio+de+Cristal+Retiro'
  },
  {
    day_number: 4,
    date_str: '2026-11-24',
    title: 'Barrio de Las Letras y Plaza de Santa Ana',
    category: 'Paseo',
    location: 'Calle de las Huertas, Madrid',
    description: 'Callejuelas donde vivieron Cervantes y Lope de Vega con citas doradas grabadas en el suelo.',
    maps_url: 'https://maps.google.com/?q=Plaza+de+Santa+Ana+Madrid'
  },
  {
    day_number: 5,
    date_str: '2026-11-25',
    title: 'Chocolatería San Ginés',
    category: 'Gastronomía',
    location: 'Pasadizo de San Ginés, 5, Madrid',
    description: 'Fundada en 1894. Desayuno tradicional de chocolate espeso a la taza con churros recién hechos.',
    maps_url: 'https://maps.google.com/?q=Chocolateria+San+Gines+Madrid'
  },

  // --- ROMA & FLORENCIA ---
  {
    day_number: 5,
    date_str: '2026-11-25',
    title: 'Archibasílica de San Giovanni in Laterano',
    category: 'Iglesia',
    location: 'Piazza di San Giovanni in Laterano, Roma',
    description: 'Catedral de Roma y madre de todas las basílicas. Monumental fachada cercana al hospedaje.',
    maps_url: 'https://maps.google.com/?q=San+Giovanni+in+Laterano+Roma'
  },
  {
    day_number: 6,
    date_str: '2026-11-26',
    title: 'Museos Vaticanos y Capilla Sixtina [08:30 AM]',
    category: 'Museo',
    location: 'Viale Vaticano, Ciudad del Vaticano',
    description: 'ENTRADA INTERIOR PAGADA (08:30 AM). Presentación 08:15 AM en Viale Vaticano. Galerías de Mapas, Estancias de Rafael y Capilla Sixtina.',
    maps_url: 'https://maps.google.com/?q=Musei+Vaticani+Roma'
  },
  {
    day_number: 6,
    date_str: '2026-11-26',
    title: 'Plaza y Basílica de San Pedro (Exteriores)',
    category: 'Monumento',
    location: 'Piazza San Pietro, Ciudad del Vaticano',
    description: 'Contemplación de la columnata elíptica de Bernini y fachada mayor desde la plaza. Almuerzo en Borgo Pio.',
    maps_url: 'https://maps.google.com/?q=Piazza+San+Pietro+Roma'
  },
  {
    day_number: 6,
    date_str: '2026-11-26',
    title: 'Castillo y Puente Sant\'Angelo',
    category: 'Monumento',
    location: 'Lungotevere Castello, Roma',
    description: 'Paseo fotográfico sobre el Tíber flanqueado por los diez ángeles de Bernini frente al mausoleo de Adriano.',
    maps_url: 'https://maps.google.com/?q=Castel+Sant+Angelo+Roma'
  },
  {
    day_number: 6,
    date_str: '2026-11-26',
    title: 'Palazzo Altemps (Exterior) y Piazza Navona',
    category: 'Plaza',
    location: 'Piazza Navona, Roma',
    description: 'Exterior del palacio renacentista y gran plaza barroca con la Fuente de los Cuatro Ríos de Bernini.',
    maps_url: 'https://maps.google.com/?q=Piazza+Navona+Roma'
  },
  {
    day_number: 6,
    date_str: '2026-11-26',
    title: 'Panteón de Agripa [06:00 PM]',
    category: 'Monumento',
    location: 'Piazza della Rotonda, Roma',
    description: 'ENTRADA INTERIOR PAGADA (06:00 PM). Ingreso reservado bajo la cúpula de hormigón más grande de la antigüedad y tumba de Rafael Sanzio.',
    maps_url: 'https://maps.google.com/?q=Pantheon+Roma'
  },
  {
    day_number: 6,
    date_str: '2026-11-26',
    title: 'Iglesia de San Ignacio de Loyola',
    category: 'Iglesia',
    location: 'Via del Caravita, Roma',
    description: 'Espectacular ilusión óptica 3D de Andrea Pozzo simulando una cúpula sobre techo plano con espejo fotográfico.',
    maps_url: 'https://maps.google.com/?q=Sant+Ignazio+Roma'
  },
  {
    day_number: 7,
    date_str: '2026-11-27',
    title: 'Fontana di Trevi',
    category: 'Monumento',
    location: 'Piazza di Trevi, Roma',
    description: 'Visita recomendada al alba (06:15 AM) para disfrutarla completamente iluminada y despejada para el lanzamiento de moneda.',
    maps_url: 'https://maps.google.com/?q=Fontana+di+Trevi+Roma'
  },
  {
    day_number: 7,
    date_str: '2026-11-27',
    title: 'Coliseo, Foro Romano y Monte Palatino [08:30 AM]',
    category: 'Arqueológico',
    location: 'Piazza del Colosseo, Roma',
    description: 'ENTRADA INTERIOR PAGADA (08:30 AM). Presentación 08:15 AM en puerta Sperone Valadier con ID. Recorrido interior por el anfiteatro y yacimiento.',
    maps_url: 'https://maps.google.com/?q=Colosseo+Roma'
  },
  {
    day_number: 7,
    date_str: '2026-11-27',
    title: 'Rione Monti, Piazza del Campidoglio y Trastevere',
    category: 'Paseo',
    location: 'Trastevere / Monti, Roma',
    description: 'Callejuelas medievales de Monti, mirador trasero del Campidoglio al Foro y atardecer en Santa Maria in Trastevere.',
    maps_url: 'https://maps.google.com/?q=Santa+Maria+in+Trastevere'
  },
  {
    day_number: 8,
    date_str: '2026-11-28',
    title: 'Duomo y Piazza del Duomo',
    category: 'Monumento',
    location: 'Piazza del Duomo, Florencia',
    description: 'Catedral de Santa Maria del Fiore con la cúpula de Brunelleschi, Campanile de Giotto y Baptisterio.',
    maps_url: 'https://maps.google.com/?q=Duomo+Firenze'
  },
  {
    day_number: 8,
    date_str: '2026-11-28',
    title: 'Piazza della Signoria y Loggia dei Lanzi',
    category: 'Plaza',
    location: 'Piazza della Signoria, Florencia',
    description: 'Corazón político renacentista, fachada del Palazzo Vecchio y museo de esculturas al aire libre.',
    maps_url: 'https://maps.google.com/?q=Piazza+della+Signoria+Firenze'
  },
  {
    day_number: 8,
    date_str: '2026-11-28',
    title: 'Ponte Vecchio y Oltrarno',
    category: 'Paseo',
    location: 'Ponte Vecchio, Florencia',
    description: 'Cruce del puente medieval sobre el río Arno, joyerías históricas, panino toscano y paseo artesano.',
    maps_url: 'https://maps.google.com/?q=Ponte+Vecchio+Firenze'
  },
  {
    day_number: 9,
    date_str: '2026-11-29',
    title: 'Piazza di Spagna y Palazzo Colonna (Exterior)',
    category: 'Plaza',
    location: 'Piazza di Spagna, Roma',
    description: 'Escalinata monumental de Trinità dei Monti, Fuente de la Barcaccia de Bernini y fachada señorial de Palazzo Colonna.',
    maps_url: 'https://maps.google.com/?q=Piazza+di+Spagna+Roma'
  },
  {
    day_number: 9,
    date_str: '2026-11-29',
    title: 'Villa Borghese, Mirador del Pincio y Piazza del Popolo',
    category: 'Parque',
    location: 'Terrazza del Pincio, Roma',
    description: 'Gran parque arbolado, mirador panorámico sobre los techos romanos y compras distendidas por Via del Corso.',
    maps_url: 'https://maps.google.com/?q=Terrazza+del+Pincio+Roma'
  },

  // --- BARCELONA & PEÑÍSCOLA ---
  {
    day_number: 10,
    date_str: '2026-11-30',
    title: 'Barri Gòtic, Pont del Bisbe y Plaça Reial',
    category: 'Histórico',
    location: 'Barri Gòtic, Barcelona',
    description: 'Fachada gótica de la Catedral, balcón de piedra neogótico, Plaça Sant Jaume y farolas de Gaudí con palmeras.',
    maps_url: 'https://maps.google.com/?q=Pont+del+Bisbe+Barcelona'
  },
  {
    day_number: 10,
    date_str: '2026-11-30',
    title: 'Barrio de El Born',
    category: 'Paseo',
    location: 'El Born, Barcelona',
    description: 'Calles peatonales medievales iluminadas con ambiente navideño y cena de platillos catalanes.',
    maps_url: 'https://maps.google.com/?q=El+Born+Barcelona'
  },
  {
    day_number: 11,
    date_str: '2026-12-01',
    title: 'Casco Medieval, Murallas y El Bufador',
    category: 'Histórico',
    location: 'Casco Antiguo, Peñíscola',
    description: 'Callejuelas encaladas frente al Mediterráneo y grieta natural del Bufador donde sopla el oleaje.',
    maps_url: 'https://maps.google.com/?q=Casco+Antiguo+Peniscola'
  },
  {
    day_number: 11,
    date_str: '2026-12-01',
    title: 'Castillo del Papa Luna (Exteriores)',
    category: 'Castillo',
    location: 'Castillo de Peñíscola',
    description: 'Imponente fortaleza templaria del siglo XIV erigida sobre el peñón costero.',
    maps_url: 'https://maps.google.com/?q=Castillo+del+Papa+Luna+Peniscola'
  },
  {
    day_number: 12,
    date_str: '2026-12-02',
    title: 'Park Güell (Zona Monumental Interior) [09:15 AM]',
    category: 'Parque',
    location: 'Gràcia, Barcelona',
    description: 'ENTRADA INTERIOR PAGADA (09:15 AM - Acceso 09:30 AM). Escalinata del dragón de trencadís, Sala Hipóstila y gran banco ondulado con vistas al mar.',
    maps_url: 'https://maps.google.com/?q=Park+Guell+Barcelona'
  },
  {
    day_number: 12,
    date_str: '2026-12-02',
    title: 'Vila de Gràcia (Plaça del Sol y Virreina)',
    category: 'Barrio Típico',
    location: 'Gràcia, Barcelona',
    description: 'Descenso a pie al barrio bohemio por excelencia: plazas peatonales con ambiente de pueblo y comida casera.',
    maps_url: 'https://maps.google.com/?q=Placa+del+Sol+Gracia+Barcelona'
  },
  {
    day_number: 12,
    date_str: '2026-12-02',
    title: 'Passeig de Gràcia: Casa Batlló y La Pedrera (Fachadas)',
    category: 'Arquitectura',
    location: 'Passeig de Gràcia, Barcelona',
    description: 'Manzana de la Discordia (tejado de dragón de Casa Batlló, Casa Amatller) y chimeneas de La Pedrera desde la calle.',
    maps_url: 'https://maps.google.com/?q=Casa+Batllo+Barcelona'
  },
  {
    day_number: 13,
    date_str: '2026-12-03',
    title: 'Sagrada Família y Recinte Modernista Sant Pau (Exteriores)',
    category: 'Monumento',
    location: 'Eixample, Barcelona',
    description: 'Contemplación de las fachadas del Nacimiento y Pasión desde los parques y caminata por Avinguda Gaudí hacia Sant Pau.',
    maps_url: 'https://maps.google.com/?q=Sagrada+Familia+Barcelona'
  },
  {
    day_number: 13,
    date_str: '2026-12-03',
    title: 'Mercat de la Boqueria y Las Ramblas',
    category: 'Gastronomía',
    location: 'Las Ramblas, 91, Barcelona',
    description: 'Puestos de frutas frescas, jamón ibérico y almuerzo de tapas en barra tradicional.',
    maps_url: 'https://maps.google.com/?q=Mercat+de+la+Boqueria+Barcelona'
  },
  {
    day_number: 13,
    date_str: '2026-12-03',
    title: 'Montjuïc: Castillo (Exterior) y Anillo Olímpico',
    category: 'Mirador',
    location: 'Montjuïc, Barcelona',
    description: 'Subida en bus 150 al baluarte militar con miradores 360° sobre el puerto de Barcelona y paseo olímpico.',
    maps_url: 'https://maps.google.com/?q=Castell+de+Montjuic+Barcelona'
  },

  // --- REGRESO A MADRID ---
  {
    day_number: 14,
    date_str: '2026-12-04',
    title: 'Estadio Santiago Bernabéu (Tour Interior) [01:30 PM]',
    category: 'Deporte',
    location: 'Av. de Concha Espina, 1, Madrid',
    description: 'ENTRADA INTERIOR CONFIRMADA (01:30 PM). Museo oficial del Real Madrid, sala de trofeos de Champions, mirador panorámico interior y tienda.',
    maps_url: 'https://maps.google.com/?q=Estadio+Santiago+Bernabeu+Madrid'
  },
  {
    day_number: 14,
    date_str: '2026-12-04',
    title: 'Terraza 360° Hotel Riu Plaza España',
    category: 'Mirador',
    location: 'Gran Vía, 84, Madrid',
    description: 'Subida al piso 27 y pasarela de cristal suspendida sobre la Gran Vía al atardecer para el brindis final del viaje.',
    maps_url: 'https://maps.google.com/?q=Hotel+Riu+Plaza+Espana+Madrid'
  },
  {
    day_number: 15,
    date_str: '2026-12-05',
    title: 'Calle Arenal y Puerta del Sol (Últimas Compras)',
    category: 'Compras',
    location: 'Puerta del Sol / Arenal, Madrid',
    description: 'Paseo tranquilo de despedida para recuerdos gastronómicos (turrones artesanales, jamón) antes del aeropuerto.',
    maps_url: 'https://maps.google.com/?q=Calle+del+Arenal+Madrid'
  }
];

db.prepare('DELETE FROM places').run();
const insertPlace = db.prepare(`
  INSERT INTO places (title, location, date_str, day_id, maps_url, category, description, visited)
  VALUES (?, ?, ?, ?, ?, ?, ?, 0)
`);
UPDATED_PLACES.forEach(p => {
  insertPlace.run(
    p.title,
    p.location,
    p.date_str,
    dayIdMap[p.day_number] || null,
    p.maps_url,
    p.category,
    p.description
  );
});

// 4. NOTAS Y LOGÍSTICA DEL DÍA (ACTIVITIES)
const UPDATED_ACTIVITIES = [
  // Día 1
  { day_number: 1, time_str: '09:20 PM', title: 'Vuelo Internacional SJO ➔ MAD', location: 'Aeropuerto Juan Santamaría (SJO)', notes: 'plane' },
  // Día 2
  { day_number: 2, time_str: '02:00 PM', title: 'Check-in y comida ligera', location: 'C/ de Ferraz (Plaza de España)', notes: 'hotel' },
  { day_number: 2, time_str: '04:45 PM', title: 'Atardecer dorado en Debod (puesta de sol ~05:15 PM)', location: 'Templo de Debod', notes: 'walk' },
  { day_number: 2, time_str: '08:30 PM', title: 'Cena de tapas en Gran Vía', location: 'Gran Vía / Plaza de España', notes: 'food' },
  // Día 3
  { day_number: 3, time_str: '09:30 AM', title: 'Ruta exterior: Armería, Almudena y Plaza de Oriente', location: 'Palacio Real', notes: 'walk' },
  { day_number: 3, time_str: '01:30 PM', title: 'Almuerzo: Bocadillo de calamares o tapas en San Miguel', location: 'Plaza Mayor', notes: 'food' },
  { day_number: 3, time_str: '07:30 PM', title: 'Ronda de pinchos y vinos en Cava Baja', location: 'La Latina', notes: 'food' },
  // Día 4
  { day_number: 4, time_str: '10:00 AM', title: 'Paseo del Prado exterior y foto en Puerta de Alcalá', location: 'Paseo de la Luz', notes: 'walk' },
  { day_number: 4, time_str: '01:30 PM', title: 'Almuerzo tradicional en barrio Salamanca / Retiro', location: 'Menéndez Pelayo', notes: 'food' },
  { day_number: 4, time_str: '04:30 PM', title: 'Café de media tarde en Plaza de Santa Ana', location: 'Barrio de Las Letras', notes: 'food' },
  // Día 5
  { day_number: 5, time_str: '08:30 AM', title: 'Chocolate con churros recién hechos en San Ginés', location: 'Pasadizo de San Ginés', notes: 'food' },
  { day_number: 5, time_str: '10:15 AM', title: 'Traslado al aeropuerto Barajas T4', location: 'Madrid-Barajas', notes: 'plane' },
  { day_number: 5, time_str: '04:30 PM', title: 'Llegada a Roma: Leonardo Express + Metro A a Ponte Lungo', location: 'San Giovanni / Ponte Lungo', notes: 'hotel' },
  { day_number: 5, time_str: '05:30 PM', title: 'Paseo por San Giovanni in Laterano y cena en trattoria local', location: 'Piazza di San Giovanni in Laterano', notes: 'walk' },
  // Día 6
  { day_number: 6, time_str: '08:15 AM', title: 'Presentarse en control de seguridad Viale Vaticano (Entrada 08:30 AM)', location: 'Museos Vaticanos', notes: 'walk' },
  { day_number: 6, time_str: '01:00 PM', title: 'Almuerzo tradicional: pasta cacio e pepe o carbonara', location: 'Borgo Pio', notes: 'food' },
  { day_number: 6, time_str: '05:45 PM', title: 'Presentación en el Panteón de Agripa (Entrada 06:00 PM)', location: 'Piazza della Rotonda', notes: 'monument' },
  // Día 7
  { day_number: 7, time_str: '06:15 AM', title: 'Paseo matutino al amanecer en Trevi sin multitudes', location: 'Fontana di Trevi', notes: 'walk' },
  { day_number: 7, time_str: '08:15 AM', title: 'Presentación con identificación en puerta Sperone Valadier (Entrada 08:30 AM)', location: 'Coliseo de Roma', notes: 'monument' },
  { day_number: 7, time_str: '01:30 PM', title: 'Almuerzo en trattoria familiar en Rione Monti', location: 'Via del Boschetto', notes: 'food' },
  { day_number: 7, time_str: '07:30 PM', title: 'Cena típica romana en Trastevere', location: 'Santa Maria in Trastevere', notes: 'food' },
  // Día 8
  { day_number: 8, time_str: '06:30 AM', title: 'Embarque tren alta velocidad Roma Termini ➔ Florencia (Salida 06:55 AM)', location: 'Roma Termini', notes: 'train' },
  { day_number: 8, time_str: '01:30 PM', title: 'Panino toscano en All\'Antico Vinaio y paseo sobre el Arno', location: 'Ponte Vecchio', notes: 'food' },
  { day_number: 8, time_str: '07:45 PM', title: 'Embarque tren de retorno Firenze SMN ➔ Roma (Salida 08:03 PM)', location: 'Firenze SMN', notes: 'train' },
  // Día 9
  { day_number: 9, time_str: '10:30 AM', title: 'Paseo por Plaza de España y Escalinata Trinità dei Monti', location: 'Piazza di Spagna', notes: 'walk' },
  { day_number: 9, time_str: '03:00 PM', title: 'Mirador del Pincio sobre Roma y helado artesanal', location: 'Villa Borghese / Popolo', notes: 'food' },
  // Día 10
  { day_number: 10, time_str: '10:00 AM', title: 'Check-out y traslado al aeropuerto Fiumicino (Vuelo 12:35 PM)', location: 'Roma FCO', notes: 'plane' },
  { day_number: 10, time_str: '03:30 PM', title: 'Llegada y check-in en Poblenou (Metro L4 a Jaume I)', location: 'El Poblenou / Diagonal Mar', notes: 'hotel' },
  { day_number: 10, time_str: '08:00 PM', title: 'Tapeo en El Born: pan con tomate, embutidos y cava', location: 'El Xampanyet / Cal Pep', notes: 'food' },
  // Día 11
  { day_number: 11, time_str: '07:15 AM', title: 'Embarque tren Barcelona Sants ➔ Benicarló-Peñíscola (Salida 07:40 AM)', location: 'Barcelona Sants', notes: 'train' },
  { day_number: 11, time_str: '02:00 PM', title: 'Almuerzo marinero de arroz caldoso o fideuà frente al mar', location: 'Puerto de Peñíscola', notes: 'food' },
  { day_number: 11, time_str: '06:45 PM', title: 'Embarque tren de retorno Benicarló ➔ Barcelona (Salida 07:03 PM)', location: 'Estación Benicarló', notes: 'train' },
  // Día 12
  { day_number: 12, time_str: '09:00 AM', title: 'Llegada a Park Güell (Entrada Zona Monumental 09:15 AM)', location: 'Park Güell', notes: 'monument' },
  { day_number: 12, time_str: '01:30 PM', title: 'Comida casera catalana: botifarra amb mongetes y escalivada', location: 'Vila de Gràcia', notes: 'food' },
  { day_number: 12, time_str: '04:00 PM', title: 'Contemplación exterior de Casa Batlló y La Pedrera', location: 'Passeig de Gràcia', notes: 'walk' },
  // Día 13
  { day_number: 13, time_str: '09:30 AM', title: 'Vistas exteriores de la Sagrada Família y paseo hacia Sant Pau', location: 'Avinguda Gaudí', notes: 'walk' },
  { day_number: 13, time_str: '01:00 PM', title: 'Almuerzo de tapas en barra de La Boqueria', location: 'Las Ramblas', notes: 'food' },
  { day_number: 13, time_str: '04:00 PM', title: 'Subida en bus 150 a Montjuïc y vistas sobre el puerto', location: 'Montjuïc', notes: 'walk' },
  // Día 14
  { day_number: 14, time_str: '06:15 AM', title: 'Embarque tren AVE Barcelona Sants ➔ Madrid Atocha (Salida 06:35 AM)', location: 'Barcelona Sants', notes: 'train' },
  { day_number: 14, time_str: '10:30 AM', title: 'Llegada a Madrid Atocha, dejar equipaje y Metro L10 a Bernabéu', location: 'Puerta de Atocha', notes: 'hotel' },
  { day_number: 14, time_str: '01:15 PM', title: 'Presentación Tour Santiago Bernabéu (Entrada confirmada 01:30 PM)', location: 'Estadio Bernabéu', notes: 'monument' },
  { day_number: 14, time_str: '05:30 PM', title: 'Pasarela de cristal y brindis al atardecer sobre Gran Vía', location: 'Hotel Riu Plaza España', notes: 'walk' },
  // Día 15
  { day_number: 15, time_str: '10:00 AM', title: 'Compras de recuerdos y turrones artesanales', location: 'Calle Arenal / Sol', notes: 'walk' },
  { day_number: 15, time_str: '01:00 PM', title: 'Traslado al aeropuerto Madrid-Barajas T4 (Vuelo 04:00 PM)', location: 'Madrid-Barajas', notes: 'plane' }
];

db.prepare('DELETE FROM itinerary_activities').run();
const insertActivity = db.prepare(`
  INSERT INTO itinerary_activities (day_id, time_str, title, location, notes, status)
  VALUES (?, ?, ?, ?, ?, 'pending')
`);
UPDATED_ACTIVITIES.forEach(a => {
  insertActivity.run(
    dayIdMap[a.day_number] || null,
    a.time_str,
    a.title,
    a.location,
    a.notes
  );
});

// 5. ALOJAMIENTOS (LODGINGS)
const UPDATED_LODGINGS = [
  {
    city: 'Madrid',
    name: 'Alojamiento Plaza de España & Debod',
    address: 'Calle de Ferraz, Plaza de España, Madrid',
    maps_url: 'https://maps.google.com/?q=Calle+de+Ferraz+Madrid',
    airbnb_url: 'https://airbnb.com',
    check_in_date: '2026-11-22',
    check_in_time: '14:00',
    check_out_date: '2026-11-25',
    check_out_time: '11:00',
    door_code: 'Consultar en app',
    wifi_name: 'Ferraz_Guest',
    wifi_pass: 'Madrid2026',
    host_name: 'Anfitrión Madrid',
    host_phone: '+34 600 000 000',
    notes: 'Alojamiento frente al Templo de Debod y a pasos de Gran Vía (Metro L3 y L10 Argüelles / Plaza de España).'
  },
  {
    city: 'Roma',
    name: 'Base San Giovanni & Ponte Lungo',
    address: 'San Giovanni / Ponte Lungo, Roma, Italia',
    maps_url: 'https://maps.google.com/?q=Ponte+Lungo+Roma',
    airbnb_url: 'https://airbnb.com',
    check_in_date: '2026-11-25',
    check_in_time: '16:00',
    check_out_date: '2026-11-30',
    check_out_time: '10:00',
    door_code: 'Consultar en app',
    wifi_name: 'Roma_SanGiovanni',
    wifi_pass: 'Roma2026',
    host_name: 'Host Roma',
    host_phone: '+39 300 000 000',
    notes: 'Conectado directamente con la estación Termini y el centro histórico vía Metro Línea A.'
  },
  {
    city: 'Barcelona',
    name: 'Apartamento Poblenou & Diagonal Mar',
    address: 'El Poblenou / Diagonal Mar, Barcelona, España',
    maps_url: 'https://maps.google.com/?q=Poblenou+Barcelona',
    airbnb_url: 'https://airbnb.com',
    check_in_date: '2026-11-30',
    check_in_time: '15:30',
    check_out_date: '2026-12-04',
    check_out_time: '06:00',
    door_code: 'Consultar en app',
    wifi_name: 'BCN_Poblenou',
    wifi_pass: 'Barcelona2026',
    host_name: 'Host Barcelona',
    host_phone: '+34 611 000 000',
    notes: 'Alojamiento conectado vía Metro L4 (Selva de Mar / Poblenou) directamente con el Born y el Gótico (estación Jaume I).'
  },
  {
    city: 'Madrid',
    name: 'Hospedaje Cierre de Viaje Bernabéu',
    address: 'Calle de Ferraz / Argüelles, Madrid, España',
    maps_url: 'https://maps.google.com/?q=Calle+de+Ferraz+Madrid',
    airbnb_url: 'https://airbnb.com',
    check_in_date: '2026-12-04',
    check_in_time: '11:00',
    check_out_date: '2026-12-05',
    check_out_time: '12:00',
    door_code: 'Consultar en app',
    wifi_name: 'Ferraz_Guest',
    wifi_pass: 'Madrid2026',
    host_name: 'Anfitrión Madrid',
    host_phone: '+34 600 000 000',
    notes: 'Base para la jornada final del Bernabéu y la celebración de cierre de viaje.'
  }
];

db.prepare('DELETE FROM lodgings').run();
const insertLodging = db.prepare(`
  INSERT INTO lodgings (city, name, address, maps_url, airbnb_url, check_in_date, check_in_time, check_out_date, check_out_time, door_code, wifi_name, wifi_pass, host_name, host_phone, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
UPDATED_LODGINGS.forEach(l => {
  insertLodging.run(
    l.city, l.name, l.address, l.maps_url, l.airbnb_url,
    l.check_in_date, l.check_in_time, l.check_out_date, l.check_out_time,
    l.door_code, l.wifi_name, l.wifi_pass, l.host_name, l.host_phone, l.notes
  );
});

console.log('✅ Base de datos actualizada con éxito:');
console.log(`- ${UPDATED_DAYS.length} días configurados.`);
console.log(`- ${UPDATED_TRANSITS.length} billetes de avión y tren cargados.`);
console.log(`- ${UPDATED_PLACES.length} lugares a visitar registrados (solo 5 con hora pagada).`);
console.log(`- ${UPDATED_ACTIVITIES.length} notas y actividades logísticas registradas.`);
console.log(`- ${UPDATED_LODGINGS.length} hospedajes asignados.`);

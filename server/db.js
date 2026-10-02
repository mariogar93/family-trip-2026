import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const dbPath = path.join(DATA_DIR, 'family_trip.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance and concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    avatar TEXT,
    pin TEXT DEFAULT '1234',
    pet_type TEXT DEFAULT 'pato',
    pet_name TEXT DEFAULT 'Cuac',
    pet_level INTEGER DEFAULT 1,
    pet_xp INTEGER DEFAULT 0,
    pet_hunger INTEGER DEFAULT 80,
    pet_curiosity INTEGER DEFAULT 85,
    pet_mood INTEGER DEFAULT 90,
    pet_accessory TEXT DEFAULT 'none',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS itinerary_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_number INTEGER,
    title TEXT,
    date_str TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS itinerary_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_id INTEGER,
    time_str TEXT,
    title TEXT,
    location TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY(day_id) REFERENCES itinerary_days(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Atracción',
    description TEXT,
    maps_url TEXT,
    visited INTEGER DEFAULT 0,
    visited_by INTEGER,
    photo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bingo_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT,
    icon TEXT,
    position INTEGER,
    country TEXT DEFAULT 'España'
  );

  CREATE TABLE IF NOT EXISTS bingo_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER,
    member_id INTEGER,
    photo_url TEXT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, member_id),
    FOREIGN KEY(item_id) REFERENCES bingo_items(id) ON DELETE CASCADE,
    FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bingo_lines_claimed (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    country TEXT NOT NULL,
    member_id INTEGER NOT NULL,
    line_key TEXT NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(country, member_id, line_key)
  );

  CREATE TABLE IF NOT EXISTS bingo_winners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    country TEXT NOT NULL,
    member_id INTEGER NOT NULL,
    line_key TEXT,
    rank INTEGER,
    bonus_xp INTEGER,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS color_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    color_name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    prompt TEXT NOT NULL,
    bg_gradient TEXT,
    country TEXT DEFAULT 'España'
  );

  CREATE TABLE IF NOT EXISTS color_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_id INTEGER,
    member_id INTEGER,
    photo_url TEXT NOT NULL,
    caption TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(challenge_id) REFERENCES color_challenges(id) ON DELETE CASCADE,
    FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    paid_by INTEGER NOT NULL,
    split_members TEXT NOT NULL, -- JSON array of IDs: "[1,2,3]"
    category TEXT DEFAULT 'Comida',
    date_str TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(paid_by) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS daily_missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    city TEXT DEFAULT 'General',
    type TEXT DEFAULT 'foto',
    difficulty INTEGER DEFAULT 1,
    interior_ok INTEGER DEFAULT 0,
    is_cooperative INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 50,
    icon TEXT DEFAULT '🧭'
  );

  CREATE TABLE IF NOT EXISTS day_mission_state (
    day_number INTEGER PRIMARY KEY,
    mission_id INTEGER,
    status TEXT DEFAULT 'sealed', -- sealed, open, in_progress, completed, closed
    is_rain_mode INTEGER DEFAULT 0,
    changed_count INTEGER DEFAULT 0,
    opened_at DATETIME,
    closed_at DATETIME,
    FOREIGN KEY(mission_id) REFERENCES daily_missions(id)
  );

  CREATE TABLE IF NOT EXISTS mission_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_number INTEGER,
    mission_id INTEGER,
    member_id INTEGER,
    photo_url TEXT,
    note TEXT,
    is_winner INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(mission_id) REFERENCES daily_missions(id),
    FOREIGN KEY(member_id) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS member_missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mission_id INTEGER,
    member_id INTEGER,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mission_id, member_id)
  );

  CREATE TABLE IF NOT EXISTS city_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL,
    title TEXT NOT NULL,
    icon TEXT DEFAULT '🔍',
    position INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS detail_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    detail_id INTEGER UNIQUE, -- solo cuenta una vez por ciudad
    member_id INTEGER NOT NULL,
    photo_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(detail_id) REFERENCES city_details(id) ON DELETE CASCADE,
    FOREIGN KEY(member_id) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS travel_alphabet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    letter TEXT UNIQUE NOT NULL, -- A to Z
    member_id INTEGER NOT NULL,
    photo_url TEXT NOT NULL,
    city TEXT DEFAULT 'Madrid',
    word_hint TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(member_id) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS day_closing (
    day_number INTEGER PRIMARY KEY,
    status TEXT DEFAULT 'open', -- open, revealed, closed
    surprise_category TEXT DEFAULT 'Mayor despiste del día',
    opened_at DATETIME,
    revealed_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS day_nominations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_number INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    photo_url TEXT NOT NULL,
    title TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(member_id) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS day_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_number INTEGER NOT NULL,
    voter_id INTEGER NOT NULL,
    category TEXT NOT NULL, -- best_photo, funniest, best_bite, pillar, surprise, mission_winner
    nominee_type TEXT DEFAULT 'photo', -- photo, person, dish
    target_id INTEGER,
    target_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(day_number, voter_id, category),
    FOREIGN KEY(voter_id) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS transits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_id INTEGER DEFAULT NULL,
    date_str TEXT DEFAULT '',
    type TEXT DEFAULT 'flight', -- 'flight' | 'train'
    origin TEXT NOT NULL,
    origin_time TEXT NOT NULL,
    destination TEXT NOT NULL,
    destination_time TEXT NOT NULL,
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS food_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Salado', -- Salado, callejero, dulce, helado, café/chocolate, bebida
    city TEXT DEFAULT 'Madrid',
    photo_url TEXT,
    price REAL DEFAULT 0,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(created_by) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS food_ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    score INTEGER NOT NULL, -- 1 to 10
    would_repeat INTEGER DEFAULT 1, -- 1 = Sí, 0 = No
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, member_id),
    FOREIGN KEY(review_id) REFERENCES food_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY(member_id) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS lodgings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    maps_url TEXT,
    check_in_date TEXT NOT NULL,
    check_in_time TEXT DEFAULT '15:00',
    check_out_date TEXT NOT NULL,
    check_out_time TEXT DEFAULT '11:00',
    door_code TEXT,
    wifi_name TEXT,
    wifi_pass TEXT,
    host_name TEXT,
    host_phone TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try { db.exec("ALTER TABLE lodgings ADD COLUMN airbnb_url TEXT DEFAULT ''"); } catch (e) {}
try { db.exec("ALTER TABLE bingo_items ADD COLUMN country TEXT DEFAULT 'España'"); } catch (e) {}
try { db.exec("ALTER TABLE bingo_items ADD COLUMN hint_category TEXT DEFAULT 'Especialidad gastronómica'"); } catch (e) {}
try { db.exec("ALTER TABLE color_challenges ADD COLUMN country TEXT DEFAULT 'España'"); } catch (e) {}
try { db.exec("ALTER TABLE itinerary_days ADD COLUMN city TEXT DEFAULT 'Madrid'"); } catch (e) {}
try { db.exec("ALTER TABLE itinerary_days ADD COLUMN city_to TEXT DEFAULT NULL"); } catch (e) {}
try { db.exec("ALTER TABLE itinerary_days ADD COLUMN is_transfer INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE places ADD COLUMN date_str TEXT DEFAULT ''"); } catch (e) {}
try { db.exec("ALTER TABLE places ADD COLUMN day_id INTEGER DEFAULT NULL"); } catch (e) {}
try { db.exec("ALTER TABLE places ADD COLUMN location TEXT DEFAULT ''"); } catch (e) {}
try { db.exec("ALTER TABLE daily_missions ADD COLUMN code TEXT DEFAULT NULL"); } catch (e) {}
try { db.exec("ALTER TABLE daily_missions ADD COLUMN city TEXT DEFAULT 'General'"); } catch (e) {}
try { db.exec("ALTER TABLE daily_missions ADD COLUMN type TEXT DEFAULT 'foto'"); } catch (e) {}
try { db.exec("ALTER TABLE daily_missions ADD COLUMN difficulty INTEGER DEFAULT 1"); } catch (e) {}
try { db.exec("ALTER TABLE daily_missions ADD COLUMN interior_ok INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE daily_missions ADD COLUMN is_cooperative INTEGER DEFAULT 0"); } catch (e) {}

// Dynamic cleanup of old magnifying glasses from missions & details
try {
  db.exec("UPDATE daily_missions SET icon = '🏛️' WHERE icon = '🔍' OR code = 'MAD04'");
  db.exec("UPDATE daily_missions SET icon = '✨' WHERE icon = '🔎' OR code = 'GEN02'");
  db.exec("UPDATE city_details SET icon = '🏛️' WHERE icon IN ('🔍', '🔎')");

  // Dynamic assignment of varied standard hints for España & Italia
  const updateHint = db.prepare('UPDATE bingo_items SET hint_category = ? WHERE title LIKE ?');
  updateHint.run('Plato fuerte tradicional', '%Paella%');
  updateHint.run('Tapa o aperitivo clásico', '%Tortilla%');
  updateHint.run('Embutido o queso curado', '%Jamón%');
  updateHint.run('Postre o dulce típico', '%Churros%');
  updateHint.run('Tapa o aperitivo clásico', '%Bravas%');
  updateHint.run('Tapa o aperitivo clásico', '%Croquetas%');
  updateHint.run('Especialidad marina o de mercado', '%Pulpo%');
  updateHint.run('Bebida o cóctel emblemático', '%Sangría%');
  updateHint.run('Plato fuerte tradicional', '%Gazpacho%');
  updateHint.run('Comida en puesto callejero / Street Food', '%Calamares%');
  updateHint.run('Postre o dulce típico', '%Crema Catalana%');
  updateHint.run('Embutido o queso curado', '%Manchego%');
  updateHint.run('Postre o dulce típico', '%Turrón%');
  updateHint.run('Bebida o cóctel emblemático', '%Horchata%');
  updateHint.run('Tapa o aperitivo clásico', '%Pinchos%');
  updateHint.run('Tapa o aperitivo clásico', '%Festín%');

  updateHint.run('Comida en puesto callejero / Street Food', '%Pizza%');
  updateHint.run('Pasta o arroz artesanal', '%Carbonara%');
  updateHint.run('Helado de sabor curioso o artesanal', '%Gelato%');
  updateHint.run('Postre o dulce típico', '%Tiramisú%');
  updateHint.run('Café o infusión tradicional', '%Espresso%');
  updateHint.run('Bebida o cóctel emblemático', '%Aperol%');
  updateHint.run('Tapa o aperitivo clásico', '%Bruschetta%');
  updateHint.run('Postre o dulce típico', '%Cannoli%');
  updateHint.run('Desayuno o bollería local', '%Focaccia%');
  updateHint.run('Pasta o arroz artesanal', '%Lasagna%');
  updateHint.run('Pasta o arroz artesanal', '%Risotto%');
  updateHint.run('Comida en puesto callejero / Street Food', '%Calzone%');
  updateHint.run('Embutido o queso curado', '%Prosciutto%');
  updateHint.run('Postre o dulce típico', '%Panna Cotta%');
  updateHint.run('Bebida o cóctel emblemático', '%Limoncello%');
  updateHint.run('Plato fuerte tradicional', '%Trattoria%');
} catch (e) {}

// Seed transits if empty
try {
  const transitsCount = db.prepare('SELECT COUNT(*) as count FROM transits').get().count;
  if (transitsCount === 0) {
    const insertTransit = db.prepare(`
      INSERT INTO transits (day_id, date_str, type, origin, origin_time, destination, destination_time, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertTransit.run(1, '12 Oct', 'flight', 'MAD Madrid', '09:25 AM', 'BCN Barcelona', '10:45 AM', 'Vuelo IB3012');
    insertTransit.run(3, '14 Oct', 'train', 'BCN Sants', '08:45 AM', 'MAD Atocha', '11:30 AM', 'AVE Alta Velocidad');
  }
} catch (e) {}

// Seed lodgings / Airbnbs if empty
try {
  const lodgingsCount = db.prepare('SELECT COUNT(*) as count FROM lodgings').get().count;
  if (lodgingsCount === 0) {
    const insertLodging = db.prepare(`
      INSERT INTO lodgings (city, name, address, maps_url, check_in_date, check_in_time, check_out_date, check_out_time, door_code, wifi_name, wifi_pass, host_name, host_phone, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertLodging.run(
      'Madrid',
      'Plaza España & Palacio: Confort, nuevo y amplio',
      'Calle del Reloj, 6, Madrid',
      'https://maps.app.goo.gl/X5xMD33n2aeG8ksB7',
      '2026-11-22',
      '15:00',
      '2026-11-25',
      '11:00',
      'Confirmación: HM3TFT5CFF (4 huéspedes)',
      'Ver en app Airbnb',
      'Ver en app Airbnb',
      'Dani Y Lucia',
      '',
      'Plaza España & Palacio: Confort, nuevo y amplio. Anfitrión: Dani Y Lucia. Instrucciones y reglas en el manual de la casa.'
    );

    insertLodging.run(
      'Roma',
      'Re di Roma House',
      'Via Tuscolana, 44, Roma',
      'https://maps.app.goo.gl/D3Wy1DbLAP8xgiSAA',
      '2026-11-25',
      '16:00',
      '2026-11-30',
      '10:00',
      'Confirmación: HMA32Y993J (4 huéspedes)',
      'Ver en app Airbnb',
      'Ver en app Airbnb',
      'Michela',
      '',
      'Re di Roma House. Anfitrión: Michela. Instrucciones y reglas en el manual de la casa.'
    );

    insertLodging.run(
      'Barcelona',
      'Pool, Terrace & Beach Vibes in Poblenou',
      'Carrer de Lope de Vega, 150, Barcelona',
      'https://maps.app.goo.gl/dZNXVKB7AMGvCFHB6',
      '2026-11-30',
      '17:00',
      '2026-12-04',
      '11:00',
      'Confirmación: HM3RKTWCM3 (4 huéspedes)',
      'Ver en app Airbnb',
      'Ver en app Airbnb',
      'Nina',
      '',
      'Pool, Terrace & Beach Vibes in Poblenou. Anfitrión: Nina. Consejos de seguridad en el agua disponibles en la app de Airbnb.'
    );

    insertLodging.run(
      'Madrid',
      'ibis Styles Madrid Airport Valdebebas',
      'C/ Fernando Higueras 55 - 28055 Madrid, Spain',
      'https://maps.app.goo.gl/f5WED98w5oPb9uwt5',
      '2026-12-04',
      '15:00',
      '2026-12-05',
      '12:00',
      'Reserva Nº: QQWPGNKX',
      'ibis_Styles_Guest',
      'Sin clave (Portal web del hotel)',
      'Recepción ibis Styles 24h',
      '+34 91/9432329',
      'ibis Styles Madrid Airport Valdebebas. Email: HC0U5@ACCOR.COM | Tel: +34 91/9432329 | Hotel cerca del aeropuerto Barajas para vuelo de regreso. Recepción 24h.'
    );
  }
} catch (e) {}

// Seed default settings if empty
const checkSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
if (!checkSetting.get('family_passcode')) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('family_passcode', 'viaje2026');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('admin_pin', '2026');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('trip_title', 'Aventura Familiar 2026 ✈️');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('trip_dates', 'Octubre 2026');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('trip_destination', 'España & Italia');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('currency_symbol', '€');
} else {
  // Update destination to España & Italia
  db.prepare("UPDATE settings SET value = 'España & Italia' WHERE key = 'trip_destination'").run();
}

// Seed Itinerary Days if empty
const dayCount = db.prepare('SELECT COUNT(*) as count FROM itinerary_days').get().count;
if (dayCount === 0) {
  const insertDay = db.prepare('INSERT INTO itinerary_days (day_number, city, city_to, is_transfer, title, date_str, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const d1 = insertDay.run(1, 'Madrid', null, 0, 'Madrid', '12 Oct', '').lastInsertRowid;
  const d2 = insertDay.run(2, 'Madrid', null, 0, 'Madrid', '13 Oct', '').lastInsertRowid;
  const d3 = insertDay.run(3, 'Madrid', 'Roma', 1, 'Madrid ➔ Roma', '14 Oct', 'Día de vuelo/traslado').lastInsertRowid;
  const d4 = insertDay.run(4, 'Roma', null, 0, 'Roma', '15 Oct', '').lastInsertRowid;

  const insertAct = db.prepare('INSERT INTO itinerary_activities (day_id, time_str, title, location, notes, status) VALUES (?, ?, ?, ?, ?, ?)');
  insertAct.run(d1, '10:00 AM', 'Llegada y Check-in', 'Centro de Madrid', '', 'pending');
  insertAct.run(d1, '01:30 PM', 'Comida en Mercado de San Miguel', 'Plaza Mayor', '', 'pending');
  insertAct.run(d2, '10:30 AM', 'Paseo por el Parque del Retiro', 'El Retiro', '', 'pending');
  insertAct.run(d3, '09:00 AM', 'Vuelo Madrid a Roma', 'Aeropuerto Barajas / Fiumicino', 'Pasaportes listos', 'pending');
  insertAct.run(d3, '06:00 PM', 'Cena de bienvenida en Trastevere', 'Piazza di Santa Maria in Trastevere', '', 'pending');
  insertAct.run(d4, '10:00 AM', 'Tour por el Coliseo y Foro Romano', 'Colosseo', '', 'pending');
}

// Seed Places connected to days/dates
const placesCount = db.prepare('SELECT COUNT(*) as count FROM places').get().count;
if (placesCount === 0) {
  const insertPlace = db.prepare('INSERT INTO places (title, date_str, maps_url, visited) VALUES (?, ?, ?, ?)');
  insertPlace.run('Plaza Mayor', '12 Oct', 'https://maps.google.com/?q=Plaza+Mayor+Madrid', 0);
  insertPlace.run('Parque del Retiro y Palacio de Cristal', '13 Oct', 'https://maps.google.com/?q=Parque+del+Retiro+Madrid', 0);
  insertPlace.run('Trastevere (Cena Tradicional)', '14 Oct', 'https://maps.google.com/?q=Trastevere+Roma', 0);
  insertPlace.run('Coliseo Romano y Foro', '15 Oct', 'https://maps.google.com/?q=Colosseo+Roma', 0);
  insertPlace.run('Fontana di Trevi', '15 Oct', 'https://maps.google.com/?q=Fontana+di+Trevi+Roma', 0);
}

// Ensure Multi-Country Bingo Items for España & Italia
// Remove any outdated 'Francia' items and ensure España & Italia
db.prepare("DELETE FROM bingo_items WHERE country = 'Francia'").run();

const checkItalia = db.prepare("SELECT COUNT(*) as count FROM bingo_items WHERE country = 'Italia'").get().count;
if (checkItalia === 0) {
  const itemsItalia = [
    { title: 'Pizza Margherita Napolitana', icon: '🍕', category: 'Plato Fuerte', country: 'Italia' },
    { title: 'Pasta Carbonara Auténtica', icon: '🍝', category: 'Plato Fuerte', country: 'Italia' },
    { title: 'Gelato Artesanal (Helado)', icon: '🍨', category: 'Postre / Dulce', country: 'Italia' },
    { title: 'Tiramisú Tradicional', icon: '🍰', category: 'Postre / Dulce', country: 'Italia' },
    { title: 'Espresso en Barra', icon: '☕', category: 'Bebida', country: 'Italia' },
    { title: 'Aperol Spritz con Aceituna', icon: '🍹', category: 'Bebida', country: 'Italia' },
    { title: 'Bruschetta al Pomodoro', icon: '🍞', category: 'Tapas / Aperitivo', country: 'Italia' },
    { title: 'Cannoli Siciliano Crujiente', icon: '🥐', category: 'Postre / Dulce', country: 'Italia' },
    { title: 'Focaccia con Romero', icon: '🥖', category: 'Street Food / Al paso', country: 'Italia' },
    { title: 'Lasagna della Nonna', icon: '🥘', category: 'Plato Fuerte', country: 'Italia' },
    { title: 'Risotto Cremoso', icon: '🍚', category: 'Plato Fuerte', country: 'Italia' },
    { title: 'Calzone Relleno al Horno', icon: '🥟', category: 'Street Food / Al paso', country: 'Italia' },
    { title: 'Prosciutto & Mozzarella', icon: '🥓', category: 'Tapas / Aperitivo', country: 'Italia' },
    { title: 'Panna Cotta con Frutos', icon: '🍮', category: 'Postre / Dulce', country: 'Italia' },
    { title: 'Chupito de Limoncello Helado', icon: '🍋', category: 'Bebida', country: 'Italia' },
    { title: '¡Banquete en Trattoria Familiar!', icon: '🍽️', category: 'Especial', country: 'Italia' }
  ];

  const insertBingo = db.prepare('INSERT INTO bingo_items (title, icon, category, position, country) VALUES (?, ?, ?, ?, ?)');
  itemsItalia.forEach((item, idx) => {
    insertBingo.run(item.title, item.icon, item.category, idx, item.country);
  });
}

// Ensure España items exist
const checkEspana = db.prepare("SELECT COUNT(*) as count FROM bingo_items WHERE country = 'España'").get().count;
if (checkEspana === 0) {
  const itemsEspana = [
    { title: 'Paella Tradicional', icon: '🥘', category: 'Plato Fuerte', country: 'España' },
    { title: 'Tortilla de Patatas Jugosa', icon: '🍳', category: 'Plato Fuerte', country: 'España' },
    { title: 'Jamón Ibérico al Corte', icon: '🥓', category: 'Tapas / Aperitivo', country: 'España' },
    { title: 'Churros con Chocolate', icon: '☕', category: 'Postre / Dulce', country: 'España' },
    { title: 'Patatas Bravas Picantitas', icon: '🥔', category: 'Tapas / Aperitivo', country: 'España' },
    { title: 'Croquetas Caseras Cremosas', icon: '🧆', category: 'Tapas / Aperitivo', country: 'España' },
    { title: 'Pulpo a la Gallega con Pimentón', icon: '🐙', category: 'Plato Fuerte', country: 'España' },
    { title: 'Sangría o Tinto de Verano', icon: '🍷', category: 'Bebida', country: 'España' },
    { title: 'Gazpacho / Salmorejo Fresco', icon: '🥣', category: 'Plato Fuerte', country: 'España' },
    { title: 'Bocadillo de Calamares', icon: '🥪', category: 'Street Food / Al paso', country: 'España' },
    { title: 'Crema Catalana Caramelizada', icon: '🍮', category: 'Postre / Dulce', country: 'España' },
    { title: 'Queso Manchego Curado', icon: '🧀', category: 'Tapas / Aperitivo', country: 'España' },
    { title: 'Turrón o Mazapán Típico', icon: '🍬', category: 'Postre / Dulce', country: 'España' },
    { title: 'Horchata con Fartons', icon: '🥛', category: 'Bebida', country: 'España' },
    { title: 'Pinchos de Barra', icon: '🍢', category: 'Tapas / Aperitivo', country: 'España' },
    { title: '¡Festín de Tapas en Familia!', icon: '🍖', category: 'Especial', country: 'España' }
  ];

  const insertBingo = db.prepare('INSERT INTO bingo_items (title, icon, category, position, country) VALUES (?, ?, ?, ?, ?)');
  itemsEspana.forEach((item, idx) => {
    insertBingo.run(item.title, item.icon, item.category, idx, item.country);
  });
}

// Ensure Color Challenges for España & Italia
const checkColorsEspana = db.prepare("SELECT COUNT(*) as count FROM color_challenges WHERE country = 'España'").get().count;
const checkColorsItalia = db.prepare("SELECT COUNT(*) as count FROM color_challenges WHERE country = 'Italia'").get().count;

if (checkColorsEspana === 0 || checkColorsItalia === 0) {
  db.prepare("DELETE FROM color_challenges WHERE country = 'Global'").run();

  const insertColor = db.prepare('INSERT INTO color_challenges (color_name, color_hex, prompt, bg_gradient, country) VALUES (?, ?, ?, ?, ?)');

  if (checkColorsEspana === 0) {
    const colorsEspana = [
      { name: 'Rojo Madrileño', hex: '#ef4444', bg: 'from-red-500 to-rose-600', prompt: 'Una fachada de taberna castiza, cartel de tapas o autobús rojo.' },
      { name: 'Amarillo Metro', hex: '#eab308', bg: 'from-amber-400 to-yellow-500', prompt: 'El rombo del Metro, un letrero clásico o una tortilla recién hecha.' },
      { name: 'Azul Azulejo', hex: '#3b82f6', bg: 'from-blue-500 to-indigo-600', prompt: 'Una placa histórica de calle con azulejos o cielo sobre la Gran Vía.' },
      { name: 'Verde Retiro', hex: '#10b981', bg: 'from-emerald-500 to-teal-600', prompt: 'Jardines del Retiro, parque con fuentes o quiosco tradicional.' },
      { name: 'Naranja Teja', hex: '#f97316', bg: 'from-orange-500 to-amber-600', prompt: 'Atardecer en los tejados de Madrid o un vaso de sangría / tinto.' },
      { name: 'Blanco Palacio', hex: '#f8fafc', bg: 'from-slate-200 to-gray-400', prompt: 'Mármol del Palacio Real, arco monumental o taza de chocolate con churros.' },
      { name: 'Morado Artístico', hex: '#a855f7', bg: 'from-purple-500 to-violet-600', prompt: 'Cartel de teatro en Gran Vía, mural callejero o flor de balcón.' },
      { name: 'Dorado Majestuoso', hex: '#d97706', bg: 'from-amber-500 to-yellow-600', prompt: 'Corona de monumento, detalle barroco o churrería centenaria.' }
    ];
    colorsEspana.forEach(c => insertColor.run(c.name, c.hex, c.prompt, c.bg, 'España'));
  }

  if (checkColorsItalia === 0) {
    const colorsItalia = [
      { name: 'Rojo Vespa / Ferrari', hex: '#ef4444', bg: 'from-red-500 to-rose-600', prompt: 'Una Vespa roja aparcada, salsa pomodoro fresca o tranvía romano.' },
      { name: 'Amarillo Limoncello', hex: '#eab308', bg: 'from-amber-400 to-yellow-500', prompt: 'Fachada ocre de Trastevere, pasta al huevo o un limón gigante.' },
      { name: 'Azul Fontana', hex: '#3b82f6', bg: 'from-blue-500 to-indigo-600', prompt: 'Agua turquesa de la Fontana di Trevi o cielo romano despejado.' },
      { name: 'Verde Pino Romano', hex: '#10b981', bg: 'from-emerald-500 to-teal-600', prompt: 'Pinos centenarios en ruinas romanas o persianas verdes de madera.' },
      { name: 'Naranja Terracota', hex: '#f97316', bg: 'from-orange-500 to-amber-600', prompt: 'Tejas milenarias al atardecer sobre el Tíber o vaso de Aperol Spritz.' },
      { name: 'Blanco Mármol Travertino', hex: '#f8fafc', bg: 'from-slate-200 to-gray-400', prompt: 'Piedra milenaria del Coliseo o estatua clásica romana.' },
      { name: 'Púrpura Imperial', hex: '#a855f7', bg: 'from-purple-500 to-violet-600', prompt: 'Detalle eclesiástico, flor de callejuela o gelato de frutos del bosque.' },
      { name: 'Café Espresso', hex: '#78350f', bg: 'from-amber-800 to-yellow-900', prompt: 'Taza de espresso en barra italiana o polvo de cacao de un tiramisú.' }
    ];
    colorsItalia.forEach(c => insertColor.run(c.name, c.hex, c.prompt, c.bg, 'Italia'));
  }
}

// Seed Daily Missions Catalog
const missionCount = db.prepare('SELECT COUNT(*) as count FROM daily_missions').get().count;
if (missionCount < 10) {
  db.prepare('DELETE FROM daily_missions').run();

  const insertMission = db.prepare(`
    INSERT INTO daily_missions (code, title, description, city, type, difficulty, interior_ok, is_cooperative, xp_reward, icon)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const missionsList = [
    { code: 'SP01', title: 'La primera foto del viaje', description: 'Toma la foto oficial de inicio de la aventura familiar con maletas en mano o despegando.', city: 'General', type: 'foto', difficulty: 1, interior_ok: 1, is_cooperative: 1, xp: 30, icon: '✈️' },
    { code: 'SP02', title: 'Foto espejo de despedida', description: 'Foto familiar reflejada en un espejo con todo el equipaje listo para volver a casa.', city: 'General', type: 'foto', difficulty: 1, interior_ok: 1, is_cooperative: 1, xp: 30, icon: '🪞' },
    { code: 'MAD01', title: 'Pose castiza en plaza histórica', description: 'Imita una pose castiza o foto épica frente a una estatua en la Plaza Mayor o Sol.', city: 'Madrid', type: 'cultura', difficulty: 1, interior_ok: 0, is_cooperative: 0, xp: 20, icon: '🎩' },
    { code: 'MAD02', title: 'El bocado más crujiente', description: 'Fotografía el momento exacto del primer mordisco a un bocadillo o churro tradicional.', city: 'Madrid', type: 'comida', difficulty: 1, interior_ok: 1, is_cooperative: 0, xp: 20, icon: '🥪' },
    { code: 'MAD03', title: 'Reflejo en cristal o estanque', description: 'Captura un reflejo creativo de la familia en las aguas del Retiro o en un ventanal.', city: 'Madrid', type: 'creativa', difficulty: 2, interior_ok: 1, is_cooperative: 0, xp: 30, icon: '✨' },
    { code: 'MAD04', title: 'Gárgolas y tejados misteriosos', description: 'Descubre una gárgola, esfinge o escultura oculta en lo alto de un edificio de la Gran Vía.', city: 'Madrid', type: 'observacion', difficulty: 2, interior_ok: 0, is_cooperative: 0, xp: 30, icon: '🏛️' },
    { code: 'ROM01', title: 'Brindis familiar en Trastevere', description: 'Foto del choque de copas, vasos de agua o spritz en una mesa al aire libre.', city: 'Roma', type: 'social', difficulty: 1, interior_ok: 1, is_cooperative: 1, xp: 30, icon: '🥂' },
    { code: 'ROM02', title: 'Gato guardián de las ruinas', description: 'Encuentra un gato romano merodeando entre piedras milenarias o en un callejón.', city: 'Roma', type: 'observacion', difficulty: 2, interior_ok: 0, is_cooperative: 0, xp: 30, icon: '🐈' },
    { code: 'ROM03', title: 'Lanzamiento de moneda de espaldas', description: 'Foto del momento en que lanzan la moneda con la mano derecha sobre el hombro izquierdo.', city: 'Roma', type: 'cultura', difficulty: 1, interior_ok: 0, is_cooperative: 0, xp: 20, icon: '🪙' },
    { code: 'ROM04', title: 'Bigote de espuma o mancha de gelato', description: 'Retrato gracioso de alguien con espuma de capuchino o disfrutando su helado.', city: 'Roma', type: 'creativa', difficulty: 1, interior_ok: 1, is_cooperative: 0, xp: 20, icon: '🍨' },
    { code: 'BCN01', title: 'Tres colores en un mosaico', description: 'Encuentra y fotografía un mosaico trencadís que combine al menos 3 colores vivos.', city: 'Barcelona', type: 'observacion', difficulty: 1, interior_ok: 0, is_cooperative: 0, xp: 20, icon: '🧩' },
    { code: 'BCN02', title: 'Selfie con curvas locas de Gaudí', description: 'Foto familiar con una fachada de formas onduladas o balcones escultóricos de fondo.', city: 'Barcelona', type: 'creativa', difficulty: 2, interior_ok: 0, is_cooperative: 1, xp: 30, icon: '🏰' },
    { code: 'BCN03', title: 'Dragón o quimera escondida', description: 'Encuentra un dragón de forja, piedra o mosaico en una esquina de la ciudad.', city: 'Barcelona', type: 'observacion', difficulty: 2, interior_ok: 0, is_cooperative: 0, xp: 30, icon: '🐉' },
    { code: 'GEN01', title: 'Sombras gigantes al atardecer', description: 'Foto de las siluetas alargadas de la familia proyectadas en el suelo empedrado.', city: 'General', type: 'creativa', difficulty: 2, interior_ok: 0, is_cooperative: 1, xp: 30, icon: '🌅' },
    { code: 'GEN02', title: 'El objeto más diminuto o curioso', description: 'Fotografía el recuerdo, letrero o figura más pequeña y simpática que vean hoy.', city: 'General', type: 'observacion', difficulty: 1, interior_ok: 1, is_cooperative: 0, xp: 20, icon: '✨' },
    { code: 'GEN03', title: 'El explorador con mapa o cartel', description: 'Alguien de la familia concentrado descifrando una dirección o letrero antiguo.', city: 'General', type: 'cooperativa', difficulty: 1, interior_ok: 1, is_cooperative: 1, xp: 30, icon: '🗺️' },
    { code: 'GEN04', title: 'Pies en marcha sobre la historia', description: 'Foto desde arriba de los zapatos de la familia pisando adoquines o baldosas históricas.', city: 'General', type: 'creativa', difficulty: 1, interior_ok: 1, is_cooperative: 1, xp: 30, icon: '👟' }
  ];

  missionsList.forEach(m => {
    insertMission.run(m.code, m.title, m.description, m.city, m.type, m.difficulty, m.interior_ok, m.is_cooperative, m.xp, m.icon);
  });
}

// Seed City Details (12 per city)
const detailsCount = db.prepare('SELECT COUNT(*) as count FROM city_details').get().count;
if (detailsCount < 36) {
  db.prepare('DELETE FROM city_details').run();

  const insertDetail = db.prepare('INSERT INTO city_details (city, title, icon, position) VALUES (?, ?, ?, ?)');

  const madridDetails = [
    { title: 'El Oso y el Madroño', icon: '🐻' },
    { title: 'Placa de calle de azulejos', icon: '🏷️' },
    { title: 'Estatua con capa o sombrero castizo', icon: '🎩' },
    { title: 'Buzón postal amarillo histórico', icon: '📮' },
    { title: 'León guardián en fachada o plaza', icon: '🦁' },
    { title: 'Letrero luminoso histórico', icon: '🎭' },
    { title: 'Farola histórica con adorno de hierro', icon: '🏮' },
    { title: 'Fachada roja de taberna tradicional', icon: '🍷' },
    { title: 'Balcón madrileño con flores', icon: '🌺' },
    { title: 'Vitrina de tapas en barra', icon: '🍢' },
    { title: 'Placa del Kilómetro Cero', icon: '📍' },
    { title: 'Escudo oficial con las 7 estrellas', icon: '⭐' }
  ];

  const romaDetails = [
    { title: 'Fuente Nasone echando agua fresca', icon: '⛲' },
    { title: 'Tapa de alcantarilla con siglas S.P.Q.R.', icon: '🏛️' },
    { title: 'Adoquines tradicionales Sampietrini', icon: '🪨' },
    { title: 'Vespa clásica aparcada en callejón', icon: '🛵' },
    { title: 'Cúpula asomando entre dos edificios', icon: '⛪' },
    { title: 'Fachada cubierta de enredadera verde', icon: '🌿' },
    { title: 'Loba capitolina amamantando', icon: '🐺' },
    { title: 'Persianas romanas de madera verde', icon: '🪟' },
    { title: 'Fuente con tritón o dios marino', icon: '🧜' },
    { title: 'Estatua clásica con toga de mármol', icon: '🗿' },
    { title: 'Letrero grabado en piedra o latín', icon: '📜' },
    { title: 'Altarcito de la Virgen en una esquina', icon: '🕯️' }
  ];

  const bcnDetails = [
    { title: 'Baldosa de flor Panot en la acera', icon: '🌸' },
    { title: 'Mosaico de cerámica rota Trencadís', icon: '🧩' },
    { title: 'Dragón o gárgola modernista', icon: '🐉' },
    { title: 'Balcón de hierro con curvas de Gaudí', icon: '🏰' },
    { title: 'Farola modernista con banco de piedra', icon: '💡' },
    { title: 'Bici roja del Bicing público', icon: '🚲' },
    { title: 'Letrero de comercio en catalán', icon: '🏷️' },
    { title: 'Puesto de fruta fresca de mercado', icon: '🍉' },
    { title: 'Chimenea con forma de guerrero', icon: '⚔️' },
    { title: 'Palmera frente a edificio modernista', icon: '🌴' },
    { title: 'Arco gótico en callejuela estrecha', icon: '⛩️' },
    { title: 'Cruz gaudiniana de cuatro brazos', icon: '✝️' }
  ];

  madridDetails.forEach((d, i) => insertDetail.run('Madrid', d.title, d.icon, i));
  romaDetails.forEach((d, i) => insertDetail.run('Roma', d.title, d.icon, i));
  bcnDetails.forEach((d, i) => insertDetail.run('Barcelona', d.title, d.icon, i));
}

// Ensure initial mission state for Day 1
const checkDay1 = db.prepare('SELECT * FROM day_mission_state WHERE day_number = 1').get();
if (!checkDay1) {
  const sp01 = db.prepare("SELECT id FROM daily_missions WHERE code = 'SP01'").get();
  if (sp01) {
    db.prepare("INSERT OR REPLACE INTO day_mission_state (day_number, mission_id, status, is_rain_mode) VALUES (1, ?, 'sealed', 0)").run(sp01.id);
  }
}

// Ensure initial day closing for Day 1
const checkClosing1 = db.prepare('SELECT * FROM day_closing WHERE day_number = 1').get();
if (!checkClosing1) {
  db.prepare("INSERT OR REPLACE INTO day_closing (day_number, status, surprise_category) VALUES (1, 'open', 'Mayor despiste del día')").run();
}

export { db, DATA_DIR, UPLOADS_DIR };


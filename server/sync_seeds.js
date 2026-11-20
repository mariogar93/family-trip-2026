import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'family_trip.db');
import Database from 'better-sqlite3';
const db = new Database(dbPath);

const days = db.prepare('SELECT day_number, city, city_to, is_transfer, title, date_str, notes FROM itinerary_days ORDER BY day_number').all();
const transits = db.prepare('SELECT day_id, date_str, type, origin, origin_time, destination, destination_time, notes FROM transits ORDER BY id').all();
const places = db.prepare('SELECT day_id, date_str, title, category, description, location, maps_url FROM places ORDER BY id').all();
const activities = db.prepare('SELECT day_id, time_str, title, location, notes, status FROM itinerary_activities ORDER BY id').all();
const lodgings = db.prepare('SELECT city, name, address, maps_url, airbnb_url, check_in_date, check_in_time, check_out_date, check_out_time, door_code, wifi_name, wifi_pass, host_name, host_phone, notes FROM lodgings ORDER BY id').all();

const seedsContent = `// Datos reales y actualizados de itinerario, alojamientos, vuelos y actividades (21 Nov - 5 Dic 2026)

export const REAL_DAYS = ${JSON.stringify(days, null, 2)};

export const REAL_TRANSITS = ${JSON.stringify(transits, null, 2)};

export const REAL_PLACES = ${JSON.stringify(places, null, 2)};

export const REAL_ACTIVITIES = ${JSON.stringify(activities, null, 2)};

export const REAL_LODGINGS = ${JSON.stringify(lodgings, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'seeds.js'), seedsContent);
console.log('✅ server/seeds.js sincronizado exitosamente con la base de datos.');

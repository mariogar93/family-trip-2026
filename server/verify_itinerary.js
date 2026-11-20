import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'family_trip.db');
const db = new Database(dbPath);

console.log('=== VERIFICACIÓN DE ITINERARIO EN BASE DE DATOS ===');
const days = db.prepare('SELECT day_number, title, date_str FROM itinerary_days ORDER BY day_number').all();
console.log(`Días en itinerario (${days.length}):`);
days.forEach(d => console.log(`  Día ${d.day_number} (${d.date_str}): ${d.title}`));

const transits = db.prepare('SELECT type, origin, origin_time, destination, destination_time, date_str FROM transits ORDER BY id').all();
console.log(`\nBilletes de transporte (${transits.length}):`);
transits.forEach(t => console.log(`  [${t.type.toUpperCase()}] ${t.date_str}: ${t.origin} (${t.origin_time}) ➔ ${t.destination} (${t.destination_time})`));

const placesWithTime = db.prepare("SELECT title, location FROM places WHERE title LIKE '%[%'").all();
console.log(`\nLugares con entrada pagada/hora fija (${placesWithTime.length}):`);
placesWithTime.forEach(p => console.log(`  🎟️ ${p.title} (${p.location})`));

const placesWithoutTime = db.prepare("SELECT count(id) as c FROM places WHERE title NOT LIKE '%[%'").get().c;
console.log(`\nLugares flexibles sin hora: ${placesWithoutTime}`);

const activities = db.prepare('SELECT count(id) as c FROM itinerary_activities').get().c;
console.log(`Notas/actividades logísticas: ${activities}`);

const lodgings = db.prepare('SELECT city, name, address, check_in_date, check_out_date FROM lodgings ORDER BY id').all();
console.log(`\nHospedajes (${lodgings.length}):`);
lodgings.forEach(l => console.log(`  🏨 ${l.city}: ${l.name} (${l.address}) [${l.check_in_date} al ${l.check_out_date}]`));

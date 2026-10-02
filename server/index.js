import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, DATA_DIR, UPLOADS_DIR } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'photo-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB max
});

// Helper to award XP and level up pet
function awardPetXP(memberId, xpToAdd, statKey = 'pet_mood') {
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId);
  if (!member) return null;

  let newXp = member.pet_xp + xpToAdd;
  let newLevel = member.pet_level;
  // Level threshold formula: level * 100
  while (newXp >= newLevel * 100) {
    newXp -= newLevel * 100;
    newLevel += 1;
  }

  let statUpdate = '';
  if (statKey === 'pet_hunger') {
    statUpdate = ', pet_hunger = MIN(100, pet_hunger + 25)';
  } else if (statKey === 'pet_curiosity') {
    statUpdate = ', pet_curiosity = MIN(100, pet_curiosity + 20)';
  } else if (statKey === 'pet_mood') {
    statUpdate = ', pet_mood = MIN(100, pet_mood + 20)';
  }

  db.prepare(`
    UPDATE members 
    SET pet_xp = ?, pet_level = ? ${statUpdate}
    WHERE id = ?
  `).run(newXp, newLevel, memberId);

  return db.prepare('SELECT * FROM members WHERE id = ?').get(memberId);
}

// ----------------- SETTINGS & AUTH -----------------
app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  // Don't leak raw passcode to client, just provide confirmation
  delete settings.family_passcode;
  res.json(settings);
});

app.post('/api/auth/verify-family', (req, res) => {
  const { passcode } = req.body;
  const stored = db.prepare('SELECT value FROM settings WHERE key = ?').get('family_passcode');
  if (stored && stored.value.toLowerCase().trim() === (passcode || '').toLowerCase().trim()) {
    return res.json({ success: true, message: '¡Bienvenido a la aventura familiar!' });
  }
  return res.status(401).json({ success: false, message: 'Código de familia incorrecto' });
});

app.post('/api/settings', (req, res) => {
  const { trip_title, trip_dates, trip_destination, currency_symbol, family_passcode } = req.body;
  const upsert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?');
  if (trip_title) upsert.run('trip_title', trip_title, trip_title);
  if (trip_dates) upsert.run('trip_dates', trip_dates, trip_dates);
  if (trip_destination) upsert.run('trip_destination', trip_destination, trip_destination);
  if (currency_symbol) upsert.run('currency_symbol', currency_symbol, currency_symbol);
  if (family_passcode) upsert.run('family_passcode', family_passcode, family_passcode);
  res.json({ success: true });
});

// ----------------- MEMBERS & PETS -----------------
app.get('/api/members', (req, res) => {
  const members = db.prepare('SELECT * FROM members ORDER BY pet_level DESC, pet_xp DESC').all();
  res.json(members);
});

app.post('/api/members', (req, res) => {
  const { name, avatar, pin, pet_type, pet_name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  const chosenPet = pet_type || 'pato';
  const existingPet = db.prepare('SELECT id, name FROM members WHERE pet_type = ?').get(chosenPet);
  if (existingPet) {
    return res.status(400).json({ 
      error: `La mascota ya fue elegida por ${existingPet.name}. Por favor elige una mascota diferente para no repetir.` 
    });
  }

  const insert = db.prepare(`
    INSERT INTO members (name, avatar, pin, pet_type, pet_name, pet_level, pet_xp)
    VALUES (?, ?, ?, ?, ?, 1, 0)
  `);
  const result = insert.run(name.trim(), avatar || '🎒', pin || '1234', chosenPet, pet_name?.trim() || 'Compañero');
  const newMember = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);
  res.json(newMember);
});

app.delete('/api/members/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM members WHERE id = ?').run(id);
  db.prepare('DELETE FROM bingo_completions WHERE member_id = ?').run(id);
  db.prepare('DELETE FROM color_submissions WHERE member_id = ?').run(id);
  db.prepare('DELETE FROM member_missions WHERE member_id = ?').run(id);
  db.prepare('DELETE FROM bingo_lines_claimed WHERE member_id = ?').run(id);
  db.prepare('DELETE FROM bingo_winners WHERE member_id = ?').run(id);
  res.json({ success: true });
});

app.post('/api/members/reset', (req, res) => {
  db.prepare('DELETE FROM members').run();
  db.prepare('DELETE FROM bingo_completions').run();
  db.prepare('DELETE FROM color_submissions').run();
  db.prepare('DELETE FROM member_missions').run();
  db.prepare('DELETE FROM bingo_lines_claimed').run();
  db.prepare('DELETE FROM bingo_winners').run();
  res.json({ success: true, message: 'Todos los viajeros fueron reiniciados' });
});

app.put('/api/members/:id/pet', (req, res) => {
  const { id } = req.params;
  const { pet_name, pet_type, pet_accessory } = req.body;
  db.prepare(`
    UPDATE members 
    SET pet_name = COALESCE(?, pet_name),
        pet_type = COALESCE(?, pet_type),
        pet_accessory = COALESCE(?, pet_accessory)
    WHERE id = ?
  `).run(pet_name, pet_type, pet_accessory, id);
  const updated = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
  res.json(updated);
});

// ----------------- ITINERARY -----------------
app.get('/api/itinerary', (req, res) => {
  const days = db.prepare('SELECT * FROM itinerary_days ORDER BY date_str ASC, day_number ASC').all();
  const activities = db.prepare('SELECT * FROM itinerary_activities ORDER BY id ASC').all();
  const places = db.prepare('SELECT * FROM places ORDER BY id ASC').all();
  
  const formatted = days.map(day => ({
    ...day,
    activities: activities.filter(a => a.day_id === day.id),
    places: places.filter(p => p.day_id === day.id || (p.date_str && p.date_str === day.date_str))
  }));
  res.json(formatted);
});

// Batch create days from a date range (e.g. Madrid from 2026-10-22 to 2026-10-24)
app.post('/api/itinerary/days-range', (req, res) => {
  const { city, start_date, end_date } = req.body;
  if (!city || !start_date || !end_date) {
    return res.status(400).json({ error: 'Ciudad, fecha inicio y fecha fin son requeridas' });
  }

  const [sy, sm, sd] = start_date.split('-').map(Number);
  const [ey, em, ed] = end_date.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return res.status(400).json({ error: 'Rango de fechas no válido' });
  }

  const maxDayRow = db.prepare('SELECT COALESCE(MAX(day_number), 0) as maxNum FROM itinerary_days').get();
  let currentDayNum = maxDayRow.maxNum;

  const insertStmt = db.prepare(`
    INSERT INTO itinerary_days (day_number, city, city_to, is_transfer, title, date_str, notes)
    VALUES (?, ?, null, 0, ?, ?, '')
  `);

  const created = [];
  const curr = new Date(start);
  while (curr <= end) {
    currentDayNum += 1;
    const yyyy = curr.getFullYear();
    const mm = String(curr.getMonth() + 1).padStart(2, '0');
    const dd = String(curr.getDate()).padStart(2, '0');
    const isoDate = `${yyyy}-${mm}-${dd}`;
    
    const result = insertStmt.run(currentDayNum, city.trim(), city.trim(), isoDate);
    created.push({ id: result.lastInsertRowid, day_number: currentDayNum, city: city.trim(), date_str: isoDate });
    
    curr.setDate(curr.getDate() + 1);
  }

  res.json({ success: true, count: created.length, days: created });
});

app.post('/api/itinerary/day', (req, res) => {
  const { day_number, city, city_to, is_transfer, date_str } = req.body;
  const nextNumber = day_number || (db.prepare('SELECT COALESCE(MAX(day_number), 0) + 1 as nextNum FROM itinerary_days').get().nextNum);
  const resolvedCity = city?.trim() || 'Ciudad';
  const resolvedIsTransfer = is_transfer ? 1 : 0;
  const title = resolvedIsTransfer ? `${resolvedCity} ➔ ${city_to?.trim() || 'Destino'}` : resolvedCity;
  const result = db.prepare(`
    INSERT INTO itinerary_days (day_number, city, city_to, is_transfer, title, date_str, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(nextNumber, resolvedCity, resolvedIsTransfer ? city_to?.trim() : null, resolvedIsTransfer, title, date_str?.trim() || '', '');
  res.json({ id: result.lastInsertRowid, day_number: nextNumber });
});

app.delete('/api/itinerary/day/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM itinerary_activities WHERE day_id = ?').run(id);
  db.prepare('DELETE FROM itinerary_days WHERE id = ?').run(id);
  res.json({ success: true });
});

app.post('/api/itinerary/activity', (req, res) => {
  const { day_id, time_str, title, location, notes } = req.body;
  const result = db.prepare('INSERT INTO itinerary_activities (day_id, time_str, title, location, notes) VALUES (?, ?, ?, ?, ?)').run(day_id, time_str, title, location, notes);
  res.json({ id: result.lastInsertRowid });
});

app.delete('/api/itinerary/activity/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM itinerary_activities WHERE id = ?').run(id);
  res.json({ success: true });
});

app.patch('/api/itinerary/activity/:id', (req, res) => {
  const { id } = req.params;
  const { status, member_id } = req.body;
  db.prepare('UPDATE itinerary_activities SET status = ? WHERE id = ?').run(status, id);
  if (status === 'completed' && member_id) {
    awardPetXP(member_id, 30, 'pet_curiosity');
  }
  res.json({ success: true });
});

// ----------------- PLACES (SIMPLE & CONECTADO AL ITINERARIO) -----------------
app.get('/api/places', (req, res) => {
  const places = db.prepare(`
    SELECT p.*, m.name as visitor_name
    FROM places p
    LEFT JOIN members m ON p.visited_by = m.id
    ORDER BY p.visited ASC, p.id ASC
  `).all();
  res.json(places);
});

app.post('/api/places', (req, res) => {
  const { title, location, date_str, day_id, maps_url } = req.body;
  if (!title) return res.status(400).json({ error: 'Nombre requerido' });
  const searchQuery = location ? `${title}, ${location}` : title;
  const computedUrl = maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
  const result = db.prepare(`
    INSERT INTO places (title, location, date_str, day_id, maps_url)
    VALUES (?, ?, ?, ?, ?)
  `).run(title.trim(), location?.trim() || '', date_str?.trim() || '', day_id || null, computedUrl);
  res.json({ id: result.lastInsertRowid });
});

app.delete('/api/places/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM places WHERE id = ?').run(id);
  res.json({ success: true });
});

app.patch('/api/places/:id', (req, res) => {
  const { id } = req.params;
  const { title, location, date_str, day_id, maps_url, category, description } = req.body;
  const current = db.prepare('SELECT * FROM places WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Lugar no encontrado' });

  let updatedMapsUrl = current.maps_url;
  if (maps_url !== undefined) {
    updatedMapsUrl = maps_url;
  } else if (title !== undefined || location !== undefined) {
    const newTitle = title !== undefined ? title : current.title;
    const newLocation = location !== undefined ? location : current.location;
    const searchQuery = newLocation ? `${newTitle}, ${newLocation}` : newTitle;
    updatedMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
  }

  db.prepare(`
    UPDATE places
    SET title = COALESCE(?, title),
        location = COALESCE(?, location),
        date_str = ?,
        day_id = ?,
        maps_url = ?,
        category = COALESCE(?, category),
        description = COALESCE(?, description)
    WHERE id = ?
  `).run(
    title !== undefined ? title.trim() : null,
    location !== undefined ? location.trim() : null,
    date_str !== undefined ? (date_str ? date_str.trim() : null) : current.date_str,
    day_id !== undefined ? (day_id ? Number(day_id) : null) : current.day_id,
    updatedMapsUrl,
    category !== undefined ? category : null,
    description !== undefined ? description : null,
    id
  );

  const updated = db.prepare('SELECT * FROM places WHERE id = ?').get(id);
  res.json(updated);
});

app.patch('/api/places/:id/toggle-visited', (req, res) => {
  const { id } = req.params;
  const { member_id } = req.body;
  const place = db.prepare('SELECT visited FROM places WHERE id = ?').get(id);
  if (!place) return res.status(404).json({ error: 'Place not found' });

  const newStatus = place.visited ? 0 : 1;
  const visitor = newStatus ? member_id : null;
  db.prepare('UPDATE places SET visited = ?, visited_by = ? WHERE id = ?').run(newStatus, visitor, id);

  if (newStatus && member_id) {
    awardPetXP(member_id, 50, 'pet_curiosity');
  }
  res.json({ success: true, visited: newStatus });
});

// ----------------- TRANSITS (BILLETES DE AVIÓN Y TREN) -----------------
app.get('/api/transits', (req, res) => {
  const { day_id, date_str } = req.query;
  let query = 'SELECT * FROM transits';
  const params = [];
  if (day_id) {
    query += ' WHERE day_id = ?';
    params.push(day_id);
  } else if (date_str) {
    query += ' WHERE date_str = ?';
    params.push(date_str);
  }
  query += ' ORDER BY id ASC';
  const transits = db.prepare(query).all(...params);
  res.json(transits);
});

app.post('/api/transits', (req, res) => {
  const { day_id, date_str, type, origin, origin_time, destination, destination_time, notes } = req.body;
  if (!origin || !destination) {
    return res.status(400).json({ error: 'Origen y destino requeridos' });
  }
  const result = db.prepare(`
    INSERT INTO transits (day_id, date_str, type, origin, origin_time, destination, destination_time, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    day_id || null,
    date_str?.trim() || '',
    type === 'train' ? 'train' : 'flight',
    origin.trim(),
    origin_time?.trim() || '',
    destination.trim(),
    destination_time?.trim() || '',
    notes?.trim() || ''
  );
  res.json({ success: true, id: result.lastInsertRowid });
});

app.put('/api/transits/:id', (req, res) => {
  const { id } = req.params;
  const { day_id, date_str, type, origin, origin_time, destination, destination_time, notes } = req.body;
  db.prepare(`
    UPDATE transits 
    SET day_id = ?, date_str = ?, type = ?, origin = ?, origin_time = ?, destination = ?, destination_time = ?, notes = ?
    WHERE id = ?
  `).run(
    day_id || null,
    date_str?.trim() || '',
    type === 'train' ? 'train' : 'flight',
    origin?.trim() || '',
    origin_time?.trim() || '',
    destination?.trim() || '',
    destination_time?.trim() || '',
    notes?.trim() || '',
    id
  );
  res.json({ success: true });
});

app.delete('/api/transits/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM transits WHERE id = ?').run(id);
  res.json({ success: true });
});

// ----------------- LODGINGS / AIRBNBS -----------------
app.get('/api/lodgings', (req, res) => {
  const lodgings = db.prepare('SELECT * FROM lodgings ORDER BY check_in_date ASC, id ASC').all();
  res.json(lodgings);
});

app.post('/api/lodgings', (req, res) => {
  const { 
    city, 
    name, 
    address, 
    maps_url, 
    airbnb_url,
    check_in_date, 
    check_in_time, 
    check_out_date, 
    check_out_time, 
    door_code, 
    wifi_name, 
    wifi_pass, 
    host_name, 
    host_phone, 
    notes 
  } = req.body;

  if (!city || !name || !check_in_date || !check_out_date) {
    return res.status(400).json({ error: 'Ciudad, nombre, fecha de check-in y check-out son obligatorios' });
  }

  const result = db.prepare(`
    INSERT INTO lodgings (city, name, address, maps_url, airbnb_url, check_in_date, check_in_time, check_out_date, check_out_time, door_code, wifi_name, wifi_pass, host_name, host_phone, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    city.trim(),
    name.trim(),
    address?.trim() || '',
    maps_url?.trim() || '',
    airbnb_url?.trim() || '',
    check_in_date.trim(),
    check_in_time?.trim() || '15:00',
    check_out_date.trim(),
    check_out_time?.trim() || '11:00',
    door_code?.trim() || '',
    wifi_name?.trim() || '',
    wifi_pass?.trim() || '',
    host_name?.trim() || '',
    host_phone?.trim() || '',
    notes?.trim() || ''
  );

  const newLodging = db.prepare('SELECT * FROM lodgings WHERE id = ?').get(result.lastInsertRowid);
  res.json(newLodging);
});

app.put('/api/lodgings/:id', (req, res) => {
  const { id } = req.params;
  const { 
    city, 
    name, 
    address, 
    maps_url, 
    airbnb_url,
    check_in_date, 
    check_in_time, 
    check_out_date, 
    check_out_time, 
    door_code, 
    wifi_name, 
    wifi_pass, 
    host_name, 
    host_phone, 
    notes 
  } = req.body;

  db.prepare(`
    UPDATE lodgings
    SET city = COALESCE(?, city),
        name = COALESCE(?, name),
        address = COALESCE(?, address),
        maps_url = COALESCE(?, maps_url),
        airbnb_url = COALESCE(?, airbnb_url),
        check_in_date = COALESCE(?, check_in_date),
        check_in_time = COALESCE(?, check_in_time),
        check_out_date = COALESCE(?, check_out_date),
        check_out_time = COALESCE(?, check_out_time),
        door_code = COALESCE(?, door_code),
        wifi_name = COALESCE(?, wifi_name),
        wifi_pass = COALESCE(?, wifi_pass),
        host_name = COALESCE(?, host_name),
        host_phone = COALESCE(?, host_phone),
        notes = COALESCE(?, notes)
    WHERE id = ?
  `).run(
    city?.trim() || null,
    name?.trim() || null,
    address?.trim() || null,
    maps_url?.trim() || null,
    airbnb_url?.trim() || null,
    check_in_date?.trim() || null,
    check_in_time?.trim() || null,
    check_out_date?.trim() || null,
    check_out_time?.trim() || null,
    door_code?.trim() || null,
    wifi_name?.trim() || null,
    wifi_pass?.trim() || null,
    host_name?.trim() || null,
    host_phone?.trim() || null,
    notes?.trim() || null,
    id
  );

  const updated = db.prepare('SELECT * FROM lodgings WHERE id = ?').get(id);
  res.json(updated);
});

app.delete('/api/lodgings/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM lodgings WHERE id = ?').run(id);
  res.json({ success: true });
});

// ----------------- BINGO MULTIPAÍS GAMIFICADO (ESPAÑA & ITALIA) -----------------
app.get('/api/bingo', (req, res) => {
  const country = req.query.country;
  let itemsQuery = 'SELECT * FROM bingo_items';
  const queryParams = [];
  if (country) {
    itemsQuery += ' WHERE country = ?';
    queryParams.push(country);
  }
  itemsQuery += ' ORDER BY position ASC, id ASC';

  const items = db.prepare(itemsQuery).all(...queryParams);
  const completions = db.prepare(`
    SELECT bc.*, m.name as member_name
    FROM bingo_completions bc
    JOIN members m ON bc.member_id = m.id
  `).all();

  // Get claimed lines and winners
  const winners = db.prepare(`
    SELECT bw.*, m.name as member_name, m.pet_type, m.pet_name
    FROM bingo_winners bw
    JOIN members m ON bw.member_id = m.id
    ORDER BY bw.completed_at ASC
  `).all();

  const linesClaimed = db.prepare('SELECT * FROM bingo_lines_claimed').all();

  // Ensure available countries are España and Italia
  const rawCountries = db.prepare("SELECT DISTINCT country FROM bingo_items WHERE country IN ('España', 'Italia')").all().map(c => c.country);
  const countries = ['España', 'Italia'];

  const enriched = items.map(item => ({
    ...item,
    completions: completions.filter(c => c.item_id === item.id)
  }));

  res.json({
    items: enriched,
    winners,
    linesClaimed,
    countries
  });
});

// Admin/organizer gets full catalog across all countries with completion stats
app.get('/api/bingo/catalog', (req, res) => {
  const items = db.prepare(`
    SELECT bi.*, 
      (SELECT COUNT(*) FROM bingo_completions bc WHERE bc.item_id = bi.id) as completions_count
    FROM bingo_items bi
    ORDER BY bi.country ASC, bi.position ASC, bi.id ASC
  `).all();
  res.json({ items });
});

// Admin creates new bingo tile
app.post('/api/bingo/item', (req, res) => {
  const { title, icon, category, country, hint_category } = req.body;
  if (!title) return res.status(400).json({ error: 'Título requerido' });
  const result = db.prepare(`
    INSERT INTO bingo_items (title, icon, category, country, hint_category, position)
    VALUES (?, ?, ?, ?, ?, (SELECT COALESCE(MAX(position), 0) + 1 FROM bingo_items WHERE country = ?))
  `).run(title, icon || '🍴', category || 'General', country || 'España', hint_category || 'Especialidad gastronómica', country || 'España');
  res.json({ id: result.lastInsertRowid });
});

// Admin edits existing bingo tile
app.put('/api/bingo/item/:id', (req, res) => {
  const { id } = req.params;
  const { title, icon, category, country, hint_category } = req.body;
  db.prepare(`
    UPDATE bingo_items 
    SET title = COALESCE(?, title),
        icon = COALESCE(?, icon),
        category = COALESCE(?, category),
        country = COALESCE(?, country),
        hint_category = COALESCE(?, hint_category)
    WHERE id = ?
  `).run(title, icon, category, country, hint_category, id);
  const updated = db.prepare('SELECT * FROM bingo_items WHERE id = ?').get(id);
  res.json(updated);
});

app.delete('/api/bingo/item/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM bingo_items WHERE id = ?').run(id);
  db.prepare('DELETE FROM bingo_completions WHERE item_id = ?').run(id);
  res.json({ success: true });
});

// Member marks tile or attaches photo (never toggles off by accident)
app.post('/api/bingo/complete', upload.single('photo'), (req, res) => {
  const { item_id, member_id } = req.body;
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

  const existing = db.prepare('SELECT * FROM bingo_completions WHERE item_id = ? AND member_id = ?').get(item_id, member_id);

  if (existing) {
    if (photo_url) {
      db.prepare('UPDATE bingo_completions SET photo_url = ? WHERE id = ?').run(photo_url, existing.id);
    }
    return res.json({ completed: true, photo_url: photo_url || existing.photo_url, updated: true });
  } else {
    db.prepare('INSERT INTO bingo_completions (item_id, member_id, photo_url) VALUES (?, ?, ?)').run(item_id, member_id, photo_url);
    // Award 10 XP for single tile completion
    awardPetXP(member_id, 10, 'pet_hunger');
    return res.json({ completed: true, photo_url, xpAwarded: 10 });
  }
});

// Member explicitly unmarks tile
app.post('/api/bingo/unmark', (req, res) => {
  const { item_id, member_id } = req.body;
  db.prepare('DELETE FROM bingo_completions WHERE item_id = ? AND member_id = ?').run(item_id, member_id);
  return res.json({ completed: false });
});

// Member toggles single tile (legacy fallback)
app.post('/api/bingo/toggle', upload.single('photo'), (req, res) => {
  const { item_id, member_id } = req.body;
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

  const existing = db.prepare('SELECT * FROM bingo_completions WHERE item_id = ? AND member_id = ?').get(item_id, member_id);

  if (existing) {
    db.prepare('DELETE FROM bingo_completions WHERE id = ?').run(existing.id);
    return res.json({ completed: false });
  } else {
    db.prepare('INSERT INTO bingo_completions (item_id, member_id, photo_url) VALUES (?, ?, ?)').run(item_id, member_id, photo_url);
    awardPetXP(member_id, 10, 'pet_hunger');
    return res.json({ completed: true, photo_url, xpAwarded: 10 });
  }
});

// Member claims Line or Diagonal completion (Big tiered XP + Winner Declaration)
app.post('/api/bingo/claim-line', (req, res) => {
  const { country, member_id, line_key } = req.body;
  if (!country || !member_id || !line_key) {
    return res.status(400).json({ error: 'Faltan datos para reclamar línea' });
  }

  // Check if member already claimed this specific line in this country
  const alreadyClaimed = db.prepare(`
    SELECT * FROM bingo_lines_claimed WHERE country = ? AND member_id = ? AND line_key = ?
  `).get(country, member_id, line_key);

  if (alreadyClaimed) {
    return res.json({ success: false, message: 'Esta línea ya fue reclamada por ti' });
  }

  // Record this line as claimed by member
  db.prepare(`
    INSERT INTO bingo_lines_claimed (country, member_id, line_key)
    VALUES (?, ?, ?)
  `).run(country, member_id, line_key);

  // Check how many people have already claimed a line in this country
  const countryWinners = db.prepare(`
    SELECT COUNT(*) as count FROM bingo_winners WHERE country = ?
  `).get(country).count;

  const rank = countryWinners + 1;
  let bonus_xp = 25;
  if (rank === 1) bonus_xp = 200; // 1st = Champion of country bingo!
  else if (rank === 2) bonus_xp = 100; // 2nd = Silver
  else if (rank === 3) bonus_xp = 50;  // 3rd = Bronze

  // Record in bingo_winners
  db.prepare(`
    INSERT INTO bingo_winners (country, member_id, line_key, rank, bonus_xp)
    VALUES (?, ?, ?, ?, ?)
  `).run(country, member_id, line_key, rank, bonus_xp);

  // Award big bonus XP to the member's pet!
  awardPetXP(member_id, bonus_xp, 'pet_mood');

  res.json({
    success: true,
    isWinner: rank === 1,
    rank,
    bonus_xp,
    message: rank === 1 
      ? `¡FANTÁSTICO! Eres el GANADOR DEL BINGO de ${country}! (+${bonus_xp} XP)`
      : `¡Línea completada! Puesto #${rank} en ${country} (+${bonus_xp} XP)`
  });
});

// ----------------- COLOR CHALLENGES (ESPAÑA & ITALIA) -----------------
app.get('/api/colors', (req, res) => {
  const { country } = req.query;
  let query = 'SELECT * FROM color_challenges';
  const params = [];
  if (country) {
    query += ' WHERE country = ?';
    params.push(country);
  }
  query += ' ORDER BY id ASC';
  const challenges = db.prepare(query).all(...params);
  const submissions = db.prepare(`
    SELECT cs.*, m.name as member_name
    FROM color_submissions cs
    JOIN members m ON cs.member_id = m.id
    ORDER BY cs.submitted_at DESC
  `).all();

  const result = challenges.map(c => ({
    ...c,
    submissions: submissions.filter(s => s.challenge_id === c.id)
  }));

  res.json({
    challenges: result,
    countries: ['España', 'Italia']
  });
});

app.post('/api/colors/submit', upload.single('photo'), (req, res) => {
  const { challenge_id, member_id, caption } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'Debes adjuntar una foto' });
  }

  const photo_url = `/uploads/${req.file.filename}`;
  db.prepare(`
    INSERT INTO color_submissions (challenge_id, member_id, photo_url, caption)
    VALUES (?, ?, ?, ?)
  `).run(challenge_id, member_id, photo_url, caption || '');

  // Award 50 XP and boost Pet Mood/Creativity!
  awardPetXP(member_id, 50, 'pet_mood');

  res.json({ success: true, photo_url });
});

// ----------------- GASTOS COMPARTIDOS (EXPENSES) -----------------
app.get('/api/expenses', (req, res) => {
  const expenses = db.prepare(`
    SELECT e.*, m.name as payer_name, m.avatar as payer_avatar
    FROM expenses e
    JOIN members m ON e.paid_by = m.id
    ORDER BY e.id DESC
  `).all();

  const members = db.prepare('SELECT id, name, avatar FROM members').all();

  // Calculate Net Balances
  // balance[id] = amount_paid - amount_owed
  const balances = {};
  members.forEach(m => { balances[m.id] = 0; });

  expenses.forEach(e => {
    const paidBy = e.paid_by;
    const amount = Number(e.amount);
    let splitIds = [];
    try {
      splitIds = JSON.parse(e.split_members);
    } catch {
      splitIds = members.map(m => m.id);
    }
    if (splitIds.length === 0) splitIds = [paidBy];

    const share = amount / splitIds.length;
    // Payer gets credit
    if (balances[paidBy] !== undefined) {
      balances[paidBy] += amount;
    }
    // Each split participant owes their share
    splitIds.forEach(id => {
      if (balances[id] !== undefined) {
        balances[id] -= share;
      }
    });
  });

  // Calculate simplified settlements: Who owes whom
  const debtors = [];
  const creditors = [];

  Object.keys(balances).forEach(idStr => {
    const id = Number(idStr);
    const bal = Math.round(balances[id] * 100) / 100;
    const member = members.find(m => m.id === id);
    if (!member) return;
    if (bal < -0.01) {
      debtors.push({ id, name: member.name, avatar: member.avatar, amount: -bal });
    } else if (bal > 0.01) {
      creditors.push({ id, name: member.name, avatar: member.avatar, amount: bal });
    }
  });

  const settlements = [];
  let dIdx = 0;
  let cIdx = 0;
  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const settleAmount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from_id: debtor.id,
      from_name: debtor.name,
      from_avatar: debtor.avatar,
      to_id: creditor.id,
      to_name: creditor.name,
      to_avatar: creditor.avatar,
      amount: Math.round(settleAmount * 100) / 100
    });

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  res.json({
    expenses: expenses.map(e => ({
      ...e,
      split_members: JSON.parse(e.split_members || '[]')
    })),
    balances: members.map(m => ({
      ...m,
      net_balance: Math.round((balances[m.id] || 0) * 100) / 100
    })),
    settlements
  });
});

app.post('/api/expenses', (req, res) => {
  const { title, amount, paid_by, split_members, category, date_str } = req.body;
  if (!title || !amount || !paid_by) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const splitJson = JSON.stringify(split_members || [paid_by]);
  const result = db.prepare(`
    INSERT INTO expenses (title, amount, paid_by, split_members, category, date_str)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title, Number(amount), paid_by, splitJson, category || 'General', date_str || 'Hoy');

  res.json({ id: result.lastInsertRowid });
});

app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { title, amount, paid_by, split_members, category, date_str } = req.body;
  if (!title || !amount || !paid_by) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const splitJson = JSON.stringify(split_members || [paid_by]);
  db.prepare(`
    UPDATE expenses
    SET title = ?, amount = ?, paid_by = ?, split_members = ?, category = ?, date_str = ?
    WHERE id = ?
  `).run(title, Number(amount), paid_by, splitJson, category || 'General', date_str || 'Hoy', id);

  res.json({ success: true });
});

app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  res.json({ success: true });
});

// ----------------- MISSIONS & FEED -----------------
app.get('/api/missions', (req, res) => {
  const missions = db.prepare('SELECT * FROM daily_missions ORDER BY id ASC').all();
  const completed = db.prepare('SELECT * FROM member_missions').all();
  res.json({
    missions,
    completed
  });
});

app.post('/api/missions/:id/toggle', (req, res) => {
  const mission_id = req.params.id;
  const { member_id } = req.body;
  const exists = db.prepare('SELECT * FROM member_missions WHERE mission_id = ? AND member_id = ?').get(mission_id, member_id);

  if (exists) {
    db.prepare('DELETE FROM member_missions WHERE id = ?').run(exists.id);
    res.json({ completed: false });
  } else {
    db.prepare('INSERT INTO member_missions (mission_id, member_id) VALUES (?, ?)').run(mission_id, member_id);
    const mission = db.prepare('SELECT * FROM daily_missions WHERE id = ?').get(mission_id);
    const xp = mission ? mission.xp_reward : 40;
    awardPetXP(member_id, xp, 'pet_curiosity');
    res.json({ completed: true });
  }
});

// ==========================================
// 1. MISIÓN DEL DÍA (WAX SEAL & CONTINGENCY)
// ==========================================
function getDayMissionState(dayNumber) {
  let state = db.prepare('SELECT * FROM day_mission_state WHERE day_number = ?').get(dayNumber);
  if (!state) {
    const totalDaysRow = db.prepare('SELECT COALESCE(MAX(day_number), 14) as max_day FROM itinerary_days').get();
    const totalDays = totalDaysRow ? totalDaysRow.max_day : 14;

    let mission = null;
    if (dayNumber === 1) {
      mission = db.prepare("SELECT * FROM daily_missions WHERE code = 'SP01'").get();
    } else if (dayNumber === totalDays || dayNumber === 14) {
      mission = db.prepare("SELECT * FROM daily_missions WHERE code = 'SP02'").get();
    } else {
      const dayRow = db.prepare('SELECT city FROM itinerary_days WHERE day_number = ?').get(dayNumber);
      const currentCity = (dayRow && dayRow.city) ? dayRow.city.trim() : 'Madrid';
      
      // Strict city filter: only current city or General, never a different city!
      mission = db.prepare(`
        SELECT * FROM daily_missions 
        WHERE (city = ? OR city = 'General') 
          AND code NOT IN ('SP01', 'SP02')
          AND id NOT IN (SELECT mission_id FROM day_mission_state WHERE mission_id IS NOT NULL AND day_number != ?)
        ORDER BY (CASE WHEN city = ? THEN 0 ELSE 1 END), id ASC LIMIT 1
      `).get(currentCity, dayNumber, currentCity);

      if (!mission) {
        mission = db.prepare(`
          SELECT * FROM daily_missions 
          WHERE (city = ? OR city = 'General')
            AND code NOT IN ('SP01', 'SP02')
          ORDER BY (CASE WHEN city = ? THEN 0 ELSE 1 END), id ASC LIMIT 1
        `).get(currentCity, currentCity);
      }
    }
    if (!mission) {
      mission = db.prepare('SELECT * FROM daily_missions LIMIT 1').get();
    }
    db.prepare(`
      INSERT INTO day_mission_state (day_number, mission_id, status)
      VALUES (?, ?, 'sealed')
    `).run(dayNumber, mission ? mission.id : null);
    state = db.prepare('SELECT * FROM day_mission_state WHERE day_number = ?').get(dayNumber);
  }
  return state;
}

app.get('/api/missions/all', (req, res) => {
  const totalDaysRow = db.prepare('SELECT COALESCE(MAX(day_number), 14) as max_day FROM itinerary_days').get();
  const maxDay = Math.max(totalDaysRow ? totalDaysRow.max_day : 14, 14);
  const days = [];
  for (let d = 1; d <= maxDay; d++) {
    const state = getDayMissionState(d);
    const mission = state.mission_id ? db.prepare('SELECT * FROM daily_missions WHERE id = ?').get(state.mission_id) : null;
    const dayRow = db.prepare('SELECT city, date_str FROM itinerary_days WHERE day_number = ?').get(d);
    days.push({
      day_number: d,
      city: dayRow ? dayRow.city : 'Madrid',
      date_str: dayRow ? dayRow.date_str : '',
      state,
      mission
    });
  }
  res.json({ days });
});

app.get('/api/missions/daily/:day', (req, res) => {
  const day = Number(req.params.day);
  const state = getDayMissionState(day);
  const mission = state.mission_id ? db.prepare('SELECT * FROM daily_missions WHERE id = ?').get(state.mission_id) : null;
  const submissions = db.prepare(`
    SELECT ms.*, m.name as member_name, m.avatar as member_avatar
    FROM mission_submissions ms
    JOIN members m ON ms.member_id = m.id
    WHERE ms.day_number = ? AND ms.mission_id = ?
    ORDER BY ms.created_at DESC
  `).all(day, state.mission_id);

  res.json({
    day_number: day,
    state,
    mission,
    submissions
  });
});

app.post('/api/missions/daily/:day/open', (req, res) => {
  const day = Number(req.params.day);
  const state = getDayMissionState(day);
  if (state.status === 'sealed') {
    db.prepare("UPDATE day_mission_state SET status = 'open', opened_at = CURRENT_TIMESTAMP WHERE day_number = ?").run(day);
  }
  const updated = db.prepare('SELECT * FROM day_mission_state WHERE day_number = ?').get(day);
  res.json({ success: true, state: updated });
});

app.post('/api/missions/daily/:day/change', (req, res) => {
  const day = Number(req.params.day);
  const state = getDayMissionState(day);
  if (state.changed_count >= 1) {
    return res.status(400).json({ error: 'Solo se puede cambiar la misión una vez al día' });
  }
  const currentMission = db.prepare('SELECT * FROM daily_missions WHERE id = ?').get(state.mission_id);
  const city = currentMission ? currentMission.city : 'Madrid';
  const newMission = db.prepare(`
    SELECT * FROM daily_missions 
    WHERE (city = ? OR city = 'General') 
      AND id != ?
      AND id NOT IN (SELECT mission_id FROM day_mission_state WHERE mission_id IS NOT NULL)
    ORDER BY RANDOM() LIMIT 1
  `).get(city, state.mission_id) || db.prepare('SELECT * FROM daily_missions WHERE id != ? ORDER BY RANDOM() LIMIT 1').get(state.mission_id);

  if (!newMission) {
    return res.status(400).json({ error: 'No hay más misiones disponibles para cambiar' });
  }

  db.prepare(`
    UPDATE day_mission_state 
    SET mission_id = ?, changed_count = changed_count + 1 
    WHERE day_number = ?
  `).run(newMission.id, day);

  const updatedState = db.prepare('SELECT * FROM day_mission_state WHERE day_number = ?').get(day);
  res.json({ success: true, state: updatedState, mission: newMission });
});

app.post('/api/missions/daily/:day/rain', (req, res) => {
  const day = Number(req.params.day);
  const state = getDayMissionState(day);
  const currentMission = db.prepare('SELECT * FROM daily_missions WHERE id = ?').get(state.mission_id);
  const city = currentMission ? currentMission.city : 'Madrid';
  const rainMission = db.prepare(`
    SELECT * FROM daily_missions 
    WHERE interior_ok = 1 AND (city = ? OR city = 'General')
    ORDER BY RANDOM() LIMIT 1
  `).get(city) || db.prepare('SELECT * FROM daily_missions WHERE interior_ok = 1 LIMIT 1').get();

  if (rainMission) {
    db.prepare(`
      UPDATE day_mission_state 
      SET mission_id = ?, is_rain_mode = 1 
      WHERE day_number = ?
    `).run(rainMission.id, day);
  }

  const updatedState = db.prepare('SELECT * FROM day_mission_state WHERE day_number = ?').get(day);
  const finalMission = db.prepare('SELECT * FROM daily_missions WHERE id = ?').get(updatedState.mission_id);
  res.json({ success: true, state: updatedState, mission: finalMission });
});

app.post('/api/missions/daily/:day/submit', upload.single('photo'), (req, res) => {
  const day = Number(req.params.day);
  const { member_id, note } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'Debes adjuntar una foto para completar la misión' });
  }
  const photo_url = `/uploads/${req.file.filename}`;
  const state = getDayMissionState(day);

  db.prepare(`
    INSERT INTO mission_submissions (day_number, mission_id, member_id, photo_url, note)
    VALUES (?, ?, ?, ?, ?)
  `).run(day, state.mission_id, member_id, photo_url, note || '');

  db.prepare("UPDATE day_mission_state SET status = 'completed' WHERE day_number = ? AND status = 'open'").run(day);

  const mission = db.prepare('SELECT * FROM daily_missions WHERE id = ?').get(state.mission_id);
  const xp = mission ? mission.xp_reward : 50;
  awardPetXP(member_id, xp, 'pet_curiosity');

  res.json({ success: true, photo_url, xpAwarded: xp });
});

// ==========================================
// 2. CAZA DE DETALLES (CITY DETAILS 3x4)
// ==========================================
app.get('/api/details/:city', (req, res) => {
  const { city } = req.params;
  const details = db.prepare(`
    SELECT cd.*, 
           dc.id as completion_id, dc.member_id as completed_by_id, dc.photo_url, dc.created_at as completed_at,
           m.name as member_name, m.avatar as member_avatar
    FROM city_details cd
    LEFT JOIN detail_completions dc ON cd.id = dc.detail_id
    LEFT JOIN members m ON dc.member_id = m.id
    WHERE cd.city = ?
    ORDER BY cd.position ASC, cd.id ASC
  `).all(city);

  res.json({ city, details });
});

app.post('/api/details/complete', upload.single('photo'), (req, res) => {
  const { detail_id, member_id } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'Foto requerida' });
  }
  const existing = db.prepare('SELECT * FROM detail_completions WHERE detail_id = ?').get(detail_id);
  if (existing) {
    return res.status(400).json({ error: '¡Este detalle ya fue descubierto por otro explorador!' });
  }

  const photo_url = `/uploads/${req.file.filename}`;
  db.prepare(`
    INSERT INTO detail_completions (detail_id, member_id, photo_url)
    VALUES (?, ?, ?)
  `).run(detail_id, member_id, photo_url);

  awardPetXP(member_id, 30, 'pet_curiosity');
  res.json({ success: true, photo_url, xpAwarded: 30 });
});

// ==========================================
// 3. ABECEDARIO DEL VIAJE (A-Z)
// ==========================================
app.get('/api/alphabet', (req, res) => {
  const entries = db.prepare(`
    SELECT ta.*, m.name as member_name, m.avatar as member_avatar
    FROM travel_alphabet ta
    JOIN members m ON ta.member_id = m.id
    ORDER BY ta.letter ASC
  `).all();

  const entriesMap = {};
  entries.forEach(e => {
    entriesMap[e.letter] = e;
  });

  const viajeLetters = ['V', 'I', 'A', 'J', 'E'];
  const isViajeCompleted = viajeLetters.every(l => !!entriesMap[l]);

  res.json({
    entries: entriesMap,
    claimedCount: entries.length,
    isViajeCompleted
  });
});

app.post('/api/alphabet/submit', upload.single('photo'), (req, res) => {
  const { letter, member_id, city, word_hint } = req.body;
  if (!req.file || !letter) {
    return res.status(400).json({ error: 'Foto y letra son requeridos' });
  }
  const cleanLetter = letter.trim().toUpperCase()[0];
  const photo_url = `/uploads/${req.file.filename}`;

  db.prepare(`
    INSERT INTO travel_alphabet (letter, member_id, photo_url, city, word_hint)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(letter) DO UPDATE SET 
      member_id = excluded.member_id,
      photo_url = excluded.photo_url,
      city = excluded.city,
      word_hint = excluded.word_hint,
      created_at = CURRENT_TIMESTAMP
  `).run(cleanLetter, member_id, photo_url, city || 'Madrid', word_hint || '');

  awardPetXP(member_id, 25, 'pet_curiosity');
  res.json({ success: true, letter: cleanLetter, photo_url, xpAwarded: 25 });
});

// ==========================================
// 4. CIERRE DEL DÍA Y VOTACIÓN SECRETA
// ==========================================
const SURPRISE_CATEGORIES = [
  'Mayor despiste del día',
  'Mejor pose de foto',
  'Frase célebre de la jornada',
  'Mayor aguante caminando',
  'Momento más gracioso'
];

app.get('/api/closing/:day', (req, res) => {
  const day = Number(req.params.day);
  let closing = db.prepare('SELECT * FROM day_closing WHERE day_number = ?').get(day);
  if (!closing) {
    const surpriseCat = SURPRISE_CATEGORIES[(day - 1) % SURPRISE_CATEGORIES.length];
    db.prepare(`
      INSERT INTO day_closing (day_number, status, surprise_category)
      VALUES (?, 'open', ?)
    `).run(day, surpriseCat);
    closing = db.prepare('SELECT * FROM day_closing WHERE day_number = ?').get(day);
  }

  const nominations = db.prepare(`
    SELECT dn.*, m.name as member_name, m.avatar as member_avatar
    FROM day_nominations dn
    JOIN members m ON dn.member_id = m.id
    WHERE dn.day_number = ?
    ORDER BY dn.created_at ASC
  `).all(day);

  const missionSubmissions = db.prepare(`
    SELECT ms.*, m.name as member_name, m.avatar as member_avatar
    FROM mission_submissions ms
    JOIN members m ON ms.member_id = m.id
    WHERE ms.day_number = ?
    ORDER BY ms.created_at ASC
  `).all(day);

  const votes = db.prepare(`
    SELECT dv.*, m.name as voter_name
    FROM day_votes dv
    JOIN members m ON dv.voter_id = m.id
    WHERE dv.day_number = ?
  `).all(day);

  const results = {};
  if (closing.status === 'revealed' || closing.status === 'closed') {
    const categories = ['best_photo', 'funniest', 'best_bite', 'pillar', 'surprise', 'mission_winner'];
    categories.forEach(cat => {
      const catVotes = votes.filter(v => v.category === cat);
      const counts = {};
      catVotes.forEach(v => {
        const key = v.nominee_type === 'photo' ? `photo_${v.target_id}` : (v.target_name || `target_${v.target_id}`);
        if (!counts[key]) counts[key] = { count: 0, vote: v };
        counts[key].count++;
      });
      let top = null;
      Object.values(counts).forEach(item => {
        if (!top || item.count > top.count) top = item;
      });
      if (top) {
        results[cat] = {
          winner: top.vote,
          votes_count: top.count,
          total_votes: catVotes.length
        };
      }
    });
  }

  res.json({
    closing,
    nominations,
    missionSubmissions,
    votes,
    results
  });
});

app.post('/api/closing/:day/nominate', upload.single('photo'), (req, res) => {
  const day = Number(req.params.day);
  const { member_id, title, photo_url_existing } = req.body;
  let photo_url = photo_url_existing;
  if (req.file) {
    photo_url = `/uploads/${req.file.filename}`;
  }
  if (!photo_url) {
    return res.status(400).json({ error: 'Debes seleccionar o subir una foto' });
  }

  const count = db.prepare('SELECT COUNT(*) as count FROM day_nominations WHERE day_number = ? AND member_id = ?').get(day, member_id).count;
  if (count >= 2) {
    return res.status(400).json({ error: 'Máximo 2 fotos nominadas por persona por día' });
  }

  const result = db.prepare(`
    INSERT INTO day_nominations (day_number, member_id, photo_url, title)
    VALUES (?, ?, ?, ?)
  `).run(day, member_id, photo_url, title || 'Foto del día');

  awardPetXP(member_id, 15, 'pet_mood');
  res.json({ success: true, id: result.lastInsertRowid, photo_url });
});

app.post('/api/closing/:day/vote', (req, res) => {
  const day = Number(req.params.day);
  const { voter_id, votes } = req.body;
  if (!voter_id || !votes) {
    return res.status(400).json({ error: 'Faltan datos de votación' });
  }

  const insertVote = db.prepare(`
    INSERT INTO day_votes (day_number, voter_id, category, nominee_type, target_id, target_name)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(day_number, voter_id, category) DO UPDATE SET
      nominee_type = excluded.nominee_type,
      target_id = excluded.target_id,
      target_name = excluded.target_name,
      created_at = CURRENT_TIMESTAMP
  `);

  Object.entries(votes).forEach(([category, data]) => {
    if (data && (data.target_id !== undefined || data.target_name)) {
      insertVote.run(day, voter_id, category, data.nominee_type || 'photo', data.target_id || null, data.target_name || '');
    }
  });

  awardPetXP(voter_id, 10, 'pet_mood');
  res.json({ success: true });
});

app.post('/api/closing/:day/reveal', (req, res) => {
  const day = Number(req.params.day);
  db.prepare("UPDATE day_closing SET status = 'revealed', revealed_at = CURRENT_TIMESTAMP WHERE day_number = ?").run(day);
  res.json({ success: true, status: 'revealed' });
});

app.post('/api/closing/:day/close', (req, res) => {
  const day = Number(req.params.day);
  db.prepare("UPDATE day_closing SET status = 'closed' WHERE day_number = ?").run(day);
  res.json({ success: true, status: 'closed' });
});

// ==========================================
// 5. RANKING DE SABORES (FOOD CRITICS)
// ==========================================
app.get('/api/flavors', (req, res) => {
  const reviews = db.prepare(`
    SELECT fr.*, m.name as author_name, m.avatar as author_avatar
    FROM food_reviews fr
    JOIN members m ON fr.created_by = m.id
    ORDER BY fr.id DESC
  `).all();

  const ratings = db.prepare(`
    SELECT frat.*, m.name as member_name, m.avatar as member_avatar
    FROM food_ratings frat
    JOIN members m ON frat.member_id = m.id
  `).all();

  const enriched = reviews.map(r => {
    const itemRatings = ratings.filter(rat => rat.review_id === r.id);
    const avgScore = itemRatings.length > 0 
      ? Math.round((itemRatings.reduce((sum, rat) => sum + rat.score, 0) / itemRatings.length) * 10) / 10 
      : 0;
    const repeatCount = itemRatings.filter(rat => rat.would_repeat === 1).length;
    const repeatPercent = itemRatings.length > 0 
      ? Math.round((repeatCount / itemRatings.length) * 100) 
      : 100;
    return {
      ...r,
      ratings: itemRatings,
      ratings_count: itemRatings.length,
      avg_score: avgScore,
      repeat_percent: repeatPercent
    };
  });

  res.json({ flavors: enriched });
});

app.post('/api/flavors', upload.single('photo'), (req, res) => {
  const { name, category, city, price, rating, would_repeat, created_by } = req.body;
  if (!name || !created_by) {
    return res.status(400).json({ error: 'Nombre y miembro creador son requeridos' });
  }

  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
  const result = db.prepare(`
    INSERT INTO food_reviews (name, category, city, photo_url, price, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, category || 'Salado', city || 'Madrid', photo_url, Number(price) || 0, created_by);

  const reviewId = result.lastInsertRowid;
  db.prepare(`
    INSERT INTO food_ratings (review_id, member_id, score, would_repeat)
    VALUES (?, ?, ?, ?)
  `).run(reviewId, created_by, Number(rating) || 8, (would_repeat === '0' || would_repeat === 0) ? 0 : 1);

  awardPetXP(created_by, 20, 'pet_hunger');
  res.json({ success: true, id: reviewId });
});

app.post('/api/flavors/:id/rate', (req, res) => {
  const review_id = Number(req.params.id);
  const { member_id, score, would_repeat } = req.body;
  if (!member_id || score === undefined) {
    return res.status(400).json({ error: 'Faltan datos de puntuación' });
  }

  db.prepare(`
    INSERT INTO food_ratings (review_id, member_id, score, would_repeat)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(review_id, member_id) DO UPDATE SET
      score = excluded.score,
      would_repeat = excluded.would_repeat,
      created_at = CURRENT_TIMESTAMP
  `).run(review_id, member_id, Number(score), would_repeat ? 1 : 0);

  awardPetXP(member_id, 10, 'pet_hunger');
  res.json({ success: true });
});

// ==========================================
// FEED DE FOTOS UNIFICADO DEL VIAJE
// ==========================================
app.get('/api/feed', (req, res) => {
  const bingoPhotos = db.prepare(`
    SELECT bc.id, bc.photo_url, bc.completed_at as timestamp, m.name as author_name, m.avatar as author_avatar,
           'Comida Típica: ' || bi.title as title, '🍲 Bingo' as tag
    FROM bingo_completions bc
    JOIN members m ON bc.member_id = m.id
    JOIN bingo_items bi ON bc.item_id = bi.id
    WHERE bc.photo_url IS NOT NULL
  `).all();

  const colorPhotos = db.prepare(`
    SELECT cs.id, cs.photo_url, cs.submitted_at as timestamp, m.name as author_name, m.avatar as author_avatar,
           cc.color_name || ' - ' || COALESCE(cs.caption, '') as title, '🎨 Reto de Color' as tag
    FROM color_submissions cs
    JOIN members m ON cs.member_id = m.id
    JOIN color_challenges cc ON cs.challenge_id = cc.id
  `).all();

  const missionPhotos = db.prepare(`
    SELECT ms.id, ms.photo_url, ms.created_at as timestamp, m.name as author_name, m.avatar as author_avatar,
           'Misión: ' || dm.title as title, '🧭 Misión' as tag
    FROM mission_submissions ms
    JOIN members m ON ms.member_id = m.id
    JOIN daily_missions dm ON ms.mission_id = dm.id
    WHERE ms.photo_url IS NOT NULL
  `).all();

  const detailPhotos = db.prepare(`
    SELECT dc.id, dc.photo_url, dc.created_at as timestamp, m.name as author_name, m.avatar as author_avatar,
           'Detalle: ' || cd.title as title, '🔍 Detalle' as tag
    FROM detail_completions dc
    JOIN members m ON dc.member_id = m.id
    JOIN city_details cd ON dc.detail_id = cd.id
    WHERE dc.photo_url IS NOT NULL
  `).all();

  const alphabetPhotos = db.prepare(`
    SELECT ta.id, ta.photo_url, ta.created_at as timestamp, m.name as author_name, m.avatar as author_avatar,
           'Letra ' || ta.letter || ': ' || COALESCE(ta.word_hint, '') as title, '🔤 Abecedario' as tag
    FROM travel_alphabet ta
    JOIN members m ON ta.member_id = m.id
    WHERE ta.photo_url IS NOT NULL
  `).all();

  const flavorPhotos = db.prepare(`
    SELECT fr.id, fr.photo_url, fr.created_at as timestamp, m.name as author_name, m.avatar as author_avatar,
           'Sabor: ' || fr.name as title, '🍕 Sabor' as tag
    FROM food_reviews fr
    JOIN members m ON fr.created_by = m.id
    WHERE fr.photo_url IS NOT NULL
  `).all();

  const all = [...bingoPhotos, ...colorPhotos, ...missionPhotos, ...detailPhotos, ...alphabetPhotos, ...flavorPhotos]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(all);
});

// In production, serve the built SPA from dist/
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✈️ Family Trip Server listening on port ${PORT}`);
  console.log(`📁 Data directory: ${DATA_DIR}`);
});

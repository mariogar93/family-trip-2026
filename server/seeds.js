// Datos reales y actualizados de itinerario, alojamientos, vuelos y actividades (21 Nov - 5 Dic 2026)

export const REAL_DAYS = [
  {
    "day_number": 1,
    "city": "Madrid",
    "city_to": null,
    "is_transfer": 0,
    "title": "Despegue hacia Europa ✈️",
    "date_str": "2026-11-21",
    "notes": "Vuelo internacional y preparativos de viaje"
  },
  {
    "day_number": 2,
    "city": "Madrid",
    "city_to": null,
    "is_transfer": 0,
    "title": "Llegada y Atardecer en Debod 🌅",
    "date_str": "2026-11-22",
    "notes": "Instalación en C/ de Ferraz, Templo de Debod y paseo nocturno por Gran Vía"
  },
  {
    "day_number": 3,
    "city": "Madrid",
    "city_to": null,
    "is_transfer": 0,
    "title": "Madrid de los Austrias y Eje Central 🏰",
    "date_str": "2026-11-23",
    "notes": "Palacio Real y Almudena (exteriores), Plaza Mayor y tapeo en La Latina"
  },
  {
    "day_number": 4,
    "city": "Madrid",
    "city_to": null,
    "is_transfer": 0,
    "title": "Paisaje de la Luz y El Retiro 🌳",
    "date_str": "2026-11-24",
    "notes": "Paseo del Prado (exterior), Parque del Retiro, Palacio de Cristal y Barrio de Las Letras"
  },
  {
    "day_number": 5,
    "city": "Madrid",
    "city_to": "Roma",
    "is_transfer": 1,
    "title": "Vuelo Madrid ➔ Roma y San Giovanni ✈️",
    "date_str": "2026-11-25",
    "notes": "Vuelo a Roma FCO (13:05 - 15:30), base en San Giovanni / Ponte Lungo y paseo vespertino"
  },
  {
    "day_number": 6,
    "city": "Roma",
    "city_to": null,
    "is_transfer": 0,
    "title": "Vaticano, Plazas Barrocas y Panteón 🏛️",
    "date_str": "2026-11-26",
    "notes": "Entradas pagadas: Museos Vaticanos (08:30 AM) y Panteón de Agripa (06:00 PM)"
  },
  {
    "day_number": 7,
    "city": "Roma",
    "city_to": null,
    "is_transfer": 0,
    "title": "Alba en Trevi, Coliseo y Trastévere ⚔️",
    "date_str": "2026-11-27",
    "notes": "Fontana di Trevi al alba, Coliseo y Foro Romano (08:30 AM entrada pagada) y atardecer en Trastévere"
  },
  {
    "day_number": 8,
    "city": "Roma",
    "city_to": "Florencia",
    "is_transfer": 1,
    "title": "Escapada en Tren a Florencia 🚄🎨",
    "date_str": "2026-11-28",
    "notes": "Tren alta velocidad Roma ↔ Florencia. Duomo, Piazza della Signoria, Ponte Vecchio y Oltrarno"
  },
  {
    "day_number": 9,
    "city": "Roma",
    "city_to": null,
    "is_transfer": 0,
    "title": "Miradores, Plaza de España y Paseo Relajado 🍨",
    "date_str": "2026-11-29",
    "notes": "Plaza de España, Trinità dei Monti, Villa Borghese, mirador del Pincio y helado artesanal"
  },
  {
    "day_number": 10,
    "city": "Roma",
    "city_to": "Barcelona",
    "is_transfer": 1,
    "title": "Vuelo Roma ➔ Barcelona y Barrio Gótico ✈️",
    "date_str": "2026-11-30",
    "notes": "Vuelo a Barcelona BCN (12:35 - 14:25), base en Poblenou, Barri Gòtic y tapeo en El Born"
  },
  {
    "day_number": 11,
    "city": "Barcelona",
    "city_to": "Peñíscola",
    "is_transfer": 1,
    "title": "Escapada en Tren a Peñíscola 🚄🌊",
    "date_str": "2026-12-01",
    "notes": "Tren ida y vuelta a Peñíscola. Casco histórico medieval, murallas sobre el mar y arroz marinero"
  },
  {
    "day_number": 12,
    "city": "Barcelona",
    "city_to": null,
    "is_transfer": 0,
    "title": "Park Güell, Gràcia y Passeig de Gràcia 🦎",
    "date_str": "2026-12-02",
    "notes": "Entrada pagada: Park Güell Zona Monumental (09:15 AM). Vila de Gràcia y fachadas de Gaudí"
  },
  {
    "day_number": 13,
    "city": "Barcelona",
    "city_to": null,
    "is_transfer": 0,
    "title": "Sagrada Família, Boqueria y Montjuïc ⛪",
    "date_str": "2026-12-03",
    "notes": "Sagrada Família (exterior), Mercat de la Boqueria y mirador panorámico de Montjuïc"
  },
  {
    "day_number": 14,
    "city": "Barcelona",
    "city_to": "Madrid",
    "is_transfer": 1,
    "title": "Regreso en AVE y Tour Santiago Bernabéu 🚄⚽",
    "date_str": "2026-12-04",
    "notes": "AVE BCN ➔ MAD (06:35 - 09:52 AM). Entrada confirmada: Tour Santiago Bernabéu (01:30 PM)"
  },
  {
    "day_number": 15,
    "city": "Madrid",
    "city_to": null,
    "is_transfer": 0,
    "title": "Últimas Compras y Vuelo de Regreso ✈️",
    "date_str": "2026-12-05",
    "notes": "Paseo final por Calle Arenal / Sol y vuelo internacional de regreso a casa"
  }
];

export const REAL_TRANSITS = [
  {
    "day_number": 1,
    "date_str": "2026-11-21",
    "type": "flight",
    "origin": "SJO San José (Costa Rica)",
    "origin_time": "21:20",
    "destination": "MAD Madrid-Barajas T4",
    "destination_time": "14:15 (+1)",
    "notes": "Iberojet • Vuelo internacional hacia Madrid"
  },
  {
    "day_number": 8,
    "date_str": "2026-11-28",
    "type": "train",
    "origin": "Roma Termini",
    "origin_time": "06:55",
    "destination": "Firenze Santa Maria Novella",
    "destination_time": "08:31",
    "notes": "Frecciarossa / Italo • Escapada a Florencia (Ida)"
  },
  {
    "day_number": 8,
    "date_str": "2026-11-28",
    "type": "train",
    "origin": "Firenze Santa Maria Novella",
    "origin_time": "20:03",
    "destination": "Roma Termini",
    "destination_time": "21:43",
    "notes": "Frecciarossa / Italo • Retorno de Florencia a Roma"
  },
  {
    "day_number": 10,
    "date_str": "2026-11-30",
    "type": "flight",
    "origin": "FCO Roma Fiumicino T1",
    "origin_time": "12:35",
    "destination": "BCN Barcelona-El Prat T1",
    "destination_time": "14:25",
    "notes": "Vuelo directo Roma ➔ Barcelona"
  },
  {
    "day_number": 11,
    "date_str": "2026-12-01",
    "type": "train",
    "origin": "Barcelona Sants",
    "origin_time": "07:40",
    "destination": "Benicarló-Peñíscola",
    "destination_time": "09:35",
    "notes": "Tren Regional Exprés / Larga Distancia • Escapada a Peñíscola (Ida)"
  },
  {
    "day_number": 11,
    "date_str": "2026-12-01",
    "type": "train",
    "origin": "Benicarló-Peñíscola",
    "origin_time": "19:03",
    "destination": "Barcelona Sants",
    "destination_time": "20:57",
    "notes": "Tren Regional Exprés / Larga Distancia • Retorno a Barcelona"
  },
  {
    "day_number": 14,
    "date_str": "2026-12-04",
    "type": "train",
    "origin": "Barcelona Sants",
    "origin_time": "06:35",
    "destination": "Madrid Puerta de Atocha",
    "destination_time": "09:52",
    "notes": "AVE Alta Velocidad • Traslado matutino para el Bernabéu"
  },
  {
    "day_number": null,
    "date_str": "2026-11-25",
    "type": "flight",
    "origin": "MAD Madrid-Barajas T4",
    "origin_time": "13:05",
    "destination": "FCO Roma Fiumicino T3",
    "destination_time": "15:30",
    "notes": "Iberia • Vuelo directo Madrid ➔ Roma"
  },
  {
    "day_number": null,
    "date_str": "2026-12-05",
    "type": "flight",
    "origin": "MAD Madrid-Barajas T4",
    "origin_time": "16:00",
    "destination": "SJO San José (Costa Rica)",
    "destination_time": "21:45",
    "notes": "Iberojet • Vuelo internacional de regreso a casa"
  }
];

export const REAL_PLACES = [
  {
    "day_number": 2,
    "date_str": "2026-11-22",
    "title": "Templo de Debod",
    "category": "Monumento",
    "description": "Templo egipcio s. II a.C. donado a España. El mejor mirador al atardecer sobre la Casa de Campo.",
    "location": "Calle de Ferraz, Madrid",
    "maps_url": "https://maps.google.com/?q=Templo+de+Debod+Madrid"
  },
  {
    "day_number": 2,
    "date_str": "2026-11-22",
    "title": "Jardines de Sabatini & Gran Vía",
    "category": "Paseo",
    "description": "Paseo nocturno con iluminación, jardines geométricos y vistas al neón Schweppes del Edificio Carrión.",
    "location": "Plaza de España / Gran Vía, Madrid",
    "maps_url": "https://maps.google.com/?q=Jardines+de+Sabatini+Madrid"
  },
  {
    "day_number": 3,
    "date_str": "2026-11-23",
    "title": "Palacio Real y Catedral de la Almudena (Exteriores)",
    "category": "Monumento",
    "description": "Recorrido exterior por la Plaza de la Armería, fachada neogótica de la Almudena, Plaza de Oriente y Teatro Real.",
    "location": "Plaza de la Armería, Madrid",
    "maps_url": "https://maps.google.com/?q=Palacio+Real+Madrid"
  },
  {
    "day_number": 3,
    "date_str": "2026-11-23",
    "title": "Plaza de la Villa y Plaza Mayor",
    "category": "Histórico",
    "description": "Rincón medieval de los Austrias (s. XV), soportales de la Plaza Mayor y paradas gastronómicas.",
    "location": "Centro Histórico, Madrid",
    "maps_url": "https://maps.google.com/?q=Plaza+Mayor+Madrid"
  },
  {
    "day_number": 3,
    "date_str": "2026-11-23",
    "title": "Puerta del Sol y Fuente de Cibeles",
    "category": "Plaza",
    "description": "Kilómetro Cero, estatua del Oso y el Madroño y caminata por Calle Alcalá hasta Cibeles.",
    "location": "Sol - Alcalá, Madrid",
    "maps_url": "https://maps.google.com/?q=Puerta+del+Sol+Madrid"
  },
  {
    "day_number": 3,
    "date_str": "2026-11-23",
    "title": "Barrio de La Latina (Cava Baja)",
    "category": "Gastronomía",
    "description": "Ruta nocturna de tapas tradicionales y vinos en tabernas clásicas madrileñas.",
    "location": "Calle Cava Baja, Madrid",
    "maps_url": "https://maps.google.com/?q=Calle+Cava+Baja+Madrid"
  },
  {
    "day_number": 4,
    "date_str": "2026-11-24",
    "title": "Paseo del Prado (Exterior Museo) y Puerta de Alcalá",
    "category": "Cultura",
    "description": "Fachada y jardines del Prado, Fuente de Neptuno y fotografía ante la monumental puerta de Carlos III.",
    "location": "Paseo del Prado, Madrid",
    "maps_url": "https://maps.google.com/?q=Puerta+de+Alcala+Madrid"
  },
  {
    "day_number": 4,
    "date_str": "2026-11-24",
    "title": "Parque de El Retiro y Palacio de Cristal",
    "category": "Parque",
    "description": "Estanque Grande, monumento a Alfonso XII y arquitectura de hierro y vidrio en el Palacio de Cristal.",
    "location": "Parque del Retiro, Madrid",
    "maps_url": "https://maps.google.com/?q=Palacio+de+Cristal+Retiro"
  },
  {
    "day_number": 4,
    "date_str": "2026-11-24",
    "title": "Barrio de Las Letras y Plaza de Santa Ana",
    "category": "Paseo",
    "description": "Callejuelas donde vivieron Cervantes y Lope de Vega con citas doradas grabadas en el suelo.",
    "location": "Calle de las Huertas, Madrid",
    "maps_url": "https://maps.google.com/?q=Plaza+de+Santa+Ana+Madrid"
  },
  {
    "day_number": 5,
    "date_str": "2026-11-25",
    "title": "Chocolatería San Ginés",
    "category": "Gastronomía",
    "description": "Fundada en 1894. Desayuno tradicional de chocolate espeso a la taza con churros recién hechos.",
    "location": "Pasadizo de San Ginés, 5, Madrid",
    "maps_url": "https://maps.google.com/?q=Chocolateria+San+Gines+Madrid"
  },
  {
    "day_number": 5,
    "date_str": "2026-11-25",
    "title": "Archibasílica de San Giovanni in Laterano",
    "category": "Iglesia",
    "description": "Catedral de Roma y madre de todas las basílicas. Monumental fachada cercana al hospedaje.",
    "location": "Piazza di San Giovanni in Laterano, Roma",
    "maps_url": "https://maps.google.com/?q=San+Giovanni+in+Laterano+Roma"
  },
  {
    "day_number": 6,
    "date_str": "2026-11-26",
    "title": "Museos Vaticanos y Capilla Sixtina [08:30 AM]",
    "category": "Museo",
    "description": "ENTRADA INTERIOR PAGADA (08:30 AM). Presentación 08:15 AM en Viale Vaticano. Galerías de Mapas, Estancias de Rafael y Capilla Sixtina.",
    "location": "Viale Vaticano, Ciudad del Vaticano",
    "maps_url": "https://maps.google.com/?q=Musei+Vaticani+Roma"
  },
  {
    "day_number": 6,
    "date_str": "2026-11-26",
    "title": "Plaza y Basílica de San Pedro (Exteriores)",
    "category": "Monumento",
    "description": "Contemplación de la columnata elíptica de Bernini y fachada mayor desde la plaza. Almuerzo en Borgo Pio.",
    "location": "Piazza San Pietro, Ciudad del Vaticano",
    "maps_url": "https://maps.google.com/?q=Piazza+San+Pietro+Roma"
  },
  {
    "day_number": 6,
    "date_str": "2026-11-26",
    "title": "Castillo y Puente Sant'Angelo",
    "category": "Monumento",
    "description": "Paseo fotográfico sobre el Tíber flanqueado por los diez ángeles de Bernini frente al mausoleo de Adriano.",
    "location": "Lungotevere Castello, Roma",
    "maps_url": "https://maps.google.com/?q=Castel+Sant+Angelo+Roma"
  },
  {
    "day_number": 6,
    "date_str": "2026-11-26",
    "title": "Palazzo Altemps (Exterior) y Piazza Navona",
    "category": "Plaza",
    "description": "Exterior del palacio renacentista y gran plaza barroca con la Fuente de los Cuatro Ríos de Bernini.",
    "location": "Piazza Navona, Roma",
    "maps_url": "https://maps.google.com/?q=Piazza+Navona+Roma"
  },
  {
    "day_number": 6,
    "date_str": "2026-11-26",
    "title": "Panteón de Agripa [06:00 PM]",
    "category": "Monumento",
    "description": "ENTRADA INTERIOR PAGADA (06:00 PM). Ingreso reservado bajo la cúpula de hormigón más grande de la antigüedad y tumba de Rafael Sanzio.",
    "location": "Piazza della Rotonda, Roma",
    "maps_url": "https://maps.google.com/?q=Pantheon+Roma"
  },
  {
    "day_number": 6,
    "date_str": "2026-11-26",
    "title": "Iglesia de San Ignacio de Loyola",
    "category": "Iglesia",
    "description": "Espectacular ilusión óptica 3D de Andrea Pozzo simulando una cúpula sobre techo plano con espejo fotográfico.",
    "location": "Via del Caravita, Roma",
    "maps_url": "https://maps.google.com/?q=Sant+Ignazio+Roma"
  },
  {
    "day_number": 7,
    "date_str": "2026-11-27",
    "title": "Fontana di Trevi",
    "category": "Monumento",
    "description": "Visita recomendada al alba (06:15 AM) para disfrutarla completamente iluminada y despejada para el lanzamiento de moneda.",
    "location": "Piazza di Trevi, Roma",
    "maps_url": "https://maps.google.com/?q=Fontana+di+Trevi+Roma"
  },
  {
    "day_number": 7,
    "date_str": "2026-11-27",
    "title": "Coliseo, Foro Romano y Monte Palatino [08:30 AM]",
    "category": "Arqueológico",
    "description": "ENTRADA INTERIOR PAGADA (08:30 AM). Presentación 08:15 AM en puerta Sperone Valadier con ID. Recorrido interior por el anfiteatro y yacimiento.",
    "location": "Piazza del Colosseo, Roma",
    "maps_url": "https://maps.google.com/?q=Colosseo+Roma"
  },
  {
    "day_number": 7,
    "date_str": "2026-11-27",
    "title": "Rione Monti, Piazza del Campidoglio y Trastevere",
    "category": "Paseo",
    "description": "Callejuelas medievales de Monti, mirador trasero del Campidoglio al Foro y atardecer en Santa Maria in Trastevere.",
    "location": "Trastevere / Monti, Roma",
    "maps_url": "https://maps.google.com/?q=Santa+Maria+in+Trastevere"
  },
  {
    "day_number": 8,
    "date_str": "2026-11-28",
    "title": "Duomo y Piazza del Duomo",
    "category": "Monumento",
    "description": "Catedral de Santa Maria del Fiore con la cúpula de Brunelleschi, Campanile de Giotto y Baptisterio.",
    "location": "Piazza del Duomo, Florencia",
    "maps_url": "https://maps.google.com/?q=Duomo+Firenze"
  },
  {
    "day_number": 8,
    "date_str": "2026-11-28",
    "title": "Piazza della Signoria y Loggia dei Lanzi",
    "category": "Plaza",
    "description": "Corazón político renacentista, fachada del Palazzo Vecchio y museo de esculturas al aire libre.",
    "location": "Piazza della Signoria, Florencia",
    "maps_url": "https://maps.google.com/?q=Piazza+della+Signoria+Firenze"
  },
  {
    "day_number": 8,
    "date_str": "2026-11-28",
    "title": "Ponte Vecchio y Oltrarno",
    "category": "Paseo",
    "description": "Cruce del puente medieval sobre el río Arno, joyerías históricas, panino toscano y paseo artesano.",
    "location": "Ponte Vecchio, Florencia",
    "maps_url": "https://maps.google.com/?q=Ponte+Vecchio+Firenze"
  },
  {
    "day_number": 9,
    "date_str": "2026-11-29",
    "title": "Piazza di Spagna y Palazzo Colonna (Exterior)",
    "category": "Plaza",
    "description": "Escalinata monumental de Trinità dei Monti, Fuente de la Barcaccia de Bernini y fachada señorial de Palazzo Colonna.",
    "location": "Piazza di Spagna, Roma",
    "maps_url": "https://maps.google.com/?q=Piazza+di+Spagna+Roma"
  },
  {
    "day_number": 9,
    "date_str": "2026-11-29",
    "title": "Villa Borghese, Mirador del Pincio y Piazza del Popolo",
    "category": "Parque",
    "description": "Gran parque arbolado, mirador panorámico sobre los techos romanos y compras distendidas por Via del Corso.",
    "location": "Terrazza del Pincio, Roma",
    "maps_url": "https://maps.google.com/?q=Terrazza+del+Pincio+Roma"
  },
  {
    "day_number": 10,
    "date_str": "2026-11-30",
    "title": "Barri Gòtic, Pont del Bisbe y Plaça Reial",
    "category": "Histórico",
    "description": "Fachada gótica de la Catedral, balcón de piedra neogótico, Plaça Sant Jaume y farolas de Gaudí con palmeras.",
    "location": "Barri Gòtic, Barcelona",
    "maps_url": "https://maps.google.com/?q=Pont+del+Bisbe+Barcelona"
  },
  {
    "day_number": 10,
    "date_str": "2026-11-30",
    "title": "Barrio de El Born",
    "category": "Paseo",
    "description": "Calles peatonales medievales iluminadas con ambiente navideño y cena de platillos catalanes.",
    "location": "El Born, Barcelona",
    "maps_url": "https://maps.google.com/?q=El+Born+Barcelona"
  },
  {
    "day_number": 11,
    "date_str": "2026-12-01",
    "title": "Casco Medieval, Murallas y El Bufador",
    "category": "Histórico",
    "description": "Callejuelas encaladas frente al Mediterráneo y grieta natural del Bufador donde sopla el oleaje.",
    "location": "Casco Antiguo, Peñíscola",
    "maps_url": "https://maps.google.com/?q=Casco+Antiguo+Peniscola"
  },
  {
    "day_number": 11,
    "date_str": "2026-12-01",
    "title": "Castillo del Papa Luna (Exteriores)",
    "category": "Castillo",
    "description": "Imponente fortaleza templaria del siglo XIV erigida sobre el peñón costero.",
    "location": "Castillo de Peñíscola",
    "maps_url": "https://maps.google.com/?q=Castillo+del+Papa+Luna+Peniscola"
  },
  {
    "day_number": 12,
    "date_str": "2026-12-02",
    "title": "Park Güell (Zona Monumental Interior) [09:15 AM]",
    "category": "Parque",
    "description": "ENTRADA INTERIOR PAGADA (09:15 AM - Acceso 09:30 AM). Escalinata del dragón de trencadís, Sala Hipóstila y gran banco ondulado con vistas al mar.",
    "location": "Gràcia, Barcelona",
    "maps_url": "https://maps.google.com/?q=Park+Guell+Barcelona"
  },
  {
    "day_number": 12,
    "date_str": "2026-12-02",
    "title": "Vila de Gràcia (Plaça del Sol y Virreina)",
    "category": "Barrio Típico",
    "description": "Descenso a pie al barrio bohemio por excelencia: plazas peatonales con ambiente de pueblo y comida casera.",
    "location": "Gràcia, Barcelona",
    "maps_url": "https://maps.google.com/?q=Placa+del+Sol+Gracia+Barcelona"
  },
  {
    "day_number": 12,
    "date_str": "2026-12-02",
    "title": "Passeig de Gràcia: Casa Batlló y La Pedrera (Fachadas)",
    "category": "Arquitectura",
    "description": "Manzana de la Discordia (tejado de dragón de Casa Batlló, Casa Amatller) y chimeneas de La Pedrera desde la calle.",
    "location": "Passeig de Gràcia, Barcelona",
    "maps_url": "https://maps.google.com/?q=Casa+Batllo+Barcelona"
  },
  {
    "day_number": 13,
    "date_str": "2026-12-03",
    "title": "Sagrada Família y Recinte Modernista Sant Pau (Exteriores)",
    "category": "Monumento",
    "description": "Contemplación de las fachadas del Nacimiento y Pasión desde los parques y caminata por Avinguda Gaudí hacia Sant Pau.",
    "location": "Eixample, Barcelona",
    "maps_url": "https://maps.google.com/?q=Sagrada+Familia+Barcelona"
  },
  {
    "day_number": 13,
    "date_str": "2026-12-03",
    "title": "Mercat de la Boqueria y Las Ramblas",
    "category": "Gastronomía",
    "description": "Puestos de frutas frescas, jamón ibérico y almuerzo de tapas en barra tradicional.",
    "location": "Las Ramblas, 91, Barcelona",
    "maps_url": "https://maps.google.com/?q=Mercat+de+la+Boqueria+Barcelona"
  },
  {
    "day_number": 13,
    "date_str": "2026-12-03",
    "title": "Montjuïc: Castillo (Exterior) y Anillo Olímpico",
    "category": "Mirador",
    "description": "Subida en bus 150 al baluarte militar con miradores 360° sobre el puerto de Barcelona y paseo olímpico.",
    "location": "Montjuïc, Barcelona",
    "maps_url": "https://maps.google.com/?q=Castell+de+Montjuic+Barcelona"
  },
  {
    "day_number": 14,
    "date_str": "2026-12-04",
    "title": "Estadio Santiago Bernabéu (Tour Interior) [01:30 PM]",
    "category": "Deporte",
    "description": "ENTRADA INTERIOR CONFIRMADA (01:30 PM). Museo oficial del Real Madrid, sala de trofeos de Champions, mirador panorámico interior y tienda.",
    "location": "Av. de Concha Espina, 1, Madrid",
    "maps_url": "https://maps.google.com/?q=Estadio+Santiago+Bernabeu+Madrid"
  },
  {
    "day_number": 14,
    "date_str": "2026-12-04",
    "title": "Terraza 360° Hotel Riu Plaza España",
    "category": "Mirador",
    "description": "Subida al piso 27 y pasarela de cristal suspendida sobre la Gran Vía al atardecer para el brindis final del viaje.",
    "location": "Gran Vía, 84, Madrid",
    "maps_url": "https://maps.google.com/?q=Hotel+Riu+Plaza+Espana+Madrid"
  },
  {
    "day_number": 15,
    "date_str": "2026-12-05",
    "title": "Calle Arenal y Puerta del Sol (Últimas Compras)",
    "category": "Compras",
    "description": "Paseo tranquilo de despedida para recuerdos gastronómicos (turrones artesanales, jamón) antes del aeropuerto.",
    "location": "Puerta del Sol / Arenal, Madrid",
    "maps_url": "https://maps.google.com/?q=Calle+del+Arenal+Madrid"
  }
];

export const REAL_ACTIVITIES = [
  {
    "day_number": 1,
    "time_str": "09:20 PM",
    "title": "Vuelo Internacional SJO ➔ MAD",
    "location": "Aeropuerto Juan Santamaría (SJO)",
    "notes": "plane",
    "status": "pending"
  },
  {
    "day_number": 2,
    "time_str": "02:00 PM",
    "title": "Check-in y comida ligera",
    "location": "C/ de Ferraz (Plaza de España)",
    "notes": "hotel",
    "status": "pending"
  },
  {
    "day_number": 2,
    "time_str": "04:45 PM",
    "title": "Atardecer dorado en Debod (puesta de sol ~05:15 PM)",
    "location": "Templo de Debod",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 2,
    "time_str": "08:30 PM",
    "title": "Cena de tapas en Gran Vía",
    "location": "Gran Vía / Plaza de España",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 3,
    "time_str": "09:30 AM",
    "title": "Ruta exterior: Armería, Almudena y Plaza de Oriente",
    "location": "Palacio Real",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 3,
    "time_str": "01:30 PM",
    "title": "Almuerzo: Bocadillo de calamares o tapas en San Miguel",
    "location": "Plaza Mayor",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 3,
    "time_str": "07:30 PM",
    "title": "Ronda de pinchos y vinos en Cava Baja",
    "location": "La Latina",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 4,
    "time_str": "10:00 AM",
    "title": "Paseo del Prado exterior y foto en Puerta de Alcalá",
    "location": "Paseo de la Luz",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 4,
    "time_str": "01:30 PM",
    "title": "Almuerzo tradicional en barrio Salamanca / Retiro",
    "location": "Menéndez Pelayo",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 4,
    "time_str": "04:30 PM",
    "title": "Café de media tarde en Plaza de Santa Ana",
    "location": "Barrio de Las Letras",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 5,
    "time_str": "08:30 AM",
    "title": "Chocolate con churros recién hechos en San Ginés",
    "location": "Pasadizo de San Ginés",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 5,
    "time_str": "10:15 AM",
    "title": "Traslado al aeropuerto Barajas T4",
    "location": "Madrid-Barajas",
    "notes": "plane",
    "status": "pending"
  },
  {
    "day_number": 5,
    "time_str": "04:30 PM",
    "title": "Llegada a Roma: Leonardo Express + Metro A a Ponte Lungo",
    "location": "San Giovanni / Ponte Lungo",
    "notes": "hotel",
    "status": "pending"
  },
  {
    "day_number": 5,
    "time_str": "05:30 PM",
    "title": "Paseo por San Giovanni in Laterano y cena en trattoria local",
    "location": "Piazza di San Giovanni in Laterano",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 6,
    "time_str": "08:15 AM",
    "title": "Presentarse en control de seguridad Viale Vaticano (Entrada 08:30 AM)",
    "location": "Museos Vaticanos",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 6,
    "time_str": "01:00 PM",
    "title": "Almuerzo tradicional: pasta cacio e pepe o carbonara",
    "location": "Borgo Pio",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 6,
    "time_str": "05:45 PM",
    "title": "Presentación en el Panteón de Agripa (Entrada 06:00 PM)",
    "location": "Piazza della Rotonda",
    "notes": "monument",
    "status": "pending"
  },
  {
    "day_number": 7,
    "time_str": "06:15 AM",
    "title": "Paseo matutino al amanecer en Trevi sin multitudes",
    "location": "Fontana di Trevi",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 7,
    "time_str": "08:15 AM",
    "title": "Presentación con identificación en puerta Sperone Valadier (Entrada 08:30 AM)",
    "location": "Coliseo de Roma",
    "notes": "monument",
    "status": "pending"
  },
  {
    "day_number": 7,
    "time_str": "01:30 PM",
    "title": "Almuerzo en trattoria familiar en Rione Monti",
    "location": "Via del Boschetto",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 7,
    "time_str": "07:30 PM",
    "title": "Cena típica romana en Trastevere",
    "location": "Santa Maria in Trastevere",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 8,
    "time_str": "06:30 AM",
    "title": "Embarque tren alta velocidad Roma Termini ➔ Florencia (Salida 06:55 AM)",
    "location": "Roma Termini",
    "notes": "train",
    "status": "pending"
  },
  {
    "day_number": 8,
    "time_str": "01:30 PM",
    "title": "Panino toscano en All'Antico Vinaio y paseo sobre el Arno",
    "location": "Ponte Vecchio",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 8,
    "time_str": "07:45 PM",
    "title": "Embarque tren de retorno Firenze SMN ➔ Roma (Salida 08:03 PM)",
    "location": "Firenze SMN",
    "notes": "train",
    "status": "pending"
  },
  {
    "day_number": 9,
    "time_str": "10:30 AM",
    "title": "Paseo por Plaza de España y Escalinata Trinità dei Monti",
    "location": "Piazza di Spagna",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 9,
    "time_str": "03:00 PM",
    "title": "Mirador del Pincio sobre Roma y helado artesanal",
    "location": "Villa Borghese / Popolo",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 10,
    "time_str": "10:00 AM",
    "title": "Check-out y traslado al aeropuerto Fiumicino (Vuelo 12:35 PM)",
    "location": "Roma FCO",
    "notes": "plane",
    "status": "pending"
  },
  {
    "day_number": 10,
    "time_str": "03:30 PM",
    "title": "Llegada y check-in en Poblenou (Metro L4 a Jaume I)",
    "location": "El Poblenou / Diagonal Mar",
    "notes": "hotel",
    "status": "pending"
  },
  {
    "day_number": 10,
    "time_str": "08:00 PM",
    "title": "Tapeo en El Born: pan con tomate, embutidos y cava",
    "location": "El Xampanyet / Cal Pep",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 11,
    "time_str": "07:15 AM",
    "title": "Embarque tren Barcelona Sants ➔ Benicarló-Peñíscola (Salida 07:40 AM)",
    "location": "Barcelona Sants",
    "notes": "train",
    "status": "pending"
  },
  {
    "day_number": 11,
    "time_str": "02:00 PM",
    "title": "Almuerzo marinero de arroz caldoso o fideuà frente al mar",
    "location": "Puerto de Peñíscola",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 11,
    "time_str": "06:45 PM",
    "title": "Embarque tren de retorno Benicarló ➔ Barcelona (Salida 07:03 PM)",
    "location": "Estación Benicarló",
    "notes": "train",
    "status": "pending"
  },
  {
    "day_number": 12,
    "time_str": "09:00 AM",
    "title": "Llegada a Park Güell (Entrada Zona Monumental 09:15 AM)",
    "location": "Park Güell",
    "notes": "monument",
    "status": "pending"
  },
  {
    "day_number": 12,
    "time_str": "01:30 PM",
    "title": "Comida casera catalana: botifarra amb mongetes y escalivada",
    "location": "Vila de Gràcia",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 12,
    "time_str": "04:00 PM",
    "title": "Contemplación exterior de Casa Batlló y La Pedrera",
    "location": "Passeig de Gràcia",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 13,
    "time_str": "09:30 AM",
    "title": "Vistas exteriores de la Sagrada Família y paseo hacia Sant Pau",
    "location": "Avinguda Gaudí",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 13,
    "time_str": "01:00 PM",
    "title": "Almuerzo de tapas en barra de La Boqueria",
    "location": "Las Ramblas",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 13,
    "time_str": "04:00 PM",
    "title": "Subida en bus 150 a Montjuïc y vistas sobre el puerto",
    "location": "Montjuïc",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 14,
    "time_str": "06:15 AM",
    "title": "Embarque tren AVE Barcelona Sants ➔ Madrid Atocha (Salida 06:35 AM)",
    "location": "Barcelona Sants",
    "notes": "train",
    "status": "pending"
  },
  {
    "day_number": 14,
    "time_str": "10:30 AM",
    "title": "Llegada a Madrid Atocha, dejar equipaje y Metro L10 a Bernabéu",
    "location": "Puerta de Atocha",
    "notes": "hotel",
    "status": "pending"
  },
  {
    "day_number": 14,
    "time_str": "01:15 PM",
    "title": "Presentación Tour Santiago Bernabéu (Entrada confirmada 01:30 PM)",
    "location": "Estadio Bernabéu",
    "notes": "monument",
    "status": "pending"
  },
  {
    "day_number": 14,
    "time_str": "05:30 PM",
    "title": "Pasarela de cristal y brindis al atardecer sobre Gran Vía",
    "location": "Hotel Riu Plaza España",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 15,
    "time_str": "10:00 AM",
    "title": "Compras de recuerdos y turrones artesanales",
    "location": "Calle Arenal / Sol",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 15,
    "time_str": "01:00 PM",
    "title": "Traslado al aeropuerto Madrid-Barajas T4 (Vuelo 04:00 PM)",
    "location": "Madrid-Barajas",
    "notes": "plane",
    "status": "pending"
  }
];

export const REAL_LODGINGS = [
  {
    "city": "Madrid",
    "name": "Alojamiento Plaza de España & Debod",
    "address": "Calle de Ferraz, Plaza de España, Madrid",
    "maps_url": "https://maps.google.com/?q=Calle+de+Ferraz+Madrid",
    "airbnb_url": "https://airbnb.com",
    "check_in_date": "2026-11-22",
    "check_in_time": "14:00",
    "check_out_date": "2026-11-25",
    "check_out_time": "11:00",
    "door_code": "Consultar en app",
    "wifi_name": "Ferraz_Guest",
    "wifi_pass": "Madrid2026",
    "host_name": "Anfitrión Madrid",
    "host_phone": "+34 600 000 000",
    "notes": "Alojamiento frente al Templo de Debod y a pasos de Gran Vía (Metro L3 y L10 Argüelles / Plaza de España)."
  },
  {
    "city": "Roma",
    "name": "Base San Giovanni & Ponte Lungo",
    "address": "San Giovanni / Ponte Lungo, Roma, Italia",
    "maps_url": "https://maps.google.com/?q=Ponte+Lungo+Roma",
    "airbnb_url": "https://airbnb.com",
    "check_in_date": "2026-11-25",
    "check_in_time": "16:00",
    "check_out_date": "2026-11-30",
    "check_out_time": "10:00",
    "door_code": "Consultar en app",
    "wifi_name": "Roma_SanGiovanni",
    "wifi_pass": "Roma2026",
    "host_name": "Host Roma",
    "host_phone": "+39 300 000 000",
    "notes": "Conectado directamente con la estación Termini y el centro histórico vía Metro Línea A."
  },
  {
    "city": "Barcelona",
    "name": "Apartamento Poblenou & Diagonal Mar",
    "address": "El Poblenou / Diagonal Mar, Barcelona, España",
    "maps_url": "https://maps.google.com/?q=Poblenou+Barcelona",
    "airbnb_url": "https://airbnb.com",
    "check_in_date": "2026-11-30",
    "check_in_time": "15:30",
    "check_out_date": "2026-12-04",
    "check_out_time": "06:00",
    "door_code": "Consultar en app",
    "wifi_name": "BCN_Poblenou",
    "wifi_pass": "Barcelona2026",
    "host_name": "Host Barcelona",
    "host_phone": "+34 611 000 000",
    "notes": "Alojamiento conectado vía Metro L4 (Selva de Mar / Poblenou) directamente con el Born y el Gótico (estación Jaume I)."
  },
  {
    "city": "Madrid",
    "name": "Hospedaje Cierre de Viaje Bernabéu",
    "address": "Calle de Ferraz / Argüelles, Madrid, España",
    "maps_url": "https://maps.google.com/?q=Calle+de+Ferraz+Madrid",
    "airbnb_url": "https://airbnb.com",
    "check_in_date": "2026-12-04",
    "check_in_time": "11:00",
    "check_out_date": "2026-12-05",
    "check_out_time": "12:00",
    "door_code": "Consultar en app",
    "wifi_name": "Ferraz_Guest",
    "wifi_pass": "Madrid2026",
    "host_name": "Anfitrión Madrid",
    "host_phone": "+34 600 000 000",
    "notes": "Base para la jornada final del Bernabéu y la celebración de cierre de viaje."
  }
];

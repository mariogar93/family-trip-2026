// Datos reales de itinerario, alojamientos, vuelos y actividades para el viaje familiar (21 Nov - 5 Dic 2026)

export const REAL_DAYS = [
  {
    "day_number": 1,
    "city": "Madrid",
    "city_to": null,
    "is_transfer": 0,
    "title": "Despegue hacia Europa",
    "date_str": "2026-11-21",
    "notes": "Vuelo internacional y preparativos"
  },
  {
    "day_number": 2,
    "city": "Madrid",
    "city_to": null,
    "is_transfer": 0,
    "title": "Llegada a Madrid",
    "date_str": "2026-11-22",
    "notes": "Primer día en España"
  },
  {
    "day_number": 3,
    "city": "Madrid",
    "city_to": null,
    "is_transfer": 0,
    "title": "Madrid Histórico",
    "date_str": "2026-11-23",
    "notes": "Palacio Real y corazón de la ciudad"
  },
  {
    "day_number": 4,
    "city": "Madrid",
    "city_to": null,
    "is_transfer": 0,
    "title": "Arte y Jardines de Madrid",
    "date_str": "2026-11-24",
    "notes": "Parque del Retiro y Museos"
  },
  {
    "day_number": 5,
    "city": "Madrid",
    "city_to": "Roma",
    "is_transfer": 1,
    "title": "Vuelo Madrid ➔ Roma ✈️",
    "date_str": "2026-11-25",
    "notes": "Traslado aéreo a la Ciudad Eterna"
  },
  {
    "day_number": 6,
    "city": "Roma",
    "city_to": null,
    "is_transfer": 0,
    "title": "Roma Imperial",
    "date_str": "2026-11-26",
    "notes": "Coliseo y monumentos milenarios"
  },
  {
    "day_number": 7,
    "city": "Roma",
    "city_to": null,
    "is_transfer": 0,
    "title": "El Vaticano",
    "date_str": "2026-11-27",
    "notes": "Basílica de San Pedro y Museos"
  },
  {
    "day_number": 8,
    "city": "Roma",
    "city_to": null,
    "is_transfer": 0,
    "title": "Fuentes y Plazas de Roma",
    "date_str": "2026-11-28",
    "notes": "Fontana di Trevi y Panteón"
  },
  {
    "day_number": 9,
    "city": "Roma",
    "city_to": null,
    "is_transfer": 0,
    "title": "Vistas y Compras en Roma",
    "date_str": "2026-11-29",
    "notes": "Plaza de España y Mirador del Pincio"
  },
  {
    "day_number": 10,
    "city": "Roma",
    "city_to": "Barcelona",
    "is_transfer": 1,
    "title": "Vuelo Roma ➔ Barcelona ✈️",
    "date_str": "2026-11-30",
    "notes": "Vuelo internacional hacia Cataluña"
  },
  {
    "day_number": 11,
    "city": "Barcelona",
    "city_to": null,
    "is_transfer": 0,
    "title": "Sagrada Familia y Paseo de Gracia",
    "date_str": "2026-12-01",
    "notes": "Las obras cumbres de Antoni Gaudí"
  },
  {
    "day_number": 12,
    "city": "Barcelona",
    "city_to": null,
    "is_transfer": 0,
    "title": "Park Güell y Barrio Gótico",
    "date_str": "2026-12-02",
    "notes": "Naturaleza, mosaicos y callejones antiguos"
  },
  {
    "day_number": 13,
    "city": "Barcelona",
    "city_to": null,
    "is_transfer": 0,
    "title": "Montjuïc y la Playa",
    "date_str": "2026-12-03",
    "notes": "Brisa mediterránea y castillo"
  },
  {
    "day_number": 14,
    "city": "Barcelona",
    "city_to": "Madrid",
    "is_transfer": 1,
    "title": "Regreso a Madrid 🚄/✈️",
    "date_str": "2026-12-04",
    "notes": "Última noche en Madrid antes de volver"
  },
  {
    "day_number": 15,
    "city": "Madrid",
    "city_to": null,
    "is_transfer": 0,
    "title": "Vuelo de Regreso a Casa ✈️",
    "date_str": "2026-12-05",
    "notes": "¡Misión cumplida!"
  }
];

export const REAL_ACTIVITIES = [
  {
    "day_number": 1,
    "time_str": "06:00 PM",
    "title": "Llegada al aeropuerto y check-in",
    "location": "Mostradores de aerolínea",
    "notes": "plane",
    "status": "pending"
  },
  {
    "day_number": 1,
    "time_str": "09:30 PM",
    "title": "Embarque y despegue del vuelo internacional",
    "location": "Puerta de embarque",
    "notes": "plane",
    "status": "pending"
  },
  {
    "day_number": 2,
    "time_str": "10:30 AM",
    "title": "Llegada al aeropuerto y equipaje",
    "location": "Terminal 2, Barajas",
    "notes": "plane",
    "status": "pending"
  },
  {
    "day_number": 2,
    "time_str": "01:00 PM",
    "title": "Llegada al alojamiento y desempacar",
    "location": "Hotel Central",
    "notes": "hotel",
    "status": "pending"
  },
  {
    "day_number": 2,
    "time_str": "08:30 PM",
    "title": "Cena de bienvenida en restaurante local",
    "location": "Plaza Principal",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 3,
    "time_str": "09:30 AM",
    "title": "Churros con chocolate en San Ginés",
    "location": "Chocolatería San Ginés",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 3,
    "time_str": "03:00 PM",
    "title": "Tapas tradicionales en Mercado de San Miguel",
    "location": "Mercado de San Miguel",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 3,
    "time_str": "07:30 PM",
    "title": "Atardecer en Gran Vía y compras",
    "location": "Gran Vía",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 4,
    "time_str": "10:00 AM",
    "title": "Paseo en barca por el estanque",
    "location": "El Retiro",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 4,
    "time_str": "08:00 PM",
    "title": "Cena de tapas y paella madrileña",
    "location": "Barrio de las Letras",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 5,
    "time_str": "09:00 AM",
    "title": "Check-out del hotel en Madrid",
    "location": "Hotel Central Madrid",
    "notes": "hotel",
    "status": "pending"
  },
  {
    "day_number": 5,
    "time_str": "11:30 AM",
    "title": "Vuelo directo Madrid a Roma",
    "location": "Aeropuerto Barajas T4",
    "notes": "plane",
    "status": "pending"
  },
  {
    "day_number": 5,
    "time_str": "03:30 PM",
    "title": "Llegada y check-in en Roma",
    "location": "Alojamiento en Roma",
    "notes": "hotel",
    "status": "pending"
  },
  {
    "day_number": 5,
    "time_str": "08:00 PM",
    "title": "Primera cena romana en Trastevere",
    "location": "Trastevere",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 6,
    "time_str": "09:00 AM",
    "title": "Espresso matutino en barra italiana",
    "location": "Cafetería romana",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 6,
    "time_str": "01:30 PM",
    "title": "Almuerzo de pasta carbonara tradicional",
    "location": "Osteria romana",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 6,
    "time_str": "05:30 PM",
    "title": "Gelato artesanal italiano",
    "location": "Gelateria del Teatro",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 7,
    "time_str": "08:30 AM",
    "title": "Llegada temprana a Plaza San Pedro",
    "location": "Piazza San Pietro",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 7,
    "time_str": "02:00 PM",
    "title": "Pizza al taglio romana",
    "location": "Borgo Pio",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 8,
    "time_str": "09:00 AM",
    "title": "Lanzar moneda a la Fontana di Trevi",
    "location": "Piazza di Trevi",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 8,
    "time_str": "01:00 PM",
    "title": "Ciriola y tabla de quesos y embutidos",
    "location": "Piazza Navona",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 8,
    "time_str": "08:30 PM",
    "title": "Cena con pasta cacio e pepe",
    "location": "Campo de Fiori",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 9,
    "time_str": "10:30 AM",
    "title": "Paseo por los jardines de Villa Borghese",
    "location": "Villa Borghese",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 9,
    "time_str": "07:30 PM",
    "title": "Cena especial de despedida de Roma",
    "location": "Trastevere",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 10,
    "time_str": "09:30 AM",
    "title": "Check-out y traslado a Fiumicino",
    "location": "Hotel Roma",
    "notes": "hotel",
    "status": "pending"
  },
  {
    "day_number": 10,
    "time_str": "12:30 PM",
    "title": "Vuelo Roma a Barcelona",
    "location": "Aeropuerto FCO / BCN El Prat",
    "notes": "plane",
    "status": "pending"
  },
  {
    "day_number": 10,
    "time_str": "04:00 PM",
    "title": "Check-in y acomodo en Barcelona",
    "location": "Hotel Barcelona",
    "notes": "hotel",
    "status": "pending"
  },
  {
    "day_number": 10,
    "time_str": "07:30 PM",
    "title": "Paseo por La Rambla y cena de tapas",
    "location": "La Rambla",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 11,
    "time_str": "09:30 AM",
    "title": "Desayuno catalán con pan con tomate",
    "location": "Café de Gracia",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 11,
    "time_str": "02:00 PM",
    "title": "Comida de mariscos y paella",
    "location": "Restaurante local",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 12,
    "time_str": "10:00 AM",
    "title": "Visita y fotos con el dragón de trencadís",
    "location": "Park Güell",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 12,
    "time_str": "08:00 PM",
    "title": "Cena de tapas en el Barrio Gótico",
    "location": "Barrio Gótico",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 13,
    "time_str": "11:00 AM",
    "title": "Teleférico hacia el Castillo de Montjuïc",
    "location": "Montjuïc",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 13,
    "time_str": "03:30 PM",
    "title": "Paseo por la playa de la Barceloneta",
    "location": "Barceloneta",
    "notes": "walk",
    "status": "pending"
  },
  {
    "day_number": 13,
    "time_str": "08:30 PM",
    "title": "Cena especial de fin de estancia en Barcelona",
    "location": "Puerto Olímpico",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 14,
    "time_str": "10:00 AM",
    "title": "Check-out y viaje Barcelona ➔ Madrid",
    "location": "Sants / El Prat",
    "notes": "plane",
    "status": "pending"
  },
  {
    "day_number": 14,
    "time_str": "02:30 PM",
    "title": "Llegada y check-in en Madrid",
    "location": "Hotel Madrid",
    "notes": "hotel",
    "status": "pending"
  },
  {
    "day_number": 14,
    "time_str": "08:00 PM",
    "title": "Cena de gala de despedida del viaje familiar",
    "location": "Plaza Mayor, Madrid",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 15,
    "time_str": "09:00 AM",
    "title": "Último desayuno español con churros",
    "location": "Madrid",
    "notes": "food",
    "status": "pending"
  },
  {
    "day_number": 15,
    "time_str": "12:00 PM",
    "title": "Traslado al Aeropuerto Barajas y embarque",
    "location": "Aeropuerto Madrid-Barajas",
    "notes": "plane",
    "status": "pending"
  },
  {
    "day_number": 15,
    "time_str": "04:00 PM",
    "title": "Vuelo de regreso a casa con recuerdos inolvidables",
    "location": "Vuelo internacional",
    "notes": "plane",
    "status": "pending"
  }
];

export const REAL_PLACES = [
  {
    "title": "Plaza Central y Catedral",
    "date_str": "2026-11-22",
    "maps_url": "https://maps.google.com/?q=Plaza+Mayor+Madrid",
    "category": "Atracción",
    "description": "Paseo corto tras el vuelo",
    "location": "Centro Histórico",
    "day_number": 2
  },
  {
    "title": "Palacio Real de Madrid",
    "date_str": "2026-11-23",
    "maps_url": "https://maps.google.com/?q=Palacio+Real+Madrid",
    "category": "Atracción",
    "description": "Recorrido por los salones reales",
    "location": "Calle de Bailén",
    "day_number": 3
  },
  {
    "title": "Plaza Mayor",
    "date_str": "2026-11-23",
    "maps_url": "https://maps.google.com/?q=Plaza+Mayor+Madrid",
    "category": "Atracción",
    "description": "Corazón histórico de Madrid",
    "location": "Centro",
    "day_number": 3
  },
  {
    "title": "Parque del Retiro y Palacio de Cristal",
    "date_str": "2026-11-24",
    "maps_url": "https://maps.google.com/?q=Parque+del+Retiro",
    "category": "Atracción",
    "description": "Naturaleza y arquitectura en cristal",
    "location": "Retiro",
    "day_number": 4
  },
  {
    "title": "Museo Nacional del Prado",
    "date_str": "2026-11-24",
    "maps_url": "https://maps.google.com/?q=Museo+del+Prado",
    "category": "Atracción",
    "description": "Las Meninas y grandes obras maestras",
    "location": "Paseo del Prado",
    "day_number": 4
  },
  {
    "title": "Barrio de Trastevere",
    "date_str": "2026-11-25",
    "maps_url": "https://maps.google.com/?q=Trastevere+Roma",
    "category": "Atracción",
    "description": "Callejones iluminados y gastronomía",
    "location": "Trastevere, Roma",
    "day_number": 5
  },
  {
    "title": "Coliseo Romano y Foro Imperial",
    "date_str": "2026-11-26",
    "maps_url": "https://maps.google.com/?q=Colosseo+Roma",
    "category": "Atracción",
    "description": "Icono mundial de la historia romana",
    "location": "Piazza del Colosseo",
    "day_number": 6
  },
  {
    "title": "Monumento a Vittorio Emanuele II",
    "date_str": "2026-11-26",
    "maps_url": "https://maps.google.com/?q=Vittoriano+Roma",
    "category": "Atracción",
    "description": "Vistas panorámicas de 360 grados",
    "location": "Piazza Venezia",
    "day_number": 6
  },
  {
    "title": "Basílica de San Pedro y Cúpula",
    "date_str": "2026-11-27",
    "maps_url": "https://maps.google.com/?q=Basilica+San+Pietro",
    "category": "Atracción",
    "description": "La basílica más impresionante del mundo",
    "location": "Ciudad del Vaticano",
    "day_number": 7
  },
  {
    "title": "Castillo de Sant Angelo",
    "date_str": "2026-11-27",
    "maps_url": "https://maps.google.com/?q=Castel+Sant+Angelo",
    "category": "Atracción",
    "description": "Fortaleza histórica junto al río Tíber",
    "location": "Lungotevere Castello",
    "day_number": 7
  },
  {
    "title": "Fontana di Trevi",
    "date_str": "2026-11-28",
    "maps_url": "https://maps.google.com/?q=Fontana+di+Trevi",
    "category": "Atracción",
    "description": "Tirar la moneda para volver a Roma",
    "location": "Piazza di Trevi",
    "day_number": 8
  },
  {
    "title": "Panteón de Agripa",
    "date_str": "2026-11-28",
    "maps_url": "https://maps.google.com/?q=Pantheon+Roma",
    "category": "Atracción",
    "description": "Cúpula de hormigón milenaria",
    "location": "Piazza della Rotonda",
    "day_number": 8
  },
  {
    "title": "Piazza Navona y Fuente de los Ríos",
    "date_str": "2026-11-28",
    "maps_url": "https://maps.google.com/?q=Piazza+Navona",
    "category": "Atracción",
    "description": "Esculturas maestras de Bernini",
    "location": "Piazza Navona",
    "day_number": 8
  },
  {
    "title": "Plaza de España y Escalinata",
    "date_str": "2026-11-29",
    "maps_url": "https://maps.google.com/?q=Piazza+di+Spagna",
    "category": "Atracción",
    "description": "Punto icónico para fotos y paseo",
    "location": "Piazza di Spagna",
    "day_number": 9
  },
  {
    "title": "Mirador del Pincio",
    "date_str": "2026-11-29",
    "maps_url": "https://maps.google.com/?q=Terrazza+del+Pincio",
    "category": "Atracción",
    "description": "El mejor atardecer sobre los techos de Roma",
    "location": "Pincio",
    "day_number": 9
  },
  {
    "title": "Plaza de Cataluña y La Rambla",
    "date_str": "2026-11-30",
    "maps_url": "https://maps.google.com/?q=Placa+de+Catalunya+Barcelona",
    "category": "Atracción",
    "description": "Eje central y vida barcelonesa",
    "location": "Barcelona Centro",
    "day_number": 10
  },
  {
    "title": "Basílica de la Sagrada Familia",
    "date_str": "2026-12-01",
    "maps_url": "https://maps.google.com/?q=Sagrada+Familia+Barcelona",
    "category": "Atracción",
    "description": "La joya modernista de Gaudí",
    "location": "Eixample, Barcelona",
    "day_number": 11
  },
  {
    "title": "Casa Batlló y La Pedrera",
    "date_str": "2026-12-01",
    "maps_url": "https://maps.google.com/?q=Casa+Batllo",
    "category": "Atracción",
    "description": "Fachadas curvas y arte modernista",
    "location": "Passeig de Gràcia",
    "day_number": 11
  },
  {
    "title": "Park Güell",
    "date_str": "2026-12-02",
    "maps_url": "https://maps.google.com/?q=Park+Guell",
    "category": "Atracción",
    "description": "Parque con mosaicos y vistas al mar",
    "location": "Gràcia, Barcelona",
    "day_number": 12
  },
  {
    "title": "Catedral de Barcelona y Barrio Gótico",
    "date_str": "2026-12-02",
    "maps_url": "https://maps.google.com/?q=Catedral+de+Barcelona",
    "category": "Atracción",
    "description": "Historia medieval y plazas escondidas",
    "location": "Barri Gòtic",
    "day_number": 12
  },
  {
    "title": "Castillo y Mirador de Montjuïc",
    "date_str": "2026-12-03",
    "maps_url": "https://maps.google.com/?q=Castillo+de+Montjuic",
    "category": "Atracción",
    "description": "Vistas panorámicas de la ciudad y el puerto",
    "location": "Montjuïc",
    "day_number": 13
  },
  {
    "title": "Playa de la Barceloneta",
    "date_str": "2026-12-03",
    "maps_url": "https://maps.google.com/?q=Barceloneta+Beach",
    "category": "Atracción",
    "description": "Paseo marítimo mediterráneo",
    "location": "La Barceloneta",
    "day_number": 13
  },
  {
    "title": "Puerta del Sol y Plaza Mayor Iluminadas",
    "date_str": "2026-12-04",
    "maps_url": "https://maps.google.com/?q=Puerta+del+Sol+Madrid",
    "category": "Atracción",
    "description": "Luces navideñas y recuerdos finales",
    "location": "Centro de Madrid",
    "day_number": 14
  },
  {
    "title": "Mercado de San Miguel",
    "date_str": null,
    "maps_url": "https://www.google.com/maps/search/?api=1&query=Mercado%20de%20San%20Miguel%2C%20Madrid",
    "category": "Atracción",
    "description": null,
    "location": "Madrid",
    "day_number": null
  }
];

export const REAL_TRANSITS = [
  {
    "day_number": 1,
    "date_str": "2026-11-21",
    "type": "flight",
    "origin": "SJO San José (Costa Rica)",
    "origin_time": "21:20",
    "destination": "MAD Madrid-Barajas",
    "destination_time": "14:15 (+1)",
    "notes": "Iberojet • Vuelo internacional hacia Madrid"
  },
  {
    "day_number": 5,
    "date_str": "2026-11-25",
    "type": "flight",
    "origin": "MAD Madrid-Barajas T4",
    "origin_time": "13:00",
    "destination": "FCO Roma Fiumicino",
    "destination_time": "15:30",
    "notes": "Iberia • Vuelo Madrid ➔ Roma"
  },
  {
    "day_number": 10,
    "date_str": "2026-11-30",
    "type": "flight",
    "origin": "FCO Roma Fiumicino",
    "origin_time": "12:30",
    "destination": "BCN Barcelona-El Prat",
    "destination_time": "14:25",
    "notes": "Vuelo Roma ➔ Barcelona"
  },
  {
    "day_number": 14,
    "date_str": "2026-12-04",
    "type": "train",
    "origin": "BCN Barcelona Sants",
    "origin_time": "10:00",
    "destination": "MAD Madrid Atocha",
    "destination_time": "12:45",
    "notes": "AVE Alta Velocidad • Traslado a Madrid"
  },
  {
    "day_number": 15,
    "date_str": "2026-12-05",
    "type": "flight",
    "origin": "MAD Madrid-Barajas",
    "origin_time": "16:00",
    "destination": "SJO San José (Costa Rica)",
    "destination_time": "21:45",
    "notes": "Iberojet • Vuelo internacional de regreso a casa"
  }
];

export const REAL_LODGINGS = [
  {
    "city": "Madrid",
    "name": "Plaza España & Palacio: Confort, nuevo y amplio",
    "address": "Calle del Reloj, 6, Madrid",
    "maps_url": "https://maps.app.goo.gl/X5xMD33n2aeG8ksB7",
    "check_in_date": "2026-11-22",
    "check_in_time": "15:00",
    "check_out_date": "2026-11-25",
    "check_out_time": "11:00",
    "door_code": "Confirmación: HM3TFT5CFF (4 huéspedes)",
    "wifi_name": "Ver en app Airbnb",
    "wifi_pass": "Ver en app Airbnb",
    "host_name": "Dani Y Lucia",
    "host_phone": "",
    "notes": "Plaza España & Palacio: Confort, nuevo y amplio. Anfitrión: Dani Y Lucia. Instrucciones y reglas en el manual de la casa.",
    "airbnb_url": ""
  },
  {
    "city": "Roma",
    "name": "Re di Roma House",
    "address": "Via Tuscolana, 44, Roma",
    "maps_url": "https://maps.app.goo.gl/D3Wy1DbLAP8xgiSAA",
    "check_in_date": "2026-11-25",
    "check_in_time": "16:00",
    "check_out_date": "2026-11-30",
    "check_out_time": "10:00",
    "door_code": "Confirmación: HMA32Y993J (4 huéspedes)",
    "wifi_name": "Ver en app Airbnb",
    "wifi_pass": "Ver en app Airbnb",
    "host_name": "Michela",
    "host_phone": "",
    "notes": "Re di Roma House. Anfitrión: Michela. Instrucciones y reglas en el manual de la casa.",
    "airbnb_url": ""
  },
  {
    "city": "Barcelona",
    "name": "Pool, Terrace & Beach Vibes in Poblenou",
    "address": "Carrer de Lope de Vega, 150, Barcelona",
    "maps_url": "https://maps.app.goo.gl/dZNXVKB7AMGvCFHB6",
    "check_in_date": "2026-11-30",
    "check_in_time": "17:00",
    "check_out_date": "2026-12-04",
    "check_out_time": "11:00",
    "door_code": "Confirmación: HM3RKTWCM3 (4 huéspedes)",
    "wifi_name": "Ver en app Airbnb",
    "wifi_pass": "Ver en app Airbnb",
    "host_name": "Nina",
    "host_phone": "",
    "notes": "Pool, Terrace & Beach Vibes in Poblenou. Anfitrión: Nina. Consejos de seguridad en el agua disponibles en la app de Airbnb.",
    "airbnb_url": ""
  },
  {
    "city": "Madrid",
    "name": "ibis Styles Madrid Airport Valdebebas",
    "address": "C/ Fernando Higueras 55 - 28055 Madrid, Spain",
    "maps_url": "https://maps.app.goo.gl/f5WED98w5oPb9uwt5",
    "check_in_date": "2026-12-04",
    "check_in_time": "15:00",
    "check_out_date": "2026-12-05",
    "check_out_time": "12:00",
    "door_code": "Reserva Nº: QQWPGNKX",
    "wifi_name": "ibis_Styles_Guest",
    "wifi_pass": "Sin clave (Portal web del hotel)",
    "host_name": "Recepción ibis Styles 24h",
    "host_phone": "+34 91/9432329",
    "notes": "ibis Styles Madrid Airport Valdebebas. Email: HC0U5@ACCOR.COM | Tel: +34 91/9432329 | Hotel cerca del aeropuerto Barajas para vuelo de regreso. Recepción 24h.",
    "airbnb_url": ""
  }
];

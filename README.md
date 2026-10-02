# ✈️ Aventura Familiar — Web App de Viaje (PWA)

Una aplicación web móvil interactiva, privada e instalable (PWA) diseñada para organizar viajes familiares, coordinar itinerarios y gastos, y disfrutar de dinámicas de juego como el **Bingo de Comidas**, el **Reto Fotográfico por Colores** y las **Mascotas de Viaje (Travel Pets)**.

---

## 🚀 Características Principales

1. **🔒 Acceso Familiar Privado y Perfiles Rápidos**:
   - Bloqueo por contraseña familiar (`viaje2026` por defecto) para que nadie en internet acceda a los planes familiares.
   - Cada familiar tiene su propio avatar, mascota y perfil para registrar actividades en la calle con 1 toque.
2. **📅 Itinerario Dinámico (Día a Día)**:
   - Pestañas por días, horas, notas, tickets y estado de actividades con animaciones de confeti.
3. **📍 Lugares a Visitar (Bucket List)**:
   - Directorio con categorías (Monumentos, Restaurantes, Miradores, Parques, Compras).
   - Botón directo para abrir en **Google Maps**.
   - Contador de progreso y registro de quién lo visitó.
4. **🍲 Bingo de Comidas Típicas (4x4)**:
   - Cuadrícula con platos y bebidas tradicionales.
   - Posibilidad de adjuntar foto del plato con la cámara del móvil.
   - Alimenta a tu mascota y sube su nivel de experiencia (XP).
5. **🎨 Reto de Fotos por Color (Scavenger Hunt)**:
   - Desafíos cromáticos (Rojo, Amarillo, Azul, Verde, Naranja, etc.).
   - Captura directa con la cámara móvil y galería comunitaria por color.
6. **🐾 Travel Pets (Mascotas de Viaje)**:
   - Compañeros virtuales (Pato Mochilero, Zorro Explorador, Pingüino Fotógrafo, Koala Turista, Gato Curioso).
   - Barras de estado: Hambre (se llena con comidas del Bingo), Curiosidad (lugares visitados) y Creatividad (fotos de colores).
   - Niveles de XP y accesorios desbloqueables (gafas de sol, sombrero safari, cámara réflex, medallas).
7. **💸 Gastos Compartidos (Splitwise Ultra-Directo)**:
   - Carga rápida en 3 toques: Monto, concepto, quién pagó y entre quiénes se divide.
   - Pestaña de balances automáticos: *"Quién le debe a quién"* con liquidación simplificada de deudas.
8. **🏆 Concurso Familiar & Muro de Recuerdos**:
   - Leaderboard de la Copa Trotamundos.
   - Ruleta interactiva de misiones diarias sorpresas.
   - Álbum colaborativo que recopila en tiempo real todas las fotos subidas durante el viaje.
9. **📱 PWA (Progressive Web App)**:
   - Instalable en iPhone (Safari -> Compartir -> *Agregar a pantalla de inicio*) y Android (Chrome -> *Instalar App*).
   - Funciona a pantalla completa como una app nativa y con soporte offline.

---

## 🛠️ Ejecución Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en desarrollo (Frontend + Backend simultáneo)
npm run dev

# 3. O compilar y correr en modo producción
npm run build
npm start
```
Abre en tu navegador: `http://localhost:3001` (o en `http://localhost:5173` durante `npm run dev`).

---

## 🌐 Guía de Despliegue con Coolify + GitHub en subdominio de `quackdock.com`

### Paso 1: Configurar el Subdominio en tu DNS
1. Entra a tu proveedor DNS donde administras `quackdock.com` (Cloudflare, Namecheap, etc.).
2. Agrega un **Registro A**:
   - **Tipo**: `A`
   - **Nombre**: `viaje` (o el subdominio que prefieras, ej. `familia`)
   - **Valor / Destino**: La dirección IP pública de tu VPS con Coolify.
   - **Proxy / TTL**: DNS Only (o DNS & Proxy en Cloudflare con SSL Full/Strict).

### Paso 2: Subir el Proyecto a tu GitHub
Desde esta carpeta (`family-trip-app`), ejecuta:
```bash
git init
git add .
git commit -m "feat: initial family travel pwa with coolify setup"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

### Paso 3: Configurar y Desplegar en Coolify
1. En tu panel de Coolify, haz clic en **+ New Resource** ➔ **Public / Private Repository** y selecciona tu repositorio de GitHub.
2. **Build Pack**: Selecciona **Dockerfile**.
3. **Domains**: Escribe tu dominio completo con HTTPS:
   ```
   https://viaje.quackdock.com
   ```
   *(Coolify generará automáticamente los certificados SSL de Let's Encrypt).*
4. **Port Exposes**: Asegúrate de que el puerto configurado sea `3001`.
5. **Persistencia de Datos (Fotos y Base de Datos)**:
   - Ve a la pestaña **Storages** / **Persistent Storage** de tu aplicación en Coolify.
   - Agrega un volumen con:
     - **Destination path**: `/app/data`
   - Esto garantizará que las fotos subidas y los datos de SQLite nunca se borren al hacer nuevos despliegues.
6. Haz clic en **Deploy** y ¡listo!

---

## 🔑 Credenciales por Defecto

- **Clave Familiar**: `viaje2026`
- Puedes cambiar la clave familiar, el título del viaje o las fechas directamente en la base de datos o desde el panel de ajustes.

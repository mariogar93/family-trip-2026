# 🎨 Guía de Assets GIF para Mascotas y Accesorios de Viaje

Esta guía explica exactamente qué archivos GIF puedes agregar a la aplicación, cómo nombrarlos, sus dimensiones recomendadas y en qué carpetas ubicarlos.

---

## 📁 Estructura de Carpetas

Todos los archivos multimedia deben colocarse dentro de la carpeta pública de la aplicación:

```text
family-trip-app/
└── public/
    └── pets/
        ├── accessories/          # GIFs o PNGs transparentes de accesorios
        │   ├── sunglasses.gif
        │   ├── safari.gif
        │   ├── camera.gif
        │   ├── medal.gif
        │   └── backpack.gif
        │
        ├── koala/                # Mascota: Koala Turista 🐨
        │   ├── idle.gif
        │   ├── happy.gif
        │   ├── eating.gif
        │   └── exploring.gif
        │
        ├── panda/                # Mascota: Panda Glotón 🐼
        │   ├── idle.gif
        │   ├── happy.gif
        │   ├── eating.gif
        │   └── exploring.gif
        │
        ├── pato/                 # Mascota: Pato Mochilero 🦆
        │   ├── idle.gif
        │   ├── happy.gif
        │   ├── eating.gif
        │   └── exploring.gif
        │
        ├── zorro/                # Mascota: Zorro Explorador 🦊
        │   ├── idle.gif
        │   ├── happy.gif
        │   ├── eating.gif
        │   └── exploring.gif
        │
        ├── pinguino/             # Mascota: Pingüino Fotógrafo 🐧
        │   ├── idle.gif
        │   ├── happy.gif
        │   ├── eating.gif
        │   └── exploring.gif
        │
        ├── gato/                 # Mascota: Gato Curioso 🐱
        │   ├── idle.gif
        │   ├── happy.gif
        │   ├── eating.gif
        │   └── exploring.gif
        │
        ├── oso/                  # Mascota: Oso Montañero 🐻
        │   ├── idle.gif
        │   ├── happy.gif
        │   ├── eating.gif
        │   └── exploring.gif
        │
        ├── leon/                 # Mascota: León Aventurero 🦁
        │   ├── idle.gif
        │   ├── happy.gif
        │   ├── eating.gif
        │   └── exploring.gif
        │
        └── conejo/               # Mascota: Conejo Veloz 🐰
            ├── idle.gif
            ├── happy.gif
            ├── eating.gif
            └── exploring.gif
```

---

## 🎭 Estados de Animación por Mascota

Para cada mascota puedes incluir hasta **4 estados de animación**:

| Archivo | Cuándo se reproduce | Descripción sugerida |
| :--- | :--- | :--- |
| **`idle.gif`** | Estado normal | Mascota respirando, parpadeando o saludando en reposo. |
| **`happy.gif`** | Subir de nivel / Misión | Mascota saltando de alegría, festejando o bailando. |
| **`eating.gif`** | Al marcar casilla del Bingo | Mascota comiendo o masticando feliz un bocadillo. |
| **`exploring.gif`**| En Itinerario o Lugares | Mascota caminando con su mochilita, brújula o mapa. |

> [!TIP]
> **No es obligatorio tener todos los estados:** Si solo tienes un GIF por mascota, colócalo como `idle.gif` y la app lo usará automáticamente en todas las situaciones. Si un GIF no existe, el sistema muestra el avatar interactivo vectorial con emojis animados como respaldo inmediato.

---

## 🕶️ Accesorios Desbloqueables

Coloca estos archivos en `public/pets/accessories/` con fondo transparente:

| Archivo | Accesorio | Emoji de respaldo |
| :--- | :--- | :---: |
| **`sunglasses.gif`** (o `.png`) | Gafas de Sol VIP | 🕶️ |
| **`safari.gif`** (o `.png`) | Sombrero Safari | 🤠 |
| **`camera.gif`** (o `.png`) | Cámara Réflex | 📷 |
| **`medal.gif`** (o `.png`) | Medalla de Oro | 🥇 |
| **`backpack.gif`** (o `.png`) | Mochila Trotamundos | 🎒 |

---

## 📐 Especificaciones Técnicas Recomendadas

* **Formato:** `.gif` animado (o `.webp` animado / `.png` transparente para accesorios).
* **Fondo:** **Transparente** (crucial para que se vea impecable tanto en Modo Oscuro negro como en Modo Claro).
* **Dimensiones:** `256 x 256 px` o `512 x 512 px` (relación de aspecto cuadrada 1:1).
* **Peso por archivo:** Menor a `1.5 MB` para que cargue instantáneamente en teléfonos móviles sin consumir datos del viaje.

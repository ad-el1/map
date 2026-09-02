# FSSM Campus Navigator

A mobile-first **Progressive Web App** for navigating the campus of **Faculté des Sciences Semlalia (FSSM)**, Université Cadi Ayyad, Marrakech — no backend, no API key, no framework.

---

## Features

### Interactive Map
- Campus centered at **31.6490, -8.0155** (Bd Prince My Abdellah, Marrakech)
- **32 building markers** colour-coded by category with custom emoji pins
- Zoom, pan, and tap any building for details
- **CartoDB Positron** (light) and **Dark Matter** (dark) tile layers

### Search & Filter
- Real-time search by name, code, or department (French, English, Arabic)
- One-tap **category filters**: Amphithéâtres, Départements, Labos, Bibliothèque, Restauration, Administration, Sport, Parking
- Distance from user shown next to each result

### User Location
- GPS via the **Geolocation API** with granular error messages (permission denied / unavailable / timeout)
- **Simulate Location** toggle — places a virtual position at the main entrance for testing without GPS
- Pulsing blue dot with animated ring

### Directions
- Straight-line route rendered as an **animated dashed stroke** on the map
- Simulated **2–4 step turn-by-turn instructions** derived from bearing (no routing API needed)
- Distance (metres / km) and estimated walking time displayed
- Works in offline mode using cached tiles

### Building Details
- Category badge, name (in current language), department, opening hours
- Distance from user (when location is active)
- Service tags
- Direct **Get Directions** button

### Favorites & History
- **Star any building** — saved to `localStorage`, persists across sessions
- **Recently viewed** list (last 5) rebuilt on every visit
- Both render as horizontal mini-cards in the welcome panel

### What's Near Me?
- Tap the gradient button on the welcome screen
- Calculates the **5 closest buildings** using the Haversine formula
- Fits the map to show all 5 at once
- Auto-enables simulate mode if no location is available

### Progressive Web App
- **Installable** on Android and iOS home screens via `manifest.json`
- Service worker with **cache-first static assets** and **network-first map tiles**
- Offline banner + graceful fallback when disconnected
- Passes Chrome Lighthouse PWA checklist

### UI / UX
- **Dark mode** — respects `prefers-color-scheme`, persists to `localStorage`, swaps tile layer
- **Three languages**: French, English, Arabic — full RTL layout flip for Arabic
- Glassmorphism surfaces with `backdrop-filter`
- Bottom sheet on mobile, fixed side panel on desktop (≥ 768 px)
- Smooth 300 ms transitions throughout
- Loading screen with animated progress bar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Map | [Leaflet.js 1.9.4](https://leafletjs.com/) |
| Tiles | CartoDB Positron / Dark Matter (no API key) |
| Fonts | [Outfit](https://fonts.google.com/specimen/Outfit) via Google Fonts |
| Storage | `localStorage` (favorites, recent, preferences) |
| PWA | Service Worker + Web App Manifest |
| Runtime | Vanilla HTML / CSS / JavaScript — zero dependencies beyond Leaflet |

---

## Project Structure

```
map/
├── index.html              ← App shell, all DOM structure
├── style.css               ← Design tokens, glassmorphism, dark mode, RTL, animations
├── manifest.json           ← PWA manifest
├── sw.js                   ← Service worker (cache-first / network-first)
│
├── js/
│   ├── i18n.js             ← Translations (FR/EN/AR), category config, shared APP_STATE
│   ├── map.js              ← Leaflet init, tile layers, markers, user location
│   ├── search.js           ← Building filter + search results rendering
│   ├── routing.js          ← Directions, step generation, geo math (Haversine, bearing)
│   └── ui.js               ← Panel management, toast, dark mode, lang switch,
│                              favorites, recently viewed, near-me, events, boot
│
├── data/
│   └── buildings.js        ← 32 buildings (mock coordinates — replace with real ones)
│
└── icons/
    ├── icon.svg            ← App icon (graduation cap + pin)
    └── icon-maskable.svg   ← Maskable variant for Android
```

### Script load order

```
data/buildings.js  →  js/i18n.js  →  js/map.js  →  js/search.js  →  js/routing.js  →  js/ui.js
```

Each module reads from the global `APP_STATE` object defined in `i18n.js`. No bundler is used; sequential `<script>` tags in `index.html` guarantee availability.

---

## Running Locally

A local HTTP server is required — service workers do not run on `file://` URLs.

```bash
# Option 1 — Node.js
npx serve .

# Option 2 — Python
python -m http.server 8080

# Option 3 — VS Code
# Install the "Live Server" extension, right-click index.html → Open with Live Server
```

Then open `http://localhost:8080` (or the port shown).

---

## Building Data

Coordinates in `data/buildings.js` are based on real on-campus GPS survey measurements centered around **Pavillon Central** (31.6490, -8.0155) and **Porte 1** (31.648194, -8.014417).

### Buildings included

| Category | Count | Examples |
|---|---|---|
| Amphithéâtres | 12 | Amphi I–VIII, Amphi A–D |
| Départements | 7 | Biologie, Chimie, Géologie, Info, Maths, Physique, Humanités |
| Laboratoires | 5 | Labo Chimie, Biologie, Physique, Informatique, Géologie |
| Administration | 2 | Présidence, Scolarité |
| Restauration | 2 | Restaurant Universitaire, Cafétéria |
| Bibliothèque | 1 | Bibliothèque Centrale |
| Sport | 1 | Terrain de Sport |
| Parking | 1 | Parking Étudiants |
| Entrée | 1 | Entrée Principale |

### Adding a new building

```js
{
  id: 'unique-kebab-id',
  name: 'Nom en français',
  nameEn: 'English name',
  nameAr: 'الاسم بالعربية',
  code: 'CODE',
  department: 'Département' || null,
  category: 'department',           // see CAT keys in js/i18n.js
  coordinates: [31.6xxx, -8.0xxx],  // [latitude, longitude]
  openingHours: '08:00 – 18:00',
  services: ['Service 1', 'Service 2'],
  description: 'Description courte',
}
```

---

## PWA Installation

**Android (Chrome):**
1. Open the app in Chrome
2. Tap the three-dot menu → *"Add to Home Screen"*
3. Tap *"Install"*

**iOS (Safari):**
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap *"Add to Home Screen"*

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| GPS permission denied | Red toast with message, no crash |
| GPS unavailable | Specific error toast per `GeolocationPositionError.code` |
| No internet | Offline banner appears, cached tiles served |
| Back online | Banner hides, success toast shown |
| Stale localStorage IDs | Filtered out silently on load (building deleted from data) |
| Building not found | Error toast, no JS exception |

---

## Roadmap

- [x] Replace mock coordinates with surveyed real positions
- [ ] Integrate OpenRouteService for turn-by-turn road routing (optional)
- [ ] Add floor plans for multi-storey buildings
- [ ] Department timetable integration
- [ ] Push notifications for campus events

---

## License

MIT — free to use, modify, and distribute with attribution.

---

*Built for Université Cadi Ayyad · FSSM · Marrakech*

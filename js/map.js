'use strict';
/* ─── Constants ───────────────────────────────────────────────────────────── */
const CAMPUS_CENTER = [31.6490, -8.0155];
const MAIN_ENTRANCE = [31.648194, -8.014417];
// OpenStreetMap standard tiles — no API key required. Dark mode is a CSS filter (see style.css).
const TILE_URL  = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTR = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const TILE_MAX_ZOOM = 19;

// Exact boundary polygon of Faculté des Sciences Semlalia (OSM way 299506577)
const FSSM_BOUNDARY = [
  [31.648864, -8.013933],
  [31.648709, -8.013917],
  [31.648270, -8.014357],
  [31.648161, -8.014437],
  [31.648124, -8.014421],
  [31.647562, -8.014811],
  [31.647192, -8.015233],
  [31.649560, -8.017261],
  [31.649937, -8.016726],
  [31.650002, -8.016802],
  [31.650070, -8.016932],
  [31.650298, -8.017431],
  [31.650470, -8.017495],
  [31.651428, -8.016417],
  [31.648864, -8.013933],
];

// World outer polygon; FSSM_BOUNDARY acts as an inner hole cutout
const WORLD_MASK = [
  [-90, -180],
  [-90, 180],
  [90, 180],
  [90, -180]
];

/* ─── Map init ────────────────────────────────────────────────────────────── */
function initMap() {
  const campusBounds = L.latLngBounds(FSSM_BOUNDARY);
  APP_STATE.map = L.map('map', {
    center: CAMPUS_CENTER,
    zoom: 17,
    minZoom: 16,
    maxZoom: TILE_MAX_ZOOM,
    maxBounds: campusBounds.pad(0.35),
    maxBoundsViscosity: 0.85,
    zoomControl: false,
    attributionControl: true,
  });

  applyTileLayer();
  applyMapTheme();
  renderMarkers();

  APP_STATE.map.on('click', () => {
    document.getElementById('search-results').style.display = 'none';
  });
}

// Single OSM layer, created once. Light/dark is handled by a CSS filter on #map.
function applyTileLayer() {
  if (!APP_STATE.map || APP_STATE.tileLayer) return;
  APP_STATE.tileLayer = L.tileLayer(TILE_URL, {
    attribution: TILE_ATTR,
    maxZoom: TILE_MAX_ZOOM,
    crossOrigin: true,
  }).addTo(APP_STATE.map);
  APP_STATE.tileLayer.once('load', hideLoadingScreen);
  applyCampusMask();
}

// Toggle the dark-map filter and recolor the campus mask.
function applyMapTheme() {
  const el = document.getElementById('map');
  if (el) el.classList.toggle('map-dark', !!APP_STATE.darkMode);
  applyCampusMask();
}

function applyCampusMask() {
  if (!APP_STATE.map) return;

  const isDark = APP_STATE.darkMode;
  const maskStyle = {
    // Strong mask so neighbourhood POIs (pharmacies, shops…) outside the campus
    // clearly read as "not part of the faculty".
    fillColor: isDark ? '#020617' : '#1e293b',
    fillOpacity: isDark ? 0.82 : 0.66,
    stroke: false,
    interactive: false,
  };

  const borderStyle = {
    color: isDark ? '#60a5fa' : '#2563eb',
    weight: 2.5,
    opacity: 0.85,
    dashArray: '6, 6',
    fill: false,
    interactive: false,
  };

  if (!APP_STATE.maskLayer) {
    // Inverted polygon: outer ring is world, inner hole is FSSM campus
    APP_STATE.maskLayer = L.polygon([WORLD_MASK, FSSM_BOUNDARY], maskStyle).addTo(APP_STATE.map);
  } else {
    APP_STATE.maskLayer.setStyle(maskStyle);
  }

  if (!APP_STATE.boundaryLayer) {
    APP_STATE.boundaryLayer = L.polygon(FSSM_BOUNDARY, borderStyle).addTo(APP_STATE.map);
  } else {
    APP_STATE.boundaryLayer.setStyle(borderStyle);
  }
}

/* ─── Markers ─────────────────────────────────────────────────────────────── */
function makeIcon(category, selected = false) {
  const cfg  = CAT[category] || CAT.administration;
  const size = selected ? 40 : 32;
  return L.divIcon({
    className: '',
    html: `<div class="mk${selected ? ' selected' : ''}" style="width:${size}px;height:${size}px;background:${cfg.color}">
             <span class="mk-inner" style="font-size:${selected ? 16 : 13}px">${cfg.emoji}</span>
           </div>`,
    iconSize:    [size, size],
    iconAnchor:  [size / 2, size],
    popupAnchor: [0, -(size + 4)],
  });
}

function renderMarkers() {
  BUILDINGS.forEach(b => {
    const marker = L.marker(b.coordinates, { icon: makeIcon(b.category) })
      .addTo(APP_STATE.map);
    marker.on('click', () => selectBuilding(b, marker));
    APP_STATE.markers[b.id] = marker;
  });
}

function selectBuilding(building, marker) {
  deselectBuilding();
  APP_STATE.selectedBuilding = building;
  marker.setIcon(makeIcon(building.category, true));
  APP_STATE.map.panTo(building.coordinates, { animate: true, duration: 0.5 });
  addRecentlyViewed(building.id);
  showBuildingDetails(building);
}

function deselectBuilding() {
  if (!APP_STATE.selectedBuilding) return;
  const prev = APP_STATE.markers[APP_STATE.selectedBuilding.id];
  if (prev) prev.setIcon(makeIcon(APP_STATE.selectedBuilding.category, false));
  APP_STATE.selectedBuilding = null;
}

function updateMarkerVisibility(category) {
  BUILDINGS.forEach(b => {
    const m = APP_STATE.markers[b.id];
    if (!m) return;
    const show = category === 'all' || b.category === category;
    if (show  && !APP_STATE.map.hasLayer(m)) m.addTo(APP_STATE.map);
    if (!show &&  APP_STATE.map.hasLayer(m)) APP_STATE.map.removeLayer(m);
  });
}

/* ─── User location ───────────────────────────────────────────────────────── */
function placeUserMarker(latlng) {
  if (APP_STATE.userMarker) APP_STATE.map.removeLayer(APP_STATE.userMarker);
  const icon = L.divIcon({
    className: '',
    html: '<div class="user-dot"></div>',
    iconSize:   [18, 18],
    iconAnchor: [9, 9],
  });
  APP_STATE.userMarker   = L.marker(latlng, { icon, zIndexOffset: 1000 }).addTo(APP_STATE.map);
  APP_STATE.userLocation = latlng;
}

function removeUserMarker() {
  if (APP_STATE.userMarker) { APP_STATE.map.removeLayer(APP_STATE.userMarker); APP_STATE.userMarker = null; }
  APP_STATE.userLocation = null;
}

function locateUser() {
  if (!navigator.geolocation) { showToast(t('locUnavailable')); return; }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const latlng = [pos.coords.latitude, pos.coords.longitude];
      placeUserMarker(latlng);
      APP_STATE.map.setView(latlng, 17, { animate: true });
      showToast(t('locEnabled'));
      if (APP_STATE.simulating) setSimulating(false);
      document.getElementById('locate-btn').classList.add('active');
    },
    err => {
      const msgs = {
        1: t('locDenied'),
        2: t('locUnavailable'),
        3: t('locTimeout'),
      };
      showToast(msgs[err.code] || t('locUnavailable'), 'error');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
  );
}

function setSimulating(on) {
  APP_STATE.simulating = on;
  document.getElementById('simulate-btn').classList.toggle('simulating', on);
  if (on) {
    placeUserMarker(MAIN_ENTRANCE);
    APP_STATE.map.setView(MAIN_ENTRANCE, 17, { animate: true });
    showToast(t('locSimulated'));
    document.getElementById('locate-btn').classList.remove('active');
  } else {
    removeUserMarker();
    document.getElementById('simulate-btn').classList.remove('simulating');
  }
}

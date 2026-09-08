'use strict';
/* ─── Constants ───────────────────────────────────────────────────────────── */
const CAMPUS_CENTER    = [31.648917, -8.015350];
const PAVILLON_CENTRAL = [31.648917, -8.015350];
const MAIN_ENTRANCE    = [31.648194, -8.014417];
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

  // The map has its own column on desktop; keep Leaflet in sync when the
  // viewport crosses the breakpoint or the window resizes.
  const keepMapSized = () => APP_STATE.map && APP_STATE.map.invalidateSize({ pan: false });
  setTimeout(keepMapSized, 100);
  let _rz;
  window.addEventListener('resize', () => { clearTimeout(_rz); _rz = setTimeout(keepMapSized, 150); });
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
    color: isDark ? '#8fbf7e' : '#3f6f3c',
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
    html: `<div class="mk${selected ? ' selected' : ''}" style="width:${size}px;height:${size}px;background-color:${cfg.color}">
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
// Places / moves the blue dot and its accuracy halo (radius = GPS accuracy in m).
function placeUserMarker(latlng, accuracy) {
  if (!APP_STATE.userMarker) {
    const icon = L.divIcon({ className: '', html: '<div class="user-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
    APP_STATE.userMarker = L.marker(latlng, { icon, zIndexOffset: 1000 }).addTo(APP_STATE.map);
  } else {
    APP_STATE.userMarker.setLatLng(latlng);
  }

  if (accuracy && accuracy > 12) {
    if (!APP_STATE.userAccuracy) {
      APP_STATE.userAccuracy = L.circle(latlng, {
        radius: accuracy, color: '#1d6fe0', weight: 1, opacity: .35,
        fillColor: '#1d6fe0', fillOpacity: .10, interactive: false,
      }).addTo(APP_STATE.map);
    } else {
      APP_STATE.userAccuracy.setLatLng(latlng).setRadius(accuracy);
    }
  } else if (APP_STATE.userAccuracy) {
    APP_STATE.map.removeLayer(APP_STATE.userAccuracy);
    APP_STATE.userAccuracy = null;
  }

  APP_STATE.userLocation = latlng;
}

function removeUserMarker() {
  if (APP_STATE.geoWatchId != null) { navigator.geolocation.clearWatch(APP_STATE.geoWatchId); APP_STATE.geoWatchId = null; }
  if (APP_STATE.userMarker)   { APP_STATE.map.removeLayer(APP_STATE.userMarker);   APP_STATE.userMarker = null; }
  if (APP_STATE.userAccuracy) { APP_STATE.map.removeLayer(APP_STATE.userAccuracy); APP_STATE.userAccuracy = null; }
  APP_STATE.userLocation = null;
  const btn = document.getElementById('locate-btn');
  if (btn) btn.classList.remove('active', 'locating');
}

// locateUser(onSuccess?) — real GPS only, with a live watch so the fix refines.
function locateUser(onSuccess) {
  const btn = document.getElementById('locate-btn');

  // Geolocation needs a secure context (HTTPS or localhost).
  if (!window.isSecureContext || !navigator.geolocation) {
    showToast(t('locInsecure'), 'error');
    return;
  }

  // Already tracking → just recentre on the current position.
  if (APP_STATE.userLocation && APP_STATE.geoWatchId != null) {
    APP_STATE.map.setView(APP_STATE.userLocation, Math.max(APP_STATE.map.getZoom(), 18), { animate: true });
    if (typeof onSuccess === 'function') onSuccess();
    return;
  }

  btn.classList.add('locating');
  showToast(t('locSearching'));

  let firstFix = true;
  let warnedCoarse = false;

  const done = () => {
    if (APP_STATE.geoWatchId != null) { navigator.geolocation.clearWatch(APP_STATE.geoWatchId); APP_STATE.geoWatchId = null; }
  };

  APP_STATE.geoWatchId = navigator.geolocation.watchPosition(
    pos => {
      const latlng = [pos.coords.latitude, pos.coords.longitude];
      const acc = pos.coords.accuracy;   // metres
      placeUserMarker(latlng, acc);

      if (firstFix) {
        firstFix = false;
        btn.classList.remove('locating');
        btn.classList.add('active');
        const onCampus = L.latLngBounds(FSSM_BOUNDARY).pad(0.8).contains(latlng);
        APP_STATE.map.setView(latlng, onCampus ? 18 : APP_STATE.map.getZoom(), { animate: true });
        showToast(acc > 60 ? t('locCoarse') : t('locEnabled'));
        warnedCoarse = acc > 60;
        if (typeof onSuccess === 'function') onSuccess();
      } else if (warnedCoarse && acc <= 40) {
        warnedCoarse = false;
        showToast(t('locRefined'));
      }

      // Good enough → stop watching to save battery.
      if (acc <= 20) done();
    },
    err => {
      btn.classList.remove('locating');
      done();
      const msgs = { 1: t('locDenied'), 2: t('locUnavailable'), 3: t('locTimeout') };
      showToast(msgs[err.code] || t('locUnavailable'), 'error');
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );

  // Safety: stop the watch after 30 s regardless.
  setTimeout(done, 30000);
}

// Simulation removed — the app uses real GPS only. Kept as a no-op so any
// leftover reference doesn't throw.
function setSimulating() {}

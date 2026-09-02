'use strict';
/* ─── Constants ───────────────────────────────────────────────────────────── */
const CAMPUS_CENTER = [31.6482, -8.0125];
const MAIN_ENTRANCE = [31.6455, -8.0125];
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR  = '© <a href="https://carto.com/">CARTO</a> © <a href="https://openstreetmap.org/copyright">OSM</a>';

/* ─── Map init ────────────────────────────────────────────────────────────── */
function initMap() {
  APP_STATE.map = L.map('map', {
    center: CAMPUS_CENTER,
    zoom: 17,
    zoomControl: false,
    attributionControl: true,
  });

  applyTileLayer();
  renderMarkers();

  APP_STATE.map.on('click', () => {
    document.getElementById('search-results').style.display = 'none';
  });
}

function applyTileLayer() {
  if (!APP_STATE.map) return; // called before initMap() during pref load — skip safely
  if (APP_STATE.tileLayer) APP_STATE.map.removeLayer(APP_STATE.tileLayer);
  APP_STATE.tileLayer = L.tileLayer(APP_STATE.darkMode ? TILE_DARK : TILE_LIGHT, {
    attribution: TILE_ATTR,
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(APP_STATE.map);
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

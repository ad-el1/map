'use strict';
/* ─── localStorage keys ───────────────────────────────────────────────────── */
const LS_FAVORITES = 'fssm_favorites';
const LS_RECENT    = 'fssm_recent';
const LS_DARK      = 'fssm_dark';
const LS_LANG      = 'fssm_lang';
const MAX_RECENT   = 5;
const NEARME_COUNT = 5;

/* ─── All panel IDs ───────────────────────────────────────────────────────── */
const PANEL_IDS = ['welcome-panel', 'building-details', 'directions-panel', 'nearme-panel'];

/* ─── Panel switching ─────────────────────────────────────────────────────── */
function showSection(id) {
  PANEL_IDS.forEach(sid => {
    const el = document.getElementById(sid);
    if (el) el.style.display = sid === id ? 'block' : 'none';
  });
}

/* ─── Toast ───────────────────────────────────────────────────────────────── */
let _toastTimer;
function showToast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = 'toast show' + (type === 'error' ? ' toast-error' : '');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

/* ─── Loading screen ──────────────────────────────────────────────────────── */
function hideLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;
  screen.classList.add('hidden');
  setTimeout(() => { screen.style.display = 'none'; }, 500);
}

/* ─── Building details panel ──────────────────────────────────────────────── */
function showBuildingDetails(building) {
  if (!building) { showToast(t('buildingNotFound'), 'error'); return; }

  const cfg      = CAT[building.category] || CAT.administration;
  const catLabel = cfg.label[APP_STATE.lang] || cfg.label.fr;
  const nameKey  = APP_STATE.lang === 'en' ? 'nameEn' : APP_STATE.lang === 'ar' ? 'nameAr' : 'name';

  // Badge
  const badge = document.getElementById('detail-badge');
  badge.textContent    = `${cfg.emoji} ${catLabel}`;
  badge.style.background = cfg.color;

  // Name, dept/desc
  document.getElementById('detail-name').textContent = building[nameKey] || building.name;
  document.getElementById('detail-dept').textContent = building.department
    ? `${t('deptLabel')}: ${building.department}`
    : (building.description || '');

  // Hours
  document.getElementById('detail-hours').textContent = building.openingHours;

  // Distance
  const distItem = document.getElementById('detail-distance-item');
  if (APP_STATE.userLocation) {
    document.getElementById('detail-distance').textContent =
      fmtDist(haversine(APP_STATE.userLocation, building.coordinates));
    distItem.style.display = 'flex';
  } else {
    distItem.style.display = 'none';
  }

  // Services
  document.getElementById('detail-services').innerHTML =
    (building.services || []).map(s => `<span class="service-tag">${s}</span>`).join('');

  // Star button
  updateStarBtn(building.id);

  showSection('building-details');
}

/* ─── Dark mode ───────────────────────────────────────────────────────────── */
function toggleDark() {
  APP_STATE.darkMode = !APP_STATE.darkMode;
  applyDarkMode(APP_STATE.darkMode);
}

function applyDarkMode(on) {
  document.body.classList.toggle('dark', on);
  applyTileLayer();
  document.getElementById('sun-icon').style.display  = on ? 'none'  : 'block';
  document.getElementById('moon-icon').style.display = on ? 'block' : 'none';
  try { localStorage.setItem(LS_DARK, on ? '1' : '0'); } catch (_) {}
}

/* ─── Language ────────────────────────────────────────────────────────────── */
function setLang(lang) {
  APP_STATE.lang = lang;
  const html = document.documentElement;
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.getElementById('search-input').placeholder = t('searchPlaceholder');

  document.querySelectorAll('.lang-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.lang === lang)
  );

  try { localStorage.setItem(LS_LANG, lang); } catch (_) {}

  // Re-render open panel
  if (APP_STATE.selectedBuilding && document.getElementById('building-details').style.display !== 'none') {
    showBuildingDetails(APP_STATE.selectedBuilding);
  }
  if (document.getElementById('directions-panel').style.display !== 'none' && APP_STATE.selectedBuilding) {
    showDirections(APP_STATE.selectedBuilding);
  }
  renderWelcomeExtras();
}

/* ─── Favorites ───────────────────────────────────────────────────────────── */
function loadFavorites() {
  try {
    const raw = localStorage.getItem(LS_FAVORITES);
    APP_STATE.favorites = raw ? JSON.parse(raw) : [];
  } catch (_) {
    APP_STATE.favorites = [];
  }
  // Guard against stale IDs
  const validIds = new Set(BUILDINGS.map(b => b.id));
  APP_STATE.favorites = APP_STATE.favorites.filter(id => validIds.has(id));
}

function saveFavorites() {
  try { localStorage.setItem(LS_FAVORITES, JSON.stringify(APP_STATE.favorites)); } catch (_) {}
}

function isFavorite(id) {
  return APP_STATE.favorites.includes(id);
}

function toggleFavorite(id) {
  const building = BUILDINGS.find(b => b.id === id);
  if (!building) { showToast(t('buildingNotFound'), 'error'); return; }
  if (isFavorite(id)) {
    APP_STATE.favorites = APP_STATE.favorites.filter(x => x !== id);
    showToast(t('removedFav'));
  } else {
    APP_STATE.favorites.unshift(id);
    showToast(t('addedFav'));
  }
  saveFavorites();
  updateStarBtn(id);
  renderWelcomeExtras();
}

function updateStarBtn(id) {
  const btn = document.getElementById('star-btn');
  if (!btn) return;
  const fav = isFavorite(id);
  btn.innerHTML  = fav ? '★' : '☆';
  btn.classList.toggle('starred', fav);
  btn.setAttribute('aria-label', t(fav ? 'removeFavAria' : 'addFavAria'));
  btn.setAttribute('title',      t(fav ? 'removeFavAria' : 'addFavAria'));
}

/* ─── Recently viewed ─────────────────────────────────────────────────────── */
function loadRecent() {
  try {
    const raw = localStorage.getItem(LS_RECENT);
    APP_STATE.recentlyViewed = raw ? JSON.parse(raw) : [];
  } catch (_) {
    APP_STATE.recentlyViewed = [];
  }
  const validIds = new Set(BUILDINGS.map(b => b.id));
  APP_STATE.recentlyViewed = APP_STATE.recentlyViewed.filter(id => validIds.has(id));
}

function saveRecent() {
  try { localStorage.setItem(LS_RECENT, JSON.stringify(APP_STATE.recentlyViewed)); } catch (_) {}
}

function addRecentlyViewed(id) {
  APP_STATE.recentlyViewed = APP_STATE.recentlyViewed.filter(x => x !== id);
  APP_STATE.recentlyViewed.unshift(id);
  if (APP_STATE.recentlyViewed.length > MAX_RECENT) {
    APP_STATE.recentlyViewed = APP_STATE.recentlyViewed.slice(0, MAX_RECENT);
  }
  saveRecent();
  renderWelcomeExtras();
}

/* ─── Mini-card helper ────────────────────────────────────────────────────── */
function buildingMiniCard(id) {
  const b = BUILDINGS.find(x => x.id === id);
  if (!b) return '';
  const cfg     = CAT[b.category] || CAT.administration;
  const nameKey = APP_STATE.lang === 'en' ? 'nameEn' : APP_STATE.lang === 'ar' ? 'nameAr' : 'name';
  const name    = b[nameKey] || b.name;
  return `
    <div class="mini-card" data-id="${id}" title="${name}" style="border-top: 3px solid ${cfg.color}">
      <div class="mini-card-icon">${cfg.emoji}</div>
      <div class="mini-card-name">${name}</div>
    </div>`;
}

function bindMiniCards(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.mini-card').forEach(el => {
    el.addEventListener('click', () => {
      const b = BUILDINGS.find(x => x.id === el.dataset.id);
      if (!b) { showToast(t('buildingNotFound'), 'error'); return; }
      selectBuilding(b, APP_STATE.markers[b.id]);
    });
  });
}

/* ─── Welcome extras (favorites + recent) ────────────────────────────────── */
function renderWelcomeExtras() {
  // Favorites
  const favSection = document.getElementById('favorites-section');
  const favList    = document.getElementById('favorites-list');
  const validFavs  = APP_STATE.favorites.filter(id => BUILDINGS.find(b => b.id === id));
  if (validFavs.length > 0) {
    favSection.style.display = 'block';
    favList.innerHTML = validFavs.map(buildingMiniCard).join('');
    bindMiniCards('favorites-list');
    document.getElementById('fav-title').textContent = t('favorites');
  } else {
    favSection.style.display = 'none';
  }

  // Recently viewed
  const recSection = document.getElementById('recent-section');
  const recList    = document.getElementById('recent-list');
  const validRec   = APP_STATE.recentlyViewed.filter(id => BUILDINGS.find(b => b.id === id));
  if (validRec.length > 0) {
    recSection.style.display = 'block';
    recList.innerHTML = validRec.map(buildingMiniCard).join('');
    bindMiniCards('recent-list');
    document.getElementById('recent-title').textContent = t('recentlyViewed');
  } else {
    recSection.style.display = 'none';
  }
}

/* ─── What's near me? ─────────────────────────────────────────────────────── */
function showNearMe() {
  if (!APP_STATE.userLocation) {
    setSimulating(true);
    showToast(t('nearMeNoLoc'));
  }

  const from = APP_STATE.userLocation;
  if (!from) return;

  const sorted = BUILDINGS
    .map(b => ({ b, dist: haversine(from, b.coordinates) }))
    .sort((a, z) => a.dist - z.dist)
    .slice(0, NEARME_COUNT);

  if (sorted.length === 0) {
    showToast(t('nearMeEmpty'));
    return;
  }

  document.getElementById('nearme-title').textContent = t('nearMeTitle');

  const nameKey = APP_STATE.lang === 'en' ? 'nameEn' : APP_STATE.lang === 'ar' ? 'nameAr' : 'name';

  document.getElementById('nearme-list').innerHTML = sorted.map(({ b, dist }, i) => {
    const cfg  = CAT[b.category] || CAT.administration;
    const name = b[nameKey] || b.name;
    return `
      <div class="nearme-item" data-id="${b.id}">
        <div class="nearme-rank" style="background:${cfg.color}">${i + 1}</div>
        <div class="nearme-icon">${cfg.emoji}</div>
        <div class="nearme-info">
          <div class="nearme-name">${name}</div>
          <div class="nearme-cat">${cfg.label[APP_STATE.lang] || cfg.label.fr}</div>
        </div>
        <div class="nearme-dist">${fmtDist(dist)}</div>
      </div>`;
  }).join('');

  // Click handlers
  document.querySelectorAll('.nearme-item').forEach(el => {
    el.addEventListener('click', () => {
      const b = BUILDINGS.find(x => x.id === el.dataset.id);
      if (!b) { showToast(t('buildingNotFound'), 'error'); return; }
      selectBuilding(b, APP_STATE.markers[b.id]);
    });
  });

  showSection('nearme-panel');

  // Fit map to these 5 buildings
  const bounds = L.latLngBounds([from, ...sorted.map(({ b }) => b.coordinates)]).pad(0.15);
  APP_STATE.map.fitBounds(bounds, { animate: true });
}

/* ─── Offline / online banner ─────────────────────────────────────────────── */
function initNetworkHandlers() {
  if (!navigator.onLine) updateOfflineBanner(true);

  window.addEventListener('offline', () => {
    updateOfflineBanner(true);
    showToast(t('offline'), 'error');
  });
  window.addEventListener('online', () => {
    updateOfflineBanner(false);
    showToast(t('backOnline'));
  });
}

function updateOfflineBanner(offline) {
  const banner = document.getElementById('offline-banner');
  if (!banner) return;
  banner.style.display = offline ? 'flex' : 'none';
}

/* ─── Event binding ───────────────────────────────────────────────────────── */
function bindEvents() {
  // Dark mode
  document.getElementById('dark-mode-btn').addEventListener('click', toggleDark);

  // Language
  document.querySelectorAll('.lang-btn').forEach(btn =>
    btn.addEventListener('click', () => setLang(btn.dataset.lang))
  );

  // Menu → welcome
  document.getElementById('menu-btn').addEventListener('click', () => {
    clearRoute();
    deselectBuilding();
    showSection('welcome-panel');
  });

  // Locate
  document.getElementById('locate-btn').addEventListener('click', locateUser);

  // Simulate toggle
  document.getElementById('simulate-btn').addEventListener('click', () =>
    setSimulating(!APP_STATE.simulating)
  );

  // Search input
  const searchInput   = document.getElementById('search-input');
  const clearBtn      = document.getElementById('clear-search');
  const searchResults = document.getElementById('search-results');

  searchInput.addEventListener('input', () => {
    const q = searchInput.value;
    APP_STATE.searchQuery = q;
    clearBtn.style.display = q ? 'flex' : 'none';
    if (q || APP_STATE.activeCategory !== 'all') {
      renderSearchResults(filterBuildings(q, APP_STATE.activeCategory));
    } else {
      searchResults.style.display = 'none';
    }
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    APP_STATE.searchQuery = '';
    clearBtn.style.display = 'none';
    searchResults.style.display = 'none';
  });

  // Category pills
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      APP_STATE.activeCategory = btn.dataset.category;
      updateMarkerVisibility(APP_STATE.activeCategory);
      if (APP_STATE.searchQuery || APP_STATE.activeCategory !== 'all') {
        renderSearchResults(filterBuildings(APP_STATE.searchQuery, APP_STATE.activeCategory));
      } else {
        searchResults.style.display = 'none';
      }
    });
  });

  // Hide search on outside click
  document.addEventListener('click', e => {
    if (!document.getElementById('search-container').contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });

  // Star (favorite) button
  document.getElementById('star-btn').addEventListener('click', () => {
    if (APP_STATE.selectedBuilding) toggleFavorite(APP_STATE.selectedBuilding.id);
  });

  // Get Directions (from building details)
  document.getElementById('get-directions-btn').addEventListener('click', () => {
    if (APP_STATE.selectedBuilding) showDirections(APP_STATE.selectedBuilding);
  });

  // Close building details
  document.getElementById('close-details').addEventListener('click', () => {
    deselectBuilding();
    clearRoute();
    showSection('welcome-panel');
  });

  // Close directions
  document.getElementById('close-directions').addEventListener('click', () => {
    clearRoute();
    APP_STATE.selectedBuilding
      ? showBuildingDetails(APP_STATE.selectedBuilding)
      : showSection('welcome-panel');
  });

  // Near me button
  document.getElementById('nearme-btn').addEventListener('click', showNearMe);

  // Close near me
  document.getElementById('close-nearme').addEventListener('click', () => {
    showSection('welcome-panel');
  });

  // Panel swipe-down (mobile)
  let _touchY = 0;
  const panel = document.getElementById('panel');
  panel.addEventListener('touchstart', e => { _touchY = e.touches[0].clientY; }, { passive: true });
  panel.addEventListener('touchend',   e => {
    if (e.changedTouches[0].clientY - _touchY > 80) {
      clearRoute();
      deselectBuilding();
      showSection('welcome-panel');
    }
  }, { passive: true });
}

/* ─── Load stored preferences ─────────────────────────────────────────────── */
function loadStoredPrefs() {
  try {
    const dark = localStorage.getItem(LS_DARK);
    if (dark !== null) {
      APP_STATE.darkMode = dark === '1';
    } else {
      APP_STATE.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  } catch (_) {
    APP_STATE.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  applyDarkMode(APP_STATE.darkMode);

  try {
    const lang = localStorage.getItem(LS_LANG);
    if (lang && STRINGS[lang]) setLang(lang);
  } catch (_) {}
}

/* ─── App boot ────────────────────────────────────────────────────────────── */
function initApp() {
  loadStoredPrefs();
  loadFavorites();
  loadRecent();
  initMap();
  bindEvents();
  initNetworkHandlers();
  renderWelcomeExtras();
  showSection('welcome-panel');

  // Leaflet fires 'load' during the constructor (before any listener can be attached),
  // so we hide the loading screen with a short delay after initMap() completes.
  setTimeout(hideLoadingScreen, 800);
}

document.addEventListener('DOMContentLoaded', initApp);

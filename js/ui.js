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
  const p = document.getElementById('panel');
  if (p) p.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─── Bottom-sheet expand / collapse (mobile) ─────────────────────────────── */
function expandPanel() {
  const p = document.getElementById('panel');
  if (p) p.classList.add('expanded');
  document.body.classList.add('panel-expanded');
}
function collapsePanel() {
  const p = document.getElementById('panel');
  if (p) p.classList.remove('expanded');
  document.body.classList.remove('panel-expanded');
}
function togglePanel() {
  const p = document.getElementById('panel');
  if (p && p.classList.contains('expanded')) collapsePanel();
  else expandPanel();
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

  // Hours (hidden if not specified)
  const hoursItem = document.getElementById('detail-hours-item');
  if (hoursItem) {
    if (building.openingHours) {
      document.getElementById('detail-hours').textContent = building.openingHours;
      hoursItem.style.display = 'flex';
    } else {
      hoursItem.style.display = 'none';
    }
  }

  // Distance
  const distItem = document.getElementById('detail-distance-item');
  if (APP_STATE.userLocation) {
    document.getElementById('detail-distance').textContent =
      fmtDist(haversine(APP_STATE.userLocation, building.coordinates));
    distItem.style.display = 'flex';
  } else {
    distItem.style.display = 'none';
  }

  // Services (hidden if not specified)
  const servicesEl = document.getElementById('detail-services');
  if (servicesEl) {
    if (building.services && building.services.length) {
      servicesEl.innerHTML = building.services.map(s => `<span class="service-tag">${s}</span>`).join('');
      servicesEl.style.display = 'flex';
    } else {
      servicesEl.innerHTML = '';
      servicesEl.style.display = 'none';
    }
  }

  // Star button
  updateStarBtn(building.id);

  showSection('building-details');
  expandPanel();
}

/* ─── Dark mode ───────────────────────────────────────────────────────────── */
function toggleDark() {
  APP_STATE.darkMode = !APP_STATE.darkMode;
  applyDarkMode(APP_STATE.darkMode);
}

function applyDarkMode(on) {
  document.body.classList.toggle('dark', on);
  applyMapTheme();
  document.getElementById('sun-icon').style.display  = on ? 'none'  : 'block';
  document.getElementById('moon-icon').style.display = on ? 'block' : 'none';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', on ? '#0b1017' : '#3f6f3c');
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
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
  document.getElementById('search-input').placeholder = t('searchPlaceholder');

  // Document-level metadata
  document.title = t('docTitle');
  const md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute('content', t('metaDesc'));
  const ob = document.querySelector('#offline-banner span:last-child');
  if (ob) ob.textContent = t('offlineBanner');

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
  // Real GPS only — no simulated fallback.
  if (!APP_STATE.userLocation) {
    locateUser(showNearMe);
    return;
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
  expandPanel();

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
  document.body.classList.toggle('offline', offline);
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
    collapsePanel();
  });

  // Bottom-sheet handle / peek bar (mobile)
  const handle = document.getElementById('panel-handle');
  handle.addEventListener('click', togglePanel);
  handle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePanel(); }
  });
  document.getElementById('sheet-peek').addEventListener('click', expandPanel);

  // Zoom
  const zoomIn  = document.getElementById('zoom-in-btn');
  const zoomOut = document.getElementById('zoom-out-btn');
  zoomIn.addEventListener('click',  () => APP_STATE.map && APP_STATE.map.zoomIn());
  zoomOut.addEventListener('click', () => APP_STATE.map && APP_STATE.map.zoomOut());
  if (APP_STATE.map) {
    const syncZoomBtns = () => {
      const z = APP_STATE.map.getZoom();
      zoomIn.disabled  = z >= APP_STATE.map.getMaxZoom();
      zoomOut.disabled = z <= APP_STATE.map.getMinZoom();
    };
    APP_STATE.map.on('zoomend', syncZoomBtns);
    syncZoomBtns();
  }

  // Recenter on campus
  document.getElementById('recenter-btn').addEventListener('click', () => {
    if (APP_STATE.map) APP_STATE.map.flyToBounds(L.latLngBounds(FSSM_BOUNDARY), { padding: [40, 40], duration: 0.6 });
  });

  // Locate
  document.getElementById('locate-btn').addEventListener('click', () => locateUser());

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

  // Share button
  document.getElementById('share-btn').addEventListener('click', () => {
    const b = APP_STATE.selectedBuilding;
    if (!b) return;
    const nameKey = APP_STATE.lang === 'en' ? 'nameEn' : APP_STATE.lang === 'ar' ? 'nameAr' : 'name';
    const url = `${location.origin}${location.pathname}?b=${encodeURIComponent(b.id)}`;
    const title = `${b[nameKey] || b.name} — ${t('appTitle')}`;
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => showToast(t('linkCopied') || 'Lien copié')).catch(() => {});
    }
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
    collapsePanel();
  });

  // Close directions
  document.getElementById('close-directions').addEventListener('click', () => {
    clearRoute();
    APP_STATE.selectedBuilding
      ? showBuildingDetails(APP_STATE.selectedBuilding)
      : (showSection('welcome-panel'), collapsePanel());
  });

  // Near me button
  document.getElementById('nearme-btn').addEventListener('click', showNearMe);

  // Close near me
  document.getElementById('close-nearme').addEventListener('click', () => {
    showSection('welcome-panel');
    collapsePanel();
  });

  // Sidebar interactive stat cards (category filters)
  document.querySelectorAll('.stat-card[data-category]').forEach(card => {
    const handleFilter = () => {
      const cat = card.dataset.category;
      const targetBtn = document.querySelector(`.cat-btn[data-category="${cat}"]`);
      if (targetBtn) {
        targetBtn.click();
      } else {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        APP_STATE.activeCategory = cat;
        updateMarkerVisibility(cat);
      }
      document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    };
    card.addEventListener('click', handleFilter);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilter(); }
    });
  });

  // Landmark cards → select building and navigate
  document.querySelectorAll('.landmark-card[data-building]').forEach(card => {
    const handleSelect = () => {
      const bId = card.dataset.building;
      const b = BUILDINGS.find(x => x.id === bId);
      if (b && APP_STATE.markers && APP_STATE.markers[b.id]) {
        selectBuilding(b, APP_STATE.markers[b.id]);
      }
    };
    card.addEventListener('click', handleSelect);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(); }
    });
  });

  // Bottom-sheet swipe (mobile): down → collapse, up → expand
  let _touchY = 0;
  const panel = document.getElementById('panel');
  panel.addEventListener('touchstart', e => { _touchY = e.touches[0].clientY; }, { passive: true });
  panel.addEventListener('touchend',   e => {
    const dy = e.changedTouches[0].clientY - _touchY;
    if (dy > 70)      collapsePanel();
    else if (dy < -50) expandPanel();
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

function updateWelcomeStats() {
  const bldgEl = document.getElementById('stat-buildings');
  const amphEl = document.getElementById('stat-amphis');
  const deptEl = document.getElementById('stat-depts');
  const buvEl  = document.getElementById('stat-buvettes');
  if (bldgEl) bldgEl.textContent = BUILDINGS.length;
  if (amphEl) amphEl.textContent = BUILDINGS.filter(b => b.category === 'amphitheater').length;
  if (deptEl) deptEl.textContent = BUILDINGS.filter(b => b.category === 'department').length;
  if (buvEl)  buvEl.textContent  = BUILDINGS.filter(b => b.category === 'restaurant').length;
}

/* ─── App boot ────────────────────────────────────────────────────────────── */
function initApp() {
  loadStoredPrefs();
  setLang(APP_STATE.lang);   // sync <title>, meta, aria-labels to the active language
  loadFavorites();
  loadRecent();
  initMap();
  bindEvents();
  initNetworkHandlers();
  updateWelcomeStats();
  renderWelcomeExtras();
  showSection('welcome-panel');

  // Deep link: ?b=<building-id> opens that building's card
  try {
    const bid = new URLSearchParams(location.search).get('b');
    if (bid) {
      const b = BUILDINGS.find(x => x.id === bid);
      if (b) setTimeout(() => selectBuilding(b, APP_STATE.markers[b.id]), 300);
    }
  } catch (_) {}

  // The tile layer's first 'load' hides the loading screen (see applyTileLayer);
  // this is just a safety net if tiles are slow or the network is down.
  setTimeout(hideLoadingScreen, 4000);
}

document.addEventListener('DOMContentLoaded', initApp);

'use strict';
/* ─── Filter ──────────────────────────────────────────────────────────────── */
function filterBuildings(query, category) {
  const q = (query || '').toLowerCase().trim();
  return BUILDINGS.filter(b => {
    if (category !== 'all' && b.category !== category) return false;
    if (!q) return true;
    return (
      b.name.toLowerCase().includes(q) ||
      (b.nameEn && b.nameEn.toLowerCase().includes(q)) ||
      (b.nameAr && b.nameAr.includes(query.trim())) ||
      (b.code && b.code.toLowerCase().includes(q)) ||
      (b.department && b.department.toLowerCase().includes(q))
    );
  });
}

/* ─── Render results dropdown ─────────────────────────────────────────────── */
function renderSearchResults(buildings) {
  const container = document.getElementById('search-results');

  if (!buildings || buildings.length === 0) {
    container.innerHTML = `<div class="no-results">${t('noResults')}</div>`;
    container.style.display = 'block';
    return;
  }

  const nameKey = APP_STATE.lang === 'en' ? 'nameEn' : APP_STATE.lang === 'ar' ? 'nameAr' : 'name';

  container.innerHTML = buildings.map(b => {
    const cfg      = CAT[b.category] || CAT.administration;
    const name     = b[nameKey] || b.name;
    const catLabel = cfg.label[APP_STATE.lang] || cfg.label.fr;
    const distHtml = APP_STATE.userLocation
      ? `<span class="result-distance">${fmtDist(haversine(APP_STATE.userLocation, b.coordinates))}</span>`
      : '';
    return `
      <div class="search-result-item" data-id="${b.id}" role="option" tabindex="0">
        <div class="result-icon" style="background:${cfg.color}22;color:${cfg.color}">${cfg.emoji}</div>
        <div class="result-info">
          <div class="result-name">${name}</div>
          <div class="result-meta">${b.code} · ${catLabel}</div>
        </div>
        ${distHtml}
      </div>`;
  }).join('');

  container.style.display = 'block';

  container.querySelectorAll('.search-result-item').forEach(el => {
    const activate = () => {
      const b = BUILDINGS.find(x => x.id === el.dataset.id);
      if (!b) { showToast(t('buildingNotFound'), 'error'); return; }
      selectBuilding(b, APP_STATE.markers[b.id]);
      document.getElementById('search-results').style.display = 'none';
      document.getElementById('search-input').value = '';
      document.getElementById('clear-search').style.display = 'none';
      APP_STATE.searchQuery = '';
    };
    el.addEventListener('click', activate);
    el.addEventListener('keydown', e => { if (e.key === 'Enter') activate(); });
  });
}

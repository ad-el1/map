'use strict';
const WALK_SPEED_MS = 1.2; // metres per second (~4.3 km/h)

/* ─── Geo math ────────────────────────────────────────────────────────────── */
function haversine([lat1, lon1], [lat2, lon2]) {
  const R    = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a    = Math.sin(dLat / 2) ** 2 +
               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
               Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcBearing([lat1, lon1], [lat2, lon2]) {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const dλ = (lon2 - lon1) * Math.PI / 180;
  const y  = Math.sin(dλ) * Math.cos(φ2);
  const x  = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dλ);
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

function fmtDist(m) {
  if (typeof m !== 'number' || isNaN(m)) return '—';
  if (m < 1000) return `${Math.round(m)} ${t('m')}`;
  return `${(m / 1000).toFixed(1)} ${t('km')}`;
}

function fmtTime(m) {
  if (typeof m !== 'number' || isNaN(m)) return '—';
  const mins = Math.max(1, Math.ceil(m / WALK_SPEED_MS / 60));
  return `${mins} ${t('min')}`;
}

/* ─── Heading string ──────────────────────────────────────────────────────── */
function headingText(bearing) {
  const keys = ['headNorth','headNE','headEast','headSE','headSouth','headSW','headWest','headNW'];
  return t(keys[Math.round(bearing / 45) % 8]);
}

/* ─── Simulated step generation ───────────────────────────────────────────── */
function generateSteps(from, to, totalDist) {
  if (!from || !to) return [];
  const bearing = calcBearing(from, to);
  const steps   = [];

  if (totalDist < 60) {
    steps.push({ text: headingText(bearing),  dist: Math.round(totalDist * 0.9) });
    steps.push({ text: t('arrive'),           dist: 0 });
    return steps;
  }

  if (totalDist < 180) {
    steps.push({ text: headingText(bearing),  dist: Math.round(totalDist * 0.55) });
    steps.push({ text: t('continueStr'),      dist: Math.round(totalDist * 0.40) });
    steps.push({ text: t('arrive'),           dist: 0 });
    return steps;
  }

  // Longer route: simulate a turn for realism
  const turnCW      = bearing < 90 || (bearing >= 180 && bearing < 270);
  const perpBearing = (bearing + (turnCW ? 80 : -80) + 360) % 360;

  steps.push({ text: headingText(bearing),  dist: Math.round(totalDist * 0.38) });
  steps.push({
    text: `${turnCW ? t('turnRight') : t('turnLeft')} — ${headingText(perpBearing).toLowerCase()}`,
    dist: Math.round(totalDist * 0.32),
  });
  steps.push({
    text: `${t('continueStr')} ${headingText(bearing).toLowerCase()}`,
    dist: Math.round(totalDist * 0.26),
  });
  steps.push({ text: t('arrive'), dist: 0 });
  return steps;
}

/* ─── Route drawing ───────────────────────────────────────────────────────── */
function drawRoute(from, to) {
  clearRoute();
  APP_STATE.routeLayer = L.polyline([from, to], {
    color:     '#2563eb',
    weight:    5,
    opacity:   0.9,
    dashArray: '12 7',
    className: 'route-line',
  }).addTo(APP_STATE.map);
}

function clearRoute() {
  if (APP_STATE.routeLayer) {
    APP_STATE.map.removeLayer(APP_STATE.routeLayer);
    APP_STATE.routeLayer = null;
  }
}

/* ─── Show directions ─────────────────────────────────────────────────────── */
function showDirections(building) {
  if (!building) { showToast(t('buildingNotFound'), 'error'); return; }

  if (!APP_STATE.userLocation) {
    setSimulating(true);
    showToast(t('noLocation'));
  }

  const from = APP_STATE.userLocation;
  const to   = building.coordinates;
  if (!from || !to) { showToast(t('locUnavailable'), 'error'); return; }

  const dist = haversine(from, to);
  drawRoute(from, to);

  const nameKey = APP_STATE.lang === 'en' ? 'nameEn' : APP_STATE.lang === 'ar' ? 'nameAr' : 'name';
  const bName   = building[nameKey] || building.name;

  document.getElementById('route-from').textContent = t('fromLabel');
  document.getElementById('route-to').textContent   = `${t('toLabel')}: ${bName}`;

  document.getElementById('route-summary').innerHTML = `
    <div class="route-stat">
      <div class="route-stat-value">${fmtDist(dist)}</div>
      <div class="route-stat-label">${t('distLabel')}</div>
    </div>
    <div class="route-stat">
      <div class="route-stat-value">${fmtTime(dist)}</div>
      <div class="route-stat-label">${t('timeLabel')}</div>
    </div>`;

  const steps = generateSteps(from, to, dist);
  document.getElementById('route-steps').innerHTML = steps.map((s, i) => {
    const isLast = i === steps.length - 1;
    return `
      <div class="route-step">
        <div class="step-indicator">
          <div class="step-num${isLast ? ' last' : ''}">${isLast ? '✓' : i + 1}</div>
          <div class="step-line"></div>
        </div>
        <div class="step-body">
          <div class="step-text">${s.text}</div>
          ${s.dist > 0 ? `<div class="step-dist">${fmtDist(s.dist)}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  showSection('directions-panel');
  expandPanel();
  APP_STATE.map.fitBounds(L.latLngBounds([from, to]).pad(0.25), { animate: true });
}

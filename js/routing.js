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

/* ─── Campus pedestrian network (Nodes & Walkways) ────────────────────────── */
const CAMPUS_NODES = {
  N_ENTREE: {
    coord: [31.648194, -8.014417],
    name: { fr: 'Entrée Principale (Porte 1)', en: 'Main Entrance (Gate 1)', ar: 'المدخل الرئيسي (الباب 1)' }
  },
  N_BIBLIO: {
    coord: [31.648050, -8.014550],
    name: { fr: 'Cour de la Bibliothèque', en: 'Central Library Courtyard', ar: 'ساحة المكتبة المركزية' }
  },
  N_PARKING_ALLEY: {
    coord: [31.647550, -8.015100],
    name: { fr: 'Allée du Parking', en: 'Parking Walkway', ar: 'ممر الموقف' }
  },
  N_SCOLARITE: {
    coord: [31.648400, -8.014650],
    name: { fr: 'Allée de la Scolarité', en: 'Student Affairs Walkway', ar: 'ممر شؤون الطلاب' }
  },
  N_DECANAT: {
    coord: [31.648750, -8.014750],
    name: { fr: 'Esplanade du Décanat', en: "Dean's Esplanade", ar: 'ساحة العمادة' }
  },
  N_GEOLOGIE: {
    coord: [31.648900, -8.014500],
    name: { fr: 'Allée de Géologie', en: 'Geology Walkway', ar: 'ممر الجيولوجيا' }
  },
  N_EAST_AMPHIS: {
    coord: [31.649350, -8.014650],
    name: { fr: 'Allée des Amphis Est (V & IX)', en: 'East Lecture Halls Walkway (V & IX)', ar: 'ممر المدرجات الشرقية (5 و 9)' }
  },
  N_BIO_QUAD: {
    coord: [31.649500, -8.015100],
    name: { fr: 'Cour de Biologie & Amphi IV', en: 'Biology Quad & Hall IV', ar: 'فناء البيولوجيا والمدرج الرابع' }
  },
  N_PAVILLON_CENTRAL: {
    coord: [31.648917, -8.015350],
    name: { fr: 'Carrefour Pavillon Central', en: 'Central Pavilion Crossroads', ar: 'ملتقى الجناح المركزي' }
  },
  N_AMPHI_1_2: {
    coord: [31.649150, -8.015350],
    name: { fr: 'Allée des Amphis I & II', en: 'Halls I & II Walkway', ar: 'ممر المدرجين 1 و 2' }
  },
  N_SOUTH_QUAD: {
    coord: [31.648550, -8.015350],
    name: { fr: 'Cour Centrale Sud (Amphi III)', en: 'South Quad (Hall III)', ar: 'الفناء الجنوبي (المدرج الثالث)' }
  },
  N_CHIMIE_MATHS: {
    coord: [31.648250, -8.015550],
    name: { fr: 'Allée Chimie & Mathématiques', en: 'Chemistry & Math Walkway', ar: 'ممر الكيمياء والرياضيات' }
  },
  N_WEST_AMPHIS: {
    coord: [31.648500, -8.015850],
    name: { fr: 'Allée des Amphis Ouest (VI–VIII)', en: 'West Lecture Halls Walkway (VI–VIII)', ar: 'ممر المدرجات الغربية (6–8)' }
  },
  N_PHYSIQUE: {
    coord: [31.648900, -8.016100],
    name: { fr: 'Allée de Physique', en: 'Physics Department Walkway', ar: 'ممر قسم الفيزياء' }
  },
  N_NORTH_JUNCTION: {
    coord: [31.649400, -8.015900],
    name: { fr: 'Passage Nord', en: 'North Passage', ar: 'الممر الشمالي' }
  },
  N_EXTENSIONS: {
    coord: [31.649550, -8.016700],
    name: { fr: 'Allée des Extensions', en: 'Extensions Walkway', ar: 'ممر الملحق' }
  },
  N_BUVETTE_ETUD: {
    coord: [31.649722, -8.016250],
    name: { fr: 'Place de la Buvette Étudiants', en: 'Student Cafeteria Plaza', ar: 'ساحة مقصف الطلاب' }
  },
  N_SENIOR_AMPHI10: {
    coord: [31.650150, -8.016250],
    name: { fr: 'Allée Amphi X & Buvette Senior', en: 'Hall X & Senior Snack Walkway', ar: 'ممر المدرج العاشر ومقصف الأساتذة' }
  },
  N_INFO_IBN_JABER: {
    coord: [31.650650, -8.016300],
    name: { fr: 'Esplanade Centre Ibn Jaber', en: 'Ibn Jaber Center Esplanade', ar: 'ساحة مركز ابن جابر' }
  }
};

const CAMPUS_EDGES = [
  ['N_ENTREE', 'N_BIBLIO'],
  ['N_ENTREE', 'N_SCOLARITE'],
  ['N_BIBLIO', 'N_PARKING_ALLEY'],
  ['N_PARKING_ALLEY', 'N_CHIMIE_MATHS'],
  ['N_SCOLARITE', 'N_DECANAT'],
  ['N_SCOLARITE', 'N_SOUTH_QUAD'],
  ['N_DECANAT', 'N_GEOLOGIE'],
  ['N_DECANAT', 'N_PAVILLON_CENTRAL'],
  ['N_DECANAT', 'N_EAST_AMPHIS'],
  ['N_GEOLOGIE', 'N_EAST_AMPHIS'],
  ['N_EAST_AMPHIS', 'N_BIO_QUAD'],
  ['N_BIO_QUAD', 'N_AMPHI_1_2'],
  ['N_PAVILLON_CENTRAL', 'N_AMPHI_1_2'],
  ['N_PAVILLON_CENTRAL', 'N_SOUTH_QUAD'],
  ['N_PAVILLON_CENTRAL', 'N_PHYSIQUE'],
  ['N_AMPHI_1_2', 'N_NORTH_JUNCTION'],
  ['N_SOUTH_QUAD', 'N_CHIMIE_MATHS'],
  ['N_SOUTH_QUAD', 'N_WEST_AMPHIS'],
  ['N_CHIMIE_MATHS', 'N_WEST_AMPHIS'],
  ['N_WEST_AMPHIS', 'N_PHYSIQUE'],
  ['N_PHYSIQUE', 'N_NORTH_JUNCTION'],
  ['N_NORTH_JUNCTION', 'N_BUVETTE_ETUD'],
  ['N_NORTH_JUNCTION', 'N_EXTENSIONS'],
  ['N_BUVETTE_ETUD', 'N_EXTENSIONS'],
  ['N_BUVETTE_ETUD', 'N_SENIOR_AMPHI10'],
  ['N_SENIOR_AMPHI10', 'N_INFO_IBN_JABER']
];

/* ─── Build adjacency graph ───────────────────────────────────────────────── */
const CAMPUS_GRAPH = {};
Object.keys(CAMPUS_NODES).forEach(id => { CAMPUS_GRAPH[id] = []; });
CAMPUS_EDGES.forEach(([u, v]) => {
  if (!CAMPUS_NODES[u] || !CAMPUS_NODES[v]) return;
  const d = haversine(CAMPUS_NODES[u].coord, CAMPUS_NODES[v].coord);
  CAMPUS_GRAPH[u].push({ node: v, dist: d });
  CAMPUS_GRAPH[v].push({ node: u, dist: d });
});

/* ─── Dijkstra Shortest Path ──────────────────────────────────────────────── */
function findShortestCampusPath(startKey, targetKey) {
  if (startKey === targetKey) return [startKey];

  const dist = {};
  const prev = {};
  const unvisited = new Set(Object.keys(CAMPUS_NODES));

  Object.keys(CAMPUS_NODES).forEach(k => {
    dist[k] = Infinity;
    prev[k] = null;
  });
  dist[startKey] = 0;

  while (unvisited.size > 0) {
    let curr = null;
    let minD = Infinity;
    for (const node of unvisited) {
      if (dist[node] < minD) {
        minD = dist[node];
        curr = node;
      }
    }

    if (curr === null || minD === Infinity) break;
    if (curr === targetKey) break;

    unvisited.delete(curr);

    const neighbors = CAMPUS_GRAPH[curr] || [];
    for (const { node: next, dist: weight } of neighbors) {
      if (!unvisited.has(next)) continue;
      const alt = dist[curr] + weight;
      if (alt < dist[next]) {
        dist[next] = alt;
        prev[next] = curr;
      }
    }
  }

  const path = [];
  let u = targetKey;
  while (u) {
    path.unshift(u);
    u = prev[u];
  }
  return path[0] === startKey ? path : [startKey, targetKey];
}

function findClosestCampusNode(pt) {
  let best = 'N_ENTREE';
  let minD = Infinity;
  for (const [key, node] of Object.entries(CAMPUS_NODES)) {
    const d = haversine(pt, node.coord);
    if (d < minD) {
      minD = d;
      best = key;
    }
  }
  return best;
}

/* Closest point on segment AB to P (local equirectangular approx — fine at campus scale) */
function projectOnSegment(p, a, b) {
  const latRef = a[0] * Math.PI / 180;
  const mPerDegLat = 111320;
  const mPerDegLon = 111320 * Math.cos(latRef);
  const toXY = c => [(c[1] - a[1]) * mPerDegLon, (c[0] - a[0]) * mPerDegLat];
  const P = toXY(p), B = toXY(b);
  const len2 = B[0] * B[0] + B[1] * B[1];
  let tt = len2 > 0 ? (P[0] * B[0] + P[1] * B[1]) / len2 : 0;
  tt = Math.max(0, Math.min(1, tt));
  const proj = [a[0] + (b[0] - a[0]) * tt, a[1] + (b[1] - a[1]) * tt];
  return { coord: proj, t: tt, dist: haversine(p, proj) };
}

/* Snap an arbitrary point onto the walkway network — returns the projected
   coord plus the two graph nodes of the edge it landed on. */
function snapToWalkway(pt) {
  let best = null;
  for (const [u, v] of CAMPUS_EDGES) {
    if (!CAMPUS_NODES[u] || !CAMPUS_NODES[v]) continue;
    const pr = projectOnSegment(pt, CAMPUS_NODES[u].coord, CAMPUS_NODES[v].coord);
    if (!best || pr.dist < best.dist) best = { ...pr, u, v };
  }
  if (!best) {
    const k = findClosestCampusNode(pt);
    return { coord: CAMPUS_NODES[k].coord, dist: haversine(pt, CAMPUS_NODES[k].coord), u: k, v: k };
  }
  return best;
}

function getNodeLabel(nodeKey) {
  const node = CAMPUS_NODES[nodeKey];
  if (!node) return '';
  const lang = APP_STATE.lang || 'fr';
  return node.name[lang] || node.name.fr;
}

/* ─── Route builder ───────────────────────────────────────────────────────── */
function buildCampusRoute(from, to, targetName, originLabel) {
  const directDist = haversine(from, to);
  const startName  = originLabel || (APP_STATE.simulating ? t('fromLabelSimulated') : t('fromLabel'));

  // Very close: walk directly
  if (directDist < 25) {
    return {
      points: [from, to],
      totalDist: directDist,
      steps: [
        { text: `${t('nearTarget')} (${fmtDist(directDist)})`, dist: Math.round(directDist) },
        { text: `${t('arriveDestination')} ${targetName}`, dist: 0 }
      ]
    };
  }

  // Snap both ends onto the nearest walkway, then pick the cheapest way through
  // the graph between the two edges they landed on.
  const snapFrom = snapToWalkway(from);
  const snapTo   = snapToWalkway(to);

  const rawPoints = [from];
  const rawNames  = [startName];
  if (haversine(from, snapFrom.coord) > 6) {
    rawPoints.push(snapFrom.coord);
    rawNames.push(startName);
  }

  let bestSeq = null;
  let bestCost = Infinity;
  for (const s of new Set([snapFrom.u, snapFrom.v])) {
    for (const e of new Set([snapTo.u, snapTo.v])) {
      const nodeKeys = findShortestCampusPath(s, e);
      if (!nodeKeys.length) continue;
      let cost = haversine(snapFrom.coord, CAMPUS_NODES[s].coord)
               + haversine(snapTo.coord,   CAMPUS_NODES[e].coord);
      for (let i = 0; i < nodeKeys.length - 1; i++) {
        cost += haversine(CAMPUS_NODES[nodeKeys[i]].coord, CAMPUS_NODES[nodeKeys[i + 1]].coord);
      }
      if (cost < bestCost) { bestCost = cost; bestSeq = nodeKeys; }
    }
  }

  (bestSeq || [findClosestCampusNode(from)]).forEach(k => {
    rawPoints.push(CAMPUS_NODES[k].coord);
    rawNames.push(getNodeLabel(k));
  });

  if (haversine(to, snapTo.coord) > 6) {
    rawPoints.push(snapTo.coord);
    rawNames.push(targetName);
  }
  rawPoints.push(to);
  rawNames.push(targetName);

  // Filter redundant points closer than 4 metres
  const points = [rawPoints[0]];
  const names  = [rawNames[0]];
  for (let i = 1; i < rawPoints.length; i++) {
    if (haversine(points[points.length - 1], rawPoints[i]) >= 4.0) {
      points.push(rawPoints[i]);
      names.push(rawNames[i]);
    } else {
      names[names.length - 1] = rawNames[i];
    }
  }

  // Calculate step-by-step instructions
  const steps = [];
  let totalDist = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const segDist = haversine(points[i], points[i + 1]);
    totalDist += segDist;
    const bearing = calcBearing(points[i], points[i + 1]);
    const targetLabel = names[i + 1];

    let instruction = '';
    if (i === 0) {
      instruction = `${t('headTowards')} ${targetLabel}`;
    } else {
      const prevBearing = calcBearing(points[i - 1], points[i]);
      const diff = (bearing - prevBearing + 540) % 360 - 180;
      const a = Math.abs(diff);
      if (a < 18) {
        instruction = `${t('continueTowards')} ${targetLabel}`;
      } else if (a < 50) {
        instruction = `${t(diff > 0 ? 'turnSlightRight' : 'turnSlightLeft')} ${targetLabel}`;
      } else {
        instruction = `${t(diff > 0 ? 'turnRightTowards' : 'turnLeftTowards')} ${targetLabel}`;
      }
    }

    steps.push({
      text: instruction,
      dist: Math.round(segDist)
    });
  }

  steps.push({
    text: `${t('arriveDestination')} ${targetName}`,
    dist: 0
  });

  return { points, totalDist, steps };
}

/* ─── Route drawing ───────────────────────────────────────────────────────── */
// Faint overlay of the whole walkway network — shown while an itinerary is open
// so the paths used are visible (and easy to eyeball against the real campus).
function drawWalkwayNetwork() {
  if (APP_STATE.networkLayer) return;
  const dark = APP_STATE.darkMode;
  const g = L.layerGroup();
  CAMPUS_EDGES.forEach(([u, v]) => {
    if (!CAMPUS_NODES[u] || !CAMPUS_NODES[v]) return;
    L.polyline([CAMPUS_NODES[u].coord, CAMPUS_NODES[v].coord], {
      color: dark ? '#94a3b8' : '#475569',
      weight: 3, opacity: 0.35, dashArray: '2 6', lineCap: 'round', interactive: false,
    }).addTo(g);
  });
  Object.values(CAMPUS_NODES).forEach(n => {
    L.circleMarker(n.coord, {
      radius: 3, color: dark ? '#94a3b8' : '#475569',
      weight: 0, fillOpacity: 0.5, interactive: false,
    }).addTo(g);
  });
  APP_STATE.networkLayer = g.addTo(APP_STATE.map);
}

function drawRoute(points) {
  clearRoute();
  drawWalkwayNetwork();
  APP_STATE.routeLayer = L.polyline(points, {
    color:     '#2563eb',
    weight:    5,
    opacity:   0.9,
    dashArray: '10 6',
    className: 'route-line',
    lineJoin:  'round',
    lineCap:   'round'
  }).addTo(APP_STATE.map);
}

function clearRoute() {
  if (APP_STATE.routeLayer) {
    APP_STATE.map.removeLayer(APP_STATE.routeLayer);
    APP_STATE.routeLayer = null;
  }
  if (APP_STATE.networkLayer) {
    APP_STATE.map.removeLayer(APP_STATE.networkLayer);
    APP_STATE.networkLayer = null;
  }
}

/* ─── Show directions ─────────────────────────────────────────────────────── */
function showDirections(building) {
  if (!building) { showToast(t('buildingNotFound'), 'error'); return; }

  if (!APP_STATE.userLocation) {
    setSimulating(true);
    showToast(t('noLocation'));
  }

  const defaultFrom = typeof PAVILLON_CENTRAL !== 'undefined' ? PAVILLON_CENTRAL : [31.6490, -8.0155];
  const from = APP_STATE.userLocation || defaultFrom;
  const to   = building.coordinates;
  if (!from || !to) { showToast(t('locUnavailable'), 'error'); return; }

  const nameKey = APP_STATE.lang === 'en' ? 'nameEn' : APP_STATE.lang === 'ar' ? 'nameAr' : 'name';
  const bName   = building[nameKey] || building.name;

  const isSimulated = APP_STATE.simulating;
  const fromLabel = isSimulated ? t('fromLabelSimulated') : t('fromLabel');

  const routeData = buildCampusRoute(from, to, bName, fromLabel);
  drawRoute(routeData.points);

  document.getElementById('route-from').textContent = fromLabel;
  document.getElementById('route-to').textContent   = `${t('toLabel')}: ${bName}`;

  document.getElementById('route-summary').innerHTML = `
    <div class="route-stat">
      <div class="route-stat-value">${fmtDist(routeData.totalDist)}</div>
      <div class="route-stat-label">${t('distLabel')}</div>
    </div>
    <div class="route-stat">
      <div class="route-stat-value">${fmtTime(routeData.totalDist)}</div>
      <div class="route-stat-label">${t('timeLabel')}</div>
    </div>`;

  document.getElementById('route-steps').innerHTML = routeData.steps.map((s, i) => {
    const isLast = i === routeData.steps.length - 1;
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
  if (typeof expandPanel === 'function') expandPanel();
  APP_STATE.map.fitBounds(L.latLngBounds(routeData.points).pad(0.2), { animate: true });
}

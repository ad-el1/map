# FSSM Campus Navigator — état de la plateforme

**Date :** 2 septembre 2026 · **Branche :** `dev` (main intacte jusqu'à la fin) · **Rapport interne binôme**

## Résumé

PWA mobile-first pour se repérer sur le campus de la Faculté des Sciences Semlalia (UCA, Marrakech) :
carte Leaflet, 32 bâtiments catégorisés, recherche, géolocalisation, itinéraire piéton, favoris, mode
sombre, trois langues (FR / EN / AR avec RTL). Aucun backend, aucune clé API, aucun framework —
HTML / CSS / JS purs, seule dépendance : Leaflet 1.9.4.

**Verdict :** l'interface et toutes les fonctionnalités sont en place — c'est une **démo complète**.
Mais la plateforme **n'est pas encore utilisable sur le terrain** : les 32 coordonnées sont fictives,
le cache hors-ligne des tuiles ne fonctionne pas, les icônes PWA sont incomplètes, rien n'est déployé.
Cinq chantiers **P0** séparent la démo d'une v1 exploitable.

## Ce qui fonctionne déjà

- Carte interactive Leaflet + tuiles CartoDB clair / sombre, sans clé API
- 32 marqueurs sur 8 catégories, pins emoji colorés
- Recherche temps réel (nom, code, département — FR/EN/AR) + filtres par catégorie
- Géolocalisation navigateur avec messages d'erreur détaillés + mode « position simulée »
- Fiche bâtiment : badge, horaires, services, distance
- « Qu'est-ce qui est près de moi ? » — 5 plus proches (Haversine), cadrage auto
- Favoris ★ et « récemment vus » persistés dans `localStorage`
- Mode sombre — suit `prefers-color-scheme`, persistant
- Trilingue FR / EN / AR avec inversion RTL complète
- ⚠️ Itinéraire : ligne + étapes + distance/temps — mais **à vol d'oiseau**, virages simulés
- ❌ Service worker : cache statique OK — **cache des tuiles non fonctionnel** (voir P0-3)

## Architecture

Zéro build, zéro backend. État partagé global `APP_STATE` (défini dans `i18n.js`). ~2 600 lignes.

```
data/buildings.js → i18n.js → map.js → search.js → routing.js → ui.js
```

- `data/buildings.js` — 32 bâtiments (noms FR/EN/AR, code, catégorie, coordonnées, horaires, services)
- `js/map.js` — init Leaflet, tuiles, marqueurs, géoloc ; `CAMPUS_CENTER` / `MAIN_ENTRANCE` codés en dur
- `js/routing.js` — Haversine, cap, étapes simulées, tracé
- `js/ui.js` — panneaux, toast, dark mode, langue, favoris, near-me, événements, boot
- `sw.js` — cache-first statique, network-first tuiles

## Ce qui manque pour bien fonctionner

### P0 — bloquant pour un usage réel

| # | Chantier | Problème | À faire |
|---|----------|----------|---------|
| P0-1 | **Coordonnées GPS réelles** | Les 32 coordonnées de `data/buildings.js` sont fictives (grille autour de `31.6482, -8.0125`, `// TEST DATA`). Distances, itinéraire, « près de moi », centrage → tous faux. | Relever sur place (GPS téléphone, moyenne de 3 mesures) ou pointer sur imagerie satellite. Ne changer que `coordinates: [lat, lng]`. |
| P0-2 | **Centre campus + entrée** | `CAMPUS_CENTER` et `MAIN_ENTRANCE` codés en dur dans `js/map.js`. | Confirmer sur imagerie satellite (avec P0-1). |
| P0-3 | **Cache tuiles hors-ligne KO** | `sw.js` ne met en cache que `response.ok`. Les tuiles CartoDB reviennent en réponse *opaque* (`no-cors`, `status 0`) → jamais mises en cache → carte vide hors-ligne, contrairement au README. | Cacher aussi `response.type === 'opaque'`, avec limite de taille (ex. 300 entrées, éviction FIFO). Tester hors-ligne. |
| P0-4 | **Icônes PWA incomplètes** | Seulement des SVG. iOS ignore `apple-touch-icon` en SVG ; audits / anciens Android exigent des PNG 192 + 512 + maskable. | Générer `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` ; MAJ `manifest.json` + `<link rel="apple-touch-icon">` PNG 180×180. |
| P0-5 | **Hébergement HTTPS** | Rien de déployé. SW + géolocalisation exigent HTTPS. Pas de test téléphone possible. | GitHub Pages / Netlify / Vercel (chemins déjà relatifs `./`). Workflow de déploiement depuis `dev` puis `main`. |

### P1 — qualité / fiabilité

| # | Chantier | Problème | À faire |
|---|----------|----------|---------|
| P1-6 | **Leaflet en local** | Chargé depuis `unpkg.com` (`index.html` + `sw.js`). CDN down ou 1er chargement hors-ligne → carte cassée. | Copier `leaflet.js` + `leaflet.css` dans `/vendor`, retirer le CDN, MAJ pré-cache SW. |
| P1-7 | **Itinéraire réaliste** | Ligne droite + virages inventés dans `generateSteps()`. Traverse bâtiments et murs. | Réseau d'allées en GeoJSON + routage plus proche nœud, ou OpenRouteService (piéton, clé gratuite). À défaut : afficher « à vol d'oiseau », retirer les faux virages. |
| P1-8 | **Écran de chargement** | Masqué par `setTimeout(800 ms)` fixe. Connexion lente → carte grise visible. | Masquer sur `tileLayer.on('load')` + `map.whenReady()`, minuteur en secours (~5 s). |
| P1-9 | **i18n incomplet** | `<title>`, `<meta description>`, `aria-label`, bandeau hors-ligne, astuce chargement restent en FR en mode EN/AR. | Étendre `STRINGS` + application dans `setLang()`. |
| P1-10 | **Accessibilité** | `user-scalable=no` + `maximum-scale=1` bloquent le zoom (WCAG 1.4.4). Pas de nav clavier dans la recherche ; focus non géré. | Retirer le blocage de zoom, ajouter nav clavier + piège de focus dans les panneaux. |
| P1-11 | **Contenu à valider** | Horaires, capacités, services, traductions AR/EN inventés. | Relecture par l'administration ; corriger `data/buildings.js`. |

### P2 — améliorations

- **P2-12** Manifeste : ajouter `screenshots`, `id`, `scope` ; `theme-color` dynamique avec le dark mode.
- **P2-13** Boutons zoom +/− et « recentrer sur le campus » (contrôles Leaflet désactivés).
- **P2-14** Liens profonds `?b=<id>` pour ouvrir/partager une fiche + bouton Partager (Web Share API).
- **P2-15** Invite de mise à jour PWA (« nouvelle version → recharger ») ; checklist de test manuel partagée.

## Données à collecter

- [ ] 32 × coordonnées GPS `[lat, lng]`, précision ~5 m
- [ ] Centre du campus + entrée(s) réelle(s)
- [ ] Horaires d'ouverture réels, bâtiment par bâtiment
- [ ] Services / équipements réels par bâtiment
- [ ] Noms officiels en arabe et en anglais (départements et amphis)
- [ ] Photos des bâtiments (optionnel)

## Prochaines étapes proposées

1. Mettre le site en ligne sur GitHub Pages depuis `dev` (P0-5) — débloque les tests téléphone.
2. Sortie terrain commune : relever les 32 coordonnées + centre + entrée (P0-1, P0-2).
3. En parallèle : corriger le service worker (P0-3) et générer les icônes PNG (P0-4).
4. Vendrer Leaflet (P1-6) + fiabiliser l'écran de chargement (P1-8).
5. Passe i18n + accessibilité (P1-9, P1-10) pendant la validation du contenu (P1-11).
6. Décider pour l'itinéraire (P1-7) : réseau d'allées maison ou OpenRouteService.
7. Quand P0 + P1 sont verts : merge `dev` → `main` + déploiement prod.

**Répartition à discuter :** l'un prend déploiement + service worker + icônes (P0-3, P0-4, P0-5, P1-6),
l'autre itinéraire + i18n + accessibilité (P1-7, P1-9, P1-10). Relevé des coordonnées et validation
du contenu : ensemble.

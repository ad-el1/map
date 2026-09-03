# Checklist de test manuel — FSSM Campus Navigator

À faire à chaque version, sur **PC (localhost)** et **téléphone (HTTPS)**.
`Ctrl+Shift+R` une fois avant de tester (cache service worker).

## Chargement
- [ ] L'écran de chargement disparaît dès que la carte est prête (pas de carte grise figée)
- [ ] Le logo officiel FSSM s'affiche dans la barre du haut et le panneau d'accueil
- [ ] Tuiles OpenStreetMap visibles, campus en clair, extérieur grisé

## Carte & contrôles
- [ ] Boutons `＋ / −` : zoom, se désactivent aux limites
- [ ] Bouton 🏠 : recentre sur le campus
- [ ] Bouton cible : demande la position (voir *Géoloc*)
- [ ] Bouton épingle : position simulée à l'entrée (bouton devient orange)
- [ ] Les 26 marqueurs sont dans l'enceinte, bien répartis

## Recherche & filtres
- [ ] Recherche par nom, code, département (FR / EN / AR)
- [ ] Flèches ↑/↓ dans la liste de résultats, Échap pour fermer
- [ ] Filtres catégorie : masquent/affichent les bons marqueurs
- [ ] Aucun résultat → message « Aucun résultat »

## Fiche bâtiment
- [ ] Tap marqueur → fiche s'ouvre, panneau se déplie
- [ ] Badge catégorie, nom, horaires (si renseignés), services (si renseignés)
- [ ] ★ favori : persiste après rechargement
- [ ] Bouton Partager : ouvre le partage natif / copie le lien
- [ ] Ouvrir `…?b=dept-informatique` → la fiche s'ouvre directement

## Itinéraire
- [ ] « Itinéraire » → tracé bleu le long des allées (pas en ligne droite à travers les bâtiments)
- [ ] Réseau d'allées visible en pointillés pendant l'itinéraire
- [ ] Distance + temps affichés, étapes tournant-par-tournant cohérentes
- [ ] Sans position → bascule auto en simulé

## « Près de moi »
- [ ] 5 bâtiments les plus proches, triés par distance
- [ ] La carte cadre les 5

## Langues
- [ ] FR / EN / ع : textes, `<title>`, description, aria-labels changent
- [ ] Arabe : mise en page RTL, sélecteur inversé

## Mode sombre
- [ ] ☀/🌙 : bascule, persiste au rechargement
- [ ] Tuiles assombries, `theme-color` du navigateur change

## Hors-ligne (après un 1er chargement complet)
- [ ] Couper le réseau → bandeau « Hors ligne »
- [ ] La carte reste utilisable (tuiles déjà vues en cache)
- [ ] Reconnexion → bandeau disparaît, toast « Connexion rétablie »

## PWA
- [ ] Android Chrome : « Ajouter à l'écran d'accueil », icône correcte
- [ ] iOS Safari : Partager → « Sur l'écran d'accueil », icône non transparente
- [ ] Nouveau déploiement → l'app se recharge seule à la prochaine ouverture

## Géoloc (téléphone HTTPS uniquement)
- [ ] Bouton cible → demande d'autorisation → point bleu à la vraie position
- [ ] En HTTP (`192.168.x.x`) : normal que ça ne marche pas, utiliser le simulé

/* eslint-disable */
// TEST DATA — coordinates are approximate and will be replaced with real ones.
// Campus center: 31.6482, -8.0125 (FSSM, Boulevard Prince My Abdellah, Marrakech)

const BUILDINGS = [
  // ── Entrée & Parking ───────────────────────────────────────────────────────
  {
    id: 'entree-principale',
    name: 'Entrée Principale',
    nameEn: 'Main Entrance',
    nameAr: 'المدخل الرئيسي',
    code: 'EP',
    department: null,
    category: 'administration',
    coordinates: [31.6455, -8.0125],
    openingHours: '07:00 – 22:00',
    services: ['Sécurité', 'Accueil', 'Information'],
    description: 'Entrée principale de la faculté'
  },
  {
    id: 'parking-etudiants',
    name: 'Parking Étudiants',
    nameEn: 'Student Parking',
    nameAr: 'موقف الطلاب',
    code: 'PK',
    department: null,
    category: 'parking',
    coordinates: [31.6460, -8.0142],
    openingHours: '07:00 – 22:00',
    services: ['Stationnement gratuit', 'Surveillance', '200 places'],
    description: 'Parking réservé aux étudiants et personnel'
  },

  // ── Administration ─────────────────────────────────────────────────────────
  {
    id: 'presidence',
    name: 'Présidence & Administration',
    nameEn: "Dean's Office & Administration",
    nameAr: 'الرئاسة والإدارة',
    code: 'ADM',
    department: 'Administration',
    category: 'administration',
    coordinates: [31.6475, -8.0125],
    openingHours: '08:30 – 16:30',
    services: ['Bureau du Doyen', 'Ressources Humaines', 'Finance', 'Protocole'],
    description: 'Bâtiment administratif central de la faculté'
  },
  {
    id: 'scolarite',
    name: 'Scolarité',
    nameEn: 'Student Affairs',
    nameAr: 'شؤون الطلاب',
    code: 'SCO',
    department: 'Administration',
    category: 'administration',
    coordinates: [31.6472, -8.0112],
    openingHours: '08:30 – 15:30',
    services: ['Inscriptions', 'Certificats de scolarité', 'Relevés de notes', 'Attestations'],
    description: 'Service des affaires étudiantes et inscriptions'
  },

  // ── Bibliothèque ───────────────────────────────────────────────────────────
  {
    id: 'bibliotheque',
    name: 'Bibliothèque Centrale',
    nameEn: 'Central Library',
    nameAr: 'المكتبة المركزية',
    code: 'BIB',
    department: null,
    category: 'library',
    coordinates: [31.6480, -8.0100],
    openingHours: '08:00 – 20:00',
    services: ['Prêt de livres', 'Salle de lecture', 'Accès Internet', 'Photocopie', 'Ressources numériques', 'Archives'],
    description: 'Bibliothèque centrale de la faculté'
  },

  // ── Restauration ───────────────────────────────────────────────────────────
  {
    id: 'restaurant',
    name: 'Restaurant Universitaire',
    nameEn: 'University Restaurant',
    nameAr: 'المطعم الجامعي',
    code: 'RU',
    department: null,
    category: 'restaurant',
    coordinates: [31.6490, -8.0148],
    openingHours: '11:30 – 14:30',
    services: ['Déjeuner subventionné', 'Menu étudiant', 'Cafétéria annexe'],
    description: 'Restaurant universitaire principal, repas subventionnés'
  },
  {
    id: 'cafeteria',
    name: 'Cafétéria Centrale',
    nameEn: 'Main Cafeteria',
    nameAr: 'المقصف المركزي',
    code: 'CAF',
    department: null,
    category: 'restaurant',
    coordinates: [31.6485, -8.0132],
    openingHours: '07:30 – 18:00',
    services: ['Café & boissons', 'Sandwichs', 'Pâtisseries', 'Snacks'],
    description: 'Cafétéria centrale ouverte toute la journée'
  },

  // ── Amphithéâtres I–VIII ───────────────────────────────────────────────────
  {
    id: 'amphi-1',
    name: 'Amphithéâtre I',
    nameEn: 'Lecture Hall I',
    nameAr: 'قاعة المحاضرات الأولى',
    code: 'A1',
    department: null,
    category: 'amphitheater',
    coordinates: [31.6465, -8.0120],
    openingHours: '08:00 – 20:00',
    services: ['Cours magistraux', 'Capacité 500 places', 'Climatisation', 'Vidéoprojecteur'],
    description: 'Grand amphithéâtre principal'
  },
  {
    id: 'amphi-2',
    name: 'Amphithéâtre II',
    nameEn: 'Lecture Hall II',
    nameAr: 'قاعة المحاضرات الثانية',
    code: 'A2',
    department: null,
    category: 'amphitheater',
    coordinates: [31.6465, -8.0108],
    openingHours: '08:00 – 20:00',
    services: ['Cours magistraux', 'Capacité 400 places', 'Climatisation'],
    description: 'Amphithéâtre II'
  },
  {
    id: 'amphi-3',
    name: 'Amphithéâtre III',
    nameEn: 'Lecture Hall III',
    nameAr: 'قاعة المحاضرات الثالثة',
    code: 'A3',
    department: null,
    category: 'amphitheater',
    coordinates: [31.6470, -8.0098],
    openingHours: '08:00 – 20:00',
    services: ['Cours magistraux', 'Capacité 400 places', 'Système audio'],
    description: 'Amphithéâtre III'
  },
  {
    id: 'amphi-4',
    name: 'Amphithéâtre IV',
    nameEn: 'Lecture Hall IV',
    nameAr: 'قاعة المحاضرات الرابعة',
    code: 'A4',
    department: null,
    category: 'amphitheater',
    coordinates: [31.6470, -8.0088],
    openingHours: '08:00 – 20:00',
    services: ['Cours magistraux', 'Capacité 350 places'],
    description: 'Amphithéâtre IV'
  },
  {
    id: 'amphi-5',
    name: 'Amphithéâtre V',
    nameEn: 'Lecture Hall V',
    nameAr: 'قاعة المحاضرات الخامسة',
    code: 'A5',
    department: null,
    category: 'amphitheater',
    coordinates: [31.6475, -8.0080],
    openingHours: '08:00 – 20:00',
    services: ['Cours magistraux', 'Capacité 300 places'],
    description: 'Amphithéâtre V'
  },
  {
    id: 'amphi-6',
    name: 'Amphithéâtre VI',
    nameEn: 'Lecture Hall VI',
    nameAr: 'قاعة المحاضرات السادسة',
    code: 'A6',
    department: null,
    category: 'amphitheater',
    coordinates: [31.6480, -8.0086],
    openingHours: '08:00 – 20:00',
    services: ['Cours magistraux', 'Capacité 300 places'],
    description: 'Amphithéâtre VI'
  },
  {
    id: 'amphi-7',
    name: 'Amphithéâtre VII',
    nameEn: 'Lecture Hall VII',
    nameAr: 'قاعة المحاضرات السابعة',
    code: 'A7',
    department: null,
    category: 'amphitheater',
    coordinates: [31.6485, -8.0094],
    openingHours: '08:00 – 20:00',
    services: ['Cours magistraux', 'Capacité 250 places'],
    description: 'Amphithéâtre VII'
  },
  {
    id: 'amphi-8',
    name: 'Amphithéâtre VIII',
    nameEn: 'Lecture Hall VIII',
    nameAr: 'قاعة المحاضرات الثامنة',
    code: 'A8',
    department: null,
    category: 'amphitheater',
    coordinates: [31.6485, -8.0112],
    openingHours: '08:00 – 20:00',
    services: ['Cours magistraux', 'Capacité 250 places'],
    description: 'Amphithéâtre VIII'
  },

  // ── Amphithéâtres A–D ──────────────────────────────────────────────────────
  {
    id: 'amphi-a',
    name: 'Amphithéâtre A',
    nameEn: 'Lecture Hall A',
    nameAr: 'قاعة المحاضرات أ',
    code: 'AA',
    department: null,
    category: 'amphitheater',
    coordinates: [31.6490, -8.0116],
    openingHours: '08:00 – 20:00',
    services: ['Cours magistraux', 'Capacité 200 places', 'Vidéoprojecteur', 'Wi-Fi'],
    description: 'Amphithéâtre A — salle polyvalente'
  },
  {
    id: 'amphi-b',
    name: 'Amphithéâtre B',
    nameEn: 'Lecture Hall B',
    nameAr: 'قاعة المحاضرات ب',
    code: 'AB',
    department: null,
    category: 'amphitheater',
    coordinates: [31.6490, -8.0130],
    openingHours: '08:00 – 20:00',
    services: ['Cours magistraux', 'Capacité 200 places', 'Vidéoprojecteur'],
    description: 'Amphithéâtre B'
  },
  {
    id: 'amphi-c',
    name: 'Amphithéâtre C',
    nameEn: 'Lecture Hall C',
    nameAr: 'قاعة المحاضرات ج',
    code: 'AC',
    department: null,
    category: 'amphitheater',
    coordinates: [31.6495, -8.0120],
    openingHours: '08:00 – 20:00',
    services: ['Cours magistraux', 'Capacité 180 places'],
    description: 'Amphithéâtre C'
  },
  {
    id: 'amphi-d',
    name: 'Amphithéâtre D',
    nameEn: 'Lecture Hall D',
    nameAr: 'قاعة المحاضرات د',
    code: 'AD',
    department: null,
    category: 'amphitheater',
    coordinates: [31.6495, -8.0108],
    openingHours: '08:00 – 20:00',
    services: ['Cours magistraux', 'Capacité 180 places'],
    description: 'Amphithéâtre D'
  },

  // ── Départements ───────────────────────────────────────────────────────────
  {
    id: 'dept-biologie',
    name: 'Département Biologie',
    nameEn: 'Biology Department',
    nameAr: 'قسم علم الأحياء',
    code: 'BIO',
    department: 'Biologie',
    category: 'department',
    coordinates: [31.6500, -8.0125],
    openingHours: '08:00 – 18:00',
    services: ['Salles de cours', 'Bureaux professeurs', 'Salle de réunion', 'Documentation'],
    description: 'Département des Sciences de la Vie et de la Terre'
  },
  {
    id: 'dept-chimie',
    name: 'Département Chimie',
    nameEn: 'Chemistry Department',
    nameAr: 'قسم الكيمياء',
    code: 'CHI',
    department: 'Chimie',
    category: 'department',
    coordinates: [31.6505, -8.0110],
    openingHours: '08:00 – 18:00',
    services: ['Salles de cours', 'Bureaux professeurs', 'Salle de réunion'],
    description: 'Département de Chimie'
  },
  {
    id: 'dept-geologie',
    name: 'Département Géologie',
    nameEn: 'Geology Department',
    nameAr: 'قسم علم الأرض',
    code: 'GEO',
    department: 'Géologie',
    category: 'department',
    coordinates: [31.6505, -8.0142],
    openingHours: '08:00 – 18:00',
    services: ['Salles de cours', 'Bureaux professeurs', 'Lithothèque', 'Cartographie'],
    description: 'Département des Sciences de la Terre'
  },
  {
    id: 'dept-informatique',
    name: 'Département Informatique',
    nameEn: 'Computer Science Department',
    nameAr: 'قسم الإعلاميات',
    code: 'INFO',
    department: 'Informatique',
    category: 'department',
    coordinates: [31.6510, -8.0125],
    openingHours: '08:00 – 18:00',
    services: ['Salles de cours', 'Bureaux professeurs', 'Salle machines', 'Wi-Fi dédié'],
    description: 'Département Informatique et Intelligence Artificielle'
  },
  {
    id: 'dept-maths',
    name: 'Département Mathématiques',
    nameEn: 'Mathematics Department',
    nameAr: 'قسم الرياضيات',
    code: 'MATH',
    department: 'Mathématiques',
    category: 'department',
    coordinates: [31.6515, -8.0110],
    openingHours: '08:00 – 18:00',
    services: ['Salles de cours', 'Bureaux professeurs', 'Bibliothèque spécialisée'],
    description: 'Département de Mathématiques et Informatique'
  },
  {
    id: 'dept-physique',
    name: 'Département Physique',
    nameEn: 'Physics Department',
    nameAr: 'قسم الفيزياء',
    code: 'PHYS',
    department: 'Physique',
    category: 'department',
    coordinates: [31.6515, -8.0142],
    openingHours: '08:00 – 18:00',
    services: ['Salles de cours', 'Bureaux professeurs', 'Salle de TP', 'Instrumentation'],
    description: 'Département de Physique'
  },
  {
    id: 'dept-humanites',
    name: 'Département Humanités',
    nameEn: 'Humanities Department',
    nameAr: 'قسم العلوم الإنسانية',
    code: 'HUM',
    department: 'Humanités',
    category: 'department',
    coordinates: [31.6520, -8.0125],
    openingHours: '08:00 – 18:00',
    services: ['Salles de cours', 'Bureaux professeurs', 'Salle multimédia', 'Langues'],
    description: 'Département des Sciences Humaines et Sociales'
  },

  // ── Laboratoires ───────────────────────────────────────────────────────────
  {
    id: 'labo-chimie',
    name: 'Laboratoire de Chimie',
    nameEn: 'Chemistry Laboratory',
    nameAr: 'مختبر الكيمياء',
    code: 'LCHI',
    department: 'Chimie',
    category: 'lab',
    coordinates: [31.6508, -8.0098],
    openingHours: '08:00 – 17:00',
    services: ['TP Chimie organique', 'TP Chimie analytique', 'Recherche', 'Équipements spécialisés'],
    description: 'Laboratoire de Chimie analytique et organique'
  },
  {
    id: 'labo-biologie',
    name: 'Laboratoire de Biologie',
    nameEn: 'Biology Laboratory',
    nameAr: 'مختبر علم الأحياء',
    code: 'LBIO',
    department: 'Biologie',
    category: 'lab',
    coordinates: [31.6503, -8.0147],
    openingHours: '08:00 – 17:00',
    services: ['TP Biologie cellulaire', 'Microscopes', 'Recherche', 'Biochimie'],
    description: 'Laboratoire de Sciences de la Vie'
  },
  {
    id: 'labo-physique',
    name: 'Laboratoire de Physique',
    nameEn: 'Physics Laboratory',
    nameAr: 'مختبر الفيزياء',
    code: 'LPHY',
    department: 'Physique',
    category: 'lab',
    coordinates: [31.6518, -8.0152],
    openingHours: '08:00 – 17:00',
    services: ['TP Optique', 'TP Électronique', 'TP Mécanique', 'Recherche'],
    description: 'Laboratoire de Physique expérimentale'
  },
  {
    id: 'labo-informatique',
    name: 'Laboratoire Informatique',
    nameEn: 'Computer Lab',
    nameAr: 'مختبر الإعلاميات',
    code: 'LINF',
    department: 'Informatique',
    category: 'lab',
    coordinates: [31.6513, -8.0114],
    openingHours: '08:00 – 18:00',
    services: ['TP Programmation', '50 postes', 'Internet haut débit', 'Réseaux', 'IA & Data Science'],
    description: 'Laboratoire Informatique, Réseaux et Intelligence Artificielle'
  },
  {
    id: 'labo-geologie',
    name: 'Laboratoire de Géologie',
    nameEn: 'Geology Laboratory',
    nameAr: 'مختبر علم الأرض',
    code: 'LGEO',
    department: 'Géologie',
    category: 'lab',
    coordinates: [31.6508, -8.0157],
    openingHours: '08:00 – 17:00',
    services: ['TP Géologie', 'Cartographie SIG', 'Collection de roches', 'Microscopes pétrographiques'],
    description: 'Laboratoire de Géologie et Sciences de la Terre'
  },

  // ── Sport ──────────────────────────────────────────────────────────────────
  {
    id: 'terrain-sport',
    name: 'Terrain de Sport',
    nameEn: 'Sports Facilities',
    nameAr: 'الملعب الرياضي',
    code: 'SPORT',
    department: null,
    category: 'sports',
    coordinates: [31.6525, -8.0130],
    openingHours: '08:00 – 20:00',
    services: ['Football', 'Basketball', 'Volleyball', 'Athlétisme', 'Tennis de table'],
    description: 'Complexe sportif universitaire'
  },
];

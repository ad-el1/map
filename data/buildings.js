/* eslint-disable */
// Real surveyed coordinates (FSSM campus, Boulevard Prince My Abdellah, Marrakech)
// Campus center: 31.6490, -8.0155 (Pavillon Central)

const BUILDINGS = [
  // ── Entrée & Parking ───────────────────────────────────────────────────────
  {
    id: 'entree-principale',
    name: 'Entrée Principale (Porte 1)',
    nameEn: 'Main Entrance (Gate 1)',
    nameAr: 'المدخل الرئيسي (الباب 1)',
    code: 'EP',
    department: null,
    category: 'administration',
    coordinates: [31.648194, -8.014417],
    openingHours: '07:00 – 22:00',
    services: ['Sécurité', 'Accueil', 'Information', 'Accès Bd Prince My Abdellah'],
    description: 'Entrée principale de la faculté (Porte 1)'
  },
  {
    id: 'parking-etudiants',
    name: 'Parking Étudiants & Deux-Roues',
    nameEn: 'Student & Two-Wheeler Parking',
    nameAr: 'موقف الطلاب والدراجات',
    code: 'PK',
    department: null,
    category: 'parking',
    coordinates: [31.647361, -8.015250],
    openingHours: '07:00 – 22:00',
    services: ['Stationnement gratuit', 'Surveillance', 'Parking moto & vélo'],
    description: 'Parking réservé aux étudiants et au personnel'
  },

  // ── Administration ─────────────────────────────────────────────────────────
  {
    id: 'presidence',
    name: 'Présidence & Décanat',
    nameEn: "Dean's Office & Administration",
    nameAr: 'العمادة والإدارة',
    code: 'ADM',
    department: 'Administration',
    category: 'administration',
    coordinates: [31.648778, -8.014750],
    openingHours: '08:30 – 16:30',
    services: ['Bureau du Doyen', 'Ressources Humaines', 'Finance', 'Protocole'],
    description: 'Bâtiment administratif central et décanat de la faculté'
  },
  {
    id: 'scolarite',
    name: 'Scolarité & Centre de Recherche',
    nameEn: 'Student Affairs & Research Center',
    nameAr: 'شؤون الطلاب ومركز الأبحاث',
    code: 'SCO',
    department: 'Administration',
    category: 'administration',
    coordinates: [31.648350, -8.014650],
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
    coordinates: [31.648000, -8.014556],
    openingHours: '08:00 – 20:00',
    services: ['Prêt de livres', 'Salle de lecture', 'Accès Internet', 'Photocopie', 'Ressources numériques', 'Archives'],
    description: 'Bibliothèque centrale de la faculté'
  },

  // ── Restauration ───────────────────────────────────────────────────────────
  {
    id: 'restaurant',
    name: 'Buvette Étudiants',
    nameEn: 'Student Cafeteria',
    nameAr: 'مقصف الطلاب',
    code: 'BE',
    department: null,
    category: 'restaurant',
    coordinates: [31.649722, -8.016306],
    openingHours: '07:30 – 18:30',
    services: ['Café & boissons', 'Sandwichs', 'Snacks', 'Restauration rapide', 'Espace étudiants'],
    description: 'Buvette principale réservée aux étudiants'
  },
  {
    id: 'cafeteria',
    name: 'Buvette Senior (Enseignants & Personnel)',
    nameEn: 'Faculty & Staff Cafeteria',
    nameAr: 'مقصف الأساتذة والموظفين',
    code: 'BS',
    department: null,
    category: 'restaurant',
    coordinates: [31.650278, -8.016250],
    openingHours: '07:30 – 17:30',
    services: ['Café & boissons', 'Repas légers', 'Sandwichs', 'Terrasse'],
    description: 'Buvette senior dédiée aux enseignants et au personnel'
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
    coordinates: [31.649278, -8.015528],
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
    coordinates: [31.649028, -8.015083],
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
    coordinates: [31.648667, -8.015333],
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
    coordinates: [31.649639, -8.014972],
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
    coordinates: [31.649306, -8.014556],
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
    coordinates: [31.648389, -8.015944],
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
    coordinates: [31.648111, -8.015750],
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
    coordinates: [31.648861, -8.016028],
    openingHours: '08:00 – 20:00',
    services: ['Cours magistraux', 'Capacité 250 places'],
    description: 'Amphithéâtre VIII'
  },

  // ── Amphithéâtres IX, X, Extensions, Pavillon Central ───────────────────────
  {
    id: 'amphi-a',
    name: 'Amphithéâtre IX (Amphi 9)',
    nameEn: 'Lecture Hall IX (Amphi 9)',
    nameAr: 'قاعة المحاضرات التاسعة',
    code: 'A9',
    department: null,
    category: 'amphitheater',
    coordinates: [31.649472, -8.014806],
    openingHours: '08:00 – 20:00',
    services: ['Cours magistraux', 'Capacité 250 places', 'Vidéoprojecteur', 'Wi-Fi'],
    description: 'Amphithéâtre IX (Amphi 9)'
  },
  {
    id: 'amphi-b',
    name: 'Amphithéâtre X (Amphi 10)',
    nameEn: 'Lecture Hall X (Amphi 10)',
    nameAr: 'قاعة المحاضرات العاشرة',
    code: 'A10',
    department: null,
    category: 'amphitheater',
    coordinates: [31.650139, -8.016444],
    openingHours: '08:00 – 20:00',
    services: ['Cours magistraux', 'Capacité 250 places', 'Vidéoprojecteur'],
    description: 'Amphithéâtre X (Amphi 10)'
  },
  {
    id: 'extensions',
    name: 'Extensions (Salles de cours)',
    nameEn: 'Extensions (Classrooms)',
    nameAr: 'الملحق (قاعات دراسية)',
    code: 'EXT',
    department: null,
    category: 'department',
    coordinates: [31.649528, -8.016833],
    openingHours: '08:00 – 20:00',
    services: ['Salles de cours', 'Salles de TD', 'Capacité 40-60 places', 'Séances de travaux dirigés'],
    description: 'Bâtiment des extensions regroupant des salles de cours et de TD (aucun amphithéâtre)'
  },
  {
    id: 'amphi-d',
    name: 'Pavillon Central',
    nameEn: 'Central Pavilion',
    nameAr: 'الجناح المركزي',
    code: 'PC',
    department: null,
    category: 'amphitheater',
    coordinates: [31.648917, -8.015417],
    openingHours: '08:00 – 20:00',
    services: ['Grande salle de conférences', 'Cours magistraux', 'Capacité 200 places'],
    description: 'Pavillon central au cœur du campus'
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
    coordinates: [31.649528, -8.015083],
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
    coordinates: [31.648083, -8.015444],
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
    coordinates: [31.648944, -8.014389],
    openingHours: '08:00 – 18:00',
    services: ['Salles de cours', 'Bureaux professeurs', 'Lithothèque', 'Cartographie'],
    description: 'Département des Sciences de la Terre'
  },
  {
    id: 'dept-informatique',
    name: 'Département Informatique (Centre Ibn Jaber)',
    nameEn: 'Computer Science Dept (Ibn Jaber Center)',
    nameAr: 'قسم الإعلاميات (مركز ابن جابر)',
    code: 'INFO',
    department: 'Informatique',
    category: 'department',
    coordinates: [31.650750, -8.016333],
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
    coordinates: [31.648389, -8.015639],
    openingHours: '08:00 – 18:00',
    services: ['Salles de cours', 'Bureaux professeurs', 'Bibliothèque spécialisée'],
    description: 'Département de Mathématiques, situé entre les départements de Physique et de Chimie'
  },
  {
    id: 'dept-physique',
    name: 'Département Physique',
    nameEn: 'Physics Department',
    nameAr: 'قسم الفيزياء',
    code: 'PHYS',
    department: 'Physique',
    category: 'department',
    coordinates: [31.648972, -8.016278],
    openingHours: '08:00 – 18:00',
    services: ['Salles de cours', 'Bureaux professeurs', 'Salle de TP', 'Instrumentation'],
    description: 'Département de Physique'
  },
  {
    id: 'dept-humanites',
    name: 'Département Humanités & Langues',
    nameEn: 'Humanities & Languages Department',
    nameAr: 'قسم العلوم الإنسانية واللغات',
    code: 'HUM',
    department: 'Humanités',
    category: 'department',
    coordinates: [31.648900, -8.015150],
    openingHours: '08:00 – 18:00',
    services: ['Salles de cours', 'Bureaux professeurs', 'Salle multimédia', 'Langues'],
    description: 'Département des Sciences Humaines et Sociales'
  },
];

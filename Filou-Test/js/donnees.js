/* Filou lit — données du jeu (V2)
   Progression calquée sur « J'apprends à lire avec Sami et Julie » (Hachette), pages 7 à 30 puis 40 à 46 (+ défi f/v, p. 88).
   Notation des mots : [x] = lettre muette (affichée en gris). */
"use strict";

var FILOU_DATA = (function () {

  /* ---------- Mondes ---------- */
  const MONDES = [
    { n: 1, nom: "Le jardin des voyelles", decor: "jardin" },
    { n: 2, nom: "La forêt des syllabes", decor: "foret" },
    { n: 3, nom: "La plage des sons", decor: "plage" },
    { n: 4, nom: "La montagne enneigée", decor: "montagne" },
  ];

  /* ---------- Niveaux (une leçon du manuel = un niveau) ----------
     type : voyelle | consonne | groupe | outil | revision
     g : graphèmes appris dans la leçon ; dire : ce que la voix dit pour le son ;
     exemple : mot où l'on entend le son (dit à voix haute, jamais affiché) ;
     groupe : consonne + r ou l lues ensemble (lie = r ou l ; syllabes = exemples dits à l'intro) ;
     nom : libellé complet (espace parent) quand titre est abrégé sur la carte.
     On ajoute toujours les niveaux À LA FIN : la progression sauvegardée repose sur leur position. */
  const NIVEAUX = [
    { id: "a",  monde: 1, type: "voyelle",  g: ["a"],      titre: "a",      page: 7,  dire: "a",  exemple: "ananas" },
    { id: "i",  monde: 1, type: "voyelle",  g: ["i", "y"], titre: "i y",    page: 8,  dire: "i",  exemple: "île" },
    { id: "o",  monde: 1, type: "voyelle",  g: ["o"],      titre: "o",      page: 9,  dire: "o",  exemple: "moto" },
    { id: "u",  monde: 1, type: "voyelle",  g: ["u"],      titre: "u",      page: 10, dire: "u",  exemple: "lune" },
    { id: "e",  monde: 1, type: "voyelle",  g: ["e"],      titre: "e",      page: 11, dire: "eu", exemple: "le petit" },
    { id: "é",  monde: 1, type: "voyelle",  g: ["é"],      titre: "é",      page: 12, dire: "é",  exemple: "bébé" },
    { id: "è",  monde: 1, type: "voyelle",  g: ["è", "ê"], titre: "è ê",    page: 13, dire: "è",  exemple: "fête" },
    { id: "R1", monde: 1, type: "revision", g: [],         titre: "Révision", page: 14 },
    { id: "s",  monde: 2, type: "consonne", g: ["s"],      titre: "s",      page: 16, exemple: "sirène" },
    { id: "l",  monde: 2, type: "consonne", g: ["l"],      titre: "l",      page: 17, exemple: "lune" },
    { id: "r",  monde: 2, type: "consonne", g: ["r"],      titre: "r",      page: 18, exemple: "rire" },
    { id: "n",  monde: 2, type: "consonne", g: ["n"],      titre: "n",      page: 19, exemple: "nid" },
    { id: "m",  monde: 2, type: "consonne", g: ["m"],      titre: "m",      page: 20, exemple: "mamie" },
    { id: "et", monde: 2, type: "outil",    g: [],         titre: "et est", page: 21, outils: ["et", "est"] },
    { id: "R2", monde: 2, type: "revision", g: [],         titre: "Révision", page: 22 },
    { id: "f",  monde: 3, type: "consonne", g: ["f"],      titre: "f",      page: 24, exemple: "fusée" },
    { id: "v",  monde: 3, type: "consonne", g: ["v"],      titre: "v",      page: 25, exemple: "vélo" },
    { id: "p",  monde: 3, type: "consonne", g: ["p"],      titre: "p",      page: 26, exemple: "pomme" },
    { id: "b",  monde: 3, type: "consonne", g: ["b"],      titre: "b",      page: 27, exemple: "bébé" },
    { id: "t",  monde: 3, type: "consonne", g: ["t"],      titre: "t",      page: 28, exemple: "tomate" },
    { id: "d",  monde: 3, type: "consonne", g: ["d"],      titre: "d",      page: 29, exemple: "dé" },
    { id: "R3", monde: 3, type: "revision", g: [],         titre: "Révision", page: 30 },
    { id: "z",  monde: 4, type: "consonne", g: ["z"],      titre: "z",      page: 40, exemple: "zéro" },
    { id: "pr", monde: 4, type: "groupe", lie: "r", g: ["pr", "br", "tr", "dr", "cr", "gr", "fr", "vr"], titre: "pr br…",
      nom: "pr br tr dr cr gr fr vr", page: "41-42", syllabes: ["pra", "bra", "tra", "cra"] },
    { id: "pl", monde: 4, type: "groupe", lie: "l", g: ["pl", "bl", "cl", "gl", "fl", "vl"], titre: "pl bl…",
      nom: "pl bl cl gl fl vl", page: "43-45", syllabes: ["pla", "bla", "cla", "fla"] },
    { id: "R4", monde: 4, type: "revision", g: [],         titre: "Révision", page: 46 },
  ];

  /* Défis « Ne confonds pas » (pages de fin du manuel) : hors du chemin, ils ne bloquent rien.
     Ouverts dès que le niveau « apres » est réussi. paire : les deux lettres à distinguer. */
  const DEFIS = [
    { id: "fv", paire: ["f", "v"], monde: 3, apres: "v", titre: "f v", nom: "Défi f / v", page: 88,
      aide: { f: "souffle", v: "vibre" }, exemples: { f: "fusée", v: "vélo" } },
  ];

  /* Prononciation des syllabes isolées par la voix du Mac : un mot qui se prononce pareil évite
     une lecture en sigle (« vo » → « V.O. »). Un enregistrement sons/syllabes/<syllabe>.m4a passe avant. */
  const PRONONCE = { lo: "lot", ro: "rot", mo: "mot", no: "nos", so: "seau", fo: "faux", vo: "veau",
    po: "pot", bo: "beau", to: "tôt", do: "dos" };

  /* Phrase du son, dite à l'ouverture d'un niveau consonne (le Mac ne sait pas dire « fff ») */
  const INDICES = {
    s: "Le s siffle comme un serpent.",
    l: "Le l chante, la langue derrière les dents.",
    r: "Le r gratte au fond de la gorge.",
    n: "Le n chante dans le nez.",
    m: "Le m chante, la bouche fermée : mmm, c'est bon !",
    f: "Le f souffle, les dents sur la lèvre.",
    v: "Le v chante en soufflant, comme une voiture.",
    p: "Le p éclate, comme une bulle.",
    b: "Le b éclate, avec la voix.",
    t: "Le t tape, la langue derrière les dents.",
    d: "Le d tape, avec la voix.",
    z: "Le z bourdonne comme une abeille, avec la voix.",
  };

  /* ---------- Mots-outils (appris par cœur) : niveau à partir duquel ils sont permis ---------- */
  const OUTILS = { un: "n", et: "et", est: "et", elle: "et", avec: "v" };

  /* ---------- Mots illustrés ----------
     m : mot (muettes entre crochets), e : image. Le niveau d'apparition est calculé automatiquement. */
  const MOTS = [
    { m: "île", e: "🏝️" }, { m: "lire", e: "📖" }, { m: "rire", e: "😂" }, { m: "ri[z]", e: "🍚" },
    { m: "ra[t]", e: "🐀" }, { m: "li[t]", e: "🛏️" },
    { m: "lune", e: "🌙" }, { m: "âne", e: "🫏" }, { m: "anana[s]", e: "🍍" }, { m: "sirène", e: "🧜‍♀️" },
    { m: "ni[d]", e: "🪺" }, { m: "narine", e: "👃" },
    { m: "lama", e: "🦙" }, { m: "mur", e: "🧱" }, { m: "mamie", e: "👵" }, { m: "rame", e: "🚣" },
    { m: "larme", e: "😢" },
    { m: "fée", e: "🧚" }, { m: "fumée", e: "💨" }, { m: "fusée", e: "🚀" }, { m: "sofa", e: "🛋️" },
    { m: "fil", e: "🧵" }, { m: "forê[t]", e: "🌲" },
    { m: "vélo", e: "🚲" }, { m: "olive", e: "🫒" }, { m: "navire", e: "🚢" }, { m: "valise", e: "🧳" },
    { m: "rêve", e: "💭" }, { m: "lave", e: "🌋" }, { m: "vase", e: "🏺" }, { m: "ville", e: "🏙️" },
    { m: "élève", e: "🧑‍🎓" },
    { m: "pomme", e: "🍎" }, { m: "pile", e: "🔋" }, { m: "épée", e: "🗡️" }, { m: "puma", e: "🐆" },
    { m: "papi", e: "👴" },
    { m: "bébé", e: "👶" }, { m: "bol", e: "🥣" }, { m: "robe", e: "👗" }, { m: "bulle", e: "🫧" },
    { m: "barbe", e: "🧔" }, { m: "bus", e: "🚌" }, { m: "bobo", e: "🩹" }, { m: "balle", e: "🎾" },
    { m: "bise", e: "😘" }, { m: "robo[t]", e: "🤖" },
    { m: "tomate", e: "🍅" }, { m: "tortue", e: "🐢" }, { m: "tulipe", e: "🌷" }, { m: "moto", e: "🏍️" },
    { m: "patate", e: "🥔" }, { m: "fête", e: "🎉" }, { m: "pirate", e: "🏴‍☠️" }, { m: "tasse", e: "☕" },
    { m: "botte", e: "👢" }, { m: "patte", e: "🐾" },
    { m: "dé", e: "🎲" }, { m: "salade", e: "🥗" }, { m: "malade", e: "🤒" }, { m: "dodo", e: "😴" },
    { m: "dune", e: "🏜️" }, { m: "midi", e: "🕛" }, { m: "radar", e: "📡" },
    // Monde 4 : z, puis consonne + r, consonne + l (c et g n'existent qu'à l'intérieur de cr, gr, cl, gl)
    { m: "lézar[d]", e: "🦎" }, { m: "zéro", e: "0️⃣" },
    { m: "zèbre", e: "🦓" }, { m: "arbre", e: "🌳" }, { m: "bra[s]", e: "💪" }, { m: "brosse", e: "🪥" },
    { m: "brebi[s]", e: "🐑" }, { m: "trésor", e: "💰" }, { m: "vitre", e: "🪟" }, { m: "trapèze", e: "🤸" },
    { m: "crabe", e: "🦀" }, { m: "crêpe", e: "🥞" }, { m: "cravate", e: "👔" }, { m: "microbe", e: "🦠" },
    { m: "écrire", e: "✍️" }, { m: "tigre", e: "🐯" }, { m: "frite[s]", e: "🍟" },
    { m: "frère", e: "👦" }, { m: "livre", e: "📕" }, { m: "lèvre[s]", e: "👄" }, { m: "lièvre", e: "🐇" },
    { m: "prise", e: "🔌" }, { m: "bravo", e: "👏" }, { m: "drôle", e: "🤪" },
    { m: "plume", e: "🪶" }, { m: "plui[e]", e: "🌧️" }, { m: "planète", e: "🪐" }, { m: "pla[t]", e: "🍽️" },
    { m: "blé", e: "🌾" }, { m: "sable", e: "🏖️" }, { m: "clé", e: "🔑" }, { m: "règle", e: "📏" },
    { m: "glissade", e: "🛝" }, { m: "flûte", e: "🪈" }, { m: "flamme", e: "🔥" }, { m: "trèfle", e: "🍀" },
  ];

  /* Mots sans image (lecture à voix haute) */
  const MOTS_SANS_IMAGE = ["ami", "Léa", "Lili", "Rémi", "Nina", "Mila", "salé", "rare", "mari", "lila[s]",
    "Émilie", "ravi", "avenir", "sévère", "fini", "pâte", "pipe", "vite", "tapi[s]", "midi", "samedi",
    "Zoé", "Zélie", "bazar", "azur", "zu[t]", "propre", "brave", "libre", "triste", "gri[s]", "sabre", "Bruno",
    "crème", "sucre", "ogre", "tro[p]", "trè[s]", "prune", "Clara", "Flora", "Flavie", "Pablo", "plu[s]", "pli", "la table"];

  /* ---------- Phrases (niveau d'apparition calculé) ---------- */
  const PHRASES = [
    "Léa a ri.", "Lili a lu.", "Il a ri.", "Nina a lu.", "Il a une île.", "Nina a ri.",
    "Mamie a lu.", "Rémi a ri.", "Le lama a mal.", "Mila a une rame.", "Léa a mal.",
    "Léa est là.", "Mamie est là.", "Rémi est sur le mur.", "Le lama est sur l'île.",
    "Léa a ri et Rémi a lu.", "Elle a une rame.",
    "La fée a filé.", "Il a une fusée.", "La fumée est sur la forê[t].",
    "Léa a vu la lune.", "Rémi a un vélo.", "Elle a une valise.", "Il a vu une fée.", "Émilie va avec Léa.",
    "Papi a une pomme.", "Le puma a filé.", "Le bébé a une balle.", "Le bébé a un bobo.", "Léa a une robe.",
    "La tortue a une tomate.", "Papi a une moto.", "Le pirate a une épée.", "La tasse est là.",
    "Le dé est sur le sofa.", "Le bébé dor[t].", "Le malade a mal.", "Il a une salade.",
    "Zoé a vu un lézar[d].", "Le lézar[d] est sur le mur.", "Zélie a zéro.", "Zoé a une valise.", "Il a vu Zoé.",
    "Le tigre a vu le zèbre.", "Papi a un livre.", "Le pirate a un trésor.", "Léa a une robe propre.",
    "Rémi a une crêpe.", "La brebi[s] a filé.", "Le crabe est là.", "Mila a une frite.", "Le frère de Léa est drôle.",
    "Il y a du sucre.", "L'ogre a une cravate.", "Le lièvre est triste.",
    "Il a une plume.", "La plui[e] est sur la vitre.", "Papi a une clé.", "Léa a une flûte.", "Le crabe est sur le sable.",
    "Il a un pla[t] de frite[s].", "Le blé est là.", "Clara a une règle.", "Flora a vu la planète.",
  ];

  /* Phrases à trou (le mot-outil manquant) : t = phrase avec ___, r = bonne réponse */
  const TROUS = [
    { t: "Rémi ___ sur le mur.", r: "est" },
    { t: "Mamie a lu ___ Léa a ri.", r: "et" },
    { t: "Le lama ___ sur l'île.", r: "est" },
    { t: "Léa ___ Rémi.", r: "et" },
    { t: "Mamie ___ là.", r: "est" },
    { t: "Nina ___ Mila.", r: "et" },
    { t: "Léa ___ une rame.", r: "a" },
    { t: "Le lama ___ mal.", r: "a" },
    { t: "La tasse ___ là.", r: "est" },
    { t: "Le dé ___ sur le sofa.", r: "est" },
    { t: "Émilie va ___ Léa.", r: "avec" },
    { t: "Papi ___ une moto.", r: "a" },
    { t: "Le lézar[d] ___ sur le mur.", r: "est" },
    { t: "Le lièvre ___ triste.", r: "est" },
    { t: "Zoé ___ une flûte.", r: "a" },
    { t: "Le crabe ___ sur le sable.", r: "est" },
    { t: "Papi a un livre ___ une plume.", r: "et" },
    { t: "Clara va ___ Flora.", r: "avec" },
  ];

  /* ---------- Accessoires de Filou : une collection par monde ----------
     Une collection s'ouvre quand le premier niveau de son monde est ouvert (sous le plafond).
     zone : tete | yeux | cou | taille | dos | patte (un accessoire par zone ; dessins dans dessins.js) */
  const COLLECTIONS = [
    { monde: 1, nom: "Collection du jardin" },
    { monde: 2, nom: "Collection de la forêt" },
    { monde: 3, nom: "Collection de la plage" },
    { monde: 4, nom: "Collection de la montagne" },
  ];
  const ACCESSOIRES = [
    { id: "fleur",    nom: "La fleur",          prix: 6,  zone: "tete", collection: 1 },
    { id: "noeud",    nom: "Le nœud papillon",  prix: 10, zone: "cou",  collection: 1 },
    { id: "lunettes", nom: "Les lunettes",      prix: 15, zone: "yeux", collection: 1 },
    { id: "chapeau",  nom: "Le chapeau de fête", prix: 20, zone: "tete", collection: 1 },
    { id: "echarpe",  nom: "L'écharpe",         prix: 25, zone: "cou",  collection: 1 },
    { id: "couronne", nom: "La couronne",       prix: 35, zone: "tete", collection: 1 },
    { id: "cape",     nom: "La cape de super-chat", prix: 50, zone: "dos", collection: 1 },
    { id: "foulard",  nom: "Le foulard",        prix: 20, zone: "cou",  collection: 2 },
    { id: "lutin",    nom: "Le bonnet de lutin", prix: 25, zone: "tete", collection: 2 },
    { id: "sacados",  nom: "Le sac à dos",      prix: 30, zone: "dos",  collection: 2 },
    { id: "feuilles", nom: "La couronne de feuilles", prix: 35, zone: "tete", collection: 2 },
    { id: "lanterne", nom: "La lanterne",       prix: 40, zone: "patte", collection: 2 },
    { id: "loupe",    nom: "La loupe d'explorateur", prix: 45, zone: "patte", collection: 2 },
    { id: "soleil",   nom: "Les lunettes de soleil", prix: 25, zone: "yeux", collection: 3 },
    { id: "paille",   nom: "Le chapeau de paille", prix: 30, zone: "tete", collection: 3 },
    { id: "seau",     nom: "Le seau et la pelle", prix: 30, zone: "patte", collection: 3 },
    { id: "coquillages", nom: "Le collier de coquillages", prix: 35, zone: "cou", collection: 3 },
    { id: "bouee",    nom: "La bouée canard",   prix: 40, zone: "taille", collection: 3 },
    { id: "plongee",  nom: "Le masque de plongée", prix: 45, zone: "yeux", collection: 3 },
    { id: "grelot",   nom: "Le collier à grelot", prix: 30, zone: "cou", collection: 4 },
    { id: "pompon",   nom: "Le bonnet à pompon", prix: 35, zone: "tete", collection: 4 },
    { id: "oreilles", nom: "Le cache-oreilles", prix: 40, zone: "tete", collection: 4 },
    { id: "ski",      nom: "Le masque de ski",  prix: 45, zone: "yeux", collection: 4 },
    { id: "luge",     nom: "La luge",           prix: 60, zone: "patte", collection: 4 },
  ];

  /* ---------- La maison de Filou : une chambre à décorer ----------
     Chaque objet va dans un emplacement (un seul objet par emplacement). Les types à plusieurs
     emplacements (cadre, objet d'étagère, jouet) prennent le premier libre. Dessins dans dessins.js. */
  const RAYONS = [
    { id: "murs", nom: "Murs et sols", icone: "🎨" },
    { id: "meubles", nom: "Meubles", icone: "🛋️" },
    { id: "deco", nom: "Déco", icone: "🖼️" },
    { id: "jouets", nom: "Jouets", icone: "🧸" },
    { id: "filou", nom: "Pour Filou", icone: "🎩" },
  ];
  const TYPES_MAISON = {
    mur: { rayon: "murs", places: ["mur"] }, sol: { rayon: "murs", places: ["sol"] },
    vue: { rayon: "murs", places: ["vue"] }, rideaux: { rayon: "murs", places: ["rideaux"] },
    tapis: { rayon: "murs", places: ["tapis"] },
    lit: { rayon: "meubles", places: ["lit"] }, meuble: { rayon: "meubles", places: ["meuble"] },
    lampe: { rayon: "meubles", places: ["lampe"] }, aquarium: { rayon: "meubles", places: ["aquarium"] },
    cadre: { rayon: "deco", places: ["cadre1", "cadre2"] }, objet: { rayon: "deco", places: ["et1", "et2", "et3"] },
    plante: { rayon: "deco", places: ["plante"] }, plafond: { rayon: "deco", places: ["plafond"] },
    jouet: { rayon: "jouets", places: ["jouet1", "jouet2"] },
  };
  const MAISON = [
    // Murs, sols, fenêtre (prix 0 = déjà là au départ)
    { id: "mur_creme", nom: "Mur crème", type: "mur", prix: 0 },
    { id: "mur_pois", nom: "Mur rose à pois", type: "mur", prix: 15 },
    { id: "mur_rayures", nom: "Mur à rayures", type: "mur", prix: 20 },
    { id: "mur_etoiles", nom: "Mur étoilé", type: "mur", prix: 30 },
    { id: "mur_nuages", nom: "Mur des nuages", type: "mur", prix: 40 },
    { id: "mur_poissons", nom: "Mur des poissons", type: "mur", prix: 60 },
    { id: "mur_arcenciel", nom: "Mur arc-en-ciel", type: "mur", prix: 80 },
    { id: "mur_croquettes", nom: "Mur à croquettes", type: "mur", prix: 100 },
    { id: "sol_parquet", nom: "Parquet", type: "sol", prix: 0 },
    { id: "sol_bleu", nom: "Parquet bleu", type: "sol", prix: 20 },
    { id: "sol_damier", nom: "Carrelage damier", type: "sol", prix: 25 },
    { id: "sol_herbe", nom: "Moquette herbe", type: "sol", prix: 30 },
    { id: "sol_marelle", nom: "Sol marelle", type: "sol", prix: 45 },
    { id: "vue_jardin", nom: "Vue sur le jardin", type: "vue", prix: 0 },
    { id: "vue_mer", nom: "Vue sur la mer", type: "vue", prix: 40 },
    { id: "vue_nuit", nom: "Vue de nuit", type: "vue", prix: 50 },
    { id: "vue_montagne", nom: "Vue sur la montagne", type: "vue", prix: 60 },
    { id: "rid_rayes", nom: "Rideaux rayés", type: "rideaux", prix: 15 },
    { id: "rid_fleurs", nom: "Rideaux à fleurs", type: "rideaux", prix: 20 },
    { id: "rid_etoiles", nom: "Rideaux étoilés", type: "rideaux", prix: 30 },
    { id: "rid_theatre", nom: "Rideaux de théâtre", type: "rideaux", prix: 60 },
    { id: "tap_rond", nom: "Tapis rond", type: "tapis", prix: 12 },
    { id: "tap_arcenciel", nom: "Tapis arc-en-ciel", type: "tapis", prix: 35 },
    { id: "tap_etoile", nom: "Tapis étoile", type: "tapis", prix: 40 },
    { id: "tap_souris", nom: "Tapis souris", type: "tapis", prix: 50 },
    // Meubles
    { id: "lit_coussin", nom: "Coussin moelleux", type: "lit", prix: 20 },
    { id: "lit_panier", nom: "Panier en osier", type: "lit", prix: 35 },
    { id: "lit_hamac", nom: "Hamac", type: "lit", prix: 80 },
    { id: "lit_nuage", nom: "Lit nuage", type: "lit", prix: 120 },
    { id: "lit_baldaquin", nom: "Lit à baldaquin", type: "lit", prix: 160 },
    { id: "meu_coffre", nom: "Coffre à jouets", type: "meuble", prix: 45 },
    { id: "meu_fauteuil", nom: "Fauteuil", type: "meuble", prix: 70 },
    { id: "meu_arbre", nom: "Arbre à chat", type: "meuble", prix: 140 },
    { id: "meu_piano", nom: "Piano", type: "meuble", prix: 180 },
    { id: "meu_tipi", nom: "Tipi", type: "meuble", prix: 220 },
    { id: "meu_statue", nom: "Statue de Filou en or", type: "meuble", prix: 400 },
    { id: "lam_champi", nom: "Lampe champignon", type: "lampe", prix: 25 },
    { id: "lam_lampadaire", nom: "Lampadaire", type: "lampe", prix: 35 },
    { id: "lam_lune", nom: "Lampe lune", type: "lampe", prix: 45 },
    { id: "lam_lave", nom: "Lampe à bulles", type: "lampe", prix: 70 },
    { id: "aqu_bocal", nom: "Bocal à poisson", type: "aquarium", prix: 50 },
    { id: "aqu_grand", nom: "Grand aquarium", type: "aquarium", prix: 160 },
    // Déco
    { id: "cad_soleil", nom: "Dessin de soleil", type: "cadre", prix: 10 },
    { id: "cad_arcenciel", nom: "Tableau arc-en-ciel", type: "cadre", prix: 20 },
    { id: "cad_poisson", nom: "Tableau poisson", type: "cadre", prix: 25 },
    { id: "cad_portrait", nom: "Portrait de Filou", type: "cadre", prix: 40 },
    { id: "cad_horloge", nom: "Horloge chat", type: "cadre", prix: 45 },
    { id: "cad_carte", nom: "Carte au trésor", type: "cadre", prix: 55 },
    { id: "cad_diplome", nom: "Diplôme de lecture", type: "cadre", prix: 100 },
    { id: "obj_livres", nom: "Livres", type: "objet", prix: 10 },
    { id: "obj_pot", nom: "Pot de croquettes", type: "objet", prix: 15 },
    { id: "obj_reveil", nom: "Réveil", type: "objet", prix: 20 },
    { id: "obj_bonbons", nom: "Bocal à bonbons", type: "objet", prix: 25 },
    { id: "obj_globe", nom: "Globe", type: "objet", prix: 30 },
    { id: "obj_boule", nom: "Boule à neige", type: "objet", prix: 45 },
    { id: "obj_robot", nom: "Petit robot", type: "objet", prix: 50 },
    { id: "obj_trophee", nom: "Trophée", type: "objet", prix: 80 },
    { id: "pla_cactus", nom: "Cactus", type: "plante", prix: 15 },
    { id: "pla_verte", nom: "Plante verte", type: "plante", prix: 20 },
    { id: "pla_herbe", nom: "Herbe à chat", type: "plante", prix: 25 },
    { id: "pla_tournesol", nom: "Tournesol", type: "plante", prix: 30 },
    { id: "pla_bonsai", nom: "Bonsaï", type: "plante", prix: 60 },
    { id: "haut_fanions", nom: "Guirlande de fanions", type: "plafond", prix: 25 },
    { id: "haut_ballons", nom: "Ballons", type: "plafond", prix: 30 },
    { id: "haut_mobile", nom: "Mobile étoiles", type: "plafond", prix: 35 },
    { id: "haut_lumieres", nom: "Guirlande lumineuse", type: "plafond", prix: 50 },
    { id: "haut_lustre", nom: "Lustre", type: "plafond", prix: 90 },
    // Jouets
    { id: "jou_pelote", nom: "Pelote de laine", type: "jouet", prix: 10 },
    { id: "jou_balle", nom: "Balle à grelot", type: "jouet", prix: 12 },
    { id: "jou_ballon", nom: "Ballon", type: "jouet", prix: 15 },
    { id: "jou_canard", nom: "Canard", type: "jouet", prix: 20 },
    { id: "jou_souris", nom: "Souris mécanique", type: "jouet", prix: 25 },
    { id: "jou_toupie", nom: "Toupie", type: "jouet", prix: 30 },
    { id: "jou_train", nom: "Petit train", type: "jouet", prix: 45 },
  ];

  /* ---------- Phrases de Filou (remplaçables par sons/filou/<clé>.m4a ; variantes : <clé>1, <clé>2…) ---------- */
  const FILOU = {
    bonjour: ["Coucou ! On joue ?", "Miaou-coucou ! Prête à lire ?", "Te revoilà ! Je t'attendais."],
    carte: "Choisis un niveau !",
    bravo: ["Bravo !", "Super !", "Génial !", "Trop fort !", "Bien joué !", "Miam, une croquette !"],
    reessaie: ["Presque ! On réessaie ?", "Hmm… regarde bien. Encore une fois ?"],
    solution: ["Regarde, c'était ça.", "Voilà la réponse. On continue !"],
    rienEntendu: "Je n'ai rien entendu… Lis-le moi à voix haute !",
    finNiveau: ["Niveau réussi ! Je danse !", "Youpi ! Quel talent !"],
    finRate: "On a bien travaillé ! On recommence pour gagner une étoile ?",
    gardien: "Tu as battu le gardien du monde ! C'est la fête !",
    bloque: "Ce niveau est encore fermé. Réussis le niveau d'avant !",
    plafond: "Ce son-là, ta maîtresse va bientôt te l'apprendre ! En attendant, rejoue un niveau ou décore ma maison.",
    pause: "On a beaucoup joué ! Une petite pause ?",
    plafondFin: "Bravo ! Tu sais lire tous les sons vus en classe. Le prochain, ta maîtresse va te le montrer. En attendant, on décore ma maison ?",
    nouveauSon: "Un nouveau son est arrivé ! Viens vite le découvrir !",
    nouvelleCollection: "Une nouvelle collection dans ma maison !",
    maison: "Ma maison ! Touche un objet pour l'essayer.",
    pasAssez: "Il manque des croquettes. On joue encore un peu ?",
    merci: "Merci ! Je suis trop beau !",
    merciMaison: ["Merci ! J'adore !", "Ma maison est trop belle !", "Youpi ! C'est joli !"],
    defi: "Ne confonds pas ! Pose ta main sur ta gorge.",
    auRevoir: "Au revoir ! À bientôt !",
    consignes: {
      trouveLettre: "Écoute, et touche la bonne lettre.",
      jumelles: "Trouve la même lettre, écrite autrement.",
      trouveSyllabe: "Écoute, et touche la bonne syllabe.",
      fabrique: "Fabrique la syllabe !",
      lisTrouve: "Lis le mot dans ta tête, et trouve l'image.",
      disLe: "Lis-moi à voix haute !",
      dictee: "Écris le mot avec les lettres.",
      motManquant: "Quel mot manque ? Lis bien la phrase.",
      confusionEntends: "Écoute bien. Tu entends lequel ?",
      confusionComplete: "Quelle lettre manque ?",
    },
  };

  return { MONDES, NIVEAUX, DEFIS, PRONONCE, INDICES, OUTILS, MOTS, MOTS_SANS_IMAGE, PHRASES, TROUS,
    COLLECTIONS, ACCESSOIRES, RAYONS, TYPES_MAISON, MAISON, FILOU };
})();

if (typeof module !== "undefined") module.exports = FILOU_DATA;

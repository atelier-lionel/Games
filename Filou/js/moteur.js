/* Filou lit — moteur pédagogique (V2)
   - déchiffrabilité : un mot n'apparaît qu'à partir du niveau où toutes ses lettres (et ses groupes pr, bl…) sont connues ;
   - génération des exercices d'un niveau ;
   - jugement indulgent de la lecture à voix haute (clé phonétique simplifiée), suivi de la lecture en cours ;
   - calcul des étoiles. Aucune dépendance au navigateur : testable avec Node. */
"use strict";

var FILOU_MOTEUR = (function () {
  const D = (typeof FILOU_DATA !== "undefined") ? FILOU_DATA : require("./donnees.js");
  const N = D.NIVEAUX;
  const idx = id => N.findIndex(n => n.id === id);

  /* ---------- Lettres, groupes, et niveau où chacun devient connu ---------- */
  const NIVEAU_LETTRE = {}, NIVEAU_GROUPE = {};
  N.forEach((n, i) => n.g.forEach(g => { if (g.length === 1) NIVEAU_LETTRE[g] = i; else NIVEAU_GROUPE[g] = i; }));
  Object.assign(NIVEAU_LETTRE, { "î": idx("i"), "â": idx("a"), "à": idx("a"), "ô": idx("o"), "û": idx("u") });
  const VOYELLES = ["a", "i", "o", "u", "e", "é", "è"];
  const CONSONNES = N.filter(n => n.type === "consonne").map(n => n.g[0]);
  const GROUPES = Object.keys(NIVEAU_GROUPE);
  const VOYELLES_SYLLABE = ["a", "i", "o", "u", "é"];   // voyelles sûres pour la voix du Mac
  // c et g n'existent qu'à l'intérieur des groupes cr, gr, cl, gl : tuiles possibles en dictée, jamais en leurre
  const LETTRES_TUILES = new Set([...VOYELLES, "y", "ê", ...CONSONNES, "c", "g"]);
  const EST_VOYELLE = /[aeiouyéèêëâàîôû]/;
  const PAIRES = { f: "v", v: "f", p: "b", b: "p", t: "d", d: "t" };   // sons voisins, souvent confondus

  function lettresConnues(L) {
    return new Set(Object.keys(NIVEAU_LETTRE).filter(l => NIVEAU_LETTRE[l] <= L));
  }
  const voyellesConnues = L => VOYELLES.filter(v => NIVEAU_LETTRE[v] <= L);
  const consonnesConnues = L => CONSONNES.filter(c => NIVEAU_LETTRE[c] <= L);
  const groupesConnus = L => GROUPES.filter(g => NIVEAU_GROUPE[g] <= L);

  /* ---------- Texte ---------- */
  const sansMuettes = t => t.replace(/\[[^\]]*\]/g, "");
  const brut = t => t.replace(/[\[\]]/g, "");
  const minus = t => t.toLocaleLowerCase("fr-FR");

  /* Consonne + r ou l suivie d'une voyelle (« bra », « ble ») : se lit d'un bloc, demande le niveau du groupe */
  function groupeEn(s, i) {
    const g = s.slice(i, i + 2);
    return NIVEAU_GROUPE[g] !== undefined && EST_VOYELLE.test(s[i + 2] || "") ? g : null;
  }
  /* « e » suivi de deux consonnes (ou d'une consonne finale) se lit è : sel, terre, les… sauf devant un groupe (re-pli, se-cret) */
  function eLuE(s) {
    for (let i = 0; i < s.length; i++) {
      if (s[i] !== "e") continue;
      const a = s[i + 1], b = s[i + 2];
      if (!a || /\s/.test(a) || EST_VOYELLE.test(a)) continue;
      if (b === undefined || /\s/.test(b)) return true;
      if (EST_VOYELLE.test(b)) continue;
      if (groupeEn(s, i + 1)) continue;
      return true;
    }
    return false;
  }

  /* Analyse d'un mot (sans ponctuation) : niveau minimal requis, ou Infinity + raisons */
  function niveauMot(mot) {
    const outil = D.OUTILS[minus(brut(mot))];
    if (outil !== undefined) return { niveau: idx(outil), raisons: [] };
    const s = minus(sansMuettes(mot));
    const raisons = [];
    let niveau = -1;
    for (let i = 0; i < s.length; i++) {
      const g = groupeEn(s, i);
      if (g) { niveau = Math.max(niveau, NIVEAU_GROUPE[g]); i++; continue; }
      const ch = s[i];
      if (!(ch in NIVEAU_LETTRE)) { raisons.push("lettre " + ch); continue; }
      niveau = Math.max(niveau, NIVEAU_LETTRE[ch]);
    }
    // Graphèmes complexes pas encore appris
    const motifs = [
      [/ou|oi|ai|ei|au|eu|œ/, "voyelle double"],
      [/ia|io/, "ia/io"],
      [/[aeiouy][nm](?![aeiouyéèêânm]|$)|[aeiouy][nm]$/, "son nasal"],
    ];
    for (const [re, nom] of motifs) if (re.test(s)) raisons.push(nom);
    if (eLuE(s)) raisons.push("e qui se lit è");
    return { niveau: raisons.length ? Infinity : niveau, raisons };
  }

  /* Analyse d'une phrase : découpe en mots (apostrophes et espaces) */
  function motsDe(phrase) {
    return phrase.replace(/[.,!?;:«»]/g, " ").split(/[\s']+/).filter(Boolean);
  }
  function niveauTexte(texte) {
    let niveau = -1; const raisons = [];
    for (const m of motsDe(texte)) {
      const r = niveauMot(m);
      niveau = Math.max(niveau, r.niveau);
      r.raisons.forEach(x => raisons.push(m + " : " + x));
    }
    return { niveau, raisons };
  }
  const contient = (texte, graphemes) => {
    const s = minus(sansMuettes(texte));
    return graphemes.some(g => s.includes(g));
  };

  /* ---------- Banque de contenu indexée ---------- */
  const MOTS = D.MOTS.map(o => ({ ...o, niveau: niveauMot(o.m).niveau }));
  const MOTS_VOIX = [...MOTS.map(o => ({ t: o.m, e: o.e })), ...D.MOTS_SANS_IMAGE.map(m => ({ t: m, e: "" }))]
    .map(o => ({ ...o, niveau: niveauTexte(o.t).niveau }));
  const PHRASES = D.PHRASES.map(p => ({ t: p, niveau: niveauTexte(p).niveau }));
  const TROUS = D.TROUS.map(o => ({ ...o, niveau: Math.max(niveauTexte(o.t.replace("___", "")).niveau, niveauMot(o.r).niveau) }));
  const DICTEE = MOTS.filter(o => !/\[/.test(o.m) && [...minus(o.m)].every(c => LETTRES_TUILES.has(c)) && o.m.length <= 6);

  /* ---------- Hasard (graine possible pour les tests) ---------- */
  let alea = Math.random;
  function graine(n) { let s = n >>> 0; alea = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const hasard = () => alea();
  const pioche = arr => arr[Math.floor(hasard() * arr.length)];
  function melange(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(hasard() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function autres(pool, exclure, n) { return melange(pool.filter(x => !exclure.includes(x))).slice(0, n); }

  /* Choisit un élément d'une liste, de préférence parmi ceux qui contiennent les graphèmes du niveau */
  function choisir(liste, focus, deja, cle) {
    const libres = liste.filter(o => !deja.has(cle(o)));
    const base = libres.length ? libres : liste;
    if (!base.length) return null;
    const cibles = focus.length ? base.filter(o => contient(cle(o), focus)) : [];
    const o = (cibles.length && hasard() < 0.85) ? pioche(cibles) : pioche(base);
    deja.add(cle(o));
    return o;
  }

  /* ---------- Fabrique d'exercices ---------- */
  const NOM_VOYELLE = { a: "a", i: "i", o: "o", u: "u", e: "eu", é: "é", è: "è", y: "i", ê: "è" };

  function exTrouveLettre(L, focus) {
    const kv = voyellesConnues(L);
    const fv = focus.filter(v => VOYELLES.includes(v));
    const cible = focus.length && hasard() < 0.75 ? pioche(fv.length ? fv : kv) : pioche(kv);
    const pool = kv.length >= 3 ? kv : VOYELLES;
    return { jeu: "trouveLettre", cible, dire: NOM_VOYELLE[cible], options: melange([cible, ...autres(pool, [cible], 2)]) };
  }
  function exJumelles(L, focus) {
    const connues = [...voyellesConnues(L), ...consonnesConnues(L)];
    const simples = focus.filter(g => g.length === 1 && g !== "y" && g !== "ê");
    const cible = simples.length && hasard() < 0.75 ? pioche(simples) : pioche(connues);
    const pool = connues.length >= 3 ? connues : [...VOYELLES, ...CONSONNES];
    const forme = hasard() < 0.5 ? "cursive" : "majuscule";
    return { jeu: "jumelles", cible, forme, options: melange([cible, ...autres(pool, [cible], 2)]) };
  }

  /* Une « attaque » de syllabe : une consonne (« v ») ou un groupe (« vr ») */
  const attaquesConnues = L => [...consonnesConnues(L), ...groupesConnus(L)];
  function syllabesDe(u, L) { return VOYELLES_SYLLABE.filter(v => NIVEAU_LETTRE[v] <= L).map(v => u + v); }
  function choisirAttaque(L, focus, proba = 0.8) {
    const toutes = attaquesConnues(L); if (!toutes.length) return null;
    const f = focus.filter(g => toutes.includes(g));
    if (f.length && hasard() < proba) return pioche(f);
    const simples = consonnesConnues(L);
    return pioche(simples.length ? simples : toutes);
  }
  function exTrouveSyllabe(L, focus) {
    const u = choisirAttaque(L, focus); if (!u) return null;
    const syls = syllabesDe(u, L); if (!syls.length) return null;
    const cible = pioche(syls);
    const v = cible.slice(u.length);
    const toutes = attaquesConnues(L);
    let opts = [cible];
    const ajoute = x => { if (x && !opts.includes(x) && niveauMot(x).niveau <= L) opts.push(x); };
    if (u.length === 2) {
      // Groupe : le leurre clé est la même syllabe sans la lettre accrochée (« ba » pour « bra »)
      if (!"cg".includes(u[0])) ajoute(u[0] + v);
      ajoute(pioche(toutes.filter(g => g.length === 2 && g !== u)) + v);
      ajoute(pioche(syls.filter(x => x !== cible)));
    } else {
      const voisin = PAIRES[u];
      if (voisin && NIVEAU_LETTRE[voisin] <= L && hasard() < 0.5) ajoute(voisin + v);   // f/v, p/b, t/d
      ajoute(pioche(syls.filter(x => x !== cible)));
      ajoute(pioche(consonnesConnues(L).filter(c => c !== u)) + v);
    }
    for (let k = 0; opts.length < 3 && k < 50; k++) ajoute(pioche(toutes) + pioche(VOYELLES_SYLLABE.filter(x => NIVEAU_LETTRE[x] <= L)));
    return { jeu: "trouveSyllabe", cible, dire: cible, options: melange(opts.slice(0, 3)) };
  }
  /* Fabrique : une case par morceau (consonne + voyelle, ou consonne + r/l + voyelle) */
  function exFabrique(L, focus) {
    const u = choisirAttaque(L, focus); if (!u) return null;
    const syls = syllabesDe(u, L); if (!syls.length) return null;
    const cible = pioche(syls);
    const voyelles = VOYELLES_SYLLABE.filter(v => NIVEAU_LETTRE[v] <= L);
    const v = cible.slice(u.length);
    if (u.length === 2) {
      const premieres = [...new Set(groupesConnus(L).filter(g => g[1] === u[1]).map(g => g[0]))];
      const liees = ["r", "l"].filter(x => groupesConnus(L).some(g => g[1] === x));
      return { jeu: "fabrique", cible, dire: cible, morceaux: [u[0], u[1], v], rangees: [
        { nom: "Les consonnes", tuiles: melange([u[0], ...autres(premieres, [u[0]], 3)]) },
        { nom: "Les lettres qui s'accrochent", tuiles: liees },
        { nom: "Les voyelles", tuiles: voyelles, voyelle: true }] };
    }
    const kc = consonnesConnues(L);
    const consonnes = melange([u, ...autres(kc.length > 1 ? kc : CONSONNES.slice(0, 4), [u], 3)]);
    return { jeu: "fabrique", cible, dire: cible, morceaux: [u, v], rangees: [
      { nom: "Les consonnes", tuiles: consonnes }, { nom: "Les voyelles", tuiles: voyelles, voyelle: true }] };
  }
  function exLisTrouve(L, focus, deja) {
    const dispo = MOTS.filter(o => o.niveau <= L); if (!dispo.length) return null;
    const o = choisir(dispo, focus, deja, x => x.m); if (!o) return null;
    const leurres = autres(MOTS.filter(x => x.e !== o.e && x.niveau <= Math.max(L, idx("d"))), [], 2);
    return { jeu: "lisTrouve", mot: o.m, cible: o.e, options: melange([o.e, ...leurres.map(x => x.e)]) };
  }
  function exDisLe(L, focus, deja, phrase) {
    const mots = MOTS_VOIX.filter(o => o.niveau <= L);
    const phrases = PHRASES.filter(o => o.niveau <= L);
    const prendPhrase = phrase !== undefined ? phrase : (phrases.length && hasard() < 0.4);
    if (prendPhrase && phrases.length) {
      const p = choisir(phrases, focus, deja, x => x.t);
      return { jeu: "disLe", texte: p.t, phrase: true, image: "" };
    }
    if (!mots.length) return null;
    const avecImage = mots.filter(o => o.e);
    const o = choisir(avecImage.length && hasard() < 0.8 ? avecImage : mots, focus, deja, x => x.t);
    return { jeu: "disLe", texte: o.t, phrase: false, image: o.e };
  }
  function exDictee(L, focus, deja) {
    const dispo = DICTEE.filter(o => o.niveau <= L); if (!dispo.length) return null;
    const o = choisir(dispo, focus, deja, x => "d:" + x.m); if (!o) return null;
    const lettres = [...minus(o.m)];
    const connues = [...lettresConnues(L)].filter(l => LETTRES_TUILES.has(l));
    const tuiles = melange([...lettres, ...autres(connues, lettres, 2)]);
    return { jeu: "dictee", mot: o.m, image: o.e, lettres, tuiles };
  }
  function exMotManquant(L, focus, deja) {
    const dispo = TROUS.filter(o => o.niveau <= L); if (!dispo.length) return null;
    const o = choisir(dispo, [], deja, x => x.t); if (!o) return null;
    const outils = ["et", "est", "a", "sur", "il", "avec"].filter(m => niveauMot(m).niveau <= L);
    return { jeu: "motManquant", phrase: o.t, cible: o.r, options: melange([o.r, ...autres(outils, [o.r], 2)]) };
  }

  /* ---------- « Ne confonds pas » (défis f/v…) ----------
     entends : Filou dit une syllabe ou un mot, l'enfant touche la lettre entendue ;
     complete : un mot illustré avec une lettre en moins, l'enfant choisit la lettre. */
  /* Position de l'unique lettre de la paire dans un mot (hors muettes), sinon -1 */
  function positionPaire(m, paire) {
    let pos = -1, muette = false;
    for (let i = 0; i < m.length; i++) {
      const c = minus(m[i]);
      if (c === "[") { muette = true; continue; }
      if (c === "]") { muette = false; continue; }
      if (paire.includes(c)) { if (muette || pos >= 0) return -1; pos = i; }
    }
    return pos;
  }
  function exConfusionEntends(L, paire, deja) {
    const voy = VOYELLES_SYLLABE.filter(v => NIVEAU_LETTRE[v] <= L);
    const mots = MOTS.filter(o => o.niveau <= L && positionPaire(o.m, paire) >= 0 && !deja.has("ce:" + o.m));
    if (!mots.length || hasard() < 0.4) {
      const cible = pioche(paire), syl = cible + pioche(voy);
      return { jeu: "confusion", mode: "entends", paire, cible, dire: syl, syllabe: true, options: paire.slice() };
    }
    const o = pioche(mots); deja.add("ce:" + o.m);
    const cible = minus(o.m[positionPaire(o.m, paire)]);
    return { jeu: "confusion", mode: "entends", paire, cible, dire: brut(o.m), image: o.e, options: paire.slice() };
  }
  function exConfusionComplete(L, paire, deja) {
    const mots = MOTS.filter(o => o.niveau <= L && positionPaire(o.m, paire) >= 0);
    if (!mots.length) return null;
    const libres = mots.filter(o => !deja.has("cc:" + o.m));
    // autant de f que de v : on choisit d'abord la lettre
    const lettre = pioche(paire);
    const pool = (libres.length ? libres : mots);
    const avec = pool.filter(o => minus(o.m[positionPaire(o.m, paire)]) === lettre);
    const o = pioche(avec.length ? avec : pool); deja.add("cc:" + o.m);
    const trou = positionPaire(o.m, paire);
    return { jeu: "confusion", mode: "complete", paire, cible: minus(o.m[trou]), mot: o.m, trou, image: o.e, options: paire.slice() };
  }

  const FABRIQUES = {
    trouveLettre: exTrouveLettre, jumelles: exJumelles, trouveSyllabe: exTrouveSyllabe, fabrique: exFabrique,
    lisTrouve: exLisTrouve, disLe: exDisLe, dictee: exDictee, motManquant: exMotManquant,
  };

  /* Recette de chaque type de niveau (dans l'ordre de préférence ; repli si impossible) */
  function recette(niv) {
    switch (niv.type) {
      case "voyelle": return ["trouveLettre", "jumelles", "trouveLettre", "jumelles", "trouveLettre", "jumelles", "trouveLettre", "trouveLettre"];
      case "consonne": return ["jumelles", "trouveSyllabe", "fabrique", "lisTrouve", "trouveSyllabe", "disLe", "fabrique", "dictee"];
      case "groupe": return ["trouveSyllabe", "fabrique", "lisTrouve", "trouveSyllabe", "disLe", "fabrique", "dictee", "disLe:phrase"];
      case "outil": return ["motManquant", "disLe:phrase", "lisTrouve", "motManquant", "trouveSyllabe", "disLe:phrase", "motManquant", "dictee"];
      case "revision":
        if (niv.monde === 1) return ["trouveLettre", "jumelles", "trouveLettre", "jumelles", "trouveLettre", "jumelles", "trouveLettre", "jumelles", "trouveLettre", "jumelles"];
        return ["trouveSyllabe", "lisTrouve", "fabrique", "disLe", "dictee", "motManquant", "lisTrouve", "disLe:phrase", "trouveSyllabe", "dictee"];
    }
    return [];
  }
  const REPLIS = ["trouveSyllabe", "fabrique", "jumelles", "trouveLettre"];

  /* Graphèmes travaillés : ceux de la leçon, ou ceux du monde pour une révision */
  function focusDe(L) {
    const niv = N[L];
    if (niv.type === "outil") return niv.outils.slice();
    if (niv.type !== "revision") return niv.g.slice();
    return N.filter((n, i) => n.monde === niv.monde && i < L).flatMap(n => n.g);
  }

  /* options : { voix: bool } — sans voix, « Dis-le » devient « Lis et trouve » */
  function genererNiveau(L, options = {}) {
    const niv = N[L];
    const deja = new Set();
    let focusBase = focusDe(L);
    const exos = [];
    for (let etape of recette(niv)) {
      let phrase;
      if (etape === "disLe:phrase") { etape = "disLe"; phrase = true; }
      if (etape === "disLe" && options.voix === false) etape = "lisTrouve";
      // Révision : chaque exercice travaille un graphème du monde tiré au hasard
      const focus = niv.type === "revision" && focusBase.length ? [pioche(focusBase.filter(g => g !== "y" && g !== "ê"))] : focusBase;
      let ex = FABRIQUES[etape](L, focus, deja, phrase);
      for (let k = 0; !ex && k < REPLIS.length; k++) ex = FABRIQUES[REPLIS[k]](L, focus, deja);
      if (ex) exos.push(ex);
    }
    return espacer(exos);
  }
  /* Défi « Ne confonds pas » : L = niveau atteint par l'enfant (le contenu ne le dépasse jamais) */
  function genererDefi(defi, L) {
    const deja = new Set(), p = defi.paire, exos = [];
    const etapes = ["entends", "complete", "syllabe", "entends", "complete", "entends", "syllabe", "complete"];
    for (const e of etapes) {
      let ex = null;
      if (e === "entends") ex = exConfusionEntends(L, p, deja);
      else if (e === "complete") ex = exConfusionComplete(L, p, deja);
      else { for (let k = 0; k < 20 && (!ex || !p.includes(ex.cible[0])); k++) ex = exTrouveSyllabe(L, [pioche(p)]); if (ex && !ex.options.some(o => o[0] === (ex.cible[0] === p[0] ? p[1] : p[0]))) ex.options[ex.options.indexOf(ex.options.find(o => o !== ex.cible))] = (ex.cible[0] === p[0] ? p[1] : p[0]) + ex.cible.slice(1); }
      if (!ex) ex = exConfusionEntends(L, p, deja);
      if (ex.jeu === "confusion") ex.aide = defi.aide;
      exos.push(ex);
    }
    return espacer(exos);
  }
  /* Évite deux exercices du même jeu à la suite quand c'est possible */
  function espacer(exos) {
    const res = []; const reste = exos.slice();
    const sorte = e => e.jeu + (e.mode || "");
    while (reste.length) {
      const prec = res.length ? sorte(res[res.length - 1]) : null;
      let i = reste.findIndex(e => sorte(e) !== prec);
      if (i < 0) i = 0;
      res.push(reste.splice(i, 1)[0]);
    }
    return res;
  }

  /* ---------- Jugement de la lecture à voix haute ---------- */
  function cle(t) {
    let s = minus(t).normalize("NFD").replace(/[̀-ͯ]/g, "");
    s = s.replace(/[^a-z' ]/g, " ").replace(/'/g, " ");
    s = s.replace(/ph/g, "f").replace(/qu/g, "k").replace(/c(?=[aou])/g, "k").replace(/h/g, "")
         .replace(/eau|au/g, "o").replace(/ai|ei/g, "e").replace(/y/g, "i");
    s = s.split(/\s+/).filter(Boolean).map(m => {
      m = m.replace(/(er|ez|et)$/, "e").replace(/([bcdfgklmnprstvz])\1/g, "$1");
      // finales souvent muettes ou avalées ; on garde au moins 2 lettres (« épée » → « ep », pas « »)
      if (m.length > 2) { const r = m.replace(/[stdxzpe]+$/, ""); m = r.length >= 2 ? r : m.slice(0, 2); }
      return m;
    }).join(" ");
    return s.trim();
  }
  function distance(a, b) {
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  /* Clés d'une transcription : par mots, collée, et recalculée après collage (« À ne » → « âne ») */
  function cles(e) {
    const k = cle(e);
    return { k, mots: k.split(" ").filter(Boolean), kk: k.replace(/ /g, ""), kj: cle(e.replace(/[\s'’-]+/g, "")) };
  }
  /* Mots courts (clé de 3 lettres au plus) : on accepte une lettre en plus ou en moins à la fin
     (« Ah » pour âne, « Lis » pour lire), la reconnaissance vocale les rogne souvent. */
  function procheCourt(x, kc) {
    if (!x) return false;
    if (x === kc) return true;
    if (kc.startsWith(x) && kc.length - x.length <= 1) return true;
    if (x.startsWith(kc) && x.length - kc.length <= 1) return true;
    return false;
  }
  /* cible : texte attendu (avec muettes entre crochets) ; entendus : transcriptions proposées */
  function jugerLecture(cible, entendus, phrase) {
    const kc = cle(sansMuettes(cible)).replace(/ /g, "");
    for (const e of entendus) {
      if (!e) continue;
      const c = cles(e); if (!c.kk) continue;
      if (phrase) {
        const tol = Math.max(2, Math.round(kc.length * 0.2));
        if (distance(c.kk, kc) <= tol || distance(c.kj, kc) <= tol) return true;
        continue;
      }
      if (c.kk === kc || c.kj === kc || c.mots.includes(kc)) return true;
      if (kc.length >= 4 && (distance(c.kk, kc) <= 1 || c.mots.some(m => distance(m, kc) <= 1))) return true;
      if (kc.length <= 3 && (procheCourt(c.kk, kc) || procheCourt(c.kj, kc) || c.mots.some(m => procheCourt(m, kc)))) return true;
    }
    return false;
  }
  /* Où en est la lecture ? mots : nombre de mots du texte déjà reconnus (dans l'ordre) ;
     debut : ce qui a été entendu est le début, encore incomplet, du texte attendu → Filou attend la suite. */
  function progressionLecture(cible, entendus) {
    const unites = sansMuettes(cible).split(/\s+/).filter(Boolean);
    const keys = unites.map(u => cle(u).replace(/ /g, ""));
    const kc = keys.join("");
    let mieux = { mots: 0, total: unites.length, debut: false };
    for (const e of [].concat(entendus)) {
      if (!e) continue;
      const kk = cle(e).replace(/ /g, ""); if (!kk) continue;
      const tol = n => n < 3 ? 0 : n < 6 ? 1 : Math.round(n * 0.25);
      let mots = 0, pref = "";
      for (let i = 0; i < keys.length; i++) {
        pref += keys[i];
        // le mot i n'est compté que s'il a été entendu presque en entier
        if (kk.length < pref.length - Math.floor(keys[i].length / 3)) break;
        if (distance(pref, kk.slice(0, pref.length)) <= tol(pref.length)) mots = i + 1;
      }
      const tolDebut = n => n < 5 ? 0 : n < 9 ? 1 : Math.round(n * 0.15);
      const debut = kk.length < kc.length * 0.9 && distance(kk, kc.slice(0, kk.length)) <= tolDebut(kk.length);
      if (mots > mieux.mots || (debut && !mieux.debut)) mieux = { mots: Math.max(mots, mieux.mots), total: unites.length, debut: debut || mieux.debut };
    }
    return mieux;
  }

  /* ---------- Score ---------- */
  function etoiles(points, total) {
    const r = total ? points / total : 0;
    return r >= 0.9 ? 3 : r >= 0.7 ? 2 : r >= 0.5 ? 1 : 0;
  }

  return {
    NIVEAUX: N, idx, niveauMot, niveauTexte, motsDe, sansMuettes, brut, contient, lettresConnues,
    voyellesConnues, consonnesConnues, groupesConnus, MOTS, MOTS_VOIX, PHRASES, TROUS, DICTEE, genererNiveau,
    genererDefi, graine, melange, pioche, cle, distance, jugerLecture, progressionLecture, etoiles, NOM_VOYELLE,
    VOYELLES, CONSONNES, GROUPES, PAIRES, positionPaire,
  };
})();

if (typeof module !== "undefined") module.exports = FILOU_MOTEUR;

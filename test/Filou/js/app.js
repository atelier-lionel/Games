/* Filou lit — application : écrans, carte des mondes, déroulé d'un niveau, défis, maison de Filou, espace parent (V2) */
"use strict";

(function () {
  const VERSION = "V2";
  const D = FILOU_DATA, M = FILOU_MOTEUR, N = D.NIVEAUX, MD = MAISON_DESSINS;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = JEUX.esc, attendre = JEUX.attendre;

  /* ---------- État sauvegardé dans le navigateur ----------
     Même clé et même format qu'en V1 (la progression déjà enregistrée est conservée) ; champs V2 ajoutés. */
  // Version test (adresse contenant /test/) : clé séparée, pour ne pas écraser la progression de la référence.
  const CLE = location.pathname.includes("/test/") ? "filou-lit-v1-test" : "filou-lit-v1";
  const MAISON_DEPART = { mur: "mur_creme", sol: "sol_parquet", vue: "vue_jardin" };
  function etatParDefaut() {
    return {
      version: 1, prenom: "", depart: "s", plafond: "v", maxOuvert: M.idx("s"),
      niveaux: {}, croquettes: 0, possede: [], porte: {},
      maison: { possede: Object.values(MAISON_DEPART), place: Object.assign({}, MAISON_DEPART) },
      plafondVu: null, collectionsVues: [1],
      reglages: { voix: "", voixFilou: "", vitesse: 0.85, hauteur: 1.15, sons: true, ecoute: true },
      erreurs: {}, rates: [], lectures: [], temps: {},
    };
  }
  let etat = etatParDefaut();
  try {
    const s = JSON.parse(localStorage.getItem(CLE));
    if (s && s.version === 1) {
      etat = Object.assign(etatParDefaut(), s);
      etat.reglages = Object.assign(etatParDefaut().reglages, s.reglages || {});
      const m = etat.maison || {};
      etat.maison = { possede: [...new Set([...(m.possede || []), ...Object.values(MAISON_DEPART)])], place: Object.assign({}, MAISON_DEPART, m.place || {}) };
    }
  } catch (e) {}
  function sauver() { try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) {} }
  VOIX.regler(etat.reglages);

  const plafondIdx = () => etat.plafond ? Math.max(0, M.idx(etat.plafond)) : N.length - 1;
  function statut(i) {
    if (i > etat.maxOuvert) return "ferme";
    if (i > plafondIdx()) return "plafond";
    const r = etat.niveaux[N[i].id];
    if (r && r.etoiles > 0) return "fait";
    return i === Math.min(etat.maxOuvert, plafondIdx()) ? "actuel" : "ouvert";
  }
  const niveauActuel = () => Math.min(etat.maxOuvert, plafondIdx());
  /* Un défi s'ouvre quand le niveau « apres » est réussi (et sous le plafond) */
  const defiOuvert = d => M.idx(d.apres) < etat.maxOuvert && M.idx(d.apres) <= plafondIdx();
  const niveauDefi = d => Math.max(M.idx(d.apres), Math.min(etat.maxOuvert - 1, plafondIdx()));
  /* Une collection d'accessoires s'ouvre avec le premier niveau de son monde */
  const collectionOuverte = n => { const i = N.findIndex(x => x.monde === n); return i >= 0 && i <= niveauActuel(); };
  if (etat.plafondVu === null) { etat.plafondVu = etat.plafond; sauver(); }

  /* ---------- Filou ---------- */
  function dessinerFilous(porte) {
    $$("svg.filou").forEach(svg => {
      if (!svg.dataset.pret) { svg.setAttribute("viewBox", DESSINS.VIEWBOX_FILOU); svg.innerHTML = DESSINS.filou(); svg.dataset.pret = "1"; }
      DESSINS.habiller(svg, porte || etat.porte);
    });
  }
  VOIX.surParle(on => $$("svg.filou").forEach(f => f.classList.toggle("parle", on)));
  function anim(nom) {
    $$("svg.filou").forEach(f => {
      f.classList.remove("ronron", "penche", "danse", "mange");
      void f.getBoundingClientRect();
      f.classList.add(nom);
      f.addEventListener("animationend", function fin(e) { if (e.target === f) { f.classList.remove(nom); f.removeEventListener("animationend", fin); } });
    });
  }
  function bulle(t) { $("#bulle").textContent = t; $("#bulle-maison").textContent = t; }
  const avecPrenom = t => etat.prenom ? t.replace(/^(Coucou|Bravo|Super|Génial|Youpi)( !| )/, `$1 ${etat.prenom}$2`) : t;
  /* Filou dit une phrase (variantes tirées au hasard ; enregistrement sons/filou/<clé>.m4a s'il existe) */
  function direCle(cle) {
    const v = D.FILOU[cle];
    if (Array.isArray(v)) { const i = Math.floor(Math.random() * v.length); return dire(avecPrenom(v[i]), cle + (i + 1)); }
    return dire(avecPrenom(v), cle);
  }
  function dire(texte, fichier) { bulle(texte); return VOIX.filou(texte, fichier); }

  /* ---------- Croquettes ---------- */
  function majCroquettes() { $$(".nb-croq").forEach(e => e.textContent = etat.croquettes); }
  function voler(depuis) {
    const cible = $$(".compteur-croq").find(e => e.offsetParent !== null);
    if (!depuis || !cible) return;
    const a = depuis.getBoundingClientRect(), b = cible.getBoundingClientRect();
    const v = document.createElement("div"); v.className = "vol"; v.innerHTML = DESSINS.croquette();
    v.style.left = (a.left + a.width / 2 - 20) + "px"; v.style.top = (a.top + a.height / 2 - 20) + "px";
    document.body.appendChild(v);
    requestAnimationFrame(() => requestAnimationFrame(() => { v.style.transform = `translate(${b.left + b.width / 2 - a.left - a.width / 2}px, ${b.top + b.height / 2 - a.top - a.height / 2}px) scale(.6)`; }));
    setTimeout(() => { v.remove(); cible.classList.remove("saute"); void cible.offsetWidth; cible.classList.add("saute"); VOIX.son("croque"); }, 800);
  }
  function gagner(n, depuis) { etat.croquettes += n; sauver(); voler(depuis); setTimeout(majCroquettes, 800); }

  /* ---------- Écrans ---------- */
  let ecranCourant = "accueil";
  function montrer(nom) {
    ["accueil", "carte", "exo", "maison"].forEach(e => $("#ecran-" + e).hidden = e !== nom);
    $("#coin").hidden = !(nom === "carte" || nom === "exo");
    ecranCourant = nom;
    majCroquettes(); dessinerFilous(); majBadgeMaison();
  }
  let jeton = 0;                     // change quand on quitte un niveau : les exercices en cours s'arrêtent
  function interrompre() { jeton++; VOIX.stop(); VOIX.arreterEcoute(); }

  /* ---------- Accueil ---------- */
  $("#accueil-decor").innerHTML = DESSINS.decor("jardin");
  // Version test (adresse /test/) : un tampon « TEST » sur l'accueil, pour ne pas la confondre avec la référence.
  if (location.pathname.includes("/test/")) {
    const tampon = document.createElement("div");
    tampon.className = "tampon-test";
    tampon.textContent = "TEST";
    $("#ecran-accueil").appendChild(tampon);
  }
  $("#btn-jouer").onclick = () => {
    VOIX.deverrouiller(); VOIX.contexte(); VOIX.son("pop");
    allerCarte(N[niveauActuel()].monde, true);
  };

  /* ---------- Carte des mondes ---------- */
  let mondeAffiche = 1, dernierRappel = Date.now();
  /* Annonces à l'arrivée sur la carte : nouveau son (plafond avancé), nouvelle collection */
  function nouveautes() {
    const vu = etat.plafondVu ? M.idx(etat.plafondVu) : N.length - 1;
    const nouveau = plafondIdx() > vu && etat.maxOuvert > vu;
    etat.plafondVu = etat.plafond; sauver();
    return nouveau;
  }
  function allerCarte(monde, accueil) {
    interrompre();
    const nouveau = nouveautes();
    if (nouveau) monde = N[niveauActuel()].monde;
    mondeAffiche = monde || mondeAffiche;
    dessinerCarte(nouveau);
    montrer("carte");
    if (nouveau) { anim("danse"); VOIX.son("fanfare"); direCle("nouveauSon"); return; }
    const collec = D.COLLECTIONS.find(c => collectionOuverte(c.monde) && !etat.collectionsVues.includes(c.monde));
    if (collec) { anim("ronron"); direCle("nouvelleCollection"); return; }
    if (accueil) { anim("ronron"); direCle("bonjour"); return; }
    if (Date.now() - dernierRappel > 12 * 60 * 1000) { dernierRappel = Date.now(); direCle("pause"); }
    else bulle(D.FILOU.carte);
  }
  function chemin(points) {
    let d = `M${points[0][0]} ${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i], p1 = points[i], p2 = points[i + 1], p3 = points[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
    }
    return d;
  }
  function etoilesMini(n, x, y) {
    let s = "";
    for (let k = 0; k < 3; k++) {
      const cx = x - 26 + k * 26;
      s += `<path transform="translate(${cx} ${y}) scale(.2) translate(-50 -48)" d="M50 4 L62 36 L96 37 L69 58 L79 92 L50 72 L21 92 L31 58 L4 37 L38 36 Z" fill="${k < n ? "#F5B931" : "#FFFFFF"}" stroke="${k < n ? "#C98A10" : "#B9C6C3"}" stroke-width="8"/>`;
    }
    return s;
  }
  const EMOJI = `font-family="Apple Color Emoji, sans-serif"`;
  function dessinerCarte(nouveau) {
    const monde = D.MONDES[mondeAffiche - 1];
    $("#carte-decor").innerHTML = DESSINS.decor(monde.decor);
    $("#carte-titre").textContent = `Monde ${monde.n} · ${monde.nom}`;
    const ids = N.map((n, i) => i).filter(i => N[i].monde === mondeAffiche);
    const n = ids.length;
    // Paysage : chemin horizontal ; portrait (iPad debout) : chemin vertical
    const portrait = window.innerHeight > window.innerWidth * 1.05;
    const [W, H] = portrait ? [600, 1000] : [1000, 600];
    const pts = portrait
      ? ids.map((_, k) => [Math.round(300 + 170 * Math.sin(k * 1.15 + 0.3)), Math.round(100 + k * (690 / (n - 1)))])
      : ids.map((_, k) => [Math.round(110 + k * (780 / (n - 1))), Math.round(330 + 105 * Math.sin(k * 0.95 + 0.5))]);
    let svg = `<path d="${chemin(pts)}" stroke="rgba(255,255,255,.85)" stroke-width="22" fill="none" stroke-linecap="round"/>
      <path d="${chemin(pts)}" stroke="#E7C79A" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="2 22"/>`;
    // Défis « Ne confonds pas » : médaillons à côté du chemin
    D.DEFIS.filter(d => d.monde === mondeAffiche).forEach(d => {
      const k = ids.indexOf(M.idx(d.apres)); if (k < 0) return;
      const [x0, y0] = pts[k];
      const [x, y] = portrait ? [x0 + (x0 > 300 ? -170 : 170), y0 + 20] : [x0 - 40, y0 + (y0 > 330 ? -185 : 185)];
      const ouvert = defiOuvert(d), nb = (etat.niveaux[d.id] || {}).etoiles || 0;
      svg += `<path d="M${x0} ${y0} L${x} ${y}" stroke="rgba(255,255,255,.7)" stroke-width="6" stroke-dasharray="4 10" stroke-linecap="round"/>
      <g class="noeud defi ${ouvert ? "ouvert" : "ferme"}" data-defi="${d.id}" role="button" tabindex="0" aria-label="${esc(d.nom)}">
        <g class="pierre"><path d="M${x} ${y - 50} L${x + 46} ${y - 24} L${x + 46} ${y + 24} L${x} ${y + 50} L${x - 46} ${y + 24} L${x - 46} ${y - 24} Z" fill="${ouvert ? "#FFF3C4" : "#DDE5E3"}" stroke="${ouvert ? "#C98A10" : "#B9C6C3"}" stroke-width="5" stroke-linejoin="round"/>
        <text x="${x}" y="${y + 12}" text-anchor="middle" font-size="34" font-family="Andika Filou, sans-serif" fill="${ouvert ? "#D7362C" : "#9AAAA7"}">${esc(d.paire.join(" "))}</text></g>
        <text x="${x}" y="${y - 58}" text-anchor="middle" font-size="20" font-weight="800" font-family="Baloo Filou, sans-serif" fill="#5a3b00" stroke="#fff" stroke-width="5" paint-order="stroke">Défi</text>
        ${ouvert ? etoilesMini(nb, x, y + 66) : `<text x="${x + 34}" y="${y - 28}" font-size="24" text-anchor="middle" ${EMOJI}>🔒</text>`}
      </g>`;
    });
    let premierPlafond = true;
    ids.forEach((i, k) => {
      const niv = N[i], st = statut(i), [x, y] = pts[k], rev = niv.type === "revision";
      const r = rev ? 54 : 46;
      const nb = (etat.niveaux[niv.id] || {}).etoiles || 0;
      const fond = st === "ferme" ? "#DDE5E3" : rev ? "#FFE7A3" : "#FFFDF8";
      const bord = st === "actuel" ? "#1E6E6A" : st === "fait" ? "#F5B931" : rev ? "#C98A10" : "#B9C6C3";
      const taille = niv.titre.length > 3 ? (rev ? 0 : 27) : niv.titre.length > 1 ? 34 : 46;
      const label = rev ? `<text x="${x}" y="${y + 16}" text-anchor="middle" font-size="46" ${EMOJI}>🏰</text>`
        : `<text x="${x}" y="${y + taille * 0.34}" text-anchor="middle" font-size="${taille}" font-family="Andika Filou, sans-serif" fill="${st === "ferme" ? "#9AAAA7" : "#D7362C"}">${esc(niv.titre)}</text>`;
      const icone = st === "ferme" ? `<text x="${x + r - 12}" y="${y - r + 18}" font-size="28" text-anchor="middle" ${EMOJI}>🔒</text>`
        : st === "plafond" ? `<text x="${x + r - 12}" y="${y - r + 18}" font-size="28" text-anchor="middle" ${EMOJI}>🏫</text>` : "";
      // Panneau devant le premier niveau au-delà du plafond : la suite s'apprend d'abord en classe
      const panneau = st === "plafond" && premierPlafond ? `<g class="panneau-plafond" transform="translate(${x} ${portrait ? y + r + 92 : y - r - 64})"><path d="M0 ${portrait ? -44 : 0} V${portrait ? 0 : 44}" stroke="#8A5328" stroke-width="6"/><rect x="-84" y="-30" width="168" height="40" rx="10" fill="#FFFDF8" stroke="#8A5328" stroke-width="4"/><text y="-3" text-anchor="middle" font-size="18" font-weight="800" font-family="Baloo Filou, sans-serif" fill="#8A5328">Bientôt en classe</text></g>` : "";
      if (st === "plafond") premierPlafond = false;
      const brille = nouveau && st === "actuel";
      svg += `<g class="noeud ${st}${brille ? " nouveau" : ""}" data-i="${i}" role="button" tabindex="0" aria-label="Niveau ${esc(niv.nom || niv.titre)}${st === "ferme" ? " (fermé)" : ""}">
        ${st === "actuel" ? `<circle class="halo" cx="${x}" cy="${y}" r="${r + 14}" fill="#FFFFFF" opacity=".6"/>` : ""}
        <g class="pierre"><ellipse cx="${x}" cy="${y + 8}" rx="${r}" ry="${r * 0.92}" fill="rgba(0,0,0,.18)"/>
        <circle cx="${x}" cy="${y}" r="${r}" fill="${fond}" stroke="${bord}" stroke-width="${st === "actuel" ? 7 : 5}"/>${label}</g>
        ${icone}${panneau}
        ${rev ? `<text x="${x}" y="${y + r + 30}" text-anchor="middle" font-size="22" font-weight="800" font-family="Baloo Filou, sans-serif" fill="#5a3b00" stroke="#fff" stroke-width="5" paint-order="stroke">Gardien</text>` : ""}
        ${st !== "ferme" ? etoilesMini(nb, x, y + r + (rev ? 52 : 18)) : ""}
        ${st === "actuel" ? `<text x="${x}" y="${y - r - 14}" text-anchor="middle" font-size="34" ${EMOJI}>${brille ? "✨" : "🐾"}</text>` : ""}
      </g>`;
    });
    const zone = $("#carte-zone");
    zone.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${svg}</svg>`;
    zone.querySelectorAll(".noeud").forEach(g => {
      const ouvrir = () => g.dataset.defi ? cliquerDefi(g.dataset.defi) : cliquerNiveau(+g.dataset.i);
      g.addEventListener("click", ouvrir);
      g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ouvrir(); } });
    });
    $("#monde-prec").hidden = mondeAffiche <= 1;
    $("#monde-suiv").hidden = mondeAffiche >= D.MONDES.length;
    $("#ecran-carte").dataset.monde = monde.decor;
  }
  let orientation = null;
  window.addEventListener("resize", () => {
    const o = window.innerHeight > window.innerWidth * 1.05;
    if (o !== orientation && ecranCourant === "carte") dessinerCarte();
    orientation = o;
  });
  $("#monde-prec").onclick = () => { VOIX.son("pop"); mondeAffiche--; dessinerCarte(); bulle(D.MONDES[mondeAffiche - 1].nom); };
  $("#monde-suiv").onclick = () => { VOIX.son("pop"); mondeAffiche++; dessinerCarte(); bulle(D.MONDES[mondeAffiche - 1].nom); };
  function cliquerNiveau(i) {
    const st = statut(i);
    if (st === "ferme") { VOIX.son("faux"); anim("penche"); direCle("bloque"); return; }
    if (st === "plafond") { VOIX.son("faux"); anim("penche"); direCle("plafond"); return; }
    VOIX.son("pop");
    jouerNiveau(i);
  }
  function cliquerDefi(id) {
    const d = D.DEFIS.find(x => x.id === id);
    if (!defiOuvert(d)) { VOIX.son("faux"); anim("penche"); dire(`Ce défi s'ouvre quand tu as réussi le niveau ${d.apres}.`, null); return; }
    VOIX.son("pop");
    jouerDefi(d);
  }

  /* ---------- Déroulé d'un niveau ---------- */
  async function introduction(niv, table) {
    let html = "", texte = "", sonLettre = null;
    if (niv.type === "voyelle" || niv.type === "consonne") {
      const g = niv.g[0]; sonLettre = g;
      html = `<h2 class="lecon-titre">${niv.type === "voyelle" ? "Une voyelle" : "Un nouveau son"}</h2>
        <div class="lecon"><div><b>${esc(g)}</b><span>script</span></div><div><b class="cursive">${esc(g)}</b><span>attaché</span></div><div><b>${esc(g.toLocaleUpperCase("fr"))}</b><span>majuscule</span></div></div>`;
      texte = niv.type === "voyelle"
        ? `Voici un son qui chante : ${niv.dire} ! Comme dans ${niv.exemple}.`
        : `Voici un nouveau son ! ${D.INDICES[g]} Comme au début de ${niv.exemple}.`;
    } else if (niv.type === "groupe") {
      const ex = niv.g[0];
      html = `<h2 class="lecon-titre">Deux lettres qui se tiennent la main</h2>
        <div class="accroche"><b class="rouge">${esc(ex[0])}</b><span class="main">🤝</span><b class="rouge">${esc(ex[1])}</b><span class="egal">→</span><b class="rouge">${esc(ex)}</b><span class="plus">+ a →</span><b><span class="rouge">${esc(ex)}</span>a</b></div>
        <div class="groupes">${niv.g.map(g => `<span class="rouge">${esc(g)}</span>`).join("")}</div>`;
      texte = `Quand le ${niv.lie === "r" ? "r" : "l"} s'accroche à une consonne, on les lit ensemble, d'un seul coup ! Écoute : ${niv.syllabes.join(", ")}.`;
    } else if (niv.type === "outil") {
      html = `<h2 class="lecon-titre">Deux petits mots</h2><div class="lecon"><div><b>et</b><span>Léa et Rémi</span></div><div><b>est</b><span>Rémi est là</span></div></div>`;
      texte = "Deux petits mots à bien regarder : et, comme dans Léa et Rémi. Et est, comme dans Rémi est là.";
    } else if (niv.type === "defi") {
      const [a, b] = niv.paire;
      html = `<h2 class="lecon-titre">Ne confonds pas !</h2>
        <div class="lecon defi-lecon"><div><b>${esc(a)}</b><span>🌬️ ${esc(niv.aide[a])} : rien ne bouge</span></div><div><b>${esc(b)}</b><span>🐝 ${esc(niv.aide[b])} : ça chatouille</span></div></div>
        <div class="gorge">✋ Pose ta main sur ta gorge</div>`;
      // On ne dit jamais le nom des lettres (« èfe ») : on passe par un mot exemple
      const ea = niv.exemples[a], eb = niv.exemples[b];
      texte = `Ne confonds pas le début de ${ea} et le début de ${eb} ! Pose ta main sur ta gorge. Pour ${ea}, on souffle : rien ne bouge. Pour ${eb}, la voix chante : ça vibre sous ta main !`;
    } else {
      const lettres = N.filter(n => n.monde === niv.monde && n.g.length).flatMap(n => n.type === "groupe" ? [n.g[0] + "…"] : [n.g[0]]);
      html = `<h2 class="lecon-titre">Le gardien du monde</h2><div style="font-size:90px;line-height:1">🏰</div>
        <div class="a-lire phrase">${lettres.map(l => `<span class="rouge">${esc(l)}</span>`).join(" ")}</div>`;
      texte = "Le gardien du monde ! Montre-lui tout ce que tu sais.";
    }
    table.innerHTML = html + `<div class="boutons"><button class="haut-parleur" id="intro-ecouter" aria-label="Réécouter">🔊</button><button class="btn gros" id="intro-go">C'est parti !</button></div>`;
    const jouerIntro = async () => {
      await dire(texte, "intro_" + niv.id);
      if (sonLettre) await VOIX.lettre(sonLettre);
    };
    $("#intro-ecouter").onclick = () => { VOIX.son("pop"); jouerIntro(); };
    const go = new Promise(r => $("#intro-go").onclick = () => { VOIX.son("pop"); VOIX.stop(); r(); });
    jouerIntro();
    return go;
  }

  function jouerNiveau(i) {
    const niv = N[i];
    const ecouteActive = etat.reglages.ecoute && VOIX.recoDispo;
    const focus = niv.type === "outil" ? niv.outils : niv.type === "revision" ? [] : niv.g;
    derouler(niv, M.genererNiveau(i, { voix: ecouteActive }), focus, (pts, total) => terminerNiveau(i, pts, total));
  }
  function jouerDefi(d) {
    const niv = Object.assign({ type: "defi" }, d);
    derouler(niv, M.genererDefi(d, niveauDefi(d)), d.paire, (pts, total) => terminerDefi(d, pts, total));
  }
  async function derouler(niv, exos, focus, fin) {
    interrompre();
    const monJeton = jeton;
    mondeAffiche = niv.monde;
    const ecouteActive = etat.reglages.ecoute && VOIX.recoDispo;
    $("#exo-decor").innerHTML = DESSINS.decor(D.MONDES[niv.monde - 1].decor);
    const prog = $("#progression");
    prog.innerHTML = exos.map(() => "<i></i>").join("");
    montrer("exo");
    const table = $("#table");
    await introduction(niv, table);
    if (jeton !== monJeton) return;

    let points = 0, exCourant = null;
    const ui = {
      table, focus, ecouteActive,
      annule: () => jeton !== monJeton,
      bulle,
      dire: (t, f) => jeton === monJeton ? dire(t, f) : Promise.resolve(),
      lire: (t, o) => jeton === monJeton ? VOIX.parler(t, o) : Promise.resolve(),
      lireSyllabe: s => jeton === monJeton ? VOIX.syllabe(s, D.PRONONCE) : Promise.resolve(),
      lireSon: async (g, texte) => { if (jeton !== monJeton) return; if (!(await VOIX.lettre(g))) await VOIX.parler(texte); },
      bravo: async (depuis) => {
        if (jeton !== monJeton) return;
        VOIX.son("bon"); anim("ronron"); gagner(1, depuis);
        await direCle("bravo"); await attendre(250);
      },
      rate: async () => { if (jeton !== monJeton) return; VOIX.son("faux"); anim("penche"); await direCle("reessaie"); },
      solution: async (montrer) => { if (jeton !== monJeton) return; anim("penche"); await direCle("solution"); if (montrer) await montrer(); await attendre(700); },
      noterErreur: choisi => noterErreur(niv, exCourant, choisi),
      noterLecture: (texte, r) => { etat.lectures.unshift({ d: new Date().toISOString().slice(0, 16), n: niv.id, t: M.brut(texte), e: r.texte || "", r: r.etat }); etat.lectures = etat.lectures.slice(0, 40); sauver(); },
    };
    for (let k = 0; k < exos.length; k++) {
      exCourant = exos[k];
      prog.children[k].className = "encours";
      window.__exo = exos[k];   // pour les tests automatiques
      const pts = await JEUX.jouer(exos[k], ui);
      if (jeton !== monJeton) return;
      points += pts;
      prog.children[k].className = pts >= 1 ? "fait" : pts > 0 ? "moyen" : "rate";
      await attendre(350);
    }
    fin(points, exos.length);
  }
  /* Journal des erreurs : ce qui était demandé (q) et ce que l'enfant a choisi ou fabriqué (x) */
  function noterErreur(niv, ex, choisi) {
    if (!ex) return;
    const quoi = M.brut(ex.mot || ex.texte || ex.cible || "");
    etat.erreurs[niv.id] = (etat.erreurs[niv.id] || 0) + 1;
    etat.rates.unshift({ d: new Date().toISOString().slice(0, 16), n: niv.id, j: ex.jeu, q: quoi, x: choisi ? String(choisi).slice(0, 40) : "" });
    etat.rates = etat.rates.slice(0, 60);
    sauver();
  }
  /* Confusions entre sons voisins repérées dans le journal (ex. demandé « vo », fabriqué « fo ») */
  function confusions() {
    const res = {};
    for (const r of etat.rates) {
      if (!r.x || !r.q || r.j === "disLe") continue;
      const a = r.q.toLowerCase(), b = r.x.toLowerCase();
      if (a.length !== b.length) continue;
      const diff = [...a].map((c, i) => [c, b[i]]).filter(([c, e]) => c !== e);
      if (diff.length !== 1) continue;
      const [c, e] = diff[0];
      if (M.PAIRES[c] === e) { const k = [c, e].sort().join("↔"); res[k] = (res[k] || 0) + 1; }
    }
    return res;
  }

  function panneauFin({ titre, nb, gardien, suivant, peutSuivre, plafondAtteint, rejouer, carte }) {
    const v = $("#voile-fin");
    const defi = D.DEFIS.find(d => defiOuvert(d) && !((etat.niveaux[d.id] || {}).etoiles > 0));
    v.innerHTML = `<div class="panneau-fin" role="dialog" aria-label="Fin du niveau">
      <svg class="filou" id="filou-fin"></svg>
      <h2>${titre}</h2>
      <div class="etoiles">${[0, 1, 2].map(() => `<span class="e">${DESSINS.etoile(true)}</span>`).join("")}</div>
      <div class="gain">+ <span id="gain-n">0</span> ${DESSINS.croquette()}</div>
      ${plafondAtteint ? `<p class="note-fin">🏫 Tu sais lire tous les sons vus en classe ! Le prochain, ta maîtresse va te le montrer.</p>` : ""}
      <div class="boutons">
        ${peutSuivre ? `<button class="btn or" id="fin-suivant">Niveau suivant ▶</button>` : ""}
        ${plafondAtteint ? `<button class="btn or" id="fin-maison">🏠 Décorer la maison</button>${defi ? `<button class="btn clair" id="fin-defi">⭐ ${esc(defi.nom)}</button>` : ""}` : ""}
        <button class="btn${peutSuivre || plafondAtteint ? " clair" : ""}" id="fin-rejouer">Rejouer ↻</button>
        <button class="btn clair" id="fin-carte">Carte 🗺️</button>
      </div></div>`;
    v.hidden = false;
    dessinerFilous();
    const bonus = nb * 2;
    (async () => {
      const es = v.querySelectorAll(".etoiles .e");
      for (let k = 0; k < nb; k++) { await attendre(450); es[k].classList.add("on"); VOIX.son("etoile"); }
      if (bonus) { etat.croquettes += bonus; sauver(); majCroquettes(); }
      $("#gain-n").textContent = String(bonus);
      if (nb > 0) {
        VOIX.son("fanfare"); $("#filou-fin").classList.add("danse"); anim("danse");
        await (gardien ? direCle("gardien") : direCle("finNiveau"));
        if (plafondAtteint && !v.hidden) await direCle("plafondFin");
      } else { anim("penche"); await direCle("finRate"); }
    })();
    const fermer = () => { v.hidden = true; v.innerHTML = ""; VOIX.stop(); };
    if (peutSuivre) $("#fin-suivant").onclick = () => { fermer(); VOIX.son("pop"); jouerNiveau(suivant); };
    if (plafondAtteint) {
      $("#fin-maison").onclick = () => { fermer(); VOIX.son("pop"); ouvrirMaison(); };
      if (defi) $("#fin-defi").onclick = () => { fermer(); VOIX.son("pop"); jouerDefi(defi); };
    }
    $("#fin-rejouer").onclick = () => { fermer(); VOIX.son("pop"); rejouer(); };
    $("#fin-carte").onclick = () => { fermer(); VOIX.son("pop"); carte(); };
  }
  function enregistrer(id, points, total) {
    const nb = M.etoiles(points, total);
    const r = etat.niveaux[id] || { etoiles: 0, meilleur: 0, joue: 0 };
    r.etoiles = Math.max(r.etoiles, nb); r.meilleur = Math.max(r.meilleur, Math.round(100 * points / total)); r.joue++;
    etat.niveaux[id] = r;
    return nb;
  }
  function terminerNiveau(i, points, total) {
    const niv = N[i];
    const nb = enregistrer(niv.id, points, total);
    if (nb > 0 && i + 1 < N.length) etat.maxOuvert = Math.max(etat.maxOuvert, i + 1);
    sauver();
    const suivant = i + 1 < N.length ? i + 1 : null;
    const peutSuivre = nb > 0 && suivant !== null && statut(suivant) !== "ferme" && statut(suivant) !== "plafond";
    const plafondAtteint = nb > 0 && suivant !== null && statut(suivant) === "plafond";
    panneauFin({
      titre: nb > 0 ? (niv.type === "revision" ? "Gardien battu !" : "Niveau réussi !") : "On y est presque !",
      nb, gardien: niv.type === "revision", suivant, peutSuivre, plafondAtteint,
      rejouer: () => jouerNiveau(i), carte: () => allerCarte(peutSuivre ? N[suivant].monde : niv.monde),
    });
  }
  function terminerDefi(d, points, total) {
    const nb = enregistrer(d.id, points, total);
    sauver();
    panneauFin({ titre: nb > 0 ? "Défi réussi !" : "On y est presque !", nb, gardien: false, suivant: null, peutSuivre: false, plafondAtteint: false,
      rejouer: () => jouerDefi(d), carte: () => allerCarte(d.monde) });
  }
  $("#btn-retour-exo").onclick = () => { VOIX.son("pop"); allerCarte(); };

  /* ---------- La maison de Filou ---------- */
  let rayon = "murs", essai = null;      // essai : { id, place } ou { acc } (accessoire essayé)
  const objet = id => D.MAISON.find(o => o.id === id);
  const accessoire = id => D.ACCESSOIRES.find(a => a.id === id);
  const placesDe = o => D.TYPES_MAISON[o.type].places;
  const possedeObjet = id => etat.maison.possede.includes(id);
  const placeDe = id => Object.keys(etat.maison.place).find(k => etat.maison.place[k] === id);
  function placeLibre(o) {
    const ps = placesDe(o);
    return ps.find(p => !etat.maison.place[p]) || ps[0];
  }
  function majBadgeMaison() {
    const neuf = D.COLLECTIONS.some(c => collectionOuverte(c.monde) && !etat.collectionsVues.includes(c.monde));
    $("#btn-maison").classList.toggle("badge", neuf);
  }
  function dessinerChambre() {
    const e = essai && essai.id ? { place: essai.place, id: essai.id } : null;
    $("#chambre-svg").innerHTML = MD.scene(etat.maison.place, e);
    const porte = essai && essai.acc ? Object.assign({}, etat.porte, { [accessoire(essai.acc).zone]: essai.acc }) : etat.porte;
    dessinerFilous(porte);
    const total = D.MAISON.filter(o => o.prix > 0).length, a = etat.maison.possede.filter(id => (objet(id) || {}).prix > 0).length;
    const accTotal = D.ACCESSOIRES.length, accA = etat.possede.length;
    $("#maison-compte").textContent = `🏠 ${a} / ${total} · 🎩 ${accA} / ${accTotal}`;
  }
  function vignette(o, extra) {
    const possede = possedeObjet(o.id), place = placeDe(o.id);
    const cher = !possede && etat.croquettes < o.prix;
    const etatTxt = possede ? (place ? "✓ En place" : "À moi !") : `${o.prix} ${DESSINS.croquette()}`;
    return `<button class="article${place ? " porte" : ""}${cher ? " trop-cher" : ""}${essai && essai.id === o.id ? " essaye" : ""}" data-id="${o.id}">
      <span class="vignette">${extra || MD.apercu(o.id, o.type, placesDe(o))}</span><span class="nom">${esc(o.nom)}</span><span class="prix">${etatTxt}</span></button>`;
  }
  function dessinerRayon() {
    $$("#rayons button").forEach(b => b.classList.toggle("actif", b.dataset.r === rayon));
    let html = "";
    if (rayon === "filou") {
      D.COLLECTIONS.forEach(c => {
        const ouverte = collectionOuverte(c.monde);
        const items = D.ACCESSOIRES.filter(a => a.collection === c.monde);
        html += `<h3 class="collection${ouverte ? "" : " fermee"}">${esc(c.nom)}${ouverte ? "" : ` · 🔒 au monde ${c.monde}`}</h3>`;
        html += items.map(a => {
          if (!ouverte) return `<div class="article verrou"><span class="vignette silhouette">${DESSINS.apercu(a.id)}</span><span class="nom">?</span><span class="prix">🔒</span></div>`;
          const possede = etat.possede.includes(a.id), porte = etat.porte[a.zone] === a.id, cher = !possede && etat.croquettes < a.prix;
          return `<button class="article${porte ? " porte" : ""}${cher ? " trop-cher" : ""}${essai && essai.acc === a.id ? " essaye" : ""}" data-acc="${a.id}">
            <span class="vignette">${DESSINS.apercu(a.id)}</span><span class="nom">${esc(a.nom)}</span>
            <span class="prix">${possede ? (porte ? "✓ Porté" : "À moi !") : `${a.prix} ${DESSINS.croquette()}`}</span></button>`;
        }).join("");
      });
    } else {
      const types = Object.keys(D.TYPES_MAISON).filter(t => D.TYPES_MAISON[t].rayon === rayon);
      html = D.MAISON.filter(o => types.includes(o.type)).map(o => vignette(o)).join("");
    }
    const box = $("#articles");
    box.innerHTML = html;
    box.querySelectorAll("[data-id]").forEach(b => b.onclick = () => toucherObjet(b.dataset.id));
    box.querySelectorAll("[data-acc]").forEach(b => b.onclick = () => toucherAccessoire(b.dataset.acc));
  }
  function panneauAchat(nom, prix) {
    const p = $("#achat");
    if (!nom) { p.hidden = true; return; }
    const manque = prix - etat.croquettes;
    p.innerHTML = `<span class="achat-nom">${esc(nom)}</span>
      ${manque > 0 ? `<span class="achat-manque">Il manque ${manque} ${DESSINS.croquette()}</span>` : `<button class="btn or" id="achat-oui">Acheter · ${prix} ${DESSINS.croquette()}</button>`}
      <button class="btn clair" id="achat-non">Non merci</button>`;
    p.hidden = false;
    if (manque <= 0) $("#achat-oui").onclick = () => acheter();
    $("#achat-non").onclick = () => { VOIX.son("pop"); essai = null; panneauAchat(); dessinerChambre(); dessinerRayon(); };
  }
  function toucherObjet(id) {
    const o = objet(id);
    if (possedeObjet(id)) {
      VOIX.son("pop"); essai = null; panneauAchat();
      const p = placeDe(id);
      if (p) { if (!MAISON_DEPART[p]) delete etat.maison.place[p]; }    // murs, sol et vue : toujours un en place
      else { etat.maison.place[placeLibre(o)] = id; anim("ronron"); }
      sauver(); dessinerChambre(); dessinerRayon(); return;
    }
    VOIX.son("pop");
    essai = { id, place: placeDe(id) || placeLibre(o) };
    dessinerChambre(); dessinerRayon(); panneauAchat(o.nom, o.prix);
    if (etat.croquettes < o.prix) { anim("penche"); direCle("pasAssez"); }
    else bulle(`${o.nom} : ${o.prix} croquettes. On l'achète ?`);
  }
  function toucherAccessoire(id) {
    const a = accessoire(id);
    if (etat.possede.includes(id)) {
      VOIX.son("pop"); essai = null; panneauAchat();
      if (etat.porte[a.zone] === id) delete etat.porte[a.zone]; else { etat.porte[a.zone] = id; anim("ronron"); }
      sauver(); dessinerChambre(); dessinerRayon(); return;
    }
    VOIX.son("pop");
    essai = { acc: id };
    dessinerChambre(); dessinerRayon(); panneauAchat(a.nom, a.prix);
    if (etat.croquettes < a.prix) { anim("penche"); direCle("pasAssez"); }
    else bulle(`${a.nom} : ${a.prix} croquettes. On l'achète ?`);
  }
  function acheter() {
    if (!essai) return;
    if (essai.acc) {
      const a = accessoire(essai.acc);
      if (etat.croquettes < a.prix) return;
      etat.croquettes -= a.prix; etat.possede.push(a.id); etat.porte[a.zone] = a.id;
      direCle("merci");
    } else {
      const o = objet(essai.id);
      if (etat.croquettes < o.prix) return;
      etat.croquettes -= o.prix; etat.maison.possede.push(o.id); etat.maison.place[essai.place] = o.id;
      direCle("merciMaison");
    }
    essai = null; sauver(); majCroquettes();
    VOIX.son("etoile"); anim("danse");
    panneauAchat(); dessinerChambre(); dessinerRayon();
    const ch = $(".chambre"); ch.classList.remove("fete"); void ch.offsetWidth; ch.classList.add("fete");
  }
  function ouvrirMaison() {
    interrompre();
    essai = null; panneauAchat();
    D.COLLECTIONS.forEach(c => { if (collectionOuverte(c.monde) && !etat.collectionsVues.includes(c.monde)) { etat.collectionsVues.push(c.monde); rayon = "filou"; } });
    sauver();
    $("#rayons").innerHTML = D.RAYONS.map(r => `<button data-r="${r.id}"><span>${r.icone}</span>${esc(r.nom)}</button>`).join("");
    $$("#rayons button").forEach(b => b.onclick = () => { VOIX.son("pop"); rayon = b.dataset.r; essai = null; panneauAchat(); dessinerChambre(); dessinerRayon(); });
    montrer("maison");
    dessinerChambre(); dessinerRayon();
    direCle("maison");
  }
  $("#btn-maison").onclick = () => { VOIX.son("pop"); ouvrirMaison(); };
  $("#btn-retour-maison").onclick = () => { VOIX.son("pop"); allerCarte(); };

  /* ---------- Au revoir ---------- */
  $("#btn-quitter").onclick = async () => {
    interrompre(); anim("danse");
    const fin = direCle("auRevoir");
    try { const r = await fetch("/quitter", { cache: "no-store" }); if (!r.ok) throw new Error(); }
    catch (e) { await fin; bulle("Tu peux fermer la fenêtre. À bientôt !"); }
  };

  /* ---------- Temps de jeu ---------- */
  setInterval(() => {
    if (document.hidden || (ecranCourant !== "exo" && ecranCourant !== "carte" && ecranCourant !== "maison")) return;
    const j = new Date().toISOString().slice(0, 10);
    etat.temps[j] = (etat.temps[j] || 0) + 10; sauver();
  }, 10000);

  /* ---------- Espace parent (appui long de 2 secondes) ---------- */
  const bp = $("#btn-parent");
  let minuteur = null;
  const debutAppui = e => { e.preventDefault(); bp.classList.add("appui"); minuteur = setTimeout(() => { bp.classList.remove("appui"); ouvrirParent(); }, 2000); };
  const finAppui = () => { bp.classList.remove("appui"); clearTimeout(minuteur); };
  bp.addEventListener("pointerdown", debutAppui);
  ["pointerup", "pointerleave", "pointercancel"].forEach(t => bp.addEventListener(t, finAppui));
  bp.addEventListener("click", () => { if (!$("#ecran-parent").hidden) return; bulle("Pour papa : appui long sur ⚙️"); });

  const libelle = n => `Monde ${n.monde} · ${n.nom || n.titre} (p. ${n.page})`;
  function optionsNiveaux(sel, avecAucun) {
    return (avecAucun ? `<option value="">Aucun plafond</option>` : "") +
      N.map(n => `<option value="${n.id}"${n.id === sel ? " selected" : ""}>${esc(libelle(n))}</option>`).join("");
  }
  function ouvrirParent() {
    interrompre();
    const p = $("#ecran-parent");
    VOIX.chargerVoix();
    const voix = VOIX.voixFr.map(v => `<option value="${esc(v.name)}">${esc(v.name)} (${v.lang})</option>`).join("") || `<option value="">Aucune voix française</option>`;
    const total = Object.values(etat.temps).reduce((a, b) => a + b, 0);
    const auj = etat.temps[new Date().toISOString().slice(0, 10)] || 0;
    const ligne = (monde, titre, id) => {
      const r = etat.niveaux[id] || {};
      return `<tr><td>${monde}</td><td>${esc(titre)}</td><td>${"★".repeat(r.etoiles || 0)}${"☆".repeat(3 - (r.etoiles || 0))}</td><td>${r.meilleur != null ? r.meilleur + " %" : "–"}</td><td>${r.joue || 0}</td><td>${etat.erreurs[id] || 0}</td></tr>`;
    };
    const lignes = N.map(n => ligne(n.monde, n.nom || n.titre, n.id)).join("") + D.DEFIS.map(d => ligne(d.monde, d.nom, d.id)).join("");
    const conf = confusions();
    const confTxt = Object.keys(conf).length ? Object.entries(conf).map(([k, v]) => `${k} : ${v} fois`).join(" · ") : "aucune repérée pour l'instant";
    p.innerHTML = `<div class="parent-int">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><h1>Espace parent</h1><span class="espace"></span><button class="btn" id="p-fermer">Revenir au jeu</button></div>
      <div class="bloc"><h2>Progression</h2>
        <div class="champ"><label for="p-prenom">Prénom de l'enfant</label><input type="text" id="p-prenom" value="${esc(etat.prenom)}" placeholder="Filou dira « Coucou … ! »"></div>
        <div class="champ"><label for="p-plafond">Plafond (dernière leçon vue en classe)</label><select id="p-plafond">${optionsNiveaux(etat.plafond, true)}</select></div>
        <p class="note">Les niveaux au-delà du plafond restent fermés (🏫, panneau « Bientôt en classe »), même réussis. Avance-le au rythme de la classe : à la prochaine ouverture de la carte, Filou annonce le nouveau son.</p>
        <div class="champ"><label for="p-depart">Point de départ</label><select id="p-depart">${optionsNiveaux(N[Math.min(etat.maxOuvert, N.length - 1)].id, false)}</select></div>
        <p class="note">Le niveau choisi devient le niveau en cours : ceux d'avant sont ouverts, ceux d'après se referment. Les étoiles déjà gagnées sont gardées.</p>
        <div><button class="btn clair" id="p-appliquer-depart">Appliquer le point de départ</button></div>
      </div>
      <div class="bloc"><h2>Voix et sons</h2>
        <div class="champ"><label for="p-voix">Voix de lecture</label><select id="p-voix">${voix}</select></div>
        <div class="champ"><label for="p-voix-filou">Voix de Filou</label><select id="p-voix-filou">${voix}</select></div>
        <div class="champ"><label for="p-vitesse">Vitesse : <span id="p-v-val">${etat.reglages.vitesse}</span></label><input type="range" id="p-vitesse" min="0.5" max="1.1" step="0.05" value="${etat.reglages.vitesse}"></div>
        <div class="champ"><label for="p-hauteur">Hauteur de Filou : <span id="p-h-val">${etat.reglages.hauteur}</span></label><input type="range" id="p-hauteur" min="0.8" max="1.6" step="0.05" value="${etat.reglages.hauteur}"></div>
        <div class="champ"><label for="p-sons">Effets sonores</label><input type="checkbox" id="p-sons"${etat.reglages.sons ? " checked" : ""}></div>
        <div class="champ"><label for="p-ecoute">Lecture à voix haute</label><input type="checkbox" id="p-ecoute"${etat.reglages.ecoute ? " checked" : ""}></div>
        <p class="note">Reconnaissance vocale : ${VOIX.recoDispo ? "disponible" : "absente dans ce navigateur (utiliser Safari)"}. Sans elle, « Dis-le à Filou » est remplacé par « Lis et trouve ».</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn clair" id="p-test">Écouter un essai</button><button class="btn clair" id="p-test-fv">Écouter fa va fo vo fu vu</button></div>
        <p class="note">Diagnostic f/v : le bouton fait dire les syllabes exactement comme dans le jeu (« vo » est dit « veau » pour éviter une lecture en sigle). Si une syllabe sonne mal, enregistre-la dans sons/syllabes/ (ex. vo.m4a).</p>
      </div>
      <div class="bloc"><h2>Suivi</h2>
        <p class="note">Temps de jeu : aujourd'hui ${Math.round(auj / 60)} min · au total ${Math.round(total / 60)} min · croquettes : ${etat.croquettes} · maison : ${etat.maison.possede.length - 3} objets · accessoires : ${etat.possede.length}</p>
        <p class="note"><b>Confusions de sons voisins</b> (f↔v, p↔b, t↔d) : ${esc(confTxt)}.</p>
        <div class="table-wrap"><table><tr><th>Monde</th><th>Niveau</th><th>Étoiles</th><th>Meilleur</th><th>Parties</th><th>Erreurs</th></tr>${lignes}</table></div>
        <h2 style="margin-top:8px">Dernières erreurs</h2>
        <div class="table-wrap"><table><tr><th>Quand</th><th>Niveau</th><th>Jeu</th><th>Demandé</th><th>Réponse</th></tr>${etat.rates.slice(0, 15).map(r => `<tr><td>${esc(r.d.replace("T", " "))}</td><td>${esc(r.n)}</td><td>${esc(r.j)}</td><td>${esc(r.q)}</td><td>${esc(r.x || "")}</td></tr>`).join("") || "<tr><td colspan=5>Aucune</td></tr>"}</table></div>
        <h2 style="margin-top:8px">Ce que Filou a entendu</h2>
        <div class="table-wrap"><table><tr><th>Quand</th><th>À lire</th><th>Entendu</th><th>Verdict</th></tr>${etat.lectures.slice(0, 15).map(r => `<tr><td>${esc(r.d.replace("T", " "))}</td><td>${esc(r.t)}</td><td>${esc(r.e)}</td><td>${{ ok: "✓", faux: "✗", rien: "rien", erreur: "erreur" }[r.r] || r.r}</td></tr>`).join("") || "<tr><td colspan=4>Rien pour l'instant</td></tr>"}</table></div>
        <textarea id="p-rapport" readonly></textarea>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn clair" id="p-copier">Copier le rapport</button></div>
      </div>
      <div class="bloc"><h2>Remise à zéro</h2>
        <p class="note">Efface étoiles, croquettes, accessoires, maison et suivi. Les réglages de voix sont gardés.</p>
        <div><button class="btn danger" id="p-raz">Tout effacer</button></div>
      </div>
      <p class="note">Filou lit ${VERSION} · progression calquée sur « J'apprends à lire avec Sami et Julie » (Hachette).</p>
    </div>`;
    p.hidden = false; $("#coin").hidden = true;
    $("#p-voix").value = etat.reglages.voix || (VOIX.voixFr[0] || {}).name || "";
    $("#p-voix-filou").value = etat.reglages.voixFilou || etat.reglages.voix || (VOIX.voixFr[0] || {}).name || "";
    const reg = () => { VOIX.regler(etat.reglages); sauver(); };
    $("#p-prenom").oninput = e => { etat.prenom = e.target.value.trim(); sauver(); };
    $("#p-plafond").onchange = e => { etat.plafond = e.target.value; sauver(); };
    let confDepart = false;
    $("#p-appliquer-depart").onclick = e => {
      if (!confDepart) { confDepart = true; e.target.textContent = "Confirmer ?"; setTimeout(() => { confDepart = false; e.target.textContent = "Appliquer le point de départ"; }, 4000); return; }
      etat.depart = $("#p-depart").value; etat.maxOuvert = M.idx(etat.depart); sauver(); e.target.textContent = "Appliqué ✓"; confDepart = false;
    };
    $("#p-voix").onchange = e => { etat.reglages.voix = e.target.value; reg(); };
    $("#p-voix-filou").onchange = e => { etat.reglages.voixFilou = e.target.value; reg(); };
    $("#p-vitesse").oninput = e => { etat.reglages.vitesse = +e.target.value; $("#p-v-val").textContent = e.target.value; reg(); };
    $("#p-hauteur").oninput = e => { etat.reglages.hauteur = +e.target.value; $("#p-h-val").textContent = e.target.value; reg(); };
    $("#p-sons").onchange = e => { etat.reglages.sons = e.target.checked; reg(); };
    $("#p-ecoute").onchange = e => { etat.reglages.ecoute = e.target.checked; reg(); };
    $("#p-test").onclick = async () => { await VOIX.filou("Coucou ! Je suis Filou."); await VOIX.parler("la fumée, le navire, fa, vo, mi"); };
    $("#p-test-fv").onclick = async () => { for (const s of ["fa", "va", "fo", "vo", "fu", "vu"]) { await VOIX.syllabe(s, D.PRONONCE); await attendre(350); } };
    $("#p-rapport").value = rapport();
    $("#p-copier").onclick = async () => {
      const t = $("#p-rapport");
      try { await navigator.clipboard.writeText(t.value); $("#p-copier").textContent = "Copié ✓"; } catch (e) { t.focus(); t.select(); $("#p-copier").textContent = "Sélectionné : ⌘C"; }
    };
    let confRaz = false;
    $("#p-raz").onclick = e => {
      if (!confRaz) { confRaz = true; e.target.textContent = "Vraiment tout effacer ?"; setTimeout(() => { confRaz = false; e.target.textContent = "Tout effacer"; }, 4000); return; }
      const reglages = etat.reglages, prenom = etat.prenom; etat = etatParDefaut(); etat.reglages = reglages; etat.prenom = prenom; etat.plafondVu = etat.plafond; sauver(); ouvrirParent();
    };
    $("#p-fermer").onclick = () => { p.hidden = true; p.innerHTML = ""; allerCarte(N[niveauActuel()].monde); };
  }
  function rapport() {
    const conf = confusions();
    return [
      `FILOU LIT ${VERSION} — rapport du ${new Date().toLocaleString("fr-FR")}`,
      `Navigateur : ${navigator.userAgent}`,
      `Niveau en cours : ${N[niveauActuel()].id} · plafond : ${etat.plafond || "aucun"} · croquettes : ${etat.croquettes} · accessoires : ${etat.possede.join(", ") || "aucun"}`,
      `Maison : ${etat.maison.possede.filter(id => !Object.values(MAISON_DEPART).includes(id)).join(", ") || "rien acheté"}`,
      `Voix : ${etat.reglages.voix || "défaut"} / Filou : ${etat.reglages.voixFilou || "défaut"} · écoute ${etat.reglages.ecoute && VOIX.recoDispo ? "active" : "inactive"}`,
      `Confusions repérées : ${Object.entries(conf).map(([k, v]) => `${k} ×${v}`).join(", ") || "aucune"}`,
      "", "NIVEAUX", ...[...N, ...D.DEFIS].filter(n => etat.niveaux[n.id]).map(n => { const r = etat.niveaux[n.id]; return `- ${n.id} : ${r.etoiles}★ meilleur ${r.meilleur} % · ${r.joue} partie(s) · ${etat.erreurs[n.id] || 0} erreur(s)`; }),
      "", "DERNIÈRES ERREURS (demandé → réponse)", ...etat.rates.slice(0, 25).map(r => `- ${r.d} ${r.n} ${r.j} : ${r.q}${r.x ? " → " + r.x : ""}`),
      "", "LECTURES À VOIX HAUTE", ...etat.lectures.slice(0, 20).map(r => `- ${r.d} ${r.n} « ${r.t} » entendu « ${r.e} » → ${r.r}`),
    ].join("\n");
  }

  /* ---------- Démarrage ---------- */
  majCroquettes();
  dessinerFilous();
  montrer("accueil");
  window.FILOU_APP = { etat: () => etat, jouerNiveau, jouerDefi: id => jouerDefi(D.DEFIS.find(d => d.id === id)), allerCarte, ouvrirMaison, version: VERSION };
})();

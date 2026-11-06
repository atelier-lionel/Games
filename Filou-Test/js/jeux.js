/* Filou lit — les 9 mini-jeux (V2)
   Chaque jeu dessine son exercice dans ui.table et se résout avec les points gagnés :
   1 = réussi du premier coup, 0.5 = réussi au deuxième essai, 0 = solution montrée. */
"use strict";

var JEUX = (function () {
  const M = FILOU_MOTEUR, D = FILOU_DATA;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const attendre = ms => new Promise(r => setTimeout(r, ms));

  /* Texte → HTML : lettres muettes en gris, graphèmes du niveau en rouge
     (lettres, groupes « br » à l'intérieur des mots, mots-outils entiers « et », « est ») */
  function enHTML(texte, focus = []) {
    const lettres = new Set(focus.filter(g => g.length === 1));
    const groupes = focus.filter(g => M.GROUPES.includes(g));
    const mots = focus.filter(g => g.length > 1 && !M.GROUPES.includes(g));
    let html = "", muette = false;
    const parties = texte.split(/(\[|\])/);
    for (const p of parties) {
      if (p === "[") { muette = true; continue; }
      if (p === "]") { muette = false; continue; }
      if (muette) { html += `<span class="muette">${esc(p)}</span>`; continue; }
      const morceaux = mots.length ? p.split(new RegExp(`(?<![\\p{L}])(${mots.join("|")})(?![\\p{L}])`, "iu")) : [p];
      morceaux.forEach((m, i) => {
        if (mots.length && i % 2 === 1) { html += `<span class="rouge">${esc(m)}</span>`; return; }
        const ch = [...m];
        for (let k = 0; k < ch.length; k++) {
          const deux = (ch[k] + (ch[k + 1] || "")).toLocaleLowerCase("fr");
          if (groupes.includes(deux)) { html += `<span class="rouge">${esc(ch[k] + ch[k + 1])}</span>`; k++; continue; }
          html += lettres.has(ch[k].toLocaleLowerCase("fr")) ? `<span class="rouge">${esc(ch[k])}</span>` : esc(ch[k]);
        }
      });
    }
    return html;
  }
  /* Même chose, mais chaque mot dans un <span class="mot"> (pour souligner les mots déjà lus) */
  function enMots(texte, focus = []) {
    return texte.split(/(\s+)/).map(m => /^\s+$/.test(m) ? m : `<span class="mot">${enHTML(m, focus)}</span>`).join("");
  }
  const majuscule = l => l.toLocaleUpperCase("fr-FR");

  function el(html) { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function hautParleur(gros = false) { return `<button class="haut-parleur${gros ? " gros" : ""}" data-ecouter aria-label="Réécouter">🔊</button>`; }
  function brancherHautParleur(table, action) { table.querySelectorAll("[data-ecouter]").forEach(b => b.onclick = () => { VOIX.son("pop"); action(); }); }

  /* Choix unique parmi des cartes : gère essais, encouragements et solution */
  function choixUnique(ui, cartes, estBon, apresBon, solution) {
    return new Promise(res => {
      let essais = 0, verrou = false;
      cartes.forEach(c => c.onclick = async () => {
        if (verrou || c.disabled) return;
        verrou = true;
        if (estBon(c)) {
          c.classList.add("bon"); cartes.forEach(x => { if (x !== c) x.classList.add("eteint"); });
          if (apresBon) await apresBon(c);
          await ui.bravo(c);
          res(essais === 0 ? 1 : 0.5);
          return;
        }
        essais++;
        c.classList.add("faux"); c.disabled = true;
        ui.noterErreur(c.dataset.v);
        if (essais >= 2) {
          const bonne = cartes.find(estBon);
          bonne.classList.add("bon"); cartes.forEach(x => { if (x !== bonne) x.classList.add("eteint"); });
          await ui.solution(solution);
          res(0);
          return;
        }
        await ui.rate();
        verrou = false;
      });
    });
  }

  /* ---------- 1. Trouve la lettre (voyelles) ---------- */
  async function trouveLettre(ex, ui) {
    ui.table.innerHTML = `<div class="consigne">${hautParleur(true)}</div>
      <div class="choix">${ex.options.map(o => `<button class="carte-choix" data-v="${esc(o)}">${esc(o)}</button>`).join("")}</div>`;
    const dire = () => ui.lireSon(ex.cible, ex.dire);
    brancherHautParleur(ui.table, dire);
    const p = choixUnique(ui, [...ui.table.querySelectorAll(".carte-choix")], c => c.dataset.v === ex.cible, null, () => dire());
    await ui.dire(D.FILOU.consignes.trouveLettre, "consigne_trouveLettre");
    await dire();
    return p;
  }

  /* ---------- 2. Les jumelles : même lettre, autre écriture ---------- */
  async function jumelles(ex, ui) {
    const cursive = ex.forme === "cursive";
    const affiche = l => cursive ? l : majuscule(l);
    ui.table.innerHTML = `<div class="modele">${esc(ex.cible)}</div>
      <div class="consigne">${cursive ? "La même, en attaché :" : "La même, en majuscule :"}</div>
      <div class="choix">${ex.options.map(o => `<button class="carte-choix${cursive ? " cursive" : ""}" data-v="${esc(o)}">${esc(affiche(o))}</button>`).join("")}</div>`;
    const p = choixUnique(ui, [...ui.table.querySelectorAll(".carte-choix")], c => c.dataset.v === ex.cible, null, null);
    await ui.dire(cursive ? "Trouve la même lettre, écrite en attaché." : "Trouve la même lettre, en majuscule.", cursive ? "consigne_jumelles_attache" : "consigne_jumelles_majuscule");
    return p;
  }

  /* ---------- 3. Trouve la syllabe entendue ---------- */
  async function trouveSyllabe(ex, ui) {
    ui.table.innerHTML = `<div class="consigne">${hautParleur(true)}</div>
      <div class="choix">${ex.options.map(o => `<button class="carte-choix" data-v="${esc(o)}"><span>${enHTML(o, ui.focus)}</span></button>`).join("")}</div>`;
    const dire = () => ui.lireSyllabe(ex.dire);
    brancherHautParleur(ui.table, dire);
    const p = choixUnique(ui, [...ui.table.querySelectorAll(".carte-choix")], c => c.dataset.v === ex.cible, null, () => dire());
    await ui.dire(D.FILOU.consignes.trouveSyllabe, "consigne_trouveSyllabe");
    await dire();
    return p;
  }

  /* ---------- 4. La fabrique à syllabes ----------
     Une case par morceau : consonne + voyelle (« vo »), ou consonne + r/l + voyelle (« vro »).
     L'enfant remplit les cases dans l'ordre ; une fois la dernière posée, Filou lit ce qui a été fabriqué. */
  function fabrique(ex, ui) {
    return new Promise(async res => {
      const n = ex.morceaux.length;
      ui.table.innerHTML = `<div class="consigne">${hautParleur()}<span>Fabrique la syllabe !</span></div>
        <div class="cases">${ex.morceaux.map((_, i) => `<div class="case${i === 0 ? " prochaine" : ""}" data-i="${i}"></div>`).join("")}</div>
        <div class="rangees${n === 3 ? " trois" : ""}">${ex.rangees.map((r, k) => `<div class="rangee"><div class="rangee-titre">${esc(r.nom)}</div>
        <div class="tuiles">${r.tuiles.map(t => `<button class="tuile${r.voyelle ? " voyelle" : ""}${k === 1 && n === 3 ? " accroche" : ""}" data-k="${k}" data-t="${esc(t)}">${r.voyelle ? esc(t) : enHTML(t, ui.focus)}</button>`).join("")}</div></div>`).join("")}</div>`;
      const cases = [...ui.table.querySelectorAll(".case")];
      const dire = () => ui.lireSyllabe(ex.dire);
      brancherHautParleur(ui.table, dire);
      let pris = [], essais = 0, verrou = false;
      const vider = () => { pris = []; cases.forEach((c, i) => { c.textContent = ""; c.className = "case" + (i === 0 ? " prochaine" : ""); }); };
      ui.table.querySelectorAll(".tuile").forEach(b => b.onclick = async () => {
        if (verrou) return;
        const k = +b.dataset.k;
        // Chaque rangée remplit sa case ; une tuile d'une autre rangée remplace le morceau de sa propre case
        if (k > pris.length) { VOIX.son("faux"); ui.bulle(n === 3 && pris.length === 1 ? "Maintenant, la lettre qui s'accroche !" : "D'abord une consonne !"); return; }
        VOIX.son("pop");
        pris = pris.slice(0, k); pris[k] = b.dataset.t;
        cases.forEach((c, i) => {
          if (i < pris.length) { c.innerHTML = i === n - 1 ? esc(pris[i]) : enHTML(pris[i], ui.focus); c.className = "case pleine"; }
          else { c.textContent = ""; c.className = "case" + (i === pris.length ? " prochaine" : ""); }
        });
        if (pris.length < n) return;
        verrou = true;
        const faite = pris.join("");
        await ui.lireSyllabe(faite);
        if (faite === ex.cible) { await ui.bravo(cases[n - 1]); res(essais === 0 ? 1 : 0.5); return; }
        essais++; ui.noterErreur(faite);
        cases.forEach(c => c.classList.add("faux"));
        if (essais >= 2) {
          ex.morceaux.forEach((m, i) => { cases[i].innerHTML = i === n - 1 ? esc(m) : enHTML(m, ui.focus); cases[i].className = "case pleine"; });
          await ui.solution(() => dire());
          res(0); return;
        }
        await ui.dire(`Tu as fabriqué « ${faite} ». Écoute bien…`, null);
        await dire();
        vider(); verrou = false;
      });
      await ui.dire(D.FILOU.consignes.fabrique, "consigne_fabrique");
      await dire();
    });
  }

  /* ---------- 5. Lis et trouve l'image ---------- */
  async function lisTrouve(ex, ui) {
    ui.table.innerHTML = `<div class="a-lire">${enHTML(ex.mot, ui.focus)}</div>
      <div class="choix">${ex.options.map(o => `<button class="carte-choix image" data-v="${esc(o)}" aria-label="image">${o}</button>`).join("")}</div>`;
    const p = choixUnique(ui, [...ui.table.querySelectorAll(".carte-choix")], c => c.dataset.v === ex.cible, () => ui.lire(M.brut(ex.mot)), () => ui.lire(M.brut(ex.mot)));
    await ui.dire(D.FILOU.consignes.lisTrouve, "consigne_lisTrouve");
    return p;
  }

  /* ---------- 6. Dis-le à Filou (lecture à voix haute, écoute automatique) ---------- */
  function disLe(ex, ui) {
    return new Promise(async res => {
      const image = ex.image ? `<div class="image-cachee"><span class="q">?</span></div>` : "";
      ui.table.innerHTML = `${image}<div class="a-lire${ex.phrase ? " phrase" : ""}">${enMots(ex.texte, ui.focus)}</div>
        <div class="micro"><div class="rond">🎤</div><div class="tempo"><i></i></div></div>
        <div class="entendu"></div>`;
      const micro = ui.table.querySelector(".micro"), barre = ui.table.querySelector(".tempo i"), entendu = ui.table.querySelector(".entendu");
      const reveler = () => { const im = ui.table.querySelector(".image-cachee"); if (im) { im.innerHTML = ex.image; im.classList.add("revele"); } };
      const juger = alts => M.jugerLecture(ex.texte, alts, ex.phrase);
      const debut = alts => M.progressionLecture(ex.texte, alts).debut;
      const motsAffiches = [...ui.table.querySelectorAll(".a-lire .mot")];
      const souligner = n => motsAffiches.forEach((m, i) => m.classList.toggle("lu", i < n));
      const barreSur = ms => { barre.style.transition = "none"; barre.style.transform = "scaleX(1)"; void barre.offsetWidth; barre.style.transition = `transform ${ms}ms linear`; barre.style.transform = "scaleX(0)"; };

      // Sans écoute possible : l'enfant dit qu'elle a lu, Filou relit
      const sansEcoute = async (message) => {
        micro.hidden = true; ui.table.querySelector(".tempo") && (ui.table.querySelector(".tempo").hidden = true);
        entendu.innerHTML = message ? `<span>${esc(message)}</span>` : "";
        const b = el(`<button class="btn or">👍 J'ai lu !</button>`);
        ui.table.appendChild(b);
        b.onclick = async () => { b.remove(); await ui.lire(M.brut(ex.texte)); reveler(); await ui.bravo(ui.table.querySelector(".image-cachee") || micro); res(1); };
      };

      await ui.dire(D.FILOU.consignes.disLe, "consigne_disLe");
      if (!ui.ecouteActive) { sansEcoute(); return; }

      for (let essai = 1; essai <= 3; essai++) {
        if (ui.annule()) return;
        micro.classList.add("ecoute"); entendu.textContent = "J'écoute…"; ui.bulle("J'écoute…"); souligner(0);
        const r = await VOIX.ecouter({
          juger, debut, phrase: ex.phrase, maxMs: ex.phrase ? 12000 : 8000,
          surDebut: barreSur, surProlonge: barreSur,
          surTexte: t => {
            entendu.innerHTML = `J'entends : <q>${esc(t)}</q>`;
            if (ex.phrase) { const p = M.progressionLecture(ex.texte, [t]); souligner(p.mots); if (p.debut) ui.bulle("Continue, j'écoute…"); }
          },
        });
        micro.classList.remove("ecoute"); barre.style.transition = "none"; barre.style.transform = "scaleX(0)";
        if (ui.annule()) return;
        ui.noterLecture(ex.texte, r);
        if (r.etat === "ok") { souligner(motsAffiches.length); reveler(); await ui.bravo(ui.table.querySelector(".image-cachee") || micro); res(essai === 1 ? 1 : 0.5); return; }
        if (r.etat === "erreur") {
          const msg = r.message === "not-allowed" ? "Le micro n'est pas autorisé." : r.message === "service-not-allowed" ? "La dictée du Mac est désactivée." : r.message === "network" ? "Pas d'internet pour l'écoute." : "Filou n'arrive pas à écouter.";
          sansEcoute(msg); return;
        }
        if (essai === 3) break;
        if (r.etat === "rien") { entendu.textContent = "Je n'ai rien entendu."; await ui.dire(D.FILOU.rienEntendu, "rienEntendu"); continue; }
        ui.noterErreur(r.texte);
        if (essai === 1) { await ui.rate(); }
        else { await ui.dire("Écoute bien.", "ecouteBien"); await ui.lire(M.brut(ex.texte)); await ui.dire("À toi !", "aToi"); }
      }
      reveler();
      await ui.solution(() => ui.lire(M.brut(ex.texte)));
      res(0);
    });
  }

  /* ---------- 7. La dictée magique ---------- */
  function dictee(ex, ui) {
    return new Promise(async res => {
      ui.table.innerHTML = `<div class="consigne"><span class="image-indice">${ex.image}</span>${hautParleur()}</div>
        <div class="cases">${ex.lettres.map((l, i) => `<div class="case${i === 0 ? " prochaine" : ""}"></div>`).join("")}</div>
        <div class="tuiles">${ex.tuiles.map((l, i) => `<button class="tuile${M.VOYELLES.includes(l) || l === "y" || l === "ê" ? " voyelle" : ""}" data-l="${esc(l)}" data-i="${i}">${esc(l)}</button>`).join("")}</div>`;
      const cases = [...ui.table.querySelectorAll(".case")], tuiles = [...ui.table.querySelectorAll(".tuile")];
      const dire = () => ui.lire(M.brut(ex.mot), { lent: true });
      brancherHautParleur(ui.table, dire);
      let pos = 0, erreurs = 0, erreursIci = 0, verrou = true;
      tuiles.forEach(t => t.onclick = async () => {
        if (verrou || t.classList.contains("utilisee")) return;
        if (t.dataset.l === ex.lettres[pos]) {
          VOIX.son("pop");
          t.classList.add("utilisee"); tuiles.forEach(x => x.classList.remove("indice"));
          cases[pos].innerHTML = enHTML(t.dataset.l, ui.focus); cases[pos].className = "case pleine";
          pos++; erreursIci = 0;
          if (cases[pos]) cases[pos].classList.add("prochaine");
          if (pos === ex.lettres.length) {
            verrou = true;
            await ui.lire(M.brut(ex.mot));
            await ui.bravo(cases[cases.length - 1]);
            res(erreurs <= 1 ? 1 : erreurs <= 3 ? 0.5 : 0);
          }
          return;
        }
        VOIX.son("faux"); erreurs++; erreursIci++; ui.noterErreur(t.dataset.l);
        t.classList.remove("faux"); void t.offsetWidth; t.classList.add("faux");
        if (erreursIci >= 2) {
          const bonne = tuiles.find(x => !x.classList.contains("utilisee") && x.dataset.l === ex.lettres[pos]);
          if (bonne) bonne.classList.add("indice");
        }
      });
      await ui.dire(D.FILOU.consignes.dictee, "consigne_dictee");
      await dire();
      verrou = false;
    });
  }

  /* ---------- 8. Le mot qui manque ---------- */
  async function motManquant(ex, ui) {
    const avant = ex.phrase.split("___")[0], apres = ex.phrase.split("___")[1];
    ui.table.innerHTML = `<div class="a-lire phrase">${enHTML(avant)}<span class="trou">&nbsp;</span>${enHTML(apres)}</div>
      <div class="choix">${ex.options.map(o => `<button class="carte-choix mot" data-v="${esc(o)}">${esc(o)}</button>`).join("")}</div>`;
    const trou = ui.table.querySelector(".trou");
    const complete = () => ex.phrase.replace("___", ex.cible);
    const remplir = async () => { trou.textContent = ex.cible; await ui.lire(M.brut(complete())); };
    const p = choixUnique(ui, [...ui.table.querySelectorAll(".carte-choix")], c => c.dataset.v === ex.cible, remplir, remplir);
    await ui.dire(D.FILOU.consignes.motManquant, "consigne_motManquant");
    return p;
  }

  /* ---------- 9. Ne confonds pas (défi f/v…) ----------
     Deux grandes cartes, une par lettre, avec son indice (le f souffle, le v vibre).
     entends : Filou dit une syllabe ou un mot ; complete : mot illustré dont il manque la lettre. */
  async function confusion(ex, ui) {
    const aide = ex.aide || {};
    const carte = l => `<button class="carte-choix lettre-paire" data-v="${esc(l)}"><b>${esc(l)}</b>${aide[l] ? `<small>${aide[l] === "souffle" ? "🌬️ souffle" : aide[l] === "vibre" ? "🐝 vibre" : esc(aide[l])}</small>` : ""}</button>`;
    let haut, dire, apres;
    if (ex.mode === "entends") {
      haut = `<div class="consigne">${ex.image ? `<span class="image-indice">${ex.image}</span>` : ""}${hautParleur(!ex.image)}</div>`;
      dire = () => ex.syllabe ? ui.lireSyllabe(ex.dire) : ui.lire(ex.dire);
    } else {
      const avant = ex.mot.slice(0, ex.trou), apresT = ex.mot.slice(ex.trou + 1);
      haut = `<div class="image-indice">${ex.image}</div><div class="a-lire">${enHTML(avant)}<span class="trou-lettre">?</span>${enHTML(apresT)}</div>`;
      dire = () => ui.lire(M.brut(ex.mot));
      apres = async () => { const t = ui.table.querySelector(".trou-lettre"); t.textContent = ex.cible; t.classList.add("rempli"); await ui.lire(M.brut(ex.mot)); };
    }
    ui.table.innerHTML = `${haut}<div class="choix">${ex.options.map(carte).join("")}</div>`;
    brancherHautParleur(ui.table, dire);
    const p = choixUnique(ui, [...ui.table.querySelectorAll(".carte-choix")], c => c.dataset.v === ex.cible, apres, apres || dire);
    if (ex.mode === "entends") { await ui.dire(D.FILOU.consignes.confusionEntends, "consigne_confusionEntends"); await dire(); }
    else await ui.dire(D.FILOU.consignes.confusionComplete, "consigne_confusionComplete");
    return p;
  }

  const JEUX = { trouveLettre, jumelles, trouveSyllabe, fabrique, lisTrouve, disLe, dictee, motManquant, confusion };
  function jouer(ex, ui) { return JEUX[ex.jeu](ex, ui); }

  return { jouer, enHTML, enMots, esc, attendre };
})();

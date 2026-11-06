/* Filou lit — sons : voix du Mac, enregistrements, effets sonores, écoute (V2) */
"use strict";

var VOIX = (function () {
  let reglages = { voix: "", voixFilou: "", vitesse: 0.85, hauteur: 1.15, sons: true };
  let voixFr = [];
  const synth = window.speechSynthesis || null;
  const Reco = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  let surParle = () => {};               // rappel : Filou parle / se tait (animation de la bouche)
  let audioEnCours = null;
  const absents = new Set();             // enregistrements déjà cherchés et absents

  /* ---------- Voix du Mac ---------- */
  function chargerVoix() {
    if (!synth) return [];
    voixFr = synth.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith("fr"));
    const score = v => (/(premium|enhanced|améliorée|amelioree|siri)/i.test(v.name) ? 10 : 0) + (v.lang === "fr-FR" ? 2 : 0) + (v.localService ? 1 : 0);
    voixFr.sort((a, b) => score(b) - score(a));
    return voixFr;
  }
  if (synth) { chargerVoix(); synth.onvoiceschanged = chargerVoix; }

  /* iPad / iPhone (correctif du 03/11/2026, intégré à la V1) : Safari n'autorise la voix et les sons qu'après un geste de l'enfant.
     On « réveille » la synthèse vocale et l'audio pendant les premiers touchers (énoncé muet). */
  let reveils = 0;
  function deverrouiller() {
    if (reveils >= 3) return;
    reveils++;
    try { if (synth) { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; u.lang = "fr-FR"; synth.speak(u); } } catch (e) {}
    try { contexte(); } catch (e) {}
  }
  ["touchend", "click"].forEach(t => document.addEventListener(t, deverrouiller, { capture: true }));

  function stop() {
    if (synth) synth.cancel();
    if (audioEnCours) { try { audioEnCours.pause(); } catch (e) {} audioEnCours = null; }
    surParle(false);
  }

  /* Parle ; se résout à la fin (avec garde-fou si Safari oublie l'événement de fin) */
  function parler(texte, { filou = false, lent = false } = {}) {
    return new Promise(res => {
      if (!synth || !texte) { res(); return; }
      synth.cancel();
      const u = new SpeechSynthesisUtterance(texte);
      const nom = filou ? (reglages.voixFilou || reglages.voix) : reglages.voix;
      const v = voixFr.find(x => x.name === nom) || voixFr[0];
      if (v) u.voice = v;
      u.lang = v ? v.lang : "fr-FR";
      const vari = filou ? (Math.random() * 0.16 - 0.08) : 0;
      u.rate = filou ? Math.min(1.05, reglages.vitesse + 0.1) : reglages.vitesse * (lent ? 0.85 : 1);
      u.pitch = filou ? reglages.hauteur + vari : 1;
      let fini = false;
      const fin = () => { if (fini) return; fini = true; clearTimeout(garde); if (filou) surParle(false); res(); };
      const garde = setTimeout(fin, 2500 + texte.length * 110);
      u.onend = fin; u.onerror = fin;
      if (filou) surParle(true);
      synth.speak(u);
    });
  }

  /* Joue un enregistrement s'il existe (sinon false, sans erreur) */
  function jouerFichier(chemin) {
    return new Promise(res => {
      if (absents.has(chemin) || location.protocol === "file:") { res(false); return; }
      if (audioEnCours) { try { audioEnCours.pause(); } catch (e) {} }
      const a = new Audio(chemin);
      let fini = false;
      const fin = ok => { if (fini) return; fini = true; if (!ok) absents.add(chemin); res(ok); };
      a.onerror = () => fin(false);
      a.onended = () => { audioEnCours = null; fin(true); };
      a.play().then(() => { audioEnCours = a; }).catch(() => fin(false));
    });
  }

  /* Filou dit une phrase : enregistrement sons/filou/<fichier>.m4a, sinon voix du Mac */
  async function filou(texte, fichier) {
    stop();
    if (fichier) {
      surParle(true);
      const ok = await jouerFichier("sons/filou/" + fichier + ".m4a");
      surParle(false);
      if (ok) return;
    }
    return parler(texte, { filou: true });
  }

  /* Son d'une lettre : sons/lettres/<lettre>.m4a si présent */
  function lettre(g) { return jouerFichier("sons/lettres/" + g + ".m4a"); }

  /* Syllabe isolée : sons/syllabes/<syllabe>.m4a si présent, sinon la voix du Mac avec une
     orthographe sûre (prononce : table syllabe → mot homophone, ex. vo → veau) */
  async function syllabe(s, prononce = {}) {
    if (await jouerFichier("sons/syllabes/" + s + ".m4a")) return;
    return parler(prononce[s] || s);
  }

  /* ---------- Effets sonores (synthétisés, aucun fichier) ---------- */
  let ctx = null;
  function contexte() {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function note(c, f, t, d, type = "triangle", vol = 0.22) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + 0.05);
    return o;
  }
  const SONS = {
    pop: (c, t) => { const o = note(c, 520, t, 0.09, "sine", 0.18); o.frequency.exponentialRampToValueAtTime(900, t + 0.08); },
    bon: (c, t) => { [784, 988, 1319].forEach((f, i) => note(c, f, t + i * 0.08, 0.35)); },
    faux: (c, t) => { note(c, 392, t, 0.18, "sine", 0.16); note(c, 330, t + 0.15, 0.28, "sine", 0.16); },
    etoile: (c, t) => { [1047, 1319, 1568, 2093].forEach((f, i) => note(c, f, t + i * 0.06, 0.4, "sine", 0.15)); },
    fanfare: (c, t) => { [523, 659, 784, 659, 784, 1047].forEach((f, i) => note(c, f, t + i * 0.13, i === 5 ? 0.7 : 0.2, "square", 0.08)); },
    croque: (c, t) => {
      for (let k = 0; k < 2; k++) {
        const n = c.createBufferSource(), b = c.createBuffer(1, c.sampleRate * 0.06, c.sampleRate), d = b.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        n.buffer = b; const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1800; const g = c.createGain(); g.gain.value = 0.35;
        n.connect(f).connect(g).connect(c.destination); n.start(t + k * 0.11);
      }
    },
  };
  function son(nom) {
    if (!reglages.sons) return;
    const c = contexte(); if (!c || !SONS[nom]) return;
    try { SONS[nom](c, c.currentTime + 0.01); } catch (e) {}
  }
  async function miaou() {
    if (await jouerFichier("sons/miaou.m4a")) return;
    son("bon");
  }

  /* ---------- Écoute (reconnaissance vocale de Safari) ----------
     Écoute en continu, conclut dès que juger() accepte, ou après un silence, ou au bout du temps.
     V2 : tant que debut() dit que l'enfant n'a lu que le début du texte (lecture mot à mot), le silence
     toléré passe de 1,8 s à 4 s (1,2 → 2,5 s pour un mot), le temps est prolongé (jusqu'à +12 s), et si
     Safari arrête l'écoute de lui-même, elle est relancée en gardant ce qui a déjà été entendu.
     Résultat : { etat: "ok" | "faux" | "rien" | "erreur", texte, message } */
  let recoCourante = null;
  const ECOUTE = { silence: [1200, 1800], silenceDebut: [2500, 4000], bonus: [5000, 12000], relances: 4 };
  function ecouter({ juger, debut = () => false, phrase = false, maxMs = 8000, surTexte = () => {}, surDebut = () => {}, surProlonge = () => {} }) {
    return new Promise(res => {
      if (!Reco) { res({ etat: "erreur", message: "absente" }); return; }
      stop();
      const k = phrase ? 1 : 0;
      const SILENCE = ECOUTE.silence[k], SILENCE_DEBUT = ECOUTE.silenceDebut[k], MAX_TOTAL = maxMs + ECOUTE.bonus[k];
      let conclu = false, acquis = "", texte = "", alts = [], tSilence = null, tMax = null, t0 = 0, fin = maxMs, relances = 0;
      const conclure = (etat, message) => {
        if (conclu) return; conclu = true;
        clearTimeout(tSilence); clearTimeout(tMax);
        if (recoCourante) { try { recoCourante.abort(); } catch (e) {} }
        recoCourante = null;
        if (etat === "fin") etat = texte ? (juger([texte, ...alts]) ? "ok" : "faux") : "rien";
        res({ etat, texte, message });
      };
      const ecoule = () => Date.now() - t0;
      function prolonger(ms) {
        const voulu = Math.min(MAX_TOTAL, ecoule() + ms);
        if (voulu <= fin) return;
        fin = voulu; clearTimeout(tMax);
        tMax = setTimeout(() => conclure("fin"), fin - ecoule());
        surProlonge(fin - ecoule());
      }
      const enCours = () => texte && debut([texte, ...alts]);
      function demarrer() {
        const r = new Reco();
        recoCourante = r;
        r.lang = "fr-FR"; r.interimResults = true; r.continuous = true; r.maxAlternatives = 5;
        const actif = () => !conclu && recoCourante === r;
        r.onstart = () => {
          if (!actif() || t0) return;
          t0 = Date.now(); surDebut(maxMs); tMax = setTimeout(() => conclure("fin"), maxMs);
        };
        r.onresult = ev => {
          if (!actif()) return;
          let avant = "";
          for (let i = 0; i < ev.results.length - 1; i++) avant += ev.results[i][0].transcript + " ";
          const der = ev.results[ev.results.length - 1];
          const base = (acquis + " " + avant).trim();
          texte = (base + " " + der[0].transcript).trim();
          alts = Array.from(der).slice(1).map(x => (base + " " + x.transcript).trim());
          surTexte(texte);
          if (juger([texte, ...alts])) { conclure("ok"); return; }
          const attendre = enCours();
          clearTimeout(tSilence);
          tSilence = setTimeout(() => conclure("fin"), attendre ? SILENCE_DEBUT : SILENCE);
          if (attendre) prolonger(SILENCE_DEBUT + 1500);
        };
        r.onerror = ev => {
          if (!actif() || ev.error === "aborted") return;
          if (ev.error === "no-speech") { if (!enCours()) conclure("fin"); return; }   // sinon onend relance
          conclure("erreur", ev.error);
        };
        r.onend = () => {
          if (!actif()) return;
          if (enCours() && relances < ECOUTE.relances && ecoule() < MAX_TOTAL) { relances++; acquis = texte; demarrer(); return; }
          conclure("fin");
        };
        try { r.start(); } catch (e) { conclure("erreur", e.message); }
      }
      demarrer();
    });
  }
  function arreterEcoute() { if (recoCourante) { try { recoCourante.abort(); } catch (e) {} recoCourante = null; } }

  return {
    get voixFr() { return voixFr; }, chargerVoix, recoDispo: !!Reco,
    regler(r) { reglages = Object.assign(reglages, r); },
    surParle(f) { surParle = f; },
    parler, filou, lettre, syllabe, jouerFichier, son, miaou, stop, ecouter, arreterEcoute, contexte, deverrouiller,
  };
})();

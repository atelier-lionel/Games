/* Filou lit — dessins : Filou et ses accessoires, décors des mondes, croquette, étoile (V2)
   (la maison de Filou est dans maison.js) */
"use strict";

var DESSINS = (function () {
  const ORANGE = "#E9A35A", ORANGE_FONCE = "#C9782F", CREME = "#F6D3A6", ROSE = "#F2A7A0";

  /* ---------- Filou (chat original beige-orange) ---------- */
  const VIEWBOX_FILOU = "0 -26 200 234";
  function filou() {
    return `
<g class="acc acc-dos"></g>
<path class="queue" d="M48 162 C10 150 8 105 30 95 C40 90 46 100 38 108 C26 120 32 145 58 150 Z" fill="${ORANGE}" stroke="${ORANGE_FONCE}" stroke-width="3"/>
<ellipse cx="100" cy="160" rx="52" ry="36" fill="${ORANGE}" stroke="${ORANGE_FONCE}" stroke-width="3"/>
<ellipse cx="100" cy="168" rx="28" ry="22" fill="${CREME}"/>
<ellipse cx="78" cy="192" rx="15" ry="8" fill="${CREME}" stroke="${ORANGE_FONCE}" stroke-width="3"/>
<ellipse cx="122" cy="192" rx="15" ry="8" fill="${CREME}" stroke="${ORANGE_FONCE}" stroke-width="3"/>
<g class="acc acc-cou"></g>
<g class="acc acc-taille"></g>
<g class="tete">
  <path d="M50 70 L46 18 L88 46 Z" fill="${ORANGE}" stroke="${ORANGE_FONCE}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M150 70 L154 18 L112 46 Z" fill="${ORANGE}" stroke="${ORANGE_FONCE}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M56 58 L54 32 L76 48 Z" fill="${ROSE}"/><path d="M144 58 L146 32 L124 48 Z" fill="${ROSE}"/>
  <ellipse cx="100" cy="84" rx="58" ry="50" fill="${ORANGE}" stroke="${ORANGE_FONCE}" stroke-width="3"/>
  <path d="M88 38 Q92 50 90 58 M100 36 L100 56 M112 38 Q108 50 110 58" stroke="${ORANGE_FONCE}" stroke-width="4" stroke-linecap="round" fill="none"/>
  <ellipse cx="100" cy="102" rx="30" ry="22" fill="${CREME}"/>
  <ellipse cx="78" cy="82" rx="10" ry="12" fill="#2B2B2B"/><ellipse cx="122" cy="82" rx="10" ry="12" fill="#2B2B2B"/>
  <circle cx="81" cy="78" r="3.5" fill="#fff"/><circle cx="125" cy="78" r="3.5" fill="#fff"/>
  <rect class="paupiere" x="66" y="69" width="24" height="26" rx="12" fill="${ORANGE}"/>
  <rect class="paupiere" x="110" y="69" width="24" height="26" rx="12" fill="${ORANGE}"/>
  <ellipse cx="62" cy="100" rx="9" ry="5" fill="${ROSE}" opacity=".6"/><ellipse cx="138" cy="100" rx="9" ry="5" fill="${ROSE}" opacity=".6"/>
  <path d="M94 95 L106 95 L100 102 Z" fill="#E07A86"/>
  <path d="M100 102 Q100 108 93 109 M100 102 Q100 108 107 109" stroke="#7A4A2A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <ellipse class="bouche" cx="100" cy="112" rx="4" ry="2" fill="#7A4A2A"/>
  <path d="M70 100 L40 94 M70 105 L40 108 M130 100 L160 94 M130 105 L160 108" stroke="#7A4A2A" stroke-width="2" stroke-linecap="round"/>
  <g class="acc acc-yeux"></g>
  <g class="acc acc-tete"></g>
</g>
<g class="acc acc-patte"></g>`;
  }

  /* ---------- Accessoires (coordonnées dans le repère de Filou) ---------- */
  const ACC = {
    fleur: { vb: "38 16 48 48", svg: (() => {
      let p = ""; for (let i = 0; i < 5; i++) { const a = i * 72 * Math.PI / 180; p += `<circle cx="${62 + 9 * Math.cos(a)}" cy="${40 + 9 * Math.sin(a)}" r="8" fill="#FF8FB1" stroke="#E0607F" stroke-width="1.5"/>`; }
      return p + `<circle cx="62" cy="40" r="6" fill="#FFD54A"/>`; })() },
    noeud: { vb: "72 112 56 40", svg: `<path d="M100 132 L78 118 L78 146 Z" fill="#D7362C" stroke="#9C2119" stroke-width="2.5" stroke-linejoin="round"/><path d="M100 132 L122 118 L122 146 Z" fill="#D7362C" stroke="#9C2119" stroke-width="2.5" stroke-linejoin="round"/><circle cx="100" cy="132" r="7" fill="#E9524A" stroke="#9C2119" stroke-width="2.5"/><circle cx="86" cy="128" r="2" fill="#fff" opacity=".7"/><circle cx="114" cy="128" r="2" fill="#fff" opacity=".7"/>` },
    lunettes: { vb: "52 58 96 48", svg: `<circle cx="78" cy="82" r="17" fill="rgba(190,225,255,.35)" stroke="#2B2B2B" stroke-width="4"/><circle cx="122" cy="82" r="17" fill="rgba(190,225,255,.35)" stroke="#2B2B2B" stroke-width="4"/><path d="M95 80 Q100 75 105 80" stroke="#2B2B2B" stroke-width="4" fill="none"/><path d="M61 79 L50 74 M139 79 L150 74" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round"/>` },
    chapeau: { vb: "70 -26 60 70", svg: `<g transform="rotate(-8 100 40)"><path d="M100 -14 L78 40 L122 40 Z" fill="#6C5CE7" stroke="#4B3DB8" stroke-width="2.5" stroke-linejoin="round"/><path d="M93 4 L107 4 L111 14 L89 14 Z M85 24 L115 24 L118 32 L82 32 Z" fill="#FFD54A"/><circle cx="100" cy="-15" r="8" fill="#FF8FB1" stroke="#E0607F" stroke-width="2"/></g>` },
    echarpe: { vb: "52 112 96 76", svg: `<path d="M58 122 Q100 142 142 122 L144 136 Q100 158 56 136 Z" fill="#2F8FD8" stroke="#1D639C" stroke-width="2.5"/><path d="M116 136 L136 134 L134 180 L114 176 Z" fill="#2F8FD8" stroke="#1D639C" stroke-width="2.5"/><path d="M80 134 L84 147 M100 138 L100 152 M120 134 L116 147 M115 154 L135 156 M114 166 L134 168" stroke="#fff" stroke-width="4"/>` },
    couronne: { vb: "64 0 72 50", svg: `<path d="M72 42 L70 14 L86 28 L100 6 L114 28 L130 14 L128 42 Z" fill="#F5B931" stroke="#C98A10" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="32" r="5" fill="#D7362C"/><circle cx="83" cy="35" r="3.5" fill="#2F8FD8"/><circle cx="117" cy="35" r="3.5" fill="#2E9150"/><circle cx="100" cy="6" r="4" fill="#fff" stroke="#C98A10" stroke-width="2"/>` },
    cape: { vb: "34 114 132 104", svg: `<path d="M70 122 Q100 134 130 122 L162 204 Q100 218 38 204 Z" fill="#D7362C" stroke="#9C2119" stroke-width="3" stroke-linejoin="round"/><path d="M78 132 Q100 140 122 132 L146 196 Q100 206 54 196 Z" fill="#E9524A" opacity=".6"/>` },
  };
  // V2 : collections forêt, plage, montagne
  Object.assign(ACC, {
    foulard: { vb: "54 112 92 64", svg: `<path d="M58 122 Q100 142 142 122 L140 134 Q100 152 60 134 Z" fill="#2E8B57" stroke="#1D5E3A" stroke-width="2.5"/><path d="M78 138 Q100 146 122 138 L100 172 Z" fill="#2E8B57" stroke="#1D5E3A" stroke-width="2.5" stroke-linejoin="round"/><circle cx="92" cy="146" r="2.6" fill="#fff"/><circle cx="106" cy="148" r="2.6" fill="#fff"/><circle cx="100" cy="158" r="2.6" fill="#fff"/><circle cx="74" cy="132" r="2.4" fill="#fff"/><circle cx="126" cy="132" r="2.4" fill="#fff"/>` },
    lutin: { vb: "56 -30 112 86", svg: `<path d="M66 48 Q72 -6 118 -18 Q140 -24 158 -10 Q138 -6 132 8 Q128 26 136 48 Z" fill="#3E9B5B" stroke="#226B3A" stroke-width="3" stroke-linejoin="round"/><path d="M60 44 Q100 30 140 44 L140 56 Q100 42 60 56 Z" fill="#D7362C" stroke="#9C2119" stroke-width="2.5" stroke-linejoin="round"/><circle cx="160" cy="-10" r="8" fill="#F5B931" stroke="#C98A10" stroke-width="2.5"/><path d="M84 30 Q96 10 116 4" stroke="#7FD19A" stroke-width="4" fill="none" stroke-linecap="round"/>` },
    sacados: { vb: "16 104 60 92", svg: `<rect x="22" y="112" width="46" height="74" rx="14" fill="#C9782F" stroke="#8A5328" stroke-width="3"/><path d="M22 136 Q45 124 68 136 L68 120 Q68 112 58 112 L32 112 Q22 112 22 120 Z" fill="#E9A35A" stroke="#8A5328" stroke-width="3"/><rect x="38" y="132" width="14" height="10" rx="3" fill="#F5B931" stroke="#8A5328" stroke-width="2"/><rect x="30" y="152" width="30" height="22" rx="6" fill="#B96A2B" stroke="#8A5328" stroke-width="2"/>` },
    feuilles: { vb: "50 18 100 46", svg: (() => {
      let p = ""; const cols = ["#3E9B5B", "#E9A35A", "#5DB86F", "#D7662C", "#3E9B5B", "#F5B931", "#5DB86F"];
      for (let i = 0; i < 7; i++) { const t = i / 6, x = 60 + 80 * t, y = 54 - 26 * Math.sin(Math.PI * t), a = -60 + 120 * t;
        p += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="8" ry="15" transform="rotate(${a.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${cols[i]}" stroke="#2A5E2E" stroke-width="1.5"/>`; }
      return p + `<circle cx="100" cy="30" r="5" fill="#D7362C"/><circle cx="108" cy="33" r="4" fill="#D7362C"/>`; })() },
    lanterne: { vb: "136 100 64 108", svg: `<path d="M152 122 Q168 96 184 122" stroke="#5B4636" stroke-width="4" fill="none"/><rect x="148" y="122" width="40" height="8" rx="3" fill="#5B4636"/><rect x="152" y="130" width="32" height="46" rx="6" fill="#FFE27A" stroke="#5B4636" stroke-width="4"/><circle cx="168" cy="153" r="16" fill="#FFF3B0" opacity=".9"/><path d="M168 144 Q174 152 168 162 Q162 152 168 144 Z" fill="#F59B23"/><rect x="148" y="176" width="40" height="8" rx="3" fill="#5B4636"/><circle cx="168" cy="153" r="34" fill="#FFE27A" opacity=".18"/>` },
    loupe: { vb: "126 104 76 96", svg: `<path d="M150 172 L132 196" stroke="#8A5328" stroke-width="10" stroke-linecap="round"/><circle cx="166" cy="146" r="26" fill="rgba(190,230,255,.45)" stroke="#C98A10" stroke-width="7"/><path d="M152 134 Q160 126 170 126" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>` },
    soleil: { vb: "52 62 96 40", svg: `<path d="M78 98 C62 88 58 72 68 68 C74 66 78 70 78 74 C78 70 82 66 88 68 C98 72 94 88 78 98 Z" fill="#2B2B2B" stroke="#FF5D8F" stroke-width="3.5"/><path d="M122 98 C106 88 102 72 112 68 C118 66 122 70 122 74 C122 70 126 66 132 68 C142 72 138 88 122 98 Z" fill="#2B2B2B" stroke="#FF5D8F" stroke-width="3.5"/><path d="M92 76 Q100 71 108 76" stroke="#FF5D8F" stroke-width="3.5" fill="none"/><path d="M66 72 L54 68 M134 72 L146 68" stroke="#FF5D8F" stroke-width="3.5" stroke-linecap="round"/><path d="M68 76 Q72 72 76 74" stroke="#fff" stroke-width="2.5" fill="none" opacity=".7"/>` },
    paille: { vb: "28 -2 144 60", svg: `<ellipse cx="100" cy="42" rx="70" ry="14" fill="#EBC873" stroke="#B98E2F" stroke-width="3"/><path d="M66 42 Q66 6 100 4 Q134 6 134 42 Z" fill="#F2D58A" stroke="#B98E2F" stroke-width="3"/><path d="M67 30 Q100 38 133 30 L134 40 Q100 48 66 40 Z" fill="#D7362C"/><path d="M42 42 Q100 56 158 42 M76 16 Q100 12 124 16" stroke="#C9A24A" stroke-width="2" fill="none"/><circle cx="128" cy="34" r="6" fill="#FF8FB1"/>` },
    seau: { vb: "134 120 70 88", svg: `<path d="M182 132 L170 196" stroke="#D7362C" stroke-width="5" stroke-linecap="round"/><path d="M176 126 Q182 116 190 124 L186 136 Z" fill="#D7362C"/><path d="M144 160 L194 160 L188 202 L150 202 Z" fill="#2F8FD8" stroke="#1D639C" stroke-width="3" stroke-linejoin="round"/><path d="M146 160 Q169 132 192 160" stroke="#1D639C" stroke-width="3" fill="none"/><path d="M147 172 L191 172" stroke="#FFD54A" stroke-width="5"/>` },
    coquillages: { vb: "58 116 84 44", svg: `<path d="M62 124 Q100 152 138 124" stroke="#C9A27A" stroke-width="2.5" fill="none"/>${[[70, 131, "#FFB3C1"], [84, 139, "#FFE0A3"], [100, 142, "#FFFFFF"], [116, 139, "#FFB3C1"], [130, 131, "#FFE0A3"]].map(([x, y, c]) => `<g transform="translate(${x} ${y})"><path d="M-7 4 Q0 -10 7 4 Z" fill="${c}" stroke="#D68A9A" stroke-width="1.5"/><path d="M0 -5 L0 4 M-3.5 -2 L-2 4 M3.5 -2 L2 4" stroke="#D68A9A" stroke-width="1"/></g>`).join("")}` },
    bouee: { vb: "34 132 140 72", svg: `<path d="M44 160 Q100 204 156 160" stroke="#FFD54A" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M44 160 Q100 204 156 160" stroke="#FF8A3D" stroke-width="20" fill="none" stroke-dasharray="18 26" stroke-linecap="butt"/><path d="M50 166 Q100 200 150 166" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/><circle cx="160" cy="148" r="13" fill="#FFD54A" stroke="#E0A800" stroke-width="2.5"/><path d="M170 148 L182 151 L170 155 Z" fill="#FF8A3D"/><circle cx="163" cy="144" r="2.2" fill="#2B2B2B"/>` },
    plongee: { vb: "46 26 128 84", svg: `<path d="M56 82 L44 78 M144 82 L156 78" stroke="#2F8FD8" stroke-width="7" stroke-linecap="round"/><rect x="56" y="62" width="88" height="40" rx="16" fill="rgba(170,225,255,.55)" stroke="#1D639C" stroke-width="5"/><path d="M96 102 Q100 92 104 102" fill="#F2A7A0" stroke="#1D639C" stroke-width="3"/><path d="M66 70 Q72 66 80 67" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M150 92 L158 92 L158 36" stroke="#FF8A3D" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="153" y="28" width="10" height="10" rx="3" fill="#FFD54A"/>` },
    grelot: { vb: "54 112 92 52", svg: `<path d="M58 122 Q100 142 142 122 L141 132 Q100 152 59 132 Z" fill="#D7362C" stroke="#9C2119" stroke-width="2.5"/><circle cx="100" cy="148" r="10" fill="#F5B931" stroke="#C98A10" stroke-width="3"/><path d="M92 148 L108 148" stroke="#C98A10" stroke-width="2.5"/><circle cx="100" cy="153" r="2.4" fill="#7A5200"/><circle cx="96" cy="144" r="2" fill="#fff" opacity=".7"/>` },
    pompon: { vb: "50 -16 100 76", svg: `<path d="M56 54 Q56 8 100 6 Q144 8 144 54 Z" fill="#2F8FD8" stroke="#1D639C" stroke-width="3"/><path d="M64 28 Q100 18 136 28 M58 42 Q100 32 142 42" stroke="#fff" stroke-width="5" fill="none"/><path d="M52 48 Q100 38 148 48 L148 60 Q100 50 52 60 Z" fill="#D7362C" stroke="#9C2119" stroke-width="2.5"/><circle cx="100" cy="2" r="13" fill="#fff" stroke="#C9D6D3" stroke-width="2"/><circle cx="96" cy="-2" r="4" fill="#EEF4F2"/>` },
    oreilles: { vb: "26 16 148 80", svg: `<path d="M50 72 Q46 18 100 18 Q154 18 150 72" stroke="#9B6CD8" stroke-width="7" fill="none"/><circle cx="46" cy="76" r="17" fill="#FFB3D1" stroke="#E07AA5" stroke-width="3"/><circle cx="154" cy="76" r="17" fill="#FFB3D1" stroke="#E07AA5" stroke-width="3"/><circle cx="41" cy="70" r="4" fill="#fff" opacity=".8"/><circle cx="149" cy="70" r="4" fill="#fff" opacity=".8"/>` },
    ski: { vb: "38 56 124 48", svg: `<path d="M42 80 Q100 70 158 80" stroke="#2B2B2B" stroke-width="10" fill="none"/><path d="M42 80 Q100 70 158 80" stroke="#FF8A3D" stroke-width="10" fill="none" stroke-dasharray="10 8"/><rect x="58" y="62" width="84" height="38" rx="18" fill="#B07BE0" stroke="#2B2B2B" stroke-width="5"/><path d="M62 88 Q100 78 138 88 L136 96 Q100 102 64 96 Z" fill="#FF9AA8" opacity=".9"/><path d="M68 92 Q100 86 132 92" stroke="#FFD54A" stroke-width="3" fill="none"/><path d="M68 72 Q80 64 96 66" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/>` },
    luge: { vb: "128 150 82 64", svg: `<path d="M138 196 L196 196 Q206 196 204 186" stroke="#5B4636" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M146 196 L148 186 M186 196 L184 186" stroke="#5B4636" stroke-width="4"/><rect x="138" y="170" width="62" height="16" rx="5" fill="#D7362C" stroke="#9C2119" stroke-width="3"/><path d="M150 170 L150 186 M164 170 L164 186 M178 170 L178 186" stroke="#9C2119" stroke-width="2"/><path d="M200 172 Q210 160 198 156" stroke="#F5B931" stroke-width="3" fill="none"/>` },
  });
  const ZONES = ["dos", "cou", "taille", "yeux", "tete", "patte"];

  function habiller(svg, porte) {
    ZONES.forEach(z => {
      const g = svg.querySelector(".acc-" + z); if (!g) return;
      const id = porte && porte[z];
      g.innerHTML = id && ACC[id] ? ACC[id].svg : "";
    });
  }
  function apercu(id) { const a = ACC[id]; return `<svg viewBox="${a.vb}" aria-hidden="true">${a.svg}</svg>`; }
  /* Filou doré (statue de la maison) : même dessin, couleurs or, sans accessoires ni clignement */
  function filouDore() {
    return filou().replace(/<g class="acc[^"]*"><\/g>/g, "").replace(/ class="paupiere"/g, ' opacity="0"').replace(/ class="queue"/g, "")
      .replace(/#E9A35A/g, "#F2C94C").replace(/#C9782F/g, "#B8860B").replace(/#F6D3A6/g, "#FFE58A").replace(/#F2A7A0/g, "#E9B949")
      .replace(/#2B2B2B/g, "#A87B12").replace(/#E07A86/g, "#D9A520").replace(/#7A4A2A/g, "#8C6510");
  }

  /* ---------- Petits objets ---------- */
  const croquette = () => `<svg class="croq" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3 C31 3 37 11 36 20 C37 30 30 37 20 37 C9 37 3 29 4 20 C3 10 10 3 20 3 Z" fill="#A8652B"/><path d="M20 8 C28 8 32 13 31 20 C32 27 27 32 20 32 C12 32 8 27 9 20 C8 13 12 8 20 8 Z" fill="#C58447"/><circle cx="15" cy="16" r="2.4" fill="#7E461A"/><circle cx="25" cy="15" r="2.4" fill="#7E461A"/><circle cx="20" cy="24" r="2.4" fill="#7E461A"/><path d="M12 11 Q16 8 21 8" stroke="#E9B17A" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`;
  const etoile = (pleine = true) => `<svg viewBox="0 0 100 96" aria-hidden="true"><path d="M50 4 L62 36 L96 37 L69 58 L79 92 L50 72 L21 92 L31 58 L4 37 L38 36 Z" fill="${pleine ? "#F5B931" : "#D9E2E0"}" stroke="${pleine ? "#C98A10" : "#B9C6C3"}" stroke-width="5" stroke-linejoin="round"/>${pleine ? '<path d="M36 40 L50 14" stroke="#FFE7A3" stroke-width="6" stroke-linecap="round"/>' : ""}</svg>`;

  /* ---------- Décors (repère 1000 × 600, rempli sans déformation) ---------- */
  function alea(graine) { let s = graine; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  function nuages(r, n, y0, y1) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const x = 80 + r() * 840, y = y0 + r() * (y1 - y0), k = 0.6 + r() * 0.7;
      s += `<g opacity=".9" transform="translate(${x} ${y}) scale(${k})"><ellipse cx="0" cy="0" rx="60" ry="22" fill="#fff"/><ellipse cx="-28" cy="-10" rx="30" ry="22" fill="#fff"/><ellipse cx="22" cy="-16" rx="34" ry="26" fill="#fff"/></g>`;
    }
    return s;
  }
  function jardin() {
    const r = alea(7); let fleurs = "";
    for (let i = 0; i < 70; i++) {
      const x = r() * 1000, y = 450 + r() * 150, c = ["#FF8FB1", "#FFD54A", "#FFFFFF", "#B39DFF", "#FF9E5E"][i % 5], k = 0.6 + r() * 0.8;
      fleurs += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${k.toFixed(2)})"><path d="M0 0 L0 18" stroke="#4E9A3C" stroke-width="3"/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${(6 * Math.cos(a * Math.PI / 180)).toFixed(1)}" cy="${(6 * Math.sin(a * Math.PI / 180)).toFixed(1)}" r="5" fill="${c}"/>`).join("")}<circle r="3.5" fill="#F5A623"/></g>`;
    }
    let buissons = "";
    for (let i = 0; i < 6; i++) { const x = 60 + i * 180 + r() * 60, y = 395 + r() * 25; buissons += `<g transform="translate(${x} ${y})"><circle r="34" fill="#5FAE4E"/><circle cx="30" cy="8" r="26" fill="#6BBB58"/><circle cx="-28" cy="10" r="24" fill="#57A548"/></g>`; }
    return `<defs><linearGradient id="cielJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD6F5"/><stop offset="1" stop-color="#E8F7FF"/></linearGradient></defs>
<rect width="1000" height="600" fill="url(#cielJ)"/>
<circle cx="860" cy="95" r="90" fill="#FFF3B0" opacity=".5"/><circle cx="860" cy="95" r="55" fill="#FFE27A"/>
${nuages(r, 4, 60, 190)}
<path d="M0 360 Q160 290 340 330 T700 310 T1000 330 V600 H0 Z" fill="#B5DE96"/>
<path d="M0 420 Q250 360 520 410 T1000 400 V600 H0 Z" fill="#8ACB6C"/>
${buissons}
<path d="M0 470 Q300 430 600 465 T1000 455 V600 H0 Z" fill="#78BE5B"/>
${fleurs}`;
  }
  function foret() {
    const r = alea(11); let sapins = "", arbres = "", champis = "";
    for (let i = 0; i < 22; i++) { const x = i * 48 + r() * 20, h = 150 + r() * 90, y = 360; sapins += `<path d="M${x} ${y - h} L${x - 40} ${y} L${x + 40} ${y} Z" fill="${i % 2 ? "#5E9E74" : "#6BAA7F"}" opacity=".75"/>`; }
    for (let i = 0; i < 9; i++) { const x = 30 + i * 120 + r() * 40, y = 430 + r() * 20, k = 0.8 + r() * 0.5;
      arbres += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${k.toFixed(2)})"><rect x="-10" y="-20" width="20" height="70" rx="6" fill="#8A5A34"/><circle cy="-60" r="52" fill="#3F8F5A"/><circle cx="-34" cy="-34" r="36" fill="#367F4F"/><circle cx="36" cy="-38" r="38" fill="#4A9C64"/></g>`; }
    for (let i = 0; i < 10; i++) { const x = 40 + r() * 920, y = 520 + r() * 60, k = 0.6 + r() * 0.6;
      champis += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${k.toFixed(2)})"><rect x="-6" y="-4" width="12" height="20" rx="5" fill="#FFF4E3"/><path d="M-22 -2 Q0 -32 22 -2 Z" fill="#E2483D"/><circle cx="-8" cy="-12" r="3.5" fill="#fff"/><circle cx="7" cy="-16" r="3" fill="#fff"/><circle cx="12" cy="-7" r="2.5" fill="#fff"/></g>`; }
    return `<defs><linearGradient id="cielF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE5D2"/><stop offset="1" stop-color="#EEF9F2"/></linearGradient>
<radialGradient id="rayon" cx=".75" cy="0" r=".9"><stop offset="0" stop-color="#FFF6C8" stop-opacity=".8"/><stop offset="1" stop-color="#FFF6C8" stop-opacity="0"/></radialGradient></defs>
<rect width="1000" height="600" fill="url(#cielF)"/><rect width="1000" height="600" fill="url(#rayon)"/>
${nuages(r, 3, 50, 140)}
${sapins}
<path d="M0 400 Q250 370 500 395 T1000 385 V600 H0 Z" fill="#7DBB62"/>
${arbres}
<path d="M0 500 Q300 470 600 495 T1000 490 V600 H0 Z" fill="#6AAE52"/>
${champis}`;
  }
  function plage() {
    const r = alea(5); let vagues = "", coquillages = "";
    for (let i = 0; i < 9; i++) { const y = 318 + i * 12; vagues += `<path d="M${-40 + (i % 2) * 30} ${y} q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" stroke="#fff" stroke-width="2.5" fill="none" opacity="${0.5 - i * 0.04}"/>`; }
    for (let i = 0; i < 14; i++) { const x = r() * 1000, y = 470 + r() * 120, k = 0.6 + r() * 0.6;
      coquillages += i % 3 === 0
        ? `<path transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${k.toFixed(2)})" d="M0 -14 L4 -4 L15 -4 L6 3 L10 14 L0 7 L-10 14 L-6 3 L-15 -4 L-4 -4 Z" fill="#FF9E5E"/>`
        : `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${k.toFixed(2)})"><path d="M-12 6 Q0 -18 12 6 Z" fill="#FFE0E6" stroke="#E7A5B3" stroke-width="1.5"/><path d="M0 -10 L0 6 M-6 -6 L-4 6 M6 -6 L4 6" stroke="#E7A5B3" stroke-width="1.2"/></g>`; }
    return `<defs><linearGradient id="cielP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86CFF4"/><stop offset="1" stop-color="#DDF3FD"/></linearGradient>
<linearGradient id="mer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E97CF"/><stop offset="1" stop-color="#5CC3E6"/></linearGradient></defs>
<rect width="1000" height="600" fill="url(#cielP)"/>
<circle cx="150" cy="90" r="85" fill="#FFF3B0" opacity=".5"/><circle cx="150" cy="90" r="52" fill="#FFE27A"/>
${nuages(r, 4, 50, 170)}
<rect y="300" width="1000" height="170" fill="url(#mer)"/>${vagues}
<g transform="translate(720 300)"><path d="M-50 0 L50 0 L36 22 L-36 22 Z" fill="#B9502E"/><path d="M0 0 L0 -70" stroke="#6B4226" stroke-width="4"/><path d="M2 -68 L42 -8 L2 -8 Z" fill="#fff"/><path d="M-2 -60 L-30 -10 L-2 -10 Z" fill="#FFD54A"/></g>
<path d="M0 420 Q200 395 420 415 T1000 405 V600 H0 Z" fill="#F4D9A0"/>
<path d="M0 470 Q300 450 620 468 T1000 462 V600 H0 Z" fill="#EFCB85"/>
<g transform="translate(890 470)"><path d="M0 0 Q-14 -120 18 -230" stroke="#8A5A34" stroke-width="16" fill="none" stroke-linecap="round"/>
<g transform="translate(18 -232)" fill="#3F9A55"><path d="M0 0 Q-60 -30 -110 10 Q-60 -10 0 0Z"/><path d="M0 0 Q60 -40 110 0 Q60 -14 0 0Z"/><path d="M0 0 Q-30 -70 -80 -80 Q-36 -40 0 0Z"/><path d="M0 0 Q30 -70 84 -76 Q40 -40 0 0Z"/><path d="M0 0 Q-80 20 -100 70 Q-50 20 0 0Z"/><path d="M0 0 Q80 20 96 74 Q50 20 0 0Z"/></g>
<circle cx="10" cy="-222" r="9" fill="#7E5A2A"/><circle cx="26" cy="-220" r="9" fill="#7E5A2A"/></g>
${coquillages}`;
  }
  function montagne() {
    const r = alea(13); let sapins = "", flocons = "";
    const sapin = (x, y, k) => `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${k.toFixed(2)})"><rect x="-6" y="-6" width="12" height="22" fill="#7A5634"/><path d="M0 -96 L-34 -40 L-20 -40 L-44 0 L44 0 L20 -40 L34 -40 Z" fill="#2F7A57"/><path d="M0 -96 L-16 -70 Q0 -62 16 -70 Z M-30 -40 Q-8 -30 14 -40 L20 -40 Q4 -46 -20 -40 Z M-44 0 Q-10 -12 30 -4 L44 0 Z" fill="#fff"/></g>`;
    for (let i = 0; i < 12; i++) { const x = 20 + i * 88 + r() * 30, y = 470 + r() * 40, k = 0.6 + r() * 0.5; sapins += sapin(x, y, k); }
    for (let i = 0; i < 40; i++) { const x = r() * 1000, y = r() * 560, k = 1.5 + r() * 3; flocons += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${k.toFixed(1)}" fill="#fff" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`; }
    return `<defs><linearGradient id="cielM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9CBEA"/><stop offset="1" stop-color="#EAF4FB"/></linearGradient>
<linearGradient id="rocM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FA6C2"/><stop offset="1" stop-color="#B9CADD"/></linearGradient></defs>
<rect width="1000" height="600" fill="url(#cielM)"/>
<circle cx="830" cy="90" r="80" fill="#FFF7D1" opacity=".55"/><circle cx="830" cy="90" r="48" fill="#FFE9A0"/>
${nuages(r, 3, 50, 150)}
<path d="M-20 400 L170 140 L260 250 L380 90 L520 300 L640 170 L800 330 L900 220 L1020 380 V600 H-20 Z" fill="url(#rocM)"/>
<path d="M170 140 L128 198 L150 192 L168 210 L190 186 L214 200 Z M380 90 L330 158 L356 150 L380 172 L404 146 L436 168 Z M640 170 L600 222 L624 216 L644 232 L664 212 L690 224 Z M900 220 L866 266 L888 260 L904 274 L922 256 L944 270 Z" fill="#fff"/>
<path d="M0 420 Q200 360 420 400 T1000 380 V600 H0 Z" fill="#F4F9FD"/>
<path d="M0 470 Q260 430 560 462 T1000 450 V600 H0 Z" fill="#E3EEF7"/>
<g transform="translate(150 430)"><rect x="-50" y="-50" width="100" height="56" fill="#A0673B" stroke="#7A4A28" stroke-width="3"/><path d="M-66 -46 L0 -96 L66 -46 Z" fill="#7A4A28"/><path d="M-70 -44 L0 -100 L70 -44 L60 -40 L0 -86 L-60 -40 Z" fill="#fff"/><rect x="-14" y="-26" width="28" height="32" fill="#5B3A1E"/><rect x="22" y="-38" width="20" height="18" fill="#FFE27A" stroke="#7A4A28" stroke-width="3"/><rect x="28" y="-110" width="14" height="30" fill="#8A5A34"/><circle cx="40" cy="-122" r="9" fill="#fff" opacity=".7"/><circle cx="52" cy="-138" r="12" fill="#fff" opacity=".5"/></g>
${sapins}
<path d="M0 530 Q300 505 640 525 T1000 520 V600 H0 Z" fill="#FFFFFF"/>
<g class="flocons">${flocons}</g>`;
  }
  const DECORS = { jardin, foret, plage, montagne };
  const cacheDecor = {};
  function decor(nom) {
    if (!cacheDecor[nom]) cacheDecor[nom] = `<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${DECORS[nom]()}</svg>`;
    return cacheDecor[nom];
  }

  return { VIEWBOX_FILOU, filou, filouDore, habiller, apercu, ACC, ZONES, croquette, etoile, decor };
})();

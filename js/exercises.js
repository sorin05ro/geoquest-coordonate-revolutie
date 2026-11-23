// Formele de exercițiu. Fiecare întoarce un controller:
//   { el, citeste() -> stare|null (null = incomplet), evalueaza(stare) -> 0..1, solutie() -> Node, indiciu() -> text|null }
import { h, amesteca } from './ui.js';
import { sePotriveste } from './normalize.js';
import { retea } from './retea.js';

const LITERE = 'abcdefgh';

export function creeaza(q, opt = {}) {
  const f = TIPURI[q.tip];
  if (!f) return { el: h('p', {}, 'Tip necunoscut: ' + q.tip), citeste: () => ({}), evalueaza: () => 0, solutie: () => h('span') };
  const c = f(q, opt);
  c.el.classList.add('exercitiu', 'ex-' + q.tip);
  return c;
}

// -------------------------------------------------------------- 1. grilă
function grila(q, opt) {
  let ales = null, eliminate = new Set();
  const ordine = q.variante.map((v, i) => i);
  const butoane = ordine.map(i => h('button', { class: 'varianta', type: 'button', 'aria-pressed': 'false', onclick: () => alege(i) },
    h('span', { class: 'litera' }, LITERE[i] + '.'), ' ', q.variante[i]));
  function alege(i) { if (eliminate.has(i)) return; ales = i; butoane.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i))); opt.onSchimbare?.(); }
  const el = h('div', {}, h('div', { class: 'variante' }, butoane));
  return {
    el, citeste: () => ales === null ? null : ales,
    _rezolva: () => q.corect,
    evalueaza: (s) => s === q.corect ? 1 : 0,
    marcheaza: (s) => butoane.forEach((b, j) => { if (j === q.corect) b.classList.add('corect'); else if (j === s) b.classList.add('gresit'); }),
    solutie: () => h('span', {}, 'Răspuns corect: ', h('strong', {}, `${LITERE[q.corect]}. ${q.variante[q.corect]}`)),
    indiciu: () => {
      const gresite = amesteca(q.variante.map((_, i) => i).filter(i => i !== q.corect && !eliminate.has(i))).slice(0, Math.max(0, q.variante.length - 2));
      gresite.forEach(i => { eliminate.add(i); butoane[i].disabled = true; butoane[i].classList.add('eliminat'); if (ales === i) ales = null; });
      return 'Am eliminat două variante greșite (50/50).';
    }
  };
}

// -------------------------------------------------------------- 2. completare
function completare(q, opt) {
  const inp = h('input', { type: 'text', class: 'camp', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Răspunsul tău', placeholder: 'Scrie răspunsul…', oninput: () => opt.onSchimbare?.(),
    onkeydown: (e) => { if (e.key === 'Enter') opt.onEnter?.(); } });
  const enunt = q.enunt.split('……');
  const el = h('div', {}, h('p', { class: 'lacunar' }, enunt[0], h('span', { class: 'gol' }, '……'), enunt[1] || ''), inp);
  return {
    el, citeste: () => inp.value.trim() ? inp.value.trim() : null,
    _rezolva: () => q.raspunsuri_acceptate[0],
    evalueaza: (s) => sePotriveste(s, q.raspunsuri_acceptate) ? 1 : 0,
    marcheaza: (s) => inp.classList.add(sePotriveste(s, q.raspunsuri_acceptate) ? 'corect' : 'gresit'),
    solutie: () => h('span', {}, 'Răspuns corect: ', h('strong', {}, q.raspunsuri_acceptate[0])),
    indiciu: () => q.indiciu || `Începe cu „${q.raspunsuri_acceptate[0].slice(0, 2)}…”.`
  };
}

// -------------------------------------------------------------- 3. adevărat / fals
function adevaratFals(q, opt) {
  let ales = null;
  const b = [true, false].map(v => h('button', { class: 'varianta af', type: 'button', 'aria-pressed': 'false', onclick: () => { ales = v; b.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === String(v)))); opt.onSchimbare?.(); }, 'data-v': String(v) }, v ? '✓ Adevărat' : '✗ Fals'));
  return {
    el: h('div', { class: 'variante doua' }, b), citeste: () => ales,
    _rezolva: () => q.adevarat,
    evalueaza: (s) => s === q.adevarat ? 1 : 0,
    marcheaza: (s) => b.forEach(x => { if (x.dataset.v === String(q.adevarat)) x.classList.add('corect'); else if (x.dataset.v === String(s)) x.classList.add('gresit'); }),
    solutie: () => h('span', {}, 'Afirmația este ', h('strong', {}, q.adevarat ? 'adevărată' : 'falsă'), '. Din fișă: „', q.sursa, '”'),
    indiciu: () => 'Gândește-te la fișa „' + ({ pozitie: 'Poziție, limite și țărmuri', relief: 'Relieful', ape: 'Apele', clima: 'Climă, vegetație și faună' }[q.lectie] || 'lecției') + '”.'
  };
}

// -------------------------------------------------------------- 4. potrivire (atinge în A, apoi în B)
function potrivire(q, opt) {
  const perechi = {}; let selA = null;
  const cul = ['#d21f3c', '#2b6cb0', '#2d7a3e', '#b7791f', '#6b46c1', '#0f766e'];
  const ordB = q.coloanaB.map((_, i) => i); // ordinea din test (a–e)
  const bA = q.coloanaA.map((t, i) => h('button', { class: 'pot-a', type: 'button', onclick: () => { selA = i; desen(); } }, h('span', { class: 'nr' }, i + 1 + '.'), ' ', t));
  const bB = ordB.map(j => h('button', { class: 'pot-b', type: 'button', 'data-j': j, onclick: () => { if (selA === null) return; perechi[selA] = j; selA = null; desen(); opt.onSchimbare?.(); } }, h('span', { class: 'nr' }, LITERE[j] + '.'), ' ', q.coloanaB[j]));
  function desen() {
    bA.forEach((b, i) => { b.classList.toggle('activ', selA === i); const j = perechi[i]; b.style.setProperty('--c', j !== undefined ? cul[i % cul.length] : 'transparent'); b.querySelector('.leg')?.remove(); if (j !== undefined) b.append(h('span', { class: 'leg' }, ' → ' + LITERE[j])); });
    bB.forEach(b => { const j = +b.dataset.j; const de = Object.keys(perechi).filter(i => perechi[i] === j); b.style.setProperty('--c', de.length ? cul[+de[0] % cul.length] : 'transparent'); });
  }
  const el = h('div', {}, h('p', { class: 'instr' }, 'Atinge un element din coloana A, apoi corespondentul lui din coloana B.'),
    h('div', { class: 'potrivire' }, h('div', { class: 'col' }, h('h4', {}, 'A'), bA), h('div', { class: 'col' }, h('h4', {}, 'B'), bB)));
  const n = q.coloanaA.length;
  return {
    el, citeste: () => Object.keys(perechi).length === n ? { ...perechi } : null,
    _rezolva: () => ({ ...q.perechi }),
    evalueaza: (s) => q.coloanaA.reduce((a, _, i) => a + (s[i] === q.perechi[i] ? 1 : 0), 0) / n,
    marcheaza: (s) => bA.forEach((b, i) => b.classList.add(s[i] === q.perechi[i] ? 'corect' : 'gresit')),
    solutie: () => h('ul', { class: 'sol' }, q.coloanaA.map((a, i) => h('li', {}, `${i + 1}. ${a} → ${LITERE[q.perechi[i]]}. ${q.coloanaB[q.perechi[i]]}`))),
    indiciu: () => { const i = q.coloanaA.findIndex((_, k) => perechi[k] !== q.perechi[k]); if (i < 0) return null; perechi[i] = q.perechi[i]; desen(); opt.onSchimbare?.(); return `Am legat eu: ${q.coloanaA[i]} → ${q.coloanaB[q.perechi[i]]}.`; }
  };
}

// -------------------------------------------------------------- 5. coordonate geografice (punct pe rețeaua de grade)
// Barem: 0,5 p latitudinea + 0,5 p longitudinea; 0,25 p dacă valoarea în grade e corectă, dar emisfera lipsește sau e greșită.
export function evalueazaCoordonate(q, s) {
  const parte = (grade, em, val, emCorect) => grade === Math.abs(val) ? (em === emCorect ? .5 : .25) : 0;
  return parte(s.lat, s.ns, q.lat, q.lat > 0 ? 'N' : 'S') + parte(s.lon, s.ev, q.lon, q.lon > 0 ? 'E' : 'V');
}
function coordonate(q, opt) {
  const st = { lat: null, ns: null, lon: null, ev: null };
  const r = retea({ puncte: q.puncte_retea, activ: q.punct });
  const selectGrade = (max, pas, cheie, eticheta) => h('select', { class: 'camp grade', 'aria-label': eticheta, onchange: (e) => { st[cheie] = e.target.value === '' ? null : +e.target.value; opt.onSchimbare?.(); } },
    h('option', { value: '' }, '—'), Array.from({ length: max / pas + 1 }, (_, i) => i * pas).map(v => h('option', { value: v }, v + '°')));
  const segment = (vals, cheie, eticheta) => {
    const b = vals.map(([v, t]) => h('button', { class: 'mini em', type: 'button', 'aria-pressed': 'false', 'data-v': v, title: t, 'aria-label': `${eticheta}: ${t}`,
      onclick: () => { st[cheie] = v; b.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === v))); opt.onSchimbare?.(); } }, v));
    return h('span', { class: 'segment em-seg', role: 'group', 'aria-label': eticheta }, b);
  };
  const sLat = selectGrade(90, 10, 'lat', 'Latitudinea în grade'), sLon = selectGrade(180, 20, 'lon', 'Longitudinea în grade');
  const segNS = segment([['N', 'nordică'], ['S', 'sudică']], 'ns', 'Emisfera latitudinii');
  const segEV = segment([['E', 'estică'], ['V', 'vestică']], 'ev', 'Emisfera longitudinii');
  const rLat = h('div', { class: 'rand-coord' }, h('strong', {}, 'Latitudinea'), sLat, h('span', {}, 'lat.'), segNS);
  const rLon = h('div', { class: 'rand-coord' }, h('strong', {}, 'Longitudinea'), sLon, h('span', {}, 'long.'), segEV);
  const el = h('div', { class: 'coord' }, r, h('div', { class: 'raspuns-coord' }, h('p', { class: 'instr' }, `Punctul ${q.punct}:`), rLat, rLon));
  const corect = () => ({ lat: Math.abs(q.lat), ns: q.lat > 0 ? 'N' : 'S', lon: Math.abs(q.lon), ev: q.lon > 0 ? 'E' : 'V' });
  return {
    el, citeste: () => Object.values(st).every(v => v !== null) ? { ...st } : null,
    _rezolva: corect,
    evalueaza: (s) => evalueazaCoordonate(q, s),
    marcheaza: (s) => {
      const c = corect();
      rLat.classList.add(s.lat === c.lat && s.ns === c.ns ? 'corect' : 'gresit');
      rLon.classList.add(s.lon === c.lon && s.ev === c.ev ? 'corect' : 'gresit');
      r.ghidaje();
    },
    solutie: () => h('span', {}, 'Răspuns corect: ', h('strong', {}, q.raspuns)),
    indiciu: () => { r.ghidaje(); return 'Urmărește liniile punctate: în sus citești longitudinea, în dreapta latitudinea. Apoi vezi de ce parte a Ecuatorului și a Meridianului 0° stă punctul.'; }
  };
}

// -------------------------------------------------------------- 6. tabel comparativ (2 zone × 4 criterii)
function tabelComparativ(q, opt) {
  const ales = {}; // `${c}-${z}` -> indicele variantei
  const scurt = q.zone.map(z => z.replace(/^Zona /, ''));
  const blocuri = q.criterii.map((cr, c) => {
    const ordine = amesteca(cr.optiuni.map((_, i) => i));
    const randuri = ordine.map(i => {
      const bt = q.zone.map((_, z) => h('button', { class: 'mini z' + z, type: 'button', 'aria-pressed': 'false', 'data-z': z,
        'aria-label': `${cr.nume} – ${q.zone[z]}: ${cr.optiuni[i]}`, onclick: () => { ales[`${c}-${z}`] = ales[`${c}-${z}`] === i ? undefined : i; if (ales[`${c}-${z}`] === undefined) delete ales[`${c}-${z}`]; desen(); opt.onSchimbare?.(); } }, scurt[z]));
      return { i, bt, el: h('div', { class: 'rand-comp' }, h('span', { class: 'af-text' }, cr.optiuni[i]), h('span', { class: 'bt' }, bt)) };
    });
    return { randuri, el: h('fieldset', { class: 'criteriu' }, h('legend', {}, cr.nume), randuri.map(r => r.el)) };
  });
  function desen() {
    blocuri.forEach((b, c) => b.randuri.forEach(r => r.bt.forEach(x => x.setAttribute('aria-pressed', String(ales[`${c}-${x.dataset.z}`] === r.i)))));
  }
  const n = q.criterii.length * q.zone.length;
  const ok = (s, c, z) => s[`${c}-${z}`] === q.criterii[c].corecte[z];
  return {
    el: h('div', { class: 'tabel-comp' }, h('p', { class: 'instr' }, `Pentru fiecare criteriu, atribuie fiecărei zone (${scurt.join(' / ')}) descrierea potrivită. Celelalte descrieri sunt ale altor zone climatice.`), blocuri.map(b => b.el)),
    citeste: () => Object.keys(ales).length === n ? { ...ales } : null,
    _rezolva: () => Object.fromEntries(q.criterii.flatMap((cr, c) => cr.corecte.map((i, z) => [`${c}-${z}`, i]))),
    evalueaza: (s) => q.criterii.reduce((a, cr, c) => a + q.zone.reduce((b, _, z) => b + (ok(s, c, z) ? 1 : 0), 0), 0) / n,
    marcheaza: (s) => blocuri.forEach((b, c) => b.randuri.forEach(r => q.zone.forEach((_, z) => {
      if (q.criterii[c].corecte[z] === r.i) r.bt[z].classList.add(s[`${c}-${z}`] === r.i ? 'corect' : 'ratat');
      else if (s[`${c}-${z}`] === r.i) r.bt[z].classList.add('gresit');
    }))),
    solutie: () => h('table', { class: 'tabel-barem sol-comp' },
      h('thead', {}, h('tr', {}, h('th', {}, 'Criteriu'), q.zone.map(z => h('th', {}, z)))),
      h('tbody', {}, q.criterii.map(cr => h('tr', {}, h('td', {}, h('strong', {}, cr.nume)), cr.corecte.map(i => h('td', {}, cr.optiuni[i])))))),
    indiciu: () => {
      for (let c = 0; c < q.criterii.length; c++) for (let z = 0; z < q.zone.length; z++) if (!ok(ales, c, z)) { ales[`${c}-${z}`] = q.criterii[c].corecte[z]; desen(); opt.onSchimbare?.(); return `Am completat eu: ${q.criterii[c].nume} – ${q.zone[z]}.`; }
      return null;
    }
  };
}

// -------------------------------------------------------------- 7. selecție multiplă (explicare) (alege k afirmații corecte)
function selectieMultipla(q, opt) {
  const k = q.de_selectat || 2;
  const toate = amesteca([...q.corecte.map(t => ({ t, ok: true })), ...q.gresite.map(t => ({ t, ok: false }))]);
  const alese = new Set();
  const b = toate.map((x, i) => h('button', { class: 'varianta bifa', type: 'button', 'aria-pressed': 'false', onclick: () => {
    if (alese.has(i)) alese.delete(i); else { if (alese.size >= k) return info(`Poți alege doar ${k}.`); alese.add(i); }
    b[i].setAttribute('aria-pressed', String(alese.has(i))); opt.onSchimbare?.();
  } }, x.t));
  const nota = h('p', { class: 'instr' }, `Alege ${k} cauze corecte.`);
  const info = (t) => { nota.textContent = t; setTimeout(() => nota.textContent = `Alege ${k} cauze corecte.`, 1800); };
  return {
    el: h('div', {}, nota, h('div', { class: 'variante' }, b)), citeste: () => alese.size === k ? [...alese] : null,
    _rezolva: () => toate.map((x, i) => x.ok ? i : -1).filter(i => i >= 0).slice(0, k),
    evalueaza: (s) => Math.min(k, s.filter(i => toate[i].ok).length) / k,
    marcheaza: (s) => b.forEach((x, i) => { if (toate[i].ok) x.classList.add(s.includes(i) ? 'corect' : 'ratat'); else if (s.includes(i)) x.classList.add('gresit'); }),
    solutie: () => h('span', {}, 'Cauze corecte (oricare ' + k + '): ', h('strong', {}, q.corecte.join('; '))),
    indiciu: () => { const i = toate.findIndex((x, j) => !x.ok && !alese.has(j) && !b[j].disabled); if (i < 0) return null; b[i].disabled = true; b[i].classList.add('eliminat'); return 'Am eliminat o variantă greșită.'; }
  };
}

// -------------------------------------------------------------- 9. comparare (asemănări / deosebiri)
function comparare(q, opt) {
  const [kA, kD] = q.de_selectat || [2, 2];
  const toate = amesteca([...q.asemanari.map(t => ({ t, tip: 'A' })), ...q.deosebiri.map(t => ({ t, tip: 'D' })), ...(q.capcane || []).map(t => ({ t, tip: 'X' }))]);
  const tag = {};
  const randuri = toate.map((x, i) => {
    const bt = ['A', 'D'].map(v => h('button', { class: 'mini ' + (v === 'A' ? 'as' : 'de'), type: 'button', 'aria-pressed': 'false', onclick: () => {
      if (tag[i] === v) delete tag[i];
      else { const nr = Object.values(tag).filter(z => z === v).length; if (nr >= (v === 'A' ? kA : kD)) return; tag[i] = v; }
      bt.forEach(z => z.setAttribute('aria-pressed', String(tag[i] === z.dataset.v))); opt.onSchimbare?.();
    }, 'data-v': v }, v === 'A' ? 'Asemănare' : 'Deosebire'));
    return h('div', { class: 'rand-comp' }, h('span', { class: 'af-text' }, x.t), h('span', { class: 'bt' }, bt));
  });
  const titlu = q.unitati ? h('p', { class: 'instr' }, `${q.unitati[0]} ↔ ${q.unitati[1]}: marchează ${kA} asemănări și ${kD} deosebiri. Atenție la afirmațiile false!`)
    : h('p', { class: 'instr' }, `Marchează ${kA} asemănări și ${kD} deosebiri. Atenție la afirmațiile false!`);
  const ok = (i, v) => toate[i].tip === v;
  return {
    el: h('div', { class: 'venn' }, titlu, randuri),
    citeste: () => { const v = Object.values(tag); return v.filter(z => z === 'A').length === kA && v.filter(z => z === 'D').length === kD ? { ...tag } : null; },
    _rezolva: () => { const t = {}; let a = 0, d = 0; toate.forEach((x, i) => { if (x.tip === 'A' && a < kA) { t[i] = 'A'; a++; } if (x.tip === 'D' && d < kD) { t[i] = 'D'; d++; } }); return t; },
    evalueaza: (s) => (Math.min(kA, Object.keys(s).filter(i => s[i] === 'A' && ok(i, 'A')).length) + Math.min(kD, Object.keys(s).filter(i => s[i] === 'D' && ok(i, 'D')).length)) / (kA + kD),
    marcheaza: (s) => randuri.forEach((r, i) => { if (s[i]) r.classList.add(ok(i, s[i]) ? 'corect' : 'gresit'); else if (toate[i].tip !== 'X') r.classList.add('ratat'); }),
    solutie: () => h('div', { class: 'sol' }, h('p', {}, h('strong', {}, 'Asemănări: '), q.asemanari.join('; ')), h('p', {}, h('strong', {}, 'Deosebiri: '), q.deosebiri.join('; ')), q.nota ? h('p', { class: 'mic' }, q.nota) : null),
    indiciu: () => { const i = toate.findIndex(x => x.tip === 'X'); if (i < 0) return null; randuri[i].classList.add('eliminat'); randuri[i].querySelectorAll('button').forEach(b => b.disabled = true); return 'Am tăiat o afirmație falsă – nu o folosi.'; }
  };
}

// -------------------------------------------------------------- 12. ordonare (butoane sus/jos – merg la atingere și cu tastatura)
function ordonare(q, opt) {
  let ord = amesteca(q.elemente.map((_, i) => i));
  if (ord.every((v, i) => v === i) && ord.length > 1) ord = [...ord.slice(1), ord[0]];
  const lista = h('ol', { class: 'ordonare' });
  let atins = false;
  function desen() {
    lista.replaceChildren(...ord.map((i, poz) => h('li', { class: 'el-ord' },
      h('span', { class: 'txt' }, q.elemente[i]),
      h('span', { class: 'sageti' },
        h('button', { class: 'mini', type: 'button', 'aria-label': 'Mută mai sus', disabled: poz === 0, onclick: () => muta(poz, -1) }, '▲'),
        h('button', { class: 'mini', type: 'button', 'aria-label': 'Mută mai jos', disabled: poz === ord.length - 1, onclick: () => muta(poz, 1) }, '▼')))));
  }
  function muta(poz, d) { const j = poz + d; [ord[poz], ord[j]] = [ord[j], ord[poz]]; atins = true; desen(); opt.onSchimbare?.(); lista.children[j]?.querySelectorAll('button')[d < 0 ? 0 : 1]?.focus(); }
  desen();
  return {
    el: h('div', {}, h('p', { class: 'instr' }, 'Folosește săgețile pentru a pune elementele în ordinea cerută (primul sus).'), lista,
      h('button', { class: 'btn mic', type: 'button', onclick: () => { atins = true; opt.onSchimbare?.(); } }, 'Ordinea e gata')),
    citeste: () => atins ? [...ord] : null,
    _rezolva: () => q.elemente.map((_, i) => i),
    evalueaza: (s) => s.every((v, i) => v === i) ? 1 : 0,
    marcheaza: (s) => [...lista.children].forEach((li, p) => li.classList.add(s[p] === p ? 'corect' : 'gresit')),
    solutie: () => h('span', {}, 'Ordinea corectă: ', h('strong', {}, q.elemente.join(' → '))),
    indiciu: () => `Primul element este: ${q.elemente[0]}.`
  };
}

// -------------------------------------------------------------- 13. cine sunt eu? (indicii progresive)
function cineSunt(q, opt) {
  let vazute = 1;
  const lista = h('ol', { class: 'indicii' });
  const desen = () => lista.replaceChildren(...q.indicii.slice(0, vazute).map(t => h('li', {}, t)));
  desen();
  const g = grila({ ...q, variante: q.variante, corect: q.variante.indexOf(q.raspuns) }, opt);
  const btn = h('button', { class: 'btn mic', type: 'button', onclick: () => { if (vazute < q.indicii.length) { vazute++; desen(); if (vazute === q.indicii.length) btn.disabled = true; } } }, 'Încă un indiciu (−XP)');
  return {
    el: h('div', {}, lista, btn, g.el), citeste: g.citeste, _rezolva: g._rezolva,
    evalueaza: (s) => g.evalueaza(s) * (vazute === 1 ? 1 : vazute === 2 ? .8 : .6),
    marcheaza: g.marcheaza, solutie: g.solutie, indiciu: () => { if (vazute < q.indicii.length) { vazute++; desen(); return 'Ți-am dat încă un indiciu.'; } return g.indiciu(); },
    punctajComplet: (s) => g.evalueaza(s) === 1
  };
}

const TIPURI = {
  grila: (q, o) => grila(q, o), completare, adevarat_fals: adevaratFals, potrivire, coordonate, tabel_comparativ: tabelComparativ,
  selectie_multipla: selectieMultipla, comparare, ordonare, cine_sunt: cineSunt
};
export const NUME_TIP = { grila: 'Grilă', completare: 'Completare', adevarat_fals: 'Adevărat / Fals', potrivire: 'Potrivire', coordonate: 'Coordonate geografice', tabel_comparativ: 'Comparare climatică', selectie_multipla: 'Explică', comparare: 'Comparare', ordonare: 'Ordonare', cine_sunt: 'Cine sunt eu?' };

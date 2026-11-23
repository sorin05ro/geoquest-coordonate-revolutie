// Rețeaua de grade din test, desenată în SVG: meridianele din 20° în 20°, paralelele din 10° în 10°,
// Ecuatorul și Meridianul 0° îngroșate, punctele marcate cu „×” și litera lor.
import { h } from './ui.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, at = {}, text) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(at)) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };

/**
 * @param {object} o
 *  - puncte: [{eticheta, lat, lon}] punctele desenate (lat: + nord, lon: + est)
 *  - activ: eticheta punctului întrebat (evidențiat)
 *  - ghidaje: true = linii punctate spre marginile rețelei, pentru punctul activ (indiciu / soluție)
 */
export function retea({ puncte = [], activ = null, clasa = '', titlu = '' } = {}) {
  const svg = el('svg', { viewBox: '-201 -114 412 220', class: 'retea-svg', role: 'img',
    'aria-label': titlu || `Rețeaua de grade cu punctele ${puncte.map(p => p.eticheta).join(', ')}${activ ? '; se cere punctul ' + activ : ''}` });
  const x = (lon) => lon, y = (lat) => -lat;
  const g = el('g', { class: 'linii' });
  for (let lon = -180; lon <= 180; lon += 20) g.append(el('line', { x1: x(lon), y1: -90, x2: x(lon), y2: 90, class: lon === 0 ? 'gros' : '' }));
  for (let lat = -90; lat <= 90; lat += 10) g.append(el('line', { x1: -180, y1: y(lat), x2: 180, y2: y(lat), class: lat === 0 ? 'gros' : '' }));
  svg.append(el('rect', { x: -180, y: -90, width: 360, height: 180, class: 'fond' }), g);
  const t = el('g', { class: 'etichete' });
  for (let lon = -180; lon <= 180; lon += 20) if (lon) t.append(el('text', { x: x(lon), y: -94, 'text-anchor': 'middle' }, `${Math.abs(lon)}°`));
  t.append(el('text', { x: 0, y: -94, 'text-anchor': 'middle', class: 'tare' }, '0°'));
  t.append(el('text', { x: 0, y: -105, 'text-anchor': 'middle', class: 'tare' }, 'Meridianul 0°'));
  for (let lat = -90; lat <= 90; lat += 10) { t.append(el('text', { x: 183, y: y(lat) + 2.6, 'text-anchor': 'start' }, `${Math.abs(lat)}°`)); t.append(el('text', { x: -183, y: y(lat) + 2.6, 'text-anchor': 'end' }, `${Math.abs(lat)}°`)); }
  t.append(el('text', { x: -178, y: -2.5, 'text-anchor': 'start', class: 'tare halo' }, 'Ecuator'));
  t.append(el('text', { x: 205, y: -45, 'text-anchor': 'middle', class: 'em', transform: 'rotate(90 205 -45)' }, 'Emisfera nordică'));
  t.append(el('text', { x: 205, y: 45, 'text-anchor': 'middle', class: 'em', transform: 'rotate(90 205 45)' }, 'Emisfera sudică'));
  t.append(el('text', { x: -90, y: 100, 'text-anchor': 'middle', class: 'em' }, 'Emisfera vestică'), el('text', { x: 90, y: 100, 'text-anchor': 'middle', class: 'em' }, 'Emisfera estică'));
  svg.append(t);
  const ghid = el('g', { class: 'ghidaje' });
  svg.append(ghid);
  const pg = el('g', { class: 'puncte' });
  for (const p of puncte) {
    const a = p.eticheta === activ;
    const gr = el('g', { class: 'punct' + (a ? ' activ' : activ ? ' pasiv' : ''), 'data-e': p.eticheta });
    if (a) gr.append(el('circle', { cx: x(p.lon), cy: y(p.lat), r: 7, class: 'inel' }));
    const d = 3.4;
    gr.append(el('path', { d: `M${x(p.lon) - d} ${y(p.lat) - d}L${x(p.lon) + d} ${y(p.lat) + d}M${x(p.lon) + d} ${y(p.lat) - d}L${x(p.lon) - d} ${y(p.lat) + d}`, class: 'x' }));
    const tx = x(p.lon) + (p.lon >= 170 ? -11 : 4.5), ty = y(p.lat) - 3.5;
    gr.append(el('text', { x: tx, y: ty, class: 'lit' }, p.eticheta));
    pg.append(gr);
  }
  svg.append(pg);
  const derulare = h('div', { class: 'retea-derulare' }, svg);
  const zoom = h('button', { class: 'mini retea-zoom', type: 'button', 'aria-pressed': 'false', onclick: () => {
    const m = cutie.classList.toggle('marit'); zoom.setAttribute('aria-pressed', String(m)); zoom.textContent = m ? '🔍 Micșorează' : '🔍 Mărește';
    const p = puncte.find(q => q.eticheta === activ); if (m && p) requestAnimationFrame(() => { derulare.scrollLeft = (p.lon + 201) / 412 * derulare.scrollWidth - derulare.clientWidth / 2; });
  } }, '🔍 Mărește');
  const cutie = h('div', { class: 'retea ' + clasa }, derulare, clasa.includes('card-harta') ? null : zoom);
  /** linii punctate de la punct spre marginea de sus (longitudinea) și spre dreapta (latitudinea) */
  cutie.ghidaje = (et = activ) => {
    const p = puncte.find(q => q.eticheta === et); if (!p) return;
    ghid.replaceChildren(
      el('line', { x1: x(p.lon), y1: y(p.lat), x2: x(p.lon), y2: -90, class: 'g-lon' }),
      el('line', { x1: x(p.lon), y1: y(p.lat), x2: 180, y2: y(p.lat), class: 'g-lat' }));
  };
  cutie.marcheaza = (cls) => cutie.classList.add(cls);
  return cutie;
}

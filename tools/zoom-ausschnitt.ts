// Grundgerüst einer Zoom-Ansicht (design-guidelines.md Abschnitt 5): übernimmt aus einer Szene
// alle Elemente im Zoomausschnitt und rechnet sie auf die volle Bildfläche 1600 × 900 um.
// Konturen, Binnenlinien und Leitungen behalten ihre Breite (Linien werden im Zoom nicht dicker).
// Körpermaße werden mit dem Faktor skaliert: Radien, `rx`/`ry` und Striche ab `koerperAb`
// (etwa Robotergliedbreiten). Die dunkle Unterlage eines Körperstrichs bleibt Kern + 2 · Kontur.
// Gruppentransforms der Form translate(a,b) scale(s) translate(-a,-b) werden eingerechnet.
// Dünnere Körperstriche (etwa der Katzenschwanz, wirksam ~10) liegen unter der Schwelle und
// bleiben gleich breit; solche Fälle von Hand nachziehen. Gruppen, deren Clip-Rechteck ganz
// außerhalb liegt, fallen weg.

export const BREITE = 1600;
export const HOEHE = 900;
const KONTUR = 3;
const KONTURFARBE = '#26262E';
/** Überstand, bis zu dem große Flächen beim Kappen über den Bildrand reichen. */
const UEBERSTAND = 20;

export interface Ausschnitt {
  /** Linke obere Ecke und Breite in Koordinaten der Quellszene; die Höhe folgt aus 16 : 9. */
  x: number;
  y: number;
  breite: number;
}

export interface Optionen {
  /** Striche ab dieser (wirksamen) Breite gelten als Körpermaß und werden skaliert. */
  koerperAb: number;
}

type Box = [number, number, number, number];
interface Vor { s: number; p: (x: number, y: number) => [number, number] }

const IDENT: Vor = { s: 1, p: (x, y) => [x, y] };
const zahl = (n: number): string => String(Math.round(n * 10) / 10);

function gruppenTransform(t: string): Vor {
  const m = /translate\(([-\d.]+),([-\d.]+)\)\s*scale\(([-\d.]+)\)\s*translate\(([-\d.]+),([-\d.]+)\)/.exec(t);
  if (!m) throw new Error(`Unbekannter transform: ${t}`);
  const [a, b, s] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return { s, p: (x, y) => [a + s * (x - a), b + s * (y - b)] };
}

function attr(tag: string, name: string): string | null {
  const m = new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
  return m ? (m[1] ?? null) : null;
}
function setze(tag: string, name: string, wert: string): string {
  const re = new RegExp(`(\\s${name}=")[^"]*(")`);
  return re.test(tag) ? tag.replace(re, `$1${wert}$2`) : tag.replace(/(\s*\/?>)$/, ` ${name}="${wert}"$1`);
}
const entferne = (tag: string, name: string): string => tag.replace(new RegExp(`\\s${name}="[^"]*"`), '');

const sichtbar = (b: Box, rand: number): boolean =>
  b[2] >= -rand && b[0] <= BREITE + rand && b[3] >= -rand && b[1] <= HOEHE + rand;

const PARAM: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, Q: 4, T: 2, C: 6, S: 4, A: 7, Z: 0 };

export function rechneUm(svg: string, ausschnitt: Ausschnitt, optionen: Optionen): string {
  const f = BREITE / ausschnitt.breite;
  let vor = IDENT;
  const abb = (x: number, y: number): [number, number] => {
    const [px, py] = vor.p(x, y);
    return [(px - ausschnitt.x) * f, (py - ausschnitt.y) * f];
  };
  const k = (): number => vor.s * f;

  /** Pfad in Teilpfade (je M) zerlegen und umrechnen; jeder Teilpfad mit seiner Box. */
  function pfad(d: string): { d: string; box: Box }[] {
    const tok = d.match(/[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) ?? [];
    const teile: { d: string; box: Box }[] = [];
    let akt: { d: string; box: Box } | undefined;
    let cx = 0, cy = 0, sx = 0, sy = 0, i = 0, cmd = '';
    const box = (x: number, y: number): void => {
      if (!akt) return;
      const b = akt.box;
      b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y);
    };
    const pt = (x: number, y: number): string => { const [X, Y] = abb(x, y); box(X, Y); return `${zahl(X)},${zahl(Y)}`; };
    while (i < tok.length) {
      const t = tok[i] as string;
      if (/[A-Za-z]/.test(t)) { cmd = t; i++; }
      else if (cmd === 'M') cmd = 'L';
      else if (cmd === 'm') cmd = 'l';
      const C = cmd.toUpperCase(), rel = cmd !== C;
      const anzahl = PARAM[C];
      if (anzahl === undefined) throw new Error(`Unbekannter Pfadbefehl: ${cmd}`);
      const n = tok.slice(i, i + anzahl).map(Number); i += anzahl;
      if (C === 'M' || !akt) { akt = { d: '', box: [Infinity, Infinity, -Infinity, -Infinity] }; teile.push(akt); }
      const ab = (j: number): [number, number] => [(n[j] ?? 0) + (rel ? cx : 0), (n[j + 1] ?? 0) + (rel ? cy : 0)];
      switch (C) {
        case 'M': case 'L': case 'T': {
          const [x, y] = ab(0); akt.d += C + pt(x, y); cx = x; cy = y;
          if (C === 'M') { sx = x; sy = y; }
          break;
        }
        case 'H': { const x = (n[0] ?? 0) + (rel ? cx : 0); const [X, Y] = abb(x, cy); box(X, Y); akt.d += `H${zahl(X)}`; cx = x; break; }
        case 'V': { const y = (n[0] ?? 0) + (rel ? cy : 0); const [X, Y] = abb(cx, y); box(X, Y); akt.d += `V${zahl(Y)}`; cy = y; break; }
        case 'Q': case 'S': { const a = ab(0), b = ab(2); akt.d += `${C}${pt(...a)} ${pt(...b)}`; [cx, cy] = b; break; }
        case 'C': { const a = ab(0), b = ab(2), c = ab(4); akt.d += `C${pt(...a)} ${pt(...b)} ${pt(...c)}`; [cx, cy] = c; break; }
        case 'A': {
          const e: [number, number] = [(n[5] ?? 0) + (rel ? cx : 0), (n[6] ?? 0) + (rel ? cy : 0)];
          akt.d += `A${zahl((n[0] ?? 0) * k())},${zahl((n[1] ?? 0) * k())} ${n[2]} ${n[3]} ${n[4]} ${pt(...e)}`;
          [cx, cy] = e;
          break;
        }
        case 'Z': akt.d += 'Z'; cx = sx; cy = sy; break;
      }
    }
    return teile;
  }

  /** Strichbreite: Körpermaße skalieren, alles andere bleibt. Gibt die neue Breite für den Sichtrand zurück. */
  function strich(tag: string): [string, number] {
    const w = attr(tag, 'stroke-width');
    if (w === null) return [tag, 0];
    const breit = Number(w);
    if (breit * vor.s < optionen.koerperAb) return [tag, breit];
    const unterlage = attr(tag, 'stroke') === KONTURFARBE;
    const kern = unterlage ? breit - 2 * KONTUR : breit;
    const neu = kern * k() + (unterlage ? 2 * KONTUR : 0);
    return [setze(tag, 'stroke-width', zahl(neu)), neu];
  }

  const tags = svg.match(/<[^>]+>|[^<]+/g) ?? [];
  const aus: string[] = [];
  const transformiert: boolean[] = [];
  let imClip: string | null = null;
  /** Clip-Pfade, deren Rechteck ganz außerhalb des Bildes liegt: Gruppen damit fallen ganz weg. */
  const unsichtbareClips = new Set<string>();
  let verworfen = 0; // Tiefe innerhalb einer verworfenen Gruppe
  for (const t of tags) {
    if (verworfen > 0) {
      if (t.startsWith('<g')) verworfen++;
      else if (t.startsWith('</g')) verworfen--;
      continue;
    }
    if (!t.startsWith('<') || /^<\/?(svg|defs)\b/.test(t)) { aus.push(t); continue; }
    if (/^<\/?clipPath\b/.test(t)) { imClip = t.startsWith('</') ? null : attr(t, 'id'); aus.push(t); continue; }
    if (t.startsWith('</g')) { if (transformiert.pop()) vor = IDENT; aus.push(t); continue; }
    const clip = /^<g\b/.test(t) ? /url\(#([^)]+)\)/.exec(attr(t, 'clip-path') ?? '')?.[1] : undefined;
    if (clip !== undefined && unsichtbareClips.has(clip)) { verworfen = 1; continue; }
    if (t.startsWith('<g')) {
      const tr = attr(t, 'transform');
      if (tr !== null && vor !== IDENT) throw new Error('Verschachtelte Gruppentransforms werden nicht unterstützt.');
      if (tr !== null) vor = gruppenTransform(tr);
      transformiert.push(tr !== null);
      aus.push(tr === null ? t : entferne(t, 'transform'));
      continue;
    }
    const name = /^<(\w+)/.exec(t)?.[1];
    let [neu, sw] = strich(t);
    const rand = sw / 2 + 2;
    if (name === 'rect') {
      const x = Number(attr(t, 'x') ?? 0), y = Number(attr(t, 'y') ?? 0);
      const w = Number(attr(t, 'width')), h = Number(attr(t, 'height'));
      let [X, Y] = abb(x, y);
      let [X2, Y2] = abb(x + w, y + h);
      // Clip-Rechtecke werden nur umgerechnet; ob ihr Clip noch gebraucht wird, entscheidet der Schluss.
      if (imClip !== null) {
        if (!sichtbar([X, Y, X2, Y2], 0)) unsichtbareClips.add(imClip);
      } else {
        if (!sichtbar([X, Y, X2, Y2], rand)) continue;
        X = Math.max(X, -UEBERSTAND); Y = Math.max(Y, -UEBERSTAND);
        X2 = Math.min(X2, BREITE + UEBERSTAND); Y2 = Math.min(Y2, HOEHE + UEBERSTAND);
      }
      neu = setze(neu, 'x', zahl(X)); neu = setze(neu, 'y', zahl(Y));
      neu = setze(neu, 'width', zahl(X2 - X)); neu = setze(neu, 'height', zahl(Y2 - Y));
      for (const r of ['rx', 'ry']) { const v = attr(t, r); if (v !== null) neu = setze(neu, r, zahl(Number(v) * k())); }
      aus.push(neu);
    } else if (name === 'circle' || name === 'ellipse') {
      const [X, Y] = abb(Number(attr(t, 'cx')), Number(attr(t, 'cy')));
      const rx = Number(attr(t, 'r') ?? attr(t, 'rx')) * k(), ry = Number(attr(t, 'r') ?? attr(t, 'ry')) * k();
      if (!sichtbar([X - rx, Y - ry, X + rx, Y + ry], rand)) continue;
      neu = setze(neu, 'cx', zahl(X)); neu = setze(neu, 'cy', zahl(Y));
      for (const r of ['r', 'rx', 'ry']) { const v = attr(t, r); if (v !== null) neu = setze(neu, r, zahl(Number(v) * k())); }
      aus.push(neu);
    } else if (name === 'path') {
      // Kontrollpunkte können über die Kurve hinausragen; der zusätzliche Rand fängt Kurven knapp am Bildrand.
      const teile = pfad(attr(t, 'd') ?? '').filter((p) => sichtbar(p.box, rand + 10));
      if (teile.length === 0) continue;
      aus.push(setze(neu, 'd', teile.map((p) => p.d).join('')));
    } else {
      throw new Error(`Nicht unterstütztes Element: <${name}>`);
    }
  }

  let text = aus.join('');
  for (let i = 0; i < 5; i++) text = text.replace(/<g[^>]*>\s*<\/g>\s*/g, '');
  // Clip-Pfade, auf die nichts mehr verweist, und leere defs entfernen
  for (const m of [...text.matchAll(/<clipPath id="([^"]+)">.*?<\/clipPath>/gs)]) {
    if (!text.includes(`url(#${m[1]})`)) text = text.replace(m[0], '');
  }
  text = text.replace(/<defs>\s*<\/defs>\s*/g, '');
  return text.replace(/\n{2,}/g, '\n');
}

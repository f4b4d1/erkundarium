// Die Szene als eigenes Modul ohne Framework (E18). Es bettet die Szenen-SVG ein, macht ihre
// Hotspots per Maus, Touch und Tastatur bedienbar (F2, F26), zeichnet Hervorhebung und Haken und
// meldet, was mit den Hotspots geschieht. Es kennt weder Karten noch Spielstand: Was hervorgehoben
// und abgehakt ist, gibt der Aufrufer über `zeige` vor.

import { deuteAntippen, geraetDesZeigers, type Eingabegeraet } from './eingabe.ts';

export type { Eingabegeraet } from './eingabe.ts';

/** Rechteck in Bildschirmpixeln, bezogen auf das Fenster. */
export interface Rechteck {
  links: number;
  oben: number;
  breite: number;
  hoehe: number;
}

export interface SzenenHotspot {
  /** Wert von `data-hotspot` in der SVG. */
  id: string;
  /** Zugänglicher Name, wird `aria-label`. */
  name: string;
}

export interface Darstellung {
  /** Hotspots, die einen Haken tragen. */
  abgehakt: ReadonlySet<string>;
  hervorgehoben: string | undefined;
}

export type Szenenereignis =
  | { art: 'betreten' | 'ausgeloest'; hotspot: string; geraet: Eingabegeraet; lage: Rechteck }
  | { art: 'verlassen'; hotspot: string; geraet: Eingabegeraet }
  | { art: 'daneben'; geraet: Eingabegeraet };

export interface Szene {
  zeige(darstellung: Darstellung): void;
  /** Die aktuelle Lage des Hotspots auf dem Bildschirm, etwa nach einer Größenänderung. */
  lageVon(hotspot: string): Rechteck | undefined;
  abbauen(): void;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const HAKEN_RADIUS = 9;
// Farben nach design-guidelines.md Abschnitt 4, Stufe 1.
const KONTUR = '#26262E';
const WEISS = '#F7F9FB';
const FUNDMARKER = '#3BB273';

/**
 * Bettet die SVG in `behaelter` ein. Elemente mit `data-hotspot` ohne Eintrag in `hotspots` bleiben
 * gewöhnliche Grafik. Wirft, wenn `svgText` kein SVG ist.
 */
export function baueSzene(
  behaelter: HTMLElement,
  svgText: string,
  hotspots: readonly SzenenHotspot[],
  melde: (ereignis: Szenenereignis) => void,
): Szene {
  const svg = alsSvg(svgText);
  const elemente = new Map<string, SVGGraphicsElement>();
  const idVon = new Map<Element, string>();
  for (const { id, name } of hotspots) {
    const element = Array.from(svg.querySelectorAll('[data-hotspot]')).find((e) => e.getAttribute('data-hotspot') === id);
    if (!(element instanceof SVGGraphicsElement) || elemente.has(id)) continue;
    element.setAttribute('tabindex', '0');
    element.setAttribute('role', 'button');
    element.setAttribute('aria-label', name);
    element.classList.add('hotspot');
    elemente.set(id, element);
    idVon.set(element, id);
  }
  // Chromium nimmt die SVG-Wurzel sonst als eigenen Halt in die Tab-Reihenfolge auf.
  svg.setAttribute('tabindex', '-1');
  const hakenebene = document.createElementNS(SVG_NS, 'g');
  hakenebene.setAttribute('class', 'haken-ebene');
  hakenebene.setAttribute('aria-hidden', 'true');
  hakenebene.setAttribute('pointer-events', 'none');
  svg.append(hakenebene);
  behaelter.replaceChildren(svg);

  let hervorgehoben: string | undefined;
  let unterDerMaus: string | undefined;
  let imFokus: string | undefined;
  let letztesGeraet: Eingabegeraet = 'maus';

  /** Der innerste Hotspot mit Eintrag, in dem `ziel` liegt. */
  const getroffen = (ziel: EventTarget | null): string | undefined => {
    for (let e = ziel instanceof Element ? ziel : null; e !== null && e !== svg; e = e.parentElement) {
      const id = idVon.get(e);
      if (id !== undefined) return id;
    }
    return undefined;
  };

  const lageVon = (hotspot: string): Rechteck | undefined => {
    const r = elemente.get(hotspot)?.getBoundingClientRect();
    return r === undefined ? undefined : { links: r.left, oben: r.top, breite: r.width, hoehe: r.height };
  };

  const meldeMitLage = (art: 'betreten' | 'ausgeloest', hotspot: string, geraet: Eingabegeraet) => {
    const lage = lageVon(hotspot);
    if (lage !== undefined) melde({ art, hotspot, geraet, lage });
  };

  const zeigeAuf = (hotspot: string | undefined) => {
    if (hotspot === unterDerMaus) return;
    if (unterDerMaus !== undefined) melde({ art: 'verlassen', hotspot: unterDerMaus, geraet: 'maus' });
    unterDerMaus = hotspot;
    if (hotspot !== undefined) meldeMitLage('betreten', hotspot, 'maus');
  };

  svg.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') zeigeAuf(getroffen(e.target));
  });
  svg.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') zeigeAuf(undefined);
  });
  svg.addEventListener('pointerdown', (e) => {
    letztesGeraet = geraetDesZeigers(e.pointerType);
  });
  svg.addEventListener('click', (e) => {
    // detail 0: ausgelöst ohne Zeiger, etwa von einem Screenreader.
    const geraet = e.detail === 0 ? 'tastatur' : letztesGeraet;
    const folge = deuteAntippen(geraet, getroffen(e.target), hervorgehoben);
    if (folge.art === 'daneben') melde({ art: 'daneben', geraet });
    else meldeMitLage(folge.art, folge.hotspot, geraet);
  });
  svg.addEventListener('keydown', (e) => {
    const hotspot = idVon.get(e.target as Element);
    if (hotspot === undefined || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    meldeMitLage('ausgeloest', hotspot, 'tastatur');
  });
  svg.addEventListener('focusin', (e) => {
    const hotspot = idVon.get(e.target as Element);
    // Ein Klick mit der Maus fokussiert den Hotspot auch; als Tastaturfokus zählt nur ein sichtbarer.
    if (hotspot === undefined || !(e.target as Element).matches(':focus-visible')) return;
    imFokus = hotspot;
    meldeMitLage('betreten', hotspot, 'tastatur');
  });
  svg.addEventListener('focusout', (e) => {
    const hotspot = idVon.get(e.target as Element);
    if (hotspot === undefined || hotspot !== imFokus) return;
    imFokus = undefined;
    melde({ art: 'verlassen', hotspot, geraet: 'tastatur' });
  });

  return {
    zeige(darstellung) {
      hervorgehoben = darstellung.hervorgehoben;
      for (const [id, element] of elemente) element.classList.toggle('hervorgehoben', id === hervorgehoben);
      zeichneHaken(svg, hakenebene, darstellung.abgehakt, elemente);
    },
    lageVon,
    abbauen() {
      svg.remove();
    },
  };
}

/** Parst den SVG-Text und entfernt alles, was Code ausführen oder Dateien nachladen könnte. */
function alsSvg(svgText: string): SVGSVGElement {
  const dokument = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const wurzel = dokument.documentElement;
  if (dokument.querySelector('parsererror') !== null || wurzel.namespaceURI !== SVG_NS || wurzel.localName !== 'svg') {
    throw new Error('Die Szenendatei ist kein gültiges SVG.');
  }
  for (const element of Array.from(wurzel.querySelectorAll('script, foreignObject'))) element.remove();
  for (const element of [wurzel, ...Array.from(wurzel.querySelectorAll('*'))]) {
    for (const attribut of Array.from(element.attributes)) {
      const name = attribut.localName.toLowerCase();
      const verweistNachAussen = (name === 'href' || name === 'src') && !attribut.value.trim().startsWith('#');
      if (name.startsWith('on') || verweistNachAussen) element.removeAttributeNode(attribut);
    }
  }
  return document.importNode(wurzel, true) as unknown as SVGSVGElement;
}

/**
 * Zeichnet je abgehaktem Hotspot einen Haken an die obere rechte Ecke seiner Begrenzungsbox,
 * ganz innerhalb der `viewBox`.
 */
function zeichneHaken(
  svg: SVGSVGElement,
  ebene: SVGGElement,
  abgehakt: ReadonlySet<string>,
  elemente: ReadonlyMap<string, SVGGraphicsElement>,
): void {
  ebene.replaceChildren();
  const ebeneMatrix = ebene.getCTM()?.inverse();
  const ansicht = svg.viewBox.baseVal;
  for (const id of abgehakt) {
    const element = elemente.get(id);
    const matrix = element?.getCTM();
    if (element === undefined || matrix == null || ebeneMatrix === undefined) continue;
    const zuEbene = ebeneMatrix.multiply(matrix);
    const box = element.getBBox();
    const ecken = [
      [box.x, box.y],
      [box.x + box.width, box.y],
      [box.x, box.y + box.height],
      [box.x + box.width, box.y + box.height],
    ].map(([x, y]) => new DOMPoint(x, y).matrixTransform(zuEbene));
    const rechts = Math.max(...ecken.map((p) => p.x));
    const oben = Math.min(...ecken.map((p) => p.y));
    const x = Math.min(Math.max(rechts, ansicht.x + HAKEN_RADIUS), ansicht.x + ansicht.width - HAKEN_RADIUS);
    const y = Math.min(Math.max(oben, ansicht.y + HAKEN_RADIUS), ansicht.y + ansicht.height - HAKEN_RADIUS);
    ebene.append(haken(x, y, id));
  }
}

function haken(x: number, y: number, hotspot: string): SVGGElement {
  const gruppe = document.createElementNS(SVG_NS, 'g');
  gruppe.setAttribute('class', 'haken');
  gruppe.setAttribute('data-haken', hotspot);
  gruppe.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  gruppe.append(
    svgElement('circle', { r: String(HAKEN_RADIUS), fill: FUNDMARKER, stroke: KONTUR, 'stroke-width': '2' }),
    svgElement('path', {
      d: 'M-4,0.5L-1.2,3.3L4.2,-2.6',
      fill: 'none',
      stroke: WEISS,
      'stroke-width': '2.4',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }),
  );
  return gruppe;
}

function svgElement(name: string, attribute: Record<string, string>): SVGElement {
  const element = document.createElementNS(SVG_NS, name);
  for (const [schluessel, wert] of Object.entries(attribute)) element.setAttribute(schluessel, wert);
  return element;
}

// Was in einer eingebetteten Szenen-SVG bleiben darf, nach dem Erlaubnis-Prinzip: nur Elemente und
// Attribute, die zum Zeichnen nach design-guidelines.md nötig sind. Alles andere fällt weg.
// Das Szenenmodul bereinigt damit die SVG vor dem Einbetten; das Prüfskript meldet Elemente, die
// nicht auf der Liste stehen.

export const SVG_NAMENSRAUM = 'http://www.w3.org/2000/svg';

/** Elemente im SVG-Namensraum, die bleiben dürfen. `use` nur mit Verweis ins eigene Dokument, siehe `attributErlaubt`. */
export const ERLAUBTE_ELEMENTE: ReadonlySet<string> = new Set([
  'svg',
  'g',
  'defs',
  'clipPath',
  'use',
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
]);

/** Attribute, die an jedem erlaubten Element bleiben dürfen, mit Namen wie im Quelltext. */
export const ERLAUBTE_ATTRIBUTE: ReadonlySet<string> = new Set([
  // Dokument und Hotspots
  'xmlns',
  'xmlns:xlink',
  'viewBox',
  'id',
  'data-hotspot',
  // Geometrie
  'x',
  'y',
  'width',
  'height',
  'rx',
  'ry',
  'cx',
  'cy',
  'r',
  'x1',
  'y1',
  'x2',
  'y2',
  'd',
  'points',
  'transform',
  'clipPathUnits',
  // Darstellung
  'fill',
  'fill-opacity',
  'fill-rule',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-dasharray',
  'stroke-dashoffset',
  'opacity',
  'clip-path',
  'clip-rule',
]);

/** Verweis-Attribute, nur an `use` und nur ins eigene Dokument. */
const VERWEISE = new Set(['href', 'xlink:href']);

/** `url(` ohne folgendes `#`, auch mit Leerraum oder Anführungszeichen dazwischen. */
const URL_NACH_AUSSEN = /url\(\s*(?!['"]?\s*#)/i;

/** Darf das Element mit diesem Namensraum und lokalen Namen samt Inhalt bleiben? */
export function elementErlaubt(namensraum: string | null, name: string): boolean {
  return namensraum === SVG_NAMENSRAUM && ERLAUBTE_ELEMENTE.has(name);
}

/**
 * Darf das Attribut mit diesem Wert an dem Element bleiben?
 * @param element lokaler Name des Elements
 * @param attribut Name des Attributs wie im Quelltext, mit Präfix, etwa `xlink:href`
 */
export function attributErlaubt(element: string, attribut: string, wert: string): boolean {
  if (VERWEISE.has(attribut)) return element === 'use' && wert.trim().startsWith('#');
  return ERLAUBTE_ATTRIBUTE.has(attribut) && !URL_NACH_AUSSEN.test(wert);
}

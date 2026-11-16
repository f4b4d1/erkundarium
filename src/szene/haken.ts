// Farben nach design-guidelines.md Abschnitt 4, Stufe 1, und die Form des Hakens. Szene und
// Oberfläche zeichnen den Haken gleich; die Oberfläche darf von hier lesen, die Szene nicht von ihr.

export const KONTUR = '#26262E';
export const WEISS = '#F7F9FB';
export const HAKENFARBE = '#3BB273';

/** Radius des Hakenkreises in Einheiten der Szene. */
export const HAKEN_RADIUS = 9;
/** Das Häkchen im Kreis, Mittelpunkt im Ursprung, passend zu `HAKEN_RADIUS`. */
export const HAKEN_PFAD = 'M-4,0.5L-1.2,3.3L4.2,-2.6';

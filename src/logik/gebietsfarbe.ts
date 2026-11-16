// Die Farbe einer Karte kommt vom Wissensgebiet ihres Themengebiets (F8, ADR 0005).

import type { Themengebiet, Wissensgebiet } from './inhaltsverzeichnis.ts';

/**
 * Die Farbe des Wissensgebiets, zu dem das Themengebiet gehört. Keine Ersatzfarbe: Unbekannte
 * Gebiete meldet das Prüfskript; hier liefern sie nichts.
 */
export function gebietsfarbe(
  themengebiet: string,
  themengebiete: readonly Themengebiet[],
  wissensgebiete: readonly Wissensgebiet[],
): string | undefined {
  const domain = themengebiete.find((t) => t.id === themengebiet)?.domain;
  return wissensgebiete.find((w) => w.id === domain)?.color;
}

// Die einzige Stelle, an der aus Textfassungen ausgewählt wird (ADR 0002).
// Fehlt die gewählte Fassung, gilt `de`.

import type { Texte } from './inhaltsverzeichnis.ts';

export const STANDARDFASSUNG = 'de';

/**
 * Wählt aus Werten je Textfassung den der gewählten Fassung, sonst den von `de`. Für Karten ist der
 * Wert die ganze Textfassung: Fehlt sie der Karte, gilt die ganze Fassung `de`.
 */
export function waehleFassung<T>(fassungen: Readonly<Record<string, T>>, fassung: string): T | undefined {
  if (Object.hasOwn(fassungen, fassung)) return fassungen[fassung];
  return Object.hasOwn(fassungen, STANDARDFASSUNG) ? fassungen[STANDARDFASSUNG] : undefined;
}

export function text(texte: Texte, fassung: string): string {
  return waehleFassung(texte, fassung) ?? '';
}

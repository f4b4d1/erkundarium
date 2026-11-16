// Die einzige Stelle, an der ein Text aus seinen Textfassungen ausgewählt wird (ADR 0002).
// Fehlt der Text in der gewählten Fassung, gilt `de`.

import type { Texte } from './inhaltsverzeichnis.ts';

export const STANDARDFASSUNG = 'de';

export function text(texte: Texte, fassung: string): string {
  if (Object.hasOwn(texte, fassung)) return texte[fassung]!;
  return Object.hasOwn(texte, STANDARDFASSUNG) ? texte[STANDARDFASSUNG]! : '';
}

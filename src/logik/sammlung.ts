// Was die Sammlung zeigt (F14): alle Karten nach Themengebiet, in der Reihenfolge des
// Inhaltsverzeichnisses. Eine nicht gefundene Karte trägt keinen Titel, damit er nirgends durchsickert.

import { gebietsfarbe } from './gebietsfarbe.ts';
import type { Inhaltsverzeichnis } from './inhaltsverzeichnis.ts';
import { text } from './textfassung.ts';

export type Sammlungskarte = { id: string; gefunden: true; titel: string } | { id: string; gefunden: false };

export interface Sammlungsgruppe {
  /** ID des Themengebiets. */
  id: string;
  titel: string;
  /** Dateiname des Symbols des Themengebiets. */
  symbol: string;
  /** Farbe des Wissensgebiets; fehlt sie, gibt es keine Ersatzfarbe (ADR 0005). */
  farbe?: string;
  karten: Sammlungskarte[];
}

/** Die Gruppen der Sammlung; Themengebiete ohne Karten entfallen. Titel fehlt in der Fassung, gilt die ID. */
export function sammlungsinhalt(
  verzeichnis: Inhaltsverzeichnis,
  gefunden: ReadonlySet<string>,
  fassung: string,
): Sammlungsgruppe[] {
  return verzeichnis.topics.flatMap((thema) => {
    const karten = verzeichnis.cards
      .filter((k) => k.topic === thema.id)
      .map((k): Sammlungskarte => (gefunden.has(k.id) ? { id: k.id, gefunden: true, titel: text(k.title, fassung) || k.id } : { id: k.id, gefunden: false }));
    if (karten.length === 0) return [];
    const farbe = gebietsfarbe(thema.id, verzeichnis.topics, verzeichnis.domains);
    return [
      { id: thema.id, titel: text(thema.title, fassung) || thema.id, symbol: thema.icon, ...(farbe === undefined ? {} : { farbe }), karten },
    ];
  });
}

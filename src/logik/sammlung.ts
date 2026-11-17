// Was die Sammlung zeigt (F14): alle Karten nach Themengebiet, in der Reihenfolge des
// Inhaltsverzeichnisses. Eine nicht gefundene Karte trägt keinen Titel, damit er nirgends durchsickert.

import type { Inhaltsverzeichnis } from './inhaltsverzeichnis.ts';
import { text } from './textfassung.ts';

export type Sammlungskarte = { id: string; gefunden: true; titel: string } | { id: string; gefunden: false };

export interface Sammlungsgruppe {
  /** ID des Themengebiets. */
  id: string;
  titel: string;
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
    return karten.length === 0 ? [] : [{ id: thema.id, titel: text(thema.title, fassung) || thema.id, karten }];
  });
}

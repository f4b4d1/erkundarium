// Was beim Auslösen einer Karte geschieht (F6, F7): Beim ersten Mal wird sie aufgedeckt und gilt ab
// dann als gefunden; jedes weitere Mal öffnet sie sich nur, gleich von welchem Hotspot.

import type { Inhaltsverzeichnis } from './inhaltsverzeichnis.ts';
import { gefundeneKarten, markiereGefunden, type Spielstand } from './spielstand.ts';

export interface Kartenoeffnung {
  /** Der Spielstand danach. Ist die Karte schon gefunden, derselbe wie vorher; dann gibt es nichts zu speichern. */
  spielstand: Spielstand;
  /** Erster Fund: mit Aufdeck-Animation öffnen. */
  aufdecken: boolean;
}

export function oeffneKarte(spielstand: Spielstand, karte: string, zeitpunkt: string): Kartenoeffnung {
  if (gefundeneKarten(spielstand).has(karte)) return { spielstand, aufdecken: false };
  return { spielstand: markiereGefunden(spielstand, karte, zeitpunkt), aufdecken: true };
}

/** F30: Die Eintrittskarte der Szene, wenn sie beim Betreten aufzudecken ist, also noch nicht gefunden ist. */
export function aufzudeckendeEintrittskarte(
  verzeichnis: Inhaltsverzeichnis,
  szene: string,
  gefunden: ReadonlySet<string>,
): string | undefined {
  const karte = verzeichnis.scenes.find((s) => s.id === szene)?.card;
  return karte !== undefined && !gefunden.has(karte) ? karte : undefined;
}

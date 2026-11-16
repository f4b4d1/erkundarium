// Die Speicherschicht (F33). Sie reicht Daten nur durch: Was `laden` liefert, ist ungeprüft und
// geht durch `einlesen` (spielstand.ts). Die Umsetzung mit `localStorage` liegt außerhalb der Logik.

import type { Spielstand } from './spielstand.ts';

export interface Speicherschicht {
  /** Die gespeicherten Daten als geparstes JSON, `undefined`, wenn nichts gespeichert ist. Wirft nie. */
  laden(): unknown;
  speichern(stand: Spielstand): void;
}

/** Speicher im Arbeitsspeicher für Tests. Er hält die Daten wie `localStorage` als JSON-Text. */
export function speicherImArbeitsspeicher(anfang?: unknown): Speicherschicht {
  let text = anfang === undefined ? undefined : JSON.stringify(anfang);
  return {
    laden: () => (text === undefined ? undefined : JSON.parse(text)),
    speichern: (stand) => {
      text = JSON.stringify(stand);
    },
  };
}

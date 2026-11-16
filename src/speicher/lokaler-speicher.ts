// Die Speicherschicht (F33) mit localStorage unter einem festen Schlüssel.

import type { Speicherschicht } from '../logik/speicherschicht.ts';

export const SCHLUESSEL = 'erkundarium-spielstand';

/**
 * `laden` wirft nie: Ist localStorage gesperrt oder der Inhalt kein JSON, liefert es `undefined`.
 * `speichern` wirft, wenn localStorage gesperrt oder voll ist; der Aufrufer fängt das ab.
 */
export function lokalerSpeicher(): Speicherschicht {
  return {
    laden() {
      try {
        const text = localStorage.getItem(SCHLUESSEL);
        return text === null ? undefined : (JSON.parse(text) as unknown);
      } catch {
        return undefined;
      }
    },
    speichern(spielstand) {
      localStorage.setItem(SCHLUESSEL, JSON.stringify(spielstand));
    },
  };
}

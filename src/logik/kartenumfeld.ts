// Was die Kartenansicht unter der Karte zeigt (F16): die Fundorte als Szenennamen und die
// Beziehungen mit den Titeln der Nachbarkarten und der Auskunft, ob sie gefunden sind.

import type { Inhaltsverzeichnis } from './inhaltsverzeichnis.ts';
import { text } from './textfassung.ts';
import { beziehungenDerKarte, fundorte } from './wissensnetz.ts';

export interface Nachbarkarte {
  id: string;
  titel: string;
  gefunden: boolean;
}

export interface Beziehungsblock {
  bezeichnung: string;
  karten: Nachbarkarte[];
}

export interface Kartenumfeld {
  /** Titel der Szenen, in denen die Karte zu finden ist. */
  fundorte: string[];
  beziehungen: Beziehungsblock[];
}

/** Titel in der Textfassung, sonst die ID. */
function benannt(titel: Parameters<typeof text>[0], id: string, fassung: string): string {
  return text(titel, fassung) || id;
}

export function kartenumfeld(
  verzeichnis: Inhaltsverzeichnis,
  karte: string,
  gefunden: ReadonlySet<string>,
  fassung: string,
): Kartenumfeld {
  const titel = (id: string) => verzeichnis.cards.find((k) => k.id === id)?.title ?? {};
  return {
    fundorte: fundorte(verzeichnis, karte).map((id) =>
      benannt(verzeichnis.scenes.find((s) => s.id === id)?.title ?? {}, id, fassung),
    ),
    beziehungen: beziehungenDerKarte(verzeichnis, karte).map((gruppe) => ({
      bezeichnung: text(gruppe.bezeichnung, fassung),
      karten: gruppe.karten.map((id) => ({ id, titel: benannt(titel(id), id, fassung), gefunden: gefunden.has(id) })),
    })),
  };
}

import type { Meldung, Pruefbericht, Stufe } from './pruefung.ts';

const STUFEN: Record<Stufe, string> = { entwickeln: 'Entwickeln', veroeffentlichen: 'Veröffentlichen' };

/** Je Meldung eine Zeile, Fehler vor Warnungen, am Ende eine Zusammenfassung. */
export function formatiereBericht(bericht: Pruefbericht, stufe: Stufe, praefix = ''): string[] {
  const zeile = (art: string) => (m: Meldung) => `${art} ${praefix}${m.datei} [${m.regel}] ${m.text}`;
  const warnungen = bericht.warnungen.length;
  return [
    ...bericht.fehler.map(zeile('Fehler: ')),
    ...bericht.warnungen.map(zeile('Warnung:')),
    `Prüfung in der Stufe ${STUFEN[stufe]}: ${bericht.fehler.length} Fehler, ${warnungen} ${warnungen === 1 ? 'Warnung' : 'Warnungen'}.`,
  ];
}

import { describe, expect, it } from 'vitest';
import { formatiereBericht } from './bericht.ts';
import type { Pruefbericht } from './pruefung.ts';

const leer: Pruefbericht['verzeichnis'] = { worlds: [], scenes: [], cards: [], topics: [], relations: [] };

describe('formatiereBericht', () => {
  it('gibt je Meldung eine Zeile mit Datei, Regel und Text aus, Fehler zuerst, am Ende die Zusammenfassung', () => {
    const bericht: Pruefbericht = {
      fehler: [{ datei: 'a.json', regel: 'regel-a', text: 'Text A.' }],
      warnungen: [
        { datei: 'b.json', regel: 'regel-b', text: 'Text B.' },
        { datei: 'c.json', regel: 'regel-c', text: 'Text C.' },
      ],
      verzeichnis: leer,
    };
    expect(formatiereBericht(bericht, 'entwickeln', 'content/')).toEqual([
      'Fehler:  content/a.json [regel-a] Text A.',
      'Warnung: content/b.json [regel-b] Text B.',
      'Warnung: content/c.json [regel-c] Text C.',
      'Prüfung in der Stufe Entwickeln: 1 Fehler, 2 Warnungen.',
    ]);
  });

  it('nennt die Stufe Veröffentlichen und zählt in der Einzahl', () => {
    const bericht: Pruefbericht = {
      fehler: [],
      warnungen: [{ datei: 'b.json', regel: 'regel-b', text: 'Text B.' }],
      verzeichnis: leer,
    };
    expect(formatiereBericht(bericht, 'veroeffentlichen').at(-1)).toBe(
      'Prüfung in der Stufe Veröffentlichen: 0 Fehler, 1 Warnung.',
    );
  });
});

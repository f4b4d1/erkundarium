import { describe, expect, it } from 'vitest';
import { teileTabelle } from './tabelle.ts';

describe('teileTabelle', () => {
  it('nimmt die erste Zeile als Kopfzeile, die übrigen als Rumpf', () => {
    expect(
      teileTabelle([
        ['Achse', 'Bereich'],
        ['A1', '±185°'],
        ['A2', '±130°'],
      ]),
    ).toEqual({
      kopf: ['Achse', 'Bereich'],
      rumpf: [
        ['A1', '±185°'],
        ['A2', '±130°'],
      ],
    });
  });

  it('füllt kürzere Zeilen mit leeren Zellen auf die längste Zeile auf', () => {
    expect(teileTabelle([['Achse'], ['A1', '±185°', 'schnell'], ['A2', '±130°']])).toEqual({
      kopf: ['Achse', '', ''],
      rumpf: [
        ['A1', '±185°', 'schnell'],
        ['A2', '±130°', ''],
      ],
    });
  });

  it('liefert für eine Tabelle nur aus der Kopfzeile einen leeren Rumpf', () => {
    expect(teileTabelle([['Achse', 'Bereich']])).toEqual({ kopf: ['Achse', 'Bereich'], rumpf: [] });
  });

  it('liefert für eine leere Tabelle leeren Kopf und leeren Rumpf', () => {
    expect(teileTabelle([])).toEqual({ kopf: [], rumpf: [] });
  });
});

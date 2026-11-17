import { describe, expect, it } from 'vitest';
import type { Inhaltsverzeichnis } from './inhaltsverzeichnis.ts';
import { sammlungsinhalt } from './sammlung.ts';
import { testverzeichnis } from './testverzeichnis.ts';

const basis = testverzeichnis({ karten: ['a', 'b', 'c', 'd'] });
const verzeichnis: Inhaltsverzeichnis = {
  ...basis,
  topics: [
    { id: 'antrieb', title: { de: 'Antrieb', en: 'Drive' }, domain: 'wissen-a', icon: 'x.svg' },
    { id: 'leer', title: { de: 'Leer' }, domain: 'wissen-a', icon: 'x.svg' },
    { id: 'sensorik', title: { de: 'Sensorik' }, domain: 'wissen-a', icon: 'y.svg' },
  ],
  cards: [
    { id: 'a', title: { de: 'Motor', en: 'Motor' }, topic: 'sensorik', relations: [] },
    { id: 'b', title: { de: 'Getriebe' }, topic: 'antrieb', relations: [] },
    { id: 'c', title: { de: 'Bremse' }, topic: 'sensorik', relations: [] },
    { id: 'd', title: {}, topic: 'antrieb', relations: [] },
  ],
};

describe('sammlungsinhalt', () => {
  it('gruppiert nach Themengebiet in der Reihenfolge des Verzeichnisses, Karten in deren Reihenfolge', () => {
    const gruppen = sammlungsinhalt(verzeichnis, new Set(), 'de');
    expect(gruppen.map((g) => [g.id, g.karten.map((k) => k.id)])).toEqual([
      ['antrieb', ['b', 'd']],
      ['sensorik', ['a', 'c']],
    ]);
  });

  it('lässt Themengebiete ohne Karten weg', () => {
    expect(sammlungsinhalt(verzeichnis, new Set(), 'de').some((g) => g.id === 'leer')).toBe(false);
  });

  it('gibt gefundenen Karten den Titel, nicht gefundenen keinen', () => {
    const gruppen = sammlungsinhalt(verzeichnis, new Set(['b']), 'de');
    expect(gruppen[0]!.karten).toEqual([
      { id: 'b', gefunden: true, titel: 'Getriebe' },
      { id: 'd', gefunden: false },
    ]);
    expect(JSON.stringify(gruppen[1])).not.toContain('Motor');
  });

  it('nimmt die ID, wenn der Titel in der Fassung fehlt', () => {
    expect(sammlungsinhalt(verzeichnis, new Set(['d']), 'de')[0]!.karten[1]).toEqual({ id: 'd', gefunden: true, titel: 'd' });
  });

  it('nennt die Themengebiete in der Textfassung', () => {
    expect(sammlungsinhalt(verzeichnis, new Set(), 'en')[0]!.titel).toBe('Drive');
  });

  it('ignoriert gefundene IDs ohne Karte im Verzeichnis', () => {
    const gruppen = sammlungsinhalt(verzeichnis, new Set(['gibt-es-nicht']), 'de');
    expect(gruppen.flatMap((g) => g.karten)).toHaveLength(4);
  });
});

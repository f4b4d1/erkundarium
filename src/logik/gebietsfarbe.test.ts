import { describe, expect, it } from 'vitest';
import { gebietsfarbe } from './gebietsfarbe.ts';
import type { Themengebiet, Wissensgebiet } from './inhaltsverzeichnis.ts';

const wissensgebiete: Wissensgebiet[] = [
  { id: 'wissen-a', title: { de: 'Wissen A' }, color: '#112233' },
  { id: 'wissen-b', title: { de: 'Wissen B' }, color: '#445566' },
];

const themengebiete: Themengebiet[] = [
  { id: 'gebiet-a', title: { de: 'Gebiet A' }, domain: 'wissen-a', icon: 'gebiet-a.svg' },
  { id: 'gebiet-b', title: { de: 'Gebiet B' }, domain: 'wissen-b', icon: 'gebiet-b.svg' },
  { id: 'gebiet-c', title: { de: 'Gebiet C' }, domain: 'wissen-a', icon: 'gebiet-c.svg' },
  { id: 'gebiet-x', title: { de: 'Gebiet X' }, domain: 'wissen-x', icon: 'gebiet-x.svg' },
];

describe('gebietsfarbe', () => {
  it('liefert die Farbe des Wissensgebiets, zu dem das Themengebiet gehört', () => {
    expect(gebietsfarbe('gebiet-a', themengebiete, wissensgebiete)).toBe('#112233');
    expect(gebietsfarbe('gebiet-b', themengebiete, wissensgebiete)).toBe('#445566');
  });

  it('gibt Themengebieten desselben Wissensgebiets dieselbe Farbe', () => {
    expect(gebietsfarbe('gebiet-c', themengebiete, wissensgebiete)).toBe('#112233');
  });

  it('liefert nichts für ein unbekanntes Themengebiet', () => {
    expect(gebietsfarbe('gebiet-fehlt', themengebiete, wissensgebiete)).toBeUndefined();
  });

  it('liefert nichts, wenn das Wissensgebiet des Themengebiets unbekannt ist', () => {
    expect(gebietsfarbe('gebiet-x', themengebiete, wissensgebiete)).toBeUndefined();
  });
});

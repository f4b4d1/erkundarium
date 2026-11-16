import { describe, expect, it } from 'vitest';
import {
  fortschrittDerWelt,
  gesamtfortschritt,
  istAbgeschlossen,
  kartenDerSzene,
  standDerSzene,
} from './fortschritt.ts';
import { testverzeichnis } from './testverzeichnis.ts';

const gefunden = (...ids: string[]): ReadonlySet<string> => new Set(ids);

describe('kartenDerSzene', () => {
  it('liefert Eintrittskarte und Karten der Hotspots, jede einmal', () => {
    const v = testverzeichnis({
      szenen: { a: { eintrittskarte: 'karte-e', karten: ['karte-x', 'karte-y', 'karte-x'], zoom: ['b'], infos: 1 }, b: {} },
      karten: ['karte-e', 'karte-x', 'karte-y'],
    });
    expect(kartenDerSzene(v, 'a')).toEqual(['karte-e', 'karte-x', 'karte-y']);
  });

  it('übergeht Karten, die es im Verzeichnis nicht gibt', () => {
    const v = testverzeichnis({ szenen: { a: { eintrittskarte: 'karte-fehlt', karten: ['karte-x', 'karte-fehlt-2'] } }, karten: ['karte-x'] });
    expect(kartenDerSzene(v, 'a')).toEqual(['karte-x']);
  });
});

describe('standDerSzene', () => {
  const v = testverzeichnis({
    szenen: {
      a: { eintrittskarte: 'karte-a', zoom: ['b', 'c'] },
      b: { karten: ['karte-b', 'karte-geteilt'], zoom: ['d'] },
      c: { karten: ['karte-geteilt'], zoom: ['d'] },
      d: { karten: ['karte-d'] },
      daneben: { karten: ['karte-daneben'] },
    },
    karten: ['karte-a', 'karte-b', 'karte-geteilt', 'karte-d', 'karte-daneben'],
  });

  it('zählt die Karten der Szene samt allen tieferen Szenen', () => {
    expect(standDerSzene(v, 'b', gefunden('karte-b', 'karte-d', 'karte-daneben'))).toEqual({ gefunden: 2, vorhanden: 3 });
  });

  it('zählt jede Karte einmal, auch wenn sie in mehreren Szenen hängt oder eine Szene über zwei Wege erreichbar ist', () => {
    expect(standDerSzene(v, 'a', gefunden('karte-geteilt', 'karte-d'))).toEqual({ gefunden: 2, vorhanden: 4 });
  });

  it('zählt gefundene Karten-IDs, die es im Verzeichnis nicht gibt, nicht mit', () => {
    expect(standDerSzene(v, 'd', gefunden('karte-d', 'karte-unbekannt'))).toEqual({ gefunden: 1, vorhanden: 1 });
  });

  it('endet bei einem Kreis', () => {
    const kreis = testverzeichnis({
      szenen: { a: { karten: ['karte-a'], zoom: ['b'] }, b: { karten: ['karte-b'], zoom: ['a'] } },
      karten: ['karte-a', 'karte-b'],
    });
    expect(standDerSzene(kreis, 'a', gefunden('karte-b'))).toEqual({ gefunden: 1, vorhanden: 2 });
  });

  it('ergibt für eine unbekannte Szene null von null', () => {
    expect(standDerSzene(v, 'fehlt', gefunden('karte-a'))).toEqual({ gefunden: 0, vorhanden: 0 });
  });
});

describe('istAbgeschlossen', () => {
  const v = testverzeichnis({
    szenen: {
      a: { eintrittskarte: 'karte-a', karten: ['karte-x'], zoom: ['b'] },
      b: { karten: ['karte-b'] },
    },
    karten: ['karte-a', 'karte-x', 'karte-b'],
  });

  it('ist wahr, wenn Eintrittskarte, alle Karten der Hotspots und alle tieferen Szenen gefunden bzw. abgeschlossen sind', () => {
    expect(istAbgeschlossen(v, 'a', gefunden('karte-a', 'karte-x', 'karte-b'))).toBe(true);
  });

  it('ist falsch, solange die Eintrittskarte nicht gefunden ist', () => {
    expect(istAbgeschlossen(v, 'a', gefunden('karte-x', 'karte-b'))).toBe(false);
  });

  it('ist falsch, solange eine Karte eines Hotspots nicht gefunden ist', () => {
    expect(istAbgeschlossen(v, 'a', gefunden('karte-a', 'karte-b'))).toBe(false);
  });

  it('ist falsch, solange eine per Zoom erreichbare Szene nicht abgeschlossen ist', () => {
    expect(istAbgeschlossen(v, 'a', gefunden('karte-a', 'karte-x'))).toBe(false);
  });

  it('ist wahr für eine Szene ohne Karten und ohne tiefere Szenen', () => {
    const leer = testverzeichnis({ szenen: { a: { infos: 2 } } });
    expect(istAbgeschlossen(leer, 'a', gefunden())).toBe(true);
  });

  it('wird von einem Zoom-Ziel oder einer Karte, die es im Verzeichnis nicht gibt, nicht verhindert', () => {
    const lueckenhaft = testverzeichnis({
      szenen: { a: { eintrittskarte: 'karte-fehlt', karten: ['karte-x', 'karte-fehlt-2'], zoom: ['szene-fehlt'] } },
      karten: ['karte-x'],
    });
    expect(istAbgeschlossen(lueckenhaft, 'a', gefunden('karte-x'))).toBe(true);
  });

  it('ist falsch für eine Szene, die es im Verzeichnis nicht gibt', () => {
    expect(istAbgeschlossen(v, 'fehlt', gefunden())).toBe(false);
  });
});

describe('fortschrittDerWelt', () => {
  const v = testverzeichnis({
    welten: { 'welt-a': 'a', 'welt-b': 'c' },
    szenen: {
      a: { eintrittskarte: 'karte-a', karten: ['karte-geteilt'] },
      verwaist: { karten: ['karte-v'] },
      c: { welt: 'welt-b', karten: ['karte-geteilt', 'karte-c'] },
    },
    karten: ['karte-a', 'karte-geteilt', 'karte-v', 'karte-c', 'karte-ohne-fundort'],
  });

  it('zählt die Karten, auf die die Szenen der Welt verweisen, jede einmal', () => {
    expect(fortschrittDerWelt(v, 'welt-a', gefunden('karte-geteilt', 'karte-c'))).toEqual({ gefunden: 1, vorhanden: 3 });
  });

  it('zählt gefundene Karten-IDs, die es im Verzeichnis nicht gibt, nicht mit', () => {
    expect(fortschrittDerWelt(v, 'welt-b', gefunden('karte-c', 'karte-unbekannt'))).toEqual({ gefunden: 1, vorhanden: 2 });
  });

  it('ergibt für eine unbekannte Welt null von null', () => {
    expect(fortschrittDerWelt(v, 'fehlt', gefunden('karte-a'))).toEqual({ gefunden: 0, vorhanden: 0 });
  });
});

describe('gesamtfortschritt', () => {
  it('zählt alle Karten im Kartenvorrat, auch solche ohne Fundort, aber keine unbekannten Karten-IDs', () => {
    const v = testverzeichnis({
      szenen: { a: { karten: ['karte-a'] } },
      karten: ['karte-a', 'karte-ohne-fundort'],
    });
    expect(gesamtfortschritt(v, gefunden('karte-ohne-fundort', 'karte-unbekannt'))).toEqual({ gefunden: 1, vorhanden: 2 });
  });
});

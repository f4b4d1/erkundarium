import { describe, expect, it } from 'vitest';
import {
  erreichbareSzenen,
  findeKreise,
  tiefereSzenen,
  unerreichbareSzenen,
  zoomZiele,
} from './szenennetz.ts';
import { testverzeichnis } from './testverzeichnis.ts';

describe('zoomZiele', () => {
  it('liefert die Szenen, in die man von einer Szene direkt zoomen kann', () => {
    const v = testverzeichnis({
      szenen: { a: { zoom: ['b', 'c'], karten: ['karte-x'], infos: 1 }, b: { zoom: ['d'] }, c: {}, d: {} },
      karten: ['karte-x'],
    });
    expect(zoomZiele(v, 'a')).toEqual(['b', 'c']);
  });

  it('nennt ein Ziel nur einmal, auch wenn zwei Hotspots darauf zeigen', () => {
    const v = testverzeichnis({ szenen: { a: { zoom: ['b', 'b'] }, b: {} } });
    expect(zoomZiele(v, 'a')).toEqual(['b']);
  });

  it('übergeht ein Zoom-Ziel, das es im Verzeichnis nicht gibt', () => {
    const v = testverzeichnis({ szenen: { a: { zoom: ['fehlt', 'b'] }, b: {} } });
    expect(zoomZiele(v, 'a')).toEqual(['b']);
  });

  it('liefert für eine unbekannte Szene nichts', () => {
    expect(zoomZiele(testverzeichnis({}), 'fehlt')).toEqual([]);
  });
});

describe('tiefereSzenen', () => {
  it('liefert alle Szenen, die über einen oder mehrere Zooms erreichbar sind, ohne die Szene selbst', () => {
    const v = testverzeichnis({ szenen: { a: { zoom: ['b'] }, b: { zoom: ['c'] }, c: {}, d: { zoom: ['a'] } } });
    expect(tiefereSzenen(v, 'a')).toEqual(['b', 'c']);
  });

  it('nennt eine Szene, die über zwei Wege erreichbar ist, nur einmal', () => {
    const v = testverzeichnis({ szenen: { a: { zoom: ['b', 'c'] }, b: { zoom: ['d'] }, c: { zoom: ['d'] }, d: {} } });
    expect(tiefereSzenen(v, 'a')).toEqual(['b', 'c', 'd']);
  });

  it('endet bei einem Kreis', () => {
    const v = testverzeichnis({ szenen: { a: { zoom: ['b'] }, b: { zoom: ['c'] }, c: { zoom: ['a'] } } });
    expect(tiefereSzenen(v, 'a')).toEqual(['b', 'c']);
  });
});

describe('findeKreise', () => {
  it('findet in einem Netz ohne Kreise keinen, auch wenn eine Szene über zwei Wege erreichbar ist', () => {
    const v = testverzeichnis({ szenen: { a: { zoom: ['b', 'c'] }, b: { zoom: ['d'] }, c: { zoom: ['d'] }, d: {} } });
    expect(findeKreise(v)).toEqual([]);
  });

  it('liefert einen Kreis als Liste der beteiligten Szenen in Zoom-Richtung', () => {
    const v = testverzeichnis({ szenen: { a: { zoom: ['b'] }, b: { zoom: ['c'] }, c: { zoom: ['b'] } } });
    expect(findeKreise(v)).toEqual([['b', 'c']]);
  });

  it('erkennt eine Szene, die in sich selbst zoomt, als Kreis', () => {
    const v = testverzeichnis({ szenen: { a: { zoom: ['a'] } } });
    expect(findeKreise(v)).toEqual([['a']]);
  });

  it('findet getrennte Kreise einzeln', () => {
    const v = testverzeichnis({
      szenen: { a: { zoom: ['b'] }, b: { zoom: ['a'] }, c: { zoom: ['d'] }, d: { zoom: ['c'] } },
    });
    expect(findeKreise(v)).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });
});

describe('erreichbare und unerreichbare Szenen einer Welt', () => {
  const v = testverzeichnis({
    welten: { 'welt-a': 'start', 'welt-b': 'anderer-start' },
    szenen: {
      start: { zoom: ['b', 'fehlt'] },
      b: { zoom: ['c'] },
      c: {},
      verwaist: { zoom: ['c'] },
      'anderer-start': { welt: 'welt-b' },
    },
  });

  it('liefert die Startszene und alle von ihr aus erreichbaren Szenen der Welt', () => {
    expect(erreichbareSzenen(v, 'welt-a')).toEqual(['start', 'b', 'c']);
  });

  it('liefert die Szenen der Welt, die von der Startszene aus nicht erreichbar sind', () => {
    expect(unerreichbareSzenen(v, 'welt-a')).toEqual(['verwaist']);
  });

  it('zählt eine Szene, die über einen Kreis zur Startszene zurückführt, als erreichbar, ohne endlos zu laufen', () => {
    const kreis = testverzeichnis({
      welten: { 'welt-a': 'start' },
      szenen: { start: { zoom: ['b'] }, b: { zoom: ['start'] } },
    });
    expect(erreichbareSzenen(kreis, 'welt-a')).toEqual(['start', 'b']);
    expect(unerreichbareSzenen(kreis, 'welt-a')).toEqual([]);
  });

  it('behandelt alle Szenen als unerreichbar, wenn die Startszene fehlt', () => {
    const ohneStart = testverzeichnis({ welten: { 'welt-a': 'fehlt' }, szenen: { a: {} } });
    expect(erreichbareSzenen(ohneStart, 'welt-a')).toEqual([]);
    expect(unerreichbareSzenen(ohneStart, 'welt-a')).toEqual(['a']);
  });

  it('liefert für eine unbekannte Welt nichts', () => {
    expect(erreichbareSzenen(v, 'fehlt')).toEqual([]);
    expect(unerreichbareSzenen(v, 'fehlt')).toEqual([]);
  });
});

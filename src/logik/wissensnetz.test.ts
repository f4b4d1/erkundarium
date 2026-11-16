import { describe, expect, it } from 'vitest';
import { testverzeichnis } from './testverzeichnis.ts';
import { beziehungenDerKarte, fundorte } from './wissensnetz.ts';

describe('fundorte', () => {
  it('nennt jede Szene, in der die Karte Eintrittskarte ist oder an einem Hotspot hängt', () => {
    const v = testverzeichnis({
      szenen: { a: { karten: ['karte-x'] }, b: { karten: ['karte-y'] }, c: { eintrittskarte: 'karte-x' } },
      karten: ['karte-x', 'karte-y'],
    });
    expect(fundorte(v, 'karte-x')).toEqual(['a', 'c']);
  });

  it('nennt eine Szene nur einmal, auch wenn die Karte dort mehrfach vorkommt', () => {
    const v = testverzeichnis({
      szenen: { a: { eintrittskarte: 'karte-x', karten: ['karte-x', 'karte-x'] } },
      karten: ['karte-x'],
    });
    expect(fundorte(v, 'karte-x')).toEqual(['a']);
  });

  it('liefert für eine Karte ohne Hotspot und ohne Szene keinen Fundort', () => {
    const v = testverzeichnis({ szenen: { a: { karten: ['karte-y'] } }, karten: ['karte-x', 'karte-y'] });
    expect(fundorte(v, 'karte-x')).toEqual([]);
  });

  it('leitet aus Zoom-Hotspots keinen Fundort ab', () => {
    const v = testverzeichnis({ szenen: { a: { zoom: ['b'] }, b: { karten: ['karte-x'] } }, karten: ['karte-x'] });
    expect(fundorte(v, 'karte-x')).toEqual(['b']);
  });
});

describe('beziehungenDerKarte', () => {
  it('liefert eine gerichtete Beziehung an der Ausgangskarte mit der Bezeichnung für vorwärts', () => {
    const v = testverzeichnis({
      karten: ['karte-x', 'karte-y'],
      typen: { 'typ-a': 'gerichtet' },
      beziehungen: [['karte-x', 'typ-a', 'karte-y']],
    });
    expect(beziehungenDerKarte(v, 'karte-x')).toEqual([
      { typ: 'typ-a', richtung: 'vorwaerts', bezeichnung: { de: 'typ-a vor' }, karten: ['karte-y'] },
    ]);
  });

  it('berechnet an der Zielkarte die Gegenrichtung mit der Bezeichnung für rückwärts', () => {
    const v = testverzeichnis({
      karten: ['karte-x', 'karte-y'],
      typen: { 'typ-a': 'gerichtet' },
      beziehungen: [['karte-x', 'typ-a', 'karte-y']],
    });
    expect(beziehungenDerKarte(v, 'karte-y')).toEqual([
      { typ: 'typ-a', richtung: 'rueckwaerts', bezeichnung: { de: 'typ-a zurück' }, karten: ['karte-x'] },
    ]);
  });

  it('fasst Nachbarkarten desselben Typs und derselben Richtung in einer Gruppe zusammen', () => {
    const v = testverzeichnis({
      karten: ['karte-x', 'karte-y', 'karte-z', 'karte-w'],
      typen: { 'typ-a': 'gerichtet' },
      beziehungen: [
        ['karte-x', 'typ-a', 'karte-y'],
        ['karte-x', 'typ-a', 'karte-z'],
        ['karte-w', 'typ-a', 'karte-x'],
      ],
    });
    expect(beziehungenDerKarte(v, 'karte-x')).toEqual([
      { typ: 'typ-a', richtung: 'vorwaerts', bezeichnung: { de: 'typ-a vor' }, karten: ['karte-y', 'karte-z'] },
      { typ: 'typ-a', richtung: 'rueckwaerts', bezeichnung: { de: 'typ-a zurück' }, karten: ['karte-w'] },
    ]);
  });

  it('ordnet die Gruppen nach der Reihenfolge der Beziehungstypen, vorwärts vor rückwärts', () => {
    const v = testverzeichnis({
      karten: ['karte-x', 'karte-y', 'karte-z'],
      typen: { 'typ-a': 'gerichtet', 'typ-b': 'gerichtet' },
      beziehungen: [
        ['karte-y', 'typ-a', 'karte-x'],
        ['karte-x', 'typ-b', 'karte-z'],
        ['karte-x', 'typ-a', 'karte-z'],
      ],
    });
    expect(beziehungenDerKarte(v, 'karte-x').map((g) => `${g.typ} ${g.richtung}`)).toEqual([
      'typ-a vorwaerts',
      'typ-a rueckwaerts',
      'typ-b vorwaerts',
    ]);
  });

  it('zeigt eine symmetrische Beziehung an beiden Karten in einer Gruppe mit der Bezeichnung für vorwärts', () => {
    const v = testverzeichnis({
      karten: ['karte-x', 'karte-y', 'karte-z'],
      typen: { 'typ-s': 'symmetrisch' },
      beziehungen: [
        ['karte-x', 'typ-s', 'karte-y'],
        ['karte-z', 'typ-s', 'karte-x'],
      ],
    });
    const gruppe = { typ: 'typ-s', richtung: 'vorwaerts', bezeichnung: { de: 'typ-s mit' } };
    expect(beziehungenDerKarte(v, 'karte-x')).toEqual([{ ...gruppe, karten: ['karte-y', 'karte-z'] }]);
    expect(beziehungenDerKarte(v, 'karte-y')).toEqual([{ ...gruppe, karten: ['karte-x'] }]);
  });

  it('übergeht Beziehungen mit unbekanntem Typ', () => {
    const v = testverzeichnis({
      karten: ['karte-x', 'karte-y'],
      beziehungen: [['karte-x', 'typ-fehlt', 'karte-y']],
    });
    expect(beziehungenDerKarte(v, 'karte-x')).toEqual([]);
    expect(beziehungenDerKarte(v, 'karte-y')).toEqual([]);
  });

  it('übergeht Beziehungen zu einer Karte, die es im Verzeichnis nicht gibt', () => {
    const v = testverzeichnis({
      karten: ['karte-x'],
      typen: { 'typ-a': 'gerichtet' },
      beziehungen: [['karte-x', 'typ-a', 'karte-fehlt']],
    });
    expect(beziehungenDerKarte(v, 'karte-x')).toEqual([]);
  });

  it('nennt eine Nachbarkarte je Gruppe nur einmal', () => {
    const v = testverzeichnis({
      karten: ['karte-x', 'karte-y'],
      typen: { 'typ-a': 'gerichtet' },
      beziehungen: [
        ['karte-x', 'typ-a', 'karte-y'],
        ['karte-x', 'typ-a', 'karte-y'],
      ],
    });
    expect(beziehungenDerKarte(v, 'karte-x')[0]?.karten).toEqual(['karte-y']);
  });

  it('liefert für eine Karte ohne Beziehungen nichts', () => {
    const v = testverzeichnis({ karten: ['karte-x'], typen: { 'typ-a': 'gerichtet' } });
    expect(beziehungenDerKarte(v, 'karte-x')).toEqual([]);
  });
});

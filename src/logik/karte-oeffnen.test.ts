import { describe, expect, it } from 'vitest';
import { aufzudeckendeEintrittskarte, oeffneKarte } from './karte-oeffnen.ts';
import { testverzeichnis } from './testverzeichnis.ts';
import { gefundeneKarten, markiereGefunden, neuerSpielstand } from './spielstand.ts';

const ZEIT_1 = '2026-11-20T19:12:00.000Z';
const ZEIT_2 = '2026-11-21T08:00:00.000Z';

describe('oeffneKarte', () => {
  it('deckt eine nicht gefundene Karte auf und markiert sie als gefunden', () => {
    const ergebnis = oeffneKarte(neuerSpielstand(), 'karte-a', ZEIT_1);
    expect(ergebnis.aufdecken).toBe(true);
    expect(gefundeneKarten(ergebnis.spielstand)).toEqual(new Set(['karte-a']));
    expect(ergebnis.spielstand.profiles.standard!.cards['karte-a']).toBe(ZEIT_1);
  });

  it('öffnet eine gefundene Karte nur und lässt den Spielstand unverändert', () => {
    const vorher = markiereGefunden(neuerSpielstand(), 'karte-a', ZEIT_1);
    const ergebnis = oeffneKarte(vorher, 'karte-a', ZEIT_2);
    expect(ergebnis.aufdecken).toBe(false);
    expect(ergebnis.spielstand).toBe(vorher);
  });

  it('deckt eine Karte auf, auch wenn andere Karten schon gefunden sind', () => {
    const vorher = markiereGefunden(neuerSpielstand(), 'karte-b', ZEIT_1);
    const ergebnis = oeffneKarte(vorher, 'karte-a', ZEIT_2);
    expect(ergebnis.aufdecken).toBe(true);
    expect(gefundeneKarten(ergebnis.spielstand)).toEqual(new Set(['karte-a', 'karte-b']));
  });

  it('ändert den übergebenen Spielstand nicht', () => {
    const vorher = neuerSpielstand();
    oeffneKarte(vorher, 'karte-a', ZEIT_1);
    expect(gefundeneKarten(vorher).size).toBe(0);
  });
});

describe('aufzudeckendeEintrittskarte', () => {
  const verzeichnis = testverzeichnis({
    szenen: { 'szene-a': { eintrittskarte: 'karte-a' }, 'szene-b': {} },
    karten: ['karte-a'],
  });

  it('nennt die Eintrittskarte, solange sie nicht gefunden ist', () => {
    expect(aufzudeckendeEintrittskarte(verzeichnis, 'szene-a', new Set())).toBe('karte-a');
  });

  it('nennt keine, wenn die Eintrittskarte schon gefunden ist', () => {
    expect(aufzudeckendeEintrittskarte(verzeichnis, 'szene-a', new Set(['karte-a']))).toBeUndefined();
  });

  it('nennt keine, wenn die Szene keine Eintrittskarte trägt oder unbekannt ist', () => {
    expect(aufzudeckendeEintrittskarte(verzeichnis, 'szene-b', new Set())).toBeUndefined();
    expect(aufzudeckendeEintrittskarte(verzeichnis, 'gibt-es-nicht', new Set())).toBeUndefined();
  });
});

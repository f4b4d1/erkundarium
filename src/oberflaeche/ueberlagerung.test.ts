import { describe, expect, it } from 'vitest';
import { fokusErledigt, mitKarte, ohneKarte, ueberlagert, type Ueberlagerung } from './ueberlagerung.ts';

const leer: Ueberlagerung = {};

describe('ueberlagert', () => {
  it('ist ohne offene Karte falsch', () => {
    expect(ueberlagert(leer)).toBe(false);
  });

  it('ist mit offener Karte wahr', () => {
    expect(ueberlagert(mitKarte(leer, 'a', false, { art: 'szene' }))).toBe(true);
  });

  it('ist nach dem Schließen falsch, auch wenn der Fokus noch aussteht', () => {
    const zu = ohneKarte(mitKarte(leer, 'a', false, { art: 'szene' }));
    expect(zu.fokusAusstehend).toBeDefined();
    expect(ueberlagert(zu)).toBe(false);
  });
});

describe('mitKarte', () => {
  it('öffnet die Karte mit Aufdecken und Fokusziel', () => {
    expect(mitKarte(leer, 'a', true, { art: 'hotspot', id: 'h' })).toEqual({
      karte: { karte: 'a', aufdecken: true, fokus: { art: 'hotspot', id: 'h' }, nummer: 1 },
    });
  });

  it('zählt die Nummer bei offener Karte weiter', () => {
    const erste = mitKarte(leer, 'a', false, { art: 'szene' });
    expect(mitKarte(erste, 'b', false, { art: 'szene' }).karte?.nummer).toBe(2);
  });

  it('beginnt nach dem Schließen wieder bei 1', () => {
    const zu = ohneKarte(mitKarte(leer, 'a', false, { art: 'szene' }));
    expect(mitKarte(zu, 'b', false, { art: 'szene' }).karte?.nummer).toBe(1);
  });

  it('verwirft einen ausstehenden Fokus', () => {
    const zu = ohneKarte(mitKarte(leer, 'a', false, { art: 'kartenknopf' }));
    expect(mitKarte(zu, 'b', false, { art: 'szene' }).fokusAusstehend).toBeUndefined();
  });
});

describe('ohneKarte', () => {
  it('merkt sich das Fokusziel der Karte', () => {
    const zu = ohneKarte(mitKarte(leer, 'a', false, { art: 'hotspot', id: 'h' }));
    expect(zu).toEqual({ fokusAusstehend: { art: 'hotspot', id: 'h' } });
  });

  it('lässt eine Überlagerung ohne Karte unverändert', () => {
    expect(ohneKarte(leer)).toEqual({});
    const wartend: Ueberlagerung = { fokusAusstehend: { art: 'szene' } };
    expect(ohneKarte(wartend)).toBe(wartend);
  });
});

describe('fokusErledigt', () => {
  it('entfernt den ausstehenden Fokus', () => {
    const zu = ohneKarte(mitKarte(leer, 'a', false, { art: 'szene' }));
    expect(fokusErledigt(zu)).toEqual({});
  });
});

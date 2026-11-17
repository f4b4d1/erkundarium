import { describe, expect, it } from 'vitest';
import {
  fokusBereit,
  fokusErledigt,
  mitKarte,
  mitSammlung,
  ohneKarte,
  ohneSammlung,
  ueberlagert,
  type Ueberlagerung,
} from './ueberlagerung.ts';

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

describe('Sammlung', () => {
  const knopf = { art: 'sammlungsknopf' } as const;
  const eintrag = { art: 'eintrag', karte: 'a' } as const;

  it('mitSammlung öffnet die Sammlung mit Fokusziel und überlagert die Szene', () => {
    const u = mitSammlung(leer, knopf);
    expect(u).toEqual({ sammlung: { fokus: knopf } });
    expect(ueberlagert(u)).toBe(true);
  });

  it('mitSammlung verwirft einen ausstehenden Fokus', () => {
    const zu = ohneKarte(mitKarte(leer, 'a', false, { art: 'szene' }));
    expect(mitSammlung(zu, knopf).fokusAusstehend).toBeUndefined();
  });

  it('ohneSammlung merkt sich das Fokusziel und überlagert nicht mehr', () => {
    const zu = ohneSammlung(mitSammlung(leer, knopf));
    expect(zu).toEqual({ fokusAusstehend: knopf });
    expect(ueberlagert(zu)).toBe(false);
  });

  it('ohneSammlung lässt eine Überlagerung ohne Sammlung unverändert', () => {
    expect(ohneSammlung(leer)).toBe(leer);
  });

  it('eine Karte über der Sammlung lässt die Sammlung stehen', () => {
    const u = mitKarte(mitSammlung(leer, knopf), 'a', false, eintrag);
    expect(u.sammlung).toEqual({ fokus: knopf });
    expect(u.karte?.karte).toBe('a');
  });

  it('ohneKarte lässt die Sammlung offen und merkt sich den Eintrag', () => {
    const u = ohneKarte(mitKarte(mitSammlung(leer, knopf), 'a', false, eintrag));
    expect(u).toEqual({ sammlung: { fokus: knopf }, fokusAusstehend: eintrag });
    expect(ueberlagert(u)).toBe(true);
  });

  it('eine Karte ersetzt eine offene, die Sammlung bleibt', () => {
    const u = mitKarte(mitKarte(mitSammlung(leer, knopf), 'a', false, eintrag), 'b', false, eintrag);
    expect(u.sammlung).toBeDefined();
    expect(u.karte?.nummer).toBe(2);
  });
});

describe('fokusBereit', () => {
  const knopf = { art: 'sammlungsknopf' } as const;
  const eintrag = { art: 'eintrag', karte: 'a' } as const;

  it('ist ohne ausstehenden Fokus falsch', () => {
    expect(fokusBereit(leer)).toBe(false);
  });

  it('wartet bei überlagerter Szene, solange die Karte offen ist', () => {
    expect(fokusBereit({ karte: mitKarte(leer, 'a', false, eintrag).karte!, fokusAusstehend: eintrag })).toBe(false);
  });

  it('der Eintrag ist bereit, sobald die Karte weg ist, auch bei stehender Sammlung', () => {
    expect(fokusBereit(ohneKarte(mitKarte(mitSammlung(leer, knopf), 'a', false, eintrag)))).toBe(true);
  });

  it('andere Ziele warten, solange die Sammlung steht', () => {
    expect(fokusBereit({ sammlung: { fokus: knopf }, fokusAusstehend: knopf })).toBe(false);
    expect(fokusBereit({ sammlung: { fokus: knopf }, fokusAusstehend: { art: 'szene' } })).toBe(false);
  });

  it('der Sammlungsknopf ist bereit, wenn die Sammlung zu ist', () => {
    expect(fokusBereit(ohneSammlung(mitSammlung(leer, knopf)))).toBe(true);
  });

  it('ein Ziel der Szene ist bereit, wenn nichts mehr überlagert', () => {
    expect(fokusBereit(ohneKarte(mitKarte(leer, 'a', false, { art: 'hotspot', id: 'h' })))).toBe(true);
  });
});

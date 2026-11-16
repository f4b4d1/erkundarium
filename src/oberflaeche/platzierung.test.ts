import { describe, expect, it } from 'vitest';
import { ANKERVERSATZ, platziereAmAnker, platziereHinweis, sollNeuAnkern } from './platzierung.ts';

const bereich = { links: 0, oben: 0, breite: 1000, hoehe: 600 };
const hinweis = { breite: 200, hoehe: 80 };
const ABSTAND = 8;

describe('platziereHinweis', () => {
  it('setzt den Hinweis mittig über den Hotspot, wenn oben Platz ist', () => {
    const ziel = { links: 400, oben: 300, breite: 100, hoehe: 50 };
    expect(platziereHinweis(ziel, hinweis, bereich, ABSTAND)).toEqual({ links: 350, oben: 212 });
  });

  it('setzt ihn unter den Hotspot, wenn oben kein Platz ist', () => {
    const ziel = { links: 400, oben: 20, breite: 100, hoehe: 50 };
    expect(platziereHinweis(ziel, hinweis, bereich, ABSTAND)).toEqual({ links: 350, oben: 78 });
  });

  it('schiebt ihn waagrecht in den Bereich, wenn der Hotspot am Rand liegt', () => {
    const rechts = { links: 950, oben: 300, breite: 40, hoehe: 40 };
    expect(platziereHinweis(rechts, hinweis, bereich, ABSTAND)).toEqual({ links: 800, oben: 212 });
    const links = { links: 5, oben: 300, breite: 40, hoehe: 40 };
    expect(platziereHinweis(links, hinweis, bereich, ABSTAND)).toEqual({ links: 0, oben: 212 });
  });

  it('weicht neben den Hotspot aus, wenn er die ganze Höhe einnimmt', () => {
    const ziel = { links: 100, oben: 0, breite: 100, hoehe: 600 };
    expect(platziereHinweis(ziel, hinweis, bereich, ABSTAND)).toEqual({ links: 208, oben: 260 });
  });

  it('weicht nach links aus, wenn rechts kein Platz ist', () => {
    const ziel = { links: 850, oben: 0, breite: 100, hoehe: 600 };
    expect(platziereHinweis(ziel, hinweis, bereich, ABSTAND)).toEqual({ links: 642, oben: 260 });
  });

  it('rechnet nur mit dem sichtbaren Teil eines Hotspots, der über den Bereich hinausragt', () => {
    const ziel = { links: 400, oben: -500, breite: 100, hoehe: 600 };
    expect(platziereHinweis(ziel, hinweis, bereich, ABSTAND)).toEqual({ links: 350, oben: 108 });
  });

  it('bleibt im Bereich und verdeckt möglichst wenig, wenn der Hotspot fast alles füllt', () => {
    const ziel = { links: 10, oben: 10, breite: 980, hoehe: 500 };
    expect(platziereHinweis(ziel, hinweis, bereich, ABSTAND)).toEqual({ links: 400, oben: 518 });
  });

  it('wählt bei unvermeidlicher Überdeckung die Lage mit der kleinsten Überdeckung', () => {
    const ziel = { links: 10, oben: 10, breite: 980, hoehe: 560 };
    // unten bleiben 30 frei: Überdeckung 50 Zeilen; oben, links, rechts überdecken mehr
    expect(platziereHinweis(ziel, hinweis, bereich, ABSTAND)).toEqual({ links: 400, oben: 520 });
  });

  it('legt einen Hinweis, der größer als der Bereich ist, an dessen linke obere Ecke', () => {
    const ziel = { links: 400, oben: 300, breite: 10, hoehe: 10 };
    expect(platziereHinweis(ziel, { breite: 1200, hoehe: 700 }, bereich, ABSTAND)).toEqual({ links: 0, oben: 0 });
  });

  it('beachtet einen Bereich, der nicht bei null beginnt', () => {
    const versetzt = { links: 100, oben: 50, breite: 500, hoehe: 300 };
    const ziel = { links: 110, oben: 60, breite: 20, hoehe: 20 };
    expect(platziereHinweis(ziel, hinweis, versetzt, ABSTAND)).toEqual({ links: 100, oben: 88 });
  });
});

describe('platziereAmAnker', () => {
  const v = ANKERVERSATZ;

  it('setzt den Hinweis rechts unterhalb des Ankers', () => {
    expect(platziereAmAnker({ x: 300, y: 200 }, hinweis, bereich)).toEqual({ links: 300 + v, oben: 200 + v });
  });

  it('weicht nach links aus, wenn rechts kein Platz ist', () => {
    expect(platziereAmAnker({ x: 900, y: 200 }, hinweis, bereich)).toEqual({ links: 900 - v - 200, oben: 200 + v });
  });

  it('weicht nach oben aus, wenn unten kein Platz ist', () => {
    expect(platziereAmAnker({ x: 300, y: 560 }, hinweis, bereich)).toEqual({ links: 300 + v, oben: 560 - v - 80 });
  });

  it('weicht in der Ecke nach links und oben aus', () => {
    expect(platziereAmAnker({ x: 990, y: 590 }, hinweis, bereich)).toEqual({ links: 990 - v - 200, oben: 590 - v - 80 });
  });

  it('beachtet einen Bereich, der nicht bei null beginnt', () => {
    const versetzt = { links: 100, oben: 50, breite: 500, hoehe: 300 };
    expect(platziereAmAnker({ x: 110, y: 60 }, hinweis, versetzt)).toEqual({ links: 110 + v, oben: 60 + v });
  });

  it('verdeckt den Anker nie, auch wenn der Hinweis kaum in den Bereich passt', () => {
    const schmal = { links: 0, oben: 0, breite: 220, hoehe: 600 };
    const anker = { x: 110, y: 300 };
    const lage = platziereAmAnker(anker, hinweis, schmal);
    const deckt = anker.x >= lage.links && anker.x <= lage.links + 200 && anker.y >= lage.oben && anker.y <= lage.oben + 80;
    expect(deckt).toBe(false);
    expect(lage.links).toBeGreaterThanOrEqual(0);
    expect(lage.links + 200).toBeLessThanOrEqual(220);
  });

  it('hält den Hinweis im Bereich, auch wenn er größer ist', () => {
    expect(platziereAmAnker({ x: 400, y: 300 }, { breite: 1200, hoehe: 700 }, bereich)).toEqual({ links: 0, oben: 0 });
  });
});

describe('sollNeuAnkern', () => {
  it('bleibt am Anker, solange der Zeiger nah ist', () => {
    expect(sollNeuAnkern({ x: 100, y: 100 }, { x: 150, y: 150 })).toBe(false);
    expect(sollNeuAnkern({ x: 100, y: 100 }, { x: 220, y: 100 })).toBe(false);
  });

  it('ankert neu, sobald der Zeiger mehr als 120 px entfernt ist', () => {
    expect(sollNeuAnkern({ x: 100, y: 100 }, { x: 221, y: 100 })).toBe(true);
    expect(sollNeuAnkern({ x: 100, y: 100 }, { x: 190, y: 190 })).toBe(true);
  });
});

// Lage des Hinweises am Hotspot als reine Rechnung auf Rechtecken in Bildschirmpixeln.
// Der Hinweis bleibt immer im Bereich und verdeckt den Hotspot möglichst nicht. Probiert werden
// der Reihe nach: über, unter, rechts und links neben dem Hotspot, jeweils mittig und in den
// Bereich geschoben. Die erste Lage ohne Überdeckung gewinnt; gibt es keine, die mit der
// kleinsten Überdeckung. Am Zeiger (Maus, Touch) sitzt der Hinweis stattdessen über einem Ankerpunkt.

import type { Punkt, Rechteck } from '../szene/szene.ts';

export interface Groesse {
  breite: number;
  hoehe: number;
}

export interface Lage {
  links: number;
  oben: number;
}

/**
 * @param ziel Lage des Hotspots; nur sein Teil im Bereich zählt
 * @param bereich der sichtbare Bereich, in dem der Hinweis bleiben muss
 * @param abstand Abstand zwischen Hotspot und Hinweis
 */
export function platziereHinweis(ziel: Rechteck, hinweis: Groesse, bereich: Rechteck, abstand: number): Lage {
  const z = schnitt(ziel, bereich) ?? ziel;
  const mitteX = z.links + z.breite / 2 - hinweis.breite / 2;
  const mitteY = z.oben + z.hoehe / 2 - hinweis.hoehe / 2;
  const kandidaten: Lage[] = [
    { links: mitteX, oben: z.oben - abstand - hinweis.hoehe },
    { links: mitteX, oben: z.oben + z.hoehe + abstand },
    { links: z.links + z.breite + abstand, oben: mitteY },
    { links: z.links - abstand - hinweis.breite, oben: mitteY },
  ].map((lage) => inDenBereich(lage, hinweis, bereich));

  let beste = kandidaten[0]!;
  let kleinsteUeberdeckung = Infinity;
  for (const lage of kandidaten) {
    const ueberdeckung = flaeche(schnitt({ ...lage, ...hinweis }, z));
    if (ueberdeckung === 0) return lage;
    if (ueberdeckung < kleinsteUeberdeckung) {
      beste = lage;
      kleinsteUeberdeckung = ueberdeckung;
    }
  }
  return beste;
}

/** Abstand zwischen Unterkante des Hinweises und Anker, wenn der Hinweis über dem Anker sitzt. */
export const ANKERVERSATZ = 12;
/**
 * Abstand zwischen Anker und Oberkante des Hinweises, wenn der Hinweis unter dem Anker sitzt. Größer
 * als der Versatz oben: Platz für die Zeigerhand, die von der Spitze (Anker) nach unten ragt.
 */
export const ANKERVERSATZ_UNTEN = 32;
/** Entfernt sich der Zeiger weiter vom Anker, setzt sich der Anker an den Zeiger. */
export const NEU_ANKERN_AB = 120;

/**
 * Lage des Hinweises an einem Ankerpunkt (dem Zeiger): waagrecht mittig, bevorzugt über dem Anker.
 * Fehlt oben der Platz, sitzt er mit größerem Abstand darunter. Passt keins von beiden ganz in den
 * Bereich (sehr kleines Fenster), gewinnt die Lage mit weniger Überlauf, in den Bereich geschoben;
 * der Hinweis darf den Anker dann verdecken.
 */
export function platziereAmAnker(anker: Punkt, hinweis: Groesse, bereich: Rechteck, versatz = ANKERVERSATZ): Lage {
  const links = anker.x - hinweis.breite / 2;
  const oben = { links, oben: anker.y - versatz - hinweis.hoehe };
  const unten = { links, oben: anker.y + ANKERVERSATZ_UNTEN };
  const geschobenOben = inDenBereich(oben, hinweis, bereich);
  const geschobenUnten = inDenBereich(unten, hinweis, bereich);
  const ueberlauf = (roh: Lage, geschoben: Lage) => Math.abs(geschoben.oben - roh.oben);
  return ueberlauf(unten, geschobenUnten) < ueberlauf(oben, geschobenOben) ? geschobenUnten : geschobenOben;
}

/** Ob sich der Anker an den Zeiger setzen soll, weil dieser sich weit genug entfernt hat. */
export function sollNeuAnkern(anker: Punkt, zeiger: Punkt, schwelle = NEU_ANKERN_AB): boolean {
  return Math.hypot(zeiger.x - anker.x, zeiger.y - anker.y) > schwelle;
}

/** Schiebt die Lage so, dass der Hinweis im Bereich liegt; ist er größer, an dessen linke obere Ecke. */
function inDenBereich(lage: Lage, hinweis: Groesse, bereich: Rechteck): Lage {
  const klemme = (wert: number, anfang: number, laenge: number, groesse: number) =>
    Math.max(anfang, Math.min(wert, anfang + laenge - groesse));
  return {
    links: klemme(lage.links, bereich.links, bereich.breite, hinweis.breite),
    oben: klemme(lage.oben, bereich.oben, bereich.hoehe, hinweis.hoehe),
  };
}

function schnitt(a: Rechteck, b: Rechteck): Rechteck | undefined {
  const links = Math.max(a.links, b.links);
  const oben = Math.max(a.oben, b.oben);
  const rechts = Math.min(a.links + a.breite, b.links + b.breite);
  const unten = Math.min(a.oben + a.hoehe, b.oben + b.hoehe);
  return rechts > links && unten > oben ? { links, oben, breite: rechts - links, hoehe: unten - oben } : undefined;
}

function flaeche(r: Rechteck | undefined): number {
  return r === undefined ? 0 : r.breite * r.hoehe;
}

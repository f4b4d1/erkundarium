// Was die Szene überlagert, als reiner Zustand ohne DOM. Heute nur die Karte; die Anwendung fragt
// über `ueberlagert`, ob die Szene bedienbar ist, und legt den Fokus erst, wenn die Ansicht weg ist.

/** Wohin der Fokus zurückkehrt, wenn die Karte zugeht: dorthin, wo sie ausgelöst wurde. */
export type Fokusziel =
  | { art: 'hotspot'; id: string }
  | { art: 'kartenknopf' }
  /** Die Karte öffnete sich von selbst (F30), es gibt keinen Auslöser. */
  | { art: 'szene' };

export interface Ueberlagerung {
  karte?: {
    karte: string;
    aufdecken: boolean;
    /** Wohin der Fokus nach dem Schließen zurückkehrt. */
    fokus: Fokusziel;
    /** Zählt jedes Öffnen, damit die Kartenansicht jedes Mal neu beginnt. */
    nummer: number;
  };
  /** Gesetzt beim Schließen; die Anwendung legt den Fokus, sobald die Ansicht aus der Seite ist. */
  fokusAusstehend?: Fokusziel;
}

/** Ob etwas die Szene überlagert; dann bedient die Überlagerung die Tasten selbst. */
export function ueberlagert(u: Ueberlagerung): boolean {
  return u.karte !== undefined;
}

/** Öffnet die Karte (oder ersetzt eine offene); ein ausstehender Fokus fällt weg. */
export function mitKarte(u: Ueberlagerung, karte: string, aufdecken: boolean, fokus: Fokusziel): Ueberlagerung {
  return { karte: { karte, aufdecken, fokus, nummer: (u.karte?.nummer ?? 0) + 1 } };
}

/** Schließt die Karte und merkt sich ihr Fokusziel; ohne offene Karte bleibt alles, wie es ist. */
export function ohneKarte(u: Ueberlagerung): Ueberlagerung {
  if (u.karte === undefined) return u;
  return { fokusAusstehend: u.karte.fokus };
}

/** Der Fokus ist gelegt. */
export function fokusErledigt(u: Ueberlagerung): Ueberlagerung {
  if (u.fokusAusstehend === undefined) return u;
  const { fokusAusstehend: _, ...rest } = u;
  return rest;
}

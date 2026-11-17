// Was die Szene überlagert, als reiner Zustand ohne DOM: die Sammlung und die Karte, die sich auch
// über der Sammlung öffnet. Die Anwendung fragt über `ueberlagert`, ob die Szene bedienbar ist, und
// legt den Fokus erst, wenn `fokusBereit` sagt, dass sein Ziel wieder erreichbar ist.

/** Wohin der Fokus zurückkehrt, wenn die Karte oder die Sammlung zugeht: dorthin, wo sie ausgelöst wurde. */
export type Fokusziel =
  | { art: 'hotspot'; id: string }
  | { art: 'kartenknopf' }
  /** Der Knopf der Sammlung in der Pfadanzeige. */
  | { art: 'sammlungsknopf' }
  /** Der Eintrag einer Karte in der offenen Sammlung. */
  | { art: 'eintrag'; karte: string }
  /** Die Karte öffnete sich von selbst (F30), es gibt keinen Auslöser. */
  | { art: 'szene' };

export interface Ueberlagerung {
  sammlung?: {
    /** Wohin der Fokus nach dem Schließen der Sammlung zurückkehrt. */
    fokus: Fokusziel;
  };
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
  return u.karte !== undefined || u.sammlung !== undefined;
}

/** Ob der ausstehende Fokus gelegt werden kann: sein Ziel ist wieder erreichbar, nichts darüber ist offen. */
export function fokusBereit(u: Ueberlagerung): boolean {
  if (u.fokusAusstehend === undefined || u.karte !== undefined) return false;
  // Ein Eintrag liegt in der Sammlung, die dann noch steht; alles andere liegt unter ihr.
  return u.fokusAusstehend.art === 'eintrag' || u.sammlung === undefined;
}

/** Öffnet die Sammlung; ein ausstehender Fokus fällt weg. Eine offene Karte bleibt darüber. */
export function mitSammlung(u: Ueberlagerung, fokus: Fokusziel): Ueberlagerung {
  return { ...(u.karte === undefined ? {} : { karte: u.karte }), sammlung: { fokus } };
}

/** Schließt die Sammlung samt einer Karte darüber und merkt sich das Fokusziel der Sammlung. */
export function ohneSammlung(u: Ueberlagerung): Ueberlagerung {
  if (u.sammlung === undefined) return u;
  return { fokusAusstehend: u.sammlung.fokus };
}

/** Öffnet die Karte (oder ersetzt eine offene), auch über der Sammlung; ein ausstehender Fokus fällt weg. */
export function mitKarte(u: Ueberlagerung, karte: string, aufdecken: boolean, fokus: Fokusziel): Ueberlagerung {
  return {
    ...(u.sammlung === undefined ? {} : { sammlung: u.sammlung }),
    karte: { karte, aufdecken, fokus, nummer: (u.karte?.nummer ?? 0) + 1 },
  };
}

/** Schließt die Karte und merkt sich ihr Fokusziel; die Sammlung darunter bleibt. Ohne offene Karte bleibt alles, wie es ist. */
export function ohneKarte(u: Ueberlagerung): Ueberlagerung {
  if (u.karte === undefined) return u;
  return { ...(u.sammlung === undefined ? {} : { sammlung: u.sammlung }), fokusAusstehend: u.karte.fokus };
}

/** Der Fokus ist gelegt. */
export function fokusErledigt(u: Ueberlagerung): Ueberlagerung {
  if (u.fokusAusstehend === undefined) return u;
  const { fokusAusstehend: _, ...rest } = u;
  return rest;
}

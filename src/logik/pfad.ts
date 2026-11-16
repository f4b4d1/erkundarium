// Der Pfad (F4) ist der Weg von der Startszene zur aktuellen Szene, als Liste von Szenen-IDs.
// Er gilt nur für die Sitzung und kommt nicht in den Spielstand. Die Funktionen ändern die
// übergebene Liste nicht.

export type Pfad = readonly string[];

/** Der Pfad zu Beginn: nur die Startszene. */
export function neuerPfad(startszene: string): Pfad {
  return [startszene];
}

/** Hängt die betretene Szene an. Ist sie schon die aktuelle, bleibt der Pfad, wie er ist. */
export function betreten(pfad: Pfad, szene: string): Pfad {
  return pfad[pfad.length - 1] === szene ? pfad : [...pfad, szene];
}

/** Kürzt den Pfad bis zur Ebene `szene`, die bleibt. Liegt sie nicht auf dem Pfad, bleibt er unverändert. */
export function kuerzenBis(pfad: Pfad, szene: string): Pfad {
  const index = pfad.indexOf(szene);
  return index < 0 ? pfad : pfad.slice(0, index + 1);
}

// Der Pfad (F4) ist der Weg von der Startszene zur aktuellen Szene, als Liste von Ebenen. Jede Ebene
// merkt sich den Hotspot, über den sie betreten wurde: Über `target` ist er nicht eindeutig, weil
// mehrere Hotspots in dieselbe Szene führen können. Der Pfad gilt nur für die Sitzung und kommt nicht
// in den Spielstand. Die Funktionen ändern die übergebene Liste nicht.

export interface Pfadebene {
  szene: string;
  /** Der Hotspot der vorigen Ebene, über den diese betreten wurde; die Startszene hat keinen. */
  ueber?: string;
}

export type Pfad = readonly Pfadebene[];

/** Eine Zoomstufe des Rückwegs (F4a): Die Szene zoomt aus dem Hotspot heraus, über den der Weg weiterführte. */
export interface Zoomstufe {
  szene: string;
  hotspot?: string;
}

/** Der Pfad zu Beginn: nur die Startszene. */
export function neuerPfad(startszene: string): Pfad {
  return [{ szene: startszene }];
}

/** Hängt die über `ueber` betretene Szene an. Ist sie schon die aktuelle, bleibt der Pfad, wie er ist. */
export function betreten(pfad: Pfad, szene: string, ueber: string): Pfad {
  return pfad[pfad.length - 1]?.szene === szene ? pfad : [...pfad, { szene, ueber }];
}

/** Kürzt den Pfad bis zur Ebene `szene`, die bleibt. Liegt sie nicht auf dem Pfad, bleibt er unverändert. */
export function kuerzenBis(pfad: Pfad, szene: string): Pfad {
  const index = pfad.findIndex((e) => e.szene === szene);
  return index < 0 ? pfad : pfad.slice(0, index + 1);
}

/**
 * Die Zoomstufen für den Rücksprung zur Ebene `ziel` (F4a), innerste zuerst: für jede Ebene von der
 * vorletzten bis zum Ziel die Szene und der Hotspot, über den sie verlassen wurde. Leer, wenn `ziel`
 * die aktuelle Ebene ist oder nicht auf dem Pfad liegt.
 */
export function rueckweg(pfad: Pfad, ziel: string): Zoomstufe[] {
  const index = pfad.findIndex((e) => e.szene === ziel);
  const stufen: Zoomstufe[] = [];
  for (let i = pfad.length - 2; i >= 0 && index >= 0 && i >= index; i--) {
    const hotspot = pfad[i + 1]!.ueber;
    stufen.push({ szene: pfad[i]!.szene, ...(hotspot === undefined ? {} : { hotspot }) });
  }
  return stufen;
}

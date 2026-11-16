// Baut für Tests ein kleines erfundenes Inhaltsverzeichnis aus einer knappen Beschreibung.
// Nur von Tests benutzt.

import type { Hotspoteintrag, Inhaltsverzeichnis } from './inhaltsverzeichnis.ts';

export interface Szenenbeschreibung {
  /** Welt der Szene, sonst `welt-a`. */
  welt?: string;
  eintrittskarte?: string;
  /** Ziele der Hotspots mit Aktion `card`. */
  karten?: string[];
  /** Ziele der Hotspots mit Aktion `scene`. */
  zoom?: string[];
  /** Anzahl der Hotspots mit Aktion `info`. */
  infos?: number;
}

export interface Verzeichnisbeschreibung {
  /** Welt-ID -> Startszene. */
  welten?: Record<string, string>;
  szenen?: Record<string, Szenenbeschreibung>;
  /** Kartenvorrat. */
  karten?: string[];
  /** Beziehungstyp-ID -> gerichtet oder symmetrisch. */
  typen?: Record<string, 'gerichtet' | 'symmetrisch'>;
  /** Beziehungen als [Ausgangskarte, Typ, Zielkarte]. Die Ausgangskarte muss im Kartenvorrat stehen. */
  beziehungen?: [string, string, string][];
}

export function testverzeichnis(b: Verzeichnisbeschreibung): Inhaltsverzeichnis {
  const beziehungen = b.beziehungen ?? [];
  for (const [von] of beziehungen) {
    if (!(b.karten ?? []).includes(von)) throw new Error(`Ausgangskarte ${von} fehlt im Kartenvorrat`);
  }
  return {
    worlds: Object.entries(b.welten ?? {}).map(([id, start]) => ({ id, title: { de: id }, start })),
    scenes: Object.entries(b.szenen ?? {}).map(([id, s]) => {
      const hotspots: Hotspoteintrag[] = [
        ...(s.karten ?? []).map((target): Hotspoteintrag => ({ id: '', action: 'card', target })),
        ...(s.zoom ?? []).map((target): Hotspoteintrag => ({ id: '', action: 'scene', target })),
        ...Array.from({ length: s.infos ?? 0 }, (): Hotspoteintrag => ({ id: '', action: 'info' })),
      ].map((h, i) => ({ ...h, id: `ding-${i + 1}` }));
      return {
        id,
        world: s.welt ?? 'welt-a',
        title: { de: id },
        ...(s.eintrittskarte === undefined ? {} : { card: s.eintrittskarte }),
        hotspots,
      };
    }),
    cards: (b.karten ?? []).map((id) => ({
      id,
      title: { de: id },
      topic: 'gebiet-a',
      relations: beziehungen.filter(([von]) => von === id).map(([, type, card]) => ({ type, card })),
    })),
    topics: [{ id: 'gebiet-a', title: { de: 'Gebiet A' }, color: '#112233', icon: 'gebiet-a.svg' }],
    relations: Object.entries(b.typen ?? {}).map(([id, art]) =>
      art === 'symmetrisch'
        ? { id, symmetric: true, forward: { de: `${id} mit` } }
        : { id, symmetric: false, forward: { de: `${id} vor` }, backward: { de: `${id} zurück` } },
    ),
  };
}

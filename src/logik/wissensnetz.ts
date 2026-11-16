// Die zwei Schichten des Wissensnetzes (ADR 0003): Fundorte werden aus den Szenen berechnet,
// Beziehungen stehen nur an der Ausgangskarte, die Gegenrichtung wird hier berechnet.
// Listen stehen in der Reihenfolge des Verzeichnisses.

import type { Inhaltsverzeichnis, Texte } from './inhaltsverzeichnis.ts';

/** Die Szenen, in denen die Karte Eintrittskarte ist oder an einem Hotspot hängt, jede einmal. */
export function fundorte(verzeichnis: Inhaltsverzeichnis, karte: string): string[] {
  return verzeichnis.scenes
    .filter((s) => s.card === karte || s.hotspots.some((h) => h.action === 'card' && h.target === karte))
    .map((s) => s.id);
}

export interface Beziehungsgruppe {
  /** ID des Beziehungstyps. */
  typ: string;
  /** Bei symmetrischen Typen immer `vorwaerts`. */
  richtung: 'vorwaerts' | 'rueckwaerts';
  /** `forward` oder `backward` des Typs. */
  bezeichnung: Texte;
  /** Nachbarkarten, jede einmal. */
  karten: string[];
}

/**
 * Die Beziehungen der Karte in beide Richtungen, gruppiert nach Typ und Richtung (F16), in der
 * Reihenfolge der Beziehungstypen, je Typ vorwärts vor rückwärts. Beziehungen mit unbekanntem
 * Typ und Nachbarkarten, die es im Verzeichnis nicht gibt, fallen weg; leere Gruppen auch.
 */
export function beziehungenDerKarte(verzeichnis: Inhaltsverzeichnis, karte: string): Beziehungsgruppe[] {
  const gruppen: Beziehungsgruppe[] = [];
  for (const typ of verzeichnis.relations) {
    const vorwaerts = new Set<string>();
    const rueckwaerts = new Set<string>();
    for (const ausgang of verzeichnis.cards) {
      for (const beziehung of ausgang.relations) {
        if (beziehung.type !== typ.id) continue;
        if (ausgang.id === karte) vorwaerts.add(beziehung.card);
        if (beziehung.card === karte) (typ.symmetric ? vorwaerts : rueckwaerts).add(ausgang.id);
      }
    }
    const gruppe = (richtung: Beziehungsgruppe['richtung'], bezeichnung: Texte, ids: Set<string>) => {
      const karten = verzeichnis.cards.filter((k) => ids.has(k.id)).map((k) => k.id);
      if (karten.length > 0) gruppen.push({ typ: typ.id, richtung, bezeichnung, karten });
    };
    gruppe('vorwaerts', typ.forward, vorwaerts);
    // `backward` fehlt laut Schema nur bei symmetrischen Typen, dann bleibt `rueckwaerts` leer.
    gruppe('rueckwaerts', typ.backward ?? typ.forward, rueckwaerts);
  }
  return gruppen;
}

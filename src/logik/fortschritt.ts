// Fortschritt und Abschluss werden aus Verzeichnis und gefundenen Karten berechnet, nie
// gespeichert (E7). Gezählt werden nur Karten, die es im Verzeichnis gibt: Karten-IDs im
// Spielstand ohne Karte (F18) und Verweise auf fehlende Karten zählen nirgends mit.

import type { Inhaltsverzeichnis } from './inhaltsverzeichnis.ts';
import { tiefereSzenen } from './szenennetz.ts';

/** Gefundene und vorhandene Karten; den Anteil bildet die Oberfläche. */
export interface Stand {
  gefunden: number;
  vorhanden: number;
}

/** Eintrittskarte und Karten der Hotspots einer Szene, jede einmal, in der Reihenfolge des Verzeichnisses. */
export function kartenDerSzene(verzeichnis: Inhaltsverzeichnis, szene: string): string[] {
  return vorhandeneKarten(verzeichnis, verweiseDerSzene(verzeichnis, szene));
}

/** Stand der Szene samt allen tieferen Szenen, jede Karte einmal (F11). */
export function standDerSzene(
  verzeichnis: Inhaltsverzeichnis,
  szene: string,
  gefunden: ReadonlySet<string>,
): Stand {
  const verweise = [szene, ...tiefereSzenen(verzeichnis, szene)].flatMap((s) => verweiseDerSzene(verzeichnis, s));
  return zaehle(vorhandeneKarten(verzeichnis, verweise), gefunden);
}

/**
 * F12: Eintrittskarte und alle Karten der Hotspots sind gefunden, und alle per Zoom erreichbaren
 * Szenen sind abgeschlossen. Das heißt: Alle Karten der Szene samt tieferen Szenen sind gefunden.
 * Eine Szene, die es im Verzeichnis nicht gibt, ist nicht abgeschlossen.
 */
export function istAbgeschlossen(
  verzeichnis: Inhaltsverzeichnis,
  szene: string,
  gefunden: ReadonlySet<string>,
): boolean {
  if (!verzeichnis.scenes.some((s) => s.id === szene)) return false;
  const stand = standDerSzene(verzeichnis, szene, gefunden);
  return stand.gefunden === stand.vorhanden;
}

/** F13: die Karten, auf die die Szenen der Welt verweisen, jede einmal. */
export function fortschrittDerWelt(
  verzeichnis: Inhaltsverzeichnis,
  welt: string,
  gefunden: ReadonlySet<string>,
): Stand {
  const verweise = verzeichnis.scenes.filter((s) => s.world === welt).flatMap((s) => verweiseDerSzene(verzeichnis, s.id));
  return zaehle(vorhandeneKarten(verzeichnis, verweise), gefunden);
}

/** F13: alle Karten im Kartenvorrat. */
export function gesamtfortschritt(verzeichnis: Inhaltsverzeichnis, gefunden: ReadonlySet<string>): Stand {
  return zaehle(
    verzeichnis.cards.map((k) => k.id),
    gefunden,
  );
}

/** Karten-IDs, auf die die Szene verweist, ungeprüft und mit Wiederholungen. */
function verweiseDerSzene(verzeichnis: Inhaltsverzeichnis, szene: string): string[] {
  const eintrag = verzeichnis.scenes.find((s) => s.id === szene);
  if (eintrag === undefined) return [];
  const verweise = eintrag.hotspots.flatMap((h) => (h.action === 'card' && h.target !== undefined ? [h.target] : []));
  return eintrag.card === undefined ? verweise : [eintrag.card, ...verweise];
}

/** Die IDs aus `ids`, die im Verzeichnis als Karte stehen, jede einmal, in dessen Reihenfolge. */
function vorhandeneKarten(verzeichnis: Inhaltsverzeichnis, ids: readonly string[]): string[] {
  const gesucht = new Set(ids);
  return verzeichnis.cards.filter((k) => gesucht.has(k.id)).map((k) => k.id);
}

function zaehle(karten: readonly string[], gefunden: ReadonlySet<string>): Stand {
  return { gefunden: karten.filter((k) => gefunden.has(k)).length, vorhanden: karten.length };
}

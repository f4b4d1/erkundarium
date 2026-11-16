// Was der Hinweis eines Hotspots zeigt (F22) und welche Hotspots einen Haken tragen (F11).

import type { Aktion } from './inhaltsverzeichnis.ts';
import type { Einstellungen } from './spielstand.ts';
import type { Hotspot } from './szenendatei.ts';
import { text } from './textfassung.ts';

export interface Hinweisinhalt {
  /** Aus `label`, immer vorhanden. */
  name: string;
  /** Aus `hint`: bei `info` und `scene` immer, bei `card` erst, wenn die Karte gefunden ist. */
  erklaerung?: string;
  aktion: Aktion;
  /** Nur bei `card`: ob die Karte gefunden ist. */
  gefunden?: boolean;
}

export function hinweisinhalt(hotspot: Hotspot, gefunden: ReadonlySet<string>, fassung: string): Hinweisinhalt {
  const name = text(hotspot.label, fassung);
  const kartenstand =
    hotspot.action === 'card' ? { gefunden: hotspot.target !== undefined && gefunden.has(hotspot.target) } : undefined;
  const zeigtErklaerung = kartenstand === undefined || kartenstand.gefunden;
  return {
    name,
    ...(zeigtErklaerung && hotspot.hint !== undefined ? { erklaerung: text(hotspot.hint, fassung) } : {}),
    aktion: hotspot.action,
    ...kartenstand,
  };
}

/** Die IDs der Hotspots, deren Karte gefunden ist; keine, wenn die Haken ausgeblendet sind. */
export function abgehakteHotspots(
  hotspots: readonly Hotspot[],
  gefunden: ReadonlySet<string>,
  einstellungen: Einstellungen,
): ReadonlySet<string> {
  if (!einstellungen.showMarkers) return new Set();
  return new Set(
    hotspots
      .filter((h) => h.action === 'card' && h.target !== undefined && gefunden.has(h.target))
      .map((h) => h.id),
  );
}

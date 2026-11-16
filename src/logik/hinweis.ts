// Was der Hinweis eines Hotspots zeigt (F22) und welche Hotspots einen Haken tragen (F11).

import { standDerSzene, type Stand } from './fortschritt.ts';
import type { Aktion, Inhaltsverzeichnis } from './inhaltsverzeichnis.ts';
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
  /** Nur bei `scene` mit bekannter Zielszene: Stand der Zielszene samt tieferen Szenen (F11). */
  stand?: Stand;
}

export function hinweisinhalt(
  hotspot: Hotspot,
  gefunden: ReadonlySet<string>,
  fassung: string,
  verzeichnis: Inhaltsverzeichnis,
): Hinweisinhalt {
  const name = text(hotspot.label, fassung);
  const stand = standDerZielszene(hotspot, verzeichnis, gefunden);
  const kartenstand = hotspot.action === 'card' ? { gefunden: karteGefunden(hotspot, gefunden) } : undefined;
  const zeigtErklaerung = kartenstand === undefined || kartenstand.gefunden;
  return {
    name,
    ...(zeigtErklaerung && hotspot.hint !== undefined ? { erklaerung: text(hotspot.hint, fassung) } : {}),
    aktion: hotspot.action,
    ...kartenstand,
    ...(stand === undefined ? {} : { stand }),
  };
}

/** Der Stand der Zielszene eines Zoom-Hotspots; keiner, wenn die Szene im Verzeichnis fehlt. */
function standDerZielszene(
  hotspot: Hotspot,
  verzeichnis: Inhaltsverzeichnis,
  gefunden: ReadonlySet<string>,
): Stand | undefined {
  const ziel = hotspot.target;
  if (hotspot.action !== 'scene' || ziel === undefined || !verzeichnis.scenes.some((s) => s.id === ziel)) return undefined;
  return standDerSzene(verzeichnis, ziel, gefunden);
}

/** Die IDs der Hotspots, deren Karte gefunden ist; keine, wenn die Haken ausgeblendet sind. */
export function abgehakteHotspots(
  hotspots: readonly Hotspot[],
  gefunden: ReadonlySet<string>,
  einstellungen: Einstellungen,
): ReadonlySet<string> {
  if (!einstellungen.showMarkers) return new Set();
  return new Set(hotspots.filter((h) => karteGefunden(h, gefunden)).map((h) => h.id));
}

/** Gibt der Hotspot eine Karte, und ist sie gefunden? */
export function karteGefunden(hotspot: Hotspot, gefunden: ReadonlySet<string>): boolean {
  return hotspot.action === 'card' && hotspot.target !== undefined && gefunden.has(hotspot.target);
}

// Das Szenennetz ergibt sich allein aus den Zoom-Hotspots (E16). Es soll gerichtet und ohne
// Kreise sein; diese Funktionen laufen aber auch bei einem Kreis nicht endlos, damit das
// Prüfskript ihn melden kann und das Spiel mit fehlerhaften Inhalten nicht hängt.
// Zoom-Ziele, die es im Verzeichnis nicht gibt, gelten als nicht vorhanden.
// Listen von Szenen stehen in der Reihenfolge des Verzeichnisses.

import type { Inhaltsverzeichnis } from './inhaltsverzeichnis.ts';

/** Die vorhandenen Szenen, in die man von `szene` aus direkt zoomen kann. */
export function zoomZiele(verzeichnis: Inhaltsverzeichnis, szene: string): string[] {
  const ziele = new Set<string>();
  for (const hotspot of verzeichnis.scenes.find((s) => s.id === szene)?.hotspots ?? []) {
    if (hotspot.action === 'scene' && hotspot.target !== undefined) ziele.add(hotspot.target);
  }
  return inVerzeichnisreihenfolge(verzeichnis, ziele);
}

/** Alle Szenen, die von `szene` aus über einen oder mehrere Zooms erreichbar sind, ohne `szene` selbst. */
export function tiefereSzenen(verzeichnis: Inhaltsverzeichnis, szene: string): string[] {
  const erreicht = new Set<string>();
  const offen = [szene];
  for (let aktuell = offen.pop(); aktuell !== undefined; aktuell = offen.pop()) {
    for (const ziel of zoomZiele(verzeichnis, aktuell)) {
      if (!erreicht.has(ziel)) {
        erreicht.add(ziel);
        offen.push(ziel);
      }
    }
  }
  erreicht.delete(szene);
  return inVerzeichnisreihenfolge(verzeichnis, erreicht);
}

/**
 * Kreise im Szenennetz, je Kreis die beteiligten Szenen in Zoom-Richtung. Jeder Kreis, der das
 * Netz ungültig macht, führt zu mindestens einer Meldung; nicht jeder einzelne Umlauf durch
 * ineinander verschränkte Kreise wird gesondert genannt.
 */
export function findeKreise(verzeichnis: Inhaltsverzeichnis): string[][] {
  const kreise: string[][] = [];
  const zustand = new Map<string, 'auf-dem-weg' | 'fertig'>();
  const weg: string[] = [];

  function besuche(szene: string): void {
    zustand.set(szene, 'auf-dem-weg');
    weg.push(szene);
    for (const ziel of zoomZiele(verzeichnis, szene)) {
      const z = zustand.get(ziel);
      if (z === 'auf-dem-weg') kreise.push(weg.slice(weg.indexOf(ziel)));
      else if (z === undefined) besuche(ziel);
    }
    weg.pop();
    zustand.set(szene, 'fertig');
  }

  for (const szene of verzeichnis.scenes) {
    if (!zustand.has(szene.id)) besuche(szene.id);
  }
  return kreise;
}

/** Die Startszene der Welt und alle von ihr aus erreichbaren Szenen dieser Welt. */
export function erreichbareSzenen(verzeichnis: Inhaltsverzeichnis, welt: string): string[] {
  const start = verzeichnis.worlds.find((w) => w.id === welt)?.start;
  if (start === undefined || !verzeichnis.scenes.some((s) => s.id === start)) return [];
  const erreicht = new Set([start, ...tiefereSzenen(verzeichnis, start)]);
  return szenenDerWelt(verzeichnis, welt).filter((id) => erreicht.has(id));
}

/** Die Szenen der Welt, die von ihrer Startszene aus nicht erreichbar sind. */
export function unerreichbareSzenen(verzeichnis: Inhaltsverzeichnis, welt: string): string[] {
  const erreicht = new Set(erreichbareSzenen(verzeichnis, welt));
  return szenenDerWelt(verzeichnis, welt).filter((id) => !erreicht.has(id));
}

function szenenDerWelt(verzeichnis: Inhaltsverzeichnis, welt: string): string[] {
  return verzeichnis.scenes.filter((s) => s.world === welt).map((s) => s.id);
}

/** Die IDs aus `ids`, die im Verzeichnis als Szene stehen, in dessen Reihenfolge. */
function inVerzeichnisreihenfolge(verzeichnis: Inhaltsverzeichnis, ids: ReadonlySet<string>): string[] {
  return verzeichnis.scenes.filter((s) => ids.has(s.id)).map((s) => s.id);
}

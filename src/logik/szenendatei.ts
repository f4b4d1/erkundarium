// Die Szenendatei nach Spec Abschnitt 6, wie die Engine sie beim Betreten einer Szene lädt (F5).
// Das Prüfskript prüft sie gegen das Schema; das Spiel liest sie trotzdem vorsichtig, damit eine
// kaputte Datei nur die kaputten Hotspots kostet und nichts abstürzt. Felder, die nur das
// Prüfskript braucht (`type`), liest es nicht.

import type { Aktion, Hotspoteintrag, Texte } from './inhaltsverzeichnis.ts';

export interface Hotspot extends Hotspoteintrag {
  label: Texte;
  /** Erklärung im Hinweis, freiwillig außer bei `info`. */
  hint?: Texte;
}

export interface Szenendatei {
  id: string;
  title: Texte;
  /** Eintrittskarte, freiwillig. */
  card?: string;
  hotspots: Hotspot[];
}

const AKTIONEN: readonly string[] = ['card', 'scene', 'info'] satisfies Aktion[];

/**
 * Liest geparstes JSON als Szenendatei, `undefined`, wenn `id`, `title` oder die Liste der
 * Hotspots fehlt. Hotspots ohne ID, Namen, bekannte Aktion oder ohne Ziel bei `card` und `scene`
 * fallen weg; eine Erklärung, die kein Textobjekt ist, auch.
 */
export function liesSzenendatei(daten: unknown): Szenendatei | undefined {
  if (!istObjekt(daten) || typeof daten.id !== 'string' || !Array.isArray(daten.hotspots)) return undefined;
  const title = alsTexte(daten.title);
  if (title === undefined) return undefined;
  const hotspots = daten.hotspots.flatMap((h) => {
    const hotspot = alsHotspot(h);
    return hotspot === undefined ? [] : [hotspot];
  });
  return { id: daten.id, title, ...(typeof daten.card === 'string' ? { card: daten.card } : {}), hotspots };
}

function alsHotspot(daten: unknown): Hotspot | undefined {
  if (!istObjekt(daten) || typeof daten.id !== 'string') return undefined;
  const { action, target } = daten;
  if (typeof action !== 'string' || !AKTIONEN.includes(action)) return undefined;
  if (action !== 'info' && typeof target !== 'string') return undefined;
  const label = alsTexte(daten.label);
  if (label === undefined) return undefined;
  const hint = alsTexte(daten.hint);
  return {
    id: daten.id,
    action: action as Aktion,
    ...(action !== 'info' ? { target: target as string } : {}),
    label,
    ...(hint === undefined ? {} : { hint }),
  };
}

/** Nur Einträge mit Text; `undefined`, wenn kein Objekt oder kein Eintrag übrig bleibt. */
function alsTexte(daten: unknown): Texte | undefined {
  if (!istObjekt(daten)) return undefined;
  // Object.fromEntries legt auch `__proto__` als gewöhnlichen Eintrag an.
  const eintraege = Object.entries(daten).filter((e): e is [string, string] => typeof e[1] === 'string');
  return eintraege.length === 0 ? undefined : Object.fromEntries(eintraege);
}

function istObjekt(wert: unknown): wert is Record<string, unknown> {
  return typeof wert === 'object' && wert !== null && !Array.isArray(wert);
}

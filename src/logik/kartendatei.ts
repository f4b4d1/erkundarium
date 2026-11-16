// Die Kartendatei nach Spec Abschnitt 6, wie die Engine sie beim Öffnen einer Karte lädt.
// Das Prüfskript prüft sie gegen das Schema; das Spiel liest sie trotzdem vorsichtig, damit eine
// kaputte Datei nur die kaputten Teile kostet und nichts abstürzt. Felder, die die Kartenansicht
// nicht braucht (`relations`), liest es nicht.

export type Pruefstatus = 'entwurf' | 'geprueft';

export type Baustein =
  | { type: 'text' | 'funfact'; text: string }
  | { type: 'list' | 'facts'; items: string[] }
  /** Die erste Zeile ist die Kopfzeile. */
  | { type: 'table'; rows: string[][] };

export interface Kartentext {
  status: Pruefstatus;
  title: string;
  front: Baustein[];
  back: Baustein[];
  linkLabel?: string;
}

export interface Kartendatei {
  id: string;
  topic: string;
  /** Dateiname einer SVG im Kartenordner, ohne Pfad. */
  image?: string;
  sources: string[];
  /** Beginnt immer mit `http://` oder `https://`. */
  link?: string;
  /** Textfassungen, Schlüssel ist die Fassungs-ID. */
  texts: Record<string, Kartentext>;
}

const LINK = /^https?:\/\/\S+$/;
const SVG_DATEI = /^[a-z0-9]+(-[a-z0-9]+)*\.svg$/;

/**
 * Liest geparstes JSON als Kartendatei, `undefined`, wenn `id`, `topic` oder jede lesbare
 * Textfassung fehlt. Eine Textfassung ohne Titel fällt weg; jeder andere Prüfstatus als
 * `geprueft` gilt als `entwurf`. Kaputte Bausteine, leere Einträge, Quellen ohne Text, ein Link
 * ohne `http://` oder `https://` und ein Kartenbild außerhalb des Kartenordners fallen einzeln weg.
 */
export function liesKartendatei(daten: unknown): Kartendatei | undefined {
  if (!istObjekt(daten) || typeof daten.id !== 'string' || typeof daten.topic !== 'string') return undefined;
  if (!istObjekt(daten.texts)) return undefined;
  // Object.fromEntries legt auch `__proto__` als gewöhnlichen Eintrag an.
  const texts = Object.fromEntries(
    Object.entries(daten.texts).flatMap(([fassung, wert]) => {
      const kartentext = alsKartentext(wert);
      return kartentext === undefined ? [] : [[fassung, kartentext] as const];
    }),
  );
  if (Object.keys(texts).length === 0) return undefined;
  const { image, link } = daten;
  return {
    id: daten.id,
    topic: daten.topic,
    ...(typeof image === 'string' && SVG_DATEI.test(image) ? { image } : {}),
    sources: texte(daten.sources),
    ...(typeof link === 'string' && LINK.test(link) ? { link } : {}),
    texts,
  };
}

function alsKartentext(daten: unknown): Kartentext | undefined {
  if (!istObjekt(daten) || !istText(daten.title)) return undefined;
  return {
    status: daten.status === 'geprueft' ? 'geprueft' : 'entwurf',
    title: daten.title,
    front: bausteine(daten.front),
    back: bausteine(daten.back),
    ...(istText(daten.linkLabel) ? { linkLabel: daten.linkLabel } : {}),
  };
}

function bausteine(daten: unknown): Baustein[] {
  if (!Array.isArray(daten)) return [];
  return daten.flatMap((d) => {
    const baustein = alsBaustein(d);
    return baustein === undefined ? [] : [baustein];
  });
}

function alsBaustein(daten: unknown): Baustein | undefined {
  if (!istObjekt(daten)) return undefined;
  switch (daten.type) {
    case 'text':
    case 'funfact':
      return istText(daten.text) ? { type: daten.type, text: daten.text } : undefined;
    case 'list':
    case 'facts': {
      const items = texte(daten.items);
      return items.length > 0 ? { type: daten.type, items } : undefined;
    }
    case 'table': {
      if (!Array.isArray(daten.rows)) return undefined;
      const rows = daten.rows
        .filter((zeile): zeile is unknown[] => Array.isArray(zeile) && zeile.length > 0)
        .map((zeile) => zeile.map((zelle) => (typeof zelle === 'string' ? zelle : '')));
      return rows.length > 0 ? { type: 'table', rows } : undefined;
    }
    default:
      return undefined;
  }
}

/** Nur die Einträge mit Text; leer, wenn die Daten keine Liste sind. */
function texte(daten: unknown): string[] {
  return Array.isArray(daten) ? daten.filter(istText) : [];
}

function istText(wert: unknown): wert is string {
  return typeof wert === 'string' && wert !== '';
}

function istObjekt(wert: unknown): wert is Record<string, unknown> {
  return typeof wert === 'object' && wert !== null && !Array.isArray(wert);
}

// Die Prüfregeln auf den eingelesenen Inhalten. Kein Dateisystem: Das Einlesen steht in inhaltsordner.ts.
// Die Regeln kennen nur allgemeine Begriffe, keinen Fachbegriff aus den Inhalten (Q2).
import type {
  Aktion,
  Beziehung,
  Beziehungstyp,
  Inhaltsverzeichnis,
  Szeneneintrag,
  Themengebiet,
  Texte,
} from '../src/logik/inhaltsverzeichnis.ts';
import type { Schemapruefung, SchemaName } from './schema.ts';

export type Stufe = 'entwickeln' | 'veroeffentlichen';

export interface Meldung {
  /** Pfad relativ zum Inhaltsordner, mit `/`. */
  datei: string;
  regel: string;
  text: string;
}

export interface Pruefbericht {
  fehler: Meldung[];
  warnungen: Meldung[];
  verzeichnis: Inhaltsverzeichnis;
}

// Daten nach bestandener Schema-Prüfung, so weit die Regeln sie lesen.
interface Karte {
  id: string;
  topic: string;
  relations?: Beziehung[];
  texts: Record<string, { status: 'entwurf' | 'geprueft' }>;
}

interface Welt {
  id: string;
  title: Texte;
  start: string;
}

interface Szene {
  id: string;
  title: Texte;
  card?: string;
  hotspots: { id: string; action: Aktion; target?: string }[];
}

// acyclic liest nur das Prüfskript, ins Inhaltsverzeichnis kommt es nicht.
type RohBeziehungstyp = Omit<Beziehungstyp, 'symmetric'> & { symmetric?: boolean; acyclic?: boolean };

interface Geladen<T> {
  pfad: string;
  daten: T;
}

const KARTE = /^cards\/([^/]+)\.json$/;
const WELTORDNER = /^worlds\/([^/]+)\//;
const SZENE = /^worlds\/([^/]+)\/scenes\/([^/]+)\.json$/;
const SZENEN_SVG = /^worlds\/([^/]+)\/scenes\/([^/]+)\.svg$/;

// Spec Abschnitt 6, Ordner. schema/ prüft das Prüfskript nicht.
const ERWARTET: RegExp[] = [
  /^(topics|relations|limits)\.json$/,
  /^schema\//,
  /^topics\/[^/]+\.svg$/,
  /^cards\/[^/]+\.(json|svg)$/,
  /^worlds\/[^/]+\/world\.json$/,
  SZENE,
  SZENEN_SVG,
];

// design-guidelines.md Abschnitt 1 Regel 2, dazu aria-label, Ereignis-Attribute und das Attribut style
// (F20, F23). Einfache Textsuche, kein XML-Parser; Kommentare sind vorher entfernt.
// Elemente auch mit Namensraum-Präfix, etwa <svg:script>.
const VERBOTEN_IN_SVG: [string, RegExp][] = [
  ['<script>', /<([\w.-]+:)?script[\s>/]/i],
  ['<style>', /<([\w.-]+:)?style[\s>/]/i],
  ['<text>', /<([\w.-]+:)?text[\s>/]/i],
  ['<title>', /<([\w.-]+:)?title[\s>/]/i],
  ['<image>', /<([\w.-]+:)?image[\s>/]/i],
  ['Filter', /<([\w.-]+:)?filter[\s>/]|\sfilter\s*=/i],
  ['Verlauf', /<([\w.-]+:)?(linear|radial)Gradient[\s>/]/i],
  ['Verweis nach außen', /href\s*=\s*["'](?!#)|url\(\s*['"]?(?!#)/i],
  ['aria-label', /aria-label/i],
  ['Ereignis-Attribut', /\son[a-z]+\s*=/i],
  [
    'Attribut style. Farben und Striche gehören als eigene Attribute an das Element, etwa fill und stroke',
    /\sstyle\s*=/i,
  ],
];

const KOMMENTAR = /<!--[\s\S]*?-->/g;

/**
 * Prüft die Inhalte und erzeugt das Inhaltsverzeichnis.
 * @param dateien Inhalt jeder Datei als Text, Schlüssel ist der Pfad relativ zum Inhaltsordner mit `/`.
 * @param pruefeSchema Prüfung gegen die Schemas, siehe `ladeSchemas` in schema.ts.
 */
export function pruefeInhalte(
  dateien: Readonly<Record<string, string>>,
  stufe: Stufe,
  pruefeSchema: Schemapruefung,
): Pruefbericht {
  const fehler: Meldung[] = [];
  const warnungen: Meldung[] = [];
  const meldeFehler = (datei: string, regel: string, text: string) => fehler.push({ datei, regel, text });
  const meldeWarnung = (datei: string, regel: string, text: string) => warnungen.push({ datei, regel, text });

  // Alle lesbaren JSON-Dateien, auch die, die am Schema scheitern: Sie machen ihre IDs trotzdem bekannt,
  // damit ein Schema-Fehler keine Folgefehler in anderen Dateien nach sich zieht.
  const gelesen: { pfad: string; schema: SchemaName; daten: unknown }[] = [];

  function lade<T>(pfad: string, schema: SchemaName): Geladen<T> | undefined {
    const text = dateien[pfad];
    if (text === undefined) {
      meldeFehler(pfad, 'datei-fehlt', 'Die Datei fehlt.');
      return undefined;
    }
    let daten: unknown;
    try {
      daten = JSON.parse(text);
    } catch (e) {
      meldeFehler(pfad, 'json', `Die Datei ist kein gültiges JSON: ${(e as Error).message}`);
      return undefined;
    }
    gelesen.push({ pfad, schema, daten });
    const ergebnis = pruefeSchema(schema, daten);
    for (const f of ergebnis.fehler) meldeFehler(pfad, 'schema', `Entspricht nicht dem Schema: ${f}`);
    return ergebnis.gueltig ? { pfad, daten: daten as T } : undefined;
  }

  function bekannteIds(schema: SchemaName, nurPfad?: (pfad: string) => boolean): Set<string> {
    const ids = gelesen
      .filter((g) => g.schema === schema && (nurPfad?.(g.pfad) ?? true))
      .flatMap((g) => (Array.isArray(g.daten) ? g.daten : [g.daten]))
      .map((d) => (d !== null && typeof d === 'object' ? (d as { id?: unknown }).id : undefined))
      .filter((id): id is string => typeof id === 'string');
    return new Set(ids);
  }

  const pfade = Object.keys(dateien).sort();

  for (const pfad of pfade) {
    if (!ERWARTET.some((muster) => muster.test(pfad))) {
      meldeFehler(pfad, 'unerwartete-datei', 'Die Datei liegt an einer Stelle, an der keine Inhaltsdatei erwartet wird.');
    }
  }

  const themengebiete = lade<Themengebiet[]>('topics.json', 'topics')?.daten ?? [];
  const beziehungstypen = lade<RohBeziehungstyp[]>('relations.json', 'relations')?.daten ?? [];
  lade('limits.json', 'limits');

  const karten = pfade
    .filter((p) => KARTE.test(p))
    .flatMap((p) => lade<Karte>(p, 'card') ?? []);

  const weltordner = [...new Set(pfade.flatMap((p) => WELTORDNER.exec(p)?.[1] ?? []))];
  const welten = weltordner.flatMap((ordner) => lade<Welt>(`worlds/${ordner}/world.json`, 'world') ?? []);

  const szenen = pfade.flatMap((p) => {
    const treffer = SZENE.exec(p);
    if (!treffer) return [];
    const szene = lade<Szene>(p, 'scene');
    return szene ? [{ ...szene, welt: treffer[1] }] : [];
  });

  // Dateiname gleich ID
  for (const { pfad, daten } of karten) {
    if (KARTE.exec(pfad)?.[1] !== daten.id) {
      meldeFehler(pfad, 'dateiname', `Die Datei muss wie die Karte heißen: ${daten.id}.json.`);
    }
  }
  for (const { pfad, daten } of szenen) {
    if (SZENE.exec(pfad)?.[2] !== daten.id) {
      meldeFehler(pfad, 'dateiname', `Die Datei muss wie die Szene heißen: ${daten.id}.json.`);
    }
  }
  for (const { pfad, daten } of welten) {
    if (WELTORDNER.exec(pfad)?.[1] !== daten.id) {
      meldeFehler(pfad, 'dateiname', `Der Ordner der Welt muss wie die Welt heißen: worlds/${daten.id}/.`);
    }
  }

  // Doppelte IDs
  function meldeDoppelte(eintraege: { id: string; pfad: string }[], art: string) {
    const gesehen = new Set<string>();
    for (const { id, pfad } of eintraege) {
      if (gesehen.has(id)) meldeFehler(pfad, 'doppelte-id', `${art} „${id}“ gibt es mehr als einmal.`);
      gesehen.add(id);
    }
  }
  meldeDoppelte(karten.map(({ pfad, daten }) => ({ pfad, id: daten.id })), 'Die Karten-ID');
  meldeDoppelte(szenen.map(({ pfad, daten }) => ({ pfad, id: daten.id })), 'Die Szenen-ID');
  meldeDoppelte(themengebiete.map(({ id }) => ({ pfad: 'topics.json', id })), 'Das Themengebiet');
  meldeDoppelte(beziehungstypen.map(({ id }) => ({ pfad: 'relations.json', id })), 'Der Beziehungstyp');
  for (const { pfad, daten } of szenen) {
    meldeDoppelte(daten.hotspots.map(({ id }) => ({ pfad, id })), 'Der Hotspot');
  }

  // Verweise. Karten und Szenen haben getrennte ID-Räume.
  const kartenIds = bekannteIds('card');
  const szenenIds = bekannteIds('scene');
  const themengebietIds = bekannteIds('topics');
  const beziehungstypIds = bekannteIds('relations');

  for (const { pfad, daten } of welten) {
    const ordner = WELTORDNER.exec(pfad)?.[1];
    if (!bekannteIds('scene', (p) => SZENE.exec(p)?.[1] === ordner).has(daten.start)) {
      meldeFehler(pfad, 'startszene', `Die Startszene „${daten.start}“ gibt es in dieser Welt nicht.`);
    }
  }
  for (const { pfad, daten } of szenen) {
    if (daten.card !== undefined && !kartenIds.has(daten.card)) {
      meldeFehler(pfad, 'eintrittskarte', `Die Eintrittskarte „${daten.card}“ gibt es nicht.`);
    }
    for (const h of daten.hotspots) {
      if (h.action === 'card' && !kartenIds.has(h.target!)) {
        meldeFehler(pfad, 'hotspot-ziel', `Der Hotspot „${h.id}“ zeigt auf die Karte „${h.target}“, die es nicht gibt.`);
      }
      if (h.action === 'scene' && !szenenIds.has(h.target!)) {
        meldeFehler(pfad, 'hotspot-ziel', `Der Hotspot „${h.id}“ zeigt auf die Szene „${h.target}“, die es nicht gibt.`);
      }
    }
  }
  for (const { pfad, daten } of karten) {
    if (!themengebietIds.has(daten.topic)) {
      meldeFehler(pfad, 'themengebiet', `Das Themengebiet „${daten.topic}“ gibt es nicht.`);
    }
    for (const b of daten.relations ?? []) {
      if (!beziehungstypIds.has(b.type)) {
        meldeFehler(pfad, 'beziehungstyp', `Die Beziehung zu „${b.card}“ hat den unbekannten Typ „${b.type}“.`);
      }
      if (!kartenIds.has(b.card)) {
        meldeFehler(pfad, 'beziehungsziel', `Die Beziehung „${b.type}“ zeigt auf die Karte „${b.card}“, die es nicht gibt.`);
      }
    }
  }

  // Prüfstatus: beim Entwickeln eine Warnung, beim Veröffentlichen ein Fehler (F34)
  for (const { pfad, daten } of karten) {
    for (const [fassung, { status }] of Object.entries(daten.texts)) {
      if (status !== 'entwurf') continue;
      const melde = stufe === 'veroeffentlichen' ? meldeFehler : meldeWarnung;
      melde(pfad, 'pruefstatus', `Die Textfassung „${fassung}“ ist ein Entwurf.`);
    }
  }

  // Szenendatei und SVG
  for (const { pfad, daten } of szenen) {
    const svgPfad = pfad.replace(/\.json$/, '.svg');
    const svg = dateien[svgPfad]?.replace(KOMMENTAR, '');
    if (svg === undefined) {
      meldeFehler(svgPfad, 'svg-fehlt', `Die SVG zur Szene „${daten.id}“ fehlt.`);
      continue;
    }
    const ausSvg = [...svg.matchAll(/data-hotspot\s*=\s*["']([^"']*)["']/g)].map((t) => t[1]);
    const ausJson = new Set(daten.hotspots.map((h) => h.id));
    meldeDoppelte(ausSvg.map((id) => ({ pfad: svgPfad, id })), 'Das data-hotspot');
    for (const id of ausJson) {
      if (!ausSvg.includes(id)) {
        meldeFehler(svgPfad, 'hotspot-ohne-svg', `Der Hotspot „${id}“ der Szenendatei hat kein Element mit data-hotspot="${id}".`);
      }
    }
    for (const id of new Set(ausSvg)) {
      if (!ausJson.has(id)) {
        meldeFehler(svgPfad, 'svg-ohne-hotspot', `Das Element mit data-hotspot="${id}" hat keinen Hotspot in der Szenendatei.`);
      }
    }
    for (const [name, muster] of VERBOTEN_IN_SVG) {
      if (muster.test(svg)) meldeFehler(svgPfad, 'svg-verboten', `Die SVG enthält Verbotenes: ${name}.`);
    }
  }

  for (const pfad of pfade) {
    const treffer = SZENEN_SVG.exec(pfad);
    if (treffer && dateien[pfad.replace(/\.svg$/, '.json')] === undefined) {
      meldeFehler(pfad, 'szene-fehlt', `Zur SVG fehlt die Szenendatei ${treffer[2]}.json.`);
    }
  }

  const verzeichnis: Inhaltsverzeichnis = {
    worlds: welten.map(({ daten: w }) => ({ id: w.id, title: w.title, start: w.start })),
    scenes: szenen.map(({ daten: s, welt }): Szeneneintrag => ({
      id: s.id,
      world: welt,
      title: s.title,
      ...(s.card === undefined ? {} : { card: s.card }),
      hotspots: s.hotspots.map((h) => ({
        id: h.id,
        action: h.action,
        ...(h.target === undefined ? {} : { target: h.target }),
      })),
    })),
    cards: karten.map(({ daten: k }) => ({ id: k.id, topic: k.topic, relations: k.relations ?? [] })),
    topics: themengebiete,
    relations: beziehungstypen.map(({ acyclic: _, ...t }) => ({ ...t, symmetric: t.symmetric ?? false })),
  };

  const nachDatei = (a: Meldung, b: Meldung) => (a.datei < b.datei ? -1 : a.datei > b.datei ? 1 : 0);
  return { fehler: fehler.sort(nachDatei), warnungen: warnungen.sort(nachDatei), verzeichnis };
}

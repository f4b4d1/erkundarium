// Die Prüfregeln auf den eingelesenen Inhalten. Kein Dateisystem: Das Einlesen steht in inhaltsordner.ts.
// Die Regeln kennen nur allgemeine Begriffe, keinen Fachbegriff aus den Inhalten (Q2).
import type {
  Beziehungstyp,
  Inhaltsverzeichnis,
  Szeneneintrag,
  Themengebiet,
  Texte,
} from '../src/logik/inhaltsverzeichnis.ts';
import { pruefe as pruefeSchema, type SchemaName } from './schema.ts';

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
  relations?: { type: string; card: string }[];
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
  hotspots: { id: string; action: 'card' | 'scene' | 'info'; target?: string }[];
}

type RohBeziehungstyp = Omit<Beziehungstyp, 'symmetric' | 'acyclic'> & { symmetric?: boolean; acyclic?: boolean };

interface Geladen<T> {
  pfad: string;
  daten: T;
}

const KARTE = /^cards\/([^/]+)\.json$/;
const WELTORDNER = /^worlds\/([^/]+)\//;
const SZENE = /^worlds\/([^/]+)\/scenes\/([^/]+)\.json$/;

// design-guidelines.md Abschnitt 1 Regel 2, dazu aria-label und Ereignis-Attribute (F20, F23).
// Einfache Textsuche, kein XML-Parser.
const VERBOTEN_IN_SVG: [string, RegExp][] = [
  ['<script>', /<script[\s>/]/i],
  ['<style>', /<style[\s>/]/i],
  ['<text>', /<text[\s>/]/i],
  ['<title>', /<title[\s>/]/i],
  ['<image>', /<image[\s>/]/i],
  ['Filter', /<filter[\s>/]|\sfilter\s*=/i],
  ['Verlauf', /<(linear|radial)Gradient[\s>/]/i],
  ['Verweis nach außen', /href\s*=\s*["'](?!#)|url\(\s*['"]?(?!#)/i],
  ['aria-label', /aria-label/i],
  ['Ereignis-Attribut', /\son[a-z]+\s*=/i],
];

/**
 * Prüft die Inhalte und erzeugt das Inhaltsverzeichnis.
 * @param dateien Inhalt jeder Datei als Text, Schlüssel ist der Pfad relativ zum Inhaltsordner mit `/`.
 */
export function pruefeInhalte(dateien: Readonly<Record<string, string>>, stufe: Stufe): Pruefbericht {
  const fehler: Meldung[] = [];
  const warnungen: Meldung[] = [];
  const melde = (datei: string, regel: string, text: string) => fehler.push({ datei, regel, text });

  // Alle lesbaren JSON-Dateien, auch die, die am Schema scheitern: Sie machen ihre IDs trotzdem bekannt,
  // damit ein Schema-Fehler keine Folgefehler in anderen Dateien nach sich zieht.
  const gelesen: { pfad: string; schema: SchemaName; daten: unknown }[] = [];

  function lade<T>(pfad: string, schema: SchemaName): Geladen<T> | undefined {
    const text = dateien[pfad];
    if (text === undefined) {
      melde(pfad, 'datei-fehlt', 'Die Datei fehlt.');
      return undefined;
    }
    let daten: unknown;
    try {
      daten = JSON.parse(text);
    } catch (e) {
      melde(pfad, 'json', `Die Datei ist kein gültiges JSON: ${(e as Error).message}`);
      return undefined;
    }
    gelesen.push({ pfad, schema, daten });
    const ergebnis = pruefeSchema(schema, daten);
    for (const f of ergebnis.fehler) melde(pfad, 'schema', `Entspricht nicht dem Schema: ${f}`);
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
      melde(pfad, 'dateiname', `Die Datei muss wie die Karte heißen: ${daten.id}.json.`);
    }
  }
  for (const { pfad, daten } of szenen) {
    if (SZENE.exec(pfad)?.[2] !== daten.id) {
      melde(pfad, 'dateiname', `Die Datei muss wie die Szene heißen: ${daten.id}.json.`);
    }
  }
  for (const { pfad, daten } of welten) {
    if (WELTORDNER.exec(pfad)?.[1] !== daten.id) {
      melde(pfad, 'dateiname', `Der Ordner der Welt muss wie die Welt heißen: worlds/${daten.id}/.`);
    }
  }

  // Doppelte IDs
  function meldeDoppelte(eintraege: { id: string; pfad: string }[], art: string) {
    const gesehen = new Set<string>();
    for (const { id, pfad } of eintraege) {
      if (gesehen.has(id)) melde(pfad, 'doppelte-id', `${art} „${id}“ gibt es mehr als einmal.`);
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
      melde(pfad, 'startszene', `Die Startszene „${daten.start}“ gibt es in dieser Welt nicht.`);
    }
  }
  for (const { pfad, daten } of szenen) {
    if (daten.card !== undefined && !kartenIds.has(daten.card)) {
      melde(pfad, 'eintrittskarte', `Die Eintrittskarte „${daten.card}“ gibt es nicht.`);
    }
    for (const h of daten.hotspots) {
      if (h.action === 'card' && !kartenIds.has(h.target!)) {
        melde(pfad, 'hotspot-ziel', `Der Hotspot „${h.id}“ zeigt auf die Karte „${h.target}“, die es nicht gibt.`);
      }
      if (h.action === 'scene' && !szenenIds.has(h.target!)) {
        melde(pfad, 'hotspot-ziel', `Der Hotspot „${h.id}“ zeigt auf die Szene „${h.target}“, die es nicht gibt.`);
      }
    }
  }
  for (const { pfad, daten } of karten) {
    if (!themengebietIds.has(daten.topic)) {
      melde(pfad, 'themengebiet', `Das Themengebiet „${daten.topic}“ gibt es nicht.`);
    }
    for (const b of daten.relations ?? []) {
      if (!beziehungstypIds.has(b.type)) {
        melde(pfad, 'beziehungstyp', `Die Beziehung zu „${b.card}“ hat den unbekannten Typ „${b.type}“.`);
      }
      if (!kartenIds.has(b.card)) {
        melde(pfad, 'beziehungsziel', `Die Beziehung „${b.type}“ zeigt auf die Karte „${b.card}“, die es nicht gibt.`);
      }
    }
  }

  // Prüfstatus: beim Entwickeln eine Warnung, beim Veröffentlichen ein Fehler (F34)
  for (const { pfad, daten } of karten) {
    for (const [fassung, { status }] of Object.entries(daten.texts)) {
      if (status !== 'entwurf') continue;
      const meldung = { datei: pfad, regel: 'pruefstatus', text: `Die Textfassung „${fassung}“ ist ein Entwurf.` };
      (stufe === 'veroeffentlichen' ? fehler : warnungen).push(meldung);
    }
  }

  // Szenendatei und SVG
  for (const { pfad, daten } of szenen) {
    const svgPfad = pfad.replace(/\.json$/, '.svg');
    const svg = dateien[svgPfad];
    if (svg === undefined) {
      melde(svgPfad, 'svg-fehlt', `Die SVG zur Szene „${daten.id}“ fehlt.`);
      continue;
    }
    const ausSvg = [...svg.matchAll(/data-hotspot\s*=\s*["']([^"']*)["']/g)].map((t) => t[1]);
    const ausJson = new Set(daten.hotspots.map((h) => h.id));
    meldeDoppelte(ausSvg.map((id) => ({ pfad: svgPfad, id })), 'Das data-hotspot');
    for (const id of ausJson) {
      if (!ausSvg.includes(id)) {
        melde(svgPfad, 'hotspot-ohne-svg', `Der Hotspot „${id}“ der Szenendatei hat kein Element mit data-hotspot="${id}".`);
      }
    }
    for (const id of new Set(ausSvg)) {
      if (!ausJson.has(id)) {
        melde(svgPfad, 'svg-ohne-hotspot', `Das Element mit data-hotspot="${id}" hat keinen Hotspot in der Szenendatei.`);
      }
    }
    for (const [name, muster] of VERBOTEN_IN_SVG) {
      if (muster.test(svg)) melde(svgPfad, 'svg-verboten', `Die SVG enthält Verbotenes: ${name}.`);
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
    relations: beziehungstypen.map((t) => ({ ...t, symmetric: t.symmetric ?? false, acyclic: t.acyclic ?? false })),
  };

  const nachDatei = (a: Meldung, b: Meldung) => (a.datei < b.datei ? -1 : a.datei > b.datei ? 1 : 0);
  return { fehler: fehler.sort(nachDatei), warnungen: warnungen.sort(nachDatei), verzeichnis };
}

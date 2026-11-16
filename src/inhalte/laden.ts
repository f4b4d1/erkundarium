// Lädt Inhaltsverzeichnis und Szenen per fetch aus dem eigenen Ordner content/, immer über
// relative Pfade (Q5), damit die gebaute Seite in einem Unterverzeichnis läuft. Pfade entstehen nur
// aus IDs nach dem Muster des Schemas, damit keine ID aus dem Ordner herausführt.

import type { Inhaltsverzeichnis, Szeneneintrag } from '../logik/inhaltsverzeichnis.ts';
import { liesSzenendatei, type Szenendatei } from '../logik/szenendatei.ts';

const INHALTSORDNER = 'content/';
const ID_MUSTER = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Eine Inhaltsdatei fehlt, ist nicht erreichbar oder hat nicht die erwartete Form. */
export class Ladefehler extends Error {
  readonly pfad: string;
  constructor(pfad: string, grund: string) {
    super(`${pfad}: ${grund}`);
    this.name = 'Ladefehler';
    this.pfad = pfad;
  }
}

export interface GeladeneSzene {
  datei: Szenendatei;
  svg: string;
}

export async function ladeInhaltsverzeichnis(): Promise<Inhaltsverzeichnis> {
  const pfad = `${INHALTSORDNER}inhaltsverzeichnis.json`;
  const daten = JSON.parse(await ladeText(pfad, 'application/json')) as unknown;
  if (!istVerzeichnis(daten)) throw new Ladefehler(pfad, 'kein Inhaltsverzeichnis');
  return daten;
}

/** Lädt Szenendatei und SVG einer Szene (F5). */
export async function ladeSzene(eintrag: Szeneneintrag): Promise<GeladeneSzene> {
  const ordner = `${INHALTSORDNER}worlds/${pruefeId(eintrag.world)}/scenes/${pruefeId(eintrag.id)}`;
  const [json, svg] = await Promise.all([ladeText(`${ordner}.json`, 'application/json'), ladeText(`${ordner}.svg`, 'image/svg+xml')]);
  const datei = liesSzenendatei(JSON.parse(json));
  if (datei === undefined || datei.id !== eintrag.id) throw new Ladefehler(`${ordner}.json`, 'keine gültige Szenendatei');
  return { datei, svg };
}

async function ladeText(pfad: string, art: string): Promise<string> {
  let antwort: Response;
  try {
    antwort = await fetch(pfad, { headers: { Accept: art } });
  } catch {
    throw new Ladefehler(pfad, 'nicht erreichbar');
  }
  if (!antwort.ok) throw new Ladefehler(pfad, `HTTP ${antwort.status}`);
  return antwort.text();
}

function pruefeId(id: string): string {
  if (!ID_MUSTER.test(id)) throw new Ladefehler(INHALTSORDNER, `ungültige ID „${id}“`);
  return id;
}

function istVerzeichnis(daten: unknown): daten is Inhaltsverzeichnis {
  if (typeof daten !== 'object' || daten === null) return false;
  const v = daten as Record<string, unknown>;
  return ['worlds', 'scenes', 'cards', 'topics', 'relations'].every((feld) => Array.isArray(v[feld]));
}

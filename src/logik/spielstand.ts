// Der Spielstand nach Spec Abschnitt 6: nur gefundene Karten mit Zeitpunkt und Einstellungen
// je Profil (E7). Alle Funktionen sind rein und geben einen neuen Spielstand zurück; den
// Zeitpunkt eines Funds bringt der Aufrufer mit.

export interface Einstellungen {
  readonly showMarkers: boolean;
}

export interface Profil {
  /** Karten-ID -> Zeitpunkt des ersten Funds. Unbekannte Karten-IDs bleiben erhalten (F18). */
  readonly cards: Readonly<Record<string, string>>;
  readonly settings: Einstellungen;
}

export interface Spielstand {
  readonly schema: number;
  /** ID des aktiven Profils; es steht immer in `profiles`. */
  readonly active: string;
  readonly profiles: Readonly<Record<string, Profil>>;
}

/**
 * Migrationskette: Der Eintrag an Stelle i hebt Daten von Version i + 1 auf Version i + 2.
 * Bisher gibt es nur Version 1, die Kette ist leer.
 */
const MIGRATIONEN: ReadonlyArray<(daten: Record<string, unknown>) => Record<string, unknown>> = [];

export const SCHEMA_VERSION = MIGRATIONEN.length + 1;

const STANDARDPROFIL = 'standard';
const STANDARDEINSTELLUNGEN: Einstellungen = { showMarkers: true };

export function neuerSpielstand(): Spielstand {
  return { schema: SCHEMA_VERSION, active: STANDARDPROFIL, profiles: { [STANDARDPROFIL]: leeresProfil() } };
}

/** Markiert die Karte im aktiven Profil als gefunden. Eine schon gefundene Karte behält ihren ersten Zeitpunkt. */
export function markiereGefunden(stand: Spielstand, karte: string, zeitpunkt: string): Spielstand {
  return mitAktivemProfil(stand, (profil) =>
    Object.hasOwn(profil.cards, karte) ? profil : { ...profil, cards: { ...profil.cards, [karte]: zeitpunkt } },
  );
}

export function aendereEinstellung<N extends keyof Einstellungen>(
  stand: Spielstand,
  name: N,
  wert: Einstellungen[N],
): Spielstand {
  return mitAktivemProfil(stand, (profil) => ({ ...profil, settings: { ...profil.settings, [name]: wert } }));
}

/** Die gefundenen Karten des aktiven Profils, auch die, die es im Verzeichnis nicht gibt. */
export function gefundeneKarten(stand: Spielstand): ReadonlySet<string> {
  return new Set(Object.keys(stand.profiles[stand.active]!.cards));
}

/** F19: leert die gefundenen Karten des aktiven Profils und setzt seine Einstellungen zurück. */
export function zuruecksetzen(stand: Spielstand): Spielstand {
  return mitAktivemProfil(stand, leeresProfil);
}

/**
 * - `gelesen`: Die Daten waren ein gültiger Spielstand, gegebenenfalls von einer älteren Version gehoben.
 * - `neu`: Es lag nichts vor oder die Daten waren kaputt; `stand` ist ein neuer leerer Spielstand.
 * - `neuere-version`: Die Daten stammen von einer neueren Version der Engine und sind hier nicht
 *   lesbar; `stand` ist ein neuer leerer Spielstand. Der Aufrufer darf ihn nicht über die
 *   gespeicherten Daten schreiben, sonst gingen sie verloren.
 */
export interface Einleseergebnis {
  art: 'gelesen' | 'neu' | 'neuere-version';
  stand: Spielstand;
}

/** Liest Daten unbekannter Herkunft (geparstes JSON oder nichts) als Spielstand ein. Wirft nie. */
export function einlesen(daten: unknown): Einleseergebnis {
  const neu: Einleseergebnis = { art: 'neu', stand: neuerSpielstand() };
  if (!istObjekt(daten)) return neu;
  const version = daten.schema;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) return neu;
  if (version > SCHEMA_VERSION) return { art: 'neuere-version', stand: neuerSpielstand() };
  let gehoben = daten;
  for (let v = version; v < SCHEMA_VERSION; v++) gehoben = MIGRATIONEN[v - 1]!(gehoben);
  const stand = alsSpielstand(gehoben);
  return stand === undefined ? neu : { art: 'gelesen', stand };
}

/** Prüft Daten der aktuellen Version und baut daraus einen eigenen Spielstand. */
function alsSpielstand(daten: Record<string, unknown>): Spielstand | undefined {
  const { active, profiles } = daten;
  if (typeof active !== 'string' || !istObjekt(profiles) || !Object.hasOwn(profiles, active)) return undefined;
  const gelesen: Record<string, Profil> = {};
  for (const [id, profil] of Object.entries(profiles)) {
    const p = alsProfil(profil);
    if (p === undefined) return undefined;
    gelesen[id] = p;
  }
  return { schema: SCHEMA_VERSION, active, profiles: gelesen };
}

/**
 * Kaputte Karten machen das Profil ungültig. Eine fehlende oder kaputte Einstellung bekommt
 * dagegen ihren Standardwert, damit die gefundenen Karten nicht daran verloren gehen.
 */
function alsProfil(daten: unknown): Profil | undefined {
  if (!istObjekt(daten) || !istObjekt(daten.cards)) return undefined;
  const cards: Record<string, string> = {};
  for (const [karte, zeitpunkt] of Object.entries(daten.cards)) {
    if (typeof zeitpunkt !== 'string') return undefined;
    cards[karte] = zeitpunkt;
  }
  const settings = istObjekt(daten.settings) ? daten.settings : {};
  const showMarkers =
    typeof settings.showMarkers === 'boolean' ? settings.showMarkers : STANDARDEINSTELLUNGEN.showMarkers;
  return { cards, settings: { showMarkers } };
}

function leeresProfil(): Profil {
  return { cards: {}, settings: { ...STANDARDEINSTELLUNGEN } };
}

function mitAktivemProfil(stand: Spielstand, aendern: (profil: Profil) => Profil): Spielstand {
  return { ...stand, profiles: { ...stand.profiles, [stand.active]: aendern(stand.profiles[stand.active]!) } };
}

function istObjekt(wert: unknown): wert is Record<string, unknown> {
  return typeof wert === 'object' && wert !== null && !Array.isArray(wert);
}

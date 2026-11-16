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
export function markiereGefunden(spielstand: Spielstand, karte: string, zeitpunkt: string): Spielstand {
  return mitAktivemProfil(spielstand, (profil) =>
    Object.hasOwn(profil.cards, karte) ? profil : { ...profil, cards: { ...profil.cards, [karte]: zeitpunkt } },
  );
}

export function aendereEinstellung<N extends keyof Einstellungen>(
  spielstand: Spielstand,
  name: N,
  wert: Einstellungen[N],
): Spielstand {
  return mitAktivemProfil(spielstand, (profil) => ({ ...profil, settings: { ...profil.settings, [name]: wert } }));
}

/** Die gefundenen Karten des aktiven Profils, auch die, die es im Verzeichnis nicht gibt. */
export function gefundeneKarten(spielstand: Spielstand): ReadonlySet<string> {
  return new Set(Object.keys(aktivesProfil(spielstand).cards));
}

/** Die Einstellungen des aktiven Profils; die Standardeinstellungen, wenn das Profil fehlt. */
export function aktiveEinstellungen(spielstand: Spielstand): Einstellungen {
  return aktivesProfil(spielstand).settings;
}

/** F19: leert die gefundenen Karten des aktiven Profils und setzt seine Einstellungen zurück. */
export function zuruecksetzen(spielstand: Spielstand): Spielstand {
  return mitAktivemProfil(spielstand, leeresProfil);
}

/**
 * - `gelesen`: Die Daten waren ein Spielstand, gegebenenfalls von einer älteren Version gehoben.
 *   Kaputte Teile sind ersetzt oder weggelassen (siehe `einlesen`).
 * - `neu`: Es lag nichts vor oder die Daten waren kein Spielstand; `spielstand` ist ein neuer
 *   leerer Spielstand.
 * - `neuere-version`: Die Daten stammen von einer neueren Version der Engine und sind hier nicht
 *   lesbar; `spielstand` ist ein neuer leerer Spielstand. Der Aufrufer darf ihn nicht über die
 *   gespeicherten Daten schreiben, sonst gingen sie verloren.
 */
export interface Einleseergebnis {
  art: 'gelesen' | 'neu' | 'neuere-version';
  spielstand: Spielstand;
}

/**
 * Liest Daten unbekannter Herkunft (geparstes JSON oder nichts) als Spielstand ein. Wirft nie.
 * Kaputte Teile kosten nur sich selbst: Ein Karteneintrag, dessen Zeitpunkt kein Text ist, fällt
 * weg; ein Profil, das kein Objekt ist oder keine Karten als Objekt hat, wird leer. Fehlt das
 * aktive Profil, wird es leer angelegt; ist `active` kein Text, wird `standard` aktiv.
 */
export function einlesen(daten: unknown): Einleseergebnis {
  const neu: Einleseergebnis = { art: 'neu', spielstand: neuerSpielstand() };
  if (!istObjekt(daten)) return neu;
  const version = daten.schema;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) return neu;
  if (version > SCHEMA_VERSION) return { art: 'neuere-version', spielstand: neuerSpielstand() };
  let gehoben = daten;
  for (let v = version; v < SCHEMA_VERSION; v++) gehoben = MIGRATIONEN[v - 1]!(gehoben);
  const spielstand = alsSpielstand(gehoben);
  return spielstand === undefined ? neu : { art: 'gelesen', spielstand };
}

/**
 * Baut aus Daten der aktuellen Version einen eigenen Spielstand, `undefined`, wenn `profiles`
 * kein Objekt ist. Objekte mit Schlüsseln aus den Daten entstehen über `Object.fromEntries`:
 * Eine Zuweisung `objekt[schluessel] = wert` setzte bei `__proto__` den Prototyp, statt einen
 * Eintrag anzulegen.
 */
function alsSpielstand(daten: Record<string, unknown>): Spielstand | undefined {
  const { profiles } = daten;
  if (!istObjekt(profiles)) return undefined;
  const gelesen = Object.entries(profiles).map(([id, profil]): [string, Profil] => [id, alsProfil(profil)]);
  const active = typeof daten.active === 'string' ? daten.active : STANDARDPROFIL;
  if (!Object.hasOwn(profiles, active)) gelesen.push([active, leeresProfil()]);
  return { schema: SCHEMA_VERSION, active, profiles: Object.fromEntries(gelesen) };
}

/** Eine fehlende oder kaputte Einstellung bekommt ihren Standardwert. */
function alsProfil(daten: unknown): Profil {
  if (!istObjekt(daten) || !istObjekt(daten.cards)) return leeresProfil();
  const cards = Object.fromEntries(
    Object.entries(daten.cards).filter((eintrag): eintrag is [string, string] => typeof eintrag[1] === 'string'),
  );
  const settings = istObjekt(daten.settings) ? daten.settings : {};
  const showMarkers =
    typeof settings.showMarkers === 'boolean' ? settings.showMarkers : STANDARDEINSTELLUNGEN.showMarkers;
  return { cards, settings: { showMarkers } };
}

function leeresProfil(): Profil {
  return { cards: {}, settings: { ...STANDARDEINSTELLUNGEN } };
}

/** Das aktive Profil; ein leeres, wenn es fehlt. */
function aktivesProfil(spielstand: Spielstand): Profil {
  const { active, profiles } = spielstand;
  return Object.hasOwn(profiles, active) ? profiles[active]! : leeresProfil();
}

function mitAktivemProfil(spielstand: Spielstand, aendern: (profil: Profil) => Profil): Spielstand {
  return { ...spielstand, profiles: { ...spielstand.profiles, [spielstand.active]: aendern(aktivesProfil(spielstand)) } };
}

function istObjekt(wert: unknown): wert is Record<string, unknown> {
  return typeof wert === 'object' && wert !== null && !Array.isArray(wert);
}

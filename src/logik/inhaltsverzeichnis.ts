// Das Inhaltsverzeichnis erzeugt das Prüfskript (tools/), die Engine lädt es beim Start (F1, F35).
// Es trägt die Struktur aller Inhalte, aber keine Kartentexte und keine Hotspot-Texte:
// Die lädt die Engine erst mit der einzelnen Karte oder Szene (F5).

/** Text je Textfassung, Schlüssel ist die Fassungs-ID. */
export type Texte = Readonly<Record<string, string>>;

export type Aktion = 'card' | 'scene' | 'info';

export interface Inhaltsverzeichnis {
  worlds: Welteintrag[];
  scenes: Szeneneintrag[];
  cards: Karteneintrag[];
  topics: Themengebiet[];
  relations: Beziehungstyp[];
}

export interface Welteintrag {
  id: string;
  title: Texte;
  /** ID der Startszene. */
  start: string;
}

export interface Szeneneintrag {
  id: string;
  /** ID der Welt, zu der die Szene gehört. Die Dateien liegen unter `worlds/<world>/scenes/<id>`. */
  world: string;
  title: Texte;
  /** Eintrittskarte, freiwillig. */
  card?: string;
  hotspots: Hotspoteintrag[];
}

export interface Hotspoteintrag {
  id: string;
  action: Aktion;
  /** Karten-ID bei `card`, Szenen-ID bei `scene`, fehlt bei `info`. */
  target?: string;
}

export interface Karteneintrag {
  id: string;
  topic: string;
  /** Beziehungen dieser Karte als Ausgangskarte, leer, wenn sie keine hat. */
  relations: Beziehung[];
}

export interface Beziehung {
  type: string;
  card: string;
}

export interface Themengebiet {
  id: string;
  title: Texte;
  color: string;
  icon: string;
}

export interface Beziehungstyp {
  id: string;
  symmetric: boolean;
  forward: Texte;
  /** Fehlt bei symmetrischen Typen. */
  backward?: Texte;
}

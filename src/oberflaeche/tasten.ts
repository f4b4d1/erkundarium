// Deutung von Escape und Tab bei Hinweis und Kartenknopf (F4a, F32) als reine Entscheidung. Die
// Hotspots liegen im eingebetteten SVG, der Hinweis ist HTML daneben: Tab muss den Fokus dazwischen
// selbst führen.

export interface Tastenlage {
  taste: string;
  umschalt: boolean;
  ueberlagert: boolean;
  hinweisOffen: boolean;
  /** Der offene Hinweis trägt einen Kartenknopf. */
  hatKartenknopf: boolean;
  /** Wo der Fokus liegt: auf dem Hotspot des offenen Hinweises, auf dessen Kartenknopf oder sonst wo. */
  fokus: 'hotspot' | 'kartenknopf' | 'sonst';
}

export type Tastenaktion =
  | 'nichts'
  | 'ebene-zurueck'
  | 'hinweis-schliessen'
  | 'hinweis-schliessen-fokus-zum-hotspot'
  | 'zum-kartenknopf'
  /** Fokus an den Hotspot, dann folgt die normale Tab-Reihenfolge zum nächsten. */
  | 'vom-kartenknopf-weiter'
  | 'vom-kartenknopf-zurueck';

export function deuteTaste(lage: Tastenlage): Tastenaktion {
  // Bei offener Karte bedient sie die Tasten selbst.
  if (lage.ueberlagert) return 'nichts';
  if (lage.taste === 'Escape') {
    if (!lage.hinweisOffen) return 'ebene-zurueck';
    return lage.fokus === 'kartenknopf' ? 'hinweis-schliessen-fokus-zum-hotspot' : 'hinweis-schliessen';
  }
  if (lage.taste === 'Tab' && lage.hinweisOffen && lage.hatKartenknopf) {
    if (lage.fokus === 'kartenknopf') return lage.umschalt ? 'vom-kartenknopf-zurueck' : 'vom-kartenknopf-weiter';
    if (lage.fokus === 'hotspot' && !lage.umschalt) return 'zum-kartenknopf';
  }
  return 'nichts';
}

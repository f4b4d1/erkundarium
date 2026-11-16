// Deutung von Klick, Tippen und Eingabetaste auf einen Hotspot nach Eingabegerät (F26).
// Touch braucht zwei Tippen: Das erste zeigt Hinweis und Hervorhebung, das zweite auf denselben
// Hotspot löst aus. Den Zustand dazwischen hält kein eigener Speicher, sondern die Hervorhebung,
// die die Oberfläche vorgibt: Ausgelöst wird nur, was gerade sichtbar hervorgehoben ist.

export type Eingabegeraet = 'maus' | 'touch' | 'tastatur';

export type Antippfolge = { art: 'betreten' | 'ausgeloest'; hotspot: string } | { art: 'daneben' };

/**
 * @param getroffen der innerste getroffene Hotspot, `undefined` daneben
 * @param hervorgehoben der Hotspot, der gerade hervorgehoben ist
 */
export function deuteAntippen(
  geraet: Eingabegeraet,
  getroffen: string | undefined,
  hervorgehoben: string | undefined,
): Antippfolge {
  if (getroffen === undefined) return { art: 'daneben' };
  if (geraet === 'touch' && getroffen !== hervorgehoben) return { art: 'betreten', hotspot: getroffen };
  return { art: 'ausgeloest', hotspot: getroffen };
}

/** Ordnet `PointerEvent.pointerType` ein Eingabegerät zu. Ein Stift gilt als Touch, ein unbekannter Zeiger als Maus. */
export function geraetDesZeigers(pointerType: string): Eingabegeraet {
  return pointerType === 'touch' || pointerType === 'pen' ? 'touch' : 'maus';
}

// Deutung von Klick, Tippen und Eingabetaste auf einen Hotspot nach Eingabegerät (F26).
// Touch braucht zwei Tippen: Das erste zeigt Hinweis und Hervorhebung, das zweite auf denselben
// Hotspot löst aus. Ausgelöst wird nur, wenn der Hinweis dieses Hotspots durch ein vorheriges
// Tippen geöffnet wurde und noch offen ist; eine Hervorhebung durch Maus oder Tastatur zählt nicht.

export type Eingabegeraet = 'maus' | 'touch' | 'tastatur';

export type Antippfolge = { art: 'betreten' | 'ausgeloest'; hotspot: string } | { art: 'daneben' };

export interface Antippzustand {
  /** Der Hotspot, der gerade hervorgehoben ist, gleich woher. */
  hervorgehoben: string | undefined;
  /** Der Hotspot, dessen Hinweis zuletzt durch ein Tippen geöffnet wurde. */
  durchTippenGeoeffnet: string | undefined;
}

/** @param getroffen der innerste getroffene Hotspot, `undefined` daneben */
export function deuteAntippen(geraet: Eingabegeraet, getroffen: string | undefined, zustand: Antippzustand): Antippfolge {
  if (getroffen === undefined) return { art: 'daneben' };
  const zweitesTippen = getroffen === zustand.hervorgehoben && getroffen === zustand.durchTippenGeoeffnet;
  if (geraet === 'touch' && !zweitesTippen) return { art: 'betreten', hotspot: getroffen };
  return { art: 'ausgeloest', hotspot: getroffen };
}

/** Ordnet `PointerEvent.pointerType` ein Eingabegerät zu. Ein Stift gilt als Touch, ein unbekannter Zeiger als Maus. */
export function geraetDesZeigers(pointerType: string): Eingabegeraet {
  return pointerType === 'touch' || pointerType === 'pen' ? 'touch' : 'maus';
}

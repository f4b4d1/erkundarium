// Bindet das Szenenmodul in Preact ein. Preact zeichnet nur den Behälter; den Inhalt verwaltet
// das Szenenmodul, und Preact rührt ihn nicht an.

import type { RefObject } from 'preact';
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import { baueSzene, type Darstellung, type Szene, type SzenenHotspot, type Szenenereignis } from '../szene/szene.ts';

interface Eigenschaften {
  svg: string;
  hotspots: readonly SzenenHotspot[];
  darstellung: Darstellung;
  onEreignis: (ereignis: Szenenereignis) => void;
  /** Größe oder Lage der Szene auf dem Bildschirm kann sich geändert haben. */
  onLageaenderung: () => void;
  onFehler: (fehler: unknown) => void;
  /** Gibt dem Aufrufer Zugriff auf die laufende Szene, etwa für `lageVon`. */
  szeneRef: RefObject<Szene | undefined>;
}

export function Szenenansicht({ svg, hotspots, darstellung, onEreignis, onLageaenderung, onFehler, szeneRef }: Eigenschaften) {
  const behaelter = useRef<HTMLDivElement>(null);
  // Die Szene ruft immer die aktuellen Rückrufe, ohne bei jedem Zeichnen neu gebaut zu werden.
  const rueckrufe = useRef({ onEreignis, onLageaenderung, onFehler });
  rueckrufe.current = { onEreignis, onLageaenderung, onFehler };

  useLayoutEffect(() => {
    if (behaelter.current === null) return;
    let szene: Szene;
    try {
      szene = baueSzene(behaelter.current, svg, hotspots, (e) => rueckrufe.current.onEreignis(e));
    } catch (fehler) {
      rueckrufe.current.onFehler(fehler);
      return;
    }
    szeneRef.current = szene;
    return () => {
      szene.abbauen();
      szeneRef.current = undefined;
    };
  }, [svg, hotspots, szeneRef]);

  useLayoutEffect(() => {
    szeneRef.current?.zeige(darstellung);
  }, [darstellung, svg, hotspots, szeneRef]);

  // Die Szene verschiebt sich auch, ohne ihre Größe zu ändern, etwa wenn das Fenster breiter wird und
  // sie durch die Höhe begrenzt ist, oder wenn darüber eine Meldung erscheint. Dann ändert sich die
  // Größe eines Vorfahren; darum werden die Szene und alle ihre Vorfahren bis zum Dokument beobachtet.
  useEffect(() => {
    const beobachter = new ResizeObserver(() => rueckrufe.current.onLageaenderung());
    for (let e: Element | null = behaelter.current; e !== null; e = e.parentElement) beobachter.observe(e);
    return () => beobachter.disconnect();
  }, []);

  return <div ref={behaelter} class="szene" />;
}

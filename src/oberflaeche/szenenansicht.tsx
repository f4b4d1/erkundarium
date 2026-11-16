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
  /** Größe oder Lage der Szene auf dem Bildschirm hat sich geändert. */
  onGroesse: () => void;
  onFehler: (fehler: unknown) => void;
  /** Gibt dem Aufrufer Zugriff auf die laufende Szene, etwa für `lageVon`. */
  szeneRef: RefObject<Szene | undefined>;
}

export function Szenenansicht({ svg, hotspots, darstellung, onEreignis, onGroesse, onFehler, szeneRef }: Eigenschaften) {
  const behaelter = useRef<HTMLDivElement>(null);
  // Die Szene ruft immer die aktuellen Rückrufe, ohne bei jedem Zeichnen neu gebaut zu werden.
  const rueckrufe = useRef({ onEreignis, onGroesse, onFehler });
  rueckrufe.current = { onEreignis, onGroesse, onFehler };

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

  useEffect(() => {
    if (behaelter.current === null) return;
    const beobachter = new ResizeObserver(() => rueckrufe.current.onGroesse());
    beobachter.observe(behaelter.current);
    return () => beobachter.disconnect();
  }, []);

  return <div ref={behaelter} class="szene" />;
}

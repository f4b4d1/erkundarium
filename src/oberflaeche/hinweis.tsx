// Der Hinweis am Hotspot (F21 bis F23), von der Anwendung selbst gezeichnet. Inhaltstexte stehen
// nur als Text im Markup, nie als HTML. Er ist bedienbar (F32): Er fängt Klicks ab und trägt bei
// einem Zoom-Hotspot mit gefundener Eintrittskarte einen Kartenknopf.

import type { Ref } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import type { Hinweisinhalt } from '../logik/hinweis.ts';
import { KONTUR, WEISS } from '../szene/haken.ts';
import type { Punkt, Rechteck } from '../szene/szene.ts';
import { platziereAmAnker, platziereHinweis } from './platzierung.ts';
import { SymbolKarte } from './symbole.tsx';
import { TEXTE } from './texte.ts';

const ABSTAND = 10;
const RAND = 8;

interface Eigenschaften {
  inhalt: Hinweisinhalt;
  /** Begrenzungsbox des Hotspots; Lage bei Tastaturfokus. */
  ziel: Rechteck;
  /** Wo Maus oder Finger den Hotspot getroffen haben; der Hinweis sitzt dann daran statt an `ziel`. */
  anker?: Punkt | undefined;
  /** Die Maus ist in den Hinweis gefahren oder hat ihn verlassen. */
  onMausEin: () => void;
  onMausAus: () => void;
  onOeffneKarte: (karte: string) => void;
  /** Der Kartenknopf, damit die Anwendung ihm per Tab den Fokus geben kann. */
  kartenknopfRef: Ref<HTMLButtonElement>;
  /** Der Kartenknopf hat den Fokus verloren. */
  onKartenknopfFokusVerloren: () => void;
}

export function Hinweis({
  inhalt,
  ziel,
  anker,
  onMausEin,
  onMausAus,
  onOeffneKarte,
  kartenknopfRef,
  onKartenknopfFokusVerloren,
}: Eigenschaften) {
  const feld = useRef<HTMLDivElement>(null);

  // Erst messen, dann setzen; beides vor dem Zeichnen, damit der Hinweis nicht springt.
  useLayoutEffect(() => {
    const element = feld.current;
    if (element === null) return;
    // Bei left 0 messen, sonst schrumpft die Breite am rechten Fensterrand.
    element.style.left = '0px';
    element.style.top = '0px';
    const { width, height } = element.getBoundingClientRect();
    const fenster = document.documentElement;
    const bereich = {
      links: RAND,
      oben: RAND,
      breite: fenster.clientWidth - 2 * RAND,
      hoehe: fenster.clientHeight - 2 * RAND,
    };
    const groesse = { breite: width, hoehe: height };
    const lage = anker === undefined ? platziereHinweis(ziel, groesse, bereich, ABSTAND) : platziereAmAnker(anker, groesse, bereich);
    element.style.left = `${lage.links}px`;
    element.style.top = `${lage.oben}px`;
    element.style.visibility = 'visible';
  });

  const symbol = aktionssymbol(inhalt);
  return (
    // `group` mit dem Namen des Hotspots, nicht `tooltip`: Ein Tooltip darf nichts Bedienbares tragen.
    <div
      ref={feld}
      class="hinweis"
      role="group"
      aria-label={inhalt.name}
      style={{ left: '0px', top: '0px', visibility: 'hidden' }}
      // Ein Druck auf den Hinweis nimmt dem Hotspot den Tastaturfokus nicht; sonst schlösse er sich unter dem Klick.
      onMouseDown={(e) => e.preventDefault()}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onMausEin()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onMausAus()}
    >
      <div class="hinweis-kopf">
        <span class="hinweis-name">{inhalt.name}</span>
        <span class="hinweis-aktion">
          {symbol.bild}
          <span class="hinweis-aktion-text">{symbol.text}</span>
        </span>
        {inhalt.eintrittskarte !== undefined && (
          <button
            type="button"
            class="hinweis-karte"
            ref={kartenknopfRef}
            aria-label={TEXTE.eintrittskarteOeffnen}
            // Nicht in der Tab-Reihenfolge: Die Anwendung führt den Fokus vom Hotspot hierher und von
            // hier zurück (F32), sonst käme Tab vom letzten Hotspot hierher statt aus der Szene.
            tabindex={-1}
            onBlur={onKartenknopfFokusVerloren}
            onClick={() => onOeffneKarte(inhalt.eintrittskarte!)}
          >
            <SymbolKarte gefunden />
          </button>
        )}
      </div>
      {inhalt.erklaerung !== undefined && <p class="hinweis-erklaerung">{inhalt.erklaerung}</p>}
      {inhalt.stand !== undefined && <p class="hinweis-stand">{TEXTE.stand(inhalt.stand)}</p>}
    </div>
  );
}

function aktionssymbol(inhalt: Hinweisinhalt) {
  switch (inhalt.aktion) {
    case 'card':
      return inhalt.gefunden
        ? { text: TEXTE.aktion.karteGefunden, bild: <SymbolKarte gefunden /> }
        : { text: TEXTE.aktion.karteVerdeckt, bild: <SymbolKarte gefunden={false} /> };
    case 'scene':
      return { text: TEXTE.aktion.zoom, bild: <SymbolLupe /> };
    case 'info':
      return { text: TEXTE.aktion.info, bild: <SymbolInfo /> };
  }
}

function SymbolLupe() {
  return (
    <svg class="symbol" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10" cy="10" r="6" fill={WEISS} stroke={KONTUR} stroke-width="2" />
      <path d="M14.5,14.5L20,20" stroke={KONTUR} stroke-width="3" stroke-linecap="round" />
    </svg>
  );
}

function SymbolInfo() {
  return (
    <svg class="symbol" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#1F78C1" stroke={KONTUR} stroke-width="2" />
      <circle cx="12" cy="7.5" r="1.4" fill={WEISS} />
      <path d="M12,11V17" stroke={WEISS} stroke-width="2.4" stroke-linecap="round" />
    </svg>
  );
}

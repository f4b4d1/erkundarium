// Der Hinweis am Hotspot (F21 bis F23), von der Anwendung selbst gezeichnet. Inhaltstexte stehen
// nur als Text im Markup, nie als HTML.

import { useLayoutEffect, useRef } from 'preact/hooks';
import type { Hinweisinhalt } from '../logik/hinweis.ts';
import type { Rechteck } from '../szene/szene.ts';
import { platziereHinweis } from './platzierung.ts';
import { TEXTE } from './texte.ts';

const ABSTAND = 10;
const RAND = 8;

export function Hinweis({ inhalt, ziel }: { inhalt: Hinweisinhalt; ziel: Rechteck }) {
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
    const lage = platziereHinweis(ziel, { breite: width, hoehe: height }, bereich, ABSTAND);
    element.style.left = `${lage.links}px`;
    element.style.top = `${lage.oben}px`;
    element.style.visibility = 'visible';
  });

  const symbol = aktionssymbol(inhalt);
  return (
    <div ref={feld} class="hinweis" role="tooltip" style={{ left: '0px', top: '0px', visibility: 'hidden' }}>
      <div class="hinweis-kopf">
        <span class="hinweis-name">{inhalt.name}</span>
        <span class="hinweis-aktion">
          {symbol.bild}
          <span class="hinweis-aktion-text">{symbol.text}</span>
        </span>
      </div>
      {inhalt.erklaerung !== undefined && <p class="hinweis-erklaerung">{inhalt.erklaerung}</p>}
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

function SymbolKarte({ gefunden }: { gefunden: boolean }) {
  return (
    <svg class="symbol" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" fill={gefunden ? '#F7F9FB' : '#6B7785'} stroke="#26262E" stroke-width="2" />
      {gefunden && (
        <g>
          <circle cx="17" cy="17" r="6" fill="#3BB273" stroke="#26262E" stroke-width="1.5" />
          <path d="M14.3,17.2L16.3,19.2L19.8,15.3" fill="none" stroke="#F7F9FB" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </g>
      )}
    </svg>
  );
}

function SymbolLupe() {
  return (
    <svg class="symbol" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10" cy="10" r="6" fill="#F7F9FB" stroke="#26262E" stroke-width="2" />
      <path d="M14.5,14.5L20,20" stroke="#26262E" stroke-width="3" stroke-linecap="round" />
    </svg>
  );
}

function SymbolInfo() {
  return (
    <svg class="symbol" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#1F78C1" stroke="#26262E" stroke-width="2" />
      <circle cx="12" cy="7.5" r="1.4" fill="#F7F9FB" />
      <path d="M12,11V17" stroke="#F7F9FB" stroke-width="2.4" stroke-linecap="round" />
    </svg>
  );
}

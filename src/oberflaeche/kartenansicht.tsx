// Die Kartenansicht: ein modaler Dialog über der Szene (F6 bis F10, F34). Sie lädt die Kartendatei
// erst beim Öffnen, deckt die Karte beim ersten Fund mit einer Drehung auf, öffnet eine schon
// gefundene mit einer kurzen Animation und lässt sie wenden.
// Solange sie offen ist, ist die Szene dahinter gesperrt; den Fokus zurück zum Hotspot legt der
// Aufrufer nach dem Schließen.

import type { CSSProperties, TargetedMouseEvent, TargetedPointerEvent } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { gebietsfarbe } from '../logik/gebietsfarbe.ts';
import type { Themengebiet, Wissensgebiet } from '../logik/inhaltsverzeichnis.ts';
import type { Kartendatei, Kartentext } from '../logik/kartendatei.ts';
import { text as textAus, waehleFassung } from '../logik/textfassung.ts';
import { kartenbildPfad, ladeKarte, symbolPfad } from '../inhalte/laden.ts';
import { Deckblatt, Rueckseite, Vorderseite, type Kartengebiet } from './kartenseiten.tsx';
import { TEXTE } from './texte.ts';

interface Eigenschaften {
  karte: string;
  /** Erster Fund: Die verdeckte Karte dreht sich zur Vorderseite. */
  aufdecken: boolean;
  themengebiete: readonly Themengebiet[];
  wissensgebiete: readonly Wissensgebiet[];
  fassung: string;
  onSchliessen: () => void;
}

type Ladezustand =
  | { art: 'laedt' }
  | { art: 'fehler'; detail?: string }
  | { art: 'bereit'; datei: Kartendatei; text: Kartentext };

/** Endet die Aufdeck-Animation nicht von selbst, etwa weil Animationen abgeschaltet sind. */
const AUFDECKEN_HOECHSTENS_MS = 2500;

export function Kartenansicht({ karte, aufdecken, themengebiete, wissensgebiete, fassung, onSchliessen }: Eigenschaften) {
  const dialog = useRef<HTMLDialogElement>(null);
  const schliessen = useRef<HTMLButtonElement>(null);
  const [laden, setLaden] = useState<Ladezustand>({ art: 'laedt' });
  const [deckeAuf, setDeckeAuf] = useState(aufdecken);
  const [gewendet, setGewendet] = useState(false);
  const druckNebenKarte = useRef(false);

  useLayoutEffect(() => {
    const element = dialog.current;
    if (element === null) return;
    element.showModal();
    return () => element.close();
  }, []);

  useEffect(() => {
    let aktuell = true;
    ladeKarte(karte).then(
      (datei) => {
        if (!aktuell) return;
        const text = waehleFassung(datei.texts, fassung);
        setLaden(text === undefined ? { art: 'fehler' } : { art: 'bereit', datei, text });
      },
      (fehler: unknown) => {
        if (aktuell) setLaden({ art: 'fehler', ...(fehler instanceof Error ? { detail: fehler.message } : {}) });
      },
    );
    return () => {
      aktuell = false;
    };
  }, [karte, fassung]);

  const bereit = laden.art === 'bereit';
  const fehlgeschlagen = laden.art === 'fehler';
  useEffect(() => {
    // Der Knopf Wenden verschwindet mit dem Fehler; der Fokus bleibt im Dialog.
    if (fehlgeschlagen) schliessen.current?.focus();
  }, [fehlgeschlagen]);

  useEffect(() => {
    if (!bereit || !deckeAuf) return;
    const zeitgeber = setTimeout(() => setDeckeAuf(false), AUFDECKEN_HOECHSTENS_MS);
    return () => clearTimeout(zeitgeber);
  }, [bereit, deckeAuf]);

  function wende(): void {
    // Wer während des Aufdeckens wendet, überspringt nur die Animation.
    if (deckeAuf) setDeckeAuf(false);
    else setGewendet((g) => !g);
  }

  function beimDruecken(e: TargetedPointerEvent<HTMLDialogElement>): void {
    druckNebenKarte.current = nebenKarte(e.target);
  }

  function beimKlick(e: TargetedMouseEvent<HTMLDialogElement>): void {
    // Klick oder Tippen neben die Karte schließt. Wer auf der Karte Text markiert und neben ihr
    // loslässt, löst einen Klick auf einem gemeinsamen Vorfahren aus; der schließt nicht.
    if (druckNebenKarte.current && nebenKarte(e.target)) onSchliessen();
  }

  function beimKlickAufKarte(e: TargetedMouseEvent<HTMLDivElement>): void {
    if (e.target instanceof Element && e.target.closest('a') !== null) return;
    // Wer Text markiert hat, will nicht wenden.
    const auswahl = window.getSelection();
    if (auswahl !== null && !auswahl.isCollapsed) return;
    wende();
  }

  const titel =
    laden.art === 'bereit' ? laden.text.title : laden.art === 'fehler' ? TEXTE.karte.nichtGeladen : TEXTE.karte.laedt;

  return (
    <dialog
      ref={dialog}
      class="kartenansicht"
      aria-label={titel}
      onCancel={(e) => {
        // Escape schließt; der Aufrufer nimmt den Dialog dann aus der Seite.
        e.preventDefault();
        onSchliessen();
      }}
      onPointerDown={beimDruecken}
      onClick={beimKlick}
    >
      <div class="kartenansicht-flaeche">
        {laden.art === 'laedt' && (
          <p class="karte-laedt" role="status">
            {TEXTE.karte.laedt}
          </p>
        )}
        {laden.art === 'fehler' && (
          <div class="karte-fehler" role="alert">
            <p class="karte-fehler-titel">{TEXTE.karte.nichtGeladen}</p>
            <p>{TEXTE.karte.trotzdemGefunden}</p>
            {laden.detail !== undefined && <p class="fehler-detail">{laden.detail}</p>}
          </div>
        )}
        {laden.art === 'bereit' && (
          <Karte
            datei={laden.datei}
            text={laden.text}
            gebiet={gebiet(laden.datei.topic, themengebiete, fassung)}
            farbe={gebietsfarbe(laden.datei.topic, themengebiete, wissensgebiete)}
            deckeAuf={deckeAuf}
            oeffnen={!aufdecken}
            gewendet={gewendet}
            onKlick={beimKlickAufKarte}
            onAufgedeckt={() => setDeckeAuf(false)}
          />
        )}
        <div class="kartenansicht-knoepfe">
          {/* Schon während des Ladens da, damit der Dialog mit dem Fokus auf ihm öffnet. */}
          {laden.art !== 'fehler' && (
            <button
              type="button"
              class="kartenknopf"
              aria-label={gewendet ? TEXTE.karte.wendenZurVorderseite : TEXTE.karte.wendenZurRueckseite}
              aria-disabled={!bereit}
              onClick={() => bereit && wende()}
            >
              <SymbolWenden />
              <span aria-hidden="true">{TEXTE.karte.wenden}</span>
            </button>
          )}
          <button ref={schliessen} type="button" class="kartenknopf" onClick={onSchliessen}>
            <SymbolSchliessen />
            <span>{TEXTE.karte.schliessen}</span>
          </button>
        </div>
        {/* Die Region steht von Anfang an da; nur ein später gesetzter Text wird vorgelesen. */}
        <p class="nur-vorlesen" role="status">
          {aufdecken && laden.art === 'bereit' ? `${TEXTE.karte.neuGefunden}: ${laden.text.title}` : ''}
        </p>
      </div>
    </dialog>
  );
}

interface Karteneigenschaften {
  datei: Kartendatei;
  text: Kartentext;
  gebiet: Kartengebiet;
  /** Farbe des Wissensgebiets; fehlt sie, gilt der Vorgabewert aus karte.css und die Karte bleibt farblos. */
  farbe: string | undefined;
  deckeAuf: boolean;
  /** Schon gefunden: Die Karte erscheint mit der kurzen Öffnen-Animation (F7). */
  oeffnen: boolean;
  gewendet: boolean;
  onKlick: (e: TargetedMouseEvent<HTMLDivElement>) => void;
  onAufgedeckt: () => void;
}

function Karte({ datei, text, gebiet, farbe, deckeAuf, oeffnen, gewendet, onKlick, onAufgedeckt }: Karteneigenschaften) {
  const bild = datei.image === undefined ? undefined : kartenbildPfad(datei.image);
  const seite = { datei, text, gebiet, ...(bild === undefined ? {} : { bild }) };
  const klassen = ['karte', deckeAuf && 'karte-aufdecken', gewendet && 'karte-gewendet'].filter(Boolean).join(' ');
  const halter = ['karte-halter', deckeAuf && 'karte-halter-aufdecken', oeffnen && 'karte-halter-oeffnen']
    .filter(Boolean)
    .join(' ');
  return (
    <div
      class={halter}
      style={farbe === undefined ? undefined : ({ '--gebietsfarbe': farbe } as CSSProperties)}
    >
      <div class={klassen} onClick={onKlick} onAnimationEnd={onAufgedeckt}>
        <section class="kartenseite kartenseite-vorne" aria-label={TEXTE.karte.vorderseite} inert={gewendet}>
          <Vorderseite {...seite} />
        </section>
        <section
          class="kartenseite kartenseite-hinten"
          aria-label={TEXTE.karte.rueckseite}
          inert={!gewendet || deckeAuf}
        >
          {/* Während des Aufdeckens liegt hier das Deckblatt; danach ist es die Rückseite der Karte. */}
          {deckeAuf ? <Deckblatt gebiet={gebiet} /> : <Rueckseite {...seite} />}
        </section>
      </div>
    </div>
  );
}

/** Liegt das Ziel eines Zeigerereignisses neben Karte, Knöpfen und Fehlermeldung? */
function nebenKarte(ziel: EventTarget | null): boolean {
  return !(ziel instanceof Element) || ziel.closest('.karte, .kartenansicht-knoepfe, .karte-fehler') === null;
}

function gebiet(id: string, themengebiete: readonly Themengebiet[], fassung: string): Kartengebiet {
  const eintrag = themengebiete.find((t) => t.id === id);
  if (eintrag === undefined) return { name: '' };
  const symbol = symbolPfad(eintrag.icon);
  return { name: textAus(eintrag.title, fassung), ...(symbol === undefined ? {} : { symbol }) };
}

function SymbolWenden() {
  return (
    <svg class="knopf-symbol" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4.5,10.5a7.5,7.5 0 0 1 13.4,-3.2M19.5,13.5a7.5,7.5 0 0 1 -13.4,3.2M18.5,3.5v4.3h-4.3M5.5,20.5v-4.3h4.3"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

function SymbolSchliessen() {
  return (
    <svg class="knopf-symbol" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6,6L18,18M18,6L6,18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
    </svg>
  );
}

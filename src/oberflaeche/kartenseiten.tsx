// Die Seiten einer Karte: Vorderseite, Rückseite und das Deckblatt der verdeckten Karte (F8, F9).
// Alle Texte aus Inhalten stehen nur als Text im Markup, nie als HTML. Bilder aus Inhalten kommen
// nur als <img>, damit nichts aus ihnen in die Seite gelangt.

import { useId, useState } from 'preact/hooks';
import type { Baustein, Kartendatei, Kartentext } from '../logik/kartendatei.ts';
import { KONTUR, WEISS } from '../szene/haken.ts';
import { TEXTE } from './texte.ts';

/** Was die Karte vom Themengebiet zeigt. Die Farbe des Wissensgebiets setzt die Kartenansicht als CSS-Variable. */
export interface Kartengebiet {
  name: string;
  /** Pfad der Symbol-Datei; fehlt, wenn das Themengebiet unbekannt ist. */
  symbol?: string;
}

interface Seiteneigenschaften {
  datei: Kartendatei;
  text: Kartentext;
  gebiet: Kartengebiet;
  /** Pfad des Kartenbilds, falls die Karte eines hat. */
  bild?: string;
}

export function Vorderseite({ text, gebiet, bild }: Seiteneigenschaften) {
  return (
    <>
      <header class="kartenkopf">
        <span class="kartenschild">
          <Symbol pfad={gebiet.symbol} />
          <span class="kartenschild-text">{gebiet.name}</span>
        </span>
        {text.status === 'entwurf' && <Entwurf />}
      </header>
      <div class="kartenblatt">
        <h2 class="kartentitel">{text.title}</h2>
        <Bildfeld bild={bild} symbol={gebiet.symbol} />
        <Bausteine liste={text.front} />
      </div>
    </>
  );
}

export function Rueckseite({ datei, text, gebiet }: Seiteneigenschaften) {
  return (
    <>
      <header class="kartenkopf">
        <span class="kartenschild">
          <Symbol pfad={gebiet.symbol} />
          <span class="kartenschild-text">{text.title}</span>
        </span>
        {text.status === 'entwurf' && <Entwurf />}
      </header>
      <div class="kartenblatt kartenblatt-rueckseite">
        {text.back.length > 0 && <Bausteine liste={text.back} />}
        <footer class="kartenfuss">
          {datei.link !== undefined && (
            <a class="kartenlink" href={datei.link} target="_blank" rel="noopener noreferrer">
              <SymbolNachAussen />
              <span>{text.linkLabel ?? TEXTE.karte.link}</span>
              <span class="nur-vorlesen"> {TEXTE.karte.neuerTab}</span>
            </a>
          )}
          <h3 class="quellen-titel">{TEXTE.karte.quellen}</h3>
          <ol class="quellen">
            {datei.sources.map((quelle, i) => (
              <li key={i}>{quelle}</li>
            ))}
          </ol>
        </footer>
      </div>
    </>
  );
}

/** Die Rückseite der verdeckten Karte, wie sie vor dem Aufdecken daliegt. */
export function Deckblatt({ gebiet }: { gebiet: Kartengebiet }) {
  return (
    <div class="deckblatt">
      <Muster />
      <div class="siegel">
        <Symbol pfad={gebiet.symbol} />
      </div>
    </div>
  );
}

/** Rauten und Punkte, die eine Fläche füllen; die Farben setzt das CSS. */
function Muster() {
  const id = useId();
  return (
    <svg class="muster" aria-hidden="true">
      <defs>
        <pattern id={id} width="28" height="28" patternUnits="userSpaceOnUse">
          <rect x="9" y="9" width="10" height="10" rx="2" transform="rotate(45 14 14)" class="muster-raute" />
          <circle cx="0" cy="0" r="3" class="muster-punkt" />
          <circle cx="28" cy="0" r="3" class="muster-punkt" />
          <circle cx="0" cy="28" r="3" class="muster-punkt" />
          <circle cx="28" cy="28" r="3" class="muster-punkt" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function Entwurf() {
  return (
    <span class="entwurf" title={TEXTE.karte.entwurfErklaerung}>
      <span aria-hidden="true">{TEXTE.karte.entwurf}</span>
      <span class="nur-vorlesen">{TEXTE.karte.entwurfErklaerung}</span>
    </span>
  );
}

/** Das Kartenbild; fehlt es oder lädt es nicht, das Symbol des Themengebiets (F8). */
function Bildfeld({ bild, symbol }: { bild: string | undefined; symbol: string | undefined }) {
  const [bildFehlt, setBildFehlt] = useState(false);
  const zeigeBild = bild !== undefined && !bildFehlt;
  return (
    <div class={zeigeBild ? 'bildfeld' : 'bildfeld bildfeld-symbol'}>
      {zeigeBild ? (
        <img class="kartenbild" src={bild} alt="" draggable={false} onError={() => setBildFehlt(true)} />
      ) : (
        <>
          <Muster />
          <div class="siegel">
            <Symbol pfad={symbol} />
          </div>
        </>
      )}
    </div>
  );
}

/** Symbol des Themengebiets als Bild; ohne Datei oder wenn sie nicht lädt, eine leere Fläche gleicher Größe. */
function Symbol({ pfad }: { pfad: string | undefined }) {
  const [fehlt, setFehlt] = useState(false);
  if (pfad === undefined || fehlt) return <span class="symbol-gebiet symbol-leer" aria-hidden="true" />;
  return <img class="symbol-gebiet" src={pfad} alt="" draggable={false} onError={() => setFehlt(true)} />;
}

function Bausteine({ liste }: { liste: readonly Baustein[] }) {
  return (
    <div class="bausteine">
      {liste.map((baustein, i) => (
        <BausteinAnzeige key={i} baustein={baustein} />
      ))}
    </div>
  );
}

function BausteinAnzeige({ baustein }: { baustein: Baustein }) {
  switch (baustein.type) {
    case 'text':
      return <p class="baustein-text">{baustein.text}</p>;
    case 'list':
      return (
        <ul class="baustein-liste">
          {baustein.items.map((eintrag, i) => (
            <li key={i}>{eintrag}</li>
          ))}
        </ul>
      );
    case 'facts':
      return (
        <ul class="baustein-fakten">
          {baustein.items.map((eintrag, i) => (
            <li key={i}>{eintrag}</li>
          ))}
        </ul>
      );
    case 'table':
      return <Tabelle zeilen={baustein.rows} />;
    case 'funfact':
      return (
        <aside class="baustein-funfact">
          <p class="funfact-kopf">
            <SymbolGluehbirne />
            {TEXTE.karte.schonGewusst}
          </p>
          <p class="funfact-text">{baustein.text}</p>
        </aside>
      );
  }
}

/** Die erste Zeile ist die Kopfzeile. Kürzere Zeilen werden mit leeren Zellen aufgefüllt. */
function Tabelle({ zeilen }: { zeilen: readonly (readonly string[])[] }) {
  const [kopf = [], ...rumpf] = zeilen;
  const spalten = Math.max(...zeilen.map((z) => z.length));
  const aufgefuellt = (zeile: readonly string[]) => Array.from({ length: spalten }, (_, i) => zeile[i] ?? '');
  return (
    <table class="baustein-tabelle">
      <thead>
        <tr>
          {aufgefuellt(kopf).map((zelle, i) => (
            <th key={i} scope="col">
              {zelle}
            </th>
          ))}
        </tr>
      </thead>
      {rumpf.length > 0 && (
        <tbody>
          {rumpf.map((zeile, z) => (
            <tr key={z}>
              {aufgefuellt(zeile).map((zelle, i) => (
                <td key={i}>{zelle}</td>
              ))}
            </tr>
          ))}
        </tbody>
      )}
    </table>
  );
}

function SymbolGluehbirne() {
  return (
    <svg class="funfact-symbol" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12,3a6.5,6.5 0 0 0 -3.6,11.9V17h7.2v-2.1A6.5,6.5 0 0 0 12,3z"
        fill={WEISS}
        stroke={KONTUR}
        stroke-width="2"
        stroke-linejoin="round"
      />
      <rect x="8.9" y="17" width="6.2" height="3.6" rx="1" fill="#A7B1BC" stroke={KONTUR} stroke-width="2" />
    </svg>
  );
}

function SymbolNachAussen() {
  return (
    <svg class="link-symbol" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M13,5h6v6M19,5l-8,8M17,14v4a1,1 0 0 1 -1,1H6a1,1 0 0 1 -1,-1V8a1,1 0 0 1 1,-1h4"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

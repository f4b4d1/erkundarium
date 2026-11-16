// Die Anwendung hält den Zustand zusammen: geladene Szene, Spielstand, offener Hinweis, offene
// Karte und Meldungen. Sie startet immer in der Startszene der ersten Welt (F1).

import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { abgehakteHotspots, hinweisinhalt } from '../logik/hinweis.ts';
import type { Themengebiet, Wissensgebiet } from '../logik/inhaltsverzeichnis.ts';
import { oeffneKarte } from '../logik/karte-oeffnen.ts';
import type { Speicherschicht } from '../logik/speicherschicht.ts';
import { aktiveEinstellungen, einlesen, gefundeneKarten, type Spielstand } from '../logik/spielstand.ts';
import type { Hotspot } from '../logik/szenendatei.ts';
import { STANDARDFASSUNG, text } from '../logik/textfassung.ts';
import { ladeInhaltsverzeichnis, ladeSzene, type GeladeneSzene } from '../inhalte/laden.ts';
import type { Rechteck, Szene, Szenenereignis } from '../szene/szene.ts';
import { Hinweis } from './hinweis.tsx';
import { Kartenansicht } from './kartenansicht.tsx';
import { Szenenansicht } from './szenenansicht.tsx';
import { TEXTE } from './texte.ts';

/** Die Textfassung. Die Auswahl durch den Spieler kommt mit dem Startbildschirm hierher. */
const FASSUNG = STANDARDFASSUNG;

type Ladezustand =
  | { art: 'laedt' }
  | { art: 'fehler'; meldung: string; detail?: string }
  | {
      art: 'bereit';
      szene: GeladeneSzene;
      themengebiete: readonly Themengebiet[];
      wissensgebiete: readonly Wissensgebiet[];
    };

interface OffenerHinweis {
  hotspot: string;
  lage: Rechteck;
}

interface OffeneKarte {
  karte: string;
  aufdecken: boolean;
  /** Der Hotspot, von dem aus sie geöffnet wurde; er bekommt nach dem Schließen den Fokus zurück. */
  hotspot: string;
  /** Zählt jedes Öffnen, damit die Kartenansicht jedes Mal neu beginnt. */
  nummer: number;
}

export function Anwendung({ speicher }: { speicher: Speicherschicht }) {
  const [ladezustand, setLadezustand] = useState<Ladezustand>({ art: 'laedt' });
  const [start] = useState(() => einlesen(speicher.laden()));
  const [spielstand, setSpielstand] = useState<Spielstand>(start.spielstand);
  const speichernErlaubt = start.art !== 'neuere-version';
  const [speichernFehlgeschlagen, setSpeichernFehlgeschlagen] = useState(false);
  const [offen, setOffen] = useState<OffenerHinweis | undefined>(undefined);
  const [offeneKarte, setOffeneKarte] = useState<OffeneKarte | undefined>(undefined);
  const fokusZurueck = useRef<string | undefined>(undefined);
  const szeneRef = useRef<Szene | undefined>(undefined);

  useEffect(() => {
    starte().then(
      (geladen) => setLadezustand({ art: 'bereit', ...geladen }),
      (fehler: unknown) => setLadezustand(alsFehlerzustand(fehler)),
    );
  }, []);

  // Erst wenn die Kartenansicht aus der Seite ist, ist die Szene wieder bedienbar und fokussierbar.
  useEffect(() => {
    if (offeneKarte !== undefined || fokusZurueck.current === undefined) return;
    szeneRef.current?.fokussiere(fokusZurueck.current);
    fokusZurueck.current = undefined;
  }, [offeneKarte]);

  const gefunden = useMemo(() => gefundeneKarten(spielstand), [spielstand]);
  const szene = ladezustand.art === 'bereit' ? ladezustand.szene : undefined;
  const hotspots = szene?.datei.hotspots;
  const hotspotsDerSzene = useMemo(
    () => (hotspots ?? []).map((h) => ({ id: h.id, name: text(h.label, FASSUNG) })),
    [hotspots],
  );
  const darstellung = useMemo(
    () => ({
      abgehakt: abgehakteHotspots(hotspots ?? [], gefunden, aktiveEinstellungen(spielstand)),
      hervorgehoben: offen?.hotspot,
    }),
    [hotspots, gefunden, spielstand, offen?.hotspot],
  );

  if (ladezustand.art === 'laedt') return <p class="laedt">{TEXTE.laedt}</p>;
  if (ladezustand.art === 'fehler') {
    return (
      <div class="fehler" role="alert">
        <h1>{TEXTE.startFehlgeschlagen}</h1>
        <p>{ladezustand.meldung}</p>
        {ladezustand.detail !== undefined && <p class="fehler-detail">{ladezustand.detail}</p>}
      </div>
    );
  }

  const { datei, svg } = ladezustand.szene;
  const { themengebiete, wissensgebiete } = ladezustand;
  const finde = (id: string): Hotspot | undefined => datei.hotspots.find((h) => h.id === id);

  function loeseAus(hotspot: Hotspot): void {
    // `scene` zoomt erst im nächsten Schritt; `info` hat nur den Hinweis (F24).
    if (hotspot.action !== 'card' || hotspot.target === undefined) return;
    const { spielstand: neu, aufdecken } = oeffneKarte(spielstand, hotspot.target, new Date().toISOString());
    // Gespeichert wird vor dem Laden der Karte: Der Fund bleibt, auch wenn sie nicht lädt.
    if (aufdecken) speichere(neu);
    const karte = hotspot.target;
    setOffeneKarte((bisher) => ({ karte, aufdecken, hotspot: hotspot.id, nummer: (bisher?.nummer ?? 0) + 1 }));
  }

  function speichere(neu: Spielstand): void {
    setSpielstand(neu);
    if (!speichernErlaubt) return;
    try {
      speicher.speichern(neu);
      setSpeichernFehlgeschlagen(false);
    } catch {
      setSpeichernFehlgeschlagen(true);
    }
  }

  function schliesseKarte(): void {
    fokusZurueck.current = offeneKarte?.hotspot;
    setOffeneKarte(undefined);
  }

  function beimEreignis(ereignis: Szenenereignis): void {
    switch (ereignis.art) {
      case 'betreten':
        setOffen({ hotspot: ereignis.hotspot, lage: ereignis.lage });
        break;
      case 'verlassen':
        setOffen((bisher) => (bisher?.hotspot === ereignis.hotspot ? undefined : bisher));
        break;
      case 'daneben':
        setOffen(undefined);
        break;
      case 'ausgeloest': {
        setOffen({ hotspot: ereignis.hotspot, lage: ereignis.lage });
        const hotspot = finde(ereignis.hotspot);
        if (hotspot !== undefined) loeseAus(hotspot);
        break;
      }
    }
  }

  /** Der offene Hinweis folgt dem Hotspot, wenn sich Größe oder Lage der Szene ändern. */
  function beiLageaenderung(): void {
    setOffen((bisher) => {
      const lage = bisher && szeneRef.current?.lageVon(bisher.hotspot);
      return bisher && lage ? { ...bisher, lage } : bisher;
    });
  }

  const offenerHotspot = offen && finde(offen.hotspot);
  const meldungen = [
    ...(speichernErlaubt ? [] : [TEXTE.neuereVersion]),
    ...(speichernFehlgeschlagen ? [TEXTE.speichernFehlgeschlagen] : []),
  ];

  return (
    <>
      {meldungen.length > 0 && (
        <div class="meldungen" role="status">
          {meldungen.map((m) => (
            <p key={m}>{m}</p>
          ))}
        </div>
      )}
      <main
        class="buehne"
        onClick={(e) => {
          // Tippen auf den Rand neben der Szene schließt den Hinweis wie Tippen daneben.
          if (!(e.target instanceof Element) || e.target.closest('.szene') === null) setOffen(undefined);
        }}
      >
        <Szenenansicht
          svg={svg}
          hotspots={hotspotsDerSzene}
          darstellung={darstellung}
          onEreignis={beimEreignis}
          onLageaenderung={beiLageaenderung}
          onFehler={(fehler) =>
            setLadezustand({ art: 'fehler', meldung: TEXTE.szeneNichtDarstellbar, detail: fehlertext(fehler) })
          }
          szeneRef={szeneRef}
        />
      </main>
      {offen && offenerHotspot && !offeneKarte && (
        <Hinweis inhalt={hinweisinhalt(offenerHotspot, gefunden, FASSUNG)} ziel={offen.lage} />
      )}
      {offeneKarte && (
        <Kartenansicht
          key={offeneKarte.nummer}
          karte={offeneKarte.karte}
          aufdecken={offeneKarte.aufdecken}
          themengebiete={themengebiete}
          wissensgebiete={wissensgebiete}
          fassung={FASSUNG}
          onSchliessen={schliesseKarte}
        />
      )}
    </>
  );
}

class Startfehler extends Error {}

/** Lädt das Inhaltsverzeichnis und die Startszene der ersten Welt. */
async function starte(): Promise<{
  szene: GeladeneSzene;
  themengebiete: readonly Themengebiet[];
  wissensgebiete: readonly Wissensgebiet[];
}> {
  const verzeichnis = await ladeInhaltsverzeichnis();
  const welt = verzeichnis.worlds[0];
  if (welt === undefined) throw new Startfehler(TEXTE.keineWelt);
  const eintrag = verzeichnis.scenes.find((s) => s.id === welt.start);
  if (eintrag === undefined) throw new Startfehler(TEXTE.startszeneFehlt);
  return { szene: await ladeSzene(eintrag), themengebiete: verzeichnis.topics, wissensgebiete: verzeichnis.domains };
}

function alsFehlerzustand(fehler: unknown): Ladezustand {
  if (fehler instanceof Startfehler) return { art: 'fehler', meldung: fehler.message };
  return { art: 'fehler', meldung: TEXTE.inhalteNichtGeladen, detail: fehlertext(fehler) };
}

function fehlertext(fehler: unknown): string | undefined {
  return fehler instanceof Error ? fehler.message : undefined;
}

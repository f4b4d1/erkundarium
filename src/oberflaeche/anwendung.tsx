// Die Anwendung hält den Zustand zusammen: geladene Szene, Spielstand, offener Hinweis, offene
// Karte und Meldungen. Sie startet immer in der Startszene der ersten Welt (F1).

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { abgehakteHotspots, hinweisinhalt } from '../logik/hinweis.ts';
import type { Inhaltsverzeichnis, Szeneneintrag, Themengebiet, Wissensgebiet } from '../logik/inhaltsverzeichnis.ts';
import { aufzudeckendeEintrittskarte, oeffneKarte } from '../logik/karte-oeffnen.ts';
import { betreten, kuerzenBis, neuerPfad, type Pfad } from '../logik/pfad.ts';
import type { Speicherschicht } from '../logik/speicherschicht.ts';
import { aktiveEinstellungen, einlesen, gefundeneKarten, type Spielstand } from '../logik/spielstand.ts';
import type { Hotspot } from '../logik/szenendatei.ts';
import { STANDARDFASSUNG, text } from '../logik/textfassung.ts';
import { ladeInhaltsverzeichnis, ladeSzene, type GeladeneSzene } from '../inhalte/laden.ts';
import { pruefeSvg, type Punkt, type Rechteck, type Szene, type Szenenereignis } from '../szene/szene.ts';
import { Hinweis } from './hinweis.tsx';
import { Kartenansicht } from './kartenansicht.tsx';
import { Pfadanzeige, type Ebene } from './pfadanzeige.tsx';
import { sollNeuAnkern } from './platzierung.ts';
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
      verzeichnis: Inhaltsverzeichnis;
      /** Der Weg von der Startszene zur aktuellen Szene; gilt nur für die Sitzung (F4). */
      pfad: Pfad;
      themengebiete: readonly Themengebiet[];
      wissensgebiete: readonly Wissensgebiet[];
    };

interface OffenerHinweis {
  hotspot: string;
  lage: Rechteck;
  /** Wo Maus oder Finger den Hotspot getroffen haben; fehlt bei Tastaturfokus (Lage an der Box). */
  anker?: Punkt;
}

/** So lange bleibt der Hinweis offen, wenn der Zeiger Hotspot und Hinweis verlassen hat. */
const SCHLIESS_VERZOEGERUNG_MS = 150;

/** Wohin der Fokus zurückkehrt, wenn die Karte zugeht: dorthin, wo sie ausgelöst wurde. */
type Fokusziel =
  | { art: 'hotspot'; id: string }
  | { art: 'kartenknopf' }
  /** Die Karte öffnete sich von selbst (F30), es gibt keinen Auslöser. */
  | { art: 'szene' };

interface OffeneKarte {
  karte: string;
  aufdecken: boolean;
  /** Wohin der Fokus nach dem Schließen zurückkehrt. */
  fokus: Fokusziel;
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
  const fokusZurueck = useRef<Fokusziel | undefined>(undefined);
  const szeneRef = useRef<Szene | undefined>(undefined);
  const buehneRef = useRef<HTMLElement>(null);
  const kartenknopfRef = useRef<HTMLButtonElement>(null);
  /** Solange ein Wechsel läuft, löst nichts weiteres aus. */
  const wechselt = useRef(false);
  const zoom = useRef<Animation | undefined>(undefined);
  const fokusAufSzene = useRef(false);
  const schliesstimer = useRef<number | undefined>(undefined);
  const [wechselFehler, setWechselFehler] = useState(false);

  useEffect(() => {
    starte().then(
      (geladen) => {
        setLadezustand({ art: 'bereit', ...geladen });
        // Trägt die Startszene eine Eintrittskarte, deckt sie sich nach dem Start auf (F30).
        const karte = aufzudeckendeEintrittskarte(geladen.verzeichnis, geladen.pfad[0]!, gefundeneKarten(start.spielstand));
        if (karte !== undefined) zeigeKarte(karte, { art: 'szene' });
      },
      (fehler: unknown) => setLadezustand(alsFehlerzustand(fehler)),
    );
  }, []);

  // Erst wenn die Kartenansicht aus der Seite ist, ist die Szene wieder bedienbar und fokussierbar.
  useEffect(() => {
    if (offeneKarte !== undefined || fokusZurueck.current === undefined) return;
    fokussiere(fokusZurueck.current);
    fokusZurueck.current = undefined;
  }, [offeneKarte]);

  // Nach dem Wechsel liegt der Fokus auf der Szene; erst jetzt ist die neue Szene gebaut.
  const aktuelleSzene = ladezustand.art === 'bereit' ? ladezustand.szene : undefined;
  useLayoutEffect(() => {
    zoom.current?.cancel();
    zoom.current = undefined;
    if (!fokusAufSzene.current) return;
    fokusAufSzene.current = false;
    // Öffnet sich mit dem Wechsel eine Karte (F30), gehört der Fokus ihr.
    if (offeneKarte === undefined) szeneRef.current?.fokussiereSzene();
  }, [aktuelleSzene]);

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
  const { themengebiete, wissensgebiete, verzeichnis, pfad } = ladezustand;
  const szeneEintrag = (id: string): Szeneneintrag | undefined => verzeichnis.scenes.find((s) => s.id === id);
  const ebenen: Ebene[] = pfad.map((id) => {
    const eintrag = szeneEintrag(id);
    return {
      id,
      titel: text(eintrag?.title ?? {}, FASSUNG) || id,
      ...(eintrag?.card === undefined ? {} : { eintrittskarte: { gefunden: gefunden.has(eintrag.card) } }),
    };
  });
  const eintrittskarte = szeneEintrag(pfad[pfad.length - 1]!)?.card;
  const finde = (id: string): Hotspot | undefined => datei.hotspots.find((h) => h.id === id);

  function loeseAus(hotspot: Hotspot): void {
    if (hotspot.action === 'scene' && hotspot.target !== undefined) {
      const ziel = hotspot.target;
      const eintrag = szeneEintrag(ziel);
      const lage = szeneRef.current?.lageVon(hotspot.id);
      setOffen(undefined);
      if (eintrag === undefined) setWechselFehler(true);
      else void wechsleSzene(eintrag, betreten(pfad, ziel), lage);
      return;
    }
    // `info` hat nur den Hinweis (F24).
    if (hotspot.action !== 'card' || hotspot.target === undefined) return;
    zeigeKarte(hotspot.target, { art: 'hotspot', id: hotspot.id });
  }

  /**
   * Öffnet die Karte; beim ersten Mal deckt sie sich auf und gilt als gefunden. Gespeichert wird vor
   * dem Laden der Karte: Der Fund bleibt, auch wenn sie nicht lädt.
   */
  function zeigeKarte(karte: string, fokus: Fokusziel): void {
    const { spielstand: neu, aufdecken } = oeffneKarte(spielstand, karte, new Date().toISOString());
    if (aufdecken) speichere(neu);
    // Mit der Karte ist der Hinweis zu und bleibt es auch danach.
    stoppeSchliesstimer();
    setOffen(undefined);
    setOffeneKarte((bisher) => ({ karte, aufdecken, fokus, nummer: (bisher?.nummer ?? 0) + 1 }));
  }

  function fokussiere(ziel: Fokusziel): void {
    switch (ziel.art) {
      case 'hotspot':
        szeneRef.current?.fokussiere(ziel.id);
        break;
      case 'kartenknopf':
        kartenknopfRef.current?.focus();
        break;
      case 'szene':
        szeneRef.current?.fokussiereSzene();
        break;
    }
  }

  /**
   * Lädt die Zielszene und wechselt dann in sie. Mit `lage` zoomt die Szene vorher auf diese Stelle
   * (F3), außer der Spieler wünscht weniger Bewegung. Scheitert das Laden, bleibt die aktuelle
   * Szene stehen; der Spielstand bleibt unberührt.
   */
  async function wechsleSzene(eintrag: Szeneneintrag, neuerWeg: Pfad, lage?: Rechteck): Promise<void> {
    if (wechselt.current) return;
    wechselt.current = true;
    setWechselFehler(false);
    try {
      const laden = ladeSzene(eintrag);
      const animation = lage === undefined ? undefined : starteZoom(buehneRef.current, lage);
      zoom.current = animation;
      // Scheitert das Laden, springt die Szene beim Abbrechen der Animation zurück.
      const geladen = await laden;
      // Nicht darstellbar: Die aktuelle Szene bleibt, statt dass der Aufbau erst nach dem Wechsel scheitert.
      pruefeSvg(geladen.svg);
      await animation?.finished;
      fokusAufSzene.current = true;
      setOffen(undefined);
      setLadezustand((bisher) => (bisher.art === 'bereit' ? { ...bisher, szene: geladen, pfad: neuerWeg } : bisher));
      // Erstes Betreten: Die Eintrittskarte deckt sich nach dem Wechsel von selbst auf (F30).
      const karte = aufzudeckendeEintrittskarte(verzeichnis, eintrag.id, gefunden);
      if (karte !== undefined) zeigeKarte(karte, { art: 'szene' });
    } catch {
      zoom.current?.cancel();
      zoom.current = undefined;
      setWechselFehler(true);
    } finally {
      wechselt.current = false;
    }
  }

  function geheZurEbene(id: string): void {
    const eintrag = szeneEintrag(id);
    if (eintrag === undefined) setWechselFehler(true);
    else void wechsleSzene(eintrag, kuerzenBis(pfad, id));
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
    fokusZurueck.current = offeneKarte?.fokus;
    setOffeneKarte(undefined);
  }

  function stoppeSchliesstimer(): void {
    window.clearTimeout(schliesstimer.current);
    schliesstimer.current = undefined;
  }

  /** Schließt den Hinweis des Hotspots nach kurzer Verzögerung, falls der Zeiger nicht zurückkehrt. */
  function planeSchliessen(hotspot: string): void {
    stoppeSchliesstimer();
    schliesstimer.current = window.setTimeout(() => {
      schliesstimer.current = undefined;
      setOffen((bisher) => (bisher?.hotspot === hotspot ? undefined : bisher));
    }, SCHLIESS_VERZOEGERUNG_MS);
  }

  /** Öffnet den Hinweis; ein schon offener am Zeigeranker desselben Hotspots bleibt, wo er ist. */
  function oeffneHinweis(hotspot: string, lage: Rechteck, zeiger: Punkt | undefined): void {
    stoppeSchliesstimer();
    setOffen((bisher) =>
      bisher?.hotspot === hotspot && bisher.anker !== undefined && zeiger !== undefined
        ? bisher
        : { hotspot, lage, ...(zeiger === undefined ? {} : { anker: zeiger }) },
    );
  }

  function beimEreignis(ereignis: Szenenereignis): void {
    switch (ereignis.art) {
      case 'betreten':
        if (wechselt.current) break;
        oeffneHinweis(ereignis.hotspot, ereignis.lage, ereignis.zeiger);
        break;
      case 'bewegt': {
        // Der Hinweis läuft nicht mit; erst weit weg vom Anker setzt er sich an den Zeiger.
        const { hotspot, zeiger } = ereignis;
        setOffen((bisher) =>
          bisher?.hotspot === hotspot && bisher.anker !== undefined && sollNeuAnkern(bisher.anker, zeiger)
            ? { ...bisher, anker: zeiger }
            : bisher,
        );
        break;
      }
      case 'verlassen':
        // Die Maus kann in den Hinweis fahren; erst nach kurzer Verzögerung schließt er.
        planeSchliessen(ereignis.hotspot);
        break;
      case 'daneben':
        stoppeSchliesstimer();
        setWechselFehler(false);
        setOffen(undefined);
        break;
      case 'ausgeloest': {
        if (wechselt.current) break;
        setWechselFehler(false);
        oeffneHinweis(ereignis.hotspot, ereignis.lage, ereignis.zeiger);
        const hotspot = finde(ereignis.hotspot);
        if (hotspot !== undefined) loeseAus(hotspot);
        break;
      }
    }
  }

  /**
   * Ändern sich Größe oder Lage der Szene, folgt ein Hinweis an der Begrenzungsbox dem Hotspot. Ein
   * Hinweis am Zeigeranker schließt stattdessen: Der Anker liegt dann nicht mehr auf dem Hotspot.
   */
  function beiLageaenderung(): void {
    setOffen((bisher) => {
      if (bisher?.anker !== undefined) return undefined;
      const lage = bisher && szeneRef.current?.lageVon(bisher.hotspot);
      return bisher && lage ? { ...bisher, lage } : bisher;
    });
  }

  const offenerHotspot = offen && finde(offen.hotspot);
  const meldungen = [
    ...(speichernErlaubt ? [] : [TEXTE.neuereVersion]),
    ...(speichernFehlgeschlagen ? [TEXTE.speichernFehlgeschlagen] : []),
    ...(wechselFehler ? [TEXTE.szeneNichtGeladen] : []),
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
      <Pfadanzeige
        ebenen={ebenen}
        onWaehle={geheZurEbene}
        kartenknopfRef={kartenknopfRef}
        onOeffneEintrittskarte={() => {
          if (!wechselt.current && eintrittskarte !== undefined) zeigeKarte(eintrittskarte, { art: 'kartenknopf' });
        }}
      />
      <main
        ref={buehneRef}
        class="buehne"
        onClick={(e) => {
          // Tippen auf den Rand neben der Szene schließt den Hinweis wie Tippen daneben.
          if (!(e.target instanceof Element) || e.target.closest('.szene') === null) setOffen(undefined);
        }}
      >
        <Szenenansicht
          svg={svg}
          titel={text(datei.title, FASSUNG)}
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
        <Hinweis
          inhalt={hinweisinhalt(offenerHotspot, gefunden, FASSUNG, verzeichnis)}
          ziel={offen.lage}
          anker={offen.anker}
          onMausEin={stoppeSchliesstimer}
          onMausAus={() => planeSchliessen(offen.hotspot)}
          onOeffneKarte={(karte) => {
            if (!wechselt.current) zeigeKarte(karte, { art: 'hotspot', id: offen.hotspot });
          }}
        />
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
  verzeichnis: Inhaltsverzeichnis;
  pfad: Pfad;
  themengebiete: readonly Themengebiet[];
  wissensgebiete: readonly Wissensgebiet[];
}> {
  const verzeichnis = await ladeInhaltsverzeichnis();
  const welt = verzeichnis.worlds[0];
  if (welt === undefined) throw new Startfehler(TEXTE.keineWelt);
  const eintrag = verzeichnis.scenes.find((s) => s.id === welt.start);
  if (eintrag === undefined) throw new Startfehler(TEXTE.startszeneFehlt);
  return {
    szene: await ladeSzene(eintrag),
    verzeichnis,
    pfad: neuerPfad(eintrag.id),
    themengebiete: verzeichnis.topics,
    wissensgebiete: verzeichnis.domains,
  };
}

function alsFehlerzustand(fehler: unknown): Ladezustand {
  if (fehler instanceof Startfehler) return { art: 'fehler', meldung: fehler.message };
  return { art: 'fehler', meldung: TEXTE.inhalteNichtGeladen, detail: fehlertext(fehler) };
}

function fehlertext(fehler: unknown): string | undefined {
  return fehler instanceof Error ? fehler.message : undefined;
}

const ZOOM_DAUER_MS = 450;
/** So viel der Szene füllt das Ziel am Ende des Zooms, höchstens. */
const ZOOM_FUELLUNG = 0.8;
const ZOOM_MAXIMUM = 6;

/**
 * Zoomt die Szene auf die Begrenzungsbox des Hotspots (`lage`, in Bildschirmpixeln) und hält sie
 * dort, bis die Animation abgebrochen wird. `undefined`, wenn nicht animiert wird: bei
 * `prefers-reduced-motion: reduce` gibt es nur den Wechsel.
 */
function starteZoom(buehne: HTMLElement | null, lage: Rechteck): Animation | undefined {
  const szene = buehne?.querySelector('.szene');
  if (!(szene instanceof HTMLElement) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
  const flaeche = szene.getBoundingClientRect();
  // Der Zoom verkleinert nie, auch nicht bei einem Hotspot, der größer ist als die Szene.
  const massstab = Math.max(
    1,
    Math.min(
      ZOOM_MAXIMUM,
      (flaeche.width * ZOOM_FUELLUNG) / Math.max(lage.breite, 1),
      (flaeche.height * ZOOM_FUELLUNG) / Math.max(lage.hoehe, 1),
    ),
  );
  // Der Mittelpunkt des Hotspots wandert in die Mitte der Szene.
  const dx = lage.links + lage.breite / 2 - (flaeche.left + flaeche.width / 2);
  const dy = lage.oben + lage.hoehe / 2 - (flaeche.top + flaeche.height / 2);
  return szene.animate(
    [{ transform: 'none' }, { transform: `translate(${-dx * massstab}px, ${-dy * massstab}px) scale(${massstab})` }],
    { duration: ZOOM_DAUER_MS, easing: 'ease-in', fill: 'forwards' },
  );
}

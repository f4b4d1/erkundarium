// Die Anwendung hält den Zustand zusammen: geladene Szene, Spielstand, offener Hinweis, offene
// Sammlung und Karte und Meldungen. Sie startet immer in der Startszene der ersten Welt (F1).

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { abgehakteHotspots, hinweisinhalt } from '../logik/hinweis.ts';
import type { Inhaltsverzeichnis, Szeneneintrag, Themengebiet, Wissensgebiet } from '../logik/inhaltsverzeichnis.ts';
import { aufzudeckendeEintrittskarte, oeffneKarte } from '../logik/karte-oeffnen.ts';
import { betreten, kuerzenBis, neuerPfad, rueckweg, type Pfad, type Zoomstufe } from '../logik/pfad.ts';
import type { Speicherschicht } from '../logik/speicherschicht.ts';
import { aktiveEinstellungen, einlesen, gefundeneKarten, type Spielstand } from '../logik/spielstand.ts';
import type { Hotspot } from '../logik/szenendatei.ts';
import { STANDARDFASSUNG, text } from '../logik/textfassung.ts';
import { ladeInhaltsverzeichnis, ladeSzene, type GeladeneSzene } from '../inhalte/laden.ts';
import { pruefeSvg, type Punkt, type Rechteck, type Szene, type Szenenereignis } from '../szene/szene.ts';
import { Hinweis } from './hinweis.tsx';
import { Kartenansicht } from './kartenansicht.tsx';
import { Pfadanzeige, type Ebene } from './pfadanzeige.tsx';
import { Sammlung } from './sammlung.tsx';
import { Szenenansicht } from './szenenansicht.tsx';
import { deuteTaste } from './tasten.ts';
import {
  fokusBereit,
  fokusErledigt,
  mitKarte,
  mitSammlung,
  ohneKarte,
  ohneSammlung,
  ueberlagert,
  type Fokusziel,
  type Ueberlagerung,
} from './ueberlagerung.ts';
import { wenigerBewegung } from './bewegung.ts';
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

export function Anwendung({ speicher }: { speicher: Speicherschicht }) {
  const [ladezustand, setLadezustand] = useState<Ladezustand>({ art: 'laedt' });
  const [start] = useState(() => einlesen(speicher.laden()));
  const [spielstand, setSpielstand] = useState<Spielstand>(start.spielstand);
  const speichernErlaubt = start.art !== 'neuere-version';
  const [speichernFehlgeschlagen, setSpeichernFehlgeschlagen] = useState(false);
  const [offen, setOffen] = useState<OffenerHinweis | undefined>(undefined);
  const [ueberlagerung, setUeberlagerung] = useState<Ueberlagerung>({});
  const szeneRef = useRef<Szene | undefined>(undefined);
  const buehneRef = useRef<HTMLElement>(null);
  const kartenknopfRef = useRef<HTMLButtonElement>(null);
  const sammlungsknopfRef = useRef<HTMLButtonElement>(null);
  /** Der Kartenknopf im Hinweis, falls einer offen ist und einen trägt. */
  const hinweisknopfRef = useRef<HTMLButtonElement>(null);
  /** Solange der Fokus von der Anwendung zurück an einen Hotspot gelegt wird, öffnet das keinen Hinweis. */
  const fokusOhneHinweis = useRef(false);
  /** Solange ein Wechsel läuft, löst nichts weiteres aus. */
  const wechselt = useRef(false);
  const zoom = useRef<Animation | undefined>(undefined);
  /** Läuft, sobald die nächste Szene gebaut ist und noch bevor sie gezeichnet wird (Herauszoomen). */
  const nachDarstellung = useRef<(() => void) | undefined>(undefined);
  /** Escape und Tab; der Handler sieht immer den aktuellen Zustand. */
  const beiTaste = useRef<(e: KeyboardEvent) => void>(() => {});
  const fokusAufSzene = useRef(false);
  const schliesstimer = useRef<number | undefined>(undefined);
  const [wechselFehler, setWechselFehler] = useState(false);

  useEffect(() => {
    starte().then(
      (geladen) => {
        setLadezustand({ art: 'bereit', ...geladen });
        // Trägt die Startszene eine Eintrittskarte, deckt sie sich nach dem Start auf (F30).
        const karte = aufzudeckendeEintrittskarte(geladen.verzeichnis, geladen.pfad[0]!.szene, gefundeneKarten(start.spielstand));
        if (karte !== undefined) zeigeKarte(karte, { art: 'szene' });
      },
      (fehler: unknown) => setLadezustand(alsFehlerzustand(fehler)),
    );
  }, []);

  useEffect(() => {
    const beiKeydown = (e: KeyboardEvent) => beiTaste.current(e);
    window.addEventListener('keydown', beiKeydown);
    return () => window.removeEventListener('keydown', beiKeydown);
  }, []);

  // Ein ausstehendes Schließen darf nach dem Abbau nichts mehr setzen.
  useEffect(() => () => window.clearTimeout(schliesstimer.current), []);

  // Erst wenn das Ziel wieder erreichbar ist (Kartenansicht aus der Seite, bei Szene und Knopf auch
  // die Sammlung), legt die Anwendung den Fokus dorthin.
  useEffect(() => {
    if (!fokusBereit(ueberlagerung) || ueberlagerung.fokusAusstehend === undefined) return;
    fokussiere(ueberlagerung.fokusAusstehend);
    setUeberlagerung(fokusErledigt);
  }, [ueberlagerung]);

  // Nach dem Wechsel liegt der Fokus auf der Szene; erst jetzt ist die neue Szene gebaut.
  const aktuelleSzene = ladezustand.art === 'bereit' ? ladezustand.szene : undefined;
  useLayoutEffect(() => {
    zoom.current?.cancel();
    zoom.current = undefined;
    nachDarstellung.current?.();
    nachDarstellung.current = undefined;
    if (!fokusAufSzene.current) return;
    fokusAufSzene.current = false;
    // Öffnet sich mit dem Wechsel eine Karte (F30), gehört der Fokus ihr.
    if (!ueberlagert(ueberlagerung)) szeneRef.current?.fokussiereSzene();
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
  const ebenen: Ebene[] = pfad.map(({ szene: id }) => {
    const eintrag = szeneEintrag(id);
    return {
      id,
      titel: text(eintrag?.title ?? {}, FASSUNG) || id,
      ...(eintrag?.card === undefined ? {} : { eintrittskarte: { gefunden: gefunden.has(eintrag.card) } }),
    };
  });
  const eintrittskarte = szeneEintrag(pfad[pfad.length - 1]!.szene)?.card;
  const finde = (id: string): Hotspot | undefined => datei.hotspots.find((h) => h.id === id);

  function loeseAus(hotspot: Hotspot): void {
    if (hotspot.action === 'scene' && hotspot.target !== undefined) {
      const ziel = hotspot.target;
      const eintrag = szeneEintrag(ziel);
      const lage = szeneRef.current?.lageVon(hotspot.id);
      setOffen(undefined);
      if (eintrag === undefined) setWechselFehler(true);
      else void wechsleSzene(eintrag, betreten(pfad, ziel, hotspot.id), lage);
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
    setUeberlagerung((bisher) => mitKarte(bisher, karte, aufdecken, fokus));
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
      case 'sammlungsknopf':
        sammlungsknopfRef.current?.focus();
        break;
      case 'eintrag':
        document.querySelector<HTMLElement>(`.sammlung [data-karte="${CSS.escape(ziel.karte)}"]`)?.focus();
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
      stoppeSchliesstimer();
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

  /**
   * Geht zur früheren Ebene `id` zurück und zoomt dabei Stufe für Stufe aus den Hotspots heraus (F4a).
   * Erst werden alle Szenen des Rückwegs geladen; scheitert eine, bleibt die aktuelle Szene stehen.
   * Bricht später eine Stufe ab, bleibt die zuletzt gezeigte Zwischenebene mit passendem Pfad stehen.
   */
  async function geheZurEbene(id: string): Promise<void> {
    const stufen = rueckweg(pfad, id);
    if (wechselt.current || stufen.length === 0) return;
    wechselt.current = true;
    setWechselFehler(false);
    try {
      // Bei weniger Bewegung gibt es nur den Wechsel zur Zielebene.
      const gezeigt = wenigerBewegung() ? stufen.slice(-1) : stufen;
      const eintraege = gezeigt.map((stufe) => szeneEintrag(stufe.szene));
      if (eintraege.some((e) => e === undefined)) throw new Error('Szene fehlt im Inhaltsverzeichnis.');
      const geladen = await Promise.all(eintraege.map((e) => ladeSzene(e!)));
      for (const g of geladen) pruefeSvg(g.svg);
      for (const [i, stufe] of gezeigt.entries()) {
        const letzte = i === gezeigt.length - 1;
        await zeigeStufe(stufe, geladen[i]!, kuerzenBis(pfad, stufe.szene), letzte ? 'ease-out' : 'linear');
      }
      szeneRef.current?.fokussiere(gezeigt[gezeigt.length - 1]!.hotspot);
    } catch {
      nachDarstellung.current = undefined;
      zoom.current?.cancel();
      zoom.current = undefined;
      setWechselFehler(true);
    } finally {
      wechselt.current = false;
    }
  }

  /** Stellt die Szene der Stufe dar, setzt sie sofort in den Endausschnitt des Zooms und zoomt heraus. */
  async function zeigeStufe(stufe: Zoomstufe, geladen: GeladeneSzene, neuerWeg: Pfad, easing: string): Promise<void> {
    await new Promise<void>((fertig, abbruch) => {
      nachDarstellung.current = () => {
        const lage = szeneRef.current?.lageVon(stufe.hotspot);
        zoom.current = lage === undefined ? undefined : starteHerauszoom(buehneRef.current, lage, easing);
        fertig();
      };
      stoppeSchliesstimer();
      setOffen(undefined);
      setLadezustand((bisher) => {
        if (bisher.art === 'bereit') return { ...bisher, szene: geladen, pfad: neuerWeg };
        // Es wird nicht gerendert, `nachDarstellung` käme nie: der Wechsel bricht ab.
        abbruch(new Error('Keine Szene dargestellt.'));
        return bisher;
      });
    });
    await zoom.current?.finished;
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
    setUeberlagerung(ohneKarte);
  }

  /** Öffnet die Sammlung; der Hinweis ist dann zu und bleibt es. Während eines Wechsels tut das nichts. */
  function oeffneSammlung(): void {
    if (wechselt.current) return;
    stoppeSchliesstimer();
    setOffen(undefined);
    setUeberlagerung((bisher) => mitSammlung(bisher, { art: 'sammlungsknopf' }));
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
      // Solange der Fokus im Kartenknopf liegt oder der Zeiger im Hinweis ist, bleibt der Hinweis offen.
      if (hinweisknopfRef.current !== null && document.activeElement === hinweisknopfRef.current) return;
      if (document.querySelector('.hinweis:hover') !== null) return;
      setOffen((bisher) => (bisher?.hotspot === hotspot ? undefined : bisher));
    }, SCHLIESS_VERZOEGERUNG_MS);
  }

  /** Öffnet den Hinweis; ein schon offener am Zeigeranker desselben Hotspots bleibt, wo er ist. */
  function oeffneHinweis(hotspot: string, lage: Rechteck, zeiger: Punkt | undefined): void {
    stoppeSchliesstimer();
    // Auch ohne Zeiger (Fokus, Taste) bleibt ein vorhandener Anker desselben Hotspots.
    setOffen((bisher) =>
      bisher?.hotspot === hotspot && bisher.anker !== undefined
        ? bisher
        : { hotspot, lage, ...(zeiger === undefined ? {} : { anker: zeiger }) },
    );
  }

  function beimEreignis(ereignis: Szenenereignis): void {
    switch (ereignis.art) {
      case 'betreten':
        if (wechselt.current || fokusOhneHinweis.current) break;
        oeffneHinweis(ereignis.hotspot, ereignis.lage, ereignis.zeiger);
        break;
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

  /** Legt den Fokus an den Hotspot; `mitHinweis` öffnet dabei dessen Hinweis, sonst bleibt er zu. */
  function fokussiereHotspot(id: string, mitHinweis: boolean): void {
    fokusOhneHinweis.current = !mitHinweis;
    try {
      szeneRef.current?.fokussiere(id);
    } finally {
      fokusOhneHinweis.current = false;
    }
  }

  beiTaste.current = (e) => {
    if (e.defaultPrevented) return;
    const knopf = hinweisknopfRef.current;
    const aktion = deuteTaste({
      taste: e.key,
      umschalt: e.shiftKey,
      ueberlagert: ueberlagert(ueberlagerung),
      hinweisOffen: offen !== undefined,
      hatKartenknopf: knopf !== null,
      fokus:
        knopf !== null && document.activeElement === knopf
          ? 'kartenknopf'
          : offen !== undefined && szeneRef.current?.hatFokus(offen.hotspot)
            ? 'hotspot'
            : 'sonst',
    });
    switch (aktion) {
      case 'nichts':
        break;
      case 'ebene-zurueck': {
        const davor = pfad[pfad.length - 2];
        if (davor !== undefined) void geheZurEbene(davor.szene);
        break;
      }
      case 'hinweis-schliessen':
        stoppeSchliesstimer();
        setOffen(undefined);
        break;
      case 'hinweis-schliessen-fokus-zum-hotspot':
        stoppeSchliesstimer();
        if (offen !== undefined) fokussiereHotspot(offen.hotspot, false);
        setOffen(undefined);
        break;
      case 'zum-kartenknopf':
        e.preventDefault();
        knopf?.focus();
        break;
      case 'vom-kartenknopf-weiter':
        // Ohne preventDefault: Tab geht vom Hotspot aus zum nächsten.
        if (offen !== undefined) fokussiereHotspot(offen.hotspot, true);
        break;
      case 'vom-kartenknopf-zurueck':
        e.preventDefault();
        if (offen !== undefined) fokussiereHotspot(offen.hotspot, true);
        break;
    }
  };

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
        onWaehle={(id) => void geheZurEbene(id)}
        kartenknopfRef={kartenknopfRef}
        sammlungsknopfRef={sammlungsknopfRef}
        onOeffneSammlung={oeffneSammlung}
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
      {offen && offenerHotspot && !ueberlagert(ueberlagerung) && (
        <Hinweis
          inhalt={hinweisinhalt(offenerHotspot, gefunden, FASSUNG, verzeichnis)}
          ziel={offen.lage}
          anker={offen.anker}
          onMausEin={stoppeSchliesstimer}
          onMausAus={() => planeSchliessen(offen.hotspot)}
          onOeffneKarte={(karte) => {
            if (!wechselt.current) zeigeKarte(karte, { art: 'hotspot', id: offen.hotspot });
          }}
          kartenknopfRef={hinweisknopfRef}
          onKartenknopfFokusVerloren={() => planeSchliessen(offen.hotspot)}
        />
      )}
      {ueberlagerung.sammlung && (
        <Sammlung
          verzeichnis={verzeichnis}
          gefunden={gefunden}
          fassung={FASSUNG}
          welt={szeneEintrag(pfad[pfad.length - 1]!.szene)?.world ?? ''}
          onOeffneKarte={(karte) => zeigeKarte(karte, { art: 'eintrag', karte })}
          onSchliessen={() => setUeberlagerung(ohneSammlung)}
        />
      )}
      {ueberlagerung.karte && (
        <Kartenansicht
          key={ueberlagerung.karte.nummer}
          karte={ueberlagerung.karte.karte}
          aufdecken={ueberlagerung.karte.aufdecken}
          themengebiete={themengebiete}
          wissensgebiete={wissensgebiete}
          fassung={FASSUNG}
          verzeichnis={verzeichnis}
          gefunden={gefunden}
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

/** Der Endzustand des Zooms auf die Begrenzungsbox `lage` (in Bildschirmpixeln), als `transform` der Szene. */
function zoomEndzustand(szene: HTMLElement, lage: Rechteck): string {
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
  return `translate(${-dx * massstab}px, ${-dy * massstab}px) scale(${massstab})`;
}

/**
 * Zoomt die Szene auf die Begrenzungsbox des Hotspots (`lage`, in Bildschirmpixeln) und hält sie
 * dort, bis die Animation abgebrochen wird. `undefined`, wenn nicht animiert wird: bei
 * `prefers-reduced-motion: reduce` gibt es nur den Wechsel.
 */
function starteZoom(buehne: HTMLElement | null, lage: Rechteck): Animation | undefined {
  const szene = buehne?.querySelector('.szene');
  if (!(szene instanceof HTMLElement) || wenigerBewegung()) return undefined;
  return szene.animate([{ transform: 'none' }, { transform: zoomEndzustand(szene, lage) }], {
    duration: ZOOM_DAUER_MS,
    easing: 'ease-in',
    fill: 'forwards',
  });
}

/**
 * Die Umkehrung von `starteZoom` (F4a): Die Szene steht sofort im Endzustand des Zooms auf `lage`
 * und zoomt auf die volle Ansicht heraus. Gemessen wird mit abgebrochener Animation, also an der
 * vollen Ansicht. `undefined`, wenn nicht animiert wird.
 */
function starteHerauszoom(buehne: HTMLElement | null, lage: Rechteck, easing: string): Animation | undefined {
  const szene = buehne?.querySelector('.szene');
  if (!(szene instanceof HTMLElement) || wenigerBewegung()) return undefined;
  return szene.animate([{ transform: zoomEndzustand(szene, lage) }, { transform: 'none' }], {
    duration: ZOOM_DAUER_MS,
    easing,
  });
}

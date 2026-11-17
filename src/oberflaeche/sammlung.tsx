// Die Sammlung (F13 bis F15): ein modaler Dialog über dem ganzen Spielbereich, auch über der
// Pfadanzeige. Er zeigt den Fortschritt der Welt und gesamt und alle Karten nach Themengebiet;
// gefundene sind Knöpfe, nicht gefundene Schatten ohne Titel. Die Szene bleibt darunter stehen. Die
// Karte öffnet die Anwendung in der Kartenansicht darüber; den Fokus zurück legt sie nach dem Schließen.

import type { CSSProperties } from 'preact';
import { useId, useLayoutEffect, useMemo, useRef } from 'preact/hooks';
import { fortschrittDerWelt, gesamtfortschritt } from '../logik/fortschritt.ts';
import type { Inhaltsverzeichnis } from '../logik/inhaltsverzeichnis.ts';
import { sammlungsinhalt } from '../logik/sammlung.ts';
import { text } from '../logik/textfassung.ts';
import { symbolPfad } from '../inhalte/laden.ts';
import { Symbol } from './kartenseiten.tsx';
import { TEXTE } from './texte.ts';

interface Eigenschaften {
  verzeichnis: Inhaltsverzeichnis;
  gefunden: ReadonlySet<string>;
  fassung: string;
  /** Die Welt der aktuellen Szene; ihr Fortschritt steht neben dem Gesamtfortschritt. */
  welt: string;
  onOeffneKarte: (karte: string) => void;
  onSchliessen: () => void;
}

export function Sammlung({ verzeichnis, gefunden, fassung, welt, onOeffneKarte, onSchliessen }: Eigenschaften) {
  const kennung = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const schliessen = useRef<HTMLButtonElement>(null);
  const gruppen = useMemo(() => sammlungsinhalt(verzeichnis, gefunden, fassung), [verzeichnis, gefunden, fassung]);
  const weltTitel = text(verzeichnis.worlds.find((w) => w.id === welt)?.title ?? {}, fassung) || welt;

  useLayoutEffect(() => {
    const element = dialog.current;
    if (element === null) return;
    element.showModal();
    // Der Fokus beginnt im Kopf, nicht beim ersten Eintrag: Die Sammlung wird nicht vorgescrollt.
    schliessen.current?.focus();
    return () => element.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      class="sammlung"
      aria-label={TEXTE.sammlung.name}
      onCancel={(e) => {
        // Escape schließt die Sammlung; ist eine Karte darüber offen, bekommt sie das Ereignis.
        e.preventDefault();
        onSchliessen();
      }}
      // Schließt der Browser den Dialog selbst, soll die Anwendung ihn nicht weiter für offen halten;
      // `ohneSammlung` ist wiederholt aufrufbar, das close aus dem Aufräumen schadet also nicht.
      onClose={onSchliessen}
    >
      <header class="sammlung-kopf">
        <h2 class="sammlung-titel">{TEXTE.sammlung.name}</h2>
        <div class="sammlung-fortschritt">
          <p>
            <span class="sammlung-fortschritt-name">{weltTitel}</span> {TEXTE.stand(fortschrittDerWelt(verzeichnis, welt, gefunden))}
          </p>
          <p>
            <span class="sammlung-fortschritt-name">{TEXTE.sammlung.gesamt}</span> {TEXTE.stand(gesamtfortschritt(verzeichnis, gefunden))}
          </p>
        </div>
        <button ref={schliessen} type="button" class="kartenknopf sammlung-schliessen" onClick={onSchliessen}>
          <svg class="knopf-symbol" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6,6L18,18M18,6L6,18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
          </svg>
          <span>{TEXTE.sammlung.schliessen}</span>
        </button>
      </header>
      <div class="sammlung-inhalt">
        {gruppen.map((gruppe) => (
          <section class="sammlung-gruppe" key={gruppe.id} aria-labelledby={`${kennung}-${gruppe.id}`}>
            <h3 class="sammlung-gruppentitel" id={`${kennung}-${gruppe.id}`}>
              {gruppe.titel}
            </h3>
            <ul
              class="sammlung-karten"
              style={gruppe.farbe === undefined ? undefined : ({ '--gebietsfarbe': gruppe.farbe } as CSSProperties)}
            >
              {gruppe.karten.map((karte) => (
                <li key={karte.id}>
                  {karte.gefunden ? (
                    <button type="button" class="sammlung-eintrag" data-karte={karte.id} onClick={() => onOeffneKarte(karte.id)}>
                      <span class="sammlung-eintrag-innen">
                        <Symbol pfad={symbolPfad(gruppe.symbol)} />
                        <span class="sammlung-eintrag-titel">{karte.titel}</span>
                      </span>
                    </button>
                  ) : (
                    <span class="sammlung-schatten" role="img" aria-label={TEXTE.sammlung.nichtGefunden} />
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </dialog>
  );
}

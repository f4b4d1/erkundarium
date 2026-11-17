// Die Pfadanzeige (F4): der Weg von der Startszene zur aktuellen Szene. Frühere Ebenen sind
// Knöpfe, die aktuelle ist nur beschriftet und mit `aria-current` markiert. Trägt sie eine
// Eintrittskarte, steht daneben der Kartenknopf (F31). Rechts außen öffnet der Sammlungsknopf die
// Sammlung (F14).

import type { Ref } from 'preact';
import { SymbolKarte, SymbolSammlung } from './symbole.tsx';
import { TEXTE } from './texte.ts';

export interface Ebene {
  id: string;
  titel: string;
  /** Die Eintrittskarte der Szene, falls sie eine trägt. */
  eintrittskarte?: { gefunden: boolean };
}

interface Eigenschaften {
  ebenen: readonly Ebene[];
  onWaehle: (id: string) => void;
  onOeffneEintrittskarte: () => void;
  /** Für den Fokus, wenn die Karte zugeht. */
  kartenknopfRef: Ref<HTMLButtonElement>;
  onOeffneSammlung: () => void;
  /** Für den Fokus, wenn die Sammlung zugeht. */
  sammlungsknopfRef: Ref<HTMLButtonElement>;
}

export function Pfadanzeige({
  ebenen,
  onWaehle,
  onOeffneEintrittskarte,
  kartenknopfRef,
  onOeffneSammlung,
  sammlungsknopfRef,
}: Eigenschaften) {
  return (
    <nav class="pfad" aria-label={TEXTE.pfad}>
      <ol>
        {ebenen.map((ebene, i) => (
          <li key={ebene.id}>
            {i > 0 && (
              <span class="pfad-trenner" aria-hidden="true">
                ›
              </span>
            )}
            {i === ebenen.length - 1 ? (
              <>
                <span class="pfad-aktuell" aria-current="page">
                  {ebene.titel}
                </span>
                {ebene.eintrittskarte !== undefined && (
                  <button
                    ref={kartenknopfRef}
                    type="button"
                    class="pfad-karte"
                    aria-label={TEXTE.eintrittskarteOeffnen}
                    onClick={onOeffneEintrittskarte}
                  >
                    <SymbolKarte gefunden={ebene.eintrittskarte.gefunden} />
                  </button>
                )}
              </>
            ) : (
              <button type="button" class="pfad-ebene" onClick={() => onWaehle(ebene.id)}>
                {ebene.titel}
              </button>
            )}
          </li>
        ))}
      </ol>
      <button
        ref={sammlungsknopfRef}
        type="button"
        class="pfad-sammlung"
        aria-label={TEXTE.sammlung.oeffnen}
        onClick={onOeffneSammlung}
      >
        <SymbolSammlung />
      </button>
    </nav>
  );
}

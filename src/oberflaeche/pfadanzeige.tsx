// Die Pfadanzeige (F4): der Weg von der Startszene zur aktuellen Szene. Frühere Ebenen sind
// Knöpfe, die aktuelle ist nur beschriftet und mit `aria-current` markiert. Trägt sie eine
// Eintrittskarte, steht daneben der Kartenknopf (F31).

import { SymbolKarte } from './symbole.tsx';
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
}

export function Pfadanzeige({ ebenen, onWaehle, onOeffneEintrittskarte }: Eigenschaften) {
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
    </nav>
  );
}

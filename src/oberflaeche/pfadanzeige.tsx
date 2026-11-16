// Die Pfadanzeige (F4): der Weg von der Startszene zur aktuellen Szene. Frühere Ebenen sind
// Knöpfe, die aktuelle ist nur beschriftet und mit `aria-current` markiert.

import { TEXTE } from './texte.ts';

export interface Ebene {
  id: string;
  titel: string;
}

export function Pfadanzeige({ ebenen, onWaehle }: { ebenen: readonly Ebene[]; onWaehle: (id: string) => void }) {
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
              <span class="pfad-aktuell" aria-current="page">
                {ebene.titel}
              </span>
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

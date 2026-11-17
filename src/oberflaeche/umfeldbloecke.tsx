// Die zwei Blöcke unter der Karte (F16): „Zu finden in“ als Text und die Beziehungen. Gefundene
// Nachbarkarten sind Knöpfe, nicht gefundene Schatten ohne Titel und ohne Fokus.

import { useId } from 'preact/hooks';
import type { Kartenumfeld } from '../logik/kartenumfeld.ts';
import { TEXTE } from './texte.ts';

interface Eigenschaften {
  umfeld: Kartenumfeld;
  onOeffne: (karte: string) => void;
}

export function Umfeldbloecke({ umfeld, onOeffne }: Eigenschaften) {
  const kennung = useId();
  const { fundorte, beziehungen } = umfeld;
  return (
    <div class="kartenumfeld">
      {fundorte.length > 0 && (
        <section class="umfeldblock" aria-labelledby={`${kennung}-fundorte`}>
          <h3 class="umfeldtitel" id={`${kennung}-fundorte`}>
            {TEXTE.umfeld.zuFindenIn}
          </h3>
          <p class="fundorte">{fundorte.join(', ')}</p>
        </section>
      )}
      {beziehungen.length > 0 && (
        <section class="umfeldblock" aria-labelledby={`${kennung}-beziehungen`}>
          <h3 class="umfeldtitel" id={`${kennung}-beziehungen`}>
            {TEXTE.umfeld.beziehungen}
          </h3>
          {beziehungen.map((gruppe, i) => (
            <div class="beziehungsgruppe" key={i}>
              <h4 class="gruppentitel">{gruppe.bezeichnung}</h4>
              <ul class="nachbarn">
                {gruppe.karten.map((nachbar) => (
                  <li key={nachbar.id}>
                    {nachbar.gefunden ? (
                      <button type="button" class="nachbarknopf" onClick={() => onOeffne(nachbar.id)}>
                        {nachbar.titel}
                      </button>
                    ) : (
                      <span class="nachbar-schatten" role="img" aria-label={TEXTE.umfeld.nichtGefunden} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

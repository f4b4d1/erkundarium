// Symbole der Oberfläche, die an mehreren Stellen vorkommen.

import { HAKEN_PFAD, HAKEN_RADIUS, HAKENFARBE, KONTUR, WEISS } from '../szene/haken.ts';

/** Der Haken im Kartensymbol: Radius 6 statt `HAKEN_RADIUS`, Striche 1,5 und 1,8 breit. */
const HAKEN_MASSSTAB = 6 / HAKEN_RADIUS;

export function SymbolKarte({ gefunden }: { gefunden: boolean }) {
  return (
    <svg class="symbol" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" fill={gefunden ? WEISS : '#6B7785'} stroke={KONTUR} stroke-width="2" />
      {gefunden && (
        <g transform={`translate(17 17) scale(${HAKEN_MASSSTAB})`}>
          <circle r={HAKEN_RADIUS} fill={HAKENFARBE} stroke={KONTUR} stroke-width={1.5 / HAKEN_MASSSTAB} />
          <path
            d={HAKEN_PFAD}
            fill="none"
            stroke={WEISS}
            stroke-width={1.8 / HAKEN_MASSSTAB}
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
      )}
    </svg>
  );
}

/** Der Stapel Karten für die Sammlung: eine hintere Karte, eine vordere. */
export function SymbolSammlung() {
  return (
    <svg class="symbol" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="2.5" width="12" height="16" rx="2" transform="rotate(10 15 10.5)" fill="#6B7785" stroke={KONTUR} stroke-width="2" />
      <rect x="3.5" y="5.5" width="12" height="16" rx="2" fill={WEISS} stroke={KONTUR} stroke-width="2" />
    </svg>
  );
}

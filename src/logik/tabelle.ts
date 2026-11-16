// Die Zeilen eines Tabellen-Bausteins, wie die Karte sie zeigt (Spec Abschnitt 6).

export interface GeteilteTabelle {
  kopf: string[];
  rumpf: string[][];
}

/**
 * Teilt die Zeilen in Kopfzeile (die erste) und Rumpf. Kürzere Zeilen werden mit leeren Zellen auf
 * die Länge der längsten aufgefüllt, damit jede Zeile gleich viele Spalten hat.
 */
export function teileTabelle(zeilen: readonly (readonly string[])[]): GeteilteTabelle {
  const spalten = Math.max(0, ...zeilen.map((z) => z.length));
  const aufgefuellt = (zeile: readonly string[]) => Array.from({ length: spalten }, (_, i) => zeile[i] ?? '');
  const [kopf = [], ...rumpf] = zeilen;
  return { kopf: aufgefuellt(kopf), rumpf: rumpf.map(aufgefuellt) };
}

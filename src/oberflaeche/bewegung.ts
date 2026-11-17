/** Hat der Nutzer im Betriebssystem „Bewegung reduzieren“ eingestellt? */
export function wenigerBewegung(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

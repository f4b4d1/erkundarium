// Kommandozeile: node tools/pruefen.ts [entwickeln|veroeffentlichen]
// Rückgabecode 1 bei Fehlern, 2 bei falschem Aufruf.
import { formatiereBericht } from './bericht.ts';
import { pruefeInhaltsordner } from './inhaltsordner.ts';
import { INHALTSORDNER } from './pfade.ts';
import type { Stufe } from './pruefung.ts';

const stufe = process.argv[2] ?? 'entwickeln';
if (stufe !== 'entwickeln' && stufe !== 'veroeffentlichen') {
  console.error(`Unbekannte Stufe „${stufe}“. Erlaubt: entwickeln, veroeffentlichen.`);
  process.exit(2);
}

const bericht = pruefeInhaltsordner(INHALTSORDNER, stufe as Stufe);
for (const zeile of formatiereBericht(bericht, stufe as Stufe, 'content/')) console.log(zeile);
process.exitCode = bericht.fehler.length > 0 ? 1 : 0;

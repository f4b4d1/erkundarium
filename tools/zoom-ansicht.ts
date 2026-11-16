// Kommandozeile: npm run zoomansicht -- <quelle.svg> <ziel.svg> <x> <y> <breite> [koerperAb]
//
// Schreibt das Grundgerüst einer Zoom-Ansicht: alle Elemente der Quellszene im Ausschnitt ab (x, y)
// mit der angegebenen Breite (Höhe 16 : 9), umgerechnet auf 1600 × 900 (siehe zoom-ausschnitt.ts).
// Den Ausschnitt liefert der Zoom auf die Begrenzungsbox des Zoom-Hotspots (`starteZoom` in
// src/oberflaeche/anwendung.tsx). Striche ab `koerperAb` (Standard 19) gelten als Körpermaß.
// Rückgabecode 2 bei falschem Aufruf.
import fs from 'node:fs';
import { rechneUm } from './zoom-ausschnitt.ts';

const [quelle, ziel, x, y, breite, koerperAb = '19'] = process.argv.slice(2);
const zahlen = [x, y, breite, koerperAb].map(Number);
if (!quelle || !ziel || zahlen.some((n) => !Number.isFinite(n)) || Number(breite) <= 0) {
  console.error('Aufruf: npm run zoomansicht -- <quelle.svg> <ziel.svg> <x> <y> <breite> [koerperAb]');
  process.exit(2);
}
const [ax, ay, ab, ka] = zahlen as [number, number, number, number];
const text = rechneUm(fs.readFileSync(quelle, 'utf8'), { x: ax, y: ay, breite: ab }, { koerperAb: ka });
fs.writeFileSync(ziel, text);
const gruppen = [...text.matchAll(/<g id="([^"]+)"/g)].map((m) => m[1]);
console.log(`Faktor ${(1600 / ab).toFixed(3)}, ${(text.match(/<(rect|circle|ellipse|path)\b/g) ?? []).length} Elemente`);
console.log(`Gruppen: ${gruppen.join(', ')}`);

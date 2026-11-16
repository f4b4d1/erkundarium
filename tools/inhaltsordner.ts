// Einlesen des Inhaltsordners. Die Prüfregeln selbst stehen ohne Dateisystem in pruefung.ts.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pruefeInhalte, type Pruefbericht, type Stufe } from './pruefung.ts';
import { ladeSchemas } from './schema.ts';

/** Liest alle JSON- und SVG-Dateien des Ordners; Schlüssel ist der Pfad relativ zum Ordner mit `/`. */
export function leseInhaltsordner(ordner: string): Record<string, string> {
  const dateien: Record<string, string> = {};
  for (const pfad of readdirSync(ordner, { recursive: true, encoding: 'utf8' })) {
    if (!/\.(json|svg)$/.test(pfad)) continue;
    dateien[pfad.replaceAll('\\', '/')] = readFileSync(join(ordner, pfad), 'utf8');
  }
  return dateien;
}

/**
 * Prüft den Inhaltsordner in der Stufe gegen die Schemas unter `<ordner>/schema/` und erzeugt das
 * Inhaltsverzeichnis. Liest Dateien und Schemas bei jedem Aufruf neu.
 */
export function pruefeInhaltsordner(ordner: string, stufe: Stufe): Pruefbericht {
  return pruefeInhalte(leseInhaltsordner(ordner), stufe, ladeSchemas(join(ordner, 'schema')));
}

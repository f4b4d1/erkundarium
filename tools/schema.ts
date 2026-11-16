import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';

export type SchemaName = 'world' | 'scene' | 'card' | 'domains' | 'topics' | 'relations' | 'limits';

export interface Pruefergebnis {
  gueltig: boolean;
  fehler: string[];
}

/** Prüft ein Objekt gegen das Schema `<name>.schema.json`. */
export type Schemapruefung = (name: SchemaName, daten: unknown) => Pruefergebnis;

/**
 * Liest alle `*.schema.json` des Ordners und gibt eine Prüfung gegen genau diesen Stand zurück.
 * Kein Zwischenspeicher: Wer einen neuen Stand braucht, ruft die Funktion erneut auf.
 */
export function ladeSchemas(schemaOrdner: string): Schemapruefung {
  // strictRequired aus: `required: ["de"]` neben patternProperties und `not: { required }` sind gewollt.
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
  for (const datei of readdirSync(schemaOrdner)) {
    if (!datei.endsWith('.schema.json')) continue;
    const schema = JSON.parse(readFileSync(join(schemaOrdner, datei), 'utf8'));
    ajv.addSchema(schema, datei);
  }
  return (name, daten) => {
    const validiere = ajv.getSchema(`${name}.schema.json`);
    if (!validiere) throw new Error(`Schema ${name}.schema.json nicht gefunden`);
    const gueltig = validiere(daten) as boolean;
    const fehler = (validiere.errors ?? []).map((f) => `${f.instancePath || '/'}: ${f.message ?? f.keyword}`);
    return { gueltig, fehler };
  };
}

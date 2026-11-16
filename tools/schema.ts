import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020';

export type SchemaName = 'world' | 'scene' | 'card' | 'topics' | 'relations' | 'limits';

export interface Pruefergebnis {
  gueltig: boolean;
  fehler: string[];
}

const schemaOrdner = fileURLToPath(new URL('../content/schema/', import.meta.url));

let ajv: Ajv2020 | undefined;

function ladeSchemas(): Ajv2020 {
  if (ajv) return ajv;
  // strictRequired aus: `required: ["de"]` neben patternProperties und `not: { required }` sind gewollt.
  const neu = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
  for (const datei of readdirSync(schemaOrdner)) {
    if (!datei.endsWith('.schema.json')) continue;
    const schema = JSON.parse(readFileSync(join(schemaOrdner, datei), 'utf8'));
    neu.addSchema(schema, datei);
  }
  ajv = neu;
  return neu;
}

/** Prüft ein Objekt gegen das Schema `content/schema/<name>.schema.json`. */
export function pruefe(name: SchemaName, daten: unknown): Pruefergebnis {
  const validiere = ladeSchemas().getSchema(`${name}.schema.json`);
  if (!validiere) throw new Error(`Schema ${name}.schema.json nicht gefunden`);
  const gueltig = validiere(daten) as boolean;
  const fehler = (validiere.errors ?? []).map(
    (f) => `${f.instancePath || '/'}: ${f.message ?? f.keyword}`,
  );
  return { gueltig, fehler };
}

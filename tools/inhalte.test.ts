import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { pruefe, type SchemaName } from './schema';

const inhalt = new URL('../content/', import.meta.url);

function lies(pfad: string): unknown {
  return JSON.parse(readFileSync(new URL(pfad, inhalt), 'utf8'));
}

function erwarteGueltig(name: SchemaName, pfad: string) {
  const ergebnis = pruefe(name, lies(pfad));
  expect(ergebnis.fehler).toEqual([]);
  expect(ergebnis.gueltig).toBe(true);
}

describe('Inhaltsdateien entsprechen ihrem Schema', () => {
  it.each([
    ['topics', 'topics.json'],
    ['relations', 'relations.json'],
    ['limits', 'limits.json'],
  ] as const)('%s', (name, pfad) => erwarteGueltig(name, pfad));

  const karten = readdirSync(new URL('cards/', inhalt)).filter((datei) => datei.endsWith('.json'));

  it.each(karten)('Karte %s', (datei) => erwarteGueltig('card', `cards/${datei}`));
});

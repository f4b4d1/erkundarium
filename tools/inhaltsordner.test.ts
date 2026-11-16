import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { pruefeInhaltsordner } from './inhaltsordner.ts';
import { INHALTSORDNER } from './pfade.ts';

let ordner: string | undefined;

afterEach(() => {
  if (ordner) rmSync(ordner, { recursive: true, force: true });
  ordner = undefined;
});

function legeAn(dateien: Record<string, unknown>): string {
  ordner = mkdtempSync(join(tmpdir(), 'erkundarium-'));
  cpSync(join(INHALTSORDNER, 'schema'), join(ordner, 'schema'), { recursive: true });
  for (const [pfad, wert] of Object.entries(dateien)) {
    const ziel = join(ordner, pfad);
    mkdirSync(dirname(ziel), { recursive: true });
    writeFileSync(ziel, typeof wert === 'string' ? wert : JSON.stringify(wert));
  }
  return ordner;
}

const grundinhalt = {
  'domains.json': [{ id: 'wissen-a', title: { de: 'Wissen A' }, color: '#112233' }],
  'topics.json': [{ id: 'gebiet-a', title: { de: 'Gebiet A' }, domain: 'wissen-a', icon: 'gebiet-a.svg' }],
  'relations.json': [],
  'limits.json': {
    maxTitleLength: 40,
    frontText: { min: 300, max: 400 },
    maxBackTextLength: 250,
    maxFunfactLength: 160,
    maxItemLength: 100,
    maxBlocksFront: 1,
    maxBlocksBack: 3,
    maxTableColumns: 2,
    maxTableRows: 4,
    maxSources: 3,
  },
  'worlds/welt-a/world.json': { id: 'welt-a', title: { de: 'Welt A' }, start: 'szene-a' },
  'worlds/welt-a/scenes/szene-a.json': {
    id: 'szene-a',
    type: 'ansicht',
    title: { de: 'Szene A' },
    hotspots: [{ id: 'ding-1', action: 'card', target: 'karte-x', label: { de: 'Ding 1' } }],
  },
  'worlds/welt-a/scenes/szene-a.svg': '<svg viewBox="0 0 1600 900"><g data-hotspot="ding-1"/></svg>',
};

describe('pruefeInhaltsordner', () => {
  it('liest alle Inhaltsdateien des Ordners ein und prüft sie', () => {
    const bericht = pruefeInhaltsordner(legeAn(grundinhalt), 'entwickeln');
    expect(bericht.fehler).toEqual([
      {
        datei: 'worlds/welt-a/scenes/szene-a.json',
        regel: 'hotspot-ziel',
        text: 'Der Hotspot „ding-1“ zeigt auf die Karte „karte-x“, die es nicht gibt.',
      },
    ]);
    expect(bericht.verzeichnis.scenes.map((s) => s.id)).toEqual(['szene-a']);
  });

  it('prüft gegen die Schemas im Ordner und liest sie bei jedem Aufruf neu', () => {
    const ordner = legeAn(grundinhalt);
    const regeln = () => pruefeInhaltsordner(ordner, 'entwickeln').fehler.map((m) => `${m.datei} ${m.regel}`);
    expect(regeln()).not.toContain('worlds/welt-a/world.json schema');

    const pfad = join(ordner, 'schema', 'world.schema.json');
    const schema = JSON.parse(readFileSync(pfad, 'utf8'));
    schema.required.push('neu');
    schema.properties.neu = { type: 'string' };
    writeFileSync(pfad, JSON.stringify(schema));
    expect(regeln()).toContain('worlds/welt-a/world.json schema');
  });
});

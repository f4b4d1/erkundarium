import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { pruefeInhaltsordner } from './inhaltsordner.ts';

let ordner: string | undefined;

afterEach(() => {
  if (ordner) rmSync(ordner, { recursive: true, force: true });
  ordner = undefined;
});

function legeAn(dateien: Record<string, unknown>): string {
  ordner = mkdtempSync(join(tmpdir(), 'erkundarium-'));
  for (const [pfad, wert] of Object.entries(dateien)) {
    const ziel = join(ordner, pfad);
    mkdirSync(dirname(ziel), { recursive: true });
    writeFileSync(ziel, typeof wert === 'string' ? wert : JSON.stringify(wert));
  }
  return ordner;
}

const grundinhalt = {
  'topics.json': [{ id: 'gebiet-a', title: { de: 'Gebiet A' }, color: '#112233', icon: 'gebiet-a.svg' }],
  'relations.json': [],
  'limits.json': { maxTitleLength: 40, maxTextLength: 300, maxItemLength: 100, maxBlocksPerSide: 4 },
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
});

import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { pruefe, type SchemaName } from './schema';

const inhalt = new URL('../content/', import.meta.url);

function lies(pfad: string): unknown {
  return JSON.parse(readFileSync(new URL(pfad, inhalt), 'utf8'));
}

const welten = readdirSync(new URL('worlds/', inhalt));

/** Pfade relativ zu content/ ohne Endung, z. B. `worlds/fabrik/scenes/fabrikhalle`. */
const szenen = welten.flatMap((welt) =>
  readdirSync(new URL(`worlds/${welt}/scenes/`, inhalt))
    .filter((datei) => datei.endsWith('.json'))
    .map((datei) => `worlds/${welt}/scenes/${datei.slice(0, -'.json'.length)}`),
);

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

  it.each(welten)('Welt %s', (welt) => erwarteGueltig('world', `worlds/${welt}/world.json`));

  it.each(szenen)('Szene %s', (pfad) => erwarteGueltig('scene', `${pfad}.json`));
});

// Einfache Textsuche; das spätere Prüfskript übernimmt diese Prüfungen.
describe('Szenen-SVGs', () => {
  it.each(szenen)('%s: Hotspots in JSON und SVG stimmen überein', (pfad) => {
    const szene = lies(`${pfad}.json`) as { hotspots: { id: string }[] };
    const svg = readFileSync(new URL(`${pfad}.svg`, inhalt), 'utf8');
    const ausSvg = [...svg.matchAll(/data-hotspot="([^"]*)"/g)].map((t) => t[1]);
    const ausJson = szene.hotspots.map((h) => h.id);
    expect(new Set(ausJson).size).toBe(ausJson.length);
    expect(new Set(ausSvg).size).toBe(ausSvg.length);
    expect([...ausJson].sort()).toEqual([...ausSvg].sort());
  });

  // design-guidelines.md, Abschnitt 1, Regel 2, dazu aria-label
  const verboten: [string, RegExp][] = [
    ['<script>', /<script[\s>/]/i],
    ['<style>', /<style[\s>/]/i],
    ['<text>', /<text[\s>/]/i],
    ['<title>', /<title[\s>/]/i],
    ['<image>', /<image[\s>/]/i],
    ['Filter', /<filter[\s>/]|\sfilter\s*=/i],
    ['Verlauf', /<(linear|radial)Gradient[\s>/]/i],
    ['externer Verweis', /href\s*=\s*"(?!#)|url\(\s*['"]?(?!#)/i],
    ['aria-label', /aria-label/i],
  ];

  it.each(szenen)('%s: keine verbotenen Elemente', (pfad) => {
    const svg = readFileSync(new URL(`${pfad}.svg`, inhalt), 'utf8');
    const gefunden = verboten.filter(([, muster]) => muster.test(svg)).map(([name]) => name);
    expect(gefunden).toEqual([]);
  });
});

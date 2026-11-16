import { describe, expect, it } from 'vitest';
import { abgehakteHotspots, hinweisinhalt } from './hinweis.ts';
import type { Hotspot } from './szenendatei.ts';

const karte: Hotspot = { id: 'ding-1', action: 'card', target: 'karte-a', label: { de: 'Ding 1' }, hint: { de: 'Erklärung 1' } };
const karteOhneErklaerung: Hotspot = { id: 'ding-2', action: 'card', target: 'karte-a', label: { de: 'Ding 2' } };
const info: Hotspot = { id: 'ding-3', action: 'info', label: { de: 'Ding 3', en: 'Thing 3' }, hint: { de: 'Erklärung 3' } };
const zoom: Hotspot = { id: 'ding-4', action: 'scene', target: 'szene-b', label: { de: 'Ding 4' }, hint: { de: 'Erklärung 4' } };
const zoomOhneErklaerung: Hotspot = { id: 'ding-5', action: 'scene', target: 'szene-b', label: { de: 'Ding 5' } };
const andereKarte: Hotspot = { id: 'ding-6', action: 'card', target: 'karte-b', label: { de: 'Ding 6' } };

const gefunden = (...ids: string[]): ReadonlySet<string> => new Set(ids);

describe('hinweisinhalt', () => {
  it('zeigt bei einer nicht gefundenen Karte nur den Namen, nicht die Erklärung', () => {
    expect(hinweisinhalt(karte, gefunden(), 'de')).toEqual({ name: 'Ding 1', aktion: 'card', gefunden: false });
  });

  it('zeigt bei einer gefundenen Karte Name und Erklärung', () => {
    expect(hinweisinhalt(karte, gefunden('karte-a'), 'de')).toEqual({
      name: 'Ding 1',
      erklaerung: 'Erklärung 1',
      aktion: 'card',
      gefunden: true,
    });
  });

  it('zeigt bei einer gefundenen Karte ohne Erklärung nur den Namen', () => {
    expect(hinweisinhalt(karteOhneErklaerung, gefunden('karte-a'), 'de')).toEqual({
      name: 'Ding 2',
      aktion: 'card',
      gefunden: true,
    });
  });

  it('zeigt bei info und scene die Erklärung immer', () => {
    expect(hinweisinhalt(info, gefunden(), 'de')).toEqual({ name: 'Ding 3', erklaerung: 'Erklärung 3', aktion: 'info' });
    expect(hinweisinhalt(zoom, gefunden(), 'de')).toEqual({ name: 'Ding 4', erklaerung: 'Erklärung 4', aktion: 'scene' });
  });

  it('lässt die Erklärung weg, wenn ein Zoom-Hotspot keine hat', () => {
    expect(hinweisinhalt(zoomOhneErklaerung, gefunden(), 'de')).toEqual({ name: 'Ding 5', aktion: 'scene' });
  });

  it('liest die Texte in der gewählten Fassung und fällt auf de zurück', () => {
    expect(hinweisinhalt(info, gefunden(), 'en')).toEqual({ name: 'Thing 3', erklaerung: 'Erklärung 3', aktion: 'info' });
  });
});

describe('abgehakteHotspots', () => {
  const hotspots = [karte, karteOhneErklaerung, info, zoom, andereKarte];

  it('hakt alle Hotspots gefundener Karten ab und sonst keine', () => {
    expect(abgehakteHotspots(hotspots, gefunden('karte-a', 'szene-b'), { showMarkers: true })).toEqual(
      new Set(['ding-1', 'ding-2']),
    );
  });

  it('hakt nichts ab, solange keine Karte gefunden ist', () => {
    expect(abgehakteHotspots(hotspots, gefunden(), { showMarkers: true })).toEqual(new Set());
  });

  it('hakt nichts ab, wenn die Haken ausgeblendet sind', () => {
    expect(abgehakteHotspots(hotspots, gefunden('karte-a', 'karte-b'), { showMarkers: false })).toEqual(new Set());
  });
});

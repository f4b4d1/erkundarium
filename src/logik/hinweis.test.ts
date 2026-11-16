import { describe, expect, it } from 'vitest';
import { abgehakteHotspots, hinweisinhalt, karteGefunden } from './hinweis.ts';
import type { Hotspot } from './szenendatei.ts';
import { testverzeichnis } from './testverzeichnis.ts';

const karte: Hotspot = { id: 'ding-1', action: 'card', target: 'karte-a', label: { de: 'Ding 1' }, hint: { de: 'Erklärung 1' } };
const karteOhneErklaerung: Hotspot = { id: 'ding-2', action: 'card', target: 'karte-a', label: { de: 'Ding 2' } };
const info: Hotspot = { id: 'ding-3', action: 'info', label: { de: 'Ding 3', en: 'Thing 3' }, hint: { de: 'Erklärung 3' } };
const zoom: Hotspot = { id: 'ding-4', action: 'scene', target: 'szene-b', label: { de: 'Ding 4' }, hint: { de: 'Erklärung 4' } };
const zoomOhneErklaerung: Hotspot = { id: 'ding-5', action: 'scene', target: 'szene-b', label: { de: 'Ding 5' } };
const andereKarte: Hotspot = { id: 'ding-6', action: 'card', target: 'karte-b', label: { de: 'Ding 6' } };

const gefunden = (...ids: string[]): ReadonlySet<string> => new Set(ids);

const verzeichnis = testverzeichnis({
  welten: { 'welt-a': 'szene-a' },
  szenen: {
    'szene-a': { zoom: ['szene-b'] },
    'szene-b': { eintrittskarte: 'karte-a', karten: ['karte-b'], zoom: ['szene-c'] },
    'szene-c': { karten: ['karte-c', 'karte-d'] },
    'szene-leer': { infos: 1 },
  },
  karten: ['karte-a', 'karte-b', 'karte-c', 'karte-d'],
})

const zoomLeer: Hotspot = { id: 'ding-7', action: 'scene', target: 'szene-leer', label: { de: 'Ding 7' } }
const zoomUnbekannt: Hotspot = { id: 'ding-8', action: 'scene', target: 'gibt-es-nicht', label: { de: 'Ding 8' } }

describe('hinweisinhalt', () => {
  it('zeigt bei einer nicht gefundenen Karte nur den Namen, nicht die Erklärung', () => {
    expect(hinweisinhalt(karte, gefunden(), 'de', verzeichnis)).toEqual({ name: 'Ding 1', aktion: 'card', gefunden: false });
  });

  it('zeigt bei einer gefundenen Karte Name und Erklärung', () => {
    expect(hinweisinhalt(karte, gefunden('karte-a'), 'de', verzeichnis)).toEqual({
      name: 'Ding 1',
      erklaerung: 'Erklärung 1',
      aktion: 'card',
      gefunden: true,
    });
  });

  it('zeigt bei einer gefundenen Karte ohne Erklärung nur den Namen', () => {
    expect(hinweisinhalt(karteOhneErklaerung, gefunden('karte-a'), 'de', verzeichnis)).toEqual({
      name: 'Ding 2',
      aktion: 'card',
      gefunden: true,
    });
  });

  it('zeigt bei info und scene die Erklärung immer', () => {
    expect(hinweisinhalt(info, gefunden(), 'de', verzeichnis)).toEqual({ name: 'Ding 3', erklaerung: 'Erklärung 3', aktion: 'info' });
    expect(hinweisinhalt(zoom, gefunden(), 'de', verzeichnis)).toEqual({ name: 'Ding 4', erklaerung: 'Erklärung 4', aktion: 'scene', stand: { gefunden: 0, vorhanden: 4 } });
  });

  it('nennt bei einem Zoom-Hotspot die Eintrittskarte der Zielszene, sobald sie gefunden ist', () => {
    expect(hinweisinhalt(zoom, gefunden('karte-a'), 'de', verzeichnis)).toEqual({
      name: 'Ding 4',
      erklaerung: 'Erklärung 4',
      aktion: 'scene',
      stand: { gefunden: 1, vorhanden: 4 },
      eintrittskarte: 'karte-a',
    });
  });

  it('nennt keine Eintrittskarte, wenn sie fehlt oder noch nicht gefunden ist', () => {
    expect(hinweisinhalt(zoom, gefunden('karte-b'), 'de', verzeichnis)).not.toHaveProperty('eintrittskarte');
    expect(hinweisinhalt(zoomLeer, gefunden('karte-a'), 'de', verzeichnis)).not.toHaveProperty('eintrittskarte');
    expect(hinweisinhalt(zoomUnbekannt, gefunden('karte-a'), 'de', verzeichnis)).not.toHaveProperty('eintrittskarte');
  });

  it('nennt bei card und info nie eine Eintrittskarte', () => {
    expect(hinweisinhalt(karte, gefunden('karte-a'), 'de', verzeichnis)).not.toHaveProperty('eintrittskarte');
    expect(hinweisinhalt(info, gefunden('karte-a'), 'de', verzeichnis)).not.toHaveProperty('eintrittskarte');
  });

  it('lässt die Erklärung weg, wenn ein Zoom-Hotspot keine hat', () => {
    expect(hinweisinhalt(zoomOhneErklaerung, gefunden(), 'de', verzeichnis)).toEqual({ name: 'Ding 5', aktion: 'scene', stand: { gefunden: 0, vorhanden: 4 } });
  });

  it('liest die Texte in der gewählten Fassung und fällt auf de zurück', () => {
    expect(hinweisinhalt(info, gefunden(), 'en', verzeichnis)).toEqual({ name: 'Thing 3', erklaerung: 'Erklärung 3', aktion: 'info' });
  });
});

describe('hinweisinhalt, Stand', () => {
  it('nennt bei einem Zoom-Hotspot den Stand der Zielszene samt tieferen Szenen', () => {
    expect(hinweisinhalt(zoom, gefunden('karte-a', 'karte-c', 'karte-x'), 'de', verzeichnis).stand).toEqual({
      gefunden: 2,
      vorhanden: 4,
    });
  });

  it('nennt bei einer Zielszene ohne Karten 0 von 0', () => {
    expect(hinweisinhalt(zoomLeer, gefunden(), 'de', verzeichnis).stand).toEqual({ gefunden: 0, vorhanden: 0 });
  });

  it('nennt bei unbekannter Zielszene keinen Stand', () => {
    expect(hinweisinhalt(zoomUnbekannt, gefunden(), 'de', verzeichnis)).not.toHaveProperty('stand');
  });

  it('nennt bei card und info keinen Stand', () => {
    expect(hinweisinhalt(karte, gefunden(), 'de', verzeichnis)).not.toHaveProperty('stand');
    expect(hinweisinhalt(info, gefunden(), 'de', verzeichnis)).not.toHaveProperty('stand');
  });
});

describe('karteGefunden', () => {
  it('ist wahr, wenn der Hotspot eine Karte gibt und diese gefunden ist', () => {
    expect(karteGefunden(karte, gefunden('karte-a'))).toBe(true);
    expect(karteGefunden(karte, gefunden('karte-b'))).toBe(false);
  });

  it('ist falsch bei Hotspots ohne Karte, auch wenn ihr Ziel als gefunden gilt', () => {
    expect(karteGefunden(zoom, gefunden('szene-b'))).toBe(false);
    expect(karteGefunden(info, gefunden('karte-a'))).toBe(false);
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

import { describe, expect, it } from 'vitest';
import { deuteTaste, type Tastenlage } from './tasten.ts';

const lage = (teil: Partial<Tastenlage>): Tastenlage => ({
  taste: 'Escape',
  umschalt: false,
  karteOffen: false,
  hinweisOffen: false,
  hatKartenknopf: false,
  fokus: 'sonst',
  ...teil,
});

describe('Escape', () => {
  it('geht eine Ebene zurück, wenn nichts offen ist', () => {
    expect(deuteTaste(lage({}))).toBe('ebene-zurueck');
  });

  it('schließt einen offenen Hinweis und lässt den Fokus, wo er ist', () => {
    expect(deuteTaste(lage({ hinweisOffen: true, fokus: 'hotspot' }))).toBe('hinweis-schliessen');
    expect(deuteTaste(lage({ hinweisOffen: true }))).toBe('hinweis-schliessen');
  });

  it('schließt am Kartenknopf den Hinweis und gibt den Fokus an den Hotspot zurück', () => {
    expect(deuteTaste(lage({ hinweisOffen: true, hatKartenknopf: true, fokus: 'kartenknopf' }))).toBe(
      'hinweis-schliessen-fokus-zum-hotspot',
    );
  });

  it('tut bei offener Karte nichts (sie schließt selbst)', () => {
    expect(deuteTaste(lage({ karteOffen: true }))).toBe('nichts');
    expect(deuteTaste(lage({ karteOffen: true, hinweisOffen: true }))).toBe('nichts');
  });
});

describe('Tab', () => {
  const tab = { taste: 'Tab' } as const;
  const mitKnopf = { hinweisOffen: true, hatKartenknopf: true } as const;

  it('führt vom Hotspot zum Kartenknopf des offenen Hinweises', () => {
    expect(deuteTaste(lage({ ...tab, ...mitKnopf, fokus: 'hotspot' }))).toBe('zum-kartenknopf');
  });

  it('lässt Tab vom Hotspot ohne Kartenknopf oder Hinweis unberührt', () => {
    expect(deuteTaste(lage({ ...tab, hinweisOffen: true, fokus: 'hotspot' }))).toBe('nichts');
    expect(deuteTaste(lage({ ...tab, fokus: 'hotspot' }))).toBe('nichts');
    expect(deuteTaste(lage({ ...tab, ...mitKnopf, fokus: 'sonst' }))).toBe('nichts');
  });

  it('führt vom Kartenknopf zum nächsten Hotspot', () => {
    expect(deuteTaste(lage({ ...tab, ...mitKnopf, fokus: 'kartenknopf' }))).toBe('vom-kartenknopf-weiter');
  });

  it('führt mit Shift vom Kartenknopf zurück zum Hotspot', () => {
    expect(deuteTaste(lage({ ...tab, umschalt: true, ...mitKnopf, fokus: 'kartenknopf' }))).toBe('vom-kartenknopf-zurueck');
  });

  it('lässt Shift+Tab vom Hotspot unberührt', () => {
    expect(deuteTaste(lage({ ...tab, umschalt: true, ...mitKnopf, fokus: 'hotspot' }))).toBe('nichts');
  });

  it('tut bei offener Karte nichts', () => {
    expect(deuteTaste(lage({ ...tab, ...mitKnopf, karteOffen: true, fokus: 'hotspot' }))).toBe('nichts');
  });
});

describe('andere Tasten', () => {
  it('bleiben unberührt', () => {
    expect(deuteTaste(lage({ taste: 'Enter', hinweisOffen: true }))).toBe('nichts');
  });
});

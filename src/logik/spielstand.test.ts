import { describe, expect, it } from 'vitest';
import {
  aendereEinstellung,
  einlesen,
  gefundeneKarten,
  markiereGefunden,
  neuerSpielstand,
  zuruecksetzen,
} from './spielstand.ts';

const ZEIT_1 = '2026-01-01T10:00:00Z';
const ZEIT_2 = '2026-01-02T10:00:00Z';

describe('neuerSpielstand', () => {
  it('hat das aktive Profil standard ohne gefundene Karten und mit sichtbaren Haken', () => {
    expect(neuerSpielstand()).toEqual({
      schema: 1,
      active: 'standard',
      profiles: { standard: { cards: {}, settings: { showMarkers: true } } },
    });
  });
});

describe('markiereGefunden', () => {
  it('trägt die Karte mit dem übergebenen Zeitpunkt im aktiven Profil ein', () => {
    const stand = markiereGefunden(neuerSpielstand(), 'karte-a', ZEIT_1);
    expect(stand.profiles.standard?.cards).toEqual({ 'karte-a': ZEIT_1 });
  });

  it('lässt einer schon gefundenen Karte ihren ersten Zeitpunkt', () => {
    const stand = markiereGefunden(markiereGefunden(neuerSpielstand(), 'karte-a', ZEIT_1), 'karte-a', ZEIT_2);
    expect(stand.profiles.standard?.cards).toEqual({ 'karte-a': ZEIT_1 });
  });

  it('verändert den übergebenen Spielstand nicht', () => {
    const vorher = neuerSpielstand();
    markiereGefunden(vorher, 'karte-a', ZEIT_1);
    expect(vorher).toEqual(neuerSpielstand());
  });
});

describe('gefundeneKarten', () => {
  it('liefert die gefundenen Karten des aktiven Profils als Menge', () => {
    const stand = markiereGefunden(markiereGefunden(neuerSpielstand(), 'karte-a', ZEIT_1), 'karte-b', ZEIT_2);
    expect(gefundeneKarten(stand)).toEqual(new Set(['karte-a', 'karte-b']));
  });
});

describe('aendereEinstellung', () => {
  it('setzt die Einstellung im aktiven Profil und lässt die gefundenen Karten stehen', () => {
    const stand = aendereEinstellung(markiereGefunden(neuerSpielstand(), 'karte-a', ZEIT_1), 'showMarkers', false);
    expect(stand.profiles.standard).toEqual({ cards: { 'karte-a': ZEIT_1 }, settings: { showMarkers: false } });
  });

  it('verändert den übergebenen Spielstand nicht', () => {
    const vorher = neuerSpielstand();
    aendereEinstellung(vorher, 'showMarkers', false);
    expect(vorher).toEqual(neuerSpielstand());
  });
});

describe('zuruecksetzen', () => {
  it('leert die gefundenen Karten und setzt die Einstellungen des aktiven Profils zurück', () => {
    const benutzt = aendereEinstellung(markiereGefunden(neuerSpielstand(), 'karte-a', ZEIT_1), 'showMarkers', false);
    expect(zuruecksetzen(benutzt)).toEqual(neuerSpielstand());
  });
});

describe('einlesen', () => {
  const gueltig = {
    schema: 1,
    active: 'standard',
    profiles: { standard: { cards: { 'karte-a': ZEIT_1 }, settings: { showMarkers: false } } },
  };

  it('übernimmt einen gültigen Spielstand der aktuellen Version', () => {
    expect(einlesen(gueltig)).toEqual({ art: 'gelesen', stand: gueltig });
  });

  it('behält Karten-IDs, die die Engine nicht kennt', () => {
    const mitUnbekannter = { ...gueltig, profiles: { standard: { ...gueltig.profiles.standard, cards: { 'karte-gibt-es-nicht': ZEIT_2 } } } };
    expect(gefundeneKarten(einlesen(mitUnbekannter).stand)).toEqual(new Set(['karte-gibt-es-nicht']));
  });

  it('übernimmt die gefundenen Karten auch, wenn eine Einstellung fehlt oder kaputt ist, und setzt dafür den Standardwert', () => {
    const ohneEinstellung = { ...gueltig, profiles: { standard: { cards: { 'karte-a': ZEIT_1 }, settings: { showMarkers: 'ja' } } } };
    expect(einlesen(ohneEinstellung)).toEqual({
      art: 'gelesen',
      stand: { ...gueltig, profiles: { standard: { cards: { 'karte-a': ZEIT_1 }, settings: { showMarkers: true } } } },
    });
  });

  it('ergibt einen neuen leeren Spielstand, wenn nichts gespeichert ist', () => {
    expect(einlesen(undefined)).toEqual({ art: 'neu', stand: neuerSpielstand() });
    expect(einlesen(null)).toEqual({ art: 'neu', stand: neuerSpielstand() });
  });

  it.each([
    ['eine Zahl', 42],
    ['ein Text', 'kaputt'],
    ['eine Liste', [gueltig]],
    ['ohne Schema-Version', { ...gueltig, schema: undefined }],
    ['mit Schema-Version als Text', { ...gueltig, schema: '1' }],
    ['mit Schema-Version 0', { ...gueltig, schema: 0 }],
    ['mit gebrochener Schema-Version', { ...gueltig, schema: 1.5 }],
    ['ohne aktives Profil', { ...gueltig, active: undefined }],
    ['mit aktivem Profil, das fehlt', { ...gueltig, active: 'anderes' }],
    ['ohne Profile', { ...gueltig, profiles: undefined }],
    ['mit Karten als Liste', { ...gueltig, profiles: { standard: { cards: ['karte-a'], settings: {} } } }],
    ['mit Zeitpunkt, der kein Text ist', { ...gueltig, profiles: { standard: { cards: { 'karte-a': 1 }, settings: {} } } }],
  ])('ergibt bei kaputten Daten (%s) einen neuen leeren Spielstand, ohne zu werfen', (_, daten) => {
    expect(einlesen(daten)).toEqual({ art: 'neu', stand: neuerSpielstand() });
  });

  it('meldet einen Spielstand einer neueren Schema-Version als nicht lesbar und liefert einen leeren Spielstand', () => {
    expect(einlesen({ ...gueltig, schema: 2 })).toEqual({ art: 'neuere-version', stand: neuerSpielstand() });
  });

  it('hängt das Ergebnis nicht an die eingelesenen Daten', () => {
    const daten = JSON.parse(JSON.stringify(gueltig)) as typeof gueltig & {
      profiles: { standard: { cards: Record<string, string> } };
    };
    const { stand } = einlesen(daten);
    daten.profiles.standard.cards['karte-b'] = ZEIT_2;
    expect(gefundeneKarten(stand)).toEqual(new Set(['karte-a']));
  });
});

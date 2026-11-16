import { describe, expect, it } from 'vitest';
import {
  aendereEinstellung,
  aktiveEinstellungen,
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
    const spielstand = markiereGefunden(neuerSpielstand(), 'karte-a', ZEIT_1);
    expect(spielstand.profiles.standard?.cards).toEqual({ 'karte-a': ZEIT_1 });
  });

  it('lässt einer schon gefundenen Karte ihren ersten Zeitpunkt', () => {
    const spielstand = markiereGefunden(markiereGefunden(neuerSpielstand(), 'karte-a', ZEIT_1), 'karte-a', ZEIT_2);
    expect(spielstand.profiles.standard?.cards).toEqual({ 'karte-a': ZEIT_1 });
  });

  it('verändert den übergebenen Spielstand nicht', () => {
    const vorher = neuerSpielstand();
    markiereGefunden(vorher, 'karte-a', ZEIT_1);
    expect(vorher).toEqual(neuerSpielstand());
  });
});

describe('gefundeneKarten', () => {
  it('liefert die gefundenen Karten des aktiven Profils als Menge', () => {
    const spielstand = markiereGefunden(markiereGefunden(neuerSpielstand(), 'karte-a', ZEIT_1), 'karte-b', ZEIT_2);
    expect(gefundeneKarten(spielstand)).toEqual(new Set(['karte-a', 'karte-b']));
  });
});

describe('aendereEinstellung', () => {
  it('setzt die Einstellung im aktiven Profil und lässt die gefundenen Karten stehen', () => {
    const spielstand = aendereEinstellung(markiereGefunden(neuerSpielstand(), 'karte-a', ZEIT_1), 'showMarkers', false);
    expect(spielstand.profiles.standard).toEqual({ cards: { 'karte-a': ZEIT_1 }, settings: { showMarkers: false } });
  });

  it('verändert den übergebenen Spielstand nicht', () => {
    const vorher = neuerSpielstand();
    aendereEinstellung(vorher, 'showMarkers', false);
    expect(vorher).toEqual(neuerSpielstand());
  });
});

describe('aktiveEinstellungen', () => {
  it('liefert die Einstellungen des aktiven Profils', () => {
    const spielstand = aendereEinstellung(neuerSpielstand(), 'showMarkers', false);
    expect(aktiveEinstellungen(spielstand)).toEqual({ showMarkers: false });
  });

  it('liefert die Standardeinstellungen, wenn das aktive Profil fehlt', () => {
    expect(aktiveEinstellungen({ schema: 1, active: 'fehlt', profiles: {} })).toEqual({ showMarkers: true });
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
    expect(einlesen(gueltig)).toEqual({ art: 'gelesen', spielstand: gueltig });
  });

  it('behält Karten-IDs, die die Engine nicht kennt', () => {
    const mitUnbekannter = { ...gueltig, profiles: { standard: { ...gueltig.profiles.standard, cards: { 'karte-gibt-es-nicht': ZEIT_2 } } } };
    expect(gefundeneKarten(einlesen(mitUnbekannter).spielstand)).toEqual(new Set(['karte-gibt-es-nicht']));
  });

  it('übernimmt die gefundenen Karten auch, wenn eine Einstellung fehlt oder kaputt ist, und setzt dafür den Standardwert', () => {
    const ohneEinstellung = { ...gueltig, profiles: { standard: { cards: { 'karte-a': ZEIT_1 }, settings: { showMarkers: 'ja' } } } };
    expect(einlesen(ohneEinstellung)).toEqual({
      art: 'gelesen',
      spielstand: { ...gueltig, profiles: { standard: { cards: { 'karte-a': ZEIT_1 }, settings: { showMarkers: true } } } },
    });
  });

  it('ergibt einen neuen leeren Spielstand, wenn nichts gespeichert ist', () => {
    expect(einlesen(undefined)).toEqual({ art: 'neu', spielstand: neuerSpielstand() });
    expect(einlesen(null)).toEqual({ art: 'neu', spielstand: neuerSpielstand() });
  });

  it.each([
    ['eine Zahl', 42],
    ['ein Text', 'kaputt'],
    ['eine Liste', [gueltig]],
    ['ohne Schema-Version', { ...gueltig, schema: undefined }],
    ['mit Schema-Version als Text', { ...gueltig, schema: '1' }],
    ['mit Schema-Version 0', { ...gueltig, schema: 0 }],
    ['mit gebrochener Schema-Version', { ...gueltig, schema: 1.5 }],
    ['ohne Profile', { ...gueltig, profiles: undefined }],
    ['mit Profilen als Liste', { ...gueltig, profiles: [gueltig.profiles.standard] }],
  ])('ergibt bei Daten, die kein Spielstand sind (%s), einen neuen leeren Spielstand, ohne zu werfen', (_, daten) => {
    expect(einlesen(daten)).toEqual({ art: 'neu', spielstand: neuerSpielstand() });
  });

  const profilB = { cards: { 'karte-b': ZEIT_2 }, settings: { showMarkers: false } };
  const leer = { cards: {}, settings: { showMarkers: true } };

  it('lässt einen Karteneintrag weg, dessen Zeitpunkt kein Text ist, und behält die anderen Karten', () => {
    const daten = { ...gueltig, profiles: { standard: { cards: { 'karte-a': ZEIT_1, 'karte-x': 1, 'karte-b': ZEIT_2 }, settings: {} } } };
    expect(einlesen(daten)).toEqual({
      art: 'gelesen',
      spielstand: { ...gueltig, profiles: { standard: { cards: { 'karte-a': ZEIT_1, 'karte-b': ZEIT_2 }, settings: { showMarkers: true } } } },
    });
  });

  it.each([
    ['kein Objekt', 'kaputt'],
    ['Karten als Liste', { cards: ['karte-a'], settings: { showMarkers: false } }],
    ['ohne Karten', { settings: { showMarkers: false } }],
  ])('macht aus einem kaputten Profil (%s) ein leeres und behält die anderen Profile', (_, kaputt) => {
    const daten = { ...gueltig, profiles: { standard: kaputt, 'profil-b': profilB } };
    expect(einlesen(daten)).toEqual({
      art: 'gelesen',
      spielstand: { ...gueltig, profiles: { standard: leer, 'profil-b': profilB } },
    });
  });

  it('legt ein aktives Profil, das fehlt, leer an und behält die anderen Profile', () => {
    expect(einlesen({ ...gueltig, active: 'profil-b' })).toEqual({
      art: 'gelesen',
      spielstand: { ...gueltig, active: 'profil-b', profiles: { ...gueltig.profiles, 'profil-b': leer } },
    });
  });

  it('macht standard aktiv, wenn das aktive Profil kein Text ist', () => {
    expect(einlesen({ ...gueltig, active: 7 })).toEqual({ art: 'gelesen', spielstand: gueltig });
    expect(einlesen({ ...gueltig, active: undefined })).toEqual({ art: 'gelesen', spielstand: gueltig });
  });

  it('legt standard leer an, wenn das aktive Profil kein Text ist und standard fehlt', () => {
    expect(einlesen({ ...gueltig, active: undefined, profiles: { 'profil-b': profilB } })).toEqual({
      art: 'gelesen',
      spielstand: { ...gueltig, profiles: { 'profil-b': profilB, standard: leer } },
    });
  });

  it('meldet einen Spielstand einer neueren Schema-Version als nicht lesbar und liefert einen leeren Spielstand', () => {
    expect(einlesen({ ...gueltig, schema: 2 })).toEqual({ art: 'neuere-version', spielstand: neuerSpielstand() });
  });

  it('hängt das Ergebnis nicht an die eingelesenen Daten', () => {
    const daten = JSON.parse(JSON.stringify(gueltig)) as typeof gueltig & {
      profiles: { standard: { cards: Record<string, string> } };
    };
    const { spielstand } = einlesen(daten);
    daten.profiles.standard.cards['karte-b'] = ZEIT_2;
    expect(gefundeneKarten(spielstand)).toEqual(new Set(['karte-a']));
  });
});

describe('Schlüssel __proto__', () => {
  // Nur JSON.parse legt `__proto__` als eigenen Eintrag an; ein Objektliteral setzte den Prototyp.
  const daten = () =>
    JSON.parse(
      `{"schema":1,"active":"__proto__","profiles":{"__proto__":{"cards":{"__proto__":"${ZEIT_1}","karte-a":"${ZEIT_2}"},"settings":{"showMarkers":false}}}}`,
    ) as unknown;

  it('bleibt beim Einlesen als Profil und als Karte erhalten', () => {
    const { art, spielstand } = einlesen(daten());
    expect(art).toBe('gelesen');
    expect(spielstand.active).toBe('__proto__');
    expect(Object.keys(spielstand.profiles)).toEqual(['__proto__']);
    expect(Object.getPrototypeOf(spielstand.profiles)).toBe(Object.prototype);
    expect(gefundeneKarten(spielstand)).toEqual(new Set(['__proto__', 'karte-a']));
    expect(Object.getOwnPropertyDescriptor(spielstand.profiles, '__proto__')?.value.cards['karte-a']).toBe(ZEIT_2);
  });

  it('lässt sich nach dem Einlesen ändern und zurücksetzen', () => {
    const { spielstand } = einlesen(daten());
    const geaendert = markiereGefunden(aendereEinstellung(spielstand, 'showMarkers', true), 'karte-b', ZEIT_2);
    expect(Object.keys(geaendert.profiles)).toEqual(['__proto__']);
    expect(gefundeneKarten(geaendert)).toEqual(new Set(['__proto__', 'karte-a', 'karte-b']));
    expect(Object.getOwnPropertyDescriptor(geaendert.profiles, '__proto__')?.value.settings).toEqual({ showMarkers: true });
    const leer = zuruecksetzen(geaendert);
    expect(Object.keys(leer.profiles)).toEqual(['__proto__']);
    expect(gefundeneKarten(leer)).toEqual(new Set());
  });

  it('wird als fehlendes aktives Profil leer angelegt', () => {
    const { spielstand } = einlesen({ schema: 1, active: '__proto__', profiles: { standard: { cards: {} } } });
    expect(Object.keys(spielstand.profiles)).toEqual(['standard', '__proto__']);
    expect(gefundeneKarten(markiereGefunden(spielstand, 'karte-a', ZEIT_1))).toEqual(new Set(['karte-a']));
  });

  it('lässt sich als Karte markieren', () => {
    const spielstand = markiereGefunden(neuerSpielstand(), '__proto__', ZEIT_1);
    expect(gefundeneKarten(spielstand)).toEqual(new Set(['__proto__']));
    expect(gefundeneKarten(markiereGefunden(spielstand, '__proto__', ZEIT_2))).toEqual(new Set(['__proto__']));
    expect(Object.getOwnPropertyDescriptor(spielstand.profiles.standard!.cards, '__proto__')?.value).toBe(ZEIT_1);
  });
});

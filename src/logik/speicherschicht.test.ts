import { describe, expect, it } from 'vitest';
import { speicherImArbeitsspeicher } from './speicherschicht.ts';
import { einlesen, gefundeneKarten, markiereGefunden, neuerSpielstand } from './spielstand.ts';

describe('speicherImArbeitsspeicher', () => {
  it('lädt nichts, solange nichts gespeichert ist', () => {
    expect(speicherImArbeitsspeicher().laden()).toBeUndefined();
  });

  it('lädt die Daten, mit denen er angelegt wurde', () => {
    expect(speicherImArbeitsspeicher({ schema: 99 }).laden()).toEqual({ schema: 99 });
  });

  it('lädt einen gespeicherten Spielstand so, dass er sich wieder einlesen lässt', () => {
    const speicher = speicherImArbeitsspeicher();
    const spielstand = markiereGefunden(neuerSpielstand(), 'karte-a', '2026-01-01T10:00:00Z');
    speicher.speichern(spielstand);
    expect(einlesen(speicher.laden())).toEqual({ art: 'gelesen', spielstand });
  });

  it('behält Profil und Karte mit dem Schlüssel __proto__ über Speichern und erneutes Einlesen', () => {
    const daten = JSON.parse(
      '{"schema":1,"active":"__proto__","profiles":{"__proto__":{"cards":{"__proto__":"2026-01-01T10:00:00Z"},"settings":{"showMarkers":true}}}}',
    ) as unknown;
    const speicher = speicherImArbeitsspeicher();
    speicher.speichern(einlesen(daten).spielstand);
    const { spielstand } = einlesen(speicher.laden());
    expect(spielstand.active).toBe('__proto__');
    expect(Object.keys(spielstand.profiles)).toEqual(['__proto__']);
    expect(gefundeneKarten(spielstand)).toEqual(new Set(['__proto__']));
  });

  it('ersetzt beim Speichern den vorigen Spielstand', () => {
    const speicher = speicherImArbeitsspeicher();
    speicher.speichern(markiereGefunden(neuerSpielstand(), 'karte-a', '2026-01-01T10:00:00Z'));
    speicher.speichern(neuerSpielstand());
    expect(speicher.laden()).toEqual(neuerSpielstand());
  });

  it('liefert bei jedem Laden eigene Daten, die spätere Änderungen nicht berühren', () => {
    const speicher = speicherImArbeitsspeicher();
    speicher.speichern(neuerSpielstand());
    const geladen = speicher.laden() as { active: string };
    geladen.active = 'verändert';
    expect(speicher.laden()).toEqual(neuerSpielstand());
  });
});

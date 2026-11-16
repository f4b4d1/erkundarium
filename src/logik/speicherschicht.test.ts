import { describe, expect, it } from 'vitest';
import { speicherImArbeitsspeicher } from './speicherschicht.ts';
import { einlesen, markiereGefunden, neuerSpielstand } from './spielstand.ts';

describe('speicherImArbeitsspeicher', () => {
  it('lädt nichts, solange nichts gespeichert ist', () => {
    expect(speicherImArbeitsspeicher().laden()).toBeUndefined();
  });

  it('lädt die Daten, mit denen er angelegt wurde', () => {
    expect(speicherImArbeitsspeicher({ schema: 99 }).laden()).toEqual({ schema: 99 });
  });

  it('lädt einen gespeicherten Spielstand so, dass er sich wieder einlesen lässt', () => {
    const speicher = speicherImArbeitsspeicher();
    const stand = markiereGefunden(neuerSpielstand(), 'karte-a', '2026-01-01T10:00:00Z');
    speicher.speichern(stand);
    expect(einlesen(speicher.laden())).toEqual({ art: 'gelesen', stand });
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

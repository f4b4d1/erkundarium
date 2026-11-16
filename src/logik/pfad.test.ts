import { describe, expect, it } from 'vitest';
import { betreten, kuerzenBis, neuerPfad } from './pfad.ts';

describe('neuerPfad', () => {
  it('beginnt mit der Startszene', () => {
    expect(neuerPfad('fabrikhalle')).toEqual(['fabrikhalle']);
  });
});

describe('betreten', () => {
  it('hängt die Szene hinten an', () => {
    expect(betreten(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('verändert den bisherigen Pfad nicht', () => {
    const pfad = ['a'];
    betreten(pfad, 'b');
    expect(pfad).toEqual(['a']);
  });

  it('hängt eine Szene nicht doppelt an, die schon die aktuelle ist', () => {
    expect(betreten(['a', 'b'], 'b')).toEqual(['a', 'b']);
  });
});

describe('kuerzenBis', () => {
  it('kürzt den Pfad bis zur Ebene und behält sie', () => {
    expect(kuerzenBis(['a', 'b', 'c'], 'a')).toEqual(['a']);
    expect(kuerzenBis(['a', 'b', 'c'], 'b')).toEqual(['a', 'b']);
  });

  it('lässt den Pfad bei der aktuellen Ebene unverändert', () => {
    expect(kuerzenBis(['a', 'b'], 'b')).toEqual(['a', 'b']);
  });

  it('lässt den Pfad unverändert, wenn die Szene nicht darauf liegt', () => {
    expect(kuerzenBis(['a', 'b'], 'x')).toEqual(['a', 'b']);
  });
});

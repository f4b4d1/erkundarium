import { describe, expect, it } from 'vitest';
import { betreten, kuerzenBis, neuerPfad, rueckweg } from './pfad.ts';

describe('neuerPfad', () => {
  it('beginnt mit der Startszene ohne Hotspot', () => {
    expect(neuerPfad('fabrikhalle')).toEqual([{ szene: 'fabrikhalle' }]);
  });
});

describe('betreten', () => {
  it('hängt die Szene mit dem Hotspot hinten an, über den sie betreten wurde', () => {
    expect(betreten([{ szene: 'a' }], 'b', 'h1')).toEqual([{ szene: 'a' }, { szene: 'b', ueber: 'h1' }]);
  });

  it('verändert den bisherigen Pfad nicht', () => {
    const pfad = [{ szene: 'a' }];
    betreten(pfad, 'b', 'h1');
    expect(pfad).toEqual([{ szene: 'a' }]);
  });

  it('hängt eine Szene nicht doppelt an, die schon die aktuelle ist', () => {
    const pfad = [{ szene: 'a' }, { szene: 'b', ueber: 'h1' }];
    expect(betreten(pfad, 'b', 'h2')).toEqual(pfad);
  });
});

describe('kuerzenBis', () => {
  const pfad = [{ szene: 'a' }, { szene: 'b', ueber: 'h1' }, { szene: 'c', ueber: 'h2' }];

  it('kürzt den Pfad bis zur Ebene und behält sie samt ihrem Hotspot', () => {
    expect(kuerzenBis(pfad, 'a')).toEqual([{ szene: 'a' }]);
    expect(kuerzenBis(pfad, 'b')).toEqual([{ szene: 'a' }, { szene: 'b', ueber: 'h1' }]);
  });

  it('lässt den Pfad bei der aktuellen Ebene unverändert', () => {
    expect(kuerzenBis(pfad, 'c')).toEqual(pfad);
  });

  it('lässt den Pfad unverändert, wenn die Szene nicht darauf liegt', () => {
    expect(kuerzenBis(pfad, 'x')).toEqual(pfad);
  });
});

describe('rueckweg', () => {
  const pfad = [{ szene: 'a' }, { szene: 'b', ueber: 'h1' }, { szene: 'c', ueber: 'h2' }];

  it('liefert eine Stufe für die Ebene davor: die Szene und der Hotspot, über den sie verlassen wurde', () => {
    expect(rueckweg(pfad, 'b')).toEqual([{ szene: 'b', hotspot: 'h2' }]);
  });

  it('liefert die Stufen vom Innersten zum Ziel in Abspielreihenfolge', () => {
    expect(rueckweg(pfad, 'a')).toEqual([
      { szene: 'b', hotspot: 'h2' },
      { szene: 'a', hotspot: 'h1' },
    ]);
  });

  it('liefert nichts bei der aktuellen Ebene oder einer Szene abseits des Pfads', () => {
    expect(rueckweg(pfad, 'c')).toEqual([]);
    expect(rueckweg(pfad, 'x')).toEqual([]);
  });
});

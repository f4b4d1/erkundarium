import { describe, expect, it } from 'vitest';
import { deuteAntippen, geraetDesZeigers } from './eingabe.ts';

describe('deuteAntippen', () => {
  it('Maus: ein Klick auf einen Hotspot löst sofort aus, auch ohne offenen Hinweis', () => {
    expect(deuteAntippen('maus', 'ding-a', undefined)).toEqual({ art: 'ausgeloest', hotspot: 'ding-a' });
  });

  it('Tastatur: löst sofort aus', () => {
    expect(deuteAntippen('tastatur', 'ding-a', undefined)).toEqual({ art: 'ausgeloest', hotspot: 'ding-a' });
  });

  it('Touch: das erste Tippen betritt den Hotspot', () => {
    expect(deuteAntippen('touch', 'ding-a', undefined)).toEqual({ art: 'betreten', hotspot: 'ding-a' });
  });

  it('Touch: das zweite Tippen auf den hervorgehobenen Hotspot löst aus', () => {
    expect(deuteAntippen('touch', 'ding-a', 'ding-a')).toEqual({ art: 'ausgeloest', hotspot: 'ding-a' });
  });

  it('Touch: Tippen auf einen anderen Hotspot betritt diesen, statt auszulösen', () => {
    expect(deuteAntippen('touch', 'ding-b', 'ding-a')).toEqual({ art: 'betreten', hotspot: 'ding-b' });
  });

  it('Tippen oder Klicken neben jeden Hotspot ist daneben', () => {
    expect(deuteAntippen('touch', undefined, 'ding-a')).toEqual({ art: 'daneben' });
    expect(deuteAntippen('touch', undefined, undefined)).toEqual({ art: 'daneben' });
    expect(deuteAntippen('maus', undefined, 'ding-a')).toEqual({ art: 'daneben' });
  });
});

describe('geraetDesZeigers', () => {
  it('ordnet Maus und Touch nach pointerType zu', () => {
    expect(geraetDesZeigers('mouse')).toBe('maus');
    expect(geraetDesZeigers('touch')).toBe('touch');
  });

  it('behandelt einen Stift wie Touch, weil er oft nicht überfahren kann', () => {
    expect(geraetDesZeigers('pen')).toBe('touch');
  });

  it('behandelt einen unbekannten Zeiger wie eine Maus', () => {
    expect(geraetDesZeigers('')).toBe('maus');
  });
});

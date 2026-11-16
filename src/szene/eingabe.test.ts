import { describe, expect, it } from 'vitest';
import { deuteAntippen, geraetDesZeigers } from './eingabe.ts';

const ruhe = { hervorgehoben: undefined, durchTippenGeoeffnet: undefined };

describe('deuteAntippen', () => {
  it('Maus: ein Klick auf einen Hotspot löst sofort aus, auch ohne offenen Hinweis', () => {
    expect(deuteAntippen('maus', 'ding-a', ruhe)).toEqual({ art: 'ausgeloest', hotspot: 'ding-a' });
  });

  it('Tastatur: löst sofort aus', () => {
    expect(deuteAntippen('tastatur', 'ding-a', ruhe)).toEqual({ art: 'ausgeloest', hotspot: 'ding-a' });
  });

  it('Touch: das erste Tippen betritt den Hotspot', () => {
    expect(deuteAntippen('touch', 'ding-a', ruhe)).toEqual({ art: 'betreten', hotspot: 'ding-a' });
  });

  it('Touch: das zweite Tippen auf den Hotspot, dessen Hinweis das erste Tippen geöffnet hat, löst aus', () => {
    const zustand = { hervorgehoben: 'ding-a', durchTippenGeoeffnet: 'ding-a' };
    expect(deuteAntippen('touch', 'ding-a', zustand)).toEqual({ art: 'ausgeloest', hotspot: 'ding-a' });
  });

  it('Touch: das erste Tippen auf einen per Maus oder Tastatur hervorgehobenen Hotspot betritt ihn nur', () => {
    const zustand = { hervorgehoben: 'ding-a', durchTippenGeoeffnet: undefined };
    expect(deuteAntippen('touch', 'ding-a', zustand)).toEqual({ art: 'betreten', hotspot: 'ding-a' });
  });

  it('Touch: löst nicht aus, wenn der durch Tippen geöffnete Hinweis nicht mehr offen ist', () => {
    const zustand = { hervorgehoben: undefined, durchTippenGeoeffnet: 'ding-a' };
    expect(deuteAntippen('touch', 'ding-a', zustand)).toEqual({ art: 'betreten', hotspot: 'ding-a' });
  });

  it('Touch: Tippen auf einen anderen Hotspot betritt diesen, statt auszulösen', () => {
    const zustand = { hervorgehoben: 'ding-a', durchTippenGeoeffnet: 'ding-a' };
    expect(deuteAntippen('touch', 'ding-b', zustand)).toEqual({ art: 'betreten', hotspot: 'ding-b' });
  });

  it('Tippen oder Klicken neben jeden Hotspot ist daneben', () => {
    const offen = { hervorgehoben: 'ding-a', durchTippenGeoeffnet: 'ding-a' };
    expect(deuteAntippen('touch', undefined, offen)).toEqual({ art: 'daneben' });
    expect(deuteAntippen('touch', undefined, ruhe)).toEqual({ art: 'daneben' });
    expect(deuteAntippen('maus', undefined, offen)).toEqual({ art: 'daneben' });
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

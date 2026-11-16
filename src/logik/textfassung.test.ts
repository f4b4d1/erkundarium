import { describe, expect, it } from 'vitest';
import { STANDARDFASSUNG, text, waehleFassung } from './textfassung.ts';

describe('text', () => {
  it('liefert den Text der gewählten Fassung', () => {
    expect(text({ de: 'Hallo', 'de-einfach': 'Hi' }, 'de-einfach')).toBe('Hi');
  });

  it('fällt auf de zurück, wenn der Text in der gewählten Fassung fehlt', () => {
    expect(text({ de: 'Hallo' }, 'en')).toBe('Hallo');
  });

  it('liefert einen leeren Text, wenn auch de fehlt', () => {
    expect(text({}, 'en')).toBe('');
  });

  it('nimmt keine geerbten Eigenschaften als Fassung', () => {
    expect(text({ de: 'Hallo' }, 'toString')).toBe('Hallo');
  });

  it('hat de als Standardfassung', () => {
    expect(STANDARDFASSUNG).toBe('de');
  });
});

describe('waehleFassung', () => {
  const fassungen = { de: { titel: 'Deutsch' }, 'de-einfach': { titel: 'Einfach' } };

  it('liefert die gewählte Fassung als Ganzes', () => {
    expect(waehleFassung(fassungen, 'de-einfach')).toEqual({ titel: 'Einfach' });
  });

  it('fällt auf de zurück, wenn die ganze gewählte Fassung fehlt', () => {
    expect(waehleFassung(fassungen, 'en')).toEqual({ titel: 'Deutsch' });
  });

  it('liefert nichts, wenn auch de fehlt', () => {
    expect(waehleFassung({ en: { titel: 'English' } }, 'fr')).toBeUndefined();
  });

  it('nimmt keine geerbten Eigenschaften als Fassung', () => {
    expect(waehleFassung(fassungen, 'constructor')).toEqual({ titel: 'Deutsch' });
    expect(waehleFassung({}, '__proto__')).toBeUndefined();
  });
});

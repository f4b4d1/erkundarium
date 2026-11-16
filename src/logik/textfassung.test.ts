import { describe, expect, it } from 'vitest';
import { STANDARDFASSUNG, text } from './textfassung.ts';

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

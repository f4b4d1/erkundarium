import { describe, expect, it } from 'vitest';
import { liesSzenendatei } from './szenendatei.ts';

const gueltig = {
  id: 'szene-a',
  type: 'ansicht',
  title: { de: 'Szene A' },
  card: 'karte-e',
  hotspots: [
    { id: 'ding-1', action: 'card', target: 'karte-a', label: { de: 'Ding 1' } },
    { id: 'ding-2', action: 'info', label: { de: 'Ding 2' }, hint: { de: 'Erklärung 2' } },
    { id: 'ding-3', action: 'scene', target: 'szene-b', label: { de: 'Ding 3' }, hint: { de: 'Erklärung 3' } },
  ],
};

describe('liesSzenendatei', () => {
  it('liest eine gültige Szenendatei', () => {
    expect(liesSzenendatei(gueltig)).toEqual({
      id: 'szene-a',
      title: { de: 'Szene A' },
      card: 'karte-e',
      hotspots: gueltig.hotspots,
    });
  });

  it('liefert nichts, wenn die Daten keine Szene sind', () => {
    expect(liesSzenendatei(undefined)).toBeUndefined();
    expect(liesSzenendatei([])).toBeUndefined();
    expect(liesSzenendatei({ id: 'szene-a', title: { de: 'A' } })).toBeUndefined();
    expect(liesSzenendatei({ id: 7, title: { de: 'A' }, hotspots: [] })).toBeUndefined();
  });

  it('lässt kaputte Hotspots weg und behält die übrigen', () => {
    const daten = {
      ...gueltig,
      hotspots: [
        'kein Objekt',
        { id: 'ohne-name', action: 'info', hint: { de: 'x' } },
        { id: 'falsche-aktion', action: 'tanzen', label: { de: 'x' } },
        { id: 'ohne-ziel', action: 'card', label: { de: 'x' } },
        { id: 'name-kein-text', action: 'info', label: { de: 3 } },
        gueltig.hotspots[1],
      ],
    };
    expect(liesSzenendatei(daten)?.hotspots).toEqual([gueltig.hotspots[1]]);
  });

  it('übernimmt nur Texte, die Zeichenketten sind, und lässt eine kaputte Erklärung weg', () => {
    const daten = {
      ...gueltig,
      hotspots: [{ id: 'ding-1', action: 'info', label: { de: 'Ding', en: 5 }, hint: 'kein Objekt' }],
    };
    expect(liesSzenendatei(daten)?.hotspots).toEqual([{ id: 'ding-1', action: 'info', label: { de: 'Ding' } }]);
  });

  it('nimmt einen Hotspot mit dem Namen __proto__ in den Texten als gewöhnlichen Eintrag', () => {
    const daten = JSON.parse(
      '{"id":"a","title":{"de":"A"},"hotspots":[{"id":"d","action":"info","label":{"__proto__":"x","de":"D"}}]}',
    ) as unknown;
    const label = liesSzenendatei(daten)?.hotspots[0]?.label;
    expect(Object.keys(label ?? {})).toEqual(['__proto__', 'de']);
    expect(Object.getPrototypeOf(label)).toBe(Object.prototype);
  });
});

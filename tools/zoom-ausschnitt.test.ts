import { describe, expect, it } from 'vitest';
import { rechneUm } from './zoom-ausschnitt.ts';

// Ausschnitt ab (100, 100), 800 breit: Faktor 2, x' = (x − 100) · 2.
const AUSSCHNITT = { x: 100, y: 100, breite: 800 };
const um = (inhalt: string): string =>
  rechneUm(`<svg viewBox="0 0 1600 900">${inhalt}</svg>`, AUSSCHNITT, { koerperAb: 19 });

describe('rechneUm', () => {
  it('rechnet Lage und Radien um, Konturen behalten ihre Breite', () => {
    expect(um('<rect x="150" y="200" width="10" height="20" rx="3" stroke-width="3"/>'))
      .toContain('<rect x="100" y="200" width="20" height="40" rx="6" stroke-width="3"/>');
    expect(um('<circle cx="200" cy="300" r="5" stroke-width="2.2"/>'))
      .toContain('<circle cx="200" cy="400" r="10" stroke-width="2.2"/>');
  });

  it('skaliert Körperstriche; die Unterlage bleibt Kern + 6', () => {
    const aus = um('<path d="M200,200L300,300" stroke="#26262E" stroke-width="46"/><path d="M200,200L300,300" stroke="#FF7A1A" stroke-width="40"/>');
    expect(aus).toContain('stroke="#26262E" stroke-width="86"');
    expect(aus).toContain('stroke="#FF7A1A" stroke-width="80"');
  });

  it('rechnet absolute und relative Pfadbefehle um', () => {
    expect(um('<path d="M200,200H300V250l10,5Q400,400 450,450Z"/>'))
      .toContain('d="M200,200H400V300L420,310Q600,600 700,700Z"');
  });

  it('lässt Elemente und Teilpfade außerhalb weg und entfernt leere Gruppen', () => {
    const aus = um('<g id="weg"><rect x="1500" y="100" width="10" height="10"/></g><path d="M0,0L10,10M200,200L210,210"/>');
    expect(aus).not.toContain('id="weg"');
    expect(aus).toContain('d="M200,200L220,220"');
  });

  it('kappt große Flächen auf den Bildrand mit Überstand', () => {
    expect(um('<rect x="0" y="0" width="5000" height="5000"/>'))
      .toContain('<rect x="-20" y="-20" width="1640" height="940"/>');
  });

  it('rechnet einen Gruppentransform ein, Konturen bleiben', () => {
    const aus = um('<g id="katze" transform="translate(200,200) scale(.5) translate(-200,-200)"><circle cx="220" cy="200" r="10" stroke-width="3"/></g>');
    expect(aus).toContain('<g id="katze">');
    expect(aus).toContain('<circle cx="220" cy="200" r="10" stroke-width="3"/>');
  });

  it('entfernt ungenutzte Clip-Pfade und leere defs, rechnet benutzte um', () => {
    expect(um('<defs><clipPath id="c"><rect x="0" y="0" width="1" height="1"/></clipPath></defs><rect x="200" y="200" width="1" height="1"/>'))
      .not.toContain('defs');
    expect(um('<defs><clipPath id="c"><rect x="100" y="100" width="50" height="50"/></clipPath></defs><g clip-path="url(#c)"><rect x="110" y="110" width="10" height="10"/></g>'))
      .toContain('<clipPath id="c"><rect x="0" y="0" width="100" height="100"/></clipPath>');
  });

  it('lässt Gruppen weg, deren Clip ganz außerhalb liegt, auch wenn ihr Inhalt hineinragt', () => {
    const aus = um('<defs><clipPath id="c"><rect x="950" y="100" width="50" height="50"/></clipPath></defs><g clip-path="url(#c)"><g><rect x="0" y="0" width="5000" height="5000"/></g></g><circle cx="200" cy="200" r="1"/>');
    expect(aus).not.toContain('clip');
    expect(aus).not.toContain('<rect');
    expect(aus).toContain('<circle');
  });
});

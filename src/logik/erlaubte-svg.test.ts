import { describe, expect, it } from 'vitest';
import { attributErlaubt, elementErlaubt, SVG_NAMENSRAUM } from './erlaubte-svg.ts';

describe('elementErlaubt', () => {
  it.each(['svg', 'g', 'defs', 'clipPath', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'use'])(
    'erlaubt das Zeichenelement %s im SVG-Namensraum',
    (name) => {
      expect(elementErlaubt(SVG_NAMENSRAUM, name)).toBe(true);
    },
  );

  it.each(['script', 'style', 'a', 'set', 'animate', 'object', 'foreignObject', 'image', 'text', 'title', 'filter', 'linearGradient', 'iframe'])(
    'entfernt %s',
    (name) => {
      expect(elementErlaubt(SVG_NAMENSRAUM, name)).toBe(false);
    },
  );

  it('entfernt Elemente außerhalb des SVG-Namensraums, auch wenn der Name erlaubt wäre', () => {
    expect(elementErlaubt('http://www.w3.org/1999/xhtml', 'iframe')).toBe(false);
    expect(elementErlaubt('http://www.w3.org/1999/xhtml', 'g')).toBe(false);
    expect(elementErlaubt(null, 'rect')).toBe(false);
  });

  it('unterscheidet Groß- und Kleinschreibung wie SVG selbst', () => {
    expect(elementErlaubt(SVG_NAMENSRAUM, 'clippath')).toBe(false);
    expect(elementErlaubt(SVG_NAMENSRAUM, 'RECT')).toBe(false);
  });
});

describe('attributErlaubt', () => {
  it.each([
    ['svg', 'viewBox', '0 0 1600 900'],
    ['svg', 'xmlns', 'http://www.w3.org/2000/svg'],
    ['g', 'id', 'ding-1'],
    ['g', 'data-hotspot', 'ding-1'],
    ['rect', 'x', '1'],
    ['rect', 'rx', '2'],
    ['circle', 'r', '9'],
    ['path', 'd', 'M0,0L1,1'],
    ['path', 'fill', '#26262E'],
    ['path', 'stroke-width', '3'],
    ['path', 'stroke-dasharray', '4 4'],
    ['g', 'opacity', '.5'],
    ['g', 'transform', 'translate(10 20)'],
    ['polygon', 'points', '0,0 1,1 2,0'],
  ])('erlaubt %s %s="%s"', (element, attribut, wert) => {
    expect(attributErlaubt(element, attribut, wert)).toBe(true);
  });

  it.each([
    ['style', 'fill:red'],
    ['onclick', 'alert(1)'],
    ['onload', 'alert(1)'],
    ['filter', 'url(#f)'],
    ['aria-label', 'Name'],
    ['tabindex', '0'],
    ['class', 'x'],
    ['src', '#a'],
  ])('entfernt %s', (attribut, wert) => {
    expect(attributErlaubt('rect', attribut, wert)).toBe(false);
  });

  it('erlaubt url() nur mit Verweis ins eigene Dokument', () => {
    expect(attributErlaubt('g', 'clip-path', 'url(#tor)')).toBe(true);
    expect(attributErlaubt('rect', 'fill', "url('#m')")).toBe(true);
    expect(attributErlaubt('rect', 'fill', 'url(http://example.org/m.svg#m)')).toBe(false);
    expect(attributErlaubt('rect', 'fill', 'URL(muster.svg#m)')).toBe(false);
    expect(attributErlaubt('g', 'clip-path', 'url(#a) url(http://example.org/)')).toBe(false);
  });

  it('erlaubt href und xlink:href nur an use und nur mit Verweis ins eigene Dokument', () => {
    expect(attributErlaubt('use', 'href', '#teil')).toBe(true);
    expect(attributErlaubt('use', 'xlink:href', '#teil')).toBe(true);
    expect(attributErlaubt('use', 'href', 'andere.svg#teil')).toBe(false);
    expect(attributErlaubt('use', 'href', 'javascript:alert(1)')).toBe(false);
    expect(attributErlaubt('use', 'xlink:href', ' https://example.org/#x')).toBe(false);
    expect(attributErlaubt('a', 'href', '#teil')).toBe(false);
    expect(attributErlaubt('rect', 'href', '#teil')).toBe(false);
  });

  it('unterscheidet Groß- und Kleinschreibung', () => {
    expect(attributErlaubt('svg', 'viewbox', '0 0 1 1')).toBe(false);
    expect(attributErlaubt('rect', 'ONCLICK', 'alert(1)')).toBe(false);
  });
});

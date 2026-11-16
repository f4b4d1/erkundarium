import { describe, expect, it } from 'vitest';
import { liesKartendatei } from './kartendatei.ts';
import { waehleFassung } from './textfassung.ts';

const gueltig = {
  id: 'karte-a',
  topic: 'gebiet-a',
  image: 'bild-a.svg',
  sources: ['Quelle 1', 'Quelle 2'],
  link: 'https://example.org/a',
  relations: [{ type: 'typ-a', card: 'karte-b' }],
  texts: {
    de: {
      status: 'geprueft',
      title: 'Karte A',
      front: [{ type: 'text', text: 'Vorne' }],
      back: [
        { type: 'list', items: ['L1', 'L2'] },
        { type: 'facts', items: ['F1'] },
        { type: 'table', rows: [['Kopf 1', 'Kopf 2'], ['a', 'b']] },
        { type: 'funfact', text: 'Kurios' },
      ],
      linkLabel: 'Mehr zu A',
    },
  },
};

/** Eine gültige Karte, deren Fassung `de` die angegebenen Felder ersetzt. */
function mitFassung(felder: Record<string, unknown>): unknown {
  return { ...gueltig, texts: { de: { ...gueltig.texts.de, ...felder } } };
}

describe('liesKartendatei', () => {
  it('liest eine gültige Kartendatei ohne die Beziehungen', () => {
    const { relations: _, ...ohneBeziehungen } = gueltig;
    expect(liesKartendatei(gueltig)).toEqual(ohneBeziehungen);
  });

  it('liest eine Karte ohne freiwillige Felder', () => {
    const knapp = {
      id: 'karte-a',
      topic: 'gebiet-a',
      sources: ['Quelle'],
      texts: { de: { status: 'entwurf', title: 'A', front: [{ type: 'text', text: 'Vorne' }], back: [] } },
    };
    expect(liesKartendatei(knapp)).toEqual(knapp);
  });

  it('liefert nichts, wenn die Daten keine Karte sind', () => {
    expect(liesKartendatei(undefined)).toBeUndefined();
    expect(liesKartendatei('karte')).toBeUndefined();
    expect(liesKartendatei([gueltig])).toBeUndefined();
    expect(liesKartendatei({ ...gueltig, id: 7 })).toBeUndefined();
    expect(liesKartendatei({ ...gueltig, topic: undefined })).toBeUndefined();
    expect(liesKartendatei({ ...gueltig, texts: [] })).toBeUndefined();
  });

  it('liefert nichts, wenn keine Textfassung lesbar ist', () => {
    expect(liesKartendatei({ ...gueltig, texts: {} })).toBeUndefined();
    expect(liesKartendatei({ ...gueltig, texts: { de: 'Karte A' } })).toBeUndefined();
    expect(liesKartendatei(mitFassung({ title: '' }))).toBeUndefined();
    expect(liesKartendatei(mitFassung({ title: 3 }))).toBeUndefined();
  });

  it('lässt eine unlesbare Textfassung weg und behält die anderen', () => {
    const karte = liesKartendatei({ ...gueltig, texts: { ...gueltig.texts, en: { title: 7 } } });
    expect(Object.keys(karte!.texts)).toEqual(['de']);
  });

  it('lässt kaputte Bausteine einzeln weg', () => {
    const karte = liesKartendatei(
      mitFassung({
        front: [
          { type: 'text', text: 'Bleibt' },
          { type: 'text' },
          { type: 'text', text: '' },
          { type: 'video', text: 'Unbekannt' },
          'kein Baustein',
          null,
          { type: 'list', items: 'kein Feld' },
          { type: 'facts', items: [] },
          { type: 'table', rows: 'keine Zeilen' },
          { type: 'funfact', text: 5 },
        ],
      }),
    );
    expect(karte!.texts.de!.front).toEqual([{ type: 'text', text: 'Bleibt' }]);
  });

  it('lässt in Aufzählungen nur Einträge mit Text stehen', () => {
    const karte = liesKartendatei(mitFassung({ front: [{ type: 'list', items: ['A', 3, '', null, 'B'] }] }));
    expect(karte!.texts.de!.front).toEqual([{ type: 'list', items: ['A', 'B'] }]);
  });

  it('lässt in Tabellen Zeilen weg, die keine Liste sind, und leert Zellen ohne Text', () => {
    const karte = liesKartendatei(
      mitFassung({ front: [{ type: 'table', rows: [['Kopf', 'Wert'], 'keine Zeile', [], ['a', 7]] }] }),
    );
    expect(karte!.texts.de!.front).toEqual([{ type: 'table', rows: [['Kopf', 'Wert'], ['a', '']] }]);
  });

  it('liest fehlende Seiten als leer', () => {
    const karte = liesKartendatei(mitFassung({ front: undefined, back: 'keine Liste' }));
    expect(karte!.texts.de).toMatchObject({ front: [], back: [] });
  });

  it('nimmt jeden Prüfstatus außer geprueft als Entwurf', () => {
    expect(liesKartendatei(mitFassung({ status: 'fertig' }))!.texts.de!.status).toBe('entwurf');
    expect(liesKartendatei(mitFassung({ status: undefined }))!.texts.de!.status).toBe('entwurf');
    expect(liesKartendatei(mitFassung({ status: 'geprueft' }))!.texts.de!.status).toBe('geprueft');
  });

  it('übergeht einen Link, der nicht mit http:// oder https:// beginnt', () => {
    for (const link of ['javascript:alert(1)', 'ftp://example.org', '//example.org', 'https://', 7]) {
      expect(liesKartendatei({ ...gueltig, link })).not.toHaveProperty('link');
    }
    expect(liesKartendatei({ ...gueltig, link: 'http://example.org' })).toHaveProperty('link', 'http://example.org');
  });

  it('übergeht ein Kartenbild, das keine SVG im Kartenordner nennt', () => {
    for (const image of ['../geheim.svg', 'ordner/bild.svg', 'bild.png', 'https://example.org/b.svg', 4]) {
      expect(liesKartendatei({ ...gueltig, image })).not.toHaveProperty('image');
    }
  });

  it('lässt Quellen ohne Text weg und übergeht einen Linktext, der kein Text ist', () => {
    const karte = liesKartendatei({ ...mitFassung({ linkLabel: 3 }) as object, sources: ['Q', '', 9] });
    expect(karte!.sources).toEqual(['Q']);
    expect(karte!.texts.de).not.toHaveProperty('linkLabel');
    expect(liesKartendatei({ ...gueltig, sources: 'Q' })!.sources).toEqual([]);
  });

  it('legt eine Fassung namens __proto__ als gewöhnlichen Eintrag an', () => {
    const daten = JSON.parse(`{"id":"karte-a","topic":"gebiet-a","sources":[],"texts":{"__proto__":${JSON.stringify(gueltig.texts.de)}}}`);
    const karte = liesKartendatei(daten);
    expect(Object.hasOwn(karte!.texts, '__proto__')).toBe(true);
    expect(Object.getPrototypeOf(karte!.texts)).toBe(Object.prototype);
  });
});

describe('Textfassung einer Karte', () => {
  const karte = liesKartendatei({
    ...gueltig,
    texts: { de: gueltig.texts.de, 'de-einfach': { ...gueltig.texts.de, title: 'Einfach A', back: [] } },
  })!;

  it('nimmt die gewählte Fassung als Ganzes', () => {
    expect(waehleFassung(karte.texts, 'de-einfach')).toMatchObject({ title: 'Einfach A', back: [] });
  });

  it('nimmt die ganze Fassung de, wenn der Karte die gewählte fehlt', () => {
    expect(waehleFassung(karte.texts, 'en')).toBe(karte.texts.de);
  });
});

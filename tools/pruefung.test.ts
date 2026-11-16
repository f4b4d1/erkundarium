import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { INHALTSORDNER } from './pfade.ts';
import { pruefeInhalte, type Stufe } from './pruefung.ts';
import { ladeSchemas } from './schema.ts';

const pruefeSchema = ladeSchemas(join(INHALTSORDNER, 'schema'));

type Daten = Record<string, any>;

// Ein kleiner erfundener Inhaltsordner: Pfad relativ zum Inhaltsordner -> Daten.
// Strings bleiben, wie sie sind (SVG), alles andere wird zu JSON.
function grundinhalt(): Record<string, Daten | string> {
  return {
    'domains.json': [{ id: 'wissen-a', title: { de: 'Wissen A' }, color: '#112233' }],
    'topics.json': [
      { id: 'gebiet-a', title: { de: 'Gebiet A' }, domain: 'wissen-a', icon: 'gebiet-a.svg' },
    ],
    'relations.json': [
      { id: 'typ-a', forward: { de: 'vor' }, backward: { de: 'zurück' } },
      { id: 'typ-b', symmetric: true, forward: { de: 'neben' } },
    ],
    'limits.json': {
      maxTitleLength: 40,
      frontText: { min: 300, max: 400 },
      maxBackTextLength: 250,
      maxFunfactLength: 160,
      maxItemLength: 100,
      maxBlocksFront: 1,
      maxBlocksBack: 3,
      maxTableColumns: 2,
      maxTableRows: 4,
      maxSources: 3,
    },
    'cards/karte-a.json': karte('karte-a'),
    'cards/karte-b.json': karte('karte-b'),
    'worlds/welt-a/world.json': { id: 'welt-a', title: { de: 'Welt A' }, start: 'szene-a' },
    'worlds/welt-a/scenes/szene-a.json': {
      id: 'szene-a',
      type: 'ansicht',
      title: { de: 'Szene A' },
      hotspots: [
        { id: 'ding-1', action: 'card', target: 'karte-a', label: { de: 'Ding 1' } },
        { id: 'ding-2', action: 'scene', target: 'szene-b', label: { de: 'Ding 2' } },
        { id: 'ding-3', action: 'info', label: { de: 'Ding 3' }, hint: { de: 'Erklärung' } },
      ],
    },
    'worlds/welt-a/scenes/szene-a.svg': svg('ding-1', 'ding-2', 'ding-3'),
    'worlds/welt-a/scenes/szene-b.json': {
      id: 'szene-b',
      type: 'objekt',
      title: { de: 'Szene B' },
      card: 'karte-b',
      hotspots: [],
    },
    'worlds/welt-a/scenes/szene-b.svg': svg(),
  };
}

function karte(id: string): Daten {
  return {
    id,
    topic: 'gebiet-a',
    sources: ['Quelle'],
    texts: {
      de: { status: 'geprueft', title: `Titel ${id}`, front: [{ type: 'text', text: 'Vorne' }], back: [] },
    },
  };
}

function svg(...hotspots: string[]): string {
  const gruppen = hotspots.map((id) => `<g id="${id}" data-hotspot="${id}"><rect width="30" height="30"/></g>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">\n${gruppen.join('\n')}\n</svg>`;
}

function pruefe(inhalt: Record<string, Daten | string>, stufe: Stufe = 'entwickeln') {
  const dateien = Object.fromEntries(
    Object.entries(inhalt).map(([pfad, wert]) => [pfad, typeof wert === 'string' ? wert : JSON.stringify(wert)]),
  );
  return pruefeInhalte(dateien, stufe, pruefeSchema);
}

/** Fehler als `datei regel`, damit die Erwartungen kurz bleiben. */
function fehler(inhalt: Record<string, Daten | string>, stufe: Stufe = 'entwickeln'): string[] {
  return pruefe(inhalt, stufe).fehler.map((m) => `${m.datei} ${m.regel}`);
}

describe('gültige Inhalte', () => {
  it('ergeben weder Fehler noch Warnungen', () => {
    const bericht = pruefe(grundinhalt());
    expect(bericht.fehler).toEqual([]);
    expect(bericht.warnungen).toEqual([]);
  });
});

describe('Schema', () => {
  it('meldet eine Datei, die ihrem Schema nicht entspricht, mit einem verständlichen Text', () => {
    const inhalt = grundinhalt();
    delete (inhalt['cards/karte-a.json'] as Daten).sources;
    const bericht = pruefe(inhalt);
    expect(bericht.fehler).toHaveLength(1);
    expect(bericht.fehler[0]).toMatchObject({ datei: 'cards/karte-a.json', regel: 'schema' });
    expect(bericht.fehler[0].text).toContain('sources');
  });

  it('prüft jede Art von Inhaltsdatei gegen ihr Schema', () => {
    const inhalt = grundinhalt();
    for (const pfad of ['domains.json', 'topics.json', 'relations.json', 'limits.json', 'worlds/welt-a/world.json']) {
      inhalt[pfad] = { falsch: true };
    }
    (inhalt['worlds/welt-a/scenes/szene-b.json'] as Daten).type = 'unbekannt';
    expect(fehler(inhalt)).toEqual(
      expect.arrayContaining([
        'domains.json schema',
        'topics.json schema',
        'relations.json schema',
        'limits.json schema',
        'worlds/welt-a/world.json schema',
        'worlds/welt-a/scenes/szene-b.json schema',
      ]),
    );
  });

  it('meldet eine Datei, die kein gültiges JSON ist', () => {
    const inhalt = grundinhalt();
    inhalt['cards/karte-a.json'] = '{ "id": ';
    expect(fehler(inhalt)).toContain('cards/karte-a.json json');
  });

  it('meldet fehlende Pflichtdateien', () => {
    const inhalt = grundinhalt();
    delete inhalt['domains.json'];
    delete inhalt['topics.json'];
    delete inhalt['relations.json'];
    delete inhalt['limits.json'];
    delete inhalt['worlds/welt-a/world.json'];
    expect(fehler(inhalt)).toEqual(
      expect.arrayContaining([
        'domains.json datei-fehlt',
        'topics.json datei-fehlt',
        'relations.json datei-fehlt',
        'limits.json datei-fehlt',
        'worlds/welt-a/world.json datei-fehlt',
      ]),
    );
  });
});

describe('Ordner', () => {
  it.each([
    'cards/sub/x.json',
    'cards/sub/x.svg',
    'topics/x.json',
    'topics/sub/x.svg',
    'andere.json',
    'bild.svg',
    'worlds/x.json',
    'worlds/welt-a/x.json',
    'worlds/welt-a/x.svg',
    'worlds/welt-a/scenes/sub/x.json',
    'worlds/welt-a/scenes/sub/x.svg',
  ])('meldet eine Datei an unerwarteter Stelle: %s', (pfad) => {
    const inhalt = grundinhalt();
    inhalt[pfad] = pfad.endsWith('.svg') ? svg() : {};
    expect(pruefe(inhalt).fehler).toEqual([
      {
        datei: pfad,
        regel: 'unerwartete-datei',
        text: 'Die Datei liegt an einer Stelle, an der keine Inhaltsdatei erwartet wird.',
      },
    ]);
  });

  it('erlaubt Bilder unter cards/ und topics/ und übergeht schema/', () => {
    const inhalt = grundinhalt();
    inhalt['cards/bild-a.svg'] = svg();
    inhalt['topics/gebiet-a.svg'] = svg();
    inhalt['schema/irgendwas.json'] = {};
    inhalt['schema/sub/irgendwas.json'] = {};
    expect(fehler(inhalt)).toEqual([]);
  });
});

describe('IDs', () => {
  it('meldet eine Karte, deren Dateiname nicht ihrer ID entspricht', () => {
    const inhalt = grundinhalt();
    inhalt['cards/karte-c.json'] = karte('karte-x');
    expect(fehler(inhalt)).toEqual(['cards/karte-c.json dateiname']);
  });

  it('meldet eine Szene, deren Dateiname nicht ihrer ID entspricht', () => {
    const inhalt = grundinhalt();
    (inhalt['worlds/welt-a/scenes/szene-b.json'] as Daten).id = 'szene-x';
    (inhalt['worlds/welt-a/scenes/szene-a.json'] as Daten).hotspots[1].target = 'szene-x';
    expect(fehler(inhalt)).toEqual(['worlds/welt-a/scenes/szene-b.json dateiname']);
  });

  it('meldet einen Weltordner, der nicht der Welt-ID entspricht', () => {
    const inhalt = grundinhalt();
    (inhalt['worlds/welt-a/world.json'] as Daten).id = 'welt-x';
    expect(fehler(inhalt)).toEqual(['worlds/welt-a/world.json dateiname']);
  });

  it('meldet eine Karten-ID, die zweimal im Kartenvorrat vorkommt', () => {
    const inhalt = grundinhalt();
    inhalt['cards/karte-c.json'] = karte('karte-a');
    expect(fehler(inhalt)).toEqual(['cards/karte-c.json dateiname', 'cards/karte-c.json doppelte-id']);
  });

  it('meldet eine Szenen-ID, die in zwei Welten vorkommt', () => {
    const inhalt = grundinhalt();
    inhalt['worlds/welt-b/world.json'] = { id: 'welt-b', title: { de: 'Welt B' }, start: 'szene-b' };
    inhalt['worlds/welt-b/scenes/szene-b.json'] = inhalt['worlds/welt-a/scenes/szene-b.json'];
    inhalt['worlds/welt-b/scenes/szene-b.svg'] = svg();
    expect(fehler(inhalt)).toEqual(['worlds/welt-b/scenes/szene-b.json doppelte-id']);
  });

  it('meldet doppelte IDs unter den Wissensgebieten, den Themengebieten und den Beziehungstypen', () => {
    const inhalt = grundinhalt();
    (inhalt['domains.json'] as Daten[]).push((inhalt['domains.json'] as Daten[])[0]);
    (inhalt['topics.json'] as Daten[]).push((inhalt['topics.json'] as Daten[])[0]);
    (inhalt['relations.json'] as Daten[]).push((inhalt['relations.json'] as Daten[])[0]);
    expect(fehler(inhalt)).toEqual(['domains.json doppelte-id', 'relations.json doppelte-id', 'topics.json doppelte-id']);
  });

  it('erlaubt dieselbe ID für eine Karte und eine Szene', () => {
    const inhalt = grundinhalt();
    inhalt['cards/szene-a.json'] = karte('szene-a');
    expect(fehler(inhalt)).toEqual([]);
  });

  it('meldet einen Hotspot, dessen ID in der Szene zweimal vorkommt', () => {
    const inhalt = grundinhalt();
    const hotspots = (inhalt['worlds/welt-a/scenes/szene-a.json'] as Daten).hotspots;
    hotspots.push({ ...hotspots[2] });
    expect(fehler(inhalt)).toEqual(['worlds/welt-a/scenes/szene-a.json doppelte-id']);
  });
});

describe('Verweise', () => {
  function szeneA(inhalt: Record<string, Daten | string>): Daten {
    return inhalt['worlds/welt-a/scenes/szene-a.json'] as Daten;
  }

  it('meldet einen Hotspot, dessen Karte es nicht gibt', () => {
    const inhalt = grundinhalt();
    szeneA(inhalt).hotspots[0].target = 'karte-x';
    const bericht = pruefe(inhalt);
    expect(bericht.fehler).toEqual([
      {
        datei: 'worlds/welt-a/scenes/szene-a.json',
        regel: 'hotspot-ziel',
        text: 'Der Hotspot „ding-1“ zeigt auf die Karte „karte-x“, die es nicht gibt.',
      },
    ]);
  });

  it('meldet einen Hotspot, dessen Szene es nicht gibt', () => {
    const inhalt = grundinhalt();
    szeneA(inhalt).hotspots[1].target = 'szene-x';
    expect(pruefe(inhalt).fehler).toEqual([
      {
        datei: 'worlds/welt-a/scenes/szene-a.json',
        regel: 'hotspot-ziel',
        text: 'Der Hotspot „ding-2“ zeigt auf die Szene „szene-x“, die es nicht gibt.',
      },
    ]);
  });

  it('sucht Hotspot-Ziele im passenden ID-Raum', () => {
    const inhalt = grundinhalt();
    szeneA(inhalt).hotspots[0].target = 'szene-b';
    szeneA(inhalt).hotspots[1].target = 'karte-b';
    expect(fehler(inhalt)).toEqual([
      'worlds/welt-a/scenes/szene-a.json hotspot-ziel',
      'worlds/welt-a/scenes/szene-a.json hotspot-ziel',
    ]);
  });

  it('meldet eine Eintrittskarte, die es nicht gibt', () => {
    const inhalt = grundinhalt();
    (inhalt['worlds/welt-a/scenes/szene-b.json'] as Daten).card = 'karte-x';
    expect(fehler(inhalt)).toEqual(['worlds/welt-a/scenes/szene-b.json eintrittskarte']);
  });

  it('meldet eine Startszene, die es nicht gibt', () => {
    const inhalt = grundinhalt();
    (inhalt['worlds/welt-a/world.json'] as Daten).start = 'szene-x';
    expect(fehler(inhalt)).toEqual(['worlds/welt-a/world.json startszene']);
  });

  it('verlangt die Startszene in der eigenen Welt', () => {
    const inhalt = grundinhalt();
    inhalt['worlds/welt-b/world.json'] = { id: 'welt-b', title: { de: 'Welt B' }, start: 'szene-a' };
    expect(fehler(inhalt)).toEqual(['worlds/welt-b/world.json startszene']);
  });

  it('meldet ein Themengebiet, das es nicht gibt', () => {
    const inhalt = grundinhalt();
    (inhalt['cards/karte-a.json'] as Daten).topic = 'gebiet-x';
    expect(fehler(inhalt)).toEqual(['cards/karte-a.json themengebiet']);
  });

  it('meldet ein Themengebiet, dessen Wissensgebiet es nicht gibt', () => {
    const inhalt = grundinhalt();
    (inhalt['topics.json'] as Daten[]).push({ id: 'gebiet-b', title: { de: 'Gebiet B' }, domain: 'wissen-x', icon: 'gebiet-b.svg' });
    expect(pruefe(inhalt).fehler).toEqual([
      {
        datei: 'topics.json',
        regel: 'wissensgebiet',
        text: 'Das Themengebiet „gebiet-b“ nennt das Wissensgebiet „wissen-x“, das es nicht gibt.',
      },
    ]);
  });

  it('meldet kein unbekanntes Wissensgebiet, wenn domains.json nur am Schema scheitert', () => {
    const inhalt = grundinhalt();
    (inhalt['domains.json'] as Daten[])[0].color = 'grau';
    expect(fehler(inhalt)).toEqual(['domains.json schema']);
  });

  it('meldet eine Beziehung mit unbekanntem Typ', () => {
    const inhalt = grundinhalt();
    (inhalt['cards/karte-a.json'] as Daten).relations = [{ type: 'typ-x', card: 'karte-b' }];
    expect(fehler(inhalt)).toEqual(['cards/karte-a.json beziehungstyp']);
  });

  it('meldet eine Beziehung mit unbekannter Zielkarte', () => {
    const inhalt = grundinhalt();
    (inhalt['cards/karte-a.json'] as Daten).relations = [{ type: 'typ-a', card: 'karte-x' }];
    expect(fehler(inhalt)).toEqual(['cards/karte-a.json beziehungsziel']);
  });
});

describe('Szenendatei und SVG', () => {
  const pfadA = 'worlds/welt-a/scenes/szene-a';

  it('meldet eine fehlende SVG', () => {
    const inhalt = grundinhalt();
    delete inhalt[`${pfadA}.svg`];
    expect(fehler(inhalt)).toEqual([`${pfadA}.svg svg-fehlt`]);
  });

  it('meldet einen Hotspot ohne data-hotspot in der SVG', () => {
    const inhalt = grundinhalt();
    inhalt[`${pfadA}.svg`] = svg('ding-1', 'ding-2');
    expect(pruefe(inhalt).fehler).toEqual([
      {
        datei: `${pfadA}.svg`,
        regel: 'hotspot-ohne-svg',
        text: 'Der Hotspot „ding-3“ der Szenendatei hat kein Element mit data-hotspot="ding-3".',
      },
    ]);
  });

  it('meldet ein data-hotspot ohne Eintrag in der Szenendatei', () => {
    const inhalt = grundinhalt();
    inhalt[`${pfadA}.svg`] = svg('ding-1', 'ding-2', 'ding-3', 'ding-4');
    expect(fehler(inhalt)).toEqual([`${pfadA}.svg svg-ohne-hotspot`]);
  });

  it('meldet ein data-hotspot, das in der SVG zweimal vorkommt', () => {
    const inhalt = grundinhalt();
    inhalt[`${pfadA}.svg`] = svg('ding-1', 'ding-2', 'ding-3', 'ding-3');
    expect(fehler(inhalt)).toEqual([`${pfadA}.svg doppelte-id`]);
  });

  const verboten: [string, string][] = [
    ['<script>', '<script>alert(1)</script>'],
    ['<style>', '<style>g{}</style>'],
    ['<text>', '<text x="1">Name</text>'],
    ['<title>', '<title>Name</title>'],
    ['<image>', '<image href="#a"/>'],
    ['Filter-Element', '<filter id="f"/>'],
    ['Filter-Attribut', '<rect filter="url(#f)"/>'],
    ['linearer Verlauf', '<linearGradient id="v"/>'],
    ['radialer Verlauf', '<radialGradient id="v"/>'],
    ['Verweis nach außen per href', '<use href="https://example.org/a.svg#x"/>'],
    ['Verweis nach außen per xlink:href', "<use xlink:href='andere.svg#x'/>"],
    ['Verweis nach außen per url()', '<rect fill="url(muster.svg#m)"/>'],
    ['aria-label', '<rect aria-label="Name"/>'],
    ['Ereignis-Attribut', '<rect onclick="alert(1)"/>'],
  ];

  it.each(verboten)('meldet verbotene Inhalte: %s', (_name, schnipsel) => {
    const inhalt = grundinhalt();
    inhalt[`${pfadA}.svg`] = svg('ding-1', 'ding-2', 'ding-3').replace('</svg>', `${schnipsel}\n</svg>`);
    expect(fehler(inhalt)).toEqual([`${pfadA}.svg svg-verboten`]);
  });

  it.each([
    ['<svg:script>', '<svg:script>alert(1)</svg:script>'],
    ['<svg:style>', '<svg:style>g{}</svg:style>'],
    ['<svg:text>', '<svg:text x="1">Name</svg:text>'],
    ['<svg:title>', '<svg:title>Name</svg:title>'],
    ['<svg:image>', '<svg:image href="#a"/>'],
    ['<svg:filter>', '<svg:filter id="f"/>'],
    ['<svg:linearGradient>', '<svg:linearGradient id="v"/>'],
  ])('meldet verbotene Elemente mit Namensraum-Präfix: %s', (_name, schnipsel) => {
    const inhalt = grundinhalt();
    inhalt[`${pfadA}.svg`] = svg('ding-1', 'ding-2', 'ding-3').replace('</svg>', `${schnipsel}\n</svg>`);
    expect(fehler(inhalt)).toEqual([`${pfadA}.svg svg-verboten`]);
  });

  it.each([
    ['<a>', '<a href="#ding-1"><rect width="1" height="1"/></a>', 'a'],
    ['<set>', '<rect><set attributeName="fill" to="#000"/></rect>', 'set'],
    ['<animate>', '<rect><animate attributeName="x" to="1"/></rect>', 'animate'],
    ['<object>', '<object data="a.svg"/>', 'object'],
    ['<foreignObject>', '<foreignObject width="1" height="1"/>', 'foreignObject'],
    ['<svg:set>', '<svg:set attributeName="fill" to="#000"/>', 'svg:set'],
    ['Element aus fremdem Namensraum', '<h:iframe xmlns:h="http://www.w3.org/1999/xhtml" srcdoc="x"/>', 'h:iframe'],
    ['fremdes Präfix vor erlaubtem Namen', '<h:rect xmlns:h="http://www.w3.org/1999/xhtml"/>', 'h:rect'],
  ])('meldet ein Element, das nicht auf der Liste steht: %s', (_name, schnipsel, element) => {
    const inhalt = grundinhalt();
    inhalt[`${pfadA}.svg`] = svg('ding-1', 'ding-2', 'ding-3').replace('</svg>', `${schnipsel}\n</svg>`);
    expect(pruefe(inhalt).fehler).toEqual([
      {
        datei: `${pfadA}.svg`,
        regel: 'svg-verboten',
        text: `Die SVG enthält das Element <${element}>, das in Szenen nicht erlaubt ist. Erlaubt sind nur: svg, g, defs, clipPath, use, path, rect, circle, ellipse, line, polyline, polygon.`,
      },
    ]);
  });

  it('meldet jedes nicht erlaubte Element nur einmal', () => {
    const inhalt = grundinhalt();
    inhalt[`${pfadA}.svg`] = svg('ding-1', 'ding-2', 'ding-3').replace('</svg>', '<set/><set/><animate/>\n</svg>');
    expect(fehler(inhalt)).toEqual([`${pfadA}.svg svg-verboten`, `${pfadA}.svg svg-verboten`]);
  });

  it('erlaubt die Zeichenelemente, auch mit dem Präfix svg:', () => {
    const inhalt = grundinhalt();
    const erlaubt =
      '<g><line x1="0" y1="0" x2="1" y2="1"/><polyline points="0,0 1,1"/><polygon points="0,0 1,1 1,0"/>' +
      '<circle r="1"/><ellipse rx="1" ry="1"/><path d="M0,0"/><svg:rect width="1" height="1"/></g>';
    inhalt[`${pfadA}.svg`] = svg('ding-1', 'ding-2', 'ding-3').replace('</svg>', `${erlaubt}\n</svg>`);
    expect(fehler(inhalt)).toEqual([]);
  });

  it('übergeht nicht erlaubte Elemente in Kommentaren', () => {
    const inhalt = grundinhalt();
    inhalt[`${pfadA}.svg`] = svg('ding-1', 'ding-2', 'ding-3').replace('</svg>', '<!-- <a><set/></a> -->\n</svg>');
    expect(fehler(inhalt)).toEqual([]);
  });

  it('meldet das Attribut style mit einem eigenen Text, auch wenn es einen Filter enthält', () => {
    const inhalt = grundinhalt();
    inhalt[`${pfadA}.svg`] = svg('ding-1', 'ding-2', 'ding-3').replace(
      '</svg>',
      '<rect style="filter:blur(3px)"/>\n</svg>',
    );
    expect(pruefe(inhalt).fehler).toEqual([
      {
        datei: `${pfadA}.svg`,
        regel: 'svg-verboten',
        text: 'Die SVG enthält Verbotenes: Attribut style. Farben und Striche gehören als eigene Attribute an das Element, etwa fill und stroke.',
      },
    ]);
  });

  it('übergeht Kommentare bei der Suche nach Verbotenem', () => {
    const inhalt = grundinhalt();
    inhalt[`${pfadA}.svg`] = svg('ding-1', 'ding-2', 'ding-3').replace(
      '</svg>',
      '<!-- <script>alert(1)</script> <rect style="x"/> -->\n</svg>',
    );
    expect(fehler(inhalt)).toEqual([]);
  });

  it('zählt ein data-hotspot in einem Kommentar nicht als Hotspot', () => {
    const inhalt = grundinhalt();
    inhalt[`${pfadA}.svg`] = svg('ding-1', 'ding-2').replace('</svg>', '<!-- data-hotspot="ding-3" -->\n</svg>');
    expect(fehler(inhalt)).toEqual([`${pfadA}.svg hotspot-ohne-svg`]);
  });

  it('meldet eine Szenen-SVG ohne Szenendatei', () => {
    const inhalt = grundinhalt();
    inhalt['worlds/welt-a/scenes/szene-c.svg'] = svg();
    expect(pruefe(inhalt).fehler).toEqual([
      {
        datei: 'worlds/welt-a/scenes/szene-c.svg',
        regel: 'szene-fehlt',
        text: 'Zur SVG fehlt die Szenendatei szene-c.json.',
      },
    ]);
  });

  it('erlaubt Verweise innerhalb der Datei', () => {
    const inhalt = grundinhalt();
    const erlaubt = '<defs><clipPath id="c"><rect/></clipPath></defs><use href="#c"/><rect clip-path="url(#c)"/>';
    inhalt[`${pfadA}.svg`] = svg('ding-1', 'ding-2', 'ding-3').replace('</svg>', `${erlaubt}\n</svg>`);
    expect(fehler(inhalt)).toEqual([]);
  });
});

describe('Prüfstatus (F34)', () => {
  function mitEntwurf() {
    const inhalt = grundinhalt();
    const texte = (inhalt['cards/karte-a.json'] as Daten).texts;
    texte.de.status = 'entwurf';
    texte['de-einfach'] = { ...texte.de, status: 'geprueft' };
    return inhalt;
  }

  it('ist beim Entwickeln eine Warnung je Textfassung im Entwurf', () => {
    const bericht = pruefe(mitEntwurf(), 'entwickeln');
    expect(bericht.fehler).toEqual([]);
    expect(bericht.warnungen).toEqual([
      { datei: 'cards/karte-a.json', regel: 'pruefstatus', text: 'Die Textfassung „de“ ist ein Entwurf.' },
    ]);
  });

  it('ist beim Veröffentlichen ein Fehler', () => {
    const bericht = pruefe(mitEntwurf(), 'veroeffentlichen');
    expect(bericht.warnungen).toEqual([]);
    expect(bericht.fehler).toEqual([
      { datei: 'cards/karte-a.json', regel: 'pruefstatus', text: 'Die Textfassung „de“ ist ein Entwurf.' },
    ]);
  });
});

describe('Inhaltsverzeichnis (F35)', () => {
  it('enthält alle Welten mit Titel und Startszene', () => {
    expect(pruefe(grundinhalt()).verzeichnis.worlds).toEqual([
      { id: 'welt-a', title: { de: 'Welt A' }, start: 'szene-a' },
    ]);
  });

  it('enthält alle Szenen mit Welt, Titel, Eintrittskarte und Hotspots, aber ohne Hotspot-Texte', () => {
    expect(pruefe(grundinhalt()).verzeichnis.scenes).toEqual([
      {
        id: 'szene-a',
        world: 'welt-a',
        title: { de: 'Szene A' },
        hotspots: [
          { id: 'ding-1', action: 'card', target: 'karte-a' },
          { id: 'ding-2', action: 'scene', target: 'szene-b' },
          { id: 'ding-3', action: 'info' },
        ],
      },
      { id: 'szene-b', world: 'welt-a', title: { de: 'Szene B' }, card: 'karte-b', hotspots: [] },
    ]);
  });

  it('enthält alle Karten mit Titel, Themengebiet und Beziehungen, aber ohne weitere Kartentexte', () => {
    const inhalt = grundinhalt();
    (inhalt['cards/karte-a.json'] as Daten).relations = [{ type: 'typ-a', card: 'karte-b' }];
    expect(pruefe(inhalt).verzeichnis.cards).toEqual([
      { id: 'karte-a', title: { de: 'Titel karte-a' }, topic: 'gebiet-a', relations: [{ type: 'typ-a', card: 'karte-b' }] },
      { id: 'karte-b', title: { de: 'Titel karte-b' }, topic: 'gebiet-a', relations: [] },
    ]);
  });

  it('enthält den Titel einer Karte je Textfassung', () => {
    const inhalt = grundinhalt();
    const texte = (inhalt['cards/karte-a.json'] as Daten).texts;
    texte.en = { ...texte.de, title: 'Title karte-a' };
    expect(pruefe(inhalt).verzeichnis.cards[0]!.title).toEqual({ de: 'Titel karte-a', en: 'Title karte-a' });
  });

  it('enthält Wissensgebiete, Themengebiete und Beziehungstypen mit ausgeschriebenem symmetric, aber ohne acyclic', () => {
    const inhalt = grundinhalt();
    (inhalt['relations.json'] as Daten[])[0].acyclic = true;
    const { domains, topics, relations } = pruefe(inhalt).verzeichnis;
    expect(domains).toEqual([{ id: 'wissen-a', title: { de: 'Wissen A' }, color: '#112233' }]);
    expect(topics).toEqual([{ id: 'gebiet-a', title: { de: 'Gebiet A' }, domain: 'wissen-a', icon: 'gebiet-a.svg' }]);
    expect(relations).toEqual([
      { id: 'typ-a', symmetric: false, forward: { de: 'vor' }, backward: { de: 'zurück' } },
      { id: 'typ-b', symmetric: true, forward: { de: 'neben' } },
    ]);
  });

  it('lässt Dateien aus, die am Schema scheitern', () => {
    const inhalt = grundinhalt();
    delete (inhalt['cards/karte-b.json'] as Daten).topic;
    expect(pruefe(inhalt).verzeichnis.cards.map((k) => k.id)).toEqual(['karte-a']);
  });
});

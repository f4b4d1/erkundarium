import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { INHALTSORDNER } from './pfade.ts';
import { ladeSchemas, type SchemaName } from './schema.ts';

const pruefe = ladeSchemas(join(INHALTSORDNER, 'schema'));

type Daten = Record<string, any>;

function kopie<T>(wert: T): T {
  return structuredClone(wert);
}

function erwarteGueltig(name: SchemaName, daten: unknown) {
  const ergebnis = pruefe(name, daten);
  expect(ergebnis.fehler).toEqual([]);
  expect(ergebnis.gueltig).toBe(true);
}

function erwarteUngueltig(name: SchemaName, daten: unknown) {
  expect(pruefe(name, daten).gueltig).toBe(false);
}

// Beispiele aus Spec v0.1, Abschnitt 6
const welt: Daten = { id: 'fabrik', title: { de: 'Fabrik' }, start: 'fabrikhalle' };

const szene: Daten = {
  id: 'roboterzelle',
  type: 'ansicht',
  title: { de: 'Roboterzelle' },
  card: 'roboterzelle',
  hotspots: [
    { id: 'roboter', action: 'card', target: 'industrieroboter', label: { de: '6-Achs-Industrieroboter' } },
    { id: 'gelenk-3', action: 'scene', target: 'robotergelenk', label: { de: 'Achse 3' } },
    {
      id: 'kabel-leistung',
      action: 'card',
      target: 'motorleitung',
      label: { de: 'Motorleitung' },
      hint: { de: 'Versorgt den Servomotor mit Leistung' },
    },
    {
      id: 'bodenmarkierung',
      action: 'info',
      label: { de: 'Bodenmarkierung' },
      hint: { de: 'Trennt Fahrweg und Arbeitsbereich' },
    },
  ],
};

const karte: Daten = {
  id: 'servomotor',
  topic: 'antriebstechnik',
  image: 'servomotor.svg',
  sources: ['https://...'],
  link: 'https://...',
  relations: [{ type: 'verwandt', card: 'asynchronmotor' }],
  texts: {
    de: {
      status: 'geprueft',
      title: 'Servomotor',
      front: [{ type: 'text', text: '...' }],
      back: [{ type: 'facts', items: ['...'] }],
      linkLabel: '...',
    },
  },
};

const beziehungstypen: Daten[] = [
  { id: 'steuert', forward: { de: 'steuert' }, backward: { de: 'wird gesteuert von' } },
  { id: 'misst', forward: { de: 'misst' }, backward: { de: 'wird gemessen von' } },
  { id: 'verwandt', symmetric: true, forward: { de: 'verwandt mit' } },
];

const themengebiete: Daten[] = [
  { id: 'antriebstechnik', title: { de: 'Antriebstechnik' }, domain: 'technik', icon: 'antriebstechnik.svg' },
];

const wissensgebiete: Daten[] = [{ id: 'technik', title: { de: 'Technik' }, color: '#6B7785' }];

const vorgaben: Daten = {
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
};

describe('IDs', () => {
  it.each(['Fabrik', 'fabrik_halle', 'fabrik halle', '', 'fabrikhalle!', 'ä'])(
    'lehnt die Welt-ID %j ab',
    (id) => erwarteUngueltig('world', { ...welt, id }),
  );

  it('akzeptiert Kleinbuchstaben, Ziffern und Bindestriche', () => {
    erwarteGueltig('world', { ...welt, id: 'welt-2', start: 'halle-1' });
  });

  it('prüft auch Verweise auf IDs', () => {
    erwarteUngueltig('world', { ...welt, start: 'Fabrikhalle' });
    const s = kopie(szene);
    s.hotspots[0].target = 'Industrieroboter';
    erwarteUngueltig('scene', s);
    erwarteUngueltig('card', { ...kopie(karte), topic: 'Antrieb' });
  });
});

describe('Textfassungen', () => {
  it('akzeptiert weitere Fassungen neben de', () => {
    erwarteGueltig('world', { ...welt, title: { de: 'Fabrik', 'de-einfach': 'Die Fabrik' } });
  });

  it('verlangt de', () => {
    erwarteUngueltig('world', { ...welt, title: { 'de-einfach': 'Die Fabrik' } });
  });

  it('lehnt ungültige Fassungs-IDs ab', () => {
    erwarteUngueltig('world', { ...welt, title: { de: 'Fabrik', DE: 'Fabrik' } });
  });

  it('lehnt leere Texte und Nicht-Texte ab', () => {
    erwarteUngueltig('world', { ...welt, title: { de: '' } });
    erwarteUngueltig('world', { ...welt, title: 'Fabrik' });
  });
});

describe('world.json', () => {
  it('akzeptiert das Beispiel aus der Spec', () => erwarteGueltig('world', welt));

  it.each(['id', 'title', 'start'])('verlangt %s', (feld) => {
    const w = kopie(welt);
    delete w[feld];
    erwarteUngueltig('world', w);
  });

  it('verbietet unbekannte Felder', () => erwarteUngueltig('world', { ...welt, titel: { de: 'x' } }));
});

describe('Szene', () => {
  it('akzeptiert das Beispiel aus der Spec', () => erwarteGueltig('scene', szene));

  it('akzeptiert eine Szene ohne Eintrittskarte', () => {
    const s = kopie(szene);
    delete s.card;
    erwarteGueltig('scene', s);
  });

  it.each(['id', 'type', 'title', 'hotspots'])('verlangt %s', (feld) => {
    const s = kopie(szene);
    delete s[feld];
    erwarteUngueltig('scene', s);
  });

  it.each(['ansicht', 'objekt', 'schema'])('akzeptiert den Szenentyp %s', (type) =>
    erwarteGueltig('scene', { ...kopie(szene), type }),
  );

  it('lehnt andere Szenentypen ab', () => erwarteUngueltig('scene', { ...kopie(szene), type: 'karte' }));

  it('verbietet unbekannte Felder in Szene und Hotspot', () => {
    erwarteUngueltig('scene', { ...kopie(szene), parent: 'fabrikhalle' });
    const s = kopie(szene);
    s.hotspots[0].tagret = 'x';
    erwarteUngueltig('scene', s);
  });

  it('lehnt eine unbekannte Aktion ab', () => {
    const s = kopie(szene);
    s.hotspots[0].action = 'zoom';
    erwarteUngueltig('scene', s);
  });

  it.each(['id', 'action', 'label'])('verlangt %s am Hotspot', (feld) => {
    const s = kopie(szene);
    delete s.hotspots[0][feld];
    erwarteUngueltig('scene', s);
  });

  it.each([0, 1])('verlangt target bei card und scene (Hotspot %i)', (i) => {
    const s = kopie(szene);
    delete s.hotspots[i].target;
    erwarteUngueltig('scene', s);
  });

  it('verbietet target bei info', () => {
    const s = kopie(szene);
    s.hotspots[3].target = 'bodenmarkierung';
    erwarteUngueltig('scene', s);
  });

  it('verlangt hint bei info', () => {
    const s = kopie(szene);
    delete s.hotspots[3].hint;
    erwarteUngueltig('scene', s);
  });

  it('verlangt de in label und hint', () => {
    const s = kopie(szene);
    s.hotspots[2].hint = { 'de-einfach': 'Bringt Strom zum Motor' };
    erwarteUngueltig('scene', s);
  });
});

describe('Karte', () => {
  it('akzeptiert das Beispiel aus der Spec', () => erwarteGueltig('card', karte));

  it('akzeptiert eine Karte ohne image, link, linkLabel und relations', () => {
    const k = kopie(karte);
    delete k.image;
    delete k.link;
    delete k.relations;
    delete k.texts.de.linkLabel;
    erwarteGueltig('card', k);
  });

  it.each(['id', 'topic', 'sources', 'texts'])('verlangt %s', (feld) => {
    const k = kopie(karte);
    delete k[feld];
    erwarteUngueltig('card', k);
  });

  it('verlangt mindestens eine Quelle', () => erwarteUngueltig('card', { ...kopie(karte), sources: [] }));

  it('verbietet unbekannte Felder', () => {
    erwarteUngueltig('card', { ...kopie(karte), quelle: 'x' });
    const k = kopie(karte);
    k.texts.de.subtitle = 'x';
    erwarteUngueltig('card', k);
    const r = kopie(karte);
    r.relations[0].label = 'x';
    erwarteUngueltig('card', r);
  });

  it('verlangt die Textfassung de', () => {
    const k = kopie(karte);
    k.texts = { 'de-einfach': k.texts.de };
    erwarteUngueltig('card', k);
  });

  it('akzeptiert eine weitere Textfassung', () => {
    const k = kopie(karte);
    k.texts['de-einfach'] = { ...k.texts.de, status: 'entwurf' };
    erwarteGueltig('card', k);
  });

  it.each(['status', 'title', 'front', 'back'])('verlangt %s je Textfassung', (feld) => {
    const k = kopie(karte);
    delete k.texts.de[feld];
    erwarteUngueltig('card', k);
  });

  it('akzeptiert den Prüfstatus entwurf', () => {
    const k = kopie(karte);
    k.texts.de.status = 'entwurf';
    erwarteGueltig('card', k);
  });

  it('lehnt andere Prüfstatus ab', () => {
    const k = kopie(karte);
    k.texts.de.status = 'fertig';
    erwarteUngueltig('card', k);
  });

  it('verlangt mindestens einen Baustein auf der Vorderseite', () => {
    const k = kopie(karte);
    k.texts.de.front = [];
    erwarteUngueltig('card', k);
  });

  it('verlangt eine SVG-Datei als image', () => {
    erwarteUngueltig('card', { ...kopie(karte), image: 'servomotor.png' });
    erwarteUngueltig('card', { ...kopie(karte), image: '../servomotor.svg' });
  });

  it('verlangt einen Web-Link als link', () => {
    erwarteUngueltig('card', { ...kopie(karte), link: 'servomotor.html' });
  });

  it('verlangt type und card an einer Beziehung', () => {
    const k = kopie(karte);
    k.relations = [{ type: 'verwandt' }];
    erwarteUngueltig('card', k);
    k.relations = [{ card: 'asynchronmotor' }];
    erwarteUngueltig('card', k);
  });

  describe('Bausteine', () => {
    const gueltige: Daten[] = [
      { type: 'text', text: 'Ein Servomotor ist geregelt.' },
      { type: 'list', items: ['Motor', 'Geber'] },
      { type: 'facts', items: ['Leistung: 0,1 bis 15 kW'] },
      { type: 'table', rows: [['Größe', 'Wert'], ['Drehzahl', '3000 1/min']] },
      { type: 'funfact', text: 'Servo kommt von servus, der Diener.' },
    ];

    it.each(gueltige)('akzeptiert $type', (baustein) => {
      const k = kopie(karte);
      k.texts.de.back = [baustein];
      erwarteGueltig('card', k);
    });

    const ungueltige: [string, Daten][] = [
      ['unbekannter Typ', { type: 'bild', text: 'x' }],
      ['text ohne text', { type: 'text' }],
      ['text mit items', { type: 'text', text: 'x', items: ['x'] }],
      ['list ohne items', { type: 'list' }],
      ['list mit leeren items', { type: 'list', items: [] }],
      ['facts mit text statt items', { type: 'facts', text: 'x' }],
      ['table ohne rows', { type: 'table' }],
      ['table mit Zeile ohne Zellen', { type: 'table', rows: [[]] }],
      ['table mit Zahl als Zelle', { type: 'table', rows: [[1]] }],
      ['funfact ohne text', { type: 'funfact' }],
      ['funfact mit leerem text', { type: 'funfact', text: '' }],
    ];

    it.each(ungueltige)('lehnt ab: %s', (_name, baustein) => {
      const k = kopie(karte);
      k.texts.de.front = [baustein];
      erwarteUngueltig('card', k);
    });
  });
});

describe('relations.json', () => {
  it('akzeptiert das Beispiel aus der Spec', () => erwarteGueltig('relations', beziehungstypen));

  it('akzeptiert acyclic', () => {
    erwarteGueltig('relations', [{ ...beziehungstypen[0], acyclic: true }]);
  });

  it('verlangt forward', () => {
    erwarteUngueltig('relations', [{ id: 'steuert', backward: { de: 'wird gesteuert von' } }]);
  });

  it('verlangt backward bei nicht symmetrischen Typen', () => {
    erwarteUngueltig('relations', [{ id: 'steuert', forward: { de: 'steuert' } }]);
    erwarteUngueltig('relations', [{ id: 'steuert', symmetric: false, forward: { de: 'steuert' } }]);
  });

  it('verbietet backward bei symmetrischen Typen', () => {
    erwarteUngueltig('relations', [{ ...beziehungstypen[2], backward: { de: 'verwandt mit' } }]);
  });

  it('verlangt Wahrheitswerte für symmetric und acyclic', () => {
    erwarteUngueltig('relations', [{ ...beziehungstypen[2], symmetric: 'true' }]);
    erwarteUngueltig('relations', [{ ...beziehungstypen[0], acyclic: 1 }]);
  });

  it('verbietet unbekannte Felder', () => {
    erwarteUngueltig('relations', [{ ...beziehungstypen[0], symetric: true }]);
  });

  it('verlangt eine Liste', () => erwarteUngueltig('relations', beziehungstypen[0]));
});

describe('topics.json', () => {
  it('akzeptiert das Beispiel aus der Spec', () => erwarteGueltig('topics', themengebiete));

  it.each(['id', 'title', 'domain', 'icon'])('verlangt %s', (feld) => {
    const t = kopie(themengebiete);
    delete t[0][feld];
    erwarteUngueltig('topics', t);
  });

  it('verlangt eine ID als domain', () => {
    erwarteUngueltig('topics', [{ ...themengebiete[0], domain: 'Technik' }]);
  });

  it('verlangt eine SVG-Datei als icon', () => {
    erwarteUngueltig('topics', [{ ...themengebiete[0], icon: 'antrieb.png' }]);
  });

  it('verbietet unbekannte Felder, auch die frühere Farbe', () => {
    erwarteUngueltig('topics', [{ ...themengebiete[0], colour: '#FF7A1A' }]);
    erwarteUngueltig('topics', [{ ...themengebiete[0], color: '#FF7A1A' }]);
  });
});

describe('domains.json', () => {
  it('akzeptiert das Beispiel aus der Spec', () => erwarteGueltig('domains', wissensgebiete));

  it('akzeptiert die Datei content/domains.json', () => {
    const datei = JSON.parse(readFileSync(join(INHALTSORDNER, 'domains.json'), 'utf8'));
    erwarteGueltig('domains', datei);
  });

  it.each(['id', 'title', 'color'])('verlangt %s', (feld) => {
    const w = kopie(wissensgebiete);
    delete w[0][feld];
    erwarteUngueltig('domains', w);
  });

  it('verlangt eine ID als id', () => {
    erwarteUngueltig('domains', [{ ...wissensgebiete[0], id: 'Technik' }]);
  });

  it.each(['6B7785', '#6B778', 'grau', '#GG7785'])('lehnt die Farbe %j ab', (color) => {
    erwarteUngueltig('domains', [{ ...wissensgebiete[0], color }]);
  });

  it('verbietet unbekannte Felder', () => {
    erwarteUngueltig('domains', [{ ...wissensgebiete[0], icon: 'technik.svg' }]);
  });

  it('verlangt eine Liste', () => erwarteUngueltig('domains', wissensgebiete[0]));
});

describe('limits.json', () => {
  it('akzeptiert eine vollständige Vorgabe', () => erwarteGueltig('limits', vorgaben));

  it('akzeptiert die Datei content/limits.json', () => {
    const datei = JSON.parse(readFileSync(join(INHALTSORDNER, 'limits.json'), 'utf8'));
    erwarteGueltig('limits', datei);
  });

  it.each(Object.keys(vorgaben))('verlangt %s', (feld) => {
    const v = kopie(vorgaben);
    delete v[feld];
    erwarteUngueltig('limits', v);
  });

  it.each([0, -1, 2.5, '40'])('verlangt positive ganze Zahlen, nicht %j', (wert) => {
    erwarteUngueltig('limits', { ...vorgaben, maxTitleLength: wert });
  });

  it('verbietet unbekannte Felder', () => erwarteUngueltig('limits', { ...vorgaben, maxTitelLength: 40 }));

  it.each(['min', 'max'])('verlangt frontText.%s', (feld) => {
    const v = kopie(vorgaben);
    delete v.frontText[feld];
    erwarteUngueltig('limits', v);
  });

  it('verbietet unbekannte Felder in frontText', () =>
    erwarteUngueltig('limits', { ...vorgaben, frontText: { min: 300, max: 400, mittel: 350 } }));
});

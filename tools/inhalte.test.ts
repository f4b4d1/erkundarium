import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { pruefeInhaltsordner } from './inhaltsordner.ts';

// Hält den bekannten Zustand der echten Inhalte fest. Ändert sich eine Meldung, ist das Absicht oder ein Fehler.
it('das Prüfskript meldet auf den echten Inhalten genau die erwarteten Meldungen', () => {
  const bericht = pruefeInhaltsordner(fileURLToPath(new URL('../content/', import.meta.url)), 'entwickeln');

  // Die Szene roboterzelle wird im nächsten Schritt gezeichnet.
  expect(bericht.fehler).toEqual([
    {
      datei: 'worlds/fabrik/scenes/fabrikhalle.json',
      regel: 'hotspot-ziel',
      text: 'Der Hotspot „roboter“ zeigt auf die Szene „roboterzelle“, die es nicht gibt.',
    },
  ]);

  // Alle Karten sind noch Entwürfe.
  expect(bericht.warnungen.map((m) => `${m.datei} ${m.regel}`)).toEqual(
    [
      'encoder',
      'greifer',
      'hallenleuchte',
      'haltebremse',
      'industrieroboter',
      'kabelkanal',
      'motorleitung',
      'not-halt-und-zaun',
      'robotergelenk',
      'roboterzelle',
      'wellgetriebe',
    ].map((id) => `cards/${id}.json pruefstatus`),
  );
});

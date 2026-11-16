import { expect, it } from 'vitest';
import { pruefeInhaltsordner } from './inhaltsordner.ts';
import { INHALTSORDNER } from './pfade.ts';

// Hält den bekannten Zustand der echten Inhalte fest, ohne die Karten aufzuzählen (Q1).
it('das Prüfskript meldet auf den echten Inhalten nur die bekannten Meldungen', () => {
  const bericht = pruefeInhaltsordner(INHALTSORDNER, 'entwickeln');

  expect(bericht.fehler).toEqual([]);

  // Warnungen kommen nur von Karten, die noch Entwürfe sind.
  expect(bericht.warnungen.filter((m) => m.regel !== 'pruefstatus')).toEqual([]);
});

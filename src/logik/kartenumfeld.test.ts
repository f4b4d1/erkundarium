import { describe, expect, it } from 'vitest';
import { kartenumfeld } from './kartenumfeld.ts';
import { testverzeichnis } from './testverzeichnis.ts';

const verzeichnis = testverzeichnis({
  szenen: { halle: { karten: ['motor'] }, zelle: { eintrittskarte: 'motor' }, leer: {} },
  karten: ['motor', 'encoder', 'bremse', 'regler'],
  typen: { misst: 'gerichtet', verwandt: 'symmetrisch' },
  beziehungen: [
    ['encoder', 'misst', 'motor'],
    ['motor', 'verwandt', 'bremse'],
    ['motor', 'misst', 'regler'],
  ],
});

describe('kartenumfeld', () => {
  it('nennt die Fundorte als Szenentitel in der Textfassung', () => {
    const v = {
      ...verzeichnis,
      scenes: verzeichnis.scenes.map((s) => (s.id === 'halle' ? { ...s, title: { de: 'Fabrikhalle', en: 'Factory hall' } } : s)),
    };
    expect(kartenumfeld(v, 'motor', new Set(), 'de').fundorte).toEqual(['Fabrikhalle', 'zelle']);
    expect(kartenumfeld(v, 'motor', new Set(), 'en').fundorte).toEqual(['Factory hall', 'zelle']);
  });

  it('nimmt die Szenen-ID, wenn der Titel fehlt', () => {
    const v = { ...verzeichnis, scenes: verzeichnis.scenes.map((s) => ({ ...s, title: {} })) };
    expect(kartenumfeld(v, 'motor', new Set(), 'de').fundorte).toEqual(['halle', 'zelle']);
  });

  it('liefert Gruppen mit Bezeichnung und Nachbarkarten samt Titel und Fundstatus', () => {
    const umfeld = kartenumfeld(verzeichnis, 'motor', new Set(['encoder', 'regler']), 'de');
    expect(umfeld.beziehungen).toEqual([
      { bezeichnung: 'misst vor', karten: [{ id: 'regler', titel: 'regler', gefunden: true }] },
      { bezeichnung: 'misst zurück', karten: [{ id: 'encoder', titel: 'encoder', gefunden: true }] },
      { bezeichnung: 'verwandt mit', karten: [{ id: 'bremse', titel: 'bremse', gefunden: false }] },
    ]);
  });

  it('liefert für eine Karte ohne Fundort und Beziehung leere Blöcke', () => {
    expect(kartenumfeld(verzeichnis, 'bremse', new Set(), 'de').fundorte).toEqual([]);
    const ohne = testverzeichnis({ karten: ['a'] });
    expect(kartenumfeld(ohne, 'a', new Set(), 'de')).toEqual({ fundorte: [], beziehungen: [] });
  });
});

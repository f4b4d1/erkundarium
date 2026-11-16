// Einbindung der Inhalte in Vite.
// Entwicklungsserver: Die Inhaltsdateien liefert Vite selbst unter content/ aus. Das Inhaltsverzeichnis
// liegt nur im Speicher, wird bei jeder Änderung unter content/ neu erzeugt und unter VERZEICHNIS ausgeliefert.
// Build: Das Prüfskript läuft vorab und bricht bei Fehlern ab; danach landen Inhaltsdateien (ohne Schemas)
// und Verzeichnis unter dist/content/. Mit --mode veroeffentlichen prüft es in der Stufe Veröffentlichen.
import { isAbsolute, relative } from 'node:path';
import type { Logger, Plugin } from 'vite';
import { formatiereBericht } from './bericht.ts';
import { leseInhaltsordner, pruefeInhaltsordner } from './inhaltsordner.ts';
import { INHALTSORDNER as ordner } from './pfade.ts';
import type { Pruefbericht, Stufe } from './pruefung.ts';

/** Pfad des Inhaltsverzeichnisses relativ zur Seite. */
export const VERZEICHNIS = 'content/inhaltsverzeichnis.json';

function pruefe(stufe: Stufe, logger: Logger): Pruefbericht {
  const bericht = pruefeInhaltsordner(ordner, stufe);
  // formatiereBericht liefert erst die Fehler, dann die Warnungen, zuletzt die Zusammenfassung.
  const zeilen = formatiereBericht(bericht, stufe, 'content/');
  const fehler = bericht.fehler.length;
  const warnungen = bericht.warnungen.length;
  for (const zeile of zeilen.slice(0, fehler)) logger.error(zeile);
  for (const zeile of zeilen.slice(fehler, fehler + warnungen)) logger.warn(zeile);
  for (const zeile of zeilen.slice(fehler + warnungen)) logger.info(zeile);
  return bericht;
}

function liegtImInhaltsordner(pfad: string): boolean {
  const rel = relative(ordner, pfad);
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

export function inhalte(): Plugin[] {
  return [entwickeln(), bauen()];
}

function entwickeln(): Plugin {
  return {
    name: 'erkundarium-inhalte-entwickeln',
    // Nicht unter Vitest, das ebenfalls einen Server startet.
    apply: (_config, { command, mode }) => command === 'serve' && mode !== 'test',
    configureServer(server) {
      const logger = server.config.logger;
      let verzeichnis = '';
      const erzeuge = () => {
        verzeichnis = JSON.stringify(pruefe('entwickeln', logger).verzeichnis);
      };
      erzeuge();
      server.watcher.on('all', (_ereignis, pfad) => {
        if (liegtImInhaltsordner(pfad)) erzeuge();
      });
      const adresse = `${server.config.base}${VERZEICHNIS}`;
      server.middlewares.use((anfrage, antwort, weiter) => {
        if (new URL(anfrage.url ?? '/', 'http://localhost').pathname !== adresse) return weiter();
        antwort.setHeader('Content-Type', 'application/json; charset=utf-8');
        antwort.setHeader('Cache-Control', 'no-store');
        antwort.end(verzeichnis);
      });
    },
  };
}

function bauen(): Plugin {
  let stufe: Stufe = 'entwickeln';
  let logger: Logger;
  let bericht: Pruefbericht;
  return {
    name: 'erkundarium-inhalte-bauen',
    apply: 'build',
    configResolved(config) {
      stufe = config.mode === 'veroeffentlichen' ? 'veroeffentlichen' : 'entwickeln';
      logger = config.logger;
    },
    buildStart() {
      bericht = pruefe(stufe, logger);
      if (bericht.fehler.length > 0) {
        this.error(`Build abgebrochen: Das Prüfskript meldet ${bericht.fehler.length} Fehler.`);
      }
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: VERZEICHNIS, source: JSON.stringify(bericht.verzeichnis) });
      for (const [pfad, inhalt] of Object.entries(leseInhaltsordner(ordner))) {
        if (pfad.startsWith('schema/')) continue;
        this.emitFile({ type: 'asset', fileName: `content/${pfad}`, source: inhalt });
      }
    },
  };
}

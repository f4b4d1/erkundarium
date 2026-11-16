// Kommandozeile: node tools/browser.ts <szenario> [ausgabeordner]
//
// Spielt ein Szenario im echten Browser durch: startet Vite (Port 5199) und Edge headless
// (CDP-Port 9333), ruft die Standardfunktion des Szenarios mit einem `Browser` auf und beendet
// danach beide Prozesse, auch bei Fehlern. Fotos landen im Ausgabeordner (Standard: Ordner des
// Szenarios). Das Szenario ist eine .ts- oder .mjs-Datei außerhalb des Projekts, etwa:
//
//   import type { Browser } from '<Projekt>/tools/browser.ts';   // nur für Typen, optional
//   export default async function (b: Browser) {
//     await b.oeffne({ leererSpielstand: true });
//     await b.klickeHotspot('roboter');
//     await b.warteAuf(`document.querySelector('[aria-current]')?.textContent === 'Roboterzelle'`);
//     console.log(await b.zustand());
//     await b.foto('roboterzelle.png');
//   }
//
// Rückgabecode 1, wenn das Szenario scheitert; 2 bei falschem Aufruf. Edge wird unter dem
// üblichen Windows-Pfad gesucht; abweichend über die Umgebungsvariable ERKUNDARIUM_EDGE.

import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const VITE_PORT = 5199;
const CDP_PORT = 9333;
const BASIS = `http://localhost:${VITE_PORT}`;
const PROJEKT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export interface Anfrageersatz {
  status?: number;
  typ?: string;
  inhalt: string;
}

export interface Browser {
  /** Lädt die Seite und wartet, bis eine Szene dasteht. Mit `leererSpielstand` vorher `localStorage` leeren. */
  oeffne(optionen?: { pfad?: string; leererSpielstand?: boolean }): Promise<void>;
  /** Wertet einen JavaScript-Ausdruck in der Seite aus und gibt den Wert zurück (Promises werden abgewartet). */
  werte<T = unknown>(ausdruck: string): Promise<T>;
  /** Wartet, bis der Ausdruck wahr ist; wirft nach `ms` Millisekunden. */
  warteAuf(ausdruck: string, ms?: number): Promise<void>;
  warte(ms: number): Promise<void>;
  /** Mausklick auf eine Stelle, an der das Element wirklich getroffen wird (nicht verdeckt). */
  klicke(selektor: string): Promise<void>;
  klickeHotspot(id: string): Promise<void>;
  /** Fährt mit der Maus über das Element, ohne zu klicken. */
  zeigeAuf(selektor: string): Promise<void>;
  /** Bewegt die Maus an die Stelle (CSS-Pixel im Fenster), ohne zu klicken. */
  mausNach(x: number, y: number): Promise<void>;
  /** Mausklick an der Stelle (CSS-Pixel im Fenster), auch auf Verdecktes. */
  klickeBei(x: number, y: number): Promise<void>;
  /** Taste drücken: Enter, Escape, Tab, Leertaste, Pfeiltasten; mit `umschalt` etwa Shift+Tab. */
  taste(name: 'Enter' | 'Escape' | 'Tab' | ' ' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown', umschalt?: boolean): Promise<void>;
  /** Speichert ein Bildschirmfoto im Ausgabeordner und gibt den absoluten Pfad zurück. */
  foto(name: string): Promise<string>;
  /** Kurzer Überblick: Pfad, Fokus, Hinweis, Meldungen, offene Karte, Spielstand. */
  zustand(): Promise<Record<string, unknown>>;
  /** Fenstergröße in CSS-Pixeln (Standard 1280 × 800). */
  fenster(breite: number, hoehe: number): Promise<void>;
  bewegungReduzieren(an: boolean): Promise<void>;
  /** Anfragen, deren URL `urlTeil` enthält, scheitern (`'fehler'`) oder bekommen diese Antwort. Gilt ab dem nächsten Laden. */
  ersetzeAnfrage(urlTeil: string, antwort: 'fehler' | Anfrageersatz): Promise<void>;
  /** Roher CDP-Befehl für alles andere. */
  cdp(methode: string, parameter?: Record<string, unknown>): Promise<Record<string, unknown>>;
}

const pause = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function erreichbar(url: string): Promise<boolean> {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

async function warteAufUrl(url: string, ms: number, was: string): Promise<void> {
  const ende = Date.now() + ms;
  while (Date.now() < ende) {
    if (await erreichbar(url)) return;
    await pause(200);
  }
  throw new Error(`${was} ist nach ${ms} ms nicht erreichbar (${url}).`);
}

function edgePfad(): string {
  const kandidaten = [
    process.env.ERKUNDARIUM_EDGE,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  const pfad = kandidaten.find((k) => k !== undefined && fs.existsSync(k));
  if (pfad === undefined) throw new Error('Edge nicht gefunden; Pfad über ERKUNDARIUM_EDGE angeben.');
  return pfad;
}

/** Beendet den Prozess samt Kindprozessen. */
function beende(prozess: ChildProcess | undefined): void {
  if (prozess?.pid === undefined || prozess.exitCode !== null) return;
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(prozess.pid), '/T', '/F'], { stdio: 'ignore' });
  else prozess.kill('SIGKILL');
}

interface Antwort {
  id?: number;
  method?: string;
  params?: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: { message: string };
}

async function verbinde(ausgabeordner: string): Promise<{ browser: Browser; schliessen: () => void }> {
  const ziele = (await (await fetch(`http://localhost:${CDP_PORT}/json/list`)).json()) as { type: string; webSocketDebuggerUrl: string }[];
  const seite = ziele.find((z) => z.type === 'page');
  if (seite === undefined) throw new Error('Edge hat keine Seite geöffnet.');
  const ws = new WebSocket(seite.webSocketDebuggerUrl);
  await new Promise<void>((r, f) => {
    ws.addEventListener('open', () => r());
    ws.addEventListener('error', () => f(new Error('CDP-Verbindung gescheitert.')));
  });

  let naechsteId = 0;
  const offen = new Map<number, (a: Antwort) => void>();
  const ersatz = new Map<string, 'fehler' | Anfrageersatz>();
  let abfangen = false;

  function cdp(methode: string, parameter: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const id = ++naechsteId;
    return new Promise((r, f) => {
      offen.set(id, (a) => (a.error ? f(new Error(`${methode}: ${a.error.message}`)) : r(a.result ?? {})));
      ws.send(JSON.stringify({ id, method: methode, params: parameter }));
    });
  }

  ws.addEventListener('message', (e) => {
    const a = JSON.parse(String(e.data)) as Antwort;
    if (a.id !== undefined) {
      offen.get(a.id)?.(a);
      offen.delete(a.id);
      return;
    }
    if (a.method !== 'Fetch.requestPaused' || a.params === undefined) return;
    const requestId = a.params.requestId as string;
    const url = (a.params.request as { url: string }).url;
    const regel = [...ersatz].find(([teil]) => url.includes(teil))?.[1];
    if (regel === undefined) void cdp('Fetch.continueRequest', { requestId });
    else if (regel === 'fehler') void cdp('Fetch.failRequest', { requestId, errorReason: 'Failed' });
    else
      void cdp('Fetch.fulfillRequest', {
        requestId,
        responseCode: regel.status ?? 200,
        responseHeaders: [{ name: 'Content-Type', value: regel.typ ?? 'text/plain' }],
        body: Buffer.from(regel.inhalt).toString('base64'),
      });
  });

  async function werte<T>(ausdruck: string): Promise<T> {
    const r = (await cdp('Runtime.evaluate', { expression: ausdruck, returnByValue: true, awaitPromise: true })) as {
      result: { value: T };
      exceptionDetails?: { text: string; exception?: { description?: string } };
    };
    if (r.exceptionDetails) throw new Error(`In der Seite: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`);
    return r.result.value;
  }

  async function warteAuf(ausdruck: string, ms = 5000): Promise<void> {
    const ende = Date.now() + ms;
    while (Date.now() < ende) {
      if (await werte<boolean>(`Boolean(${ausdruck})`)) return;
      await pause(50);
    }
    throw new Error(`Nach ${ms} ms noch nicht wahr: ${ausdruck}`);
  }

  /** Ein Punkt, an dem `elementFromPoint` das Element trifft; wirft, wenn es überall verdeckt ist. */
  async function trefferpunkt(selektor: string): Promise<[number, number]> {
    const punkt = await werte<[number, number] | null | 'verdeckt'>(`(() => {
      const el = document.querySelector(${JSON.stringify(selektor)});
      if (!el) return null;
      const b = el.getBoundingClientRect();
      for (let i = 1; i < 20; i++) for (let j = 1; j < 20; j++) {
        const x = b.left + (b.width * i) / 20, y = b.top + (b.height * j) / 20;
        const t = document.elementFromPoint(x, y);
        // Hotspots können ineinander liegen (Gelenke im Roboter): Der nächste Hotspot über dem Treffer muss dieser sein.
        const getroffen = el.hasAttribute('data-hotspot') ? t?.closest('[data-hotspot]') === el : t !== null && el.contains(t);
        if (getroffen) return [x, y];
      }
      return 'verdeckt';
    })()`);
    if (punkt === null) throw new Error(`Element nicht gefunden: ${selektor}`);
    if (punkt === 'verdeckt') throw new Error(`Element ist überall verdeckt: ${selektor}`);
    return punkt;
  }

  const tasten = {
    Enter: { code: 'Enter', vk: 13, text: '\r' },
    Escape: { code: 'Escape', vk: 27 },
    Tab: { code: 'Tab', vk: 9 },
    ' ': { code: 'Space', vk: 32, text: ' ' },
    ArrowLeft: { code: 'ArrowLeft', vk: 37 },
    ArrowUp: { code: 'ArrowUp', vk: 38 },
    ArrowRight: { code: 'ArrowRight', vk: 39 },
    ArrowDown: { code: 'ArrowDown', vk: 40 },
  } as const;

  const browser: Browser = {
    async oeffne({ pfad = '/', leererSpielstand = false } = {}) {
      if (leererSpielstand) {
        await cdp('Page.navigate', { url: `${BASIS}/` });
        await warteAuf(`document.readyState === 'complete'`);
        await werte('localStorage.clear()');
      }
      await cdp('Page.navigate', { url: BASIS + pfad });
      await warteAuf(`document.querySelector('.szene svg') || document.querySelector('.fehler')`, 10000);
    },
    werte,
    warteAuf,
    warte: pause,
    async klicke(selektor) {
      const [x, y] = await trefferpunkt(selektor);
      await browser.klickeBei(x, y);
    },
    klickeHotspot(id) {
      return browser.klicke(`[data-hotspot="${id}"]`);
    },
    async zeigeAuf(selektor) {
      const [x, y] = await trefferpunkt(selektor);
      await browser.mausNach(x, y);
    },
    async mausNach(x, y) {
      await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    },
    async klickeBei(x, y) {
      await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
      await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
      await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    },
    async taste(name, umschalt = false) {
      const t = tasten[name];
      const basis = { key: name, code: t.code, windowsVirtualKeyCode: t.vk, modifiers: umschalt ? 8 : 0 };
      await cdp('Input.dispatchKeyEvent', { type: 'keyDown', ...basis, ...('text' in t ? { text: t.text } : {}) });
      await cdp('Input.dispatchKeyEvent', { type: 'keyUp', ...basis });
    },
    async foto(name) {
      const r = (await cdp('Page.captureScreenshot', { format: 'png' })) as { data: string };
      const ziel = path.resolve(ausgabeordner, name);
      fs.writeFileSync(ziel, Buffer.from(r.data, 'base64'));
      return ziel;
    },
    zustand() {
      return werte(`(() => {
        const f = document.activeElement;
        return {
          pfad: [...document.querySelectorAll('.pfad li')].map((l) => l.textContent.replace('›', '').trim()),
          fokus: f ? f.tagName.toLowerCase() + (f.getAttribute('data-hotspot') ? '#' + f.getAttribute('data-hotspot') : '') : null,
          hinweis: document.querySelector('.hinweis')?.textContent ?? null,
          meldungen: [...document.querySelectorAll('.meldungen p')].map((p) => p.textContent),
          karteOffen: !!document.querySelector('dialog[open]'),
          fehler: document.querySelector('.fehler')?.textContent ?? null,
          spielstand: Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])),
        };
      })()`);
    },
    async fenster(breite, hoehe) {
      await cdp('Emulation.setDeviceMetricsOverride', { width: breite, height: hoehe, deviceScaleFactor: 1, mobile: false });
    },
    async bewegungReduzieren(an) {
      await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: an ? 'reduce' : '' }] });
    },
    async ersetzeAnfrage(urlTeil, antwort) {
      ersatz.set(urlTeil, antwort);
      if (!abfangen) {
        abfangen = true;
        await cdp('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
      }
    },
    cdp,
  };

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await browser.fenster(1280, 800);
  return { browser, schliessen: () => ws.close() };
}

async function hauptprogramm(): Promise<number> {
  const [szenario, ordner] = process.argv.slice(2);
  if (szenario === undefined) {
    console.error('Aufruf: node tools/browser.ts <szenario> [ausgabeordner]');
    return 2;
  }
  const szenarioPfad = path.resolve(szenario);
  const ausgabeordner = path.resolve(ordner ?? path.dirname(szenarioPfad));
  fs.mkdirSync(ausgabeordner, { recursive: true });

  if (await erreichbar(BASIS)) throw new Error(`Port ${VITE_PORT} ist belegt; den alten Vite-Server zuerst beenden.`);
  if (await erreichbar(`http://localhost:${CDP_PORT}/json/version`)) throw new Error(`Port ${CDP_PORT} ist belegt; das alte Edge zuerst beenden.`);

  const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'erkundarium-edge-'));
  let vite: ChildProcess | undefined;
  let edge: ChildProcess | undefined;
  let verbindung: { schliessen: () => void } | undefined;
  const aufraeumen = () => {
    verbindung?.schliessen();
    beende(edge);
    beende(vite);
  };
  process.on('SIGINT', () => {
    aufraeumen();
    process.exit(130);
  });

  try {
    vite = spawn(process.execPath, [path.join(PROJEKT, 'node_modules/vite/bin/vite.js'), '--port', String(VITE_PORT), '--strictPort'], {
      cwd: PROJEKT,
      stdio: 'ignore',
    });
    await warteAufUrl(BASIS, 20000, 'Vite');
    edge = spawn(
      edgePfad(),
      ['--headless=new', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profil}`, '--no-first-run', '--disable-gpu', 'about:blank'],
      { stdio: 'ignore' },
    );
    await warteAufUrl(`http://localhost:${CDP_PORT}/json/version`, 20000, 'Edge');

    const v = await verbinde(ausgabeordner);
    verbindung = v;
    const modul = (await import(pathToFileURL(szenarioPfad).href)) as { default?: (b: Browser) => Promise<void> };
    if (typeof modul.default !== 'function') throw new Error('Das Szenario exportiert keine Standardfunktion.');
    await modul.default(v.browser);
    return 0;
  } finally {
    aufraeumen();
    await pause(500);
    try {
      fs.rmSync(profil, { recursive: true, force: true });
    } catch {
      // Edge hält das Profil manchmal noch kurz fest; es liegt im Temp-Ordner.
    }
  }
}

hauptprogramm().then(
  (code) => process.exit(code),
  (fehler: unknown) => {
    console.error(fehler instanceof Error ? fehler.message : fehler);
    process.exit(1);
  },
);

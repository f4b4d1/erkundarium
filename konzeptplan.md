# Erkundarium – Konzeptplan

Stand: 2026-11-16, Ergebnis der Grilling-Session. Einzelheiten stehen in `Spec v0.1.md`, Begriffe in `GLOSSARY.md`, Begründungen in `docs/adr/`.

## 1 Zielbild und Nicht-Ziele der ersten Version

**Zielbild.** Erkundarium ist ein Erkundungsspiel im Browser. Man zoomt durch gezeichnete Szenen einer Welt, klickt Dinge an und findet dabei Karten, die Wissen zu genau einem Ding tragen. Die Karten bilden ein Netz: Jede kennt ihre Fundorte und ihre fachlichen Beziehungen zu anderen Karten. Alle Inhalte sind Dateien; die Engine kennt kein Fach.

**Die erste Version (M1, Durchstich)** beweist die ganze Kette an drei Szenen der Fabrik mit etwa zehn Karten: erkunden, zoomen, Karte finden, Eintrittskarte, Sammlung, Fortschritt, speichern, Inhalte prüfen.

**Bewusste Nicht-Ziele der ersten Version**

- Kein Hosting und keine Weitergabe; Abnahme nur auf dem Desktop
- Keine zweite Textfassung, kein Startbildschirm, keine Profil-Oberfläche
- Keine Sammelobjekte, Kartensets, Easter Eggs, kein Quiz
- Keine bewegten Dinge in Szenen, keine verschiebbaren Szenen; Animationen nur in einfacher Form
- Kein endgültiges Kartendesign; die Musterkarte kommt in M2
- Keine native App und kein App-Store

## 2 Zentrale Architektur- und Datenmodell-Entscheidungen

| Entscheidung | Kern | Nachzulesen |
| --- | --- | --- |
| Gemeinsamer Kartenvorrat | Karten und Themengebiete gehören keiner Welt und haben global eindeutige IDs. Eine Welt besteht nur aus Szenen. Mehrere Hotspots dürfen auf dieselbe Karte zeigen; gefunden ist eine Eigenschaft der Karte. Eine Szene kann eine Eintrittskarte tragen. | ADR 0001 |
| Textfassungen | Sichtbare Texte sind von der Struktur getrennt. Sprache und Kinderniveau sind derselbe Mechanismus. Zum Start nur `de`. | ADR 0002 |
| Zwei Schichten im Wissensnetz | Fundorte werden aus den Szenen berechnet. Beziehungen sind von Hand gesetzte Fachaussagen; ihre Typen sind Inhalt, nicht Code. | ADR 0003 |
| Weitergabe als Website | Ein Link statt eines Programms; derselbe Weg führt aufs Handy. Keine Funktion hängt allein an der Maus. | ADR 0004 |
| Szenennetz | Die Zoom-Hotspots allein definieren das Netz: gerichtet, ohne Kreise, mehrere Wege zu einer Szene erlaubt. Die Pfadanzeige zeigt den gegangenen Weg. | Spec E16 |
| Inhaltsformat | JSON mit JSON-Schema, eine Datei je Karte. Das Inhaltsverzeichnis erzeugt das Prüfskript. | Spec E19, Abschnitt 6 |
| Aufbau des Codes | Drei Schichten mit einer Abhängigkeitsrichtung: Logik in reinem TypeScript; darüber das Szenenmodul (SVG, Hotspots, Zoom) und die Oberfläche mit Preact. Build mit Vite, Tests mit Vitest. | Spec E18 |
| Spielstand | Nur Karten-IDs und Einstellungen je Profil, in `localStorage` hinter einer Speicherschicht. Alles andere wird berechnet. | Spec E7, F33 |
| Prüfstatus | `entwurf` oder `geprueft` je Textfassung. Veröffentlichen bricht bei `entwurf` ab. | Spec F34 |

## 3 Meilensteine

### M1 – Durchstich

Kleinster spielbarer Durchstich: `fabrikhalle` → `roboterzelle` → `robotergelenk`, etwa 10 Karten.

- Die Startszene ist die bereinigte Referenzszene v3; Roboterzelle und Robotergelenk werden neu gezeichnet.
- Die Karte `motorleitung` hängt in Halle und Roboterzelle.
- Vorläufige Längenvorgaben in `content/limits.json`.

Abnahme: die Liste in Spec Abschnitt 10. Kurz:

- Alle Anforderungen F1 bis F35 sind vorführbar.
- Eine vierte Szene mit zwei Karten und ein neuer Beziehungstyp kommen nur über Dateien dazu.
- Der Spielstand übersteht Neuladen und neue Inhalte.
- Das Prüfskript läuft ohne Fehler.
- Alles ist ohne Maus bedienbar.

### M2 – Fabrik vollständig

Alle 7 Szenen und 37 Karten der Mindmap, Musterkarte, Kartendesign je Themengebiet, endgültige Längenvorgaben, alle Beziehungen.

Abnahme:

- Die Welt ist zu 100 % abschließbar.
- Die Szene `servomotor` ist über Robotergelenk und Förderband erreichbar.
- Jede Karte hält die Vorgaben der Musterkarte ein und hat den Prüfstatus `geprueft`.
- Das Prüfskript läuft in der Stufe Veröffentlichen ohne Fehler.

### M3 – Weitergabe

Hosting, Export und Import des Spielstands als Datei, Bedienung auf dem Handy, automatische Veröffentlichung nur bei bestandener Prüfung.

Abnahme:

- Ein Freund spielt über den Link auf seinem Handy, ohne etwas zu installieren.
- Er überträgt seinen Stand per Export und Import auf ein zweites Gerät.
- Eine Karte im Status `entwurf` verhindert die Veröffentlichung.
- Die Seite läuft in aktuellem Chrome, Firefox und Safari auf Desktop, Android und iOS.

### M4 – Animationen

Aufdeck-Animation und Zoom verfeinern, bewegte Dinge in Szenen, endgültiges Aussehen von Umriss und Abzeichen.

Abnahme:

- Aufdecken und Zoom laufen auf einem Mittelklasse-Handy flüssig.
- Mindestens eine Szene hat bewegte Dinge, beschrieben in Daten, nicht im Code.
- Wer im Betriebssystem „Bewegung reduzieren“ eingestellt hat, sieht keine Animationen.

### M5 – Spieltiefe

Sammelobjekte, Easter Eggs, Kartensets mit Belohnungskarte.

Abnahme:

- Die Sets `netzwerk` und `antrieb` sind spielbar und geben ihre Belohnungskarte.
- Die drei Sammelobjekte der Fabrik sind auffindbar und in der Sammlung sichtbar.
- Ein Spielstand aus M3 wird ohne Verlust übernommen.

### M6 – Textfassungen

Startbildschirm mit Auswahl der Textfassung, Fassung `de-einfach` für die Fabrik, Profile, gegebenenfalls Vorlesen.

Abnahme:

- Ein Kind spielt die Fabrik in einfacher Fassung mit eigenem Profil auf demselben Gerät wie ein Erwachsener.
- Der Wechsel der Fassung ändert keine gefundene Karte.
- Fehlt ein Text in der einfachen Fassung, erscheint der deutsche.

### M7 – Zweite Welt

Eine Welt außerhalb der Elektrotechnik mit eigenem Stilprofil.

Abnahme:

- Die Welt kommt ohne Änderung unter `src/` dazu.
- Mindestens eine Karte hängt in beiden Welten und wird nur einmal gefunden.
- Die Sammlung zeigt die Karten beider Welten nach Themengebiet.

## 4 Risiken und offene Fragen

**Risiken**

| Risiko | Wirkung | Gegenmaßnahme |
| --- | --- | --- |
| Der Browser löscht den Spielstand (Safari nach sieben Tagen ohne Besuch, „Browserdaten löschen“). | Freunde verlieren ihren Fortschritt. | Export und Import sind Teil von M3; später Installation als Web-App. |
| Gezeichnete Szenen erreichen die Qualität der Referenzszene nicht oder kosten viel Zeit. | M2 zieht sich; die Welt wirkt uneinheitlich. | M1 zeichnet nur zwei neue Szenen und zeigt den Aufwand. Abgabe-Prüfung der Guidelines je Szene. |
| Das Prüfen der Texte gegen Quellen ist Handarbeit. | 37 Karten in M2, später mal Anzahl der Textfassungen. | Prüfstatus je Fassung; kurze Texte durch Längenvorgaben; ungeprüfte Inhalte bleiben auf einem Zweig. |
| IDs sind nach der ersten Weitergabe unveränderlich und global eindeutig. | Eine unglückliche ID bleibt. | Vor M3 alle IDs einmal durchsehen; eindeutige Namen über Fächer hinweg wählen. |
| Die Startszene wird mit zwei Bereichen und drei Zoom-Zielen zu voll. | Hotspots sind schwer zu treffen. | „Unter dem Boden“ kann ohne Änderung an den Karten eine Zoom-Szene werden. |
| Zwei Tippschritte auf Touch bremsen das Spiel. | Das Erkunden fühlt sich zäh an. | In M3 auf dem Handy ausprobieren; die Regel steht nur in der Oberfläche, nicht in den Daten. |
| Das Handy im Hochformat zeigt die 16:9-Szene sehr klein. | Schlechte Bedienbarkeit. | Offene Frage N5; Kandidaten sind Querformat-Hinweis oder verschiebbare Szene. |

**Offene Fragen:** N1 bis N10 in Spec Abschnitt 9. Keine blockiert M1. Für M1 sind zu klären: die Themengebiete der Durchstich-Karten (N2), mindestens zwei Beziehungen (N3) und ein einfaches Aussehen von Umriss und Abzeichen (N6).

## 5 Erste Schritte der ersten Implementierungs-Session

1. Projekt anlegen: Vite, TypeScript, Preact, Vitest. Ordner `src/logik`, `src/szene`, `src/oberflaeche`, `content/`, `tools/`.
2. JSON-Schemas für Welt, Szene, Karte, `topics.json`, `relations.json` und `limits.json` nach Spec Abschnitt 6 schreiben und in VS Code einbinden.
3. Die Auswahl für M1 festlegen: etwa 10 Karten aus der Mindmap, ihre Themengebiete und zwei Beziehungen. Die Kartendateien mit Prüfstatus `entwurf` anlegen.
4. Die Referenzszene v3 bereinigen (`<style>` und Demo-Beschriftungen entfernen) und als `fabrikhalle.svg` ablegen. Szenendatei mit den Hotspots dazu schreiben.
5. Prüfskript in der ersten Fassung: Schema-Prüfung, doppelte IDs, Abgleich von Szenendatei und SVG, Erzeugen des Inhaltsverzeichnisses. Test zuerst.
6. Logik mit Tests zuerst: Szenennetz ohne Kreise, Fundorte, Fortschritt, Abschluss-Regel F12, Spielstand mit Schema-Version.
7. Erster sichtbarer Stand: Die Startszene wird eingebettet, Hotspots zeigen den Hinweis, ein Klick auf einen Hotspot mit Karte markiert sie als gefunden, und der Fund übersteht das Neuladen.

Danach folgen innerhalb von M1: Kartenansicht mit Wenden, Zoom und Pfadanzeige mit Eintrittskarte, Sammlung mit Fundorten und Beziehungen, die zwei neuen Szenen, der Rest des Prüfskripts.

Diese sieben Schritte sind erledigt. Den aktuellen Stand beschreibt Abschnitt 6.

## 6 Stand und nächste Schritte (Übergabe vom 2026-11-16, Stand Commit `745e30c`)

Eine neue Session liest diesen Abschnitt zuerst und beginnt mit „Einstieg für die nächste Session“.

### Einstieg für die nächste Session

Zoom (F3) und Pfadanzeige (F4) sind fertig, mit einer vorläufigen Szene `roboterzelle` als Zoom-Ziel (Entscheidung des Nutzers: Platzhalter zuerst, Zeichnen in Schritt 2). Der Nutzer hat den Zoom-Schritt in zwei Aufträge geteilt; Auftrag 1 ist erledigt und reviewt. Der Arbeitsbaum ist sauber; nur `CLAUDE.md` und zwei Vergleichsbilder `farbvergleich-*.png` liegen absichtlich unversioniert da.

Als Nächstes Auftrag 2 des Zoom-Schritts (Spec F11, F30 bis F32; Begriffe Eintrittskarte, Abgeschlossen im Glossar):

- F30: Beim ersten Betreten einer Szene mit Eintrittskarte erst Zoom, dann deckt sich die Karte von selbst auf und gilt als gefunden (wie F6 und F7, also `oeffneKarte`). Der Szenenwechsel liegt in `wechsleSzene` in `src/oberflaeche/anwendung.tsx`; `roboterzelle` trägt die Eintrittskarte `roboterzelle`.
- F31: Kartenknopf am Szenentitel in der Pfadanzeige (`src/oberflaeche/pfadanzeige.tsx`) öffnet die Eintrittskarte.
- F32 und F11: Der Hinweis eines Zoom-Hotspots nennt den Stand („3 von 5 Karten“, Zielszene samt tieferen Szenen) und trägt einen Kartenknopf, sobald die Eintrittskarte der Zielszene gefunden ist.
- Vorhandene Logik zum Wiederverwenden: `zoomZiele`, `tiefereSzenen` in `src/logik/szenennetz.ts`; `kartenDerSzene`, `standDerSzene`, `istAbgeschlossen` in `src/logik/fortschritt.ts`; `hinweisinhalt` in `src/logik/hinweis.ts`. Neue reine Logik testgetrieben unter `src/logik/`.

Ablauf wie unter „Arbeitsweise“. Auftrag 2 bringt neue Logik und Abläufe, bekommt also ein Review.

### Arbeitsweise

Diese Regeln hat der Nutzer für die Umsetzung festgelegt. Sie gelten, bis er sie ändert; in `CLAUDE.md` stehen sie nicht.

- Die Hauptsession orchestriert und schreibt selbst keinen Anwendungscode. Dokumente und kleine Inhaltsänderungen macht sie selbst.
- Die Hauptsession läuft auf Opus, Stufe medium. Code schreiben Subagenten mit dem Modell Sonnet (seit 2026-11-16 für alle Coding-Aufgaben), nacheinander, je Auftrag ein abgegrenzter Schritt mit Verweis auf Spec, Glossar und ADRs.
- Der Nutzer arbeitet nah am 5-Stunden-Limit: nichts Großes ohne Rückfrage starten.
- Ablauf je Schritt nach dem implement-Skill: testgetrieben an den vereinbarten Nahtstellen (Szenennetz, Fundorte, Fortschritt und Abschluss, Spielstand, Prüfskript; dazu jede weitere reine Logik), Typprüfung und Tests regelmäßig. Danach Code-Review, Befunde in einem eigenen Commit beheben.
- Review nach Größe des Schritts (seit 2026-11-16, um Tokens zu sparen): Neue Logik oder neue Abläufe bekommen ein Review durch einen einzigen Agenten, der beide Achsen (Standards und Spec) in einem Bericht prüft. Reine Inhalts- und CSS-Änderungen und kleine Fixes bekommen kein Review, nur die Nachprüfung durch die Hauptsession.
- Review-Befunde gehen per SendMessage an den Agenten zurück, der den Schritt umgesetzt hat; kein neuer Agent für die Fixes.
- Jeder Auftrag verlangt einen Bericht von höchstens 15 Zeilen; Einzelheiten nur auf Nachfrage.
- Befehle in Aufträgen: `npm test` nur aus PowerShell mit großem `C:\` (Git-Bash mit `c:` scheitert, siehe Mängel). Das gilt auch für Review-Agenten.
- Im Browser prüfen Agenten mit `npm run browser -- <szenario> [ausgabeordner]` (`tools/browser.ts`): Das Tool startet Vite und Edge headless, ruft das Szenario auf und beendet beide wieder. Das Szenario ist eine kleine .ts-Datei im Scratchpad mit Standardfunktion `(b: Browser) => Promise<void>`; Befehle und ein Beispiel stehen im Kopf von `tools/browser.ts`. Kein eigenes CDP-Skript schreiben; fehlt dem Tool etwas, ergänzen.
- Die Hauptsession prüft jedes Ergebnis selbst nach (Typprüfung, Tests, Prüfskript) und übernimmt keinen Agentenbericht ungeprüft. Sie sieht je Schritt ein Bildschirmfoto an; weitere Zustände misst der Agent über `zustand()` und meldet sie. Was nur der Agent geprüft hat, wird dem Nutzer so gesagt.
- Nach jedem Schritt auf die Rückmeldung des Nutzers warten.
- Commits direkt auf `main`, Commit-Nachrichten auf Englisch. Nicht pushen, außer der Nutzer verlangt es. `CLAUDE.md` ist nicht eingecheckt und bleibt es.
- Änderungen an Design-Guidelines, Stilprofil und Mindmap nur nach Vorschlag und Okay des Nutzers.

### Erledigt in M1

| Schritt | Inhalt |
| --- | --- |
| 1 | Projektgerüst: Vite, TypeScript, Preact, Vitest; `src/logik` wird ohne DOM und Preact geprüft |
| 2 | JSON-Schemas unter `content/schema/`, vorläufige `limits.json`, Einbindung in VS Code |
| 3 | Elf Karten, vier Themengebiete, drei Beziehungstypen; alle Kartentexte im Prüfstatus `entwurf` |
| 4 | Startszene `fabrikhalle` aus der Referenzszene, 33 Hotspots, `world.json` |
| 5 | Prüfskript (`npm run pruefen`), erzeugtes Inhaltsverzeichnis, Vite-Plugin für Entwicklungsserver und Build |
| 6 | Spiellogik: Szenennetz, Fundorte und Beziehungen, Fortschritt und Abschluss, Spielstand, Schnittstelle der Speicherschicht |
| 7 | Erster sichtbarer Stand: Szene, Hinweis, Umriss, Auslösen per Maus, Tastatur und Touch, Haken, Speichern in `localStorage`, Erlaubnisliste für eingebettete SVGs |
| 8 | Kartenansicht: Aufdecken, Wenden, Schließen, fünf Bausteine, Entwurfsstempel, vier Symbole der Themengebiete; Kartentitel im Inhaltsverzeichnis |
| 8a | Wissensgebiete (ADR 0005): `content/domains.json` mit Technik in Stahlgrau `#6B7785`, `topics.json` verweist mit `domain` darauf, keine Ersatzfarbe; Kartenvorderseite mit Bild und Text je zur Hälfte |
| 8b | Kartendesign abgeschlossen: Schild auf beiden Seiten mit Themengebiet, Titel hinten als kleine Überschrift, Schrift vorne +10 %, Quellen als bloße URL ohne Nummern, Bedienregeln in der Spec (F8a), endgültige `limits.json` (Kurztext 300 bis 400 Zeichen), alle elf Kurztexte verlängert, `design-guidelines-karte.md` mit Regeln für Kartentexte (Allgemeingültigkeit, Belege, Verständlichkeit) |
| 9a | Zoom (F3) und Pfadanzeige (F4): vorläufige Szene `roboterzelle`, `src/logik/pfad.ts` mit Tests, Zoom per Web Animations mit `prefers-reduced-motion`, Ladefehler und nicht darstellbare Zielszene lassen die aktuelle Szene stehen, Szene als `role="group"` mit Titel benannt; reviewt, Befunde behoben (Commits `f3831ae`, `745e30c`) |

Die Schritte 5, 6 und 7 sind reviewt und die Befunde behoben. Schritt 8 und 8a sind auf beiden Achsen reviewt und die Befunde behoben (Commit `aabd984`). Ungeprüft im Browser: der Name des Dialogs im Fehlerzustand und die Ansage „Neue Karte gefunden“ im Screenreader. Offen, gleiches Muster: `.karte-laedt` ist eine bedingt gerenderte `role="status"`-Region.

Umgesetzte Anforderungen der Spec: F1 bis F5, F7 bis F10, F17, F18, F21, F22, F24, F25, F33 bis F36. Teilweise: F6 (der Zähler fehlt), F11 (Haken ja; Schalter und Stand im Hinweis fehlen), F19 (nur in der Logik, nicht in der Oberfläche), F20 (siehe unten), F23 (Stand und Kartenknopf im Hinweis fehlen), F26 (Auslösen über das Symbol im Hinweis fehlt), F27 (das Abzeichen fehlt).

### Offene Entscheidungen des Nutzers

1. **Startszene angleichen.** Offen ist, ob beim Zeichnen des Zauns auch Farben und Strichstärken der Startszene an die Guidelines angeglichen werden (reines Weiß, etwa zehn Farben außerhalb der Paletten, krumme Strichstärken). Empfehlung: ja.
2. **Farben weiterer Wissensgebiete.** Der Vorschlag in ADR 0005 stößt sich mit festen Bedeutungen: Rot heißt in jeder Welt Gefahr, Orange in der Fabrik Roboter. Erst zu klären, wenn es Karten außerhalb der Technik gibt.

### Nächste Schritte in M1

Reihenfolge als Vorschlag; der Nutzer entscheidet je Schritt.

1. Zoom mit Pfadanzeige und Eintrittskarte (F3, F4, F30 bis F32), Stand im Hinweis eines Zoom-Hotspots (F11).
2. Zeichnen: Zaun und gegebenenfalls Angleichen der Startszene; Szenen `roboterzelle` und `robotergelenk` nach den Design-Guidelines; Szenendateien dazu. Die Motorleitung hängt auch in der Roboterzelle.
3. Karte `servomotor` und Beziehungen.
4. Sammlung mit Fundorten und Beziehungen an der geöffneten Karte (F14 bis F16), Fortschrittsanzeige (F13).
5. Abzeichen, Hilfe-Schalter, Schalter für die Haken, Auslösen über das Symbol im Hinweis, breitere Klickfläche (F26 bis F29, F37, F11), Zurücksetzen des Spielstands (F19 in der Oberfläche).
6. Rest des Prüfskripts (F20): Längenvorgaben und Bausteinzahl, Karten ohne Hotspot, Kreise und Erreichbarkeit im Szenennetz (die Funktionen liegen in `src/logik/szenennetz.ts`), symmetrische Beziehungen an beiden Karten, Kreise bei `acyclic`, `linkLabel` ohne `link`, fehlende Bild- und Symboldateien, Prüfung von Kartenbildern und Symbolen auf verbotene Inhalte, Hotspot-Dichte.
7. Abnahme nach Spec Abschnitt 10.

### Bekannte Mängel und Ungeprüftes

- `roboterzelle` ist ein Platzhalter (drei Hotspots, schlichte Grafik); Schritt 2 ersetzt ihn. `npm run pruefen` meldet 0 Fehler und 11 Entwurfs-Warnungen, `npm run build` läuft.
- Zoom: Während eines Wechsels (450 ms plus Laden) tun Pfadknöpfe nichts, ohne Rückmeldung. Scheitert das Laden, kommt die Meldung erst nach dem vollen Zoom. Beides bewusst so gelassen.
- `pruefeSvg` in `src/szene/szene.ts` ist ohne Test, weil es keine DOM-Testumgebung gibt; nur im Browser geprüft. Eine SVG mit verbotenen Elementen wird bereinigt statt abgelehnt und lädt dann gegebenenfalls ohne Hotspots.
- `npm test` scheitert, wenn das Terminal im Pfad ein kleines `c:` zeigt (`Cannot read properties of undefined (reading 'config')`). Abhilfe: mit großem `C:\` ins Verzeichnis wechseln. Die Ursache ist nicht geklärt.
- Manche Haken sitzen neben der Form, weil sie an der Ecke der Begrenzungsbox hängen (Hallenleuchten, Roboter, Schaltschrank).
- Der Hinweis lässt Klicks durch. Nach dem Schließen einer Karte mit der Maus bleibt er offen, bis die Maus sich bewegt.
- Auf schmalen Bildschirmen ist die Kartenschrift klein (bei 360 px Breite etwa 13 px vorne, 11 px hinten, Quellen etwa 8 px). Laut Messung läuft derzeit keine Karte über.
- Schema-Fehler erscheinen teils englisch. Das Prüfskript sieht nur `.json` und `.svg`.
- Die Migration zwischen Spielstand-Versionen ist ungetestet, weil es nur Version 1 gibt.
- Nie geprüft: Firefox, echte Touch-Geräte, Screenreader, Handy im Hochformat, eine Karte mit eigenem Bild, eine zweite Textfassung. Alle Prüfungen am laufenden Spiel liefen in ferngesteuertem Edge.
- Alle elf Karten sind gegen `design-guidelines-karte.md` Abschnitt 8 geprüft, aber kein Kartentext und kein Hotspot-Text ist von einem Menschen gegengelesen. Die Agenten lasen die Quellen über WebFetch, also als Zusammenfassung, nicht im Volltext. Schwache Stellen: `hallenleuchte` ohne eigene unabhängige Quelle zu Hallenleuchten; `kabelkanal` stützt sich auf ein Fachportal und eine Herstellerseite, die Rückseite ist dadurch dünn; `not-halt-und-zaun` nutzt einen Fachverlag (WEKA). Hotspot-Texte haben keinen Prüfstatus.
- Ein im Hintergrund gestarteter Vite-Server läuft weiter, wenn die Hintergrund-Aufgabe gestoppt wird. Danach Port 5199 prüfen und den eigenen Prozess per PID beenden. `npm run browser` räumt selbst auf und bricht ab, wenn Port 5199 oder 9333 schon belegt ist.

### Anhaltspunkte im Code

- `src/logik/`: reine Logik und geteilte Typen (`inhaltsverzeichnis.ts`, `szenennetz.ts`, `wissensnetz.ts`, `fortschritt.ts`, `spielstand.ts`, `hinweis.ts`, `kartendatei.ts`, `erlaubte-svg.ts`, `gebietsfarbe.ts`).
- `src/szene/`: Szenenmodul ohne Preact (`szene.ts`, `eingabe.ts`, `haken.ts`).
- `src/oberflaeche/`: Preact (`anwendung.tsx`, `szenenansicht.tsx`, `hinweis.tsx`, `kartenansicht.tsx`, `kartenseiten.tsx`); das Aussehen der Karte mit allen Maßen und Farben als Variablen in `karte.css`.
- `src/inhalte/laden.ts`, `src/speicher/lokaler-speicher.ts`: Anbindung an Netz und `localStorage`.
- `tools/`: Prüfskript (`pruefung.ts`), Einlesen, Kommandozeile, Vite-Plugin; `browser.ts` für Prüfungen im echten Browser.
- Starten: `npm run dev`. Prüfen: `npm run typecheck`, `npm test`, `npm run pruefen`.

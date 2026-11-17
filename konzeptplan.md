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

## 6 Stand und nächste Schritte (Übergabe vom 2026-11-17, Stand Commit `0c1d623` und der folgende)

Eine neue Session liest diesen Abschnitt zuerst und beginnt mit „Einstieg für die nächste Session“.

### Einstieg für die nächste Session

Der Durchstich `fabrikhalle` → `roboterzelle` → `robotergelenk` ist gezeichnet und begehbar (Schritt 10c, Commit `dc21e3f`, vom Nutzer vorerst so abgenommen). Hinweis und Tastatur (1a, 1c) sind erledigt (Schritt 9e). **Nächster Schritt nach Wahl des Nutzers:** Karte `servomotor` und Beziehungen (Nächste Schritte, Punkt 3) oder Sammlung (4).

Seit `8f6e56d` erzeugt `npm run zoomansicht` das Grundgerüst einer Zoom-Ansicht (Wunsch des Nutzers: wiederverwendbar im Projekt statt im Scratchpad). Das Werkzeug hat Tests, aber kein Review (vom Nutzer nicht verlangt).

Der Arbeitsbaum ist sauber; nur `CLAUDE.md` und zwei Vergleichsbilder `farbvergleich-*.png` liegen absichtlich unversioniert da.

Kartenknopf und Aktionssymbol (Lupe „Hineinzoomen“) stehen im Hinweis nebeneinander und sehen gleich aus; nur der Kartenknopf ist ein Knopf. Der Nutzer lässt das vorerst so (2026-11-16).

### Zoom-Ansicht erstellen (Vorgehen aus `roboterzelle` und `robotergelenk`)

- Eine Zoom-Ansicht (Guidelines Abschnitt 5) zeigt genau den Endausschnitt des Zooms in der Elternszene; Lage, Form und Farbe bleiben gleich, dazu kommen Details. Ausschnitt aus der Begrenzungsbox des Zoom-Hotspots (per `getBBox` in der Elternszene, also ohne Strichbreiten), wie `starteZoom` ihn rechnet: gleiche Mitte wie die Box, Breite = max(Boxbreite, Boxhöhe · 16/9) / 0,8 (`ZOOM_FUELLUNG`), Höhe = Breite · 9/16, f = 1600 / Breite. Für `roboterzelle`: Box von `#roboter` x 720, y 332,6, 310 × 307,4, Faktor f = 2,342, Ausschnitt x 533,4–1216,6, y 294,2–678,5, Maßstab ≈ 300 Einheiten/m. Für `robotergelenk`: Box von `#achse-3` in `roboterzelle.svg` x 398, y 137,1, 156,1 × 157,5, f = 4,571, Ausschnitt x 301,05–651,05, y 117,41–314,29, Maßstab ≈ 1370 Einheiten/m.
- Innenteile, die von außen nicht sichtbar sind, zeigt ein Schnitt innerhalb der unveränderten Umrisse (vom Nutzer für `robotergelenk` freigegeben).
- Das Grundgerüst erzeugt `npm run zoomansicht -- <quelle.svg> <ziel.svg> <x> <y> <breite> [koerperAb]` (`tools/zoom-ansicht.ts`, Logik mit Tests in `tools/zoom-ausschnitt.ts`). Es übernimmt die Elemente im Ausschnitt und rechnet sie um: Konturen, Binnenlinien und Leitungen behalten ihre Breite; Körpermaße (Radien, `rx`, Striche ab `koerperAb`, Standard 19, etwa Robotergliedbreiten) werden mit f skaliert, die Unterlage eines Körperstrichs bleibt Kern + 6. Kein `transform="scale(…)"`; Gruppentransforms werden eingerechnet, Gruppen mit einem Clip außerhalb des Bildes fallen weg. Dünnere Körperstriche (Katzenschwanz, Schlauchpaket und Leitungen bei großem f) von Hand nachziehen. Für `roboterzelle`: `npm run zoomansicht -- content/worlds/fabrik/scenes/fabrikhalle.svg <ziel> 533.4 294.2 683.2`.
- Dann zeichnet ein Sonnet-Agent die vom Nutzer freigegebenen Details, schreibt SVG und JSON, prüft (`npm run pruefen`, Browser, Guidelines Abschnitt 8). Die Hauptsession prüft per PNG neben dem Elternausschnitt und Bildschirmfoto kurz vor und nach dem Tausch.
- Der Konturensprung beim Tausch wird hingenommen; eine Überblendung käme in M4.

### Arbeitsweise

Diese Regeln hat der Nutzer für die Umsetzung festgelegt. Sie gelten, bis er sie ändert; in `CLAUDE.md` stehen sie nicht.

- Die Hauptsession orchestriert und schreibt selbst keinen Anwendungscode. Dokumente, kleine Inhaltsänderungen und Werkzeuge unter `tools/` (etwa `browser.ts`) darf sie selbst machen.
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
- Nach jedem Commit prüft die Hauptsession Abschnitt 6 auf Stand-Commit, Einstieg und neue Werkzeuge und zieht ihn nach.

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
| 9b | Auftrag 2a: Eintrittskarte deckt sich beim ersten Betreten nach dem Zoom auf (F30, auch für die Startszene; `aufzudeckendeEintrittskarte` in `src/logik/karte-oeffnen.ts`), Kartenknopf an der aktuellen Szene in der Pfadanzeige (F31), Stand im Hinweis eines Zoom-Hotspots (F11); Fokus nach dem Schließen über `Fokusziel` (Hotspot, Kartenknopf, Szene); reviewt, Befunde behoben (Commits `e893b5d`, `f860462`). Nur in Logiktests geprüft: Startszene mit Eintrittskarte |
| 9c | Auftrag 2b: Hinweis als `role="group"`, lässt keine Klicks durch, bleibt beim Fahren in den Hinweis offen, schließt 150 ms nach Verlassen und nach dem Schließen einer Karte; Lage am Zeiger (`platziereAmAnker` in `src/oberflaeche/platzierung.ts`; seit `535a6b5` über dem Zeiger mit 12 px Abstand, waagerecht mittig, nur ohne Platz oben darunter mit 32 px Abstand, damit die Hand ihn nicht verdeckt; Neu-Ankern und Ereignis `bewegt` seit 9e entfernt), bei Tastaturfokus an der Box; `zeiger` im Szenenmodul; Kartenknopf im Hinweis eines Zoom-Hotspots (F32, `eintrittskarte` in `hinweisinhalt`); `mausNach`, `klickeBei` in `tools/browser.ts`; reviewt, Befunde behoben (Commits `43e7f1c`, `d323dbf`) |
| 9e | Hinweis und Tastatur (Punkte 1a, 1c, Wunsch des Nutzers vom 2026-11-17, Commit `0c1d623`): Mit der Maus öffnet der Hinweis nur beim Betreten und bewegt sich nicht mehr; nach Karte oder Lageänderung bleibt er zu bis zum nächsten Betreten. Escape schließt erst Karte bzw. Hinweis, dann zoomt es heraus (`deuteTaste` in `src/oberflaeche/tasten.ts` mit Tests). Tab vom Zoom-Hotspot auf den Kartenknopf, Tab weiter zum nächsten Hotspot, Shift+Tab und Escape zurück; der Knopf behält `tabindex=-1`, die Anwendung führt den Fokus. Spec F21, F4a, F32 angepasst. Reviewt; Befunde siehe Mängel und der folgende Commit. Bei Fokus-Rückkehr nach einer per Tastatur geschlossenen Karte öffnet der Hinweis wieder (F21, Tastaturfokus; Entscheidung der Hauptsession) |
| 9d | Herauszoomen (F4a, Entscheidungen des Nutzers vom 2026-11-16, Commit `f83e7ae`): Pfadknöpfe und Escape (ohne offene Karte und Hinweis, eine Ebene); der Pfad merkt sich je Ebene den Eintritts-Hotspot (`Pfadebene { szene, ueber? }`, `rueckweg` in `src/logik/pfad.ts` mit Tests); erst alle Szenen des Rückwegs laden, dann je Ebene aus dem Zoom-Endzustand herauszoomen (450 ms, Zwischenstufen linear, letzte ease-out); Fokus auf den Hotspot, über den man die Zielebene verlassen hatte. Glossar: „Ebene“ als Platz im Pfad, „Herauszoomen“. Reviewt, Befunde behoben (hängender Wechsel, wenn zwischen zwei Stufen nicht gerendert wird; Typen; Tests). Im Browser nur eine Ebene geprüft (vom Agenten, Bildschirmfoto von der Hauptsession angesehen); mehrere Ebenen und Ladefehler des Rückwegs nur in Logiktests |
| 10a | Halle (Commit `ce27563`): Schutzzaun 1,4 m (DIN EN ISO 13857) als Hotspot `schutzzaun` mit Schutztür rechts vom Roboter (x 1002–1108), Türschalter, Quittiertaster, Signalsäule; Hotspot `programmierhandgeraet`; zwischen x 715 und 870 nur Gitter, Klicks durch die Maschen treffen den Roboter (vom Agenten im Browser geprüft). Farben und Strichstärken an die Guidelines angeglichen, Lichtstrahl des Lichttasters bei x 1141. Die Halle hat jetzt 35 Hotspots, die Obergrenze einer Ansicht. Guidelines: Regel „Zoom-Ansicht“; Stilprofil: Gelb für Zaun, Blau für Quittiertaster, Druckluftschlauch, Leitplanke Schutzzaun; Mindmap angepasst |
| 10b | Zoomszene `roboterzelle` als Zoom-Ansicht der Halle (Commit `f7e6093`): Grundgerüst per Skript aus der Halle, Details von einem Sonnet-Agenten. 28 Hotspots (4 Karten: `roboter`, `greifer`, `kabel-leistung`, `not-halt`/`schutzzaun`/`tuerschalter` zu `not-halt-und-zaun`; 24 Info, darunter `achse-1` bis `achse-6`, Achse 3 vorerst `info`). Abweichungen vom Auftrag, vom Nutzer abgenommen: `kabelpritsche` blieb Hotspot (mit Abzweigdose für die Not-Halt-Leitung), Feldbusleitung endet an einem Stecker unter dem Lichttaster, Motor 3 sitzt oben links an Achse 3, neue Farbe `#ECC799` (Klebeband, Karton +15 Prozentpunkte Helligkeit). Das violette Sensorkabel am Unterarm hat der Nutzer streichen lassen, der Sensor am Greifer blieb |
| 10c | Zoomszene `robotergelenk` als Zoom-Ansicht von Achse 3 der Roboterzelle (Commit `dc21e3f`): Viertelschnitt der Nabe (Kreuzrollenlager, Circular Spline, Flexspline, Wave Generator), Kegelradstufe zwischen Motor und Wave Generator (Entscheidung des Nutzers, weil die Motorachse in der Bildebene liegt), Längsschnitt der Motorkappe mit Haltebremse und Encoder. 14 Hotspots: Karten `wellgetriebe`, `encoder`, `haltebremse`; Info `motor` (wird zur Karte `servomotor`), `kegelradstufe`, `kreuzrollenlager`, `abtriebsflansch`, `motorstecker`, `typenschild`, `oberarm`, `unterarm`, `schlauchpaket`, `infotafel`, `marienkaefer`. `achse-3` in der Roboterzelle ist jetzt Zoom-Hotspot. Herauszoomen über zwei Ebenen vom Agenten im Browser geprüft |
| 10d | Öffnen-Animation (Wunsch des Nutzers vom 2026-11-17): Eine schon gefundene Karte steigt beim Öffnen leicht auf, wächst von 0,9 auf 1 und blendet ein (0,3 s, `karte-halter-oeffnen` in `karte.css`, Füllmodus `backwards`, damit danach keine Transformation am Halter bleibt); gilt für jeden Weg, der eine gefundene Karte öffnet; bei `prefers-reduced-motion` keine Animation. Spec F7 und F8a angepasst. Im Browser geprüft (Hotspot, Wenden danach, reduzierte Bewegung); der Kartenknopf nicht eigens, er läuft über dieselbe Funktion `zeigeKarte` |
| 10e | Schließ-Animation (Wunsch des Nutzers vom 2026-11-17): Klick neben die Karte, Escape und „Schließen“ blenden Abdunklung, Karte und Knöpfe in 0,2 s aus, die Karte sinkt dabei leicht und schrumpft auf 0,9 (`kartenansicht-schliesst` in `karte.css`). Erst danach meldet `Kartenansicht` das Schließen dem Aufrufer, also kommen Fokus und Hinweis erst dann zurück; bis dahin bleibt der Dialog modal und nimmt keine Eingaben an. Gemeldet wird genau einmal: am Ende der Animation, nach höchstens 500 ms oder beim `close` des Browsers (ein zweites Escape schließt einen modalen Dialog in Chromium selbst; dann verschwindet die Ansicht sofort). Bei `prefers-reduced-motion` schließt sie sofort; `wenigerBewegung` liegt dafür jetzt in `src/oberflaeche/bewegung.ts`. Spec F8a ergänzt. Im Browser geprüft: alle drei Wege, doppeltes Escape, reduzierte Bewegung, Fokus zurück am Hotspot |

Die Schritte 5, 6 und 7 sind reviewt und die Befunde behoben. Schritt 8 und 8a sind auf beiden Achsen reviewt und die Befunde behoben (Commit `aabd984`). Ungeprüft im Browser: der Name des Dialogs im Fehlerzustand und die Ansage „Neue Karte gefunden“ im Screenreader. Offen, gleiches Muster: `.karte-laedt` ist eine bedingt gerenderte `role="status"`-Region.

Umgesetzte Anforderungen der Spec: F1 bis F5, F4a, F7 bis F10, F17, F18, F21, F31, F32, F22, F24, F25, F23, F30, F33 bis F36. Teilweise: F6 (der Zähler fehlt), F11 (Haken und Stand im Hinweis ja; Schalter fehlt), F19 (nur in der Logik, nicht in der Oberfläche), F20 (siehe unten), F26 (Auslösen über das Symbol im Hinweis fehlt), F27 (das Abzeichen fehlt).

### Offene Entscheidungen des Nutzers

1. Erledigt: Startszene angeglichen (Entscheidung vom 2026-11-16).
2. **Farben weiterer Wissensgebiete.** Der Vorschlag in ADR 0005 stößt sich mit festen Bedeutungen: Rot heißt in jeder Welt Gefahr, Orange in der Fabrik Roboter. Erst zu klären, wenn es Karten außerhalb der Technik gibt.

### Nächste Schritte in M1

Reihenfolge als Vorschlag; der Nutzer entscheidet je Schritt.

1. Erledigt (9a bis 9c). Zoom mit Pfadanzeige und Eintrittskarte (F3, F4, F30 bis F32), Stand im Hinweis eines Zoom-Hotspots (F11). Auftrag 2 war geteilt (Entscheidung des Nutzers vom 2026-11-16):
   - 2a: F30, F31, Stand im Hinweis (F11).
   - 2b: Hinweis bedienbar: lässt keine Klicks mehr durch, bleibt offen, solange der Zeiger darin ist, trägt den Kartenknopf (F32); schließt nach dem Schließen einer Karte. Dazu sitzt der Hinweis am Zeiger statt an der Begrenzungsbox: Anker ist der Eintrittspunkt der Maus (bei Touch der Tippunkt), etwa 12 px versetzt, im Fenster gehalten, darf den Hotspot verdecken; er läuft nicht mit, setzt sich aber neu an den Zeiger, wenn dieser sich im Hotspot mehr als etwa 120 px vom Anker entfernt. Bei Tastaturfokus bleibt die Lage an der Begrenzungsbox.
1a. Erledigt (9e): Kartenknopf im Hinweis per Tab.
1b. Erledigt (9d): Herauszoomen in die Szene davor.
1c. Erledigt (9e): Escape schließt erst den Hinweis, dann zoomt es heraus.
2. Erledigt (10a bis 10c): Zaun, Angleichen der Startszene, `roboterzelle`, `robotergelenk`.
3. Karte `servomotor` und Beziehungen; die Karte kommt an den Hotspot `motor` in `robotergelenk`.
4. Sammlung mit Fundorten und Beziehungen an der geöffneten Karte (F14 bis F16), Fortschrittsanzeige (F13).
5. Abzeichen, Hilfe-Schalter, Schalter für die Haken, Auslösen über das Symbol im Hinweis, breitere Klickfläche (F26 bis F29, F37, F11), Zurücksetzen des Spielstands (F19 in der Oberfläche).
6. Rest des Prüfskripts (F20): Längenvorgaben und Bausteinzahl, Karten ohne Hotspot, Kreise und Erreichbarkeit im Szenennetz (die Funktionen liegen in `src/logik/szenennetz.ts`), symmetrische Beziehungen an beiden Karten, Kreise bei `acyclic`, `linkLabel` ohne `link`, fehlende Bild- und Symboldateien, Prüfung von Kartenbildern und Symbolen auf verbotene Inhalte, Hotspot-Dichte.
7. Abnahme nach Spec Abschnitt 10.

### Bekannte Mängel und Ungeprüftes

- `roboterzelle`: Die Farbe `#ECC799` (Klebeband) steht nicht im Stilprofil. Bei den drei Leitungen findet `klickeHotspot` in `tools/browser.ts` keinen freien Punkt, weil es im Raster über die große Begrenzungsbox sucht; ein Klick auf die Linie trifft. Nur vom Agenten geprüft: Hinweis an allen 28 Hotspots, Karten bei Greifer und Türschalter; Roboter, Zaun und Not-Halt nicht angeklickt. Fachlichkeit der Details (Motoren, Getriebe, Greifer, Türschalter) nicht von einem Fachmann gegengelesen.
- `robotergelenk` (vom Nutzer vorerst so gelassen, 2026-11-17): Zwei leere Wandflächen über 300 × 300 (über der Nabe, links unter dem Motor) verstoßen gegen „Keine tote Fläche“; offen, ob füllen oder Ausnahme für Zoom-Ansichten in den Guidelines. Bremse und Encoder in der Motorkappe sind sehr klein (etwa 100 × 80 px bei 1280 px Breite). Marienkäfer etwa dreifach vergrößert (Hotspot ≥ 24 × 24). Fachlich vereinfacht: Kegelradstufe direkt am Wave Generator (real eher Riemen oder Hohlwelle), Flexspline-Ellipse übertrieben. Nicht geprüft: Ladefehler des Rückwegs, `prefers-reduced-motion` in dieser Szene. Fachlichkeit nicht von einem Fachmann gegengelesen.
- `tools/browser.ts` rendert keine SVG allein; dafür Edge direkt aufrufen (siehe unten).
- Halle: Das Pendantkabel ist violett (Daten), das Stilprofil legt dafür nichts fest. Der Reflexstreifen der Weste hat noch Strich 4.
- SVGs lassen sich ohne Spiel mit Edge headless rendern: `msedge.exe --headless --disable-gpu --hide-scrollbars --window-size=1600,900 --screenshot=<png> file:///<svg>`; für Ausschnitte eine HTML-Datei im Scratchpad mit `<svg viewBox="…"><image href="file:///…svg" width="1600" height="900"/></svg>`. `npm run pruefen` meldet 0 Fehler und 11 Entwurfs-Warnungen, `npm run build` läuft.
- Zoom: Während eines Wechsels (450 ms je Stufe plus Laden) tun Pfadknöpfe und Escape nichts, ohne Rückmeldung; Hinweis-Ereignisse werden ignoriert, am fokussierten Hotspot nach dem Herauszoomen öffnet sich daher kein Hinweis. Scheitert das Laden, kommt die Meldung erst nach dem vollen Zoom. Beides bewusst so gelassen.
- `pruefeSvg` in `src/szene/szene.ts` ist ohne Test, weil es keine DOM-Testumgebung gibt; nur im Browser geprüft. Eine SVG mit verbotenen Elementen wird bereinigt statt abgelehnt und lädt dann gegebenenfalls ohne Hotspots.
- `npm test` scheitert, wenn das Terminal im Pfad ein kleines `c:` zeigt (`Cannot read properties of undefined (reading 'config')`). Abhilfe: mit großem `C:\` ins Verzeichnis wechseln. Die Ursache ist nicht geklärt.
- Manche Haken sitzen neben der Form, weil sie an der Ecke der Begrenzungsbox hängen (Hallenleuchten, Roboter, Schaltschrank).
- Hinweis: Ändern sich Größe oder Lage der Szene, schließt ein Hinweis am Zeiger und kommt erst beim nächsten Betreten des Hotspots wieder; ebenso nach dem Schließen einer Karte mit der Maus. Liegt die ruhende Maus dort, wo ein Hinweis erscheint, schließt ein Hotspot-Wechsel per Tastatur den neuen Hinweis sofort (`onPointerLeave` des Hinweises; vorbestehend, Lösung wäre: `pointerleave` schließt den Fokus-Hinweis nicht, solange der Fokus am Hotspot liegt). Nach Escape bleibt der Hotspot im Szenenmodul im Fokus; fährt die Maus über einen anderen Hotspot und hinaus, öffnet der Hinweis am Fokus-Hotspot wieder (Randfall). Touch nur per Emulation geprüft.
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
- `tools/`: Prüfskript (`pruefung.ts`), Einlesen, Kommandozeile, Vite-Plugin; `browser.ts` für Prüfungen im echten Browser; `zoom-ansicht.ts` für das Grundgerüst einer Zoom-Ansicht.
- Starten: `npm run dev`. Prüfen: `npm run typecheck`, `npm test`, `npm run pruefen`.

# Erkundarium – Konzeptplan

Stand: 2026-11-16, Ergebnis der Grilling-Session. Einzelheiten stehen in `Spec v0.1.md`, Begriffe in `GLOSSARY.md`, Begründungen in `docs/adr/`, abgeschlossene Schritte in `docs/chronik.md`.

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

Alle sieben Schritte sind erledigt; Liste und Verlauf stehen in `docs/chronik.md`. Den aktuellen Stand beschreibt Abschnitt 6.

## 6 Stand und nächste Schritte (Übergabe vom 2026-11-17, Stand Commit `4de311e` und der folgende Übergabecommit)

Eine neue Session liest diesen Abschnitt zuerst und beginnt mit „Einstieg für die nächste Session“. Abgeschlossene Schritte mit Verlauf, Commits und Reviews stehen in `docs/chronik.md`; die Chronik nur bei Bedarf lesen.

### Einstieg für die nächste Session

Der Durchstich `fabrikhalle` → `roboterzelle` → `robotergelenk` ist gezeichnet und begehbar. Zoom, Herauszoomen, Pfadanzeige, Eintrittskarte, Hinweis mit Tastaturbedienung, Kartenansicht mit Kartenumfeld und Verlauf sowie die Sammlung sind umgesetzt (Nächste Schritte 1, 1a bis 1c, 2 und 4).

**Aktuell: Das Schließen der Sammlung per Klick zwischen den Themengebietsgruppen (Chronik 4e, Commit `db36ee1`) wartet auf die Nachprüfung durch den Nutzer; die Optik prüft er selbst, das Verhalten ist nur von Luna im Browser gemessen, ohne Bildschirmfotos. Nach seiner Rückmeldung wählt der Nutzer den nächsten Punkt (3: Servomotor, 5: Bedienhilfen und Zurücksetzen, 6: Rest des Prüfskripts, 6a: Zähler). Keinen davon ohne Auswahl starten.**

`AGENTS.md`, `CLAUDE.md` und zwei Vergleichsbilder `farbvergleich-*.png` sind unversioniert und bleiben es, bis der Nutzer etwas anderes sagt.

### Stand der Inhalte

- Elf Karten, vier Themengebiete, drei Beziehungstypen; alle Kartentexte im Prüfstatus `entwurf`. Bisher hat nur eine Karte eine Beziehung (`encoder` misst `robotergelenk`).
- `fabrikhalle`: 35 Hotspots, die Obergrenze einer Ansicht. Schutzzaun mit Schutztür (x 1002–1108); zwischen x 715 und 870 nur Gitter, Klicks durch die Maschen treffen den Roboter.
- `roboterzelle`: Zoom-Ansicht der Halle, 28 Hotspots (4 Karten, 24 Info); `achse-3` ist Zoom-Hotspot nach `robotergelenk`.
- `robotergelenk`: Zoom-Ansicht von Achse 3, 14 Hotspots (Karten `wellgetriebe`, `encoder`, `haltebremse`); Info-Hotspot `motor` wird zur Karte `servomotor` (Nächste Schritte, Punkt 3).

### Zoom-Ansicht erstellen (Vorgehen aus `roboterzelle` und `robotergelenk`)

- Eine Zoom-Ansicht (Guidelines Abschnitt 5) zeigt genau den Endausschnitt des Zooms in der Elternszene; Lage, Form und Farbe bleiben gleich, dazu kommen Details. Ausschnitt aus der Begrenzungsbox des Zoom-Hotspots (per `getBBox` in der Elternszene, also ohne Strichbreiten), wie `starteZoom` ihn rechnet: gleiche Mitte wie die Box, Breite = max(Boxbreite, Boxhöhe · 16/9) / 0,8 (`ZOOM_FUELLUNG`), Höhe = Breite · 9/16, f = 1600 / Breite. Für `roboterzelle`: Box von `#roboter` x 720, y 332,6, 310 × 307,4, Faktor f = 2,342, Ausschnitt x 533,4–1216,6, y 294,2–678,5, Maßstab ≈ 300 Einheiten/m. Für `robotergelenk`: Box von `#achse-3` in `roboterzelle.svg` x 398, y 137,1, 156,1 × 157,5, f = 4,571, Ausschnitt x 301,05–651,05, y 117,41–314,29, Maßstab ≈ 1370 Einheiten/m.
- Innenteile, die von außen nicht sichtbar sind, zeigt ein Schnitt innerhalb der unveränderten Umrisse (vom Nutzer für `robotergelenk` freigegeben).
- Das Grundgerüst erzeugt `npm run zoomansicht -- <quelle.svg> <ziel.svg> <x> <y> <breite> [koerperAb]` (`tools/zoom-ansicht.ts`, Logik mit Tests in `tools/zoom-ausschnitt.ts`). Es übernimmt die Elemente im Ausschnitt und rechnet sie um: Konturen, Binnenlinien und Leitungen behalten ihre Breite; Körpermaße (Radien, `rx`, Striche ab `koerperAb`, Standard 19, etwa Robotergliedbreiten) werden mit f skaliert, die Unterlage eines Körperstrichs bleibt Kern + 6. Kein `transform="scale(…)"`; Gruppentransforms werden eingerechnet, Gruppen mit einem Clip außerhalb des Bildes fallen weg. Dünnere Körperstriche (Katzenschwanz, Schlauchpaket und Leitungen bei großem f) von Hand nachziehen. Für `roboterzelle`: `npm run zoomansicht -- content/worlds/fabrik/scenes/fabrikhalle.svg <ziel> 533.4 294.2 683.2`.
- Dann zeichnet ein Sol-Medium-Agent die vom Nutzer freigegebenen Details, schreibt SVG und JSON, prüft (`npm run pruefen`, Browser, Guidelines Abschnitt 8). Die Hauptsession prüft per PNG neben dem Elternausschnitt und Bildschirmfoto kurz vor und nach dem Tausch.
- Der Konturensprung beim Tausch wird hingenommen; eine Überblendung käme in M4.

### Arbeitsweise

Diese Regeln hat der Nutzer für die Umsetzung festgelegt. Sie gelten, bis er sie ändert; in `CLAUDE.md` stehen sie nicht.

- Die Hauptsession orchestriert und schreibt selbst keinen Anwendungscode. Dokumente, kleine Inhaltsänderungen und Werkzeuge unter `tools/` (etwa `browser.ts`) darf sie selbst machen.
- Modellvorgabe des Nutzers vom 2026-11-17: Sol High als Orchestrator; Sol Medium für Implementierungen und schwierige Aufgaben, Luna Medium für einfache Fixes und Tests. Code schreiben Subagenten, nacheinander, je Auftrag ein abgegrenzter Schritt mit Verweis auf Spec, Glossar und ADRs. Diese Vorgabe ersetzt die frühere Aufteilung Opus/Sonnet.
- Der Nutzer arbeitet nah am 5-Stunden-Limit: nichts Großes ohne Rückfrage starten.
- Ablauf je Schritt nach dem implement-Skill: testgetrieben an den vereinbarten Nahtstellen (Szenennetz, Fundorte, Fortschritt und Abschluss, Spielstand, Prüfskript; dazu jede weitere reine Logik), Typprüfung und Tests regelmäßig. Danach Code-Review, Befunde in einem eigenen Commit beheben.
- Review nach Größe des Schritts (seit 2026-11-16, um Tokens zu sparen): Neue Logik oder neue Abläufe bekommen ein Review durch einen einzigen Agenten, der beide Achsen (Standards und Spec) in einem Bericht prüft. Reine Inhalts- und CSS-Änderungen und kleine Fixes bekommen kein Review, nur die Nachprüfung durch die Hauptsession.
- Review-Befunde gehen per SendMessage an den Agenten zurück, der den Schritt umgesetzt hat; kein neuer Agent für die Fixes.
- Jeder Auftrag verlangt einen Bericht von höchstens 15 Zeilen; Einzelheiten nur auf Nachfrage.
- Befehle in Aufträgen: `npm test` nur aus PowerShell mit großem `C:\` (Git-Bash mit `c:` scheitert, siehe Mängel). Das gilt auch für Review-Agenten.
- Im Browser prüfen Agenten mit `npm run browser -- <szenario> [ausgabeordner]` (`tools/browser.ts`): Das Tool startet Vite und Edge headless, ruft das Szenario auf und beendet beide wieder. Das Szenario ist eine kleine .ts-Datei im Scratchpad mit Standardfunktion `(b: Browser) => Promise<void>`; Befehle und ein Beispiel stehen im Kopf von `tools/browser.ts`. Kein eigenes CDP-Skript schreiben; fehlt dem Tool etwas, ergänzen.
- Die Hauptsession prüft jedes Ergebnis selbst nach (Typprüfung, Tests, Prüfskript) und übernimmt keinen Agentenbericht ungeprüft. Sie sieht je Schritt ein Bildschirmfoto an; weitere Zustände misst der Agent über `zustand()` und meldet sie. Was nur der Agent geprüft hat, wird dem Nutzer so gesagt. Ausnahme für die beiden kleinen Sammlungsschritte vom 2026-11-17: keine Bildschirmfotos; die Optik prüft der Nutzer, das Verhalten wird im Browser gemessen.
- Nach jedem Schritt auf die Rückmeldung des Nutzers warten.
- Commits direkt auf `main`, Commit-Nachrichten auf Englisch. Nicht pushen, außer der Nutzer verlangt es. `CLAUDE.md` ist nicht eingecheckt und bleibt es.
- Änderungen an Design-Guidelines, Stilprofil und Mindmap nur nach Vorschlag und Okay des Nutzers.
- Nach jedem Commit zieht die Hauptsession diesen Abschnitt nach: Stand-Commit, Einstieg, Stand der Inhalte, nächste Schritte, Mängel, neue Werkzeuge. Erledigtes verschiebt sie nach `docs/chronik.md` (nach Meilenstein und Schritt, mit Commit und Datum). Hier bleibt nur, was für die weitere Arbeit gilt: heutiges Verhalten, sofern es nicht in der Spec steht, Ungeprüftes, Mängel, Werkzeuge. Neues Verhalten gehört in die Spec, nicht nur in die Chronik.

### Umgesetzte Anforderungen

Umgesetzt: F1 bis F5, F4a, F7 bis F10, F13 bis F16, F17, F18, F21, F31, F32, F22, F24, F25, F23, F30, F33 bis F36. Teilweise: F6 (der Zähler fehlt, siehe Nächste Schritte, Punkt 6a), F11 (Haken und Stand im Hinweis ja; Schalter fehlt), F19 (nur in der Logik, nicht in der Oberfläche), F20 (siehe Nächste Schritte, Punkt 6), F26 (Auslösen über das Symbol im Hinweis fehlt), F27 (das Abzeichen fehlt).

### Offene Entscheidungen des Nutzers

- **Farben weiterer Wissensgebiete.** Der Vorschlag in ADR 0005 stößt sich mit festen Bedeutungen: Rot heißt in jeder Welt Gefahr, Orange in der Fabrik Roboter. Erst zu klären, wenn es Karten außerhalb der Technik gibt.

### Nächste Schritte in M1

Reihenfolge als Vorschlag; der Nutzer entscheidet je Schritt. Erledigt sind die Punkte 1, 1a bis 1c, 2 und 4 (siehe Chronik).

- Punkt 3: Karte `servomotor` und Beziehungen; die Karte kommt an den Hotspot `motor` in `robotergelenk`.
- Punkt 5: Abzeichen, Hilfe-Schalter, Schalter für die Haken, Auslösen über das Symbol im Hinweis, breitere Klickfläche (F26 bis F29, F37, F11), Zurücksetzen des Spielstands (F19 in der Oberfläche).
- Punkt 6: Rest des Prüfskripts (F20): Längenvorgaben und Bausteinzahl, Karten ohne Hotspot, Kreise und Erreichbarkeit im Szenennetz (die Funktionen liegen in `src/logik/szenennetz.ts`), symmetrische Beziehungen an beiden Karten, Kreise bei `acyclic`, `linkLabel` ohne `link`, fehlende Bild- und Symboldateien, Prüfung von Kartenbildern und Symbolen auf verbotene Inhalte, Hotspot-Dichte.
- Punkt 6a: Zähler für gefundene Karten (F6), der beim Aufdecken einer Karte steigt. Form und Ort klärt der Nutzer vor dem Start. Am 2026-11-17 hatte er einen eigenen, dauernd sichtbaren Zähler noch abgelehnt; die Spec verlangt ihn weiter, daher dieser Schritt.
- Punkt 7: Abnahme nach Spec Abschnitt 10.

### Bekannte Mängel und Ungeprüftes

- Nur in Logiktests geprüft, nicht im Browser: Startszene mit Eintrittskarte (F30), Ladefehler des Rückwegs beim Herauszoomen. Die Öffnen-Animation über den Kartenknopf ist nicht eigens geprüft (läuft über dieselbe Funktion `zeigeKarte`).
- Sammlung ungeprüft: Tab-Reihenfolge, Screenreader, `prefers-reduced-motion`, lange Titel, viele Karten, vom Browser selbst ausgelöstes Schließen.
- Ungeprüft im Browser: der Name des Dialogs im Fehlerzustand und die Ansage „Neue Karte gefunden“ im Screenreader. Offen, gleiches Muster: `.karte-laedt` ist eine bedingt gerenderte `role="status"`-Region.
- Kartenknopf und Aktionssymbol (Lupe „Hineinzoomen“) stehen im Hinweis nebeneinander und sehen gleich aus; nur der Kartenknopf ist ein Knopf. Der Nutzer lässt das vorerst so (2026-11-16).
- `npm run zoomansicht` hat Tests, aber kein Review (vom Nutzer nicht verlangt).
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
- Kartenumfeld (4a): `--karte-umfeldzone` ist auf die heutigen Blöcke abgestimmt; eine Karte mit mehr Beziehungsgruppen scrollt auch im Querformat. Inhalte haben bisher nur eine Beziehung (`encoder` misst `robotergelenk`), Gruppen mit mehreren Nachbarn sind nicht angesehen. Nur gemessen, nicht angesehen: die Optik der Einblendung nach dem Aufdecken.
- Auf schmalen Bildschirmen ist die Kartenschrift klein (bei 360 px Breite etwa 13 px vorne, 11 px hinten, Quellen etwa 8 px). Laut Messung läuft derzeit keine Karte über.
- Schema-Fehler erscheinen teils englisch. Das Prüfskript sieht nur `.json` und `.svg`.
- Die Migration zwischen Spielstand-Versionen ist ungetestet, weil es nur Version 1 gibt.
- Nie geprüft: Firefox, echte Touch-Geräte, Screenreader, Handy im Hochformat, eine Karte mit eigenem Bild, eine zweite Textfassung. Alle Prüfungen am laufenden Spiel liefen in ferngesteuertem Edge.
- Alle elf Karten sind gegen `design-guidelines-karte.md` Abschnitt 8 geprüft, aber kein Kartentext und kein Hotspot-Text ist von einem Menschen gegengelesen. Die Agenten lasen die Quellen über WebFetch, also als Zusammenfassung, nicht im Volltext. Schwache Stellen: `hallenleuchte` ohne eigene unabhängige Quelle zu Hallenleuchten; `kabelkanal` stützt sich auf ein Fachportal und eine Herstellerseite, die Rückseite ist dadurch dünn; `not-halt-und-zaun` nutzt einen Fachverlag (WEKA). Hotspot-Texte haben keinen Prüfstatus.
- Ein im Hintergrund gestarteter Vite-Server läuft weiter, wenn die Hintergrund-Aufgabe gestoppt wird. Danach Port 5199 prüfen und den eigenen Prozess per PID beenden. `npm run browser` räumt selbst auf und bricht ab, wenn Port 5199 oder 9333 schon belegt ist.

### Anhaltspunkte im Code

- `src/logik/`: reine Logik und geteilte Typen (`inhaltsverzeichnis.ts`, `szenennetz.ts`, `wissensnetz.ts`, `fortschritt.ts`, `spielstand.ts`, `hinweis.ts`, `kartendatei.ts`, `erlaubte-svg.ts`, `gebietsfarbe.ts`).
- `src/szene/`: Szenenmodul ohne Preact (`szene.ts`, `eingabe.ts`, `haken.ts`).
- `src/oberflaeche/`: Preact (`anwendung.tsx`, `ueberlagerung.ts` als reiner Zustand der Überlagerungen, `sammlung.tsx`, `szenenansicht.tsx`, `hinweis.tsx`, `kartenansicht.tsx`, `kartenseiten.tsx`); das Aussehen der Karte mit allen Maßen und Farben als Variablen in `karte.css`.
- `src/inhalte/laden.ts`, `src/speicher/lokaler-speicher.ts`: Anbindung an Netz und `localStorage`.
- `tools/`: Prüfskript (`pruefung.ts`), Einlesen, Kommandozeile, Vite-Plugin; `browser.ts` für Prüfungen im echten Browser; `zoom-ansicht.ts` für das Grundgerüst einer Zoom-Ansicht.
- Starten: `npm run dev`. Prüfen: `npm run typecheck`, `npm test`, `npm run pruefen`.

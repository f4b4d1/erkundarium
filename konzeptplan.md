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

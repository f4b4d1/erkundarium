# Erkundarium – Spec v0.1: der Durchstich

Diese Spec beschreibt den ersten lauffähigen Code: drei Szenen, etwa zehn Karten, die ganze Funktionskette einmal. Abschnitt 8 listet, was die Grill-Session noch klären muss.

## 1 Ziel und Umfang

**Ziel:** Beweisen, dass Erkunden, Zoomen, Karten sammeln und Speichern rein aus Datendateien funktionieren.

**Im Umfang**

- Eine Welt `fabrik` mit den Szenen Fabrikhalle, Roboterzelle und Robotergelenk
- Etwa 10 Karten, davon mindestens 2 mit Beziehungen zueinander
- Klick, Zoom, Pfadanzeige, Karte aufdecken, Sammlung, Fortschritt, Speichern
- Prüfskript für Inhalte

**Nicht im Umfang**

- Verschiebbare Szenen, bewegte Elemente, Easter Eggs, Sammelgegenstände
- Kartensets, Quiz, Startbildschirm
- Profil-Oberfläche, Export und Import des Spielstands
- App-Verpackung mit Tauri, zweite Sprache, Vorlesen

## 2 Feste Entscheidungen

| Nr. | Entscheidung |
| --- | --- |
| E1 | Web-Technik: TypeScript, SVG, HTML/CSS. Kein Rust im Anwendungscode. |
| E2 | Statische Web-App, beim Entwickeln über einen lokalen Entwicklungsserver. |
| E3 | Szenen sind SVG-Dateien. Der Zeichenstil wird aus den Stilproben A, B, C gewählt. |
| E4 | Daten statt Code: Inhalte liegen als Dateien unter `content/`, die Engine unter `src/`. |
| E5 | Die Engine kennt nur allgemeine Begriffe, keine Fachbegriffe wie Fabrik oder Roboter. |
| E6 | Keine feste Tiefe und kein eigener Begriff für Oberebenen: Eine Stadt ist eine Szene. |
| E7 | Der Spielstand speichert nur IDs gefundener Karten. Prozentwerte werden berechnet. |
| E8 | IDs sind nach Veröffentlichung unveränderlich. |
| E9 | Jede Karte braucht mindestens eine Quelle und einen Prüfstatus. |
| E10 | Kartenbeziehungen sind ein Netz: mehrere Beziehungen je Karte, in beide Richtungen lesbar. |
| E11 | Sprache der Inhalte: Deutsch. Texte bleiben vom Layout getrennt. |
| E12 | Kartentexte halten Längenvorgaben ein; die Werte kommen aus der Musterkarte. |

## 3 Begriffe

| Begriff | Bedeutung |
| --- | --- |
| world | Ein Inhaltspaket als Ordner, zum Beispiel `fabrik`. Kein Ort in der Spielwelt. |
| scene | Eine gezeichnete Ansicht. Kann von mehreren Hotspots aus erreichbar sein. |
| hotspot | Ein klickbares SVG-Element mit genau einer Aktion. |
| card | Eine Wissenskarte mit Vorder- und Rückseite, Quelle und Beziehungen. |
| topic | Ein Themengebiet mit Farbe und Kartendesign, zum Beispiel Antriebstechnik. |
| relation | Eine gerichtete, typisierte Verbindung zwischen zwei Karten. |
| save | Der Spielstand mit Profilen und gefundenen Karten. |

## 4 Funktionale Anforderungen

**Navigation**

- F1: Beim Start lädt die Anwendung das Inhaltsverzeichnis und zeigt die Startszene der Welt.
- F2: Die Szenen-SVG wird in die Seite eingebettet. Jedes Element mit `data-hotspot` und passendem Eintrag in der Szenendatei ist klickbar und per Tastatur erreichbar.
- F3: Ein Hotspot mit Aktion `scene` zoomt auf das angeklickte Element und wechselt dann in die Zielszene.
- F4: Die Pfadanzeige zeigt alle Ebenen bis zur aktuellen Szene. Ein Klick auf eine Ebene springt direkt dorthin.
- F5: Jede Szene wird erst beim Betreten geladen.

**Hinweistexte**

- F21: Jedes Element mit Hotspot zeigt beim Überfahren mit der Maus und bei Tastaturfokus einen Hinweistext, zum Beispiel „Motorleitung: versorgt den Servomotor mit Leistung“.
- F22: Der Hinweistext kommt aus den Feldern `label` und `hint` der Szenendatei, nicht aus der SVG. Er ist damit ohne Zeichenprogramm editierbar und später übersetzbar.
- F23: Die Anwendung zeichnet den Hinweis selbst im Stil der Oberfläche. Der Browser-Tooltip aus dem `<title>` der SVG ist in Szenen verboten, damit kein zweiter Hinweis des Browsers erscheint. Den Kurznamen trägt stattdessen das Attribut aria-label.
- F24: Ein Hotspot mit Aktion `info` hat nur einen Hinweistext und weder Karte noch Zoom, etwa ein einzelnes Kabel.

**Karten**

- F6: Ein Hotspot mit Aktion `card` deckt beim ersten Klick die Karte mit Animation auf, markiert sie als gefunden und erhöht den Zähler.
- F7: Jeder weitere Klick öffnet die Karte ohne Aufdeck-Animation.
- F8: Eine Karte lässt sich wenden. Die Vorderseite zeigt Titel, Bild und Kurztext; die Rückseite Vertiefung, Quellen und Link.
- F9: Das Infofeld rendert die Bausteine `text`, `list`, `facts`, `table` und `funfact`.
- F10: Der Link öffnet in einem neuen Tab.

**Markierung und Fortschritt**

- F11: Hotspots gefundener Karten tragen in der Szene einen kleinen Haken, der sich über einen Schalter ausblenden lässt. Der Hinweis beim Überfahren nennt zusätzlich den Stand, etwa „3 von 5 Karten“.
- F12: Eine Szene gilt als abgeschlossen, wenn alle ihre Karten gefunden und alle von ihr erreichbaren Szenen abgeschlossen sind. Abgeschlossene Szenen sind am Hotspot und in der Pfadanzeige markiert.
- F13: Der Gesamtfortschritt ist gefundene Karten geteilt durch vorhandene Karten, bei jedem Start neu berechnet.

**Sammlung**

- F14: Die Sammlung zeigt alle Karten nach Themengebiet. Nicht gefundene Karten erscheinen als Schatten ohne Inhalt.
- F15: Gefundene Karten lassen sich in der Sammlung öffnen und wenden.
- F16: Eine geöffnete Karte listet ihre Nachbarn: was sie enthält und worin sie enthalten ist.

**Speichern**

- F17: Nach jedem Fund wird automatisch gespeichert.
- F18: Der Spielstand trägt eine Schema-Version. Unbekannte Karten-IDs im Spielstand bleiben erhalten und zählen nicht mit.
- F19: Es gibt eine Funktion zum Zurücksetzen des Spielstands.

**Inhaltsprüfung**

- F20: Ein Prüfskript meldet fehlende Quellen, Status `entwurf`, zu lange Texte, Hotspots ohne Ziel, SVG-Kennungen ohne Eintrag, doppelte IDs und Kreise in `enthaelt`-Beziehungen.

## 5 Qualitätsanforderungen

- Q1: Eine neue Szene mit Karten kommt ohne Änderung unter `src/` dazu.
- Q2: In `src/` steht kein Fachbegriff aus den Inhalten.
- Q3: Läuft in aktuellem Firefox und Chrome auf dem Desktop ab 1280 × 720.
- Q4: Die reine Logik für Fortschritt, Abschluss und Spielstand ist ohne Browser testbar.

## 6 Datenformate

IDs bestehen aus Kleinbuchstaben, Ziffern und Bindestrichen. Weltübergreifend wird eine Karte als `welt/karte` angesprochen.

**world.json**

```json
{
  "id": "fabrik",
  "title": "Fabrik",
  "start": "fabrikhalle",
  "scenes": ["fabrikhalle", "roboterzelle", "robotergelenk"],
  "cards": ["industrieroboter", "servomotor", "sps"]
}
```

**Szene**

```json
{
  "id": "roboterzelle",
  "parent": "fabrikhalle",
  "title": "Roboterzelle",
  "svg": "roboterzelle.svg",
  "hotspots": [
    { "id": "roboter", "action": "card", "target": "industrieroboter",
      "label": "6-Achs-Industrieroboter" },
    { "id": "gelenk-3", "action": "scene", "target": "robotergelenk",
      "label": "Achse 3", "hint": "Klicken, um ins Gelenk zu zoomen" },
    { "id": "kabel-leistung", "action": "info",
      "label": "Motorleitung", "hint": "Versorgt den Servomotor mit Leistung" }
  ]
}
```

**Karte**

```json
{
  "id": "industrieroboter",
  "topic": "robotik",
  "title": "Industrieroboter",
  "image": "industrieroboter.svg",
  "front": [{ "type": "text", "text": "..." }],
  "back": [{ "type": "facts", "items": ["..."] }],
  "link": { "label": "...", "url": "https://..." },
  "sources": ["https://..."],
  "relations": [
    { "type": "enthaelt", "card": "robotergelenk" },
    { "type": "enthaelt", "card": "servomotor" }
  ],
  "status": "geprueft"
}
```

**Spielstand**

```json
{
  "schema": 1,
  "active": "standard",
  "profiles": {
    "standard": {
      "cards": { "fabrik/servomotor": "2026-11-20T19:12:00Z" }
    }
  }
}
```

## 7 Regeln für Beziehungen

- Eine Beziehung steht nur an der Ausgangskarte. Die Gegenrichtung berechnet die Engine: Der Servomotor weiß so, dass er Teil von Roboter und Förderband ist.
- Eine Karte darf beliebig viele Beziehungen haben und beliebig oft Ziel sein.
- `enthaelt` ist gerichtet und darf keinen Kreis bilden.
- `verwandt` gilt in beide Richtungen und darf Kreise bilden.
- Zeigt eine Beziehung auf eine nicht gefundene Karte, erscheint diese als Schatten.

## 8 Zum Grillen

Diese Punkte sind bewusst offen. Zu jedem steht meine Tendenz als Startpunkt.

| Nr. | Frage | Tendenz |
| --- | --- | --- |
| O1 | UI-Framework oder reines TypeScript? | Ein leichtes Komponenten-Framework für Karten und Sammlung; die Szene bleibt reines SVG. |
| O2 | Kartentexte in JSON, YAML oder Markdown? | JSON zum Start, weil es ohne Zusatzwerkzeug prüfbar ist. |
| O3 | Pfadanzeige: fester Elternpfad oder gegangener Weg? | Gegangener Weg, weil dieselbe Szene mehrere Eltern haben kann. `parent` bleibt der Standardweg für Direktsprünge. |
| O4 | Darf ein Hotspot zoomen und zugleich eine Karte geben? | Nein. Stattdessen optional eine Karte beim ersten Betreten einer Szene. |
| O5 | Sind Hotspots sichtbar hervorgehoben oder muss man suchen? | Hervorhebung erst beim Überfahren; ein Hilfe-Knopf zeigt alle. |
| O6 | Beschriftungen in der Szene: immer sichtbar oder erst nach dem Fund? | Entschieden: Beschriftungen stehen nie fest in der Szene. Sie erscheinen nur beim Überfahren, siehe F21 bis F23. |
| O7 | Wo wird gespeichert? | `localStorage` reicht für IDs; Wechsel später möglich, wenn die Speicherschicht gekapselt ist. |
| O8 | Kartenbild: eigene SVG oder Ausschnitt der Szene? | Eigene kleine SVG je Karte im selben Stil. |
| O9 | Welche Beziehungstypen zum Start? | Nur `enthaelt` und `verwandt`. |
| O10 | Festes Seitenverhältnis der Szenen? | 16:9 mit `viewBox` 1600 × 900; Ränder bei anderen Bildschirmen. |
| O11 | Welche Tests zuerst? | Fortschritt, Abschluss-Regel F12, Spielstand-Migration, Prüfskript. |
| O12 | Wie werden Szenen-SVGs gegen fehlerhafte Inhalte abgesichert? | Nur eigene Dateien laden; Skripte in SVGs verbietet das Prüfskript. |
| O13 | Hinweistext: Was zeigt er vor dem Fund, und wie erscheint er auf Touch-Geräten ohne Maus? | Vor dem Fund nur der Name, die Erklärung erst danach, damit Karten nichts vorwegnehmen. Auf Touch erscheint der Hinweis beim ersten Tippen, die Aktion beim zweiten. |

## 9 Abnahme

- [ ] Alle Anforderungen F1 bis F24 sind an der Fabrik-Welt vorführbar
- [ ] Eine vierte Szene mit zwei Karten kommt nur über Dateien in `content/` dazu
- [ ] Nach dem Hinzufügen sinkt der Prozentwert, die gefundenen Karten bleiben gefunden
- [ ] Das Prüfskript läuft ohne Meldung
- [ ] Seite neu laden: Spielstand, Haken und Zähler sind unverändert

# Erkundarium – Spec v0.1: der Durchstich

Diese Spec beschreibt den ersten lauffähigen Code: drei Szenen, etwa zehn Karten, die ganze Funktionskette einmal.

Umsetzungsstand, offene Entscheidungen und nächste Schritte: `konzeptplan.md`, Abschnitt 6.

Stand: nach der Grilling-Session vom 2026-11-16. Alle Fragen aus Abschnitt 8 sind entschieden; Abschnitt 9 listet, was offen bleibt. Begriffe stehen in `GLOSSARY.md`, Begründungen der großen Entscheidungen in `docs/adr/`, Meilensteine in `konzeptplan.md`.

## 1 Ziel und Umfang

**Ziel:** Beweisen, dass Erkunden, Zoomen, Karten sammeln und Speichern rein aus Datendateien funktionieren.

**Im Umfang**

- Eine Welt `fabrik` mit den Szenen Fabrikhalle, Roboterzelle und Robotergelenk
- Etwa 10 Karten, davon eine an Hotspots in zwei Szenen, mindestens 2 mit Beziehungen zueinander, 2 bis 3 mit Kartenbild
- Klick, Zoom, Pfadanzeige, Hinweis, Karte aufdecken, Eintrittskarte, Sammlung, Fundorte, Fortschritt, Speichern
- Prüfskript für Inhalte, das auch das Inhaltsverzeichnis erzeugt
- Genau eine Textfassung: `de`

**Nicht im Umfang**

- Verschiebbare Szenen, bewegte Elemente, Easter Eggs, Sammelobjekte
- Kartensets, Quiz, Startbildschirm
- Profil-Oberfläche, Export und Import des Spielstands
- Hosting, Abnahme auf dem Handy, zweite Textfassung, Vorlesen
- Seitwärtswechsel zwischen Szenen (Tür in den Nachbarraum)

## 2 Feste Entscheidungen

| Nr. | Entscheidung |
| --- | --- |
| E1 | Web-Technik: TypeScript, SVG, HTML/CSS. Kein Rust im Anwendungscode. |
| E2 | Statische Web-App. Entwicklungsserver und Build mit Vite. |
| E3 | Szenen sind SVG-Dateien im Stil B+ „Kontur fein“ nach `design-guidelines.md`. |
| E4 | Daten statt Code: Inhalte liegen als Dateien unter `content/`, die Engine unter `src/`. |
| E5 | Die Engine kennt nur allgemeine Begriffe, keine Fachbegriffe wie Fabrik oder Roboter, auch keine Namen von Beziehungstypen. |
| E6 | Keine feste Tiefe und kein eigener Begriff für Oberebenen: Eine Stadt ist eine Szene. |
| E7 | Der Spielstand speichert nur die IDs gefundener Karten mit Fundzeitpunkt und die Einstellungen. Prozentwerte, Abschluss und betretene Szenen werden berechnet. |
| E8 | IDs sind nach Veröffentlichung unveränderlich. |
| E9 | Jede Karte braucht mindestens eine Quelle. Jede Textfassung einer Karte hat einen Prüfstatus. |
| E10 | Das Wissensnetz hat zwei Schichten: berechnete Fundorte und von Hand gesetzte Beziehungen (ADR 0003). |
| E11 | Sichtbare Texte liegen in Textfassungen, getrennt von Struktur und Layout. Zum Start nur `de` (ADR 0002). |
| E12 | Kartentexte halten Längenvorgaben und eine Höchstzahl an Bausteinen je Seite ein. Die Werte stehen in einer Inhaltsdatei und wurden in M1 am Kartendesign festgelegt. |
| E13 | Karten und Themengebiete liegen in einem gemeinsamen Kartenvorrat mit global eindeutiger ID. Eine Welt besteht nur aus Szenen (ADR 0001). |
| E14 | Beliebig viele Hotspots dürfen auf dieselbe Karte zeigen. Gefunden ist eine Eigenschaft der Karte (ADR 0001). |
| E15 | Eine Szene kann eine Eintrittskarte tragen, die beim ersten Betreten gefunden wird. Jeder Hotspot hat genau eine Aktion (ADR 0001). |
| E16 | Die Zoom-Hotspots allein definieren das Szenennetz. Es ist gerichtet und ohne Kreise; eine Szene kann von mehreren aus erreichbar sein. Ein Feld `parent` gibt es nicht. |
| E17 | Weitergabe und Handy über eine gehostete Website, keine native Verpackung (ADR 0004). Keine Funktion hängt allein am Überfahren mit der Maus. |
| E18 | Oberfläche mit Preact. Die Szene liegt in einem eigenen Modul außerhalb des Frameworks. Die Logik ist reines TypeScript ohne Framework und ohne DOM. Tests mit Vitest. |
| E19 | Inhalte sind JSON-Dateien mit JSON-Schema. Das Inhaltsverzeichnis wird vom Prüfskript erzeugt, nie von Hand gepflegt. |

## 3 Begriffe

Maßgeblich ist `GLOSSARY.md`. Die Feldnamen in den Daten:

| Feld | Begriff |
| --- | --- |
| world | Welt |
| scene | Szene |
| hotspot | Hotspot |
| action | Aktion: `card`, `scene` oder `info` |
| card | Karte |
| topic | Themengebiet |
| domain | Wissensgebiet |
| relation | Beziehung |
| texts | Textfassungen |
| save | Spielstand |

## 4 Funktionale Anforderungen

**Navigation**

- F1: Beim Start lädt die Anwendung das erzeugte Inhaltsverzeichnis und zeigt die Startszene der Welt. Sie startet immer dort.
- F2: Die Szenen-SVG wird in die Seite eingebettet. Jedes Element mit `data-hotspot` und passendem Eintrag in der Szenendatei ist klickbar, antippbar und per Tastatur erreichbar. Die Anwendung setzt `aria-label` aus `label`.
- F3: Ein Hotspot mit Aktion `scene` zoomt auf das angeklickte Element und wechselt dann in die Zielszene. Der Klick auf das Ding ist immer der Zoom.
- F4: Die Pfadanzeige zeigt den gegangenen Weg von der Startszene bis zur aktuellen Szene. Ein Klick auf eine Ebene kürzt den Weg bis dorthin.
- F4a: Zurück in eine frühere Ebene geht es über die Pfadanzeige oder mit der Escape-Taste. Escape schließt zuerst eine offene Karte, die Sammlung oder einen offenen Hinweis (F8a, F14, F21); erst wenn alles zu ist, geht Escape genau eine Ebene zurück. Dabei zoomt jede Ebene auf dem Weg nacheinander aus dem Hotspot heraus, über den der Weg weiterführte: Sie erscheint im Endausschnitt des Zooms (F3) und zoomt auf die volle Ansicht. Erst werden alle Szenen des Rückwegs geladen; scheitert eine, bleibt die aktuelle Szene stehen. Danach liegt der Fokus auf dem Hotspot, über den die Zielebene verlassen wurde. Eintrittskarten decken sich dabei nicht auf.
- F5: Jede Szene wird erst beim Betreten geladen.
- F25: Die Szene skaliert mit festem Seitenverhältnis 16:9 auf die verfügbare Fläche; bei anderen Bildschirmen bleiben Ränder.

**Hinweis und Hervorhebung**

- F21: Jeder Hotspot zeigt einen Hinweis: beim Überfahren mit der Maus, bei Tastaturfokus und beim ersten Tippen auf Touch. Mit der Maus öffnet er sich einmal beim Betreten des Hotspots am Eintrittspunkt und bewegt sich danach nicht; er schließt beim Verlassen, außer die Maus fährt in den Hinweis. Escape schließt einen offenen Hinweis.
- F22: Der Hinweis kommt aus den Feldern `label` und `hint` der Szenendatei. `label` erscheint immer. `hint` erscheint bei `info` und `scene` immer, bei `card` erst, wenn die Karte gefunden ist. `hint` ist bei `info` Pflicht, sonst freiwillig, und enthält nie eine Bedienanweisung.
- F23: Die Anwendung zeichnet den Hinweis selbst. Er enthält Name, gegebenenfalls Erklärung, Stand und das Symbol der Aktion (Karte, Lupe, Info). `<title>` und `aria-label` sind in Szenen-SVGs verboten.
- F24: Ein Hotspot mit Aktion `info` hat nur einen Hinweis und weder Karte noch Zoom, etwa ein einzelnes Kabel.
- F26: Auslösen je Eingabegerät. Maus: Klick löst sofort aus. Tastatur: Eingabetaste löst aus. Touch: Das erste Tippen zeigt Hinweis und Hervorhebung; ein zweites Tippen auf denselben Hotspot oder auf das Symbol im Hinweis löst aus; Tippen daneben schließt den Hinweis.
- F27: Im Ruhezustand ist kein Hotspot hervorgehoben; sichtbar sind nur die Haken gefundener Karten. Beim Überfahren, bei Fokus und nach dem ersten Tippen bekommt der Hotspot einen hellen Umriss entlang seiner Form und ein Abzeichen in der oberen rechten Ecke.
- F28: Das Abzeichen zeigt Aktion und Zustand über ein Symbol, nicht über Farbe: verdeckte Karte (Karte nicht gefunden), Haken (Karte gefunden), Lupe (Zoom), Lupe mit Haken (Zielszene abgeschlossen), „i“ (Info).
- F36: Hotspots dürfen verschachtelt sein. Es gilt immer der innerste getroffene Hotspot; der äußere wird nicht mit ausgelöst.
- F37: Über dünne Linien (Kabel, Rohre, Schläuche) legt die Anwendung eine unsichtbare, breitere Klickfläche, damit sie mit Maus und Finger zu treffen sind.
- F29: Ein Hilfe-Schalter blendet die Abzeichen aller Hotspots der Szene ein, bis er wieder ausgeschaltet wird.

**Karten**

- F6: Ein Hotspot mit Aktion `card` deckt beim ersten Auslösen die Karte mit Animation auf, markiert sie als gefunden und erhöht den Zähler.
- F7: Jedes weitere Auslösen öffnet die Karte mit einer kurzen Öffnen-Animation statt der Aufdeck-Animation. Das gilt für jeden Hotspot derselben Karte in jeder Szene und für jeden anderen Weg, eine gefundene Karte zu öffnen.
- F8: Eine Karte lässt sich wenden. Die Vorderseite zeigt Titel, Bild und Kurztext; die Rückseite den Titel als kleine Überschrift, Vertiefung, Quellen und Link. Das Schild oben auf beiden Seiten zeigt Name und Symbol des Themengebiets. Die Farbe kommt vom Wissensgebiet des Themengebiets (ADR 0005). Fehlt das Bild, zeigt die Karte das Symbol des Themengebiets.
- F8a: Bedienung der offenen Karte. Ein Klick auf die Karte wendet sie, außer wenn dabei Text markiert wird; der Knopf „Wenden“ tut dasselbe. Ein Klick oder Tippen neben die Karte schließt sie, ebenso der Knopf „Schließen“ und die Escape-Taste. Wird die Karte während der Aufdeck-Animation gewendet, endet die Animation sofort. Beim Schließen blendet die Karte mit einer kurzen Animation aus; währenddessen nimmt die Kartenansicht keine Eingaben mehr an. Kann eine Karte beim ersten Fund nicht geladen werden, ist sie trotzdem gefunden; die Anwendung meldet den Fehler, und beim nächsten Öffnen erscheint die Karte mit der Öffnen-Animation (F7). Öffnet sich über die Beziehungen (F16) eine andere Karte, zeigt die Kartenansicht sie auf der Vorderseite mit der Öffnen-Animation und führt einen Verlauf: Der Knopf „Zurück“ erscheint ab der zweiten Karte und zeigt die vorige. „Schließen“, Escape und ein Klick neben die Karte schließen die ganze Kartenansicht, nicht nur eine Karte; der Fokus kehrt dorthin zurück, wo sie geöffnet wurde (Hotspot, Kartenknopf oder Eintrag der Sammlung).
- F9: Das Infofeld rendert die Bausteine `text`, `list`, `facts`, `table` und `funfact`.
- F10: Der Link öffnet in einem neuen Tab.
- F30: Beim ersten Betreten einer Szene mit Eintrittskarte läuft erst der Zoom, dann deckt sich die Karte in der neuen Szene von selbst auf und gilt als gefunden.
- F31: In jeder Szene mit Eintrittskarte steht am Szenentitel in der Pfadanzeige ein Kartenknopf, der die Eintrittskarte öffnet.
- F32: Der Hinweis eines Zoom-Hotspots trägt einen Kartenknopf, sobald die Eintrittskarte der Zielszene gefunden ist. Der Hinweis bleibt offen, während die Maus vom Hotspot hinein fährt. Per Tastatur ist der Kartenknopf mit Tab vom fokussierten Hotspot aus erreichbar; Shift+Tab und Escape führen zum Hotspot zurück.

**Markierung und Fortschritt**

- F11: Hotspots gefundener Karten tragen in der Szene einen Haken, der sich über einen Schalter ausblenden lässt. Der Hinweis eines Zoom-Hotspots nennt den Stand, etwa „3 von 5 Karten“; gezählt wird die Zielszene samt allen tieferen Szenen, jede Karte einmal.
- F12: Eine Szene gilt als abgeschlossen, wenn ihre Eintrittskarte und alle Karten ihrer Hotspots gefunden sind und alle per Zoom erreichbaren Szenen abgeschlossen sind. Abgeschlossene Szenen sind am Hotspot und in der Pfadanzeige markiert.
- F13: Der Fortschritt einer Welt ist gefundene Karten geteilt durch die Karten, auf die ihre Szenen verweisen. Der Gesamtfortschritt zählt alle Karten im Kartenvorrat. Beides wird bei jedem Start neu berechnet.

**Sammlung**

- F14: Die Sammlung zeigt alle Karten nach Themengebiet. Nicht gefundene Karten erscheinen als Schatten ohne Inhalt. Sie ist ein modaler Dialog über dem ganzen Spielbereich samt Pfadanzeige und öffnet sich über einen Knopf rechts in der Pfadanzeige; während eines Szenenwechsels tut der Knopf nichts. Ihr Kopf nennt den Fortschritt der Welt der aktuellen Szene und den Gesamtfortschritt (F13), je als „x von y Karten“. „Schließen“ und Escape schließen sie; die Szene bleibt darunter stehen, und der Fokus kehrt auf den Knopf zurück.
- F15: Gefundene Karten lassen sich in der Sammlung öffnen und wenden. Die Karte öffnet sich in der Kartenansicht (F8a) über der Sammlung, mit der Öffnen-Animation (F7). Schließt die Kartenansicht, bleibt die Sammlung offen, und der Fokus kehrt auf den Eintrag der Karte zurück. Escape schließt immer nur die oberste Lage.
- F16: Eine geöffnete Karte zeigt unter der Karte zwei Blöcke: „Zu finden in“ mit den Namen ihrer Fundorte (berechnet, nur Text, kein Sprung) und ihre Beziehungen, gruppiert nach Typ und Richtung mit den Bezeichnungen aus `relations.json`. Gefundene Nachbarkarten sind Knöpfe und öffnen sich in der Kartenansicht (F8a); nicht gefundene erscheinen als Schatten ohne Titel und lassen sich nicht öffnen, also deckt sich über die Beziehungen nie eine Karte auf. Ein leerer Block entfällt. Beim ersten Fund blenden die Blöcke erst nach dem Aufdecken ein; ihr Platz bleibt von Anfang an frei.

**Speichern**

- F17: Nach jedem Fund und jeder Änderung einer Einstellung wird automatisch gespeichert.
- F18: Der Spielstand trägt eine Schema-Version. Unbekannte Karten-IDs im Spielstand bleiben erhalten und zählen nicht mit. Einzelne schiefe Einträge fallen beim Einlesen weg, der Rest bleibt. Stammt der Spielstand von einer neueren Version des Spiels, wird er weder gelesen noch überschrieben: Die Sitzung läuft mit leerem Stand, speichert nicht und sagt das sichtbar.
- F19: Es gibt eine Funktion zum Zurücksetzen des Spielstands.
- F33: Der Spielstand liegt in `localStorage` hinter einer Speicherschicht mit den Operationen Laden und Speichern.

**Inhaltsprüfung**

- F20: Das Prüfskript prüft alle Inhalte gegen das JSON-Schema und meldet außerdem:
  - fehlende Quellen, zu lange Texte, zu viele Bausteine je Seite
  - doppelte IDs im Kartenvorrat und unter den Szenen
  - Hotspots ohne Ziel, SVG-Kennungen ohne Eintrag und Einträge ohne SVG-Kennung
  - Karten, auf die kein Hotspot und keine Szene verweist
  - Kreise im Szenennetz und Szenen, die von der Startszene nicht erreichbar sind
  - Beziehungen mit unbekanntem Typ oder Ziel, symmetrische Beziehungen an beiden Karten, Kreise bei Typen mit `acyclic`
  - `info`-Hotspots ohne `hint`
  - Karten mit unbekanntem Themengebiet und Themengebiete mit unbekanntem Wissensgebiet
  - verbotene Elemente in Szenen-SVGs und Kartenbildern nach `design-guidelines.md` Abschnitt 1 Regel 2, dazu `aria-label`, das Attribut `style`, Ereignis-Attribute wie `onclick` und Verweise nach außen
  - jedes Element außerhalb der Erlaubnisliste: `svg`, `g`, `defs`, `clipPath`, `use`, `path`, `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`. Die Anwendung lässt beim Einbetten ebenfalls nur diese Elemente und eine feste Liste von Attributen durch.
  - Szenen-SVGs ohne Szenendatei und Dateien an unerwarteter Stelle im Inhaltsordner
  - Hotspot-Dichte außerhalb der Vorgabe für den Szenentyp (Warnung)
- F34: Das Prüfskript hat zwei Stufen. Beim Entwickeln ist der Prüfstatus `entwurf` eine Warnung, und die Karte ist im Spiel als Entwurf gekennzeichnet. Beim Veröffentlichen ist `entwurf` ein Fehler, und der Build bricht ab.
- F35: Das Prüfskript erzeugt das Inhaltsverzeichnis: alle Welten, Szenen mit ihren Hotspots (ID, Aktion, Ziel), Karten, Themengebiete, Wissensgebiete und Beziehungstypen; je Karte ID, Themengebiet, Titel je Textfassung und Beziehungen. Es enthält keine weiteren Texte. Der Entwicklungsserver erzeugt es bei jeder Inhaltsänderung neu.

## 5 Qualitätsanforderungen

- Q1: Eine neue Szene, Karte oder ein neuer Beziehungstyp kommt ohne Änderung unter `src/` dazu. Eine neue Karte ist genau eine neue Datei.
- Q2: In `src/` steht kein Fachbegriff aus den Inhalten.
- Q3: Abnahmeziel für v0.1: aktueller Firefox und Chrome auf dem Desktop ab 1280 × 720. Das Handy wird nicht abgenommen, aber nicht verbaut: Die Oberfläche setzt keine feste Fenstergröße voraus.
- Q4: Die Logik für Szenennetz, Fundorte, Fortschritt, Abschluss und Spielstand ist ohne Browser testbar und kennt weder Preact noch das DOM.
- Q5: Alle Pfade zu Inhalten sind relativ; die gebaute Seite läuft in einem Unterverzeichnis.
- Q6: Tests zuerst für: Fortschritt, Abschluss-Regel F12, Fundorte, Szenennetz ohne Kreise, Spielstand-Migration, Prüfskript.

## 6 Datenformate

IDs bestehen aus Kleinbuchstaben, Ziffern und Bindestrichen. Karten-IDs sind über den ganzen Kartenvorrat eindeutig, Szenen-IDs über alle Welten. Karten und Szenen haben getrennte ID-Räume: Die Karte `servomotor` und die Szene `servomotor` dürfen nebeneinander bestehen.

**Ordner**

```text
content/
  domains.json
  topics.json
  relations.json
  limits.json
  schema/<name>.schema.json
  topics/<name>.svg
  cards/<id>.json
  cards/<name>.svg
  worlds/<welt>/world.json
  worlds/<welt>/scenes/<id>.json
  worlds/<welt>/scenes/<id>.svg
```

**world.json**

```json
{
  "id": "fabrik",
  "title": { "de": "Fabrik" },
  "start": "fabrikhalle"
}
```

Welche Szenen zur Welt gehören, ergibt sich aus dem Ordner; welche Karten, aus den Szenen.

**Szene**

```json
{
  "id": "roboterzelle",
  "type": "ansicht",
  "title": { "de": "Roboterzelle" },
  "card": "roboterzelle",
  "hotspots": [
    { "id": "roboter", "action": "card", "target": "industrieroboter",
      "label": { "de": "6-Achs-Industrieroboter" } },
    { "id": "gelenk-3", "action": "scene", "target": "robotergelenk",
      "label": { "de": "Achse 3" } },
    { "id": "kabel-leistung", "action": "card", "target": "motorleitung",
      "label": { "de": "Motorleitung" },
      "hint": { "de": "Versorgt den Servomotor mit Leistung" } },
    { "id": "bodenmarkierung", "action": "info",
      "label": { "de": "Bodenmarkierung" },
      "hint": { "de": "Trennt Fahrweg und Arbeitsbereich" } }
  ]
}
```

- `card` ist die Eintrittskarte und freiwillig.
- `type` ist `ansicht`, `objekt` oder `schema` und wird nur vom Prüfskript gelesen.
- Die SVG heißt wie die Szene und liegt daneben.

**Karte**

```json
{
  "id": "servomotor",
  "topic": "antriebstechnik",
  "image": "servomotor.svg",
  "sources": ["https://..."],
  "link": "https://...",
  "relations": [
    { "type": "verwandt", "card": "asynchronmotor" }
  ],
  "texts": {
    "de": {
      "status": "geprueft",
      "title": "Servomotor",
      "front": [{ "type": "text", "text": "..." }],
      "back": [{ "type": "facts", "items": ["..."] }],
      "linkLabel": "..."
    }
  }
}
```

- `image`, `link`, `relations` und `linkLabel` sind freiwillig. `linkLabel` ohne `link` meldet das Prüfskript als Fehler.
- `image` nennt eine SVG-Datei in `cards/`, ohne Pfad. Der Name besteht wie eine ID aus Kleinbuchstaben, Ziffern und Bindestrichen und endet auf `.svg`; er muss nicht der Karten-ID gleichen. Das Prüfskript prüft, dass die Datei existiert.
- `sources` sind Texte, mindestens einer. Eine Quelle im Netz steht als bloße URL da, ohne Titel und Beschreibung; andere Quellen (etwa Bücher) als kurze Angabe mit Autor, Titel und Jahr. Die Rückseite zeigt die Quellen klein und ohne Nummern, in der Reihenfolge der Datei. `link` beginnt mit `http://` oder `https://`.
- `status` ist `entwurf` oder `geprueft`. `geprueft` setzt nur ein Mensch, der den Text gegen die Quelle gelesen hat.
- Jede Textfassung einer Karte ist vollständig: `status`, `title`, `front` und `back` sind Pflicht. `front` hat mindestens einen Baustein, `back` darf leer sein. Die Rückfallregel auf `de` greift, wenn einer Karte die ganze Fassung fehlt.
- Wo ein Text je Textfassung vorhanden ist (auch `label`, `hint`, `title` der Szene), ist `de` Pflicht.

**Bausteine**

| Baustein | Form |
| --- | --- |
| `text` | `{ "type": "text", "text": "..." }` |
| `funfact` | `{ "type": "funfact", "text": "..." }` |
| `list` | `{ "type": "list", "items": ["...", "..."] }` |
| `facts` | `{ "type": "facts", "items": ["...", "..."] }` |
| `table` | `{ "type": "table", "rows": [["Kopf A", "Kopf B"], ["a", "b"]] }`; die erste Zeile ist die Kopfzeile |

**limits.json** (Werte gezählt in Zeichen; festgelegt am Kartendesign aus M1)

```json
{
  "maxTitleLength": 40,
  "frontText": { "min": 300, "max": 400 },
  "maxBackTextLength": 250,
  "maxFunfactLength": 160,
  "maxItemLength": 100,
  "maxBlocksFront": 1,
  "maxBlocksBack": 3,
  "maxTableColumns": 2,
  "maxTableRows": 4,
  "maxSources": 3
}
```

- `maxTitleLength` gilt für `title` und `linkLabel`.
- `frontText` gilt für den Text des einen Bausteins `text` auf der Vorderseite. Unter `min` ist eine Warnung, über `max` ein Fehler.
- `maxBackTextLength` gilt für `text` auf der Rückseite, `maxFunfactLength` für `funfact`.
- `maxItemLength` gilt für Einträge in `list` und `facts` und für Tabellenzellen.
- `maxBlocksFront` und `maxBlocksBack` gelten je Kartenseite.
- `maxTableRows` zählt die Kopfzeile mit.
- `maxSources` gilt für `sources` einer Karte.

**relations.json**

```json
[
  { "id": "steuert",
    "forward": { "de": "steuert" },
    "backward": { "de": "wird gesteuert von" } },
  { "id": "misst",
    "forward": { "de": "misst" },
    "backward": { "de": "wird gemessen von" } },
  { "id": "verwandt", "symmetric": true,
    "forward": { "de": "verwandt mit" } }
]
```

Schalter je Typ: `symmetric` (gilt in beide Richtungen) und `acyclic` (darf keinen Kreis bilden). Beide sind freiwillig und sonst falsch. Bei einem symmetrischen Typ ist `backward` verboten, sonst Pflicht.

**domains.json**

```json
[
  { "id": "technik", "title": { "de": "Technik" }, "color": "#6B7785" }
]
```

`color` hat die Form `#RRGGBB`.

**topics.json**

```json
[
  { "id": "antriebstechnik", "title": { "de": "Antriebstechnik" },
    "domain": "technik", "icon": "antriebstechnik.svg" }
]
```

`domain` nennt ein Wissensgebiet aus `domains.json`. `icon` nennt eine SVG-Datei in `content/topics/`, ohne Pfad; für den Namen gilt dieselbe Regel wie für `image` einer Karte.

**Spielstand**

```json
{
  "schema": 1,
  "active": "standard",
  "profiles": {
    "standard": {
      "cards": { "servomotor": "2026-11-20T19:12:00Z" },
      "settings": { "showMarkers": true }
    }
  }
}
```

v0.1 kennt nur das Profil `standard` und hat keine Oberfläche für Profile.

## 7 Regeln für Fundorte und Beziehungen

- Der Fundort einer Karte ist jede Szene, in der sie Eintrittskarte ist oder an einem Hotspot hängt. Fundorte werden berechnet und stehen in keiner Datei.
- Eine Beziehung ist eine Fachaussage, die keine Szene zeigt. Sie steht nur an der Ausgangskarte; die Gegenrichtung berechnet die Engine.
- Aus der Lage eines Hotspots in einer Szene entsteht nie eine Beziehung.
- Eine Karte darf beliebig viele Beziehungen haben und beliebig oft Ziel sein.
- Eine symmetrische Beziehung steht an genau einer der beiden Karten.
- Starttypen: `steuert`, `misst`, `verwandt`. Einen Typ `enthaelt` gibt es zum Start nicht. `verwandt` ist Auffangtyp und wird sparsam benutzt.
- Zeigt eine Beziehung auf eine nicht gefundene Karte, erscheint diese als Schatten.

## 8 Entschiedene Fragen

| Nr. | Frage | Entscheidung |
| --- | --- | --- |
| O1 | UI-Framework oder reines TypeScript? | Entschieden: Vite, Preact für die Oberfläche, Szene als eigenes Modul, Logik in reinem TypeScript (E18). |
| O2 | Kartentexte in JSON, YAML oder Markdown? | Entschieden: JSON mit JSON-Schema, eine Datei je Karte, Textfassungen als Block in der Karte und je Feld am Hotspot (E19, Abschnitt 6). |
| O3 | Pfadanzeige: fester Elternpfad oder gegangener Weg? | Entschieden: gegangener Weg. `parent` entfällt (E16, F4). |
| O4 | Darf ein Hotspot zoomen und zugleich eine Karte geben? | Entschieden: nein. Die Szene trägt eine Eintrittskarte (E15, F30 bis F32). |
| O5 | Sind Hotspots sichtbar hervorgehoben oder muss man suchen? | Entschieden: Umriss und Abzeichen erst bei Überfahren, Fokus oder erstem Tippen; Hilfe-Schalter zeigt alle (F27 bis F29). |
| O6 | Beschriftungen in der Szene? | Entschieden: nie fest in der Szene, nur im Hinweis (F21 bis F23). |
| O7 | Wo wird gespeichert? | Entschieden: `localStorage` hinter einer Speicherschicht; Einstellungen je Profil (F33). Export und Import sind Bedingung für die Weitergabe. |
| O8 | Kartenbild: eigene SVG oder Ausschnitt der Szene? | Entschieden: eigene SVG ohne Text, freiwillig; sonst Symbol des Themengebiets (F8). |
| O9 | Welche Beziehungstypen zum Start? | Entschieden: `steuert`, `misst`, `verwandt` als Daten; kein `enthaelt`, dafür berechnete Fundorte (Abschnitt 7). |
| O10 | Festes Seitenverhältnis der Szenen? | Entschieden: 16:9 mit `viewBox` 1600 × 900, Ränder bei anderen Bildschirmen (F25). |
| O11 | Welche Tests zuerst? | Entschieden: siehe Q6. |
| O12 | Wie werden SVGs abgesichert? | Entschieden: nur eigene Dateien; das Prüfskript prüft die ganze Verbotsliste (F20). |
| O13 | Hinweis vor dem Fund und auf Touch? | Entschieden: siehe F22 und F26. |

Weitere Entscheidungen der Session ohne eigene O-Nummer: gemeinsamer Kartenvorrat (E13), Karte an mehreren Hotspots (E14), Textfassungen (E11), Weitergabe als Website (E17), Prüfstatus in zwei Stufen (F34), „Unter dem Boden“ und „Halle und Tor“ als Bereiche der Startszene (Mindmap).

## 9 Offene Fragen

Keine davon blockiert M1.

| Nr. | Frage | Fällig |
| --- | --- | --- |
| N1 | Wie sieht die Musterkarte aus, und welche Längenvorgaben und Bausteinzahlen ergeben sich? Welches Format haben Kartenbilder? | M2 |
| N2 | Welche Themengebiete hat die Fabrik, mit welchem Symbol? Die Farbe kommt vom Wissensgebiet (ADR 0005). | M1 für die Durchstich-Karten, M2 vollständig |
| N3 | Welche Beziehungen bekommen die Karten der Fabrik? Braucht es weitere Typen? | M1 für mindestens 2, M2 vollständig |
| N4 | Wo wird gehostet, und darf die Seite öffentlich erreichbar sein? | M3 |
| N5 | Wie verhält sich die Szene auf dem Handy im Hochformat? | M3 |
| N6 | Wie sehen Umriss und Abzeichen genau aus? | M1 einfach, M4 verfeinert |
| N7 | Datenmodell für Sammelobjekte und Kartensets: Was kommt in den Spielstand, wie hängt die Belohnungskarte ohne Fundort im Netz? Mitglieder der Sets? | M5 |
| N8 | Zeigt die einfache Textfassung externe Links? Wie heißt und wie wählt man Textfassungen im Startbildschirm? | M6 |
| N9 | Wie wählt man bei mehreren Welten die Welt, und darf ein Zoom über Weltgrenzen führen? | M7 |
| N10 | Braucht es Seitwärtswechsel zwischen Szenen als eigene Aktion? | bei Bedarf |

## 10 Abnahme

- [ ] Alle Anforderungen F1 bis F37 sind an der Fabrik-Welt vorführbar
- [ ] Die Karte `motorleitung` wird in der Halle gefunden und ist danach in der Roboterzelle abgehakt
- [ ] Das Robotergelenk gibt beim ersten Betreten seine Eintrittskarte; danach ist sie über den Kartenknopf in der Szene und im Hinweis des Zoom-Hotspots zu öffnen
- [ ] Eine vierte Szene mit zwei Karten kommt nur über Dateien in `content/` dazu
- [ ] Nach dem Hinzufügen sinkt der Prozentwert, die gefundenen Karten bleiben gefunden
- [ ] Ein neuer Beziehungstyp kommt nur über `relations.json` dazu
- [ ] Das Prüfskript läuft ohne Fehler; in der Stufe Veröffentlichen bricht es bei einer Karte im Status `entwurf` ab
- [ ] Seite neu laden: Spielstand, Haken und Zähler sind unverändert
- [ ] Alle Funktionen sind ohne Maus nur mit der Tastatur bedienbar

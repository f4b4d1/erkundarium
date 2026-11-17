# Erkundarium

Ein Erkundungsspiel: Man zoomt durch gezeichnete Szenen einer Themenwelt und sammelt dabei Wissenskarten, die untereinander ein Netz bilden.

## Language

**Welt**:
Eine zusammengehörige Gruppe von Szenen mit einer Startszene und eigenem Stilprofil, zum Beispiel die Fabrik. Eine Welt besitzt keine Karten. In Daten: `world`.
_Avoid_: Themenwelt (nur in Fließtext), Paket, Level

**Kartenvorrat**:
Die Gesamtheit aller Karten des Spiels, unabhängig von Welten.
_Avoid_: Kartenpool, Deck

**Themengebiet**:
Ein Fachgebiet, dem jede Karte genau einmal zugeordnet ist und das Name und Symbol im Schild der Karte bestimmt, zum Beispiel Antriebstechnik. Jedes Themengebiet gehört genau einem Wissensgebiet. Themengebiete gehören keiner Welt. In Daten: `topic`.
_Avoid_: Kategorie, Thema, Fach

**Wissensgebiet**:
Eine große Gruppe von Themengebieten, die die Farbe der Karte bestimmt, zum Beispiel Technik. Es gibt nur wenige. Wissensgebiete gehören keiner Welt. In Daten: `domain`.
_Avoid_: Bereich (das ist ein Teil einer Szene), Obergebiet, Kategorie

**Gefunden**:
Zustand einer Karte im Spielstand, sobald sie einmal aufgedeckt wurde. Gilt für die Karte, nicht für den Hotspot: Alle Hotspots einer gefundenen Karte sind abgehakt.
_Avoid_: entdeckt, freigeschaltet, gesammelt

**Szene**:
Eine gezeichnete Ansicht, in der man Dinge anklicken kann. In Daten: `scene`.
_Avoid_: Ebene, Level, Bild

**Hotspot**:
Ein klickbares Ding in einer Szene mit genau einer Aktion. In Daten: `hotspot`.
_Avoid_: Objekt, Element, Klickfläche

**Aktion**:
Das, was ein Hotspot beim Auslösen tut. Es gibt genau drei: eine Karte geben, in eine Szene zoomen oder nur einen Hinweis zeigen. In Daten: `card`, `scene`, `info`.
_Avoid_: Funktion, Typ des Hotspots

**Hinweis**:
Das kleine Feld, das die Anwendung an einem Hotspot zeigt: Name, gegebenenfalls Erklärung, Stand und Symbol der Aktion.
_Avoid_: Tooltip, Hover-Text, Popup (nur umgangssprachlich)

**Abzeichen**:
Das Symbol in der oberen rechten Ecke eines Hotspots, das Aktion und Zustand zeigt: verdeckte Karte, Haken, Lupe oder Info.
_Avoid_: Marker, Badge, Icon

**Haken**:
Das Abzeichen einer gefundenen Karte: ein grüner Kreis mit weißem Haken.
_Avoid_: Fundmarker, Marker, Häkchen

**Sammelobjekt**:
Ein Ding in einer Szene, das man findet und sammelt, das aber keine Karte ist, zum Beispiel der Ammonit. Späteres Feature.
_Avoid_: Item, Easter Egg (das ist eine versteckte Überraschung, nicht zwingend sammelbar)

**Zoom**:
Der Wechsel von einer Szene in eine tiefere Szene über einen Hotspot. Zoom führt immer tiefer; die Szenen einer Welt bilden so ein gerichtetes Netz ohne Kreise, in dem eine Szene von mehreren Szenen aus erreichbar sein kann.
_Avoid_: Sprung, Szenenwechsel, Navigation

**Pfad**:
Der in dieser Sitzung gegangene Weg von der Startszene bis zur aktuellen Szene. Jeder Schritt des Pfads ist eine Ebene: eine Szene samt dem Hotspot, über den man sie betrat. „Ebene“ heißt nur dieser Platz im Pfad, nie die Szene selbst.
_Avoid_: Breadcrumb, Elternpfad

**Herauszoomen**:
Der Rückweg über den Pfad in eine frühere Ebene. Jede Ebene auf dem Weg zoomt aus dem Hotspot heraus, über den der Pfad weiterführte. Das Gegenstück zum Zoom, der immer tiefer führt.
_Avoid_: Zurückspringen, Zoom zurück

**Abgeschlossen**:
Zustand einer Szene, wenn ihre Eintrittskarte und alle Karten ihrer Hotspots gefunden sind und alle per Zoom erreichbaren Szenen abgeschlossen sind.
_Avoid_: fertig, komplett, 100 %

**Karte**:
Eine Wissenskarte zu genau einem Ding oder Begriff, mit Vorder- und Rückseite. In Daten: `card`.
_Avoid_: Wissenskarte (nur in Fließtext für Außenstehende), Eintrag

**Eintrittskarte**:
Die Karte, die zu dem Ding gehört, das eine Szene zeigt. Sie wird beim ersten Betreten der Szene gefunden, unabhängig vom Weg dorthin.
_Avoid_: Szenenkarte, Zoom-Karte

**Textfassung**:
Ein Satz aller sichtbaren Texte für eine Sprache und ein Niveau, zum Beispiel Deutsch oder einfaches Deutsch für Kinder. Jede Karte und jede Szene kann in mehreren Textfassungen vorliegen.
_Avoid_: Sprache, Übersetzung, Kindermodus, Variante

**Prüfstatus**:
Zustand einer Textfassung einer Karte: Entwurf oder geprüft. Geprüft heißt, ein Mensch hat den Text gegen die angegebene Quelle gelesen.
_Avoid_: Freigabe, Review-Status

**Spielstand**:
Die gefundenen Karten und Einstellungen eines Profils. In Daten: `save`.
_Avoid_: Fortschritt (das ist der berechnete Anteil gefundener Karten), Speicherstand

**Beziehung**:
Eine von Hand gesetzte, typisierte Fachaussage zwischen zwei Karten, zum Beispiel „Servoregler steuert Servomotor“. Beziehungen verbinden nie Szenen und sagen nichts darüber, wo eine Karte liegt. In Daten: `relation`.
_Avoid_: Link, Verknüpfung

**Beziehungstyp**:
Die Art einer Beziehung mit einer Bezeichnung je Richtung, zum Beispiel „steuert“ und „wird gesteuert von“.
_Avoid_: Relationsart, Kantentyp

**Nachbarkarte**:
Eine Karte, die über eine Beziehung mit einer anderen Karte verbunden ist.
_Avoid_: verwandte Karte, verlinkte Karte

**Fortschritt**:
Der berechnete Anteil gefundener Karten, je Welt und gesamt, angezeigt als „x von y Karten“. Wird nie gespeichert.
_Avoid_: Spielstand (das sind die gespeicherten Funde), Quote

**Kartenansicht**:
Der modale Dialog, in dem eine Karte offen liegt: die Karte mit „Wenden“, „Schließen“ und gegebenenfalls „Zurück“, darunter die Blöcke „Zu finden in“ und Beziehungen.
_Avoid_: Kartendialog, Overlay, Popup

**Verlauf**:
Die Folge der Karten, die in einer offenen Kartenansicht über Nachbarkarten nacheinander geöffnet wurden; „Zurück“ zeigt die vorige. Er endet mit dem Schließen der Kartenansicht.
_Avoid_: History, Pfad (das ist der Weg durch die Szenen)

**Sammlung**:
Die Übersicht über alle Karten des Kartenvorrats, gruppiert nach Themengebiet, mit dem Fortschritt im Kopf. Gefundene Karten öffnen sich daraus in der Kartenansicht. Ein Platz einer Karte in der Sammlung heißt Eintrag.
_Avoid_: Album, Inventar, Deck

**Schatten**:
Der Platzhalter einer nicht gefundenen Karte in der Sammlung oder bei den Beziehungen: Form ohne Titel und Inhalt, nicht bedienbar.
_Avoid_: Silhouette, ausgegraute Karte

**Überlagerung**:
Was über der Szene liegt und sie unbedienbar macht: die Sammlung, die Kartenansicht oder beide, die Kartenansicht dann obenauf. Der Hinweis zählt nicht dazu. Im Code: `Ueberlagerung`.
_Avoid_: Overlay, Stapel, Modal

**Fundort**:
Eine Szene, in der eine Karte vorkommt, als Eintrittskarte oder über einen Hotspot. Fundorte ergeben sich aus den Szenen und werden nie von Hand gesetzt.
_Avoid_: enthält, ist Teil von, Vorkommen

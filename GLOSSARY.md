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
Ein Fachgebiet, dem jede Karte genau einmal zugeordnet ist und das Farbe und Kartendesign bestimmt, zum Beispiel Antriebstechnik. Themengebiete gehören keiner Welt. In Daten: `topic`.
_Avoid_: Kategorie, Thema, Fach

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

**Sammelobjekt**:
Ein Ding in einer Szene, das man findet und sammelt, das aber keine Karte ist, zum Beispiel der Ammonit. Späteres Feature.
_Avoid_: Item, Easter Egg (das ist eine versteckte Überraschung, nicht zwingend sammelbar)

**Zoom**:
Der Wechsel von einer Szene in eine tiefere Szene über einen Hotspot. Zoom führt immer tiefer; die Szenen einer Welt bilden so ein gerichtetes Netz ohne Kreise, in dem eine Szene von mehreren Szenen aus erreichbar sein kann.
_Avoid_: Sprung, Szenenwechsel, Navigation

**Pfad**:
Der in dieser Sitzung gegangene Weg von der Startszene bis zur aktuellen Szene.
_Avoid_: Breadcrumb, Elternpfad

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

**Fundort**:
Eine Szene, in der eine Karte vorkommt, als Eintrittskarte oder über einen Hotspot. Fundorte ergeben sich aus den Szenen und werden nie von Hand gesetzt.
_Avoid_: enthält, ist Teil von, Vorkommen

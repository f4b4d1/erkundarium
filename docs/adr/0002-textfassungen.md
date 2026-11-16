# Sichtbare Texte liegen in Textfassungen, getrennt von der Struktur

Karten und Szenen trennen Struktur (ID, Themengebiet, Bild, Beziehungen, Quellen, Hotspot-Ziele) von sichtbarem Text (Titel, Bausteine von Vorder- und Rückseite, Namen und Hinweise der Hotspots, Linktext). Die Texte liegen in Textfassungen wie `de`, später `de-einfach` oder `en`. Eine zweite Sprache und eine kindgerechte Fassung sind derselbe Mechanismus: andere Texte für dieselbe Karte.

Grund: Kindgerechte Nutzung und Übersetzung sind Zukunftsziele. Dieselbe Karte soll mit demselben Hotspot, Bild, Fund und denselben Beziehungen in einfacherer Sprache erscheinen können. Die Trennung kostet am Anfang fast nichts; nachträglich müsste jede Inhaltsdatei umgebaut werden.

## Folgen

- Die Bausteine einer Kartenseite gehören zur Textfassung, nicht zur Struktur: Eine einfache Fassung darf weniger oder andere Bausteine haben.
- Der Prüfstatus gilt je Textfassung; Quellen gelten für die Karte.
- Der Spielstand kennt keine Textfassung. Eine gefundene Karte ist in jeder Fassung gefunden.
- Fehlt ein Text in der gewählten Fassung, wird `de` angezeigt.
- Die erste Version enthält nur `de` und keine Auswahl. Die Auswahl (Sprache, Kinder-Schalter) kommt mit dem Startbildschirm.
- Eigene Karten oder Welten nur für Kinder bleiben daneben möglich; sie sind gewöhnliche Karten und Welten.

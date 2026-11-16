# Karten liegen in einem gemeinsamen Vorrat, nicht in den Welten

Karten und Themengebiete gehören keiner Welt. Sie liegen in einem gemeinsamen Vorrat mit global eindeutiger ID ohne Welt-Präfix; eine Welt besteht nur aus Szenen, deren Hotspots auf Karten verweisen. Beliebig viele Hotspots in beliebigen Szenen und Welten dürfen auf dieselbe Karte zeigen, und „gefunden“ ist eine Eigenschaft der Karte, nicht des Hotspots.

Grund: Dasselbe Ding (Asynchronmotor, Not-Halt) kommt in mehreren Szenen und später in mehreren Welten vor. Es soll genau eine Karte haben, die einmal gefunden wird und überall als gefunden gilt. Weil IDs nach Veröffentlichung unveränderlich sind und im Spielstand stehen, lässt sich das später nicht mehr umstellen.

## Verworfene Alternativen

- **Karte gehört einer Welt, andere Welten verweisen hinein (`fabrik/asynchronmotor`):** Die Heimat der Karte wäre Zufall, und Welten hingen voneinander ab.
- **Karte gehört einer Welt, keine Querverweise:** doppelter Inhalt, dasselbe Ding müsste mehrfach gefunden werden.

## Folgen

- Eine Welt ist kein eigenständig verschickbares Paket. Das Spiel wird immer mit allen Inhalten zusammen weitergegeben.
- Karten-IDs müssen über alle Fächer hinweg eindeutig sein (`roboterzelle`, `pflanzenzelle` statt `zelle`).
- Der Fortschritt einer Welt wird aus den Karten berechnet, auf die ihre Szenen verweisen; eine Kartenliste je Welt gibt es nicht.
- Eine Szene kann eine Eintrittskarte tragen, die beim ersten Betreten gefunden wird. So bleibt jeder Hotspot bei genau einer Aktion, und Beziehungen verbinden ausschließlich Karten.

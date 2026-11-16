# Die Kartenfarbe kommt vom Wissensgebiet, nicht vom Themengebiet

Über den Themengebieten liegt eine zweite Ebene: das Wissensgebiet (in Daten `domain`), zum Beispiel Technik. Jedes Themengebiet gehört genau einem Wissensgebiet. Das Wissensgebiet trägt die Farbe der Karte; das Themengebiet behält Name und Symbol im Schild der Karte. Die Wissensgebiete stehen in `content/domains.json`, und `topics.json` verweist mit `domain` darauf, statt selbst eine Farbe zu nennen. Karten nennen weiterhin nur ihr Themengebiet.

Grund: Mit einer Farbe je Themengebiet wären schon in der Fabrik vier und mit jeder Welt weitere Farben nötig geworden, die sich weder unterscheiden noch merken lassen. Wenige große Gruppen tragen die Farbe besser. Die Zuordnung steht am Themengebiet und nicht an der Karte, damit keine Karte ihr widersprechen kann.

Technik bekommt Stahlgrau `#6B7785`. Das ist bewusst unauffällig: Farbe kommt später über die Kartenbilder auf die Karten.

## Folgen

- Festgelegt ist nur Technik. Weitere Wissensgebiete und ihre Farben werden entschieden, wenn es Karten dazu gibt. Vorschlag: Pflanzen Grün `#3FA34D`, Tiere Orange `#FF7A1A`, Mensch und Körper Rot `#E4572E`, Erde und Weltall Violett `#8E6FD8`, Stoffe und Kräfte Türkis `#19A7B8`, Geschichte und Kultur Ocker `#D9A441`, Alltag und Gesellschaft Blau `#1F78C1`. Am Vergleichsbild lagen Orange und Rot nah beieinander, und Ocker hob sich im Bildfeld kaum vom Papier ab.
- Wissensgebiete gehören wie Themengebiete keiner Welt. Solange alle Themengebiete zur Technik gehören, haben alle Karten dieselbe Farbe.
- Grau darf nicht zugleich „nicht gefunden“ bedeuten: Schattenkarten in der Sammlung werden ein leerer, gestrichelter Umriss.
- Die Anwendung hat keine Ersatzfarbe. Ein Themengebiet ohne bekanntes Wissensgebiet und eine Karte ohne bekanntes Themengebiet sind Fehler des Prüfskripts.

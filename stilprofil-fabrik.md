# Stilprofil Fabrik

Ergänzt `design-guidelines.md` für die Welt `fabrik` (Elektrotechnik, Automatisierung, Robotik).
Beispiel für eine Ansicht dieser Welt: `erkundarium-referenzszene-b-plus-v3.svg`.

## Maßstab und Aufbau der Ansichten

- Maßstab: 128 Einheiten = 1 m (Mensch 225 hoch, Schaltschrank 260).
- Feste Höhen der Halle: Dach y 40–92, Wand bis 640, Bodenplatte 640–672, Untergrund 672–900.
- Der Untergrund zeigt Kabelkanäle und Rohre im Schnitt.
- Typische Orte: Fertigungshalle, Roboterzelle, Schaltraum, Leitstand, Lager.

## Bedeutung der Signalfarben

| Farbe | Bedeutung in dieser Welt |
| --- | --- |
| Rot `#E4572E` | Leistung und Motorleitung; dazu Gefahr, Not-Halt, Brandschutz |
| Grün `#3BB273` | Geber und Messsignal; „in Ordnung“; Erste Hilfe |
| Violett `#8E6FD8` | Feldbus und Daten; Sensorgehäuse |
| Gelb `#F6C945` | Warnung, Leuchten, Helm, Gehäuse von Not-Halt-Tastern, Pfosten und Rahmen des Schutzzauns |
| Türkis `#19A7B8` | Steuerung: SPS-Baugruppen |
| Orange `#FF7A1A` | Roboter und bewegte Maschinenteile |
| Blau `#1F78C1` | Arbeitskleidung; Quittiertaster |

## Ortsfarben

| Ort | Wand | Sockelzone |
| --- | --- | --- |
| Fertigungshalle, Roboterzelle (warm) | `#FFE9C7` | `#F7D9A8` |
| Schaltraum, Leitstand (kühl) | `#E3ECF5` | `#CCD9E8` |
| Lager (neutral) | `#EDE6DA` | `#DDD2BF` |

## Weltpalette

| Stoff oder Ding | Farbe |
| --- | --- |
| Dach / Träger | `#4A5568` / `#8793A0` |
| Bodenplatte (Beton) | `#A9A397` |
| Kabelkanal innen | `#4B4640` |
| Schrankgehäuse / Montageplatte | `#C9D6E8` / `#F7F9FB` |
| Verdrahtungskanal / Schaltgeräte | `#BCC5CE` / `#EFEFE8` |
| CPU, Antrieb am Band | `#2C6E7B` |
| Leistungselektronik, Schlauchpaket | `#4B5563` |
| Display | `#D8F3DC`, `#B7F0C1` |
| Karton | `#E0A458` |
| Warnweste | `#CFDC4C` |

## Verbindungen

| Art | Kernbreite |
| --- | --- |
| Leistungskabel | 5,2 |
| Signal- und Buskabel | 4,3 |
| Schlauchpaket am Roboter | 3,6 (Unterlage 8,2) |
| Druckluftschlauch (Metall mittel `#6B7785`) | 3 |
| Rohr | 13,8 |
| Roboterglied | 40 / 31 / 19 von Sockel zur Hand |

Gehäuse zuerst zeichnen, dann Leitungen, dann Einbauten: So verschwinden Leitungsenden unter Klemmen und Steckern.

## Typische Details für leere Flächen

Kabelpritsche mit Abgängen, Not-Halt-Taster, Kennzahlen-Tafel, Wanduhr, Feuerlöscher mit Schild, Verbandkasten,
Warnschild, Signalsäule, Bodenmarkierung, Hallenleuchte, Steckdosenverteiler.

## Menschen und Ausrüstung

- In der Halle: Helm, Warnweste, Sicherheitsschuhe. Im Schaltraum und Leitstand ohne Helm.
- Werkzeug zeigt die Rolle: Tablet, Messgerät, Schraubendreher, Funkgerät.

## Fachliche Leitplanken

- Schaltschrank von oben nach unten: Einspeisung und Schutz, Steuerung, Antriebe, Klemmen. Verdrahtungskanäle zwischen den Reihen.
- Ein 6-Achs-Roboter zeigt in der Seitenansicht mindestens Achse 2, 3 und 5 als Gelenke.
- Schutzzaun einer Roboterzelle mindestens 1,4 m hoch: Niedrigere Schutzeinrichtungen nur mit zusätzlichen Maßnahmen, unter 1 m gar nicht (DIN EN ISO 13857). Zugang durch eine Schutztür mit Türschalter. Gitter aus Metall dunkel als feine Linien, damit der Roboter dahinter sichtbar bleibt.
- Leitungen zum Feld verlassen den Schrank unten über die Klemmenreihe.
- Schema-Szenen verwenden Schaltzeichen nach DIN EN 60617.
- Häufige Fehler: Kabel ohne Ziel, Sensor ohne Leitung, Motor ohne Geberleitung, Schutzeinrichtung fehlt an der Roboterzelle.

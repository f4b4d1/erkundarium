# Erkundarium – Design-Guidelines der Karte

Diese Datei regelt die Karte: Aufbau, Farben, Schrift, Symbole der Themengebiete, Kartenbilder und vor allem die Kartentexte.
Für Konturstil, Paletten und verbotene SVG-Elemente gilt `design-guidelines.md` (Abschnitte 1, 3 und 4); diese Datei verweist darauf und regelt nur, was bei der Karte anders oder zusätzlich gilt.
Die Längen stehen verbindlich in `content/limits.json` (Spec Abschnitt 6), die Maße und Farben der Oberfläche als Variablen in `src/oberflaeche/karte.css`. Bei Widerspruch gelten diese beiden Dateien; diese Datei wird dann nachgezogen.

Vor jeder neuen oder geänderten Karte Abschnitt 5 lesen und am Ende Abschnitt 8 abhaken.

## 1 Aufbau

- Format 5 : 7, hochkant. Alle Maße innerhalb der Karte hängen an der Kartenbreite, damit die Karte bei jeder Fenstergröße gleich umbricht.
- Kopf auf beiden Seiten: links das Schild mit Symbol und Namen des Themengebiets, rechts der Stempel „Entwurf“, solange die Textfassung den Prüfstatus `entwurf` hat.
- Vorderseite: Titel groß, darunter Bildfeld und Kurztext, die sich die Fläche je zur Hälfte teilen. Genau ein Baustein `text`.
- Rückseite: Titel klein als Überschrift, darunter höchstens drei Bausteine, unten der Fuß mit Link und Quellen.
- Der Inhalt passt ohne Scrollen auf die Karte. Scrollen ist nur Rückfallebene für Fehler und wird beim Prüfen als Mangel gemeldet.

## 2 Farben

| Zweck | Farbe |
| --- | --- |
| Rahmen der Karte | Farbe des Wissensgebiets aus `content/domains.json` (ADR 0005) |
| Blatt der Vorderseite | `#F7F9FB` (Weiß aus Stufe 1) |
| Blatt der Rückseite | `#F4F1EA` (Fell hell aus Stufe 2) |
| Bildfeld, Kopfzeile der Tabelle, Merkpunkte | Gebietsfarbe zu 20 % auf dem Blatt, Kopfzeile 40 % |
| „Schon gewusst?“ | Gelb `#F6C945` |
| Kontur und Text | `#26262E`; leise Texte und feine Linien als dieselbe Farbe mit Deckkraft |
| Abdunklung hinter der offenen Karte | `#181820` mit Deckkraft 0,66, nur dafür |

- Sonst nur Farben aus `design-guidelines.md` Abschnitt 4, Stufe 1 und 2. Weltfarben (Stufe 3) gehören nicht auf die Karte, weil Karten keiner Welt gehören.
- Keine Verläufe. Schatten nur als harter, flacher Versatz.
- Farbe ist Ordnung, nicht Schmuck. Lebendigkeit kommt über die Kartenbilder.

## 3 Schrift

- Nur Schriften des Systems, nichts von außen. Fließtext in der Systemschrift, Titel in einer gerundeten Titelschrift.
- Grundschrift = Kartenbreite / 28. Kurztext vorne 1,045-fach, Titel hinten 1,15-fach, Fuß 0,68-fach; die Quellen sind so groß wie der Fuß.
- Kleiner als die Quellen wird nichts. Wird Platz knapp, wird der Inhalt gekürzt, nicht die Schrift.

## 4 Symbole der Themengebiete

- Eine SVG je Themengebiet in `content/topics/`, `viewBox="0 0 48 48"`, ohne `width` und `height`.
- Verbote wie bei Szenen (`design-guidelines.md` Abschnitt 1, Regel 2), also kein Text.
- Wegen der kleinen Darstellung dünnere Linien als in Szenen: Hauptkontur 2,5, Nebenkontur 2, Linien mit Unterlage als Kern + 5. Sonst Stil, Konturfarbe und Paletten wie in Szenen.
- Ein Motiv, das in Schildgröße (etwa 20 px) erkennbar bleibt. Nicht das Motiv einer einzelnen Karte, sondern ein Zeichen für das ganze Gebiet.

## 5 Kartentexte

### 5.1 Allgemeingültig

Eine Karte erklärt eine Sache, kein Produkt. Jede Aussage muss für die Sache allgemein gelten, also für jedes übliche Exemplar, nicht nur für ein bestimmtes Modell.

- Keine Hersteller-, Marken- oder Produktnamen. Ausnahme: Geschichte, wenn der Name für die Sache steht (Erfinder, erstes Gerät seiner Art, Jahr).
- Keine Werte aus Datenblättern (Spannung eines Modells, Schaltspiele, Lebensdauer in Stunden, Prozentangaben aus Werbung). Zahlen nur, wenn sie für die Gattung typisch sind, als Bereich oder Größenordnung mit „etwa“ oder „meist“.
- „Ein Hersteller nennt …“ oder „laut Hersteller …“ macht eine Produktangabe nicht allgemein. Solche Sätze kommen nicht auf die Karte.
- Lieber eine einfache, sichere Aussage als eine genaue, die nur manchmal stimmt.

### 5.2 Belegt

- Jede Aussage steht in mindestens einer Quelle der Karte. Ohne Beleg kommt sie nicht auf die Karte.
- Mindestens eine Quelle ist unabhängig von Herstellern: Lexikon (etwa Wikipedia), Lehrbuch, Fachverband, Behörde oder Normungsstelle. Herstellerseiten belegen höchstens das Funktionsprinzip, nie eine allgemeine Zahl.
- Für eine allgemeine Aussage, die in den vorhandenen Quellen fehlt, wird eine allgemeine Quelle ergänzt, nicht eine Produktangabe eingesetzt.
- Höchstens drei Quellen. Form nach Spec Abschnitt 6: Quellen im Netz als bloße URL, andere als kurze Angabe mit Autor, Titel und Jahr.

### 5.3 Verständlich

- Für interessierte Laien ohne Fachwissen. Ein Fachwort nur, wenn die Karte es im selben oder im nächsten Satz erklärt; sonst ein Alltagswort.
- Kurze Sätze, Präsens, aktiv. Keine Bedienanweisungen, kein Werbeton („modern“, „innovativ“, „leistungsstark“).
- Ein Satz, eine Aussage. Keine Aufzählung von Begriffen ohne Erklärung.

### 5.4 Aufteilung auf die Seiten

- Vorderseite (Kurztext, 300 bis 400 Zeichen): Was ist das? Wozu dient es? Wie funktioniert es im Groben? Wo begegnet man ihm? Die Vorderseite muss allein verständlich sein.
- Rückseite: Vertiefung, die über die Vorderseite hinausgeht: Bauteile, Arten, Zusammenhänge, Geschichte. Nichts von der Vorderseite wiederholen.
- Bausteine ergänzen sich und wiederholen sich nicht: Ein `text` erzählt nicht nach, was Tabelle oder Merkpunkte schon zeigen.
- `facts` sind kurze, gesicherte Einzelaussagen, `list` sind gleichartige Dinge (Arten, Teile), `table` ordnet Paare (Teil und Aufgabe).
- „Schon gewusst?“ (`funfact`) ist ein überraschender, gesicherter Fakt mit Bezug zum Alltag oder zur Geschichte. Er darf keine Werbung sein.
- Sicherheitsthemen erklären das Prinzip (wozu, wie es schützt). Sie geben keine Rechts- oder Betriebsanweisungen.

### 5.5 Prüfstatus

Ein Agent oder Autor setzt immer `entwurf`. `geprueft` setzt nur ein Mensch, der jede Aussage gegen die Quellen gelesen hat (Spec F34).

## 6 Kartenbilder

Eine Karte kann ein eigenes Bild tragen: eine kleine SVG im selben Stil wie die Szenen. Ohne Bild zeigt die Karte das Symbol des Themengebiets.

- Es gelten `design-guidelines.md` Abschnitt 3 und 4 und die Verbote aus Abschnitt 1, Regel 2. Ein Kartenbild enthält also keinen Text: Es muss zu jeder Textfassung passen.
- Zeichen ohne Sprache sind erlaubt: Schaltzeichen, Pfeile, Plus und Minus.
- Ein Kartenbild hat keine Hotspots.
- Das Ding sieht aus wie in den Szenen: gleiche Farben, gleiche Grundform, mehr Details.
- Format: `viewBox="0 0 480 300"` (16 : 10, entspricht dem Bildfeld), ohne `width` und `height`. Das Motiv füllt etwa 80 % der Höhe und hält zum Rand mindestens 20 Einheiten Abstand. Kein eigener Hintergrund: Das Bildfeld liefert die getönte Fläche.
- Dateiname nach Spec Abschnitt 6, Datei in `content/cards/`.

## 7 Längen

Verbindlich ist `content/limits.json`. Stand bei Erstellung dieser Datei:

| Was | Grenze |
| --- | --- |
| Titel, Linktext | bis 40 Zeichen |
| Kurztext vorne | 300 bis 400 Zeichen, genau ein Baustein |
| `text` hinten | bis 250 Zeichen |
| „Schon gewusst?“ | bis 160 Zeichen |
| Eintrag in `list` und `facts`, Tabellenzelle | bis 100 Zeichen |
| Bausteine hinten | höchstens 3 |
| Tabelle | höchstens 2 Spalten und 4 Zeilen samt Kopfzeile |
| Quellen | höchstens 3 |

## 8 Abgabe-Prüfung einer Karte

- [ ] Jede Aussage gilt allgemein: keine Marken, keine Produkt- oder Datenblattwerte (5.1)
- [ ] Jede Aussage ist in einer Quelle der Karte belegt; mindestens eine Quelle ist herstellerunabhängig (5.2)
- [ ] Fachwörter erklärt, kein Werbeton (5.3)
- [ ] Vorderseite allein verständlich; Rückseite wiederholt nichts; Bausteine wiederholen sich nicht (5.4)
- [ ] Längen nach `content/limits.json` eingehalten
- [ ] Prüfstatus `entwurf`
- [ ] Karte im Spiel bei 1280 × 720 und 360 × 640 angesehen: nichts läuft über, nichts scrollt
- [ ] Bericht nennt je neuer Aussage die belegende Quelle und alles, was unsicher blieb

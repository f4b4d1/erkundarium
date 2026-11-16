# Erkundarium – Design-Guidelines (Kern, gilt für alle Themenwelten)

Stil: B+ „Kontur fein“ – dunkle Kontur, satte einfarbige Flächen, Formen aus Grundformen.

Diese Datei regelt, **wie** gezeichnet wird. **Was** in einer Themenwelt vorkommt (Bedeutungsfarben, Materialien,
Maßstab, typische Details), steht im Stilprofil der Welt, z. B. `stilprofil-fabrik.md`.
Vor jeder Szene beide Dateien lesen. Fehlt das Profil einer neuen Welt, zuerst das Profil nach Abschnitt 10 anlegen.

Stilreferenz für Strich und Anmutung: `erkundarium-referenzszene-b-plus-v3.svg`. Sie ist ein Beispiel, kein Layout-Muster:
Bildaufbau und Motive einer neuen Szene folgen dem Thema, nicht der Referenz.

## 1 Harte Regeln

1. Format: eine SVG-Datei, `viewBox="0 0 1600 900"`, kein `width`/`height`.
2. Verboten in Szenen: `<script>`, `<style>`, `<text>`, `<title>`, `<image>`, Filter, Verläufe, externe Verweise.
   (Die Referenzdatei enthält `<style>` und Labels nur zur Hover-Demo. Im Spiel zeichnet die Anwendung Hinweise und Haken.)
3. Jedes benennbare Ding ist ein Hotspot: `<g id="…" data-hotspot="…">`. Namen stehen nie in der SVG, auch nicht als `aria-label`.
4. Nichts endet in der Luft: Jede Verbindung (Kabel, Rohr, Ast, Wurzel, Ader, Weg, Bach) beginnt und endet sichtbar an etwas oder hinter etwas.
5. Fachlich korrekt vor hübsch: Aufbau, Anzahl, Lage und Größenverhältnisse müssen stimmen. Unsicheres weglassen und im Bericht nennen, nicht raten.
6. Nur Farben aus Abschnitt 4 und aus dem Stilprofil der Welt.

## 2 Hotspots

- `id` und `data-hotspot` sind identisch, eindeutig, kebab-case, deutsch ohne Umlaute: `kabel-leistung`, `gelenk-3`, `eichenblatt`.
- Texte stehen nie in der SVG. Name und Erklärung eines Hotspots stehen in der Szenendatei (`label`, `hint`), Kartentexte in der Kartendatei. Die Anwendung setzt `aria-label` zur Laufzeit aus `label`.
- `hint` erklärt das Ding und enthält nie eine Bedienanweisung („Klicken, um …“). Was ein Klick bewirkt, zeigt die Anwendung über ein Symbol.
- Hotspots dürfen verschachtelt sein. Das innere Element liegt im Quelltext nach den Flächen des äußeren.
- Mehrere gleiche Dinge: Suffix mit Zahl (`fenster-1`, `fenster-2`).
- Kleinste Klickfläche 24 × 24. Für dünne Linien (Kabel, Rohre, Schläuche) gilt das nicht für die Zeichnung: Die Anwendung legt eine unsichtbare, breitere Klickfläche über die Linie. Parallele Linien halten deshalb 8–10 Abstand (Abschnitt 5).
- Die obere rechte Ecke jedes Hotspots bleibt für sein Abzeichen frei, das die Anwendung zeichnet: Haken, verdeckte Karte, Lupe oder Info (Kreis r 9, Lupe mit Haken r 13,5). Das gilt für alle Hotspots, auch ohne Karte.
- Reine Dekoration ohne Lernwert (Fugen, Kiesel, Schatten, Grashalme) bekommt keinen Hotspot.

Vorlage:

```svg
<g id="not-halt" data-hotspot="not-halt">
  <rect x="638" y="468" width="30" height="40" rx="4" fill="#F6C945"
        stroke="#26262E" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="653" cy="485" r="9" fill="#E4572E" stroke="#26262E" stroke-width="3"/>
</g>
```

## 3 Linien und Formen

| Element | Wert |
| --- | --- |
| Konturfarbe | `#26262E`, nie reines Schwarz |
| Hauptkontur | `stroke-width="3"`, `stroke-linejoin="round"`, `stroke-linecap="round"` |
| Nebenkontur (Teile unter 20 Einheiten) | 2,2 |
| Binnenlinien (Fugen, Rillen, Blattadern, Fellzeichnung) | 1–1,7, teils `opacity` .35–.55 |
| Eckenradius gebauter Dinge | groß 5, mittel 2–3, klein 1 |
| Flächen | einfarbig; Lichtkanten und Binnenflächen ohne Kontur |
| Schatten am Boden | `<ellipse ry="5" fill="#000" opacity=".16">` knapp unter der Standlinie, Breite etwa Objektbreite |

- Die Konturstärke bleibt in jeder Szene gleich, auch im Zoom. Details werden beim Zoomen mehr, Linien nicht dicker.
- Gebaute Dinge aus `rect`, `circle` und geraden `path`; Gewachsenes (Pflanzen, Tiere, Gelände, Wolken) aus `circle`, `ellipse` und weichen Kurven. Keine zackigen Freihandformen.
- Farbige Linien (Leitung, Rohr, Ast, Gliedmaße, Maschinenarm) bestehen aus zwei Pfaden mit identischem `d`:
  zuerst die Unterlage in `#26262E` mit Breite `Kern + 6`, darüber der farbige Kern. Kernbreiten nennt das Stilprofil.
- Koordinaten auf ganze Zahlen runden, höchstens eine Nachkommastelle. `transform` nur für `translate`/`scale` ganzer Gruppen.

## 4 Farben

Das Farbsystem hat drei Stufen. Stufe 1 und 2 gelten überall, Stufe 3 gehört der Welt.

**Stufe 1 – fest in jeder Welt**

| Zweck | Farbe |
| --- | --- |
| Kontur | `#26262E` |
| Weiß (nie `#FFFFFF` als Fläche in der Szene) | `#F7F9FB` |
| Haken einer gefundenen Karte (für nichts anderes mit weißem Haken) | `#3BB273` |
| Signalfarben | Rot `#E4572E`, Gelb `#F6C945`, Grün `#3BB273`, Blau `#1F78C1`, Violett `#8E6FD8`, Orange `#FF7A1A`, Türkis `#19A7B8` |

Rot heißt in jeder Welt Gefahr, Hitze oder Halt; Gelb heißt Warnung oder Licht. Die übrigen Signalfarben bekommen ihre Bedeutung im Stilprofil.

**Stufe 2 – Grundpalette Natur und Mensch, weltübergreifend**

| Stoff | Farbe |
| --- | --- |
| Himmel, Glas | `#9ADCF7`, `#CFEAF5` |
| Wasser | `#4F86C6` |
| Gras, Laub | `#9BD770`, `#3FA34D` |
| Holz, Stamm | `#8B5E3C` |
| Erde oben / unten | `#A8744A` / `#8A5A35` |
| Stein, Fossil | `#B9AA95`, `#E8D9B8` |
| Metall hell / mittel / dunkel | `#A7B1BC` / `#6B7785` / `#3D4852` |
| Hauttöne | `#F1C9A5`, `#D9A377`, `#A86F4A`, `#6F4A32` |
| Fell dunkel / hell | `#55535E` / `#F4F1EA` |

**Abstufungen – für jede Stoff-Farbe aus Stufe 2 und 3**

Jede Stoff-Farbe darf in genau drei Stufen vorkommen: hell, Basis, dunkel. Die Stufen werden berechnet, nie frei gewählt:
HSL-Helligkeit der Basis + 15 bzw. − 15 Prozentpunkte, Farbton und Sättigung unverändert.

| Stoff | hell | Basis | dunkel |
| --- | --- | --- | --- |
| Laub | `#69C576` | `#3FA34D` | `#2A6C33` |
| Holz | `#B8835B` | `#8B5E3C` | `#563A25` |
| Wasser | `#89AED9` | `#4F86C6` | `#316097` |
| Stein | `#D7CFC3` | `#B9AA95` | `#9B8567` |

- Zweck: Arten und Teile unterscheiden (drei Baumarten, Vorder- und Hintergrund, Licht- und Schattenseite), nicht dekorieren.
- Signalfarben und Kontur haben keine Abstufungen.
- Schon vorhandene Paare bleiben, wie sie sind (Gras/Laub, Erde oben/unten, Metall hell/mittel/dunkel).

**Stufe 3 – Weltpalette aus dem Stilprofil**

- Eine Welt ergänzt höchstens 12 eigene Farben und ordnet den Signalfarben Bedeutungen zu.
- Dazu kommen höchstens drei Ortsfarben-Paare (Fläche / Sockelzone oder Fläche / Akzent) für die Hintergründe ihrer Orte. Jeder Ort hat genau ein Paar; alle Szenen am selben Ort verwenden es.
- Neue Objektfarben passen zu den vorhandenen: satt, aber nicht grell – Helligkeit etwa 45–65 %, Sättigung ab 50 % (HSL).
- Hintergrundflächen sind heller oder deutlich blasser als die Objekte davor, damit Hotspots sich abheben.
- Höchstens eine kräftige Signalfarbe pro Objekt; der Rest in Stoff-Farben.
- Gleiche Bedeutung, gleiche Farbe – in allen Szenen einer Welt.

## 5 Szenentypen

Jede Szene ist genau einer dieser drei Typen. Den Typ legt die Szenendatei fest.

| Typ | Wofür | Aufbau |
| --- | --- | --- |
| Ansicht | Raum, Gebäude, Landschaft, Straße | Schnitt von der Seite, keine Perspektive. Standlinie waagerecht im unteren Bilddrittel. Darunter optional ein Untergrund-Band, darüber optional ein Himmel-Band. Fester Maßstab aus dem Stilprofil; Ausnahme Zoom-Ansicht (unten). |
| Objekt | Ein Ding von nahe: Maschine, Tier, Pflanze, Gerät | Hauptobjekt füllt 50–70 % der Bildhöhe, wo sinnvoll aufgeschnitten. Ruhiger Hintergrund aus der Ansicht darüber, vereinfacht und aufgehellt. |
| Schema | Unsichtbares oder Abstraktes: Schaltung, Kreislauf, Kraftfluss, Zellinneres | Heller, einfarbiger Hintergrund. Gleiche Kontur und Farben wie sonst; Normsymbole des Fachs sind erlaubt und gehen vor freier Erfindung. Flussrichtung von links nach rechts oder von oben nach unten. |

Für alle Typen:

- Ebenen im Quelltext von hinten nach vorn: Hintergrund → Hintergrund-Details → Untergrund → Standfläche → Hauptobjekte (erst Gehäuse, dann Verbindungen, dann Innenteile) → Figuren und Vordergrund.
- Größenbezug: Eine Ansicht enthält mindestens einen Menschen, ein Tier oder ein Alltagsding als Maßstab. Objekt- und Schema-Szenen nennen den Maßstab im Bericht.
- Jede Verbindung ist ein eigener Hotspot und über die ganze Länge verfolgbar. Kreuzungen vermeiden, parallel mit 8–10 Abstand.
- Keine tote Fläche: Leere Bereiche über etwa 300 × 300 bekommen ein bis zwei zum Ort passende Details.
- Dichte: Ansicht 20–35 Hotspots, Objekt und Schema 8–20.
- Pro Ansicht mindestens ein Ding außerhalb des Hauptthemas (Tier, Fossil, Fahrzeug, Pflanze) für Sammelobjekte und Easter Eggs.
- Was zoombar ist, ist in der übergeordneten Szene schon erkennbar: gleiche Farben, gleiche Grundform, im Zoom nur mehr Details.
- Zoom-Ansicht: Eine Ansicht, in die aus einer Ansicht gezoomt wird, zeigt genau den Endausschnitt des Zooms in der Elternszene. Zoomfaktor und Ausschnitt ergeben sich aus der Begrenzungsbox des Zoom-Hotspots (die Anwendung füllt damit 80 % von Breite oder Höhe). Der Maßstab ist Elternmaßstab × Zoomfaktor. Lage, Form und Farbe von allem, was in der Elternszene sichtbar ist, bleiben gleich; dazu kommen Details. Konturen bleiben bei Abschnitt 3. Ändert sich die Begrenzungsbox des Zoom-Hotspots, muss die Zoom-Ansicht nachgezogen werden.

## 6 Menschen

- Kopf ist ein Kreis mit Radius r (in einer Ansicht bei Standardmaßstab r = 18).
- Gesicht aus genau drei Zeichen: zwei Punktaugen (Radius r/9, Abstand r/2) und ein Mundbogen (Breite r/3, Strich 1,7).
- Keine Nase, Brauen, Wangen, Wimpern. Kein einzelnes Profil-Auge.
- Blickrichtung: Augen und Mund gemeinsam um r/3 zur Seite versetzt; das Ohr sitzt auf der abgewandten Seite.
- Augen und Mund halten 3 Einheiten Abstand zur Kopfkontur und zu Kopfbedeckung oder Haar.
- Körper aus gerundeten Rechtecken, Arme und Beine als Linien mit Unterlage.
- Unterscheidung über Silhouette: Frisur, Kopfbedeckung, Kleidung, Werkzeug. Hauttöne aus Stufe 2 mischen.
- Kleidung und Ausrüstung passen fachlich zum Ort; Vorgaben dazu im Stilprofil.

## 7 Tiere und Pflanzen

- Tiere: Körper aus Ellipsen und Kreisen. Augen als Punkt oder Kreis mit Pupille; Nase und Maul als ein Zeichen. Fellzeichnung, Federn, Schuppen als wenige Binnenlinien.
- Artmerkmale müssen stimmen (Anzahl der Beine, Flügelform, Ohrform, Schwanz), auch wenn die Form vereinfacht ist.
- Pflanzen: Krone und Büsche aus überlappenden Kreisen, Stämme und Stängel als Linien mit Unterlage, Blätter als einzelne Formen nur dort, wo sie Lerninhalt sind.
- Im Objekt-Zoom zeigen Tiere und Pflanzen ihre echten Bauteile in richtiger Lage; Bezeichnungen kommen über Hotspots, nicht über Text.

## 8 Abgabe-Prüfung

Vor der Abgabe jede Zeile prüfen und im Bericht bestätigen:

- [ ] XML ist gültig; `viewBox` stimmt
- [ ] Keine verbotenen Elemente aus Regel 2
- [ ] Jeder Hotspot hat `id` = `data-hotspot`; alle IDs eindeutig; kein `aria-label` und kein anderer Text in der SVG
- [ ] Jeder Hotspot der Szenendatei existiert in der SVG und umgekehrt
- [ ] Jede Verbindung hat sichtbaren Start und sichtbares Ziel
- [ ] Nur Farben aus Abschnitt 4 und dem Stilprofil; Abstufungen sind berechnet; Hintergrund nutzt das Ortsfarben-Paar des Orts
- [ ] Szenentyp eingehalten; Maßstab stimmt mit dem Stilprofil
- [ ] Gesichter folgen Abschnitt 6
- [ ] Szene als PNG gerendert und angesehen: nichts überlappt falsch, nichts schwebt
- [ ] Bericht nennt: Hotspots mit Vorschlag für Aktion (`card`, `scene`, `info`), `label` und `hint`; fachliche Unsicherheiten; neu eingeführte Farben oder Formen

## 9 Kartenbilder

Kartenbilder, Symbole der Themengebiete und alles andere an der Karte regelt `design-guidelines-karte.md`.

## 10 Vorlage: Stilprofil einer neuen Welt

Datei `stilprofil-<welt>.md`, höchstens eine Seite. Neue Einträge nur hier ergänzen, nie stillschweigend in einer Szene.

```markdown
# Stilprofil <Welt>

## Maßstab und Aufbau der Ansichten
- Maßstab: <Einheiten pro Meter>
- Feste Höhen: <Standlinie, Bänder für Himmel und Untergrund>
- Typische Orte: <…>

## Bedeutung der Signalfarben
| Farbe | Bedeutung in dieser Welt |

## Ortsfarben (höchstens 3 Paare)
| Ort | Fläche | Sockelzone oder Akzent |

## Weltpalette (höchstens 12 Farben)
| Stoff oder Ding | Farbe |

## Verbindungen
| Art | Kernbreite |

## Typische Details für leere Flächen
- <…>

## Menschen und Ausrüstung
- <…>

## Fachliche Leitplanken
- <Normen, Symbole, häufige Fehler>
```

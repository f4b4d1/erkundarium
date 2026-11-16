# Mindmap Fabrik-Welt: erste Szenen

Export des Whiteboards „Erkundarium – Mindmap Fabrik-Welt“, Stand 2026-11-15, nach der Grilling-Session vom 2026-11-16 angepasst.
Planungsstand, keine fertige Inhaltsliste: IDs sind Vorschläge in der Schreibweise der Spec (kebab-case, ohne Umlaute).

Legende der Typen:

- `scene` – Szene, erreichbar über einen Zoom-Hotspot
- `card` – Karte an einem Hotspot der Szene
- `card` (Eintritt) – Eintrittskarte: gehört zur Szene selbst und wird beim ersten Betreten gefunden
- `card` (auch hier) – Karte, die schon in einer anderen Szene hängt und hier einen weiteren Hotspot bekommt
- `item` – Sammelobjekt oder Easter Egg (späteres Feature, im Durchstich nur als `info`-Hotspot)
- `set` – Kartenset mit Belohnungskarte (späteres Feature)

## Szenenbaum

- **fabrikhalle** `scene` – Fabrikhalle (Startszene der Welt `fabrik`, ohne Eintrittskarte)
  - Bereich „Unter dem Boden“ (Untergrund-Band der Halle)
    - `card` kabelkanal – Kabelkanal
    - `card` motorleitung – Motorleitung
    - `card` geberleitung – Geberleitung
    - `card` feldbusleitung – Feldbusleitung
    - `card` wasserleitung – Wasserleitung
    - `item` ammonit – Ammonit
  - Bereich „Halle und Tor“
    - `card` hallenleuchte – Hallenleuchte
    - `card` baum – Baum
    - `item` katze – Katze
    - `item` auto – Auto
  - **sps-schaltschrank** `scene` – SPS-Schaltschrank
    - `card` (Eintritt) sps-schaltschrank – SPS-Schaltschrank
    - `card` sps-cpu – SPS (CPU)
    - `card` ea-module – E/A-Module
    - `card` netzteil-24v – 24-V-Netzteil
    - `card` sicherungsautomat – Sicherungsautomat
    - `card` profinet – PROFINET
    - **servoregler** `scene` – Servoregler (Zoom-Ebene 2)
      - `card` (Eintritt) servoregler – Servoregler
      - `card` gleichrichter – Gleichrichter
      - `card` zwischenkreis – Zwischenkreis
      - `card` wechselrichter-pwm – Wechselrichter, PWM
      - `card` leistungs-mosfet – Leistungs-MOSFET
  - **roboterzelle** `scene` – Roboterzelle
    - `card` (Eintritt) roboterzelle – Roboterzelle
    - `card` industrieroboter – Industrieroboter
    - `card` achsen-1-bis-6 – Achsen 1 bis 6
    - `card` greifer – Greifer
    - `card` not-halt-und-zaun – Not-Halt und Zaun
    - `card` (auch hier) motorleitung – Motorleitung
    - `card` (auch hier) geberleitung – Geberleitung
    - `card` (auch hier) feldbusleitung – Feldbusleitung
    - **robotergelenk** `scene` – Robotergelenk (Zoom-Ebene 2)
      - `card` (Eintritt) robotergelenk – Robotergelenk
      - `card` wellgetriebe – Wellgetriebe
      - `card` encoder – Encoder
      - `card` haltebremse – Haltebremse
      - **servomotor** `scene` – Servomotor (Zoom-Ebene 3)
        - `card` (Eintritt) servomotor – Servomotor
        - `card` stator-und-wicklung – Stator und Wicklung
        - `card` rotor-mit-magneten – Rotor mit Magneten
        - `card` drehfeld – Drehfeld
  - **foerderband** `scene` – Förderband
    - `card` (Eintritt) foerderband – Förderband
    - `card` lichttaster – Lichttaster
    - `card` induktiver-sensor – Induktiver Sensor
    - `card` asynchronmotor – Asynchronmotor
    - `card` frequenzumrichter – Frequenzumrichter

## Kartensets (Belohnungskarten)

- `set` netzwerk – Belohnungskarte: OSI-Modell
- `set` antrieb – Belohnungskarte: Regelkreis

## Zahlen

- 7 Szenen: 1 Startszene, 3 Szenen in der Halle, 2 auf Zoom-Ebene 2, 1 auf Zoom-Ebene 3
- 37 Karten: 31 an Hotspots, 6 Eintrittskarten
- 3 Sammelobjekte, 2 Sets

## Hinweise für die Umsetzung

- Durchstich (Meilenstein M1): `fabrikhalle` → `roboterzelle` → `robotergelenk` mit etwa 10 Karten. Die Karte `motorleitung` hängt dabei in Halle und Roboterzelle.
- Der Servomotor kommt später auch am Förderband vor; die Szene `servomotor` wird dann von zwei Zoom-Hotspots erreicht. Die Eintrittskarte wird trotzdem nur einmal gefunden.
- Fundorte („zu finden in“) ergeben sich aus diesem Baum und werden nicht gepflegt (ADR 0003).
- Beziehungen zwischen den Karten sind noch nicht festgelegt. Starttypen: `steuert`, `misst`, `verwandt`. Kandidaten: Servoregler steuert Servomotor, Encoder misst Servomotor, Frequenzumrichter steuert Asynchronmotor, SPS (CPU) steuert Servoregler, Asynchronmotor verwandt mit Servomotor.
- Die Mitglieder der Sets sind noch nicht festgelegt.
- Wird die Halle zu voll, kann „Unter dem Boden“ später eine eigene Zoom-Szene werden. Die Karten ändern sich dabei nicht.

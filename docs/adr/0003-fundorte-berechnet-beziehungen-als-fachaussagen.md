# Fundorte werden aus den Szenen berechnet, Beziehungen sind nur Fachaussagen

Das Wissensnetz hat zwei getrennte Schichten. Der Fundort einer Karte („zu finden in: Robotergelenk, Förderband“) wird aus den Szenen berechnet und nie gepflegt. Beziehungen werden von Hand an der Karte gesetzt und drücken nur Fachaussagen aus, die keine Szene zeigt („Servoregler steuert Servomotor“). Die Beziehungstypen sind Inhalt: Eine Datei definiert je Typ die Bezeichnung in beide Richtungen je Textfassung und die Eigenschaften „symmetrisch“ und „ohne Kreise“; die Engine kennt keinen Typnamen.

Grund: Der ursprüngliche Plan mit den Typen `enthaelt` und `verwandt` hätte für fast jede Karte von Hand wiederholt, was die Szenen schon wissen, und wäre bei jedem verschobenen Hotspot falsch geworden. Eine aus Szenen abgeleitete Teil-Ganzes-Beziehung wäre dagegen fachlich falsch (die Katze ist kein Teil der Halle). „Zu finden in“ ist als Ortsangabe immer richtig.

## Folgen

- Es gibt zum Start keinen Typ `enthaelt`. Er kann als gewöhnlicher Typ ergänzt werden, wenn ein Teil-Ganzes-Verhältnis in keiner Szene sichtbar ist.
- `verwandt` ist ein Auffangtyp. Wo eine genauere Aussage möglich ist, bekommt sie einen eigenen Typ.
- Eine Karte ohne Hotspot und ohne Szene (etwa eine Belohnungskarte) hat keinen Fundort.
- Eine symmetrische Beziehung steht an genau einer der beiden Karten.

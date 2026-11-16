# Weitergabe und Handy-Port über eine gehostete Website, keine native Verpackung

Das Spiel wird als statische Website gehostet und per Link weitergegeben. Derselbe Link ist der Weg aufs Handy, später installierbar als Web-App mit Offline-Betrieb. Die ursprünglich geplante Verpackung mit Tauri entfällt; eine native Verpackung kommt nur, wenn das Spiel in einen App-Store soll.

Grund: Ein unsigniertes Programm zu verschicken löst Warnungen aus, braucht einen Build je Betriebssystem und muss bei jeder Inhaltsänderung neu verteilt werden. Ein Link läuft überall und aktualisiert sich selbst.

## Folgen

- Keine Funktion hängt allein am Überfahren mit der Maus. Ein Popup beim Überfahren ist erwünscht, aber jeder Hinweis ist auch per Tippen und Tastatur erreichbar.
- Die Szene skaliert mit festem Seitenverhältnis auf jede Bildschirmgröße; die Oberfläche setzt keine feste Fenstergröße voraus.
- Alle Pfade zu Inhalten sind relativ, damit die Seite in einem Unterverzeichnis läuft.
- Der Spielstand liegt im Browser des jeweiligen Geräts. Ein Gerätewechsel braucht Export und Import.
- Die gehostete Seite ist für jeden erreichbar, der den Link kennt.

// Texte der Oberfläche selbst. Inhaltstexte kommen aus den Textfassungen der Inhalte.
// Vorerst nur deutsch und an dieser einen Stelle gesammelt.

export const TEXTE = {
  laedt: 'Lädt …',
  startFehlgeschlagen: 'Das Spiel konnte nicht starten.',
  inhalteNichtGeladen: 'Die Inhalte konnten nicht geladen werden. Bitte lade die Seite neu.',
  keineWelt: 'In den Inhalten ist keine Welt eingetragen.',
  startszeneFehlt: 'Die Startszene der Welt fehlt in den Inhalten.',
  szeneNichtDarstellbar: 'Die Szene konnte nicht dargestellt werden.',
  neuereVersion: 'Dieser Spielstand stammt von einer neueren Version. In dieser Sitzung wird nichts gespeichert.',
  speichernFehlgeschlagen:
    'Der Spielstand konnte nicht gespeichert werden. Was du in dieser Sitzung findest, geht beim Schließen verloren.',
  aktion: {
    karteVerdeckt: 'Karte',
    karteGefunden: 'Karte gefunden',
    zoom: 'Hineinzoomen',
    info: 'Info',
  },
} as const;

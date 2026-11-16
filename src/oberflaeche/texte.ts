// Texte der Oberfläche selbst. Inhaltstexte kommen aus den Textfassungen der Inhalte.
// Vorerst nur deutsch und an dieser einen Stelle gesammelt.

export const TEXTE = {
  laedt: 'Lädt …',
  startFehlgeschlagen: 'Das Spiel konnte nicht starten.',
  inhalteNichtGeladen: 'Die Inhalte konnten nicht geladen werden. Bitte lade die Seite neu.',
  keineWelt: 'In den Inhalten ist keine Welt eingetragen.',
  startszeneFehlt: 'Die Startszene der Welt fehlt in den Inhalten.',
  szeneNichtDarstellbar: 'Die Szene konnte nicht dargestellt werden.',
  szeneNichtGeladen: 'Diese Szene konnte nicht geladen werden. Du bleibst, wo du bist.',
  pfad: 'Pfad',
  neuereVersion: 'Dieser Spielstand stammt von einer neueren Version. In dieser Sitzung wird nichts gespeichert.',
  speichernFehlgeschlagen:
    'Der Spielstand konnte nicht gespeichert werden. Was du in dieser Sitzung findest, geht beim Schließen verloren.',
  aktion: {
    karteVerdeckt: 'Karte',
    karteGefunden: 'Karte gefunden',
    zoom: 'Hineinzoomen',
    info: 'Info',
  },
  karte: {
    laedt: 'Karte wird geladen …',
    neuGefunden: 'Neue Karte gefunden',
    wenden: 'Wenden',
    /** Zugängliche Namen des Knopfs Wenden: beginnen mit seinem sichtbaren Text (WCAG 2.5.3). */
    wendenZurRueckseite: 'Wenden, Rückseite zeigen',
    wendenZurVorderseite: 'Wenden, Vorderseite zeigen',
    schliessen: 'Schließen',
    vorderseite: 'Vorderseite',
    rueckseite: 'Rückseite',
    entwurf: 'Entwurf',
    entwurfErklaerung: 'Entwurf: Dieser Text ist noch nicht gegen die Quellen geprüft.',
    schonGewusst: 'Schon gewusst?',
    quellen: 'Quellen',
    link: 'Mehr dazu',
    neuerTab: '(öffnet in neuem Tab)',
    nichtGeladen: 'Diese Karte konnte nicht geladen werden.',
    trotzdemGefunden: 'Gefunden ist sie trotzdem. Versuche es später noch einmal.',
  },
} as const;

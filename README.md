# Daily Progress Widget – Version 1

Ein minimalistisches Habit-Progress-Widget als Grundlage für die spätere Notion-Integration.

## Funktionen

- großer animierter Fortschrittsbalken
- Prozentanzeige
- Habit-Checkboxen
- automatische Fortschrittsberechnung
- Speicherung im Browser (`localStorage`)
- automatischer Tageswechsel / Daily Reset
- responsive Darstellung für Desktop und Mobile
- geeignet zur Veröffentlichung über GitHub Pages

## Lokal testen

Am einfachsten:

1. ZIP entpacken.
2. `index.html` doppelklicken.
3. Habits abhaken und den Fortschrittsbalken testen.

Alternativ mit einem lokalen Webserver:

```bash
python3 -m http.server 8000
```

Danach im Browser `http://localhost:8000` öffnen.

## Habits ändern

In `app.js` ganz oben:

```js
const DEFAULT_HABITS = [
  "Gym",
  "Lesen",
  "2 L Wasser",
  "10.000 Schritte",
  "Stretching",
  "Tagesplanung"
];
```

Einträge einfach durch die eigenen Habits ersetzen.

## Auf GitHub veröffentlichen

1. Neues Repository anlegen, z. B. `notion-daily-progress`.
2. `index.html`, `styles.css`, `app.js` und `README.md` hochladen.
3. Repository → **Settings** → **Pages**.
4. Unter **Build and deployment**: `Deploy from a branch`.
5. Branch `main`, Ordner `/ (root)`.
6. Speichern.
7. Die veröffentlichte URL kann später in Notion per `/embed` eingebunden werden.

## Nächster Schritt: echte Notion-Daten

Version 1 verwendet absichtlich noch keine Notion-Zugangsdaten.

Für Version 2 bauen wir einen kleinen sicheren Backend-Endpunkt. Der Notion-Integration-Token darf nicht direkt in `app.js` oder einem öffentlichen GitHub-Repository liegen.

Geplante Architektur:

Notion-Datenbank
→ sicherer Backend-Endpunkt
→ Widget
→ Notion Embed

Dann werden die Habit-Namen und Checkbox-Zustände direkt aus Notion gelesen und Änderungen zurückgeschrieben.

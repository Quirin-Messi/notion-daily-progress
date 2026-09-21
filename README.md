# Daily Progress Widget – Version 2

Ein minimalistisches Notion-Widget für den täglichen Habit-Fortschritt.

## V2

Die Oberfläche ist auf die echte Notion-Habit-Datenbank zugeschnitten und unterstützt:

- Bett Machen
- 8k Steps
- Buch lesen
- Spanisch
- Tagebuch

Im Vercel-Betrieb liest das Widget den heutigen Datensatz direkt aus Notion. Checkbox-Änderungen im Widget werden über eine serverseitige API sicher nach Notion zurückgeschrieben.

## Sicherheit

Der Notion-Token gehört **nicht** in dieses öffentliche Repository. Er wird ausschließlich als Vercel Environment Variable gespeichert.

Benötigte Variablen:

- `NOTION_TOKEN`
- `NOTION_DATA_SOURCE_ID`

## Architektur

Notion Days Database
→ Vercel Function (`/api/habits`)
→ Daily Progress Widget
→ Notion Embed

## Fallback

Wenn die Vercel-API noch nicht konfiguriert ist, läuft das Widget weiterhin in einem lokalen Browser-Modus. Dadurch bleibt die GitHub-Pages-Version während der Einrichtung funktionsfähig.

## Deployment

Das Repository kann mit Vercel verbunden werden. Dateien im Ordner `api/` werden als Vercel Functions bereitgestellt; HTML, CSS und JavaScript werden statisch ausgeliefert.

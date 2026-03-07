# Eis-Rezepte App 🍦

Eine einfache Web-App zum Teilen, Suchen und Bewerten (Upvote/Downvote) von Eis-Rezepten.
Geschrieben in **Node.js, Express, SQLite** und mit einem **reinen HTML/CSS/JS Frontend**.

## Features

- **Rezepte hinzufügen:** Titel, Zutaten und Zubereitung eintragen.
- **Bewertungssystem:** Rezepte können positiv (Upvote) und negativ (Downvote) bewertet werden.
- **Sortierung nach Beliebtheit:** Rezepte mit der besten Bewertung stehen oben.
- **Suchen/Filtern:** In den Rezepten live über ein Suchfeld filtern.

## Lokale Installation (ohne Docker)

1. Repository klonen / herunterladen
2. Im Hauptordner `npm install` ausführen
3. Server starten mit `node server.js`
4. Browser öffnen und `http://localhost:3000` aufrufen.

## Server-Deployment (mit Docker)

Damit du die App einfach auf deinem Server laufen lassen kannst, ist Docker vorbereitet:

1. Stelle sicher, dass \`docker\` und \`docker-compose\` installiert sind.
2. Navigiere in diesen Ordner.
3. Führe folgenden Befehl aus:

\`\`\`bash
docker-compose up -d
\`\`\`

Die App ist nun auf \`http://deine-server-ip:3000\` erreichbar. Die Datenbank (\`recipes.db\`) wird sicher im lokalen Ordner \`data/\` abgelegt und bleibt auch nach Neustart des Containers erhalten.

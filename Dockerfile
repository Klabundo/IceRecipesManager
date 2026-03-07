# Basis-Image von Node.js
FROM node:18-alpine

# Arbeitsverzeichnis im Container
WORKDIR /usr/src/app

# package.json und package-lock.json kopieren
COPY package*.json ./

# Abhängigkeiten installieren
RUN npm install

# Quellcode und statische Dateien kopieren
COPY . .

# Port freigeben, auf dem die App läuft
EXPOSE 3000

# Befehl zum Starten der App
CMD ["node", "server.js"]

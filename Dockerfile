# --- Stage 1: Build React Frontend ---
FROM node:18-alpine AS frontend-build

WORKDIR /usr/src/app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Build Node.js Backend ---
FROM node:18-alpine

WORKDIR /usr/src/app

# Backend package.json kopieren und installieren
COPY package*.json ./
RUN npm install

# Backend Code kopieren
COPY server.js database.js ./

# Erstellte Frontend-Dateien aus Stage 1 kopieren
COPY --from=frontend-build /usr/src/app/frontend/dist ./frontend/dist

# Port freigeben, auf dem die App läuft
EXPOSE 3000

# Befehl zum Starten der App
CMD ["node", "server.js"]

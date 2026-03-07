const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Prüfen ob das data Verzeichnis existiert (wichtig für Docker Volumes)
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const dbPath = path.resolve(dataDir, 'recipes.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Fehler beim Öffnen der Datenbank', err.message);
    } else {
        console.log('Mit der SQLite-Datenbank verbunden. Pfad:', dbPath);

        // Tabelle erstellen
        db.run(`CREATE TABLE IF NOT EXISTS recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            ingredients TEXT NOT NULL,
            instructions TEXT NOT NULL,
            upvotes INTEGER DEFAULT 0,
            downvotes INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Fehler beim Erstellen der Tabelle', err.message);
            } else {
                console.log('Tabelle "recipes" ist bereit.');
            }
        });
    }
});

module.exports = db;

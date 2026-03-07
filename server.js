const express = require('express');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Built-in middleware for parsing JSON
app.use(express.static('frontend/dist')); // Ordner für das React-Frontend

// === API Routen ===

// 1. Alle Rezepte abrufen (sortiert nach Beliebtheit: Upvotes - Downvotes)
app.get('/api/recipes', (req, res) => {
    const query = `
        SELECT *, (upvotes - downvotes) as score
        FROM recipes
        ORDER BY score DESC, created_at DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// 2. Neues Rezept hinzufügen
app.post('/api/recipes', (req, res) => {
    const { title, ingredients, instructions } = req.body;
    if (!title || !ingredients || !instructions) {
        res.status(400).json({ error: 'Bitte Titel, Zutaten und Zubereitung angeben.' });
        return;
    }

    const query = `INSERT INTO recipes (title, ingredients, instructions) VALUES (?, ?, ?)`;
    db.run(query, [title, ingredients, instructions], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({
            id: this.lastID,
            title,
            ingredients,
            instructions,
            upvotes: 0,
            downvotes: 0
        });
    });
});

// 3. Rezept upvoten
app.post('/api/recipes/:id/upvote', (req, res) => {
    const recipeId = req.params.id;
    const query = `UPDATE recipes SET upvotes = upvotes + 1 WHERE id = ?`;
    db.run(query, [recipeId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Rezept nicht gefunden.' });
            return;
        }
        res.json({ message: 'Upvote erfolgreich!' });
    });
});

// 4. Rezept downvoten
app.post('/api/recipes/:id/downvote', (req, res) => {
    const recipeId = req.params.id;
    const query = `UPDATE recipes SET downvotes = downvotes + 1 WHERE id = ?`;
    db.run(query, [recipeId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Rezept nicht gefunden.' });
            return;
        }
        res.json({ message: 'Downvote erfolgreich!' });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});

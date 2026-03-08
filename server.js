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

// 5. Kommentare zu einem Rezept abrufen
app.get('/api/recipes/:id/comments', (req, res) => {
    const recipeId = req.params.id;
    const query = `SELECT * FROM comments WHERE recipe_id = ? ORDER BY created_at DESC`;
    db.all(query, [recipeId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// 6. Kommentar zu einem Rezept hinzufügen
app.post('/api/recipes/:id/comments', (req, res) => {
    const recipeId = req.params.id;
    const { text } = req.body;

    if (!text) {
        res.status(400).json({ error: 'Bitte Kommentartext angeben.' });
        return;
    }

    const query = `INSERT INTO comments (recipe_id, text) VALUES (?, ?)`;
    db.run(query, [recipeId, text], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({
            id: this.lastID,
            recipe_id: recipeId,
            text,
            created_at: new Date().toISOString()
        });
    });
});


// --- Settings ---
app.get('/api/settings', (req, res) => {
    db.all('SELECT * FROM settings', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const settings = {};
        rows.forEach(row => { settings[row.key] = row.value; });
        res.json(settings);
    });
});

app.put('/api/settings', (req, res) => {
    const settings = req.body;
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
        for (const [key, value] of Object.entries(settings)) {
            stmt.run([key, value]);
        }
        stmt.finalize();
        db.run('COMMIT', (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: 'Settings updated successfully' });
            }
        });
    });
});


// 7. AI Models Proxy
app.post('/api/ai/models', (req, res) => {
    const providedHostUrl = req.body.hostUrl;

    const fetchModels = async (hostUrl) => {
        if (!hostUrl) {
            res.status(400).json({ error: 'Bitte Host URL angeben.' });
            return;
        }
        try {
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(`${hostUrl.replace(/\/$/, '')}/api/tags`);
            const data = await response.json();

            if (!response.ok) {
                res.status(response.status).json({ error: data.error || 'Fehler beim Abrufen der Modelle.' });
                return;
            }

            const models = data.models ? data.models.map(m => m.name) : [];
            res.json({ models });
        } catch (error) {
            console.error('Fehler beim AI Models Call:', error);
            res.status(500).json({ error: 'Interner Serverfehler beim Abrufen der Modelle.' });
        }
    };

    if (providedHostUrl) {
        fetchModels(providedHostUrl);
    } else {
        db.get('SELECT value FROM settings WHERE key = ?', ['ai_host_url'], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            fetchModels(row ? row.value : null);
        });
    }
});


// 8. AI Chat Proxy
app.post('/api/ai/chat', (req, res) => {
    const { userPrompt } = req.body;

    if (!userPrompt) {
        res.status(400).json({ error: 'Bitte User Prompt angeben.' });
        return;
    }

    db.all('SELECT * FROM settings', [], async (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const settings = {};
        rows.forEach(row => { settings[row.key] = row.value; });

        const hostUrl = settings['ai_host_url'];
        const model = settings['ai_model'];
        const systemPrompt = settings['ai_system_prompt'];

        if (!hostUrl || !model) {
            res.status(400).json({ error: 'Bitte Host URL und Modell in den Einstellungen festlegen.' });
            return;
        }

        try {
            const fetch = (await import('node-fetch')).default;

            const response = await fetch(`${hostUrl.replace(/\/$/, '')}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt || 'Du bist ein hilfreicher Assistent.' },
                        { role: 'user', content: userPrompt }
                    ],
                    stream: false
                })
            });

            const data = await response.json();

            if (!response.ok) {
                res.status(response.status).json({ error: data.error || 'Fehler bei der AI-Anfrage.' });
                return;
            }

            res.json({ result: data.message.content });
        } catch (error) {
            console.error('Fehler beim AI Call:', error);
            res.status(500).json({ error: 'Interner Serverfehler bei der AI-Anfrage.' });
        }
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});

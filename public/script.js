document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recipe-form');
    const container = document.getElementById('recipes-container');
    const searchInput = document.getElementById('search-input');

    let allRecipes = [];

    // Rezepte laden
    async function fetchRecipes() {
        try {
            const response = await fetch('/api/recipes');
            const result = await response.json();
            allRecipes = result.data;
            renderRecipes(allRecipes);
        } catch (error) {
            console.error('Fehler beim Laden der Rezepte:', error);
            container.innerHTML = '<p style="color:red;">Fehler beim Laden der Rezepte.</p>';
        }
    }

    // Rezepte anzeigen
    function renderRecipes(recipes) {
        container.innerHTML = '';
        if (recipes.length === 0) {
            container.innerHTML = '<p>Noch keine Rezepte vorhanden. Füge eins hinzu!</p>';
            return;
        }

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';

            const score = recipe.upvotes - recipe.downvotes;
            const scoreColor = score >= 0 ? 'green' : 'red';

            card.innerHTML = `
                <div class="recipe-header">
                    <h3 class="recipe-title">${escapeHTML(recipe.title)}</h3>
                    <div class="recipe-score" style="color: ${scoreColor}">
                        Score: ${score} (👍 ${recipe.upvotes} | 👎 ${recipe.downvotes})
                    </div>
                </div>
                <div class="recipe-body">
                    <h4>Zutaten:</h4>
                    <p>${escapeHTML(recipe.ingredients)}</p>
                    <h4>Zubereitung:</h4>
                    <p>${escapeHTML(recipe.instructions)}</p>
                </div>
                <div class="recipe-actions">
                    <button class="btn-upvote" onclick="vote(${recipe.id}, 'upvote')">👍 Upvote</button>
                    <button class="btn-downvote" onclick="vote(${recipe.id}, 'downvote')">👎 Downvote</button>
                </div>
                <small style="color: #999; display:block; margin-top: 10px;">Hinzugefügt am: ${new Date(recipe.created_at).toLocaleString()}</small>
            `;
            container.appendChild(card);
        });
    }

    // Hilfsfunktion gegen XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }

    // Rezept speichern
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const ingredients = document.getElementById('ingredients').value;
        const instructions = document.getElementById('instructions').value;

        try {
            const response = await fetch('/api/recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, ingredients, instructions })
            });

            if (response.ok) {
                form.reset();
                fetchRecipes(); // Liste neu laden
                alert('Rezept erfolgreich hinzugefügt!');
            } else {
                const err = await response.json();
                alert('Fehler: ' + err.error);
            }
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
            alert('Netzwerkfehler.');
        }
    });

    // Voting Funktion global machen für onclick
    window.vote = async function(id, type) {
        try {
            const response = await fetch(`/api/recipes/${id}/${type}`, { method: 'POST' });
            if (response.ok) {
                fetchRecipes(); // Aktualisieren
            } else {
                alert('Fehler beim Voten.');
            }
        } catch (error) {
            console.error('Fehler beim Voten:', error);
        }
    };

    // Suchfunktion (Filtert die lokal geladenen Rezepte)
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allRecipes.filter(r =>
            r.title.toLowerCase().includes(term) ||
            r.ingredients.toLowerCase().includes(term)
        );
        renderRecipes(filtered);
    });

    // Initiale Daten laden
    fetchRecipes();
});
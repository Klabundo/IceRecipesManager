import { useState, useEffect } from 'react';
import RecipeForm from './components/RecipeForm';
import RecipeList from './components/RecipeList';
import './index.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Rezepte laden
  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes');
      const result = await response.json();
      setRecipes(result.data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Rezepte:', error);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleVote = async (id, type) => {
    try {
      const response = await fetch(`/api/recipes/${id}/${type}`, { method: 'POST' });
      if (response.ok) {
        fetchRecipes();
      } else {
        alert('Fehler beim Voten.');
      }
    } catch (error) {
      console.error('Fehler beim Voten:', error);
    }
  };

  const filteredRecipes = recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ingredients.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>✨ Eis-Rezepte</h1>
        <p>Die süßeste Sammlung der Welt</p>
      </header>

      <main className="app-main">
        <section className="card form-section">
          <h2 className="section-title">🍦 Neues Rezept kreieren</h2>
          <RecipeForm onRecipeAdded={fetchRecipes} />
        </section>

        <section className="card search-section">
          <h2 className="section-title">🔍 Rezepte finden</h2>
          <input
            type="text"
            className="search-input"
            placeholder="Zutaten, Titel oder Geschmack..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </section>

        <section className="list-section">
          <h2 className="section-title" style={{ paddingLeft: '1rem', marginTop: '1rem' }}>
            🍨 Community Favoriten
          </h2>
          <RecipeList recipes={filteredRecipes} onVote={handleVote} />
        </section>
      </main>
    </div>
  );
}

export default App;

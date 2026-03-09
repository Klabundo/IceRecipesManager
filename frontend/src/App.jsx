import { useState, useEffect } from 'react';
import RecipeForm from './components/RecipeForm';
import RecipeList from './components/RecipeList';
import AiSettings from './components/AiSettings';
import './index.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' or 'newest'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  ).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    // Default is popular (score is already calculated in backend, but we can recalculate or use it if present)
    const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
    const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    // Fallback to newest if scores are equal
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>✨ Eis-Rezepte</h1>
        <p>Die süßeste Sammlung der Welt</p>
      </header>

      <main className="app-main">
        <AiSettings />

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              🍨 Community Favoriten
            </h2>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.5rem 1rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popular">🔥 Beliebteste</option>
              <option value="newest">🆕 Neueste</option>
            </select>
          </div>
          <RecipeList recipes={filteredRecipes} onVote={handleVote} />
        </section>
      </main>
    </div>
  );
}

export default App;

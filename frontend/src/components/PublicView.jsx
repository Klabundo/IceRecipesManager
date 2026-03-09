import { useState, useEffect } from 'react';
import RecipeList from './RecipeList';

function PublicView() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRecipes();
  }, []);

  const handleVote = async (id, type, previousType) => {
    try {
      // If changing vote or removing vote, undo previous vote first
      if (previousType) {
        await fetch(`/api/recipes/${id}/remove_${previousType}`, { method: 'POST' });
      }

      // If casting a new vote
      if (type) {
        const response = await fetch(`/api/recipes/${id}/${type}`, { method: 'POST' });
        if (!response.ok) {
           alert('Fehler beim Voten.');
           return;
        }
      }

      fetchRecipes();
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
    const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
    const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <>
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
        <RecipeList
          recipes={filteredRecipes}
          onVote={handleVote}
          isManager={false}
        />
      </section>
    </>
  );
}

export default PublicView;

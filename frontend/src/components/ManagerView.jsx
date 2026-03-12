import toast from "react-hot-toast";
import { useState, useEffect } from 'react';
import RecipeForm from './RecipeForm';
import RecipeList from './RecipeList';
import AiSettings from './AiSettings';

function ManagerView() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [editingRecipe, setEditingRecipe] = useState(null);

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
           toast.error('Fehler beim Voten.');
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
      <AiSettings />

      <section className="card form-section">
        <h2 className="section-title">🍦 Neues Rezept kreieren</h2>
        <RecipeForm
          onRecipeAdded={() => {
            fetchRecipes();
          }}
        />
      </section>

      {editingRecipe && (
        <div className="modal-overlay" onClick={() => setEditingRecipe(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Rezept bearbeiten</h2>
              <button className="modal-close" onClick={() => setEditingRecipe(null)}>✖</button>
            </div>
            <div className="modal-body">
              <RecipeForm
                onRecipeAdded={() => {
                  fetchRecipes();
                  setEditingRecipe(null);
                }}
                initialData={editingRecipe}
                onCancelEdit={() => setEditingRecipe(null)}
              />
            </div>
          </div>
        </div>
      )}

      <section className="card search-section">
        <h2 className="section-title">🔍 Rezepte finden (Manager)</h2>
        <input
          type="text"
          className="search-input"
          placeholder="Zutaten, Titel oder Geschmack..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </section>

      <section className="list-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', marginBottom: '1.5rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>
            🍨 Manager Rezepte Übersicht
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
          isManager={true}
          onEdit={(recipe) => {
            setEditingRecipe(recipe);
          }}
          onDelete={async (id) => {
            if (window.confirm('Rezept wirklich löschen?')) {
              try {
                const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
                if (res.ok) {
                  fetchRecipes();
                } else {
                  toast.error('Fehler beim Löschen');
                }
              } catch (e) {
                console.error(e);
              }
            }
          }}
        />
      </section>
    </>
  );
}

export default ManagerView;

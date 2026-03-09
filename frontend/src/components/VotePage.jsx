import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function VotePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch('/api/recipes');
        const result = await response.json();
        const found = result.data.find(r => r.id === parseInt(id));
        setRecipe(found);
      } catch (error) {
        console.error('Fehler beim Laden des Rezepts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleVote = async (type) => {
    try {
      const response = await fetch(`/api/recipes/${id}/${type}`, { method: 'POST' });
      if (response.ok) {
        navigate(`/comment/${id}`);
      } else {
        alert('Fehler beim Voten.');
      }
    } catch (error) {
      console.error('Fehler beim Voten:', error);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Lade Rezept...</div>;
  if (!recipe) return <div style={{ textAlign: 'center', padding: '2rem' }}>Rezept nicht gefunden.</div>;

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{recipe.title}</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Wie hat dir dieses Eis geschmeckt?</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleVote('upvote')}
          style={{
            fontSize: '4rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '1rem',
            borderRadius: '50%',
            transition: 'transform 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          😍
        </button>
        <button
          onClick={() => handleVote('downvote')}
          style={{
            fontSize: '4rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '1rem',
            borderRadius: '50%',
            transition: 'transform 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          🤢
        </button>
      </div>
    </div>
  );
}

export default VotePage;
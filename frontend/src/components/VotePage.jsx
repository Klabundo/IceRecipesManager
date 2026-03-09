import toast from "react-hot-toast";
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

  const sessionKey = `voted_${id}`;
  const [currentVote, setCurrentVote] = useState(() => sessionStorage.getItem(sessionKey));

  const handleVote = async (type) => {
    try {
      if (currentVote === type) {
          // Unvote
          await fetch(`/api/recipes/${id}/remove_${type}`, { method: 'POST' });
          sessionStorage.removeItem(sessionKey);
          setCurrentVote(null);
          // Don't navigate, let them vote again
      } else {
          // If they voted something else before, remove it
          if (currentVote) {
             await fetch(`/api/recipes/${id}/remove_${currentVote}`, { method: 'POST' });
          }

          const response = await fetch(`/api/recipes/${id}/${type}`, { method: 'POST' });
          if (response.ok) {
            sessionStorage.setItem(sessionKey, type);
            setCurrentVote(type);
            navigate(`/comment/${id}`);
          } else {
            toast.error('Fehler beim Voten.');
          }
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        <button
          onClick={() => handleVote('upvote')}
          className={`btn ${currentVote === 'upvote' ? 'active' : ''}`}
          style={{
            fontSize: '1.5rem',
            padding: '1.5rem',
            borderRadius: '16px',
            backgroundColor: currentVote === 'upvote' ? 'var(--upvote-color)' : 'var(--bg-color)',
            color: currentVote === 'upvote' ? 'white' : 'var(--text-main)',
            border: currentVote === 'upvote' ? '2px solid var(--upvote-color)' : '2px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <span style={{ fontSize: '2.5rem' }}>😍</span>
          <span>Lecker!</span>
        </button>
        <button
          onClick={() => handleVote('downvote')}
          className={`btn ${currentVote === 'downvote' ? 'active' : ''}`}
          style={{
            fontSize: '1.5rem',
            padding: '1.5rem',
            borderRadius: '16px',
            backgroundColor: currentVote === 'downvote' ? 'var(--downvote-color)' : 'var(--bg-color)',
            color: currentVote === 'downvote' ? 'white' : 'var(--text-main)',
            border: currentVote === 'downvote' ? '2px solid var(--downvote-color)' : '2px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <span style={{ fontSize: '2.5rem' }}>🤢</span>
          <span>Nicht meins</span>
        </button>
      </div>
    </div>
  );
}

export default VotePage;
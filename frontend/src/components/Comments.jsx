import toast from "react-hot-toast";
import { useState, useEffect } from 'react';

function Comments({ recipeId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/comments`);
      const result = await response.json();
      setComments(result.data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Kommentare:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [recipeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/recipes/${recipeId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment })
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      } else {
        const err = await response.json();
        toast.error('Fehler: ' + err.error);
      }
    } catch (error) {
      console.error('Fehler beim Senden des Kommentars:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="comments-section" style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
      <h4>💬 Kommentare</h4>

      {comments.length === 0 ? (
        <p style={{ fontStyle: 'italic', color: '#666' }}>Noch keine Kommentare.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {comments.map((comment) => (
            <li key={comment.id} style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <p style={{ margin: 0 }}>{comment.text}</p>
              <small style={{ color: '#888' }}>
                {new Date(comment.created_at).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}
              </small>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Schreibe einen Kommentar..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ padding: '0.5rem 1rem' }}>
          {isSubmitting ? '...' : 'Senden'}
        </button>
      </form>
    </div>
  );
}

export default Comments;

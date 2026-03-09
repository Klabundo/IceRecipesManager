import toast from "react-hot-toast";
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function CommentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      handleSkip();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/recipes/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment })
      });

      if (response.ok) {
        toast.success('Danke für dein Feedback! 🎉');
        navigate('/');
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

  const handleSkip = () => {
    toast.success('Danke für deine Abstimmung! 🎉');
    navigate('/');
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Möchtest du einen Kommentar hinterlassen?</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Dein Feedback hilft uns, das Eis noch besser zu machen! (Optional)
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <textarea
          className="form-control"
          rows="4"
          placeholder="Schreibe deine Meinung hier..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        ></textarea>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn"
            onClick={handleSkip}
            style={{ backgroundColor: '#ccc', color: '#333' }}
          >
            Überspringen
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? '...' : 'Kommentar abschicken'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CommentPage;
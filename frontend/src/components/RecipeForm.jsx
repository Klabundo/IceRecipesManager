import { useState } from 'react';

function RecipeForm({ onRecipeAdded }) {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, ingredients, instructions })
      });

      if (response.ok) {
        setTitle('');
        setIngredients('');
        setInstructions('');
        onRecipeAdded();
        alert('Rezept erfolgreich hinzugefügt!');
      } else {
        const err = await response.json();
        alert('Fehler: ' + err.error);
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Netzwerkfehler beim Speichern des Rezepts.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="recipe-form">
      <div className="form-group">
        <label htmlFor="title">Eis-Titel</label>
        <input
          type="text"
          id="title"
          className="form-control"
          required
          placeholder="z.B. Stracciatella Wolke 7"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="ingredients">Was kommt rein? (Zutaten)</label>
        <textarea
          id="ingredients"
          className="form-control"
          rows="3"
          required
          placeholder="500ml Vollmilch&#10;100g feinste Schokolade..."
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        ></textarea>
      </div>
      <div className="form-group">
        <label htmlFor="instructions">Wie wird es gemacht? (Zubereitung)</label>
        <textarea
          id="instructions"
          className="form-control"
          rows="4"
          required
          placeholder="1. Milch sanft aufkochen&#10;2. Schokolade unterheben..."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        ></textarea>
      </div>
      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Wird gespeichert...' : 'Rezept teilen ✨'}
      </button>
    </form>
  );
}

export default RecipeForm;

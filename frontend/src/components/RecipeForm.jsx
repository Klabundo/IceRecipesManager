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
        <label htmlFor="title">Titel des Eises:</label>
        <input
          type="text"
          id="title"
          className="form-control"
          required
          placeholder="z.B. Stracciatella Traum"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="ingredients">Zutaten:</label>
        <textarea
          id="ingredients"
          className="form-control"
          rows="4"
          required
          placeholder="500ml Milch, 100g Schokolade..."
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        ></textarea>
      </div>
      <div className="form-group">
        <label htmlFor="instructions">Zubereitung:</label>
        <textarea
          id="instructions"
          className="form-control"
          rows="4"
          required
          placeholder="Milch aufkochen, Schokolade reiben..."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        ></textarea>
      </div>
      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Speichern...' : 'Rezept speichern'}
      </button>
    </form>
  );
}

export default RecipeForm;

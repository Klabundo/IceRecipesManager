import { useState } from 'react';

function RecipeForm({ onRecipeAdded }) {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateRecipe = async () => {
    if (!title) {
      alert('Bitte gib zumindest einen Titel oder eine Rezeptidee im Feld "Eis-Titel" ein, damit die KI weiß, was sie generieren soll.');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: `Generiere ein Eisrezept für die Idee "${title}". Antworte IMMER nur in folgendem JSON-Format: {"title": "Der Name des Eises", "ingredients": "Liste der Zutaten mit Mengen", "instructions": "Schritt-für-Schritt Anleitung"}`
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Fehler bei der AI Generierung');
      }

      const result = await response.json();

      try {
        // Versuch, das JSON aus der Antwort zu parsen
        const content = result.result;
        // Entferne eventuelle Markdown Code-Blöcke (z.B. ```json ... ```)
        const jsonStr = content.replace(/```json\n?|\n?```/gi, '').trim();
        const recipeData = JSON.parse(jsonStr);

        if (recipeData.title) setTitle(recipeData.title);
        if (recipeData.ingredients) setIngredients(recipeData.ingredients);
        if (recipeData.instructions) setInstructions(recipeData.instructions);
      } catch {
        console.error('Konnte AI Antwort nicht als JSON parsen:', result.result);
        alert('Die KI hat kein gültiges JSON zurückgegeben. Bitte versuche es noch einmal.');
      }

    } catch (error) {
      console.error('Fehler bei der Generierung:', error);
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

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
      <div className="form-group" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
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
        <button
          type="button"
          className="btn"
          onClick={handleGenerateRecipe}
          disabled={isGenerating || isSubmitting}
          style={{ backgroundColor: '#ff9800', color: 'white', padding: '0.5rem 1rem' }}
        >
          {isGenerating ? 'Generiere...' : '✨ KI Generieren'}
        </button>
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

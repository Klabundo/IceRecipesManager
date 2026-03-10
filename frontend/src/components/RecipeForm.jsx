import toast from "react-hot-toast";
import { useState, useEffect } from 'react';

function RecipeForm({ onRecipeAdded, initialData, onCancelEdit }) {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
  const [instructions, setInstructions] = useState([{ step: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [isAiEditing, setIsAiEditing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');

      try {
        const parsedIng = JSON.parse(initialData.ingredients);
        if (Array.isArray(parsedIng)) {
          setIngredients(parsedIng.length > 0 ? parsedIng : [{ name: '', amount: '' }]);
        } else {
          throw new Error('Not an array');
        }
      } catch {
        const lines = (initialData.ingredients || '').split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length > 0) {
          setIngredients(lines.map(line => ({ name: line, amount: '' })));
        } else {
          setIngredients([{ name: '', amount: '' }]);
        }
      }

      try {
        const parsedInst = JSON.parse(initialData.instructions);
        if (Array.isArray(parsedInst)) {
          setInstructions(parsedInst.length > 0 ? parsedInst : [{ step: '' }]);
        } else {
          throw new Error('Not an array');
        }
      } catch {
        const lines = (initialData.instructions || '').split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length > 0) {
          setInstructions(lines.map(line => ({ step: line })));
        } else {
          setInstructions([{ step: '' }]);
        }
      }
    } else {
      setTitle('');
      setIngredients([{ name: '', amount: '' }]);
      setInstructions([{ step: '' }]);
    }
  }, [initialData]);

  const handleGenerateRecipe = async () => {
    if (!title) {
      toast.error('Bitte gib zumindest einen Titel oder eine Rezeptidee im Feld "Eis-Titel" ein, damit die KI weiß, was sie generieren soll.');
      return;
    }

    setIsGenerating(true);

    try {
      let existingRecipesContext = "";
      try {
        const res = await fetch('/api/recipes');
        if (res.ok) {
          const data = await res.json();
          if (data.data && data.data.length > 0) {
            // Take top 5 best rated recipes to learn from
            const bestRecipes = data.data
              .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
              .slice(0, 5);

            existingRecipesContext = `Nutze das Wissen aus den am besten bewerteten Rezepten der Community, um ein noch besseres Rezept zu kreieren:\n` +
              bestRecipes.map(r => `- "${r.title}" (Score: ${r.upvotes - r.downvotes})`).join('\n') + `\n\n`;
          }
        }
      } catch (err) {
        console.error("Konnte keine Rezepte als Kontext laden:", err);
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: `${existingRecipesContext}Generiere ein Eisrezept für die Idee "${title}". Achte darauf, dass die genauen Mengen der Zutaten (z.B. Gramm, ml) auch im Text der Zubereitungsschritte (instructions) genannt werden. Antworte IMMER nur in folgendem JSON-Format: {"title": "Der Name des Eises", "ingredients": [{"name": "Zutat 1", "amount": "Menge 1"}, {"name": "Zutat 2", "amount": "Menge 2"}], "instructions": [{"step": "Schritt 1 (mit Mengenangabe)"}, {"step": "Schritt 2 (mit Mengenangabe)"}]}`
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
        toast.error('Die KI hat kein gültiges JSON zurückgegeben. Bitte versuche es noch einmal.');
      }

    } catch (error) {
      console.error('Fehler bei der Generierung:', error);
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiEdit = async () => {
    if (!aiEditPrompt) {
      toast.error('Bitte gib an, was die KI am Rezept ändern soll.');
      return;
    }

    setIsAiEditing(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: `Das aktuelle Rezept lautet:
Titel: ${title}
Zutaten: ${JSON.stringify(ingredients)}
Zubereitung: ${JSON.stringify(instructions)}

Der Nutzer möchte folgendes ändern: "${aiEditPrompt}".
Bitte gib das aktualisierte Rezept zurück. Achte weiterhin darauf, dass die genauen Mengen der Zutaten (z.B. Gramm, ml) auch im Text der Zubereitungsschritte (instructions) genannt werden.
Antworte IMMER nur in folgendem JSON-Format: {"title": "Der Name des Eises", "ingredients": [{"name": "Zutat 1", "amount": "Menge 1"}, {"name": "Zutat 2", "amount": "Menge 2"}], "instructions": [{"step": "Schritt 1 (mit Mengenangabe)"}, {"step": "Schritt 2 (mit Mengenangabe)"}]}`
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Fehler bei der AI Bearbeitung');
      }

      const result = await response.json();

      try {
        const content = result.result;
        const jsonStr = content.replace(/```json\n?|\n?```/gi, '').trim();
        const recipeData = JSON.parse(jsonStr);

        if (recipeData.title) setTitle(recipeData.title);
        if (recipeData.ingredients) setIngredients(recipeData.ingredients);
        if (recipeData.instructions) setInstructions(recipeData.instructions);
        setAiEditPrompt('');
        toast.success('Rezept erfolgreich von der KI aktualisiert!');
      } catch {
        console.error('Konnte AI Antwort nicht als JSON parsen:', result.result);
        toast.error('Die KI hat kein gültiges JSON zurückgegeben. Bitte versuche es noch einmal.');
      }

    } catch (error) {
      console.error('Fehler bei der Bearbeitung:', error);
      toast.error(error.message);
    } finally {
      setIsAiEditing(false);
    }
  };

  const hasContent = title.trim() !== '' || ingredients.some(i => i.name.trim() !== '') || instructions.some(i => i.step.trim() !== '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = initialData ? `/api/recipes/${initialData.id}` : '/api/recipes';
      const method = initialData ? 'PUT' : 'POST';

      const filteredIngredients = ingredients.filter(ing => ing.name.trim() !== '');
      const filteredInstructions = instructions.filter(inst => inst.step.trim() !== '');

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          ingredients: JSON.stringify(filteredIngredients),
          instructions: JSON.stringify(filteredInstructions)
        })
      });

      if (response.ok) {
        toast.success(initialData ? 'Rezept erfolgreich aktualisiert! 🎉' : 'Rezept erfolgreich hinzugefügt! 🎉');
        setTitle('');
        setIngredients([{ name: '', amount: '' }]);
        setInstructions([{ step: '' }]);
        onRecipeAdded();
      } else {
        const err = await response.json();
        toast.error('Fehler: ' + err.error);
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast.error('Netzwerkfehler beim Speichern des Rezepts.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="recipe-form">
      {initialData && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Bearbeite Rezept: {initialData.title}</strong>
          <button type="button" onClick={onCancelEdit} style={{ background: 'transparent', border: 'none', color: '#1976d2', cursor: 'pointer', fontWeight: 'bold' }}>Abbrechen ✕</button>
        </div>
      )}
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
        <label>Was kommt rein? (Zutaten)</label>
        {ingredients.map((ing, index) => (
          <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Menge (z.B. 500ml)"
              value={ing.amount}
              onChange={(e) => {
                const newIng = [...ingredients];
                newIng[index].amount = e.target.value;
                setIngredients(newIng);
              }}
              style={{ flex: 1 }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Zutat (z.B. Vollmilch)"
              required={index === 0}
              value={ing.name}
              onChange={(e) => {
                const newIng = [...ingredients];
                newIng[index].name = e.target.value;
                setIngredients(newIng);
              }}
              style={{ flex: 2 }}
            />
            {ingredients.length > 1 && (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  const newIng = [...ingredients];
                  newIng.splice(index, 1);
                  setIngredients(newIng);
                }}
                style={{ padding: '0.5rem', backgroundColor: '#f44336', color: 'white' }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="btn"
          onClick={() => setIngredients([...ingredients, { name: '', amount: '' }])}
          style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem', backgroundColor: '#e0e0e0' }}
        >
          + Zutat hinzufügen
        </button>
      </div>
      <div className="form-group">
        <label>Wie wird es gemacht? (Zubereitung)</label>
        {instructions.map((inst, index) => (
          <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
            <span style={{ padding: '1rem 0', fontWeight: 'bold', width: '20px' }}>{index + 1}.</span>
            <textarea
              className="form-control"
              rows="2"
              required={index === 0}
              placeholder="Schritt beschreiben..."
              value={inst.step}
              onChange={(e) => {
                const newInst = [...instructions];
                newInst[index].step = e.target.value;
                setInstructions(newInst);
              }}
              style={{ flex: 1, minHeight: '60px' }}
            ></textarea>
            {instructions.length > 1 && (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  const newInst = [...instructions];
                  newInst.splice(index, 1);
                  setInstructions(newInst);
                }}
                style={{ padding: '0.5rem', backgroundColor: '#f44336', color: 'white', marginTop: '0.5rem' }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="btn"
          onClick={() => setInstructions([...instructions, { step: '' }])}
          style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem', backgroundColor: '#e0e0e0' }}
        >
          + Schritt hinzufügen
        </button>
      </div>
      {hasContent && (
        <div className="form-group" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="aiEdit">KI Rezept-Chat (Änderungswünsche)</label>
            <input
              type="text"
              id="aiEdit"
              className="form-control"
              placeholder='z.B. "Mache das Karamell selber" oder "Ersetze Zucker durch Honig"'
              value={aiEditPrompt}
              onChange={(e) => setAiEditPrompt(e.target.value)}
              style={{ backgroundColor: 'var(--card-bg)' }}
            />
          </div>
          <button
            type="button"
            className="btn"
            onClick={handleAiEdit}
            disabled={isAiEditing || isSubmitting || isGenerating}
            style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '0.5rem 1.5rem' }}
          >
            {isAiEditing ? 'Wende an...' : '💬 KI Anwenden'}
          </button>
        </div>
      )}
      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Wird gespeichert...' : (initialData ? 'Änderungen speichern ✨' : 'Rezept teilen ✨')}
      </button>
    </form>
  );
}

export default RecipeForm;

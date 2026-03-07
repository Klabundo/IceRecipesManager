import { useState } from 'react';
import Comments from './Comments';

function RecipeCard({ recipe, onVote }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [improvementSuggestion, setImprovementSuggestion] = useState(null);

  const score = recipe.upvotes - recipe.downvotes;
  const scoreClass =
    score > 0 ? 'score-positive' : score < 0 ? 'score-negative' : 'score-neutral';

  const handleVoteClick = (type) => {
    const sessionKey = `voted_${recipe.id}`;
    if (sessionStorage.getItem(sessionKey)) {
      alert('Du hast für dieses Rezept bereits abgestimmt!');
      return;
    }
    onVote(recipe.id, type);
    sessionStorage.setItem(sessionKey, 'true');
  };

  return (
    <>
      <div className="recipe-item">
        <div
          className="recipe-header"
          style={{ cursor: 'pointer' }}
          onClick={() => setIsExpanded(true)}
        >
          <h3 className="recipe-title">{recipe.title}</h3>
          <div className={`recipe-score ${scoreClass}`}>
            {score > 0 ? '🔥' : score < 0 ? '🧊' : '⭐'} {score}
          </div>
        </div>

        <div className="recipe-actions">
          <button
            className="btn btn-vote btn-up"
            onClick={() => handleVoteClick('upvote')}
            title="Lecker!"
          >
            😍 {recipe.upvotes}
          </button>
          <button
            className="btn btn-vote btn-down"
            onClick={() => handleVoteClick('downvote')}
            title="Schmeckt mir nicht"
          >
            🤢 {recipe.downvotes}
          </button>
        </div>

        <div className="recipe-meta">
          Teilte das Rezept am: {new Date(recipe.created_at).toLocaleString('de-DE', { dateStyle: 'long', timeStyle: 'short' })}
        </div>
      </div>

      {isExpanded && (
        <div className="modal-overlay" onClick={() => setIsExpanded(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.5rem' }}>{recipe.title}</h2>
              <button className="modal-close" onClick={() => setIsExpanded(false)}>✖</button>
            </div>
            <div className="modal-body recipe-body">
              <h4>🛒 Einkaufszettel</h4>
              <p>{recipe.ingredients}</p>

              <h4>👩‍🍳 So wird's gemacht</h4>
              <p>{recipe.instructions}</p>

              <button
                className="btn"
                onClick={async () => {
                  const hostUrl = localStorage.getItem('ai_host_url') || 'http://localhost:11434';
                  const model = localStorage.getItem('ai_model') || 'llama3';

                  if (!hostUrl) {
                    alert('Bitte konfiguriere zuerst deine Ollama Host URL in den AI Einstellungen.');
                    return;
                  }

                  setIsImproving(true);
                  setImprovementSuggestion(null);

                  try {
                    // Kommentare laden, um sie der KI zu geben
                    const commentsResponse = await fetch(`/api/recipes/${recipe.id}/comments`);
                    const commentsData = await commentsResponse.json();
                    const commentsList = commentsData.data.map((c) => c.text).join('\n');

                    const response = await fetch('/api/ai/chat', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        hostUrl,
                        model,
                        systemPrompt:
                          'Du bist ein Experte für Eisrezepte. Deine Aufgabe ist es, anhand eines Rezepts und der dazugehörigen Nutzerkommentare eine kurze, konkrete Verbesserung oder Abwandlung vorzuschlagen.',
                        userPrompt: `Rezept Titel: ${recipe.title}\nZutaten: ${recipe.ingredients}\nZubereitung: ${recipe.instructions}\n\nNutzerkommentare:\n${
                          commentsList || 'Keine Kommentare vorhanden.'
                        }\n\nSchlage eine Verbesserung vor:`,
                      }),
                    });

                    if (!response.ok) throw new Error('Fehler bei der KI-Anfrage');
                    const result = await response.json();
                    setImprovementSuggestion(result.result);
                  } catch (error) {
                    console.error('Fehler bei AI Verbesserung:', error);
                    alert('Konnte keinen Verbesserungsvorschlag generieren.');
                  } finally {
                    setIsImproving(false);
                  }
                }}
                disabled={isImproving}
                style={{ backgroundColor: '#2196F3', color: 'white', marginTop: '1rem', width: '100%' }}
              >
                {isImproving ? 'Analysiere...' : '💡 KI Verbesserungsvorschlag'}
              </button>

              {improvementSuggestion && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '4px',
                  }}
                >
                  <h5>💡 KI Vorschlag:</h5>
                  <p>{improvementSuggestion}</p>
                </div>
              )}

              <Comments recipeId={recipe.id} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RecipeCard;
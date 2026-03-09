import toast from "react-hot-toast";
import { useState } from 'react';
import Comments from './Comments';
import { QRCodeSVG } from 'qrcode.react';

function RecipeCard({ recipe, onVote, isManager, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('overview');
  const [currentStep, setCurrentStep] = useState(0);
  const [isImproving, setIsImproving] = useState(false);
  const [improvementSuggestion, setImprovementSuggestion] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const sessionKey = `voted_${recipe.id}`;
  const [currentVote, setCurrentVote] = useState(() => sessionStorage.getItem(sessionKey));

  const score = recipe.upvotes - recipe.downvotes;
  const scoreClass =
    score > 0 ? 'score-positive' : score < 0 ? 'score-negative' : 'score-neutral';

  const handleVoteClick = (type) => {
    if (currentVote === type) {
      // Toggle off vote
      onVote(recipe.id, null, currentVote);
      sessionStorage.removeItem(sessionKey);
      setCurrentVote(null);
    } else {
      // New vote or change vote
      onVote(recipe.id, type, currentVote);
      sessionStorage.setItem(sessionKey, type);
      setCurrentVote(type);
    }
  };

  const handleCopyRecipe = async () => {
    const textToCopy = `🍨 ${recipe.title} 🍨\n\n🛒 Einkaufszettel:\n${recipe.ingredients}\n\n👩‍🍳 So wird's gemacht:\n${recipe.instructions}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Rezept in die Zwischenablage kopiert! 📋');
    } catch (err) {
      console.error('Fehler beim Kopieren: ', err);
      toast.error('Kopieren fehlgeschlagen.');
    }
  };

  const instructionSteps = (recipe.instructions || '')
    .split('\n')
    .map((step) => step.trim())
    .filter((step) => step.length > 0);

  const closeExpanded = () => {
    setIsExpanded(false);
    setViewMode('overview');
    setCurrentStep(0);
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
            className={`btn btn-vote btn-up ${currentVote === 'upvote' ? 'active-vote' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleVoteClick('upvote'); }}
            title="Lecker!"
            style={currentVote === 'upvote' ? { backgroundColor: 'var(--upvote-color)', color: 'white' } : {}}
          >
            😍 {recipe.upvotes}
          </button>
          <button
            className={`btn btn-vote btn-down ${currentVote === 'downvote' ? 'active-vote' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleVoteClick('downvote'); }}
            title="Schmeckt mir nicht"
            style={currentVote === 'downvote' ? { backgroundColor: 'var(--downvote-color)', color: 'white' } : {}}
          >
            🤢 {recipe.downvotes}
          </button>
        </div>

        <div className="recipe-meta">
          Teilte das Rezept am: {new Date(recipe.created_at).toLocaleString('de-DE', { dateStyle: 'long', timeStyle: 'short' })}
        </div>
      </div>

      {showQR && isManager && (
        <div className="modal-overlay" onClick={() => setShowQR(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div className="modal-header">
              <h2>QR Code für Voting</h2>
              <button className="modal-close" onClick={() => setShowQR(false)}>✖</button>
            </div>
            <div className="modal-body">
              <p>Diesen Code können die Esser scannen, um abzustimmen!</p>
              <div style={{ margin: '2rem 0', display: 'flex', justifyContent: 'center' }}>
                <QRCodeSVG value={`${window.location.origin}/vote/${recipe.id}`} size={256} />
              </div>
            </div>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="modal-overlay" onClick={closeExpanded}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.5rem', marginRight: '1rem' }}>{recipe.title}</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn"
                  onClick={handleCopyRecipe}
                  style={{ padding: '0.5rem', fontSize: '1rem', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}
                  title="Rezept kopieren"
                >
                  📋
                </button>
                <button className="modal-close" onClick={closeExpanded}>✖</button>
              </div>
            </div>
            <div className="modal-body recipe-body">
              {viewMode === 'overview' ? (
                <>
                  <h4>🛒 Einkaufszettel</h4>
                  <p>{recipe.ingredients}</p>

                  {instructionSteps.length > 0 && (
                    <button
                      className="btn btn-primary"
                      onClick={() => setViewMode('cooking')}
                      style={{ marginTop: '1.5rem', width: '100%' }}
                    >
                      👩‍🍳 Zubereitung starten
                    </button>
                  )}

                  {isManager && (
                    <div className="recipe-manager-actions" style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                      <button className="btn" onClick={(e) => { e.stopPropagation(); closeExpanded(); onEdit(recipe); }} style={{ flex: 1, backgroundColor: '#4CAF50', color: 'white' }}>✏️ Bearbeiten</button>
                      <button className="btn" onClick={(e) => { e.stopPropagation(); closeExpanded(); onDelete(recipe.id); }} style={{ flex: 1, backgroundColor: '#f44336', color: 'white' }}>🗑️ Löschen</button>
                      <button className="btn" onClick={(e) => { e.stopPropagation(); closeExpanded(); setShowQR(true); }} style={{ flex: 1, backgroundColor: '#2196F3', color: 'white' }}>📷 QR Code</button>
                    </div>
                  )}

                  <button
                    className="btn"
                    onClick={async () => {
                      const hostUrl = localStorage.getItem('ai_host_url') || 'http://localhost:11434';
                      const model = localStorage.getItem('ai_model') || 'llama3';

                      if (!hostUrl) {
                        toast.error('Bitte konfiguriere zuerst deine Ollama Host URL in den AI Einstellungen.');
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
                        toast.error('Konnte keinen Verbesserungsvorschlag generieren.');
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
                </>
              ) : (
                <>
                  <h4 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>
                    👩‍🍳 Schritt {currentStep + 1} von {instructionSteps.length}
                  </h4>

                  <div style={{
                    fontSize: '1.2rem',
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-color)',
                    borderRadius: 'var(--radius-md)',
                    minHeight: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: '1.6'
                  }}>
                    {instructionSteps[currentStep]}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                    <button
                      className="btn"
                      onClick={() => {
                        if (currentStep > 0) {
                          setCurrentStep(currentStep - 1);
                        } else {
                          setViewMode('overview');
                        }
                      }}
                      style={{ flex: 1, backgroundColor: 'var(--border-light)', color: 'var(--text-main)' }}
                    >
                      {currentStep > 0 ? '⬅️ Zurück' : '⬅️ Übersicht'}
                    </button>

                    {currentStep < instructionSteps.length - 1 ? (
                      <button
                        className="btn btn-primary"
                        onClick={() => setCurrentStep(currentStep + 1)}
                        style={{ flex: 1 }}
                      >
                        Weiter ➡️
                      </button>
                    ) : (
                      <button
                        className="btn"
                        onClick={() => {
                          setViewMode('overview');
                          setCurrentStep(0);
                          toast.success('Guten Appetit! 🍦');
                        }}
                        style={{ flex: 1, backgroundColor: 'var(--upvote-color)', color: 'white' }}
                      >
                        Fertig! 🎉
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RecipeCard;
function RecipeCard({ recipe, onVote }) {
  const score = recipe.upvotes - recipe.downvotes;
  const scoreClass =
    score > 0 ? 'score-positive' : score < 0 ? 'score-negative' : 'score-neutral';

  return (
    <div className="recipe-item">
      <div className="recipe-header">
        <h3 className="recipe-title">{recipe.title}</h3>
        <div className={`recipe-score ${scoreClass}`}>
          {score > 0 ? '🔥' : score < 0 ? '🧊' : '⭐'} {score}
        </div>
      </div>

      <div className="recipe-body">
        <h4>🛒 Einkaufszettel</h4>
        <p>{recipe.ingredients}</p>

        <h4>👩‍🍳 So wird's gemacht</h4>
        <p>{recipe.instructions}</p>
      </div>

      <div className="recipe-actions">
        <button
          className="btn btn-vote btn-up"
          onClick={() => onVote(recipe.id, 'upvote')}
          title="Lecker!"
        >
          😍 {recipe.upvotes}
        </button>
        <button
          className="btn btn-vote btn-down"
          onClick={() => onVote(recipe.id, 'downvote')}
          title="Schmeckt mir nicht"
        >
          🤢 {recipe.downvotes}
        </button>
      </div>

      <div className="recipe-meta">
        Teilte das Rezept am: {new Date(recipe.created_at).toLocaleString('de-DE', { dateStyle: 'long', timeStyle: 'short' })}
      </div>
    </div>
  );
}

export default RecipeCard;
import RecipeCard from './RecipeCard';

function RecipeList({ recipes, onVote }) {
  if (recipes.length === 0) {
    return (
      <div className="no-recipes">
        <p>Noch keine Rezepte vorhanden oder Suche ergab keine Treffer.</p>
      </div>
    );
  }

  return (
    <div className="recipes-grid">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onVote={onVote} />
      ))}
    </div>
  );
}

export default RecipeList;

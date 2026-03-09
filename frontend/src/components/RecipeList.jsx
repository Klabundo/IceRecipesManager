import RecipeCard from './RecipeCard';

function RecipeList({ recipes, onVote, isManager, onEdit, onDelete }) {
  if (recipes.length === 0) {
    return (
      <div className="no-recipes">
        <p>Noch keine passenden Eis-Rezepte gefunden.</p>
      </div>
    );
  }

  return (
    <div className="recipes-grid">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onVote={onVote}
          isManager={isManager}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default RecipeList;

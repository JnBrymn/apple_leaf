// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attachRecipeBook(g: GameRuntime) {
  g.showRecipeList = function() {
        g.recipeBook.classList.remove("show-detail");
      }
  
  g.showRecipeDetail = function(recipe) {
        g.recipeDetailTitle.textContent = recipe.name;
        g.recipeDetailSteps.textContent = recipe.steps;
        g.recipeBook.classList.add("show-detail");
      }
  
}

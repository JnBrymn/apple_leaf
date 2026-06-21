// @ts-nocheck
import { buildDerivedConstants } from '../derivedConstants'

const { RECIPE_STEP_COUNTS } = buildDerivedConstants()

export function cashierCatalogItemStepCount(item) {
  if (item.kind === "drink") {
    if (item.drink.startsWith("juice-")) {
      return RECIPE_STEP_COUNTS[item.drink] ?? 2;
    }
    return 1;
  }
  if (item.kind === "soup") {
    const recipeId = {
      carrot: "carrot-soup",
      cucumber: "cucumber-soup",
      potato: "potato-soup",
      tomato: "tomato-soup",
      "meat-potato": "meat-potato-stew",
      "meat-stew": "meat-stew",
    }[item.recipe];
    return RECIPE_STEP_COUNTS[recipeId] ?? 5;
  }
  if (item.kind === "food") {
    if (item.crop === "steak-sandwich") {
      return RECIPE_STEP_COUNTS["steak-sandwich"];
    }
    if (item.crop === "french-fries") {
      return RECIPE_STEP_COUNTS["french-fries"];
    }
    if (item.crop === "bread") return RECIPE_STEP_COUNTS.bread;
    if (item.crop === "meat") {
      if (item.salted && item.peppered) {
        return RECIPE_STEP_COUNTS["seasoned-steak"];
      }
      if (item.wasCut) return RECIPE_STEP_COUNTS["chopped-cooked-meat"];
      return RECIPE_STEP_COUNTS["cooked-meat"];
    }
    if (item.state === "baked" && item.wasCut) {
      return RECIPE_STEP_COUNTS["baked-pineapple"];
    }
    const recipeId =
      (item.state === "cut" ? "cut-" : "baked-") + item.crop;
    return RECIPE_STEP_COUNTS[recipeId] ?? 2;
  }
  return 2;
}

export function cashierCatalogItemWeight(item) {
  return 1 / cashierCatalogItemStepCount(item);
}

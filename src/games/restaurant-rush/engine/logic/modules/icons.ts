// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attachIcons(g: GameRuntime) {
  g.miniCupHtml = function(drinkId) {
        return (
          '<span class="mini-cup cup-' +
          drinkId +
          '" aria-hidden="true"><span class="mini-cup-liquid"></span></span>'
        );
      }
  
  g.clearBowlFillClasses = function() {
        g.bowl.classList.remove("bowl-flour", "bowl-dough", "bowl-batter");
        [...bowl.classList].forEach((cls) => {
          if (cls.startsWith("bowl-mix-")) g.bowl.classList.remove(cls);
        });
      }
  
  g.syncBowlVisual = function() {
        g.clearBowlFillClasses();
        if (!g.bowlContents) return;
        if (g.isBowlFlour(g.bowlContents)) g.bowl.classList.add("bowl-flour");
        else if (g.isBowlDough(g.bowlContents)) g.bowl.classList.add("bowl-dough");
        else if (g.isBowlBatter(g.bowlContents)) g.bowl.classList.add("bowl-batter");
        else if (g.isBowlMix(g.bowlContents)) g.bowl.classList.add("bowl-mix-" + g.bowlContents.mix);
      }
  
  g.COUNTER_RECIPES = [
        {
          on: "bowl",
          onMatch: g.isBowlFlour,
          with: "cup",
          withMatch: (p) => g.cupHasDrink(p, "water"),
          result: g.makeBowlDough,
          dirtyWith: true,
        },
        {
          on: "bowl",
          onMatch: g.isBowlFlour,
          with: "cup",
          withMatch: (p) => g.cupHasDrink(p, "milk"),
          result: g.makeBowlBatter,
          dirtyWith: true,
        },
        {
          on: "bowl",
          onMatch: g.isBowlDough,
          with: "plate",
          withMatch: (p) => g.isPlateCut(p) && p.crop === "apples",
          result: () => g.makeBowlMix("apples"),
          dirtyWith: true,
        },
        {
          on: "bowl",
          onMatch: g.isBowlDough,
          with: "plate",
          withMatch: (p) => g.isPlateCut(p) && p.crop === "pineapple",
          result: () => g.makeBowlMix("pineapple"),
          dirtyWith: true,
        },
        {
          on: "pot",
          onMatch: (p) => g.isPotSoup(p) && !p.stew && p.soup === "carrots",
          with: "plate",
          withMatch: (p) => g.isPlateCut(p) && p.crop === "carrots",
          result: () => g.makePotStew("carrots"),
          dirtyWith: true,
        },
        {
          on: "pot",
          onMatch: (p) => g.isPotSoup(p) && !p.stew && p.soup === "cucumbers",
          with: "plate",
          withMatch: (p) => g.isPlateCut(p) && p.crop === "cucumbers",
          result: () => g.makePotStew("cucumbers"),
          dirtyWith: true,
        },
        {
          on: "pot",
          onMatch: (p) => g.isPotSoup(p) && !p.stew && p.soup === "potatoes",
          with: "plate",
          withMatch: (p) => g.isPlateCut(p) && p.crop === "carrots",
          result: () => g.makePotSoupMix("potatoes", "carrots"),
          dirtyWith: true,
        },
        {
          on: "pot",
          onMatch: (p) => g.isPotSoup(p) && !p.stew && p.soup === "tomatoes",
          with: "plate",
          withMatch: (p) => g.isPlateCut(p) && p.crop === "tomatoes",
          result: () => g.makePotSoupMix("tomatoes", "tomatoes"),
          dirtyWith: true,
        },
        {
          on: "bowl",
          onMatch: g.isBowlBatter,
          with: "pot",
          withMatch: (p) => g.isPotStew(p) && p.soup === "potatoes",
          result: () => g.makePotStew("potatoes"),
          resultOn: "with",
          dirtyOn: true,
        },
        {
          on: "plate",
          onMatch: g.isCookedMeatForSandwich,
          with: "plate",
          withMatch: (p) => g.isPlateCut(p) && p.crop === "tomatoes",
          result: (meat) => g.makeMeatWithTomato(meat),
          dirtyWith: true,
        },
        {
          on: "plate",
          onMatch: (p) => g.isPlateCut(p) && p.crop === "tomatoes",
          with: "plate",
          withMatch: g.isCookedMeatForSandwich,
          result: (_, meat) => g.makeMeatWithTomato(meat),
          resultOn: "with",
          dirtyOn: true,
        },
        {
          on: "plate",
          onMatch: (p) => p?.crop === "bread" && p?.state === "baked",
          with: "plate",
          withMatch: g.isMeatWithTomato,
          result: () => g.makeSteakSandwich(),
          dirtyWith: true,
        },
        {
          on: "plate",
          onMatch: g.isMeatWithTomato,
          with: "plate",
          withMatch: (p) => p?.crop === "bread" && p?.state === "baked",
          result: () => g.makeSteakSandwich(),
          resultOn: "with",
          dirtyOn: true,
        },
        {
          on: "pot",
          onMatch: g.isPotatoSoupPrep,
          with: "plate",
          withMatch: g.isCookedChoppedMeat,
          result: () => g.makePotatoMeatStew(),
          dirtyWith: true,
        },
        {
          on: "plate",
          onMatch: g.isCookedChoppedMeat,
          with: "pot",
          withMatch: g.isPotatoSoupPrep,
          result: () => g.makePotatoMeatStew(),
          resultOn: "with",
          dirtyOn: true,
        },
        {
          on: "pot",
          onMatch: g.isMeatStewNeedsPotatoes,
          with: "plate",
          withMatch: (p) => g.isPlateCut(p) && p.crop === "potatoes",
          result: (pot) => g.addMeatStewPotatoes(pot),
          dirtyWith: true,
        },
        {
          on: "plate",
          onMatch: (p) => g.isPlateCut(p) && p.crop === "potatoes",
          with: "pot",
          withMatch: g.isMeatStewNeedsPotatoes,
          result: (_, pot) => g.addMeatStewPotatoes(pot),
          resultOn: "with",
          dirtyOn: true,
        },
        {
          on: "pot",
          onMatch: g.isMeatStewNeedsCarrots,
          with: "plate",
          withMatch: (p) => g.isPlateCut(p) && p.crop === "carrots",
          result: (pot) => g.addMeatStewCarrots(pot),
          dirtyWith: true,
        },
        {
          on: "plate",
          onMatch: (p) => g.isPlateCut(p) && p.crop === "carrots",
          with: "pot",
          withMatch: g.isMeatStewNeedsCarrots,
          result: (_, pot) => g.addMeatStewCarrots(pot),
          resultOn: "with",
          dirtyOn: true,
        },
      ];
  
  g.findCounterRecipe = function(onCarrier, onPayload, withCarrier, withPayload) {
        for (const r of g.COUNTER_RECIPES) {
          if (
            r.on === onCarrier &&
            r.onMatch(onPayload) &&
            r.with === withCarrier &&
            r.withMatch(withPayload)
          ) {
            return r;
          }
        }
        return null;
      }
  
  g.recipeResultCarrier = function(recipe, onCarrier, withCarrier) {
        if (recipe.resultOn === "with") return withCarrier;
        return onCarrier;
      }
  
  g.canCounterCombineAtSpot = function(spotId) {
        const incoming = g.getFollowingRestCarrier();
        if (!incoming) return false;
        if (g.getCarrierDirty(incoming)) return false;
        const existing = g.counterSpotOccupants.get(spotId);
        if (!existing) return false;
        if (g.getCarrierDirty(existing)) return false;
        const existingPayload = g.getCarrierPayload(existing);
        const incomingPayload = g.getCarrierPayload(incoming);
        if (!existingPayload || !incomingPayload) return false;
        return (
          !!g.findCounterRecipe(existing, existingPayload, incoming, incomingPayload) ||
          !!g.findCounterRecipe(incoming, incomingPayload, existing, existingPayload)
        );
      }
  
  g.flashCounterCombo = function(spotEl) {
        spotEl.classList.add("combo-flash");
        setTimeout(() => spotEl.classList.remove("combo-flash"), 600);
      }
  
  g.miniPotHtml = function(crop, cold) {
        return (
          '<span class="mini-pot soup-' +
          crop +
          (cold ? " soup-cold" : "") +
          '" aria-hidden="true"><span class="mini-pot-soup"></span></span>'
        );
      }
  
  g.foodSlicesHtml = function(crop) {
        return (
          '<span class="food-slices food-slices-' +
          crop +
          '" aria-hidden="true">' +
          '<span class="slice s1"></span>' +
          '<span class="slice s2"></span>' +
          '<span class="slice s3"></span>' +
          "</span>"
        );
      }
  
  g.setFoodIcon = function(el, baseClass, food) {
        if (!food) {
          el.className = baseClass;
          el.innerHTML = "";
          return;
        }
        if (g.isSteakSandwich(food)) {
          el.className = baseClass + " food-icon food-steak-sandwich";
          el.innerHTML =
            '<span class="food-shape" aria-hidden="true"></span>' +
            '<span class="sandwich-tomato" aria-hidden="true"></span>';
          return;
        }
        if (g.isFrenchFries(food)) {
          el.className =
            baseClass + " food-icon food-potatoes food-french-fries food-baked food-cut";
          el.innerHTML = g.foodSlicesHtml("potatoes");
          return;
        }
        if (food.state === "baked") {
          if (g.isMeatWithTomato(food)) {
            el.className =
              baseClass + " food-icon food-meat food-with-tomato food-baked" + (food.wasCut ? " food-cut" : "");
            if (food.wasCut) {
              el.innerHTML = g.foodSlicesHtml("meat");
            } else {
              el.innerHTML = '<span class="food-shape" aria-hidden="true"></span>';
            }
            return;
          }
          if (food.wasCut) {
            el.className =
              baseClass + " food-icon food-" + food.crop + " food-baked food-cut";
            el.innerHTML = g.foodSlicesHtml(food.crop);
            return;
          }
          el.className = baseClass + " food-icon food-" + food.crop + " food-baked";
          el.innerHTML = '<span class="food-shape" aria-hidden="true"></span>';
          return;
        }
        if (food.state === "cut") {
          el.className = baseClass + " food-icon food-" + food.crop + " food-cut";
          el.innerHTML = g.foodSlicesHtml(food.crop);
          return;
        }
        el.className = baseClass + " food-icon food-" + food.crop;
        el.innerHTML = '<span class="food-shape" aria-hidden="true"></span>';
      }
  
  g.setSoupIcon = function(el, baseClass, soupItem) {
        if (!soupItem) {
          el.className = baseClass;
          el.innerHTML = "";
          return;
        }
        const label = g.soupLabel(soupItem);
        el.className = baseClass + " slot-icon-wrap soup-icon";
        el.innerHTML =
          g.miniPotHtml(soupItem.soup, g.isPotSoupCold(soupItem)) +
          '<span class="item-label">' +
          label +
          "</span>";
      }
  
  g.setDrinkIcon = function(el, baseClass, drink) {
        if (!drink) {
          el.className = baseClass;
          el.innerHTML = "";
          return;
        }
        const label = g.DRINK_LABELS[drink.drink] || drink.drink;
        el.className = baseClass + " slot-icon-wrap drink-icon";
        el.innerHTML =
          g.miniCupHtml(drink.drink) + '<span class="item-label">' + label + "</span>";
      }
  
  g.clearCupDrinkClasses = function() {
        [...cup.classList].forEach((cls) => {
          if (cls.startsWith("drink-")) g.cup.classList.remove(cls);
        });
      }
  
  g.clearPotSoupClasses = function() {
        [...pot.classList].forEach((cls) => {
          if (cls.startsWith("soup-")) g.pot.classList.remove(cls);
        });
      }
  
  g.clearCup = function() {
        g.cupContents = null;
        g.cupItem.textContent = "";
        g.cup.classList.remove("has-item");
        g.clearCupDrinkClasses();
        g.updateCarrierUI();
      }
  
  g.clearBowl = function() {
        g.bowlContents = null;
        g.bowl.classList.remove("has-item");
        g.clearBowlFillClasses();
        g.updateCarrierUI();
      }
  
}

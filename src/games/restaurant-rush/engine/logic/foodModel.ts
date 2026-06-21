// @ts-nocheck
import {
  BLENDER_JUICE_CROPS,
  BLENDER_SOUP_CROPS,
  BOWL_LABELS,
  CUTTABLE_CROPS,
  OVEN_CROPS,
  SOUP_LABELS,
  STEW_LABELS,
} from '../constants'

export function makeFood(crop, state = "raw") {
        return { crop, state };
      }
  
export function isBasketFood(food) {
        return !!food && food.state === "raw" && !isMeatFood(food);
      }
  
export function isMeatFood(food) {
        return !!food && food.crop === "meat";
      }
  
export function isRawMeat(food) {
        return isMeatFood(food) && food.state === "raw";
      }
  
export function isSteakSandwich(food) {
        return !!food && food.crop === "steak-sandwich";
      }
  
export function isFrenchFries(food) {
        return !!food && food.crop === "french-fries";
      }
  
export function isFrenchFriesPrep(food) {
        return (
          !!food &&
          food.crop === "potatoes" &&
          food.state === "baked" &&
          !!food.wasCut &&
          !food.salted
        );
      }
  
export function makeFrenchFries() {
        return { crop: "french-fries", state: "ready" };
      }
  
export function isMeatWithTomato(food) {
        return isMeatFood(food) && food.state === "baked" && !!food.withTomato;
      }
  
export function isCookedMeatForSandwich(food) {
        return isMeatFood(food) && food.state === "baked" && !food.withTomato;
      }
  
export function isMeatSeasoned(food) {
        return isMeatFood(food) && !!food.salted && !!food.peppered;
      }
  
export function makeMeatWithTomato(meat) {
        const item = { crop: "meat", state: "baked", withTomato: true };
        if (meat?.wasCut) item.wasCut = true;
        if (meat?.salted) item.salted = true;
        if (meat?.peppered) item.peppered = true;
        return item;
      }
  
export function isCookedChoppedMeat(food) {
        return isMeatFood(food) && food.state === "baked" && !!food.wasCut && !food.withTomato;
      }
  
export function isPotatoSoupPrep(item) {
        return (
          isPotSoup(item) &&
          item.soup === "potatoes" &&
          item.mix === "carrots" &&
          !!item.stew &&
          !!item.cold &&
          !item.complete &&
          !item.meat
        );
      }
  
export function isPotatoMeatStewPrep(item) {
        return (
          isPotSoup(item) &&
          item.soup === "potatoes" &&
          item.mix === "carrots" &&
          !!item.stew &&
          !!item.cold &&
          !item.complete &&
          !!item.meat
        );
      }
  
export function makePotatoMeatStew() {
        return {
          soup: "potatoes",
          stew: true,
          mix: "carrots",
          meat: true,
          cold: true,
          salted: false,
          peppered: false,
        };
      }
  
export function isMeatStewNeedsPotatoes(item) {
        return (
          isPotSoupCold(item) &&
          item.soup === "meat" &&
          !item.mixPotatoes &&
          !item.complete
        );
      }
  
export function isMeatStewNeedsCarrots(item) {
        return (
          isPotSoupCold(item) &&
          item.soup === "meat" &&
          !item.mixCarrots &&
          !item.complete
        );
      }
  
export function isMeatStewPrep(item) {
        return (
          isPotSoup(item) &&
          item.soup === "meat" &&
          !!item.cold &&
          !!item.mixPotatoes &&
          !!item.mixCarrots &&
          !item.complete
        );
      }
  
export function addMeatStewPotatoes(pot) {
        const item = {
          soup: "meat",
          cold: true,
          mixPotatoes: true,
          mixCarrots: !!(pot && pot.mixCarrots),
          salted: false,
          peppered: false,
        };
        if (item.mixCarrots) item.stew = true;
        return item;
      }
  
export function addMeatStewCarrots(pot) {
        const item = {
          soup: "meat",
          cold: true,
          mixPotatoes: !!(pot && pot.mixPotatoes),
          mixCarrots: true,
          salted: false,
          peppered: false,
        };
        if (item.mixPotatoes) item.stew = true;
        return item;
      }
  
export function makeSteakSandwich() {
        return { crop: "steak-sandwich", state: "ready" };
      }
  
export function isPlateFood(food) {
        return (
          !!food &&
          (food.state === "washed" ||
            food.state === "cooked" ||
            food.state === "cut" ||
            food.state === "baked" ||
            food.state === "ready" ||
            isRawMeat(food))
        );
      }
  
export function needsPineappleChopForOven(food) {
        return !!food && food.crop === "pineapple" && food.state === "washed";
      }
  
export function isOvenPlateInput(food) {
        if (!food || !OVEN_CROPS.has(food.crop)) return false;
        if (food.crop === "pineapple") return food.state === "cut";
        if (isMeatFood(food)) return food.state === "raw" || food.state === "cut";
        return food.state === "washed" || food.state === "cut";
      }
  
export function isBakedFood(food) {
        return !!food && food.state === "baked";
      }
  
export function foodLabel(food) {
        if (!food) return "food";
        if (isSteakSandwich(food)) return "steak sandwich";
        if (isFrenchFries(food)) return "french fries";
        if (food.state === "baked") {
          if (food.crop === "bread") return "bread";
          if (food.crop === "apples") return "baked apple";
          if (food.crop === "meat") {
            if (food.withTomato) return "meat with tomato";
            if (food.wasCut) return "chopped & cooked meat";
            if (isMeatSeasoned(food)) return "seasoned steak";
            return "cooked meat";
          }
          const short = {
            grapes: "grapes",
            pineapple: "pineapple",
            tomatoes: "tomato",
            carrots: "carrot",
            potatoes: "potato",
            cucumbers: "cucumber",
            beans: "beans",
          };
          return "baked " + (short[food.crop] || food.crop);
        }
        if (food.state === "cut") return "cut " + food.crop;
        if (food.crop === "meat" && food.withTomato) return "meat with tomato";
        if (food.crop === "meat") return "meat";
        return food.crop;
      }
  
export function bakeFoodFromInput(input) {
        if (input && input.kind === "dough") return makeFood("bread", "baked");
        if (input && input.kind === "food" && input.food) {
          const baked = makeFood(input.food.crop, "baked");
          if (input.food.state === "cut") baked.wasCut = true;
          if (input.food.salted) baked.salted = true;
          if (input.food.peppered) baked.peppered = true;
          return baked;
        }
        return null;
      }
  
export function makeDrink(id) {
        return { drink: id };
      }
  
export function isCupDrink(item) {
        return !!item && !!item.drink;
      }
  
export function isCuttable(food) {
        if (!food || isBakedFood(food)) return false;
        if (isMeatFood(food)) return isRawMeat(food);
        return food.state === "washed" && CUTTABLE_CROPS.has(food.crop);
      }
  
export function isBlenderInput(food) {
        if (!food || isBakedFood(food)) return false;
        if (isRawMeat(food) || (isMeatFood(food) && food.state === "cut")) return true;
        return (
          (food.state === "washed" || food.state === "cut") &&
          (BLENDER_JUICE_CROPS.has(food.crop) ||
            BLENDER_SOUP_CROPS.has(food.crop) ||
            food.crop === "wheat")
        );
      }
  
export function makePotSoup(crop, cold = false) {
        const item = { soup: crop };
        if (cold) {
          item.cold = true;
          item.salted = false;
          item.peppered = false;
        }
        return item;
      }
  
export function isPotSoup(item) {
        return !!item && !!item.soup;
      }
  
export function isPotSoupCold(item) {
        return isPotSoup(item) && !!item.cold && !item.complete;
      }
  
export function makePotSoupMix(baseSoup, mixCrop) {
        return {
          soup: baseSoup,
          stew: true,
          mix: mixCrop,
          cold: true,
          salted: false,
          peppered: false,
        };
      }
  
export function isFinishedSoupPrep(item) {
        if (!isPotSoup(item) || !item.stew || !item.cold || item.complete) return false;
        return (
          (item.soup === "potatoes" && item.mix === "carrots") ||
          (item.soup === "tomatoes" && item.mix === "tomatoes")
        );
      }
  
export function isPotSoupSeasonedForMicrowave(item) {
        if (!isPotSoupCold(item)) return false;
        return !!item.salted && !!item.peppered;
      }
  
export function isPotSoupReadyForMicrowave(item) {
        if (!isPotSoupSeasonedForMicrowave(item)) return false;
        if (isPotatoMeatStewPrep(item)) return true;
        if (isMeatStewPrep(item)) return true;
        if (item.soup === "potatoes" || item.soup === "tomatoes") {
          return isFinishedSoupPrep(item);
        }
        return true;
      }
  
export function isFinishedSoupComplete(item) {
        return isPotSoup(item) && !!item.complete;
      }
  
export function heatPotSoup(item) {
        if (!isPotSoup(item) || !isPotSoupCold(item)) return item;
        if (!item.salted || !item.peppered) return item;
        const hot = {
          soup: item.soup,
          complete: true,
          salted: true,
          peppered: true,
        };
        if (item.stew) hot.stew = true;
        if (item.mix) hot.mix = item.mix;
        if (item.meat) hot.meat = true;
        if (item.mixPotatoes) hot.mixPotatoes = true;
        if (item.mixCarrots) hot.mixCarrots = true;
        return hot;
      }
  
export function soupLabel(soupItem) {
        if (!soupItem) return "Soup";
        if (isFinishedSoupComplete(soupItem)) {
          if (soupItem.soup === "meat" && soupItem.mixPotatoes && soupItem.mixCarrots) {
            return "Meat stew";
          }
          if (soupItem.soup === "potatoes" && soupItem.mix === "carrots" && soupItem.meat) {
            return "Meat & potato stew";
          }
          if (soupItem.soup === "potatoes" && soupItem.mix === "carrots") return "Potato Soup";
          if (soupItem.soup === "tomatoes" && soupItem.mix === "tomatoes") return "Tomato Soup";
          const name = SOUP_LABELS[soupItem.soup] || soupItem.soup;
          return name + " Soup";
        }
        if (isPotStew(soupItem)) {
          if (soupItem.soup === "potatoes" && soupItem.mix === "carrots" && soupItem.meat) {
            return "Meat & potato stew prep";
          }
          if (soupItem.soup === "meat" && soupItem.mixPotatoes && soupItem.mixCarrots) {
            return "Meat stew prep";
          }
          return STEW_LABELS[soupItem.soup] || "Stew";
        }
        const base = SOUP_LABELS[soupItem.soup] || soupItem.soup;
        if (isPotSoupCold(soupItem)) return "Cold " + base;
        return base;
      }
  
export function makeBowlFlour() {
        return { flour: true };
      }
  
export function makeBowlDough() {
        return { dough: true };
      }
  
export function makeBowlBatter() {
        return { batter: true };
      }
  
export function makeBowlMix(crop) {
        return { mix: crop };
      }
  
export function makePotStew(crop) {
        return { soup: crop, stew: true };
      }
  
export function isBowlFlour(item) {
        return !!item && !!item.flour;
      }
  
export function isBowlDough(item) {
        return !!item && !!item.dough;
      }
  
export function isBowlBatter(item) {
        return !!item && !!item.batter;
      }
  
export function isBowlMix(item) {
        return !!item && !!item.mix;
      }
  
export function isBowlItem(item) {
        return isBowlFlour(item) || isBowlDough(item) || isBowlBatter(item) || isBowlMix(item);
      }
  
export function isPotStew(item) {
        return isPotSoup(item) && !!item.stew;
      }
  
export function isPlateCut(food) {
        return !!food && food.state === "cut";
      }
  
export function cupHasDrink(item, drinkId) {
        return isCupDrink(item) && item.drink === drinkId;
      }
  
export function miniBowlHtml(fillClass) {
        const fill = fillClass || "mini-bowl-flour";
        return (
          '<span class="mini-bowl" aria-hidden="true">' +
          '<span class="mini-bowl-flour ' +
          fill +
          '"></span></span>'
        );
      }
  
export function bowlFillClass(item) {
        if (isBowlFlour(item)) return "mini-bowl-flour";
        if (isBowlDough(item)) return "mini-bowl-fill-dough";
        if (isBowlBatter(item)) return "mini-bowl-fill-batter";
        if (isBowlMix(item)) return "mini-bowl-fill-mix-" + item.mix;
        return "mini-bowl-flour";
      }
  
export function bowlLabel(item) {
        if (isBowlFlour(item)) return BOWL_LABELS.flour;
        if (isBowlDough(item)) return BOWL_LABELS.dough;
        if (isBowlBatter(item)) return BOWL_LABELS.batter;
        if (isBowlMix(item)) return BOWL_LABELS["mix-" + item.mix] || "Mix";
        return "Bowl";
      }
  
export function setBowlIcon(el, baseClass, bowlItem) {
        if (!bowlItem) {
          el.className = baseClass;
          el.innerHTML = "";
          return;
        }
        el.className = baseClass + " slot-icon-wrap flour-icon";
        el.innerHTML =
          miniBowlHtml(bowlFillClass(bowlItem)) +
          '<span class="item-label">' +
          bowlLabel(bowlItem) +
          "</span>";
      }

// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attachKitchen(g: GameRuntime) {
  g.OVEN_DOOR_LABELS = { closed: "Open oven", open: "Close oven" };
  g.MICROWAVE_DOOR_LABELS = { closed: "Open microwave", open: "Close microwave" };

  g.ovenHasContents = function() {
        return g.ovenBaking || !!g.ovenResult;
      }

  g.microwaveHasContents = function() {
        return g.microwaveHeating || !!g.microwaveResult;
      }

  g.closeOvenDoor = function() {
        if (!g.kitchenOven?.classList.contains("open")) return;
        g.setApplianceOpen(g.kitchenOven, g.OVEN_DOOR_LABELS, false, null);
      }

  g.closeMicrowaveDoor = function() {
        if (!g.kitchenMicrowave?.classList.contains("open")) return;
        g.setApplianceOpen(g.kitchenMicrowave, g.MICROWAVE_DOOR_LABELS, false, null);
      }

  g.syncOvenApplianceLabel = function() {
        if (!g.kitchenOven?.classList.contains("open")) return;
        if (g.kitchenOven.classList.contains("can-take")) {
          g.kitchenOven.setAttribute("aria-label", "Take food from oven");
        } else if (g.ovenBaking) {
          g.kitchenOven.setAttribute("aria-label", "Oven — baking");
        } else if (g.ovenHasContents()) {
          g.kitchenOven.setAttribute("aria-label", "Oven — take food when ready");
        } else {
          g.kitchenOven.setAttribute("aria-label", g.OVEN_DOOR_LABELS.open);
        }
      }

  g.syncMicrowaveApplianceLabel = function() {
        if (!g.kitchenMicrowave?.classList.contains("open")) return;
        if (g.kitchenMicrowave.classList.contains("can-take")) {
          g.kitchenMicrowave.setAttribute("aria-label", "Take soup pot from microwave");
        } else if (g.microwaveHeating) {
          g.kitchenMicrowave.setAttribute("aria-label", "Microwave — heating");
        } else if (g.microwaveHasContents()) {
          g.kitchenMicrowave.setAttribute("aria-label", "Microwave — take soup when ready");
        } else {
          g.kitchenMicrowave.setAttribute("aria-label", g.MICROWAVE_DOOR_LABELS.open);
        }
      }

  g.clearBlenderJarClasses = function() {
        [...g.blenderJar.classList].forEach((cls) => {
          if (
            cls === "has-juice" ||
            cls === "has-fruit" ||
            cls === "blend-wheat" ||
            cls.startsWith("juice-") ||
            cls.startsWith("soup-")
          ) {
            g.blenderJar.classList.remove(cls);
          }
        });
      }
  
  g.updateCuttingBoardUI = function() {
        const canCut =
          g.plateFollowing &&
          g.plateContents &&
          g.isCuttable(g.plateContents) &&
          !g.cuttingInProgress;
        g.kitchenCuttingBoard.classList.toggle("can-cut", canCut);
        g.kitchenCuttingBoard.classList.toggle("cutting", g.cuttingInProgress);
  
        if (g.cuttingInProgress && g.cuttingFood) {
          g.cuttingBoardFood.className =
            "cutting-board-food food-icon food-" + g.cuttingFood.crop;
          g.cuttingBoardFood.innerHTML = '<span class="food-shape" aria-hidden="true"></span>';
          g.cuttingBoardFood.removeAttribute("aria-hidden");
        } else {
          g.cuttingBoardFood.className = "cutting-board-food";
          g.cuttingBoardFood.innerHTML = "";
          g.cuttingBoardFood.setAttribute("aria-hidden", "true");
        }
  
        g.cuttingBoardZone.setAttribute(
          "aria-label",
          canCut
            ? "Cut food on board"
            : g.cuttingInProgress
              ? "Cutting…"
              : "Cutting board"
        );
      }
  
  g.syncOvenFoodVisual = function() {
        const show = g.ovenBaking || g.ovenResult;
        g.kitchenOven.classList.toggle("has-oven-food", !!show);
        if (!show) {
          g.ovenFood.className = "oven-food";
          g.ovenFood.innerHTML = "";
          g.ovenFood.setAttribute("aria-hidden", "true");
          return;
        }
        g.ovenFood.removeAttribute("aria-hidden");
        if (g.ovenBaking && g.ovenBakingInput) {
          if (g.ovenBakingInput.kind === "dough") {
            g.ovenFood.className = "oven-food oven-food-baking";
            g.ovenFood.innerHTML = '<span class="oven-dough-ball" aria-hidden="true"></span>';
          } else {
            g.setFoodIcon(g.ovenFood, "oven-food oven-food-baking", g.ovenBakingInput.food);
          }
          return;
        }
        if (g.ovenResult) {
          g.setFoodIcon(g.ovenFood, "oven-food", g.ovenResult);
        }
      }
  
  g.syncMicrowavePotVisual = function() {
        const show = g.microwaveHeating || g.microwaveResult;
        g.kitchenMicrowave.classList.toggle("has-microwave-soup", !!show);
        if (!show) {
          g.microwavePot.className = "microwave-pot";
          g.microwavePot.innerHTML = "";
          g.microwavePot.setAttribute("aria-hidden", "true");
          return;
        }
        g.microwavePot.removeAttribute("aria-hidden");
        const soupItem = g.microwaveHeating ? g.microwaveHeatingSoup : g.microwaveResult;
        if (!soupItem) return;
        g.microwavePot.className = "microwave-pot slot-icon-wrap soup-icon";
        g.microwavePot.innerHTML =
          g.miniPotHtml(soupItem.soup, g.microwaveHeating && g.isPotSoupCold(soupItem)) +
          '<span class="item-label">' +
          g.soupLabel(soupItem) +
          "</span>";
      }
  
  g.updateMicrowaveUI = function() {
        const mwOpen = g.kitchenMicrowave.classList.contains("open");
        const canMicrowavePot =
          g.isPotSoupCold(g.potContents) && g.isPotSoupReadyForMicrowave(g.potContents);
        const canDrop =
          mwOpen &&
          !g.microwaveHeating &&
          !g.microwaveResult &&
          g.potFollowing &&
          canMicrowavePot &&
          !g.potDirty;
        const canTake =
          mwOpen &&
          !g.microwaveHeating &&
          !!g.microwaveResult &&
          g.potFollowing &&
          !g.potContents &&
          !g.potDirty;
        g.kitchenMicrowave.classList.toggle("can-drop", canDrop);
        g.kitchenMicrowave.classList.toggle("can-take", canTake);
        g.kitchenMicrowave.classList.toggle("heating", g.microwaveHeating);
        g.syncMicrowavePotVisual();
        g.syncMicrowaveApplianceLabel();
        g.microwaveZone.setAttribute(
          "aria-label",
          canDrop
            ? "Put seasoned cold soup pot in microwave"
            : g.potFollowing && g.isPotSoupCold(g.potContents) && !g.isPotSoupReadyForMicrowave(g.potContents)
              ? g.isPotatoMeatStewPrep(g.potContents) && !g.isPotSoupSeasonedForMicrowave(g.potContents)
                ? "Microwave — add salt and pepper on Kitchen 1 counter first"
              : g.isMeatStewPrep(g.potContents) && !g.isPotSoupSeasonedForMicrowave(g.potContents)
                ? "Microwave — add salt and pepper on Kitchen 1 counter first"
              : g.isFinishedSoupPrep(g.potContents) && !g.isPotSoupSeasonedForMicrowave(g.potContents)
                ? "Microwave — add salt and pepper on Kitchen 1 counter first"
              : g.isPotatoSoupPrep(g.potContents)
                ? "Microwave — cook chopped meat in oven, then combine with this pot on counter"
              : g.isMeatStewNeedsPotatoes(g.potContents) || g.isMeatStewNeedsCarrots(g.potContents)
                ? "Microwave — add chopped potatoes and carrots on counter first"
                : "Microwave — potato/tomato soup needs chopped veggies combined on counter first"
              : canTake
              ? "Take hot soup pot out"
              : g.microwaveHeating
                ? "Heating soup…"
                : g.microwaveResult
                  ? "Microwave — use an empty soup pot"
                  : "Microwave"
        );
      }
  
  g.updateOvenUI = function() {
        const ovenOpen = g.kitchenOven.classList.contains("open");
        const canDrop =
          ovenOpen &&
          !g.ovenBaking &&
          !g.ovenResult &&
          ((g.plateFollowing && g.isOvenPlateInput(g.plateContents) && !g.plateDirty) ||
            (g.bowlFollowing && g.isBowlDough(g.bowlContents) && !g.bowlDirty));
        const canTake =
          ovenOpen &&
          !g.ovenBaking &&
          !!g.ovenResult &&
          g.plateFollowing &&
          !g.plateContents &&
          !g.plateDirty;
        g.kitchenOven.classList.toggle("can-drop", canDrop);
        g.kitchenOven.classList.toggle("can-take", canTake);
        g.kitchenOven.classList.toggle("baking", g.ovenBaking);
        g.syncOvenFoodVisual();
        g.syncOvenApplianceLabel();
        g.ovenZone.setAttribute(
          "aria-label",
          canDrop
            ? "Put food in oven"
            : ovenOpen &&
                !g.ovenBaking &&
                !g.ovenResult &&
                g.plateFollowing &&
                g.needsPineappleChopForOven(g.plateContents) &&
                !g.plateDirty
              ? "Oven — chop pineapple on cutting board first"
              : canTake
                ? "Take baked food on plate"
                : g.ovenBaking
                  ? "Baking…"
                  : g.ovenResult
                    ? "Oven — use an empty plate"
                    : "Oven"
        );
      }
  
  g.updateCoolerUI = function() {
        const coolerOpen = g.kitchenCooler.classList.contains("open");
        const canFillCup = coolerOpen && g.cupFollowing && !g.cupContents && !g.cupDirty;
        g.kitchenCooler.classList.toggle("has-fillable-drinks", canFillCup);
        g.coolerDrinks.forEach((drinkEl) => {
          drinkEl.classList.toggle("can-fill", canFillCup);
        });
      }
  
  g.updateBlenderUI = function() {
        const blenderJarFree =
          !g.blenderResult || g.blenderResult.type === "wheat";
        const canDropFood =
          g.plateFollowing &&
          g.plateContents &&
          g.isBlenderInput(g.plateContents) &&
          blenderJarFree &&
          !g.blenderBlending;
        const canFillCup =
          g.cupFollowing &&
          !g.cupContents &&
          !g.cupDirty &&
          g.blenderResult &&
          g.blenderResult.type === "juice" &&
          !g.blenderBlending;
        const canFillPot =
          g.potFollowing &&
          !g.potContents &&
          !g.potDirty &&
          g.blenderResult &&
          g.blenderResult.type === "soup" &&
          !g.blenderBlending;
        const canFillBowl =
          g.bowlFollowing &&
          !g.bowlContents &&
          !g.bowlDirty &&
          g.blenderResult &&
          g.blenderResult.type === "wheat" &&
          !g.blenderBlending;
  
        g.kitchenBlender.classList.toggle("can-drop-food", canDropFood);
        g.kitchenBlender.classList.toggle("can-fill-cup", canFillCup);
        g.kitchenBlender.classList.toggle("can-fill-pot", canFillPot);
        g.kitchenBlender.classList.toggle("can-fill-bowl", canFillBowl);
        g.kitchenBlender.classList.toggle("blending", g.blenderBlending);
  
        g.clearBlenderJarClasses();
        if (g.blenderBlending && g.blenderFruitFood) {
          g.blenderJar.classList.add("has-fruit");
          g.blenderFruit.className = "blender-fruit food-icon food-" + g.blenderFruitFood.crop;
          g.blenderFruit.innerHTML = '<span class="food-shape" aria-hidden="true"></span>';
          g.blenderFruit.removeAttribute("aria-hidden");
        } else if (g.blenderResult) {
          g.blenderJar.classList.add("has-juice");
          if (g.blenderResult.type === "juice") {
            const juiceClass = g.blenderResult.drink.replace("juice-", "");
            g.blenderJar.classList.add("juice-" + juiceClass);
          } else if (g.blenderResult.type === "soup") {
            g.blenderJar.classList.add("soup-" + g.blenderResult.crop);
          } else if (g.blenderResult.type === "wheat") {
            g.blenderJar.classList.add("blend-wheat");
          }
          g.blenderFruit.className = "blender-fruit";
          g.blenderFruit.setAttribute("aria-hidden", "true");
        } else {
          g.blenderFruit.className = "blender-fruit";
          g.blenderFruit.setAttribute("aria-hidden", "true");
        }
  
        g.blenderZone.setAttribute(
          "aria-label",
          canDropFood
            ? "Put food in blender"
            : canFillCup
              ? "Pour juice into cup"
              : canFillPot
                ? "Scoop soup into pot"
                : canFillBowl
                  ? "Pour flour into bowl"
                  : g.blenderBlending
                    ? "Blending…"
                    : g.blenderResult
                      ? "Blender — ready to scoop"
                      : "Blender"
        );
      }
  
  g.fillCupFromCooler = function(drinkEl) {
        if (!g.kitchenCooler.classList.contains("open")) return;
        if (!g.cupFollowing || g.cupContents || g.cupDirty) return;
        g.setCupDrink(g.makeDrink(drinkEl.dataset.drink));
        g.maybeAdvanceTutorialGuide({
          type: "cooler-fill",
          drink: drinkEl.dataset.drink,
        });
      }
  
  g.updateSinkUI = function() {
        const canDrop =
          g.basketFollowing &&
          g.basketContents &&
          g.isBasketFood(g.basketContents) &&
          !g.isMeatFood(g.basketContents) &&
          !g.isCupDrink(g.basketContents) &&
          !g.sinkContents &&
          !g.sinkWashing;
        const canTakePlate =
          g.plateFollowing &&
          !g.plateContents &&
          !g.plateDirty &&
          g.sinkContents &&
          !g.sinkWashing &&
          g.isPlateFood(g.sinkContents);
  
        g.kitchenSink.classList.toggle("can-drop", canDrop);
        g.kitchenSink.classList.toggle("can-take-plate", canTakePlate);
        g.kitchenSink.classList.toggle("washing", g.sinkWashing);
  
        if (g.sinkContents) {
          g.setFoodIcon(g.sinkItem, "sink-item", g.sinkContents);
          g.sinkItem.classList.add("visible");
          g.sinkItem.removeAttribute("aria-hidden");
          g.sinkSparkle.classList.toggle("show", g.isPlateFood(g.sinkContents));
        } else {
          g.setFoodIcon(g.sinkItem, "sink-item", null);
          g.sinkItem.classList.remove("visible");
          g.sinkItem.setAttribute("aria-hidden", "true");
          g.sinkSparkle.classList.remove("show");
        }
  
        g.sinkBasin.setAttribute(
          "aria-label",
          canDrop
            ? "Put food in sink to wash"
            : canTakePlate
              ? "Take clean food onto plate"
              : g.sinkWashing
                ? "Washing…"
                : "Sink"
        );
      }
  
  g.startSinkWashTimer = function() {
        let remaining = g.SINK_WASH_SEC;
        g.sinkWashTimer.hidden = false;
        g.sinkWashTimer.textContent = remaining;
        g.sinkTimerInterval = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(g.sinkTimerInterval);
            g.sinkTimerInterval = null;
            g.sinkWashTimer.hidden = true;
            g.finishSinkWash();
          } else {
            g.sinkWashTimer.textContent = remaining;
          }
        }, 1000);
      }
  
  g.finishSinkWash = function() {
        g.sinkWashing = false;
        if (g.sinkContents && g.isCupDrink(g.sinkContents)) {
          g.sinkContents = null;
          g.updateCarrierUI();
          return;
        }
        if (g.sinkContents) {
          g.sinkContents.state = "washed";
        }
        g.updateCarrierUI();
      }
  
  g.placeInSink = function() {
        if (!g.basketFollowing || !g.basketContents || !g.isBasketFood(g.basketContents)) return;
        if (g.isMeatFood(g.basketContents)) return;
        if (g.isCupDrink(g.basketContents)) return;
        if (g.sinkContents || g.sinkWashing) return;
        g.sinkContents = { ...g.basketContents };
        g.clearBasket();
        g.sinkWashing = true;
        g.updateCarrierUI();
        g.startSinkWashTimer();
        g.maybeAdvanceTutorialGuide({ type: "sink", action: "drop" });
      }
  
  g.takeFromSink = function() {
        if (!g.plateFollowing || g.plateContents || g.plateDirty) return;
        if (!g.sinkContents || g.sinkWashing || !g.isPlateFood(g.sinkContents)) return;
        g.setPlateFood({ ...g.sinkContents });
        g.sinkContents = null;
        g.updateCarrierUI();
        g.maybeAdvanceTutorialGuide({ type: "sink", action: "take" });
      }
  
  g.updateMeatBoxUI = function() {
        if (!g.meatBox) return;
        const canTakePlate =
          g.isScreen2Active() &&
          g.plateFollowing &&
          !g.plateContents &&
          !g.plateDirty;
        g.meatBox.classList.toggle("can-take-plate", canTakePlate);
        g.meatBox.setAttribute(
          "aria-label",
          canTakePlate ? "Take meat onto plate" : "MEAT box"
        );
      }
  
  g.takeFromMeatBox = function() {
        if (!g.isScreen2Active()) return;
        if (!g.plateFollowing || g.plateContents || g.plateDirty) return;
        g.setPlateFood(g.makeFood("meat", "raw"));
        g.updateCarrierUI();
        g.maybeAdvanceTutorialGuide({ type: "meat-box", action: "take" });
      }
  
  g.clearSinkInstant = function() {
        if (g.sinkTimerInterval) {
          clearInterval(g.sinkTimerInterval);
          g.sinkTimerInterval = null;
        }
        g.sinkWashing = false;
        g.sinkContents = null;
        g.sinkWashTimer.hidden = true;
        g.updateSinkUI();
      }
  
  g.updateTrashCan = function() {
        g.kitchenTrashCans.forEach((trash) => {
          const canThrow =
            (g.basketContents && g.isBasketFood(g.basketContents)) ||
            (g.plateContents && g.isPlateFood(g.plateContents)) ||
            (g.cupContents && g.isCupDrink(g.cupContents)) ||
            (g.potContents && g.isPotSoup(g.potContents)) ||
            (g.bowlContents && g.isBowlItem(g.bowlContents)) ||
            g.trayCanThrowAway();
          trash.classList.toggle("can-throw", canThrow);
          trash.disabled = !canThrow;
          trash.setAttribute(
            "aria-label",
            canThrow
              ? g.trayCanThrowAway() && !g.basketContents && !g.plateContents && !g.cupContents && !g.potContents && !g.bowlContents
                ? "Throw away tray food"
                : "Throw away food or drink"
              : "Trash can"
          );
        });
      }
  
  g.isDirtyTrayReadyForDishwasher = function() {
        return (
          g.trayDirty &&
          !g.trayHasLoad() &&
          !g.dishwasherLoad &&
          !g.dishwasherWashing &&
          (g.trayFollowing || g.isTrayOnHomeDock() || g.isTrayOnCounter())
        );
      }
  
  g.wouldLoadInDishwasher = function() {
        if (g.dishwasherLoad || g.dishwasherWashing) return false;
        if (g.plateFollowing && g.plateDirty && !g.plateContents) return true;
        if (g.cupFollowing && g.cupDirty && !g.cupContents) return true;
        if (g.potFollowing && g.potDirty && !g.potContents) return true;
        if (g.bowlFollowing && g.bowlDirty && !g.bowlContents) return true;
        if (g.isDirtyTrayReadyForDishwasher()) return true;
        return false;
      }
  
  g.updateDishwasherUI = function() {
        const dishwasherOpen = g.kitchenDishwasher.classList.contains("open");
        const canDropPlate =
          dishwasherOpen &&
          g.plateFollowing &&
          g.plateDirty &&
          !g.plateContents &&
          !g.dishwasherLoad &&
          !g.dishwasherWashing;
        const canDropCup =
          dishwasherOpen &&
          g.cupFollowing &&
          g.cupDirty &&
          !g.cupContents &&
          !g.dishwasherLoad &&
          !g.dishwasherWashing;
        const canDropPot =
          dishwasherOpen &&
          g.potFollowing &&
          g.potDirty &&
          !g.potContents &&
          !g.dishwasherLoad &&
          !g.dishwasherWashing;
        const canDropBowl =
          dishwasherOpen &&
          g.bowlFollowing &&
          g.bowlDirty &&
          !g.bowlContents &&
          !g.dishwasherLoad &&
          !g.dishwasherWashing;
        const canDropTray = dishwasherOpen && g.isDirtyTrayReadyForDishwasher();
        const canDrop = canDropPlate || canDropCup || canDropPot || canDropBowl || canDropTray;
  
        g.kitchenDishwasher.classList.toggle("can-drop-dish", canDrop);
        g.kitchenDishwasher.classList.toggle("washing", g.dishwasherWashing);
  
        if (g.dishwasherLoad === "plate") {
          g.dishwasherItem.className = "dishwasher-item icon-dish-plate visible";
          g.dishwasherItem.innerHTML = "";
          g.dishwasherItem.removeAttribute("aria-hidden");
        } else if (g.dishwasherLoad === "cup") {
          g.dishwasherItem.className = "dishwasher-item icon-dish-cup visible";
          g.dishwasherItem.innerHTML = "";
          g.dishwasherItem.removeAttribute("aria-hidden");
        } else if (g.dishwasherLoad === "pot") {
          g.dishwasherItem.className = "dishwasher-item icon-dish-pot visible";
          g.dishwasherItem.innerHTML = "";
          g.dishwasherItem.removeAttribute("aria-hidden");
        } else if (g.dishwasherLoad === "bowl") {
          g.dishwasherItem.className = "dishwasher-item icon-dish-bowl visible";
          g.dishwasherItem.innerHTML = "";
          g.dishwasherItem.removeAttribute("aria-hidden");
        } else if (g.dishwasherLoad === "tray") {
          g.dishwasherItem.className = "dishwasher-item icon-dish-tray visible";
          g.dishwasherItem.innerHTML = "";
          g.dishwasherItem.removeAttribute("aria-hidden");
        } else {
          g.dishwasherItem.className = "dishwasher-item";
          g.dishwasherItem.innerHTML = "";
          g.dishwasherItem.setAttribute("aria-hidden", "true");
        }
  
        g.dishwasherZone.setAttribute(
          "aria-label",
          canDrop
            ? canDropTray
              ? "Load dirty tray in dishwasher"
              : "Load dirty dish in dishwasher"
            : g.dishwasherWashing
              ? "Dishwasher washing…"
              : !dishwasherOpen
                ? g.wouldLoadInDishwasher()
                  ? g.isDirtyTrayReadyForDishwasher()
                    ? "Open dishwasher to load dirty tray"
                    : "Open dishwasher to load dirty dish"
                  : "Open dishwasher"
                : "Dishwasher"
        );
      }
  
  g.startDishwasherWashTimer = function() {
        let remaining = g.DISHWASHER_WASH_SEC;
        g.dishwasherWashTimer.hidden = false;
        g.dishwasherWashTimer.textContent = remaining;
        g.dishwasherTimerInterval = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(g.dishwasherTimerInterval);
            g.dishwasherTimerInterval = null;
            g.dishwasherWashTimer.hidden = true;
            g.finishDishwasherWash();
          } else {
            g.dishwasherWashTimer.textContent = remaining;
          }
        }, 1000);
      }
  
  g.finishDishwasherWash = function() {
        g.dishwasherWashing = false;
        if (g.dishwasherLoad === "plate") {
          g.plateDirty = false;
        } else if (g.dishwasherLoad === "cup") {
          g.cupDirty = false;
        } else if (g.dishwasherLoad === "pot") {
          g.potDirty = false;
        } else if (g.dishwasherLoad === "bowl") {
          g.bowlDirty = false;
        } else if (g.dishwasherLoad === "tray") {
          g.trayDirty = false;
        }
        g.dishwasherLoad = null;
        g.updateCarrierUI();
      }
  
  g.placeInDishwasher = function() {
        const dishwasherOpen = g.kitchenDishwasher.classList.contains("open");
        if (!dishwasherOpen || g.dishwasherLoad || g.dishwasherWashing) return;
  
        if (g.plateFollowing && g.plateDirty && !g.plateContents) {
          g.putDownPlate();
          g.dishwasherLoad = "plate";
          g.dishwasherWashing = true;
          g.updateCarrierUI();
          g.startDishwasherWashTimer();
          g.maybeAdvanceTutorialGuide({ type: "dishwasher", action: "load" });
        } else if (g.cupFollowing && g.cupDirty && !g.cupContents) {
          g.putDownCup();
          g.dishwasherLoad = "cup";
          g.dishwasherWashing = true;
          g.updateCarrierUI();
          g.startDishwasherWashTimer();
        } else if (g.potFollowing && g.potDirty && !g.potContents) {
          g.putDownPot();
          g.dishwasherLoad = "pot";
          g.dishwasherWashing = true;
          g.updateCarrierUI();
          g.startDishwasherWashTimer();
        } else if (g.bowlFollowing && g.bowlDirty && !g.bowlContents) {
          g.putDownBowl();
          g.dishwasherLoad = "bowl";
          g.dishwasherWashing = true;
          g.updateCarrierUI();
          g.startDishwasherWashTimer();
        } else if (g.isDirtyTrayReadyForDishwasher()) {
          if (g.trayFollowing) {
            g.hideTrayActionMenu();
            g.trayFollowing = false;
            g.tray.classList.remove("following");
          } else if (g.isTrayOnCounter()) {
            g.hideTrayActionMenu();
            g.clearCarrierRestSpot("tray");
            g.tray.classList.remove("on-counter");
            g.tray.style.position = "";
            g.tray.style.left = "";
            g.tray.style.top = "";
            g.tray.style.transform = "";
          } else if (!g.isTrayOnHomeDock()) {
            return;
          }
          g.clearCarrierRestSpot("tray");
          g.tray.classList.remove("on-counter");
          g.tray.style.position = "";
          g.tray.style.left = "";
          g.tray.style.top = "";
          g.tray.style.transform = "";
          g.dishwasherLoad = "tray";
          g.dishwasherWashing = true;
          g.updateCarrierUI();
          g.startDishwasherWashTimer();
          g.maybeAdvanceTutorialGuide({ type: "dishwasher", action: "load" });
        }
      }
  
  g.startCuttingTimer = function() {
        let remaining = g.CUT_SEC;
        g.cuttingBoardTimer.hidden = false;
        g.cuttingBoardTimer.textContent = remaining;
        g.cuttingTimerInterval = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(g.cuttingTimerInterval);
            g.cuttingTimerInterval = null;
            g.cuttingBoardTimer.hidden = true;
            g.finishCutting();
          } else {
            g.cuttingBoardTimer.textContent = remaining;
          }
        }, 1000);
      }
  
  g.finishCutting = function() {
        g.cuttingInProgress = false;
        if (g.cuttingFood) {
          g.setPlateFood(g.makeFood(g.cuttingFood.crop, "cut"));
          g.cuttingFood = null;
        }
        g.updateCarrierUI();
      }
  
  g.placeOnCuttingBoard = function() {
        if (!g.plateFollowing || !g.plateContents || !g.isCuttable(g.plateContents)) return;
        if (g.cuttingInProgress) return;
        g.cuttingFood = { crop: g.plateContents.crop };
        g.clearPlate();
        g.cuttingInProgress = true;
        g.updateCarrierUI();
        g.startCuttingTimer();
        g.maybeAdvanceTutorialGuide({ type: "cutting-board", action: "use" });
      }
  
  g.clearCuttingInstant = function() {
        if (g.cuttingTimerInterval) {
          clearInterval(g.cuttingTimerInterval);
          g.cuttingTimerInterval = null;
        }
        g.cuttingBoardTimer.hidden = true;
        if (g.cuttingInProgress) {
          g.finishCutting();
        } else {
          g.updateCuttingBoardUI();
        }
      }
  
  g.startOvenTimer = function() {
        let remaining = g.OVEN_BAKE_SEC;
        g.ovenTimer.hidden = false;
        g.ovenTimer.textContent = remaining;
        g.ovenTimerInterval = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(g.ovenTimerInterval);
            g.ovenTimerInterval = null;
            g.ovenTimer.hidden = true;
            g.finishBaking();
          } else {
            g.ovenTimer.textContent = remaining;
          }
        }, 1000);
      }
  
  g.finishBaking = function() {
        g.ovenBaking = false;
        g.ovenResult = g.bakeFoodFromInput(g.ovenBakingInput);
        g.ovenBakingInput = null;
        g.updateCarrierUI();
      }
  
  g.placeInOven = function() {
        if (!g.kitchenOven.classList.contains("open")) return;
        if (g.ovenBaking || g.ovenResult) return;
        if (g.bowlFollowing && g.isBowlDough(g.bowlContents) && !g.bowlDirty) {
          g.ovenBakingInput = { kind: "dough" };
          g.clearBowl();
          g.ovenBaking = true;
          g.updateCarrierUI();
          g.startOvenTimer();
          g.closeOvenDoor();
          g.maybeAdvanceTutorialGuide({ type: "oven", action: "drop" });
          return;
        }
        if (g.plateFollowing && g.isOvenPlateInput(g.plateContents) && !g.plateDirty) {
          g.ovenBakingInput = { kind: "food", food: { ...g.plateContents } };
          g.clearPlate();
          g.ovenBaking = true;
          g.updateCarrierUI();
          g.startOvenTimer();
          g.closeOvenDoor();
          g.maybeAdvanceTutorialGuide({ type: "oven", action: "drop" });
        }
      }

  g.takeFromOven = function() {
        if (!g.ovenResult || g.ovenBaking) return;
        if (!g.plateFollowing || g.plateContents || g.plateDirty) return;
        g.setPlateFood({ ...g.ovenResult });
        g.ovenResult = null;
        g.updateCarrierUI();
        g.maybeAdvanceTutorialGuide({ type: "oven", action: "take" });
      }
  
  g.clearOvenInstant = function() {
        if (g.ovenTimerInterval) {
          clearInterval(g.ovenTimerInterval);
          g.ovenTimerInterval = null;
        }
        g.ovenTimer.hidden = true;
        if (g.ovenBaking) {
          g.finishBaking();
        } else {
          g.updateOvenUI();
        }
      }
  
  g.startMicrowaveTimer = function() {
        let remaining = g.MICROWAVE_HEAT_SEC;
        g.microwaveTimer.hidden = false;
        g.microwaveTimer.textContent = remaining;
        g.microwaveTimerInterval = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(g.microwaveTimerInterval);
            g.microwaveTimerInterval = null;
            g.microwaveTimer.hidden = true;
            g.finishMicrowave();
          } else {
            g.microwaveTimer.textContent = remaining;
          }
        }, 1000);
      }
  
  g.finishMicrowave = function() {
        g.microwaveHeating = false;
        if (g.microwaveHeatingSoup) {
          g.microwaveResult = g.heatPotSoup(g.microwaveHeatingSoup);
          g.microwaveHeatingSoup = null;
        }
        g.updateCarrierUI();
      }
  
  g.placeInMicrowave = function() {
        if (!g.kitchenMicrowave.classList.contains("open")) return;
        if (g.microwaveHeating || g.microwaveResult) return;
        if (!g.potFollowing || !g.isPotSoupCold(g.potContents) || g.potDirty) return;
        if (g.isPotSoup(g.potContents) && g.potContents.soup === "meat") return;
        if (!g.isPotSoupReadyForMicrowave(g.potContents)) return;
        g.microwaveHeatingSoup = { ...g.potContents };
        g.clearPot();
        g.microwaveHeating = true;
        g.updateCarrierUI();
        g.startMicrowaveTimer();
        g.closeMicrowaveDoor();
        g.maybeAdvanceTutorialGuide({ type: "microwave", action: "drop" });
      }

  g.takeFromMicrowave = function() {
        if (!g.microwaveResult || g.microwaveHeating) return;
        if (!g.potFollowing || g.potContents || g.potDirty) return;
        g.setPotSoup({ ...g.microwaveResult });
        g.microwaveResult = null;
        g.updateCarrierUI();
        g.maybeAdvanceTutorialGuide({ type: "microwave", action: "take" });
      }
  
  g.clearMicrowaveInstant = function() {
        if (g.microwaveTimerInterval) {
          clearInterval(g.microwaveTimerInterval);
          g.microwaveTimerInterval = null;
        }
        g.microwaveTimer.hidden = true;
        if (g.microwaveHeating) {
          g.finishMicrowave();
        } else {
          g.updateMicrowaveUI();
        }
      }
  
  g.clearDishwasherInstant = function() {
        if (g.dishwasherTimerInterval) {
          clearInterval(g.dishwasherTimerInterval);
          g.dishwasherTimerInterval = null;
        }
        g.dishwasherWashing = false;
        g.dishwasherLoad = null;
        g.dishwasherWashTimer.hidden = true;
        g.updateDishwasherUI();
        g.updateDirtyCarrierVisuals();
      }
  
  g.startBlenderTimer = function() {
        let remaining = g.BLENDER_BLEND_SEC;
        g.blenderWashTimer.hidden = false;
        g.blenderWashTimer.textContent = remaining;
        g.blenderTimerInterval = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(g.blenderTimerInterval);
            g.blenderTimerInterval = null;
            g.blenderWashTimer.hidden = true;
            g.finishBlender();
          } else {
            g.blenderWashTimer.textContent = remaining;
          }
        }, 1000);
      }
  
  g.finishBlender = function() {
        g.blenderBlending = false;
        if (g.blenderFruitFood) {
          const crop = g.blenderFruitFood.crop;
          if (crop === "wheat") {
            g.blenderResult = { type: "wheat" };
          } else if (crop === "meat") {
            g.blenderResult = { type: "soup", crop: "meat" };
          } else if (g.BLENDER_SOUP_CROPS.has(crop)) {
            g.blenderResult = { type: "soup", crop };
          } else {
            g.blenderResult = { type: "juice", drink: "juice-" + crop };
          }
          g.blenderFruitFood = null;
        }
        g.updateCarrierUI();
      }
  
  g.placeInBlender = function() {
        if (!g.plateFollowing || !g.plateContents || !g.isBlenderInput(g.plateContents)) return;
        if (g.blenderBlending) return;
        if (g.blenderResult && g.blenderResult.type !== "wheat") return;
        g.blenderResult = null;
        g.blenderFruitFood = { crop: g.plateContents.crop };
        g.clearPlate();
        g.blenderBlending = true;
        g.updateCarrierUI();
        g.startBlenderTimer();
        g.maybeAdvanceTutorialGuide({ type: "blender", action: "drop" });
      }
  
  g.takeJuiceFromBlender = function() {
        if (
          !g.cupFollowing ||
          g.cupContents ||
          g.cupDirty ||
          !g.blenderResult ||
          g.blenderResult.type !== "juice" ||
          g.blenderBlending
        ) {
          return;
        }
        g.setCupDrink(g.makeDrink(g.blenderResult.drink));
        g.blenderResult = null;
        g.updateCarrierUI();
        g.maybeAdvanceTutorialGuide({ type: "blender", action: "take-juice" });
      }
  
  g.takeSoupFromBlender = function() {
        if (
          !g.potFollowing ||
          g.potContents ||
          g.potDirty ||
          !g.blenderResult ||
          g.blenderResult.type !== "soup" ||
          g.blenderBlending
        ) {
          return;
        }
        g.setPotSoup(g.makePotSoup(g.blenderResult.crop, true));
        g.blenderResult = null;
        g.updateCarrierUI();
        g.maybeAdvanceTutorialGuide({ type: "blender", action: "take-soup" });
      }
  
  g.takeFlourFromBlender = function() {
        if (
          !g.bowlFollowing ||
          g.bowlContents ||
          g.bowlDirty ||
          !g.blenderResult ||
          g.blenderResult.type !== "wheat" ||
          g.blenderBlending
        ) {
          return;
        }
        g.setBowlFlour(g.makeBowlFlour());
        g.blenderResult = null;
        g.updateCarrierUI();
        g.maybeAdvanceTutorialGuide({ type: "blender", action: "take-flour" });
      }
  
  g.clearBlenderInstant = function() {
        if (g.blenderTimerInterval) {
          clearInterval(g.blenderTimerInterval);
          g.blenderTimerInterval = null;
        }
        g.blenderWashTimer.hidden = true;
        if (g.blenderBlending) {
          g.finishBlender();
        } else {
          g.updateBlenderUI();
        }
      }
  
  g.throwAwayFood = function(trashEl) {
        if (g.basketContents && g.isBasketFood(g.basketContents)) {
          trashEl.classList.add("throwing");
          g.clearBasket();
        } else if (g.plateContents && g.isPlateFood(g.plateContents)) {
          trashEl.classList.add("throwing");
          g.clearPlate();
          g.plateDirty = true;
          g.updateCarrierUI();
          g.maybeAdvanceTutorialGuide({ type: "trash", action: "throw" });
        } else if (g.cupContents && g.isCupDrink(g.cupContents)) {
          trashEl.classList.add("throwing");
          g.clearCup();
          g.cupDirty = true;
          g.updateCarrierUI();
        } else if (g.potContents && g.isPotSoup(g.potContents)) {
          trashEl.classList.add("throwing");
          g.clearPot();
          g.potDirty = true;
          g.updateCarrierUI();
        } else if (g.bowlContents && g.isBowlItem(g.bowlContents)) {
          trashEl.classList.add("throwing");
          g.clearBowl();
          g.bowlDirty = true;
          g.updateCarrierUI();
        } else if (g.trayCanThrowAway()) {
          trashEl.classList.add("throwing");
          g.throwAwayTrayFoodOnly();
        } else {
          return;
        }
        setTimeout(() => trashEl.classList.remove("throwing"), 350);
      }
  
}

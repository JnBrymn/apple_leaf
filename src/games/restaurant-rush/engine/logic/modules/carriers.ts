// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attachCarriers(g: GameRuntime) {
  g.getCarrierPayload = function(carrier) {
        if (carrier === "plate") return g.plateContents;
        if (carrier === "cup") return g.cupContents;
        if (carrier === "pot") return g.potContents;
        if (carrier === "bowl") return g.bowlContents;
        return null;
      }
  
  g.getCarrierDirty = function(carrier) {
        if (carrier === "plate") return g.plateDirty;
        if (carrier === "cup") return g.cupDirty;
        if (carrier === "pot") return g.potDirty;
        if (carrier === "bowl") return g.bowlDirty;
        if (carrier === "tray") return g.trayDirty;
        return false;
      }
  
  g.setCarrierDirty = function(carrier, dirty) {
        if (carrier === "plate") g.plateDirty = dirty;
        else if (carrier === "cup") g.cupDirty = dirty;
        else if (carrier === "pot") g.potDirty = dirty;
        else if (carrier === "bowl") g.bowlDirty = dirty;
        else if (carrier === "tray") g.trayDirty = dirty;
      }
  
  g.applyCarrierPayload = function(carrier, item) {
        if (carrier === "plate") g.setPlateFood(item);
        else if (carrier === "cup") g.setCupDrink(item);
        else if (carrier === "pot") g.setPotSoup(item);
        else if (carrier === "bowl") g.setBowlItem(item);
      }
  
  g.clearCarrierPayload = function(carrier) {
        if (carrier === "plate") g.clearPlate();
        else if (carrier === "cup") g.clearCup();
        else if (carrier === "pot") g.clearPot();
        else if (carrier === "bowl") g.clearBowl();
      }
  
  g.stopCarrierFollowing = function(carrier) {
        const el = g.getCarrierEl(carrier);
        const home = g.getCarrierHome(carrier);
        if (carrier === "plate") g.plateFollowing = false;
        else if (carrier === "cup") g.cupFollowing = false;
        else if (carrier === "pot") g.potFollowing = false;
        else if (carrier === "bowl") g.bowlFollowing = false;
        else if (carrier === "tray") g.trayFollowing = false;
        el.classList.remove("following");
        el.setAttribute("aria-label", "Pick up from counter");
        home.classList.add("is-empty");
      }
  
  g.reconcileTrayStackCount = function() {
        let away = g.cafeteriaCartDirtyTrays;
        if (g.isTrayOutInWorld()) away += 1;
        g.traysAtHome = Math.max(0, g.TRAY_STACK_MAX - away);
      }
  
  g.updateCafeteriaCartUI = function() {
        if (!g.cafeteriaCart || !g.cafeteriaCartPickup || !g.cafeteriaCartTrayStack) return;
        const hasDirty = g.cafeteriaCartDirtyTrays > 0;
        const canPickUp =
          hasDirty && g.isScreen6Active() && !g.isTrayOutInWorld();
        g.cafeteriaCart.removeAttribute("aria-hidden");
        g.cafeteriaCartPickup.hidden = !hasDirty;
        g.cafeteriaCartPickup.classList.toggle("can-pickup", canPickUp);
        g.cafeteriaCartPickup.setAttribute(
          "aria-label",
          canPickUp
            ? g.cafeteriaCartDirtyTrays === 1
              ? "Pick up dirty tray from cart"
              : "Pick up dirty tray from cart (" + g.cafeteriaCartDirtyTrays + " waiting)"
            : hasDirty
              ? "Dirty tray on cart — hands full or go to cafeteria"
              : "Dirty tray cart"
        );
        g.cafeteriaCartTrayStack.innerHTML = "";
        for (let i = 0; i < g.cafeteriaCartDirtyTrays; i++) {
          const mini = document.createElement("span");
          mini.className = "caf-cart-mini-tray";
          mini.style.setProperty("--cart-tray-i", String(i));
          g.cafeteriaCartTrayStack.appendChild(mini);
        }
      }
  
  g.clearTutorialGlows = function() {
        g.root.querySelectorAll(".tutorial-glow").forEach((el) => {
          el.classList.remove("tutorial-glow");
        });
      }
  
  g.buildCashierOrder = function() {
        if (g.tutorialMode) {
          return g.buildTutorialCashierOrder();
        }
        const counts =
          g.CASHIER_ORDER_COUNT_OPTIONS[
            Math.floor(Math.random() * g.CASHIER_ORDER_COUNT_OPTIONS.length)
          ];
        const items = [
          ...g.pickRandomCashierCatalogItems(
            g.CASHIER_ORDER_DRINKS,
            counts.drink
          ),
          ...g.pickRandomCashierCatalogItems(g.CASHIER_ORDER_SOUPS, counts.soup),
          ...g.pickRandomCashierCatalogItems(g.CASHIER_ORDER_FOODS, counts.food),
        ];
        g.shuffleCashierOrderItems(items);
        return { items };
      }
  
  g.updateCarrierUI = function() {
        g.updateFridgeSlots();
        g.updateTrashCan();
        g.updateSinkUI();
        g.updateMeatBoxUI();
        g.updateDishwasherUI();
        g.updateCoolerUI();
        g.updateCuttingBoardUI();
        g.updateOvenUI();
        g.updateMicrowaveUI();
        g.updateBlenderUI();
        g.updateCounterRestSpots();
        g.updateDirtyCarrierVisuals();
        g.updateTrayVisual();
        g.updateCashierUI();
        g.updateTrayStackUI();
        g.updateCafeteriaCartUI();
        g.returnShakersIfNotOnScreen2();
        g.checkTutorialFoodMistake();
        g.refreshTutorialGlow();
      }
  
  g.getCarrierRestSpotId = function(carrier) {
        if (carrier === "plate") return g.plateRestSpotId;
        if (carrier === "cup") return g.cupRestSpotId;
        if (carrier === "pot") return g.potRestSpotId;
        if (carrier === "bowl") return g.bowlRestSpotId;
        if (carrier === "tray") return g.trayRestSpotId;
        return null;
      }
  
  g.setCarrierRestSpotId = function(carrier, spotId) {
        if (carrier === "plate") g.plateRestSpotId = spotId;
        else if (carrier === "cup") g.cupRestSpotId = spotId;
        else if (carrier === "pot") g.potRestSpotId = spotId;
        else if (carrier === "bowl") g.bowlRestSpotId = spotId;
        else if (carrier === "tray") g.trayRestSpotId = spotId;
      }
  
  g.getCarrierEl = function(carrier) {
        if (carrier === "plate") return g.plate;
        if (carrier === "cup") return g.cup;
        if (carrier === "pot") return g.pot;
        if (carrier === "bowl") return g.bowl;
        if (carrier === "tray") return g.tray;
        return null;
      }
  
  g.getCarrierHome = function(carrier) {
        if (carrier === "plate") return g.plateHome;
        if (carrier === "cup") return g.cupHome;
        if (carrier === "pot") return g.potHome;
        if (carrier === "bowl") return g.bowlHome;
        if (carrier === "tray") return g.trayHome;
        return null;
      }
  
  g.isCarrierFollowing = function(carrier) {
        if (carrier === "plate") return g.plateFollowing;
        if (carrier === "cup") return g.cupFollowing;
        if (carrier === "pot") return g.potFollowing;
        if (carrier === "bowl") return g.bowlFollowing;
        if (carrier === "tray") return g.trayFollowing;
        return false;
      }
  
  g.clearCarrierRestSpot = function(carrier) {
        const spotId = g.getCarrierRestSpotId(carrier);
        if (spotId) g.counterSpotOccupants.delete(spotId);
        g.setCarrierRestSpotId(carrier, null);
      }
  
  g.returnCarrierToHomeDock = function(carrier) {
        const el = g.getCarrierEl(carrier);
        const home = g.getCarrierHome(carrier);
        if (!el || !home) return;
        el.classList.remove("on-counter");
        el.style.position = "";
        el.style.left = "";
        el.style.top = "";
        el.style.transform = "";
        if (!g.isCarrierFollowing(carrier) && g.dishwasherLoad !== carrier) {
          home.classList.remove("is-empty");
        }
      }
  
  g.isUnwashedTrayPayload = function(payload) {
        return !!payload && !!payload.crop && payload.state === "raw";
      }
  
  g.isValidTrayPayload = function(payload) {
        if (!payload || g.isUnwashedTrayPayload(payload)) return false;
        if (g.isPotSoup(payload)) return true;
        if (g.isCupDrink(payload)) return true;
        if (g.isPlateFood(payload)) return true;
        if (g.isBowlItem(payload)) return true;
        return false;
      }
  
  g.canPlaceOnTraySlot = function(slot, carrier) {
        if (g.trayDirty) return false;
        const payload = g.getCarrierPayload(carrier);
        if (!payload || g.getCarrierDirty(carrier) || !g.isValidTrayPayload(payload)) return false;
        if (slot === "extra") return true;
        return g.getTrayPreferredSlot(carrier) === slot;
      }
  
  g.hideTrayActionMenu = function() {
        if (!g.trayActionMenu) return;
        g.trayActionMenu.classList.remove("open");
        g.trayActionMenu.hidden = true;
      }
  
  g.syncTrayCounterSpotIfNeeded = function() {
        if (g.trayRestSpotId) return;
        for (const [spotId, carrier] of g.counterSpotOccupants.entries()) {
          if (carrier === "tray") {
            g.trayRestSpotId = spotId;
            return;
          }
        }
      }
  
  g.putDownTray = function(options) {
        if (g.trayRestSpotId || g.trayAtCashier) return;
        if (!g.trayFollowing) return;
        g.hideTrayActionMenu();
        g.trayFollowing = false;
        g.tray.classList.remove("following");
        g.returnCarrierToHomeDock("tray");
        g.tray.setAttribute(
          "aria-label",
          g.traysAtHome > 0 ? "Pick up tray from stack" : "Pick up tray"
        );
        if (options?.tutorialRewind !== false) {
          g.tutorialRewindOnCarrierPutDown("tray");
        }
        g.updateCarrierUI();
      }
  
  g.updateDirtyCarrierVisuals = function() {
        const plateAway = g.dishwasherLoad === "plate";
        const cupAway = g.dishwasherLoad === "cup";
        const potAway = g.dishwasherLoad === "pot";
        const bowlAway = g.dishwasherLoad === "bowl";
        const trayAway = g.dishwasherLoad === "tray";
        const plateShowDirty = g.plateDirty && !plateAway;
        const cupShowDirty = g.cupDirty && !cupAway;
        const potShowDirty = g.potDirty && !potAway;
        const bowlShowDirty = g.bowlDirty && !bowlAway;
        const trayShowDirty = g.trayDirty && !trayAway;
        g.plate.classList.toggle("dirty", plateShowDirty);
        g.cup.classList.toggle("dirty", cupShowDirty);
        g.pot.classList.toggle("dirty", potShowDirty);
        g.bowl.classList.toggle("dirty", bowlShowDirty);
        g.tray.classList.toggle("dirty", trayShowDirty);
        g.plateHome.classList.toggle("carrier-in-appliance", plateAway);
        g.cupHome.classList.toggle("carrier-in-appliance", cupAway);
        g.potHome.classList.toggle("carrier-in-appliance", potAway);
        g.bowlHome.classList.toggle("carrier-in-appliance", bowlAway);
        g.trayHome.classList.toggle("carrier-in-appliance", trayAway);
        g.plateHome.classList.toggle("dirty-carrier", plateShowDirty && !g.plateFollowing);
        g.cupHome.classList.toggle("dirty-carrier", cupShowDirty && !g.cupFollowing);
        g.potHome.classList.toggle("dirty-carrier", potShowDirty && !g.potFollowing);
        g.bowlHome.classList.toggle("dirty-carrier", bowlShowDirty && !g.bowlFollowing);
        g.trayHome.classList.toggle("dirty-carrier", trayShowDirty && !g.trayFollowing);
      }
  
  g.moveBasketWithCursor = function(clientX, clientY) {
        g.basket.style.left = clientX + 14 + "px";
        g.basket.style.top = clientY + 14 + "px";
      }
  
  g.movePlateWithCursor = function(clientX, clientY) {
        g.plate.style.left = clientX + 14 + "px";
        g.plate.style.top = clientY + 14 + "px";
      }
  
  g.moveCupWithCursor = function(clientX, clientY) {
        g.cup.style.left = clientX + 14 + "px";
        g.cup.style.top = clientY + 14 + "px";
      }
  
  g.movePotWithCursor = function(clientX, clientY) {
        g.pot.style.left = clientX + 14 + "px";
        g.pot.style.top = clientY + 14 + "px";
      }
  
  g.moveBowlWithCursor = function(clientX, clientY) {
        g.bowl.style.left = clientX + 14 + "px";
        g.bowl.style.top = clientY + 14 + "px";
      }
  
  g.putDownOtherCarriers = function(except) {
        const noRewind = { tutorialRewind: false };
        if (except !== "basket" && g.basketFollowing) g.putDownBasket(noRewind);
        if (except !== "plate" && g.plateFollowing) g.putDownPlate(noRewind);
        if (except !== "mop" && g.mopFollowing) g.putDownMop();
        if (except !== "cup" && g.cupFollowing) g.putDownCup(noRewind);
        if (except !== "pot" && g.potFollowing) g.putDownPot(noRewind);
        if (except !== "bowl" && g.bowlFollowing) g.putDownBowl(noRewind);
        if (except !== "tray" && g.trayFollowing) g.putDownTray(noRewind);
        g.putDownShakers(except);
      }
  
  g.pickUpBasket = function() {
        g.putDownOtherCarriers("basket");
        g.basketFollowing = true;
        g.basket.classList.add("following");
        g.basketHome.classList.add("is-empty");
        g.gardenRow.classList.add("basket-ready");
        g.basket.setAttribute("aria-label", "Basket — click again to put down, or click a plant");
        g.moveBasketWithCursor(
          g.basket.getBoundingClientRect().left,
          g.basket.getBoundingClientRect().top
        );
        g.updateCarrierUI();
        g.maybeAdvanceTutorialGuide({ type: "carrier", carrier: "basket", action: "pickup" });
      }
  
  g.putDownBasket = function(options) {
        g.basketFollowing = false;
        g.basket.classList.remove("following");
        g.basketHome.classList.remove("is-empty");
        g.gardenRow.classList.remove("basket-ready");
        g.basket.style.left = "";
        g.basket.style.top = "";
        g.basket.setAttribute("aria-label", "Pick up basket");
        if (options?.tutorialRewind !== false) {
          g.tutorialRewindOnCarrierPutDown("basket");
        }
        g.updateCarrierUI();
      }
  
  g.pickUpPlate = function() {
        if (g.dishwasherLoad === "plate") return;
        g.liftCarrierFromCounterIfNeeded("plate");
        g.putDownOtherCarriers("plate");
        g.plateFollowing = true;
        g.plate.classList.add("following");
        g.plateHome.classList.add("is-empty");
        if (g.plateDirty) {
          g.plate.setAttribute(
            "aria-label",
            "Dirty plate — click again to put down, or load in dishwasher"
          );
        } else {
          g.plate.setAttribute(
            "aria-label",
            g.plateContents
              ? g.needsPineappleChopForOven(g.plateContents)
                ? "Plate with washed pineapple — chop on cutting board before oven, or blender / sink / fridge / trash"
                : g.isRawMeat(g.plateContents)
                  ? g.isMeatSeasoned(g.plateContents)
                    ? "Plate with seasoned raw meat — cook in oven, or fridge / trash"
                    : g.plateContents.salted || g.plateContents.peppered
                      ? "Plate with raw meat — add salt and pepper on counter, or chop / oven, or fridge / trash"
                      : "Plate with raw meat — chop, blend for meat stew, season on counter, or cook in oven, or fridge / trash"
                : g.isMeatFood(g.plateContents) && g.plateContents.state === "cut"
                  ? g.isMeatSeasoned(g.plateContents)
                    ? "Plate with seasoned cut meat — cook in oven, or fridge / trash"
                    : "Plate with cut meat — season on counter or cook in oven, or fridge / trash"
                : g.isCookedChoppedMeat(g.plateContents)
                  ? "Plate with chopped cooked meat — combine with potato stew pot on counter, or fridge / trash"
                : g.isMeatWithTomato(g.plateContents)
                  ? "Plate with meat and tomato — combine with bread on counter, or fridge / trash"
                : g.isSteakSandwich(g.plateContents)
                  ? "Plate with steak sandwich — fridge / trash only"
                : g.isBakedFood(g.plateContents)
                  ? "Plate with " +
                    g.foodLabel(g.plateContents) +
                    " — fridge / trash only (already baked)"
                  : "Plate — click again to put down, or use sink / fridge / trash / cutting board / blender / oven"
              : "Plate — click again to put down, or take clean food from sink, or take baked food from oven"
          );
        }
        g.movePlateWithCursor(
          g.plate.getBoundingClientRect().left,
          g.plate.getBoundingClientRect().top
        );
        g.updateCarrierUI();
        g.maybeAdvanceTutorialGuide({ type: "carrier", carrier: "plate", action: "pickup" });
      }
  
  g.putDownPlate = function(options) {
        if (g.plateRestSpotId) return;
        g.plateFollowing = false;
        g.plate.classList.remove("following");
        g.returnCarrierToHomeDock("plate");
        g.plate.setAttribute("aria-label", "Pick up plate");
        if (options?.tutorialRewind !== false) {
          g.tutorialRewindOnCarrierPutDown("plate");
        }
        g.updateCarrierUI();
      }
  
  g.clearPlate = function() {
        g.plateContents = null;
        g.setFoodIcon(g.plateItem, "plate-item", null);
        g.plate.classList.remove("has-item", "plate-food");
        g.updateCarrierUI();
      }
  
  g.setPlateFood = function(food) {
        if (!g.isPlateFood(food) || g.plateDirty) return;
        g.plateContents = food;
        g.setFoodIcon(g.plateItem, "plate-item", food);
        g.plate.classList.add("has-item", "plate-food");
        g.updateCarrierUI();
      }
  
  g.pickUpCup = function() {
        if (g.dishwasherLoad === "cup") return;
        g.liftCarrierFromCounterIfNeeded("cup");
        g.putDownOtherCarriers("cup");
        g.cupFollowing = true;
        g.cup.classList.add("following");
        g.cupHome.classList.add("is-empty");
        if (g.cupDirty) {
          g.cup.setAttribute(
            "aria-label",
            "Dirty cup — click again to put down, or load in dishwasher"
          );
        } else {
          g.cup.setAttribute(
            "aria-label",
            g.cupContents
              ? "Cup — click again to put down, or use fridge / trash / blender"
              : "Cup — click again to put down, or fill from cooler or blender"
          );
        }
        g.moveCupWithCursor(
          g.cup.getBoundingClientRect().left,
          g.cup.getBoundingClientRect().top
        );
        g.updateCarrierUI();
        g.maybeAdvanceTutorialGuide({ type: "carrier", carrier: "cup", action: "pickup" });
      }
  
  g.putDownCup = function(options) {
        if (g.cupRestSpotId) return;
        g.cupFollowing = false;
        g.cup.classList.remove("following");
        g.returnCarrierToHomeDock("cup");
        g.cup.setAttribute("aria-label", "Pick up cup");
        if (options?.tutorialRewind !== false) {
          g.tutorialRewindOnCarrierPutDown("cup");
        }
        g.updateCarrierUI();
      }
  
  g.setCupDrink = function(drink) {
        if (!g.isCupDrink(drink) || g.cupDirty) return;
        g.cupContents = drink;
        g.cup.classList.add("has-item");
        g.clearCupDrinkClasses();
        g.cup.classList.add("drink-" + drink.drink);
        g.updateCarrierUI();
      }
  
  g.pickUpPot = function() {
        if (g.dishwasherLoad === "pot") return;
        g.liftCarrierFromCounterIfNeeded("pot");
        g.putDownOtherCarriers("pot");
        g.potFollowing = true;
        g.pot.classList.add("following");
        g.potHome.classList.add("is-empty");
        if (g.potDirty) {
          g.pot.setAttribute(
            "aria-label",
            "Dirty soup pot — click again to put down, or load in dishwasher"
          );
        } else {
          g.pot.setAttribute(
            "aria-label",
            g.potContents
              ? g.isPotSoupCold(g.potContents)
                ? g.isPotSoupReadyForMicrowave(g.potContents)
                  ? "Soup pot with seasoned cold " +
                    (g.SOUP_LABELS[g.potContents.soup] || g.potContents.soup).toLowerCase() +
                    " — microwave in Kitchen 2, or fridge / trash"
                  : g.isFinishedSoupPrep(g.potContents)
                    ? "Soup pot — Kitchen 1: salt + pepper on counter, then microwave"
                    : (g.potContents.soup === "potatoes" || g.potContents.soup === "tomatoes")
                      ? "Soup pot — add chopped veggies on counter, then salt + pepper, then microwave"
                      : "Soup pot with cold " +
                        (g.SOUP_LABELS[g.potContents.soup] || g.potContents.soup).toLowerCase() +
                        " — Kitchen 1: salt + pepper on counter first, then microwave"
                : "Soup pot — click again to put down, or use fridge / trash / blender"
              : "Soup pot — click again to put down, or scoop blended veggies"
          );
        }
        g.movePotWithCursor(g.pot.getBoundingClientRect().left, g.pot.getBoundingClientRect().top);
        g.updateCarrierUI();
        g.maybeAdvanceTutorialGuide({ type: "carrier", carrier: "pot", action: "pickup" });
      }
  
  g.putDownPot = function(options) {
        if (g.potRestSpotId) return;
        g.potFollowing = false;
        g.pot.classList.remove("following");
        g.returnCarrierToHomeDock("pot");
        g.pot.setAttribute("aria-label", "Pick up soup pot");
        if (options?.tutorialRewind !== false) {
          g.tutorialRewindOnCarrierPutDown("pot");
        }
        g.updateCarrierUI();
      }
  
  g.clearPot = function() {
        g.potContents = null;
        g.pot.classList.remove("has-item", "stew");
        g.clearPotSoupClasses();
        g.updateCarrierUI();
      }
  
  g.setPotSoup = function(soupItem) {
        if (!g.isPotSoup(soupItem) || g.potDirty) return;
        g.potContents = soupItem;
        g.pot.classList.add("has-item");
        g.clearPotSoupClasses();
        g.pot.classList.add("soup-" + soupItem.soup);
        g.pot.classList.toggle("stew", !!soupItem.stew);
        g.pot.classList.toggle("soup-cold", g.isPotSoupCold(soupItem));
        g.updateCarrierUI();
      }
  
  g.pickUpBowl = function() {
        if (g.dishwasherLoad === "bowl") return;
        g.liftCarrierFromCounterIfNeeded("bowl");
        g.putDownOtherCarriers("bowl");
        g.bowlFollowing = true;
        g.bowl.classList.add("following");
        g.bowlHome.classList.add("is-empty");
        if (g.bowlDirty) {
          g.bowl.setAttribute(
            "aria-label",
            "Dirty bowl — click again to put down, or load in dishwasher"
          );
        } else {
          g.bowl.setAttribute(
            "aria-label",
            g.bowlContents
              ? "Bowl with " + g.bowlLabel(g.bowlContents).toLowerCase() + " — click again to put down, or use fridge / trash"
              : "Bowl — click again to put down, or pour flour from blender"
          );
        }
        g.moveBowlWithCursor(g.bowl.getBoundingClientRect().left, g.bowl.getBoundingClientRect().top);
        g.updateCarrierUI();
        g.maybeAdvanceTutorialGuide({ type: "carrier", carrier: "bowl", action: "pickup" });
      }
  
  g.putDownBowl = function(options) {
        if (g.bowlRestSpotId) return;
        g.bowlFollowing = false;
        g.bowl.classList.remove("following");
        g.returnCarrierToHomeDock("bowl");
        g.bowl.setAttribute("aria-label", "Pick up bowl");
        if (options?.tutorialRewind !== false) {
          g.tutorialRewindOnCarrierPutDown("bowl");
        }
        g.updateCarrierUI();
      }
  
  g.setBowlItem = function(item) {
        if (item && !g.isBowlItem(item)) return;
        if (g.bowlDirty && item) return;
        g.bowlContents = item;
        if (!item) {
          g.clearBowl();
          return;
        }
        g.bowl.classList.add("has-item");
        g.syncBowlVisual();
        g.updateCarrierUI();
      }
  
  g.setBowlFlour = function(flourItem) {
        g.setBowlItem(flourItem);
      }
  
  g.clearBasket = function() {
        g.basketContents = null;
        g.setFoodIcon(g.basketItem, "basket-item", null);
        g.basket.classList.remove("has-item");
        g.updateCarrierUI();
      }
  
  g.setBasketFood = function(food) {
        if (!g.isBasketFood(food)) return;
        g.basketContents = food;
        g.setFoodIcon(g.basketItem, "basket-item", food);
        g.basket.classList.add("has-item");
        g.updateCarrierUI();
      }
  
  g.setBasketCrop = function(crop) {
        g.setBasketFood(g.makeFood(crop, "raw"));
        g.maybeAdvanceTutorialGuide({ type: "crop", crop });
      }
  
}

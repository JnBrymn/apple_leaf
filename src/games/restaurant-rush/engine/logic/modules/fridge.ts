// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attachFridge(g: GameRuntime) {
  g.canTakeBowlItemFromFridge = function() {
        if (g.basketContents || g.plateContents || g.cupContents || g.potContents || g.bowlContents) {
          return false;
        }
        if (g.bowlDirty || g.dishwasherLoad === "bowl") return false;
        return true;
      }
  
  g.getFridgeItemKind = function(item) {
        if (!item) return null;
        if (g.isBasketFood(item)) return "basket";
        if (g.isPlateFood(item)) return "plate";
        if (g.isCupDrink(item)) return "cup";
        if (g.isPotSoup(item)) return "pot";
        if (g.isBowlItem(item)) return "bowl";
        return null;
      }
  
      /** Can this shelf item be picked up? Only the matching carrier must be free. */
  g.canTakeItemFromFridge = function(item) {
        const kind = g.getFridgeItemKind(item);
        if (!kind) return false;
        if (kind === "basket") return !g.basketContents;
        if (kind === "plate") return !g.plateContents && !g.plateDirty;
        if (kind === "cup") return !g.cupContents && !g.cupDirty;
        if (kind === "pot") return !g.potContents && !g.potDirty;
        if (kind === "bowl") return g.canTakeBowlItemFromFridge();
        return false;
      }
  
  g.isFridgeShelfInteractive = function() {
        return (
          g.kitchenFridge.classList.contains("open") &&
          !g.kitchenFridge.classList.contains("closing")
        );
      }
  
  g.updateFridgeSlots = function() {
        const fridgeOpen = g.kitchenFridge.classList.contains("open");
        g.fridgeSlots.forEach((slot, i) => {
          const item = g.fridgeShelves[i];
          const heldBasket = g.basketContents && g.basketFollowing;
          const heldPlate = g.plateContents && g.plateFollowing;
          const heldCup = g.cupContents && g.cupFollowing;
          const heldPot = g.potContents && g.potFollowing;
          const heldBowl = g.bowlContents && g.bowlFollowing;
          const canDrop =
            fridgeOpen &&
            !item &&
            ((heldBasket && g.isBasketFood(g.basketContents)) ||
              (heldPlate && g.isPlateFood(g.plateContents) && !g.plateDirty) ||
              (heldCup && g.isCupDrink(g.cupContents) && !g.cupDirty) ||
              (heldPot && g.isPotSoup(g.potContents) && !g.potDirty) ||
              (heldBowl && g.isBowlItem(g.bowlContents) && !g.bowlDirty));
          const canTake = fridgeOpen && item && g.canTakeItemFromFridge(item);
          const blockedTake = fridgeOpen && item && !canTake;
          slot.classList.toggle("can-drop", canDrop);
          slot.classList.toggle("can-take", canTake);
          slot.classList.toggle("blocked-take", blockedTake);
          slot.classList.toggle("filled", !!item);
          slot.setAttribute(
            "aria-label",
            canTake
              ? "Take " + g.foodLabel(item) + " from shelf"
              : blockedTake
                ? "Can't take — " +
                  (g.basketContents && g.getFridgeItemKind(item) === "basket"
                    ? "basket already has food"
                    : "hands full or need a clean dish")
                : canDrop
                  ? "Put food on shelf"
                  : item
                    ? "Shelf with food"
                    : "Empty shelf"
          );
        });
      }
  
  g.placeOnShelf = function(index) {
        if (!g.isBasketFood(g.basketContents)) return;
        const slot = g.fridgeSlots[index];
        g.fridgeShelves[index] = { ...g.basketContents };
        g.setFoodIcon(slot.querySelector(".fridge-slot-item"), "fridge-slot-item", g.basketContents);
        slot.classList.add("filled");
        g.clearBasket();
      }
  
  g.takeFromShelf = function(index) {
        const item = g.fridgeShelves[index];
        if (!item || !g.canTakeItemFromFridge(item)) return;
        g.setBasketFood({ ...item });
        g.fridgeShelves[index] = null;
        g.setFoodIcon(g.fridgeSlots[index].querySelector(".fridge-slot-item"), "fridge-slot-item", null);
        g.fridgeSlots[index].classList.remove("filled");
        if (!g.basketFollowing) g.pickUpBasket();
        g.updateFridgeSlots();
      }
  
  g.placeOnShelfPlate = function(index) {
        if (!g.isPlateFood(g.plateContents)) return;
        const slot = g.fridgeSlots[index];
        g.fridgeShelves[index] = { ...g.plateContents };
        g.setFoodIcon(slot.querySelector(".fridge-slot-item"), "fridge-slot-item", g.plateContents);
        slot.classList.add("filled");
        g.clearPlate();
      }
  
  g.takeFromShelfPlate = function(index) {
        const item = g.fridgeShelves[index];
        if (!item || !g.canTakeItemFromFridge(item)) return;
        g.dockCarrierIfOnCounter("plate");
        if (g.plateDirty) {
          g.plateDirty = false;
          g.plate.classList.remove("dirty");
        }
        g.setPlateFood({ ...item });
        g.fridgeShelves[index] = null;
        g.setFoodIcon(g.fridgeSlots[index].querySelector(".fridge-slot-item"), "fridge-slot-item", null);
        g.fridgeSlots[index].classList.remove("filled");
        if (!g.plateFollowing) g.pickUpPlate();
        g.updateFridgeSlots();
      }
  
  g.placeOnShelfCup = function(index) {
        if (!g.isCupDrink(g.cupContents)) return;
        const slot = g.fridgeSlots[index];
        g.fridgeShelves[index] = { ...cupContents };
        g.setDrinkIcon(slot.querySelector(".fridge-slot-item"), "fridge-slot-item", g.cupContents);
        slot.classList.add("filled");
        g.clearCup();
      }
  
  g.takeFromShelfCup = function(index) {
        const item = g.fridgeShelves[index];
        if (!item || !g.canTakeItemFromFridge(item)) return;
        g.dockCarrierIfOnCounter("cup");
        if (g.cupDirty) {
          g.cupDirty = false;
          g.cup.classList.remove("dirty");
        }
        g.setCupDrink({ ...item });
        g.fridgeShelves[index] = null;
        g.setDrinkIcon(g.fridgeSlots[index].querySelector(".fridge-slot-item"), "fridge-slot-item", null);
        g.fridgeSlots[index].classList.remove("filled");
        if (!g.cupFollowing) g.pickUpCup();
        g.updateFridgeSlots();
      }
  
  g.placeOnShelfPot = function(index) {
        if (!g.isPotSoup(g.potContents)) return;
        const slot = g.fridgeSlots[index];
        g.fridgeShelves[index] = { ...potContents };
        g.setSoupIcon(slot.querySelector(".fridge-slot-item"), "fridge-slot-item", g.potContents);
        slot.classList.add("filled");
        g.clearPot();
      }
  
  g.takeFromShelfPot = function(index) {
        const item = g.fridgeShelves[index];
        if (!item || !g.canTakeItemFromFridge(item)) return;
        g.dockCarrierIfOnCounter("pot");
        if (g.potDirty) {
          g.potDirty = false;
          g.pot.classList.remove("dirty");
        }
        g.setPotSoup({ ...item });
        g.fridgeShelves[index] = null;
        g.setSoupIcon(g.fridgeSlots[index].querySelector(".fridge-slot-item"), "fridge-slot-item", null);
        g.fridgeSlots[index].classList.remove("filled");
        if (!g.potFollowing) g.pickUpPot();
        g.updateFridgeSlots();
      }
  
  g.placeOnShelfBowl = function(index) {
        if (!g.isBowlItem(g.bowlContents)) return;
        const slot = g.fridgeSlots[index];
        g.fridgeShelves[index] = { ...bowlContents };
        g.setBowlIcon(slot.querySelector(".fridge-slot-item"), "fridge-slot-item", g.bowlContents);
        slot.classList.add("filled");
        g.clearBowl();
      }
  
  g.takeFromShelfBowl = function(index) {
        const item = g.fridgeShelves[index];
        if (!item || !g.isBowlItem(item) || !g.canTakeBowlItemFromFridge()) return;
  
        g.dockCarrierIfOnCounter("bowl");
  
        g.setBowlItem({ ...item });
        if (!g.bowlContents) return;
  
        g.fridgeShelves[index] = null;
        g.setBowlIcon(g.fridgeSlots[index].querySelector(".fridge-slot-item"), "fridge-slot-item", null);
        g.fridgeSlots[index].classList.remove("filled");
  
        if (!g.bowlFollowing) g.pickUpBowl();
        g.updateFridgeSlots();
      }
  
  g.handleFridgeShelfClick = function(index, e) {
        if (!g.isFridgeShelfInteractive()) return false;
        const slot = g.fridgeSlots[index];
        const item = g.fridgeShelves[index];
        if (item && g.canTakeItemFromFridge(item)) {
          e.stopPropagation();
          const kind = g.getFridgeItemKind(item);
          if (kind === "basket") g.takeFromShelf(index);
          else if (kind === "plate") g.takeFromShelfPlate(index);
          else if (kind === "cup") g.takeFromShelfCup(index);
          else if (kind === "pot") g.takeFromShelfPot(index);
          else if (kind === "bowl") g.takeFromShelfBowl(index);
          return true;
        }
        if (!item && slot.classList.contains("can-drop")) {
          e.stopPropagation();
          if (g.basketFollowing && g.basketContents && g.isBasketFood(g.basketContents)) {
            g.placeOnShelf(index);
          } else if (g.plateFollowing && g.plateContents && g.isPlateFood(g.plateContents)) {
            g.placeOnShelfPlate(index);
          } else if (g.cupFollowing && g.cupContents && g.isCupDrink(g.cupContents)) {
            g.placeOnShelfCup(index);
          } else if (g.potFollowing && g.potContents && g.isPotSoup(g.potContents)) {
            g.placeOnShelfPot(index);
          } else if (g.bowlFollowing && g.bowlContents && g.isBowlItem(g.bowlContents)) {
            g.placeOnShelfBowl(index);
          }
          return true;
        }
        return false;
      }
  
  g.fridgeIsAnimating = function() {
        return (
          g.kitchenFridge.classList.contains("opening") ||
          g.kitchenFridge.classList.contains("closing")
        );
      }
  
  g.closeFridge = function() {
        if (!g.kitchenFridge.classList.contains("open") || g.fridgeIsAnimating()) return;
        g.kitchenFridge.classList.add("closing");
        g.kitchenFridge.classList.remove("open");
        g.updateFridgeSlots();
        g.kitchenFridge.setAttribute("aria-label", "Open refrigerator");
        setTimeout(() => {
          g.kitchenFridge.classList.remove("closing");
        }, g.FRIDGE_ANIM_MS);
        g.updateCarrierUI();
      }
  
  g.openFridge = function() {
        if (g.kitchenFridge.classList.contains("open") || g.fridgeIsAnimating()) return;
        g.kitchenFridge.classList.add("opening", "open");
        g.updateFridgeSlots();
        g.kitchenFridge.setAttribute("aria-label", "Close refrigerator");
        setTimeout(() => {
          g.kitchenFridge.classList.remove("opening");
        }, g.FRIDGE_ANIM_MS);
        g.updateCarrierUI();
      }
  
  g.closeFridgeInstant = function() {
        if (
          !g.kitchenFridge.classList.contains("open") &&
          !g.kitchenFridge.classList.contains("opening") &&
          !g.kitchenFridge.classList.contains("closing")
        ) {
          return;
        }
        g.kitchenFridge.classList.remove("open", "opening", "closing");
        g.kitchenFridge.setAttribute("aria-label", "Open refrigerator");
        g.updateFridgeSlots();
      }
  
}

// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attachWireEvents(g: GameRuntime) {
  
      g.basket.addEventListener("click", (e) => {
        e.stopPropagation();
        if (g.basketFollowing) {
          g.putDownBasket();
        } else {
          g.pickUpBasket();
        }
      });
  
      g.plate.addEventListener("click", (e) => {
        e.stopPropagation();
        if (g.tryCombineOnCounterCarrier("plate")) return;
        if (g.trySeasonOnCounterCarrier("plate")) return;
        if (g.plateRestSpotId || !g.plateFollowing) {
          g.pickUpPlate();
        }
      });
  
      if (g.mop) {
        g.mop.addEventListener("click", (e) => {
          e.stopPropagation();
          if (!g.isScreen6Active()) return;
          if (!g.mopFollowing) g.pickUpMop();
        });
      }
  
      if (g.mopHome) {
        g.mopHome.addEventListener("click", (e) => {
          if (!g.mopFollowing) return;
          if (e.target.closest("#mop")) return;
          g.putDownMop();
        });
      }
  
      g.root.addEventListener("click", (e) => {
        const puddle = e.target.closest(".mud-puddle");
        if (!puddle) return;
        if (g.tryCleanMudPuddle(puddle)) e.stopPropagation();
      });
  
      g.cup.addEventListener("click", (e) => {
        e.stopPropagation();
        if (g.tryCombineOnCounterCarrier("cup")) return;
        if (g.trySeasonOnCounterCarrier("cup")) return;
        if (g.cupRestSpotId || !g.cupFollowing) {
          g.pickUpCup();
        }
      });
  
      g.pot.addEventListener("click", (e) => {
        e.stopPropagation();
        if (g.tryCombineOnCounterCarrier("pot")) return;
        if (g.trySeasonOnCounterCarrier("pot")) return;
        if (g.potRestSpotId || !g.potFollowing) {
          g.pickUpPot();
        }
      });
  
      g.bowl.addEventListener("click", (e) => {
        e.stopPropagation();
        if (g.tryCombineOnCounterCarrier("bowl")) return;
        if (g.trySeasonOnCounterCarrier("bowl")) return;
        if (g.bowlRestSpotId || !g.bowlFollowing) {
          g.pickUpBowl();
        }
      });
  
      g.tray.addEventListener("click", (e) => {
        e.stopPropagation();
        if (performance.now() < g.suppressTrayClickUntil) return;
        if (g.isTrayCloseupOpen()) return;
        if (g.isTrayOnCounter()) {
          if (g.trayActionMenu.classList.contains("open")) {
            g.hideTrayActionMenu();
          } else {
            g.showTrayActionMenu();
          }
          return;
        }
        if (!g.trayFollowing) {
          g.pickUpTray();
        }
      });
  
      g.trayHome.addEventListener("click", (e) => {
        if (e.target.closest("#tray")) return;
        if (g.trayFollowing) {
          g.putDownTray();
          return;
        }
        if (g.isTrayOnHomeDock()) {
          g.pickUpTray();
        }
      });
  
      if (g.cafeteriaCartPickup) {
        g.cafeteriaCartPickup.addEventListener("click", (e) => {
          e.stopPropagation();
          if (g.cafeteriaCartPickup.classList.contains("can-pickup")) {
            g.pickUpDirtyTrayFromCart();
          }
        });
      }
  
      g.trayMenuPickUp.addEventListener("click", (e) => {
        e.stopPropagation();
        g.pickUpTray();
      });
  
      g.trayMenuPlaceFood.addEventListener("pointerdown", g.handleTrayPlaceFood, true);
      g.trayMenuPlaceFood.addEventListener("click", g.handleTrayPlaceFood, true);
  
      g.trayCloseupDone.addEventListener("click", (e) => {
        e.stopPropagation();
        g.closeTrayCloseup();
      });
  
      g.trayCloseup.addEventListener("click", (e) => {
        if (e.target === g.trayCloseup) {
          g.closeTrayCloseup();
          return;
        }
        e.stopPropagation();
      });
  
  g.onRecipeEscape = (e) => {
        if (e.key !== "Escape") return;
        if (g.isTrayCloseupOpen()) {
          g.closeTrayCloseup();
          return;
        }
        if (g.trayActionMenu.classList.contains("open")) {
          g.hideTrayActionMenu();
          return;
        }
        const book = g.getEl("recipeBook");
        const bookToggle = g.getEl("recipeBookToggle");
        if (book && book.classList.contains("open")) {
          book.classList.remove("open");
          if (bookToggle) bookToggle.setAttribute("aria-expanded", "false");
          if (typeof g.showRecipeList === "function") g.showRecipeList();
          return;
        }
        if (g.cashierSequenceBusy) {
          g.setCashierBusy(false);
        }
      };
      window.addEventListener("keydown", g.onRecipeEscape);
  
      g.root.addEventListener("click", (e) => {
        if (!g.trayActionMenu || !g.trayActionMenu.classList.contains("open")) return;
        if (
          e.target.closest("#trayActionMenu") ||
          e.target.closest("#trayMenuPlaceFood") ||
          e.target.closest("#trayMenuPickUp") ||
          e.target.closest("#tray") ||
          e.target.closest("#trayCloseup")
        ) {
          return;
        }
        g.hideTrayActionMenu();
      });
  
      g.basketHome.addEventListener("click", (e) => {
        if (!g.basketFollowing) return;
        if (e.target.closest("#basket")) return;
        g.putDownBasket();
      });
  
      g.plateHome.addEventListener("click", (e) => {
        if (!g.plateFollowing) return;
        if (e.target.closest("#plate")) return;
        g.putDownPlate();
      });
  
      g.cupHome.addEventListener("click", (e) => {
        if (!g.cupFollowing) return;
        if (e.target.closest("#cup")) return;
        g.putDownCup();
      });
  
      g.potHome.addEventListener("click", (e) => {
        if (!g.potFollowing) return;
        if (e.target.closest("#pot")) return;
        g.putDownPot();
      });
  
      g.bowlHome.addEventListener("click", (e) => {
        if (!g.bowlFollowing) return;
        if (e.target.closest("#bowl")) return;
        g.putDownBowl();
      });
  
      g.saltShaker.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!g.isScreen2Active()) return;
        if (g.saltFollowing) {
          g.returnSaltShaker();
        } else {
          g.pickUpSalt();
        }
      });

      g.pepperShaker.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!g.isScreen2Active()) return;
        if (g.pepperFollowing) {
          g.returnPepperShaker();
        } else {
          g.pickUpPepper();
        }
      });
  
      g.saltShakerDock.addEventListener("click", (e) => {
        if (!g.isScreen2Active() || !g.saltFollowing) return;
        if (e.target.closest("#saltShaker")) return;
        g.returnSaltShaker();
      });
  
      g.pepperShakerDock.addEventListener("click", (e) => {
        if (!g.isScreen2Active() || !g.pepperFollowing) return;
        if (e.target.closest("#pepperShaker")) return;
        g.returnPepperShaker();
      });
  
      g.root.addEventListener("mousemove", (e) => {
        if (g.basketFollowing) g.moveBasketWithCursor(e.clientX, e.clientY);
        if (g.plateFollowing) g.movePlateWithCursor(e.clientX, e.clientY);
        if (g.mopFollowing) g.moveMopWithCursor(e.clientX, e.clientY);
        if (g.cupFollowing) g.moveCupWithCursor(e.clientX, e.clientY);
        if (g.potFollowing) g.movePotWithCursor(e.clientX, e.clientY);
        if (g.bowlFollowing) g.moveBowlWithCursor(e.clientX, e.clientY);
        if (g.trayFollowing) g.moveTrayWithCursor(e.clientX, e.clientY);
        if (g.saltFollowing && g.isScreen2Active()) g.moveShakerWithCursor(g.saltShaker, e.clientX, e.clientY);
        if (g.pepperFollowing && g.isScreen2Active()) g.moveShakerWithCursor(g.pepperShaker, e.clientX, e.clientY);
      });
  
      g.kitchenSink.addEventListener("click", (e) => {
        e.stopPropagation();
        if (g.kitchenSink.classList.contains("washing")) return;
        if (g.kitchenSink.classList.contains("can-drop")) {
          g.placeInSink();
        } else if (g.kitchenSink.classList.contains("can-take-plate")) {
          g.takeFromSink();
        }
      });
  
      g.meatBox.addEventListener("click", (e) => {
        e.stopPropagation();
        if (g.meatBox.classList.contains("can-take-plate")) {
          g.takeFromMeatBox();
        }
      });
  
      g.kitchenCuttingBoard.addEventListener("click", (e) => {
        e.stopPropagation();
        if (g.kitchenCuttingBoard.classList.contains("can-cut")) {
          g.placeOnCuttingBoard();
        }
      });
  
      g.kitchenBlender.addEventListener("click", (e) => {
        e.stopPropagation();
        if (g.kitchenBlender.classList.contains("can-drop-food")) {
          g.placeInBlender();
        } else if (g.kitchenBlender.classList.contains("can-fill-cup")) {
          g.takeJuiceFromBlender();
        } else if (g.kitchenBlender.classList.contains("can-fill-pot")) {
          g.takeSoupFromBlender();
        } else if (g.kitchenBlender.classList.contains("can-fill-bowl")) {
          g.takeFlourFromBlender();
        }
      });
  
      g.plants.forEach((plant) => {
        plant.addEventListener("click", (e) => {
          if (!g.basketFollowing || g.basketContents) return;
          e.stopPropagation();
          g.setBasketCrop(plant.dataset.crop);
        });
      });
  
      g.coolerDrinks.forEach((drinkEl) => {
        drinkEl.addEventListener("click", (e) => {
          e.stopPropagation();
          if (drinkEl.classList.contains("can-fill")) {
            g.fillCupFromCooler(drinkEl);
          }
        });
      });
  
      g.fridgeSlots.forEach((slot) => {
        slot.addEventListener("click", (e) => {
          g.handleFridgeShelfClick(Number(slot.dataset.shelf), e);
        });
      });
  
      g.kitchenTrashCans.forEach((trash) => {
        trash.addEventListener("click", (e) => {
          e.stopPropagation();
          g.throwAwayFood(trash);
        });
      });
  
      g.root.querySelectorAll(".counter-rest-spot").forEach((spot) => {
        spot.addEventListener("click", (e) => {
          e.stopPropagation();
          if (g.trySeasonCounterSpot(spot)) return;
          if (spot.classList.contains("can-combine") || spot.classList.contains("can-place")) {
            g.tryPlaceOnCounterSpot(spot);
          }
        });
      });
  
      window.addEventListener("resize", () => {
        g.updateCounterRestSpots();
      });
  
      window.addEventListener("pageshow", g.releaseStuckUI);
  
      g.kitchenFridge.addEventListener("click", (e) => {
        e.stopPropagation();
        if (e.target.closest(".fridge-slot")) return;
        if (g.fridgeIsAnimating()) return;
  
        const isOpen = g.kitchenFridge.classList.contains("open");
        const doorHit = e.target.closest(".fridge-door");
  
        if (isOpen && doorHit) {
          g.closeFridge();
          return;
        }
  
        if (!isOpen) {
          g.openFridge();
        }
      });
  
      g.kitchenFridge.addEventListener("keydown", (e) => {
        if (e.target.closest(".fridge-slot")) return;
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        if (g.fridgeIsAnimating()) return;
  
        if (g.kitchenFridge.classList.contains("open")) {
          g.closeFridge();
        } else {
          g.openFridge();
        }
      });
  
      g.bindApplianceInteraction(kitchenDishwasher, {
        closed: "Open dishwasher",
        open: "Close dishwasher",
      }, {
        doorSelector: ".dishwasher-door",
        tutorialGuide: "dishwasher",
        isBlocked: () => g.kitchenDishwasher.classList.contains("washing"),
        canOpen: () => !g.kitchenDishwasher.classList.contains("washing"),
        tryUse: () => {
          if (g.kitchenDishwasher.classList.contains("can-drop-dish")) {
            g.placeInDishwasher();
            return true;
          }
          return false;
        },
      });
  
      g.bindApplianceInteraction(kitchenMicrowave, {
        closed: "Open microwave",
        open: "Close microwave",
      }, {
        doorSelector: ".microwave-door",
        tutorialGuide: "microwave",
        canClose: () => !g.microwaveHasContents(),
        tryUse: () => {
          if (g.kitchenMicrowave.classList.contains("can-drop")) {
            g.placeInMicrowave();
            return true;
          }
          if (g.kitchenMicrowave.classList.contains("can-take")) {
            g.takeFromMicrowave();
            return true;
          }
          return false;
        },
      });
  
      g.bindApplianceInteraction(kitchenOven, {
        closed: "Open oven",
        open: "Close oven",
      }, {
        doorSelector: ".oven-door",
        tutorialGuide: "oven",
        canClose: () => !g.ovenHasContents(),
        tryUse: () => {
          if (g.kitchenOven.classList.contains("can-drop")) {
            g.placeInOven();
            return true;
          }
          if (g.kitchenOven.classList.contains("can-take")) {
            g.takeFromOven();
            return true;
          }
          return false;
        },
      });
  
      g.bindApplianceInteraction(kitchenCooler, {
        closed: "Open cooler",
        open: "Close cooler",
      }, {
        doorSelector: ".cooler-door",
        ignoreSelector: ".cooler-drink",
        tutorialGuide: "cooler",
        tryUse: () => false,
      });
  
      g.root.querySelectorAll(".nav-arrow[data-go]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const dest = Number(btn.dataset.go);
          g.handleTutorialNavPress(btn, dest);
          g.navigateToScreen(dest);
        });
      });
  
      if (g.startBtn) {
        g.startBtn.addEventListener("click", g.beginGame);
      }
  
      if (g.restaurantNameInput) {
        g.restaurantNameInput.addEventListener("input", () => {
          const el = g.restaurantNameInput;
          const pos = el.selectionStart;
          const before = el.value;
          const formatted = g.formatRestaurantName(before);
          if (formatted !== before) {
            el.value = formatted;
            const newPos = Math.min(pos, formatted.length);
            el.setSelectionRange(newPos, newPos);
          }
          g.updateNameContinueBtn();
        });
        g.restaurantNameInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && g.nameContinueBtn && !g.nameContinueBtn.disabled) {
            e.preventDefault();
            g.finishNaming();
          }
        });
      }
  
      if (g.nameContinueBtn) {
        g.nameContinueBtn.addEventListener("click", g.finishNaming);
      }
  
      if (g.startNewGameBtn) {
        g.startNewGameBtn.addEventListener("click", g.startNewGame);
      }
  
      if (g.tutorialBtn) {
        g.tutorialBtn.addEventListener("click", g.startTutorial);
      }
  
      if (g.cashierTraySpot) {
        g.cashierTraySpot.addEventListener("click", (e) => {
          e.stopPropagation();
          g.handleCashierTraySpotClick();
        });
      }
  
      g.RECIPE_BOOK.forEach((recipe) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "recipe-list-item";
        btn.textContent = recipe.name;
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          g.showRecipeDetail(recipe);
        });
        g.recipeList.appendChild(btn);
      });
  
      g.recipeBookToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = g.recipeBook.classList.toggle("open");
        g.recipeBookToggle.setAttribute("aria-expanded", open ? "true" : "false");
        if (!open) g.showRecipeList();
      });

      g.recipeBack.addEventListener("click", (e) => {
        e.stopPropagation();
        g.showRecipeList();
      });

      g.recipeBook.addEventListener("click", (e) => {
        e.stopPropagation();
      });

}

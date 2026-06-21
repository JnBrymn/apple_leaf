// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attachCounter(g: GameRuntime) {
  g.getCounterSpotPadCenter = function(spotEl) {
        const r = spotEl.getBoundingClientRect();
        return {
          x: r.left + r.width / 2,
          y: r.bottom - 9,
        };
      }
  
  g.carrierNeedsCounterReposition = function(carrier, spotEl) {
        const el = g.getCarrierEl(carrier);
        if (!el || !spotEl || !el.classList.contains("on-counter") || el.style.position !== "fixed") {
          return true;
        }
        const pad = g.getCounterSpotPadCenter(spotEl);
        const expectedLeft = pad.x - el.offsetWidth / 2;
        const expectedTop = pad.y - el.offsetHeight / 2;
        const left = parseFloat(el.style.left);
        const top = parseFloat(el.style.top);
        if (Number.isNaN(left) || Number.isNaN(top)) return true;
        const drift = 3;
        return Math.abs(left - expectedLeft) > drift || Math.abs(top - expectedTop) > drift;
      }
  
  g.positionCarrierOnCounterSpot = function(carrier, spotEl) {
        const el = g.getCarrierEl(carrier);
        if (!el || !spotEl) return;
        if (!g.carrierNeedsCounterReposition(carrier, spotEl)) return;
        const pad = g.getCounterSpotPadCenter(spotEl);
        el.classList.add("on-counter");
        el.style.position = "fixed";
        el.style.left = pad.x - el.offsetWidth / 2 + "px";
        el.style.top = pad.y - el.offsetHeight / 2 + "px";
        el.style.transform = "scale(0.78)";
      }
  
  g.getFollowingRestCarrier = function() {
        if (g.plateFollowing && !g.plateRestSpotId) return "plate";
        if (g.cupFollowing && !g.cupRestSpotId) return "cup";
        if (g.potFollowing && !g.potRestSpotId) return "pot";
        if (g.bowlFollowing && !g.bowlRestSpotId) return "bowl";
        if (g.trayFollowing && !g.trayRestSpotId) return "tray";
        return null;
      }
  
  g.syncCounterRestForActiveScreen = function() {
        const active = g.root.querySelector(".screen.active");
        ["plate", "cup", "pot", "bowl", "tray"].forEach((carrier) => {
          const el = g.getCarrierEl(carrier);
          const spotId = g.getCarrierRestSpotId(carrier);
          if (!spotId || g.isCarrierFollowing(carrier) || g.dishwasherLoad === carrier) {
            el.classList.remove("counter-rest-away");
            if (!spotId && el.classList.contains("on-counter")) {
              g.returnCarrierToHomeDock(carrier);
            }
            return;
          }
          const spotEl = g.getCounterSpotInActiveScreen(spotId);
          if (spotEl) {
            el.classList.remove("counter-rest-away");
            g.positionCarrierOnCounterSpot(carrier, spotEl);
          } else {
            el.classList.add("counter-rest-away");
          }
        });
      }
  
  g.updateCounterRestSpots = function() {
        const canPlace = g.getFollowingRestCarrier();
        const activeShaker = g.getActiveShaker();
        g.root.querySelectorAll(".counter-rest-spot").forEach((spot) => {
          const spotId = spot.dataset.spot;
          const occupied = g.counterSpotOccupants.has(spotId);
          const canCombine = g.canCounterCombineAtSpot(spotId);
          const onCarrier = occupied ? g.counterSpotOccupants.get(spotId) : null;
          const canSeason =
            !!activeShaker &&
            g.isScreen2Active() &&
            spotId.startsWith("s2-") &&
            occupied &&
            g.canApplySeasoning(onCarrier, g.getCarrierPayload(onCarrier), activeShaker);
          spot.classList.toggle("occupied", occupied);
          spot.classList.toggle("can-place", !!canPlace && !occupied);
          spot.classList.toggle("can-combine", canCombine);
          spot.classList.toggle("can-season", canSeason);
          spot.setAttribute(
            "aria-label",
            canSeason
              ? "Shake " + activeShaker + " on food here"
              : canCombine
                ? "Combine items here"
                : occupied
                  ? "Counter spot (in use)"
                  : canPlace
                    ? "Set item on counter"
                    : "Counter spot"
          );
        });
        g.syncCounterRestForActiveScreen();
      }
  
  g.tryCombineOnCounterCarrier = function(counterCarrier) {
        const spotId = g.getCarrierRestSpotId(counterCarrier);
        if (!spotId || !g.getFollowingRestCarrier()) return false;
        if (!g.canCounterCombineAtSpot(spotId)) return false;
        const spotEl = g.getCounterSpotInActiveScreen(spotId);
        if (!spotEl) return false;
        return g.tryCounterCombine(spotEl);
      }
  
  g.tryCounterCombine = function(spotEl) {
        const incoming = g.getFollowingRestCarrier();
        if (!incoming) return false;
  
        const spotId = spotEl.dataset.spot;
        let onCarrier = g.counterSpotOccupants.get(spotId);
        let withCarrier = incoming;
        if (!onCarrier) return false;
  
        let onPayload = g.getCarrierPayload(onCarrier);
        let withPayload = g.getCarrierPayload(withCarrier);
        if (!onPayload || !withPayload) return false;
        if (g.getCarrierDirty(onCarrier) || g.getCarrierDirty(withCarrier)) return false;
  
        let recipe = g.findCounterRecipe(onCarrier, onPayload, withCarrier, withPayload);
        if (!recipe) {
          recipe = g.findCounterRecipe(withCarrier, withPayload, onCarrier, onPayload);
          if (!recipe) return false;
          const swap = onCarrier;
          onCarrier = withCarrier;
          withCarrier = swap;
          onPayload = g.getCarrierPayload(onCarrier);
          withPayload = g.getCarrierPayload(withCarrier);
        }
  
        const resultCarrier = g.recipeResultCarrier(recipe, onCarrier, withCarrier);
        const otherCarrier = resultCarrier === onCarrier ? withCarrier : onCarrier;
        const prevOnSpot = g.counterSpotOccupants.get(spotId);
        const resultStaysOnSpot =
          resultCarrier === prevOnSpot &&
          g.getCarrierRestSpotId(resultCarrier) === spotId &&
          g.getCarrierEl(resultCarrier).classList.contains("on-counter");
  
        g.applyCarrierPayload(resultCarrier, recipe.result(onPayload, withPayload));
        g.clearCarrierPayload(otherCarrier);
  
        let shouldDirty = true;
        if (otherCarrier === onCarrier && recipe.dirtyOn === false) shouldDirty = false;
        if (otherCarrier === withCarrier && recipe.dirtyWith === false) shouldDirty = false;
        if (shouldDirty) g.setCarrierDirty(otherCarrier, true);
  
        g.stopCarrierFollowing(incoming);
  
        if (prevOnSpot && prevOnSpot !== resultCarrier) {
          g.setCarrierRestSpotId(prevOnSpot, null);
        }
        g.counterSpotOccupants.set(spotId, resultCarrier);
        g.setCarrierRestSpotId(resultCarrier, spotId);
  
        g.returnCarrierToHomeDock(otherCarrier);
  
        const resultEl = g.getCarrierEl(resultCarrier);
        resultEl.classList.remove("following");
        g.getCarrierHome(resultCarrier).classList.add("is-empty");
        resultEl.setAttribute("aria-label", "Pick up from counter");
        if (!resultStaysOnSpot) {
          g.positionCarrierOnCounterSpot(resultCarrier, spotEl);
        }
  
        g.flashCounterCombo(spotEl);
        g.updateCarrierUI();
        g.maybeAdvanceTutorialGuide({ type: "counter-combine" });
        return true;
      }
  
  g.restCarrierOnSpot = function(carrier, spotEl) {
        const spotId = spotEl.dataset.spot;
        if (g.counterSpotOccupants.has(spotId)) return;
        if (!g.isCarrierFollowing(carrier)) return;
  
        g.clearCarrierRestSpot(carrier);
        g.counterSpotOccupants.set(spotId, carrier);
        g.setCarrierRestSpotId(carrier, spotId);
  
        const el = g.getCarrierEl(carrier);
        const home = g.getCarrierHome(carrier);
        el.classList.remove("following");
        if (carrier === "plate") g.plateFollowing = false;
        else if (carrier === "cup") g.cupFollowing = false;
        else if (carrier === "pot") g.potFollowing = false;
        else if (carrier === "bowl") g.bowlFollowing = false;
        else if (carrier === "tray") g.trayFollowing = false;
  
        g.positionCarrierOnCounterSpot(carrier, spotEl);
        home.classList.add("is-empty");
        el.setAttribute(
          "aria-label",
          carrier === "tray"
            ? "Tray on counter — click for options"
            : "Pick up from counter"
        );
        requestAnimationFrame(() => {
          g.positionCarrierOnCounterSpot(carrier, spotEl);
          g.updateCarrierUI();
        });
        g.maybeAdvanceTutorialGuide({ type: "counter-place", carrier });
      }
  
  g.tryPlaceOnCounterSpot = function(spotEl) {
        const carrier = g.getFollowingRestCarrier();
        if (!carrier) {
          const onCarrier = g.counterSpotOccupants.get(spotEl.dataset.spot);
          if (onCarrier === "plate") g.pickUpPlate();
          else if (onCarrier === "cup") g.pickUpCup();
          else if (onCarrier === "pot") g.pickUpPot();
          else if (onCarrier === "bowl") g.pickUpBowl();
          else if (onCarrier === "tray") g.pickUpTray();
          return;
        }
        if (g.counterSpotOccupants.has(spotEl.dataset.spot)) {
          if (g.counterSpotOccupants.get(spotEl.dataset.spot) === "tray") return;
          g.tryCounterCombine(spotEl);
          return;
        }
        g.restCarrierOnSpot(carrier, spotEl);
      }
  
  g.liftCarrierFromCounterIfNeeded = function(carrier) {
        const spotId = g.getCarrierRestSpotId(carrier);
        if (!spotId) return false;
        g.clearCarrierRestSpot(carrier);
        const el = g.getCarrierEl(carrier);
        el.classList.remove("on-counter", "counter-rest-away");
        el.style.position = "";
        el.style.left = "";
        el.style.top = "";
        el.style.transform = "";
        return true;
      }
  
  g.dockCarrierIfOnCounter = function(carrier) {
        if (!g.getCarrierRestSpotId(carrier)) return;
        g.liftCarrierFromCounterIfNeeded(carrier);
        g.returnCarrierToHomeDock(carrier);
      }
  
  g.getCounterSpotInActiveScreen = function(spotId) {
        if (!spotId) return null;
        const active = g.root.querySelector(".screen.active");
        if (!active) return null;
        return active.querySelector('[data-spot="' + spotId + '"]');
      }
  
}

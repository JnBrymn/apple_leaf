// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attachSeasoning(g: GameRuntime) {
  g.getActiveShaker = function() {
        if (g.saltFollowing) return "salt";
        if (g.pepperFollowing) return "pepper";
        return null;
      }
  
  g.getSeasoningTargetKey = function(carrier, payload) {
        if (!payload) return null;
        if (carrier === "plate" && g.isFrenchFriesPrep(payload)) {
          return "plate:french-fries:prep";
        }
        if (carrier === "plate" && payload.crop && payload.state) {
          return "plate:" + payload.crop + ":" + payload.state;
        }
        if (carrier === "bowl") {
          if (payload.flour) return "bowl:flour";
          if (payload.dough) return "bowl:dough";
          if (payload.batter) return "bowl:batter";
          if (payload.mix) return "bowl:mix-" + payload.mix;
        }
        if (carrier === "pot" && payload.soup) {
          if (g.isPotatoMeatStewPrep(payload)) return "pot:meat-potato-soup-prep";
          if (g.isMeatStewPrep(payload)) return "pot:meat-stew-prep";
          if (g.isFinishedSoupPrep(payload)) {
            if (payload.soup === "potatoes" && payload.mix === "carrots") {
              return "pot:potato-soup-prep";
            }
            if (payload.soup === "tomatoes" && payload.mix === "tomatoes") {
              return "pot:tomato-soup-prep";
            }
          }
          if (payload.stew) return "pot:" + payload.soup + ":stew";
          if (payload.cold) return "pot:" + payload.soup + ":cold";
          return "pot:" + payload.soup + ":hot";
        }
        if (carrier === "cup" && payload.drink) return "cup:" + payload.drink;
        return null;
      }
  
  g.canApplySeasoning = function(carrier, payload, seasoning) {
        const key = g.getSeasoningTargetKey(carrier, payload);
        if (!key) return false;
        const rules = g.FOOD_SEASONING[key];
        if (!rules || !rules[seasoning]) return false;
        if (seasoning === "salt" && payload.salted) return false;
        if (seasoning === "pepper" && payload.peppered) return false;
        return true;
      }
  
  g.applySeasoningToCarrier = function(carrier, seasoning) {
        const payload = g.getCarrierPayload(carrier);
        if (!payload) return;
        if (
          carrier === "plate" &&
          g.isFrenchFriesPrep(payload) &&
          seasoning === "salt"
        ) {
          g.applyCarrierPayload(carrier, g.makeFrenchFries());
          g.updateCarrierUI();
          return;
        }
        const next = { ...payload };
        if (seasoning === "salt") next.salted = true;
        if (seasoning === "pepper") next.peppered = true;
        g.applyCarrierPayload(carrier, next);
        g.updateCarrierUI();
      }
  
  g.moveShakerWithCursor = function(shakerEl, clientX, clientY) {
        shakerEl.style.left = clientX + "px";
        shakerEl.style.top = clientY + "px";
      }
  
  g.returnSaltShaker = function() {
        if (!g.saltFollowing) return;
        g.saltFollowing = false;
        g.saltShaker.classList.remove("following");
        g.saltShaker.style.left = "";
        g.saltShaker.style.top = "";
        g.saltShakerDock.classList.remove("is-empty");
        g.saltShaker.setAttribute("aria-label", "Pick up salt");
        g.updateCounterRestSpots();
      }
  
  g.returnPepperShaker = function() {
        if (!g.pepperFollowing) return;
        g.pepperFollowing = false;
        g.pepperShaker.classList.remove("following");
        g.pepperShaker.style.left = "";
        g.pepperShaker.style.top = "";
        g.pepperShakerDock.classList.remove("is-empty");
        g.pepperShaker.setAttribute("aria-label", "Pick up pepper");
        g.updateCounterRestSpots();
      }
  
  g.putDownShakers = function(except) {
        if (except !== "salt" && g.saltFollowing) g.returnSaltShaker();
        if (except !== "pepper" && g.pepperFollowing) g.returnPepperShaker();
      }
  
  g.returnShakersIfNotOnScreen2 = function() {
        if (!g.isScreen2Active()) g.putDownShakers();
      }
  
  g.pickUpSalt = function() {
        if (!g.isScreen2Active() || g.saltFollowing) return;
        g.putDownShakers("salt");
        g.putDownOtherCarriers("salt");
        g.saltFollowing = true;
        g.saltShaker.classList.add("following");
        g.saltShakerDock.classList.add("is-empty");
        g.saltShaker.setAttribute("aria-label", "Salt — click dock to put down, or shake on counter food");
        g.moveShakerWithCursor(
          g.saltShaker,
          g.saltShaker.getBoundingClientRect().left,
          g.saltShaker.getBoundingClientRect().top
        );
        g.updateCounterRestSpots();
        g.maybeAdvanceTutorialGuide({ type: "shaker", which: "salt", action: "pickup" });
      }
  
  g.pickUpPepper = function() {
        if (!g.isScreen2Active() || g.pepperFollowing) return;
        g.putDownShakers("pepper");
        g.putDownOtherCarriers("pepper");
        g.pepperFollowing = true;
        g.pepperShaker.classList.add("following");
        g.pepperShakerDock.classList.add("is-empty");
        g.pepperShaker.setAttribute("aria-label", "Pepper — click dock to put down, or shake on counter food");
        g.moveShakerWithCursor(
          g.pepperShaker,
          g.pepperShaker.getBoundingClientRect().left,
          g.pepperShaker.getBoundingClientRect().top
        );
        g.updateCounterRestSpots();
        g.maybeAdvanceTutorialGuide({ type: "shaker", which: "pepper", action: "pickup" });
      }
  
  g.playShakerShake = function(shakerEl) {
        shakerEl.classList.remove("shaking");
        void shakerEl.offsetWidth;
        shakerEl.classList.add("shaking");
        setTimeout(() => shakerEl.classList.remove("shaking"), 800);
      }
  
  g.flashSeasoningOnCarrier = function(carrierEl, seasoning) {
        carrierEl.classList.remove("season-flash", "season-salt", "season-pepper");
        void carrierEl.offsetWidth;
        carrierEl.classList.add("season-flash", "season-" + seasoning);
        setTimeout(() => {
          carrierEl.classList.remove("season-flash", "season-salt", "season-pepper");
        }, 500);
      }
  
  g.trySeasonCounterSpot = function(spotEl) {
        const seasoning = g.getActiveShaker();
        if (!seasoning || !g.isScreen2Active()) return false;
        if (!spotEl.dataset.spot.startsWith("s2-")) return false;
        const carrier = g.counterSpotOccupants.get(spotEl.dataset.spot);
        if (!carrier) return false;
        const payload = g.getCarrierPayload(carrier);
        if (!g.canApplySeasoning(carrier, payload, seasoning)) return false;
        const shakerEl = seasoning === "salt" ? g.saltShaker : g.pepperShaker;
        const carrierEl = g.getCarrierEl(carrier);
        g.playShakerShake(shakerEl);
        g.flashSeasoningOnCarrier(carrierEl, seasoning);
        g.applySeasoningToCarrier(carrier, seasoning);
        g.maybeAdvanceTutorialGuide({ type: "season", seasoning });
        return true;
      }
  
  g.trySeasonOnCounterCarrier = function(counterCarrier) {
        const seasoning = g.getActiveShaker();
        if (!seasoning || !g.isScreen2Active()) return false;
        const spotId = g.getCarrierRestSpotId(counterCarrier);
        if (!spotId || !spotId.startsWith("s2-")) return false;
        const payload = g.getCarrierPayload(counterCarrier);
        if (!g.canApplySeasoning(counterCarrier, payload, seasoning)) return false;
        const spotEl = g.getCounterSpotInActiveScreen(spotId);
        if (!spotEl) return false;
        return g.trySeasonCounterSpot(spotEl);
      }
  
}

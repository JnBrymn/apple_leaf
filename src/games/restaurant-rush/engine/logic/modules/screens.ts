// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attachScreens(g: GameRuntime) {
  g.getScreenName = function(num) {
        return g.SCREEN_NAMES[num] || "Screen " + num;
      }
  
  g.applyScreenLabels = function() {
        g.root.querySelectorAll(".screen[data-screen]").forEach((section) => {
          const num = Number(section.dataset.screen);
          const name = g.getScreenName(num);
          section.querySelectorAll(".corner-num").forEach((el) => {
            el.textContent = name;
          });
        });
        g.root.querySelectorAll(".nav-arrow[data-go]").forEach((btn) => {
          const num = Number(btn.dataset.go);
          const name = g.getScreenName(num);
          btn.setAttribute("aria-label", "Go to " + name);
          const destEl = btn.querySelector(".dest");
          if (destEl) destEl.textContent = name;
        });
      }
  
  g.showScreen = function(num) {
        g.screens.forEach((s) => s.classList.remove("active"));
        const el = g.getEl("screen-" + num);
        if (el) el.classList.add("active");
        g.root.classList.toggle("on-storefront", num === 4);
        if (num === 4) g.putDownOtherCarriers("");
        if (g.mopFollowing) {
          const mopOk =
            g.isNighttime && (num === 2 || num === 3 || num === 6);
          if (!mopOk) g.putDownMop();
        }
        if (num === 6) {
          g.refreshCafeteriaDiners();
          g.updateCafeteriaCartUI();
        }
      }
  
  
  g.clearCafeteriaDiners = function() {
        g.root.querySelectorAll(".caf-diner-slot").forEach((slot) => {
          slot.innerHTML = "";
        });
      }
  
  g.refreshCafeteriaDiners = function() {
        if (g.isNighttime) {
          g.clearCafeteriaDiners();
          return;
        }
        g.root.querySelectorAll(".dinette-set").forEach((set) => {
          const leftSlot = set.querySelector(".caf-diner-slot--left");
          const rightSlot = set.querySelector(".caf-diner-slot--right");
          if (!leftSlot || !rightSlot) return;
          leftSlot.innerHTML = g.customerFigureMarkup(g.randomCafeteriaSeat());
          rightSlot.innerHTML = g.customerFigureMarkup(g.randomCafeteriaSeat());
        });
      }
  
  g.isScreen2Active = function() {
        const active = g.root.querySelector(".screen.active");
        return active === g.screen2;
      }
  
  g.isScreen4Active = function() {
        const active = g.root.querySelector(".screen.active");
        return active === g.screen4;
      }
  
  g.isScreen5Active = function() {
        const active = g.root.querySelector(".screen.active");
        return active === g.screen5;
      }
  
  g.isScreen6Active = function() {
        const active = g.root.querySelector(".screen.active");
        return active === g.screen6;
      }
  
  g.getActiveScreenNum = function() {
        const active = g.root.querySelector(".screen.active");
        return active ? Number(active.dataset.screen) : 5;
      }
  
  g.navigateToScreen = function(num, options) {
        const opts = options || {};
        const active = g.root.querySelector(".screen.active");
        if (active && Number(active.dataset.screen) !== num) {
          g.closeAllAppliancesInstant();
          g.releaseStuckUI();
        }
        g.showScreen(num);
        if (num === 5 && !opts.skipCashierSpawn) {
          g.ensureCashierCustomer();
        }
        g.updateCarrierUI();
        if (g.tutorialMode && g.tutorialGuideActive) {
          g.refreshTutorialGlow();
        }
      }
  
}

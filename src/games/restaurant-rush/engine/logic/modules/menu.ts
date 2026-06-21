// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attachMenu(g: GameRuntime) {
  g.updateStorefrontSign = function() {
        if (!g.storefrontSign) return;
        const name = g.restaurantName.trim();
        g.storefrontSign.textContent = name ? name + " Diner" : "";
      }
  
                  let namingFinishing = false;
  
  g.formatRestaurantName = function(value) {
        if (!value) return "";
        return value
          .slice(0, g.RESTAURANT_NAME_MAX)
          .toLowerCase()
          .replace(/(?:^|\s)\S/g, (ch) => ch.toUpperCase());
      }
  
  g.updateNameContinueBtn = function() {
        if (!g.nameContinueBtn || !g.restaurantNameInput) return;
        const hasName = g.restaurantNameInput.value.trim().length > 0;
        g.nameContinueBtn.disabled = !hasName;
      }
  
  g.showNameScreen = function() {
        if (!g.nameScreen) return;
        g.nameScreen.classList.remove("is-hidden", "is-fading-out");
        if (g.restaurantNameInput) {
          g.restaurantNameInput.disabled = false;
          g.restaurantNameInput.value = "";
          g.updateNameContinueBtn();
          g.restaurantNameInput.focus();
        }
      }
  
  g.showMenuScreen = function() {
        if (!g.menuScreen) return;
        g.menuScreen.classList.remove("is-hidden", "is-fading-out");
        g.menuScreen.classList.add("is-fading-in");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            g.menuScreen.classList.remove("is-fading-in");
          });
        });
      }
  
  g.beginGame = function() {
        if (g.introStarted) return;
        g.introStarted = true;
        g.startBtn.disabled = true;
        g.startFlash.classList.add("show");
        window.setTimeout(() => {
          g.startScreen.classList.add("is-hidden");
          g.showNameScreen();
          window.setTimeout(() => {
            g.startFlash.classList.remove("show");
          }, 200);
        }, g.START_WHITE_MS);
      }
  
  g.finishNaming = function() {
        if (
          namingFinishing ||
          !g.restaurantNameInput ||
          !g.nameContinueBtn ||
          g.nameContinueBtn.disabled
        ) {
          return;
        }
        g.restaurantName = g.formatRestaurantName(g.restaurantNameInput.value.trim());
        if (!g.restaurantName) return;
        g.updateStorefrontSign();
        namingFinishing = true;
        g.nameContinueBtn.disabled = true;
        g.restaurantNameInput.disabled = true;
        g.nameScreen.classList.add("is-fading-out");
        window.setTimeout(() => {
          g.nameScreen.classList.add("is-hidden");
          g.nameScreen.classList.remove("is-fading-out");
          namingFinishing = false;
          g.showMenuScreen();
        }, g.NAME_FADE_MS);
      }
  
  g.beginPlaySession = function(options) {
        const opts = options || {};
        if (g.gameStarted || !g.menuScreen) return;
        g.gameStarted = true;
        g.tutorialMode = !!opts.tutorial;
        g.tutorialCustomerIndex = 0;
        g.tutorialDishwashPhase = false;
        g.tutorialDishwashVariant = null;
        g.tutorialDishwashGaryPlayed = false;
        g.tutorialResumeOrderItem = null;
        g.tutorialDishwashQueue = false;
        g.ensureMudPuddleLayers();
        g.resetNightState();
        g.stopTutorialGuide();
        g.garyIntroComplete = !g.tutorialMode;
        if (g.startNewGameBtn) g.startNewGameBtn.disabled = true;
        if (g.tutorialBtn) g.tutorialBtn.disabled = true;
        g.root.classList.add("game-started");
        if (g.tutorialMode) {
          g.root.classList.add("tutorial-mode");
        } else {
          g.hideGaryBubble();
        }
        g.prepareCashierIntroHold();
        g.navigateToScreen(5, { skipCashierSpawn: true });
        g.menuScreen.classList.add("is-fading-out");
        window.setTimeout(() => {
          g.menuScreen.classList.add("is-hidden");
          g.menuScreen.classList.remove("is-fading-out");
          if (g.tutorialMode) {
            g.playGaryIntro().then(g.beginCustomerAfterIntro);
          } else {
            g.beginCustomerAfterIntro();
          }
        }, g.NAME_FADE_MS);
      }
  
  g.startNewGame = function() {
        g.beginPlaySession({ tutorial: false });
      }
  
}

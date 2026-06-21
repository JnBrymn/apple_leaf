// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attachCashier(g: GameRuntime) {
  g.showCashierToast = function(kind, message) {
        if (g.cashierToastTimer) {
          clearTimeout(g.cashierToastTimer);
          g.cashierToastTimer = null;
        }
        g.cashierToast.hidden = false;
        g.cashierToast.className = "cashier-toast " + kind;
        g.cashierToast.textContent = message;
        g.cashierToastTimer = setTimeout(() => {
          g.cashierToast.hidden = true;
          g.cashierToastTimer = null;
        }, kind === "success" ? 1600 : 2000);
      }
  
  g.renderCashierOrder = function() {
        if (!g.cashierOrderList) return;
        g.cashierOrderList.innerHTML = "";
        if (!g.cashierCurrentOrder || !g.cashierCurrentOrder.items) return;
        g.cashierCurrentOrder.items.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item.label;
          g.cashierOrderList.appendChild(li);
        });
      }
  
  g.pickRandomCashierCatalogItems = function(catalog, count) {
        const pool = catalog.slice();
        const picked = [];
        for (let n = 0; n < count && pool.length; n++) {
          const weights = pool.map(g.cashierCatalogItemWeight);
          const total = weights.reduce((sum, w) => sum + w, 0);
          let roll = Math.random() * total;
          let idx = 0;
          for (; idx < pool.length; idx++) {
            roll -= weights[idx];
            if (roll <= 0) break;
          }
          idx = Math.min(idx, pool.length - 1);
          picked.push({ ...pool[idx] });
          pool.splice(idx, 1);
        }
        return picked;
      }
  
  g.shuffleCashierOrderItems = function(items) {
        for (let i = items.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const tmp = items[i];
          items[i] = items[j];
          items[j] = tmp;
        }
        return items;
      }
  
  g.cashierOrderSignature = function(order) {
        return order.items
          .map((item) => item.kind + ":" + item.label)
          .sort()
          .join("|");
      }
  
  g.foodOrderNeedsKitchen2 = function(item) {
        if (!item || item.kind !== "food") return false;
        if (
          item.crop === "bread" ||
          item.crop === "steak-sandwich" ||
          item.crop === "french-fries"
        ) {
          return true;
        }
        if (item.state === "cut" || item.state === "baked") return true;
        if (item.crop === "meat") return true;
        return false;
      }
  
  g.pickCashierOrder = function() {
        if (g.tutorialMode) {
          const order = g.buildTutorialCashierOrder();
          g.cashierLastOrderSig = g.cashierOrderSignature(order);
          return {
            items: order.items.map((item) => ({ ...item })),
          };
        }
        for (let attempt = 0; attempt < 16; attempt++) {
          const order = g.buildCashierOrder();
          const sig = g.cashierOrderSignature(order);
          if (sig !== g.cashierLastOrderSig) {
            g.cashierLastOrderSig = sig;
            return {
              items: order.items.map((item) => ({ ...item })),
            };
          }
        }
        const order = g.buildCashierOrder();
        g.cashierLastOrderSig = g.cashierOrderSignature(order);
        return {
          items: order.items.map((item) => ({ ...item })),
        };
      }
  
  g.ensureCashierCustomer = function() {
        if (g.tutorialMode && !g.garyIntroComplete) return;
        if (g.garyCustomerEnterHeld) return;
        if (g.tutorialDishwashPhase || g.tutorialDishwashQueue) return;
        if (g.isNighttime) {
          g.prepareCashierIntroHold();
          return;
        }
        const listEmpty =
          !g.cashierOrderList || g.cashierOrderList.children.length === 0;
        if (
          !g.cashierCurrentOrder ||
          !g.cashierCurrentOrder.items?.length ||
          listEmpty
        ) {
          g.spawnCashierCustomer();
        } else {
          g.renderCashierOrder();
        }
      }
  
  g.applyCustomerLook = function() {
        if (!g.cashierCustomer) return;
        g.cashierCustomer.className = g.customerClassNames(g.randomCustomerLook());
      }
  
                      
  g.setCashierDoorsOpen = function(open) {
        if (!g.cashierGlassDoors) return;
        g.cashierGlassDoors.classList.toggle("doors-open", open);
      }
  
  g.waitMs = function(ms) {
        return new Promise((resolve) => window.setTimeout(resolve, ms));
      }
  
  g.waitCustomerAreaTransition = function(fallbackMs) {
        return new Promise((resolve) => {
          if (!g.cashierCustomerArea) {
            resolve();
            return;
          }
          let done = false;
          const finish = () => {
            if (done) return;
            done = true;
            g.cashierCustomerArea.removeEventListener("transitionend", onEnd);
            resolve();
          };
          const onEnd = (e) => {
            if (e.target !== g.cashierCustomerArea) return;
            if (e.propertyName !== "bottom" && e.propertyName !== "transform") {
              return;
            }
            finish();
          };
          g.cashierCustomerArea.addEventListener("transitionend", onEnd);
          window.setTimeout(finish, fallbackMs);
        });
      }
  
  g.setCustomerMotionState = function(state, options) {
        if (!g.cashierCustomerArea) return;
        const instant = options && options.instant;
        const motionClasses = [
          "is-at-counter",
          "is-behind-doors",
          "is-walking-to-counter",
        ];
        g.cashierCustomerArea.classList.remove(...motionClasses, "no-transition");
        if (instant) {
          g.cashierCustomerArea.classList.add("no-transition");
        }
        if (state) {
          g.cashierCustomerArea.classList.add(state);
        }
        if (instant) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              g.cashierCustomerArea.classList.remove("no-transition");
            });
          });
        }
      }
  
  g.resetCashierCustomerMotion = function() {
        g.setCustomerMotionState("is-at-counter", { instant: true });
      }
  
  g.prepareCashierCustomerBehindDoors = function() {
        g.cashierCurrentOrder = g.pickCashierOrder();
        g.applyCustomerLook();
        g.renderCashierOrder();
        if (g.cashierCustomerOrder) {
          g.cashierCustomerOrder.classList.add("order-hidden");
        }
        if (g.cashierCustomerArea) {
          g.cashierCustomerArea.classList.remove("is-exiting-right", "is-intro-waiting");
        }
        g.setCustomerMotionState("is-behind-doors", { instant: true });
        g.setCashierDoorsOpen(false);
      }
  
  g.prepareCashierIntroHold = function() {
        g.cashierCurrentOrder = null;
        if (g.cashierOrderList) g.cashierOrderList.innerHTML = "";
        g.clearCustomerCarryTray();
        g.setCashierDoorsOpen(false);
        g.setCashierBusy(false);
        if (g.cashierCustomerOrder) {
          g.cashierCustomerOrder.classList.add("order-hidden");
        }
        if (g.cashierCustomerArea) {
          g.cashierCustomerArea.classList.remove("is-exiting-right");
          g.cashierCustomerArea.classList.add("is-intro-waiting");
        }
        g.setCustomerMotionState("is-behind-doors", { instant: true });
      }
  
  g.runCashierCustomerEnterSequence = async function(alreadyBusy) {
        if (g.tutorialMode && !g.garyIntroComplete) return;
        if (g.tutorialDishwashPhase || g.tutorialDishwashQueue) return;
        if (g.isNighttime) return;
        await g.waitForGaryBeforeCustomerEnter();
        if (!g.cashierCustomerArea || !g.cashierGlassDoors) {
          g.spawnCashierCustomerInstant();
          return;
        }
        if (!alreadyBusy) {
          if (g.cashierSequenceBusy) return;
          g.setCashierBusy(true);
        }
        try {
          g.prepareCashierCustomerBehindDoors();
          await g.waitMs(120);
          g.setCashierDoorsOpen(true);
          await g.waitMs(g.CASHIER_DOOR_MS);
          g.setCustomerMotionState("is-walking-to-counter");
          await g.waitCustomerAreaTransition(g.CASHIER_WALK_MS);
          g.setCustomerMotionState("is-at-counter");
          await g.waitMs(g.CASHIER_DOOR_MS);
          g.setCashierDoorsOpen(false);
          if (g.cashierCustomerOrder) {
            g.cashierCustomerOrder.classList.remove("order-hidden");
          }
          g.updateCashierUI();
          if (g.tutorialMode) {
            if (g.tutorialCustomerIndex === 1) {
              await g.playGaryFirstCustomerMessage();
            } else if (g.tutorialCustomerIndex === 2) {
              await g.playGaryDrinkCustomerMessage();
            } else if (g.tutorialCustomerIndex === 3) {
              await g.playGarySoupCustomerMessage();
            }
            const orderItem = g.cashierCurrentOrder?.items?.[0];
            if (orderItem) {
              g.startTutorialGuide(g.getTutorialGuideSteps(orderItem));
            }
          }
        } catch (err) {
          console.error('Cashier customer enter failed:', err);
        } finally {
          g.setCashierBusy(false);
        }
      }
  
  g.spawnCashierCustomerInstant = function() {
        if (g.isNighttime) return;
        g.cashierCurrentOrder = g.pickCashierOrder();
        g.applyCustomerLook();
        g.renderCashierOrder();
        g.resetCashierCustomerMotion();
        if (g.cashierCustomerOrder) {
          g.cashierCustomerOrder.classList.remove("order-hidden");
        }
        g.updateCashierUI();
      }
  
  g.spawnCashierCustomer = function() {
        if (g.isNighttime) return;
        g.runCashierCustomerEnterSequence();
      }
  
  g.setCashierBusy = function(busy) {
        g.cashierSequenceBusy = busy;
        if (g.screen5) {
          g.screen5.classList.toggle("cashier-busy", busy);
        }
      }
  
  g.releaseStuckUI = function() {
        g.hideTrayActionMenu();
        g.closeTrayCloseup();
        g.trayDragState = null;
        window.removeEventListener("pointermove", g.onTrayDragMove);
        window.removeEventListener("pointerup", g.endTrayDrag);
        window.removeEventListener("pointercancel", g.endTrayDrag);
        if (g.trayDragGhost) {
          g.trayDragGhost.hidden = true;
          g.trayDragGhost.innerHTML = "";
        }
        g.setCashierBusy(false);
      }
  
  g.clearCustomerCarryTray = function() {
        if (g.cashierCustomerTrayGrid) {
          g.cashierCustomerTrayGrid.innerHTML = "";
        }
        if (g.cashierCustomer) {
          g.cashierCustomer.classList.remove("has-carry-tray");
        }
      }
  
  g.buildCustomerCarryTray = function() {
        if (!g.cashierCustomerTrayGrid) return;
        g.cashierCustomerTrayGrid.innerHTML = "";
        g.TRAY_SLOTS.forEach((slot) => {
          const entry = g.trayContents[slot];
          const cell = document.createElement("div");
          cell.className = "customer-carry-tray-cell";
          if (entry) {
            g.renderTrayEntryIcon(cell, entry);
          }
          g.cashierCustomerTrayGrid.appendChild(cell);
        });
        if (g.cashierCustomer) {
          g.cashierCustomer.classList.add("has-carry-tray");
        }
      }
  
  g.afterCustomerServed = async function() {
        g.customersServed += 1;
        if (g.shouldTriggerNight()) {
          await g.playNightTransition();
        }
      }
  
  g.spawnNextTutorialCustomerAfterServe = async function() {
        if (g.isNighttime) g.resetNightState();
        await g.runCashierCustomerEnterSequence(true);
      }
  
  g.runCashierCustomerExitSequence = async function() {
        if (!g.cashierCustomerArea || !g.cashierGlassDoors) {
          g.buildCustomerCarryTray();
          g.clearTrayContents();
          g.trayDirty = false;
          g.trayAtCashier = false;
          g.tray.classList.remove("cashier-away");
          g.sendTrayToCafeteriaCart();
          if (g.tutorialMode) {
            g.stopTutorialGuide();
            if (g.tutorialCustomerIndex === 1) {
              await g.runTutorialTrayWashIntro();
            } else if (g.tutorialCustomerIndex === 2) {
              g.prepareCashierIntroHold();
              await g.playGaryDrinkDoneMessage();
            } else if (g.tutorialCustomerIndex === 3) {
              g.prepareCashierIntroHold();
              g.tutorialResumeOrderItem = null;
            }
          }
          await g.afterCustomerServed();
          if (g.tutorialMode && g.tutorialCustomerIndex === 2) {
            await g.spawnNextTutorialCustomerAfterServe();
          } else if (g.tutorialMode && g.tutorialCustomerIndex === 3) {
            await g.playGaryNightClosedMessage();
          } else if (!g.tutorialMode && !g.isNighttime) {
            g.spawnCashierCustomerInstant();
          }
          g.updateCarrierUI();
          return;
        }
  
        g.setCashierBusy(true);
        try {
          if (g.cashierCustomerOrder) {
            g.cashierCustomerOrder.classList.add("order-hidden");
          }
  
          g.buildCustomerCarryTray();
          g.clearTrayContents();
          g.trayDirty = false;
          g.trayAtCashier = false;
          g.tray.classList.remove("cashier-away");
          g.sendTrayToCafeteriaCart();
          g.updateCashierUI();
          g.updateCarrierUI();
  
          g.showCashierToast("success", "Perfect order!");
  
          g.cashierCustomerArea.classList.add("is-exiting-right");
          await g.waitCustomerAreaTransition(g.CASHIER_EXIT_MS);
          g.clearCustomerCarryTray();
          if (g.tutorialMode) {
            g.stopTutorialGuide();
            if (g.tutorialCustomerIndex === 1) {
              await g.runTutorialTrayWashIntro();
            } else if (g.tutorialCustomerIndex === 2) {
              g.prepareCashierIntroHold();
              await g.playGaryDrinkDoneMessage();
            } else if (g.tutorialCustomerIndex === 3) {
              g.prepareCashierIntroHold();
              g.tutorialResumeOrderItem = null;
            }
          }
          await g.afterCustomerServed();
          if (g.tutorialMode && g.tutorialCustomerIndex === 2) {
            await g.spawnNextTutorialCustomerAfterServe();
          } else if (g.tutorialMode && g.tutorialCustomerIndex === 3) {
            await g.playGaryNightClosedMessage();
          } else if (!g.isNighttime) {
            await g.runCashierCustomerEnterSequence(true);
          }
        } finally {
          g.setCashierBusy(false);
        }
      }
  
  g.finishCashierOrder = function() {
        if (g.cashierSequenceBusy) return;
        g.runCashierCustomerExitSequence();
      }
  
  g.renderCashierTrayPreview = function() {
        g.cashierTrayPreview.innerHTML = "";
        if (!g.trayAtCashier) {
          g.cashierTrayPreview.setAttribute("aria-hidden", "true");
          return;
        }
        g.cashierTrayPreview.removeAttribute("aria-hidden");
        g.TRAY_SLOTS.forEach((slot) => {
          const entry = g.trayContents[slot];
          const cell = document.createElement("div");
          cell.className = "cashier-tray-preview-item";
          cell.dataset.slot = slot;
          if (entry) {
            g.renderTrayEntryIcon(cell, entry);
          }
          g.cashierTrayPreview.appendChild(cell);
        });
      }
  
  g.handleCashierTraySpotClick = function() {
        if (g.trayAtCashier) {
          g.pickUpTrayFromCashierSpot();
          return;
        }
        if (g.trayFollowing) {
          g.placeTrayOnCashierSpot();
        }
      }
  
  g.updateCashierUI = function() {
        if (!g.cashierTraySpot) return;
        const canPlace =
          g.isScreen5Active() && g.trayFollowing && g.trayMeetsCashierMinimum();
        g.cashierTraySpot.classList.toggle("can-place", canPlace);
        g.cashierTraySpot.classList.toggle("has-tray", g.trayAtCashier);
        g.renderCashierTrayPreview();
        g.syncTrayCashierAway();
        g.cashierTraySpot.setAttribute(
          "aria-label",
          g.trayAtCashier
            ? "Tray on counter — click to pick up"
            : canPlace
              ? "Place tray here"
              : g.trayFollowing
                ? g.tutorialMode
                  ? "Tray needs at least one item"
                  : "Tray needs a drink AND food or soup"
                : "Pick up a loaded tray to place here"
        );
      }
  
}

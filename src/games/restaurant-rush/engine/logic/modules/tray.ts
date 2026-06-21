// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attachTray(g: GameRuntime) {
  g.getTrayFilledEntries = function() {
        return g.TRAY_SLOTS.map((slot) => g.trayContents[slot]).filter(Boolean);
      }
  
  g.getTrayFilledData = function() {
        return g.getTrayFilledEntries().map((entry) => entry.data);
      }
  
  g.trayHasDrink = function() {
        return g.getTrayFilledEntries().some((entry) => g.isCupDrink(entry.data));
      }
  
  g.trayHasFoodOrSoup = function() {
        return g.getTrayFilledEntries().some(
          (entry) => g.isPlateFood(entry.data) || g.isPotSoup(entry.data)
        );
      }
  
  g.trayMeetsCashierMinimum = function() {
        if (g.tutorialMode) {
          return g.trayHasLoad();
        }
        return g.trayHasDrink() && g.trayHasFoodOrSoup();
      }
  
  g.trayFilledCount = function() {
        return g.getTrayFilledEntries().length;
      }
  
  g.trayHasLoad = function() {
        return g.trayFilledCount() > 0;
      }
  
  g.isTrayOutInWorld = function() {
        return (
          g.trayFollowing ||
          !!g.trayRestSpotId ||
          g.trayAtCashier ||
          g.dishwasherLoad === "tray"
        );
      }
  
  g.isTrayOnHomeDock = function() {
        return g.traysAtHome > 0 && !g.isTrayOutInWorld();
      }
  
  g.sendTrayToCafeteriaCart = function() {
        g.cafeteriaCartDirtyTrays += 1;
        g.updateCafeteriaCartUI();
      }
  
  g.pickUpDirtyTrayFromCart = function() {
        if (!g.isScreen6Active() || g.cafeteriaCartDirtyTrays < 1) return;
        if (g.isTrayOutInWorld()) return;
        g.cafeteriaCartDirtyTrays -= 1;
        g.hideTrayActionMenu();
        g.closeTrayCloseup();
        g.putDownOtherCarriers("tray");
        g.trayDirty = true;
        g.TRAY_SLOTS.forEach((slot) => {
          g.trayContents[slot] = null;
        });
        g.trayFollowing = true;
        g.tray.classList.add("following", "dirty");
        g.tray.setAttribute(
          "aria-label",
          "Dirty tray from cafeteria cart — wash in dishwasher"
        );
        g.moveTrayWithCursor(
          g.tray.getBoundingClientRect().left,
          g.tray.getBoundingClientRect().top
        );
        g.updateCafeteriaCartUI();
        g.updateCarrierUI();
        g.maybeAdvanceTutorialGuide({ type: "cafeteria-tray", action: "pickup" });
      }
  
  g.updateTrayStackUI = function() {
        g.reconcileTrayStackCount();
        const stackedAtHome = g.traysAtHome;
        if (g.trayStackBadge) {
          g.trayStackBadge.textContent = String(stackedAtHome);
          g.trayStackBadge.hidden = stackedAtHome < 1;
          g.trayStackBadge.setAttribute(
            "aria-label",
            stackedAtHome === 1
              ? "1 tray at home"
              : stackedAtHome + " trays at home"
          );
        }
        if (g.trayStackLayers) {
          const behind = Math.max(0, Math.min(g.traysAtHome - 1, g.TRAY_STACK_MAX - 1));
          g.trayStackLayers.innerHTML = "";
          for (let i = 0; i < behind; i++) {
            const layer = document.createElement("div");
            layer.className = "tray-stack-layer";
            layer.style.setProperty("--stack-i", String(i));
            g.trayStackLayers.appendChild(layer);
          }
        }
        g.trayHome.classList.toggle("has-stack", g.traysAtHome > 1);
        const canPickFromHome = g.traysAtHome > 0 && !g.isTrayOutInWorld();
        g.trayHome.classList.toggle("is-empty", !canPickFromHome);
        if (g.isTrayOnHomeDock()) {
          g.returnCarrierToHomeDock("tray");
        }
      }
  
  g.trayItemMatchesReq = function(data, req) {
        if (!data || !req) return false;
        if (req.kind === "drink") {
          return g.isCupDrink(data) && data.drink === req.drink;
        }
        if (req.kind === "food") {
          if (!g.isPlateFood(data)) return false;
          if (req.crop && data.crop !== req.crop) return false;
          if (req.state && data.state !== req.state) return false;
          if (req.wasCut !== undefined && !!data.wasCut !== req.wasCut) return false;
          if (req.salted !== undefined && !!data.salted !== req.salted) return false;
          if (req.peppered !== undefined && !!data.peppered !== req.peppered) return false;
          if (req.withTomato !== undefined && !!data.withTomato !== req.withTomato) return false;
          return true;
        }
        if (req.kind === "soup") {
          if (!g.isFinishedSoupComplete(data)) return false;
          if (req.recipe === "carrot") return data.soup === "carrots";
          if (req.recipe === "cucumber") return data.soup === "cucumbers";
          if (req.recipe === "potato") {
            return data.soup === "potatoes" && data.mix === "carrots" && !data.meat;
          }
          if (req.recipe === "meat-potato") {
            return data.soup === "potatoes" && data.mix === "carrots" && !!data.meat;
          }
          if (req.recipe === "meat-stew") {
            return (
              data.soup === "meat" && !!data.mixPotatoes && !!data.mixCarrots
            );
          }
          if (req.recipe === "tomato") {
            return data.soup === "tomatoes" && data.mix === "tomatoes";
          }
          return data.soup === req.recipe;
        }
        return false;
      }
  
  g.trayMatchesCashierOrder = function(order) {
        if (!order) return false;
        const filled = g.getTrayFilledData();
        if (filled.length !== order.items.length) return false;
        const used = new Set();
        return order.items.every((req) => {
          const idx = filled.findIndex(
            (data, i) => !used.has(i) && g.trayItemMatchesReq(data, req)
          );
          if (idx === -1) return false;
          used.add(idx);
          return true;
        });
      }
  
  g.clearTrayContents = function() {
        g.TRAY_SLOTS.forEach((slot) => {
          g.trayContents[slot] = null;
        });
        g.updateTrayVisual();
      }
  
  g.throwAwayTrayFoodOnly = function() {
        g.clearTrayContents();
        g.trayDirty = true;
        if (g.trayAtCashier) {
          g.renderCashierTrayPreview();
        }
        g.updateCarrierUI();
      }
  
  g.trayCanThrowAway = function() {
        if (!g.trayHasLoad()) return false;
        if (g.trayFollowing) return true;
        if (g.trayAtCashier) return true;
        if (g.trayRestSpotId) {
          const active = g.root.querySelector(".screen.active");
          return active === g.screen2 || active === g.screen3;
        }
        return false;
      }
  
  g.syncTrayCashierAway = function() {
        g.tray.classList.toggle("cashier-away", g.trayAtCashier && !g.trayFollowing);
      }
  
  g.placeTrayOnCashierSpot = function() {
        if (g.cashierSequenceBusy) return;
        if (!g.isScreen5Active() || !g.trayFollowing || g.trayAtCashier) return;
        if (g.trayDirty) {
          g.showCashierToast("error", "Wash the tray in the dishwasher first!");
          return;
        }
        if (!g.trayMeetsCashierMinimum()) {
          g.showCashierToast(
            "error",
            g.tutorialMode
              ? "Put at least one item on the tray first!"
              : "Need a drink AND food or soup!"
          );
          return;
        }
        g.trayFollowing = false;
        g.tray.classList.remove("following");
        g.tray.style.left = "";
        g.tray.style.top = "";
        g.trayAtCashier = true;
        g.syncTrayCashierAway();
        if (g.trayMatchesCashierOrder(g.cashierCurrentOrder)) {
          g.finishCashierOrder();
        } else {
          g.showCashierToast("error", "Wrong order — check what they asked for!");
        }
        g.maybeAdvanceTutorialGuide({ type: "cashier-tray", action: "place" });
        g.updateCashierUI();
        g.updateCarrierUI();
      }
  
  g.pickUpTrayFromCashierSpot = function() {
        if (g.cashierSequenceBusy) return;
        if (!g.trayAtCashier || !g.isScreen5Active()) return;
        g.trayAtCashier = false;
        g.syncTrayCashierAway();
        g.pickUpTray();
      }
  
  g.cloneTrayData = function(data) {
        return JSON.parse(JSON.stringify(data));
      }
  
  g.getTrayPreferredSlot = function(carrier) {
        const payload = g.getCarrierPayload(carrier);
        if (!payload || g.getCarrierDirty(carrier) || !g.isValidTrayPayload(payload)) return null;
        if (carrier === "pot" && g.isPotSoup(payload)) return "soup";
        if (carrier === "cup" && g.isCupDrink(payload)) return "drink";
        if (carrier === "plate" && g.isPlateFood(payload)) return "food";
        if (carrier === "bowl" && g.isBowlItem(payload)) return "extra";
        return null;
      }
  
  g.carrierHasTrayFood = function(carrier) {
        if (carrier === "tray" || g.dishwasherLoad === carrier) return false;
        return g.getTrayPreferredSlot(carrier) !== null;
      }
  
  g.carrierShowsInTrayCloseup = function(carrier) {
        return g.carrierHasTrayFood(carrier);
      }
  
  g.isTrayCloseupOpen = function() {
        return g.trayCloseup.classList.contains("is-open");
      }
  
  g.isTrayOnCounter = function() {
        g.syncTrayCounterSpotIfNeeded();
        if (g.trayFollowing) return false;
        if (g.trayRestSpotId) return true;
        return g.tray.classList.contains("on-counter");
      }
  
  g.showTrayActionMenu = function() {
        const r = g.tray.getBoundingClientRect();
        g.trayActionMenu.style.left = r.left + r.width / 2 + "px";
        g.trayActionMenu.style.top = r.top + "px";
        g.trayMenuPlaceFood.hidden = g.trayDirty;
        g.trayActionMenu.hidden = false;
        g.trayActionMenu.classList.add("open");
        g.refreshTutorialGlow();
      }
  
  g.renderTrayEntryIcon = function(el, entry) {
        if (!entry) {
          el.className = "tray-slot-drop";
          el.innerHTML = "";
          return;
        }
        const data = entry.data;
        el.className = "tray-slot-drop";
        el.innerHTML = "";
        const icon = document.createElement("div");
        if (g.isPotSoup(data)) g.setSoupIcon(icon, "tray-slot-item", data);
        else if (g.isCupDrink(data)) g.setDrinkIcon(icon, "tray-slot-item", data);
        else if (g.isPlateFood(data)) g.setFoodIcon(icon, "tray-slot-item", data);
        else if (g.isBowlItem(data)) g.setBowlIcon(icon, "tray-slot-item", data);
        else {
          el.className = "tray-slot-drop tray-extra-label";
          el.textContent = g.foodLabel(data) || g.bowlLabel(data) || "Item";
          return;
        }
        el.appendChild(icon);
      }
  
  g.renderTraySlotIcon = function(el, slot, entry) {
        g.renderTrayEntryIcon(el, entry);
      }
  
  g.updateTrayVisual = function() {
        let hasLoad = false;
        g.TRAY_SLOTS.forEach((slot) => {
          const loadEl = g.tray.querySelector('.tray-load[data-slot="' + slot + '"]');
          const entry = g.trayContents[slot];
          loadEl.classList.toggle("filled", !!entry);
          loadEl.innerHTML = "";
          if (entry) {
            hasLoad = true;
            const drop = document.createElement("div");
            g.renderTraySlotIcon(drop, slot, entry);
            loadEl.appendChild(drop);
          }
        });
        g.tray.classList.toggle("has-load", hasLoad);
      }
  
  g.dockCarrierAfterTrayPlace = function(carrier) {
        if (g.isCarrierFollowing(carrier)) {
          if (carrier === "plate") g.putDownPlate();
          else if (carrier === "cup") g.putDownCup();
          else if (carrier === "pot") g.putDownPot();
          else if (carrier === "bowl") g.putDownBowl();
        } else if (g.getCarrierRestSpotId(carrier)) {
          g.liftCarrierFromCounterIfNeeded(carrier);
          g.returnCarrierToHomeDock(carrier);
          g.getCarrierHome(carrier).classList.remove("is-empty");
          g.getCarrierEl(carrier).setAttribute(
            "aria-label",
            carrier === "plate"
              ? "Pick up plate"
              : carrier === "cup"
                ? "Pick up cup"
                : carrier === "pot"
                  ? "Pick up soup pot"
                  : "Pick up bowl"
          );
        }
      }
  
  g.placeOnTraySlot = function(slot, carrier) {
        if (!g.canPlaceOnTraySlot(slot, carrier)) return false;
        const payload = g.getCarrierPayload(carrier);
        if (!payload) return false;
        g.trayContents[slot] = { carrier, data: g.cloneTrayData(payload) };
        g.clearCarrierPayload(carrier);
        g.dockCarrierAfterTrayPlace(carrier);
        g.updateTrayVisual();
        g.maybeAdvanceTutorialGuide({ type: "tray-load", carrier });
        return true;
      }
  
  g.putDownCarriersNotInTrayCloseup = function() {
        const noRewind = { tutorialRewind: false };
        if (g.basketFollowing) g.putDownBasket(noRewind);
        if (g.plateFollowing && !g.carrierShowsInTrayCloseup("plate")) g.putDownPlate(noRewind);
        if (g.cupFollowing && !g.carrierShowsInTrayCloseup("cup")) g.putDownCup(noRewind);
        if (g.potFollowing && !g.carrierShowsInTrayCloseup("pot")) g.putDownPot(noRewind);
        if (g.bowlFollowing && !g.carrierShowsInTrayCloseup("bowl")) g.putDownBowl(noRewind);
        g.putDownShakers();
      }
  
  g.buildTrayCloseupSources = function() {
        g.trayCloseupSources.innerHTML = "";
        ["pot", "cup", "plate", "bowl"].forEach((carrier) => {
          const preferred = g.getTrayPreferredSlot(carrier);
          const available = g.carrierShowsInTrayCloseup(carrier);
          const inHand = g.isCarrierFollowing(carrier);
          const wrap = document.createElement("div");
          wrap.className =
            "tray-source" +
            (carrier === "bowl" ? " bowl-source" : "") +
            (inHand ? " tray-source-in-hand" : "") +
            (available ? "" : " unavailable");
          wrap.dataset.carrier = carrier;
          const ring = document.createElement("div");
          ring.className = "tray-source-ring";
          const preview = document.createElement("div");
          preview.className = "tray-source-preview";
          if (available && preferred) {
            const payload = g.getCarrierPayload(carrier);
            if (payload) {
              const fake = document.createElement("div");
              g.renderTrayEntryIcon(fake, {
                carrier,
                data: g.cloneTrayData(payload),
              });
              preview.appendChild(fake);
            }
          }
          ring.appendChild(preview);
          const label = document.createElement("div");
          label.className = "tray-source-label";
          const names = { pot: "Soup pot", cup: "Cup", plate: "Plate", bowl: "Bowl" };
          label.textContent = names[carrier] + (inHand ? " (in hand)" : "");
          wrap.appendChild(ring);
          wrap.appendChild(label);
          if (available) {
            wrap.addEventListener("pointerdown", (e) => g.startTrayDragFromSource(carrier, e));
          }
          g.trayCloseupSources.appendChild(wrap);
        });
      }
  
  g.renderTrayCloseupSlots = function() {
        g.trayCloseupSlots.querySelectorAll(".tray-slot").forEach((slotEl) => {
          const slot = slotEl.dataset.slot;
          const drop = slotEl.querySelector(".tray-slot-drop");
          const entry = g.trayContents[slot];
          slotEl.classList.toggle("filled", !!entry);
          g.renderTraySlotIcon(drop, slot, entry);
        });
      }
  
  g.ensureTrayDragGhost = function() {
        if (g.trayDragGhost) return g.trayDragGhost;
        g.trayDragGhost = document.createElement("div");
        g.trayDragGhost.className = "tray-drag-ghost";
        g.trayDragGhost.hidden = true;
        g.gameLayer.appendChild(g.trayDragGhost);
        return g.trayDragGhost;
      }
  
  g.moveTrayDragGhost = function(clientX, clientY) {
        if (!g.trayDragGhost) return;
        g.trayDragGhost.style.left = clientX + "px";
        g.trayDragGhost.style.top = clientY + "px";
      }
  
  g.clearTrayDragHighlight = function() {
        g.trayCloseupSlots.querySelectorAll(".tray-slot").forEach((el) => {
          el.classList.remove("drag-over");
        });
      }
  
  g.traySlotAtPoint = function(clientX, clientY) {
        const el = document.elementFromPoint(clientX, clientY);
        if (!el) return null;
        const slotEl = el.closest(".tray-slot");
        return slotEl ? slotEl.dataset.slot : null;
      }
  
  g.startTrayDragFromSource = function(carrier, e) {
        if (!g.carrierShowsInTrayCloseup(carrier)) return;
        const preferred = g.getTrayPreferredSlot(carrier);
        if (!preferred) return;
        e.preventDefault();
        const ghost = g.ensureTrayDragGhost();
        ghost.innerHTML = "";
        const inner = document.createElement("div");
        g.renderTrayEntryIcon(inner, {
          carrier,
          data: g.cloneTrayData(g.getCarrierPayload(carrier)),
        });
        ghost.appendChild(inner);
        ghost.hidden = false;
        g.moveTrayDragGhost(e.clientX, e.clientY);
        g.trayDragState = { from: "source", carrier, preferred };
        window.addEventListener("pointermove", g.onTrayDragMove);
        window.addEventListener("pointerup", g.endTrayDrag);
        window.addEventListener("pointercancel", g.endTrayDrag);
      }
  
  g.onTrayDragMove = function(e) {
        if (!g.trayDragState || !g.isTrayCloseupOpen()) return;
        g.moveTrayDragGhost(e.clientX, e.clientY);
        g.clearTrayDragHighlight();
        const over = g.traySlotAtPoint(e.clientX, e.clientY);
        if (
          over &&
          g.trayDragState.from === "source" &&
          g.canPlaceOnTraySlot(over, g.trayDragState.carrier)
        ) {
          const slotEl = g.trayCloseupSlots.querySelector('[data-slot="' + over + '"]');
          if (slotEl) slotEl.classList.add("drag-over");
        }
      }
  
  g.endTrayDrag = function(e) {
        if (!g.trayDragState || !g.isTrayCloseupOpen()) return;
        const over = g.traySlotAtPoint(e.clientX, e.clientY);
        if (
          over &&
          g.trayDragState.from === "source" &&
          g.canPlaceOnTraySlot(over, g.trayDragState.carrier)
        ) {
          g.placeOnTraySlot(over, g.trayDragState.carrier);
          g.renderTrayCloseupSlots();
          g.buildTrayCloseupSources();
        }
        g.trayDragState = null;
        if (g.trayDragGhost) {
          g.trayDragGhost.hidden = true;
          g.trayDragGhost.innerHTML = "";
        }
        g.clearTrayDragHighlight();
        g.updateCarrierUI();
        window.removeEventListener("pointermove", g.onTrayDragMove);
        window.removeEventListener("pointerup", g.endTrayDrag);
        window.removeEventListener("pointercancel", g.endTrayDrag);
      }
  
  g.openTrayCloseup = function() {
        g.syncTrayCounterSpotIfNeeded();
        if (g.trayDirty || g.trayFollowing || !g.isTrayOnCounter()) return;
        g.hideTrayActionMenu();
        g.putDownCarriersNotInTrayCloseup();
        g.trayCloseup.classList.add("is-open");
        g.trayCloseup.hidden = false;
        g.trayCloseup.removeAttribute("hidden");
        g.trayCloseup.setAttribute("aria-hidden", "false");
        try {
          g.buildTrayCloseupSources();
          g.renderTrayCloseupSlots();
          g.maybeAdvanceTutorialGuide({ type: "tray", action: "place-food" });
        } catch (err) {
          console.error("tray closeup", err);
          g.closeTrayCloseup();
        }
      }
  
  g.handleTrayPlaceFood = function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        g.suppressTrayClickUntil = performance.now() + 500;
        g.openTrayCloseup();
      }
  
  g.closeTrayCloseup = function() {
        if (!g.isTrayCloseupOpen()) return;
        g.trayCloseup.classList.remove("is-open");
        g.trayCloseup.hidden = true;
        g.trayCloseup.setAttribute("aria-hidden", "true");
        g.trayDragState = null;
        window.removeEventListener("pointermove", g.onTrayDragMove);
        window.removeEventListener("pointerup", g.endTrayDrag);
        window.removeEventListener("pointercancel", g.endTrayDrag);
        if (g.trayDragGhost) {
          g.trayDragGhost.hidden = true;
          g.trayDragGhost.innerHTML = "";
        }
        g.clearTrayDragHighlight();
        g.updateTrayVisual();
        g.updateCarrierUI();
        if (g.trayHasLoad()) {
          g.maybeAdvanceTutorialGuide({ type: "tray", action: "done" });
        }
      }
  
  g.moveTrayWithCursor = function(clientX, clientY) {
        g.tray.style.left = clientX + 10 + "px";
        g.tray.style.top = clientY + 10 + "px";
      }
  
  g.pickUpTray = function() {
        if (g.trayAtCashier) return;
        const onCounter = g.isTrayOnCounter();
        if (!onCounter && !g.isTrayOnHomeDock()) return;
        g.hideTrayActionMenu();
        g.closeTrayCloseup();
        g.liftCarrierFromCounterIfNeeded("tray");
        g.putDownOtherCarriers("tray");
        g.trayFollowing = true;
        g.tray.classList.add("following");
        g.tray.setAttribute(
          "aria-label",
          "Serving tray — click counter spot to set down, or click home ring"
        );
        g.moveTrayWithCursor(g.tray.getBoundingClientRect().left, g.tray.getBoundingClientRect().top);
        g.updateCarrierUI();
        g.maybeAdvanceTutorialGuide({ type: "carrier", carrier: "tray", action: "pickup" });
      }
  
}

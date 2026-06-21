// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attachNight(g: GameRuntime) {
  g.ensureMudPuddleLayers = function() {
        g.MUD_PUDDLE_SCREENS.forEach((num) => {
          const floor = g.root.querySelector("#screen-" + num + " .kitchen-floor");
          if (!floor || floor.querySelector(".mud-puddle-layer")) return;
          const layer = document.createElement("div");
          layer.className = "mud-puddle-layer";
          layer.dataset.screen = String(num);
          layer.setAttribute("aria-hidden", "true");
          floor.appendChild(layer);
        });
      }
  
  g.getMudPuddleBounds = function(screenNum) {
        if (screenNum === 6) return { xMin: 14, xMax: 86, yMin: 12, yMax: 88 };
        return { xMin: 8, xMax: 92, yMin: 10, yMax: 90 };
      }
  
  g.mudPuddlesOverlap = function(x, y, r, placed, gap) {
        return placed.some((p) => {
          const dx = x - p.x;
          const dy = (y - p.y) * g.MUD_FLOOR_ASPECT;
          return Math.hypot(dx, dy) < r + p.r + gap;
        });
      }
  
  g.generateMudPuddlesForScreen = function(screenNum) {
        const layer = g.root.querySelector(
          "#screen-" + screenNum + " .mud-puddle-layer"
        );
        if (!layer) return;
        layer.innerHTML = "";
        const count = Math.floor(Math.random() * (g.MUD_PUDDLE_MAX + 1));
        const bounds = g.getMudPuddleBounds(screenNum);
        const placed = [];
        const gap = 2.5;
  
        for (let n = 0; n < count; n++) {
          for (let attempt = 0; attempt < 64; attempt++) {
            const r = 3.5 + Math.random() * 3;
            const x = bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin);
            const y = bounds.yMin + Math.random() * (bounds.yMax - bounds.yMin);
            if (g.mudPuddlesOverlap(x, y, r, placed, gap)) continue;
  
            const id = screenNum + "-" + n;
            const el = document.createElement("button");
            el.type = "button";
            el.className = "mud-puddle";
            el.dataset.puddleId = id;
            el.style.setProperty("--puddle-x", x + "%");
            el.style.setProperty("--puddle-y", y + "%");
            el.style.setProperty("--puddle-size", r * 2 * 0.92 + "%");
            el.setAttribute("aria-label", "Mud puddle");
            layer.appendChild(el);
            placed.push({ id, x, y, r, el });
            break;
          }
        }
  
        g.mudPuddlesByScreen[screenNum] = placed;
      }
  
  g.spawnNightMudPuddles = function() {
        g.ensureMudPuddleLayers();
        g.MUD_PUDDLE_SCREENS.forEach((num) => g.generateMudPuddlesForScreen(num));
      }
  
  g.clearMudPuddles = function() {
        g.MUD_PUDDLE_SCREENS.forEach((num) => {
          g.mudPuddlesByScreen[num] = [];
        });
        g.root.querySelectorAll(".mud-puddle-layer").forEach((layer) => {
          layer.innerHTML = "";
        });
      }
  
  g.tryCleanMudPuddle = function(puddleEl) {
        if (
          !g.mopFollowing ||
          !g.isNighttime ||
          !puddleEl ||
          puddleEl.classList.contains("cleaning")
        ) {
          return false;
        }
  
        const layer = puddleEl.closest(".mud-puddle-layer");
        const screenNum = layer ? Number(layer.dataset.screen) : 0;
        const list = g.mudPuddlesByScreen[screenNum] || [];
        const id = puddleEl.dataset.puddleId;
        if (!list.some((p) => p.id === id)) return false;
  
        puddleEl.classList.add("cleaning");
        if (g.mop) {
          g.mop.classList.remove("mop-swishing");
          void g.mop.offsetWidth;
          g.mop.classList.add("mop-swishing");
          if (g.mopSwishTimer) clearTimeout(g.mopSwishTimer);
          g.mopSwishTimer = window.setTimeout(() => {
            g.mop?.classList.remove("mop-swishing");
            g.mopSwishTimer = null;
          }, 900);
        }
  
        window.setTimeout(() => {
          puddleEl.remove();
          g.mudPuddlesByScreen[screenNum] = list.filter((p) => p.id !== id);
        }, 480);
        return true;
      }
  
  g.resetNightState = function() {
        g.customersServed = 0;
        g.isNighttime = false;
        g.root.classList.remove("nighttime");
        g.root.classList.remove("mop-out");
        g.clearMudPuddles();
        if (g.nightBanner) {
          g.nightBanner.classList.remove("is-visible");
          g.nightBanner.hidden = true;
          g.nightBanner.setAttribute("aria-hidden", "true");
        }
      }
  
  g.shouldTriggerNight = function() {
        if (g.tutorialMode) {
          return g.tutorialCustomerIndex === 3 && !g.isNighttime;
        }
        return (
          g.customersServed > 0 &&
          g.customersServed % g.CUSTOMERS_PER_NIGHT === 0 &&
          !g.isNighttime
        );
      }
  
  g.playNightTransition = async function() {
        if (g.isNighttime) return;
        g.isNighttime = true;
        g.root.classList.add("nighttime");
        g.prepareCashierIntroHold();
        g.clearCafeteriaDiners();
  
        if (g.nightBanner) {
          g.nightBanner.hidden = false;
          g.nightBanner.removeAttribute("hidden");
          g.nightBanner.setAttribute("aria-hidden", "false");
          await g.waitMs(40);
          g.nightBanner.classList.add("is-visible");
        }
  
        await g.waitMs(g.NIGHT_BANNER_HOLD_MS);
  
        if (g.nightBanner) {
          g.nightBanner.classList.remove("is-visible");
          await g.waitMs(700);
          g.nightBanner.hidden = true;
          g.nightBanner.setAttribute("aria-hidden", "true");
        }
  
        g.spawnNightMudPuddles();
      }
  
  g.moveMopWithCursor = function(clientX, clientY) {
        g.mop.style.left = clientX + 14 + "px";
        g.mop.style.top = clientY + 14 + "px";
      }
  
  g.pickUpMop = function() {
        if (!g.isScreen6Active() || !g.mop || !g.mopHome) return;
        g.putDownOtherCarriers("mop");
        const rect = g.mop.getBoundingClientRect();
        g.gameLayer.appendChild(g.mop);
        g.mopFollowing = true;
        g.mop.classList.add("following");
        g.mopHome.classList.add("is-empty");
        g.root.classList.add("mop-out");
        g.mop.setAttribute(
          "aria-label",
          g.isNighttime
            ? "Mop — click mud puddles to clean, or put down in cafeteria"
            : "Mop — click the dashed spot to put down"
        );
        g.moveMopWithCursor(rect.left, rect.top);
      }
  
  g.putDownMop = function() {
        if (!g.mop || !g.mopHome) return;
        g.mopFollowing = false;
        g.mop.classList.remove("following", "mop-swishing");
        g.root.classList.remove("mop-out");
        if (g.mopSwishTimer) {
          clearTimeout(g.mopSwishTimer);
          g.mopSwishTimer = null;
        }
        g.mopHome.classList.remove("is-empty");
        g.mop.style.left = "";
        g.mop.style.top = "";
        g.mopHome.appendChild(g.mop);
        g.mop.setAttribute("aria-label", "Pick up mop");
      }
  
}

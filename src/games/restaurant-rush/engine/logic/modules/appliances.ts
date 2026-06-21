// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attachAppliances(g: GameRuntime) {
  g.applianceIsAnimating = function(el) {
        return el.classList.contains("opening") || el.classList.contains("closing");
      }
  
  g.setApplianceOpen = function(el, labels, open, tutorialGuideType) {
        if (open) {
          el.classList.add("opening", "open");
          el.setAttribute("aria-label", labels.open);
          setTimeout(() => el.classList.remove("opening"), g.APPLIANCE_ANIM_MS);
          if (tutorialGuideType) {
            g.maybeAdvanceTutorialGuide({ type: tutorialGuideType, action: "open" });
          }
        } else {
          el.classList.add("closing");
          el.classList.remove("open");
          el.setAttribute("aria-label", labels.closed);
          setTimeout(() => el.classList.remove("closing"), g.APPLIANCE_ANIM_MS);
        }
        g.updateCarrierUI();
      }
  
  g.bindApplianceInteraction = function(el, labels, options) {
        const doorSelector = options.doorSelector || null;
        const ignoreSelector = options.ignoreSelector || null;
        const tryUse = options.tryUse || (() => false);
        const canOpen = options.canOpen || (() => true);
        const canClose = options.canClose || (() => true);
        const isBlocked = options.isBlocked || (() => false);
  
        function closeInstant() {
          if (
            !el.classList.contains("open") &&
            !el.classList.contains("opening") &&
            !el.classList.contains("closing")
          ) {
            return;
          }
          el.classList.remove("open", "opening", "closing");
          el.setAttribute("aria-label", labels.closed);
          g.updateCarrierUI();
        }
  
        function onInteract(e) {
          if (ignoreSelector && e.target.closest(ignoreSelector)) return;
          if (g.applianceIsAnimating(el) || isBlocked()) return;
  
          const isOpen = el.classList.contains("open");
          const doorHit = doorSelector && e.target.closest(doorSelector);
  
          if (isOpen && doorHit) {
            if (!canClose()) {
              tryUse();
              return;
            }
            g.setApplianceOpen(el, labels, false, null);
            return;
          }
  
          if (isOpen && tryUse()) {
            return;
          }
  
          if (!isOpen && canOpen()) {
            g.setApplianceOpen(el, labels, true, options.tutorialGuide || null);
          }
        }
  
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onInteract(e);
        });
  
        el.addEventListener("keydown", (e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          if (ignoreSelector && e.target.closest(ignoreSelector)) return;
          if (g.applianceIsAnimating(el) || isBlocked()) return;
  
          const isOpen = el.classList.contains("open");
          if (isOpen) {
            if (tryUse()) return;
            if (canClose()) {
              g.setApplianceOpen(el, labels, false, null);
            }
          } else if (canOpen()) {
            g.setApplianceOpen(el, labels, true, options.tutorialGuide || null);
          }
        });
  
        g.applianceCloseFns.push(closeInstant);
      }
  
  g.closeAllAppliancesInstant = function() {
        g.closeFridgeInstant();
        g.clearDishwasherInstant();
        g.clearBlenderInstant();
        g.clearCuttingInstant();
        g.clearOvenInstant();
        g.clearMicrowaveInstant();
        g.applianceCloseFns.forEach((close) => close());
      }
  
}

// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attachGary(g: GameRuntime) {
  g.garyReadMsFor = function(text) {
        return Math.max(g.GARY_READ_MS, text.length * 22);
      }
  
  g.holdCustomerEnterForGary = function() {
        g.garyCustomerEnterHeld = true;
      }
  
  g.releaseCustomerEnterAfterGary = function() {
        g.garyCustomerEnterHeld = false;
        const waiters = g.garyCustomerEnterWaiters;
        g.garyCustomerEnterWaiters = [];
        waiters.forEach((resolve) => resolve());
      }
  
  g.waitForGaryBeforeCustomerEnter = function() {
        if (!g.garyCustomerEnterHeld) return Promise.resolve();
        return new Promise((resolve) => {
          g.garyCustomerEnterWaiters.push(resolve);
        });
      }
  
  g.hideGaryBubble = function() {
        if (g.garyTypeTimer) {
          clearTimeout(g.garyTypeTimer);
          g.garyTypeTimer = null;
        }
        if (g.tutorialGaryBubble) {
          g.tutorialGaryBubble.classList.remove("is-visible", "is-typing");
          g.tutorialGaryBubble.hidden = true;
        }
        if (g.tutorialGaryText) g.tutorialGaryText.textContent = "";
      }
  
  g.typeGaryMessage = function(text) {
        return new Promise((resolve) => {
          if (!g.tutorialMode || !g.tutorialGaryText || !g.tutorialGaryBubble) {
            resolve();
            return;
          }
          g.tutorialGaryText.textContent = "";
          g.tutorialGaryBubble.hidden = false;
          g.tutorialGaryBubble.classList.add("is-visible", "is-typing");
          let i = 0;
          const step = () => {
            if (i >= text.length) {
              g.tutorialGaryBubble.classList.remove("is-typing");
              g.garyTypeTimer = null;
              resolve();
              return;
            }
            g.tutorialGaryText.textContent += text.charAt(i);
            i += 1;
            g.garyTypeTimer = window.setTimeout(step, g.GARY_TYPE_MS);
          };
          step();
        });
      }
  
  g.playGaryIntro = async function() {
        g.garyIntroComplete = false;
        await g.typeGaryMessage(g.GARY_INTRO_TEXT);
        await g.waitMs(g.GARY_READ_MS);
        g.hideGaryBubble();
        g.garyIntroComplete = true;
      }
  
  g.buildGaryFirstCustomerText = function() {
        const item = g.cashierCurrentOrder?.items?.[0];
        const want = item?.label ? item.label : "something";
        return (
          "Here's your first customer! Looks like they want " +
          want +
          ". I'll show you how to make it!"
        );
      }
  
  g.playGaryFirstCustomerMessage = async function() {
        await g.typeGaryMessage(g.buildGaryFirstCustomerText());
        await g.waitMs(g.GARY_READ_MS);
        g.hideGaryBubble();
      }
  
  g.playGaryTrayWashMessage = async function() {
        await g.typeGaryMessage(g.GARY_TRAY_WASH_TEXT);
        await g.waitMs(g.garyReadMsFor(g.GARY_TRAY_WASH_TEXT));
        g.hideGaryBubble();
      }
  
  g.playGaryDrinkCustomerMessage = async function() {
        await g.typeGaryMessage(
          "Looks like this customer wants a drink. I'll show you where to get that!"
        );
        await g.waitMs(g.GARY_READ_MS);
        g.hideGaryBubble();
      }
  
  g.buildGarySoupCustomerText = function() {
        const item = g.cashierCurrentOrder?.items?.[0];
        const want = item?.label ? item.label : "soup";
        return (
          "This customer wants some " +
          want +
          ". Soups and stews are pretty complicated, but I bet I can show you how to make some!"
        );
      }
  
  g.playGarySoupCustomerMessage = async function() {
        const text = g.buildGarySoupCustomerText();
        await g.typeGaryMessage(text);
        await g.waitMs(g.garyReadMsFor(text));
        g.hideGaryBubble();
      }
  
  g.playGaryDishwashMessage = async function() {
        await g.typeGaryMessage(g.GARY_DISHWASH_TEXT);
        await g.waitMs(g.GARY_READ_MS);
        g.hideGaryBubble();
      }
  
  g.playGaryNightClosedMessage = async function() {
        g.root.classList.add("gary-visible");
        try {
          await g.typeGaryMessage(g.GARY_NIGHT_CLOSED_TEXT);
          await g.waitMs(g.garyReadMsFor(g.GARY_NIGHT_CLOSED_TEXT));
          g.hideGaryBubble();
        } finally {
          g.root.classList.remove("gary-visible");
        }
      }
  
  g.playGaryDrinkDoneMessage = async function() {
        g.holdCustomerEnterForGary();
        try {
          await g.typeGaryMessage(g.GARY_DRINK_DONE_TEXT);
          await g.waitMs(g.garyReadMsFor(g.GARY_DRINK_DONE_TEXT));
          g.hideGaryBubble();
        } finally {
          g.releaseCustomerEnterAfterGary();
        }
      }
  
  g.beginCustomerAfterIntro = function() {
        window.setTimeout(() => {
          g.runCashierCustomerEnterSequence();
        }, g.CASHIER_INTRO_HOLD_MS);
      }
  
}

// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attachTutorial(g: GameRuntime) {
  g.tutorialNavStep = function(from, to) {
        return { type: "nav", from, to };
      }
  
  g.tutorialReturnToCashier = function(fromKitchen) {
        if (fromKitchen === 3) {
          return [g.tutorialNavStep(3, 2), g.tutorialNavStep(2, 5)];
        }
        return [g.tutorialNavStep(2, 5)];
      }
  
  g.getTutorialDeliverCarrier = function(orderItem) {
        if (!orderItem) return "plate";
        if (orderItem.kind === "drink") return "cup";
        if (orderItem.kind === "soup") return "pot";
        return "plate";
      }
  
  g.tutorialServeSteps = function(orderItem, fromKitchen) {
        const loadCarrier = g.getTutorialDeliverCarrier(orderItem);
        return [
          { type: "carrier", carrier: "tray", action: "pickup" },
          { type: "counter-place", carrier: "tray" },
          { type: "tray", action: "place-food" },
          { type: "tray-load", carrier: loadCarrier },
          { type: "tray", action: "done" },
          { type: "carrier", carrier: "tray", action: "pickup" },
          ...g.tutorialReturnToCashier(fromKitchen),
          { type: "cashier-tray", action: "place" },
        ];
      }
  
  g.tutorialGardenHarvestSteps = function(crop) {
        return [
          g.tutorialNavStep(5, 2),
          g.tutorialNavStep(2, 1),
          { type: "carrier", carrier: "basket", action: "pickup" },
          { type: "crop", crop },
          g.tutorialNavStep(1, 2),
        ];
      }
  
  g.tutorialWashFoodSteps = function() {
        return [
          { type: "sink", action: "drop" },
          { type: "wait", until: "sink-ready" },
          { type: "carrier", carrier: "plate", action: "pickup" },
          { type: "sink", action: "take" },
        ];
      }
  
  g.tutorialOvenBakeSteps = function() {
        return [
          { type: "oven", action: "open" },
          { type: "oven", action: "drop" },
          { type: "wait", until: "oven-done" },
          { type: "carrier", carrier: "plate", action: "pickup" },
          { type: "oven", action: "take" },
        ];
      }
  
  g.tutorialMicrowaveHeatSteps = function() {
        return [
          { type: "microwave", action: "open" },
          { type: "microwave", action: "drop" },
          { type: "wait", until: "microwave-done" },
          { type: "carrier", carrier: "pot", action: "pickup" },
          { type: "microwave", action: "take" },
        ];
      }
  
  g.tutorialSeasonPotSteps = function() {
        return [
          { type: "counter-place", carrier: "pot" },
          { type: "shaker", which: "salt", action: "pickup" },
          { type: "season", seasoning: "salt" },
          { type: "shaker", which: "pepper", action: "pickup" },
          { type: "season", seasoning: "pepper" },
          { type: "carrier", carrier: "pot", action: "pickup" },
        ];
      }
  
  g.tutorialSoupMixSteps = function(mixCrop) {
        return [
          { type: "counter-place", carrier: "pot" },
          ...g.tutorialGardenHarvestSteps(mixCrop),
          ...g.tutorialWashFoodSteps(),
          g.tutorialNavStep(2, 3),
          { type: "cutting-board", action: "use" },
          { type: "wait", until: "cutting-done" },
          g.tutorialNavStep(3, 2),
          { type: "counter-place", carrier: "plate" },
          { type: "carrier", carrier: "pot", action: "pickup" },
          { type: "counter-combine" },
        ];
      }
  
  g.tutorialSeasonPlateSaltSteps = function() {
        return [
          { type: "counter-place", carrier: "plate" },
          { type: "shaker", which: "salt", action: "pickup" },
          { type: "season", seasoning: "salt" },
          { type: "carrier", carrier: "plate", action: "pickup" },
        ];
      }
  
  g.getTutorialDishwashSteps = function() {
        const from = g.getActiveScreenNum();
        const steps = [];
        if (from !== 2) {
          steps.push(g.tutorialNavStep(from, 2));
        }
        steps.push(
          { type: "carrier", carrier: "plate", action: "pickup" },
          { type: "meat-box", action: "take" },
          { type: "trash", action: "throw" },
          { type: "dishwasher", action: "open" },
          { type: "dishwasher", action: "load" },
          { type: "wait", until: "dishwasher-done" }
        );
        return steps;
      }
  
  g.getTutorialTrayWashSteps = function() {
        const from = g.getActiveScreenNum();
        return [
          ...g.tutorialNavSteps(from, 6),
          { type: "cafeteria-tray", action: "pickup" },
          ...g.tutorialNavSteps(6, 2),
          { type: "dishwasher", action: "open" },
          { type: "dishwasher", action: "load" },
          { type: "wait", until: "dishwasher-done" },
          ...g.tutorialNavSteps(2, 5),
        ];
      }
  
  g.tutorialPlateMismatchesFoodOrder = function(food, orderItem) {
        if (!food || !orderItem || orderItem.kind !== "food" || !g.isPlateFood(food)) {
          return false;
        }
        if (orderItem.crop === "bread") {
          return !(food.crop === "bread" && food.state === "baked");
        }
        if (orderItem.crop === "french-fries") {
          if (g.isFrenchFries(food)) return false;
          if (g.isFrenchFriesPrep(food)) return false;
          if (food.crop === "potatoes") {
            if (
              food.state === "raw" ||
              food.state === "washed" ||
              food.state === "cut"
            ) {
              return false;
            }
            if (food.state === "baked" && food.wasCut) return false;
          }
          return true;
        }
        if (orderItem.crop !== food.crop) {
          return food.state !== "raw" && food.state !== "washed";
        }
        if (orderItem.state === "cut" && food.state === "baked") {
          return true;
        }
        if (
          orderItem.state === "baked" &&
          orderItem.wasCut &&
          food.state === "baked" &&
          !food.wasCut
        ) {
          return true;
        }
        if (
          orderItem.crop === "meat" &&
          orderItem.wasCut &&
          food.state === "baked" &&
          !food.wasCut
        ) {
          return true;
        }
        return false;
      }
  
  g.checkTutorialFoodMistake = function() {
        if (!g.tutorialMode || g.tutorialDishwashPhase || g.tutorialDishwashQueue) return;
        if (!g.tutorialGuideActive || !g.cashierCurrentOrder?.items?.[0]) return;
        const orderItem = g.cashierCurrentOrder.items[0];
        if (orderItem.kind !== "food") return;
        if (!g.plateFollowing || !g.plateContents || !g.isPlateFood(g.plateContents)) return;
        if (!g.tutorialPlateMismatchesFoodOrder(g.plateContents, orderItem)) return;
        g.queueTutorialDishwashGuide(orderItem);
      }
  
  g.resetPlateForDishwashTutorial = function() {
        if (g.plateRestSpotId) {
          g.clearCarrierRestSpot("plate");
        }
        g.plateFollowing = false;
        g.plate.classList.remove("following");
        g.plateContents = null;
        g.plateDirty = false;
        g.plate.style.left = "";
        g.plate.style.top = "";
        g.plate.classList.remove("on-counter", "counter-rest-away");
        g.returnCarrierToHomeDock("plate");
        g.plate.setAttribute("aria-label", "Pick up plate");
      }
  
  g.queueTutorialDishwashGuide = function(orderItemToResume) {
        if (g.tutorialDishwashPhase || g.tutorialDishwashQueue) return;
        g.tutorialDishwashQueue = true;
        g.tutorialResumeOrderItem = orderItemToResume;
        g.stopTutorialGuide();
        g.resetPlateForDishwashTutorial();
        window.setTimeout(() => {
          g.tutorialDishwashQueue = false;
          g.runTutorialDishwashIntro();
        }, 0);
      }
  
  g.runTutorialDishwashIntro = async function() {
        if (g.tutorialDishwashPhase) return;
        await g.playGaryDishwashMessage();
        g.tutorialDishwashGaryPlayed = true;
        g.tutorialDishwashPhase = true;
        g.tutorialDishwashVariant = "meat";
        g.startTutorialGuide(g.getTutorialDishwashSteps());
      }
  
  g.runTutorialTrayWashIntro = async function() {
        if (g.tutorialDishwashPhase) return;
        await g.playGaryTrayWashMessage();
        g.tutorialDishwashPhase = true;
        g.tutorialDishwashVariant = "tray";
        g.startTutorialGuide(g.getTutorialTrayWashSteps());
      }
  
  g.finishTutorialDishwashPhase = function() {
        const variant = g.tutorialDishwashVariant;
        g.tutorialDishwashPhase = false;
        g.tutorialDishwashVariant = null;
        const resume = g.tutorialResumeOrderItem;
        g.tutorialResumeOrderItem = null;
        if (variant === "meat" && resume) {
          g.startTutorialGuide(g.getTutorialGuideSteps(resume));
        } else if (variant === "tray") {
          void g.spawnNextTutorialCustomerAfterServe();
        }
      }
  
  g.getTutorialGuideSteps = function(orderItem) {
        if (!orderItem) return [];
  
        if (orderItem.kind === "drink") {
          const drink = orderItem.drink;
          if (drink.startsWith("juice-")) {
            const crop = drink.slice("juice-".length);
            return [
              ...g.tutorialGardenHarvestSteps(crop),
              ...g.tutorialWashFoodSteps(),
              g.tutorialNavStep(2, 3),
              { type: "blender", action: "drop" },
              { type: "wait", until: "blender-done" },
              { type: "carrier", carrier: "cup", action: "pickup" },
              { type: "blender", action: "take-juice" },
              ...g.tutorialServeSteps(orderItem, 3),
            ];
          }
          return [
            g.tutorialNavStep(5, 3),
            { type: "carrier", carrier: "cup", action: "pickup" },
            { type: "cooler", action: "open" },
            { type: "cooler-fill", drink },
            ...g.tutorialServeSteps(orderItem, 3),
          ];
        }
  
        if (orderItem.kind === "soup") {
          const recipe = orderItem.recipe;
          if (recipe === "meat-potato" || recipe === "meat-stew") {
            return [
              g.tutorialNavStep(5, 2),
              g.tutorialNavStep(2, 3),
              g.tutorialNavStep(3, 2),
              g.tutorialNavStep(2, 5),
            ];
          }
          const cropByRecipe = {
            carrot: "carrots",
            cucumber: "cucumbers",
            potato: "potatoes",
            tomato: "tomatoes",
          };
          const crop = cropByRecipe[recipe];
          if (!crop) return [];
          const mixCrop = g.SOUP_MIX_CROP_BY_RECIPE[recipe];
          const steps = [
            ...g.tutorialGardenHarvestSteps(crop),
            ...g.tutorialWashFoodSteps(),
            g.tutorialNavStep(2, 3),
            { type: "blender", action: "drop" },
            { type: "wait", until: "blender-done" },
            { type: "carrier", carrier: "pot", action: "pickup" },
            { type: "blender", action: "take-soup" },
            g.tutorialNavStep(3, 2),
          ];
          if (mixCrop) {
            steps.push(...g.tutorialSoupMixSteps(mixCrop));
          }
          steps.push(
            ...g.tutorialSeasonPotSteps(),
            g.tutorialNavStep(2, 3),
            ...g.tutorialMicrowaveHeatSteps(),
            ...g.tutorialServeSteps(orderItem, 3)
          );
          return steps;
        }
  
        if (orderItem.kind !== "food") return [];
  
        if (orderItem.crop === "bread") {
          return [
            ...g.tutorialGardenHarvestSteps("wheat"),
            ...g.tutorialWashFoodSteps(),
            g.tutorialNavStep(2, 3),
            { type: "blender", action: "drop" },
            { type: "wait", until: "blender-done" },
            { type: "carrier", carrier: "bowl", action: "pickup" },
            { type: "blender", action: "take-flour" },
            { type: "counter-place", carrier: "bowl" },
            { type: "carrier", carrier: "cup", action: "pickup" },
            { type: "cooler", action: "open" },
            { type: "cooler-fill", drink: "water" },
            { type: "counter-combine" },
            { type: "carrier", carrier: "bowl", action: "pickup" },
            { type: "oven", action: "open" },
            { type: "oven", action: "drop" },
            { type: "wait", until: "oven-done" },
            { type: "carrier", carrier: "plate", action: "pickup" },
            { type: "oven", action: "take" },
            ...g.tutorialServeSteps(orderItem, 3),
          ];
        }
  
        if (orderItem.crop === "steak-sandwich") {
          return [
            g.tutorialNavStep(5, 2),
            g.tutorialNavStep(2, 1),
            g.tutorialNavStep(1, 2),
            g.tutorialNavStep(2, 3),
            g.tutorialNavStep(3, 2),
            ...g.tutorialServeSteps(orderItem, 2),
          ];
        }
  
        if (orderItem.crop === "french-fries") {
          return [
            ...g.tutorialGardenHarvestSteps("potatoes"),
            ...g.tutorialWashFoodSteps(),
            g.tutorialNavStep(2, 3),
            { type: "cutting-board", action: "use" },
            { type: "wait", until: "cutting-done" },
            ...g.tutorialOvenBakeSteps(),
            g.tutorialNavStep(3, 2),
            ...g.tutorialSeasonPlateSaltSteps(),
            ...g.tutorialServeSteps(orderItem, 3),
          ];
        }
  
        if (orderItem.crop === "meat") {
          const steps = [
            g.tutorialNavStep(5, 2),
            { type: "carrier", carrier: "plate", action: "pickup" },
            { type: "meat-box", action: "take" },
          ];
          if (orderItem.wasCut) {
            steps.push(
              g.tutorialNavStep(2, 3),
              { type: "cutting-board", action: "use" },
              { type: "wait", until: "cutting-done" }
            );
          }
          if (orderItem.salted && orderItem.peppered) {
            steps.push(
              { type: "counter-place", carrier: "plate" },
              { type: "shaker", which: "salt", action: "pickup" },
              { type: "season", seasoning: "salt" },
              { type: "shaker", which: "pepper", action: "pickup" },
              { type: "season", seasoning: "pepper" },
              { type: "carrier", carrier: "plate", action: "pickup" }
            );
          }
          if (!steps.some((s) => s.type === "nav" && s.to === 3)) {
            steps.push(g.tutorialNavStep(2, 3));
          }
          steps.push(...g.tutorialOvenBakeSteps());
          steps.push(...g.tutorialServeSteps(orderItem, 3));
          return steps;
        }
  
        const crop = orderItem.crop;
        const needsCut =
          orderItem.state === "cut" ||
          (orderItem.state === "baked" && orderItem.wasCut);
        const needsOven = orderItem.state === "baked";
        const needsK2 = needsCut || needsOven;
  
        const steps = [...g.tutorialGardenHarvestSteps(crop), ...g.tutorialWashFoodSteps()];
        if (needsK2) steps.push(g.tutorialNavStep(2, 3));
        if (needsCut) {
          steps.push(
            { type: "cutting-board", action: "use" },
            { type: "wait", until: "cutting-done" }
          );
        }
        if (needsOven) {
          steps.push(...g.tutorialOvenBakeSteps());
        }
        steps.push(...g.tutorialServeSteps(orderItem, needsK2 ? 3 : 2));
        return steps;
      }
  
  g.findTutorialNavArrow = function(fromScreen, toScreen) {
        const section = g.getEl("screen-" + fromScreen);
        if (!section) return null;
        return section.querySelector('.nav-arrow[data-go="' + toScreen + '"]');
      }
  
  g.tutorialShortestPath = function(from, to) {
        if (from === to) return [from];
        const queue = [[from]];
        const seen = new Set([from]);
        while (queue.length) {
          const path = queue.shift();
          const node = path[path.length - 1];
          for (const next of g.TUTORIAL_SCREEN_LINKS[node] || []) {
            if (next === to) return [...path, next];
            if (!seen.has(next)) {
              seen.add(next);
              queue.push([...path, next]);
            }
          }
        }
        return [];
      }
  
  g.getNextScreenToward = function(from, to) {
        const path = g.tutorialShortestPath(from, to);
        return path.length >= 2 ? path[1] : null;
      }
  
  g.tutorialNavSteps = function(from, to) {
        const path = g.tutorialShortestPath(from, to);
        const steps = [];
        for (let i = 0; i < path.length - 1; i++) {
          steps.push(g.tutorialNavStep(path[i], path[i + 1]));
        }
        return steps;
      }
  
  g.getCarrierCounterScreen = function(carrier) {
        const spotId = g.getCarrierRestSpotId(carrier);
        if (!spotId) return null;
        if (spotId.startsWith("s2-")) return 2;
        if (spotId.startsWith("s3-")) return 3;
        return null;
      }
  
  g.getTutorialWaitScreen = function(until) {
        if (until === "sink-ready" || until === "dishwasher-done") return 2;
        if (
          until === "blender-done" ||
          until === "oven-done" ||
          until === "microwave-done" ||
          until === "cutting-done"
        ) {
          return 3;
        }
        return null;
      }
  
  g.getTutorialKitchenScreen = function() {
        const active = g.getActiveScreenNum();
        if (active === 2 || active === 3) return active;
        return null;
      }
  
  g.getTutorialCounterPlaceScreen = function(carrier) {
        const onCounter = g.getCarrierCounterScreen(carrier);
        if (carrier === "tray") {
          if (onCounter && g.isTrayOnCounter()) return onCounter;
          return g.getTutorialKitchenScreen() ?? 3;
        }
        if (carrier === "bowl") {
          if (onCounter) return onCounter;
          return g.getTutorialKitchenScreen() ?? 3;
        }
        if (carrier === "pot" || carrier === "plate") {
          if (onCounter) return onCounter;
          return 2;
        }
        if (onCounter) return onCounter;
        return g.getTutorialKitchenScreen() ?? 2;
      }
  
  g.getTutorialSeasonPayload = function() {
        if (g.potRestSpotId?.startsWith("s2-") && g.potContents) return g.potContents;
        if (g.plateRestSpotId?.startsWith("s2-") && g.plateContents) return g.plateContents;
        if (g.potFollowing && g.potContents) return g.potContents;
        if (g.plateFollowing && g.plateContents) return g.plateContents;
        return null;
      }
  
  g.getTutorialStepScreenCore = function(step) {
        if (!step) return null;
        if (step.type === "nav") return step.to;
        if (step.type === "crop") return 1;
        if (step.type === "sink") return 2;
        if (
          step.type === "meat-box" ||
          step.type === "trash" ||
          step.type === "dishwasher" ||
          step.type === "cafeteria-tray"
        ) {
          return step.type === "cafeteria-tray" ? 6 : 2;
        }
        if (step.type === "shaker" || step.type === "season") return 2;
        if (
          step.type === "blender" ||
          step.type === "oven" ||
          step.type === "microwave" ||
          step.type === "cutting-board"
        ) {
          return 3;
        }
        if (step.type === "cooler" || step.type === "cooler-fill") return 3;
        if (step.type === "cashier-tray") return 5;
        if (step.type === "tray" || step.type === "tray-load") {
          return g.getTutorialKitchenScreen() ?? 3;
        }
        if (step.type === "wait") return g.getTutorialWaitScreen(step.until);
        if (step.type === "counter-place") {
          return g.getTutorialCounterPlaceScreen(step.carrier);
        }
        if (step.type === "counter-combine") {
          if (g.potRestSpotId?.startsWith("s3-")) return 3;
          if (g.potRestSpotId?.startsWith("s2-")) return 2;
          if (g.plateRestSpotId?.startsWith("s3-")) return 3;
          if (g.plateRestSpotId?.startsWith("s2-")) return 2;
          if (g.bowlRestSpotId?.startsWith("s3-")) return 3;
          return g.getTutorialKitchenScreen() ?? 2;
        }
        return null;
      }
  
  g.getTutorialStepScreen = function(step, stepIndex) {
        if (!step) return null;
        if (step.type === "carrier" && step.action === "pickup") {
          if (step.carrier === "basket") return 1;
          if (step.carrier === "tray") return null;
          if (typeof stepIndex === "number") {
            for (let i = stepIndex + 1; i < g.tutorialGuideSteps.length; i++) {
              const nextScreen = g.getTutorialStepScreenCore(g.tutorialGuideSteps[i]);
              if (nextScreen) return nextScreen;
            }
          }
          return null;
        }
        return g.getTutorialStepScreenCore(step);
      }
  
  g.applyTutorialRedirectGlow = function(targetScreen) {
        const current = g.getActiveScreenNum();
        if (!targetScreen || current === targetScreen) return false;
        const nextHop = g.getNextScreenToward(current, targetScreen);
        if (!nextHop) return false;
        const btn = g.findTutorialNavArrow(current, nextHop);
        if (!btn) return false;
        btn.classList.add("tutorial-glow");
        return true;
      }
  
  g.isCarrierHeld = function(carrier) {
        if (carrier === "basket") return g.basketFollowing;
        if (carrier === "plate") return g.plateFollowing;
        if (carrier === "cup") return g.cupFollowing;
        if (carrier === "pot") return g.potFollowing;
        if (carrier === "bowl") return g.bowlFollowing;
        if (carrier === "tray") return g.trayFollowing;
        return false;
      }
  
  g.tutorialTrayHasLoadedCarrier = function(carrier) {
        const slot = g.getTrayPreferredSlot(carrier);
        if (!slot) return false;
        const entry = g.trayContents[slot];
        if (!entry) return false;
        return entry.carrier === carrier;
      }
  
  g.getCurrentTutorialStep = function() {
        if (!g.tutorialGuideActive || g.tutorialGuideIndex >= g.tutorialGuideSteps.length) {
          return null;
        }
        return g.tutorialGuideSteps[g.tutorialGuideIndex];
      }
  
  g.checkTutorialWaitComplete = function(step) {
        if (step.until === "sink-ready") {
          return !!g.sinkContents && !g.sinkWashing && g.sinkContents.state === "washed";
        }
        if (step.until === "blender-done") {
          return !!g.blenderResult && !g.blenderBlending;
        }
        if (step.until === "oven-done") {
          return !!g.ovenResult && !g.ovenBaking;
        }
        if (step.until === "microwave-done") {
          return !!g.microwaveResult && !g.microwaveHeating;
        }
        if (step.until === "cutting-done") {
          return (
            !g.cuttingInProgress &&
            g.plateFollowing &&
            g.plateContents &&
            g.plateContents.state === "cut"
          );
        }
        if (step.until === "dishwasher-done") {
          return (
            !g.dishwasherWashing &&
            !g.dishwasherLoad &&
            !g.plateDirty &&
            !g.trayDirty
          );
        }
        return false;
      }
  
  g.shouldAutoSkipTutorialStep = function(step) {
        if (!step) return false;
        if (step.type === "wait") return g.checkTutorialWaitComplete(step);
        if (step.type === "carrier" && step.action === "pickup") {
          return g.isCarrierHeld(step.carrier);
        }
        if (step.type === "nav") {
          const active = g.root.querySelector(".screen.active");
          const current = active ? Number(active.dataset.screen) : null;
          return current === step.to;
        }
        if (step.type === "cooler" && step.action === "open") {
          return !!g.kitchenCooler?.classList.contains("open");
        }
        if (step.type === "oven" && step.action === "open") {
          return !!g.kitchenOven?.classList.contains("open");
        }
        if (step.type === "microwave" && step.action === "open") {
          return !!g.kitchenMicrowave?.classList.contains("open");
        }
        if (step.type === "tray-load") {
          return g.tutorialTrayHasLoadedCarrier(step.carrier);
        }
        if (step.type === "tray" && step.action === "done") {
          return g.trayHasLoad() && !g.isTrayCloseupOpen();
        }
        if (step.type === "cashier-tray" && step.action === "place") {
          return g.trayAtCashier;
        }
        if (step.type === "meat-box" && step.action === "take") {
          return (
            g.plateFollowing &&
            g.plateContents &&
            g.plateContents.crop === "meat" &&
            g.plateContents.state === "raw"
          );
        }
        if (step.type === "trash" && step.action === "throw") {
          return g.plateDirty && !g.plateContents;
        }
        if (step.type === "dishwasher" && step.action === "open") {
          return !!g.kitchenDishwasher?.classList.contains("open");
        }
        if (step.type === "dishwasher" && step.action === "load") {
          return (
            g.dishwasherWashing ||
            g.dishwasherLoad === "plate" ||
            g.dishwasherLoad === "tray"
          );
        }
        if (step.type === "cafeteria-tray" && step.action === "pickup") {
          return g.trayFollowing && g.trayDirty;
        }
        if (step.type === "counter-place") {
          if (step.carrier === "tray") return g.isTrayOnCounter();
          const spotId = g.getCarrierRestSpotId(step.carrier);
          if (spotId) {
            const expect = g.getTutorialCounterPlaceScreen(step.carrier);
            if (expect === 2 && spotId.startsWith("s2-")) return true;
            if (expect === 3 && spotId.startsWith("s3-")) return true;
          }
          if (step.carrier === "pot") {
            if (
              g.potFollowing &&
              g.potContents &&
              g.isPotSoup(g.potContents) &&
              g.potContents.salted &&
              g.potContents.peppered
            ) {
              return true;
            }
            return false;
          }
          if (step.carrier === "plate") {
            if (g.plateFollowing && g.plateContents && g.isFrenchFriesPrep(g.plateContents)) {
              return true;
            }
            return false;
          }
          if (step.carrier === "bowl") return false;
        }
        if (step.type === "season") {
          const payload = g.getTutorialSeasonPayload();
          if (!payload) return false;
          if (step.seasoning === "salt") return !!payload.salted;
          if (step.seasoning === "pepper") return !!payload.peppered;
        }
        if (step.type === "shaker" && step.action === "pickup") {
          const payload = g.getTutorialSeasonPayload();
          if (!payload) return false;
          if (step.which === "salt") return !!payload.salted;
          if (step.which === "pepper") return !!payload.peppered;
        }
        if (step.type === "counter-combine") {
          if (!g.potRestSpotId || !g.potContents || !g.isPotSoup(g.potContents)) return false;
          if (g.isFinishedSoupPrep(g.potContents)) return true;
          if (
            g.potContents.stew &&
            g.potContents.soup !== "potatoes" &&
            g.potContents.soup !== "tomatoes"
          ) {
            return true;
          }
        }
        return false;
      }
  
  g.getTutorialPrerequisiteCarrier = function(step) {
        if (!step) return null;
        if (step.type === "crop") return "basket";
        if (step.type === "sink") return "plate";
        if (step.type === "cutting-board") return "plate";
        if (step.type === "blender") {
          if (step.action === "drop") return "plate";
          if (step.action === "take-soup") return "pot";
          if (step.action === "take-flour") return "bowl";
          if (step.action === "take-juice" || step.action === "take-fill-cup") return "cup";
        }
        if (step.type === "oven") {
          if (step.action === "drop" || step.action === "take") return "plate";
        }
        if (step.type === "microwave") {
          if (step.action === "drop" || step.action === "take") return "pot";
        }
        if (step.type === "cooler-fill") return "cup";
        if (step.type === "meat-box") return "plate";
        if (step.type === "counter-combine") return "pot";
        return null;
      }
  
  g.getTutorialPrerequisiteScreen = function(carrier) {
        if (carrier === "basket") return 1;
        return null;
      }
  
  g.tutorialRewindOnCarrierPutDown = function(carrier) {
        if (!g.tutorialGuideActive || !g.tutorialMode || g.tutorialGuideIndex <= 0) return;
        const prev = g.tutorialGuideSteps[g.tutorialGuideIndex - 1];
        if (
          prev?.type !== "carrier" ||
          prev.carrier !== carrier ||
          prev.action !== "pickup"
        ) {
          return;
        }
        const cur = g.getCurrentTutorialStep();
        if (!cur) return;
        if (cur.type === "carrier" && cur.carrier === carrier && cur.action === "pickup") {
          return;
        }
        if (g.getTutorialPrerequisiteCarrier(cur) === carrier) {
          g.tutorialGuideIndex -= 1;
        }
      }
  
  g.applyTutorialGlowForStep = function(step, stepIndex) {
        if (!step) return;
        const prereq = g.getTutorialPrerequisiteCarrier(step);
        if (prereq && !g.isCarrierHeld(prereq)) {
          const prereqScreen = g.getTutorialPrerequisiteScreen(prereq);
          if (
            prereqScreen &&
            g.applyTutorialRedirectGlow(prereqScreen)
          ) {
            return;
          }
          const prereqEl = g.getEl(prereq);
          if (prereqEl) {
            prereqEl.classList.add("tutorial-glow");
            return;
          }
        }
        if (g.applyTutorialRedirectGlow(g.getTutorialStepScreen(step, stepIndex))) return;
        if (step.type === "nav") {
          const current = g.getActiveScreenNum();
          if (current !== step.to) {
            const nextHop = g.getNextScreenToward(current, step.to);
            if (nextHop) {
              const btn = g.findTutorialNavArrow(current, nextHop);
              if (btn) btn.classList.add("tutorial-glow");
            }
          }
          return;
        }
        if (step.type === "carrier") {
          const spotId = g.getCarrierRestSpotId(step.carrier);
          if (spotId && step.action === "pickup" && !g.isCarrierHeld(step.carrier)) {
            const spot = g.root.querySelector(
              '.counter-rest-spot[data-spot="' + spotId + '"]'
            );
            if (spot) spot.classList.add("tutorial-glow");
          }
          const el = g.getEl(step.carrier);
          if (el && step.action === "pickup" && !g.isCarrierHeld(step.carrier)) {
            el.classList.add("tutorial-glow");
          }
          return;
        }
        if (step.type === "crop") {
          g.root.querySelectorAll('.plant[data-crop="' + step.crop + '"]').forEach((plant) => {
            plant.classList.add("tutorial-glow");
          });
          return;
        }
        if (step.type === "sink") {
          g.kitchenSink?.classList.add("tutorial-glow");
          return;
        }
        if (step.type === "blender") {
          g.kitchenBlender?.classList.add("tutorial-glow");
          return;
        }
        if (step.type === "oven") {
          g.kitchenOven?.classList.add("tutorial-glow");
          return;
        }
        if (step.type === "cooler" && step.action === "open") {
          g.kitchenCooler?.classList.add("tutorial-glow");
          return;
        }
        if (step.type === "cooler-fill") {
          const drinkBtn = g.root.querySelector(
            '.cooler-drink[data-drink="' + step.drink + '"]'
          );
          if (drinkBtn) drinkBtn.classList.add("tutorial-glow");
          return;
        }
        if (step.type === "cutting-board") {
          g.kitchenCuttingBoard?.classList.add("tutorial-glow");
          return;
        }
        if (step.type === "microwave") {
          g.kitchenMicrowave?.classList.add("tutorial-glow");
          return;
        }
        if (step.type === "meat-box") {
          if (g.meatBox) g.meatBox.classList.add("tutorial-glow");
          return;
        }
        if (step.type === "trash") {
          const trash = g.getEl("kitchenTrash");
          if (trash) trash.classList.add("tutorial-glow");
          return;
        }
        if (step.type === "dishwasher") {
          if (g.kitchenDishwasher) g.kitchenDishwasher.classList.add("tutorial-glow");
          return;
        }
        if (step.type === "cafeteria-tray" && step.action === "pickup") {
          if (g.cafeteriaCartPickup?.classList.contains("can-pickup")) {
            g.cafeteriaCartPickup.classList.add("tutorial-glow");
          }
          return;
        }
        if (step.type === "counter-place" || step.type === "counter-combine") {
          if (step.type === "counter-place") {
            const spotId = g.getCarrierRestSpotId(step.carrier);
            if (spotId && !g.isCarrierFollowing(step.carrier)) {
              const spot = g.root.querySelector(
                '.counter-rest-spot[data-spot="' + spotId + '"]'
              );
              if (spot) spot.classList.add("tutorial-glow");
              const onCounter = g.getCarrierEl(step.carrier);
              if (onCounter) onCounter.classList.add("tutorial-glow");
              return;
            }
          }
          g.root.querySelectorAll(".counter-rest-spot").forEach((spot) => {
            if (step.type === "counter-place" && spot.classList.contains("can-place")) {
              spot.classList.add("tutorial-glow");
            }
            if (step.type === "counter-combine" && spot.classList.contains("can-combine")) {
              spot.classList.add("tutorial-glow");
            }
          });
          return;
        }
        if (step.type === "shaker") {
          const shaker = step.which === "salt" ? g.saltShaker : g.pepperShaker;
          if (shaker && step.action === "pickup") shaker.classList.add("tutorial-glow");
          return;
        }
        if (step.type === "season") {
          g.root.querySelectorAll(".counter-rest-spot.can-season").forEach((spot) => {
            spot.classList.add("tutorial-glow");
          });
          const payload = g.getTutorialSeasonPayload();
          if (payload) {
            if (g.potRestSpotId && g.potContents === payload && g.pot) {
              g.pot.classList.add("tutorial-glow");
            } else if (g.plateRestSpotId && g.plateContents === payload && g.plate) {
              g.plate.classList.add("tutorial-glow");
            }
          }
          return;
        }
        if (step.type === "tray" && step.action === "place-food") {
          if (g.trayActionMenu?.classList.contains("open") && g.trayMenuPlaceFood) {
            g.trayMenuPlaceFood.classList.add("tutorial-glow");
          } else if (g.isTrayOnCounter() && g.tray) {
            g.tray.classList.add("tutorial-glow");
          }
          return;
        }
        if (step.type === "tray" && step.action === "done") {
          if (g.trayCloseupDone) g.trayCloseupDone.classList.add("tutorial-glow");
          return;
        }
        if (step.type === "tray-load") {
          const source = g.trayCloseupSources?.querySelector(
            '.tray-source[data-carrier="' + step.carrier + '"]'
          );
          if (source) source.classList.add("tutorial-glow");
          return;
        }
        if (step.type === "cashier-tray" && step.action === "place") {
          if (g.cashierTraySpot) g.cashierTraySpot.classList.add("tutorial-glow");
        }
      }
  
  g.refreshTutorialGlow = function() {
        g.clearTutorialGlows();
        if (!g.tutorialMode || !g.tutorialGuideActive) return;

        try {
          while (g.tutorialGuideIndex < g.tutorialGuideSteps.length) {
            const step = g.getCurrentTutorialStep();
            if (!step) break;
            if (g.shouldAutoSkipTutorialStep(step)) {
              g.tutorialGuideIndex += 1;
              continue;
            }
            if (step.type === "wait") {
              if (g.checkTutorialWaitComplete(step)) {
                g.tutorialGuideIndex += 1;
                continue;
              }
              g.applyTutorialGlowForStep(step, g.tutorialGuideIndex);
              return;
            }
            g.applyTutorialGlowForStep(step, g.tutorialGuideIndex);
            return;
          }

          const finishingDishwash = g.tutorialDishwashPhase;
          g.stopTutorialGuide();
          if (finishingDishwash) {
            g.finishTutorialDishwashPhase();
          }
        } catch (err) {
          console.error("Restaurant Rush tutorial glow failed:", err);
        }
      }
  
  g.tutorialStepMatches = function(action, step) {
        if (!step || action.type !== step.type) return false;
        if (step.type === "nav") {
          return action.from === step.from && action.to === step.to;
        }
        if (step.type === "carrier") {
          return action.carrier === step.carrier && action.action === step.action;
        }
        if (step.type === "crop") return action.crop === step.crop;
        if (step.type === "sink") return action.action === step.action;
        if (step.type === "blender") return action.action === step.action;
        if (step.type === "oven") return action.action === step.action;
        if (step.type === "cooler") return action.action === step.action;
        if (step.type === "microwave") return action.action === step.action;
        if (step.type === "cutting-board") return action.action === step.action;
        if (step.type === "meat-box") return action.action === step.action;
        if (step.type === "trash") return action.action === step.action;
        if (step.type === "dishwasher") return action.action === step.action;
        if (step.type === "cafeteria-tray") return action.action === step.action;
        if (step.type === "cooler-fill") return action.drink === step.drink;
        if (step.type === "counter-place") return action.carrier === step.carrier;
        if (step.type === "counter-combine") return true;
        if (step.type === "shaker") {
          return action.which === step.which && action.action === step.action;
        }
        if (step.type === "season") return action.seasoning === step.seasoning;
        if (step.type === "tray") return action.action === step.action;
        if (step.type === "tray-load") return action.carrier === step.carrier;
        if (step.type === "cashier-tray") return action.action === step.action;
        return false;
      }
  
  g.advanceTutorialGuide = function() {
        if (!g.tutorialGuideActive) return;
        g.tutorialGuideIndex += 1;
        g.refreshTutorialGlow();
      }
  
  g.maybeAdvanceTutorialGuide = function(action) {
        if (!g.tutorialGuideActive || !g.tutorialMode) return;
        const step = g.getCurrentTutorialStep();
        if (!step || step.type === "wait") return;
        if (!g.tutorialStepMatches(action, step)) return;
        g.advanceTutorialGuide();
      }
  
  g.handleTutorialNavPress = function(btn, destScreen) {
        const step = g.getCurrentTutorialStep();
        if (!step || step.type !== "nav") return false;
        if (!btn.classList.contains("tutorial-glow")) return false;
        const active = g.root.querySelector(".screen.active");
        const fromScreen = active ? Number(active.dataset.screen) : null;
        if (fromScreen !== step.from || destScreen !== step.to) return false;
        g.maybeAdvanceTutorialGuide({ type: "nav", from: step.from, to: step.to });
        return true;
      }
  
  g.startTutorialGuide = function(steps) {
        if (!steps || !steps.length) return;
        g.tutorialGuideSteps = steps;
        g.tutorialGuideIndex = 0;
        g.tutorialGuideActive = true;
        g.refreshTutorialGlow();
      }
  
  g.stopTutorialGuide = function() {
        g.tutorialGuideActive = false;
        g.tutorialGuideSteps = [];
        g.tutorialGuideIndex = 0;
        g.clearTutorialGlows();
      }
  
  g.buildTutorialCashierOrder = function() {
        const kind =
          g.TUTORIAL_ORDER_SEQUENCE[
            g.tutorialCustomerIndex % g.TUTORIAL_ORDER_SEQUENCE.length
          ];
        g.tutorialCustomerIndex += 1;
        let catalog = g.CASHIER_ORDER_FOODS;
        if (kind === "drink") catalog = g.TUTORIAL_COOLER_DRINKS;
        else if (kind === "soup") catalog = g.TUTORIAL_SOUPS;
        const item = catalog[Math.floor(Math.random() * catalog.length)];
        return { items: [{ ...item }] };
      }
  
  g.startTutorial = function() {
        g.beginPlaySession({ tutorial: true });
      }
  
}

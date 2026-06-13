const screens = root.querySelectorAll(".screen");

    const SCREEN_NAMES = {
      1: "Garden",
      2: "Kitchen 1",
      3: "Kitchen 2",
      4: "Storefront",
      5: "Cashier",
      6: "Cafeteria",
    };

    function getScreenName(num) {
      return SCREEN_NAMES[num] || "Screen " + num;
    }

    function applyScreenLabels() {
      root.querySelectorAll(".screen[data-screen]").forEach((section) => {
        const num = Number(section.dataset.screen);
        const name = getScreenName(num);
        section.querySelectorAll(".corner-num").forEach((el) => {
          el.textContent = name;
        });
      });
      root.querySelectorAll(".nav-arrow[data-go]").forEach((btn) => {
        const num = Number(btn.dataset.go);
        const name = getScreenName(num);
        btn.setAttribute("aria-label", "Go to " + name);
        const destEl = btn.querySelector(".dest");
        if (destEl) destEl.textContent = name;
      });
    }

    function showScreen(num) {
      screens.forEach((s) => s.classList.remove("active"));
      const el = getEl("screen-" + num);
      if (el) el.classList.add("active");
      root.classList.toggle("on-storefront", num === 4);
      if (num === 4) putDownOtherCarriers("");
      if (mopFollowing) {
        const mopOk =
          isNighttime && (num === 2 || num === 3 || num === 6);
        if (!mopOk) putDownMop();
      }
      if (num === 6) {
        refreshCafeteriaDiners();
        updateCafeteriaCartUI();
      }
    }

    function randomCustomerLook() {
      const gender = Math.random() < 0.5 ? "boy" : "girl";
      const skins = ["pale", "peach", "dark"];
      const skin = skins[Math.floor(Math.random() * skins.length)];
      const hasLipstick = gender === "girl" && Math.random() < 0.4;
      const hasMustache = gender === "boy" && Math.random() < 0.4;
      return { gender, skin, hasLipstick, hasMustache };
    }

    function customerClassNames(look) {
      const classes = [
        "customer",
        "customer-" + look.gender,
        "skin-" + look.skin,
      ];
      if (look.hasLipstick) classes.push("has-lipstick");
      if (look.hasMustache) classes.push("has-mustache");
      return classes.join(" ");
    }

    function customerFigureMarkup(look) {
      if (!look) return "";
      return (
        '<div class="' +
        customerClassNames(look) +
        '" aria-hidden="true">' +
        '<div class="customer-head">' +
        '<div class="customer-face">' +
        '<div class="customer-eyes" aria-hidden="true">' +
        '<span class="customer-eye-group"><span class="customer-lashes" aria-hidden="true"></span><span class="customer-eye eye-l"></span></span>' +
        '<span class="customer-eye-group"><span class="customer-lashes" aria-hidden="true"></span><span class="customer-eye eye-r"></span></span>' +
        "</div></div>" +
        '<div class="customer-lipstick" aria-hidden="true"></div>' +
        '<div class="customer-mustache" aria-hidden="true"></div>' +
        "</div>" +
        '<div class="customer-body"></div>' +
        "</div>"
      );
    }

    function randomCafeteriaSeat() {
      if (Math.random() >= 0.82) return null;
      return randomCustomerLook();
    }

    function clearCafeteriaDiners() {
      root.querySelectorAll(".caf-diner-slot").forEach((slot) => {
        slot.innerHTML = "";
      });
    }

    function refreshCafeteriaDiners() {
      if (isNighttime) {
        clearCafeteriaDiners();
        return;
      }
      root.querySelectorAll(".dinette-set").forEach((set) => {
        const leftSlot = set.querySelector(".caf-diner-slot--left");
        const rightSlot = set.querySelector(".caf-diner-slot--right");
        if (!leftSlot || !rightSlot) return;
        leftSlot.innerHTML = customerFigureMarkup(randomCafeteriaSeat());
        rightSlot.innerHTML = customerFigureMarkup(randomCafeteriaSeat());
      });
    }

    applyScreenLabels();

    const basket = getEl("basket");
    const basketHome = getEl("basketHome");
    const basketItem = getEl("basketItem");
    const plate = getEl("plate");
    const plateHome = getEl("plateHome");
    const mop = getEl("mop");
    const mopHome = getEl("mopHome");
    const plateItem = getEl("plateItem");
    const cup = getEl("cup");
    const cupHome = getEl("cupHome");
    const cupItem = getEl("cupItem");
    const pot = getEl("pot");
    const potHome = getEl("potHome");
    const bowl = getEl("bowl");
    const bowlHome = getEl("bowlHome");
    const tray = getEl("tray");
    const trayHome = getEl("trayHome");
    const trayStackBadge = getEl("trayStackBadge");
    const trayStackLayers = getEl("trayStackLayers");
    const trayActionMenu = getEl("trayActionMenu");
    const trayMenuPickUp = getEl("trayMenuPickUp");
    const trayMenuPlaceFood = getEl("trayMenuPlaceFood");
    const trayCloseup = getEl("trayCloseup");
    const trayCloseupDone = getEl("trayCloseupDone");
    const trayCloseupSources = getEl("trayCloseupSources");
    const trayCloseupSlots = getEl("trayCloseupSlots");
    const kitchenCuttingBoard = getEl("kitchenCuttingBoard");
    const cuttingBoardZone = getEl("cuttingBoardZone");
    const cuttingBoardFood = getEl("cuttingBoardFood");
    const cuttingBoardTimer = getEl("cuttingBoardTimer");
    const ovenZone = getEl("ovenZone");
    const ovenFood = getEl("ovenFood");
    const ovenTimer = getEl("ovenTimer");
    const microwaveZone = getEl("microwaveZone");
    const microwavePot = getEl("microwavePot");
    const microwaveTimer = getEl("microwaveTimer");
    const kitchenSink = getEl("kitchenSink");
    const meatBox = getEl("meatBox");
    const sinkBasin = getEl("sinkBasin");
    const sinkItem = getEl("sinkItem");
    const sinkSparkle = getEl("sinkSparkle");
    const sinkWashTimer = getEl("sinkWashTimer");
    const dishwasherZone = getEl("dishwasherZone");
    const dishwasherItem = getEl("dishwasherItem");
    const dishwasherWashTimer = getEl("dishwasherWashTimer");
    const gardenRow = getEl("gardenRow");
    const plants = gardenRow
      ? gardenRow.querySelectorAll(".plant[data-crop]")
      : [];

    let basketFollowing = false;
    let basketContents = null;
    let plateFollowing = false;
    let mopFollowing = false;
    let mopSwishTimer = null;
    const MUD_PUDDLE_SCREENS = [2, 3, 6];
    const MUD_PUDDLE_MAX = 4;
    const MUD_FLOOR_ASPECT = 0.22;
    const mudPuddlesByScreen = { 2: [], 3: [], 6: [] };
    let plateContents = null;
    let cupFollowing = false;
    let cupContents = null;
    let potFollowing = false;
    let potContents = null;
    let bowlFollowing = false;
    let bowlContents = null;
    let plateDirty = false;
    let cupDirty = false;
    let potDirty = false;
    let bowlDirty = false;
    let trayDirty = false;
    let plateRestSpotId = null;
    let cupRestSpotId = null;
    let potRestSpotId = null;
    let bowlRestSpotId = null;
    let trayFollowing = false;
    let trayRestSpotId = null;
    let trayAtCashier = false;
    let suppressTrayClickUntil = 0;
    let trayContents = { soup: null, drink: null, food: null, extra: null };
    let saltFollowing = false;
    let pepperFollowing = false;
    const counterSpotOccupants = new Map();
    const TRAY_SLOTS = ["soup", "drink", "food", "extra"];
    const TRAY_STACK_MAX = 4;
    let traysAtHome = TRAY_STACK_MAX;
    let cafeteriaCartDirtyTrays = 0;

    /** Counter food + shaker → which seasonings apply (see getSeasoningTargetKey) */
    const FOOD_SEASONING = {
      "plate:meat:raw": { salt: true, pepper: true },
      "plate:meat:cut": { salt: true, pepper: true },
      "pot:carrots:cold": { salt: true, pepper: true },
      "pot:cucumbers:cold": { salt: true, pepper: true },
      "pot:potato-soup-prep": { salt: true, pepper: true },
      "pot:meat-potato-soup-prep": { salt: true, pepper: true },
      "pot:meat-stew-prep": { salt: true, pepper: true },
      "pot:tomato-soup-prep": { salt: true, pepper: true },
      "plate:french-fries:prep": { salt: true },
    };
    let sinkContents = null;
    let sinkWashing = false;
    let sinkTimerInterval = null;
    let dishwasherLoad = null;
    let dishwasherWashing = false;
    let dishwasherTimerInterval = null;
    let blenderResult = null;
    let blenderBlending = false;
    let blenderFruitFood = null;
    let blenderTimerInterval = null;
    let cuttingInProgress = false;
    let cuttingFood = null;
    let cuttingTimerInterval = null;
    let ovenBaking = false;
    let ovenBakingInput = null;
    let ovenResult = null;
    let ovenTimerInterval = null;
    let microwaveHeating = false;
    let microwaveHeatingSoup = null;
    let microwaveResult = null;
    let microwaveTimerInterval = null;
    const SINK_WASH_SEC = 3;
    const DISHWASHER_WASH_SEC = 3;
    const BLENDER_BLEND_SEC = 3;
    const CUT_SEC = 3;
    const OVEN_BAKE_SEC = 4;
    const MICROWAVE_HEAT_SEC = 3;
    const CUTTABLE_CROPS = new Set([
      "apples",
      "pineapple",
      "carrots",
      "cucumbers",
      "tomatoes",
      "potatoes",
    ]);
    const BLENDER_JUICE_CROPS = new Set(["grapes", "apples", "pineapple"]);
    const BLENDER_SOUP_CROPS = new Set(["carrots", "cucumbers", "potatoes", "tomatoes"]);
    const OVEN_CROPS = new Set([
      "apples",
      "grapes",
      "pineapple",
      "tomatoes",
      "carrots",
      "potatoes",
      "cucumbers",
      "beans",
      "meat",
    ]);

    // Recipe steps: food names + appliances only (oven, blender, cutting board, microwave, MEAT box, etc.).
    // No sink, dishwasher, or carriers (plate, cup, bowl, pot, tray).
    const RECIPE_BOOK = [
      {
        id: "bread",
        name: "Bread",
        steps: "Wheat + Blender + Water + Oven",
      },
      {
        id: "baked-apples",
        name: "Baked apple",
        steps: "Apples + Oven",
      },
      {
        id: "baked-grapes",
        name: "Baked grapes",
        steps: "Grapes + Oven",
      },
      {
        id: "baked-pineapple",
        name: "Baked pineapple",
        steps: "(Pineapple + Cutting board) + Oven",
      },
      {
        id: "baked-tomatoes",
        name: "Baked tomato",
        steps: "Tomatoes + Oven",
      },
      {
        id: "baked-carrots",
        name: "Baked carrot",
        steps: "Carrots + Oven",
      },
      {
        id: "baked-potatoes",
        name: "Baked potato",
        steps: "Potatoes + Oven",
      },
      {
        id: "french-fries",
        name: "French fries",
        steps: "Potatoes + Cutting board + Oven + Salt",
      },
      {
        id: "baked-cucumbers",
        name: "Baked cucumber",
        steps: "Cucumbers + Oven",
      },
      {
        id: "baked-beans",
        name: "Baked beans",
        steps: "Beans + Oven",
      },
      {
        id: "cut-apples",
        name: "Chopped apples",
        steps: "Apples + Cutting board",
      },
      {
        id: "cut-pineapple",
        name: "Chopped pineapple",
        steps: "Pineapple + Cutting board",
      },
      {
        id: "cut-carrots",
        name: "Chopped carrots",
        steps: "Carrots + Cutting board",
      },
      {
        id: "cut-cucumbers",
        name: "Chopped cucumbers",
        steps: "Cucumbers + Cutting board",
      },
      {
        id: "cut-tomatoes",
        name: "Chopped tomatoes",
        steps: "Tomatoes + Cutting board",
      },
      {
        id: "juice-grapes",
        name: "Grape juice",
        steps: "Grapes + Blender",
      },
      {
        id: "juice-apples",
        name: "Apple juice",
        steps: "Apples + Blender",
      },
      {
        id: "juice-pineapple",
        name: "Pineapple juice",
        steps: "Pineapple + Blender",
      },
      {
        id: "carrot-soup",
        name: "Carrot Soup",
        steps: "Carrots + Blender + Salt + Pepper + Microwave",
      },
      {
        id: "cucumber-soup",
        name: "Cucumber Soup",
        steps: "Cucumbers + Blender + Salt + Pepper + Microwave",
      },
      {
        id: "potato-soup",
        name: "Potato Soup",
        steps:
          "Potatoes + Blender + (Carrots + Cutting board) + Salt + Pepper + Microwave",
      },
      {
        id: "tomato-soup",
        name: "Tomato Soup",
        steps:
          "Tomatoes + Blender + (Tomatoes + Cutting board) + Salt + Pepper + Microwave",
      },
      {
        id: "cooked-meat",
        name: "Cooked meat",
        steps: "MEAT + Oven",
      },
      {
        id: "chopped-cooked-meat",
        name: "Chopped & cooked meat",
        steps: "(MEAT + Cutting board) + Oven",
      },
      {
        id: "seasoned-steak",
        name: "Seasoned steak",
        steps: "(MEAT + Salt + Pepper) + Oven",
      },
      {
        id: "steak-sandwich",
        name: "Steak sandwich",
        steps:
          "(Wheat + Blender + Water + Oven) + (MEAT + Oven) + (Tomatoes + Cutting board)",
      },
      {
        id: "meat-potato-stew",
        name: "Meat & potato stew",
        steps:
          "Potatoes + Blender + (Carrots + Cutting board) + (MEAT + Cutting board) + Oven + Salt + Pepper + Microwave",
      },
      {
        id: "meat-stew",
        name: "Meat stew",
        steps:
          "MEAT + Blender + (Potatoes + Cutting board) + (Carrots + Cutting board) + Salt + Pepper + Microwave",
      },
    ];

    function countRecipeSteps(steps) {
      const flat = steps.replace(/[()]/g, "");
      return flat.split(" + ").map((part) => part.trim()).filter(Boolean).length;
    }

    const RECIPE_STEP_COUNTS = Object.fromEntries(
      RECIPE_BOOK.map((r) => [r.id, countRecipeSteps(r.steps)])
    );

    function cashierCatalogItemStepCount(item) {
      if (item.kind === "drink") {
        if (item.drink.startsWith("juice-")) {
          return RECIPE_STEP_COUNTS[item.drink] ?? 2;
        }
        return 1;
      }
      if (item.kind === "soup") {
        const recipeId = {
          carrot: "carrot-soup",
          cucumber: "cucumber-soup",
          potato: "potato-soup",
          tomato: "tomato-soup",
          "meat-potato": "meat-potato-stew",
          "meat-stew": "meat-stew",
        }[item.recipe];
        return RECIPE_STEP_COUNTS[recipeId] ?? 5;
      }
      if (item.kind === "food") {
        if (item.crop === "steak-sandwich") {
          return RECIPE_STEP_COUNTS["steak-sandwich"];
        }
        if (item.crop === "french-fries") {
          return RECIPE_STEP_COUNTS["french-fries"];
        }
        if (item.crop === "bread") return RECIPE_STEP_COUNTS.bread;
        if (item.crop === "meat") {
          if (item.salted && item.peppered) {
            return RECIPE_STEP_COUNTS["seasoned-steak"];
          }
          if (item.wasCut) return RECIPE_STEP_COUNTS["chopped-cooked-meat"];
          return RECIPE_STEP_COUNTS["cooked-meat"];
        }
        if (item.state === "baked" && item.wasCut) {
          return RECIPE_STEP_COUNTS["baked-pineapple"];
        }
        const recipeId =
          (item.state === "cut" ? "cut-" : "baked-") + item.crop;
        return RECIPE_STEP_COUNTS[recipeId] ?? 2;
      }
      return 2;
    }

    function cashierCatalogItemWeight(item) {
      return 1 / cashierCatalogItemStepCount(item);
    }

    const DRINK_LABELS = {
      water: "Water",
      milk: "Milk",
      sprite: "Sprite",
      rootbeer: "Root",
      coke: "Coke",
      lemonade: "Lemon",
      "juice-grapes": "Grape",
      "juice-apples": "Apple",
      "juice-pineapple": "Pine",
    };

    const SOUP_LABELS = {
      carrots: "Carrot",
      cucumbers: "Cuke",
      potatoes: "Potato",
      tomatoes: "Tomato",
      meat: "Meat",
    };

    const BOWL_LABELS = {
      flour: "Flour",
      dough: "Dough",
      batter: "Batter",
      "mix-apples": "Apple mix",
      "mix-pineapple": "Fruit mix",
    };

    const STEW_LABELS = {
      carrots: "Stew",
      cucumbers: "Stew",
      potatoes: "Chowder",
      tomatoes: "Stew",
    };

    const CASHIER_DRINK_LABELS = {
      water: "Water",
      milk: "Milk",
      sprite: "Sprite",
      rootbeer: "Root beer",
      coke: "Coke",
      lemonade: "Lemonade",
      "juice-grapes": "Grape juice",
      "juice-apples": "Apple juice",
      "juice-pineapple": "Pineapple juice",
    };

    const CASHIER_ORDER_DRINKS = Object.keys(CASHIER_DRINK_LABELS).map((drink) => ({
      kind: "drink",
      drink,
      label: CASHIER_DRINK_LABELS[drink],
    }));

    const TUTORIAL_COOLER_DRINKS = CASHIER_ORDER_DRINKS.filter(
      (item) => !item.drink.startsWith("juice-")
    );

    const CASHIER_ORDER_SOUPS = [
      { kind: "soup", recipe: "carrot", label: "Carrot soup" },
      { kind: "soup", recipe: "cucumber", label: "Cucumber soup" },
      { kind: "soup", recipe: "potato", label: "Potato soup" },
      { kind: "soup", recipe: "meat-potato", label: "Meat & potato stew" },
      { kind: "soup", recipe: "meat-stew", label: "Meat stew" },
      { kind: "soup", recipe: "tomato", label: "Tomato soup" },
    ];

    const TUTORIAL_SOUPS = CASHIER_ORDER_SOUPS.filter(
      (item) => item.recipe !== "meat-potato" && item.recipe !== "meat-stew"
    );

    const CASHIER_ORDER_FOODS = [
      { kind: "food", crop: "bread", state: "baked", label: "Bread" },
      { kind: "food", crop: "apples", state: "baked", label: "Baked apple" },
      { kind: "food", crop: "grapes", state: "baked", label: "Baked grapes" },
      {
        kind: "food",
        crop: "pineapple",
        state: "baked",
        wasCut: true,
        label: "Baked pineapple",
      },
      { kind: "food", crop: "tomatoes", state: "baked", label: "Baked tomato" },
      { kind: "food", crop: "carrots", state: "baked", label: "Baked carrot" },
      { kind: "food", crop: "potatoes", state: "baked", label: "Baked potato" },
      { kind: "food", crop: "french-fries", state: "ready", label: "French fries" },
      { kind: "food", crop: "cucumbers", state: "baked", label: "Baked cucumber" },
      { kind: "food", crop: "beans", state: "baked", label: "Baked beans" },
      { kind: "food", crop: "carrots", state: "cut", label: "Chopped carrots" },
      { kind: "food", crop: "cucumbers", state: "cut", label: "Chopped cucumbers" },
      { kind: "food", crop: "tomatoes", state: "cut", label: "Chopped tomatoes" },
      { kind: "food", crop: "apples", state: "cut", label: "Chopped apples" },
      { kind: "food", crop: "pineapple", state: "cut", label: "Chopped pineapple" },
      { kind: "food", crop: "meat", state: "baked", label: "Cooked meat" },
      {
        kind: "food",
        crop: "meat",
        state: "baked",
        wasCut: true,
        label: "Chopped & cooked meat",
      },
      {
        kind: "food",
        crop: "meat",
        state: "baked",
        salted: true,
        peppered: true,
        label: "Seasoned steak",
      },
      { kind: "food", crop: "steak-sandwich", state: "ready", label: "Steak sandwich" },
    ];

    const CASHIER_ORDER_COUNT_OPTIONS = (() => {
      const opts = [];
      for (let d = 1; d <= 2; d++) {
        for (let s = 0; s <= 2; s++) {
          for (let f = 0; f <= 2; f++) {
            const total = d + s + f;
            if (total < 2 || total > 4) continue;
            if (s + f < 1) continue;
            opts.push({ drink: d, soup: s, food: f });
          }
        }
      }
      return opts;
    })();

    let cashierCurrentOrder = null;
    let cashierSequenceBusy = false;
    let cashierLastOrderSig = "";
    let cashierToastTimer = null;
    let tutorialMode = false;
    let tutorialCustomerIndex = 0;
    let garyIntroComplete = false;
    let garyTypeTimer = null;
    let garyCustomerEnterHeld = false;
    let garyCustomerEnterWaiters = [];
    let tutorialGuideSteps = [];
    let tutorialGuideIndex = 0;
    let tutorialGuideActive = false;
    let tutorialDishwashPhase = false;
    let tutorialDishwashVariant = null;
    let tutorialDishwashGaryPlayed = false;
    let tutorialResumeOrderItem = null;
    let tutorialDishwashQueue = false;

    const TUTORIAL_ORDER_SEQUENCE = ["food", "drink", "soup"];

    const GARY_INTRO_TEXT =
      "Hi! I'm Gary. I will be showing you how to maintain your restaurant!";
    const GARY_DRINK_DONE_TEXT =
      "Good job! Just remember, customers won't always order drinks from the cooler. You can always check the Recipes for foods, soups, or drinks that you don't know how to make!";
    const GARY_TRAY_WASH_TEXT =
      "Great! Now you need to grab the dirty tray and wash it!";
    const GARY_DISHWASH_TEXT =
      "I'm going to show you how to wash dishes now!";
    const GARY_NIGHT_CLOSED_TEXT =
      "Oh! Looks like we're closed for the day. Let's clean up for tomorrow!";
    const GARY_TYPE_MS = 34;
    const GARY_READ_MS = 1400;

    function garyReadMsFor(text) {
      return Math.max(GARY_READ_MS, text.length * 22);
    }

    function holdCustomerEnterForGary() {
      garyCustomerEnterHeld = true;
    }

    function releaseCustomerEnterAfterGary() {
      garyCustomerEnterHeld = false;
      const waiters = garyCustomerEnterWaiters;
      garyCustomerEnterWaiters = [];
      waiters.forEach((resolve) => resolve());
    }

    function waitForGaryBeforeCustomerEnter() {
      if (!garyCustomerEnterHeld) return Promise.resolve();
      return new Promise((resolve) => {
        garyCustomerEnterWaiters.push(resolve);
      });
    }

    function miniCupHtml(drinkId) {
      return (
        '<span class="mini-cup cup-' +
        drinkId +
        '" aria-hidden="true"><span class="mini-cup-liquid"></span></span>'
      );
    }

    const fridgeShelves = [null, null, null, null];
    const fridgeSlots = root.querySelectorAll(".fridge-slot");
    const kitchenFridge = getEl("kitchenFridge");
    const kitchenDishwasher = getEl("kitchenDishwasher");
    const kitchenMicrowave = getEl("kitchenMicrowave");
    const kitchenCooler = getEl("kitchenCooler");
    const coolerDrinks = kitchenCooler.querySelectorAll(".cooler-drink[data-drink]");
    const kitchenOven = getEl("kitchenOven");
    const saltShaker = getEl("saltShaker");
    const pepperShaker = getEl("pepperShaker");
    const saltShakerDock = getEl("saltShakerDock");
    const pepperShakerDock = getEl("pepperShakerDock");
    const screen2 = getEl("screen-2");
    const screen3 = getEl("screen-3");
    const screen4 = getEl("screen-4");
    const screen5 = getEl("screen-5");
    const screen6 = getEl("screen-6");
    const cafeteriaCart = getEl("cafeteriaCart");
    const cafeteriaCartPickup = getEl("cafeteriaCartPickup");
    const cafeteriaCartTrayStack = getEl("cafeteriaCartTrayStack");
    const cashierTraySpot = getEl("cashierTraySpot");
    const cashierTrayPreview = getEl("cashierTrayPreview");
    const cashierCustomer = getEl("cashierCustomer");
    const cashierCustomerArea = getEl("cashierCustomerArea");
    const cashierCustomerTrayGrid = getEl("cashierCustomerTrayGrid");
    const cashierCustomerOrder = getEl("cashierCustomerOrder");
    const cashierGlassDoors = getEl("cashierGlassDoors");
    const cashierOrderList = getEl("cashierOrderList");
    const cashierToast = getEl("cashierToast");
    const kitchenBlender = getEl("kitchenBlender");
    const blenderZone = getEl("blenderZone");
    const blenderJar = getEl("blenderJar");
    const blenderFruit = getEl("blenderFruit");
    const blenderWashTimer = getEl("blenderWashTimer");
    const kitchenTrashCans = root.querySelectorAll(".kitchen-trash");
    const FRIDGE_ANIM_MS = 520;
    const APPLIANCE_ANIM_MS = 500;
    const applianceCloseFns = [];

    function makeFood(crop, state = "raw") {
      return { crop, state };
    }

    function isBasketFood(food) {
      return !!food && food.state === "raw" && !isMeatFood(food);
    }

    function isMeatFood(food) {
      return !!food && food.crop === "meat";
    }

    function isRawMeat(food) {
      return isMeatFood(food) && food.state === "raw";
    }

    function isSteakSandwich(food) {
      return !!food && food.crop === "steak-sandwich";
    }

    function isFrenchFries(food) {
      return !!food && food.crop === "french-fries";
    }

    function isFrenchFriesPrep(food) {
      return (
        !!food &&
        food.crop === "potatoes" &&
        food.state === "baked" &&
        !!food.wasCut &&
        !food.salted
      );
    }

    function makeFrenchFries() {
      return { crop: "french-fries", state: "ready" };
    }

    function isMeatWithTomato(food) {
      return isMeatFood(food) && food.state === "baked" && !!food.withTomato;
    }

    function isCookedMeatForSandwich(food) {
      return isMeatFood(food) && food.state === "baked" && !food.withTomato;
    }

    function isMeatSeasoned(food) {
      return isMeatFood(food) && !!food.salted && !!food.peppered;
    }

    function makeMeatWithTomato(meat) {
      const item = { crop: "meat", state: "baked", withTomato: true };
      if (meat?.wasCut) item.wasCut = true;
      if (meat?.salted) item.salted = true;
      if (meat?.peppered) item.peppered = true;
      return item;
    }

    function isCookedChoppedMeat(food) {
      return isMeatFood(food) && food.state === "baked" && !!food.wasCut && !food.withTomato;
    }

    function isPotatoSoupPrep(item) {
      return (
        isPotSoup(item) &&
        item.soup === "potatoes" &&
        item.mix === "carrots" &&
        !!item.stew &&
        !!item.cold &&
        !item.complete &&
        !item.meat
      );
    }

    function isPotatoMeatStewPrep(item) {
      return (
        isPotSoup(item) &&
        item.soup === "potatoes" &&
        item.mix === "carrots" &&
        !!item.stew &&
        !!item.cold &&
        !item.complete &&
        !!item.meat
      );
    }

    function makePotatoMeatStew() {
      return {
        soup: "potatoes",
        stew: true,
        mix: "carrots",
        meat: true,
        cold: true,
        salted: false,
        peppered: false,
      };
    }

    function isMeatStewNeedsPotatoes(item) {
      return (
        isPotSoupCold(item) &&
        item.soup === "meat" &&
        !item.mixPotatoes &&
        !item.complete
      );
    }

    function isMeatStewNeedsCarrots(item) {
      return (
        isPotSoupCold(item) &&
        item.soup === "meat" &&
        !item.mixCarrots &&
        !item.complete
      );
    }

    function isMeatStewPrep(item) {
      return (
        isPotSoup(item) &&
        item.soup === "meat" &&
        !!item.cold &&
        !!item.mixPotatoes &&
        !!item.mixCarrots &&
        !item.complete
      );
    }

    function addMeatStewPotatoes(pot) {
      const item = {
        soup: "meat",
        cold: true,
        mixPotatoes: true,
        mixCarrots: !!(pot && pot.mixCarrots),
        salted: false,
        peppered: false,
      };
      if (item.mixCarrots) item.stew = true;
      return item;
    }

    function addMeatStewCarrots(pot) {
      const item = {
        soup: "meat",
        cold: true,
        mixPotatoes: !!(pot && pot.mixPotatoes),
        mixCarrots: true,
        salted: false,
        peppered: false,
      };
      if (item.mixPotatoes) item.stew = true;
      return item;
    }

    function makeSteakSandwich() {
      return { crop: "steak-sandwich", state: "ready" };
    }

    function isPlateFood(food) {
      return (
        !!food &&
        (food.state === "washed" ||
          food.state === "cooked" ||
          food.state === "cut" ||
          food.state === "baked" ||
          food.state === "ready" ||
          isRawMeat(food))
      );
    }

    function needsPineappleChopForOven(food) {
      return !!food && food.crop === "pineapple" && food.state === "washed";
    }

    function isOvenPlateInput(food) {
      if (!food || !OVEN_CROPS.has(food.crop)) return false;
      if (food.crop === "pineapple") return food.state === "cut";
      if (isMeatFood(food)) return food.state === "raw" || food.state === "cut";
      return food.state === "washed" || food.state === "cut";
    }

    function isBakedFood(food) {
      return !!food && food.state === "baked";
    }

    function foodLabel(food) {
      if (!food) return "food";
      if (isSteakSandwich(food)) return "steak sandwich";
      if (isFrenchFries(food)) return "french fries";
      if (food.state === "baked") {
        if (food.crop === "bread") return "bread";
        if (food.crop === "apples") return "baked apple";
        if (food.crop === "meat") {
          if (food.withTomato) return "meat with tomato";
          if (food.wasCut) return "chopped & cooked meat";
          if (isMeatSeasoned(food)) return "seasoned steak";
          return "cooked meat";
        }
        const short = {
          grapes: "grapes",
          pineapple: "pineapple",
          tomatoes: "tomato",
          carrots: "carrot",
          potatoes: "potato",
          cucumbers: "cucumber",
          beans: "beans",
        };
        return "baked " + (short[food.crop] || food.crop);
      }
      if (food.state === "cut") return "cut " + food.crop;
      if (food.crop === "meat" && food.withTomato) return "meat with tomato";
      if (food.crop === "meat") return "meat";
      return food.crop;
    }

    function bakeFoodFromInput(input) {
      if (input && input.kind === "dough") return makeFood("bread", "baked");
      if (input && input.kind === "food" && input.food) {
        const baked = makeFood(input.food.crop, "baked");
        if (input.food.state === "cut") baked.wasCut = true;
        if (input.food.salted) baked.salted = true;
        if (input.food.peppered) baked.peppered = true;
        return baked;
      }
      return null;
    }

    function makeDrink(id) {
      return { drink: id };
    }

    function isCupDrink(item) {
      return !!item && !!item.drink;
    }

    function isCuttable(food) {
      if (!food || isBakedFood(food)) return false;
      if (isMeatFood(food)) return isRawMeat(food);
      return food.state === "washed" && CUTTABLE_CROPS.has(food.crop);
    }

    function isBlenderInput(food) {
      if (!food || isBakedFood(food)) return false;
      if (isRawMeat(food) || (isMeatFood(food) && food.state === "cut")) return true;
      return (
        (food.state === "washed" || food.state === "cut") &&
        (BLENDER_JUICE_CROPS.has(food.crop) ||
          BLENDER_SOUP_CROPS.has(food.crop) ||
          food.crop === "wheat")
      );
    }

    function makePotSoup(crop, cold = false) {
      const item = { soup: crop };
      if (cold) {
        item.cold = true;
        item.salted = false;
        item.peppered = false;
      }
      return item;
    }

    function isPotSoup(item) {
      return !!item && !!item.soup;
    }

    function isPotSoupCold(item) {
      return isPotSoup(item) && !!item.cold && !item.complete;
    }

    function makePotSoupMix(baseSoup, mixCrop) {
      return {
        soup: baseSoup,
        stew: true,
        mix: mixCrop,
        cold: true,
        salted: false,
        peppered: false,
      };
    }

    function isFinishedSoupPrep(item) {
      if (!isPotSoup(item) || !item.stew || !item.cold || item.complete) return false;
      return (
        (item.soup === "potatoes" && item.mix === "carrots") ||
        (item.soup === "tomatoes" && item.mix === "tomatoes")
      );
    }

    function isPotSoupSeasonedForMicrowave(item) {
      if (!isPotSoupCold(item)) return false;
      return !!item.salted && !!item.peppered;
    }

    function isPotSoupReadyForMicrowave(item) {
      if (!isPotSoupSeasonedForMicrowave(item)) return false;
      if (isPotatoMeatStewPrep(item)) return true;
      if (isMeatStewPrep(item)) return true;
      if (item.soup === "potatoes" || item.soup === "tomatoes") {
        return isFinishedSoupPrep(item);
      }
      return true;
    }

    function isFinishedSoupComplete(item) {
      return isPotSoup(item) && !!item.complete;
    }

    function heatPotSoup(item) {
      if (!isPotSoup(item) || !isPotSoupCold(item)) return item;
      if (!item.salted || !item.peppered) return item;
      const hot = {
        soup: item.soup,
        complete: true,
        salted: true,
        peppered: true,
      };
      if (item.stew) hot.stew = true;
      if (item.mix) hot.mix = item.mix;
      if (item.meat) hot.meat = true;
      if (item.mixPotatoes) hot.mixPotatoes = true;
      if (item.mixCarrots) hot.mixCarrots = true;
      return hot;
    }

    function soupLabel(soupItem) {
      if (!soupItem) return "Soup";
      if (isFinishedSoupComplete(soupItem)) {
        if (soupItem.soup === "meat" && soupItem.mixPotatoes && soupItem.mixCarrots) {
          return "Meat stew";
        }
        if (soupItem.soup === "potatoes" && soupItem.mix === "carrots" && soupItem.meat) {
          return "Meat & potato stew";
        }
        if (soupItem.soup === "potatoes" && soupItem.mix === "carrots") return "Potato Soup";
        if (soupItem.soup === "tomatoes" && soupItem.mix === "tomatoes") return "Tomato Soup";
        const name = SOUP_LABELS[soupItem.soup] || soupItem.soup;
        return name + " Soup";
      }
      if (isPotStew(soupItem)) {
        if (soupItem.soup === "potatoes" && soupItem.mix === "carrots" && soupItem.meat) {
          return "Meat & potato stew prep";
        }
        if (soupItem.soup === "meat" && soupItem.mixPotatoes && soupItem.mixCarrots) {
          return "Meat stew prep";
        }
        return STEW_LABELS[soupItem.soup] || "Stew";
      }
      const base = SOUP_LABELS[soupItem.soup] || soupItem.soup;
      if (isPotSoupCold(soupItem)) return "Cold " + base;
      return base;
    }

    function makeBowlFlour() {
      return { flour: true };
    }

    function makeBowlDough() {
      return { dough: true };
    }

    function makeBowlBatter() {
      return { batter: true };
    }

    function makeBowlMix(crop) {
      return { mix: crop };
    }

    function makePotStew(crop) {
      return { soup: crop, stew: true };
    }

    function isBowlFlour(item) {
      return !!item && !!item.flour;
    }

    function isBowlDough(item) {
      return !!item && !!item.dough;
    }

    function isBowlBatter(item) {
      return !!item && !!item.batter;
    }

    function isBowlMix(item) {
      return !!item && !!item.mix;
    }

    function isBowlItem(item) {
      return isBowlFlour(item) || isBowlDough(item) || isBowlBatter(item) || isBowlMix(item);
    }

    function isPotStew(item) {
      return isPotSoup(item) && !!item.stew;
    }

    function isPlateCut(food) {
      return !!food && food.state === "cut";
    }

    function cupHasDrink(item, drinkId) {
      return isCupDrink(item) && item.drink === drinkId;
    }

    function miniBowlHtml(fillClass) {
      const fill = fillClass || "mini-bowl-flour";
      return (
        '<span class="mini-bowl" aria-hidden="true">' +
        '<span class="mini-bowl-flour ' +
        fill +
        '"></span></span>'
      );
    }

    function bowlFillClass(item) {
      if (isBowlFlour(item)) return "mini-bowl-flour";
      if (isBowlDough(item)) return "mini-bowl-fill-dough";
      if (isBowlBatter(item)) return "mini-bowl-fill-batter";
      if (isBowlMix(item)) return "mini-bowl-fill-mix-" + item.mix;
      return "mini-bowl-flour";
    }

    function bowlLabel(item) {
      if (isBowlFlour(item)) return BOWL_LABELS.flour;
      if (isBowlDough(item)) return BOWL_LABELS.dough;
      if (isBowlBatter(item)) return BOWL_LABELS.batter;
      if (isBowlMix(item)) return BOWL_LABELS["mix-" + item.mix] || "Mix";
      return "Bowl";
    }

    function setBowlIcon(el, baseClass, bowlItem) {
      if (!bowlItem) {
        el.className = baseClass;
        el.innerHTML = "";
        return;
      }
      el.className = baseClass + " slot-icon-wrap flour-icon";
      el.innerHTML =
        miniBowlHtml(bowlFillClass(bowlItem)) +
        '<span class="item-label">' +
        bowlLabel(bowlItem) +
        "</span>";
    }

    function clearBowlFillClasses() {
      bowl.classList.remove("bowl-flour", "bowl-dough", "bowl-batter");
      [...bowl.classList].forEach((cls) => {
        if (cls.startsWith("bowl-mix-")) bowl.classList.remove(cls);
      });
    }

    function syncBowlVisual() {
      clearBowlFillClasses();
      if (!bowlContents) return;
      if (isBowlFlour(bowlContents)) bowl.classList.add("bowl-flour");
      else if (isBowlDough(bowlContents)) bowl.classList.add("bowl-dough");
      else if (isBowlBatter(bowlContents)) bowl.classList.add("bowl-batter");
      else if (isBowlMix(bowlContents)) bowl.classList.add("bowl-mix-" + bowlContents.mix);
    }

    const COUNTER_RECIPES = [
      {
        on: "bowl",
        onMatch: isBowlFlour,
        with: "cup",
        withMatch: (p) => cupHasDrink(p, "water"),
        result: makeBowlDough,
        dirtyWith: true,
      },
      {
        on: "bowl",
        onMatch: isBowlFlour,
        with: "cup",
        withMatch: (p) => cupHasDrink(p, "milk"),
        result: makeBowlBatter,
        dirtyWith: true,
      },
      {
        on: "bowl",
        onMatch: isBowlDough,
        with: "plate",
        withMatch: (p) => isPlateCut(p) && p.crop === "apples",
        result: () => makeBowlMix("apples"),
        dirtyWith: true,
      },
      {
        on: "bowl",
        onMatch: isBowlDough,
        with: "plate",
        withMatch: (p) => isPlateCut(p) && p.crop === "pineapple",
        result: () => makeBowlMix("pineapple"),
        dirtyWith: true,
      },
      {
        on: "pot",
        onMatch: (p) => isPotSoup(p) && !p.stew && p.soup === "carrots",
        with: "plate",
        withMatch: (p) => isPlateCut(p) && p.crop === "carrots",
        result: () => makePotStew("carrots"),
        dirtyWith: true,
      },
      {
        on: "pot",
        onMatch: (p) => isPotSoup(p) && !p.stew && p.soup === "cucumbers",
        with: "plate",
        withMatch: (p) => isPlateCut(p) && p.crop === "cucumbers",
        result: () => makePotStew("cucumbers"),
        dirtyWith: true,
      },
      {
        on: "pot",
        onMatch: (p) => isPotSoup(p) && !p.stew && p.soup === "potatoes",
        with: "plate",
        withMatch: (p) => isPlateCut(p) && p.crop === "carrots",
        result: () => makePotSoupMix("potatoes", "carrots"),
        dirtyWith: true,
      },
      {
        on: "pot",
        onMatch: (p) => isPotSoup(p) && !p.stew && p.soup === "tomatoes",
        with: "plate",
        withMatch: (p) => isPlateCut(p) && p.crop === "tomatoes",
        result: () => makePotSoupMix("tomatoes", "tomatoes"),
        dirtyWith: true,
      },
      {
        on: "bowl",
        onMatch: isBowlBatter,
        with: "pot",
        withMatch: (p) => isPotStew(p) && p.soup === "potatoes",
        result: () => makePotStew("potatoes"),
        resultOn: "with",
        dirtyOn: true,
      },
      {
        on: "plate",
        onMatch: isCookedMeatForSandwich,
        with: "plate",
        withMatch: (p) => isPlateCut(p) && p.crop === "tomatoes",
        result: (meat) => makeMeatWithTomato(meat),
        dirtyWith: true,
      },
      {
        on: "plate",
        onMatch: (p) => isPlateCut(p) && p.crop === "tomatoes",
        with: "plate",
        withMatch: isCookedMeatForSandwich,
        result: (_, meat) => makeMeatWithTomato(meat),
        resultOn: "with",
        dirtyOn: true,
      },
      {
        on: "plate",
        onMatch: (p) => p?.crop === "bread" && p?.state === "baked",
        with: "plate",
        withMatch: isMeatWithTomato,
        result: () => makeSteakSandwich(),
        dirtyWith: true,
      },
      {
        on: "plate",
        onMatch: isMeatWithTomato,
        with: "plate",
        withMatch: (p) => p?.crop === "bread" && p?.state === "baked",
        result: () => makeSteakSandwich(),
        resultOn: "with",
        dirtyOn: true,
      },
      {
        on: "pot",
        onMatch: isPotatoSoupPrep,
        with: "plate",
        withMatch: isCookedChoppedMeat,
        result: () => makePotatoMeatStew(),
        dirtyWith: true,
      },
      {
        on: "plate",
        onMatch: isCookedChoppedMeat,
        with: "pot",
        withMatch: isPotatoSoupPrep,
        result: () => makePotatoMeatStew(),
        resultOn: "with",
        dirtyOn: true,
      },
      {
        on: "pot",
        onMatch: isMeatStewNeedsPotatoes,
        with: "plate",
        withMatch: (p) => isPlateCut(p) && p.crop === "potatoes",
        result: (pot) => addMeatStewPotatoes(pot),
        dirtyWith: true,
      },
      {
        on: "plate",
        onMatch: (p) => isPlateCut(p) && p.crop === "potatoes",
        with: "pot",
        withMatch: isMeatStewNeedsPotatoes,
        result: (_, pot) => addMeatStewPotatoes(pot),
        resultOn: "with",
        dirtyOn: true,
      },
      {
        on: "pot",
        onMatch: isMeatStewNeedsCarrots,
        with: "plate",
        withMatch: (p) => isPlateCut(p) && p.crop === "carrots",
        result: (pot) => addMeatStewCarrots(pot),
        dirtyWith: true,
      },
      {
        on: "plate",
        onMatch: (p) => isPlateCut(p) && p.crop === "carrots",
        with: "pot",
        withMatch: isMeatStewNeedsCarrots,
        result: (_, pot) => addMeatStewCarrots(pot),
        resultOn: "with",
        dirtyOn: true,
      },
    ];

    function findCounterRecipe(onCarrier, onPayload, withCarrier, withPayload) {
      for (const r of COUNTER_RECIPES) {
        if (
          r.on === onCarrier &&
          r.onMatch(onPayload) &&
          r.with === withCarrier &&
          r.withMatch(withPayload)
        ) {
          return r;
        }
      }
      return null;
    }

    function recipeResultCarrier(recipe, onCarrier, withCarrier) {
      if (recipe.resultOn === "with") return withCarrier;
      return onCarrier;
    }

    function canCounterCombineAtSpot(spotId) {
      const incoming = getFollowingRestCarrier();
      if (!incoming) return false;
      if (getCarrierDirty(incoming)) return false;
      const existing = counterSpotOccupants.get(spotId);
      if (!existing) return false;
      if (getCarrierDirty(existing)) return false;
      const existingPayload = getCarrierPayload(existing);
      const incomingPayload = getCarrierPayload(incoming);
      if (!existingPayload || !incomingPayload) return false;
      return (
        !!findCounterRecipe(existing, existingPayload, incoming, incomingPayload) ||
        !!findCounterRecipe(incoming, incomingPayload, existing, existingPayload)
      );
    }

    function getCarrierPayload(carrier) {
      if (carrier === "plate") return plateContents;
      if (carrier === "cup") return cupContents;
      if (carrier === "pot") return potContents;
      if (carrier === "bowl") return bowlContents;
      return null;
    }

    function getCarrierDirty(carrier) {
      if (carrier === "plate") return plateDirty;
      if (carrier === "cup") return cupDirty;
      if (carrier === "pot") return potDirty;
      if (carrier === "bowl") return bowlDirty;
      if (carrier === "tray") return trayDirty;
      return false;
    }

    function setCarrierDirty(carrier, dirty) {
      if (carrier === "plate") plateDirty = dirty;
      else if (carrier === "cup") cupDirty = dirty;
      else if (carrier === "pot") potDirty = dirty;
      else if (carrier === "bowl") bowlDirty = dirty;
      else if (carrier === "tray") trayDirty = dirty;
    }

    function applyCarrierPayload(carrier, item) {
      if (carrier === "plate") setPlateFood(item);
      else if (carrier === "cup") setCupDrink(item);
      else if (carrier === "pot") setPotSoup(item);
      else if (carrier === "bowl") setBowlItem(item);
    }

    function clearCarrierPayload(carrier) {
      if (carrier === "plate") clearPlate();
      else if (carrier === "cup") clearCup();
      else if (carrier === "pot") clearPot();
      else if (carrier === "bowl") clearBowl();
    }

    function stopCarrierFollowing(carrier) {
      const el = getCarrierEl(carrier);
      const home = getCarrierHome(carrier);
      if (carrier === "plate") plateFollowing = false;
      else if (carrier === "cup") cupFollowing = false;
      else if (carrier === "pot") potFollowing = false;
      else if (carrier === "bowl") bowlFollowing = false;
      else if (carrier === "tray") trayFollowing = false;
      el.classList.remove("following");
      el.setAttribute("aria-label", "Pick up from counter");
      home.classList.add("is-empty");
    }

    function flashCounterCombo(spotEl) {
      spotEl.classList.add("combo-flash");
      setTimeout(() => spotEl.classList.remove("combo-flash"), 600);
    }

    function miniPotHtml(crop, cold) {
      return (
        '<span class="mini-pot soup-' +
        crop +
        (cold ? " soup-cold" : "") +
        '" aria-hidden="true"><span class="mini-pot-soup"></span></span>'
      );
    }

    function foodSlicesHtml(crop) {
      return (
        '<span class="food-slices food-slices-' +
        crop +
        '" aria-hidden="true">' +
        '<span class="slice s1"></span>' +
        '<span class="slice s2"></span>' +
        '<span class="slice s3"></span>' +
        "</span>"
      );
    }

    function setFoodIcon(el, baseClass, food) {
      if (!food) {
        el.className = baseClass;
        el.innerHTML = "";
        return;
      }
      if (isSteakSandwich(food)) {
        el.className = baseClass + " food-icon food-steak-sandwich";
        el.innerHTML =
          '<span class="food-shape" aria-hidden="true"></span>' +
          '<span class="sandwich-tomato" aria-hidden="true"></span>';
        return;
      }
      if (isFrenchFries(food)) {
        el.className =
          baseClass + " food-icon food-potatoes food-french-fries food-baked food-cut";
        el.innerHTML = foodSlicesHtml("potatoes");
        return;
      }
      if (food.state === "baked") {
        if (isMeatWithTomato(food)) {
          el.className =
            baseClass + " food-icon food-meat food-with-tomato food-baked" + (food.wasCut ? " food-cut" : "");
          if (food.wasCut) {
            el.innerHTML = foodSlicesHtml("meat");
          } else {
            el.innerHTML = '<span class="food-shape" aria-hidden="true"></span>';
          }
          return;
        }
        if (food.wasCut) {
          el.className =
            baseClass + " food-icon food-" + food.crop + " food-baked food-cut";
          el.innerHTML = foodSlicesHtml(food.crop);
          return;
        }
        el.className = baseClass + " food-icon food-" + food.crop + " food-baked";
        el.innerHTML = '<span class="food-shape" aria-hidden="true"></span>';
        return;
      }
      if (food.state === "cut") {
        el.className = baseClass + " food-icon food-" + food.crop + " food-cut";
        el.innerHTML = foodSlicesHtml(food.crop);
        return;
      }
      el.className = baseClass + " food-icon food-" + food.crop;
      el.innerHTML = '<span class="food-shape" aria-hidden="true"></span>';
    }

    function setSoupIcon(el, baseClass, soupItem) {
      if (!soupItem) {
        el.className = baseClass;
        el.innerHTML = "";
        return;
      }
      const label = soupLabel(soupItem);
      el.className = baseClass + " slot-icon-wrap soup-icon";
      el.innerHTML =
        miniPotHtml(soupItem.soup, isPotSoupCold(soupItem)) +
        '<span class="item-label">' +
        label +
        "</span>";
    }

    function setDrinkIcon(el, baseClass, drink) {
      if (!drink) {
        el.className = baseClass;
        el.innerHTML = "";
        return;
      }
      const label = DRINK_LABELS[drink.drink] || drink.drink;
      el.className = baseClass + " slot-icon-wrap drink-icon";
      el.innerHTML =
        miniCupHtml(drink.drink) + '<span class="item-label">' + label + "</span>";
    }

    function clearCupDrinkClasses() {
      [...cup.classList].forEach((cls) => {
        if (cls.startsWith("drink-")) cup.classList.remove(cls);
      });
    }

    function clearBlenderJarClasses() {
      [...blenderJar.classList].forEach((cls) => {
        if (
          cls === "has-juice" ||
          cls === "has-fruit" ||
          cls === "blend-wheat" ||
          cls.startsWith("juice-") ||
          cls.startsWith("soup-")
        ) {
          blenderJar.classList.remove(cls);
        }
      });
    }

    function clearPotSoupClasses() {
      [...pot.classList].forEach((cls) => {
        if (cls.startsWith("soup-")) pot.classList.remove(cls);
      });
    }

    function isScreen2Active() {
      const active = root.querySelector(".screen.active");
      return active === screen2;
    }

    function isScreen4Active() {
      const active = root.querySelector(".screen.active");
      return active === screen4;
    }

    function isScreen5Active() {
      const active = root.querySelector(".screen.active");
      return active === screen5;
    }

    function isScreen6Active() {
      const active = root.querySelector(".screen.active");
      return active === screen6;
    }

    function getTrayFilledEntries() {
      return TRAY_SLOTS.map((slot) => trayContents[slot]).filter(Boolean);
    }

    function getTrayFilledData() {
      return getTrayFilledEntries().map((entry) => entry.data);
    }

    function trayHasDrink() {
      return getTrayFilledEntries().some((entry) => isCupDrink(entry.data));
    }

    function trayHasFoodOrSoup() {
      return getTrayFilledEntries().some(
        (entry) => isPlateFood(entry.data) || isPotSoup(entry.data)
      );
    }

    function trayMeetsCashierMinimum() {
      if (tutorialMode) {
        return trayHasLoad();
      }
      return trayHasDrink() && trayHasFoodOrSoup();
    }

    function trayFilledCount() {
      return getTrayFilledEntries().length;
    }

    function trayHasLoad() {
      return trayFilledCount() > 0;
    }

    function isTrayOutInWorld() {
      return (
        trayFollowing ||
        !!trayRestSpotId ||
        trayAtCashier ||
        dishwasherLoad === "tray"
      );
    }

    function isTrayOnHomeDock() {
      return traysAtHome > 0 && !isTrayOutInWorld();
    }

    function reconcileTrayStackCount() {
      let away = cafeteriaCartDirtyTrays;
      if (isTrayOutInWorld()) away += 1;
      traysAtHome = Math.max(0, TRAY_STACK_MAX - away);
    }

    function sendTrayToCafeteriaCart() {
      cafeteriaCartDirtyTrays += 1;
      updateCafeteriaCartUI();
    }

    function updateCafeteriaCartUI() {
      if (!cafeteriaCart || !cafeteriaCartPickup || !cafeteriaCartTrayStack) return;
      const hasDirty = cafeteriaCartDirtyTrays > 0;
      const canPickUp =
        hasDirty && isScreen6Active() && !isTrayOutInWorld();
      cafeteriaCart.removeAttribute("aria-hidden");
      cafeteriaCartPickup.hidden = !hasDirty;
      cafeteriaCartPickup.classList.toggle("can-pickup", canPickUp);
      cafeteriaCartPickup.setAttribute(
        "aria-label",
        canPickUp
          ? cafeteriaCartDirtyTrays === 1
            ? "Pick up dirty tray from cart"
            : "Pick up dirty tray from cart (" + cafeteriaCartDirtyTrays + " waiting)"
          : hasDirty
            ? "Dirty tray on cart — hands full or go to cafeteria"
            : "Dirty tray cart"
      );
      cafeteriaCartTrayStack.innerHTML = "";
      for (let i = 0; i < cafeteriaCartDirtyTrays; i++) {
        const mini = document.createElement("span");
        mini.className = "caf-cart-mini-tray";
        mini.style.setProperty("--cart-tray-i", String(i));
        cafeteriaCartTrayStack.appendChild(mini);
      }
    }

    function pickUpDirtyTrayFromCart() {
      if (!isScreen6Active() || cafeteriaCartDirtyTrays < 1) return;
      if (isTrayOutInWorld()) return;
      cafeteriaCartDirtyTrays -= 1;
      hideTrayActionMenu();
      closeTrayCloseup();
      putDownOtherCarriers("tray");
      trayDirty = true;
      TRAY_SLOTS.forEach((slot) => {
        trayContents[slot] = null;
      });
      trayFollowing = true;
      tray.classList.add("following", "dirty");
      tray.setAttribute(
        "aria-label",
        "Dirty tray from cafeteria cart — wash in dishwasher"
      );
      moveTrayWithCursor(
        tray.getBoundingClientRect().left,
        tray.getBoundingClientRect().top
      );
      updateCafeteriaCartUI();
      updateCarrierUI();
      maybeAdvanceTutorialGuide({ type: "cafeteria-tray", action: "pickup" });
    }

    function updateTrayStackUI() {
      reconcileTrayStackCount();
      const stackedAtHome = traysAtHome;
      if (trayStackBadge) {
        trayStackBadge.textContent = String(stackedAtHome);
        trayStackBadge.hidden = stackedAtHome < 1;
        trayStackBadge.setAttribute(
          "aria-label",
          stackedAtHome === 1
            ? "1 tray at home"
            : stackedAtHome + " trays at home"
        );
      }
      if (trayStackLayers) {
        const behind = Math.max(0, Math.min(traysAtHome - 1, TRAY_STACK_MAX - 1));
        trayStackLayers.innerHTML = "";
        for (let i = 0; i < behind; i++) {
          const layer = document.createElement("div");
          layer.className = "tray-stack-layer";
          layer.style.setProperty("--stack-i", String(i));
          trayStackLayers.appendChild(layer);
        }
      }
      trayHome.classList.toggle("has-stack", traysAtHome > 1);
      const canPickFromHome = traysAtHome > 0 && !isTrayOutInWorld();
      trayHome.classList.toggle("is-empty", !canPickFromHome);
      if (isTrayOnHomeDock()) {
        returnCarrierToHomeDock("tray");
      }
    }

    function trayItemMatchesReq(data, req) {
      if (!data || !req) return false;
      if (req.kind === "drink") {
        return isCupDrink(data) && data.drink === req.drink;
      }
      if (req.kind === "food") {
        if (!isPlateFood(data)) return false;
        if (req.crop && data.crop !== req.crop) return false;
        if (req.state && data.state !== req.state) return false;
        if (req.wasCut !== undefined && !!data.wasCut !== req.wasCut) return false;
        if (req.salted !== undefined && !!data.salted !== req.salted) return false;
        if (req.peppered !== undefined && !!data.peppered !== req.peppered) return false;
        if (req.withTomato !== undefined && !!data.withTomato !== req.withTomato) return false;
        return true;
      }
      if (req.kind === "soup") {
        if (!isFinishedSoupComplete(data)) return false;
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

    function trayMatchesCashierOrder(order) {
      if (!order) return false;
      const filled = getTrayFilledData();
      if (filled.length !== order.items.length) return false;
      const used = new Set();
      return order.items.every((req) => {
        const idx = filled.findIndex(
          (data, i) => !used.has(i) && trayItemMatchesReq(data, req)
        );
        if (idx === -1) return false;
        used.add(idx);
        return true;
      });
    }

    function clearTrayContents() {
      TRAY_SLOTS.forEach((slot) => {
        trayContents[slot] = null;
      });
      updateTrayVisual();
    }

    function throwAwayTrayFoodOnly() {
      clearTrayContents();
      trayDirty = true;
      if (trayAtCashier) {
        renderCashierTrayPreview();
      }
      updateCarrierUI();
    }

    function trayCanThrowAway() {
      if (!trayHasLoad()) return false;
      if (trayFollowing) return true;
      if (trayAtCashier) return true;
      if (trayRestSpotId) {
        const active = root.querySelector(".screen.active");
        return active === screen2 || active === screen3;
      }
      return false;
    }

    function showCashierToast(kind, message) {
      if (cashierToastTimer) {
        clearTimeout(cashierToastTimer);
        cashierToastTimer = null;
      }
      cashierToast.hidden = false;
      cashierToast.className = "cashier-toast " + kind;
      cashierToast.textContent = message;
      cashierToastTimer = setTimeout(() => {
        cashierToast.hidden = true;
        cashierToastTimer = null;
      }, kind === "success" ? 1600 : 2000);
    }

    function renderCashierOrder() {
      if (!cashierOrderList) return;
      cashierOrderList.innerHTML = "";
      if (!cashierCurrentOrder || !cashierCurrentOrder.items) return;
      cashierCurrentOrder.items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item.label;
        cashierOrderList.appendChild(li);
      });
    }

    function pickRandomCashierCatalogItems(catalog, count) {
      const pool = catalog.slice();
      const picked = [];
      for (let n = 0; n < count && pool.length; n++) {
        const weights = pool.map(cashierCatalogItemWeight);
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

    function shuffleCashierOrderItems(items) {
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = items[i];
        items[i] = items[j];
        items[j] = tmp;
      }
      return items;
    }

    function cashierOrderSignature(order) {
      return order.items
        .map((item) => item.kind + ":" + item.label)
        .sort()
        .join("|");
    }

    function foodOrderNeedsKitchen2(item) {
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

    function tutorialNavStep(from, to) {
      return { type: "nav", from, to };
    }

    function tutorialReturnToCashier(fromKitchen) {
      if (fromKitchen === 3) {
        return [tutorialNavStep(3, 2), tutorialNavStep(2, 5)];
      }
      return [tutorialNavStep(2, 5)];
    }

    function getTutorialDeliverCarrier(orderItem) {
      if (!orderItem) return "plate";
      if (orderItem.kind === "drink") return "cup";
      if (orderItem.kind === "soup") return "pot";
      return "plate";
    }

    function tutorialServeSteps(orderItem, fromKitchen) {
      const loadCarrier = getTutorialDeliverCarrier(orderItem);
      return [
        { type: "carrier", carrier: "tray", action: "pickup" },
        { type: "counter-place", carrier: "tray" },
        { type: "tray", action: "place-food" },
        { type: "tray-load", carrier: loadCarrier },
        { type: "tray", action: "done" },
        { type: "carrier", carrier: "tray", action: "pickup" },
        ...tutorialReturnToCashier(fromKitchen),
        { type: "cashier-tray", action: "place" },
      ];
    }

    function tutorialGardenHarvestSteps(crop) {
      return [
        tutorialNavStep(5, 2),
        tutorialNavStep(2, 1),
        { type: "carrier", carrier: "basket", action: "pickup" },
        { type: "crop", crop },
        tutorialNavStep(1, 2),
      ];
    }

    function tutorialWashFoodSteps() {
      return [
        { type: "sink", action: "drop" },
        { type: "wait", until: "sink-ready" },
        { type: "carrier", carrier: "plate", action: "pickup" },
        { type: "sink", action: "take" },
      ];
    }

    function tutorialOvenBakeSteps() {
      return [
        { type: "oven", action: "open" },
        { type: "oven", action: "drop" },
        { type: "wait", until: "oven-done" },
        { type: "carrier", carrier: "plate", action: "pickup" },
        { type: "oven", action: "take" },
      ];
    }

    function tutorialMicrowaveHeatSteps() {
      return [
        { type: "microwave", action: "open" },
        { type: "microwave", action: "drop" },
        { type: "wait", until: "microwave-done" },
        { type: "carrier", carrier: "pot", action: "pickup" },
        { type: "microwave", action: "take" },
      ];
    }

    function tutorialSeasonPotSteps() {
      return [
        { type: "counter-place", carrier: "pot" },
        { type: "shaker", which: "salt", action: "pickup" },
        { type: "season", seasoning: "salt" },
        { type: "shaker", which: "pepper", action: "pickup" },
        { type: "season", seasoning: "pepper" },
        { type: "carrier", carrier: "pot", action: "pickup" },
      ];
    }

    const SOUP_MIX_CROP_BY_RECIPE = {
      potato: "carrots",
      tomato: "tomatoes",
    };

    function tutorialSoupMixSteps(mixCrop) {
      return [
        { type: "counter-place", carrier: "pot" },
        ...tutorialGardenHarvestSteps(mixCrop),
        ...tutorialWashFoodSteps(),
        tutorialNavStep(2, 3),
        { type: "cutting-board", action: "use" },
        { type: "wait", until: "cutting-done" },
        tutorialNavStep(3, 2),
        { type: "counter-place", carrier: "plate" },
        { type: "carrier", carrier: "pot", action: "pickup" },
        { type: "counter-combine" },
      ];
    }

    function tutorialSeasonPlateSaltSteps() {
      return [
        { type: "counter-place", carrier: "plate" },
        { type: "shaker", which: "salt", action: "pickup" },
        { type: "season", seasoning: "salt" },
        { type: "carrier", carrier: "plate", action: "pickup" },
      ];
    }

    function getActiveScreenNum() {
      const active = root.querySelector(".screen.active");
      return active ? Number(active.dataset.screen) : 5;
    }

    function getTutorialDishwashSteps() {
      const from = getActiveScreenNum();
      const steps = [];
      if (from !== 2) {
        steps.push(tutorialNavStep(from, 2));
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

    function getTutorialTrayWashSteps() {
      const from = getActiveScreenNum();
      return [
        ...tutorialNavSteps(from, 6),
        { type: "cafeteria-tray", action: "pickup" },
        ...tutorialNavSteps(6, 2),
        { type: "dishwasher", action: "open" },
        { type: "dishwasher", action: "load" },
        { type: "wait", until: "dishwasher-done" },
        ...tutorialNavSteps(2, 5),
      ];
    }

    function tutorialPlateMismatchesFoodOrder(food, orderItem) {
      if (!food || !orderItem || orderItem.kind !== "food" || !isPlateFood(food)) {
        return false;
      }
      if (orderItem.crop === "bread") {
        return !(food.crop === "bread" && food.state === "baked");
      }
      if (orderItem.crop === "french-fries") {
        if (isFrenchFries(food)) return false;
        if (isFrenchFriesPrep(food)) return false;
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

    function checkTutorialFoodMistake() {
      if (!tutorialMode || tutorialDishwashPhase || tutorialDishwashQueue) return;
      if (!tutorialGuideActive || !cashierCurrentOrder?.items?.[0]) return;
      const orderItem = cashierCurrentOrder.items[0];
      if (orderItem.kind !== "food") return;
      if (!plateFollowing || !plateContents || !isPlateFood(plateContents)) return;
      if (!tutorialPlateMismatchesFoodOrder(plateContents, orderItem)) return;
      queueTutorialDishwashGuide(orderItem);
    }

    function resetPlateForDishwashTutorial() {
      if (plateRestSpotId) {
        clearCarrierRestSpot("plate");
      }
      plateFollowing = false;
      plate.classList.remove("following");
      plateContents = null;
      plateDirty = false;
      plate.style.left = "";
      plate.style.top = "";
      plate.classList.remove("on-counter", "counter-rest-away");
      returnCarrierToHomeDock("plate");
      plate.setAttribute("aria-label", "Pick up plate");
    }

    function queueTutorialDishwashGuide(orderItemToResume) {
      if (tutorialDishwashPhase || tutorialDishwashQueue) return;
      tutorialDishwashQueue = true;
      tutorialResumeOrderItem = orderItemToResume;
      stopTutorialGuide();
      resetPlateForDishwashTutorial();
      window.setTimeout(() => {
        tutorialDishwashQueue = false;
        runTutorialDishwashIntro();
      }, 0);
    }

    async function runTutorialDishwashIntro() {
      if (tutorialDishwashPhase) return;
      await playGaryDishwashMessage();
      tutorialDishwashGaryPlayed = true;
      tutorialDishwashPhase = true;
      tutorialDishwashVariant = "meat";
      startTutorialGuide(getTutorialDishwashSteps());
    }

    async function runTutorialTrayWashIntro() {
      if (tutorialDishwashPhase) return;
      await playGaryTrayWashMessage();
      tutorialDishwashPhase = true;
      tutorialDishwashVariant = "tray";
      startTutorialGuide(getTutorialTrayWashSteps());
    }

    function finishTutorialDishwashPhase() {
      const variant = tutorialDishwashVariant;
      tutorialDishwashPhase = false;
      tutorialDishwashVariant = null;
      const resume = tutorialResumeOrderItem;
      tutorialResumeOrderItem = null;
      if (variant === "meat" && resume) {
        startTutorialGuide(getTutorialGuideSteps(resume));
      } else if (variant === "tray") {
        void spawnNextTutorialCustomerAfterServe();
      }
    }

    function getTutorialGuideSteps(orderItem) {
      if (!orderItem) return [];

      if (orderItem.kind === "drink") {
        const drink = orderItem.drink;
        if (drink.startsWith("juice-")) {
          const crop = drink.slice("juice-".length);
          return [
            ...tutorialGardenHarvestSteps(crop),
            ...tutorialWashFoodSteps(),
            tutorialNavStep(2, 3),
            { type: "blender", action: "drop" },
            { type: "wait", until: "blender-done" },
            { type: "carrier", carrier: "cup", action: "pickup" },
            { type: "blender", action: "take-juice" },
            ...tutorialServeSteps(orderItem, 3),
          ];
        }
        return [
          tutorialNavStep(5, 3),
          { type: "carrier", carrier: "cup", action: "pickup" },
          { type: "cooler", action: "open" },
          { type: "cooler-fill", drink },
          ...tutorialServeSteps(orderItem, 3),
        ];
      }

      if (orderItem.kind === "soup") {
        const recipe = orderItem.recipe;
        if (recipe === "meat-potato" || recipe === "meat-stew") {
          return [
            tutorialNavStep(5, 2),
            tutorialNavStep(2, 3),
            tutorialNavStep(3, 2),
            tutorialNavStep(2, 5),
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
        const mixCrop = SOUP_MIX_CROP_BY_RECIPE[recipe];
        const steps = [
          ...tutorialGardenHarvestSteps(crop),
          ...tutorialWashFoodSteps(),
          tutorialNavStep(2, 3),
          { type: "blender", action: "drop" },
          { type: "wait", until: "blender-done" },
          { type: "carrier", carrier: "pot", action: "pickup" },
          { type: "blender", action: "take-soup" },
          tutorialNavStep(3, 2),
        ];
        if (mixCrop) {
          steps.push(...tutorialSoupMixSteps(mixCrop));
        }
        steps.push(
          ...tutorialSeasonPotSteps(),
          tutorialNavStep(2, 3),
          ...tutorialMicrowaveHeatSteps(),
          ...tutorialServeSteps(orderItem, 3)
        );
        return steps;
      }

      if (orderItem.kind !== "food") return [];

      if (orderItem.crop === "bread") {
        return [
          ...tutorialGardenHarvestSteps("wheat"),
          ...tutorialWashFoodSteps(),
          tutorialNavStep(2, 3),
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
          ...tutorialServeSteps(orderItem, 3),
        ];
      }

      if (orderItem.crop === "steak-sandwich") {
        return [
          tutorialNavStep(5, 2),
          tutorialNavStep(2, 1),
          tutorialNavStep(1, 2),
          tutorialNavStep(2, 3),
          tutorialNavStep(3, 2),
          ...tutorialServeSteps(orderItem, 2),
        ];
      }

      if (orderItem.crop === "french-fries") {
        return [
          ...tutorialGardenHarvestSteps("potatoes"),
          ...tutorialWashFoodSteps(),
          tutorialNavStep(2, 3),
          { type: "cutting-board", action: "use" },
          { type: "wait", until: "cutting-done" },
          ...tutorialOvenBakeSteps(),
          tutorialNavStep(3, 2),
          ...tutorialSeasonPlateSaltSteps(),
          ...tutorialServeSteps(orderItem, 3),
        ];
      }

      if (orderItem.crop === "meat") {
        const steps = [
          tutorialNavStep(5, 2),
          { type: "carrier", carrier: "plate", action: "pickup" },
          { type: "meat-box", action: "take" },
        ];
        if (orderItem.wasCut) {
          steps.push(
            tutorialNavStep(2, 3),
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
          steps.push(tutorialNavStep(2, 3));
        }
        steps.push(...tutorialOvenBakeSteps());
        steps.push(...tutorialServeSteps(orderItem, 3));
        return steps;
      }

      const crop = orderItem.crop;
      const needsCut =
        orderItem.state === "cut" ||
        (orderItem.state === "baked" && orderItem.wasCut);
      const needsOven = orderItem.state === "baked";
      const needsK2 = needsCut || needsOven;

      const steps = [...tutorialGardenHarvestSteps(crop), ...tutorialWashFoodSteps()];
      if (needsK2) steps.push(tutorialNavStep(2, 3));
      if (needsCut) {
        steps.push(
          { type: "cutting-board", action: "use" },
          { type: "wait", until: "cutting-done" }
        );
      }
      if (needsOven) {
        steps.push(...tutorialOvenBakeSteps());
      }
      steps.push(...tutorialServeSteps(orderItem, needsK2 ? 3 : 2));
      return steps;
    }

    function findTutorialNavArrow(fromScreen, toScreen) {
      const section = getEl("screen-" + fromScreen);
      if (!section) return null;
      return section.querySelector('.nav-arrow[data-go="' + toScreen + '"]');
    }

    const TUTORIAL_SCREEN_LINKS = {
      1: [2, 4],
      2: [1, 3, 5],
      3: [2, 6],
      4: [1, 5],
      5: [2, 4, 6],
      6: [3, 5],
    };

    function tutorialShortestPath(from, to) {
      if (from === to) return [from];
      const queue = [[from]];
      const seen = new Set([from]);
      while (queue.length) {
        const path = queue.shift();
        const node = path[path.length - 1];
        for (const next of TUTORIAL_SCREEN_LINKS[node] || []) {
          if (next === to) return [...path, next];
          if (!seen.has(next)) {
            seen.add(next);
            queue.push([...path, next]);
          }
        }
      }
      return [];
    }

    function getNextScreenToward(from, to) {
      const path = tutorialShortestPath(from, to);
      return path.length >= 2 ? path[1] : null;
    }

    function tutorialNavSteps(from, to) {
      const path = tutorialShortestPath(from, to);
      const steps = [];
      for (let i = 0; i < path.length - 1; i++) {
        steps.push(tutorialNavStep(path[i], path[i + 1]));
      }
      return steps;
    }

    function getCarrierCounterScreen(carrier) {
      const spotId = getCarrierRestSpotId(carrier);
      if (!spotId) return null;
      if (spotId.startsWith("s2-")) return 2;
      if (spotId.startsWith("s3-")) return 3;
      return null;
    }

    function getTutorialWaitScreen(until) {
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

    function getTutorialKitchenScreen() {
      const active = getActiveScreenNum();
      if (active === 2 || active === 3) return active;
      return null;
    }

    function getTutorialCounterPlaceScreen(carrier) {
      const onCounter = getCarrierCounterScreen(carrier);
      if (carrier === "tray") {
        if (onCounter && isTrayOnCounter()) return onCounter;
        return getTutorialKitchenScreen() ?? 3;
      }
      if (carrier === "bowl") {
        if (onCounter) return onCounter;
        return getTutorialKitchenScreen() ?? 3;
      }
      if (carrier === "pot" || carrier === "plate") {
        if (onCounter) return onCounter;
        return 2;
      }
      if (onCounter) return onCounter;
      return getTutorialKitchenScreen() ?? 2;
    }

    function getTutorialSeasonPayload() {
      if (potRestSpotId?.startsWith("s2-") && potContents) return potContents;
      if (plateRestSpotId?.startsWith("s2-") && plateContents) return plateContents;
      if (potFollowing && potContents) return potContents;
      if (plateFollowing && plateContents) return plateContents;
      return null;
    }

    function getTutorialStepScreenCore(step) {
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
        return getTutorialKitchenScreen() ?? 3;
      }
      if (step.type === "wait") return getTutorialWaitScreen(step.until);
      if (step.type === "counter-place") {
        return getTutorialCounterPlaceScreen(step.carrier);
      }
      if (step.type === "counter-combine") {
        if (potRestSpotId?.startsWith("s3-")) return 3;
        if (potRestSpotId?.startsWith("s2-")) return 2;
        if (plateRestSpotId?.startsWith("s3-")) return 3;
        if (plateRestSpotId?.startsWith("s2-")) return 2;
        if (bowlRestSpotId?.startsWith("s3-")) return 3;
        return getTutorialKitchenScreen() ?? 2;
      }
      return null;
    }

    function getTutorialStepScreen(step, stepIndex) {
      if (!step) return null;
      if (step.type === "carrier" && step.action === "pickup") {
        if (step.carrier === "basket") return 1;
        if (step.carrier === "tray") return null;
        if (typeof stepIndex === "number") {
          for (let i = stepIndex + 1; i < tutorialGuideSteps.length; i++) {
            const nextScreen = getTutorialStepScreenCore(tutorialGuideSteps[i]);
            if (nextScreen) return nextScreen;
          }
        }
        return null;
      }
      return getTutorialStepScreenCore(step);
    }

    function applyTutorialRedirectGlow(targetScreen) {
      const current = getActiveScreenNum();
      if (!targetScreen || current === targetScreen) return false;
      const nextHop = getNextScreenToward(current, targetScreen);
      if (!nextHop) return false;
      const btn = findTutorialNavArrow(current, nextHop);
      if (!btn) return false;
      btn.classList.add("tutorial-glow");
      return true;
    }

    function isCarrierHeld(carrier) {
      if (carrier === "basket") return basketFollowing;
      if (carrier === "plate") return plateFollowing;
      if (carrier === "cup") return cupFollowing;
      if (carrier === "pot") return potFollowing;
      if (carrier === "bowl") return bowlFollowing;
      if (carrier === "tray") return trayFollowing;
      return false;
    }

    function tutorialTrayHasLoadedCarrier(carrier) {
      const slot = getTrayPreferredSlot(carrier);
      if (!slot) return false;
      const entry = trayContents[slot];
      if (!entry) return false;
      return entry.carrier === carrier;
    }

    function getCurrentTutorialStep() {
      if (!tutorialGuideActive || tutorialGuideIndex >= tutorialGuideSteps.length) {
        return null;
      }
      return tutorialGuideSteps[tutorialGuideIndex];
    }

    function clearTutorialGlows() {
      root.querySelectorAll(".tutorial-glow").forEach((el) => {
        el.classList.remove("tutorial-glow");
      });
    }

    function checkTutorialWaitComplete(step) {
      if (step.until === "sink-ready") {
        return !!sinkContents && !sinkWashing && sinkContents.state === "washed";
      }
      if (step.until === "blender-done") {
        return !!blenderResult && !blenderBlending;
      }
      if (step.until === "oven-done") {
        return !!ovenResult && !ovenBaking;
      }
      if (step.until === "microwave-done") {
        return !!microwaveResult && !microwaveHeating;
      }
      if (step.until === "cutting-done") {
        return (
          !cuttingInProgress &&
          plateFollowing &&
          plateContents &&
          plateContents.state === "cut"
        );
      }
      if (step.until === "dishwasher-done") {
        return (
          !dishwasherWashing &&
          !dishwasherLoad &&
          !plateDirty &&
          !trayDirty
        );
      }
      return false;
    }

    function shouldAutoSkipTutorialStep(step) {
      if (!step) return false;
      if (step.type === "wait") return checkTutorialWaitComplete(step);
      if (step.type === "carrier" && step.action === "pickup") {
        return isCarrierHeld(step.carrier);
      }
      if (step.type === "nav") {
        const active = root.querySelector(".screen.active");
        const current = active ? Number(active.dataset.screen) : null;
        return current === step.to;
      }
      if (step.type === "cooler" && step.action === "open") {
        return kitchenCooler.classList.contains("open");
      }
      if (step.type === "oven" && step.action === "open") {
        return kitchenOven.classList.contains("open");
      }
      if (step.type === "microwave" && step.action === "open") {
        return kitchenMicrowave.classList.contains("open");
      }
      if (step.type === "tray-load") {
        return tutorialTrayHasLoadedCarrier(step.carrier);
      }
      if (step.type === "tray" && step.action === "done") {
        return trayHasLoad() && !isTrayCloseupOpen();
      }
      if (step.type === "cashier-tray" && step.action === "place") {
        return trayAtCashier;
      }
      if (step.type === "meat-box" && step.action === "take") {
        return (
          plateFollowing &&
          plateContents &&
          plateContents.crop === "meat" &&
          plateContents.state === "raw"
        );
      }
      if (step.type === "trash" && step.action === "throw") {
        return plateDirty && !plateContents;
      }
      if (step.type === "dishwasher" && step.action === "open") {
        return kitchenDishwasher.classList.contains("open");
      }
      if (step.type === "dishwasher" && step.action === "load") {
        return (
          dishwasherWashing ||
          dishwasherLoad === "plate" ||
          dishwasherLoad === "tray"
        );
      }
      if (step.type === "cafeteria-tray" && step.action === "pickup") {
        return trayFollowing && trayDirty;
      }
      if (step.type === "counter-place") {
        if (step.carrier === "tray") return isTrayOnCounter();
        if (step.carrier === "pot") {
          if (potRestSpotId?.startsWith("s2-")) return true;
          if (
            potFollowing &&
            potContents &&
            isPotSoup(potContents) &&
            potContents.salted &&
            potContents.peppered
          ) {
            return true;
          }
          return false;
        }
        if (step.carrier === "plate") {
          if (plateRestSpotId?.startsWith("s2-")) return true;
          if (plateFollowing && plateContents && isFrenchFriesPrep(plateContents)) {
            return true;
          }
          return false;
        }
      }
      if (step.type === "season") {
        const payload = getTutorialSeasonPayload();
        if (!payload) return false;
        if (step.seasoning === "salt") return !!payload.salted;
        if (step.seasoning === "pepper") return !!payload.peppered;
      }
      if (step.type === "shaker" && step.action === "pickup") {
        const payload = getTutorialSeasonPayload();
        if (!payload) return false;
        if (step.which === "salt") return !!payload.salted;
        if (step.which === "pepper") return !!payload.peppered;
      }
      if (step.type === "counter-combine") {
        if (!potRestSpotId || !potContents || !isPotSoup(potContents)) return false;
        if (isFinishedSoupPrep(potContents)) return true;
        if (
          potContents.stew &&
          potContents.soup !== "potatoes" &&
          potContents.soup !== "tomatoes"
        ) {
          return true;
        }
      }
      return false;
    }

    function getTutorialPrerequisiteCarrier(step) {
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

    function getTutorialPrerequisiteScreen(carrier) {
      if (carrier === "basket") return 1;
      return null;
    }

    function tutorialRewindOnCarrierPutDown(carrier) {
      if (!tutorialGuideActive || !tutorialMode || tutorialGuideIndex <= 0) return;
      const prev = tutorialGuideSteps[tutorialGuideIndex - 1];
      if (
        prev?.type !== "carrier" ||
        prev.carrier !== carrier ||
        prev.action !== "pickup"
      ) {
        return;
      }
      const cur = getCurrentTutorialStep();
      if (!cur) return;
      if (cur.type === "carrier" && cur.carrier === carrier && cur.action === "pickup") {
        return;
      }
      if (getTutorialPrerequisiteCarrier(cur) === carrier) {
        tutorialGuideIndex -= 1;
      }
    }

    function applyTutorialGlowForStep(step, stepIndex) {
      if (!step) return;
      const prereq = getTutorialPrerequisiteCarrier(step);
      if (prereq && !isCarrierHeld(prereq)) {
        const prereqScreen = getTutorialPrerequisiteScreen(prereq);
        if (
          prereqScreen &&
          applyTutorialRedirectGlow(prereqScreen)
        ) {
          return;
        }
        const prereqEl = getEl(prereq);
        if (prereqEl) {
          prereqEl.classList.add("tutorial-glow");
          return;
        }
      }
      if (applyTutorialRedirectGlow(getTutorialStepScreen(step, stepIndex))) return;
      if (step.type === "nav") {
        const current = getActiveScreenNum();
        if (current !== step.to) {
          const nextHop = getNextScreenToward(current, step.to);
          if (nextHop) {
            const btn = findTutorialNavArrow(current, nextHop);
            if (btn) btn.classList.add("tutorial-glow");
          }
        }
        return;
      }
      if (step.type === "carrier") {
        const el = getEl(step.carrier);
        if (el && step.action === "pickup" && !isCarrierHeld(step.carrier)) {
          el.classList.add("tutorial-glow");
        }
        return;
      }
      if (step.type === "crop") {
        root.querySelectorAll('.plant[data-crop="' + step.crop + '"]').forEach((plant) => {
          plant.classList.add("tutorial-glow");
        });
        return;
      }
      if (step.type === "sink") {
        kitchenSink.classList.add("tutorial-glow");
        return;
      }
      if (step.type === "blender") {
        kitchenBlender.classList.add("tutorial-glow");
        return;
      }
      if (step.type === "oven") {
        kitchenOven.classList.add("tutorial-glow");
        return;
      }
      if (step.type === "cooler" && step.action === "open") {
        kitchenCooler.classList.add("tutorial-glow");
        return;
      }
      if (step.type === "cooler-fill") {
        const drinkBtn = root.querySelector(
          '.cooler-drink[data-drink="' + step.drink + '"]'
        );
        if (drinkBtn) drinkBtn.classList.add("tutorial-glow");
        return;
      }
      if (step.type === "cutting-board") {
        kitchenCuttingBoard.classList.add("tutorial-glow");
        return;
      }
      if (step.type === "microwave") {
        kitchenMicrowave.classList.add("tutorial-glow");
        return;
      }
      if (step.type === "meat-box") {
        if (meatBox) meatBox.classList.add("tutorial-glow");
        return;
      }
      if (step.type === "trash") {
        const trash = getEl("kitchenTrash");
        if (trash) trash.classList.add("tutorial-glow");
        return;
      }
      if (step.type === "dishwasher") {
        if (kitchenDishwasher) kitchenDishwasher.classList.add("tutorial-glow");
        return;
      }
      if (step.type === "cafeteria-tray" && step.action === "pickup") {
        if (cafeteriaCartPickup?.classList.contains("can-pickup")) {
          cafeteriaCartPickup.classList.add("tutorial-glow");
        }
        return;
      }
      if (step.type === "counter-place" || step.type === "counter-combine") {
        root.querySelectorAll(".counter-rest-spot").forEach((spot) => {
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
        const shaker = step.which === "salt" ? saltShaker : pepperShaker;
        if (shaker && step.action === "pickup") shaker.classList.add("tutorial-glow");
        return;
      }
      if (step.type === "season") {
        root.querySelectorAll(".counter-rest-spot.can-season").forEach((spot) => {
          spot.classList.add("tutorial-glow");
        });
        return;
      }
      if (step.type === "tray" && step.action === "place-food") {
        if (trayActionMenu?.classList.contains("open") && trayMenuPlaceFood) {
          trayMenuPlaceFood.classList.add("tutorial-glow");
        } else if (isTrayOnCounter() && tray) {
          tray.classList.add("tutorial-glow");
        }
        return;
      }
      if (step.type === "tray" && step.action === "done") {
        if (trayCloseupDone) trayCloseupDone.classList.add("tutorial-glow");
        return;
      }
      if (step.type === "tray-load") {
        const source = trayCloseupSources?.querySelector(
          '.tray-source[data-carrier="' + step.carrier + '"]'
        );
        if (source) source.classList.add("tutorial-glow");
        return;
      }
      if (step.type === "cashier-tray" && step.action === "place") {
        if (cashierTraySpot) cashierTraySpot.classList.add("tutorial-glow");
      }
    }

    function refreshTutorialGlow() {
      clearTutorialGlows();
      if (!tutorialMode || !tutorialGuideActive) return;

      while (tutorialGuideIndex < tutorialGuideSteps.length) {
        const step = getCurrentTutorialStep();
        if (!step) break;
        if (shouldAutoSkipTutorialStep(step)) {
          tutorialGuideIndex += 1;
          continue;
        }
        if (step.type === "wait") {
          if (checkTutorialWaitComplete(step)) {
            tutorialGuideIndex += 1;
            continue;
          }
          applyTutorialGlowForStep(step, tutorialGuideIndex);
          return;
        }
        applyTutorialGlowForStep(step, tutorialGuideIndex);
        return;
      }

      const finishingDishwash = tutorialDishwashPhase;
      stopTutorialGuide();
      if (finishingDishwash) {
        finishTutorialDishwashPhase();
      }
    }

    function tutorialStepMatches(action, step) {
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

    function advanceTutorialGuide() {
      if (!tutorialGuideActive) return;
      tutorialGuideIndex += 1;
      refreshTutorialGlow();
    }

    function maybeAdvanceTutorialGuide(action) {
      if (!tutorialGuideActive || !tutorialMode) return;
      const step = getCurrentTutorialStep();
      if (!step || step.type === "wait") return;
      if (!tutorialStepMatches(action, step)) return;
      advanceTutorialGuide();
    }

    function handleTutorialNavPress(btn, destScreen) {
      const step = getCurrentTutorialStep();
      if (!step || step.type !== "nav") return false;
      if (!btn.classList.contains("tutorial-glow")) return false;
      const active = root.querySelector(".screen.active");
      const fromScreen = active ? Number(active.dataset.screen) : null;
      if (fromScreen !== step.from || destScreen !== step.to) return false;
      maybeAdvanceTutorialGuide({ type: "nav", from: step.from, to: step.to });
      return true;
    }

    function startTutorialGuide(steps) {
      if (!steps || !steps.length) return;
      tutorialGuideSteps = steps;
      tutorialGuideIndex = 0;
      tutorialGuideActive = true;
      refreshTutorialGlow();
    }

    function stopTutorialGuide() {
      tutorialGuideActive = false;
      tutorialGuideSteps = [];
      tutorialGuideIndex = 0;
      clearTutorialGlows();
    }

    function buildTutorialCashierOrder() {
      const kind =
        TUTORIAL_ORDER_SEQUENCE[
          tutorialCustomerIndex % TUTORIAL_ORDER_SEQUENCE.length
        ];
      tutorialCustomerIndex += 1;
      let catalog = CASHIER_ORDER_FOODS;
      if (kind === "drink") catalog = TUTORIAL_COOLER_DRINKS;
      else if (kind === "soup") catalog = TUTORIAL_SOUPS;
      const item = catalog[Math.floor(Math.random() * catalog.length)];
      return { items: [{ ...item }] };
    }

    function buildCashierOrder() {
      if (tutorialMode) {
        return buildTutorialCashierOrder();
      }
      const counts =
        CASHIER_ORDER_COUNT_OPTIONS[
          Math.floor(Math.random() * CASHIER_ORDER_COUNT_OPTIONS.length)
        ];
      const items = [
        ...pickRandomCashierCatalogItems(
          CASHIER_ORDER_DRINKS,
          counts.drink
        ),
        ...pickRandomCashierCatalogItems(CASHIER_ORDER_SOUPS, counts.soup),
        ...pickRandomCashierCatalogItems(CASHIER_ORDER_FOODS, counts.food),
      ];
      shuffleCashierOrderItems(items);
      return { items };
    }

    function pickCashierOrder() {
      if (tutorialMode) {
        const order = buildTutorialCashierOrder();
        cashierLastOrderSig = cashierOrderSignature(order);
        return {
          items: order.items.map((item) => ({ ...item })),
        };
      }
      for (let attempt = 0; attempt < 16; attempt++) {
        const order = buildCashierOrder();
        const sig = cashierOrderSignature(order);
        if (sig !== cashierLastOrderSig) {
          cashierLastOrderSig = sig;
          return {
            items: order.items.map((item) => ({ ...item })),
          };
        }
      }
      const order = buildCashierOrder();
      cashierLastOrderSig = cashierOrderSignature(order);
      return {
        items: order.items.map((item) => ({ ...item })),
      };
    }

    function ensureCashierCustomer() {
      if (tutorialMode && !garyIntroComplete) return;
      if (garyCustomerEnterHeld) return;
      if (tutorialDishwashPhase || tutorialDishwashQueue) return;
      if (isNighttime) {
        prepareCashierIntroHold();
        return;
      }
      const listEmpty =
        !cashierOrderList || cashierOrderList.children.length === 0;
      if (
        !cashierCurrentOrder ||
        !cashierCurrentOrder.items?.length ||
        listEmpty
      ) {
        spawnCashierCustomer();
      } else {
        renderCashierOrder();
      }
    }

    function applyCustomerLook() {
      if (!cashierCustomer) return;
      cashierCustomer.className = customerClassNames(randomCustomerLook());
    }

    const CASHIER_DOOR_MS = 560;
    const CASHIER_WALK_MS = 1000;
    const CASHIER_EXIT_MS = 1100;
    const CUSTOMERS_PER_NIGHT = 1;
    const NIGHT_BANNER_HOLD_MS = 2400;

    let customersServed = 0;
    let isNighttime = false;
    const nightBanner = getEl("nightBanner");
    const CASHIER_INTRO_HOLD_MS = 1000;

    function setCashierDoorsOpen(open) {
      if (!cashierGlassDoors) return;
      cashierGlassDoors.classList.toggle("doors-open", open);
    }

    function waitMs(ms) {
      return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    function waitCustomerAreaTransition(fallbackMs) {
      return new Promise((resolve) => {
        if (!cashierCustomerArea) {
          resolve();
          return;
        }
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          cashierCustomerArea.removeEventListener("transitionend", onEnd);
          resolve();
        };
        const onEnd = (e) => {
          if (e.target !== cashierCustomerArea) return;
          if (e.propertyName !== "bottom" && e.propertyName !== "transform") {
            return;
          }
          finish();
        };
        cashierCustomerArea.addEventListener("transitionend", onEnd);
        window.setTimeout(finish, fallbackMs);
      });
    }

    function setCustomerMotionState(state, options) {
      if (!cashierCustomerArea) return;
      const instant = options && options.instant;
      const motionClasses = [
        "is-at-counter",
        "is-behind-doors",
        "is-walking-to-counter",
      ];
      cashierCustomerArea.classList.remove(...motionClasses, "no-transition");
      if (instant) {
        cashierCustomerArea.classList.add("no-transition");
      }
      if (state) {
        cashierCustomerArea.classList.add(state);
      }
      if (instant) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            cashierCustomerArea.classList.remove("no-transition");
          });
        });
      }
    }

    function resetCashierCustomerMotion() {
      setCustomerMotionState("is-at-counter", { instant: true });
    }

    function prepareCashierCustomerBehindDoors() {
      cashierCurrentOrder = pickCashierOrder();
      applyCustomerLook();
      renderCashierOrder();
      if (cashierCustomerOrder) {
        cashierCustomerOrder.classList.add("order-hidden");
      }
      if (cashierCustomerArea) {
        cashierCustomerArea.classList.remove("is-exiting-right", "is-intro-waiting");
      }
      setCustomerMotionState("is-behind-doors", { instant: true });
      setCashierDoorsOpen(false);
    }

    function prepareCashierIntroHold() {
      cashierCurrentOrder = null;
      if (cashierOrderList) cashierOrderList.innerHTML = "";
      clearCustomerCarryTray();
      setCashierDoorsOpen(false);
      setCashierBusy(false);
      if (cashierCustomerOrder) {
        cashierCustomerOrder.classList.add("order-hidden");
      }
      if (cashierCustomerArea) {
        cashierCustomerArea.classList.remove("is-exiting-right");
        cashierCustomerArea.classList.add("is-intro-waiting");
      }
      setCustomerMotionState("is-behind-doors", { instant: true });
    }

    async function runCashierCustomerEnterSequence(alreadyBusy) {
      if (tutorialMode && !garyIntroComplete) return;
      if (tutorialDishwashPhase || tutorialDishwashQueue) return;
      if (isNighttime) return;
      await waitForGaryBeforeCustomerEnter();
      if (!cashierCustomerArea || !cashierGlassDoors) {
        spawnCashierCustomerInstant();
        return;
      }
      if (!alreadyBusy) {
        if (cashierSequenceBusy) return;
        setCashierBusy(true);
      }
      try {
        prepareCashierCustomerBehindDoors();
        await waitMs(120);
        setCashierDoorsOpen(true);
        await waitMs(CASHIER_DOOR_MS);
        setCustomerMotionState("is-walking-to-counter");
        await waitCustomerAreaTransition(CASHIER_WALK_MS);
        setCustomerMotionState("is-at-counter");
        await waitMs(CASHIER_DOOR_MS);
        setCashierDoorsOpen(false);
        if (cashierCustomerOrder) {
          cashierCustomerOrder.classList.remove("order-hidden");
        }
        updateCashierUI();
        if (tutorialMode) {
          if (tutorialCustomerIndex === 1) {
            await playGaryFirstCustomerMessage();
          } else if (tutorialCustomerIndex === 2) {
            await playGaryDrinkCustomerMessage();
          } else if (tutorialCustomerIndex === 3) {
            await playGarySoupCustomerMessage();
          }
          const orderItem = cashierCurrentOrder?.items?.[0];
          if (orderItem) {
            startTutorialGuide(getTutorialGuideSteps(orderItem));
          }
        }
      } finally {
        setCashierBusy(false);
      }
    }

    function spawnCashierCustomerInstant() {
      if (isNighttime) return;
      cashierCurrentOrder = pickCashierOrder();
      applyCustomerLook();
      renderCashierOrder();
      resetCashierCustomerMotion();
      if (cashierCustomerOrder) {
        cashierCustomerOrder.classList.remove("order-hidden");
      }
      updateCashierUI();
    }

    function spawnCashierCustomer() {
      if (isNighttime) return;
      runCashierCustomerEnterSequence();
    }

    function setCashierBusy(busy) {
      cashierSequenceBusy = busy;
      if (screen5) {
        screen5.classList.toggle("cashier-busy", busy);
      }
    }

    function releaseStuckUI() {
      hideTrayActionMenu();
      closeTrayCloseup();
      trayDragState = null;
      window.removeEventListener("pointermove", onTrayDragMove);
      window.removeEventListener("pointerup", endTrayDrag);
      window.removeEventListener("pointercancel", endTrayDrag);
      if (trayDragGhost) {
        trayDragGhost.hidden = true;
        trayDragGhost.innerHTML = "";
      }
      setCashierBusy(false);
    }

    function clearCustomerCarryTray() {
      if (cashierCustomerTrayGrid) {
        cashierCustomerTrayGrid.innerHTML = "";
      }
      if (cashierCustomer) {
        cashierCustomer.classList.remove("has-carry-tray");
      }
    }

    function buildCustomerCarryTray() {
      if (!cashierCustomerTrayGrid) return;
      cashierCustomerTrayGrid.innerHTML = "";
      TRAY_SLOTS.forEach((slot) => {
        const entry = trayContents[slot];
        const cell = document.createElement("div");
        cell.className = "customer-carry-tray-cell";
        if (entry) {
          renderTrayEntryIcon(cell, entry);
        }
        cashierCustomerTrayGrid.appendChild(cell);
      });
      if (cashierCustomer) {
        cashierCustomer.classList.add("has-carry-tray");
      }
    }

    function ensureMudPuddleLayers() {
      MUD_PUDDLE_SCREENS.forEach((num) => {
        const floor = root.querySelector("#screen-" + num + " .kitchen-floor");
        if (!floor || floor.querySelector(".mud-puddle-layer")) return;
        const layer = document.createElement("div");
        layer.className = "mud-puddle-layer";
        layer.dataset.screen = String(num);
        layer.setAttribute("aria-hidden", "true");
        floor.appendChild(layer);
      });
    }

    function getMudPuddleBounds(screenNum) {
      if (screenNum === 6) return { xMin: 14, xMax: 86, yMin: 12, yMax: 88 };
      return { xMin: 8, xMax: 92, yMin: 10, yMax: 90 };
    }

    function mudPuddlesOverlap(x, y, r, placed, gap) {
      return placed.some((p) => {
        const dx = x - p.x;
        const dy = (y - p.y) * MUD_FLOOR_ASPECT;
        return Math.hypot(dx, dy) < r + p.r + gap;
      });
    }

    function generateMudPuddlesForScreen(screenNum) {
      const layer = root.querySelector(
        "#screen-" + screenNum + " .mud-puddle-layer"
      );
      if (!layer) return;
      layer.innerHTML = "";
      const count = Math.floor(Math.random() * (MUD_PUDDLE_MAX + 1));
      const bounds = getMudPuddleBounds(screenNum);
      const placed = [];
      const gap = 2.5;

      for (let n = 0; n < count; n++) {
        for (let attempt = 0; attempt < 64; attempt++) {
          const r = 3.5 + Math.random() * 3;
          const x = bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin);
          const y = bounds.yMin + Math.random() * (bounds.yMax - bounds.yMin);
          if (mudPuddlesOverlap(x, y, r, placed, gap)) continue;

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

      mudPuddlesByScreen[screenNum] = placed;
    }

    function spawnNightMudPuddles() {
      ensureMudPuddleLayers();
      MUD_PUDDLE_SCREENS.forEach((num) => generateMudPuddlesForScreen(num));
    }

    function clearMudPuddles() {
      MUD_PUDDLE_SCREENS.forEach((num) => {
        mudPuddlesByScreen[num] = [];
      });
      root.querySelectorAll(".mud-puddle-layer").forEach((layer) => {
        layer.innerHTML = "";
      });
    }

    function tryCleanMudPuddle(puddleEl) {
      if (
        !mopFollowing ||
        !isNighttime ||
        !puddleEl ||
        puddleEl.classList.contains("cleaning")
      ) {
        return false;
      }

      const layer = puddleEl.closest(".mud-puddle-layer");
      const screenNum = layer ? Number(layer.dataset.screen) : 0;
      const list = mudPuddlesByScreen[screenNum] || [];
      const id = puddleEl.dataset.puddleId;
      if (!list.some((p) => p.id === id)) return false;

      puddleEl.classList.add("cleaning");
      if (mop) {
        mop.classList.remove("mop-swishing");
        void mop.offsetWidth;
        mop.classList.add("mop-swishing");
        if (mopSwishTimer) clearTimeout(mopSwishTimer);
        mopSwishTimer = window.setTimeout(() => {
          mop?.classList.remove("mop-swishing");
          mopSwishTimer = null;
        }, 900);
      }

      window.setTimeout(() => {
        puddleEl.remove();
        mudPuddlesByScreen[screenNum] = list.filter((p) => p.id !== id);
      }, 480);
      return true;
    }

    function resetNightState() {
      customersServed = 0;
      isNighttime = false;
      root.classList.remove("nighttime");
      root.classList.remove("mop-out");
      clearMudPuddles();
      if (nightBanner) {
        nightBanner.classList.remove("is-visible");
        nightBanner.hidden = true;
        nightBanner.setAttribute("aria-hidden", "true");
      }
    }

    function shouldTriggerNight() {
      if (tutorialMode) {
        return tutorialCustomerIndex === 3 && !isNighttime;
      }
      return (
        customersServed > 0 &&
        customersServed % CUSTOMERS_PER_NIGHT === 0 &&
        !isNighttime
      );
    }

    async function playNightTransition() {
      if (isNighttime) return;
      isNighttime = true;
      root.classList.add("nighttime");
      prepareCashierIntroHold();
      clearCafeteriaDiners();

      if (nightBanner) {
        nightBanner.hidden = false;
        nightBanner.removeAttribute("hidden");
        nightBanner.setAttribute("aria-hidden", "false");
        await waitMs(40);
        nightBanner.classList.add("is-visible");
      }

      await waitMs(NIGHT_BANNER_HOLD_MS);

      if (nightBanner) {
        nightBanner.classList.remove("is-visible");
        await waitMs(700);
        nightBanner.hidden = true;
        nightBanner.setAttribute("aria-hidden", "true");
      }

      spawnNightMudPuddles();
    }

    async function afterCustomerServed() {
      customersServed += 1;
      if (shouldTriggerNight()) {
        await playNightTransition();
      }
    }

    async function spawnNextTutorialCustomerAfterServe() {
      if (isNighttime) resetNightState();
      await runCashierCustomerEnterSequence(true);
    }

    async function runCashierCustomerExitSequence() {
      if (!cashierCustomerArea || !cashierGlassDoors) {
        buildCustomerCarryTray();
        clearTrayContents();
        trayDirty = false;
        trayAtCashier = false;
        tray.classList.remove("cashier-away");
        sendTrayToCafeteriaCart();
        if (tutorialMode) {
          stopTutorialGuide();
          if (tutorialCustomerIndex === 1) {
            await runTutorialTrayWashIntro();
          } else if (tutorialCustomerIndex === 2) {
            prepareCashierIntroHold();
            await playGaryDrinkDoneMessage();
          } else if (tutorialCustomerIndex === 3) {
            prepareCashierIntroHold();
            tutorialResumeOrderItem = null;
          }
        }
        await afterCustomerServed();
        if (tutorialMode && tutorialCustomerIndex === 2) {
          await spawnNextTutorialCustomerAfterServe();
        } else if (tutorialMode && tutorialCustomerIndex === 3) {
          await playGaryNightClosedMessage();
        } else if (!tutorialMode && !isNighttime) {
          spawnCashierCustomerInstant();
        }
        updateCarrierUI();
        return;
      }

      setCashierBusy(true);
      try {
        if (cashierCustomerOrder) {
          cashierCustomerOrder.classList.add("order-hidden");
        }

        buildCustomerCarryTray();
        clearTrayContents();
        trayDirty = false;
        trayAtCashier = false;
        tray.classList.remove("cashier-away");
        sendTrayToCafeteriaCart();
        updateCashierUI();
        updateCarrierUI();

        showCashierToast("success", "Perfect order!");

        cashierCustomerArea.classList.add("is-exiting-right");
        await waitCustomerAreaTransition(CASHIER_EXIT_MS);
        clearCustomerCarryTray();
        if (tutorialMode) {
          stopTutorialGuide();
          if (tutorialCustomerIndex === 1) {
            await runTutorialTrayWashIntro();
          } else if (tutorialCustomerIndex === 2) {
            prepareCashierIntroHold();
            await playGaryDrinkDoneMessage();
          } else if (tutorialCustomerIndex === 3) {
            prepareCashierIntroHold();
            tutorialResumeOrderItem = null;
          }
        }
        await afterCustomerServed();
        if (tutorialMode && tutorialCustomerIndex === 2) {
          await spawnNextTutorialCustomerAfterServe();
        } else if (tutorialMode && tutorialCustomerIndex === 3) {
          await playGaryNightClosedMessage();
        } else if (!isNighttime) {
          await runCashierCustomerEnterSequence(true);
        }
      } finally {
        setCashierBusy(false);
      }
    }

    function finishCashierOrder() {
      if (cashierSequenceBusy) return;
      runCashierCustomerExitSequence();
    }

    function renderCashierTrayPreview() {
      cashierTrayPreview.innerHTML = "";
      if (!trayAtCashier) {
        cashierTrayPreview.setAttribute("aria-hidden", "true");
        return;
      }
      cashierTrayPreview.removeAttribute("aria-hidden");
      TRAY_SLOTS.forEach((slot) => {
        const entry = trayContents[slot];
        const cell = document.createElement("div");
        cell.className = "cashier-tray-preview-item";
        cell.dataset.slot = slot;
        if (entry) {
          renderTrayEntryIcon(cell, entry);
        }
        cashierTrayPreview.appendChild(cell);
      });
    }

    function syncTrayCashierAway() {
      tray.classList.toggle("cashier-away", trayAtCashier && !trayFollowing);
    }

    function placeTrayOnCashierSpot() {
      if (cashierSequenceBusy) return;
      if (!isScreen5Active() || !trayFollowing || trayAtCashier) return;
      if (trayDirty) {
        showCashierToast("error", "Wash the tray in the dishwasher first!");
        return;
      }
      if (!trayMeetsCashierMinimum()) {
        showCashierToast(
          "error",
          tutorialMode
            ? "Put at least one item on the tray first!"
            : "Need a drink AND food or soup!"
        );
        return;
      }
      trayFollowing = false;
      tray.classList.remove("following");
      tray.style.left = "";
      tray.style.top = "";
      trayAtCashier = true;
      syncTrayCashierAway();
      if (trayMatchesCashierOrder(cashierCurrentOrder)) {
        finishCashierOrder();
      } else {
        showCashierToast("error", "Wrong order — check what they asked for!");
      }
      maybeAdvanceTutorialGuide({ type: "cashier-tray", action: "place" });
      updateCashierUI();
      updateCarrierUI();
    }

    function pickUpTrayFromCashierSpot() {
      if (cashierSequenceBusy) return;
      if (!trayAtCashier || !isScreen5Active()) return;
      trayAtCashier = false;
      syncTrayCashierAway();
      pickUpTray();
    }

    function handleCashierTraySpotClick() {
      if (trayAtCashier) {
        pickUpTrayFromCashierSpot();
        return;
      }
      if (trayFollowing) {
        placeTrayOnCashierSpot();
      }
    }

    function updateCashierUI() {
      if (!cashierTraySpot) return;
      const canPlace =
        isScreen5Active() && trayFollowing && trayMeetsCashierMinimum();
      cashierTraySpot.classList.toggle("can-place", canPlace);
      cashierTraySpot.classList.toggle("has-tray", trayAtCashier);
      renderCashierTrayPreview();
      syncTrayCashierAway();
      cashierTraySpot.setAttribute(
        "aria-label",
        trayAtCashier
          ? "Tray on counter — click to pick up"
          : canPlace
            ? "Place tray here"
            : trayFollowing
              ? tutorialMode
                ? "Tray needs at least one item"
                : "Tray needs a drink AND food or soup"
              : "Pick up a loaded tray to place here"
      );
    }

    function getActiveShaker() {
      if (saltFollowing) return "salt";
      if (pepperFollowing) return "pepper";
      return null;
    }

    function getSeasoningTargetKey(carrier, payload) {
      if (!payload) return null;
      if (carrier === "plate" && isFrenchFriesPrep(payload)) {
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
        if (isPotatoMeatStewPrep(payload)) return "pot:meat-potato-soup-prep";
        if (isMeatStewPrep(payload)) return "pot:meat-stew-prep";
        if (isFinishedSoupPrep(payload)) {
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

    function canApplySeasoning(carrier, payload, seasoning) {
      const key = getSeasoningTargetKey(carrier, payload);
      if (!key) return false;
      const rules = FOOD_SEASONING[key];
      if (!rules || !rules[seasoning]) return false;
      if (seasoning === "salt" && payload.salted) return false;
      if (seasoning === "pepper" && payload.peppered) return false;
      return true;
    }

    function applySeasoningToCarrier(carrier, seasoning) {
      const payload = getCarrierPayload(carrier);
      if (!payload) return;
      if (
        carrier === "plate" &&
        isFrenchFriesPrep(payload) &&
        seasoning === "salt"
      ) {
        applyCarrierPayload(carrier, makeFrenchFries());
        updateCarrierUI();
        return;
      }
      const next = { ...payload };
      if (seasoning === "salt") next.salted = true;
      if (seasoning === "pepper") next.peppered = true;
      applyCarrierPayload(carrier, next);
      updateCarrierUI();
    }

    function moveShakerWithCursor(shakerEl, clientX, clientY) {
      shakerEl.style.left = clientX + "px";
      shakerEl.style.top = clientY + "px";
    }

    function returnSaltShaker() {
      if (!saltFollowing) return;
      saltFollowing = false;
      saltShaker.classList.remove("following");
      saltShaker.style.left = "";
      saltShaker.style.top = "";
      saltShakerDock.classList.remove("is-empty");
      saltShaker.setAttribute("aria-label", "Pick up salt");
      updateCounterRestSpots();
    }

    function returnPepperShaker() {
      if (!pepperFollowing) return;
      pepperFollowing = false;
      pepperShaker.classList.remove("following");
      pepperShaker.style.left = "";
      pepperShaker.style.top = "";
      pepperShakerDock.classList.remove("is-empty");
      pepperShaker.setAttribute("aria-label", "Pick up pepper");
      updateCounterRestSpots();
    }

    function putDownShakers(except) {
      if (except !== "salt" && saltFollowing) returnSaltShaker();
      if (except !== "pepper" && pepperFollowing) returnPepperShaker();
    }

    function returnShakersIfNotOnScreen2() {
      if (!isScreen2Active()) putDownShakers();
    }

    function pickUpSalt() {
      if (!isScreen2Active() || saltFollowing) return;
      putDownShakers("salt");
      putDownOtherCarriers("salt");
      saltFollowing = true;
      saltShaker.classList.add("following");
      saltShakerDock.classList.add("is-empty");
      saltShaker.setAttribute("aria-label", "Salt — click dock to put down, or shake on counter food");
      moveShakerWithCursor(
        saltShaker,
        saltShaker.getBoundingClientRect().left,
        saltShaker.getBoundingClientRect().top
      );
      updateCounterRestSpots();
      maybeAdvanceTutorialGuide({ type: "shaker", which: "salt", action: "pickup" });
    }

    function pickUpPepper() {
      if (!isScreen2Active() || pepperFollowing) return;
      putDownShakers("pepper");
      putDownOtherCarriers("pepper");
      pepperFollowing = true;
      pepperShaker.classList.add("following");
      pepperShakerDock.classList.add("is-empty");
      pepperShaker.setAttribute("aria-label", "Pepper — click dock to put down, or shake on counter food");
      moveShakerWithCursor(
        pepperShaker,
        pepperShaker.getBoundingClientRect().left,
        pepperShaker.getBoundingClientRect().top
      );
      updateCounterRestSpots();
      maybeAdvanceTutorialGuide({ type: "shaker", which: "pepper", action: "pickup" });
    }

    function playShakerShake(shakerEl) {
      shakerEl.classList.remove("shaking");
      void shakerEl.offsetWidth;
      shakerEl.classList.add("shaking");
      setTimeout(() => shakerEl.classList.remove("shaking"), 800);
    }

    function flashSeasoningOnCarrier(carrierEl, seasoning) {
      carrierEl.classList.remove("season-flash", "season-salt", "season-pepper");
      void carrierEl.offsetWidth;
      carrierEl.classList.add("season-flash", "season-" + seasoning);
      setTimeout(() => {
        carrierEl.classList.remove("season-flash", "season-salt", "season-pepper");
      }, 500);
    }

    function trySeasonCounterSpot(spotEl) {
      const seasoning = getActiveShaker();
      if (!seasoning || !isScreen2Active()) return false;
      if (!spotEl.dataset.spot.startsWith("s2-")) return false;
      const carrier = counterSpotOccupants.get(spotEl.dataset.spot);
      if (!carrier) return false;
      const payload = getCarrierPayload(carrier);
      if (!canApplySeasoning(carrier, payload, seasoning)) return false;
      const shakerEl = seasoning === "salt" ? saltShaker : pepperShaker;
      const carrierEl = getCarrierEl(carrier);
      playShakerShake(shakerEl);
      flashSeasoningOnCarrier(carrierEl, seasoning);
      applySeasoningToCarrier(carrier, seasoning);
      maybeAdvanceTutorialGuide({ type: "season", seasoning });
      return true;
    }

    function trySeasonOnCounterCarrier(counterCarrier) {
      const seasoning = getActiveShaker();
      if (!seasoning || !isScreen2Active()) return false;
      const spotId = getCarrierRestSpotId(counterCarrier);
      if (!spotId || !spotId.startsWith("s2-")) return false;
      const payload = getCarrierPayload(counterCarrier);
      if (!canApplySeasoning(counterCarrier, payload, seasoning)) return false;
      const spotEl = getCounterSpotInActiveScreen(spotId);
      if (!spotEl) return false;
      return trySeasonCounterSpot(spotEl);
    }

    function updateCarrierUI() {
      updateFridgeSlots();
      updateTrashCan();
      updateSinkUI();
      updateMeatBoxUI();
      updateDishwasherUI();
      updateCoolerUI();
      updateCuttingBoardUI();
      updateOvenUI();
      updateMicrowaveUI();
      updateBlenderUI();
      updateCounterRestSpots();
      updateDirtyCarrierVisuals();
      updateTrayVisual();
      updateCashierUI();
      updateTrayStackUI();
      updateCafeteriaCartUI();
      returnShakersIfNotOnScreen2();
      checkTutorialFoodMistake();
      refreshTutorialGlow();
    }

    function getCarrierRestSpotId(carrier) {
      if (carrier === "plate") return plateRestSpotId;
      if (carrier === "cup") return cupRestSpotId;
      if (carrier === "pot") return potRestSpotId;
      if (carrier === "bowl") return bowlRestSpotId;
      if (carrier === "tray") return trayRestSpotId;
      return null;
    }

    function setCarrierRestSpotId(carrier, spotId) {
      if (carrier === "plate") plateRestSpotId = spotId;
      else if (carrier === "cup") cupRestSpotId = spotId;
      else if (carrier === "pot") potRestSpotId = spotId;
      else if (carrier === "bowl") bowlRestSpotId = spotId;
      else if (carrier === "tray") trayRestSpotId = spotId;
    }

    function getCarrierEl(carrier) {
      if (carrier === "plate") return plate;
      if (carrier === "cup") return cup;
      if (carrier === "pot") return pot;
      if (carrier === "bowl") return bowl;
      if (carrier === "tray") return tray;
      return null;
    }

    function getCarrierHome(carrier) {
      if (carrier === "plate") return plateHome;
      if (carrier === "cup") return cupHome;
      if (carrier === "pot") return potHome;
      if (carrier === "bowl") return bowlHome;
      if (carrier === "tray") return trayHome;
      return null;
    }

    function isCarrierFollowing(carrier) {
      if (carrier === "plate") return plateFollowing;
      if (carrier === "cup") return cupFollowing;
      if (carrier === "pot") return potFollowing;
      if (carrier === "bowl") return bowlFollowing;
      if (carrier === "tray") return trayFollowing;
      return false;
    }

    function clearCarrierRestSpot(carrier) {
      const spotId = getCarrierRestSpotId(carrier);
      if (spotId) counterSpotOccupants.delete(spotId);
      setCarrierRestSpotId(carrier, null);
    }

    function returnCarrierToHomeDock(carrier) {
      const el = getCarrierEl(carrier);
      const home = getCarrierHome(carrier);
      if (!el || !home) return;
      el.classList.remove("on-counter");
      el.style.position = "";
      el.style.left = "";
      el.style.top = "";
      el.style.transform = "";
      if (!isCarrierFollowing(carrier) && dishwasherLoad !== carrier) {
        home.classList.remove("is-empty");
      }
    }

    function getCounterSpotPadCenter(spotEl) {
      const r = spotEl.getBoundingClientRect();
      return {
        x: r.left + r.width / 2,
        y: r.bottom - 9,
      };
    }

    function carrierNeedsCounterReposition(carrier, spotEl) {
      const el = getCarrierEl(carrier);
      if (!el || !spotEl || !el.classList.contains("on-counter") || el.style.position !== "fixed") {
        return true;
      }
      const pad = getCounterSpotPadCenter(spotEl);
      const expectedLeft = pad.x - el.offsetWidth / 2;
      const expectedTop = pad.y - el.offsetHeight / 2;
      const left = parseFloat(el.style.left);
      const top = parseFloat(el.style.top);
      if (Number.isNaN(left) || Number.isNaN(top)) return true;
      const drift = 3;
      return Math.abs(left - expectedLeft) > drift || Math.abs(top - expectedTop) > drift;
    }

    function positionCarrierOnCounterSpot(carrier, spotEl) {
      const el = getCarrierEl(carrier);
      if (!el || !spotEl) return;
      if (!carrierNeedsCounterReposition(carrier, spotEl)) return;
      const pad = getCounterSpotPadCenter(spotEl);
      el.classList.add("on-counter");
      el.style.position = "fixed";
      el.style.left = pad.x - el.offsetWidth / 2 + "px";
      el.style.top = pad.y - el.offsetHeight / 2 + "px";
      el.style.transform = "scale(0.78)";
    }

    function getFollowingRestCarrier() {
      if (plateFollowing && !plateRestSpotId) return "plate";
      if (cupFollowing && !cupRestSpotId) return "cup";
      if (potFollowing && !potRestSpotId) return "pot";
      if (bowlFollowing && !bowlRestSpotId) return "bowl";
      if (trayFollowing && !trayRestSpotId) return "tray";
      return null;
    }

    function syncCounterRestForActiveScreen() {
      const active = root.querySelector(".screen.active");
      ["plate", "cup", "pot", "bowl", "tray"].forEach((carrier) => {
        const el = getCarrierEl(carrier);
        const spotId = getCarrierRestSpotId(carrier);
        if (!spotId || isCarrierFollowing(carrier) || dishwasherLoad === carrier) {
          el.classList.remove("counter-rest-away");
          return;
        }
        const spotEl = getCounterSpotInActiveScreen(spotId);
        if (spotEl) {
          el.classList.remove("counter-rest-away");
          positionCarrierOnCounterSpot(carrier, spotEl);
        } else {
          el.classList.add("counter-rest-away");
        }
      });
    }

    function updateCounterRestSpots() {
      const canPlace = getFollowingRestCarrier();
      const activeShaker = getActiveShaker();
      root.querySelectorAll(".counter-rest-spot").forEach((spot) => {
        const spotId = spot.dataset.spot;
        const occupied = counterSpotOccupants.has(spotId);
        const canCombine = canCounterCombineAtSpot(spotId);
        const onCarrier = occupied ? counterSpotOccupants.get(spotId) : null;
        const canSeason =
          !!activeShaker &&
          isScreen2Active() &&
          spotId.startsWith("s2-") &&
          occupied &&
          canApplySeasoning(onCarrier, getCarrierPayload(onCarrier), activeShaker);
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
      syncCounterRestForActiveScreen();
    }

    function tryCombineOnCounterCarrier(counterCarrier) {
      const spotId = getCarrierRestSpotId(counterCarrier);
      if (!spotId || !getFollowingRestCarrier()) return false;
      if (!canCounterCombineAtSpot(spotId)) return false;
      const spotEl = getCounterSpotInActiveScreen(spotId);
      if (!spotEl) return false;
      return tryCounterCombine(spotEl);
    }

    function tryCounterCombine(spotEl) {
      const incoming = getFollowingRestCarrier();
      if (!incoming) return false;

      const spotId = spotEl.dataset.spot;
      let onCarrier = counterSpotOccupants.get(spotId);
      let withCarrier = incoming;
      if (!onCarrier) return false;

      let onPayload = getCarrierPayload(onCarrier);
      let withPayload = getCarrierPayload(withCarrier);
      if (!onPayload || !withPayload) return false;
      if (getCarrierDirty(onCarrier) || getCarrierDirty(withCarrier)) return false;

      let recipe = findCounterRecipe(onCarrier, onPayload, withCarrier, withPayload);
      if (!recipe) {
        recipe = findCounterRecipe(withCarrier, withPayload, onCarrier, onPayload);
        if (!recipe) return false;
        const swap = onCarrier;
        onCarrier = withCarrier;
        withCarrier = swap;
        onPayload = getCarrierPayload(onCarrier);
        withPayload = getCarrierPayload(withCarrier);
      }

      const resultCarrier = recipeResultCarrier(recipe, onCarrier, withCarrier);
      const otherCarrier = resultCarrier === onCarrier ? withCarrier : onCarrier;
      const prevOnSpot = counterSpotOccupants.get(spotId);
      const resultStaysOnSpot =
        resultCarrier === prevOnSpot &&
        getCarrierRestSpotId(resultCarrier) === spotId &&
        getCarrierEl(resultCarrier).classList.contains("on-counter");

      applyCarrierPayload(resultCarrier, recipe.result(onPayload, withPayload));
      clearCarrierPayload(otherCarrier);

      let shouldDirty = true;
      if (otherCarrier === onCarrier && recipe.dirtyOn === false) shouldDirty = false;
      if (otherCarrier === withCarrier && recipe.dirtyWith === false) shouldDirty = false;
      if (shouldDirty) setCarrierDirty(otherCarrier, true);

      stopCarrierFollowing(incoming);

      if (prevOnSpot && prevOnSpot !== resultCarrier) {
        setCarrierRestSpotId(prevOnSpot, null);
      }
      counterSpotOccupants.set(spotId, resultCarrier);
      setCarrierRestSpotId(resultCarrier, spotId);

      returnCarrierToHomeDock(otherCarrier);

      const resultEl = getCarrierEl(resultCarrier);
      resultEl.classList.remove("following");
      getCarrierHome(resultCarrier).classList.add("is-empty");
      resultEl.setAttribute("aria-label", "Pick up from counter");
      if (!resultStaysOnSpot) {
        positionCarrierOnCounterSpot(resultCarrier, spotEl);
      }

      flashCounterCombo(spotEl);
      updateCarrierUI();
      maybeAdvanceTutorialGuide({ type: "counter-combine" });
      return true;
    }

    function restCarrierOnSpot(carrier, spotEl) {
      const spotId = spotEl.dataset.spot;
      if (counterSpotOccupants.has(spotId)) return;
      if (!isCarrierFollowing(carrier)) return;

      clearCarrierRestSpot(carrier);
      counterSpotOccupants.set(spotId, carrier);
      setCarrierRestSpotId(carrier, spotId);

      const el = getCarrierEl(carrier);
      const home = getCarrierHome(carrier);
      el.classList.remove("following");
      if (carrier === "plate") plateFollowing = false;
      else if (carrier === "cup") cupFollowing = false;
      else if (carrier === "pot") potFollowing = false;
      else if (carrier === "bowl") bowlFollowing = false;
      else if (carrier === "tray") trayFollowing = false;

      positionCarrierOnCounterSpot(carrier, spotEl);
      home.classList.add("is-empty");
      el.setAttribute(
        "aria-label",
        carrier === "tray"
          ? "Tray on counter — click for options"
          : "Pick up from counter"
      );
      requestAnimationFrame(() => {
        positionCarrierOnCounterSpot(carrier, spotEl);
        updateCarrierUI();
      });
      maybeAdvanceTutorialGuide({ type: "counter-place", carrier });
    }

    function tryPlaceOnCounterSpot(spotEl) {
      const carrier = getFollowingRestCarrier();
      if (!carrier) return;
      if (counterSpotOccupants.has(spotEl.dataset.spot)) {
        if (counterSpotOccupants.get(spotEl.dataset.spot) === "tray") return;
        tryCounterCombine(spotEl);
        return;
      }
      restCarrierOnSpot(carrier, spotEl);
    }

    function liftCarrierFromCounterIfNeeded(carrier) {
      const spotId = getCarrierRestSpotId(carrier);
      if (!spotId) return false;
      clearCarrierRestSpot(carrier);
      const el = getCarrierEl(carrier);
      el.classList.remove("on-counter", "counter-rest-away");
      el.style.position = "";
      el.style.left = "";
      el.style.top = "";
      el.style.transform = "";
      return true;
    }

    function dockCarrierIfOnCounter(carrier) {
      if (!getCarrierRestSpotId(carrier)) return;
      liftCarrierFromCounterIfNeeded(carrier);
      returnCarrierToHomeDock(carrier);
    }

    function cloneTrayData(data) {
      return JSON.parse(JSON.stringify(data));
    }

    function isUnwashedTrayPayload(payload) {
      return !!payload && !!payload.crop && payload.state === "raw";
    }

    function isValidTrayPayload(payload) {
      if (!payload || isUnwashedTrayPayload(payload)) return false;
      if (isPotSoup(payload)) return true;
      if (isCupDrink(payload)) return true;
      if (isPlateFood(payload)) return true;
      if (isBowlItem(payload)) return true;
      return false;
    }

    function getTrayPreferredSlot(carrier) {
      const payload = getCarrierPayload(carrier);
      if (!payload || getCarrierDirty(carrier) || !isValidTrayPayload(payload)) return null;
      if (carrier === "pot" && isPotSoup(payload)) return "soup";
      if (carrier === "cup" && isCupDrink(payload)) return "drink";
      if (carrier === "plate" && isPlateFood(payload)) return "food";
      if (carrier === "bowl" && isBowlItem(payload)) return "extra";
      return null;
    }

    function canPlaceOnTraySlot(slot, carrier) {
      if (trayDirty) return false;
      const payload = getCarrierPayload(carrier);
      if (!payload || getCarrierDirty(carrier) || !isValidTrayPayload(payload)) return false;
      if (slot === "extra") return true;
      return getTrayPreferredSlot(carrier) === slot;
    }

    function carrierHasTrayFood(carrier) {
      if (carrier === "tray" || dishwasherLoad === carrier) return false;
      return getTrayPreferredSlot(carrier) !== null;
    }

    function carrierShowsInTrayCloseup(carrier) {
      return carrierHasTrayFood(carrier);
    }

    function hideTrayActionMenu() {
      if (!trayActionMenu) return;
      trayActionMenu.classList.remove("open");
      trayActionMenu.hidden = true;
    }

    function getCounterSpotInActiveScreen(spotId) {
      if (!spotId) return null;
      const active = root.querySelector(".screen.active");
      if (!active) return null;
      return active.querySelector('[data-spot="' + spotId + '"]');
    }

    function syncTrayCounterSpotIfNeeded() {
      if (trayRestSpotId) return;
      for (const [spotId, carrier] of counterSpotOccupants.entries()) {
        if (carrier === "tray") {
          trayRestSpotId = spotId;
          return;
        }
      }
    }

    function isTrayCloseupOpen() {
      return trayCloseup.classList.contains("is-open");
    }

    function isTrayOnCounter() {
      syncTrayCounterSpotIfNeeded();
      if (trayFollowing) return false;
      if (trayRestSpotId) return true;
      return tray.classList.contains("on-counter");
    }

    function showTrayActionMenu() {
      const r = tray.getBoundingClientRect();
      trayActionMenu.style.left = r.left + r.width / 2 + "px";
      trayActionMenu.style.top = r.top + "px";
      trayMenuPlaceFood.hidden = trayDirty;
      trayActionMenu.hidden = false;
      trayActionMenu.classList.add("open");
      refreshTutorialGlow();
    }

    function renderTrayEntryIcon(el, entry) {
      if (!entry) {
        el.className = "tray-slot-drop";
        el.innerHTML = "";
        return;
      }
      const data = entry.data;
      el.className = "tray-slot-drop";
      el.innerHTML = "";
      const icon = document.createElement("div");
      if (isPotSoup(data)) setSoupIcon(icon, "tray-slot-item", data);
      else if (isCupDrink(data)) setDrinkIcon(icon, "tray-slot-item", data);
      else if (isPlateFood(data)) setFoodIcon(icon, "tray-slot-item", data);
      else if (isBowlItem(data)) setBowlIcon(icon, "tray-slot-item", data);
      else {
        el.className = "tray-slot-drop tray-extra-label";
        el.textContent = foodLabel(data) || bowlLabel(data) || "Item";
        return;
      }
      el.appendChild(icon);
    }

    function renderTraySlotIcon(el, slot, entry) {
      renderTrayEntryIcon(el, entry);
    }

    function updateTrayVisual() {
      let hasLoad = false;
      TRAY_SLOTS.forEach((slot) => {
        const loadEl = tray.querySelector('.tray-load[data-slot="' + slot + '"]');
        const entry = trayContents[slot];
        loadEl.classList.toggle("filled", !!entry);
        loadEl.innerHTML = "";
        if (entry) {
          hasLoad = true;
          const drop = document.createElement("div");
          renderTraySlotIcon(drop, slot, entry);
          loadEl.appendChild(drop);
        }
      });
      tray.classList.toggle("has-load", hasLoad);
    }

    function dockCarrierAfterTrayPlace(carrier) {
      if (isCarrierFollowing(carrier)) {
        if (carrier === "plate") putDownPlate();
        else if (carrier === "cup") putDownCup();
        else if (carrier === "pot") putDownPot();
        else if (carrier === "bowl") putDownBowl();
      } else if (getCarrierRestSpotId(carrier)) {
        liftCarrierFromCounterIfNeeded(carrier);
        returnCarrierToHomeDock(carrier);
        getCarrierHome(carrier).classList.remove("is-empty");
        getCarrierEl(carrier).setAttribute(
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

    function placeOnTraySlot(slot, carrier) {
      if (!canPlaceOnTraySlot(slot, carrier)) return false;
      const payload = getCarrierPayload(carrier);
      if (!payload) return false;
      trayContents[slot] = { carrier, data: cloneTrayData(payload) };
      clearCarrierPayload(carrier);
      dockCarrierAfterTrayPlace(carrier);
      updateTrayVisual();
      maybeAdvanceTutorialGuide({ type: "tray-load", carrier });
      return true;
    }

    function putDownCarriersNotInTrayCloseup() {
      const noRewind = { tutorialRewind: false };
      if (basketFollowing) putDownBasket(noRewind);
      if (plateFollowing && !carrierShowsInTrayCloseup("plate")) putDownPlate(noRewind);
      if (cupFollowing && !carrierShowsInTrayCloseup("cup")) putDownCup(noRewind);
      if (potFollowing && !carrierShowsInTrayCloseup("pot")) putDownPot(noRewind);
      if (bowlFollowing && !carrierShowsInTrayCloseup("bowl")) putDownBowl(noRewind);
      putDownShakers();
    }

    function buildTrayCloseupSources() {
      trayCloseupSources.innerHTML = "";
      ["pot", "cup", "plate", "bowl"].forEach((carrier) => {
        const preferred = getTrayPreferredSlot(carrier);
        const available = carrierShowsInTrayCloseup(carrier);
        const inHand = isCarrierFollowing(carrier);
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
          const payload = getCarrierPayload(carrier);
          if (payload) {
            const fake = document.createElement("div");
            renderTrayEntryIcon(fake, {
              carrier,
              data: cloneTrayData(payload),
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
          wrap.addEventListener("pointerdown", (e) => startTrayDragFromSource(carrier, e));
        }
        trayCloseupSources.appendChild(wrap);
      });
    }

    function renderTrayCloseupSlots() {
      trayCloseupSlots.querySelectorAll(".tray-slot").forEach((slotEl) => {
        const slot = slotEl.dataset.slot;
        const drop = slotEl.querySelector(".tray-slot-drop");
        const entry = trayContents[slot];
        slotEl.classList.toggle("filled", !!entry);
        renderTraySlotIcon(drop, slot, entry);
      });
    }

    let trayDragState = null;
    let trayDragGhost = null;

    function ensureTrayDragGhost() {
      if (trayDragGhost) return trayDragGhost;
      trayDragGhost = document.createElement("div");
      trayDragGhost.className = "tray-drag-ghost";
      trayDragGhost.hidden = true;
      root.appendChild(trayDragGhost);
      return trayDragGhost;
    }

    function moveTrayDragGhost(clientX, clientY) {
      if (!trayDragGhost) return;
      trayDragGhost.style.left = clientX + "px";
      trayDragGhost.style.top = clientY + "px";
    }

    function clearTrayDragHighlight() {
      trayCloseupSlots.querySelectorAll(".tray-slot").forEach((el) => {
        el.classList.remove("drag-over");
      });
    }

    function traySlotAtPoint(clientX, clientY) {
      const el = document.elementFromPoint(clientX, clientY);
      if (!el) return null;
      const slotEl = el.closest(".tray-slot");
      return slotEl ? slotEl.dataset.slot : null;
    }

    function startTrayDragFromSource(carrier, e) {
      if (!carrierShowsInTrayCloseup(carrier)) return;
      const preferred = getTrayPreferredSlot(carrier);
      if (!preferred) return;
      e.preventDefault();
      const ghost = ensureTrayDragGhost();
      ghost.innerHTML = "";
      const inner = document.createElement("div");
      renderTrayEntryIcon(inner, {
        carrier,
        data: cloneTrayData(getCarrierPayload(carrier)),
      });
      ghost.appendChild(inner);
      ghost.hidden = false;
      moveTrayDragGhost(e.clientX, e.clientY);
      trayDragState = { from: "source", carrier, preferred };
      window.addEventListener("pointermove", onTrayDragMove);
      window.addEventListener("pointerup", endTrayDrag);
      window.addEventListener("pointercancel", endTrayDrag);
    }

    function onTrayDragMove(e) {
      if (!trayDragState || !isTrayCloseupOpen()) return;
      moveTrayDragGhost(e.clientX, e.clientY);
      clearTrayDragHighlight();
      const over = traySlotAtPoint(e.clientX, e.clientY);
      if (
        over &&
        trayDragState.from === "source" &&
        canPlaceOnTraySlot(over, trayDragState.carrier)
      ) {
        const slotEl = trayCloseupSlots.querySelector('[data-slot="' + over + '"]');
        if (slotEl) slotEl.classList.add("drag-over");
      }
    }

    function endTrayDrag(e) {
      if (!trayDragState || !isTrayCloseupOpen()) return;
      const over = traySlotAtPoint(e.clientX, e.clientY);
      if (
        over &&
        trayDragState.from === "source" &&
        canPlaceOnTraySlot(over, trayDragState.carrier)
      ) {
        placeOnTraySlot(over, trayDragState.carrier);
        renderTrayCloseupSlots();
        buildTrayCloseupSources();
      }
      trayDragState = null;
      if (trayDragGhost) {
        trayDragGhost.hidden = true;
        trayDragGhost.innerHTML = "";
      }
      clearTrayDragHighlight();
      updateCarrierUI();
      window.removeEventListener("pointermove", onTrayDragMove);
      window.removeEventListener("pointerup", endTrayDrag);
      window.removeEventListener("pointercancel", endTrayDrag);
    }

    function openTrayCloseup() {
      syncTrayCounterSpotIfNeeded();
      if (trayDirty || trayFollowing || !isTrayOnCounter()) return;
      hideTrayActionMenu();
      putDownCarriersNotInTrayCloseup();
      trayCloseup.classList.add("is-open");
      trayCloseup.hidden = false;
      trayCloseup.removeAttribute("hidden");
      trayCloseup.setAttribute("aria-hidden", "false");
      try {
        buildTrayCloseupSources();
        renderTrayCloseupSlots();
        maybeAdvanceTutorialGuide({ type: "tray", action: "place-food" });
      } catch (err) {
        console.error("tray closeup", err);
        closeTrayCloseup();
      }
    }

    function handleTrayPlaceFood(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      suppressTrayClickUntil = performance.now() + 500;
      openTrayCloseup();
    }

    function closeTrayCloseup() {
      if (!isTrayCloseupOpen()) return;
      trayCloseup.classList.remove("is-open");
      trayCloseup.hidden = true;
      trayCloseup.setAttribute("aria-hidden", "true");
      trayDragState = null;
      window.removeEventListener("pointermove", onTrayDragMove);
      window.removeEventListener("pointerup", endTrayDrag);
      window.removeEventListener("pointercancel", endTrayDrag);
      if (trayDragGhost) {
        trayDragGhost.hidden = true;
        trayDragGhost.innerHTML = "";
      }
      clearTrayDragHighlight();
      updateTrayVisual();
      updateCarrierUI();
      if (trayHasLoad()) {
        maybeAdvanceTutorialGuide({ type: "tray", action: "done" });
      }
    }

    function moveTrayWithCursor(clientX, clientY) {
      tray.style.left = clientX + 10 + "px";
      tray.style.top = clientY + 10 + "px";
    }

    function pickUpTray() {
      if (trayAtCashier) return;
      const onCounter = isTrayOnCounter();
      if (!onCounter && !isTrayOnHomeDock()) return;
      hideTrayActionMenu();
      closeTrayCloseup();
      liftCarrierFromCounterIfNeeded("tray");
      putDownOtherCarriers("tray");
      trayFollowing = true;
      tray.classList.add("following");
      tray.setAttribute(
        "aria-label",
        "Serving tray — click counter spot to set down, or click home ring"
      );
      moveTrayWithCursor(tray.getBoundingClientRect().left, tray.getBoundingClientRect().top);
      updateCarrierUI();
      maybeAdvanceTutorialGuide({ type: "carrier", carrier: "tray", action: "pickup" });
    }

    function putDownTray(options) {
      if (trayRestSpotId || trayAtCashier) return;
      if (!trayFollowing) return;
      hideTrayActionMenu();
      trayFollowing = false;
      tray.classList.remove("following");
      returnCarrierToHomeDock("tray");
      tray.setAttribute(
        "aria-label",
        traysAtHome > 0 ? "Pick up tray from stack" : "Pick up tray"
      );
      if (options?.tutorialRewind !== false) {
        tutorialRewindOnCarrierPutDown("tray");
      }
      updateCarrierUI();
    }

    function updateDirtyCarrierVisuals() {
      const plateAway = dishwasherLoad === "plate";
      const cupAway = dishwasherLoad === "cup";
      const potAway = dishwasherLoad === "pot";
      const bowlAway = dishwasherLoad === "bowl";
      const trayAway = dishwasherLoad === "tray";
      const plateShowDirty = plateDirty && !plateAway;
      const cupShowDirty = cupDirty && !cupAway;
      const potShowDirty = potDirty && !potAway;
      const bowlShowDirty = bowlDirty && !bowlAway;
      const trayShowDirty = trayDirty && !trayAway;
      plate.classList.toggle("dirty", plateShowDirty);
      cup.classList.toggle("dirty", cupShowDirty);
      pot.classList.toggle("dirty", potShowDirty);
      bowl.classList.toggle("dirty", bowlShowDirty);
      tray.classList.toggle("dirty", trayShowDirty);
      plateHome.classList.toggle("carrier-in-appliance", plateAway);
      cupHome.classList.toggle("carrier-in-appliance", cupAway);
      potHome.classList.toggle("carrier-in-appliance", potAway);
      bowlHome.classList.toggle("carrier-in-appliance", bowlAway);
      trayHome.classList.toggle("carrier-in-appliance", trayAway);
      plateHome.classList.toggle("dirty-carrier", plateShowDirty && !plateFollowing);
      cupHome.classList.toggle("dirty-carrier", cupShowDirty && !cupFollowing);
      potHome.classList.toggle("dirty-carrier", potShowDirty && !potFollowing);
      bowlHome.classList.toggle("dirty-carrier", bowlShowDirty && !bowlFollowing);
      trayHome.classList.toggle("dirty-carrier", trayShowDirty && !trayFollowing);
    }

    function updateCuttingBoardUI() {
      const canCut =
        plateFollowing &&
        plateContents &&
        isCuttable(plateContents) &&
        !cuttingInProgress;
      kitchenCuttingBoard.classList.toggle("can-cut", canCut);
      kitchenCuttingBoard.classList.toggle("cutting", cuttingInProgress);

      if (cuttingInProgress && cuttingFood) {
        cuttingBoardFood.className =
          "cutting-board-food food-icon food-" + cuttingFood.crop;
        cuttingBoardFood.innerHTML = '<span class="food-shape" aria-hidden="true"></span>';
        cuttingBoardFood.removeAttribute("aria-hidden");
      } else {
        cuttingBoardFood.className = "cutting-board-food";
        cuttingBoardFood.innerHTML = "";
        cuttingBoardFood.setAttribute("aria-hidden", "true");
      }

      cuttingBoardZone.setAttribute(
        "aria-label",
        canCut
          ? "Cut food on board"
          : cuttingInProgress
            ? "Cutting…"
            : "Cutting board"
      );
    }

    function syncOvenFoodVisual() {
      const show = ovenBaking || ovenResult;
      kitchenOven.classList.toggle("has-oven-food", !!show);
      if (!show) {
        ovenFood.className = "oven-food";
        ovenFood.innerHTML = "";
        ovenFood.setAttribute("aria-hidden", "true");
        return;
      }
      ovenFood.removeAttribute("aria-hidden");
      if (ovenBaking && ovenBakingInput) {
        if (ovenBakingInput.kind === "dough") {
          ovenFood.className = "oven-food oven-food-baking";
          ovenFood.innerHTML = '<span class="oven-dough-ball" aria-hidden="true"></span>';
        } else {
          setFoodIcon(ovenFood, "oven-food oven-food-baking", ovenBakingInput.food);
        }
        return;
      }
      if (ovenResult) {
        setFoodIcon(ovenFood, "oven-food", ovenResult);
      }
    }

    function syncMicrowavePotVisual() {
      const show = microwaveHeating || microwaveResult;
      kitchenMicrowave.classList.toggle("has-microwave-soup", !!show);
      if (!show) {
        microwavePot.className = "microwave-pot";
        microwavePot.innerHTML = "";
        microwavePot.setAttribute("aria-hidden", "true");
        return;
      }
      microwavePot.removeAttribute("aria-hidden");
      const soupItem = microwaveHeating ? microwaveHeatingSoup : microwaveResult;
      if (!soupItem) return;
      microwavePot.className = "microwave-pot slot-icon-wrap soup-icon";
      microwavePot.innerHTML =
        miniPotHtml(soupItem.soup, microwaveHeating && isPotSoupCold(soupItem)) +
        '<span class="item-label">' +
        soupLabel(soupItem) +
        "</span>";
    }

    function updateMicrowaveUI() {
      const mwOpen = kitchenMicrowave.classList.contains("open");
      const canMicrowavePot =
        isPotSoupCold(potContents) && isPotSoupReadyForMicrowave(potContents);
      const canDrop =
        mwOpen &&
        !microwaveHeating &&
        !microwaveResult &&
        potFollowing &&
        canMicrowavePot &&
        !potDirty;
      const canTake =
        mwOpen &&
        !microwaveHeating &&
        !!microwaveResult &&
        potFollowing &&
        !potContents &&
        !potDirty;
      kitchenMicrowave.classList.toggle("can-drop", canDrop);
      kitchenMicrowave.classList.toggle("can-take", canTake);
      kitchenMicrowave.classList.toggle("heating", microwaveHeating);
      syncMicrowavePotVisual();
      microwaveZone.setAttribute(
        "aria-label",
        canDrop
          ? "Put seasoned cold soup pot in microwave"
          : potFollowing && isPotSoupCold(potContents) && !isPotSoupReadyForMicrowave(potContents)
            ? isPotatoMeatStewPrep(potContents) && !isPotSoupSeasonedForMicrowave(potContents)
              ? "Microwave — add salt and pepper on Kitchen 1 counter first"
            : isMeatStewPrep(potContents) && !isPotSoupSeasonedForMicrowave(potContents)
              ? "Microwave — add salt and pepper on Kitchen 1 counter first"
            : isFinishedSoupPrep(potContents) && !isPotSoupSeasonedForMicrowave(potContents)
              ? "Microwave — add salt and pepper on Kitchen 1 counter first"
            : isPotatoSoupPrep(potContents)
              ? "Microwave — cook chopped meat in oven, then combine with this pot on counter"
            : isMeatStewNeedsPotatoes(potContents) || isMeatStewNeedsCarrots(potContents)
              ? "Microwave — add chopped potatoes and carrots on counter first"
              : "Microwave — potato/tomato soup needs chopped veggies combined on counter first"
            : canTake
            ? "Take hot soup pot out"
            : microwaveHeating
              ? "Heating soup…"
              : microwaveResult
                ? "Microwave — use an empty soup pot"
                : "Microwave"
      );
    }

    function updateOvenUI() {
      const ovenOpen = kitchenOven.classList.contains("open");
      const canDrop =
        ovenOpen &&
        !ovenBaking &&
        !ovenResult &&
        ((plateFollowing && isOvenPlateInput(plateContents) && !plateDirty) ||
          (bowlFollowing && isBowlDough(bowlContents) && !bowlDirty));
      const canTake =
        ovenOpen &&
        !ovenBaking &&
        !!ovenResult &&
        plateFollowing &&
        !plateContents &&
        !plateDirty;
      kitchenOven.classList.toggle("can-drop", canDrop);
      kitchenOven.classList.toggle("can-take", canTake);
      kitchenOven.classList.toggle("baking", ovenBaking);
      syncOvenFoodVisual();
      ovenZone.setAttribute(
        "aria-label",
        canDrop
          ? "Put food in oven"
          : ovenOpen &&
              !ovenBaking &&
              !ovenResult &&
              plateFollowing &&
              needsPineappleChopForOven(plateContents) &&
              !plateDirty
            ? "Oven — chop pineapple on cutting board first"
            : canTake
              ? "Take baked food on plate"
              : ovenBaking
                ? "Baking…"
                : ovenResult
                  ? "Oven — use an empty plate"
                  : "Oven"
      );
    }

    function updateCoolerUI() {
      const coolerOpen = kitchenCooler.classList.contains("open");
      const canFillCup = coolerOpen && cupFollowing && !cupContents && !cupDirty;
      kitchenCooler.classList.toggle("has-fillable-drinks", canFillCup);
      coolerDrinks.forEach((drinkEl) => {
        drinkEl.classList.toggle("can-fill", canFillCup);
      });
    }

    function updateBlenderUI() {
      const blenderJarFree =
        !blenderResult || blenderResult.type === "wheat";
      const canDropFood =
        plateFollowing &&
        plateContents &&
        isBlenderInput(plateContents) &&
        blenderJarFree &&
        !blenderBlending;
      const canFillCup =
        cupFollowing &&
        !cupContents &&
        !cupDirty &&
        blenderResult &&
        blenderResult.type === "juice" &&
        !blenderBlending;
      const canFillPot =
        potFollowing &&
        !potContents &&
        !potDirty &&
        blenderResult &&
        blenderResult.type === "soup" &&
        !blenderBlending;
      const canFillBowl =
        bowlFollowing &&
        !bowlContents &&
        !bowlDirty &&
        blenderResult &&
        blenderResult.type === "wheat" &&
        !blenderBlending;

      kitchenBlender.classList.toggle("can-drop-food", canDropFood);
      kitchenBlender.classList.toggle("can-fill-cup", canFillCup);
      kitchenBlender.classList.toggle("can-fill-pot", canFillPot);
      kitchenBlender.classList.toggle("can-fill-bowl", canFillBowl);
      kitchenBlender.classList.toggle("blending", blenderBlending);

      clearBlenderJarClasses();
      if (blenderBlending && blenderFruitFood) {
        blenderJar.classList.add("has-fruit");
        blenderFruit.className = "blender-fruit food-icon food-" + blenderFruitFood.crop;
        blenderFruit.innerHTML = '<span class="food-shape" aria-hidden="true"></span>';
        blenderFruit.removeAttribute("aria-hidden");
      } else if (blenderResult) {
        blenderJar.classList.add("has-juice");
        if (blenderResult.type === "juice") {
          const juiceClass = blenderResult.drink.replace("juice-", "");
          blenderJar.classList.add("juice-" + juiceClass);
        } else if (blenderResult.type === "soup") {
          blenderJar.classList.add("soup-" + blenderResult.crop);
        } else if (blenderResult.type === "wheat") {
          blenderJar.classList.add("blend-wheat");
        }
        blenderFruit.className = "blender-fruit";
        blenderFruit.setAttribute("aria-hidden", "true");
      } else {
        blenderFruit.className = "blender-fruit";
        blenderFruit.setAttribute("aria-hidden", "true");
      }

      blenderZone.setAttribute(
        "aria-label",
        canDropFood
          ? "Put food in blender"
          : canFillCup
            ? "Pour juice into cup"
            : canFillPot
              ? "Scoop soup into pot"
              : canFillBowl
                ? "Pour flour into bowl"
                : blenderBlending
                  ? "Blending…"
                  : blenderResult
                    ? "Blender — ready to scoop"
                    : "Blender"
      );
    }

    function moveBasketWithCursor(clientX, clientY) {
      basket.style.left = clientX + 14 + "px";
      basket.style.top = clientY + 14 + "px";
    }

    function movePlateWithCursor(clientX, clientY) {
      plate.style.left = clientX + 14 + "px";
      plate.style.top = clientY + 14 + "px";
    }

    function moveMopWithCursor(clientX, clientY) {
      mop.style.left = clientX + 14 + "px";
      mop.style.top = clientY + 14 + "px";
    }

    function moveCupWithCursor(clientX, clientY) {
      cup.style.left = clientX + 14 + "px";
      cup.style.top = clientY + 14 + "px";
    }

    function movePotWithCursor(clientX, clientY) {
      pot.style.left = clientX + 14 + "px";
      pot.style.top = clientY + 14 + "px";
    }

    function moveBowlWithCursor(clientX, clientY) {
      bowl.style.left = clientX + 14 + "px";
      bowl.style.top = clientY + 14 + "px";
    }

    function putDownOtherCarriers(except) {
      const noRewind = { tutorialRewind: false };
      if (except !== "basket" && basketFollowing) putDownBasket(noRewind);
      if (except !== "plate" && plateFollowing) putDownPlate(noRewind);
      if (except !== "mop" && mopFollowing) putDownMop();
      if (except !== "cup" && cupFollowing) putDownCup(noRewind);
      if (except !== "pot" && potFollowing) putDownPot(noRewind);
      if (except !== "bowl" && bowlFollowing) putDownBowl(noRewind);
      if (except !== "tray" && trayFollowing) putDownTray(noRewind);
      putDownShakers(except);
    }

    function pickUpBasket() {
      putDownOtherCarriers("basket");
      basketFollowing = true;
      basket.classList.add("following");
      basketHome.classList.add("is-empty");
      gardenRow.classList.add("basket-ready");
      basket.setAttribute("aria-label", "Basket — click again to put down, or click a plant");
      moveBasketWithCursor(
        basket.getBoundingClientRect().left,
        basket.getBoundingClientRect().top
      );
      updateCarrierUI();
      maybeAdvanceTutorialGuide({ type: "carrier", carrier: "basket", action: "pickup" });
    }

    function putDownBasket(options) {
      basketFollowing = false;
      basket.classList.remove("following");
      basketHome.classList.remove("is-empty");
      gardenRow.classList.remove("basket-ready");
      basket.style.left = "";
      basket.style.top = "";
      basket.setAttribute("aria-label", "Pick up basket");
      if (options?.tutorialRewind !== false) {
        tutorialRewindOnCarrierPutDown("basket");
      }
      updateCarrierUI();
    }

    function pickUpPlate() {
      if (dishwasherLoad === "plate") return;
      liftCarrierFromCounterIfNeeded("plate");
      putDownOtherCarriers("plate");
      plateFollowing = true;
      plate.classList.add("following");
      plateHome.classList.add("is-empty");
      if (plateDirty) {
        plate.setAttribute(
          "aria-label",
          "Dirty plate — click again to put down, or load in dishwasher"
        );
      } else {
        plate.setAttribute(
          "aria-label",
          plateContents
            ? needsPineappleChopForOven(plateContents)
              ? "Plate with washed pineapple — chop on cutting board before oven, or blender / sink / fridge / trash"
              : isRawMeat(plateContents)
                ? isMeatSeasoned(plateContents)
                  ? "Plate with seasoned raw meat — cook in oven, or fridge / trash"
                  : plateContents.salted || plateContents.peppered
                    ? "Plate with raw meat — add salt and pepper on counter, or chop / oven, or fridge / trash"
                    : "Plate with raw meat — chop, blend for meat stew, season on counter, or cook in oven, or fridge / trash"
              : isMeatFood(plateContents) && plateContents.state === "cut"
                ? isMeatSeasoned(plateContents)
                  ? "Plate with seasoned cut meat — cook in oven, or fridge / trash"
                  : "Plate with cut meat — season on counter or cook in oven, or fridge / trash"
              : isCookedChoppedMeat(plateContents)
                ? "Plate with chopped cooked meat — combine with potato stew pot on counter, or fridge / trash"
              : isMeatWithTomato(plateContents)
                ? "Plate with meat and tomato — combine with bread on counter, or fridge / trash"
              : isSteakSandwich(plateContents)
                ? "Plate with steak sandwich — fridge / trash only"
              : isBakedFood(plateContents)
                ? "Plate with " +
                  foodLabel(plateContents) +
                  " — fridge / trash only (already baked)"
                : "Plate — click again to put down, or use sink / fridge / trash / cutting board / blender / oven"
            : "Plate — click again to put down, or take clean food from sink, or take baked food from oven"
        );
      }
      movePlateWithCursor(
        plate.getBoundingClientRect().left,
        plate.getBoundingClientRect().top
      );
      updateCarrierUI();
      maybeAdvanceTutorialGuide({ type: "carrier", carrier: "plate", action: "pickup" });
    }

    function putDownPlate(options) {
      if (plateRestSpotId) return;
      plateFollowing = false;
      plate.classList.remove("following");
      returnCarrierToHomeDock("plate");
      plate.setAttribute("aria-label", "Pick up plate");
      if (options?.tutorialRewind !== false) {
        tutorialRewindOnCarrierPutDown("plate");
      }
      updateCarrierUI();
    }

    function pickUpMop() {
      if (!isScreen6Active() || !mop || !mopHome) return;
      putDownOtherCarriers("mop");
      const rect = mop.getBoundingClientRect();
      root.appendChild(mop);
      mopFollowing = true;
      mop.classList.add("following");
      mopHome.classList.add("is-empty");
      root.classList.add("mop-out");
      mop.setAttribute(
        "aria-label",
        isNighttime
          ? "Mop — click mud puddles to clean, or put down in cafeteria"
          : "Mop — click the dashed spot to put down"
      );
      moveMopWithCursor(rect.left, rect.top);
    }

    function putDownMop() {
      if (!mop || !mopHome) return;
      mopFollowing = false;
      mop.classList.remove("following", "mop-swishing");
      root.classList.remove("mop-out");
      if (mopSwishTimer) {
        clearTimeout(mopSwishTimer);
        mopSwishTimer = null;
      }
      mopHome.classList.remove("is-empty");
      mop.style.left = "";
      mop.style.top = "";
      mopHome.appendChild(mop);
      mop.setAttribute("aria-label", "Pick up mop");
    }

    function clearPlate() {
      plateContents = null;
      setFoodIcon(plateItem, "plate-item", null);
      plate.classList.remove("has-item", "plate-food");
      updateCarrierUI();
    }

    function setPlateFood(food) {
      if (!isPlateFood(food) || plateDirty) return;
      plateContents = food;
      setFoodIcon(plateItem, "plate-item", food);
      plate.classList.add("has-item", "plate-food");
      updateCarrierUI();
    }

    function pickUpCup() {
      if (dishwasherLoad === "cup") return;
      liftCarrierFromCounterIfNeeded("cup");
      putDownOtherCarriers("cup");
      cupFollowing = true;
      cup.classList.add("following");
      cupHome.classList.add("is-empty");
      if (cupDirty) {
        cup.setAttribute(
          "aria-label",
          "Dirty cup — click again to put down, or load in dishwasher"
        );
      } else {
        cup.setAttribute(
          "aria-label",
          cupContents
            ? "Cup — click again to put down, or use fridge / trash / blender"
            : "Cup — click again to put down, or fill from cooler or blender"
        );
      }
      moveCupWithCursor(
        cup.getBoundingClientRect().left,
        cup.getBoundingClientRect().top
      );
      updateCarrierUI();
      maybeAdvanceTutorialGuide({ type: "carrier", carrier: "cup", action: "pickup" });
    }

    function putDownCup(options) {
      if (cupRestSpotId) return;
      cupFollowing = false;
      cup.classList.remove("following");
      returnCarrierToHomeDock("cup");
      cup.setAttribute("aria-label", "Pick up cup");
      if (options?.tutorialRewind !== false) {
        tutorialRewindOnCarrierPutDown("cup");
      }
      updateCarrierUI();
    }

    function clearCup() {
      cupContents = null;
      cupItem.textContent = "";
      cup.classList.remove("has-item");
      clearCupDrinkClasses();
      updateCarrierUI();
    }

    function setCupDrink(drink) {
      if (!isCupDrink(drink) || cupDirty) return;
      cupContents = drink;
      cup.classList.add("has-item");
      clearCupDrinkClasses();
      cup.classList.add("drink-" + drink.drink);
      updateCarrierUI();
    }

    function fillCupFromCooler(drinkEl) {
      if (!kitchenCooler.classList.contains("open")) return;
      if (!cupFollowing || cupContents || cupDirty) return;
      setCupDrink(makeDrink(drinkEl.dataset.drink));
      maybeAdvanceTutorialGuide({
        type: "cooler-fill",
        drink: drinkEl.dataset.drink,
      });
    }

    function pickUpPot() {
      if (dishwasherLoad === "pot") return;
      liftCarrierFromCounterIfNeeded("pot");
      putDownOtherCarriers("pot");
      potFollowing = true;
      pot.classList.add("following");
      potHome.classList.add("is-empty");
      if (potDirty) {
        pot.setAttribute(
          "aria-label",
          "Dirty soup pot — click again to put down, or load in dishwasher"
        );
      } else {
        pot.setAttribute(
          "aria-label",
          potContents
            ? isPotSoupCold(potContents)
              ? isPotSoupReadyForMicrowave(potContents)
                ? "Soup pot with seasoned cold " +
                  (SOUP_LABELS[potContents.soup] || potContents.soup).toLowerCase() +
                  " — microwave in Kitchen 2, or fridge / trash"
                : isFinishedSoupPrep(potContents)
                  ? "Soup pot — Kitchen 1: salt + pepper on counter, then microwave"
                  : (potContents.soup === "potatoes" || potContents.soup === "tomatoes")
                    ? "Soup pot — add chopped veggies on counter, then salt + pepper, then microwave"
                    : "Soup pot with cold " +
                      (SOUP_LABELS[potContents.soup] || potContents.soup).toLowerCase() +
                      " — Kitchen 1: salt + pepper on counter first, then microwave"
              : "Soup pot — click again to put down, or use fridge / trash / blender"
            : "Soup pot — click again to put down, or scoop blended veggies"
        );
      }
      movePotWithCursor(pot.getBoundingClientRect().left, pot.getBoundingClientRect().top);
      updateCarrierUI();
      maybeAdvanceTutorialGuide({ type: "carrier", carrier: "pot", action: "pickup" });
    }

    function putDownPot(options) {
      if (potRestSpotId) return;
      potFollowing = false;
      pot.classList.remove("following");
      returnCarrierToHomeDock("pot");
      pot.setAttribute("aria-label", "Pick up soup pot");
      if (options?.tutorialRewind !== false) {
        tutorialRewindOnCarrierPutDown("pot");
      }
      updateCarrierUI();
    }

    function clearPot() {
      potContents = null;
      pot.classList.remove("has-item", "stew");
      clearPotSoupClasses();
      updateCarrierUI();
    }

    function setPotSoup(soupItem) {
      if (!isPotSoup(soupItem) || potDirty) return;
      potContents = soupItem;
      pot.classList.add("has-item");
      clearPotSoupClasses();
      pot.classList.add("soup-" + soupItem.soup);
      pot.classList.toggle("stew", !!soupItem.stew);
      pot.classList.toggle("soup-cold", isPotSoupCold(soupItem));
      updateCarrierUI();
    }

    function pickUpBowl() {
      if (dishwasherLoad === "bowl") return;
      liftCarrierFromCounterIfNeeded("bowl");
      putDownOtherCarriers("bowl");
      bowlFollowing = true;
      bowl.classList.add("following");
      bowlHome.classList.add("is-empty");
      if (bowlDirty) {
        bowl.setAttribute(
          "aria-label",
          "Dirty bowl — click again to put down, or load in dishwasher"
        );
      } else {
        bowl.setAttribute(
          "aria-label",
          bowlContents
            ? "Bowl with " + bowlLabel(bowlContents).toLowerCase() + " — click again to put down, or use fridge / trash"
            : "Bowl — click again to put down, or pour flour from blender"
        );
      }
      moveBowlWithCursor(bowl.getBoundingClientRect().left, bowl.getBoundingClientRect().top);
      updateCarrierUI();
      maybeAdvanceTutorialGuide({ type: "carrier", carrier: "bowl", action: "pickup" });
    }

    function putDownBowl(options) {
      if (bowlRestSpotId) return;
      bowlFollowing = false;
      bowl.classList.remove("following");
      returnCarrierToHomeDock("bowl");
      bowl.setAttribute("aria-label", "Pick up bowl");
      if (options?.tutorialRewind !== false) {
        tutorialRewindOnCarrierPutDown("bowl");
      }
      updateCarrierUI();
    }

    function clearBowl() {
      bowlContents = null;
      bowl.classList.remove("has-item");
      clearBowlFillClasses();
      updateCarrierUI();
    }

    function setBowlItem(item) {
      if (item && !isBowlItem(item)) return;
      if (bowlDirty && item) return;
      bowlContents = item;
      if (!item) {
        clearBowl();
        return;
      }
      bowl.classList.add("has-item");
      syncBowlVisual();
      updateCarrierUI();
    }

    function setBowlFlour(flourItem) {
      setBowlItem(flourItem);
    }

    function clearBasket() {
      basketContents = null;
      setFoodIcon(basketItem, "basket-item", null);
      basket.classList.remove("has-item");
      updateCarrierUI();
    }

    function setBasketFood(food) {
      if (!isBasketFood(food)) return;
      basketContents = food;
      setFoodIcon(basketItem, "basket-item", food);
      basket.classList.add("has-item");
      updateCarrierUI();
    }

    function setBasketCrop(crop) {
      setBasketFood(makeFood(crop, "raw"));
      maybeAdvanceTutorialGuide({ type: "crop", crop });
    }

    function updateSinkUI() {
      const canDrop =
        basketFollowing &&
        basketContents &&
        isBasketFood(basketContents) &&
        !isMeatFood(basketContents) &&
        !isCupDrink(basketContents) &&
        !sinkContents &&
        !sinkWashing;
      const canTakePlate =
        plateFollowing &&
        !plateContents &&
        !plateDirty &&
        sinkContents &&
        !sinkWashing &&
        isPlateFood(sinkContents);

      kitchenSink.classList.toggle("can-drop", canDrop);
      kitchenSink.classList.toggle("can-take-plate", canTakePlate);
      kitchenSink.classList.toggle("washing", sinkWashing);

      if (sinkContents) {
        setFoodIcon(sinkItem, "sink-item", sinkContents);
        sinkItem.classList.add("visible");
        sinkItem.removeAttribute("aria-hidden");
        sinkSparkle.classList.toggle("show", isPlateFood(sinkContents));
      } else {
        setFoodIcon(sinkItem, "sink-item", null);
        sinkItem.classList.remove("visible");
        sinkItem.setAttribute("aria-hidden", "true");
        sinkSparkle.classList.remove("show");
      }

      sinkBasin.setAttribute(
        "aria-label",
        canDrop
          ? "Put food in sink to wash"
          : canTakePlate
            ? "Take clean food onto plate"
            : sinkWashing
              ? "Washing…"
              : "Sink"
      );
    }

    function startSinkWashTimer() {
      let remaining = SINK_WASH_SEC;
      sinkWashTimer.hidden = false;
      sinkWashTimer.textContent = remaining;
      sinkTimerInterval = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(sinkTimerInterval);
          sinkTimerInterval = null;
          sinkWashTimer.hidden = true;
          finishSinkWash();
        } else {
          sinkWashTimer.textContent = remaining;
        }
      }, 1000);
    }

    function finishSinkWash() {
      sinkWashing = false;
      if (sinkContents && isCupDrink(sinkContents)) {
        sinkContents = null;
        updateCarrierUI();
        return;
      }
      if (sinkContents) {
        sinkContents.state = "washed";
      }
      updateCarrierUI();
    }

    function placeInSink() {
      if (!basketFollowing || !basketContents || !isBasketFood(basketContents)) return;
      if (isMeatFood(basketContents)) return;
      if (isCupDrink(basketContents)) return;
      if (sinkContents || sinkWashing) return;
      sinkContents = { ...basketContents };
      clearBasket();
      sinkWashing = true;
      updateCarrierUI();
      startSinkWashTimer();
      maybeAdvanceTutorialGuide({ type: "sink", action: "drop" });
    }

    function takeFromSink() {
      if (!plateFollowing || plateContents || plateDirty) return;
      if (!sinkContents || sinkWashing || !isPlateFood(sinkContents)) return;
      setPlateFood({ ...sinkContents });
      sinkContents = null;
      updateCarrierUI();
      maybeAdvanceTutorialGuide({ type: "sink", action: "take" });
    }

    function updateMeatBoxUI() {
      if (!meatBox) return;
      const canTakePlate =
        isScreen2Active() &&
        plateFollowing &&
        !plateContents &&
        !plateDirty;
      meatBox.classList.toggle("can-take-plate", canTakePlate);
      meatBox.setAttribute(
        "aria-label",
        canTakePlate ? "Take meat onto plate" : "MEAT box"
      );
    }

    function takeFromMeatBox() {
      if (!isScreen2Active()) return;
      if (!plateFollowing || plateContents || plateDirty) return;
      setPlateFood(makeFood("meat", "raw"));
      updateCarrierUI();
      maybeAdvanceTutorialGuide({ type: "meat-box", action: "take" });
    }

    function clearSinkInstant() {
      if (sinkTimerInterval) {
        clearInterval(sinkTimerInterval);
        sinkTimerInterval = null;
      }
      sinkWashing = false;
      sinkContents = null;
      sinkWashTimer.hidden = true;
      updateSinkUI();
    }

    function updateTrashCan() {
      kitchenTrashCans.forEach((trash) => {
        const canThrow =
          (basketContents && isBasketFood(basketContents)) ||
          (plateContents && isPlateFood(plateContents)) ||
          (cupContents && isCupDrink(cupContents)) ||
          (potContents && isPotSoup(potContents)) ||
          (bowlContents && isBowlItem(bowlContents)) ||
          trayCanThrowAway();
        trash.classList.toggle("can-throw", canThrow);
        trash.disabled = !canThrow;
        trash.setAttribute(
          "aria-label",
          canThrow
            ? trayCanThrowAway() && !basketContents && !plateContents && !cupContents && !potContents && !bowlContents
              ? "Throw away tray food"
              : "Throw away food or drink"
            : "Trash can"
        );
      });
    }

    function isDirtyTrayReadyForDishwasher() {
      return (
        trayDirty &&
        !trayHasLoad() &&
        !dishwasherLoad &&
        !dishwasherWashing &&
        (trayFollowing || isTrayOnHomeDock() || isTrayOnCounter())
      );
    }

    function wouldLoadInDishwasher() {
      if (dishwasherLoad || dishwasherWashing) return false;
      if (plateFollowing && plateDirty && !plateContents) return true;
      if (cupFollowing && cupDirty && !cupContents) return true;
      if (potFollowing && potDirty && !potContents) return true;
      if (bowlFollowing && bowlDirty && !bowlContents) return true;
      if (isDirtyTrayReadyForDishwasher()) return true;
      return false;
    }

    function updateDishwasherUI() {
      const dishwasherOpen = kitchenDishwasher.classList.contains("open");
      const canDropPlate =
        dishwasherOpen &&
        plateFollowing &&
        plateDirty &&
        !plateContents &&
        !dishwasherLoad &&
        !dishwasherWashing;
      const canDropCup =
        dishwasherOpen &&
        cupFollowing &&
        cupDirty &&
        !cupContents &&
        !dishwasherLoad &&
        !dishwasherWashing;
      const canDropPot =
        dishwasherOpen &&
        potFollowing &&
        potDirty &&
        !potContents &&
        !dishwasherLoad &&
        !dishwasherWashing;
      const canDropBowl =
        dishwasherOpen &&
        bowlFollowing &&
        bowlDirty &&
        !bowlContents &&
        !dishwasherLoad &&
        !dishwasherWashing;
      const canDropTray = dishwasherOpen && isDirtyTrayReadyForDishwasher();
      const canDrop = canDropPlate || canDropCup || canDropPot || canDropBowl || canDropTray;

      kitchenDishwasher.classList.toggle("can-drop-dish", canDrop);
      kitchenDishwasher.classList.toggle("washing", dishwasherWashing);

      if (dishwasherLoad === "plate") {
        dishwasherItem.className = "dishwasher-item icon-dish-plate visible";
        dishwasherItem.innerHTML = "";
        dishwasherItem.removeAttribute("aria-hidden");
      } else if (dishwasherLoad === "cup") {
        dishwasherItem.className = "dishwasher-item icon-dish-cup visible";
        dishwasherItem.innerHTML = "";
        dishwasherItem.removeAttribute("aria-hidden");
      } else if (dishwasherLoad === "pot") {
        dishwasherItem.className = "dishwasher-item icon-dish-pot visible";
        dishwasherItem.innerHTML = "";
        dishwasherItem.removeAttribute("aria-hidden");
      } else if (dishwasherLoad === "bowl") {
        dishwasherItem.className = "dishwasher-item icon-dish-bowl visible";
        dishwasherItem.innerHTML = "";
        dishwasherItem.removeAttribute("aria-hidden");
      } else if (dishwasherLoad === "tray") {
        dishwasherItem.className = "dishwasher-item icon-dish-tray visible";
        dishwasherItem.innerHTML = "";
        dishwasherItem.removeAttribute("aria-hidden");
      } else {
        dishwasherItem.className = "dishwasher-item";
        dishwasherItem.innerHTML = "";
        dishwasherItem.setAttribute("aria-hidden", "true");
      }

      dishwasherZone.setAttribute(
        "aria-label",
        canDrop
          ? canDropTray
            ? "Load dirty tray in dishwasher"
            : "Load dirty dish in dishwasher"
          : dishwasherWashing
            ? "Dishwasher washing…"
            : !dishwasherOpen
              ? wouldLoadInDishwasher()
                ? isDirtyTrayReadyForDishwasher()
                  ? "Open dishwasher to load dirty tray"
                  : "Open dishwasher to load dirty dish"
                : "Open dishwasher"
              : "Dishwasher"
      );
    }

    function startDishwasherWashTimer() {
      let remaining = DISHWASHER_WASH_SEC;
      dishwasherWashTimer.hidden = false;
      dishwasherWashTimer.textContent = remaining;
      dishwasherTimerInterval = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(dishwasherTimerInterval);
          dishwasherTimerInterval = null;
          dishwasherWashTimer.hidden = true;
          finishDishwasherWash();
        } else {
          dishwasherWashTimer.textContent = remaining;
        }
      }, 1000);
    }

    function finishDishwasherWash() {
      dishwasherWashing = false;
      if (dishwasherLoad === "plate") {
        plateDirty = false;
      } else if (dishwasherLoad === "cup") {
        cupDirty = false;
      } else if (dishwasherLoad === "pot") {
        potDirty = false;
      } else if (dishwasherLoad === "bowl") {
        bowlDirty = false;
      } else if (dishwasherLoad === "tray") {
        trayDirty = false;
      }
      dishwasherLoad = null;
      updateCarrierUI();
    }

    function placeInDishwasher() {
      const dishwasherOpen = kitchenDishwasher.classList.contains("open");
      if (!dishwasherOpen || dishwasherLoad || dishwasherWashing) return;

      if (plateFollowing && plateDirty && !plateContents) {
        putDownPlate();
        dishwasherLoad = "plate";
        dishwasherWashing = true;
        updateCarrierUI();
        startDishwasherWashTimer();
        maybeAdvanceTutorialGuide({ type: "dishwasher", action: "load" });
      } else if (cupFollowing && cupDirty && !cupContents) {
        putDownCup();
        dishwasherLoad = "cup";
        dishwasherWashing = true;
        updateCarrierUI();
        startDishwasherWashTimer();
      } else if (potFollowing && potDirty && !potContents) {
        putDownPot();
        dishwasherLoad = "pot";
        dishwasherWashing = true;
        updateCarrierUI();
        startDishwasherWashTimer();
      } else if (bowlFollowing && bowlDirty && !bowlContents) {
        putDownBowl();
        dishwasherLoad = "bowl";
        dishwasherWashing = true;
        updateCarrierUI();
        startDishwasherWashTimer();
      } else if (isDirtyTrayReadyForDishwasher()) {
        if (trayFollowing) {
          hideTrayActionMenu();
          trayFollowing = false;
          tray.classList.remove("following");
        } else if (isTrayOnCounter()) {
          hideTrayActionMenu();
          clearCarrierRestSpot("tray");
          tray.classList.remove("on-counter");
          tray.style.position = "";
          tray.style.left = "";
          tray.style.top = "";
          tray.style.transform = "";
        } else if (!isTrayOnHomeDock()) {
          return;
        }
        clearCarrierRestSpot("tray");
        tray.classList.remove("on-counter");
        tray.style.position = "";
        tray.style.left = "";
        tray.style.top = "";
        tray.style.transform = "";
        dishwasherLoad = "tray";
        dishwasherWashing = true;
        updateCarrierUI();
        startDishwasherWashTimer();
        maybeAdvanceTutorialGuide({ type: "dishwasher", action: "load" });
      }
    }

    function startCuttingTimer() {
      let remaining = CUT_SEC;
      cuttingBoardTimer.hidden = false;
      cuttingBoardTimer.textContent = remaining;
      cuttingTimerInterval = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(cuttingTimerInterval);
          cuttingTimerInterval = null;
          cuttingBoardTimer.hidden = true;
          finishCutting();
        } else {
          cuttingBoardTimer.textContent = remaining;
        }
      }, 1000);
    }

    function finishCutting() {
      cuttingInProgress = false;
      if (cuttingFood) {
        setPlateFood(makeFood(cuttingFood.crop, "cut"));
        cuttingFood = null;
      }
      updateCarrierUI();
    }

    function placeOnCuttingBoard() {
      if (!plateFollowing || !plateContents || !isCuttable(plateContents)) return;
      if (cuttingInProgress) return;
      cuttingFood = { crop: plateContents.crop };
      clearPlate();
      cuttingInProgress = true;
      updateCarrierUI();
      startCuttingTimer();
      maybeAdvanceTutorialGuide({ type: "cutting-board", action: "use" });
    }

    function clearCuttingInstant() {
      if (cuttingTimerInterval) {
        clearInterval(cuttingTimerInterval);
        cuttingTimerInterval = null;
      }
      cuttingBoardTimer.hidden = true;
      if (cuttingInProgress) {
        finishCutting();
      } else {
        updateCuttingBoardUI();
      }
    }

    function startOvenTimer() {
      let remaining = OVEN_BAKE_SEC;
      ovenTimer.hidden = false;
      ovenTimer.textContent = remaining;
      ovenTimerInterval = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(ovenTimerInterval);
          ovenTimerInterval = null;
          ovenTimer.hidden = true;
          finishBaking();
        } else {
          ovenTimer.textContent = remaining;
        }
      }, 1000);
    }

    function finishBaking() {
      ovenBaking = false;
      ovenResult = bakeFoodFromInput(ovenBakingInput);
      ovenBakingInput = null;
      updateCarrierUI();
    }

    function placeInOven() {
      if (!kitchenOven.classList.contains("open")) return;
      if (ovenBaking || ovenResult) return;
      if (bowlFollowing && isBowlDough(bowlContents) && !bowlDirty) {
        ovenBakingInput = { kind: "dough" };
        clearBowl();
        ovenBaking = true;
        updateCarrierUI();
        startOvenTimer();
        maybeAdvanceTutorialGuide({ type: "oven", action: "drop" });
        return;
      }
      if (plateFollowing && isOvenPlateInput(plateContents) && !plateDirty) {
        ovenBakingInput = { kind: "food", food: { ...plateContents } };
        clearPlate();
        ovenBaking = true;
        updateCarrierUI();
        startOvenTimer();
        maybeAdvanceTutorialGuide({ type: "oven", action: "drop" });
      }
    }

    function takeFromOven() {
      if (!ovenResult || ovenBaking) return;
      if (!plateFollowing || plateContents || plateDirty) return;
      setPlateFood({ ...ovenResult });
      ovenResult = null;
      updateCarrierUI();
      maybeAdvanceTutorialGuide({ type: "oven", action: "take" });
    }

    function clearOvenInstant() {
      if (ovenTimerInterval) {
        clearInterval(ovenTimerInterval);
        ovenTimerInterval = null;
      }
      ovenTimer.hidden = true;
      if (ovenBaking) {
        finishBaking();
      } else {
        updateOvenUI();
      }
    }

    function startMicrowaveTimer() {
      let remaining = MICROWAVE_HEAT_SEC;
      microwaveTimer.hidden = false;
      microwaveTimer.textContent = remaining;
      microwaveTimerInterval = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(microwaveTimerInterval);
          microwaveTimerInterval = null;
          microwaveTimer.hidden = true;
          finishMicrowave();
        } else {
          microwaveTimer.textContent = remaining;
        }
      }, 1000);
    }

    function finishMicrowave() {
      microwaveHeating = false;
      if (microwaveHeatingSoup) {
        microwaveResult = heatPotSoup(microwaveHeatingSoup);
        microwaveHeatingSoup = null;
      }
      updateCarrierUI();
    }

    function placeInMicrowave() {
      if (!kitchenMicrowave.classList.contains("open")) return;
      if (microwaveHeating || microwaveResult) return;
      if (!potFollowing || !isPotSoupCold(potContents) || potDirty) return;
      if (isPotSoup(potContents) && potContents.soup === "meat") return;
      if (!isPotSoupReadyForMicrowave(potContents)) return;
      microwaveHeatingSoup = { ...potContents };
      clearPot();
      microwaveHeating = true;
      updateCarrierUI();
      startMicrowaveTimer();
      maybeAdvanceTutorialGuide({ type: "microwave", action: "drop" });
    }

    function takeFromMicrowave() {
      if (!microwaveResult || microwaveHeating) return;
      if (!potFollowing || potContents || potDirty) return;
      setPotSoup({ ...microwaveResult });
      microwaveResult = null;
      updateCarrierUI();
      maybeAdvanceTutorialGuide({ type: "microwave", action: "take" });
    }

    function clearMicrowaveInstant() {
      if (microwaveTimerInterval) {
        clearInterval(microwaveTimerInterval);
        microwaveTimerInterval = null;
      }
      microwaveTimer.hidden = true;
      if (microwaveHeating) {
        finishMicrowave();
      } else {
        updateMicrowaveUI();
      }
    }

    function clearDishwasherInstant() {
      if (dishwasherTimerInterval) {
        clearInterval(dishwasherTimerInterval);
        dishwasherTimerInterval = null;
      }
      dishwasherWashing = false;
      dishwasherLoad = null;
      dishwasherWashTimer.hidden = true;
      updateDishwasherUI();
      updateDirtyCarrierVisuals();
    }

    function startBlenderTimer() {
      let remaining = BLENDER_BLEND_SEC;
      blenderWashTimer.hidden = false;
      blenderWashTimer.textContent = remaining;
      blenderTimerInterval = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(blenderTimerInterval);
          blenderTimerInterval = null;
          blenderWashTimer.hidden = true;
          finishBlender();
        } else {
          blenderWashTimer.textContent = remaining;
        }
      }, 1000);
    }

    function finishBlender() {
      blenderBlending = false;
      if (blenderFruitFood) {
        const crop = blenderFruitFood.crop;
        if (crop === "wheat") {
          blenderResult = { type: "wheat" };
        } else if (crop === "meat") {
          blenderResult = { type: "soup", crop: "meat" };
        } else if (BLENDER_SOUP_CROPS.has(crop)) {
          blenderResult = { type: "soup", crop };
        } else {
          blenderResult = { type: "juice", drink: "juice-" + crop };
        }
        blenderFruitFood = null;
      }
      updateCarrierUI();
    }

    function placeInBlender() {
      if (!plateFollowing || !plateContents || !isBlenderInput(plateContents)) return;
      if (blenderBlending) return;
      if (blenderResult && blenderResult.type !== "wheat") return;
      blenderResult = null;
      blenderFruitFood = { crop: plateContents.crop };
      clearPlate();
      blenderBlending = true;
      updateCarrierUI();
      startBlenderTimer();
      maybeAdvanceTutorialGuide({ type: "blender", action: "drop" });
    }

    function takeJuiceFromBlender() {
      if (
        !cupFollowing ||
        cupContents ||
        cupDirty ||
        !blenderResult ||
        blenderResult.type !== "juice" ||
        blenderBlending
      ) {
        return;
      }
      setCupDrink(makeDrink(blenderResult.drink));
      blenderResult = null;
      updateCarrierUI();
      maybeAdvanceTutorialGuide({ type: "blender", action: "take-juice" });
    }

    function takeSoupFromBlender() {
      if (
        !potFollowing ||
        potContents ||
        potDirty ||
        !blenderResult ||
        blenderResult.type !== "soup" ||
        blenderBlending
      ) {
        return;
      }
      setPotSoup(makePotSoup(blenderResult.crop, true));
      blenderResult = null;
      updateCarrierUI();
      maybeAdvanceTutorialGuide({ type: "blender", action: "take-soup" });
    }

    function takeFlourFromBlender() {
      if (
        !bowlFollowing ||
        bowlContents ||
        bowlDirty ||
        !blenderResult ||
        blenderResult.type !== "wheat" ||
        blenderBlending
      ) {
        return;
      }
      setBowlFlour(makeBowlFlour());
      blenderResult = null;
      updateCarrierUI();
      maybeAdvanceTutorialGuide({ type: "blender", action: "take-flour" });
    }

    function clearBlenderInstant() {
      if (blenderTimerInterval) {
        clearInterval(blenderTimerInterval);
        blenderTimerInterval = null;
      }
      blenderWashTimer.hidden = true;
      if (blenderBlending) {
        finishBlender();
      } else {
        updateBlenderUI();
      }
    }

    function throwAwayFood(trashEl) {
      if (basketContents && isBasketFood(basketContents)) {
        trashEl.classList.add("throwing");
        clearBasket();
      } else if (plateContents && isPlateFood(plateContents)) {
        trashEl.classList.add("throwing");
        clearPlate();
        plateDirty = true;
        updateCarrierUI();
        maybeAdvanceTutorialGuide({ type: "trash", action: "throw" });
      } else if (cupContents && isCupDrink(cupContents)) {
        trashEl.classList.add("throwing");
        clearCup();
        cupDirty = true;
        updateCarrierUI();
      } else if (potContents && isPotSoup(potContents)) {
        trashEl.classList.add("throwing");
        clearPot();
        potDirty = true;
        updateCarrierUI();
      } else if (bowlContents && isBowlItem(bowlContents)) {
        trashEl.classList.add("throwing");
        clearBowl();
        bowlDirty = true;
        updateCarrierUI();
      } else if (trayCanThrowAway()) {
        trashEl.classList.add("throwing");
        throwAwayTrayFoodOnly();
      } else {
        return;
      }
      setTimeout(() => trashEl.classList.remove("throwing"), 350);
    }

    function canTakeBowlItemFromFridge() {
      if (basketContents || plateContents || cupContents || potContents || bowlContents) {
        return false;
      }
      if (bowlDirty || dishwasherLoad === "bowl") return false;
      return true;
    }

    function getFridgeItemKind(item) {
      if (!item) return null;
      if (isBasketFood(item)) return "basket";
      if (isPlateFood(item)) return "plate";
      if (isCupDrink(item)) return "cup";
      if (isPotSoup(item)) return "pot";
      if (isBowlItem(item)) return "bowl";
      return null;
    }

    /** Can this shelf item be picked up? Only the matching carrier must be free. */
    function canTakeItemFromFridge(item) {
      const kind = getFridgeItemKind(item);
      if (!kind) return false;
      if (kind === "basket") return !basketContents;
      if (kind === "plate") return !plateContents && !plateDirty;
      if (kind === "cup") return !cupContents && !cupDirty;
      if (kind === "pot") return !potContents && !potDirty;
      if (kind === "bowl") return canTakeBowlItemFromFridge();
      return false;
    }

    function isFridgeShelfInteractive() {
      return (
        kitchenFridge.classList.contains("open") &&
        !kitchenFridge.classList.contains("closing")
      );
    }

    function updateFridgeSlots() {
      const fridgeOpen = kitchenFridge.classList.contains("open");
      fridgeSlots.forEach((slot, i) => {
        const item = fridgeShelves[i];
        const heldBasket = basketContents && basketFollowing;
        const heldPlate = plateContents && plateFollowing;
        const heldCup = cupContents && cupFollowing;
        const heldPot = potContents && potFollowing;
        const heldBowl = bowlContents && bowlFollowing;
        const canDrop =
          fridgeOpen &&
          !item &&
          ((heldBasket && isBasketFood(basketContents)) ||
            (heldPlate && isPlateFood(plateContents) && !plateDirty) ||
            (heldCup && isCupDrink(cupContents) && !cupDirty) ||
            (heldPot && isPotSoup(potContents) && !potDirty) ||
            (heldBowl && isBowlItem(bowlContents) && !bowlDirty));
        const canTake = fridgeOpen && item && canTakeItemFromFridge(item);
        const blockedTake = fridgeOpen && item && !canTake;
        slot.classList.toggle("can-drop", canDrop);
        slot.classList.toggle("can-take", canTake);
        slot.classList.toggle("blocked-take", blockedTake);
        slot.classList.toggle("filled", !!item);
        slot.setAttribute(
          "aria-label",
          canTake
            ? "Take " + foodLabel(item) + " from shelf"
            : blockedTake
              ? "Can't take — " +
                (basketContents && getFridgeItemKind(item) === "basket"
                  ? "basket already has food"
                  : "hands full or need a clean dish")
              : canDrop
                ? "Put food on shelf"
                : item
                  ? "Shelf with food"
                  : "Empty shelf"
        );
      });
    }

    function placeOnShelf(index) {
      if (!isBasketFood(basketContents)) return;
      const slot = fridgeSlots[index];
      fridgeShelves[index] = { ...basketContents };
      setFoodIcon(slot.querySelector(".fridge-slot-item"), "fridge-slot-item", basketContents);
      slot.classList.add("filled");
      clearBasket();
    }

    function takeFromShelf(index) {
      const item = fridgeShelves[index];
      if (!item || !canTakeItemFromFridge(item)) return;
      setBasketFood({ ...item });
      fridgeShelves[index] = null;
      setFoodIcon(fridgeSlots[index].querySelector(".fridge-slot-item"), "fridge-slot-item", null);
      fridgeSlots[index].classList.remove("filled");
      if (!basketFollowing) pickUpBasket();
      updateFridgeSlots();
    }

    function placeOnShelfPlate(index) {
      if (!isPlateFood(plateContents)) return;
      const slot = fridgeSlots[index];
      fridgeShelves[index] = { ...plateContents };
      setFoodIcon(slot.querySelector(".fridge-slot-item"), "fridge-slot-item", plateContents);
      slot.classList.add("filled");
      clearPlate();
    }

    function takeFromShelfPlate(index) {
      const item = fridgeShelves[index];
      if (!item || !canTakeItemFromFridge(item)) return;
      dockCarrierIfOnCounter("plate");
      if (plateDirty) {
        plateDirty = false;
        plate.classList.remove("dirty");
      }
      setPlateFood({ ...item });
      fridgeShelves[index] = null;
      setFoodIcon(fridgeSlots[index].querySelector(".fridge-slot-item"), "fridge-slot-item", null);
      fridgeSlots[index].classList.remove("filled");
      if (!plateFollowing) pickUpPlate();
      updateFridgeSlots();
    }

    function placeOnShelfCup(index) {
      if (!isCupDrink(cupContents)) return;
      const slot = fridgeSlots[index];
      fridgeShelves[index] = { ...cupContents };
      setDrinkIcon(slot.querySelector(".fridge-slot-item"), "fridge-slot-item", cupContents);
      slot.classList.add("filled");
      clearCup();
    }

    function takeFromShelfCup(index) {
      const item = fridgeShelves[index];
      if (!item || !canTakeItemFromFridge(item)) return;
      dockCarrierIfOnCounter("cup");
      if (cupDirty) {
        cupDirty = false;
        cup.classList.remove("dirty");
      }
      setCupDrink({ ...item });
      fridgeShelves[index] = null;
      setDrinkIcon(fridgeSlots[index].querySelector(".fridge-slot-item"), "fridge-slot-item", null);
      fridgeSlots[index].classList.remove("filled");
      if (!cupFollowing) pickUpCup();
      updateFridgeSlots();
    }

    function placeOnShelfPot(index) {
      if (!isPotSoup(potContents)) return;
      const slot = fridgeSlots[index];
      fridgeShelves[index] = { ...potContents };
      setSoupIcon(slot.querySelector(".fridge-slot-item"), "fridge-slot-item", potContents);
      slot.classList.add("filled");
      clearPot();
    }

    function takeFromShelfPot(index) {
      const item = fridgeShelves[index];
      if (!item || !canTakeItemFromFridge(item)) return;
      dockCarrierIfOnCounter("pot");
      if (potDirty) {
        potDirty = false;
        pot.classList.remove("dirty");
      }
      setPotSoup({ ...item });
      fridgeShelves[index] = null;
      setSoupIcon(fridgeSlots[index].querySelector(".fridge-slot-item"), "fridge-slot-item", null);
      fridgeSlots[index].classList.remove("filled");
      if (!potFollowing) pickUpPot();
      updateFridgeSlots();
    }

    function placeOnShelfBowl(index) {
      if (!isBowlItem(bowlContents)) return;
      const slot = fridgeSlots[index];
      fridgeShelves[index] = { ...bowlContents };
      setBowlIcon(slot.querySelector(".fridge-slot-item"), "fridge-slot-item", bowlContents);
      slot.classList.add("filled");
      clearBowl();
    }

    function takeFromShelfBowl(index) {
      const item = fridgeShelves[index];
      if (!item || !isBowlItem(item) || !canTakeBowlItemFromFridge()) return;

      dockCarrierIfOnCounter("bowl");

      setBowlItem({ ...item });
      if (!bowlContents) return;

      fridgeShelves[index] = null;
      setBowlIcon(fridgeSlots[index].querySelector(".fridge-slot-item"), "fridge-slot-item", null);
      fridgeSlots[index].classList.remove("filled");

      if (!bowlFollowing) pickUpBowl();
      updateFridgeSlots();
    }

    basket.addEventListener("click", (e) => {
      e.stopPropagation();
      if (basketFollowing) {
        putDownBasket();
      } else {
        pickUpBasket();
      }
    });

    plate.addEventListener("click", (e) => {
      e.stopPropagation();
      if (tryCombineOnCounterCarrier("plate")) return;
      if (trySeasonOnCounterCarrier("plate")) return;
      if (plateRestSpotId || !plateFollowing) {
        pickUpPlate();
      }
    });

    if (mop) {
      mop.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!isScreen6Active()) return;
        if (!mopFollowing) pickUpMop();
      });
    }

    if (mopHome) {
      mopHome.addEventListener("click", (e) => {
        if (!mopFollowing) return;
        if (e.target.closest("#mop")) return;
        putDownMop();
      });
    }

    root.addEventListener("click", (e) => {
      const puddle = e.target.closest(".mud-puddle");
      if (!puddle) return;
      if (tryCleanMudPuddle(puddle)) e.stopPropagation();
    });

    cup.addEventListener("click", (e) => {
      e.stopPropagation();
      if (tryCombineOnCounterCarrier("cup")) return;
      if (trySeasonOnCounterCarrier("cup")) return;
      if (cupRestSpotId || !cupFollowing) {
        pickUpCup();
      }
    });

    pot.addEventListener("click", (e) => {
      e.stopPropagation();
      if (tryCombineOnCounterCarrier("pot")) return;
      if (trySeasonOnCounterCarrier("pot")) return;
      if (potRestSpotId || !potFollowing) {
        pickUpPot();
      }
    });

    bowl.addEventListener("click", (e) => {
      e.stopPropagation();
      if (tryCombineOnCounterCarrier("bowl")) return;
      if (trySeasonOnCounterCarrier("bowl")) return;
      if (bowlRestSpotId || !bowlFollowing) {
        pickUpBowl();
      }
    });

    tray.addEventListener("click", (e) => {
      e.stopPropagation();
      if (performance.now() < suppressTrayClickUntil) return;
      if (isTrayCloseupOpen()) return;
      if (isTrayOnCounter()) {
        if (trayActionMenu.classList.contains("open")) {
          hideTrayActionMenu();
        } else {
          showTrayActionMenu();
        }
        return;
      }
      if (!trayFollowing) {
        pickUpTray();
      }
    });

    trayHome.addEventListener("click", (e) => {
      if (e.target.closest("#tray")) return;
      if (trayFollowing) {
        putDownTray();
        return;
      }
      if (isTrayOnHomeDock()) {
        pickUpTray();
      }
    });

    if (cafeteriaCartPickup) {
      cafeteriaCartPickup.addEventListener("click", (e) => {
        e.stopPropagation();
        if (cafeteriaCartPickup.classList.contains("can-pickup")) {
          pickUpDirtyTrayFromCart();
        }
      });
    }

    trayMenuPickUp.addEventListener("click", (e) => {
      e.stopPropagation();
      pickUpTray();
    });

    trayMenuPlaceFood.addEventListener("pointerdown", handleTrayPlaceFood, true);
    trayMenuPlaceFood.addEventListener("click", handleTrayPlaceFood, true);

    trayCloseupDone.addEventListener("click", (e) => {
      e.stopPropagation();
      closeTrayCloseup();
    });

    trayCloseup.addEventListener("click", (e) => {
      if (e.target === trayCloseup) {
        closeTrayCloseup();
        return;
      }
      e.stopPropagation();
    });

    root.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (isTrayCloseupOpen()) {
        closeTrayCloseup();
        return;
      }
      if (trayActionMenu.classList.contains("open")) {
        hideTrayActionMenu();
        return;
      }
      const book = getEl("recipeBook");
      const bookToggle = getEl("recipeBookToggle");
      if (book && book.classList.contains("open")) {
        book.classList.remove("open");
        if (bookToggle) bookToggle.setAttribute("aria-expanded", "false");
        if (typeof showRecipeList === "function") showRecipeList();
        return;
      }
      if (cashierSequenceBusy) {
        setCashierBusy(false);
      }
    });

    root.addEventListener("click", (e) => {
      if (!trayActionMenu || !trayActionMenu.classList.contains("open")) return;
      if (
        e.target.closest("#trayActionMenu") ||
        e.target.closest("#trayMenuPlaceFood") ||
        e.target.closest("#trayMenuPickUp") ||
        e.target.closest("#tray") ||
        e.target.closest("#trayCloseup")
      ) {
        return;
      }
      hideTrayActionMenu();
    });

    basketHome.addEventListener("click", (e) => {
      if (!basketFollowing) return;
      if (e.target.closest("#basket")) return;
      putDownBasket();
    });

    plateHome.addEventListener("click", (e) => {
      if (!plateFollowing) return;
      if (e.target.closest("#plate")) return;
      putDownPlate();
    });

    cupHome.addEventListener("click", (e) => {
      if (!cupFollowing) return;
      if (e.target.closest("#cup")) return;
      putDownCup();
    });

    potHome.addEventListener("click", (e) => {
      if (!potFollowing) return;
      if (e.target.closest("#pot")) return;
      putDownPot();
    });

    bowlHome.addEventListener("click", (e) => {
      if (!bowlFollowing) return;
      if (e.target.closest("#bowl")) return;
      putDownBowl();
    });

    saltShaker.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!isScreen2Active()) return;
      if (saltFollowing) return;
      pickUpSalt();
    });

    pepperShaker.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!isScreen2Active()) return;
      if (pepperFollowing) return;
      pickUpPepper();
    });

    saltShakerDock.addEventListener("click", (e) => {
      if (!isScreen2Active() || !saltFollowing) return;
      if (e.target.closest("#saltShaker")) return;
      returnSaltShaker();
    });

    pepperShakerDock.addEventListener("click", (e) => {
      if (!isScreen2Active() || !pepperFollowing) return;
      if (e.target.closest("#pepperShaker")) return;
      returnPepperShaker();
    });

    root.addEventListener("mousemove", (e) => {
      if (basketFollowing) moveBasketWithCursor(e.clientX, e.clientY);
      if (plateFollowing) movePlateWithCursor(e.clientX, e.clientY);
      if (mopFollowing) moveMopWithCursor(e.clientX, e.clientY);
      if (cupFollowing) moveCupWithCursor(e.clientX, e.clientY);
      if (potFollowing) movePotWithCursor(e.clientX, e.clientY);
      if (bowlFollowing) moveBowlWithCursor(e.clientX, e.clientY);
      if (trayFollowing) moveTrayWithCursor(e.clientX, e.clientY);
      if (saltFollowing && isScreen2Active()) moveShakerWithCursor(saltShaker, e.clientX, e.clientY);
      if (pepperFollowing && isScreen2Active()) moveShakerWithCursor(pepperShaker, e.clientX, e.clientY);
    });

    kitchenSink.addEventListener("click", (e) => {
      e.stopPropagation();
      if (kitchenSink.classList.contains("washing")) return;
      if (kitchenSink.classList.contains("can-drop")) {
        placeInSink();
      } else if (kitchenSink.classList.contains("can-take-plate")) {
        takeFromSink();
      }
    });

    meatBox.addEventListener("click", (e) => {
      e.stopPropagation();
      if (meatBox.classList.contains("can-take-plate")) {
        takeFromMeatBox();
      }
    });

    kitchenCuttingBoard.addEventListener("click", (e) => {
      e.stopPropagation();
      if (kitchenCuttingBoard.classList.contains("can-cut")) {
        placeOnCuttingBoard();
      }
    });

    kitchenBlender.addEventListener("click", (e) => {
      e.stopPropagation();
      if (kitchenBlender.classList.contains("can-drop-food")) {
        placeInBlender();
      } else if (kitchenBlender.classList.contains("can-fill-cup")) {
        takeJuiceFromBlender();
      } else if (kitchenBlender.classList.contains("can-fill-pot")) {
        takeSoupFromBlender();
      } else if (kitchenBlender.classList.contains("can-fill-bowl")) {
        takeFlourFromBlender();
      }
    });

    plants.forEach((plant) => {
      plant.addEventListener("click", (e) => {
        if (!basketFollowing || basketContents) return;
        e.stopPropagation();
        setBasketCrop(plant.dataset.crop);
      });
    });

    coolerDrinks.forEach((drinkEl) => {
      drinkEl.addEventListener("click", (e) => {
        e.stopPropagation();
        if (drinkEl.classList.contains("can-fill")) {
          fillCupFromCooler(drinkEl);
        }
      });
    });

    function handleFridgeShelfClick(index, e) {
      if (!isFridgeShelfInteractive()) return false;
      const slot = fridgeSlots[index];
      const item = fridgeShelves[index];
      if (item && canTakeItemFromFridge(item)) {
        e.stopPropagation();
        const kind = getFridgeItemKind(item);
        if (kind === "basket") takeFromShelf(index);
        else if (kind === "plate") takeFromShelfPlate(index);
        else if (kind === "cup") takeFromShelfCup(index);
        else if (kind === "pot") takeFromShelfPot(index);
        else if (kind === "bowl") takeFromShelfBowl(index);
        return true;
      }
      if (!item && slot.classList.contains("can-drop")) {
        e.stopPropagation();
        if (basketFollowing && basketContents && isBasketFood(basketContents)) {
          placeOnShelf(index);
        } else if (plateFollowing && plateContents && isPlateFood(plateContents)) {
          placeOnShelfPlate(index);
        } else if (cupFollowing && cupContents && isCupDrink(cupContents)) {
          placeOnShelfCup(index);
        } else if (potFollowing && potContents && isPotSoup(potContents)) {
          placeOnShelfPot(index);
        } else if (bowlFollowing && bowlContents && isBowlItem(bowlContents)) {
          placeOnShelfBowl(index);
        }
        return true;
      }
      return false;
    }

    fridgeSlots.forEach((slot) => {
      slot.addEventListener("click", (e) => {
        handleFridgeShelfClick(Number(slot.dataset.shelf), e);
      });
    });

    kitchenTrashCans.forEach((trash) => {
      trash.addEventListener("click", (e) => {
        e.stopPropagation();
        throwAwayFood(trash);
      });
    });

    root.querySelectorAll(".counter-rest-spot").forEach((spot) => {
      spot.addEventListener("click", (e) => {
        e.stopPropagation();
        if (trySeasonCounterSpot(spot)) return;
        if (spot.classList.contains("can-combine") || spot.classList.contains("can-place")) {
          tryPlaceOnCounterSpot(spot);
        }
      });
    });

    window.addEventListener("resize", () => {
      updateCounterRestSpots();
    });

    releaseStuckUI();
    updateCarrierUI();
    window.addEventListener("pageshow", releaseStuckUI);

    function fridgeIsAnimating() {
      return (
        kitchenFridge.classList.contains("opening") ||
        kitchenFridge.classList.contains("closing")
      );
    }

    function closeFridge() {
      if (!kitchenFridge.classList.contains("open") || fridgeIsAnimating()) return;
      kitchenFridge.classList.add("closing");
      kitchenFridge.classList.remove("open");
      updateFridgeSlots();
      kitchenFridge.setAttribute("aria-label", "Open refrigerator");
      setTimeout(() => {
        kitchenFridge.classList.remove("closing");
      }, FRIDGE_ANIM_MS);
      updateCarrierUI();
    }

    function openFridge() {
      if (kitchenFridge.classList.contains("open") || fridgeIsAnimating()) return;
      kitchenFridge.classList.add("opening", "open");
      updateFridgeSlots();
      kitchenFridge.setAttribute("aria-label", "Close refrigerator");
      setTimeout(() => {
        kitchenFridge.classList.remove("opening");
      }, FRIDGE_ANIM_MS);
      updateCarrierUI();
    }

    kitchenFridge.addEventListener("click", (e) => {
      e.stopPropagation();
      if (e.target.closest(".fridge-slot")) return;
      if (fridgeIsAnimating()) return;

      const isOpen = kitchenFridge.classList.contains("open");
      const doorHit = e.target.closest(".fridge-door");

      if (isOpen && doorHit) {
        closeFridge();
        return;
      }

      if (!isOpen) {
        openFridge();
      }
    });

    kitchenFridge.addEventListener("keydown", (e) => {
      if (e.target.closest(".fridge-slot")) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (fridgeIsAnimating()) return;

      if (kitchenFridge.classList.contains("open")) {
        closeFridge();
      } else {
        openFridge();
      }
    });

    function applianceIsAnimating(el) {
      return el.classList.contains("opening") || el.classList.contains("closing");
    }

    function setApplianceOpen(el, labels, open, tutorialGuideType) {
      if (open) {
        el.classList.add("opening", "open");
        el.setAttribute("aria-label", labels.open);
        setTimeout(() => el.classList.remove("opening"), APPLIANCE_ANIM_MS);
        if (tutorialGuideType) {
          maybeAdvanceTutorialGuide({ type: tutorialGuideType, action: "open" });
        }
      } else {
        el.classList.add("closing");
        el.classList.remove("open");
        el.setAttribute("aria-label", labels.closed);
        setTimeout(() => el.classList.remove("closing"), APPLIANCE_ANIM_MS);
      }
      updateCarrierUI();
    }

    function bindApplianceInteraction(el, labels, options) {
      const doorSelector = options.doorSelector || null;
      const ignoreSelector = options.ignoreSelector || null;
      const tryUse = options.tryUse || (() => false);
      const canOpen = options.canOpen || (() => true);
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
        updateCarrierUI();
      }

      function onInteract(e) {
        if (ignoreSelector && e.target.closest(ignoreSelector)) return;
        if (applianceIsAnimating(el) || isBlocked()) return;

        const isOpen = el.classList.contains("open");
        const doorHit = doorSelector && e.target.closest(doorSelector);

        if (isOpen && doorHit) {
          setApplianceOpen(el, labels, false, null);
          return;
        }

        if (isOpen && tryUse()) {
          return;
        }

        if (!isOpen && canOpen()) {
          setApplianceOpen(el, labels, true, options.tutorialGuide || null);
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
        if (applianceIsAnimating(el) || isBlocked()) return;

        const isOpen = el.classList.contains("open");
        if (isOpen) {
          if (tryUse()) return;
          setApplianceOpen(el, labels, false, null);
        } else if (canOpen()) {
          setApplianceOpen(el, labels, true, options.tutorialGuide || null);
        }
      });

      applianceCloseFns.push(closeInstant);
    }

    bindApplianceInteraction(kitchenDishwasher, {
      closed: "Open dishwasher",
      open: "Close dishwasher",
    }, {
      doorSelector: ".dishwasher-door",
      tutorialGuide: "dishwasher",
      isBlocked: () => kitchenDishwasher.classList.contains("washing"),
      canOpen: () => !kitchenDishwasher.classList.contains("washing"),
      tryUse: () => {
        if (kitchenDishwasher.classList.contains("can-drop-dish")) {
          placeInDishwasher();
          return true;
        }
        return false;
      },
    });

    bindApplianceInteraction(kitchenMicrowave, {
      closed: "Open microwave",
      open: "Close microwave",
    }, {
      doorSelector: ".microwave-door",
      tutorialGuide: "microwave",
      tryUse: () => {
        if (kitchenMicrowave.classList.contains("can-drop")) {
          placeInMicrowave();
          return true;
        }
        if (kitchenMicrowave.classList.contains("can-take")) {
          takeFromMicrowave();
          return true;
        }
        return false;
      },
    });

    bindApplianceInteraction(kitchenOven, {
      closed: "Open oven",
      open: "Close oven",
    }, {
      doorSelector: ".oven-door",
      tutorialGuide: "oven",
      tryUse: () => {
        if (kitchenOven.classList.contains("can-drop")) {
          placeInOven();
          return true;
        }
        if (kitchenOven.classList.contains("can-take")) {
          takeFromOven();
          return true;
        }
        return false;
      },
    });

    bindApplianceInteraction(kitchenCooler, {
      closed: "Open cooler",
      open: "Close cooler",
    }, {
      doorSelector: ".cooler-door",
      ignoreSelector: ".cooler-drink",
      tutorialGuide: "cooler",
      tryUse: () => false,
    });

    function closeAllAppliancesInstant() {
      closeFridgeInstant();
      clearDishwasherInstant();
      clearBlenderInstant();
      clearCuttingInstant();
      clearOvenInstant();
      clearMicrowaveInstant();
      applianceCloseFns.forEach((close) => close());
    }

    function closeFridgeInstant() {
      if (
        !kitchenFridge.classList.contains("open") &&
        !kitchenFridge.classList.contains("opening") &&
        !kitchenFridge.classList.contains("closing")
      ) {
        return;
      }
      kitchenFridge.classList.remove("open", "opening", "closing");
      kitchenFridge.setAttribute("aria-label", "Open refrigerator");
      updateFridgeSlots();
    }

    function navigateToScreen(num, options) {
      const opts = options || {};
      const active = root.querySelector(".screen.active");
      if (active && Number(active.dataset.screen) !== num) {
        closeAllAppliancesInstant();
        releaseStuckUI();
      }
      showScreen(num);
      if (num === 5 && !opts.skipCashierSpawn) {
        ensureCashierCustomer();
      }
      updateCarrierUI();
      if (tutorialMode && tutorialGuideActive) {
        refreshTutorialGlow();
      }
    }

    root.querySelectorAll(".nav-arrow[data-go]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dest = Number(btn.dataset.go);
        handleTutorialNavPress(btn, dest);
        navigateToScreen(dest);
      });
    });

    const startScreen = getEl("startScreen");
    const startBtn = getEl("startBtn");
    const startFlash = getEl("startFlash");
    const nameScreen = getEl("nameScreen");
    const menuScreen = getEl("menuScreen");
    const restaurantNameInput = getEl("restaurantNameInput");
    const nameContinueBtn = getEl("nameContinueBtn");
    const startNewGameBtn = getEl("startNewGameBtn");
    const tutorialBtn = getEl("tutorialBtn");
    const tutorialGary = getEl("tutorialGary");
    const tutorialGaryBubble = getEl("tutorialGaryBubble");
    const tutorialGaryText = getEl("tutorialGaryText");
    const storefrontSign = getEl("storefrontSign");
    let introStarted = false;
    let gameStarted = false;
    let restaurantName = "";

    function updateStorefrontSign() {
      if (!storefrontSign) return;
      const name = restaurantName.trim();
      storefrontSign.textContent = name ? name + " Diner" : "";
    }

    const START_WHITE_MS = 1800;
    const NAME_FADE_MS = 1800;
    const RESTAURANT_NAME_MAX = 10;
    let namingFinishing = false;

    function formatRestaurantName(value) {
      if (!value) return "";
      return value
        .slice(0, RESTAURANT_NAME_MAX)
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, (ch) => ch.toUpperCase());
    }

    function updateNameContinueBtn() {
      if (!nameContinueBtn || !restaurantNameInput) return;
      const hasName = restaurantNameInput.value.trim().length > 0;
      nameContinueBtn.disabled = !hasName;
    }

    function showNameScreen() {
      if (!nameScreen) return;
      nameScreen.classList.remove("is-hidden", "is-fading-out");
      if (restaurantNameInput) {
        restaurantNameInput.disabled = false;
        restaurantNameInput.value = "";
        updateNameContinueBtn();
        restaurantNameInput.focus();
      }
    }

    function showMenuScreen() {
      if (!menuScreen) return;
      menuScreen.classList.remove("is-hidden", "is-fading-out");
      menuScreen.classList.add("is-fading-in");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          menuScreen.classList.remove("is-fading-in");
        });
      });
    }

    function beginGame() {
      if (introStarted) return;
      introStarted = true;
      startBtn.disabled = true;
      startFlash.classList.add("show");
      window.setTimeout(() => {
        startScreen.classList.add("is-hidden");
        showNameScreen();
        window.setTimeout(() => {
          startFlash.classList.remove("show");
        }, 200);
      }, START_WHITE_MS);
    }

    function finishNaming() {
      if (
        namingFinishing ||
        !restaurantNameInput ||
        !nameContinueBtn ||
        nameContinueBtn.disabled
      ) {
        return;
      }
      restaurantName = formatRestaurantName(restaurantNameInput.value.trim());
      if (!restaurantName) return;
      updateStorefrontSign();
      namingFinishing = true;
      nameContinueBtn.disabled = true;
      restaurantNameInput.disabled = true;
      nameScreen.classList.add("is-fading-out");
      window.setTimeout(() => {
        nameScreen.classList.add("is-hidden");
        nameScreen.classList.remove("is-fading-out");
        namingFinishing = false;
        showMenuScreen();
      }, NAME_FADE_MS);
    }

    function hideGaryBubble() {
      if (garyTypeTimer) {
        clearTimeout(garyTypeTimer);
        garyTypeTimer = null;
      }
      if (tutorialGaryBubble) {
        tutorialGaryBubble.classList.remove("is-visible", "is-typing");
        tutorialGaryBubble.hidden = true;
      }
      if (tutorialGaryText) tutorialGaryText.textContent = "";
    }

    function typeGaryMessage(text) {
      return new Promise((resolve) => {
        if (!tutorialMode || !tutorialGaryText || !tutorialGaryBubble) {
          resolve();
          return;
        }
        tutorialGaryText.textContent = "";
        tutorialGaryBubble.hidden = false;
        tutorialGaryBubble.classList.add("is-visible", "is-typing");
        let i = 0;
        const step = () => {
          if (i >= text.length) {
            tutorialGaryBubble.classList.remove("is-typing");
            garyTypeTimer = null;
            resolve();
            return;
          }
          tutorialGaryText.textContent += text.charAt(i);
          i += 1;
          garyTypeTimer = window.setTimeout(step, GARY_TYPE_MS);
        };
        step();
      });
    }

    async function playGaryIntro() {
      garyIntroComplete = false;
      await typeGaryMessage(GARY_INTRO_TEXT);
      await waitMs(GARY_READ_MS);
      hideGaryBubble();
      garyIntroComplete = true;
    }

    function buildGaryFirstCustomerText() {
      const item = cashierCurrentOrder?.items?.[0];
      const want = item?.label ? item.label : "something";
      return (
        "Here's your first customer! Looks like they want " +
        want +
        ". I'll show you how to make it!"
      );
    }

    async function playGaryFirstCustomerMessage() {
      await typeGaryMessage(buildGaryFirstCustomerText());
      await waitMs(GARY_READ_MS);
      hideGaryBubble();
    }

    async function playGaryTrayWashMessage() {
      await typeGaryMessage(GARY_TRAY_WASH_TEXT);
      await waitMs(garyReadMsFor(GARY_TRAY_WASH_TEXT));
      hideGaryBubble();
    }

    async function playGaryDrinkCustomerMessage() {
      await typeGaryMessage(
        "Looks like this customer wants a drink. I'll show you where to get that!"
      );
      await waitMs(GARY_READ_MS);
      hideGaryBubble();
    }

    function buildGarySoupCustomerText() {
      const item = cashierCurrentOrder?.items?.[0];
      const want = item?.label ? item.label : "soup";
      return (
        "This customer wants some " +
        want +
        ". Soups and stews are pretty complicated, but I bet I can show you how to make some!"
      );
    }

    async function playGarySoupCustomerMessage() {
      const text = buildGarySoupCustomerText();
      await typeGaryMessage(text);
      await waitMs(garyReadMsFor(text));
      hideGaryBubble();
    }

    async function playGaryDishwashMessage() {
      await typeGaryMessage(GARY_DISHWASH_TEXT);
      await waitMs(GARY_READ_MS);
      hideGaryBubble();
    }

    async function playGaryNightClosedMessage() {
      root.classList.add("gary-visible");
      try {
        await typeGaryMessage(GARY_NIGHT_CLOSED_TEXT);
        await waitMs(garyReadMsFor(GARY_NIGHT_CLOSED_TEXT));
        hideGaryBubble();
      } finally {
        root.classList.remove("gary-visible");
      }
    }

    async function playGaryDrinkDoneMessage() {
      holdCustomerEnterForGary();
      try {
        await typeGaryMessage(GARY_DRINK_DONE_TEXT);
        await waitMs(garyReadMsFor(GARY_DRINK_DONE_TEXT));
        hideGaryBubble();
      } finally {
        releaseCustomerEnterAfterGary();
      }
    }

    function beginCustomerAfterIntro() {
      window.setTimeout(() => {
        runCashierCustomerEnterSequence();
      }, CASHIER_INTRO_HOLD_MS);
    }

    function beginPlaySession(options) {
      const opts = options || {};
      if (gameStarted || !menuScreen) return;
      gameStarted = true;
      tutorialMode = !!opts.tutorial;
      tutorialCustomerIndex = 0;
      tutorialDishwashPhase = false;
      tutorialDishwashVariant = null;
      tutorialDishwashGaryPlayed = false;
      tutorialResumeOrderItem = null;
      tutorialDishwashQueue = false;
      ensureMudPuddleLayers();
      resetNightState();
      stopTutorialGuide();
      garyIntroComplete = !tutorialMode;
      if (startNewGameBtn) startNewGameBtn.disabled = true;
      if (tutorialBtn) tutorialBtn.disabled = true;
      root.classList.add("game-started");
      if (tutorialMode) {
        root.classList.add("tutorial-mode");
      } else {
        hideGaryBubble();
      }
      prepareCashierIntroHold();
      navigateToScreen(5, { skipCashierSpawn: true });
      menuScreen.classList.add("is-fading-out");
      window.setTimeout(() => {
        menuScreen.classList.add("is-hidden");
        menuScreen.classList.remove("is-fading-out");
        if (tutorialMode) {
          playGaryIntro().then(beginCustomerAfterIntro);
        } else {
          beginCustomerAfterIntro();
        }
      }, NAME_FADE_MS);
    }

    function startNewGame() {
      beginPlaySession({ tutorial: false });
    }

    function startTutorial() {
      beginPlaySession({ tutorial: true });
    }

    if (startBtn) {
      startBtn.addEventListener("click", beginGame);
    }

    if (restaurantNameInput) {
      restaurantNameInput.addEventListener("input", () => {
        const el = restaurantNameInput;
        const pos = el.selectionStart;
        const before = el.value;
        const formatted = formatRestaurantName(before);
        if (formatted !== before) {
          el.value = formatted;
          const newPos = Math.min(pos, formatted.length);
          el.setSelectionRange(newPos, newPos);
        }
        updateNameContinueBtn();
      });
      restaurantNameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && nameContinueBtn && !nameContinueBtn.disabled) {
          e.preventDefault();
          finishNaming();
        }
      });
    }

    if (nameContinueBtn) {
      nameContinueBtn.addEventListener("click", finishNaming);
    }

    if (startNewGameBtn) {
      startNewGameBtn.addEventListener("click", startNewGame);
    }

    if (tutorialBtn) {
      tutorialBtn.addEventListener("click", startTutorial);
    }

    if (cashierTraySpot) {
      cashierTraySpot.addEventListener("click", (e) => {
        e.stopPropagation();
        handleCashierTraySpotClick();
      });
    }

    const recipeBook = getEl("recipeBook");
    const recipeBookToggle = getEl("recipeBookToggle");
    const recipeList = getEl("recipeList");
    const recipeDetail = getEl("recipeDetail");
    const recipeDetailTitle = getEl("recipeDetailTitle");
    const recipeDetailSteps = getEl("recipeDetailSteps");
    const recipeBack = getEl("recipeBack");

    function showRecipeList() {
      recipeBook.classList.remove("show-detail");
    }

    function showRecipeDetail(recipe) {
      recipeDetailTitle.textContent = recipe.name;
      recipeDetailSteps.textContent = recipe.steps;
      recipeBook.classList.add("show-detail");
    }

    RECIPE_BOOK.forEach((recipe) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "recipe-list-item";
      btn.textContent = recipe.name;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        showRecipeDetail(recipe);
      });
      recipeList.appendChild(btn);
    });

    recipeBookToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = recipeBook.classList.toggle("open");
      recipeBookToggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) showRecipeList();
    });

    recipeBack.addEventListener("click", (e) => {
      e.stopPropagation();
      showRecipeList();
    });

    recipeBook.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    root.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !recipeBook.classList.contains("open")) return;
      recipeBook.classList.remove("open");
      recipeBookToggle.setAttribute("aria-expanded", "false");
      showRecipeList();
    });

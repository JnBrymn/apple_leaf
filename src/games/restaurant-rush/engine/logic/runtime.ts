// @ts-nocheck
export type GameRuntime = Record<string, any>

export function createRuntime(
  root: HTMLElement,
  getEl: (id: string) => HTMLElement | null,
  constants: Record<string, any>,
  derived: Record<string, any>,
  food: Record<string, any>,
  helpers: Record<string, any>,
): GameRuntime {
  const g: GameRuntime = { root, getEl, ...constants, ...derived, ...food, ...helpers }
  g.gameLayer = g.root.querySelector('.gameScaleLayer') ?? g.root
  g.screens = g.root.querySelectorAll(".screen");
  
      
  g.basket = g.getEl("basket");
  g.basketHome = g.getEl("basketHome");
  g.basketItem = g.getEl("basketItem");
  g.plate = g.getEl("plate");
  g.plateHome = g.getEl("plateHome");
  g.mop = g.getEl("mop");
  g.mopHome = g.getEl("mopHome");
  g.plateItem = g.getEl("plateItem");
  g.cup = g.getEl("cup");
  g.cupHome = g.getEl("cupHome");
  g.cupItem = g.getEl("cupItem");
  g.pot = g.getEl("pot");
  g.potHome = g.getEl("potHome");
  g.bowl = g.getEl("bowl");
  g.bowlHome = g.getEl("bowlHome");
  g.tray = g.getEl("tray");
  g.trayHome = g.getEl("trayHome");
  g.trayStackBadge = g.getEl("trayStackBadge");
  g.trayStackLayers = g.getEl("trayStackLayers");
  g.trayActionMenu = g.getEl("trayActionMenu");
  g.trayMenuPickUp = g.getEl("trayMenuPickUp");
  g.trayMenuPlaceFood = g.getEl("trayMenuPlaceFood");
  g.trayCloseup = g.getEl("trayCloseup");
  g.trayCloseupDone = g.getEl("trayCloseupDone");
  g.trayCloseupSources = g.getEl("trayCloseupSources");
  g.trayCloseupSlots = g.getEl("trayCloseupSlots");
  g.kitchenCuttingBoard = g.getEl("kitchenCuttingBoard");
  g.cuttingBoardZone = g.getEl("cuttingBoardZone");
  g.cuttingBoardFood = g.getEl("cuttingBoardFood");
  g.cuttingBoardTimer = g.getEl("cuttingBoardTimer");
  g.ovenZone = g.getEl("ovenZone");
  g.ovenFood = g.getEl("ovenFood");
  g.ovenTimer = g.getEl("ovenTimer");
  g.microwaveZone = g.getEl("microwaveZone");
  g.microwavePot = g.getEl("microwavePot");
  g.microwaveTimer = g.getEl("microwaveTimer");
  g.kitchenSink = g.getEl("kitchenSink");
  g.meatBox = g.getEl("meatBox");
  g.sinkBasin = g.getEl("sinkBasin");
  g.sinkItem = g.getEl("sinkItem");
  g.sinkSparkle = g.getEl("sinkSparkle");
  g.sinkWashTimer = g.getEl("sinkWashTimer");
  g.dishwasherZone = g.getEl("dishwasherZone");
  g.dishwasherItem = g.getEl("dishwasherItem");
  g.dishwasherWashTimer = g.getEl("dishwasherWashTimer");
  g.gardenRow = g.getEl("gardenRow");
  g.plants = g.gardenRow
        ? g.gardenRow.querySelectorAll(".plant[data-crop]")
        : [];
  
  g.basketFollowing = false;
  g.basketContents = null;
  g.plateFollowing = false;
  g.mopFollowing = false;
  g.mopSwishTimer = null;
  g.mudPuddlesByScreen = { 2: [], 3: [], 6: [] };
  g.plateContents = null;
  g.cupFollowing = false;
  g.cupContents = null;
  g.potFollowing = false;
  g.potContents = null;
  g.bowlFollowing = false;
  g.bowlContents = null;
  g.plateDirty = false;
  g.cupDirty = false;
  g.potDirty = false;
  g.bowlDirty = false;
  g.trayDirty = false;
  g.plateRestSpotId = null;
  g.cupRestSpotId = null;
  g.potRestSpotId = null;
  g.bowlRestSpotId = null;
  g.trayFollowing = false;
  g.trayRestSpotId = null;
  g.trayAtCashier = false;
  g.suppressTrayClickUntil = 0;
  g.trayContents = { soup: null, drink: null, food: null, extra: null };
  g.saltFollowing = false;
  g.pepperFollowing = false;
  g.counterSpotOccupants = new Map();
  g.traysAtHome = g.TRAY_STACK_MAX;
  g.cafeteriaCartDirtyTrays = 0;
  
      /** Counter food + shaker → which seasonings apply (see g.getSeasoningTargetKey) */
  g.sinkContents = null;
  g.sinkWashing = false;
  g.sinkTimerInterval = null;
  g.dishwasherLoad = null;
  g.dishwasherWashing = false;
  g.dishwasherTimerInterval = null;
  g.blenderResult = null;
  g.blenderBlending = false;
  g.blenderFruitFood = null;
  g.blenderTimerInterval = null;
  g.cuttingInProgress = false;
  g.cuttingFood = null;
  g.cuttingTimerInterval = null;
  g.ovenBaking = false;
  g.ovenBakingInput = null;
  g.ovenResult = null;
  g.ovenTimerInterval = null;
  g.microwaveHeating = false;
  g.microwaveHeatingSoup = null;
  g.microwaveResult = null;
  g.microwaveTimerInterval = null;
                                          
      // Recipe steps: food names + appliances only (oven, blender, cutting board, microwave, MEAT box, etc.).
      // No sink, dishwasher, or carriers (g.plate, g.cup, g.bowl, g.pot, g.tray).
      
  
      
      
      
      
      
      
      
      
      
      

  g.cashierCurrentOrder = null;
  g.cashierSequenceBusy = false;
  g.cashierLastOrderSig = "";
  g.cashierToastTimer = null;
  g.tutorialMode = false;
  g.tutorialCustomerIndex = 0;
  g.garyIntroComplete = false;
  g.garyTypeTimer = null;
  g.garyCustomerEnterHeld = false;
  g.garyCustomerEnterWaiters = [];
  g.tutorialGuideSteps = [];
  g.tutorialGuideIndex = 0;
  g.tutorialGuideActive = false;
  g.tutorialDishwashPhase = false;
  g.tutorialDishwashVariant = null;
  g.tutorialDishwashGaryPlayed = false;
  g.tutorialResumeOrderItem = null;
  g.tutorialDishwashQueue = false;
  
      
  g.GARY_INTRO_TEXT =
        "Hi! I'm Gary. I will be showing you how to maintain your restaurant!";
  g.GARY_DRINK_DONE_TEXT =
        "Good job! Just remember, customers won't always order drinks from the cooler. You can always check the Recipes for foods, soups, or drinks that you don't know how to make!";
  g.GARY_TRAY_WASH_TEXT =
        "Great! Now you need to grab the dirty tray and wash it!";
  g.GARY_DISHWASH_TEXT =
        "I'm going to show you how to wash dishes now!";
  g.GARY_NIGHT_CLOSED_TEXT =
        "Oh! Looks like we're closed for the day. Let's clean up for tomorrow!";
          
  g.fridgeShelves = [null, null, null, null];
  g.fridgeSlots = g.root.querySelectorAll(".fridge-slot");
  g.kitchenFridge = g.getEl("kitchenFridge");
  g.kitchenDishwasher = g.getEl("kitchenDishwasher");
  g.kitchenMicrowave = g.getEl("kitchenMicrowave");
  g.kitchenCooler = g.getEl("kitchenCooler");
  g.coolerDrinks = g.kitchenCooler.querySelectorAll(".cooler-drink[data-drink]");
  g.kitchenOven = g.getEl("kitchenOven");
  g.saltShaker = g.getEl("saltShaker");
  g.pepperShaker = g.getEl("pepperShaker");
  g.saltShakerDock = g.getEl("saltShakerDock");
  g.pepperShakerDock = g.getEl("pepperShakerDock");
  g.screen2 = g.getEl("screen-2");
  g.screen3 = g.getEl("screen-3");
  g.screen4 = g.getEl("screen-4");
  g.screen5 = g.getEl("screen-5");
  g.screen6 = g.getEl("screen-6");
  g.cafeteriaCart = g.getEl("cafeteriaCart");
  g.cafeteriaCartPickup = g.getEl("cafeteriaCartPickup");
  g.cafeteriaCartTrayStack = g.getEl("cafeteriaCartTrayStack");
  g.cashierTraySpot = g.getEl("cashierTraySpot");
  g.cashierTrayPreview = g.getEl("cashierTrayPreview");
  g.cashierCustomer = g.getEl("cashierCustomer");
  g.cashierCustomerArea = g.getEl("cashierCustomerArea");
  g.cashierCustomerTrayGrid = g.getEl("cashierCustomerTrayGrid");
  g.cashierCustomerOrder = g.getEl("cashierCustomerOrder");
  g.cashierGlassDoors = g.getEl("cashierGlassDoors");
  g.cashierOrderList = g.getEl("cashierOrderList");
  g.cashierToast = g.getEl("cashierToast");
  g.kitchenBlender = g.getEl("kitchenBlender");
  g.blenderZone = g.getEl("blenderZone");
  g.blenderJar = g.getEl("blenderJar");
  g.blenderFruit = g.getEl("blenderFruit");
  g.blenderWashTimer = g.getEl("blenderWashTimer");
  g.kitchenTrashCans = g.root.querySelectorAll(".kitchen-trash");
  g.applianceCloseFns = [];
  
  
  g.SOUP_MIX_CROP_BY_RECIPE = {
        potato: "carrots",
        tomato: "tomatoes",
      };
  
  g.TUTORIAL_SCREEN_LINKS = {
        1: [2, 4],
        2: [1, 3, 5],
        3: [2, 6],
        4: [1, 5],
        5: [2, 4, 6],
        6: [3, 5],
      };
  
  g.customersServed = 0;
  g.isNighttime = false;
  g.nightBanner = g.getEl("nightBanner");
      
  g.trayDragState = null;
  g.trayDragGhost = null;
  
  g.startScreen = g.getEl("startScreen");
  g.startBtn = g.getEl("startBtn");
  g.startFlash = g.getEl("startFlash");
  g.nameScreen = g.getEl("nameScreen");
  g.menuScreen = g.getEl("menuScreen");
  g.restaurantNameInput = g.getEl("restaurantNameInput");
  g.nameContinueBtn = g.getEl("nameContinueBtn");
  g.startNewGameBtn = g.getEl("startNewGameBtn");
  g.tutorialBtn = g.getEl("tutorialBtn");
  g.tutorialGary = g.getEl("tutorialGary");
  g.tutorialGaryBubble = g.getEl("tutorialGaryBubble");
  g.tutorialGaryText = g.getEl("tutorialGaryText");
  g.storefrontSign = g.getEl("storefrontSign");
  g.introStarted = false;
  g.gameStarted = false;
  g.restaurantName = "";
  
  g.recipeBook = g.getEl("recipeBook");
  g.recipeBookToggle = g.getEl("recipeBookToggle");
  g.recipeList = g.getEl("recipeList");
  g.recipeDetail = g.getEl("recipeDetail");
  g.recipeDetailTitle = g.getEl("recipeDetailTitle");
  g.recipeDetailSteps = g.getEl("recipeDetailSteps");
  g.recipeBack = g.getEl("recipeBack");
  
  return g
}

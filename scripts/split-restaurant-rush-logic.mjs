/**
 * Split gameLogic.monolith.ts → engine/logic/modules/*.ts (shared runtime `g`).
 * Run: node scripts/split-restaurant-rush-logic.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const logicDir = path.join(root, 'src/games/restaurant-rush/engine/logic')
const modulesDir = path.join(logicDir, 'modules')
const gameLogicPath = path.join(root, 'src/games/restaurant-rush/engine/gameLogic.monolith.ts')

const src = fs.readFileSync(gameLogicPath, 'utf8')
const lines = src.split('\n')
const bodyStart = lines.findIndex((l) => l.includes('const screens = root.querySelectorAll'))
const bodyEnd = lines.findIndex((l, i) => i > bodyStart && l.trim() === 'return () => {')
const bodyLines = lines.slice(bodyStart, bodyEnd)

function moduleForFunction(name) {
  if (['getScreenName','applyScreenLabels','showScreen','clearCafeteriaDiners','refreshCafeteriaDiners',
    'isScreen2Active','isScreen4Active','isScreen5Active','isScreen6Active','getActiveScreenNum','navigateToScreen'].includes(name)) return 'screens'
  if (name.startsWith('tutorial')||name.startsWith('getTutorial')||name.startsWith('applyTutorial')||
    name.startsWith('refreshTutorial')||name.startsWith('shouldAutoSkipTutorial')||name.startsWith('maybeAdvanceTutorial')||
    name.startsWith('handleTutorial')||name.startsWith('startTutorial')||name.startsWith('stopTutorial')||
    name.startsWith('advanceTutorial')||name.startsWith('buildTutorial')||name.startsWith('findTutorial')||
    name.startsWith('checkTutorial')||name.startsWith('queueTutorial')||name.startsWith('finishTutorial')||
    name.startsWith('resetPlateForDishwash')||
    ['getNextScreenToward','tutorialShortestPath','tutorialNavSteps','tutorialNavStep','tutorialReturnToCashier',
      'tutorialServeSteps','tutorialGardenHarvestSteps','tutorialWashFoodSteps','tutorialOvenBakeSteps',
      'tutorialMicrowaveHeatSteps','tutorialSeasonPotSteps','tutorialSoupMixSteps','tutorialSeasonPlateSaltSteps',
      'tutorialPlateMismatchesFoodOrder','getTutorialDeliverCarrier','getCarrierCounterScreen','getTutorialWaitScreen',
      'getTutorialKitchenScreen','getTutorialCounterPlaceScreen','getTutorialSeasonPayload','getTutorialStepScreenCore',
      'getTutorialStepScreen','getTutorialPrerequisiteCarrier','getTutorialPrerequisiteScreen','isCarrierHeld',
      'tutorialTrayHasLoadedCarrier','getCurrentTutorialStep','runTutorialDishwashIntro','runTutorialTrayWashIntro'].includes(name)) return 'tutorial'
  if (name.startsWith('gary')||name.startsWith('holdCustomer')||name.startsWith('releaseCustomerEnter')||
    name.startsWith('waitForGary')||name.startsWith('hideGary')||name.startsWith('typeGary')||
    name.startsWith('buildGary')||name.startsWith('beginCustomerAfterIntro')||
    name.startsWith('playGary')||name.startsWith('beginCustomerAfterIntro')) return 'gary'
  if (name.startsWith('cashier')||name.startsWith('pickCashier')||name.startsWith('renderCashier')||
    name.startsWith('handleCashier')||name.startsWith('updateCashier')||name.startsWith('spawnCashier')||
    name.startsWith('ensureCashier')||name.startsWith('applyCustomer')||name.startsWith('setCashier')||
    name.startsWith('waitCustomer')||name.startsWith('setCustomer')||name.startsWith('resetCashier')||
    name.startsWith('prepareCashier')||name.startsWith('clearCustomer')||name.startsWith('buildCustomer')||
    name.startsWith('pickRandomCashier')||name.startsWith('shuffleCashier')||name.startsWith('foodOrderNeedsKitchen')||
    name.startsWith('finishCashier')||name.startsWith('showCashier')||
    name.startsWith('runCashier')||name.startsWith('afterCustomer')||name.startsWith('spawnNextTutorial')||
    name==='waitMs'||name==='releaseStuckUI') return 'cashier'
  if (name.startsWith('tray')||name.startsWith('getTray')||name.startsWith('isTray')||name.startsWith('clearTray')||
    name.startsWith('throwAwayTray')||name.startsWith('sendTray')||name.startsWith('pickUpTray')||name.startsWith('pickUpDirtyTray')||
    name.startsWith('placeTray')||name.startsWith('openTray')||name.startsWith('closeTray')||name.startsWith('handleTray')||
    name.startsWith('showTray')||name.startsWith('renderTray')||name.startsWith('updateTray')||name.startsWith('buildTray')||
    name.startsWith('ensureTray')||name.startsWith('moveTray')||name.startsWith('startTray')||name.startsWith('endTray')||
    name.startsWith('onTray')||name.startsWith('dockCarrierAfterTray')||name.startsWith('placeOnTray')||
    name.startsWith('putDownCarriersNotInTray')||
    ['cloneTrayData','carrierHasTrayFood','carrierShowsInTrayCloseup','syncTrayCashierAway'].includes(name)) return 'tray'
  if (name.startsWith('mud')||name.startsWith('spawnNight')||name.startsWith('clearMud')||name.startsWith('tryCleanMud')||
    name.startsWith('resetNight')||name.startsWith('shouldTriggerNight')||name.startsWith('ensureMud')||
    name.startsWith('getMud')||name.startsWith('generateMud')||name.startsWith('pickUpMop')||
    name.startsWith('putDownMop')||name.startsWith('moveMop')||name.startsWith('playNight')) return 'night'
  if (name.includes('Salt')||name.includes('Pepper')||name.includes('Shaker')||name.includes('Season')||name.includes('season')) return 'seasoning'
  if (name.startsWith('fridge')||name.startsWith('placeOnShelf')||name.startsWith('takeFromShelf')||
    name.startsWith('updateFridge')||name.startsWith('handleFridge')||name.startsWith('canTake')||
    name.startsWith('getFridge')||name.startsWith('isFridge')||name.startsWith('closeFridge')||name.startsWith('openFridge')) return 'fridge'
  if (name.startsWith('appliance')||name.startsWith('bindAppliance')||name.startsWith('closeAllAppliances')||name.startsWith('setAppliance')) return 'appliances'
  if (name.startsWith('showRecipe')) return 'recipeBook'
  if (name.startsWith('beginGame')||name.startsWith('finishNaming')||name.startsWith('showName')||
    name.startsWith('showMenu')||name.startsWith('startNewGame')||name.startsWith('beginPlaySession')||
    name.startsWith('updateStorefront')||name.startsWith('formatRestaurant')||name.startsWith('updateNameContinue')) return 'menu'
  if (name.startsWith('Sink')||name.startsWith('sink')||name.startsWith('Dishwasher')||name.startsWith('dishwasher')||
    name.startsWith('Cutting')||name.startsWith('cutting')||name.startsWith('Oven')||name.startsWith('oven')||
    name.startsWith('Microwave')||name.startsWith('microwave')||name.startsWith('Blender')||name.startsWith('blender')||
    name.startsWith('MeatBox')||name.startsWith('meatBox')||name.startsWith('placeIn')||name.startsWith('takeFrom')||
    name.startsWith('finishSink')||name.startsWith('finishDishwasher')||name.startsWith('finishCutting')||
    name.startsWith('finishBaking')||name.startsWith('finishMicrowave')||name.startsWith('finishBlender')||
    name.startsWith('startSink')||name.startsWith('startDishwasher')||name.startsWith('startCutting')||
    name.startsWith('startOven')||name.startsWith('startMicrowave')||name.startsWith('startBlender')||
    name.startsWith('clearSink')||name.startsWith('clearDishwasher')||name.startsWith('clearCutting')||
    name.startsWith('clearOven')||name.startsWith('clearMicrowave')||name.startsWith('clearBlender')||
    name.startsWith('placeOnCutting')||name.startsWith('placeInOven')||name.startsWith('placeInMicrowave')||
    name.startsWith('placeInBlender')||name.startsWith('placeInDishwasher')||
    name.startsWith('takeJuice')||name.startsWith('takeSoup')||name.startsWith('takeFlour')||name.startsWith('fillCupFromCooler')||
    name.startsWith('updateSink')||name.startsWith('updateDishwasher')||name.startsWith('updateCutting')||
    name.startsWith('updateOven')||name.startsWith('updateMicrowave')||name.startsWith('updateBlender')||
    name.startsWith('updateCooler')||name.startsWith('updateMeatBox')||name.startsWith('updateTrash')||
    name.startsWith('throwAwayFood')||name.startsWith('syncOven')||name.startsWith('syncMicrowave')||
    name==='isDirtyTrayReadyForDishwasher'||name==='wouldLoadInDishwasher') return 'kitchen'
  if (name.startsWith('mini')||name.startsWith('setFood')||name.startsWith('setSoup')||name.startsWith('setDrink')||
    name.startsWith('foodSlices')||name.startsWith('clearCup')||name.startsWith('clearBlender')||
    name.startsWith('clearPotSoup')||name.startsWith('clearBowl')||name.startsWith('syncBowl')||
    name.startsWith('findCounter')||name.startsWith('recipeResult')||name.startsWith('canCounterCombine')||
    name.startsWith('flashCounterCombo')) return 'icons'
  if (name.startsWith('counter')||name.startsWith('Counter')||name.startsWith('tryPlaceOnCounter')||
    name.startsWith('tryCombine')||name.startsWith('tryCounter')||name.startsWith('trySeason')||
    name.startsWith('restCarrier')||name.startsWith('liftCarrier')||name.startsWith('dockCarrier')||
    name.startsWith('positionCarrier')||name.startsWith('getCounter')||name.startsWith('getFollowingRest')||
    name.startsWith('syncCounter')||name.startsWith('updateCounter')||name.startsWith('carrierNeedsCounter')) return 'counter'
  return 'carriers'
}

const buckets = {
  setup: [], initCalls: [], wire: [],
  screens: [], icons: [], counter: [], carriers: [], tray: [], seasoning: [],
  kitchen: [], fridge: [], appliances: [], cashier: [], tutorial: [], gary: [], night: [], menu: [], recipeBook: [],
}

let currentFn = null
let currentMod = 'setup'
let seenFunction = false
let pending = []
let pendingDecl = false

function flushPending(nextMod) {
  if (!pending.length) return
  const text = pending.join('\n')
  if (text.includes('COUNTER_RECIPES')) {
    buckets[nextMod].push(...pending)
  } else {
    buckets.setup.push(...pending)
  }
  pending = []
  pendingDecl = false
}

function isTopLevelStatement(line) {
  if (!/^ {6}\S/.test(line)) return false
  if (/^ {6}(async )?function /.test(line)) return false
  if (/^ {6}\}/.test(line)) return false
  if (/^ {6}\/\/|^ {6}\/\*/.test(line)) return false
  return true
}

function isSetupDecl(line) {
  if (!/^ {4,6}(const|let) /.test(line)) return false
  if (/^ {4,6}const \w+ = (\(|async)/.test(line)) return false
  return true
}

function isDeclStart(line) {
  return isSetupDecl(line)
}

function isTopLevelWireLine(line) {
  return (
    /^ {6}(\w+|window|root|document)\.(addEventListener|querySelector)/.test(line) ||
    /^ {6}if \(/.test(line) ||
    /^ {6}RECIPE_BOOK/.test(line) ||
    /^ {6}for \(/.test(line)
  )
}

function isDeclContinuation(line) {
  if (!line.trim()) return pendingDecl
  if (!pendingDecl) return false
  if (isDeclStart(line)) return false
  if (/^ {6}(async )?function /.test(line)) return false
  if (isTopLevelWireLine(line)) return false
  if (isTopLevelInitCall(line)) return false
  return /^ {6,}/.test(line) || /^ {4}\S/.test(line)
}

function isTopLevelInitCall(line) {
  return /^ {6}[a-zA-Z_$][\w$]*\(\);?\s*$/.test(line)
}

for (const line of bodyLines) {
  const fnMatch = line.match(/^ {6}(?:async )?function (\w+)/)
  if (fnMatch) {
    const mod = moduleForFunction(fnMatch[1])
    if (!seenFunction) {
      flushPending('setup')
      seenFunction = true
    } else {
      flushPending(mod)
    }
    pendingDecl = false
    currentFn = fnMatch[1]
    currentMod = mod
    buckets[currentMod].push(line)
    continue
  }

  if (currentFn && isTopLevelStatement(line)) {
    currentFn = null
    currentMod = 'setup'
  }

  if (currentFn) {
    buckets[currentMod].push(line)
    continue
  }

  if (/^ {6}applyScreenLabels\(\);?\s*$/.test(line)) {
    buckets.initCalls.push(line)
    continue
  }

  if (isDeclStart(line)) {
    pendingDecl = true
    pending.push(line)
    continue
  }

  if (isDeclContinuation(line)) {
    pending.push(line)
    continue
  }

  if (pendingDecl) {
    flushPending('setup')
  }

  if (isTopLevelInitCall(line)) {
    buckets.initCalls.push(line)
    continue
  }

  buckets.wire.push(line)
}
flushPending('setup')

const foodNames = [
  'makeFood','isBasketFood','isMeatFood','isRawMeat','isSteakSandwich','isFrenchFries','isFrenchFriesPrep',
  'makeFrenchFries','isMeatWithTomato','isCookedMeatForSandwich','isMeatSeasoned','makeMeatWithTomato',
  'isCookedChoppedMeat','isPotatoSoupPrep','isPotatoMeatStewPrep','makePotatoMeatStew','isMeatStewNeedsPotatoes',
  'isMeatStewNeedsCarrots','isMeatStewPrep','addMeatStewPotatoes','addMeatStewCarrots','makeSteakSandwich',
  'isPlateFood','needsPineappleChopForOven','isOvenPlateInput','isBakedFood','foodLabel','bakeFoodFromInput',
  'makeDrink','isCupDrink','isCuttable','isBlenderInput','makePotSoup','isPotSoup','isPotSoupCold','makePotSoupMix',
  'isFinishedSoupPrep','isPotSoupSeasonedForMicrowave','isPotSoupReadyForMicrowave','isFinishedSoupComplete',
  'heatPotSoup','soupLabel','makeBowlFlour','makeBowlDough','makeBowlBatter','makeBowlMix','makePotStew',
  'isBowlFlour','isBowlDough','isBowlBatter','isBowlMix','isBowlItem','isPotStew','isPlateCut','cupHasDrink',
  'miniBowlHtml','bowlFillClass','bowlLabel','setBowlIcon',
]
const derivedNames = [
  'RECIPE_STEP_COUNTS','CASHIER_ORDER_DRINKS','TUTORIAL_COOLER_DRINKS','CASHIER_ORDER_SOUPS',
  'TUTORIAL_SOUPS','CASHIER_ORDER_FOODS','CASHIER_ORDER_COUNT_OPTIONS',
]

const fnNames = new Set()
for (const [key, lines] of Object.entries(buckets)) {
  if (key === 'setup' || key === 'initCalls' || key === 'wire') continue
  for (const line of lines) {
    const m = line.match(/^ {6}(?:async )?function (\w+)/)
    if (m) fnNames.add(m[1])
  }
}

const stateAndDom = new Set()
for (const line of [...buckets.setup, ...Object.values(buckets).flat()]) {
  let m = line.match(/^ {4,6}let (\w+)/)
  if (m) stateAndDom.add(m[1])
  m = line.match(/^ {4,6}const (\w+) =/)
  if (m) stateAndDom.add(m[1])
}

const gNames = new Set([
  'root','getEl', ...foodNames, ...derivedNames, ...fnNames, ...stateAndDom,
  'SCREEN_NAMES','MUD_PUDDLE_SCREENS','MUD_PUDDLE_MAX','MUD_FLOOR_ASPECT','TRAY_SLOTS','TRAY_STACK_MAX',
  'FOOD_SEASONING','SINK_WASH_SEC','DISHWASHER_WASH_SEC','BLENDER_BLEND_SEC','CUT_SEC','OVEN_BAKE_SEC',
  'MICROWAVE_HEAT_SEC','RECIPE_BOOK','DRINK_LABELS','TUTORIAL_ORDER_SEQUENCE','GARY_TYPE_MS','GARY_READ_MS',
  'FRIDGE_ANIM_MS','APPLIANCE_ANIM_MS','CASHIER_DOOR_MS','CASHIER_WALK_MS','CASHIER_EXIT_MS',
  'CUSTOMERS_PER_NIGHT','NIGHT_BANNER_HOLD_MS','CASHIER_INTRO_HOLD_MS','START_WHITE_MS','NAME_FADE_MS',
  'RESTAURANT_NAME_MAX','GARY_INTRO_TEXT','GARY_DRINK_DONE_TEXT','GARY_TRAY_WASH_TEXT','GARY_DISHWASH_TEXT',
  'GARY_NIGHT_CLOSED_TEXT','COUNTER_RECIPES',
  'customerClassNames','customerFigureMarkup','randomCafeteriaSeat','randomCustomerLook','cashierCatalogItemWeight',
])

function protectStrings(code) {
  const saved = []
  const protectedCode = code.replace(
    /(`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g,
    (m) => {
      saved.push(m)
      return `\0STR${saved.length - 1}\0`
    },
  )
  return { protectedCode, saved }
}

function restoreStrings(code, saved) {
  return code.replace(/\0STR(\d+)\0/g, (_, i) => saved[Number(i)])
}

function protectObjectKeys(code, ids) {
  let out = code
  for (const id of ids) {
    out = out.replace(new RegExp(`([{,]\\s*)${id}(\\s*:)`, 'g'), `$1__KEY_${id}__$2`)
  }
  return out
}

function restoreObjectKeys(code) {
  return code.replace(/__KEY_(\w+)__/g, '$1')
}

function protectInlineArrowLines(code, gNameSet) {
  return code.split('\n').map((line) => {
    const arrowMatch = line.match(/\(([^)]*)\)\s*=>\s*/)
    if (!arrowMatch) return line
    const paramNames = arrowMatch[1]
      .split(',')
      .map((x) => x.trim().replace(/=.*$/, ''))
      .filter((n) => n && n !== '_' && gNameSet.has(n))
    if (!paramNames.length) return line
    let out = line
    for (const name of paramNames) {
      out = out.replace(new RegExp(`\\b${name}\\b`, 'g'), `__PARAM_${name}__`)
    }
    return out
  }).join('\n')
}

function protectParams(code, ids) {
  let out = code
  out = out.replace(/\(([^)]*)\)\s*=>/g, (_full, params) => {
    let protectedParams = params
    for (const id of ids) {
      protectedParams = protectedParams.replace(new RegExp(`\\b${id}\\b`, 'g'), `__PARAM_${id}__`)
    }
    return `(${protectedParams}) =>`
  })
  out = out.replace(/function (\w+)\(([^)]*)\)/g, (_full, name, params) => {
    let protectedParams = params
    for (const id of ids) {
      protectedParams = protectedParams.replace(new RegExp(`\\b${id}\\b`, 'g'), `__PARAM_${id}__`)
    }
    return `function ${name}(${protectedParams})`
  })
  return out
}

function restoreParams(code) {
  return code.replace(/__PARAM_(\w+)__/g, '$1')
}

function transformCode(code) {
  if (!code.trim()) return ''
  const { protectedCode, saved } = protectStrings(code)
  const ids = [...gNames].sort((a, b) => b.length - a.length)
  let out = protectObjectKeys(protectedCode, ids)
  out = protectInlineArrowLines(out, gNames)
  out = protectParams(out, ids)
  out = out.replace(/^ {4,6}(async )?function (\w+)/gm, (_, asyncKw, name) =>
    asyncKw ? `  g.${name} = async function` : `  g.${name} = function`)
  out = out.replace(/^ {4,6}let (\w+)/gm, '  g.$1')
  out = out.replace(/^ {4,6}const (\w+) =/gm, '  g.$1 =')
  for (const id of ids) {
    out = out.replace(new RegExp(`(?<![.$\\w])${id}\\b`, 'g'), (match, offset, str) => {
      if (str.slice(Math.max(0, offset - 2), offset) === 'g.') return match
      return `g.${id}`
    })
  }
  out = out.replace(/g\.g\./g, 'g.')
  out = restoreParams(out)
  out = restoreObjectKeys(out)
  return restoreStrings(out, saved)
}

fs.mkdirSync(modulesDir, { recursive: true })

const moduleOrder = [
  'screens','icons','counter','carriers','tray','seasoning','kitchen','fridge','appliances',
  'cashier','tutorial','gary','night','menu','recipeBook',
]

for (const mod of moduleOrder) {
  const chunk = buckets[mod].join('\n')
  if (!chunk.trim()) continue
  fs.writeFileSync(
    path.join(modulesDir, `${mod}.ts`),
    `// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attach${mod.charAt(0).toUpperCase() + mod.slice(1)}(g: GameRuntime) {
${transformCode(chunk)}
}
`,
  )
  console.log('wrote', mod, buckets[mod].length, 'lines')
}

const setupTransformed = transformCode(buckets.setup.join('\n'))
fs.writeFileSync(
  path.join(logicDir, 'runtime.ts'),
  `// @ts-nocheck
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
${setupTransformed}
  return g
}
`,
)

fs.writeFileSync(
  path.join(modulesDir, 'wireEvents.ts'),
  `// @ts-nocheck
import type { GameRuntime } from '../runtime'

export function attachWireEvents(g: GameRuntime) {
${transformCode(buckets.wire.join('\n'))}
}
`,
)

fs.writeFileSync(
  path.join(logicDir, 'initCalls.ts'),
  `// @ts-nocheck
import type { GameRuntime } from './runtime'

export function runInitCalls(g: GameRuntime) {
${transformCode(buckets.initCalls.join('\n'))}
}
`,
)

console.log('setup', buckets.setup.length, 'wire', buckets.wire.length, 'init', buckets.initCalls.length)

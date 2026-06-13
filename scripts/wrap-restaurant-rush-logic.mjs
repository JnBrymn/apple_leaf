/**
 * Wrap gameLogic.raw.js as a container-scoped module.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const engineDir = path.join(__dirname, '../src/games/restaurant-rush/engine')
const rawPath = path.join(engineDir, 'gameLogic.raw.js')
const cssPath = path.join(__dirname, '../src/games/restaurant-rush/restaurant-rush.global.css')

let raw = fs.readFileSync(rawPath, 'utf8')

function stripConst(name) {
  const marker = `const ${name} =`
  const start = raw.indexOf(marker)
  if (start === -1) return
  let i = start + marker.length
  while (raw[i] === ' ') i++
  if (raw.slice(i, i + 4) === 'new ') {
    const newStart = i
    i += 4
    while (raw[i] === ' ') i++
    if (raw.slice(i, i + 4) === 'Set(') {
      let depth = 0
      for (let j = i + 3; j < raw.length; j++) {
        if (raw[j] === '(') depth++
        else if (raw[j] === ')') {
          depth--
          if (depth === 0) {
            j++
            if (raw[j] === ';') j++
            if (raw[j] === '\r') j++
            if (raw[j] === '\n') j++
            raw = raw.slice(0, start) + raw.slice(j)
            return
          }
        }
      }
      return
    }
  }
  const open = raw[i]
  if (open !== '{' && open !== '[' && open !== '(') {
    const rel = raw.slice(i).search(/;\r?\n/)
    if (rel === -1) return
    raw = raw.slice(0, start) + raw.slice(i + rel + (raw[i + rel + 1] === '\r' ? 3 : 2))
    return
  }
  const pairs = { '{': '}', '[': ']', '(': ')' }
  const close = pairs[open]
  let depth = 0
  let j = i
  for (; j < raw.length; j++) {
    const ch = raw[j]
    if (ch === open) depth++
    else if (ch === close) {
      depth--
      if (depth === 0) {
        j++
        while (raw[j] === ' ') j++
        if (raw[j] === ';') j++
        if (raw[j] === '\r') j++
        if (raw[j] === '\n') j++
        raw = raw.slice(0, start) + raw.slice(j)
        return
      }
    }
  }
}

const importedConsts = [
  'SCREEN_NAMES',
  'MUD_PUDDLE_SCREENS',
  'MUD_PUDDLE_MAX',
  'MUD_FLOOR_ASPECT',
  'TRAY_SLOTS',
  'TRAY_STACK_MAX',
  'FOOD_SEASONING',
  'SINK_WASH_SEC',
  'DISHWASHER_WASH_SEC',
  'BLENDER_BLEND_SEC',
  'CUT_SEC',
  'OVEN_BAKE_SEC',
  'MICROWAVE_HEAT_SEC',
  'CUTTABLE_CROPS',
  'BLENDER_JUICE_CROPS',
  'BLENDER_SOUP_CROPS',
  'OVEN_CROPS',
  'RECIPE_BOOK',
  'DRINK_LABELS',
  'SOUP_LABELS',
  'BOWL_LABELS',
  'STEW_LABELS',
  'CASHIER_DRINK_LABELS',
  'TUTORIAL_ORDER_SEQUENCE',
  'GARY_TYPE_MS',
  'GARY_READ_MS',
  'FRIDGE_ANIM_MS',
  'APPLIANCE_ANIM_MS',
  'CASHIER_DOOR_MS',
  'CASHIER_WALK_MS',
  'CASHIER_EXIT_MS',
  'CUSTOMERS_PER_NIGHT',
  'NIGHT_BANNER_HOLD_MS',
  'CASHIER_INTRO_HOLD_MS',
  'START_WHITE_MS',
  'NAME_FADE_MS',
  'RESTAURANT_NAME_MAX',
]

const derivedConsts = [
  'RECIPE_STEP_COUNTS',
  'CASHIER_ORDER_DRINKS',
  'TUTORIAL_COOLER_DRINKS',
  'CASHIER_ORDER_SOUPS',
  'TUTORIAL_SOUPS',
  'CASHIER_ORDER_FOODS',
  'CASHIER_ORDER_COUNT_OPTIONS',
]

for (const name of [...importedConsts, ...derivedConsts]) {
  stripConst(name)
}

raw = raw.replace(
  /\n\s*function countRecipeSteps\(steps\) \{[\s\S]*?\n\s*\}\n/,
  '\n',
)

raw = raw.replace(
  'root.addEventListener("keydown", (e) => {',
  'const onRecipeEscape = (e) => {',
)
raw = raw.replace(
  /const onRecipeEscape = \(e\) => \{[\s\S]*?showRecipeList\(\);\s*\}\);/,
  (block) => block.replace(/\}\);$/, '};\n  window.addEventListener("keydown", onRecipeEscape);'),
)

const importBlock = `import {
  SCREEN_NAMES,
  MUD_PUDDLE_SCREENS,
  MUD_PUDDLE_MAX,
  MUD_FLOOR_ASPECT,
  TRAY_SLOTS,
  TRAY_STACK_MAX,
  FOOD_SEASONING,
  SINK_WASH_SEC,
  DISHWASHER_WASH_SEC,
  BLENDER_BLEND_SEC,
  CUT_SEC,
  OVEN_BAKE_SEC,
  MICROWAVE_HEAT_SEC,
  CUTTABLE_CROPS,
  BLENDER_JUICE_CROPS,
  BLENDER_SOUP_CROPS,
  OVEN_CROPS,
  RECIPE_BOOK,
  DRINK_LABELS,
  SOUP_LABELS,
  BOWL_LABELS,
  STEW_LABELS,
  CASHIER_DRINK_LABELS,
  TUTORIAL_ORDER_SEQUENCE,
  GARY_TYPE_MS,
  GARY_READ_MS,
  FRIDGE_ANIM_MS,
  APPLIANCE_ANIM_MS,
  CASHIER_DOOR_MS,
  CASHIER_WALK_MS,
  CASHIER_EXIT_MS,
  CUSTOMERS_PER_NIGHT,
  NIGHT_BANNER_HOLD_MS,
  CASHIER_INTRO_HOLD_MS,
  START_WHITE_MS,
  NAME_FADE_MS,
  RESTAURANT_NAME_MAX,
} from './constants'
import { buildDerivedConstants } from './derivedConstants'
`

const header = `// @ts-nocheck
${importBlock}

export function runGameLogic(
  root: HTMLElement,
  getEl: (id: string) => HTMLElement | null,
): () => void {
  const {
    RECIPE_STEP_COUNTS,
    CASHIER_ORDER_DRINKS,
    TUTORIAL_COOLER_DRINKS,
    CASHIER_ORDER_SOUPS,
    TUTORIAL_SOUPS,
    CASHIER_ORDER_FOODS,
    CASHIER_ORDER_COUNT_OPTIONS,
  } = buildDerivedConstants()
`

const footer = `
  return () => {
    window.removeEventListener('keydown', onRecipeEscape)
  }
}
`

const body = raw.replace(/^const screens = /, '  const screens = ')
const indented = body
  .split('\n')
  .map((line) => (line.length ? '  ' + line : line))
  .join('\n')

fs.writeFileSync(path.join(engineDir, 'gameLogic.ts'), header + indented + footer)

let css = fs.readFileSync(cssPath, 'utf8')
css = css.replace(/position:\s*fixed/g, 'position: absolute')
if (!css.includes('.gameShell')) {
  css =
    `.gameShell {
  position: relative;
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: hidden;
}

.root {
  position: absolute;
  inset: 0;
}

` + css
}
fs.writeFileSync(cssPath, css)

console.log('Wrapped gameLogic.ts')

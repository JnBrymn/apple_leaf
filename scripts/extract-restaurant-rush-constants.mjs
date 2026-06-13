/**
 * Extract typed constants from legacy gameLogic.raw.js
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rawPath = path.join(__dirname, '../src/games/restaurant-rush/engine/gameLogic.raw.js')
const raw = fs.readFileSync(rawPath, 'utf8')

function extractConst(name) {
  const marker = `const ${name} =`
  const start = raw.indexOf(marker)
  if (start === -1) throw new Error(`Missing ${name}`)
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
          if (depth === 0) return raw.slice(newStart, j + 1)
        }
      }
      throw new Error(`Unclosed Set for ${name}`)
    }
  }
  const open = raw[i]
  if (open !== '{' && open !== '[' && open !== '(') {
    const end = raw.slice(i).search(/;\r?\n/)
    if (end === -1) throw new Error(`No terminator for ${name}`)
    return raw.slice(i, i + end).trim()
  }
  const pairs = { '{': '}', '[': ']', '(': ')' }
  const close = pairs[open]
  let depth = 0
  for (let j = i; j < raw.length; j++) {
    const ch = raw[j]
    if (ch === open) depth++
    else if (ch === close) {
      depth--
      if (depth === 0) return raw.slice(i, j + 1)
    }
  }
  throw new Error(`Unclosed ${name}`)
}

const names = [
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

const values = {}
const sandbox = {}
const ctx = vm.createContext(sandbox)
for (const name of names) {
  const expr = extractConst(name)
  const wrapped = expr.startsWith('new Set') ? expr : `(${expr})`
  values[name] = vm.runInContext(wrapped, ctx)
}

const out = `// Auto-generated — re-run scripts/extract-restaurant-rush-constants.mjs after legacy changes
import type { RecipeEntry, ScreenNames } from './types'

export const SCREEN_NAMES: ScreenNames = ${JSON.stringify(values.SCREEN_NAMES, null, 2)}

export const MUD_PUDDLE_SCREENS = ${JSON.stringify(values.MUD_PUDDLE_SCREENS)} as const
export const MUD_PUDDLE_MAX = ${values.MUD_PUDDLE_MAX}
export const MUD_FLOOR_ASPECT = ${values.MUD_FLOOR_ASPECT}

export const TRAY_SLOTS = ${JSON.stringify(values.TRAY_SLOTS)} as const
export const TRAY_STACK_MAX = ${values.TRAY_STACK_MAX}

export const FOOD_SEASONING: Record<string, { salt?: boolean; pepper?: boolean }> = ${JSON.stringify(values.FOOD_SEASONING, null, 2)}

export const SINK_WASH_SEC = ${values.SINK_WASH_SEC}
export const DISHWASHER_WASH_SEC = ${values.DISHWASHER_WASH_SEC}
export const BLENDER_BLEND_SEC = ${values.BLENDER_BLEND_SEC}
export const CUT_SEC = ${values.CUT_SEC}
export const OVEN_BAKE_SEC = ${values.OVEN_BAKE_SEC}
export const MICROWAVE_HEAT_SEC = ${values.MICROWAVE_HEAT_SEC}

export const CUTTABLE_CROPS = new Set(${JSON.stringify([...values.CUTTABLE_CROPS])})
export const BLENDER_JUICE_CROPS = new Set(${JSON.stringify([...values.BLENDER_JUICE_CROPS])})
export const BLENDER_SOUP_CROPS = new Set(${JSON.stringify([...values.BLENDER_SOUP_CROPS])})
export const OVEN_CROPS = new Set(${JSON.stringify([...values.OVEN_CROPS])})

export const RECIPE_BOOK: RecipeEntry[] = ${JSON.stringify(values.RECIPE_BOOK, null, 2)}

export const DRINK_LABELS: Record<string, string> = ${JSON.stringify(values.DRINK_LABELS, null, 2)}
export const SOUP_LABELS: Record<string, string> = ${JSON.stringify(values.SOUP_LABELS, null, 2)}
export const BOWL_LABELS: Record<string, string> = ${JSON.stringify(values.BOWL_LABELS, null, 2)}
export const STEW_LABELS: Record<string, string> = ${JSON.stringify(values.STEW_LABELS, null, 2)}
export const CASHIER_DRINK_LABELS: Record<string, string> = ${JSON.stringify(values.CASHIER_DRINK_LABELS, null, 2)}

export const TUTORIAL_ORDER_SEQUENCE = ${JSON.stringify(values.TUTORIAL_ORDER_SEQUENCE)} as const

export const GARY_TYPE_MS = ${values.GARY_TYPE_MS}
export const GARY_READ_MS = ${values.GARY_READ_MS}
export const FRIDGE_ANIM_MS = ${values.FRIDGE_ANIM_MS}
export const APPLIANCE_ANIM_MS = ${values.APPLIANCE_ANIM_MS}

export const CASHIER_DOOR_MS = ${values.CASHIER_DOOR_MS}
export const CASHIER_WALK_MS = ${values.CASHIER_WALK_MS}
export const CASHIER_EXIT_MS = ${values.CASHIER_EXIT_MS}
export const CUSTOMERS_PER_NIGHT = ${values.CUSTOMERS_PER_NIGHT}
export const NIGHT_BANNER_HOLD_MS = ${values.NIGHT_BANNER_HOLD_MS}
export const CASHIER_INTRO_HOLD_MS = ${values.CASHIER_INTRO_HOLD_MS}

export const START_WHITE_MS = ${values.START_WHITE_MS}
export const NAME_FADE_MS = ${values.NAME_FADE_MS}
export const RESTAURANT_NAME_MAX = ${values.RESTAURANT_NAME_MAX}
`

fs.writeFileSync(path.join(__dirname, '../src/games/restaurant-rush/engine/constants.ts'), out)
console.log('Wrote constants.ts')

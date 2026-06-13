// Auto-generated — re-run scripts/extract-restaurant-rush-constants.mjs after legacy changes
import type { RecipeEntry, ScreenNames } from './types'

export const SCREEN_NAMES: ScreenNames = {
  "1": "Garden",
  "2": "Kitchen 1",
  "3": "Kitchen 2",
  "4": "Storefront",
  "5": "Cashier",
  "6": "Cafeteria"
}

export const MUD_PUDDLE_SCREENS = [2,3,6] as const
export const MUD_PUDDLE_MAX = 4
export const MUD_FLOOR_ASPECT = 0.22

export const TRAY_SLOTS = ["soup","drink","food","extra"] as const
export const TRAY_STACK_MAX = 4

export const FOOD_SEASONING: Record<string, { salt?: boolean; pepper?: boolean }> = {
  "plate:meat:raw": {
    "salt": true,
    "pepper": true
  },
  "plate:meat:cut": {
    "salt": true,
    "pepper": true
  },
  "pot:carrots:cold": {
    "salt": true,
    "pepper": true
  },
  "pot:cucumbers:cold": {
    "salt": true,
    "pepper": true
  },
  "pot:potato-soup-prep": {
    "salt": true,
    "pepper": true
  },
  "pot:meat-potato-soup-prep": {
    "salt": true,
    "pepper": true
  },
  "pot:meat-stew-prep": {
    "salt": true,
    "pepper": true
  },
  "pot:tomato-soup-prep": {
    "salt": true,
    "pepper": true
  },
  "plate:french-fries:prep": {
    "salt": true
  }
}

export const SINK_WASH_SEC = 3
export const DISHWASHER_WASH_SEC = 3
export const BLENDER_BLEND_SEC = 3
export const CUT_SEC = 3
export const OVEN_BAKE_SEC = 4
export const MICROWAVE_HEAT_SEC = 3

export const CUTTABLE_CROPS = new Set(["apples","pineapple","carrots","cucumbers","tomatoes","potatoes"])
export const BLENDER_JUICE_CROPS = new Set(["grapes","apples","pineapple"])
export const BLENDER_SOUP_CROPS = new Set(["carrots","cucumbers","potatoes","tomatoes"])
export const OVEN_CROPS = new Set(["apples","grapes","pineapple","tomatoes","carrots","potatoes","cucumbers","beans","meat"])

export const RECIPE_BOOK: RecipeEntry[] = [
  {
    "id": "bread",
    "name": "Bread",
    "steps": "Wheat + Blender + Water + Oven"
  },
  {
    "id": "baked-apples",
    "name": "Baked apple",
    "steps": "Apples + Oven"
  },
  {
    "id": "baked-grapes",
    "name": "Baked grapes",
    "steps": "Grapes + Oven"
  },
  {
    "id": "baked-pineapple",
    "name": "Baked pineapple",
    "steps": "(Pineapple + Cutting board) + Oven"
  },
  {
    "id": "baked-tomatoes",
    "name": "Baked tomato",
    "steps": "Tomatoes + Oven"
  },
  {
    "id": "baked-carrots",
    "name": "Baked carrot",
    "steps": "Carrots + Oven"
  },
  {
    "id": "baked-potatoes",
    "name": "Baked potato",
    "steps": "Potatoes + Oven"
  },
  {
    "id": "french-fries",
    "name": "French fries",
    "steps": "Potatoes + Cutting board + Oven + Salt"
  },
  {
    "id": "baked-cucumbers",
    "name": "Baked cucumber",
    "steps": "Cucumbers + Oven"
  },
  {
    "id": "baked-beans",
    "name": "Baked beans",
    "steps": "Beans + Oven"
  },
  {
    "id": "cut-apples",
    "name": "Chopped apples",
    "steps": "Apples + Cutting board"
  },
  {
    "id": "cut-pineapple",
    "name": "Chopped pineapple",
    "steps": "Pineapple + Cutting board"
  },
  {
    "id": "cut-carrots",
    "name": "Chopped carrots",
    "steps": "Carrots + Cutting board"
  },
  {
    "id": "cut-cucumbers",
    "name": "Chopped cucumbers",
    "steps": "Cucumbers + Cutting board"
  },
  {
    "id": "cut-tomatoes",
    "name": "Chopped tomatoes",
    "steps": "Tomatoes + Cutting board"
  },
  {
    "id": "juice-grapes",
    "name": "Grape juice",
    "steps": "Grapes + Blender"
  },
  {
    "id": "juice-apples",
    "name": "Apple juice",
    "steps": "Apples + Blender"
  },
  {
    "id": "juice-pineapple",
    "name": "Pineapple juice",
    "steps": "Pineapple + Blender"
  },
  {
    "id": "carrot-soup",
    "name": "Carrot Soup",
    "steps": "Carrots + Blender + Salt + Pepper + Microwave"
  },
  {
    "id": "cucumber-soup",
    "name": "Cucumber Soup",
    "steps": "Cucumbers + Blender + Salt + Pepper + Microwave"
  },
  {
    "id": "potato-soup",
    "name": "Potato Soup",
    "steps": "Potatoes + Blender + (Carrots + Cutting board) + Salt + Pepper + Microwave"
  },
  {
    "id": "tomato-soup",
    "name": "Tomato Soup",
    "steps": "Tomatoes + Blender + (Tomatoes + Cutting board) + Salt + Pepper + Microwave"
  },
  {
    "id": "cooked-meat",
    "name": "Cooked meat",
    "steps": "MEAT + Oven"
  },
  {
    "id": "chopped-cooked-meat",
    "name": "Chopped & cooked meat",
    "steps": "(MEAT + Cutting board) + Oven"
  },
  {
    "id": "seasoned-steak",
    "name": "Seasoned steak",
    "steps": "(MEAT + Salt + Pepper) + Oven"
  },
  {
    "id": "steak-sandwich",
    "name": "Steak sandwich",
    "steps": "(Wheat + Blender + Water + Oven) + (MEAT + Oven) + (Tomatoes + Cutting board)"
  },
  {
    "id": "meat-potato-stew",
    "name": "Meat & potato stew",
    "steps": "Potatoes + Blender + (Carrots + Cutting board) + (MEAT + Cutting board) + Oven + Salt + Pepper + Microwave"
  },
  {
    "id": "meat-stew",
    "name": "Meat stew",
    "steps": "MEAT + Blender + (Potatoes + Cutting board) + (Carrots + Cutting board) + Salt + Pepper + Microwave"
  }
]

export const DRINK_LABELS: Record<string, string> = {
  "water": "Water",
  "milk": "Milk",
  "sprite": "Sprite",
  "rootbeer": "Root",
  "coke": "Coke",
  "lemonade": "Lemon",
  "juice-grapes": "Grape",
  "juice-apples": "Apple",
  "juice-pineapple": "Pine"
}
export const SOUP_LABELS: Record<string, string> = {
  "carrots": "Carrot",
  "cucumbers": "Cuke",
  "potatoes": "Potato",
  "tomatoes": "Tomato",
  "meat": "Meat"
}
export const BOWL_LABELS: Record<string, string> = {
  "flour": "Flour",
  "dough": "Dough",
  "batter": "Batter",
  "mix-apples": "Apple mix",
  "mix-pineapple": "Fruit mix"
}
export const STEW_LABELS: Record<string, string> = {
  "carrots": "Stew",
  "cucumbers": "Stew",
  "potatoes": "Chowder",
  "tomatoes": "Stew"
}
export const CASHIER_DRINK_LABELS: Record<string, string> = {
  "water": "Water",
  "milk": "Milk",
  "sprite": "Sprite",
  "rootbeer": "Root beer",
  "coke": "Coke",
  "lemonade": "Lemonade",
  "juice-grapes": "Grape juice",
  "juice-apples": "Apple juice",
  "juice-pineapple": "Pineapple juice"
}

export const TUTORIAL_ORDER_SEQUENCE = ["food","drink","soup"] as const

export const GARY_TYPE_MS = 34
export const GARY_READ_MS = 1400
export const FRIDGE_ANIM_MS = 520
export const APPLIANCE_ANIM_MS = 500

export const CASHIER_DOOR_MS = 560
export const CASHIER_WALK_MS = 1000
export const CASHIER_EXIT_MS = 1100
export const CUSTOMERS_PER_NIGHT = 1
export const NIGHT_BANNER_HOLD_MS = 2400
export const CASHIER_INTRO_HOLD_MS = 1000

export const START_WHITE_MS = 1800
export const NAME_FADE_MS = 1800
export const RESTAURANT_NAME_MAX = 10

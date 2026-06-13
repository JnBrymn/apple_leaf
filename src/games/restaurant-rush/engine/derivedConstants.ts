import {
  CASHIER_DRINK_LABELS,
  RECIPE_BOOK,
} from './constants'

function countRecipeSteps(steps: string): number {
  const flat = steps.replace(/[()]/g, '')
  return flat
    .split(' + ')
    .map((part) => part.trim())
    .filter(Boolean).length
}

export function buildDerivedConstants() {
  const RECIPE_STEP_COUNTS = Object.fromEntries(
    RECIPE_BOOK.map((r) => [r.id, countRecipeSteps(r.steps)]),
  )

  const CASHIER_ORDER_DRINKS = Object.keys(CASHIER_DRINK_LABELS).map((drink) => ({
    kind: 'drink' as const,
    drink,
    label: CASHIER_DRINK_LABELS[drink],
  }))

  const TUTORIAL_COOLER_DRINKS = CASHIER_ORDER_DRINKS.filter(
    (item) => !item.drink.startsWith('juice-'),
  )

  const CASHIER_ORDER_SOUPS = [
    { kind: 'soup' as const, recipe: 'carrot', label: 'Carrot soup' },
    { kind: 'soup' as const, recipe: 'cucumber', label: 'Cucumber soup' },
    { kind: 'soup' as const, recipe: 'potato', label: 'Potato soup' },
    { kind: 'soup' as const, recipe: 'meat-potato', label: 'Meat & potato stew' },
    { kind: 'soup' as const, recipe: 'meat-stew', label: 'Meat stew' },
    { kind: 'soup' as const, recipe: 'tomato', label: 'Tomato soup' },
  ]

  const TUTORIAL_SOUPS = CASHIER_ORDER_SOUPS.filter(
    (item) => item.recipe !== 'meat-potato' && item.recipe !== 'meat-stew',
  )

  const CASHIER_ORDER_FOODS = [
    { kind: 'food' as const, crop: 'bread', state: 'baked', label: 'Bread' },
    { kind: 'food' as const, crop: 'apples', state: 'baked', label: 'Baked apple' },
    { kind: 'food' as const, crop: 'grapes', state: 'baked', label: 'Baked grapes' },
    {
      kind: 'food' as const,
      crop: 'pineapple',
      state: 'baked',
      wasCut: true,
      label: 'Baked pineapple',
    },
    { kind: 'food' as const, crop: 'tomatoes', state: 'baked', label: 'Baked tomato' },
    { kind: 'food' as const, crop: 'carrots', state: 'baked', label: 'Baked carrot' },
    { kind: 'food' as const, crop: 'potatoes', state: 'baked', label: 'Baked potato' },
    { kind: 'food' as const, crop: 'french-fries', state: 'ready', label: 'French fries' },
    { kind: 'food' as const, crop: 'cucumbers', state: 'baked', label: 'Baked cucumber' },
    { kind: 'food' as const, crop: 'beans', state: 'baked', label: 'Baked beans' },
    { kind: 'food' as const, crop: 'carrots', state: 'cut', label: 'Chopped carrots' },
    { kind: 'food' as const, crop: 'cucumbers', state: 'cut', label: 'Chopped cucumbers' },
    { kind: 'food' as const, crop: 'tomatoes', state: 'cut', label: 'Chopped tomatoes' },
    { kind: 'food' as const, crop: 'apples', state: 'cut', label: 'Chopped apples' },
    { kind: 'food' as const, crop: 'pineapple', state: 'cut', label: 'Chopped pineapple' },
    { kind: 'food' as const, crop: 'meat', state: 'baked', label: 'Cooked meat' },
    {
      kind: 'food' as const,
      crop: 'meat',
      state: 'baked',
      wasCut: true,
      label: 'Chopped & cooked meat',
    },
    {
      kind: 'food' as const,
      crop: 'meat',
      state: 'baked',
      salted: true,
      peppered: true,
      label: 'Seasoned steak',
    },
    { kind: 'food' as const, crop: 'steak-sandwich', state: 'ready', label: 'Steak sandwich' },
  ]

  const CASHIER_ORDER_COUNT_OPTIONS = (() => {
    const opts: Array<{ drink: number; soup: number; food: number }> = []
    for (let d = 1; d <= 2; d++) {
      for (let s = 0; s <= 2; s++) {
        for (let f = 0; f <= 2; f++) {
          const total = d + s + f
          if (total < 2 || total > 4) continue
          if (s + f < 1) continue
          opts.push({ drink: d, soup: s, food: f })
        }
      }
    }
    return opts
  })()

  return {
    RECIPE_STEP_COUNTS,
    CASHIER_ORDER_DRINKS,
    TUTORIAL_COOLER_DRINKS,
    CASHIER_ORDER_SOUPS,
    TUTORIAL_SOUPS,
    CASHIER_ORDER_FOODS,
    CASHIER_ORDER_COUNT_OPTIONS,
  }
}

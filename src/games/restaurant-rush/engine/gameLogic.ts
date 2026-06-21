// @ts-nocheck
import * as gameConstants from './constants'
import { buildDerivedConstants } from './derivedConstants'
import {
  customerClassNames,
  customerFigureMarkup,
  randomCafeteriaSeat,
  randomCustomerLook,
} from './logic/customerMarkup'
import { cashierCatalogItemWeight } from './logic/recipeCatalog'
import * as foodModel from './logic/foodModel'
import { runInitCalls } from './logic/initCalls'
import { createRuntime } from './logic/runtime'
import { attachAppliances } from './logic/modules/appliances'
import { attachCarriers } from './logic/modules/carriers'
import { attachCashier } from './logic/modules/cashier'
import { attachCounter } from './logic/modules/counter'
import { attachFridge } from './logic/modules/fridge'
import { attachGary } from './logic/modules/gary'
import { attachIcons } from './logic/modules/icons'
import { attachKitchen } from './logic/modules/kitchen'
import { attachMenu } from './logic/modules/menu'
import { attachNight } from './logic/modules/night'
import { attachRecipeBook } from './logic/modules/recipeBook'
import { attachScreens } from './logic/modules/screens'
import { attachSeasoning } from './logic/modules/seasoning'
import { attachTray } from './logic/modules/tray'
import { attachTutorial } from './logic/modules/tutorial'
import { attachWireEvents } from './logic/modules/wireEvents'

export function runGameLogic(
  root: HTMLElement,
  getEl: (id: string) => HTMLElement | null,
): () => void {
  const derived = buildDerivedConstants()
  const helpers = {
    customerClassNames,
    customerFigureMarkup,
    randomCafeteriaSeat,
    randomCustomerLook,
    cashierCatalogItemWeight,
  }
  const g = createRuntime(root, getEl, gameConstants, derived, foodModel, helpers)

  attachScreens(g)
  attachIcons(g)
  attachCounter(g)
  attachCarriers(g)
  attachTray(g)
  attachSeasoning(g)
  attachKitchen(g)
  attachFridge(g)
  attachAppliances(g)
  attachCashier(g)
  attachTutorial(g)
  attachGary(g)
  attachNight(g)
  attachMenu(g)
  attachRecipeBook(g)
  attachWireEvents(g)
  runInitCalls(g)

  return () => {
    window.removeEventListener('keydown', g.onRecipeEscape)
  }
}

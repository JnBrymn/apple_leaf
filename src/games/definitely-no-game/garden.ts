import type { GameState, GameUI } from './types'

function nearPoint(x: number, y: number, el: HTMLElement, pad = 0.55): boolean {
  const r = el.getBoundingClientRect()
  const cx = r.left + r.width / 2
  const cy = r.top + r.height / 2
  return Math.hypot(x - cx, y - cy) < Math.max(r.width, r.height) * pad
}

export const Garden = {
  initAfterTrophy(state: GameState, ui: GameUI) {
    state.hasTrophy = true
    state.trophyFull = false
    state.plantWatered = false
    state.treeReady = false
    state.appleDropped = false
    state.appleReady = false
    state.hasApple = false
    state.appleFedToBot = false
    state.hasAppleCore = false
    state.appleCoreTrashed = false
    state.gardenPhase = true

    ui.showScene(3)
    ui.showGardenMode()
    ui.narrate('leak', 0)
    setTimeout(() => ui.narrate('leak', 1), 2400)
  },

  onTrophyDropped(state: GameState, ui: GameUI, x: number, y: number, leakEl: HTMLElement | null) {
    if (!state.gardenPhase || state.trophyFull || !leakEl) return
    if (!nearPoint(x, y, leakEl, 0.7)) return

    state.trophyFull = true
    ui.setTrophyWater(100)
    ui.narrate('trophyFull', 0)
    setTimeout(() => ui.narrate('trophyFull', 1), 2200)
  },

  onPourPlant(
    state: GameState,
    ui: GameUI,
    x: number,
    y: number,
    potEl: HTMLElement | null,
  ): boolean {
    if (!state.gardenPhase || !state.trophyFull || state.plantWatered || !potEl) return false
    if (!nearPoint(x, y, potEl, 0.65)) return false

    state.plantWatered = true
    state.treeReady = true
    ui.setTrophyWater(0)
    ui.growTree()
    ui.narrate('plantGrow', 0)
    setTimeout(() => ui.narrate('plantGrow', 1), 2000)
    return true
  },

  onTreeTap(state: GameState, ui: GameUI) {
    if (!state.treeReady || state.appleDropped) return
    state.appleDropped = true
    ui.dropApple()
    ui.narrate('appleDrop', 0)
    setTimeout(() => ui.narrate('appleDrop', 1), 2500)
    setTimeout(() => {
      state.appleReady = true
      ui.setAppleReady()
    }, 750)
  },

  onAppleGiven(state: GameState, ui: GameUI) {
    if (!state.hasApple || state.appleFedToBot) return
    state.hasApple = false
    state.appleFedToBot = true
    state.hasAppleCore = true
    ui.giveAppleToBot()
  },
}

import { Garden } from './garden'
import type { GameState, GameUI } from './types'

const CODE = '4040'

export const GamePuzzles = {
  CODE,

  initStage1(state: GameState, ui: GameUI) {
    state.clicks = 0
    state.periodGone = false
    state.screwLoose = false
    state.panelOpen = false
    state.gardenPhase = false
    ui.showScene(1)
    ui.hideGardenMode()
    ui.narrate('intro', 0)
  },

  onTitleClick(state: GameState, ui: GameUI) {
    state.clicks++
    if (state.clicks <= 3) {
      ui.narrate('clickTitle', state.clicks - 1)
    }
    if (state.clicks >= 3) ui.shakeTitle()
    if (state.clicks >= 4 && !state.periodGone) {
      state.periodGone = true
      ui.dropPeriod()
      ui.narrate('periodFall', 0)
      setTimeout(() => ui.narrate('periodFall', 1), 1800)
      setTimeout(() => ui.showScrew(), 500)
    }
  },

  onScrewDropped(state: GameState, ui: GameUI, x: number, y: number, panelRect: DOMRect) {
    if (state.screwLoose) return
    const cx = panelRect.left + panelRect.width / 2
    const cy = panelRect.top + panelRect.height / 2
    if (Math.hypot(x - cx, y - cy) < panelRect.width * 0.9) {
      state.screwLoose = true
      ui.loosenPanel()
      ui.narrate('screwFound', 1)
    }
  },

  onPowerClick(state: GameState, ui: GameUI) {
    if (!state.screwLoose || state.panelOpen) return
    state.panelOpen = true
    ui.narrate('panelOpen', 0)
    setTimeout(() => {
      ui.narrate('powerOn', 0)
      ui.glitchToStage2()
    }, 900)
  },

  initStage2(state: GameState, ui: GameUI) {
    state.windowMoved = false
    ui.showScene(2)
    requestAnimationFrame(() => requestAnimationFrame(() => ui.resetWindow()))
    setTimeout(() => ui.narrate('popup', 0), 400)
  },

  onWindowDragEnd(state: GameState, ui: GameUI, moved: number) {
    if (moved > 60 && !state.windowMoved) {
      state.windowMoved = true
      ui.revealKeypad()
      ui.narrate('windowDrag', 1)
    }
  },

  onCodeSubmit(state: GameState, ui: GameUI, value: string) {
    if (value === CODE) {
      ui.narrate('codeRight', 0)
      setTimeout(() => {
        ui.narrate('codeRight', 1)
        ui.goStage3()
      }, 900)
      return true
    }
    state.codeFails = (state.codeFails || 0) + 1
    ui.narrate('codeWrong', Math.min(state.codeFails - 1, 2))
    ui.shakeKeypad()
    return false
  },

  initStage3(state: GameState, ui: GameUI) {
    ui.showScene(3)
    if (!state.gardenPhase) {
      setTimeout(() => ui.narrate('folder', 0), 400)
    }
  },

  onFileClick(state: GameState, ui: GameUI, fileId: string) {
    if (fileId === 'trash') {
      if (state.hasAppleCore && !state.appleCoreTrashed) {
        ui.narrate('appleCoreTrash', 0)
        ui.shakeElement('file-trash')
        return
      }
      ui.narrate('folder', 1)
      ui.shakeElement('file-trash')
      return
    }
    if (fileId === 'photo' && !state.gardenPhase) {
      ui.openPhotoPuzzle()
      return
    }
    if (fileId === 'plant') {
      ui.openPlantView()
      return
    }
    if (fileId === 'music') {
      ui.playFakeMusic()
    }
    if (fileId === 'chatbot') {
      ui.openChatbot()
    }
  },

  onPhotoSolved(state: GameState, ui: GameUI) {
    state.photoSolved = true
    ui.narrate('trophy', 0)
    setTimeout(() => ui.showTrophyStage(), 800)
  },

  initStage4(state: GameState, ui: GameUI) {
    state.trophyDodges = 0
    state.trophyCaught = false
    ui.showScene(4)
    setTimeout(() => ui.narrate('trophy', 1), 500)
  },

  onTrophyClick(state: GameState, ui: GameUI) {
    state.trophyDodges = (state.trophyDodges || 0) + 1
    if (state.trophyDodges >= 3) {
      state.trophyCaught = true
      ui.catchTrophy()
      GamePuzzles.onTrophyCaught(state, ui)
      return false
    }
    return true
  },

  onTrophyCaught(_state: GameState, ui: GameUI) {
    setTimeout(() => Garden.initAfterTrophy(_state, ui), 900)
  },

  onAppleCoreTrashed(state: GameState, ui: GameUI) {
    if (!state.hasAppleCore || state.appleCoreTrashed) return
    state.hasAppleCore = false
    state.appleCoreTrashed = true
    ui.disposeAppleCore()
    ui.shakeElement('file-trash')
    ui.showMrGlitch()
    ui.narrate('appleCoreTrash', 1)
  },
}

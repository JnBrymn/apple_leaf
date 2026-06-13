export interface GameState {
  stage: number
  clicks: number
  periodGone: boolean
  screwLoose: boolean
  panelOpen: boolean
  gardenPhase: boolean
  windowMoved: boolean
  codeFails: number
  photoSolved: boolean
  trophyDodges: number
  trophyCaught: boolean
  hasTrophy: boolean
  trophyFull: boolean
  plantWatered: boolean
  treeReady: boolean
  appleDropped: boolean
  appleReady: boolean
  hasApple: boolean
  appleFedToBot: boolean
  hasAppleCore: boolean
  appleCoreTrashed: boolean
}

export function createInitialGameState(): GameState {
  return {
    stage: 1,
    clicks: 0,
    periodGone: false,
    screwLoose: false,
    panelOpen: false,
    gardenPhase: false,
    windowMoved: false,
    codeFails: 0,
    photoSolved: false,
    trophyDodges: 0,
    trophyCaught: false,
    hasTrophy: false,
    trophyFull: false,
    plantWatered: false,
    treeReady: false,
    appleDropped: false,
    appleReady: false,
    hasApple: false,
    appleFedToBot: false,
    hasAppleCore: false,
    appleCoreTrashed: false,
  }
}

export interface GameUI {
  showScene(n: number): void
  narrate(group: string, index: number): void
  showGardenMode(): void
  hideGardenMode(): void
  setTrophyWater(pct: number): void
  openPlantView(): void
  growTree(): void
  dropApple(): void
  shakeTitle(): void
  dropPeriod(): void
  showScrew(): void
  loosenPanel(): void
  glitchToStage2(): void
  resetWindow(): void
  fleeOkButton(): void
  revealKeypad(): void
  shakeKeypad(): void
  shakeElement(id: string): void
  goStage3(): void
  openPhotoPuzzle(): void
  playFakeMusic(): void
  showTrophyStage(): void
  catchTrophy(): void
  resetStage1Dom(): void
  openChatbot(): void
  setAppleReady(): void
  giveAppleToBot(): void
  disposeAppleCore(): void
  showMrGlitch(): void
}

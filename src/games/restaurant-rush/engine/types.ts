export interface RecipeEntry {
  id: string
  name: string
  steps: string
}

export type ScreenId = 1 | 2 | 3 | 4 | 5 | 6

export type ScreenNames = Record<ScreenId, string>

export type GamePhase = 'start' | 'naming' | 'menu' | 'playing'

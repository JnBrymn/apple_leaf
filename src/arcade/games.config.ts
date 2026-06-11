import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export interface GameConfig {
  id: string
  title: string
  description: string
  thumbnail: string
  tags: string[]
  component: LazyExoticComponent<ComponentType>
}

export const GAMES: GameConfig[] = [
  {
    id: 'snake',
    title: 'Snake',
    description: 'Classic snake game — eat apples, grow longer, avoid walls.',
    thumbnail: '/thumbnails/snake.png',
    tags: ['classic', '2d'],
    component: lazy(() => import('../games/snake')),
  },
  {
    id: 'game-of-life',
    title: 'Game of Life',
    description: 'Watch cells grow and change. Click to draw your own patterns.',
    thumbnail: '/thumbnails/game-of-life.png',
    tags: ['puzzle', 'simulation'],
    component: lazy(() => import('../games/game-of-life')),
  },
  {
    id: 'banana-chaos',
    title: 'Banana Chaos',
    description: 'You are a banana. Dodge falling peels. Do not slip.',
    thumbnail: '/thumbnails/banana-chaos.png',
    tags: ['silly', 'arcade'],
    component: lazy(() => import('../games/banana-chaos')),
  },
  {
    id: 'bomb-simulator',
    title: 'Bomb Simulator',
    description: 'Buy bombs. Wreck Earth in the arena. Stop repair crews before they fix everything.',
    thumbnail: '/thumbnails/bomb-simulator.png',
    tags: ['arcade', 'simulation'],
    component: lazy(() => import('../games/bomb-simulator')),
  },
]

export function getGameById(id: string): GameConfig | undefined {
  return GAMES.find((game) => game.id === id)
}

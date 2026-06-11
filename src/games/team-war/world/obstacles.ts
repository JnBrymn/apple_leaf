import { ARENA_D, ARENA_W, BODY_RADIUS, WALL_THICKNESS } from '../engine/constants'

export interface Obstacle {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

const COVER_HALF: Obstacle[] = [
  { minX: -18, maxX: -10, minZ: -14, maxZ: -6 },
  { minX: 10, maxX: 18, minZ: -14, maxZ: -6 },
  { minX: -6, maxX: 6, minZ: -6, maxZ: 6 },
  { minX: -28, maxX: -22, minZ: -4, maxZ: 4 },
  { minX: 22, maxX: 28, minZ: -4, maxZ: 4 },
  { minX: -4, maxX: 4, minZ: -28, maxZ: -22 },
]

function mirrorObstacleZ(obstacle: Obstacle): Obstacle {
  return {
    minX: obstacle.minX,
    maxX: obstacle.maxX,
    minZ: -obstacle.maxZ,
    maxZ: -obstacle.minZ,
  }
}

export const PERIMETER_WALLS: Obstacle[] = [
  { minX: -ARENA_W / 2, maxX: -ARENA_W / 2 + WALL_THICKNESS, minZ: -ARENA_D / 2, maxZ: ARENA_D / 2 },
  { minX: ARENA_W / 2 - WALL_THICKNESS, maxX: ARENA_W / 2, minZ: -ARENA_D / 2, maxZ: ARENA_D / 2 },
  { minX: -ARENA_W / 2, maxX: ARENA_W / 2, minZ: -ARENA_D / 2, maxZ: -ARENA_D / 2 + WALL_THICKNESS },
  { minX: -ARENA_W / 2, maxX: ARENA_W / 2, minZ: ARENA_D / 2 - WALL_THICKNESS, maxZ: ARENA_D / 2 },
]

export const COVER_OBSTACLES: Obstacle[] = [
  ...COVER_HALF,
  ...COVER_HALF.map(mirrorObstacleZ).filter(
    (north) =>
      !COVER_HALF.some(
        (south) =>
          south.minX === north.minX &&
          south.maxX === north.maxX &&
          south.minZ === north.minZ &&
          south.maxZ === north.maxZ,
      ),
  ),
]

export const ALL_OBSTACLES: Obstacle[] = [...PERIMETER_WALLS, ...COVER_OBSTACLES]

export function getPlayableHalfExtents() {
  return {
    halfW: ARENA_W / 2 - WALL_THICKNESS,
    halfD: ARENA_D / 2 - WALL_THICKNESS,
  }
}

export function overlapsObstacle(x: number, z: number, padding = BODY_RADIUS): boolean {
  for (const o of ALL_OBSTACLES) {
    if (x + padding > o.minX && x - padding < o.maxX && z + padding > o.minZ && z - padding < o.maxZ) {
      return true
    }
  }
  return false
}

export function isOutOfArena(x: number, z: number, padding = BODY_RADIUS): boolean {
  const { halfW, halfD } = getPlayableHalfExtents()
  return (
    x - padding < -halfW ||
    x + padding > halfW ||
    z - padding < -halfD ||
    z + padding > halfD
  )
}

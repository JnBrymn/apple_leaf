import { ARENA_D, ARENA_W, BODY_RADIUS, GRAVITY, JUMP_VELOCITY, WALL_THICKNESS } from '../engine/constants'

export const COVER_HEIGHT = 1.6
export const SKY_PLATFORM_HEIGHT = 3.2
export const STAIR_STEP_HEIGHT = 0.4
export const MAX_STEP_HEIGHT = 0.45
export const ON_TOP_EPSILON = 0.08

export interface Platform {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  topY: number
  /** Full column blocks movement below the surface (crates, stairs). */
  column?: boolean
}

export interface Obstacle {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

const CRATE_H = COVER_HEIGHT
const SKY_H = SKY_PLATFORM_HEIGHT
const STEP = STAIR_STEP_HEIGHT

function box(minX: number, maxX: number, minZ: number, maxZ: number, topY: number, column = true): Platform {
  return { minX, maxX, minZ, maxZ, topY, column }
}

function mirrorZ(p: Platform): Platform {
  return { ...p, minZ: -p.maxZ, maxZ: -p.minZ }
}

function stairRampX(
  startX: number,
  endX: number,
  minZ: number,
  maxZ: number,
  targetY: number,
): Platform[] {
  const steps: Platform[] = []
  const count = Math.max(1, Math.round(targetY / STEP))
  const dx = (endX - startX) / count
  for (let i = 0; i < count; i++) {
    const minX = startX + dx * i
    const maxX = startX + dx * (i + 1)
    steps.push(box(minX, maxX, minZ, maxZ, STEP * (i + 1)))
  }
  return steps
}

function stairRampZ(
  minX: number,
  maxX: number,
  startZ: number,
  endZ: number,
  targetY: number,
): Platform[] {
  const steps: Platform[] = []
  const count = Math.max(1, Math.round(targetY / STEP))
  const dz = (endZ - startZ) / count
  for (let i = 0; i < count; i++) {
    const minZ = startZ + dz * i
    const maxZ = startZ + dz * (i + 1)
    steps.push(box(minX, maxX, minZ, maxZ, STEP * (i + 1)))
  }
  return steps
}

const GROUND_CRATES_HALF: Platform[] = [
  box(-18, -10, -14, -6, CRATE_H),
  box(10, 18, -14, -6, CRATE_H),
  box(-6, 6, -6, 6, CRATE_H),
  box(-28, -22, -4, 4, CRATE_H),
  box(22, 28, -4, 4, CRATE_H),
  box(-4, 4, -28, -22, CRATE_H),
  box(-35, -28, 12, 20, CRATE_H),
  box(28, 35, -20, -12, CRATE_H),
  box(-14, -6, 18, 26, CRATE_H),
  box(6, 14, 22, 30, CRATE_H),
]

const GROUND_CRATES: Platform[] = [
  ...GROUND_CRATES_HALF,
  ...GROUND_CRATES_HALF.map(mirrorZ).filter(
    (north) =>
      !GROUND_CRATES_HALF.some(
        (south) =>
          south.minX === north.minX &&
          south.maxX === north.maxX &&
          south.minZ === north.minZ &&
          south.maxZ === north.maxZ,
      ),
  ),
]

const SKY_DECKS: Platform[] = [
  box(-11, 11, -5, 5, SKY_H, false),
  box(-34, -22, 22, 34, SKY_H, false),
  box(22, 34, 22, 34, SKY_H, false),
  box(-34, -22, -34, -22, SKY_H, false),
  box(22, 34, -34, -22, SKY_H, false),
  box(-5, 5, 24, 36, SKY_H, false),
  box(-5, 5, -36, -24, SKY_H, false),
]

const SKY_RAMPS: Platform[] = [
  ...stairRampX(30, 11, -2.5, 2.5, SKY_H),
  ...stairRampX(-30, -11, -2.5, 2.5, SKY_H),
  ...stairRampZ(-2.5, 2.5, 30, 11, SKY_H),
  ...stairRampZ(-2.5, 2.5, -30, -11, SKY_H),
  ...stairRampX(-34, -22, 26, 30, SKY_H),
  ...stairRampX(34, 22, 26, 30, SKY_H),
  ...stairRampX(-34, -22, -30, -26, SKY_H),
  ...stairRampX(34, 22, -30, -26, SKY_H),
  ...stairRampZ(-5, 5, 36, 24, SKY_H),
  ...stairRampZ(-5, 5, -36, -24, SKY_H),
]

export const PLATFORMS: Platform[] = [...GROUND_CRATES, ...SKY_DECKS, ...SKY_RAMPS]

/** @deprecated use PLATFORMS */
export const COVER_OBSTACLES: Obstacle[] = GROUND_CRATES.map(({ minX, maxX, minZ, maxZ }) => ({
  minX,
  maxX,
  minZ,
  maxZ,
}))

export const PERIMETER_WALLS: Obstacle[] = [
  { minX: -ARENA_W / 2, maxX: -ARENA_W / 2 + WALL_THICKNESS, minZ: -ARENA_D / 2, maxZ: ARENA_D / 2 },
  { minX: ARENA_W / 2 - WALL_THICKNESS, maxX: ARENA_W / 2, minZ: -ARENA_D / 2, maxZ: ARENA_D / 2 },
  { minX: -ARENA_W / 2, maxX: ARENA_W / 2, minZ: -ARENA_D / 2, maxZ: -ARENA_D / 2 + WALL_THICKNESS },
  { minX: -ARENA_W / 2, maxX: ARENA_W / 2, minZ: ARENA_D / 2 - WALL_THICKNESS, maxZ: ARENA_D / 2 },
]

export const ALL_OBSTACLES: Obstacle[] = [...PERIMETER_WALLS, ...COVER_OBSTACLES]

function xzHit(minX: number, maxX: number, minZ: number, maxZ: number, x: number, z: number, padding: number) {
  return x + padding > minX && x - padding < maxX && z + padding > minZ && z - padding < maxZ
}

function platformHit(p: Platform, x: number, z: number, padding: number) {
  return xzHit(p.minX, p.maxX, p.minZ, p.maxZ, x, z, padding)
}

export function getJumpReach(): number {
  return (JUMP_VELOCITY * JUMP_VELOCITY) / (2 * GRAVITY) + 0.15
}

export function getGroundHeight(x: number, z: number, currentY = 0, padding = BODY_RADIUS): number {
  let ground = 0
  for (const p of PLATFORMS) {
    if (!platformHit(p, x, z, padding)) continue
    if (p.column !== false) {
      ground = Math.max(ground, p.topY)
      continue
    }
    if (currentY >= p.topY - ON_TOP_EPSILON || currentY >= p.topY - getJumpReach()) {
      ground = Math.max(ground, p.topY)
    }
  }
  return ground
}

export function overlapsObstacle(x: number, z: number, padding = BODY_RADIUS): boolean {
  return overlapsSolidAtHeight(x, z, 0, padding)
}

export function overlapsSolidAtHeight(x: number, z: number, y: number, padding = BODY_RADIUS): boolean {
  for (const o of PERIMETER_WALLS) {
    if (xzHit(o.minX, o.maxX, o.minZ, o.maxZ, x, z, padding)) return true
  }

  for (const p of PLATFORMS) {
    if (!platformHit(p, x, z, padding)) continue

    if (p.column !== false) {
      if (y >= p.topY - ON_TOP_EPSILON) continue
      return true
    }

    if (y >= p.topY - ON_TOP_EPSILON) continue
    if (y < p.topY - 1.2) continue
    return true
  }

  return false
}

export function isNavWalkable(x: number, z: number, padding = BODY_RADIUS): boolean {
  if (isOutOfArena(x, z, padding)) return false
  const standY = getGroundHeight(x, z, 0, padding)
  return !overlapsSolidAtHeight(x, z, standY, padding)
}

export function getPlayableHalfExtents() {
  return {
    halfW: ARENA_W / 2 - WALL_THICKNESS,
    halfD: ARENA_D / 2 - WALL_THICKNESS,
  }
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

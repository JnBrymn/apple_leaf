import { overlapsObstacle } from '../world/obstacles'
import type { Soldier } from '../engine/types'

export function hasLineOfSight(from: Soldier, to: Soldier, padding = 0.1): boolean {
  return hasLineOfSightBetween(from.x, from.z, to.x, to.z, padding)
}

export function hasLineOfSightBetween(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
  padding = 0.1,
): boolean {
  const dx = toX - fromX
  const dz = toZ - fromZ
  const dist = Math.hypot(dx, dz)
  if (dist < 0.01) return true

  const steps = Math.ceil(dist / 0.45)
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    const x = fromX + dx * t
    const z = fromZ + dz * t
    if (overlapsObstacle(x, z, padding)) return false
  }
  return true
}

export function pickTarget(enemies: Soldier[], soldier: Soldier): Soldier | null {
  let best: Soldier | null = null
  let bestScore = Infinity
  for (const enemy of enemies) {
    const d = Math.hypot(enemy.x - soldier.x, enemy.z - soldier.z)
    const los = hasLineOfSight(soldier, enemy)
    const score = d + (los ? 0 : 18)
    if (score < bestScore) {
      bestScore = score
      best = enemy
    }
  }
  return best
}

import type { Soldier } from '../engine/types'
import { isOutOfArena, overlapsSolidAtHeight } from '../world/obstacles'

export function tryMove(soldier: Soldier, dx: number, dz: number) {
  const nextX = soldier.x + dx
  if (!overlapsSolidAtHeight(nextX, soldier.z, soldier.y) && !isOutOfArena(nextX, soldier.z)) {
    soldier.x = nextX
  }
  const nextZ = soldier.z + dz
  if (!overlapsSolidAtHeight(soldier.x, nextZ, soldier.y) && !isOutOfArena(soldier.x, nextZ)) {
    soldier.z = nextZ
  }
}

export function moveToward(soldier: Soldier, targetX: number, targetZ: number, step: number) {
  const dx = targetX - soldier.x
  const dz = targetZ - soldier.z
  const dist = Math.hypot(dx, dz)
  if (dist < 0.001) return
  const scale = Math.min(step, dist) / dist
  tryMove(soldier, dx * scale, dz * scale)
  soldier.yaw = Math.atan2(dx, dz)
}

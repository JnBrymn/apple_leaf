import type { Soldier } from '../engine/types'
import { isOutOfArena, overlapsObstacle } from '../world/obstacles'

export function tryMove(soldier: Soldier, dx: number, dz: number) {
  const nextX = soldier.x + dx
  if (!overlapsObstacle(nextX, soldier.z) && !isOutOfArena(nextX, soldier.z)) {
    soldier.x = nextX
  }
  const nextZ = soldier.z + dz
  if (!overlapsObstacle(soldier.x, nextZ) && !isOutOfArena(soldier.x, nextZ)) {
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

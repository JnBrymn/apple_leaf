import { GRAVITY, JUMP_VELOCITY } from '../engine/constants'
import type { Soldier } from '../engine/types'
import { getGroundHeight, getJumpReach, MAX_STEP_HEIGHT } from '../world/obstacles'

export function updateSoldierVertical(soldier: Soldier, jump: boolean, dt: number) {
  if (jump && soldier.onGround) {
    soldier.velocityY = JUMP_VELOCITY
    soldier.onGround = false
  }

  soldier.velocityY -= GRAVITY * dt
  soldier.y += soldier.velocityY * dt

  const groundY = getGroundHeight(soldier.x, soldier.z, soldier.y)

  if (soldier.y <= groundY) {
    soldier.y = groundY
    soldier.velocityY = 0
    soldier.onGround = true
    return
  }

  if (soldier.onGround && groundY > soldier.y && groundY - soldier.y <= MAX_STEP_HEIGHT) {
    soldier.y = groundY
    soldier.velocityY = 0
    soldier.onGround = true
    return
  }

  if (Math.abs(soldier.y - groundY) < 0.06 && soldier.velocityY <= 0) {
    soldier.y = groundY
    soldier.velocityY = 0
    soldier.onGround = true
    return
  }

  soldier.onGround = false
}

export function shouldAiJump(soldier: Soldier, targetX: number, targetZ: number): boolean {
  if (!soldier.onGround) return false

  const targetGround = getGroundHeight(targetX, targetZ, soldier.y)
  const aheadX = soldier.x - Math.sin(soldier.yaw) * 0.9
  const aheadZ = soldier.z - Math.cos(soldier.yaw) * 0.9
  const aheadGround = getGroundHeight(aheadX, aheadZ, soldier.y)
  const wantGround = Math.max(targetGround, aheadGround)
  const jumpReach = getJumpReach()

  if (wantGround <= soldier.y + MAX_STEP_HEIGHT) return false
  return wantGround <= soldier.y + jumpReach
}

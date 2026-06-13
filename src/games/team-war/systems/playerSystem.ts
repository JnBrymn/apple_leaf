import type { PerspectiveCamera } from 'three'
import {
  EYE_HEIGHT,
  PLAYER_IMMORTAL,
  SHOOT_COOLDOWN,
  SOLDIER_HEALTH,
  SOLDIER_SPEED,
} from '../engine/constants'
import type { GameState, InputState, Soldier } from '../engine/types'
import { syncSoldierTransform } from '../entities/soldier'
import { clamp } from '../engine/utils'
import { tryMove } from './movementSystem'
import { updateSoldierVertical } from './verticalSystem'

export function syncFirstPersonCamera(
  player: Soldier,
  state: GameState,
  camera: PerspectiveCamera,
) {
  camera.position.set(player.x, player.y + EYE_HEIGHT, player.z)
  camera.rotation.order = 'YXZ'
  camera.rotation.y = state.player.yaw
  camera.rotation.x = state.player.pitch
}

export function updatePlayer(
  player: Soldier,
  state: GameState,
  input: InputState,
  camera: PerspectiveCamera,
  dt: number,
) {
  state.player.yaw -= input.lookDeltaX * 0.0022
  state.player.pitch -= input.lookDeltaY * 0.0022
  state.player.pitch = clamp(state.player.pitch, -1.1, 1.1)

  const sin = Math.sin(state.player.yaw)
  const cos = Math.cos(state.player.yaw)

  let moveX = 0
  let moveZ = 0
  if (input.forward) {
    moveX -= sin
    moveZ -= cos
  }
  if (input.backward) {
    moveX += sin
    moveZ += cos
  }
  if (input.left) {
    moveX -= cos
    moveZ += sin
  }
  if (input.right) {
    moveX += cos
    moveZ -= sin
  }

  const len = Math.hypot(moveX, moveZ)
  if (len > 0) {
    moveX = (moveX / len) * SOLDIER_SPEED * dt
    moveZ = (moveZ / len) * SOLDIER_SPEED * dt
  }

  tryMove(player, moveX, moveZ)

  updateSoldierVertical(player, input.jump, dt)
  state.player.velocityY = player.velocityY
  state.player.onGround = player.onGround

  player.yaw = state.player.yaw
  player.moveSpeed = len > 0 ? SOLDIER_SPEED : 0
  if (PLAYER_IMMORTAL) {
    player.health = SOLDIER_HEALTH
  }
  syncSoldierTransform(player)
  player.rig.updateAnimation(
    dt,
    player.moveSpeed,
    player.justShot || player.shootCooldown > SHOOT_COOLDOWN - 0.12,
  )

  syncFirstPersonCamera(player, state, camera)
}

export function syncCameraToPlayer(player: Soldier | undefined, state: GameState, camera: PerspectiveCamera) {
  if (!player) return
  syncFirstPersonCamera(player, state, camera)
}

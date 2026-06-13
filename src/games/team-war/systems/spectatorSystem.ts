import type { PerspectiveCamera } from 'three'
import { EYE_HEIGHT } from '../engine/constants'
import type { GameState, InputState, SpectatorState } from '../engine/types'
import { clamp } from '../engine/utils'

const FLY_SPEED = 14
const FLY_VERTICAL_SPEED = 10

export function initSpectatorFromPlayer(
  playerX: number,
  playerY: number,
  playerZ: number,
): SpectatorState {
  return {
    x: playerX,
    y: playerY + EYE_HEIGHT,
    z: playerZ,
  }
}

export function updateSpectator(
  spectator: SpectatorState,
  state: GameState,
  input: InputState,
  camera: PerspectiveCamera,
  dt: number,
) {
  state.player.yaw -= input.lookDeltaX * 0.0022
  state.player.pitch -= input.lookDeltaY * 0.0022
  state.player.pitch = clamp(state.player.pitch, -1.45, 1.45)

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
    moveX = (moveX / len) * FLY_SPEED * dt
    moveZ = (moveZ / len) * FLY_SPEED * dt
  }

  spectator.x += moveX
  spectator.z += moveZ

  if (input.jump) spectator.y += FLY_VERTICAL_SPEED * dt
  if (input.flyDown) spectator.y -= FLY_VERTICAL_SPEED * dt
  spectator.y = clamp(spectator.y, 0.5, 12)

  camera.position.set(spectator.x, spectator.y, spectator.z)
  camera.rotation.order = 'YXZ'
  camera.rotation.y = state.player.yaw
  camera.rotation.x = state.player.pitch
}

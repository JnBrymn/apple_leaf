import type { InputState } from './types'

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function emptyInput(): InputState {
  return {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    shoot: false,
    lookDeltaX: 0,
    lookDeltaY: 0,
  }
}

import type { Group, Mesh } from 'three'
import type { StickmanRig } from '../stickmanRig'

export type Team = 'blue' | 'red'

export interface InputState {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  jump: boolean
  flyDown: boolean
  shoot: boolean
  lookDeltaX: number
  lookDeltaY: number
}

export interface HudSnapshot {
  health: number
  blueAlive: number
  redAlive: number
  kills: number
  gameOver: boolean
  won: boolean | null
  message: string
  spectating: boolean
}

export interface SpectatorState {
  x: number
  y: number
  z: number
}

export interface PathWaypoint {
  x: number
  z: number
}

export interface Soldier {
  id: number
  team: Team
  isPlayer: boolean
  rig: StickmanRig
  x: number
  y: number
  z: number
  yaw: number
  health: number
  alive: boolean
  shootCooldown: number
  aiThinkTimer: number
  aiTargetId: number | null
  aiStrafeDir: number
  aiStrafeTimer: number
  aiPathTimer: number
  path: PathWaypoint[]
  pathIndex: number
  lastX: number
  lastZ: number
  moveSpeed: number
  justShot: boolean
  velocityY: number
  onGround: boolean
}

export interface Bullet {
  mesh: Mesh
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  team: Team
  shooterId: number
  distance: number
  alive: boolean
}

export interface AidKit {
  id: number
  mesh: Group
  x: number
  y: number
  z: number
  bobPhase: number
  alive: boolean
}

export interface PlayerState {
  id: number
  yaw: number
  pitch: number
  velocityY: number
  onGround: boolean
}

export interface GameState {
  soldiers: Soldier[]
  bullets: Bullet[]
  aidKits: AidKit[]
  player: PlayerState
  kills: number
  gameOver: boolean
  won: boolean | null
  muzzleFlashTimer: number
  spectator: SpectatorState | null
}

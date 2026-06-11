export const ARENA_W = 100
export const ARENA_D = 100
export const WALL_THICKNESS = 2.5
export const WALL_HEIGHT = 4
export const SOLDIERS_PER_TEAM = 10
export const EYE_HEIGHT = 1.55
export const BODY_RADIUS = 0.35
export const SOLDIER_SPEED = 7
export const GRAVITY = 22
export const JUMP_VELOCITY = 8
export const SOLDIER_HEALTH = 100
export const PLAYER_IMMORTAL = true
export const SHOOT_COOLDOWN = 0.35
export const SHOOT_RANGE = 55
export const SOLDIER_DAMAGE = 34
export const AI_THINK_INTERVAL = 0.4
export const AI_PATH_REPLAN_INTERVAL = 0.45
export const BULLET_SPEED = 62
export const BULLET_MAX_RANGE = SHOOT_RANGE
export const BULLET_RADIUS = 0.07
export const BULLET_HIT_RADIUS = 0.55
export const NAV_CELL_SIZE = 1
export const PATH_WAYPOINT_RADIUS = 0.55

export const SPAWN_FORMATION = [
  { x: -20, z: -40 },
  { x: -10, z: -41 },
  { x: 0, z: -42 },
  { x: 10, z: -41 },
  { x: 20, z: -40 },
  { x: -15, z: -36 },
  { x: -5, z: -37 },
  { x: 5, z: -37 },
  { x: 15, z: -36 },
  { x: 0, z: -38 },
] as const

export const PLAYER_SPAWN_INDEX = SPAWN_FORMATION.length - 1

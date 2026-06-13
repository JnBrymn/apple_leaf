export const LEVEL_WIDTH = 12000
export const LEVEL_HEIGHT = 640
export const TILE = 32

export type Rect = { x: number; y: number; w: number; h: number }

export interface PortalPair {
  id: string
  a: Rect
  b: Rect
  color: string
}

export interface ButtonDef {
  id: string
  rect: Rect
  doorId: string
}

export interface DoorDef {
  id: string
  rect: Rect
}

export interface CubeDef {
  id: string
  x: number
  y: number
}

export interface LevelData {
  platforms: Rect[]
  portals: PortalPair[]
  springs: Rect[]
  buttons: ButtonDef[]
  doors: DoorDef[]
  cubes: CubeDef[]
  goal: Rect
  spawn: { x: number; y: number }
}

function ground(x: number, w: number, y = LEVEL_HEIGHT - TILE): Rect {
  return { x, y, w, h: TILE }
}

function plat(x: number, y: number, w: number, h = TILE): Rect {
  return { x, y, w, h }
}

function wall(x: number, y: number, h: number, w = TILE): Rect {
  return { x, y, w, h }
}

/** Long hand-built sidescroller with spaced puzzle rooms. */
export function buildLevel(): LevelData {
  const platforms: Rect[] = [
    ground(0, 900),
    plat(980, LEVEL_HEIGHT - TILE * 4, 220),
    plat(1280, LEVEL_HEIGHT - TILE * 7, 180),
    ground(1550, 450),
    plat(2100, LEVEL_HEIGHT - TILE * 3, 160),
    plat(2400, LEVEL_HEIGHT - TILE * 6, 140),
    plat(2700, LEVEL_HEIGHT - TILE * 9, 160),
    plat(3000, LEVEL_HEIGHT - TILE * 12, 200),
    ground(3300, 500),
    plat(3950, LEVEL_HEIGHT - TILE * 5, 120),
    plat(4200, LEVEL_HEIGHT - TILE * 8, 120),
    ground(4500, 350),
    plat(5000, LEVEL_HEIGHT - TILE * 4, 200),
    plat(5400, LEVEL_HEIGHT - TILE * 7, 160),
    ground(5700, 400),
    plat(6300, LEVEL_HEIGHT - TILE * 3, 140),
    plat(6600, LEVEL_HEIGHT - TILE * 6, 140),
    plat(6900, LEVEL_HEIGHT - TILE * 9, 140),
    ground(7200, 450),
    plat(7800, LEVEL_HEIGHT - TILE * 4, 180),
    plat(8200, LEVEL_HEIGHT - TILE * 7, 180),
    plat(8600, LEVEL_HEIGHT - TILE * 10, 180),
    ground(9000, 500),
    plat(9700, LEVEL_HEIGHT - TILE * 5, 160),
    plat(10100, LEVEL_HEIGHT - TILE * 8, 160),
    plat(10500, LEVEL_HEIGHT - TILE * 11, 160),
    ground(10800, 1200),
  ]

  const portals: PortalPair[] = [
    {
      id: 'p1',
      a: plat(1040, LEVEL_HEIGHT - TILE * 5, 48, 64),
      b: plat(1880, LEVEL_HEIGHT - TILE * 5, 48, 64),
      color: '#9b59ff',
    },
    {
      id: 'p2',
      a: plat(3520, LEVEL_HEIGHT - TILE * 4, 48, 64),
      b: plat(4120, LEVEL_HEIGHT - TILE * 9, 48, 64),
      color: '#00cec9',
    },
    {
      id: 'p3',
      a: plat(7480, LEVEL_HEIGHT - TILE * 4, 48, 64),
      b: plat(8320, LEVEL_HEIGHT - TILE * 8, 48, 64),
      color: '#fd79a8',
    },
    {
      id: 'p4',
      a: plat(10920, LEVEL_HEIGHT - TILE * 6, 48, 64),
      b: plat(11480, LEVEL_HEIGHT - TILE * 10, 48, 64),
      color: '#ffeaa7',
    },
  ]

  const springs: Rect[] = [
    plat(2280, LEVEL_HEIGHT - TILE * 4, 56, 20),
    plat(3880, LEVEL_HEIGHT - TILE * 6, 56, 20),
    plat(6480, LEVEL_HEIGHT - TILE * 4, 56, 20),
    plat(9880, LEVEL_HEIGHT - TILE * 6, 56, 20),
    plat(11240, LEVEL_HEIGHT - TILE * 5, 56, 20),
  ]

  const buttons: ButtonDef[] = [
    { id: 'btn1', rect: plat(4720, LEVEL_HEIGHT - TILE * 2, 56, 12), doorId: 'door1' },
    { id: 'btn2', rect: plat(6020, LEVEL_HEIGHT - TILE * 2, 56, 12), doorId: 'door2' },
    { id: 'btn3', rect: plat(7920, LEVEL_HEIGHT - TILE * 2, 56, 12), doorId: 'door3' },
  ]

  const doors: DoorDef[] = [
    { id: 'door1', rect: wall(4920, LEVEL_HEIGHT - TILE * 6, TILE * 5) },
    { id: 'door2', rect: wall(6220, LEVEL_HEIGHT - TILE * 6, TILE * 5) },
    { id: 'door3', rect: wall(8120, LEVEL_HEIGHT - TILE * 7, TILE * 6) },
  ]

  const cubes: CubeDef[] = [
    { id: 'cube1', x: 4580, y: LEVEL_HEIGHT - TILE * 3 - 28 },
    { id: 'cube2', x: 5880, y: LEVEL_HEIGHT - TILE * 3 - 28 },
    { id: 'cube3', x: 7680, y: LEVEL_HEIGHT - TILE * 3 - 28 },
  ]

  return {
    platforms,
    portals,
    springs,
    buttons,
    doors,
    cubes,
    goal: plat(11840, LEVEL_HEIGHT - TILE * 4, 48, 96),
    spawn: { x: 120, y: LEVEL_HEIGHT - TILE * 3 - 32 },
  }
}

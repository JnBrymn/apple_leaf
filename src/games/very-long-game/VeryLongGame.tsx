import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameLoop } from '../../shared/hooks/useGameLoop'
import { useKeyboard } from '../../shared/hooks/useKeyboard'
import { buildLevel, LEVEL_WIDTH, type Rect } from './level'
import styles from './very-long-game.module.css'

const VIEW_WIDTH = 960
const VIEW_HEIGHT = 540
const GRAVITY = 1900
const MOVE_SPEED = 300
const JUMP_VELOCITY = -560
const SPRING_VELOCITY = -780
const PLAYER_W = 24
const PLAYER_H = 32
const CUBE_SIZE = 28
const PORTAL_COOLDOWN_MS = 450

type CubeState = { id: string; x: number; y: number; vx: number; vy: number }

interface GameState {
  playerX: number
  playerY: number
  playerVx: number
  playerVy: number
  onGround: boolean
  cubes: CubeState[]
  openDoors: Set<string>
  won: boolean
  portalCooldown: number
}

function overlaps(a: Rect, bx: number, by: number, bw: number, bh: number): boolean {
  return a.x < bx + bw && a.x + a.w > bx && a.y < by + bh && a.y + a.h > by
}

function centerX(x: number, w: number): number {
  return x + w / 2
}

function centerY(y: number, h: number): number {
  return y + h / 2
}

function createInitialState(): GameState {
  const level = buildLevel()
  return {
    playerX: level.spawn.x,
    playerY: level.spawn.y,
    playerVx: 0,
    playerVy: 0,
    onGround: false,
    cubes: level.cubes.map((cube) => ({ ...cube, vx: 0, vy: 0 })),
    openDoors: new Set<string>(),
    won: false,
    portalCooldown: 0,
  }
}

function getSolids(openDoors: Set<string>, cubes: CubeState[], excludeCubeId?: string): Rect[] {
  const level = buildLevel()
  const solids = [...level.platforms]
  for (const door of level.doors) {
    if (!openDoors.has(door.id)) {
      solids.push(door.rect)
    }
  }
  for (const cube of cubes) {
    if (cube.id !== excludeCubeId) {
      solids.push({ x: cube.x, y: cube.y, w: CUBE_SIZE, h: CUBE_SIZE })
    }
  }
  return solids
}

function resolveAxis(
  x: number,
  y: number,
  w: number,
  h: number,
  vx: number,
  vy: number,
  solids: Rect[],
): { x: number; y: number; vx: number; vy: number; onGround: boolean } {
  let nextX = x + vx
  let nextY = y + vy
  let nextVx = vx
  let nextVy = vy
  let onGround = false

  for (const solid of solids) {
    const future = { x: nextX, y, w, h }
    if (overlaps(future, solid.x, solid.y, solid.w, solid.h)) {
      if (vx > 0) nextX = solid.x - w
      else if (vx < 0) nextX = solid.x + solid.w
      nextVx = 0
    }
  }

  for (const solid of solids) {
    const future = { x: nextX, y: nextY, w, h }
    if (overlaps(future, solid.x, solid.y, solid.w, solid.h)) {
      if (vy > 0) {
        nextY = solid.y - h
        onGround = true
      } else if (vy < 0) {
        nextY = solid.y + solid.h
      }
      nextVy = 0
    }
  }

  return { x: nextX, y: nextY, vx: nextVx, vy: nextVy, onGround }
}

function pushCube(
  playerX: number,
  playerY: number,
  playerVx: number,
  cube: CubeState,
  solids: Rect[],
): CubeState {
  const playerRect = { x: playerX, y: playerY, w: PLAYER_W, h: PLAYER_H }
  const cubeRect = { x: cube.x, y: cube.y, w: CUBE_SIZE, h: CUBE_SIZE }
  if (!overlaps(playerRect, cubeRect.x, cubeRect.y, cubeRect.w, cubeRect.h)) {
    return cube
  }

  let pushX = 0
  if (playerVx > 0 && playerX + PLAYER_W > cube.x && playerX < cube.x) {
    pushX = playerVx
  } else if (playerVx < 0 && playerX < cube.x + CUBE_SIZE && playerX + PLAYER_W > cube.x + CUBE_SIZE) {
    pushX = playerVx
  }

  if (pushX === 0) return cube

  const moved = resolveAxis(cube.x, cube.y, CUBE_SIZE, CUBE_SIZE, pushX, 0, solids)
  return { ...cube, x: moved.x, vx: moved.vx }
}

function simulateCube(cube: CubeState, solids: Rect[], dt: number): CubeState {
  let { x, y, vx, vy } = cube
  vy += GRAVITY * dt
  vx *= 0.92

  const resolved = resolveAxis(x, y, CUBE_SIZE, CUBE_SIZE, vx * dt, vy * dt, solids)
  return { ...cube, ...resolved }
}

function rectContainsPortal(rect: Rect, px: number, py: number, pw: number, ph: number): boolean {
  const cx = centerX(px, pw)
  const cy = centerY(py, ph)
  return cx >= rect.x && cx <= rect.x + rect.w && cy >= rect.y && cy <= rect.y + rect.h
}

export default function VeryLongGame() {
  const keys = useKeyboard()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GameState>(createInitialState())
  const cameraRef = useRef(0)
  const [hud, setHud] = useState({ progress: 0, won: false })

  const reset = useCallback(() => {
    stateRef.current = createInitialState()
    cameraRef.current = 0
    setHud({ progress: 0, won: false })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = VIEW_WIDTH
    canvas.height = VIEW_HEIGHT
  }, [])

  useGameLoop(
    useCallback(
      (deltaMs) => {
        const state = stateRef.current
        if (state.won) return

        const dt = Math.min(deltaMs / 1000, 0.033)
        const level = buildLevel()
        const pressed = keys.current

        let move = 0
        if (pressed.has('ArrowLeft') || pressed.has('a') || pressed.has('A')) move -= 1
        if (pressed.has('ArrowRight') || pressed.has('d') || pressed.has('D')) move += 1

        state.playerVx = move * MOVE_SPEED
        if ((pressed.has(' ') || pressed.has('ArrowUp') || pressed.has('w') || pressed.has('W')) && state.onGround) {
          state.playerVy = JUMP_VELOCITY
          state.onGround = false
        }

        state.playerVy += GRAVITY * dt
        state.portalCooldown = Math.max(0, state.portalCooldown - deltaMs)

        state.cubes = state.cubes.map((cube) =>
          pushCube(
            state.playerX,
            state.playerY,
            state.playerVx * dt,
            cube,
            getSolids(state.openDoors, state.cubes, cube.id),
          ),
        )

        state.cubes = state.cubes.map((cube) =>
          simulateCube(cube, getSolids(state.openDoors, state.cubes, cube.id), dt),
        )

        const solids = getSolids(state.openDoors, state.cubes)

        const playerResolved = resolveAxis(
          state.playerX,
          state.playerY,
          PLAYER_W,
          PLAYER_H,
          state.playerVx * dt,
          state.playerVy * dt,
          solids,
        )
        state.playerX = playerResolved.x
        state.playerY = playerResolved.y
        state.playerVx = playerResolved.vx
        state.playerVy = playerResolved.vy
        state.onGround = playerResolved.onGround

        for (const button of level.buttons) {
          const pressedByCube = state.cubes.some((cube) =>
            overlaps(button.rect, cube.x, cube.y, CUBE_SIZE, CUBE_SIZE),
          )
          if (pressedByCube) {
            state.openDoors.add(button.doorId)
          }
        }

        for (const spring of level.springs) {
          const feet = state.playerY + PLAYER_H
          if (
            state.playerVy >= 0 &&
            feet >= spring.y &&
            feet <= spring.y + spring.h + 8 &&
            state.playerX + PLAYER_W > spring.x &&
            state.playerX < spring.x + spring.w
          ) {
            state.playerVy = SPRING_VELOCITY
            state.onGround = false
          }
        }

        if (state.portalCooldown <= 0) {
          for (const portal of level.portals) {
            if (rectContainsPortal(portal.a, state.playerX, state.playerY, PLAYER_W, PLAYER_H)) {
              state.playerX = portal.b.x + portal.b.w / 2 - PLAYER_W / 2
              state.playerY = portal.b.y + portal.b.h / 2 - PLAYER_H / 2
              state.playerVy = 0
              state.portalCooldown = PORTAL_COOLDOWN_MS
              break
            }
            if (rectContainsPortal(portal.b, state.playerX, state.playerY, PLAYER_W, PLAYER_H)) {
              state.playerX = portal.a.x + portal.a.w / 2 - PLAYER_W / 2
              state.playerY = portal.a.y + portal.a.h / 2 - PLAYER_H / 2
              state.playerVy = 0
              state.portalCooldown = PORTAL_COOLDOWN_MS
              break
            }
          }
        }

        if (
          overlaps(level.goal, state.playerX, state.playerY, PLAYER_W, PLAYER_H) ||
          centerX(state.playerX, PLAYER_W) >= level.goal.x
        ) {
          state.won = true
        }

        const targetCam = Math.max(0, Math.min(LEVEL_WIDTH - VIEW_WIDTH, state.playerX + PLAYER_W / 2 - VIEW_WIDTH / 2))
        cameraRef.current += (targetCam - cameraRef.current) * 0.12

        const progress = Math.min(100, Math.round((state.playerX / (LEVEL_WIDTH - VIEW_WIDTH)) * 100))
        if (progress !== hud.progress || state.won !== hud.won) {
          setHud({ progress, won: state.won })
        }

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        draw(ctx, cameraRef.current, state)
      },
      [keys, hud.progress, hud.won],
    ),
  )

  return (
    <div className={styles.game}>
      <div className={styles.hud}>
        <span>Progress: {hud.progress}%</span>
        {hud.won && <span className={styles.win}>You reached the end!</span>}
        <button type="button" onClick={reset}>
          {hud.won ? 'Play Again' : 'Reset'}
        </button>
      </div>
      <canvas ref={canvasRef} className={styles.canvas} width={VIEW_WIDTH} height={VIEW_HEIGHT} />
      <p className={styles.controls}>
        A/D or arrows to move · W/Space/Up to jump · Push cubes onto buttons · Portals teleport · Springs bounce
      </p>
    </div>
  )
}

function draw(ctx: CanvasRenderingContext2D, cameraX: number, state: GameState) {
  const level = buildLevel()

  ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT)

  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_HEIGHT)
  sky.addColorStop(0, '#74b9ff')
  sky.addColorStop(1, '#dfe6e9')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT)

  ctx.save()
  ctx.translate(-cameraX, 0)

  for (const platform of level.platforms) {
    drawPlatform(ctx, platform)
  }

  for (const door of level.doors) {
    if (!state.openDoors.has(door.id)) {
      drawDoor(ctx, door.rect)
    } else {
      ctx.fillStyle = 'rgba(46, 204, 113, 0.35)'
      ctx.fillRect(door.rect.x, door.rect.y, door.rect.w, door.rect.h)
    }
  }

  for (const spring of level.springs) {
    drawSpring(ctx, spring)
  }

  for (const button of level.buttons) {
    const active = state.openDoors.has(button.doorId)
    drawButton(ctx, button.rect, active)
  }

  for (const portal of level.portals) {
    drawPortal(ctx, portal.a, portal.color)
    drawPortal(ctx, portal.b, portal.color)
  }

  for (const cube of state.cubes) {
    drawCube(ctx, cube.x, cube.y)
  }

  drawGoal(ctx, level.goal)
  drawPlayer(ctx, state.playerX, state.playerY)

  ctx.restore()

  drawMiniMap(ctx, cameraX, state.playerX)
}

function drawPlatform(ctx: CanvasRenderingContext2D, rect: Rect) {
  ctx.fillStyle = '#6c5ce7'
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
  ctx.fillStyle = '#a29bfe'
  ctx.fillRect(rect.x, rect.y, rect.w, 6)
}

function drawDoor(ctx: CanvasRenderingContext2D, rect: Rect) {
  ctx.fillStyle = '#636e72'
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
  ctx.strokeStyle = '#2d3436'
  ctx.lineWidth = 3
  ctx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4)
}

function drawSpring(ctx: CanvasRenderingContext2D, rect: Rect) {
  ctx.fillStyle = '#fdcb6e'
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
  ctx.strokeStyle = '#e17055'
  ctx.lineWidth = 2
  for (let i = 0; i < rect.w; i += 8) {
    ctx.beginPath()
    ctx.moveTo(rect.x + i, rect.y + rect.h)
    ctx.lineTo(rect.x + i + 4, rect.y)
    ctx.stroke()
  }
}

function drawButton(ctx: CanvasRenderingContext2D, rect: Rect, active: boolean) {
  ctx.fillStyle = active ? '#00b894' : '#d63031'
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillRect(rect.x + 4, rect.y + 2, rect.w - 8, 4)
}

function drawPortal(ctx: CanvasRenderingContext2D, rect: Rect, color: string) {
  ctx.fillStyle = color
  ctx.globalAlpha = 0.75
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
  ctx.globalAlpha = 1
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 3
  ctx.strokeRect(rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8)
}

function drawCube(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#e84393'
  ctx.fillRect(x, y, CUBE_SIZE, CUBE_SIZE)
  ctx.strokeStyle = '#fd79a8'
  ctx.lineWidth = 2
  ctx.strokeRect(x + 3, y + 3, CUBE_SIZE - 6, CUBE_SIZE - 6)
}

function drawGoal(ctx: CanvasRenderingContext2D, rect: Rect) {
  ctx.fillStyle = '#55efc4'
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
  ctx.fillStyle = '#00cec9'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('END', rect.x + 6, rect.y + rect.h / 2 + 5)
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#0984e3'
  ctx.fillRect(x, y, PLAYER_W, PLAYER_H)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x + 5, y + 8, 5, 5)
  ctx.fillRect(x + 14, y + 8, 5, 5)
}

function drawMiniMap(ctx: CanvasRenderingContext2D, cameraX: number, playerX: number) {
  const mapW = VIEW_WIDTH - 40
  const mapH = 10
  const mapX = 20
  const mapY = VIEW_HEIGHT - 24

  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fillRect(mapX, mapY, mapW, mapH)

  const playerDot = mapX + (playerX / LEVEL_WIDTH) * mapW
  const viewDot = mapX + (cameraX / LEVEL_WIDTH) * mapW
  const viewW = (VIEW_WIDTH / LEVEL_WIDTH) * mapW

  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.fillRect(viewDot, mapY, viewW, mapH)

  ctx.fillStyle = '#ffeaa7'
  ctx.fillRect(playerDot - 3, mapY + 1, 6, mapH - 2)
}

import { useCallback, useRef, useState } from 'react'
import { useGameLoop } from '../../shared/hooks/useGameLoop'
import { useKeyboard } from '../../shared/hooks/useKeyboard'
import { Ragdoll2D, L_HAND, R_HAND } from './ragdoll2d'
import styles from './tower-defence.module.css'

const W = 960
const H = 540
const FLOOR_Y = H - 72
const GRAVITY = 2200
const JUMP_SPEED = 500
const GRAB_RANGE = 72
const FIST_LEFT_DAMAGE = 11
const FIST_LEFT_RANGE = 44
const FIST_RIGHT_DAMAGE = 13
const FIST_RIGHT_RANGE = 48

export type WeaponKind =
  | 'bat'
  | 'sword'
  | 'axe'
  | 'mace'
  | 'chained_mace'
  | 'spear'
  | 'staff'
  | 'nunchucks'
  | 'grenade'

type WeaponDef = {
  kind: WeaponKind
  name: string
  cost: number
  damage: number
  range: number
  cooldown: number
  knockback: number
  color: string
  desc: string
  consumable?: boolean
}

const WEAPON_DEFS: Record<WeaponKind, WeaponDef> = {
  bat: {
    kind: 'bat',
    name: 'Bat',
    cost: 0,
    damage: 14,
    range: 58,
    cooldown: 0.38,
    knockback: 280,
    color: '#c4a574',
    desc: 'Fast starter',
  },
  sword: {
    kind: 'sword',
    name: 'Sword',
    cost: 55,
    damage: 22,
    range: 68,
    cooldown: 0.48,
    knockback: 200,
    color: '#b8c8e8',
    desc: 'Balanced slash',
  },
  spear: {
    kind: 'spear',
    name: 'Spear',
    cost: 65,
    damage: 20,
    range: 105,
    cooldown: 0.55,
    knockback: 160,
    color: '#8b7355',
    desc: 'Long thrust',
  },
  axe: {
    kind: 'axe',
    name: 'Axe',
    cost: 85,
    damage: 34,
    range: 52,
    cooldown: 0.72,
    knockback: 420,
    color: '#a0a0b0',
    desc: 'Heavy chop',
  },
  mace: {
    kind: 'mace',
    name: 'Mace',
    cost: 75,
    damage: 26,
    range: 50,
    cooldown: 0.58,
    knockback: 320,
    color: '#707080',
    desc: 'Crushing blow',
  },
  chained_mace: {
    kind: 'chained_mace',
    name: 'Chained Mace',
    cost: 130,
    damage: 30,
    range: 92,
    cooldown: 0.82,
    knockback: 380,
    color: '#9090a8',
    desc: 'Wide chain swing',
  },
  staff: {
    kind: 'staff',
    name: 'Staff',
    cost: 60,
    damage: 18,
    range: 88,
    cooldown: 0.42,
    knockback: 260,
    color: '#6b4423',
    desc: 'Knockback pole',
  },
  nunchucks: {
    kind: 'nunchucks',
    name: 'Nunchucks',
    cost: 95,
    damage: 11,
    range: 48,
    cooldown: 0.22,
    knockback: 120,
    color: '#d4a84b',
    desc: 'Rapid double hit',
  },
  grenade: {
    kind: 'grenade',
    name: 'Grenade',
    cost: 45,
    damage: 48,
    range: 200,
    cooldown: 1.1,
    knockback: 500,
    color: '#4a7c4e',
    desc: 'AOE throw (uses stock)',
    consumable: true,
  },
}

const WEAPON_ORDER: WeaponKind[] = [
  'bat',
  'sword',
  'spear',
  'axe',
  'mace',
  'chained_mace',
  'staff',
  'nunchucks',
  'grenade',
]

type Grenade = {
  x: number
  y: number
  vx: number
  vy: number
  fuse: number
  owner: 'player' | 'enemy'
}

type Enemy = {
  id: number
  doll: Ragdoll2D
  hp: number
  maxHp: number
  attackCd: number
  attackPhase: number
  color: string
  dead: boolean
  deathTimer: number
}

type SimState = {
  playerX: number
  playerY: number
  playerVx: number
  playerVy: number
  playerHp: number
  playerMaxHp: number
  playerDoll: Ragdoll2D
  facing: 1 | -1
  onGround: boolean
  attackCd: number
  attackPhase: number
  attackSide: 'left' | 'right' | null
  grabbedEnemyId: number | null
  equipped: WeaponKind
  owned: Set<WeaponKind>
  grenadeStock: number
  money: number
  level: number
  levelActive: boolean
  betweenLevels: boolean
  betweenTimer: number
  enemies: Enemy[]
  grenades: Grenade[]
  gameOver: boolean
  nextId: number
}

type HudSnapshot = {
  money: number
  level: number
  playerHp: number
  playerMaxHp: number
  equipped: WeaponKind
  owned: WeaponKind[]
  grenadeStock: number
  levelActive: boolean
  betweenLevels: boolean
  betweenTimer: number
  gameOver: boolean
  enemyCount: number
}

function levelReward(level: number) {
  return 35 + level * 30
}

function enemyCountForLevel(level: number) {
  return 2 + level
}

function enemyHpForLevel(level: number) {
  return Math.round(55 + level * 18)
}

function createSim(): SimState {
  const playerX = W * 0.28
  return {
    playerX,
    playerY: FLOOR_Y,
    playerVx: 0,
    playerVy: 0,
    playerHp: 100,
    playerMaxHp: 100,
    playerDoll: new Ragdoll2D(playerX, FLOOR_Y, 1),
    facing: 1,
    onGround: true,
    attackCd: 0,
    attackPhase: 0,
    attackSide: null,
    grabbedEnemyId: null,
    equipped: 'bat',
    owned: new Set<WeaponKind>(['bat']),
    grenadeStock: 0,
    money: 0,
    level: 0,
    levelActive: false,
    betweenLevels: false,
    betweenTimer: 0,
    enemies: [],
    grenades: [],
    gameOver: false,
    nextId: 1,
  }
}

function keyJustPressed(keys: Set<string>, prev: Set<string>, ...codes: string[]) {
  return codes.some((code) => keys.has(code) && !prev.has(code))
}

function toHud(sim: SimState): HudSnapshot {
  return {
    money: sim.money,
    level: sim.level,
    playerHp: sim.playerHp,
    playerMaxHp: sim.playerMaxHp,
    equipped: sim.equipped,
    owned: [...sim.owned],
    grenadeStock: sim.grenadeStock,
    levelActive: sim.levelActive,
    betweenLevels: sim.betweenLevels,
    betweenTimer: sim.betweenTimer,
    gameOver: sim.gameOver,
    enemyCount: sim.enemies.filter((e) => !e.dead).length,
  }
}

function spawnEnemy(sim: SimState) {
  const side = Math.random() < 0.5 ? -1 : 1
  const x = side < 0 ? W - 80 - Math.random() * 120 : 80 + Math.random() * 120
  const hp = enemyHpForLevel(sim.level)
  sim.enemies.push({
    id: sim.nextId++,
    doll: new Ragdoll2D(x, FLOOR_Y, side < 0 ? -1 : 1),
    hp,
    maxHp: hp,
    attackCd: 0.4 + Math.random() * 0.8,
    attackPhase: 0,
    color: side < 0 ? '#8a909a' : '#9aa0aa',
    dead: false,
    deathTimer: 0,
  })
}

function startLevel(sim: SimState) {
  sim.level += 1
  sim.levelActive = true
  sim.betweenLevels = false
  sim.betweenTimer = 0
  sim.enemies = []
  sim.grenades = []
  const count = enemyCountForLevel(sim.level)
  for (let i = 0; i < count; i++) spawnEnemy(sim)
}

function weaponAngle(facing: 1 | -1, phase: number) {
  const base = facing > 0 ? -0.4 : Math.PI + 0.4
  const swing = facing > 0 ? phase * 2.2 : -phase * 2.2
  return base + swing
}

function distPointToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy || 0.0001
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  const cx = ax + t * dx
  const cy = ay + t * dy
  return Math.hypot(px - cx, py - cy)
}

function checkWeaponHit(
  sim: SimState,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  damage: number,
  knockback: number,
  hitIds: Set<number>,
) {
  const hitRadius = 14
  for (const enemy of sim.enemies) {
    if (enemy.dead || hitIds.has(enemy.id)) continue
    for (const pt of enemy.doll.hitPoints()) {
      if (distPointToSegment(pt.x, pt.y, ax, ay, bx, by) <= hitRadius) {
        enemy.hp -= damage
        const dir = enemy.doll.root.x > sim.playerX ? 1 : -1
        enemy.doll.applyKnockback(dir * knockback, -knockback * 0.35)
        hitIds.add(enemy.id)
        if (enemy.hp <= 0) {
          enemy.dead = true
          enemy.deathTimer = 2.5
          enemy.doll.applyKnockback(dir * knockback * 1.2, -180)
        }
        break
      }
    }
  }
}

function throwGrenade(sim: SimState, owner: 'player' | 'enemy', x: number, y: number, dir: number) {
  sim.grenades.push({
    x,
    y: y - 40,
    vx: dir * 320,
    vy: -340,
    fuse: 1.1,
    owner,
  })
}

function explodeGrenade(sim: SimState, g: Grenade) {
  const radius = 88
  const damage = WEAPON_DEFS.grenade.damage
  const knock = WEAPON_DEFS.grenade.knockback

  if (g.owner === 'player') {
    for (const enemy of sim.enemies) {
      if (enemy.dead) continue
      const d = Math.hypot(enemy.doll.root.x - g.x, enemy.doll.root.y - g.y)
      if (d > radius) continue
      const falloff = 1 - d / radius
      enemy.hp -= damage * falloff
      const dir = enemy.doll.root.x > g.x ? 1 : -1
      enemy.doll.applyKnockback(dir * knock * falloff, -knock * 0.4 * falloff)
      if (enemy.hp <= 0) {
        enemy.dead = true
        enemy.deathTimer = 2.5
      }
    }
  } else {
    const d = Math.hypot(sim.playerX - g.x, sim.playerY - 40 - g.y)
    if (d < radius) {
      const falloff = 1 - d / radius
      sim.playerHp -= damage * 0.55 * falloff
      sim.playerVx += (sim.playerX > g.x ? 1 : -1) * knock * 0.4 * falloff
      sim.playerVy -= 120 * falloff
    }
  }
}

function updatePlayerAttack(sim: SimState, dt: number) {
  if (sim.attackCd > 0) sim.attackCd -= dt
  if (sim.attackPhase > 0) {
    sim.attackPhase -= dt * 3.2
    if (sim.attackPhase <= 0) {
      sim.attackPhase = 0
      sim.attackSide = null
    }
  }

  if (sim.attackPhase <= 0 || !sim.attackSide) return

  const doll = sim.playerDoll
  const hitIds = new Set<number>()

  if (sim.attackSide === 'left') {
    doll.pinStanding(sim.playerX, sim.playerY)
    doll.setFacing(sim.facing)
    doll.swingLeftArm(1 - sim.attackPhase)
    const hand = doll.points[L_HAND]
    const ax = hand.x
    const ay = hand.y
    const bx = hand.x - FIST_LEFT_RANGE
    const by = hand.y
    checkWeaponHit(sim, ax, ay, bx, by, FIST_LEFT_DAMAGE, 220, hitIds)
  } else {
    const def = WEAPON_DEFS[sim.equipped]
    if (def.consumable) return
    doll.pinStanding(sim.playerX, sim.playerY)
    doll.setFacing(sim.facing)
    doll.swingRightArm(1 - sim.attackPhase)
    const hand = doll.points[R_HAND]
    const range = Math.max(FIST_RIGHT_RANGE, def.range * 0.65)
    const damage = Math.max(FIST_RIGHT_DAMAGE, def.damage)
    const knockback = def.knockback
    const ax = hand.x
    const ay = hand.y
    const bx = hand.x + range
    const by = hand.y
    checkWeaponHit(sim, ax, ay, bx, by, damage, knockback, hitIds)

    if (sim.equipped === 'nunchucks' && sim.attackPhase > 0.35 && sim.attackPhase < 0.55) {
      checkWeaponHit(sim, ax, ay, bx, by, def.damage, knockback * 0.6, hitIds)
    }
  }
}

function tryLeftPunch(sim: SimState) {
  if (sim.gameOver || !sim.levelActive || sim.attackCd > 0 || sim.grabbedEnemyId != null) return
  sim.attackSide = 'left'
  sim.attackPhase = 1
  sim.attackCd = 0.34
}

function tryRightPunch(sim: SimState) {
  if (sim.gameOver || !sim.levelActive || sim.attackCd > 0 || sim.grabbedEnemyId != null) return
  const def = WEAPON_DEFS[sim.equipped]

  if (def.consumable) {
    if (sim.grenadeStock <= 0) return
    sim.grenadeStock -= 1
    throwGrenade(sim, 'player', sim.playerX, sim.playerY, sim.facing)
    sim.attackCd = def.cooldown
    return
  }

  sim.attackSide = 'right'
  sim.attackPhase = 1
  sim.attackCd = def.cooldown
}

function nearestGrabbable(sim: SimState): Enemy | null {
  let best: Enemy | null = null
  let bestDist = GRAB_RANGE
  for (const enemy of sim.enemies) {
    if (enemy.dead) continue
    const d = Math.hypot(enemy.doll.root.x - sim.playerX, enemy.doll.root.y - sim.playerY)
    if (d < bestDist) {
      bestDist = d
      best = enemy
    }
  }
  return best
}

function tryGrab(sim: SimState) {
  if (sim.gameOver || !sim.levelActive || sim.grabbedEnemyId != null) return
  const target = nearestGrabbable(sim)
  if (!target) return
  sim.grabbedEnemyId = target.id
  target.doll.ragdollMode = false
}

function releaseGrab(sim: SimState, throwEnemy: boolean) {
  const id = sim.grabbedEnemyId
  if (id == null) return
  const enemy = sim.enemies.find((e) => e.id === id)
  sim.grabbedEnemyId = null
  if (!enemy || enemy.dead) return

  if (throwEnemy) {
    const dir = sim.facing
    enemy.doll.applyKnockback(dir * 420, -200)
    enemy.hp -= 8
    if (enemy.hp <= 0) {
      enemy.dead = true
      enemy.deathTimer = 2.5
    }
  }
}

function updateGrab(sim: SimState, keys: Set<string>, prev: Set<string>) {
  const holding = keys.has(' ')

  if (keyJustPressed(keys, prev, ' ') && sim.grabbedEnemyId == null) {
    tryGrab(sim)
  }

  if (!holding && sim.grabbedEnemyId != null) {
    releaseGrab(sim, true)
    return
  }

  if (sim.grabbedEnemyId == null) return
  const enemy = sim.enemies.find((e) => e.id === sim.grabbedEnemyId)
  if (!enemy || enemy.dead) {
    sim.grabbedEnemyId = null
    return
  }

  const holdX = sim.playerX + sim.facing * 30
  const holdY = sim.playerY - 22
  enemy.doll.driveRoot(holdX, holdY, 0.45)
  enemy.doll.setFacing(sim.facing === 1 ? -1 : 1)
}

function updateEnemies(sim: SimState, dt: number) {
  for (const enemy of sim.enemies) {
    if (enemy.dead) {
      enemy.deathTimer -= dt
      enemy.doll.step(dt, FLOOR_Y)
      continue
    }

    if (enemy.id === sim.grabbedEnemyId) {
      enemy.doll.step(dt, FLOOR_Y)
      continue
    }

    enemy.attackCd -= dt
    if (enemy.attackPhase > 0) {
      enemy.attackPhase -= dt * 2.5
      if (enemy.attackPhase <= 0) enemy.attackPhase = 0
    }

    const root = enemy.doll.root
    const dx = sim.playerX - root.x
    const dy = sim.playerY - root.y
    const dist = Math.hypot(dx, dy)
    enemy.doll.setFacing(dx >= 0 ? 1 : -1)

    const chaseX = dist > 70 ? root.x + (dx / dist) * 140 * dt : root.x
    const chaseY = FLOOR_Y
    enemy.doll.driveRoot(chaseX, chaseY, 0.28)

    if (dist < 62 && enemy.attackCd <= 0) {
      enemy.attackCd = 0.85 + Math.random() * 0.4
      enemy.attackPhase = 1
      enemy.doll.swingArm(1)

      const ang = weaponAngle(enemy.doll.facing, 0.5)
      const hand = enemy.doll.weaponHand
      const ex = hand.x + Math.cos(ang) * 50
      const ey = hand.y + Math.sin(ang) * 50
      const hitDist = distPointToSegment(sim.playerX, sim.playerY - 40, hand.x, hand.y, ex, ey)
      if (hitDist < 22) {
        sim.playerHp -= 8 + sim.level * 1.5
        const kbDir = sim.playerX > root.x ? 1 : -1
        sim.playerVx += kbDir * 220
        sim.playerVy -= 90
      }
    }

    enemy.doll.step(dt, FLOOR_Y)
  }

  sim.enemies = sim.enemies.filter((e) => !e.dead || e.deathTimer > 0)
}

function updateGrenades(sim: SimState, dt: number) {
  for (const g of sim.grenades) {
    g.fuse -= dt
    g.vy += GRAVITY * dt
    g.x += g.vx * dt
    g.y += g.vy * dt
    if (g.y > FLOOR_Y - 8) {
      g.y = FLOOR_Y - 8
      g.vy *= -0.35
      g.vx *= 0.7
    }
    if (g.fuse <= 0) explodeGrenade(sim, g)
  }
  sim.grenades = sim.grenades.filter((g) => g.fuse > 0)
}

function updateSim(sim: SimState, dt: number, keys: Set<string>, prevKeys: Set<string>) {
  if (sim.gameOver) return

  if (!sim.levelActive && !sim.betweenLevels && sim.level === 0) {
    startLevel(sim)
    return
  }

  if (sim.betweenLevels) {
    sim.betweenTimer -= dt
    if (sim.betweenTimer <= 0) startLevel(sim)
    return
  }

  const move =
    (keys.has('a') || keys.has('A') ? -1 : 0) + (keys.has('d') || keys.has('D') ? 1 : 0)

  sim.playerVx += move * 1400 * dt
  sim.playerVx *= 0.82
  sim.playerVy += GRAVITY * dt
  sim.playerX += sim.playerVx * dt
  sim.playerY += sim.playerVy * dt

  sim.onGround = sim.playerY >= FLOOR_Y - 0.5
  if (sim.playerY > FLOOR_Y) {
    sim.playerY = FLOOR_Y
    sim.playerVy = 0
    sim.onGround = true
  }

  if (sim.onGround && keyJustPressed(keys, prevKeys, 's', 'S', 'ArrowDown')) {
    sim.playerVy = -JUMP_SPEED
    sim.onGround = false
  }

  sim.playerX = Math.max(40, Math.min(W - 40, sim.playerX))
  if (move !== 0) sim.facing = move > 0 ? 1 : -1

  sim.playerDoll.pinStanding(sim.playerX, sim.playerY)
  sim.playerDoll.setFacing(sim.facing)

  if (keyJustPressed(keys, prevKeys, 'ArrowLeft')) tryLeftPunch(sim)
  if (keyJustPressed(keys, prevKeys, 'ArrowRight')) tryRightPunch(sim)

  updateGrab(sim, keys, prevKeys)
  updatePlayerAttack(sim, dt)
  updateEnemies(sim, dt)
  updateGrenades(sim, dt)

  if (sim.playerHp <= 0) {
    sim.playerHp = 0
    sim.gameOver = true
    sim.levelActive = false
    return
  }

  if (sim.levelActive && sim.enemies.length === 0) {
    sim.levelActive = false
    sim.betweenLevels = true
    sim.betweenTimer = 3.5
    sim.money += levelReward(sim.level)
    sim.playerHp = Math.min(sim.playerMaxHp, sim.playerHp + 18)
    sim.grabbedEnemyId = null
  }
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#1a2840')
  grad.addColorStop(0.55, '#243048')
  grad.addColorStop(1, '#2a3828')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#3d4a32'
  ctx.fillRect(0, FLOOR_Y, W, H - FLOOR_Y)
  ctx.strokeStyle = '#556644'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, FLOOR_Y)
  ctx.lineTo(W, FLOOR_Y)
  ctx.stroke()
}

function drawPlayer(ctx: CanvasRenderingContext2D, sim: SimState) {
  const def = WEAPON_DEFS[sim.equipped]
  const doll = sim.playerDoll
  const leftPunch = sim.attackSide === 'left' && sim.attackPhase > 0 ? 1 - sim.attackPhase : 0
  const rightPunch = sim.attackSide === 'right' && sim.attackPhase > 0 ? 1 - sim.attackPhase : 0

  doll.pinStanding(sim.playerX, sim.playerY)
  doll.setFacing(sim.facing)
  if (leftPunch > 0) doll.swingLeftArm(leftPunch)
  if (rightPunch > 0) doll.swingRightArm(rightPunch)

  doll.draw(ctx, {
    color: '#9ec8c4',
    limbColor: '#8ab8b4',
    facing: sim.facing,
    leftPunch,
    rightPunch,
    weaponAngle: rightPunch > 0 ? weaponAngle(sim.facing, rightPunch) : undefined,
    weaponLength: rightPunch > 0 ? def.range * 0.55 : undefined,
    weaponColor: def.color,
  })

  if (sim.grabbedEnemyId != null) {
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.7)'
    ctx.lineWidth = 3
    ctx.setLineDash([6, 4])
    const holdX = sim.playerX + sim.facing * 30
    const holdY = sim.playerY - 22
    ctx.beginPath()
    ctx.arc(holdX, holdY, 28, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }
}

function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  const phase = enemy.attackPhase > 0 ? 1 - enemy.attackPhase : 0
  enemy.doll.draw(ctx, {
    color: enemy.color,
    limbColor: enemy.dead ? '#888' : enemy.color,
    facing: enemy.doll.facing,
    weaponAngle: weaponAngle(enemy.doll.facing, phase > 0 ? phase : 0.1),
    weaponLength: 42,
    weaponColor: '#9090a0',
  })

  if (!enemy.dead) {
    const root = enemy.doll.root
    const barW = 36
    const hpPct = Math.max(0, enemy.hp / enemy.maxHp)
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(root.x - barW / 2, root.y - 76, barW, 5)
    ctx.fillStyle = hpPct > 0.35 ? '#4ecdc4' : '#ff6b6b'
    ctx.fillRect(root.x - barW / 2, root.y - 76, barW * hpPct, 5)
  }
}

function drawGrenades(ctx: CanvasRenderingContext2D, sim: SimState) {
  for (const g of sim.grenades) {
    ctx.fillStyle = g.owner === 'player' ? '#4a7c4e' : '#7c4a4a'
    ctx.beginPath()
    ctx.arc(g.x, g.y, 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#2a3a2a'
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

function drawHudBars(ctx: CanvasRenderingContext2D, sim: SimState) {
  const hpPct = sim.playerHp / sim.playerMaxHp
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fillRect(16, 14, 160, 14)
  ctx.fillStyle = hpPct > 0.35 ? '#4ecdc4' : '#ff6b6b'
  ctx.fillRect(16, 14, 160 * hpPct, 14)
  ctx.fillStyle = '#e8e8f0'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText(`HP ${Math.ceil(sim.playerHp)}`, 22, 25)
}

function drawGame(ctx: CanvasRenderingContext2D, sim: SimState) {
  ctx.clearRect(0, 0, W, H)
  drawBackground(ctx)
  drawGrenades(ctx, sim)
  for (const enemy of sim.enemies) drawEnemy(ctx, enemy)
  drawPlayer(ctx, sim)
  drawHudBars(ctx, sim)

  if (sim.betweenLevels) {
    ctx.fillStyle = 'rgba(8, 12, 20, 0.55)'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#ffd166'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`Level ${sim.level} cleared! +${levelReward(sim.level)} coins`, W / 2, H / 2 - 20)
    ctx.fillStyle = '#c8c8d8'
    ctx.font = '16px sans-serif'
    ctx.fillText('Buy weapons below — next level soon', W / 2, H / 2 + 16)
    ctx.textAlign = 'left'
  }
}

export default function TowerDefenceGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const simRef = useRef<SimState>(createSim())
  const keysRef = useKeyboard()
  const keysPrevRef = useRef(new Set<string>())
  const hudRef = useRef<HudSnapshot>(toHud(simRef.current))

  const [hud, setHud] = useState<HudSnapshot>(hudRef.current)
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponKind>('bat')

  const syncHud = useCallback((sim: SimState) => {
    const next = toHud(sim)
    const prev = hudRef.current
    if (
      prev.money !== next.money ||
      prev.level !== next.level ||
      prev.playerHp !== next.playerHp ||
      prev.equipped !== next.equipped ||
      prev.grenadeStock !== next.grenadeStock ||
      prev.levelActive !== next.levelActive ||
      prev.betweenLevels !== next.betweenLevels ||
      prev.gameOver !== next.gameOver ||
      prev.enemyCount !== next.enemyCount ||
      prev.owned.length !== next.owned.length ||
      Math.floor(prev.betweenTimer) !== Math.floor(next.betweenTimer)
    ) {
      hudRef.current = next
      setHud(next)
    }
  }, [])

  const reset = useCallback(() => {
    simRef.current = createSim()
    const snap = toHud(simRef.current)
    hudRef.current = snap
    setHud(snap)
    setSelectedWeapon('bat')
  }, [])

  const buyOrEquip = useCallback(
    (kind: WeaponKind) => {
      const sim = simRef.current
      if (sim.gameOver) return
      const def = WEAPON_DEFS[kind]

      if (def.consumable) {
        if (sim.money < def.cost) return
        sim.money -= def.cost
        sim.grenadeStock += 1
        sim.equipped = kind
        setSelectedWeapon(kind)
        syncHud(sim)
        return
      }

      if (sim.owned.has(kind)) {
        sim.equipped = kind
        setSelectedWeapon(kind)
        syncHud(sim)
        return
      }

      if (sim.money < def.cost) return
      sim.money -= def.cost
      sim.owned.add(kind)
      sim.equipped = kind
      setSelectedWeapon(kind)
      syncHud(sim)
    },
    [syncHud],
  )

  const skipToNextLevel = useCallback(() => {
    const sim = simRef.current
    if (!sim.betweenLevels || sim.gameOver) return
    sim.betweenTimer = 0
    syncHud(sim)
  }, [syncHud])

  useGameLoop(
    useCallback(
      (deltaMs) => {
        const sim = simRef.current
        const dt = Math.min(deltaMs / 1000, 0.05)
        const keys = keysRef.current
        const prev = keysPrevRef.current
        updateSim(sim, dt, keys, prev)
        keysPrevRef.current = new Set(keys)
        syncHud(sim)

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        drawGame(ctx, sim)
      },
      [syncHud, keysRef],
    ),
  )

  const statusMessage = hud.gameOver
    ? 'You were defeated!'
    : hud.betweenLevels
      ? `Shop time — next level in ${Math.ceil(hud.betweenTimer)}s`
      : hud.levelActive
        ? `Level ${hud.level} — fight the ragdoll enemies!`
        : 'Get ready…'

  return (
    <div className={styles.layout}>
      <div className={styles.hud}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Coins</span>
          <span className={`${styles.statValue} ${styles.gold}`}>{hud.money}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Level</span>
          <span className={`${styles.statValue} ${styles.wave}`}>{hud.level}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Enemies</span>
          <span className={styles.statValue}>{hud.enemyCount}</span>
        </div>
        {hud.equipped === 'grenade' && (
          <div className={styles.stat}>
            <span className={styles.statLabel}>Grenades</span>
            <span className={styles.statValue}>{hud.grenadeStock}</span>
          </div>
        )}
      </div>

      <div className={styles.canvasWrap}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={W}
          height={H}
          tabIndex={0}
          onMouseDown={(e) => e.currentTarget.focus()}
        />
        {hud.gameOver && (
          <div className={styles.overlay}>
            <div className={styles.overlayTitle}>Game Over</div>
            <div className={styles.overlaySub}>You reached level {hud.level}</div>
            <button type="button" className={`${styles.btn} ${styles.overlayBtn}`} onClick={reset}>
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className={styles.shop}>
        {WEAPON_ORDER.map((kind) => {
          const def = WEAPON_DEFS[kind]
          const owned = hud.owned.includes(kind)
          const selected = selectedWeapon === kind
          const label = def.consumable
            ? owned
              ? `+1 (${def.cost}c)`
              : `${def.cost}c each`
            : owned
              ? 'Owned'
              : `${def.cost}c`
          return (
            <button
              key={kind}
              type="button"
              className={`${styles.towerBtn} ${selected ? styles.towerBtnSelected : ''}`}
              disabled={hud.gameOver}
              onClick={() => buyOrEquip(kind)}
            >
              <span className={styles.towerName}>{def.name}</span>
              <span className={styles.towerCost}>{label}</span>
              <span className={styles.towerDesc}>{def.desc}</span>
            </button>
          )
        })}
      </div>

      <div className={styles.actions}>
        {hud.betweenLevels && (
          <button type="button" className={styles.btn} onClick={skipToNextLevel}>
            Start Next Level
          </button>
        )}
        <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={reset}>
          Restart
        </button>
      </div>

      <p className={styles.message}>
        <span className={hud.levelActive ? styles.messageHighlight : undefined}>{statusMessage}</span>
      </p>
      <p className={styles.hint}>
        WASD — A/D move · S jump · Space grab & throw · ← left fist · → right fist / weapon
      </p>
    </div>
  )
}

export const PRESETS = [
  { id: 'flashbang', name: 'Flashbang', type: 'flashbang', casing: 'paper', filler: 'flash', charge: 1, shrapnel: false, radiation: false, cost: 8 },
  { id: 'grenade', name: 'Grenade', type: 'grenade', casing: 'metal', filler: 'tnt', charge: 8, shrapnel: true, radiation: false, cost: 50 },
  { id: 'dynamite', name: 'Dynamite', type: 'dynamite', casing: 'stick', filler: 'tnt', charge: 8, shrapnel: false, radiation: false, cost: 45 },
  { id: 'landmine', name: 'Land Mine', type: 'landmine', casing: 'metal', filler: 'tnt', charge: 25, shrapnel: true, radiation: false, cost: 120 },
  { id: 'mortar', name: 'Mortar', type: 'mortar', casing: 'steel', filler: 'tnt', charge: 40, shrapnel: true, radiation: false, cost: 220 },
  { id: 'artillery', name: 'Artillery', type: 'artillery', casing: 'steel', filler: 'rdx', charge: 55, shrapnel: true, radiation: false, cost: 380 },
  { id: 'aerial', name: 'Aerial Bomb', type: 'aerial', casing: 'steel', filler: 'tnt', charge: 75, shrapnel: false, radiation: false, cost: 650 },
  { id: 'moab', name: 'MOAB', type: 'moab', casing: 'heavy', filler: 'rdx', charge: 92, shrapnel: false, radiation: false, cost: 1400 },
  { id: 'atomic', name: 'Atomic Bomb', type: 'atomic', casing: 'heavy', filler: 'uranium', charge: 85, shrapnel: false, radiation: true, cost: 5000 },
  { id: 'hydrogen', name: 'Hydrogen Bomb', type: 'hydrogen', casing: 'heavy', filler: 'fusion', charge: 100, shrapnel: false, radiation: true, cost: 12000 },
] as const

export type Preset = (typeof PRESETS)[number]
export type Casing = Preset['casing']
export type Filler = Preset['filler']
export type BombType = Preset['type']

export const FILLER_MULT: Record<Filler, number> = {
  flash: 0.00001,
  tnt: 1,
  rdx: 1.5,
  uranium: 8000000,
  fusion: 500000000,
}

export const START_MONEY = 50

export interface BombOptions {
  name?: string
  type?: BombType
  casing: Casing
  filler: Filler
  charge: number
  shrapnel: boolean
  radiation: boolean
}

export interface BombStats extends BombOptions {
  tntKg: number
  radius: number
  fireball: string
  effects: string
  logPower: number
  drawType: BombType
}

export interface PlacedBomb extends BombStats {
  x: number
  y: number
  fuseLeft: number
}

export interface Structure {
  kind: 'building' | 'car' | 'tree' | 'tower'
  x: number
  y: number
  w: number
  h: number
  hp: number
  maxHp: number
  color?: string
  id: number
}

export interface RepairCrew {
  x: number
  y: number
  tx: number
  ty: number
  hp: number
  maxHp: number
  speed: number
  repairTimer: number
  alive: boolean
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  decay: number
  size: number
  smoke: boolean
  hue: number
}

export interface Debris {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  decay: number
  rot: number
  vr: number
  size: number
}

export interface Shockwave {
  x: number
  y: number
  r: number
  maxR: number
  life: number
  w: number
  delay?: number
}

export interface Crater {
  x: number
  y: number
  r: number
  maxR: number
  life: number
}

export interface Mushroom {
  x: number
  y: number
  stemH: number
  capR: number
  maxStem: number
  maxCap: number
  life: number
}

export interface ArenaState {
  structures: Structure[]
  craters: Crater[]
  particles: Particle[]
  shockwaves: Shockwave[]
  debris: Debris[]
  repairCrews: RepairCrew[]
  damagedSites: { x: number; y: number }[]
  mushroom: Mushroom | null
  screenShake: number
  animating: boolean
  initialStructureHp: number
  totalRepaired: number
  roundOver: boolean
  lastDestructionPct: number
  crewsSpawned: boolean
  roundTimer: number
  placedBomb: PlacedBomb | null
  mouseX: number
  mouseY: number
}

export function createArenaState(): ArenaState {
  return {
    structures: [],
    craters: [],
    particles: [],
    shockwaves: [],
    debris: [],
    repairCrews: [],
    damagedSites: [],
    mushroom: null,
    screenShake: 0,
    animating: false,
    initialStructureHp: 0,
    totalRepaired: 0,
    roundOver: false,
    lastDestructionPct: 0,
    crewsSpawned: false,
    roundTimer: 0,
    placedBomb: null,
    mouseX: 0,
    mouseY: 0,
  }
}

export function drawBombGraphic(ctx: CanvasRenderingContext2D, type: string, cx: number, cy: number, scale: number) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  switch (type) {
    case 'flashbang':
      ctx.fillStyle = '#bbb'
      ctx.fillRect(-8, -14, 16, 28)
      ctx.fillStyle = '#888'
      for (let i = -10; i < 12; i += 5) {
        ctx.beginPath()
        ctx.arc(-9, i, 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(9, i, 2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = '#555'
      ctx.fillRect(6, -16, 3, 6)
      break
    case 'grenade':
      ctx.fillStyle = '#4a5a3a'
      ctx.beginPath()
      ctx.arc(0, 2, 14, 0, Math.PI * 2)
      ctx.fill()
      for (let i = 0; i < 8; i++) {
        ctx.save()
        ctx.rotate((i * Math.PI) / 4)
        ctx.fillStyle = '#3a4a2a'
        ctx.fillRect(-2, -14, 4, 6)
        ctx.restore()
      }
      ctx.fillStyle = '#666'
      ctx.fillRect(-4, -18, 8, 6)
      ctx.fillStyle = '#aa8800'
      ctx.fillRect(3, -20, 2, 5)
      break
    case 'dynamite':
      ctx.fillStyle = '#cc2222'
      ctx.fillRect(-22, -7, 18, 14)
      ctx.fillRect(-2, -7, 18, 14)
      ctx.fillRect(18, -7, 8, 14)
      ctx.fillStyle = '#333'
      ctx.fillRect(24, -10, 3, 20)
      ctx.fillStyle = '#ff6600'
      ctx.beginPath()
      ctx.arc(26, -12, 3, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'landmine':
      ctx.fillStyle = '#3a3a3a'
      ctx.beginPath()
      ctx.ellipse(0, 4, 20, 8, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#555'
      ctx.beginPath()
      ctx.ellipse(0, 0, 14, 5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#aa2222'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(-16, 0)
      ctx.lineTo(16, 0)
      ctx.stroke()
      break
    case 'mortar':
      ctx.fillStyle = '#5a6a4a'
      ctx.beginPath()
      ctx.moveTo(0, -22)
      ctx.lineTo(10, 18)
      ctx.lineTo(-10, 18)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#888'
      ctx.fillRect(-3, -24, 6, 4)
      break
    case 'artillery':
      ctx.fillStyle = '#6a7a5a'
      ctx.beginPath()
      ctx.moveTo(0, -28)
      ctx.quadraticCurveTo(8, -10, 7, 20)
      ctx.lineTo(-7, 20)
      ctx.quadraticCurveTo(-8, -10, 0, -28)
      ctx.fill()
      break
    case 'aerial':
      ctx.fillStyle = '#3a3a3a'
      ctx.beginPath()
      ctx.ellipse(0, 0, 12, 22, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#555'
      ctx.fillRect(-14, -4, 6, 10)
      ctx.fillRect(8, -4, 6, 10)
      break
    case 'moab':
      ctx.fillStyle = '#6a5a4a'
      ctx.fillRect(-28, -12, 56, 24)
      ctx.fillStyle = '#888'
      ctx.fillRect(26, -8, 8, 16)
      break
    case 'atomic':
      ctx.fillStyle = '#4a5a30'
      ctx.beginPath()
      ctx.ellipse(0, 0, 16, 20, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffcc00'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('N', 0, 4)
      break
    case 'hydrogen':
      ctx.fillStyle = '#3a4a28'
      ctx.beginPath()
      ctx.ellipse(0, 2, 20, 26, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffaa44'
      ctx.beginPath()
      ctx.arc(0, -2, 8, 0, Math.PI * 2)
      ctx.fill()
      break
    default:
      ctx.fillStyle = '#666'
      ctx.beginPath()
      ctx.arc(0, 0, 12, 0, Math.PI * 2)
      ctx.fill()
  }
  ctx.restore()
}

export function drawPartIcon(
  ctx: CanvasRenderingContext2D,
  part: string,
  casing: Casing,
  filler: Filler,
  charge: number,
) {
  ctx.clearRect(0, 0, 36, 36)
  ctx.fillStyle = '#0e1218'
  ctx.fillRect(0, 0, 36, 36)
  if (part === 'casing') {
    ctx.fillStyle =
      { paper: '#ccc', metal: '#6a7a6a', stick: '#cc3333', steel: '#555', heavy: '#4a3a2a' }[casing] || '#666'
    ctx.fillRect(8, 10, 20, 16)
    ctx.strokeStyle = '#888'
    ctx.strokeRect(8, 10, 20, 16)
  } else if (part === 'filler') {
    ctx.fillStyle =
      { flash: '#ffffaa', tnt: '#cc8800', rdx: '#aa6600', uranium: '#44aa44', fusion: '#ff6644' }[filler] || '#888'
    ctx.beginPath()
    ctx.arc(18, 18, 10, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.fillStyle = '#333'
    ctx.fillRect(8, 24, 20, 6)
    ctx.fillStyle = `hsl(${30 - charge * 0.3},80%,${40 + charge * 0.2}%)`
    ctx.fillRect(8, 24, (20 * charge) / 100, 6)
  }
}

export function chargeToKg(v: number) {
  if (v <= 30) return v * 10
  if (v <= 60) return (v - 30) * 100 + 300
  if (v <= 85) return (v - 60) * 4000 + 3300
  return (v - 85) * 2000000 + 103300
}

export function formatTnt(kg: number) {
  if (kg < 0.001) return `${(kg * 1e6).toFixed(0)} g`
  if (kg < 1) return `${(kg * 1000).toFixed(0)} g`
  if (kg < 1000) return `${kg.toFixed(kg < 10 ? 1 : 0)} kg`
  if (kg < 1e6) return `${(kg / 1000).toFixed(1)} t`
  if (kg < 1e9) return `${(kg / 1e6).toFixed(1)} kt`
  return `${(kg / 1e9).toFixed(1)} Mt`
}

function inferDrawType(o: BombOptions & { type?: BombType }): BombType {
  if (o.filler === 'flash') return 'flashbang'
  if (o.filler === 'fusion') return 'hydrogen'
  if (o.filler === 'uranium') return 'atomic'
  if (o.casing === 'stick') return 'dynamite'
  if (o.casing === 'heavy' && o.charge > 90) return 'moab'
  if (o.casing === 'heavy') return 'aerial'
  if (o.casing === 'steel' && o.charge > 50) return 'artillery'
  if (o.casing === 'steel') return 'mortar'
  if (o.shrapnel && o.charge < 15) return 'grenade'
  if (o.charge > 20) return 'landmine'
  return 'grenade'
}

export function calcBomb(opts: BombOptions & { name?: string; type?: BombType }): BombStats {
  const kg = chargeToKg(opts.charge)
  const tntKg = kg * FILLER_MULT[opts.filler]
  const logPower = Math.log10(Math.max(tntKg, 1e-6))
  const radius = Math.min(550, 20 + Math.pow(Math.max(tntKg, 0.0001), 1 / 3) * 14)
  const fireball =
    radius < 45
      ? 'Tiny'
      : radius < 90
        ? 'Small'
        : radius < 160
          ? 'Medium'
          : radius < 280
            ? 'Large'
            : radius < 420
              ? 'Huge'
              : 'Apocalyptic'
  const effects: string[] = []
  if (opts.filler === 'flash') effects.push('Blind flash')
  if (opts.shrapnel) effects.push('Shrapnel')
  if (opts.radiation) effects.push('Radiation')
  if (opts.filler === 'uranium' || opts.filler === 'fusion') effects.push('Mushroom cloud')
  if (!effects.length) effects.push('Blast wave')
  return {
    ...opts,
    name: opts.name || 'Custom Bomb',
    tntKg,
    radius,
    fireball,
    effects: effects.join(', '),
    logPower,
    drawType: opts.type || inferDrawType(opts),
  }
}

export function getCustomBombCost(b: BombStats) {
  return Math.max(10, Math.round(12 + b.radius * 1.45))
}

export function getBombCost(b: BombStats, presetId: string | null) {
  if (presetId) {
    const p = PRESETS.find((x) => x.id === presetId)
    if (p) return p.cost
  }
  return getCustomBombCost(b)
}

export function calcEarnings(destructionPct: number, cost: number) {
  const base = Math.round(destructionPct * 1.5)
  const bonus = Math.round((destructionPct / 100) * cost * 1.8)
  return Math.max(1, base + bonus)
}

export function drawTitleArt(ctx: CanvasRenderingContext2D) {
  const W = 360
  const H = 200
  const sky = ctx.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, '#020818')
  sky.addColorStop(0.5, '#0a2040')
  sky.addColorStop(1, '#1a5080')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, H)
  const cx = W / 2
  const cy = H * 0.72
  const R = 95
  const eg = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R)
  eg.addColorStop(0, '#4a90cc')
  eg.addColorStop(0.4, '#2266aa')
  eg.addColorStop(0.7, '#1a4488')
  eg.addColorStop(1, '#0a2040')
  ctx.fillStyle = eg
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#3a8a44'
  ctx.beginPath()
  ctx.ellipse(cx - 30, cy - 10, 35, 22, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + 40, cy + 5, 28, 18, 0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx - 5, cy + 25, 20, 12, 0, 0, Math.PI * 2)
  ctx.fill()
  const ag = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.15)
  ag.addColorStop(0, 'rgba(100,180,255,0)')
  ag.addColorStop(1, 'rgba(80,160,255,0.35)')
  ctx.fillStyle = ag
  ctx.beginPath()
  ctx.arc(cx, cy, R * 1.12, 0, Math.PI * 2)
  ctx.fill()
  const g = ctx.createRadialGradient(cx + 20, cy - 40, 2, cx + 20, cy - 40, 35)
  g.addColorStop(0, 'rgba(255,180,60,0.9)')
  g.addColorStop(1, 'rgba(255,60,20,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(cx + 20, cy - 40, 35, 0, Math.PI * 2)
  ctx.fill()
  drawBombGraphic(ctx, 'grenade', cx + 20, cy - 20, 1.2)
}

export function drawWorkbench(ctx: CanvasRenderingContext2D, bomb: BombStats | null) {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  ctx.fillStyle = '#2a2218'
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = '#1a1510'
  ctx.lineWidth = 3
  ctx.strokeRect(4, 4, w - 8, h - 8)
  if (bomb) drawBombGraphic(ctx, bomb.drawType, w / 2, h / 2 - 10, 2.2)
}

export function generateEarthCity(W: number, H: number): Pick<ArenaState, 'structures' | 'initialStructureHp'> {
  const structures: Structure[] = []
  const ground = H * 0.62
  const zones = [
    { x: W * 0.12, w: 65, h: 85 },
    { x: W * 0.28, w: 50, h: 120 },
    { x: W * 0.42, w: 75, h: 70 },
    { x: W * 0.58, w: 55, h: 95 },
    { x: W * 0.72, w: 80, h: 60 },
    { x: W * 0.86, w: 45, h: 80 },
  ]
  zones.forEach((z) =>
    structures.push({
      kind: 'building',
      x: z.x,
      y: ground,
      w: z.w,
      h: z.h,
      hp: 10,
      maxHp: 10,
      color: `hsl(${210 + Math.random() * 20},15%,${38 + Math.random() * 12}%)`,
      id: Math.random(),
    }),
  )
  for (let i = 0; i < 7; i++)
    structures.push({
      kind: 'car',
      x: 60 + i * ((W - 120) / 6) + Math.random() * 20,
      y: ground - 6,
      w: 40,
      h: 20,
      hp: 3,
      maxHp: 3,
      id: Math.random(),
    })
  for (let i = 0; i < 6; i++)
    structures.push({
      kind: 'tree',
      x: 30 + Math.random() * (W - 60),
      y: ground,
      w: 14,
      h: 35 + Math.random() * 25,
      hp: 1,
      maxHp: 1,
      id: Math.random(),
    })
  for (let i = 0; i < 4; i++)
    structures.push({
      kind: 'tower',
      x: W * 0.2 + i * W * 0.2,
      y: ground,
      w: 12,
      h: 45 + Math.random() * 30,
      hp: 4,
      maxHp: 4,
      id: Math.random(),
    })
  const initialStructureHp = structures.reduce((s, st) => s + st.hp, 0)
  return { structures, initialStructureHp }
}

export function getDestructionPct(state: ArenaState) {
  const cur = state.structures.reduce((s, st) => s + st.hp, 0)
  return state.initialStructureHp ? Math.round((1 - cur / state.initialStructureHp) * 100) : 0
}

export function getRepairPct(state: ArenaState) {
  return state.initialStructureHp ? Math.round((state.totalRepaired / state.initialStructureHp) * 100) : 0
}

export function spawnRepairCrews(state: ArenaState, W: number, H: number) {
  const ground = H * 0.62
  const targets = state.structures.slice(0, 5).map((s) => ({ x: s.x, y: s.y - s.h / 2 }))
  if (!targets.length) targets.push({ x: W / 2, y: ground - 40 })
  const count = Math.min(6, Math.max(3, Math.ceil(state.structures.length / 3)))
  for (let i = 0; i < count; i++) {
    const t = targets[i % targets.length]
    const fromLeft = i % 2 === 0
    state.repairCrews.push({
      x: fromLeft ? -25 : W + 25,
      y: ground - 10 - Math.random() * 25,
      tx: t.x,
      ty: t.y,
      hp: 5,
      maxHp: 5,
      speed: 1.2 + Math.random() * 0.5,
      repairTimer: 0,
      alive: true,
    })
  }
  state.crewsSpawned = true
}

export function damageInRadius(state: ArenaState, bx: number, by: number, radius: number, power: number) {
  state.structures.forEach((st) => {
    const dist = Math.hypot(st.x - bx, st.y - st.h / 2 - by)
    if (dist < radius) {
      st.hp -= (1 - dist / radius) * power
      if (st.hp < st.maxHp * 0.7) state.damagedSites.push({ x: st.x, y: st.y - st.h / 2 })
    }
  })
  state.structures = state.structures.filter((st) => st.hp > 0)
  state.repairCrews.forEach((c) => {
    const dist = Math.hypot(c.x - bx, c.y - by)
    if (dist < radius) c.hp -= (1 - dist / radius) * 8
  })
  state.repairCrews = state.repairCrews.filter((c) => c.hp > 0 && c.alive)
}

function drawEarthBackground(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const ground = H * 0.62
  const sky = ctx.createLinearGradient(0, 0, 0, ground)
  sky.addColorStop(0, '#020818')
  sky.addColorStop(0.4, '#0a2850')
  sky.addColorStop(1, '#1a6090')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  for (let i = 0; i < 60; i++) ctx.fillRect((i * 97) % W, (i * 53) % Math.floor(ground * 0.7), 1.5, 1.5)
  const cx = W / 2
  const cy = H + 80
  const R = H * 0.95
  const eg = ctx.createRadialGradient(cx - W * 0.1, cy - R * 0.55, R * 0.05, cx, cy, R)
  eg.addColorStop(0, '#3a90cc')
  eg.addColorStop(0.35, '#2277bb')
  eg.addColorStop(0.65, '#1a5599')
  eg.addColorStop(1, '#0a3060')
  ctx.fillStyle = eg
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#3a9a50'
  ;[
    [0.25, 0.52, 0.12, 0.06],
    [0.45, 0.48, 0.15, 0.05],
    [0.65, 0.5, 0.1, 0.04],
    [0.35, 0.56, 0.08, 0.03],
  ].forEach((l) => {
    ctx.beginPath()
    ctx.ellipse(l[0] * W, l[1] * H, l[2] * W, l[3] * H, 0, 0, Math.PI * 2)
    ctx.fill()
  })
  const ag = ctx.createRadialGradient(cx, cy - R * 0.55, cx, cy, R * 0.55, cx, cy, R * 0.62)
  ag.addColorStop(0, 'rgba(120,200,255,0)')
  ag.addColorStop(1, 'rgba(80,180,255,0.4)')
  ctx.fillStyle = ag
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.61, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#2a3a30'
  ctx.fillRect(0, ground - 4, W, H - ground + 4)
  ctx.fillStyle = '#3a4a38'
  ctx.fillRect(0, ground, W, H - ground)
}

function drawStructure(ctx: CanvasRenderingContext2D, st: Structure) {
  if (st.kind === 'building') {
    ctx.fillStyle = st.color || '#556'
    ctx.fillRect(st.x - st.w / 2, st.y - st.h, st.w, st.h)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(st.x - st.w / 2, st.y - st.h, st.w, st.h * 0.12)
    const cols = Math.floor(st.w / 16)
    const rows = Math.floor(st.h / 20)
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = `rgba(180,210,255,${0.25 + (((st.id * 100 + c + r) % 5) * 0.05)})`
        ctx.fillRect(st.x - st.w / 2 + 5 + c * 16, st.y - st.h + 16 + r * 20, 10, 14)
      }
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'
    ctx.strokeRect(st.x - st.w / 2, st.y - st.h, st.w, st.h)
  } else if (st.kind === 'car') {
    ctx.fillStyle = '#557799'
    ctx.fillRect(st.x - st.w / 2, st.y - st.h / 2, st.w, st.h * 0.55)
    ctx.fillStyle = '#6688aa'
    ctx.fillRect(st.x - st.w / 3, st.y - st.h, st.w * 0.65, st.h * 0.45)
    ctx.fillStyle = '#222'
    ctx.beginPath()
    ctx.arc(st.x - st.w / 3, st.y + 4, 4, 0, Math.PI * 2)
    ctx.arc(st.x + st.w / 3, st.y + 4, 4, 0, Math.PI * 2)
    ctx.fill()
  } else if (st.kind === 'tree') {
    ctx.fillStyle = '#5a4030'
    ctx.fillRect(st.x - 2, st.y - st.h * 0.4, 4, st.h * 0.4)
    ctx.fillStyle = '#2a8a3a'
    ctx.beginPath()
    ctx.moveTo(st.x, st.y - st.h)
    ctx.lineTo(st.x - 10, st.y - st.h * 0.35)
    ctx.lineTo(st.x + 10, st.y - st.h * 0.35)
    ctx.fill()
  } else if (st.kind === 'tower') {
    ctx.fillStyle = '#888'
    ctx.fillRect(st.x - 3, st.y - st.h, 6, st.h)
    ctx.fillStyle = '#aaa'
    ctx.fillRect(st.x - 8, st.y - st.h, 16, 4)
    ctx.fillStyle = '#ff4444'
    ctx.beginPath()
    ctx.arc(st.x, st.y - st.h - 4, 3, 0, Math.PI * 2)
    ctx.fill()
  }
  if (st.hp < st.maxHp) {
    ctx.fillStyle = 'rgba(255,60,40,0.55)'
    ctx.fillRect(st.x - st.w / 2, st.y - st.h - 5, st.w * (st.hp / st.maxHp), 3)
  }
}

function drawRepairCrew(ctx: CanvasRenderingContext2D, c: RepairCrew) {
  ctx.save()
  ctx.translate(c.x, c.y)
  ctx.fillStyle = '#44aa66'
  ctx.fillRect(-14, -8, 28, 14)
  ctx.fillStyle = '#338855'
  ctx.fillRect(-10, -12, 20, 6)
  ctx.fillStyle = '#ccc'
  ctx.fillRect(8, -6, 6, 4)
  ctx.fillStyle = '#ffcc44'
  ctx.beginPath()
  ctx.moveTo(-6, -14)
  ctx.lineTo(-2, -18)
  ctx.lineTo(2, -14)
  ctx.fill()
  if (c.hp < c.maxHp) {
    ctx.fillStyle = 'rgba(255,0,0,0.6)'
    ctx.fillRect(-14, -16, 28 * (c.hp / c.maxHp), 3)
  }
  ctx.restore()
}

export function drawArena(
  ctx: CanvasRenderingContext2D,
  state: ArenaState,
  arenaBomb: BombStats | null,
) {
  const W = ctx.canvas.width
  const H = ctx.canvas.height
  const ground = H * 0.62
  const sx = state.screenShake ? (Math.random() - 0.5) * state.screenShake * 2 : 0
  const sy = state.screenShake ? (Math.random() - 0.5) * state.screenShake * 2 : 0
  ctx.save()
  ctx.translate(sx, sy)
  drawEarthBackground(ctx, W, H)
  state.craters.forEach((cr) => {
    ctx.globalAlpha = 0.75
    const g = ctx.createRadialGradient(cr.x, cr.y, 0, cr.x, cr.y, cr.r)
    g.addColorStop(0, '#1a1008')
    g.addColorStop(0.5, '#3a2818')
    g.addColorStop(1, 'rgba(42,58,48,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(cr.x, cr.y, cr.r, cr.r * 0.3, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  })
  state.structures.forEach((st) => drawStructure(ctx, st))
  state.repairCrews.forEach((c) => drawRepairCrew(ctx, c))
  const showX = state.placedBomb ? state.placedBomb.x : state.mouseX
  const showY = state.placedBomb ? state.placedBomb.y : state.mouseY
  if (arenaBomb && !state.roundOver && !state.animating) {
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = 'rgba(255,100,50,0.35)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(showX, showY, arenaBomb.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }
  if (state.placedBomb) {
    drawBombGraphic(ctx, state.placedBomb.drawType, state.placedBomb.x, state.placedBomb.y, 1.5)
    if (state.placedBomb.fuseLeft > 0) {
      ctx.fillStyle = '#ff4422'
      ctx.font = 'bold 16px Bebas Neue,sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(String(state.placedBomb.fuseLeft), state.placedBomb.x, state.placedBomb.y - 30)
    }
  } else if (arenaBomb && state.mouseX > 0 && !state.roundOver) {
    ctx.globalAlpha = 0.55
    drawBombGraphic(ctx, arenaBomb.drawType, state.mouseX, Math.min(state.mouseY, ground - 15), 1.3)
    ctx.globalAlpha = 1
  }
  state.shockwaves.forEach((sw) => {
    if (sw.delay && sw.delay > 0) return
    ctx.strokeStyle = `rgba(255,120,60,${sw.life * 0.7})`
    ctx.lineWidth = sw.w
    ctx.beginPath()
    ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2)
    ctx.stroke()
  })
  state.particles.forEach((p) => {
    ctx.globalAlpha = p.life
    ctx.fillStyle = p.smoke ? `rgba(60,55,50,${p.life * 0.5})` : `hsl(${p.hue},100%,${45 + p.life * 20}%)`
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  })
  state.debris.forEach((d) => {
    ctx.save()
    ctx.translate(d.x, d.y)
    ctx.rotate(d.rot)
    ctx.globalAlpha = d.life
    ctx.fillStyle = '#999'
    ctx.fillRect(-d.size / 2, -d.size / 2, d.size, d.size * 0.6)
    ctx.restore()
    ctx.globalAlpha = 1
  })
  if (state.mushroom) {
    const m = state.mushroom
    ctx.globalAlpha = m.life * 0.75
    ctx.fillStyle = '#4a3a30'
    ctx.fillRect(m.x - 14, m.y - m.stemH, 28, m.stemH)
    const mg = ctx.createRadialGradient(m.x, m.y - m.stemH, 0, m.x, m.y - m.stemH, m.capR)
    mg.addColorStop(0, '#ff9944')
    mg.addColorStop(0.5, '#cc4422')
    mg.addColorStop(1, 'rgba(60,30,15,0)')
    ctx.fillStyle = mg
    ctx.beginPath()
    ctx.ellipse(m.x, m.y - m.stemH, m.capR, m.capR * 0.4, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
  ctx.restore()
}

export interface DetonateResult {
  flash: boolean
  screenShake: number
}

export function detonateBomb(state: ArenaState, b: PlacedBomb): DetonateResult {
  state.damagedSites = []
  const flash = b.filler === 'flash'
  const screenShake = flash ? 3 : Math.min(35, 5 + b.logPower * 1.8)
  state.screenShake = screenShake

  state.craters.push({ x: b.x, y: b.y, r: 0, maxR: b.radius * 0.35, life: 1 })
  state.shockwaves.push({ x: b.x, y: b.y, r: 0, maxR: b.radius * 1.5, life: 1, w: 4 })
  state.shockwaves.push({ x: b.x, y: b.y, r: 0, maxR: b.radius * 1.1, life: 1, w: 2, delay: 0.15 })
  const n = Math.min(250, 30 + b.radius * 0.6)
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const sp = 2 + Math.random() * b.radius * 0.1
    state.particles.push({
      x: b.x,
      y: b.y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 3,
      life: 1,
      decay: 0.008 + Math.random() * 0.015,
      size: 2 + Math.random() * 6,
      smoke: Math.random() > 0.4,
      hue: b.filler === 'fusion' ? 30 + Math.random() * 20 : 10 + Math.random() * 25,
    })
  }
  if (b.shrapnel)
    for (let i = 0; i < 35; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = 5 + Math.random() * 12
      state.debris.push({
        x: b.x,
        y: b.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 4,
        life: 1,
        decay: 0.006,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.3,
        size: 3 + Math.random() * 4,
      })
    }
  if (b.filler === 'uranium' || b.filler === 'fusion')
    state.mushroom = { x: b.x, y: b.y, stemH: 0, capR: 0, maxStem: b.radius * 1.3, maxCap: b.radius, life: 1 }

  const power = b.tntKg > 1000 ? 12 : 4
  damageInRadius(state, b.x, b.y, b.radius, power)
  state.lastDestructionPct = getDestructionPct(state)
  state.animating = true
  return { flash, screenShake }
}

export function tickArena(state: ArenaState, W: number, H: number): boolean {
  if (state.roundOver) return true

  let needsDraw = state.animating
  state.roundTimer++

  state.repairCrews.forEach((c) => {
    if (c.hp <= 0) {
      c.alive = false
      return
    }
    const dx = c.tx - c.x
    const dy = c.ty - c.y
    const dist = Math.hypot(dx, dy)
    if (dist > 8) {
      c.x += (dx / dist) * c.speed
      c.y += (dy / dist) * c.speed
      needsDraw = true
    } else {
      c.repairTimer++
      if (c.repairTimer % 25 === 0) {
        const target = state.structures.find((s) => Math.hypot(s.x - c.tx, s.y - s.h / 2 - c.ty) < 80)
        if (target && target.hp < target.maxHp) {
          target.hp = Math.min(target.maxHp, target.hp + 1)
          state.totalRepaired += 1
          needsDraw = true
        }
      }
    }
  })
  state.repairCrews = state.repairCrews.filter((c) => c.alive && c.hp > 0)

  if (state.animating) {
    let active = false
    state.particles.forEach((p) => {
      p.x += p.vx
      p.y += p.vy
      p.vy += p.smoke ? -0.02 : 0.06
      p.life -= p.decay
      if (p.life > 0) active = true
    })
    state.particles = state.particles.filter((p) => p.life > 0)
    state.debris.forEach((d) => {
      d.x += d.vx
      d.y += d.vy
      d.vy += 0.18
      d.rot += d.vr
      d.life -= d.decay
      if (d.life > 0) active = true
    })
    state.debris = state.debris.filter((d) => d.life > 0)
    state.shockwaves.forEach((sw) => {
      if (sw.delay && sw.delay > 0) {
        sw.delay -= 0.016
        return
      }
      sw.r += sw.maxR * 0.035
      sw.life -= 0.018
      if (sw.life > 0) active = true
    })
    state.shockwaves = state.shockwaves.filter((sw) => sw.life > 0)
    state.craters.forEach((cr) => {
      cr.r = Math.min(cr.maxR, cr.r + cr.maxR * 0.02)
    })
    if (state.mushroom) {
      state.mushroom.stemH = Math.min(state.mushroom.maxStem, state.mushroom.stemH + state.mushroom.maxStem * 0.025)
      state.mushroom.capR = Math.min(state.mushroom.maxCap, state.mushroom.capR + state.mushroom.maxCap * 0.02)
      state.mushroom.life -= 0.004
      if (state.mushroom.life > 0) active = true
      else state.mushroom = null
    }
    if (state.screenShake > 0.5) {
      state.screenShake *= 0.88
      active = true
    } else state.screenShake = 0
    if (!active) state.animating = false
    needsDraw = true
  }

  return needsDraw
}

export type RoundOutcome = 'win' | 'lose-repair' | 'lose-timeout' | null

export function checkRoundOutcome(state: ArenaState): RoundOutcome {
  const bombUsed = state.placedBomb === null && state.lastDestructionPct > 0
  if (!bombUsed || state.animating) return null

  if (state.crewsSpawned && state.repairCrews.length === 0) return 'win'
  if (getRepairPct(state) > Math.max(15, state.lastDestructionPct * 0.55)) return 'lose-repair'
  if (state.repairCrews.length > 0 && state.roundTimer > 720) return 'lose-timeout'
  return null
}

export function spawnExtraCrews(state: ArenaState, W: number, H: number) {
  const ground = H * 0.62
  for (let i = 0; i < 2; i++) {
    state.repairCrews.push({
      x: i % 2 === 0 ? -20 : W + 20,
      y: ground - 15,
      tx: state.damagedSites[i]?.x || W / 2,
      ty: state.damagedSites[i]?.y || ground - 30,
      hp: 4,
      maxHp: 4,
      speed: 1.6,
      repairTimer: 0,
      alive: true,
    })
  }
}

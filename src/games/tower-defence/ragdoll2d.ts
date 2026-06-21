export interface RagdollPoint {
  x: number
  y: number
  oldX: number
  oldY: number
  pinned: boolean
}

export interface RagdollLink {
  a: number
  b: number
  length: number
}

/** Stick-figure indices */
export const PELVIS = 0
export const SPINE = 1
export const CHEST = 2
export const HEAD = 3
export const L_HIP = 4
export const L_KNEE = 5
export const L_FOOT = 6
export const R_HIP = 7
export const R_KNEE = 8
export const R_FOOT = 9
export const L_SHOULDER = 10
export const L_ELBOW = 11
export const L_HAND = 12
export const R_SHOULDER = 13
export const R_ELBOW = 14
export const R_HAND = 15

const BONE_LINKS: [number, number][] = [
  [PELVIS, SPINE],
  [SPINE, CHEST],
  [CHEST, HEAD],
  [PELVIS, L_HIP],
  [L_HIP, L_KNEE],
  [L_KNEE, L_FOOT],
  [PELVIS, R_HIP],
  [R_HIP, R_KNEE],
  [R_KNEE, R_FOOT],
  [CHEST, L_SHOULDER],
  [L_SHOULDER, L_ELBOW],
  [L_ELBOW, L_HAND],
  [CHEST, R_SHOULDER],
  [R_SHOULDER, R_ELBOW],
  [R_ELBOW, R_HAND],
]

const LOCAL_POSE: [number, number][] = [
  [0, 0],
  [0, -16],
  [0, -32],
  [-2, -54],
  [-14, 6],
  [-16, 26],
  [-14, 46],
  [14, 6],
  [16, 26],
  [14, 46],
  [-20, -36],
  [-30, -52],
  [-38, -66],
  [20, -36],
  [30, -52],
  [38, -66],
]

export type RagdollDrawOpts = {
  color: string
  limbColor?: string
  facing: 1 | -1
  weaponAngle?: number
  weaponLength?: number
  weaponColor?: string
  leftPunch?: number
  rightPunch?: number
}

const LIMB_RADIUS = 13
const HEAD_RADIUS = 17
const TORSO_RADIUS = 10

function drawCapsule(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  radius: number,
) {
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy)
  if (len < 0.5) {
    ctx.beginPath()
    ctx.arc(ax, ay, radius, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  const nx = dx / len
  const ny = dy / len
  const px = -ny * radius
  const py = nx * radius
  const a0 = Math.atan2(py, px)
  const a1 = Math.atan2(-py, -px)

  ctx.beginPath()
  ctx.arc(ax, ay, radius, a0, a1)
  ctx.lineTo(bx - px, by - py)
  ctx.arc(bx, by, radius, a1, a0)
  ctx.lineTo(ax + px, ay + py)
  ctx.closePath()
  ctx.fill()
}

function drawTorso(
  ctx: CanvasRenderingContext2D,
  chest: RagdollPoint,
  pelvis: RagdollPoint,
  lShoulder: RagdollPoint,
  rShoulder: RagdollPoint,
) {
  const top = chest.y - 10
  const bottom = pelvis.y + 6
  const pad = 5
  const left = Math.min(lShoulder.x, rShoulder.x, chest.x, pelvis.x) - pad
  const right = Math.max(lShoulder.x, rShoulder.x, chest.x, pelvis.x) + pad
  const r = TORSO_RADIUS

  ctx.beginPath()
  ctx.moveTo(left + r, top)
  ctx.lineTo(right - r, top)
  ctx.arcTo(right, top, right, top + r, r)
  ctx.lineTo(right, bottom - r)
  ctx.arcTo(right, bottom, right - r, bottom, r)
  ctx.lineTo(left + r, bottom)
  ctx.arcTo(left, bottom, left, bottom - r, r)
  ctx.lineTo(left, top + r)
  ctx.arcTo(left, top, left + r, top, r)
  ctx.closePath()
  ctx.fill()
}

function strokeCapsule(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  radius: number,
) {
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy)
  if (len < 0.5) {
    ctx.beginPath()
    ctx.arc(ax, ay, radius, 0, Math.PI * 2)
    ctx.stroke()
    return
  }
  const nx = dx / len
  const ny = dy / len
  const px = -ny * radius
  const py = nx * radius
  const a0 = Math.atan2(py, px)
  const a1 = Math.atan2(-py, -px)

  ctx.beginPath()
  ctx.arc(ax, ay, radius, a0, a1)
  ctx.lineTo(bx - px, by - py)
  ctx.arc(bx, by, radius, a1, a0)
  ctx.lineTo(ax + px, ay + py)
  ctx.closePath()
  ctx.stroke()
}

export class Ragdoll2D {
  points: RagdollPoint[]
  links: RagdollLink[]
  facing: 1 | -1 = 1
  ragdollMode = false

  constructor(x: number, y: number, facing: 1 | -1 = 1) {
    this.facing = facing
    this.points = LOCAL_POSE.map(([lx, ly]) => {
      const fx = lx * facing
      return {
        x: x + fx,
        y: y + ly,
        oldX: x + fx,
        oldY: y + ly,
        pinned: false,
      }
    })
    this.links = BONE_LINKS.map(([a, b]) => {
      const pa = this.points[a]
      const pb = this.points[b]
      return { a, b, length: Math.hypot(pb.x - pa.x, pb.y - pa.y) }
    })
    this.pinStanding(x, y)
  }

  pinStanding(rootX: number, rootY: number) {
    this.ragdollMode = false
    for (let i = 0; i < this.points.length; i++) {
      const [lx, ly] = LOCAL_POSE[i]
      const fx = lx * this.facing
      const p = this.points[i]
      p.x = rootX + fx
      p.y = rootY + ly
      p.oldX = p.x
      p.oldY = p.y
      p.pinned = i === PELVIS
    }
  }

  setFacing(facing: 1 | -1) {
    if (facing === this.facing) return
    const cx = this.points[PELVIS].x
    const cy = this.points[PELVIS].y
    this.facing = facing
    for (let i = 0; i < this.points.length; i++) {
      const [lx, ly] = LOCAL_POSE[i]
      const p = this.points[i]
      p.x = cx + lx * facing
      p.y = cy + ly
      p.oldX = p.x
      p.oldY = p.y
    }
  }

  get root() {
    return this.points[PELVIS]
  }

  get head() {
    return this.points[HEAD]
  }

  get weaponHand() {
    return this.points[R_HAND]
  }

  applyImpulse(idx: number, ix: number, iy: number) {
    const p = this.points[idx]
    if (p.pinned) p.pinned = false
    this.ragdollMode = true
    p.oldX -= ix
    p.oldY -= iy
    for (const link of BONE_LINKS) {
      this.points[link[0]].pinned = false
      this.points[link[1]].pinned = false
    }
  }

  applyKnockback(ix: number, iy: number) {
    for (const p of this.points) {
      p.pinned = false
      p.oldX -= ix * 0.35
      p.oldY -= iy * 0.35
    }
    this.ragdollMode = true
  }

  driveRoot(x: number, y: number, strength = 0.22) {
    const p = this.points[PELVIS]
    if (this.ragdollMode) return
    p.pinned = true
    p.x += (x - p.x) * strength
    p.y += (y - p.y) * strength
    p.oldX = p.x
    p.oldY = p.y
    for (let i = 1; i < this.points.length; i++) {
      const pt = this.points[i]
      const [lx, ly] = LOCAL_POSE[i]
      const targetX = p.x + lx * this.facing
      const targetY = p.y + ly
      pt.x += (targetX - pt.x) * 0.35
      pt.y += (targetY - pt.y) * 0.35
      pt.oldX = pt.x
      pt.oldY = pt.y
      pt.pinned = false
    }
  }

  swingArm(intensity: number) {
    this.swingRightArm(intensity)
  }

  swingLeftArm(intensity: number) {
    if (this.ragdollMode) return
    const hand = this.points[L_HAND]
    const elbow = this.points[L_ELBOW]
    hand.x -= 20 * intensity
    hand.y -= 6 * intensity
    elbow.x -= 12 * intensity
    elbow.y -= 2 * intensity
  }

  swingRightArm(intensity: number) {
    if (this.ragdollMode) return
    const hand = this.points[R_HAND]
    const elbow = this.points[R_ELBOW]
    hand.x += 18 * this.facing * intensity
    hand.y -= 10 * intensity
    elbow.x += 10 * this.facing * intensity
    elbow.y -= 4 * intensity
  }

  step(dt: number, floorY: number) {
    const gravity = 1400
    const damping = 0.98
    const substeps = 3
    const subDt = dt / substeps

    for (let s = 0; s < substeps; s++) {
      for (const p of this.points) {
        if (p.pinned) continue
        const vx = (p.x - p.oldX) * damping
        const vy = (p.y - p.oldY) * damping
        p.oldX = p.x
        p.oldY = p.y
        p.x += vx
        p.y += vy + gravity * subDt * subDt
      }

      for (let iter = 0; iter < 5; iter++) {
        for (const link of this.links) {
          const a = this.points[link.a]
          const b = this.points[link.b]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const len = Math.hypot(dx, dy) || 0.0001
          const diff = ((len - link.length) / len) * 0.5
          const ox = dx * diff
          const oy = dy * diff
          if (!a.pinned) {
            a.x += ox
            a.y += oy
          }
          if (!b.pinned) {
            b.x -= ox
            b.y -= oy
          }
        }
      }

      for (const p of this.points) {
        const pad = p === this.points[L_FOOT] || p === this.points[R_FOOT] ? 2 : 6
        if (p.y > floorY - pad) {
          p.y = floorY - pad
          p.oldY = p.y
          p.oldX = p.x - (p.x - p.oldX) * 0.4
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, opts: RagdollDrawOpts) {
    const fill = opts.limbColor ?? opts.color
    const pts = this.points
    const outline = 'rgba(20, 24, 32, 0.45)'

    ctx.fillStyle = fill
    ctx.strokeStyle = outline
    ctx.lineWidth = 2.5
    ctx.lineJoin = 'round'

    // Legs (back)
    drawCapsule(ctx, pts[L_HIP].x, pts[L_HIP].y, pts[L_KNEE].x, pts[L_KNEE].y, LIMB_RADIUS)
    drawCapsule(ctx, pts[L_KNEE].x, pts[L_KNEE].y, pts[L_FOOT].x, pts[L_FOOT].y, LIMB_RADIUS)
    drawCapsule(ctx, pts[R_HIP].x, pts[R_HIP].y, pts[R_KNEE].x, pts[R_KNEE].y, LIMB_RADIUS)
    drawCapsule(ctx, pts[R_KNEE].x, pts[R_KNEE].y, pts[R_FOOT].x, pts[R_FOOT].y, LIMB_RADIUS)

    // Arms
    drawCapsule(ctx, pts[L_SHOULDER].x, pts[L_SHOULDER].y, pts[L_ELBOW].x, pts[L_ELBOW].y, LIMB_RADIUS)
    drawCapsule(ctx, pts[L_ELBOW].x, pts[L_ELBOW].y, pts[L_HAND].x, pts[L_HAND].y, LIMB_RADIUS)
    drawCapsule(ctx, pts[R_SHOULDER].x, pts[R_SHOULDER].y, pts[R_ELBOW].x, pts[R_ELBOW].y, LIMB_RADIUS)
    drawCapsule(ctx, pts[R_ELBOW].x, pts[R_ELBOW].y, pts[R_HAND].x, pts[R_HAND].y, LIMB_RADIUS)

    // Torso block
    drawTorso(ctx, pts[CHEST], pts[PELVIS], pts[L_SHOULDER], pts[R_SHOULDER])

    // Head (circle, slight gap above torso like the reference)
    ctx.beginPath()
    ctx.arc(pts[HEAD].x, pts[HEAD].y, HEAD_RADIUS, 0, Math.PI * 2)
    ctx.fill()

    // Subtle outline on major shapes
    ctx.strokeStyle = outline
    strokeCapsule(ctx, pts[L_HIP].x, pts[L_HIP].y, pts[L_FOOT].x, pts[L_FOOT].y, LIMB_RADIUS)
    strokeCapsule(ctx, pts[R_HIP].x, pts[R_HIP].y, pts[R_FOOT].x, pts[R_FOOT].y, LIMB_RADIUS)
    strokeCapsule(ctx, pts[L_SHOULDER].x, pts[L_SHOULDER].y, pts[L_HAND].x, pts[L_HAND].y, LIMB_RADIUS)
    strokeCapsule(ctx, pts[R_SHOULDER].x, pts[R_SHOULDER].y, pts[R_HAND].x, pts[R_HAND].y, LIMB_RADIUS)
    ctx.beginPath()
    ctx.arc(pts[HEAD].x, pts[HEAD].y, HEAD_RADIUS, 0, Math.PI * 2)
    ctx.stroke()

    if (opts.weaponLength != null && opts.weaponAngle != null) {
      const hand = this.weaponHand
      const len = opts.weaponLength
      const ang = opts.weaponAngle
      const ex = hand.x + Math.cos(ang) * len
      const ey = hand.y + Math.sin(ang) * len
      ctx.strokeStyle = opts.weaponColor ?? '#9098a8'
      ctx.lineWidth = 7
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(hand.x, hand.y)
      ctx.lineTo(ex, ey)
      ctx.stroke()
      ctx.lineWidth = 2.5
    }
  }

  hitPoints(): RagdollPoint[] {
    return [this.points[HEAD], this.points[CHEST], this.points[PELVIS], this.points[R_HAND]]
  }
}

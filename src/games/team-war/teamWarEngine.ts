import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  Fog,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
  CylinderGeometry,
  PlaneGeometry,
} from 'three'

export type Team = 'blue' | 'red'

export interface InputState {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  jump: boolean
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
}

interface Obstacle {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

interface Soldier {
  id: number
  team: Team
  isPlayer: boolean
  mesh: Group
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
}

interface Bullet {
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

const ARENA_W = 50
const ARENA_D = 60
const EYE_HEIGHT = 1.55
const BODY_RADIUS = 0.35
const MOVE_SPEED = 7
const AI_SPEED = 4.5
const GRAVITY = 22
const JUMP_VELOCITY = 8
const SHOOT_COOLDOWN = 0.35
const SHOOT_RANGE = 45
const DAMAGE = 34
const AI_THINK_INTERVAL = 0.4
const BULLET_SPEED = 62
const BULLET_MAX_RANGE = SHOOT_RANGE
const BULLET_RADIUS = 0.07
const BULLET_HIT_RADIUS = 0.55

const TEAM_COLOR: Record<Team, number> = {
  blue: 0x2563eb,
  red: 0xdc2626,
}

const OBSTACLES: Obstacle[] = [
  { minX: -8, maxX: -4, minZ: -6, maxZ: -2 },
  { minX: 4, maxX: 8, minZ: -6, maxZ: -2 },
  { minX: -6, maxX: -2, minZ: 4, maxZ: 8 },
  { minX: 2, maxX: 6, minZ: 4, maxZ: 8 },
  { minX: -2, maxX: 2, minZ: -2, maxZ: 2 },
  { minX: -12, maxX: -10, minZ: -12, maxZ: 12 },
  { minX: 10, maxX: 12, minZ: -12, maxZ: 12 },
]

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function createSoldierMesh(team: Team): Group {
  const group = new Group()
  const color = TEAM_COLOR[team]

  const bodyMat = new MeshStandardMaterial({ color, roughness: 0.7 })
  const skinMat = new MeshStandardMaterial({ color: 0xfbbf77, roughness: 0.8 })
  const gunMat = new MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5 })

  const body = new Mesh(new CylinderGeometry(BODY_RADIUS, BODY_RADIUS, 1.1, 10), bodyMat)
  body.position.y = 0.55
  group.add(body)

  const head = new Mesh(new SphereGeometry(0.28, 10, 10), skinMat)
  head.position.y = 1.25
  group.add(head)

  const gun = new Mesh(new BoxGeometry(0.12, 0.12, 0.55), gunMat)
  gun.position.set(0.22, 0.85, 0.35)
  group.add(gun)

  return group
}

function overlapsObstacle(x: number, z: number, padding = BODY_RADIUS): boolean {
  for (const o of OBSTACLES) {
    if (x + padding > o.minX && x - padding < o.maxX && z + padding > o.minZ && z - padding < o.maxZ) {
      return true
    }
  }
  return false
}

function arenaBounds(x: number, z: number, padding = BODY_RADIUS): boolean {
  return (
    x - padding < -ARENA_W / 2 ||
    x + padding > ARENA_W / 2 ||
    z - padding < -ARENA_D / 2 ||
    z + padding > ARENA_D / 2
  )
}

export class TeamWarEngine {
  readonly scene = new Scene()
  readonly camera = new PerspectiveCamera(75, 1, 0.1, 120)
  private renderer: WebGLRenderer | null = null
  private soldiers: Soldier[] = []
  private nextId = 1
  private playerId = -1
  private playerVelocityY = 0
  private playerOnGround = true
  private playerYaw = 0
  private playerPitch = 0
  private kills = 0
  private gameOver = false
  private won: boolean | null = null
  private muzzleFlashTimer = 0
  private gunGroup: Group | null = null
  private bullets: Bullet[] = []
  private bulletMeshTemplate: Mesh | null = null
  private readonly shootDir = new Vector3()

  mount(container: HTMLElement) {
    this.renderer = new WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setClearColor(0x87ceeb)
    container.appendChild(this.renderer.domElement)

    this.scene.background = new Color(0x87ceeb)
    this.scene.fog = new Fog(0x87ceeb, 35, 90)

    this.scene.add(new AmbientLight(0xffffff, 0.55))
    const sun = new DirectionalLight(0xfff4e0, 1.1)
    sun.position.set(20, 35, 10)
    this.scene.add(sun)

    const ground = new Mesh(
      new PlaneGeometry(ARENA_W + 10, ARENA_D + 10),
      new MeshStandardMaterial({ color: 0x4d7c3a, roughness: 1 }),
    )
    ground.rotation.x = -Math.PI / 2
    this.scene.add(ground)

    const wallMat = new MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 })
    for (const o of OBSTACLES) {
      const w = o.maxX - o.minX
      const d = o.maxZ - o.minZ
      const crate = new Mesh(new BoxGeometry(w, 1.6, d), wallMat)
      crate.position.set((o.minX + o.maxX) / 2, 0.8, (o.minZ + o.maxZ) / 2)
      this.scene.add(crate)
    }

    this.gunGroup = new Group()
    const gunBody = new Mesh(
      new BoxGeometry(0.08, 0.1, 0.45),
      new MeshStandardMaterial({ color: 0x1f2937 }),
    )
    gunBody.position.set(0.18, -0.14, -0.35)
    this.gunGroup.add(gunBody)
    this.camera.add(this.gunGroup)
    this.scene.add(this.camera)

    this.bulletMeshTemplate = new Mesh(
      new SphereGeometry(BULLET_RADIUS, 6, 6),
      new MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.8,
        roughness: 0.3,
      }),
    )

    this.spawnTeams()
    this.syncCameraToPlayer()
    this.resize(container.clientWidth, container.clientHeight)
    this.renderScene()
  }

  private spawnTeams() {
    const blueSpawns = [
      { x: -4, z: -24 },
      { x: 0, z: -26 },
      { x: 4, z: -24 },
      { x: -6, z: -22 },
      { x: 6, z: -22 },
    ]
    const redSpawns = [
      { x: -5, z: 24 },
      { x: 0, z: 26 },
      { x: 5, z: 24 },
      { x: -7, z: 22 },
      { x: 7, z: 22 },
      { x: 0, z: 20 },
    ]

    blueSpawns.forEach((s, i) => {
      const isPlayer = i === 1
      this.addSoldier('blue', s.x, s.z, isPlayer)
    })
    redSpawns.forEach((s) => {
      this.addSoldier('red', s.x, s.z, false)
    })
  }

  private addSoldier(team: Team, x: number, z: number, isPlayer: boolean) {
    const id = this.nextId++
    const mesh = createSoldierMesh(team)
    mesh.visible = !isPlayer
    mesh.position.set(x, 0, z)
    this.scene.add(mesh)

    const soldier: Soldier = {
      id,
      team,
      isPlayer,
      mesh,
      x,
      y: 0,
      z,
      yaw: team === 'blue' ? 0 : Math.PI,
      health: 100,
      alive: true,
      shootCooldown: 0,
      aiThinkTimer: Math.random() * AI_THINK_INTERVAL,
      aiTargetId: null,
      aiStrafeDir: Math.random() > 0.5 ? 1 : -1,
      aiStrafeTimer: 1 + Math.random() * 2,
    }

    if (isPlayer) {
      this.playerId = id
      this.playerYaw = 0
      this.playerPitch = 0
    }

    this.soldiers.push(soldier)
  }

  resize(width: number, height: number) {
    if (!this.renderer) return
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  update(delta: number, input: InputState): HudSnapshot {
    if (this.gameOver) {
      this.renderScene()
      return this.hudSnapshot()
    }

    const dt = clamp(delta, 0, 0.05)

    this.playerYaw -= input.lookDeltaX * 0.0022
    this.playerPitch -= input.lookDeltaY * 0.0022
    this.playerPitch = clamp(this.playerPitch, -1.1, 1.1)

    const player = this.soldiers.find((s) => s.id === this.playerId)
    if (player?.alive) {
      this.updatePlayer(player, input, dt)
    }

    for (const soldier of this.soldiers) {
      if (!soldier.alive || soldier.isPlayer) continue
      this.updateAi(soldier, dt)
    }

    for (const soldier of this.soldiers) {
      soldier.shootCooldown = Math.max(0, soldier.shootCooldown - dt)
    }

    if (input.shoot && player?.alive && player.shootCooldown <= 0) {
      this.fireWeapon(player)
    }

    this.updateBullets(dt)

    this.muzzleFlashTimer = Math.max(0, this.muzzleFlashTimer - dt)
    if (this.gunGroup) {
      this.gunGroup.position.z = this.muzzleFlashTimer > 0 ? -0.04 : 0
    }

    this.syncMeshes()
    this.checkWinCondition()
    this.renderScene()

    return this.hudSnapshot()
  }

  private updatePlayer(player: Soldier, input: InputState, dt: number) {
    const sin = Math.sin(this.playerYaw)
    const cos = Math.cos(this.playerYaw)

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
      moveX = (moveX / len) * MOVE_SPEED * dt
      moveZ = (moveZ / len) * MOVE_SPEED * dt
    }

    this.tryMove(player, moveX, moveZ)

    if (input.jump && this.playerOnGround) {
      this.playerVelocityY = JUMP_VELOCITY
      this.playerOnGround = false
    }

    this.playerVelocityY -= GRAVITY * dt
    player.y += this.playerVelocityY * dt
    if (player.y <= 0) {
      player.y = 0
      this.playerVelocityY = 0
      this.playerOnGround = true
    }

    player.yaw = this.playerYaw
    this.camera.position.set(player.x, player.y + EYE_HEIGHT, player.z)
    this.camera.rotation.order = 'YXZ'
    this.camera.rotation.y = this.playerYaw
    this.camera.rotation.x = this.playerPitch
  }

  private tryMove(soldier: Soldier, dx: number, dz: number) {
    const nextX = soldier.x + dx
    if (!overlapsObstacle(nextX, soldier.z) && !arenaBounds(nextX, soldier.z)) {
      soldier.x = nextX
    }
    const nextZ = soldier.z + dz
    if (!overlapsObstacle(soldier.x, nextZ) && !arenaBounds(soldier.x, nextZ)) {
      soldier.z = nextZ
    }
  }

  private updateAi(soldier: Soldier, dt: number) {
    soldier.aiThinkTimer -= dt
    soldier.aiStrafeTimer -= dt
    if (soldier.aiStrafeTimer <= 0) {
      soldier.aiStrafeDir = Math.random() > 0.5 ? 1 : -1
      soldier.aiStrafeTimer = 1.2 + Math.random() * 2.5
    }

    if (soldier.aiThinkTimer <= 0) {
      soldier.aiThinkTimer = AI_THINK_INTERVAL
      const enemies = this.soldiers.filter((s) => s.alive && s.team !== soldier.team)
      if (enemies.length === 0) {
        soldier.aiTargetId = null
      } else {
        let best: Soldier | null = null
        let bestScore = Infinity
        for (const e of enemies) {
          const d = Math.hypot(e.x - soldier.x, e.z - soldier.z)
          const los = this.hasLineOfSight(soldier, e)
          const score = d + (los ? 0 : 18)
          if (score < bestScore) {
            bestScore = score
            best = e
          }
        }
        soldier.aiTargetId = best?.id ?? null
      }
    }

    const target = this.soldiers.find((s) => s.id === soldier.aiTargetId && s.alive)
    if (!target) return

    const dx = target.x - soldier.x
    const dz = target.z - soldier.z
    const dist = Math.hypot(dx, dz)
    soldier.yaw = Math.atan2(dx, dz)

    const canSee = this.hasLineOfSight(soldier, target)
    const inRange = dist < SHOOT_RANGE

    if (inRange && canSee) {
      if (dist > 10) {
        const move = this.pickAiMoveDirection(soldier, target, dt, 0.55)
        this.tryMove(soldier, move.dx, move.dz)
      } else if (dist < 5) {
        const retreatAngle = Math.atan2(-dx, -dz)
        const mx = Math.sin(retreatAngle) * AI_SPEED * 0.7 * dt
        const mz = Math.cos(retreatAngle) * AI_SPEED * 0.7 * dt
        this.tryMove(soldier, mx, mz)
      } else {
        const strafeAngle = soldier.yaw + (Math.PI / 2) * soldier.aiStrafeDir
        const mx = Math.sin(strafeAngle) * AI_SPEED * 0.65 * dt
        const mz = Math.cos(strafeAngle) * AI_SPEED * 0.65 * dt
        this.tryMove(soldier, mx, mz)
      }

      if (soldier.shootCooldown <= 0) {
        this.fireWeapon(soldier, target)
      }
      return
    }

    const move = this.pickAiMoveDirection(soldier, target, dt, 1)
    this.tryMove(soldier, move.dx, move.dz)

    if (inRange && soldier.shootCooldown <= 0 && canSee) {
      this.fireWeapon(soldier, target)
    }
  }

  private pickAiMoveDirection(
    soldier: Soldier,
    target: Soldier,
    dt: number,
    urgency: number,
  ): { dx: number; dz: number } {
    const dx = target.x - soldier.x
    const dz = target.z - soldier.z
    const dist = Math.hypot(dx, dz)
    if (dist < 0.01) return { dx: 0, dz: 0 }

    const baseAngle = Math.atan2(dx, dz)
    const offsets = [0, -0.5, 0.5, -1.0, 1.0, -1.57, 1.57, 2.2, -2.2, Math.PI]

    let bestDx = 0
    let bestDz = 0
    let bestScore = -Infinity

    for (const offset of offsets) {
      const angle = baseAngle + offset
      const mx = Math.sin(angle) * AI_SPEED * dt * urgency
      const mz = Math.cos(angle) * AI_SPEED * dt * urgency
      const nextX = soldier.x + mx
      const nextZ = soldier.z + mz

      if (overlapsObstacle(nextX, nextZ) || arenaBounds(nextX, nextZ)) continue

      const newDist = Math.hypot(target.x - nextX, target.z - nextZ)
      const progress = dist - newDist
      const losBonus = this.hasLineOfSightAt(nextX, nextZ, target) ? 1.2 : 0
      const turnPenalty = Math.abs(offset) * 0.2
      const score = progress + losBonus - turnPenalty

      if (score > bestScore) {
        bestScore = score
        bestDx = mx
        bestDz = mz
      }
    }

    if (bestScore > -Infinity) {
      return { dx: bestDx, dz: bestDz }
    }

    const fallbackAngle = baseAngle + (Math.random() > 0.5 ? 1.2 : -1.2)
    return {
      dx: Math.sin(fallbackAngle) * AI_SPEED * dt * 0.5,
      dz: Math.cos(fallbackAngle) * AI_SPEED * dt * 0.5,
    }
  }

  private hasLineOfSightAt(fromX: number, fromZ: number, to: Soldier): boolean {
    const dx = to.x - fromX
    const dz = to.z - fromZ
    const dist = Math.hypot(dx, dz)
    if (dist < 0.01) return true

    const steps = Math.ceil(dist / 0.45)
    for (let i = 1; i < steps; i++) {
      const t = i / steps
      const x = fromX + dx * t
      const z = fromZ + dz * t
      if (overlapsObstacle(x, z, 0.15)) return false
    }
    return true
  }

  private hasLineOfSight(from: Soldier, to: Soldier): boolean {
    const dx = to.x - from.x
    const dz = to.z - from.z
    const dist = Math.hypot(dx, dz)
    if (dist < 0.01) return true

    const steps = Math.ceil(dist / 0.5)
    for (let i = 1; i < steps; i++) {
      const t = i / steps
      const x = from.x + dx * t
      const z = from.z + dz * t
      if (overlapsObstacle(x, z, 0.1)) return false
    }
    return true
  }

  private fireWeapon(shooter: Soldier, aimTarget?: Soldier) {
    shooter.shootCooldown = SHOOT_COOLDOWN

    if (shooter.isPlayer) {
      this.muzzleFlashTimer = 0.08
    }

    this.shootDir.set(0, 0, -1)
    if (shooter.isPlayer) {
      this.shootDir.applyQuaternion(this.camera.quaternion)
    } else if (aimTarget) {
      const aimY = aimTarget.y + 1.0
      const shooterY = shooter.y + 1.0
      this.shootDir
        .set(aimTarget.x - shooter.x, aimY - shooterY, aimTarget.z - shooter.z)
        .normalize()
      this.shootDir.x += (Math.random() - 0.5) * 0.04
      this.shootDir.y += (Math.random() - 0.5) * 0.02
      this.shootDir.z += (Math.random() - 0.5) * 0.04
      this.shootDir.normalize()
    } else {
      this.shootDir.set(Math.sin(shooter.yaw), 0, Math.cos(shooter.yaw))
    }

    const origin = new Vector3(
      shooter.isPlayer ? this.camera.position.x : shooter.x + Math.sin(shooter.yaw) * 0.35,
      shooter.isPlayer ? this.camera.position.y - 0.1 : shooter.y + 0.95,
      shooter.isPlayer ? this.camera.position.z : shooter.z + Math.cos(shooter.yaw) * 0.35,
    )

    origin.addScaledVector(this.shootDir, 0.35)
    this.spawnBullet(origin, this.shootDir, shooter.team, shooter.id)
  }

  private spawnBullet(origin: Vector3, direction: Vector3, team: Team, shooterId: number) {
    if (!this.bulletMeshTemplate) return

    const mesh = this.bulletMeshTemplate.clone()
    mesh.position.set(origin.x, origin.y, origin.z)
    this.scene.add(mesh)

    const speed = BULLET_SPEED
    this.bullets.push({
      mesh,
      x: origin.x,
      y: origin.y,
      z: origin.z,
      vx: direction.x * speed,
      vy: direction.y * speed,
      vz: direction.z * speed,
      team,
      shooterId,
      distance: 0,
      alive: true,
    })
  }

  private updateBullets(dt: number) {
    for (const bullet of this.bullets) {
      if (!bullet.alive) continue

      const stepX = bullet.vx * dt
      const stepY = bullet.vy * dt
      const stepZ = bullet.vz * dt
      const stepLen = Math.hypot(stepX, stepY, stepZ)

      bullet.x += stepX
      bullet.y += stepY
      bullet.z += stepZ
      bullet.distance += stepLen
      bullet.mesh.position.set(bullet.x, bullet.y, bullet.z)

      if (bullet.distance >= BULLET_MAX_RANGE || bullet.y < -0.5 || bullet.y > 8) {
        bullet.alive = false
        continue
      }

      if (overlapsObstacle(bullet.x, bullet.z, 0.05)) {
        bullet.alive = false
        continue
      }

      for (const soldier of this.soldiers) {
        if (!soldier.alive || soldier.team === bullet.team) continue
        const hitY = soldier.y + 0.85
        const dist = Math.hypot(bullet.x - soldier.x, bullet.y - hitY, bullet.z - soldier.z)
        if (dist > BULLET_HIT_RADIUS) continue

        soldier.health -= DAMAGE
        bullet.alive = false

        if (soldier.health <= 0) {
          soldier.alive = false
          soldier.mesh.visible = false
          const shooter = this.soldiers.find((s) => s.id === bullet.shooterId)
          if (shooter?.team === 'blue' && soldier.team === 'red') {
            this.kills += 1
          }
        }
        break
      }
    }

    this.bullets = this.bullets.filter((b) => {
      if (b.alive) return true
      this.scene.remove(b.mesh)
      b.mesh.geometry.dispose()
      ;(b.mesh.material as MeshStandardMaterial).dispose()
      return false
    })
  }

  private syncMeshes() {
    for (const s of this.soldiers) {
      if (s.isPlayer) continue
      s.mesh.position.set(s.x, s.y, s.z)
      s.mesh.rotation.y = s.yaw
    }
  }

  private checkWinCondition() {
    const blueAlive = this.soldiers.filter((s) => s.team === 'blue' && s.alive).length
    const redAlive = this.soldiers.filter((s) => s.team === 'red' && s.alive).length

    if (redAlive === 0) {
      this.gameOver = true
      this.won = true
    } else if (blueAlive === 0) {
      this.gameOver = true
      this.won = false
    }
  }

  private hudSnapshot(): HudSnapshot {
    const blueAlive = this.soldiers.filter((s) => s.team === 'blue' && s.alive).length
    const redAlive = this.soldiers.filter((s) => s.team === 'red' && s.alive).length
    const player = this.soldiers.find((s) => s.id === this.playerId)

    let message = 'Blue team — eliminate the red soldiers!'
    if (this.gameOver) {
      message = this.won ? 'Victory! Red team defeated.' : 'Defeat! Blue team wiped out.'
    } else if (player && !player.alive) {
      message = 'You fell in battle. Allies still fighting…'
    }

    return {
      health: player?.health ?? 0,
      blueAlive,
      redAlive,
      kills: this.kills,
      gameOver: this.gameOver,
      won: this.won,
      message,
    }
  }

  private renderScene() {
    this.renderer?.render(this.scene, this.camera)
  }

  private syncCameraToPlayer() {
    const player = this.soldiers.find((s) => s.id === this.playerId)
    if (!player) return
    this.camera.position.set(player.x, player.y + EYE_HEIGHT, player.z)
    this.camera.rotation.order = 'YXZ'
    this.camera.rotation.y = this.playerYaw
    this.camera.rotation.x = this.playerPitch
  }

  renderPaused() {
    this.syncCameraToPlayer()
    this.renderScene()
  }

  reset() {
    for (const s of this.soldiers) {
      this.scene.remove(s.mesh)
    }
    for (const b of this.bullets) {
      this.scene.remove(b.mesh)
      b.mesh.geometry.dispose()
      ;(b.mesh.material as MeshStandardMaterial).dispose()
    }
    this.bullets = []
    this.soldiers = []
    this.kills = 0
    this.gameOver = false
    this.won = null
    this.playerVelocityY = 0
    this.playerOnGround = true
    this.spawnTeams()
    this.syncCameraToPlayer()
  }

  dispose(container: HTMLElement) {
    if (this.renderer) {
      container.removeChild(this.renderer.domElement)
      this.renderer.dispose()
      this.renderer = null
    }
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.renderer?.domElement ?? null
  }
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

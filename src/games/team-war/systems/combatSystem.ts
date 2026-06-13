import { Mesh, MeshStandardMaterial, Scene, SphereGeometry, Vector3, type Group } from 'three'
import {
  BULLET_HIT_RADIUS,
  BULLET_MAX_RANGE,
  BULLET_RADIUS,
  BULLET_SPEED,
  SHOOT_COOLDOWN,
  SHOOT_RANGE,
  SOLDIER_DAMAGE,
  PLAYER_IMMORTAL,
} from '../engine/constants'
import type { Bullet, GameState, Soldier, Team } from '../engine/types'
import { syncSoldierTransform } from '../entities/soldier'
import { overlapsSolidAtHeight } from '../world/obstacles'
import { spawnAidKit } from './aidKitSystem'

export { SHOOT_RANGE }

export function createBulletTemplate(): Mesh {
  return new Mesh(
    new SphereGeometry(BULLET_RADIUS, 6, 6),
    new MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    }),
  )
}

function spawnBullet(
  scene: Scene,
  template: Mesh,
  bullets: Bullet[],
  origin: Vector3,
  direction: Vector3,
  team: Team,
  shooterId: number,
) {
  const mesh = template.clone()
  mesh.position.copy(origin)
  scene.add(mesh)

  bullets.push({
    mesh,
    x: origin.x,
    y: origin.y,
    z: origin.z,
    vx: direction.x * BULLET_SPEED,
    vy: direction.y * BULLET_SPEED,
    vz: direction.z * BULLET_SPEED,
    team,
    shooterId,
    distance: 0,
    alive: true,
  })
}

export function fireWeapon(
  state: GameState,
  scene: Scene,
  template: Mesh,
  shooter: Soldier,
  direction: Vector3,
  origin: Vector3,
) {
  shooter.shootCooldown = SHOOT_COOLDOWN
  shooter.justShot = true

  if (shooter.isPlayer) {
    state.muzzleFlashTimer = 0.08
  }

  const shotOrigin = origin.clone()
  shotOrigin.addScaledVector(direction, 0.35)
  spawnBullet(scene, template, state.bullets, shotOrigin, direction, shooter.team, shooter.id)
}

export function computeAiShotDirection(shooter: Soldier, aimTarget: Soldier, out: Vector3) {
  const aimY = aimTarget.y + 1.0
  const shooterY = shooter.y + 1.0
  out.set(aimTarget.x - shooter.x, aimY - shooterY, aimTarget.z - shooter.z).normalize()
  out.x += (Math.random() - 0.5) * 0.04
  out.y += (Math.random() - 0.5) * 0.02
  out.z += (Math.random() - 0.5) * 0.04
  out.normalize()
}

export function computeAiShotOrigin(shooter: Soldier, out: Vector3) {
  out.set(
    shooter.x + Math.sin(shooter.yaw) * 0.35,
    shooter.y + 0.95,
    shooter.z + Math.cos(shooter.yaw) * 0.35,
  )
}

export function killSoldier(
  state: GameState,
  scene: Scene,
  soldier: Soldier,
  bullet: Bullet,
  hitPoint: Vector3,
  bulletImpulse: Vector3,
  aidKitTemplate: Group | null,
  nextAidKitId: () => number,
) {
  soldier.alive = false

  hitPoint.set(bullet.x, bullet.y, bullet.z)
  bulletImpulse.set(bullet.vx, bullet.vy, bullet.vz)

  syncSoldierTransform(soldier)
  soldier.rig.updateAnimation(0, soldier.moveSpeed, soldier.justShot)

  soldier.rig.activateRagdoll(scene, bulletImpulse, hitPoint)

  if (aidKitTemplate) {
    spawnAidKit(scene, aidKitTemplate, state.aidKits, nextAidKitId, soldier.x, soldier.y, soldier.z)
  }

  const shooter = state.soldiers.find((s) => s.id === bullet.shooterId)
  if (shooter?.team === 'blue' && soldier.team === 'red') {
    state.kills += 1
  }
}

export function updateBullets(
  state: GameState,
  scene: Scene,
  dt: number,
  aidKitTemplate: Group | null,
  nextAidKitId: () => number,
) {
  const { soldiers, bullets } = state
  const hitPoint = new Vector3()
  const bulletImpulse = new Vector3()

  for (const bullet of bullets) {
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

    if (overlapsSolidAtHeight(bullet.x, bullet.z, bullet.y, 0.05)) {
      bullet.alive = false
      continue
    }

    for (const soldier of soldiers) {
      if (!soldier.alive || soldier.team === bullet.team) continue
      const hitY = soldier.y + 0.85
      const dist = Math.hypot(bullet.x - soldier.x, bullet.y - hitY, bullet.z - soldier.z)
      if (dist > BULLET_HIT_RADIUS) continue

      if (soldier.isPlayer && PLAYER_IMMORTAL) {
        bullet.alive = false
        break
      }

      soldier.health -= SOLDIER_DAMAGE
      bullet.alive = false

      if (soldier.health <= 0) {
        killSoldier(state, scene, soldier, bullet, hitPoint, bulletImpulse, aidKitTemplate, nextAidKitId)
      }
      break
    }
  }

  state.bullets = bullets.filter((b) => {
    if (b.alive) return true
    scene.remove(b.mesh)
    b.mesh.geometry.dispose()
    ;(b.mesh.material as MeshStandardMaterial).dispose()
    return false
  })
}

export function disposeBullets(scene: Scene, bullets: Bullet[]) {
  for (const b of bullets) {
    scene.remove(b.mesh)
    b.mesh.geometry.dispose()
    ;(b.mesh.material as MeshStandardMaterial).dispose()
  }
}

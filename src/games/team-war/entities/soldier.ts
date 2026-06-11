import type { Scene } from 'three'
import {
  AI_THINK_INTERVAL,
  PLAYER_SPAWN_INDEX,
  SHOOT_COOLDOWN,
  SOLDIERS_PER_TEAM,
  SOLDIER_HEALTH,
  SPAWN_FORMATION,
} from '../engine/constants'
import type { Soldier, Team } from '../engine/types'
import { StickmanRig } from '../stickmanRig'

export function createSoldier(
  scene: Scene,
  id: number,
  team: Team,
  x: number,
  z: number,
  isPlayer: boolean,
): Soldier {
  const rig = new StickmanRig(team)
  rig.root.visible = !isPlayer
  rig.root.position.set(x, 0, z)
  scene.add(rig.root)

  return {
    id,
    team,
    isPlayer,
    rig,
    x,
    y: 0,
    z,
    yaw: team === 'blue' ? 0 : Math.PI,
    health: SOLDIER_HEALTH,
    alive: true,
    shootCooldown: 0,
    aiThinkTimer: Math.random() * AI_THINK_INTERVAL,
    aiTargetId: null,
    aiStrafeDir: Math.random() > 0.5 ? 1 : -1,
    aiStrafeTimer: 1 + Math.random() * 2,
    aiPathTimer: Math.random() * 0.3,
    path: [],
    pathIndex: 0,
    lastX: x,
    lastZ: z,
    moveSpeed: 0,
    justShot: false,
  }
}

export function spawnTeams(scene: Scene, nextId: () => number, playerIdOut: { value: number }) {
  const soldiers: Soldier[] = []

  for (let i = 0; i < SOLDIERS_PER_TEAM; i++) {
    const spawn = SPAWN_FORMATION[i]
    const isPlayer = i === PLAYER_SPAWN_INDEX
    const soldier = createSoldier(scene, nextId(), 'blue', spawn.x, spawn.z, isPlayer)
    if (isPlayer) playerIdOut.value = soldier.id
    soldiers.push(soldier)
  }

  for (let i = 0; i < SOLDIERS_PER_TEAM; i++) {
    const spawn = SPAWN_FORMATION[i]
    soldiers.push(createSoldier(scene, nextId(), 'red', spawn.x, -spawn.z, false))
  }

  return soldiers
}

export function syncSoldierTransform(soldier: Soldier) {
  soldier.rig.root.position.set(soldier.x, soldier.y, soldier.z)
  soldier.rig.root.rotation.y = soldier.yaw
}

export function syncSoldierVisuals(soldiers: Soldier[], dt: number) {
  for (const s of soldiers) {
    if (!s.alive || s.rig.isRagdoll) continue

    if (!s.isPlayer) {
      const dx = s.x - s.lastX
      const dz = s.z - s.lastZ
      s.moveSpeed = Math.hypot(dx, dz) / Math.max(dt, 0.001)
      s.lastX = s.x
      s.lastZ = s.z
    }

    syncSoldierTransform(s)
    s.rig.updateAnimation(dt, s.moveSpeed, s.justShot || s.shootCooldown > SHOOT_COOLDOWN - 0.12)
  }
}

export function disposeSoldiers(scene: Scene, soldiers: Soldier[]) {
  for (const s of soldiers) {
    s.rig.dispose(scene)
    scene.remove(s.rig.root)
  }
}

export function findSoldier(soldiers: Soldier[], id: number) {
  return soldiers.find((s) => s.id === id)
}

export function countAlive(soldiers: Soldier[], team: Team) {
  return soldiers.filter((s) => s.team === team && s.alive).length
}

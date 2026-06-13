import {
  AI_PATH_REPLAN_INTERVAL,
  AI_THINK_INTERVAL,
  PATH_WAYPOINT_RADIUS,
  SHOOT_RANGE,
  SOLDIER_SPEED,
} from '../engine/constants'
import type { GameState, Soldier } from '../engine/types'
import { hasLineOfSight, pickTarget } from '../ai/lineOfSight'
import { findWorldPath } from '../ai/pathfinder'
import type { NavigationGrid } from '../world/navigationGrid'
import { moveToward, tryMove } from './movementSystem'
import {
  computeAiShotDirection,
  computeAiShotOrigin,
  fireWeapon,
} from './combatSystem'
import { shouldAiJump, updateSoldierVertical } from './verticalSystem'
import type { Mesh, Scene, Vector3 } from 'three'

export function updateAi(
  soldier: Soldier,
  state: GameState,
  scene: Scene,
  bulletTemplate: Mesh,
  nav: NavigationGrid,
  shootDir: Vector3,
  shotOrigin: Vector3,
  dt: number,
) {
  soldier.aiThinkTimer -= dt
  soldier.aiStrafeTimer -= dt
  soldier.aiPathTimer -= dt

  if (soldier.aiStrafeTimer <= 0) {
    soldier.aiStrafeDir = Math.random() > 0.5 ? 1 : -1
    soldier.aiStrafeTimer = 1.2 + Math.random() * 2.5
  }

  if (soldier.aiThinkTimer <= 0) {
    soldier.aiThinkTimer = AI_THINK_INTERVAL
    const enemies = state.soldiers.filter((s) => s.alive && s.team !== soldier.team)
    const best = pickTarget(enemies, soldier)
    soldier.aiTargetId = best?.id ?? null
    soldier.aiPathTimer = 0
  }

  const target = state.soldiers.find((s) => s.id === soldier.aiTargetId && s.alive)
  if (!target) {
    soldier.path = []
    soldier.pathIndex = 0
    updateSoldierVertical(soldier, false, dt)
    return
  }

  const dx = target.x - soldier.x
  const dz = target.z - soldier.z
  const dist = Math.hypot(dx, dz)
  soldier.yaw = Math.atan2(dx, dz)

  const canSee = hasLineOfSight(soldier, target)
  const inRange = dist < SHOOT_RANGE

  if (inRange && canSee) {
    soldier.path = []
    soldier.pathIndex = 0

    if (dist > 10) {
      moveToward(soldier, target.x, target.z, SOLDIER_SPEED * 0.55 * dt)
      updateSoldierVertical(soldier, shouldAiJump(soldier, target.x, target.z), dt)
    } else if (dist < 5) {
      const retreatAngle = Math.atan2(-dx, -dz)
      tryMove(
        soldier,
        Math.sin(retreatAngle) * SOLDIER_SPEED * 0.7 * dt,
        Math.cos(retreatAngle) * SOLDIER_SPEED * 0.7 * dt,
      )
      updateSoldierVertical(soldier, false, dt)
    } else {
      const strafeAngle = soldier.yaw + (Math.PI / 2) * soldier.aiStrafeDir
      tryMove(
        soldier,
        Math.sin(strafeAngle) * SOLDIER_SPEED * 0.65 * dt,
        Math.cos(strafeAngle) * SOLDIER_SPEED * 0.65 * dt,
      )
      updateSoldierVertical(soldier, false, dt)
    }

    if (soldier.shootCooldown <= 0) {
      computeAiShotDirection(soldier, target, shootDir)
      computeAiShotOrigin(soldier, shotOrigin)
      fireWeapon(state, scene, bulletTemplate, soldier, shootDir, shotOrigin)
    }
    return
  }

  if (soldier.aiPathTimer <= 0) {
    soldier.aiPathTimer = AI_PATH_REPLAN_INTERVAL
    soldier.path = findWorldPath(nav, soldier.x, soldier.z, target.x, target.z)
    soldier.pathIndex = 0
    if (
      soldier.path.length > 0 &&
      Math.hypot(soldier.path[0].x - soldier.x, soldier.path[0].z - soldier.z) < PATH_WAYPOINT_RADIUS
    ) {
      soldier.pathIndex = 1
    }
  }

  followPath(soldier, dt)

  if (inRange && soldier.shootCooldown <= 0 && canSee) {
    computeAiShotDirection(soldier, target, shootDir)
    computeAiShotOrigin(soldier, shotOrigin)
    fireWeapon(state, scene, bulletTemplate, soldier, shootDir, shotOrigin)
  }
}

function followPath(soldier: Soldier, dt: number) {
  if (soldier.path.length === 0) {
    updateSoldierVertical(soldier, false, dt)
    return
  }

  while (soldier.pathIndex < soldier.path.length) {
    const waypoint = soldier.path[soldier.pathIndex]
    const dist = Math.hypot(waypoint.x - soldier.x, waypoint.z - soldier.z)
    if (dist <= PATH_WAYPOINT_RADIUS) {
      soldier.pathIndex++
      continue
    }

    moveToward(soldier, waypoint.x, waypoint.z, SOLDIER_SPEED * dt)
    updateSoldierVertical(soldier, shouldAiJump(soldier, waypoint.x, waypoint.z), dt)
    return
  }

  updateSoldierVertical(soldier, false, dt)
}

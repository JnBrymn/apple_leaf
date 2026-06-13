import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PointLight,
  Scene,
  TorusGeometry,
} from 'three'
import { AID_KIT_HEAL, AID_KIT_PICKUP_RADIUS, SOLDIER_HEALTH } from '../engine/constants'
import type { AidKit, GameState } from '../engine/types'

const GLOW_GREEN = 0x22ff88
const GLOW_RED = 0xff2244
const CASE_COLOR = 0xffffff

export function createAidKitTemplate(): Group {
  const group = new Group()
  group.name = 'aidKit'

  const caseMat = new MeshStandardMaterial({
    color: CASE_COLOR,
    emissive: 0x88ffcc,
    emissiveIntensity: 0.25,
    roughness: 0.2,
    metalness: 0.15,
  })
  const crossMat = new MeshStandardMaterial({
    color: GLOW_RED,
    emissive: GLOW_RED,
    emissiveIntensity: 1.4,
    roughness: 0.15,
    metalness: 0.1,
  })
  const ringMat = new MeshStandardMaterial({
    color: GLOW_GREEN,
    emissive: GLOW_GREEN,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.55,
    roughness: 0.1,
    metalness: 0,
    depthWrite: false,
  })
  const haloMat = new MeshStandardMaterial({
    color: 0x66ffaa,
    emissive: GLOW_GREEN,
    emissiveIntensity: 0.9,
    transparent: true,
    opacity: 0.35,
    roughness: 0,
    depthWrite: false,
  })

  const ring = new Mesh(new TorusGeometry(0.55, 0.06, 10, 24), ringMat)
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.08
  ring.name = 'glowRing'
  group.add(ring)

  const halo = new Mesh(new CylinderGeometry(0.38, 0.5, 0.04, 16), haloMat)
  halo.position.y = 0.06
  halo.name = 'halo'
  group.add(halo)

  const kitCase = new Mesh(new BoxGeometry(0.5, 0.32, 0.38), caseMat)
  kitCase.position.y = 0.38
  kitCase.name = 'case'
  group.add(kitCase)

  const crossV = new Mesh(new BoxGeometry(0.12, 0.38, 0.08), crossMat)
  crossV.position.set(0, 0.4, 0.2)
  crossV.name = 'crossV'
  group.add(crossV)

  const crossH = new Mesh(new BoxGeometry(0.34, 0.12, 0.08), crossMat)
  crossH.position.set(0, 0.4, 0.2)
  crossH.name = 'crossH'
  group.add(crossH)

  const plusGlow = new Mesh(new BoxGeometry(0.14, 0.42, 0.04), crossMat)
  plusGlow.position.set(0, 0.4, 0.24)
  plusGlow.scale.set(1.15, 1.15, 1)
  plusGlow.name = 'crossGlow'
  group.add(plusGlow)

  const handle = new Mesh(new BoxGeometry(0.34, 0.08, 0.1), caseMat)
  handle.position.set(0, 0.58, 0)
  group.add(handle)

  const sparkle = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), crossMat)
  sparkle.position.set(0.22, 0.62, 0.12)
  sparkle.rotation.set(0.6, 0.4, 0.2)
  sparkle.name = 'sparkle'
  group.add(sparkle)

  const light = new PointLight(GLOW_GREEN, 0.9, 4.5)
  light.position.y = 0.45
  light.name = 'pickupLight'
  group.add(light)

  return group
}

function pulseKitVisuals(kit: AidKit, t: number) {
  const pulse = 0.55 + Math.sin(t * 4.5) * 0.45
  const spin = t * 1.8

  kit.mesh.position.y = kit.y + 0.55 + Math.sin(t * 2.8) * 0.18
  kit.mesh.rotation.y = spin

  kit.mesh.traverse((child) => {
    if (child instanceof PointLight && child.name === 'pickupLight') {
      child.intensity = 0.6 + pulse * 0.7
      return
    }
    if (!(child instanceof Mesh)) return
    const mat = child.material as MeshStandardMaterial
    if (!mat.emissive) return

    if (child.name === 'glowRing') {
      child.rotation.z = spin * 0.6
      mat.emissiveIntensity = 0.9 + pulse * 0.8
      child.scale.setScalar(0.92 + pulse * 0.12)
    } else if (child.name === 'halo') {
      mat.emissiveIntensity = 0.5 + pulse * 0.6
      child.scale.set(0.95 + pulse * 0.1, 1, 0.95 + pulse * 0.1)
    } else if (child.name.startsWith('cross') || child.name === 'sparkle') {
      mat.emissiveIntensity = 1.1 + pulse * 1.1
      if (child.name === 'sparkle') {
        child.rotation.y += 0.04
        child.rotation.x += 0.03
      }
    } else if (child.name === 'case') {
      mat.emissiveIntensity = 0.15 + pulse * 0.25
    }
  })
}

export function spawnAidKit(
  scene: Scene,
  template: Group,
  aidKits: AidKit[],
  nextId: () => number,
  x: number,
  y: number,
  z: number,
) {
  const mesh = template.clone(true)
  mesh.position.set(x, y, z)
  mesh.scale.setScalar(1.15)
  scene.add(mesh)

  aidKits.push({
    id: nextId(),
    mesh,
    x,
    y,
    z,
    bobPhase: Math.random() * Math.PI * 2,
    alive: true,
  })
}

export function updateAidKits(state: GameState, scene: Scene, dt: number) {
  for (const kit of state.aidKits) {
    if (!kit.alive) continue

    kit.bobPhase += dt
    pulseKitVisuals(kit, kit.bobPhase)

    for (const soldier of state.soldiers) {
      if (!soldier.alive) continue
      if (soldier.health >= SOLDIER_HEALTH) continue

      const pickY = soldier.y + 0.85
      const kitY = kit.y + 0.45
      const dist = Math.hypot(kit.x - soldier.x, kitY - pickY, kit.z - soldier.z)
      if (dist > AID_KIT_PICKUP_RADIUS) continue

      soldier.health = Math.min(SOLDIER_HEALTH, soldier.health + AID_KIT_HEAL)
      kit.alive = false
      break
    }
  }

  state.aidKits = state.aidKits.filter((kit) => {
    if (kit.alive) return true
    scene.remove(kit.mesh)
    kit.mesh.traverse((child) => {
      if (child instanceof Mesh) {
        child.geometry.dispose()
        ;(child.material as MeshStandardMaterial).dispose()
      }
    })
    return false
  })
}

export function disposeAidKits(scene: Scene, aidKits: AidKit[]) {
  for (const kit of aidKits) {
    scene.remove(kit.mesh)
    kit.mesh.traverse((child) => {
      if (child instanceof Mesh) {
        child.geometry.dispose()
        ;(child.material as MeshStandardMaterial).dispose()
      }
    })
  }
}

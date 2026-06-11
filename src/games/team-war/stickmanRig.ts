import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  Vector3,
} from 'three'

export type StickmanTeam = 'blue' | 'red'

const TEAM_COLOR: Record<StickmanTeam, number> = {
  blue: 0x2563eb,
  red: 0xdc2626,
}

const SKIN = 0xfbbf77
const JOINT_RADIUS = 0.05
const LIMB_RADIUS = 0.035

interface RagdollPoint {
  x: number
  y: number
  z: number
  px: number
  py: number
  pz: number
  pinned: boolean
}

interface RagdollLink {
  a: number
  b: number
  length: number
}

interface RagdollSegmentMesh {
  mesh: Mesh
  a: number
  b: number
}

export class StickmanRig {
  readonly root = new Group()
  readonly team: StickmanTeam

  private animPhase = 0
  private readonly joints = new Map<string, Object3D>()

  private pelvis!: Object3D
  private chest!: Object3D
  private head!: Object3D
  private leftUpperArm!: Object3D
  private leftLowerArm!: Object3D
  private rightUpperArm!: Object3D
  private rightLowerArm!: Object3D
  private leftUpperLeg!: Object3D
  private leftLowerLeg!: Object3D
  private rightUpperLeg!: Object3D
  private rightLowerLeg!: Object3D

  private ragdollActive = false
  private ragdollGroup: Group | null = null
  private ragdollPoints: RagdollPoint[] = []
  private ragdollLinks: RagdollLink[] = []
  private ragdollMeshes: RagdollSegmentMesh[] = []
  private ragdollJointMeshes: Mesh[] = []

  constructor(team: StickmanTeam) {
    this.team = team
    this.buildStickman()
  }

  get isRagdoll() {
    return this.ragdollActive
  }

  private buildStickman() {
    const teamMat = new MeshStandardMaterial({ color: TEAM_COLOR[this.team], roughness: 0.65 })
    const skinMat = new MeshStandardMaterial({ color: SKIN, roughness: 0.75 })
    const gunMat = new MeshStandardMaterial({ color: 0x1f2937, roughness: 0.45 })

    const makeJoint = (name: string) => {
      const joint = new Object3D()
      joint.name = name
      this.joints.set(name, joint)
      return joint
    }

    const makeLimb = (length: number, mat: MeshStandardMaterial, radius = LIMB_RADIUS) => {
      const mesh = new Mesh(new CylinderGeometry(radius, radius, length, 6), mat)
      mesh.position.y = -length / 2
      return mesh
    }

    this.pelvis = makeJoint('pelvis')
    this.pelvis.position.y = 0.95
    this.root.add(this.pelvis)

    this.chest = makeJoint('chest')
    this.chest.position.y = 0.22
    this.pelvis.add(this.chest)
    this.chest.add(makeLimb(0.44, teamMat, 0.05))

    this.head = makeJoint('head')
    this.head.position.y = 0.3
    this.chest.add(this.head)
    const headMesh = new Mesh(new SphereGeometry(0.13, 8, 8), skinMat)
    headMesh.position.y = 0.1
    this.head.add(headMesh)

    this.leftUpperArm = makeJoint('leftUpperArm')
    this.leftUpperArm.position.set(-0.18, 0.16, 0)
    this.chest.add(this.leftUpperArm)
    this.leftUpperArm.add(makeLimb(0.28, teamMat))

    this.leftLowerArm = makeJoint('leftLowerArm')
    this.leftLowerArm.position.y = -0.28
    this.leftUpperArm.add(this.leftLowerArm)
    this.leftLowerArm.add(makeLimb(0.26, skinMat))

    this.rightUpperArm = makeJoint('rightUpperArm')
    this.rightUpperArm.position.set(0.18, 0.16, 0)
    this.chest.add(this.rightUpperArm)
    this.rightUpperArm.add(makeLimb(0.28, teamMat))

    this.rightLowerArm = makeJoint('rightLowerArm')
    this.rightLowerArm.position.y = -0.28
    this.rightUpperArm.add(this.rightLowerArm)
    this.rightLowerArm.add(makeLimb(0.26, skinMat))

    const gun = new Mesh(new BoxGeometry(0.07, 0.07, 0.42), gunMat)
    gun.position.set(0.04, -0.18, 0.08)
    this.rightLowerArm.add(gun)

    this.leftUpperLeg = makeJoint('leftUpperLeg')
    this.leftUpperLeg.position.set(-0.1, -0.02, 0)
    this.pelvis.add(this.leftUpperLeg)
    this.leftUpperLeg.add(makeLimb(0.4, teamMat))

    this.leftLowerLeg = makeJoint('leftLowerLeg')
    this.leftLowerLeg.position.y = -0.4
    this.leftUpperLeg.add(this.leftLowerLeg)
    this.leftLowerLeg.add(makeLimb(0.4, teamMat))

    this.rightUpperLeg = makeJoint('rightUpperLeg')
    this.rightUpperLeg.position.set(0.1, -0.02, 0)
    this.pelvis.add(this.rightUpperLeg)
    this.rightUpperLeg.add(makeLimb(0.4, teamMat))

    this.rightLowerLeg = makeJoint('rightLowerLeg')
    this.rightLowerLeg.position.y = -0.4
    this.rightUpperLeg.add(this.rightLowerLeg)
    this.rightLowerLeg.add(makeLimb(0.4, teamMat))
  }

  updateAnimation(dt: number, moveSpeed: number, shooting: boolean) {
    if (this.ragdollActive) return

    const moving = moveSpeed > 0.4
    if (moving) {
      this.animPhase += dt * (8 + moveSpeed * 1.4)
      const swing = Math.sin(this.animPhase) * 0.65
      const lean = Math.min(0.18, moveSpeed * 0.025)

      this.leftUpperLeg.rotation.x = swing
      this.rightUpperLeg.rotation.x = -swing
      this.leftLowerLeg.rotation.x = Math.max(0, swing) * 0.55
      this.rightLowerLeg.rotation.x = Math.max(0, -swing) * 0.55

      this.leftUpperArm.rotation.x = -swing * 0.55
      this.rightUpperArm.rotation.x = shooting ? -1.1 : swing * 0.45
      this.leftLowerArm.rotation.x = -0.25
      this.rightLowerArm.rotation.x = shooting ? -0.35 : -0.15

      this.chest.rotation.x = lean
      this.root.position.y = Math.abs(Math.sin(this.animPhase * 2)) * 0.03
    } else {
      this.animPhase += dt * 2
      const breathe = Math.sin(this.animPhase) * 0.03

      this.leftUpperLeg.rotation.x = 0
      this.rightUpperLeg.rotation.x = 0
      this.leftLowerLeg.rotation.x = 0
      this.rightLowerLeg.rotation.x = 0
      this.leftUpperArm.rotation.x = -0.08 + breathe
      this.rightUpperArm.rotation.x = shooting ? -1.15 : -0.08 - breathe
      this.leftLowerArm.rotation.x = -0.12
      this.rightLowerArm.rotation.x = shooting ? -0.4 : -0.12
      this.chest.rotation.x = 0
      this.root.position.y = 0
    }
  }

  activateRagdoll(scene: Object3D, impulse: Vector3, hitPoint: Vector3) {
    if (this.ragdollActive) return
    this.ragdollActive = true
    this.root.visible = false

    const names = [
      'pelvis',
      'chest',
      'head',
      'leftUpperArm',
      'leftLowerArm',
      'rightUpperArm',
      'rightLowerArm',
      'leftUpperLeg',
      'leftLowerLeg',
      'rightUpperLeg',
      'rightLowerLeg',
    ] as const

    const worldPos = new Vector3()
    const points: RagdollPoint[] = names.map((name) => {
      const joint = this.joints.get(name)!
      joint.getWorldPosition(worldPos)
      return {
        x: worldPos.x,
        y: worldPos.y,
        z: worldPos.z,
        px: worldPos.x,
        py: worldPos.y,
        pz: worldPos.z,
        pinned: false,
      }
    })

    const links: RagdollLink[] = [
      { a: 0, b: 1, length: dist(points[0], points[1]) },
      { a: 1, b: 2, length: dist(points[1], points[2]) },
      { a: 1, b: 3, length: dist(points[1], points[3]) },
      { a: 3, b: 4, length: dist(points[3], points[4]) },
      { a: 1, b: 5, length: dist(points[1], points[5]) },
      { a: 5, b: 6, length: dist(points[5], points[6]) },
      { a: 0, b: 7, length: dist(points[0], points[7]) },
      { a: 7, b: 8, length: dist(points[7], points[8]) },
      { a: 0, b: 9, length: dist(points[0], points[9]) },
      { a: 9, b: 10, length: dist(points[9], points[10]) },
    ]

    const closest = findClosestPointIndex(points, hitPoint)
    for (let i = 0; i < points.length; i++) {
      const p = points[i]
      const falloff = i === closest ? 1 : 0.35
      p.px -= impulse.x * falloff * 0.018
      p.py -= impulse.y * falloff * 0.018
      p.pz -= impulse.z * falloff * 0.018
    }
    points[closest].px -= impulse.x * 0.03
    points[closest].py -= impulse.y * 0.03
    points[closest].pz -= impulse.z * 0.03

    const teamMat = new MeshStandardMaterial({ color: TEAM_COLOR[this.team], roughness: 0.65 })
    const skinMat = new MeshStandardMaterial({ color: SKIN, roughness: 0.75 })

    this.ragdollGroup = new Group()
    scene.add(this.ragdollGroup)

    this.ragdollMeshes = links.map((link) => {
      const mat =
        link.a === 2 || link.b === 2 || link.a === 4 || link.b === 4 || link.a === 6 || link.b === 6
          ? skinMat
          : teamMat
      const mesh = new Mesh(new CylinderGeometry(LIMB_RADIUS, LIMB_RADIUS, 1, 6), mat)
      this.ragdollGroup!.add(mesh)
      return { mesh, a: link.a, b: link.b }
    })

    this.ragdollJointMeshes = points.map((p, i) => {
      const radius = i === 2 ? 0.11 : JOINT_RADIUS
      const mat = i === 2 ? skinMat : teamMat
      const mesh = new Mesh(new SphereGeometry(radius, 6, 6), mat)
      mesh.position.set(p.x, p.y, p.z)
      this.ragdollGroup!.add(mesh)
      return mesh
    })

    this.ragdollPoints = points
    this.ragdollLinks = links
  }

  updateRagdoll(dt: number, groundY = 0) {
    if (!this.ragdollActive || !this.ragdollGroup) return

    const gravity = -28
    const damping = 0.985
    const points = this.ragdollPoints
    const up = new Vector3(0, 1, 0)

    for (const p of points) {
      if (p.pinned) continue
      const vx = (p.x - p.px) * damping
      const vy = (p.y - p.py) * damping
      const vz = (p.z - p.pz) * damping
      p.px = p.x
      p.py = p.y
      p.pz = p.z
      p.x += vx
      p.y += vy + gravity * dt * dt
      p.z += vz

      const floorY = groundY + (p === points[2] ? 0.12 : JOINT_RADIUS)
      if (p.y < floorY) {
        p.y = floorY
        p.py = p.y
        p.px = p.x - vx * 0.35
        p.pz = p.z - vz * 0.35
      }
    }

    for (let iter = 0; iter < 6; iter++) {
      for (const link of this.ragdollLinks) {
        const a = points[link.a]
        const b = points[link.b]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dz = b.z - a.z
        const len = Math.hypot(dx, dy, dz) || 0.0001
        const diff = (len - link.length) / len
        const ox = dx * diff * 0.5
        const oy = dy * diff * 0.5
        const oz = dz * diff * 0.5
        if (!a.pinned) {
          a.x += ox
          a.y += oy
          a.z += oz
        }
        if (!b.pinned) {
          b.x -= ox
          b.y -= oy
          b.z -= oz
        }
      }
    }

    for (const seg of this.ragdollMeshes) {
      const a = points[seg.a]
      const b = points[seg.b]
      const midX = (a.x + b.x) / 2
      const midY = (a.y + b.y) / 2
      const midZ = (a.z + b.z) / 2
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dz = b.z - a.z
      const len = Math.hypot(dx, dy, dz) || 0.0001
      seg.mesh.position.set(midX, midY, midZ)
      seg.mesh.scale.y = len
      seg.mesh.quaternion.setFromUnitVectors(up, new Vector3(dx / len, dy / len, dz / len))
    }

    for (let i = 0; i < points.length; i++) {
      const p = points[i]
      this.ragdollJointMeshes[i].position.set(p.x, p.y, p.z)
    }
  }

  dispose(scene: Object3D) {
    if (this.ragdollGroup) {
      scene.remove(this.ragdollGroup)
      for (const seg of this.ragdollMeshes) {
        seg.mesh.geometry.dispose()
        ;(seg.mesh.material as MeshStandardMaterial).dispose()
      }
      for (const m of this.ragdollJointMeshes) {
        m.geometry.dispose()
        ;(m.material as MeshStandardMaterial).dispose()
      }
      this.ragdollGroup = null
    }
    this.root.clear()
  }
}

function dist(a: RagdollPoint, b: RagdollPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
}

function findClosestPointIndex(points: RagdollPoint[], hit: Vector3) {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < points.length; i++) {
    const d = Math.hypot(points[i].x - hit.x, points[i].y - hit.y, points[i].z - hit.z)
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

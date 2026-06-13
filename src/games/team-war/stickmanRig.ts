import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three'
import {
  DEFAULT_CHARACTER,
  darkenHex,
  type CharacterAppearance,
  type FacialHairStyle,
  type GlassesStyle,
  type HairStyle,
  type HatStyle,
} from './characterAppearance'
import { createNameTag, disposeNameTag, updateNameTag, type NameTagHandle } from './nameTag'

export type StickmanTeam = 'blue' | 'red'

const TEAM_COLOR: Record<StickmanTeam, number> = {
  blue: 0x2563eb,
  red: 0xdc2626,
}

const TEAM_DARK: Record<StickmanTeam, number> = {
  blue: 0x1e3a8a,
  red: 0x7f1d1d,
}

const GUN_METAL = 0x374151

const RAGDOLL_LINK_RADIUS = [0.11, 0.07, 0.09, 0.06, 0.05, 0.06, 0.05, 0.08, 0.06, 0.08, 0.06]
const RAGDOLL_SKIN_LINKS = new Set([1, 2, 4, 6])

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

function hex(color: string) {
  return Number.parseInt(color.replace('#', ''), 16)
}

export class StickmanRig {
  readonly root = new Group()
  readonly team: StickmanTeam

  private appearance: CharacterAppearance
  private animPhase = 0
  private readonly joints = new Map<string, Object3D>()
  private skinMat!: MeshStandardMaterial
  private skinShadowMat!: MeshStandardMaterial
  private bootMeshes: Mesh[] = []
  private cosmeticsGroup!: Group
  private nameTag: NameTagHandle | null = null

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

  constructor(team: StickmanTeam, appearance: CharacterAppearance = DEFAULT_CHARACTER) {
    this.team = team
    this.appearance = { ...appearance }
    this.buildCharacter()
    this.applyAppearance(this.appearance)
  }

  get isRagdoll() {
    return this.ragdollActive
  }

  applyAppearance(appearance: CharacterAppearance) {
    this.appearance = { ...appearance }
    const skin = hex(appearance.skinTone)
    const skinShadow = hex(darkenHex(appearance.skinTone))
    const boot = hex(appearance.bootColor)

    this.skinMat.color.setHex(skin)
    this.skinShadowMat.color.setHex(skinShadow)
    for (const bootMesh of this.bootMeshes) {
      ;(bootMesh.material as MeshStandardMaterial).color.setHex(boot)
    }

    this.rebuildCosmetics()
    this.setNameTag(appearance.name)
  }

  setNameTag(name: string) {
    const teamColor = this.team === 'blue' ? '#2563eb' : '#dc2626'
    const label = name.trim()

    if (!label) {
      if (this.nameTag) this.nameTag.sprite.visible = false
      return
    }

    if (!this.nameTag) {
      this.nameTag = createNameTag(label, teamColor)
      if (this.nameTag) this.root.add(this.nameTag.sprite)
      return
    }

    updateNameTag(this.nameTag, label, teamColor)
  }

  private rebuildCosmetics() {
    while (this.cosmeticsGroup.children.length > 0) {
      const child = this.cosmeticsGroup.children[0]
      this.cosmeticsGroup.remove(child)
      if (child instanceof Mesh) {
        child.geometry.dispose()
        ;(child.material as MeshStandardMaterial).dispose()
      }
    }

    const hairMat = new MeshStandardMaterial({
      color: hex(this.appearance.hairColor),
      roughness: 0.85,
    })
    const hatMat = new MeshStandardMaterial({
      color: hex(this.appearance.hatColor),
      roughness: 0.7,
    })
    const facialMat = new MeshStandardMaterial({
      color: hex(this.appearance.facialHairColor),
      roughness: 0.9,
    })
    const glassMat = new MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85,
    })
    const lensMat = new MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.5,
      transparent: true,
      opacity: 0.7,
    })

    addHair(this.cosmeticsGroup, this.appearance.hairStyle, hairMat)
    addFacialHair(this.cosmeticsGroup, this.appearance.facialHair, facialMat)
    addGlasses(this.cosmeticsGroup, this.appearance.glasses, glassMat, lensMat)
    addHat(this.cosmeticsGroup, this.appearance.hat, hatMat)
  }

  private buildCharacter() {
    const uniform = new MeshStandardMaterial({ color: TEAM_COLOR[this.team], roughness: 0.72, metalness: 0.05 })
    const uniformDark = new MeshStandardMaterial({ color: TEAM_DARK[this.team], roughness: 0.8 })
    this.skinMat = new MeshStandardMaterial({ color: 0xe8b88a, roughness: 0.82 })
    this.skinShadowMat = new MeshStandardMaterial({ color: 0xc99a6e, roughness: 0.85 })
    const bootMat = new MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 })
    const gunMat = new MeshStandardMaterial({ color: GUN_METAL, roughness: 0.35, metalness: 0.4 })

    const makeJoint = (name: string) => {
      const joint = new Object3D()
      joint.name = name
      this.joints.set(name, joint)
      return joint
    }

    const box = (w: number, h: number, d: number, mat: MeshStandardMaterial, y = 0) => {
      const mesh = new Mesh(new BoxGeometry(w, h, d), mat)
      mesh.position.y = y
      return mesh
    }

    const limb = (
      length: number,
      topR: number,
      botR: number,
      mat: MeshStandardMaterial,
      segments = 8,
    ) => {
      const mesh = new Mesh(new CylinderGeometry(topR, botR, length, segments), mat)
      mesh.position.y = -length / 2
      return mesh
    }

    this.pelvis = makeJoint('pelvis')
    this.pelvis.position.y = 0.95
    this.root.add(this.pelvis)

    this.pelvis.add(box(0.36, 0.18, 0.22, uniformDark, -0.02))
    this.pelvis.add(box(0.38, 0.06, 0.24, uniform, 0.06))

    this.chest = makeJoint('chest')
    this.chest.position.y = 0.2
    this.pelvis.add(this.chest)

    this.chest.add(box(0.42, 0.28, 0.24, uniform, 0.1))
    this.chest.add(box(0.36, 0.2, 0.22, uniformDark, -0.12))
    this.chest.add(box(0.5, 0.1, 0.26, uniform, 0.22))

    this.head = makeJoint('head')
    this.head.position.y = 0.32
    this.chest.add(this.head)

    this.head.add(limb(0.08, 0.055, 0.06, this.skinShadowMat, 6))

    const headMesh = new Mesh(new SphereGeometry(0.145, 12, 10), this.skinMat)
    headMesh.position.y = 0.16
    headMesh.scale.set(0.92, 1, 0.95)
    this.head.add(headMesh)

    const facePlate = new Mesh(new BoxGeometry(0.12, 0.08, 0.06), this.skinShadowMat)
    facePlate.position.set(0, 0.13, 0.1)
    this.head.add(facePlate)

    this.cosmeticsGroup = new Group()
    this.cosmeticsGroup.position.y = 0.16
    this.head.add(this.cosmeticsGroup)

    const armL = 0.3
    const foreL = 0.28

    this.leftUpperArm = makeJoint('leftUpperArm')
    this.leftUpperArm.position.set(-0.26, 0.18, 0)
    this.chest.add(this.leftUpperArm)
    this.leftUpperArm.add(limb(armL, 0.07, 0.055, uniform))

    this.leftLowerArm = makeJoint('leftLowerArm')
    this.leftLowerArm.position.y = -armL
    this.leftUpperArm.add(this.leftLowerArm)
    this.leftLowerArm.add(limb(foreL, 0.055, 0.045, this.skinMat))
    this.leftLowerArm.add(box(0.07, 0.04, 0.09, this.skinMat, -foreL - 0.02))

    this.rightUpperArm = makeJoint('rightUpperArm')
    this.rightUpperArm.position.set(0.26, 0.18, 0)
    this.chest.add(this.rightUpperArm)
    this.rightUpperArm.add(limb(armL, 0.07, 0.055, uniform))

    this.rightLowerArm = makeJoint('rightLowerArm')
    this.rightLowerArm.position.y = -armL
    this.rightUpperArm.add(this.rightLowerArm)
    this.rightLowerArm.add(limb(foreL, 0.055, 0.045, this.skinMat))

    const gun = new Group()
    gun.add(new Mesh(new BoxGeometry(0.06, 0.09, 0.38), gunMat))
    const gunBarrel = new Mesh(new CylinderGeometry(0.018, 0.018, 0.22, 6), gunMat)
    gunBarrel.rotation.x = Math.PI / 2
    gunBarrel.position.set(0, 0.02, 0.28)
    gun.add(gunBarrel)
    gun.position.set(0.03, -foreL + 0.04, 0.1)
    this.rightLowerArm.add(gun)
    this.rightLowerArm.add(box(0.07, 0.04, 0.09, this.skinMat, -foreL - 0.02))

    const thighL = 0.42
    const shinL = 0.4

    this.leftUpperLeg = makeJoint('leftUpperLeg')
    this.leftUpperLeg.position.set(-0.11, -0.04, 0)
    this.pelvis.add(this.leftUpperLeg)
    this.leftUpperLeg.add(limb(thighL, 0.085, 0.065, uniform))

    this.leftLowerLeg = makeJoint('leftLowerLeg')
    this.leftLowerLeg.position.y = -thighL
    this.leftUpperLeg.add(this.leftLowerLeg)
    this.leftLowerLeg.add(limb(shinL, 0.065, 0.055, uniformDark))
    const leftBoot = box(0.1, 0.08, 0.22, bootMat, -shinL - 0.02)
    this.bootMeshes.push(leftBoot)
    this.leftLowerLeg.add(leftBoot)

    this.rightUpperLeg = makeJoint('rightUpperLeg')
    this.rightUpperLeg.position.set(0.11, -0.04, 0)
    this.pelvis.add(this.rightUpperLeg)
    this.rightUpperLeg.add(limb(thighL, 0.085, 0.065, uniform))

    this.rightLowerLeg = makeJoint('rightLowerLeg')
    this.rightLowerLeg.position.y = -thighL
    this.rightUpperLeg.add(this.rightLowerLeg)
    this.rightLowerLeg.add(limb(shinL, 0.065, 0.055, uniformDark))
    const rightBoot = box(0.1, 0.08, 0.22, bootMat, -shinL - 0.02)
    this.bootMeshes.push(rightBoot)
    this.rightLowerLeg.add(rightBoot)
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
      'pelvis', 'chest', 'head', 'leftUpperArm', 'leftLowerArm',
      'rightUpperArm', 'rightLowerArm', 'leftUpperLeg', 'leftLowerLeg',
      'rightUpperLeg', 'rightLowerLeg',
    ] as const

    const worldPos = new Vector3()
    const points: RagdollPoint[] = names.map((name) => {
      const joint = this.joints.get(name)!
      joint.getWorldPosition(worldPos)
      return { x: worldPos.x, y: worldPos.y, z: worldPos.z, px: worldPos.x, py: worldPos.y, pz: worldPos.z, pinned: false }
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

    const skinColor = hex(this.appearance.skinTone)
    const uniform = new MeshStandardMaterial({ color: TEAM_COLOR[this.team], roughness: 0.72 })
    const uniformDark = new MeshStandardMaterial({ color: TEAM_DARK[this.team], roughness: 0.8 })
    const skin = new MeshStandardMaterial({ color: skinColor, roughness: 0.82 })

    this.ragdollGroup = new Group()
    scene.add(this.ragdollGroup)

    this.ragdollMeshes = links.map((link, i) => {
      const radius = RAGDOLL_LINK_RADIUS[i] ?? 0.06
      const mat = RAGDOLL_SKIN_LINKS.has(i) ? skin : i === 0 || i >= 7 ? uniformDark : uniform
      const mesh = new Mesh(new CylinderGeometry(radius, radius * 0.9, 1, 8), mat)
      this.ragdollGroup!.add(mesh)
      return { mesh, a: link.a, b: link.b }
    })

    const jointRadii = [0.1, 0.09, 0.14, 0.07, 0.06, 0.07, 0.06, 0.09, 0.07, 0.09, 0.07]
    this.ragdollJointMeshes = points.map((p, i) => {
      const radius = jointRadii[i] ?? 0.07
      const mat = i === 2 ? skin : i === 4 || i === 6 ? skin : uniform
      const mesh = new Mesh(new SphereGeometry(radius, 8, 8), mat)
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

      const floorPad = p === points[2] ? 0.14 : p === points[8] || p === points[10] ? 0.05 : 0.08
      const floorY = groundY + floorPad
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
        if (!a.pinned) { a.x += ox; a.y += oy; a.z += oz }
        if (!b.pinned) { b.x -= ox; b.y -= oy; b.z -= oz }
      }
    }

    for (const seg of this.ragdollMeshes) {
      const a = points[seg.a]
      const b = points[seg.b]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dz = b.z - a.z
      const len = Math.hypot(dx, dy, dz) || 0.0001
      seg.mesh.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2)
      seg.mesh.scale.y = len
      seg.mesh.quaternion.setFromUnitVectors(up, new Vector3(dx / len, dy / len, dz / len))
    }

    for (let i = 0; i < points.length; i++) {
      this.ragdollJointMeshes[i].position.set(points[i].x, points[i].y, points[i].z)
    }
  }

  dispose(scene: Object3D) {
    if (this.nameTag) {
      this.root.remove(this.nameTag.sprite)
      disposeNameTag(this.nameTag)
      this.nameTag = null
    }
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

function addHair(group: Group, style: HairStyle, mat: MeshStandardMaterial) {
  if (style === 'bald') return

  if (style === 'buzz') {
    const cap = new Mesh(new SphereGeometry(0.15, 10, 8), mat)
    cap.position.set(0, 0.12, -0.02)
    cap.scale.set(1, 0.55, 1)
    group.add(cap)
    return
  }

  if (style === 'short') {
    const top = new Mesh(new SphereGeometry(0.14, 10, 8), mat)
    top.position.set(0, 0.14, -0.02)
    top.scale.set(1.05, 0.7, 1.05)
    group.add(top)
    return
  }

  if (style === 'medium') {
    const top = new Mesh(new SphereGeometry(0.15, 10, 8), mat)
    top.position.set(0, 0.13, -0.02)
    top.scale.set(1.1, 0.85, 1.1)
    group.add(top)
    const back = new Mesh(new BoxGeometry(0.22, 0.18, 0.12), mat)
    back.position.set(0, 0.02, -0.14)
    group.add(back)
    return
  }

  if (style === 'long') {
    const top = new Mesh(new SphereGeometry(0.15, 10, 8), mat)
    top.position.set(0, 0.14, -0.02)
    top.scale.set(1.1, 0.9, 1.1)
    group.add(top)
    const back = new Mesh(new BoxGeometry(0.24, 0.32, 0.1), mat)
    back.position.set(0, -0.12, -0.13)
    group.add(back)
    return
  }

  if (style === 'spiky') {
    for (let i = 0; i < 7; i++) {
      const spike = new Mesh(new CylinderGeometry(0.01, 0.035, 0.12, 4), mat)
      const angle = (i / 7) * Math.PI * 2
      spike.position.set(Math.sin(angle) * 0.08, 0.2, Math.cos(angle) * 0.08 - 0.02)
      spike.rotation.x = 0.35
      spike.rotation.y = angle
      group.add(spike)
    }
    return
  }

  if (style === 'curly') {
    for (let i = 0; i < 8; i++) {
      const curl = new Mesh(new TorusGeometry(0.035, 0.012, 6, 8), mat)
      const angle = (i / 8) * Math.PI * 2
      curl.position.set(Math.sin(angle) * 0.1, 0.12 + (i % 2) * 0.04, Math.cos(angle) * 0.1 - 0.02)
      curl.rotation.y = angle
      group.add(curl)
    }
  }
}

function addFacialHair(group: Group, style: FacialHairStyle, mat: MeshStandardMaterial) {
  if (style === 'none') return
  if (style === 'stubble') {
    const jaw = new Mesh(new BoxGeometry(0.13, 0.06, 0.05), mat)
    jaw.position.set(0, 0.02, 0.11)
    group.add(jaw)
    return
  }
  if (style === 'mustache') {
    const stache = new Mesh(new BoxGeometry(0.1, 0.025, 0.04), mat)
    stache.position.set(0, 0.06, 0.13)
    group.add(stache)
    return
  }
  if (style === 'beard') {
    const beard = new Mesh(new BoxGeometry(0.12, 0.14, 0.06), mat)
    beard.position.set(0, -0.04, 0.11)
    group.add(beard)
    const stache = new Mesh(new BoxGeometry(0.1, 0.025, 0.04), mat)
    stache.position.set(0, 0.06, 0.13)
    group.add(stache)
  }
}

function addGlasses(
  group: Group,
  style: GlassesStyle,
  frameMat: MeshStandardMaterial,
  lensMat: MeshStandardMaterial,
) {
  if (style === 'none') return

  const y = 0.08
  const z = 0.14
  const bridge = new Mesh(new BoxGeometry(0.04, 0.015, 0.015), frameMat)
  bridge.position.set(0, y, z)
  group.add(bridge)

  const lensW = style === 'square' ? 0.06 : 0.055
  const lensH = style === 'square' ? 0.045 : 0.05
  for (const side of [-1, 1]) {
    const lens = new Mesh(new BoxGeometry(lensW, lensH, 0.012), style === 'shades' ? lensMat : frameMat)
    lens.position.set(side * 0.065, y, z)
    group.add(lens)
    const arm = new Mesh(new BoxGeometry(0.08, 0.012, 0.012), frameMat)
    arm.position.set(side * 0.12, y, 0.1)
    arm.rotation.y = side * 0.35
    group.add(arm)
  }
}

function addHat(group: Group, style: HatStyle, mat: MeshStandardMaterial) {
  if (style === 'none') return

  if (style === 'cap') {
    const dome = new Mesh(new SphereGeometry(0.15, 10, 8), mat)
    dome.position.set(0, 0.16, -0.02)
    dome.scale.set(1.05, 0.55, 1.05)
    group.add(dome)
    const brim = new Mesh(new CylinderGeometry(0.17, 0.17, 0.02, 12), mat)
    brim.position.set(0, 0.1, 0.06)
    brim.rotation.x = 0.15
    group.add(brim)
    return
  }

  if (style === 'helmet') {
    const shell = new Mesh(new SphereGeometry(0.16, 12, 10), mat)
    shell.position.set(0, 0.14, -0.02)
    shell.scale.set(1, 0.75, 1.05)
    group.add(shell)
    const rim = new Mesh(new CylinderGeometry(0.17, 0.17, 0.03, 12), mat)
    rim.position.set(0, 0.06, 0.02)
    group.add(rim)
    return
  }

  if (style === 'beanie') {
    const beanie = new Mesh(new SphereGeometry(0.15, 10, 8), mat)
    beanie.position.set(0, 0.17, -0.02)
    beanie.scale.set(1.05, 0.85, 1.05)
    group.add(beanie)
    const fold = new Mesh(new TorusGeometry(0.13, 0.02, 6, 12), mat)
    fold.position.set(0, 0.08, 0.02)
    fold.rotation.x = Math.PI / 2
    group.add(fold)
    return
  }

  if (style === 'beret') {
    const beret = new Mesh(new SphereGeometry(0.14, 10, 8), mat)
    beret.position.set(0.02, 0.18, -0.02)
    beret.scale.set(1.2, 0.35, 1.2)
    beret.rotation.z = 0.2
    group.add(beret)
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
    if (d < bestD) { bestD = d; best = i }
  }
  return best
}

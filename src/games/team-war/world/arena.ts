import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  Fog,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
} from 'three'
import { ARENA_D, ARENA_W, WALL_HEIGHT } from '../engine/constants'
import { PERIMETER_WALLS, PLATFORMS } from './obstacles'

export function buildArena(scene: Scene) {
  scene.background = new Color(0x87ceeb)
  scene.fog = new Fog(0x87ceeb, 55, 145)

  scene.add(new AmbientLight(0xffffff, 0.55))
  const sun = new DirectionalLight(0xfff4e0, 1.1)
  sun.position.set(40, 60, 30)
  scene.add(sun)

  const ground = new Mesh(
    new PlaneGeometry(ARENA_W + 4, ARENA_D + 4),
    new MeshStandardMaterial({ color: 0x4d7c3a, roughness: 1 }),
  )
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  const wallMat = new MeshStandardMaterial({ color: 0x57534e, roughness: 0.95 })
  const crateMat = new MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 })
  const skyMat = new MeshStandardMaterial({ color: 0x64748b, roughness: 0.82, metalness: 0.08 })
  const rampMat = new MeshStandardMaterial({ color: 0x6b7280, roughness: 0.88 })
  const pillarMat = new MeshStandardMaterial({ color: 0x52525b, roughness: 0.95 })

  for (const o of PERIMETER_WALLS) {
    const w = o.maxX - o.minX
    const d = o.maxZ - o.minZ
    const wall = new Mesh(new BoxGeometry(w, WALL_HEIGHT, d), wallMat)
    wall.position.set((o.minX + o.maxX) / 2, WALL_HEIGHT / 2, (o.minZ + o.maxZ) / 2)
    scene.add(wall)
  }

  for (const p of PLATFORMS) {
    const w = p.maxX - p.minX
    const d = p.maxZ - p.minZ
    const cx = (p.minX + p.maxX) / 2
    const cz = (p.minZ + p.maxZ) / 2
    const mat = p.column === false ? skyMat : p.topY <= 1.6 ? crateMat : rampMat

    if (p.column === false) {
      const deck = new Mesh(new BoxGeometry(w, 0.35, d), mat)
      deck.position.set(cx, p.topY - 0.175, cz)
      scene.add(deck)

      const pillarInset = Math.min(w, d) * 0.22
      for (const [px, pz] of [
        [p.minX + pillarInset, p.minZ + pillarInset],
        [p.maxX - pillarInset, p.minZ + pillarInset],
        [p.minX + pillarInset, p.maxZ - pillarInset],
        [p.maxX - pillarInset, p.maxZ - pillarInset],
      ] as const) {
        const pillar = new Mesh(new BoxGeometry(0.9, p.topY, 0.9), pillarMat)
        pillar.position.set(px, p.topY / 2, pz)
        scene.add(pillar)
      }
      continue
    }

    const block = new Mesh(new BoxGeometry(w, p.topY, d), mat)
    block.position.set(cx, p.topY / 2, cz)
    scene.add(block)
  }
}

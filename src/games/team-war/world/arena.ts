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
import { COVER_OBSTACLES, PERIMETER_WALLS } from './obstacles'

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

  for (const o of PERIMETER_WALLS) {
    const w = o.maxX - o.minX
    const d = o.maxZ - o.minZ
    const wall = new Mesh(new BoxGeometry(w, WALL_HEIGHT, d), wallMat)
    wall.position.set((o.minX + o.maxX) / 2, WALL_HEIGHT / 2, (o.minZ + o.maxZ) / 2)
    scene.add(wall)
  }

  for (const o of COVER_OBSTACLES) {
    const w = o.maxX - o.minX
    const d = o.maxZ - o.minZ
    const crate = new Mesh(new BoxGeometry(w, 1.6, d), crateMat)
    crate.position.set((o.minX + o.maxX) / 2, 0.8, (o.minZ + o.maxZ) / 2)
    scene.add(crate)
  }
}

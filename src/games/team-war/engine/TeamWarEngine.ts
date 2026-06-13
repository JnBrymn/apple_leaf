import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'
import type { GameState, HudSnapshot, InputState } from './types'
import { clamp } from './utils'
import type { CharacterAppearance } from '../characterAppearance'
import { DEFAULT_CHARACTER } from '../characterAppearance'
import { buildArena } from '../world/arena'
import { NavigationGrid } from '../world/navigationGrid'
import {
  countAlive,
  disposeSoldiers,
  findSoldier,
  spawnTeams,
  syncSoldierVisuals,
} from '../entities/soldier'
import {
  createAidKitTemplate,
  disposeAidKits,
  updateAidKits,
} from '../systems/aidKitSystem'
import {
  createBulletTemplate,
  disposeBullets,
  fireWeapon,
  updateBullets,
} from '../systems/combatSystem'
import { updateAi } from '../systems/aiSystem'
import { syncCameraToPlayer, updatePlayer } from '../systems/playerSystem'
import { initSpectatorFromPlayer, updateSpectator } from '../systems/spectatorSystem'

export class TeamWarEngine {
  readonly scene = new Scene()
  readonly camera = new PerspectiveCamera(75, 1, 0.1, 200)

  private renderer: WebGLRenderer | null = null
  private nav: NavigationGrid | null = null
  private bulletTemplate: Mesh | null = null
  private aidKitTemplate: Group | null = null
  private gunGroup: Group | null = null
  private nextId = 1
  private playerAppearance: CharacterAppearance = { ...DEFAULT_CHARACTER }

  private readonly shootDir = new Vector3()
  private readonly shotOrigin = new Vector3()

  private state: GameState = {
    soldiers: [],
    bullets: [],
    aidKits: [],
    player: { id: -1, yaw: 0, pitch: 0, velocityY: 0, onGround: true },
    kills: 0,
    gameOver: false,
    won: null,
    muzzleFlashTimer: 0,
    spectator: null,
  }

  mount(container: HTMLElement, playerAppearance?: CharacterAppearance) {
    if (playerAppearance) {
      this.playerAppearance = { ...playerAppearance }
    }
    this.renderer = new WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setClearColor(0x87ceeb)
    container.appendChild(this.renderer.domElement)

    buildArena(this.scene)
    this.nav = new NavigationGrid()

    this.gunGroup = new Group()
    const gunBody = new Mesh(
      new BoxGeometry(0.08, 0.1, 0.45),
      new MeshStandardMaterial({ color: 0x1f2937 }),
    )
    gunBody.position.set(0.18, -0.14, -0.35)
    this.gunGroup.add(gunBody)
    this.camera.add(this.gunGroup)
    this.scene.add(this.camera)

    this.bulletTemplate = createBulletTemplate()
    this.aidKitTemplate = createAidKitTemplate()
    this.spawnTeams()
    syncCameraToPlayer(this.getPlayer(), this.state, this.camera)
    this.resize(container.clientWidth, container.clientHeight)
    this.renderScene()
  }

  setPlayerAppearance(appearance: CharacterAppearance) {
    this.playerAppearance = { ...appearance }
    const player = this.getPlayer()
    if (player) {
      player.rig.applyAppearance(this.playerAppearance)
    }
  }

  private spawnTeams() {
    const playerIdOut = { value: -1 }
    this.state.soldiers = spawnTeams(
      this.scene,
      () => this.nextId++,
      playerIdOut,
      this.playerAppearance,
    )
    this.state.player.id = playerIdOut.value
    this.state.player.yaw = 0
    this.state.player.pitch = 0
  }

  resize(width: number, height: number) {
    if (!this.renderer) return
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  update(delta: number, input: InputState): HudSnapshot {
    const dt = clamp(delta, 0, 0.05)
    const { state } = this

    if (!state.gameOver) {
      const player = this.getPlayer()
      const spectating = Boolean(player && !player.alive)

      if (player?.alive) {
        updatePlayer(player, state, input, this.camera, dt)
      } else if (spectating && player) {
        if (!state.spectator) {
          state.spectator = initSpectatorFromPlayer(player.x, player.y, player.z)
        }
        updateSpectator(state.spectator, state, input, this.camera, dt)
      }

      if (this.gunGroup) {
        this.gunGroup.visible = Boolean(player?.alive)
      }

      if (this.nav && this.bulletTemplate) {
        for (const soldier of state.soldiers) {
          if (!soldier.alive || soldier.isPlayer) continue
          updateAi(soldier, state, this.scene, this.bulletTemplate, this.nav, this.shootDir, this.shotOrigin, dt)
        }
      }

      for (const soldier of state.soldiers) {
        soldier.shootCooldown = Math.max(0, soldier.shootCooldown - dt)
        soldier.justShot = false
      }

      if (input.shoot && player?.alive && player.shootCooldown <= 0 && this.bulletTemplate) {
        this.shootDir.set(0, 0, -1).applyQuaternion(this.camera.quaternion)
        this.shotOrigin.copy(this.camera.position)
        this.shotOrigin.y -= 0.1
        fireWeapon(state, this.scene, this.bulletTemplate, player, this.shootDir, this.shotOrigin)
      }

      updateBullets(state, this.scene, dt, this.aidKitTemplate, () => this.nextId++)
      updateAidKits(state, this.scene, dt)

      state.muzzleFlashTimer = Math.max(0, state.muzzleFlashTimer - dt)
      if (this.gunGroup) {
        this.gunGroup.position.z = state.muzzleFlashTimer > 0 ? -0.04 : 0
      }

      syncSoldierVisuals(state.soldiers, dt)
      this.checkWinCondition()
    }

    for (const soldier of state.soldiers) {
      if (soldier.rig.isRagdoll) {
        soldier.rig.updateRagdoll(dt, soldier.y)
      }
    }

    this.renderScene()
    return this.hudSnapshot()
  }

  renderPaused() {
    syncCameraToPlayer(this.getPlayer(), this.state, this.camera)
    this.renderScene()
  }

  reset() {
    disposeSoldiers(this.scene, this.state.soldiers)
    disposeBullets(this.scene, this.state.bullets)
    disposeAidKits(this.scene, this.state.aidKits)

    this.state.bullets = []
    this.state.aidKits = []
    this.state.soldiers = []
    this.state.kills = 0
    this.state.gameOver = false
    this.state.won = null
    this.state.player.velocityY = 0
    this.state.player.onGround = true
    this.state.muzzleFlashTimer = 0
    this.state.spectator = null

    this.nav = new NavigationGrid()
    this.spawnTeams()
    syncCameraToPlayer(this.getPlayer(), this.state, this.camera)
  }

  dispose(container: HTMLElement) {
    disposeSoldiers(this.scene, this.state.soldiers)
    disposeBullets(this.scene, this.state.bullets)
    disposeAidKits(this.scene, this.state.aidKits)
    if (this.renderer) {
      container.removeChild(this.renderer.domElement)
      this.renderer.dispose()
      this.renderer = null
    }
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.renderer?.domElement ?? null
  }

  isSpectating(): boolean {
    const player = this.getPlayer()
    return Boolean(player && !player.alive && !this.state.gameOver)
  }

  private getPlayer() {
    return findSoldier(this.state.soldiers, this.state.player.id)
  }

  private checkWinCondition() {
    const blueAlive = countAlive(this.state.soldiers, 'blue')
    const redAlive = countAlive(this.state.soldiers, 'red')

    if (redAlive === 0) {
      this.state.gameOver = true
      this.state.won = true
    } else if (blueAlive === 0) {
      this.state.gameOver = true
      this.state.won = false
    }
  }

  private hudSnapshot(): HudSnapshot {
    const blueAlive = countAlive(this.state.soldiers, 'blue')
    const redAlive = countAlive(this.state.soldiers, 'red')
    const player = this.getPlayer()
    const spectating = Boolean(player && !player.alive && !this.state.gameOver)

    let message = 'Blue team — eliminate the red soldiers!'
    if (this.state.gameOver) {
      message = this.state.won ? 'Victory! Red team defeated.' : 'Defeat! Blue team wiped out.'
    } else if (spectating) {
      message = 'Spectator mode — WASD fly · Space up · Shift down · Mouse look'
    }

    return {
      health: player?.health ?? 0,
      blueAlive,
      redAlive,
      kills: this.state.kills,
      gameOver: this.state.gameOver,
      won: this.state.won,
      message,
      spectating,
    }
  }

  private renderScene() {
    this.renderer?.render(this.scene, this.camera)
  }
}

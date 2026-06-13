import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameLoop } from '../../shared/hooks/useGameLoop'
import { useKeyboard } from '../../shared/hooks/useKeyboard'
import CharacterDesigner from './CharacterDesigner'
import {
  loadCharacterAppearance,
  saveCharacterAppearance,
  type CharacterAppearance,
} from './characterAppearance'
import { emptyInput, SOLDIERS_PER_TEAM, TeamWarEngine, type HudSnapshot, type InputState } from './teamWarEngine'
import styles from './team-war.module.css'

function createInitialHud(): HudSnapshot {
  return {
    health: 100,
    blueAlive: SOLDIERS_PER_TEAM,
    redAlive: SOLDIERS_PER_TEAM,
    kills: 0,
    gameOver: false,
    won: null,
    message: 'Design your soldier, then enter battle',
    spectating: false,
  }
}

export default function TeamWarGame() {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<TeamWarEngine | null>(null)
  const inputRef = useRef<InputState>(emptyInput())
  const keys = useKeyboard()
  const [hud, setHud] = useState<HudSnapshot>(createInitialHud)
  const [appearance, setAppearance] = useState<CharacterAppearance>(loadCharacterAppearance)
  const [battleStarted, setBattleStarted] = useState(false)
  const battleStartedRef = useRef(false)
  battleStartedRef.current = battleStarted

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const engine = new TeamWarEngine()
    engineRef.current = engine
    engine.mount(container, appearance)

    const onResize = () => {
      engine.resize(container.clientWidth, container.clientHeight)
      if (!battleStartedRef.current) engine.renderPaused()
    }
    onResize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      engine.dispose(container)
      engineRef.current = null
    }
  }, [])

  const soldierName = appearance.name.trim()

  const enterBattle = useCallback(() => {
    saveCharacterAppearance(appearance)
    engineRef.current?.setPlayerAppearance(appearance)
    setBattleStarted(true)
    engineRef.current?.getCanvas()?.requestPointerLock()
  }, [appearance])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !battleStarted) return

    const canvas = () => engineRef.current?.getCanvas()

    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas()) return
      inputRef.current.lookDeltaX += event.movementX
      inputRef.current.lookDeltaY += event.movementY
    }

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return
      if (document.pointerLockElement !== canvas()) {
        canvas()?.requestPointerLock()
        return
      }
      if (!engineRef.current?.isSpectating()) {
        inputRef.current.shoot = true
      }
    }

    const onMouseUp = () => {
      inputRef.current.shoot = false
    }

    let touchLookId: number | null = null
    let touchStartX = 0
    let touchStartY = 0
    let touchStartTime = 0

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        const t = event.touches[0]
        touchLookId = t.identifier
        touchStartX = t.clientX
        touchStartY = t.clientY
        touchStartTime = performance.now()
      }
    }

    const onTouchMove = (event: TouchEvent) => {
      for (const t of event.touches) {
        if (t.identifier === touchLookId) {
          inputRef.current.lookDeltaX += (t.clientX - touchStartX) * 1.2
          inputRef.current.lookDeltaY += (t.clientY - touchStartY) * 1.2
          touchStartX = t.clientX
          touchStartY = t.clientY
          event.preventDefault()
        }
      }
    }

    const onTouchEnd = (event: TouchEvent) => {
      const ended = [...event.changedTouches].some((t) => t.identifier === touchLookId)
      if (!ended) return
      const duration = performance.now() - touchStartTime
      const moved = Math.hypot(
        event.changedTouches[0].clientX - touchStartX,
        event.changedTouches[0].clientY - touchStartY,
      )
      if (duration < 220 && moved < 12 && !engineRef.current?.isSpectating()) {
        inputRef.current.shoot = true
        setTimeout(() => {
          inputRef.current.shoot = false
        }, 50)
      }
      touchLookId = null
    }

    window.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: false })
    container.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend', onTouchEnd)
    }
  }, [battleStarted])

  useGameLoop(
    useCallback(
      (deltaMs) => {
        const engine = engineRef.current
        if (!engine) return

        if (!battleStarted) {
          engine.renderPaused()
          return
        }

        const input = inputRef.current
        const pressed = keys.current

        input.forward = pressed.has('w') || pressed.has('W')
        input.backward = pressed.has('s') || pressed.has('S')
        input.left = pressed.has('a') || pressed.has('A')
        input.right = pressed.has('d') || pressed.has('D')
        input.jump = pressed.has(' ') || pressed.has('Spacebar')
        input.flyDown = pressed.has('Shift') || pressed.has('c') || pressed.has('C')

        const snapshot = engine.update(deltaMs / 1000, input)
        setHud(snapshot)

        input.lookDeltaX = 0
        input.lookDeltaY = 0
      },
      [battleStarted, keys],
    ),
  )

  const restart = () => {
    engineRef.current?.reset()
    setHud(createInitialHud())
    setAppearance(loadCharacterAppearance())
    setBattleStarted(false)
  }

  return (
    <div className={styles.root}>
      <div ref={containerRef} className={styles.viewport} />

      {battleStarted && (
        <>
          {!hud.spectating && <div className={styles.crosshair} aria-hidden />}
          {hud.spectating && (
            <div className={styles.spectatorBanner}>
              <span className={styles.spectatorTitle}>Spectator</span>
              <span className={styles.spectatorHint}>WASD fly · Space up · Shift down · Mouse look</span>
            </div>
          )}
          <div className={styles.hud}>
            {soldierName && <div className={styles.soldierName}>{soldierName}</div>}
            <div className={styles.hudRow}>
              <span className={styles.blueTag}>Blue {hud.blueAlive}</span>
              <span className={styles.health}>
                {hud.spectating ? 'Fallen' : `HP ${Math.max(0, Math.round(hud.health))}`}
              </span>
              <span className={styles.redTag}>Red {hud.redAlive}</span>
            </div>
            <div className={styles.hudRow}>
              <span className={styles.kills}>Kills {hud.kills}</span>
              <span className={styles.message}>{hud.message}</span>
            </div>
          </div>
        </>
      )}

      {!battleStarted && !hud.gameOver && (
        <div className={styles.designerOverlay}>
          <CharacterDesigner
            appearance={appearance}
            onChange={setAppearance}
            onEnterBattle={enterBattle}
          />
        </div>
      )}

      {hud.gameOver && (
        <div className={styles.endScreen}>
          <p className={hud.won ? styles.victory : styles.defeat}>
            {hud.won ? 'Victory!' : 'Defeat'}
          </p>
          <p className={styles.endStats}>
            {soldierName ? `${soldierName} · ` : ''}
            Kills {hud.kills} · Blue left: {hud.blueAlive} · Red left: {hud.redAlive}
          </p>
          <button type="button" className={styles.restartBtn} onClick={restart}>
            Fight again
          </button>
        </div>
      )}
    </div>
  )
}

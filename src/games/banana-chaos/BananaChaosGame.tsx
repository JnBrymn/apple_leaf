import { useCallback, useRef, useState } from 'react'
import { useGameLoop } from '../../shared/hooks/useGameLoop'
import { useKeyboard } from '../../shared/hooks/useKeyboard'
import styles from './banana-chaos.module.css'

const ARENA_WIDTH = 400
const ARENA_HEIGHT = 520
const BANANA_Y = ARENA_HEIGHT - 48
const BANANA_SIZE = 40
const PEEL_SIZE = 32
const PLAYER_SPEED = 0.28
const SPAWN_INTERVAL_MS = 900

const SILLY_MESSAGES = [
  'You slipped on a peel!',
  'Banana down! Peel victory!',
  'Too slippery! Try again!',
  'The peels got you!',
  'Oops! Banana needs a nap.',
  'Peel power wins this round!',
]

type Peel = { id: number; x: number; y: number; speed: number }

function randomMessage() {
  return SILLY_MESSAGES[Math.floor(Math.random() * SILLY_MESSAGES.length)]
}

function createInitialState() {
  return {
    playerX: ARENA_WIDTH / 2,
    peels: [] as Peel[],
    score: 0,
    gameOver: false,
    message: '',
    nextPeelId: 1,
  }
}

function circlesOverlap(ax: number, ay: number, ar: number, bx: number, by: number, br: number) {
  const dx = ax - bx
  const dy = ay - by
  const distance = Math.hypot(dx, dy)
  return distance < ar + br
}

export default function BananaChaosGame() {
  const keys = useKeyboard()
  const [state, setState] = useState(createInitialState)
  const spawnTimerRef = useRef(0)
  const scoreTimerRef = useRef(0)
  const difficultyRef = useRef(1)

  const reset = useCallback(() => {
    spawnTimerRef.current = 0
    scoreTimerRef.current = 0
    difficultyRef.current = 1
    setState(createInitialState())
  }, [])

  useGameLoop(
    useCallback(
      (deltaMs) => {
        if (state.gameOver) {
          return
        }

        const pressed = keys.current
        let move = 0
        if (pressed.has('ArrowLeft') || pressed.has('a')) {
          move -= 1
        }
        if (pressed.has('ArrowRight') || pressed.has('d')) {
          move += 1
        }

        spawnTimerRef.current += deltaMs
        scoreTimerRef.current += deltaMs

        setState((current) => {
          if (current.gameOver) {
            return current
          }

          let playerX = current.playerX + move * PLAYER_SPEED * deltaMs
          playerX = Math.max(BANANA_SIZE / 2, Math.min(ARENA_WIDTH - BANANA_SIZE / 2, playerX))

          let peels = current.peels.map((peel) => ({
            ...peel,
            y: peel.y + peel.speed * deltaMs * 0.06,
          }))

          let nextPeelId = current.nextPeelId
          if (spawnTimerRef.current >= SPAWN_INTERVAL_MS) {
            spawnTimerRef.current = 0
            const margin = PEEL_SIZE
            peels.push({
              id: nextPeelId,
              x: margin + Math.random() * (ARENA_WIDTH - margin * 2),
              y: -PEEL_SIZE,
              speed: 2.2 + difficultyRef.current * 0.35 + Math.random() * 0.8,
            })
            nextPeelId += 1
          }

          peels = peels.filter((peel) => peel.y < ARENA_HEIGHT + PEEL_SIZE)

          const hit = peels.some((peel) =>
            circlesOverlap(playerX, BANANA_Y, BANANA_SIZE * 0.42, peel.x, peel.y, PEEL_SIZE * 0.45),
          )

          if (hit) {
            return {
              ...current,
              playerX,
              peels,
              gameOver: true,
              message: randomMessage(),
            }
          }

          let score = current.score
          if (scoreTimerRef.current >= 1000) {
            scoreTimerRef.current -= 1000
            score += 1
            difficultyRef.current = 1 + score * 0.12
          }

          return {
            ...current,
            playerX,
            peels,
            score,
            nextPeelId,
          }
        })
      },
      [keys, state.gameOver],
    ),
    !state.gameOver,
  )

  return (
    <div className={styles.game}>
      <div className={styles.hud}>
        <span>Score: {state.score}</span>
        {state.gameOver && <span className={styles.gameOver}>Game Over!</span>}
        <button type="button" onClick={reset}>
          {state.gameOver ? 'Play Again' : 'Reset'}
        </button>
      </div>

      <p className={styles.sillyMsg}>{state.gameOver ? state.message : 'Dodge the peels!'}</p>

      <div
        className={styles.arena}
        style={{ width: ARENA_WIDTH, height: ARENA_HEIGHT }}
      >
        <div
          className={styles.banana}
          style={{ left: state.playerX, top: BANANA_Y }}
          aria-hidden
        >
          🍌
        </div>
        {state.peels.map((peel) => (
          <div
            key={peel.id}
            className={styles.peel}
            style={{ left: peel.x, top: peel.y }}
            aria-hidden
          />
        ))}
      </div>

      <p className={styles.controls}>Arrow keys or A/D to slide your banana</p>
    </div>
  )
}

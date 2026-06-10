import { useCallback, useRef, useState } from 'react'
import { useGameLoop } from '../../shared/hooks/useGameLoop'
import { useKeyboard } from '../../shared/hooks/useKeyboard'
import styles from './snake.module.css'

const GRID_SIZE = 20
const CELL_SIZE = 20
const TICK_MS = 120

type Point = { x: number; y: number }
type Direction = 'up' | 'down' | 'left' | 'right'

const DIRECTION_VECTORS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

function randomApple(snake: Point[]): Point {
  let position: Point

  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
  } while (snake.some((segment) => segment.x === position.x && segment.y === position.y))

  return position
}

function createInitialState() {
  const start: Point = { x: 10, y: 10 }
  return {
    snake: [start, { x: 9, y: 10 }, { x: 8, y: 10 }],
    direction: 'right' as Direction,
    apple: randomApple([start, { x: 9, y: 10 }, { x: 8, y: 10 }]),
    score: 0,
    gameOver: false,
  }
}

export default function SnakeGame() {
  const keys = useKeyboard()
  const [state, setState] = useState(createInitialState)
  const directionRef = useRef<Direction>(state.direction)
  const accumulatorRef = useRef(0)

  directionRef.current = state.direction

  const reset = useCallback(() => {
    const initial = createInitialState()
    directionRef.current = initial.direction
    accumulatorRef.current = 0
    setState(initial)
  }, [])

  useGameLoop(
    useCallback(
      (deltaMs) => {
        if (state.gameOver) {
          return
        }

        const pressed = keys.current
        let nextDirection = directionRef.current

        if ((pressed.has('ArrowUp') || pressed.has('w')) && nextDirection !== 'down') {
          nextDirection = 'up'
        } else if ((pressed.has('ArrowDown') || pressed.has('s')) && nextDirection !== 'up') {
          nextDirection = 'down'
        } else if ((pressed.has('ArrowLeft') || pressed.has('a')) && nextDirection !== 'right') {
          nextDirection = 'left'
        } else if ((pressed.has('ArrowRight') || pressed.has('d')) && nextDirection !== 'left') {
          nextDirection = 'right'
        }

        directionRef.current = nextDirection

        accumulatorRef.current += deltaMs
        if (accumulatorRef.current < TICK_MS) {
          return
        }
        accumulatorRef.current = 0

        setState((current) => {
          const direction = directionRef.current
          const head = current.snake[0]
          const vector = DIRECTION_VECTORS[direction]
          const nextHead = {
            x: head.x + vector.x,
            y: head.y + vector.y,
          }

          const hitWall =
            nextHead.x < 0 ||
            nextHead.x >= GRID_SIZE ||
            nextHead.y < 0 ||
            nextHead.y >= GRID_SIZE

          const hitSelf = current.snake.some(
            (segment) => segment.x === nextHead.x && segment.y === nextHead.y,
          )

          if (hitWall || hitSelf) {
            return { ...current, gameOver: true }
          }

          const ateApple = nextHead.x === current.apple.x && nextHead.y === current.apple.y
          const nextSnake = [nextHead, ...current.snake]

          if (!ateApple) {
            nextSnake.pop()
          }

          return {
            snake: nextSnake,
            direction,
            apple: ateApple ? randomApple(nextSnake) : current.apple,
            score: ateApple ? current.score + 1 : current.score,
            gameOver: false,
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
      <div
        className={styles.board}
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        <div
          className={styles.apple}
          style={{
            left: state.apple.x * CELL_SIZE,
            top: state.apple.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
          }}
        />
        {state.snake.map((segment, index) => (
          <div
            key={`${segment.x}-${segment.y}-${index}`}
            className={`${styles.segment} ${index === 0 ? styles.head : ''}`}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          />
        ))}
      </div>
      <p className={styles.controls}>Arrow keys or WASD to move</p>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameLoop } from '../../shared/hooks/useGameLoop'
import styles from './game-of-life.module.css'

const CELL_SIZE = 8
const TICK_MS = 80

function createGrid(cols: number, rows: number): boolean[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => false))
}

function randomizeGrid(grid: boolean[][], density = 0.25): boolean[][] {
  return grid.map((row) => row.map(() => Math.random() < density))
}

function countNeighbors(grid: boolean[][], x: number, y: number): number {
  const rows = grid.length
  const cols = grid[0].length
  let count = 0

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue
      const ny = y + dy
      const nx = x + dx
      if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && grid[ny][nx]) {
        count++
      }
    }
  }

  return count
}

function nextGeneration(grid: boolean[][]): boolean[][] {
  return grid.map((row, y) =>
    row.map((alive, x) => {
      const neighbors = countNeighbors(grid, x, y)
      if (alive) return neighbors === 2 || neighbors === 3
      return neighbors === 3
    }),
  )
}

export default function GameOfLife() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [grid, setGrid] = useState<boolean[][]>([])
  const [running, setRunning] = useState(false)
  const [cols, setCols] = useState(0)
  const [rows, setRows] = useState(0)
  const accumulatorRef = useRef(0)

  const resizeGrid = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const nextCols = Math.floor(rect.width / CELL_SIZE)
    const nextRows = Math.floor(rect.height / CELL_SIZE)

    if (nextCols < 1 || nextRows < 1) return

    canvas.width = nextCols * CELL_SIZE
    canvas.height = nextRows * CELL_SIZE

    setCols(nextCols)
    setRows(nextRows)
    setGrid((current) => {
      if (current.length === 0) return randomizeGrid(createGrid(nextCols, nextRows))
      return createGrid(nextCols, nextRows)
    })
  }, [])

  useEffect(() => {
    resizeGrid()
    const observer = new ResizeObserver(resizeGrid)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [resizeGrid])

  const draw = useCallback((currentGrid: boolean[][]) => {
    const canvas = canvasRef.current
    if (!canvas || currentGrid.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0f0'

    for (let y = 0; y < currentGrid.length; y++) {
      for (let x = 0; x < currentGrid[y].length; x++) {
        if (currentGrid[y][x]) {
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1)
        }
      }
    }
  }, [])

  useEffect(() => {
    draw(grid)
  }, [grid, draw])

  useGameLoop(
    useCallback(
      (deltaMs) => {
        if (!running) return

        accumulatorRef.current += deltaMs
        if (accumulatorRef.current < TICK_MS) return
        accumulatorRef.current = 0

        setGrid((current) => nextGeneration(current))
      },
      [running],
    ),
    running,
  )

  const toggleCell = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas || cols === 0 || rows === 0) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((clientX - rect.left) / CELL_SIZE)
    const y = Math.floor((clientY - rect.top) / CELL_SIZE)

    if (x < 0 || x >= cols || y < 0 || y >= rows) return

    setGrid((current) =>
      current.map((row, rowIndex) =>
        row.map((cell, colIndex) => (rowIndex === y && colIndex === x ? !cell : cell)),
      ),
    )
  }

  return (
    <div ref={containerRef} className={styles.root}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={running ? styles.active : ''}
          onClick={() => setRunning((value) => !value)}
        >
          {running ? 'Pause' : 'Play'}
        </button>
        <button type="button" onClick={() => setGrid((current) => nextGeneration(current))}>
          Step
        </button>
        <button type="button" onClick={() => setGrid(randomizeGrid(createGrid(cols, rows)))}>
          Random
        </button>
        <button type="button" onClick={() => setGrid(createGrid(cols, rows))}>
          Clear
        </button>
        <span>
          {cols}×{rows}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={(event) => toggleCell(event.clientX, event.clientY)}
      />
      <p className={styles.hint}>Click cells to draw. Green = alive.</p>
    </div>
  )
}

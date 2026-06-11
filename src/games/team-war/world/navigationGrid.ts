import { Grid } from 'pathfinding'
import { BODY_RADIUS, NAV_CELL_SIZE } from '../engine/constants'
import type { PathWaypoint } from '../engine/types'
import { getPlayableHalfExtents, overlapsObstacle } from './obstacles'

export class NavigationGrid {
  readonly cols: number
  readonly rows: number
  readonly originX: number
  readonly originZ: number
  private readonly grid: Grid

  constructor() {
    const { halfW, halfD } = getPlayableHalfExtents()
    this.originX = -halfW
    this.originZ = -halfD
    this.cols = Math.ceil((halfW * 2) / NAV_CELL_SIZE)
    this.rows = Math.ceil((halfD * 2) / NAV_CELL_SIZE)
    this.grid = new Grid(this.cols, this.rows)

    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        const { x, z } = this.cellToWorld(col, row)
        const walkable = !overlapsObstacle(x, z, BODY_RADIUS * 0.85)
        this.grid.setWalkableAt(col, row, walkable)
      }
    }
  }

  cellToWorld(col: number, row: number): PathWaypoint {
    return {
      x: this.originX + (col + 0.5) * NAV_CELL_SIZE,
      z: this.originZ + (row + 0.5) * NAV_CELL_SIZE,
    }
  }

  worldToCell(x: number, z: number): { col: number; row: number } | null {
    const col = Math.floor((x - this.originX) / NAV_CELL_SIZE)
    const row = Math.floor((z - this.originZ) / NAV_CELL_SIZE)
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return null
    return { col, row }
  }

  isWalkable(col: number, row: number): boolean {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return false
    return this.grid.isWalkableAt(col, row)
  }

  nearestWalkableCell(x: number, z: number, maxRadius = 6): { col: number; row: number } | null {
    const start = this.worldToCell(x, z)
    if (!start) return null
    if (this.isWalkable(start.col, start.row)) return start

    for (let radius = 1; radius <= maxRadius; radius++) {
      for (let dc = -radius; dc <= radius; dc++) {
        for (let dr = -radius; dr <= radius; dr++) {
          if (Math.abs(dc) !== radius && Math.abs(dr) !== radius) continue
          const col = start.col + dc
          const row = start.row + dr
          if (this.isWalkable(col, row)) return { col, row }
        }
      }
    }
    return null
  }

  cloneGrid(): Grid {
    return this.grid.clone()
  }
}

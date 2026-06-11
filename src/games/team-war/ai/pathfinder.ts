import { AStarFinder } from 'pathfinding'
import type { PathWaypoint } from '../engine/types'
import type { NavigationGrid } from '../world/navigationGrid'

const finder = new AStarFinder({
  allowDiagonal: true,
  dontCrossCorners: true,
})

export function findWorldPath(
  nav: NavigationGrid,
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
): PathWaypoint[] {
  const start = nav.nearestWalkableCell(fromX, fromZ)
  const end = nav.nearestWalkableCell(toX, toZ)
  if (!start || !end) return []

  const grid = nav.cloneGrid()
  const raw = finder.findPath(start.col, start.row, end.col, end.row, grid)
  if (raw.length === 0) return []

  return raw.map(([col, row]) => nav.cellToWorld(col, row))
}

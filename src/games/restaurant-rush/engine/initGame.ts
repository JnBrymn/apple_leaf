import markup from './gameMarkup.html?raw'
import { runGameLogic } from './gameLogic'

export type RestaurantRushDispose = () => void

export function initRestaurantRushGame(shell: HTMLElement): RestaurantRushDispose {
  const root = document.createElement('div')
  root.className = 'root'
  root.innerHTML = markup
  shell.appendChild(root)

  const getEl = (id: string) => root.querySelector<HTMLElement>(`#${CSS.escape(id)}`)

  const disposeLogic = runGameLogic(root, getEl)

  return () => {
    disposeLogic()
    root.remove()
  }
}

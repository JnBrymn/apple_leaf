import markup from './gameMarkup.html?raw'

import { runGameLogic } from './gameLogic'



export type RestaurantRushDispose = () => void



const OVERLAY_CLASSES = new Set([

  'start-screen',

  'name-screen',

  'menu-screen',

  'start-flash',

  'night-banner',

])



function isOverlayElement(node: Node): node is HTMLElement {

  if (!(node instanceof HTMLElement)) return false

  for (const cls of node.classList) {

    if (OVERLAY_CLASSES.has(cls)) return true

  }

  return false

}



/** Legacy sizing at 1:1 viewport; no extra upscale. */
function computeRestaurantRushScale(_viewportHeight: number): number {
  return 1
}



export function initRestaurantRushGame(shell: HTMLElement): RestaurantRushDispose {

  const prevBodyOverflow = document.body.style.overflow

  document.body.style.overflow = 'hidden'

  document.documentElement.classList.add('restaurant-rush-active')



  const root = document.createElement('div')

  root.className = 'root'



  const gameLayer = document.createElement('div')

  gameLayer.className = 'gameScaleLayer'



  const temp = document.createElement('div')

  temp.innerHTML = markup

  while (temp.firstChild) {

    const node = temp.firstChild

    if (isOverlayElement(node)) {

      root.appendChild(node)

    } else {

      gameLayer.appendChild(node)

    }

  }

  root.appendChild(gameLayer)

  shell.appendChild(root)



  const syncViewport = () => {
    const scale = computeRestaurantRushScale(window.innerHeight)
    gameLayer.style.setProperty('--rr-scale', scale.toFixed(3))
    if (scale === 1) {
      gameLayer.style.transform = 'none'
      gameLayer.style.width = '100vw'
      gameLayer.style.height = '100vh'
    } else {
      gameLayer.style.transform = `scale(${scale})`
      gameLayer.style.width = `calc(100vw / ${scale})`
      gameLayer.style.height = `calc(100vh / ${scale})`
    }
  }

  window.addEventListener('resize', syncViewport)

  syncViewport()



  const getEl = (id: string) => root.querySelector<HTMLElement>(`#${CSS.escape(id)}`)



  let disposeLogic: () => void

  try {

    disposeLogic = runGameLogic(root, getEl)

  } catch (err) {

    console.error('Restaurant Rush failed to start:', err)

    const msg = err instanceof Error ? err.message : String(err)

    const banner = document.createElement('div')

    banner.setAttribute('role', 'alert')

    banner.style.cssText =

      'position:fixed;top:48px;left:12px;right:12px;z-index:20000;padding:12px 16px;background:#fee;border:2px solid #c00;color:#600;font:600 14px system-ui,sans-serif;border-radius:8px'

    banner.textContent = `Restaurant Rush failed to start: ${msg}`

    shell.appendChild(banner)

    disposeLogic = () => {}

  }



  return () => {

    disposeLogic()

    root.remove()

    window.removeEventListener('resize', syncViewport)

    document.documentElement.classList.remove('restaurant-rush-active')

    document.body.style.overflow = prevBodyOverflow

  }

}



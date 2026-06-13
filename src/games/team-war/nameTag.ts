import { CanvasTexture, Sprite, SpriteMaterial } from 'three'

const NAME_TAG_Y = 2.25

export interface NameTagHandle {
  sprite: Sprite
  canvas: HTMLCanvasElement
  texture: CanvasTexture
}

export function createNameTag(name: string, teamColor: string): NameTagHandle | null {
  const label = name.trim()
  if (!label) return null

  const canvas = document.createElement('canvas')
  const texture = new CanvasTexture(canvas)
  const material = new SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  })
  const sprite = new Sprite(material)
  sprite.position.y = NAME_TAG_Y
  sprite.renderOrder = 10

  updateNameTag({ sprite, canvas, texture }, label, teamColor)
  return { sprite, canvas, texture }
}

export function updateNameTag(
  handle: Pick<NameTagHandle, 'sprite' | 'canvas' | 'texture'>,
  name: string,
  teamColor: string,
) {
  const label = name.trim()
  if (!label) {
    handle.sprite.visible = false
    return
  }

  const ctx = handle.canvas.getContext('2d')
  if (!ctx) return

  const fontSize = 28
  ctx.font = `800 ${fontSize}px system-ui, sans-serif`
  const textWidth = ctx.measureText(label).width
  const padX = 18
  const padY = 10
  const width = Math.ceil(textWidth + padX * 2)
  const height = fontSize + padY * 2

  handle.canvas.width = width
  handle.canvas.height = height

  ctx.font = `800 ${fontSize}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillStyle = 'rgba(15, 23, 42, 0.72)'
  ctx.strokeStyle = teamColor
  ctx.lineWidth = 3
  roundRect(ctx, 2, 2, width - 4, height - 4, 10)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#f8fafc'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = 4
  ctx.fillText(label, width / 2, height / 2)
  ctx.shadowBlur = 0

  handle.texture.needsUpdate = true
  handle.sprite.visible = true
  handle.sprite.scale.set(width / 110, height / 110, 1)
}

export function disposeNameTag(handle: NameTagHandle) {
  handle.texture.dispose()
  ;(handle.sprite.material as SpriteMaterial).dispose()
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

import { useEffect, useRef } from 'react'
import {
  AmbientLight,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three'
import type { CharacterAppearance } from './characterAppearance'
import { StickmanRig } from './stickmanRig'
import styles from './team-war.module.css'

interface CharacterPreviewProps {
  appearance: CharacterAppearance
}

export default function CharacterPreview({ appearance }: CharacterPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rigRef = useRef<StickmanRig | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)

    const scene = new Scene()
    scene.background = new Color(0x1e293b)

    scene.add(new AmbientLight(0xffffff, 0.65))
    const key = new DirectionalLight(0xfff4e0, 1.1)
    key.position.set(2, 4, 3)
    scene.add(key)

    const camera = new PerspectiveCamera(40, 1, 0.1, 50)
    camera.position.set(0, 1.35, 2.6)
    camera.lookAt(0, 1.1, 0)

    const rig = new StickmanRig('blue', appearance)
    rig.root.rotation.y = -0.45
    scene.add(rig.root)
    rigRef.current = rig

    let frameId = 0
    const tick = () => {
      rig.root.rotation.y += 0.008
      rig.updateAnimation(0.016, 0, false)
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(tick)
    }
    tick()

    const onResize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w === 0 || h === 0) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    }
    onResize()
    const observer = new ResizeObserver(onResize)
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      rig.dispose(scene)
      renderer.dispose()
      rigRef.current = null
    }
  }, [])

  useEffect(() => {
    rigRef.current?.applyAppearance(appearance)
  }, [appearance])

  return <canvas ref={canvasRef} className={styles.previewCanvas} />
}

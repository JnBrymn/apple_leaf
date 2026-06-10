import { useEffect, useRef } from 'react'

export function useGameLoop(callback: (deltaMs: number) => void, active = true) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!active) {
      return
    }

    let frameId = 0
    let lastTime = performance.now()

    const tick = (time: number) => {
      const deltaMs = time - lastTime
      lastTime = time
      callbackRef.current(deltaMs)
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [active])
}

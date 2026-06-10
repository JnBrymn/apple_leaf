import { useEffect, useRef } from 'react'

export function useKeyboard() {
  const keysRef = useRef(new Set<string>())

  useEffect(() => {
    const pressed = keysRef.current

    const onKeyDown = (event: KeyboardEvent) => {
      pressed.add(event.key)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      pressed.delete(event.key)
    }

    const onBlur = () => {
      pressed.clear()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      pressed.clear()
    }
  }, [])

  return keysRef
}

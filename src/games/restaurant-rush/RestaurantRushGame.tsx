import { useEffect, useRef } from 'react'
import styles from './restaurant-rush.module.css'
import './restaurant-rush.global.css'
import { initRestaurantRushGame } from './engine/initGame'

export default function RestaurantRushGame() {
  const shellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const shell = shellRef.current
    if (!shell) return
    return initRestaurantRushGame(shell)
  }, [])

  return <div ref={shellRef} className={`${styles.shell} gameShell`} />
}

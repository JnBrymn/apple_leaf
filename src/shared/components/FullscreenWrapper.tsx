import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './fullscreen.css'

interface FullscreenWrapperProps {
  title: string
  children: ReactNode
}

export default function FullscreenWrapper({ title, children }: FullscreenWrapperProps) {
  return (
    <div className="fullscreen-wrapper">
      <header className="fullscreen-header">
        <Link to="/" className="fullscreen-back">
          ← Back to Arcade
        </Link>
        <h1>{title}</h1>
      </header>
      <div className="fullscreen-content">{children}</div>
    </div>
  )
}

interface LegacyGameFrameProps {
  src: string
  title: string
}

export default function LegacyGameFrame({ src, title }: LegacyGameFrameProps) {
  return (
    <iframe
      className="legacy-game-frame"
      src={src}
      title={title}
      allow="fullscreen"
    />
  )
}

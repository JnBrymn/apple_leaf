import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function ThreeSnakesPage() {
  return (
    <FullscreenWrapper title="Three Snakes">
      <LegacyGameFrame src="/legacy/three-snakes/index.html" title="Three Snakes" />
    </FullscreenWrapper>
  )
}

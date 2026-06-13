import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function TheCrappyGamePage() {
  return (
    <FullscreenWrapper title="The Crappy Game">
      <LegacyGameFrame src="/legacy/the-crappy-game/index.html" title="The Crappy Game" />
    </FullscreenWrapper>
  )
}

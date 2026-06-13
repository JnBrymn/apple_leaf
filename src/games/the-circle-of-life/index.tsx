import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function TheCircleOfLifePage() {
  return (
    <FullscreenWrapper title="The Circle of Life">
      <LegacyGameFrame src="/legacy/the-circle-of-life/index.html" title="The Circle of Life" />
    </FullscreenWrapper>
  )
}

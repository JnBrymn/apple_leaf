import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function ClippeyPage() {
  return (
    <FullscreenWrapper title="Clippey">
      <LegacyGameFrame src="/legacy/clippey/index.html" title="Clippey" />
    </FullscreenWrapper>
  )
}

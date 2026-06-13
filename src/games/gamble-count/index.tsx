import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function GambleCountPage() {
  return (
    <FullscreenWrapper title="Gamble Count">
      <LegacyGameFrame src="/legacy/gamble-count/index.html" title="Gamble Count" />
    </FullscreenWrapper>
  )
}

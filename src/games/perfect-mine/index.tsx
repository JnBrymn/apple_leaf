import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function PerfectMinePage() {
  return (
    <FullscreenWrapper title="Perfect Mine">
      <LegacyGameFrame src="/legacy/perfect-mine/index.html" title="Perfect Mine" />
    </FullscreenWrapper>
  )
}

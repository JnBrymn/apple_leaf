import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function Click50Page() {
  return (
    <FullscreenWrapper title="Click 50">
      <LegacyGameFrame src="/legacy/click-50/index.html" title="Click 50" />
    </FullscreenWrapper>
  )
}

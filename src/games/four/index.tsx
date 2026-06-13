import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function FourPage() {
  return (
    <FullscreenWrapper title="Four">
      <LegacyGameFrame src="/legacy/four/index.html" title="Four" />
    </FullscreenWrapper>
  )
}

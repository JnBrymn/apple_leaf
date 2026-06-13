import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function InfiniteairPage() {
  return (
    <FullscreenWrapper title="Infiniteair">
      <LegacyGameFrame src="/legacy/infiniteair/index.html" title="Infiniteair" />
    </FullscreenWrapper>
  )
}

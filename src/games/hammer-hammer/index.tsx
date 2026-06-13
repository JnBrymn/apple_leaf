import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function HammerHammerPage() {
  return (
    <FullscreenWrapper title="Hammer Hammer">
      <LegacyGameFrame src="/legacy/hammer-hammer/index.html" title="Hammer Hammer" />
    </FullscreenWrapper>
  )
}

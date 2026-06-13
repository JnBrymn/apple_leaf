import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function BrotatoPage() {
  return (
    <FullscreenWrapper title="Brotato">
      <LegacyGameFrame src="/legacy/brotato/index.html" title="Brotato" />
    </FullscreenWrapper>
  )
}

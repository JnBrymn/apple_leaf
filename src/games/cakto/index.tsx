import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function CaktoPage() {
  return (
    <FullscreenWrapper title="Cakto">
      <LegacyGameFrame src="/legacy/cakto/index.html" title="Cakto" />
    </FullscreenWrapper>
  )
}

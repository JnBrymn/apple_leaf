import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function BeanBlastPage() {
  return (
    <FullscreenWrapper title="Bean Blast">
      <LegacyGameFrame src="/legacy/bean-blast/index.html" title="Bean Blast" />
    </FullscreenWrapper>
  )
}

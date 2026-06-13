import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function MathDrillPage() {
  return (
    <FullscreenWrapper title="Math Drill">
      <LegacyGameFrame src="/legacy/math-drill/index.html" title="Math Drill" />
    </FullscreenWrapper>
  )
}

import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function WritingAppPage() {
  return (
    <FullscreenWrapper title="Writing App">
      <LegacyGameFrame src="/legacy/writing-app/index.html" title="Writing App" />
    </FullscreenWrapper>
  )
}

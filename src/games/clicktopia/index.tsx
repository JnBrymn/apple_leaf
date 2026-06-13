import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function ClicktopiaPage() {
  return (
    <FullscreenWrapper title="Clicktopia">
      <LegacyGameFrame src="/legacy/clicktopia/index.html" title="Clicktopia" />
    </FullscreenWrapper>
  )
}

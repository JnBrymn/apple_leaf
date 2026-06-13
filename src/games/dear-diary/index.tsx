import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function DearDiaryPage() {
  return (
    <FullscreenWrapper title="Dear Diary">
      <LegacyGameFrame src="/legacy/dear-diary/index.html" title="Dear Diary" />
    </FullscreenWrapper>
  )
}

import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function TheButtonPage() {
  return (
    <FullscreenWrapper title="The Button">
      <LegacyGameFrame src="/legacy/the-button/index.html" title="The Button" />
    </FullscreenWrapper>
  )
}

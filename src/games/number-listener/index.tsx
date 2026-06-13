import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function NumberListenerPage() {
  return (
    <FullscreenWrapper title="Number Listener">
      <LegacyGameFrame src="/legacy/number-listener/index.html" title="Number Listener" />
    </FullscreenWrapper>
  )
}

import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function DoublePendulumPage() {
  return (
    <FullscreenWrapper title="Double Pendulum">
      <LegacyGameFrame src="/legacy/double-pendulum/index.html" title="Double Pendulum" />
    </FullscreenWrapper>
  )
}

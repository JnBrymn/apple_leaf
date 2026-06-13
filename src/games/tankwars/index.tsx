import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function TankwarsPage() {
  return (
    <FullscreenWrapper title="Tankwars">
      <LegacyGameFrame src="/legacy/tankwars/index.html" title="Tankwars" />
    </FullscreenWrapper>
  )
}

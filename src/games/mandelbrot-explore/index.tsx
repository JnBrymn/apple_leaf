import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function MandelbrotExplorePage() {
  return (
    <FullscreenWrapper title="Mandelbrot Explore">
      <LegacyGameFrame src="/legacy/mandelbrot-explore/index.html" title="Mandelbrot Explore" />
    </FullscreenWrapper>
  )
}

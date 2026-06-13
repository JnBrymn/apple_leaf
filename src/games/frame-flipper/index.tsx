import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import LegacyGameFrame from '../../shared/components/LegacyGameFrame'

export default function FrameFlipperPage() {
  return (
    <FullscreenWrapper title="Frame Flipper">
      <LegacyGameFrame src="/legacy/frame-flipper/index.html" title="Frame Flipper" />
    </FullscreenWrapper>
  )
}

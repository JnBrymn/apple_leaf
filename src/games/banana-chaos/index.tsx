import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import BananaChaosGame from './BananaChaosGame'
import styles from './banana-chaos.module.css'

export default function BananaChaos() {
  return (
    <FullscreenWrapper title="Banana Chaos">
      <div className={styles.root}>
        <BananaChaosGame />
      </div>
    </FullscreenWrapper>
  )
}

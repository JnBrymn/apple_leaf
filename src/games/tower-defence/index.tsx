import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import TowerDefenceGame from './TowerDefenceGame'
import styles from './tower-defence.module.css'

export default function TowerDefence() {
  return (
    <FullscreenWrapper title="Ragdoll Arena">
      <div className={styles.root}>
        <TowerDefenceGame />
      </div>
    </FullscreenWrapper>
  )
}

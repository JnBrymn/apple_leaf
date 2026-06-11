import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import TeamWarGame from './TeamWarGame'
import styles from './team-war.module.css'

export default function TeamWarPage() {
  return (
    <FullscreenWrapper title="Team War">
      <div className={styles.pageWrap}>
        <TeamWarGame />
      </div>
    </FullscreenWrapper>
  )
}

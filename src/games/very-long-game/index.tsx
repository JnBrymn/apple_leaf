import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import VeryLongGame from './VeryLongGame'
import styles from './very-long-game.module.css'

export default function VeryLongGamePage() {
  return (
    <FullscreenWrapper title="Game That Is A Verryyyyy... Long Game">
      <div className={styles.root}>
        <VeryLongGame />
      </div>
    </FullscreenWrapper>
  )
}

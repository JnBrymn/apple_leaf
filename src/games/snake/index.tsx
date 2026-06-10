import FullscreenWrapper from '../../shared/components/FullscreenWrapper'
import SnakeGame from './SnakeGame'
import styles from './snake.module.css'

export default function Snake() {
  return (
    <FullscreenWrapper title="Snake">
      <div className={styles.root}>
        <SnakeGame />
      </div>
    </FullscreenWrapper>
  )
}

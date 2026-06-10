import { Link } from 'react-router-dom'
import type { GameConfig } from './games.config'

interface GameCardProps {
  game: GameConfig
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link to={`/games/${game.id}`} className="game-card">
      <div className="game-card-thumbnail">
        <img
          src={game.thumbnail}
          alt=""
          onError={(event) => {
            event.currentTarget.style.display = 'none'
            event.currentTarget.nextElementSibling?.classList.remove('hidden')
          }}
        />
        <div className="game-card-placeholder hidden">
          {game.title.charAt(0)}
        </div>
      </div>
      <div className="game-card-body">
        <h2>{game.title}</h2>
        <p>{game.description}</p>
        <div className="game-card-tags">
          {game.tags.map((tag) => (
            <span key={tag} className="game-card-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

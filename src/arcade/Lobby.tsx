import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import '../auth/auth.css'
import { GAMES } from './games.config'
import GameCard from './GameCard'
import './lobby.css'

export default function Lobby() {
  const { user, loading } = useAuth()

  return (
    <div className="lobby-page">
      <main className="lobby">
        <header className="lobby-header">
          <h1>Game Arcade</h1>
          <p>Pick a game and play!</p>
          <div className="lobby-auth">
            {loading ? (
              <p className="lobby-auth-status">Checking sign-in...</p>
            ) : user ? (
              <>
                <p className="lobby-auth-status">Signed in as {user.email}</p>
                <Link className="lobby-auth-link" to="/backstage">
                  Backstage
                </Link>
                <a className="lobby-auth-link" href="/logout">
                  Sign out
                </a>
              </>
            ) : (
              <a className="lobby-auth-link" href="/login?next=/">
                Sign in with Google
              </a>
            )}
          </div>
        </header>
        <section className="lobby-grid">
          {GAMES.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </section>
      </main>
    </div>
  )
}

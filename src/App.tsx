import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import LoginRequired from './auth/LoginRequired'
import ProtectedRoute from './auth/ProtectedRoute'
import { GAMES } from './arcade/games.config'
import Lobby from './arcade/Lobby'

function GameLoader() {
  return (
    <div className="game-loader">
      <p>Loading game...</p>
    </div>
  )
}

function GameRoute({ gameId }: { gameId: string }) {
  const game = GAMES.find((entry) => entry.id === gameId)

  if (!game) {
    return <Navigate to="/" replace />
  }

  const GameComponent = game.component

  return (
    <Suspense fallback={<GameLoader />}>
      <GameComponent />
    </Suspense>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/login-required" element={<LoginRequired />} />
          {GAMES.map((game) => (
            <Route
              key={game.id}
              path={`/games/${game.id}`}
              element={
                <ProtectedRoute>
                  <GameRoute gameId={game.id} />
                </ProtectedRoute>
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

type ProtectedRouteProps = {
  children: React.ReactNode
}

function AuthLoading() {
  return (
    <div className="game-loader">
      <p>Checking sign-in...</p>
    </div>
  )
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <AuthLoading />
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname)
    return <Navigate to={`/login-required?next=${next}`} replace />
  }

  return children
}

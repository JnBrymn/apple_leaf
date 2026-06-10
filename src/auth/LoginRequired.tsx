import { Link, useSearchParams } from 'react-router-dom'
import './auth.css'

export default function LoginRequired() {
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') || '/'
  const loginUrl = `/login?next=${encodeURIComponent(next)}`

  return (
    <div className="auth-page">
      <main className="auth-card">
        <h1>Sign in to play</h1>
        <p>Use your Google account to open the games in this arcade.</p>
        <a className="auth-google-button" href={loginUrl}>
          Sign in with Google
        </a>
        <p className="auth-footnote">
          <Link to="/">Back to the lobby</Link>
        </p>
      </main>
    </div>
  )
}

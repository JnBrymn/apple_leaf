import { Link, useSearchParams } from 'react-router-dom'
import './auth.css'

export default function LoginRequired() {
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') || '/'
  const loginUrl = `/login?next=${encodeURIComponent(next)}`

  return (
    <div className="auth-page">
      <main className="auth-card">
        <h1>Sign in required</h1>
        <p>Use your Google account to visit the backstage area of the arcade.</p>
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

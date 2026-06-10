import { Link } from 'react-router-dom'
import '../auth/auth.css'

export default function Backstage() {
  return (
    <div className="auth-page">
      <main className="auth-card">
        <h1>🎪 Backstage 🎉</h1>
        <p>
          Welcome to the top-secret snack vault, where the arcade raccoon keeps glitter,
          spare joysticks, and exactly one extremely important banana.
        </p>
        <p>
          Current operations: fog machine calibration, confetti budgeting, and teaching the
          prize tickets to sing in harmony.
        </p>
        <p className="auth-footnote">
          <Link to="/">Back to the lobby</Link>
        </p>
      </main>
    </div>
  )
}

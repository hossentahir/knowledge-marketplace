import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { connectSocket } = useSocket()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Shown when user lands here after a successful password reset
  const resetSuccess = location.state?.resetSuccess

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Connect socket and announce presence immediately after login
      connectSocket(data.user.id)

      const path = data.user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'
      navigate(path)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-name">
            Teacher<span>Connect</span>
          </span>
          <p className="auth-brand-sub">Sign in to your account to continue</p>
        </div>

        {resetSuccess && (
          <div className="alert alert-success">
            Password reset successfully — sign in with your new password.
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              className="form-control"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="form-label-link">Forgot password?</Link>
            </div>
            <input
              id="password"
              className="form-control"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  )
}

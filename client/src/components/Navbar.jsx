import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const isAuth = !!token

  const isAuthPage = ['/login', '/register'].includes(location.pathname)
  if (isAuthPage) return null

  const dashboardPath = user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to={isAuth ? dashboardPath : '/login'} className="navbar-brand">
        Teacher<span>Connect</span>
      </Link>

      <div className="navbar-actions">
        {isAuth ? (
          <>
            {user?.role !== 'teacher' && <Link to="/search" className="nav-link">Search</Link>}
            <Link to={dashboardPath} className="nav-link">Dashboard</Link>
            <div className="nav-divider" />
            <span className={`role-badge ${user?.role}`}>{user?.role}</span>
            <span className="user-name">{user?.name}</span>
            <button className="btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
          </>
        )}
      </div>
    </nav>
  )
}

import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!user?.role || !allowedRoles.includes(user.role)) {
      const fallbackPath = user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'
      return <Navigate to={fallbackPath} replace />
    }
  }

  return <Outlet />
}

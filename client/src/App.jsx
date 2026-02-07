import { useState } from 'react'
import Register from './components/Register'
import Login from './components/Login'
import './App.css'

function App() {
  const [view, setView] = useState('login') // 'login' | 'register'
  const [loginSuccess, setLoginSuccess] = useState(null)

  const handleLoginSuccess = (data) => {
    setLoginSuccess(`Welcome back, ${data.user.name}! You are logged in as ${data.user.role}.`)
  }

  const handleRegisterSuccess = () => {
    setLoginSuccess(null)
    setView('login')
  }

  return (
    <div className="app">
      <h1>Teacher-Student</h1>
      {loginSuccess && <p className="success">{loginSuccess}</p>}
      {view === 'login' ? (
        <Login onSuccess={handleLoginSuccess} onSwitchToRegister={() => setView('register')} />
      ) : (
        <Register onSuccess={handleRegisterSuccess} onSwitchToLogin={() => setView('login')} />
      )}
    </div>
  )
}

export default App

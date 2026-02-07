import { useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchHealth = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('http://localhost:5000/api/health')
      const data = await res.json()
      setMessage(data.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>React + Vite</h1>
      <button onClick={fetchHealth} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Health'}
      </button>
      {message && <p className="message">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default App

import { useState } from 'react'
import { useSocket } from '../context/SocketContext'

export default function SearchPage() {
  const { isOnline } = useSocket()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successId, setSuccessId] = useState(null)
  const [requestingId, setRequestingId] = useState(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessId(null)
    setSearched(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('You must be logged in as a student to search')
      const res = await fetch(
        `http://localhost:5000/api/expertise/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Search failed')
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestTopic = async (expertiseId) => {
    setSuccessId(null)
    setError(null)
    setRequestingId(expertiseId)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('You must be logged in to request a topic')
      const res = await fetch('http://localhost:5000/api/topic-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ expertiseId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to request topic')
      setSuccessId(expertiseId)
    } catch (err) {
      setError(err.message)
    } finally {
      setRequestingId(null)
    }
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Search Expertise</h2>
          <p>Find a teacher by topic and send a session request</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          className="form-control"
          type="text"
          placeholder="Search by topic, skill or keyword…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {loading && <p className="loading-text">Searching…</p>}

      {!loading && searched && (
        <div className="grid">
          {results.length === 0 && (
            <div className="empty-state">
              <span className="empty-state-icon">🔍</span>
              <p>No results found for "{query}"</p>
            </div>
          )}

          {results.map((item) => {
            const teacherOnline = isOnline(item.teacher?._id)
            return (
            <div key={item._id} className="card">
              <div className="card-title">{item.title}</div>

              <div className="card-meta">
                <span>
                  <span className={`presence-dot ${teacherOnline ? 'online' : 'offline'}`} />
                  <strong>Teacher</strong> {item.teacher?.name}
                </span>
                <span>{item.teacher?.email}</span>
              </div>

              {item.description && (
                <p className="card-description">{item.description}</p>
              )}

              <div className="card-price">${item.price}</div>

              <div className="card-footer">
                {successId === item._id ? (
                  <span className="status-badge status-accepted">Request sent ✓</span>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleRequestTopic(item._id)}
                    disabled={requestingId === item._id}
                  >
                    {requestingId === item._id ? 'Sending…' : 'Request topic'}
                  </button>
                )}
              </div>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

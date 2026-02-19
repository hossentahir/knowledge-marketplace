import { useState } from 'react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [requestMessage, setRequestMessage] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setRequestMessage(null)
    try {
      const res = await fetch(
        `http://localhost:5000/api/expertise/search?query=${encodeURIComponent(query)}`,
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
    setRequestMessage(null)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('You must be logged in as a student to request a topic')
      }

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

      setRequestMessage('Request sent')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2>Search Expertise</h2>
      <form className="auth-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by topic..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {requestMessage && <p className="success">{requestMessage}</p>}
      {error && <p className="error">{error}</p>}

      <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
        {results.map((item) => (
          <div
            key={item._id}
            style={{
              border: '1px solid #444',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem' }}>{item.title}</h3>
            <p style={{ margin: '0 0 0.25rem' }}>
              <strong>Teacher:</strong> {item.teacher?.name} ({item.teacher?.email})
            </p>
            <p style={{ margin: '0 0 0.5rem' }}>
              <strong>Price:</strong> ${item.price}
            </p>
            <button type="button" onClick={() => handleRequestTopic(item._id)}>
              Request Topic
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}


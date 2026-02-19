import { useEffect, useState } from 'react'

export default function StudentDashboard() {
  const [expertise, setExpertise] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [requestMessage, setRequestMessage] = useState(null)

  useEffect(() => {
    const fetchExpertise = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('http://localhost:5000/api/expertise/search?query=')
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load expertise')
        setExpertise(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchExpertise()
  }, [])

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
      <h2>Student Dashboard</h2>
      {requestMessage && <p className="success">{requestMessage}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading expertise...</p>}

      <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
        {expertise.map((item) => (
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
        {!loading && !error && expertise.length === 0 && <p>No expertise available yet.</p>}
      </div>
    </div>
  )
}


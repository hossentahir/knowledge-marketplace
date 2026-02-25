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

      <div className="dashboard-list">
        {expertise.map((item) => (
          <div key={item._id} className="dashboard-card">
            <h3>{item.title}</h3>
            <p>
              <strong>Teacher:</strong> {item.teacher?.name} ({item.teacher?.email})
            </p>
            <p>
              <strong>Price:</strong> ${item.price}
            </p>
            {item.description && (
              <p>
                <strong>About:</strong> {item.description}
              </p>
            )}
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


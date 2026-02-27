import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function StudentDashboard() {
  const [expertise, setExpertise] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successId, setSuccessId] = useState(null)
  const [requestingId, setRequestingId] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    const fetchExpertise = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:5000/api/expertise/search?query=', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
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

  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true)
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:5000/api/topic-request/student/history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load request history')
        setHistory(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const handleRequestTopic = async (expertiseId) => {
    setSuccessId(null)
    setError(null)
    setRequestingId(expertiseId)
    try {
      const token = localStorage.getItem('token')
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
      const token = localStorage.getItem('token')
      const historyRes = await fetch('http://localhost:5000/api/topic-request/student/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const historyData = await historyRes.json()
      if (historyRes.ok) {
        setHistory(historyData)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setRequestingId(null)
    }
  }

  const acceptedRequests = history.filter((request) => request.status === 'accepted' && request.conversationId)

  return (
    <div className="main-content">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Browse Expertise</h2>
          <p>Hello, {user?.name} — find a teacher and request a session</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="section">
        <p className="section-title">Available listings</p>

        {loading ? (
          <p className="loading-text">Loading expertise…</p>
        ) : (
          <div className="grid">
            {expertise.length === 0 && (
              <div className="empty-state">
                <span className="empty-state-icon">📚</span>
                <p>No expertise listings yet.</p>
              </div>
            )}

            {expertise.map((item) => (
              <div key={item._id} className="card">
                <div className="card-title">{item.title}</div>

                <div className="card-meta">
                  <span><strong>Teacher</strong> {item.teacher?.name}</span>
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
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <p className="section-title">Accepted requests</p>
        {historyLoading ? (
          <p className="loading-text">Loading your requests...</p>
        ) : (
          <div className="grid">
            {acceptedRequests.length === 0 && (
              <div className="empty-state">
                <span className="empty-state-icon">💬</span>
                <p>No accepted requests yet.</p>
              </div>
            )}
            {acceptedRequests.map((request) => (
              <div key={request._id} className="card">
                <div className="card-title">{request.expertise?.title}</div>
                <div className="card-meta">
                  <span><strong>Teacher</strong> {request.teacher?.name}</span>
                  <span>{request.teacher?.email}</span>
                </div>
                <div className="card-footer">
                  <span className="status-badge status-accepted">accepted</span>
                  <Link to={`/chat/${request.conversationId}`} className="btn btn-outline btn-sm">
                    Open chat
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

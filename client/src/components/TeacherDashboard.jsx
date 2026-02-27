import { useEffect, useState } from 'react'

export default function TeacherDashboard() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(null)

  const [requests, setRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [requestsError, setRequestsError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const fetchRequests = async () => {
    setRequestsLoading(true)
    setRequestsError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/topic-request/teacher', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load topic requests')
      setRequests(data)
    } catch (err) {
      setRequestsError(err.message)
    } finally {
      setRequestsLoading(false)
    }
  }

  const fetchHistory = async () => {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/topic-request/teacher/history', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load request history')
      setHistory(data)
    } catch (err) {
      setHistoryError(err.message)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  useEffect(() => {
    if (showHistory) {
      fetchHistory()
    }
  }, [showHistory])

  const handleUpdateRequest = async (id, status) => {
    setUpdatingId(id)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5000/api/topic-request/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update request')
      await fetchRequests()
      if (showHistory) {
        await fetchHistory()
      }
    } catch (err) {
      setRequestsError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    setFormSuccess(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/expertise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, price: Number(price) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create expertise')
      setFormSuccess('Expertise listing published!')
      setTitle('')
      setDescription('')
      setPrice('')
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const pendingRequests = requests

  return (
    <div className="main-content">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Teacher Dashboard</h2>
          <p>Welcome back, {user?.name} — manage your expertise and student requests</p>
        </div>
      </div>

      {/* Post expertise section */}
      <div className="section">
        <p className="section-title">Post new expertise</p>

        <div className="form-card">
          {formError   && <div className="alert alert-error">{formError}</div>}
          {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Title</label>
              <input
                id="title"
                className="form-control"
                type="text"
                placeholder="e.g. Advanced Python Programming"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description</label>
              <input
                id="description"
                className="form-control"
                type="text"
                placeholder="What will students learn?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="price">Price (USD)</label>
              <input
                id="price"
                className="form-control"
                type="number"
                placeholder="0"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={formLoading}>
              {formLoading ? 'Publishing…' : 'Publish listing'}
            </button>
          </form>
        </div>
      </div>

      {/* Topic requests section */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <p className="section-title" style={{ marginBottom: 0 }}>
            Pending requests
            {pendingRequests.length > 0 && (
              <span
                style={{
                  marginLeft: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'var(--clr-primary-soft)',
                  color: 'var(--clr-primary)',
                  borderRadius: '99px',
                  padding: '0.15em 0.6em',
                }}
              >
                {pendingRequests.length}
              </span>
            )}
          </p>
          <button className="btn btn-outline btn-sm" onClick={() => setShowHistory((prev) => !prev)}>
            {showHistory ? 'Hide history' : 'View history'}
          </button>
        </div>

        {requestsLoading && <p className="loading-text">Loading requests…</p>}
        {requestsError  && <div className="alert alert-error">{requestsError}</div>}

        {!requestsLoading && (
          <div className="grid">
            {pendingRequests.length === 0 && (
              <div className="empty-state">
                <span className="empty-state-icon">📬</span>
                <p>No pending requests right now.</p>
              </div>
            )}

            {pendingRequests.map((req) => (
              <div key={req._id} className="card">
                <div className="card-title">{req.expertise?.title}</div>

                <div className="card-meta">
                  <span><strong>Student</strong> {req.student?.name}</span>
                  <span>{req.student?.email}</span>
                </div>

                <div className="card-price">${req.expertise?.price}</div>

                <div className="card-footer">
                  <span className="status-badge status-pending">{req.status}</span>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleUpdateRequest(req._id, 'accepted')}
                    disabled={updatingId === req._id}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleUpdateRequest(req._id, 'rejected')}
                    disabled={updatingId === req._id}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showHistory && (
        <div className="section">
          <p className="section-title">Request history</p>
          {historyLoading && <p className="loading-text">Loading history…</p>}
          {historyError && <div className="alert alert-error">{historyError}</div>}

          {!historyLoading && !historyError && (
            <div className="grid">
              {history.length === 0 && (
                <div className="empty-state">
                  <span className="empty-state-icon">🕘</span>
                  <p>No processed requests yet.</p>
                </div>
              )}

              {history.map((req) => (
                <div key={req._id} className="card">
                  <div className="card-title">{req.expertise?.title}</div>
                  <div className="card-meta">
                    <span><strong>Student</strong> {req.student?.name}</span>
                    <span>{req.student?.email}</span>
                  </div>
                  <div className="card-price">${req.expertise?.price}</div>
                  <div className="card-footer">
                    <span className={`status-badge ${req.status === 'accepted' ? 'status-accepted' : 'status-rejected'}`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'

export default function TeacherDashboard() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [requests, setRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [requestsError, setRequestsError] = useState(null)

  const fetchRequests = async () => {
    setRequestsLoading(true)
    setRequestsError(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('You must be logged in as a teacher')
      }

      const res = await fetch('http://localhost:5000/api/topic-request/teacher', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleUpdateRequest = async (id, status) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('You must be logged in as a teacher')
      }

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
    } catch (err) {
      setRequestsError(err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('You must be logged in as a teacher')
      }

      const res = await fetch('http://localhost:5000/api/expertise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create expertise')

      setSuccess('Expertise created successfully')
      setTitle('')
      setDescription('')
      setPrice('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Teacher Dashboard</h2>
      <h3>Create Expertise</h3>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="0"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Expertise'}
        </button>
        {success && <p className="success">{success}</p>}
        {error && <p className="error">{error}</p>}
      </form>

      <h3 style={{ marginTop: '2rem' }}>Pending Topic Requests</h3>
      {requestsLoading && <p>Loading requests...</p>}
      {requestsError && <p className="error">{requestsError}</p>}
      <div className="dashboard-list">
        {requests
          .filter((r) => r.status === 'pending')
          .map((req) => (
            <div key={req._id} className="dashboard-card">
              <h3>{req.expertise?.title}</h3>
              <p>
                <strong>Student:</strong> {req.student?.name} ({req.student?.email})
              </p>
              <p>
                <strong>Status:</strong> {req.status}
              </p>
              <button type="button" onClick={() => handleUpdateRequest(req._id, 'accepted')}>
                Accept
              </button>{' '}
              <button type="button" onClick={() => handleUpdateRequest(req._id, 'rejected')}>
                Reject
              </button>
            </div>
          ))}
        {!requestsLoading &&
          !requestsError &&
          requests.filter((r) => r.status === 'pending').length === 0 && <p>No pending requests.</p>}
      </div>
    </div>
  )
}

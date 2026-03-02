import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'

export default function StudentDashboard() {
  const { isOnline } = useSocket()

  const [expertise, setExpertise] = useState([])
  const [expertiseLoading, setExpertiseLoading] = useState(false)
  const [expertiseError, setExpertiseError] = useState(null)
  const [successId, setSuccessId] = useState(null)
  const [requestingId, setRequestingId] = useState(null)

  const [myRequests, setMyRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(false)

  // All teachers list for the presence panel
  const [teachers, setTeachers] = useState([])
  const [teachersLoading, setTeachersLoading] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const token = () => localStorage.getItem('token')

  const fetchExpertise = async () => {
    setExpertiseLoading(true)
    setExpertiseError(null)
    try {
      const res = await fetch('http://localhost:5000/api/expertise/search?query=', {
        headers: { Authorization: `Bearer ${token()}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load expertise')
      setExpertise(data)
    } catch (err) {
      setExpertiseError(err.message)
    } finally {
      setExpertiseLoading(false)
    }
  }

  const fetchMyRequests = async () => {
    setRequestsLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/topic-request/student/history', {
        headers: { Authorization: `Bearer ${token()}` },
      })
      const data = await res.json()
      if (res.ok) setMyRequests(data)
    } catch (_) {
      // supplementary — silent fail
    } finally {
      setRequestsLoading(false)
    }
  }

  const fetchTeachers = async () => {
    setTeachersLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/users?role=teacher', {
        headers: { Authorization: `Bearer ${token()}` },
      })
      const data = await res.json()
      if (res.ok) setTeachers(data)
    } catch (_) {
    } finally {
      setTeachersLoading(false)
    }
  }

  useEffect(() => {
    fetchExpertise()
    fetchMyRequests()
    fetchTeachers()
  }, [])

  const handleRequestTopic = async (expertiseId) => {
    setSuccessId(null)
    setExpertiseError(null)
    setRequestingId(expertiseId)
    try {
      const res = await fetch('http://localhost:5000/api/topic-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ expertiseId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to request topic')
      setSuccessId(expertiseId)
      fetchMyRequests()
    } catch (err) {
      setExpertiseError(err.message)
    } finally {
      setRequestingId(null)
    }
  }

  const pendingCount = myRequests.filter((r) => r.status === 'pending').length

  // Sort teachers: online first
  const sortedTeachers = [...teachers].sort((a, b) => {
    const aOn = isOnline(a._id) ? 1 : 0
    const bOn = isOnline(b._id) ? 1 : 0
    return bOn - aOn
  })
  const onlineTeacherCount = sortedTeachers.filter((t) => isOnline(t._id)).length

  return (
    <div className="main-content">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Student Dashboard</h2>
          <p>Hello, {user?.name} — browse expertise and chat with your teachers</p>
        </div>
      </div>

      {/* ── Teachers presence panel ── */}
      <div className="section">
        <p className="section-title">
          Teachers
          {onlineTeacherCount > 0 && (
            <span className="presence-count-badge">{onlineTeacherCount} online</span>
          )}
        </p>

        {teachersLoading ? (
          <p className="loading-text">Loading teachers…</p>
        ) : (
          <div className="presence-panel">
            {sortedTeachers.length === 0 && (
              <p className="loading-text" style={{ margin: 0 }}>No teachers registered yet.</p>
            )}
            {sortedTeachers.map((teacher) => {
              const online = isOnline(teacher._id)
              return (
                <div key={teacher._id} className={`presence-item ${online ? 'online-item' : 'offline-item'}`}>
                  <span className={`presence-dot ${online ? 'online' : 'offline'}`} />
                  <span className="presence-item-name">{teacher.name}</span>
                  <span className="presence-item-email">{teacher.email}</span>
                  {online && <span className="presence-online-label">Online</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── My Requests ── */}
      {myRequests.length > 0 && (
        <div className="section">
          <p className="section-title">
            My requests
            {pendingCount > 0 && (
              <span style={{
                marginLeft: '0.5rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: 'var(--clr-warning-soft)',
                color: 'var(--clr-warning)',
                borderRadius: '99px',
                padding: '0.15em 0.6em',
              }}>
                {pendingCount} pending
              </span>
            )}
          </p>

          {requestsLoading ? (
            <p className="loading-text">Loading your requests…</p>
          ) : (
            <div className="grid">
              {myRequests.map((req) => {
                const teacherOnline = isOnline(req.teacher?._id)
                return (
                  <div key={req._id} className="card">
                    <div className="card-title">{req.expertise?.title}</div>
                    <div className="card-meta">
                      <span>
                        <span className={`presence-dot ${teacherOnline ? 'online' : 'offline'}`} />
                        <strong>Teacher</strong> {req.teacher?.name}
                      </span>
                      <span>{req.teacher?.email}</span>
                    </div>
                    <div className="card-price">${req.expertise?.price}</div>
                    <div className="card-footer">
                      <span className={`status-badge status-${req.status}`}>{req.status}</span>
                      {req.status === 'accepted' && req.conversationId && (
                        <Link to={`/chat/${req.conversationId}`} className="btn btn-primary btn-sm">
                          Open chat
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Available expertise ── */}
      <div className="section">
        <p className="section-title">Available expertise</p>

        {expertiseError && <div className="alert alert-error">{expertiseError}</div>}

        {expertiseLoading ? (
          <p className="loading-text">Loading expertise…</p>
        ) : (
          <div className="grid">
            {expertise.length === 0 && (
              <div className="empty-state">
                <span className="empty-state-icon">📚</span>
                <p>No expertise listings yet.</p>
              </div>
            )}

            {expertise.map((item) => {
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
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function ChatPage({ conversationId: propConversationId }) {
  const { conversationId: paramConversationId } = useParams()
  const conversationId = propConversationId || paramConversationId

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const fetchMessages = async () => {
    if (!conversationId) return

    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5000/api/messages/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load messages')
      setMessages(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [conversationId])

  const handleSend = async (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || !conversationId) return

    setSending(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversationId, text: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send message')

      setText('')
      await fetchMessages()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Chat</h2>
          <p>Conversation messages</p>
        </div>
      </div>

      {!conversationId && <div className="alert alert-error">Missing conversation ID.</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="loading-text">Loading messages...</p>}

      {!loading && conversationId && (
        <>
          <div className="section">
            <p className="section-title">Messages</p>
            <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
              {messages.length === 0 && (
                <div className="empty-state">
                  <span className="empty-state-icon">💬</span>
                  <p>No messages yet. Start the conversation.</p>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg._id} className="card">
                  <div className="card-meta">
                    <strong>{msg.sender?.name || 'User'}</strong> ({msg.sender?.role || 'member'})
                  </div>
                  <p className="card-description" style={{ color: 'var(--text)' }}>
                    {msg.text}
                  </p>
                  <div className="card-meta">
                    {new Date(msg.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <p className="section-title">Send message</p>
            <form className="form-card" onSubmit={handleSend}>
              <div className="form-group">
                <label className="form-label" htmlFor="messageText">Message</label>
                <input
                  id="messageText"
                  className="form-control"
                  type="text"
                  placeholder="Write a message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={sending}>
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

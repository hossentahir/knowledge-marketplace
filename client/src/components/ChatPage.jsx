import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

export default function ChatPage() {
  const { conversationId } = useParams()
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null')

  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const token = () => localStorage.getItem('token')

  const fetchConversation = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load conversation')
      setConversation(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const fetchMessages = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token()}` },
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
    if (!conversationId) return
    fetchConversation()
    fetchMessages()
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setSending(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ conversationId, text: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send message')
      setText('')
      await fetchMessages(true)
      inputRef.current?.focus()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend(e)
    }
  }

  const otherPerson = conversation
    ? String(conversation.student?._id) === String(currentUser?.id)
      ? { ...conversation.teacher, role: 'teacher' }
      : { ...conversation.student, role: 'student' }
    : null

  const dashboardPath =
    currentUser?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'

  return (
    <div className="chat-page">
      {/* ── Header ── */}
      <div className="chat-header">
        <Link to={dashboardPath} className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>
          ← Back
        </Link>

        {otherPerson ? (
          <>
            <div className="chat-header-avatar">
              {otherPerson.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="chat-header-info">
              <div className="chat-header-name">{otherPerson.name}</div>
              <div className="chat-header-sub">{otherPerson.email} · {otherPerson.role}</div>
            </div>
          </>
        ) : (
          <div className="chat-header-info">
            <div className="chat-header-name">Conversation</div>
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="chat-messages">
        {loading && (
          <p className="loading-text" style={{ textAlign: 'center' }}>Loading messages…</p>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && messages.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">💬</span>
            <p>No messages yet — say hello!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = String(msg.sender?._id) === String(currentUser?.id)
          return (
            <div key={msg._id} className={`chat-msg ${isMine ? 'mine' : 'theirs'}`}>
              {!isMine && (
                <span className="chat-msg-name">{msg.sender?.name}</span>
              )}
              <div className="chat-bubble">{msg.text}</div>
              <span className="chat-msg-time">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <form className="chat-input-bar" onSubmit={handleSend}>
        <input
          ref={inputRef}
          className="form-control"
          type="text"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          autoFocus
        />
        <button
          className="btn btn-primary"
          type="submit"
          disabled={sending || !text.trim()}
        >
          {sending ? '…' : 'Send'}
        </button>
      </form>
    </div>
  )
}

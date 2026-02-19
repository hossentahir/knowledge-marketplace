import { useState } from 'react'

export default function TeacherDashboard() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

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
    </div>
  )
}

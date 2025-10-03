// SupportTab: Feedback/support form, POST to backend
import { useState } from 'react'

export default function SupportTab({ user }: { user: any }) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Compose name from firstName and lastName
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setSubmitting(true)
    await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        name,
        email: user.email,
        message,
        date: new Date().toISOString(),
      }),
    })
    setSubmitting(false)
    setSuccess(true)
    setMessage('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Your feedback or support request..." className="w-full border rounded p-2" required />
      <button type="submit" disabled={submitting} className="bg-gray-800 text-white px-2 py-1 rounded">Submit</button>
      {success && <div className="text-green-600 text-sm">Message sent! Our team will contact you soon.</div>}
    </form>
  )
}

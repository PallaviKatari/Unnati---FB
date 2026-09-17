import { useEffect, useState } from 'react'
import './App.css'

const initialForm = { name: '', remark: '' }

function App() {
  const [form, setForm] = useState(initialForm)
  const [feedbacks, setFeedbacks] = useState([])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/feedback')
      const data = await response.json()
      setFeedbacks(Array.isArray(data) ? data : [])
    } catch {
      setFeedbacks([])
    }
  }

  useEffect(() => {
    fetchFeedback()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.name.trim() || !form.remark.trim()) {
      setError('Please enter both your name and your remark.')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          remark: form.remark.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Could not save feedback')
      }

      const saved = await response.json()
      setFeedbacks((current) => [saved, ...current])
      setForm(initialForm)
    } catch {
      setError('Something went wrong while saving your feedback.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="app-shell">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card glass-card shadow-lg border-0">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <span className="badge text-uppercase">AI Community Feedback</span>
                  <h1 className="display-6 fw-bold mt-3 mb-2">Share Your AI Insight</h1>
                  <p className="lead text-light-emphasis mb-0">
                    Tell us what excites you about artificial intelligence and the future of innovation.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="row g-3">
                  <div className="col-12">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="remark" className="form-label">Remark</label>
                    <textarea
                      id="remark"
                      name="remark"
                      className="form-control form-control-lg"
                      rows="4"
                      placeholder="Write your feedback about AI..."
                      value={form.remark}
                      onChange={handleChange}
                    />
                  </div>

                  {error && <div className="col-12"><div className="alert alert-danger mb-0">{error}</div></div>}

                  <div className="col-12 text-center mt-3">
                    <button type="submit" className="btn btn-primary btn-lg px-4" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Submit Feedback'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="section-title mb-0">Saved Feedback</h2>
                <span className="badge bg-light text-dark">{feedbacks.length}</span>
              </div>

              {feedbacks.length === 0 ? (
                <div className="card border-0 shadow-sm empty-state">
                  <div className="card-body text-center py-5 text-light-emphasis">
                    No feedback submitted yet. Be the first to share your AI ideas.
                  </div>
                </div>
              ) : (
                <div className="row g-3">
                  {feedbacks.map((item) => (
                    <div key={item.id || `${item.name}-${item.remark}`} className="col-md-6">
                      <div className="card h-100 shadow-sm border-0 feedback-card">
                        <div className="card-body">
                          <div className="d-flex align-items-center mb-3">
                            <div className="avatar me-3">{item.name.charAt(0).toUpperCase()}</div>
                            <div>
                              <h5 className="mb-0">{item.name}</h5>
                            </div>
                          </div>
                          <p className="card-text mb-0">{item.remark}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

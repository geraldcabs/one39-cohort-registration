import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function NamePhoneStep({ formData, setFormData, setMondayItemId, onNext }) {
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function validate() {
    const next = {}
    if (!formData.firstName.trim()) next.firstName = 'First name is required'
    if (!formData.lastName.trim()) next.lastName = 'Last name is required'
    if (!formData.phone.trim()) next.phone = 'Phone number is required'
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length) {
      setErrors(v)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/create-monday-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
        }),
      })
      const data = await res.json()
      if (data.mondayItemId) {
        setMondayItemId(data.mondayItemId)
      }
    } catch (err) {
      console.error('Monday.com item creation failed:', err)
    }
    setSubmitting(false)
    onNext()
  }

  return (
    <section className="form-section form-section--dark">
      <div className="form-container">
        <Link to="/" className="form-back-link">
          &larr; Back to Home
        </Link>
        <div className="form-header">
          <p className="form-step-label">Step 1 of 3</p>
          <h1 className="form-title">Join the Circle</h1>
          <p className="form-subtitle">
            Register for the next CreativeCircle cohort.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="firstName">
                First Name <span className="required">*</span>
              </label>
              <input
                id="firstName"
                className={`form-input${errors.firstName ? ' form-input--error' : ''}`}
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => update('firstName', e.target.value)}
              />
              {errors.firstName && (
                <span className="form-error">{errors.firstName}</span>
              )}
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="lastName">
                Last Name <span className="required">*</span>
              </label>
              <input
                id="lastName"
                className={`form-input${errors.lastName ? ' form-input--error' : ''}`}
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => update('lastName', e.target.value)}
              />
              {errors.lastName && (
                <span className="form-error">{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="phone">
              Phone <span className="required">*</span>
            </label>
            <input
              id="phone"
              className={`form-input${errors.phone ? ' form-input--error' : ''}`}
              type="tel"
              placeholder="(555) 000-0000"
              value={formData.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
            {errors.phone && (
              <span className="form-error">{errors.phone}</span>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Continue'}
          </button>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center', opacity: 0.6 }}>
            By continuing, you consent to receive SMS from One39. Msg &amp; data rates may apply.
          </p>
        </form>
      </div>
    </section>
  )
}

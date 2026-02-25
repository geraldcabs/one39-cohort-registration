import { useState } from 'react'
import CoachCard from './CoachCard'

const COACHES = [
  'Naomi Raine',
  'Todd Galberth',
  'Kenneth Leonard',
  'Tasha Cobbs Leonard',
]

export default function RegistrationForm({ formData, setFormData, onNext }) {
  const [errors, setErrors] = useState({})

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
    if (!formData.email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      next.email = 'Enter a valid email'
    if (!formData.phone.trim()) next.phone = 'Phone number is required'
    if (!formData.coach) next.coach = 'Please select a coach'
    if (!formData.termsAccepted) next.termsAccepted = 'You must accept the terms'
    return next
  }

  function handleSubmit(e) {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length) {
      setErrors(v)
      return
    }
    onNext()
  }

  return (
    <section className="form-section">
      <div className="form-container">
        <div className="form-header">
          <p className="form-step-label">Step 1 of 3</p>
          <h1 className="form-title">Join the Circle</h1>
          <p className="form-subtitle">
            Register for the next Creative Circle cohort.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name row */}
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

          {/* Email */}
          <div className="form-field">
            <label className="form-label" htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              id="email"
              className={`form-input${errors.email ? ' form-input--error' : ''}`}
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => update('email', e.target.value)}
            />
            {errors.email && (
              <span className="form-error">{errors.email}</span>
            )}
          </div>

          {/* Phone */}
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

          {/* Church Name */}
          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="churchName">
                Church Name
              </label>
              <input
                id="churchName"
                className="form-input"
                type="text"
                placeholder="Optional"
                value={formData.churchName}
                onChange={(e) => update('churchName', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="position">
                Position / Role
              </label>
              <input
                id="position"
                className="form-input"
                type="text"
                placeholder="Optional"
                value={formData.position}
                onChange={(e) => update('position', e.target.value)}
              />
            </div>
          </div>

          {/* Coach selection */}
          <fieldset className="form-fieldset">
            <legend className="form-label">
              Select Your Coach <span className="required">*</span>
            </legend>
            <div className="coach-grid">
              {COACHES.map((name) => (
                <CoachCard
                  key={name}
                  name={name}
                  selected={formData.coach === name}
                  onSelect={() => update('coach', name)}
                />
              ))}
            </div>
            {errors.coach && (
              <span className="form-error">{errors.coach}</span>
            )}
          </fieldset>

          {/* Terms */}
          <label className="terms-label">
            <input
              type="checkbox"
              className="terms-checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => update('termsAccepted', e.target.checked)}
            />
            <span className="terms-checkmark" />
            <span className="terms-text">
              I agree to the{' '}
              <a href="#terms" className="terms-link">
                terms &amp; conditions
              </a>{' '}
              and{' '}
              <a href="#privacy" className="terms-link">
                privacy policy
              </a>
              . <span className="required">*</span>
            </span>
          </label>
          {errors.termsAccepted && (
            <span className="form-error" style={{ marginTop: '-0.5rem' }}>
              {errors.termsAccepted}
            </span>
          )}

          <button type="submit" className="btn-primary">
            Continue to Pricing
          </button>
        </form>
      </div>
    </section>
  )
}

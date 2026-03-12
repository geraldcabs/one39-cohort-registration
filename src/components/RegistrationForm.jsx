import { useState } from 'react'
import CoachCard from './CoachCard'
import { useCountdown } from '../hooks/useCountdown'
import { EARLY_BIRD_END } from '../data/pricing'

const COACHES = [
  'Kenneth Leonard',
  'Tasha Cobbs Leonard',
  'Todd Galberth',
  'Naomi Raine',
  'Jane Williams',
  'Mack Brock',
]

export default function RegistrationForm({ formData, setFormData, mondayItemId, onNext, onBack }) {
  const [errors, setErrors] = useState({})
  const [activeModal, setActiveModal] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const countdown = useCountdown(EARLY_BIRD_END)
  const earlyBirdActive = countdown !== null

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
    if (!formData.email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      next.email = 'Enter a valid email'
    if (!formData.coach) next.coach = 'Please select a coach'
    if (!formData.termsAccepted) next.termsAccepted = 'You must accept the terms'
    if (!formData.noRecordingAccepted) next.noRecordingAccepted = 'You must acknowledge the no-recording policy'
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
      await fetch('/api/update-monday-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mondayItemId,
          email: formData.email,
          coach: formData.coach,
          churchName: formData.churchName,
          position: formData.position,
        }),
      })
    } catch (err) {
      console.error('Monday.com item update failed:', err)
    }
    setSubmitting(false)
    onNext()
  }

  return (
    <section className="form-section form-section--dark">
      <div className="form-container">
        <button type="button" className="form-back-link" onClick={onBack}>
          &larr; Back
        </button>
        <div className="form-header">
          <p className="form-step-label">Step 2 of 3</p>
          <h1 className="form-title">Tell Us More</h1>
          <p className="form-subtitle">
            Select your coach and complete your registration.
          </p>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            {earlyBirdActive
              ? '* $299/Month for the first 139 hours'
              : '* $399/Month'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
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
              <button type="button" className="terms-link" onClick={() => setActiveModal('terms')}>
                terms &amp; conditions
              </button>{' '}
              and{' '}
              <button type="button" className="terms-link" onClick={() => setActiveModal('privacy')}>
                privacy policy
              </button>
              . <span className="required">*</span>
            </span>
          </label>
          {errors.termsAccepted && (
            <span className="form-error" style={{ marginTop: '-1rem', display: 'block', marginBottom: '1rem' }}>
              {errors.termsAccepted}
            </span>
          )}

          <label className="terms-label">
            <input
              type="checkbox"
              className="terms-checkbox"
              checked={formData.noRecordingAccepted}
              onChange={(e) => update('noRecordingAccepted', e.target.checked)}
            />
            <span className="terms-checkmark" />
            <span className="terms-text">
              I understand that recording of any kind is strictly prohibited
              during live sessions. <span className="required">*</span>
            </span>
          </label>
          {errors.noRecordingAccepted && (
            <span className="form-error" style={{ marginTop: '-1rem', display: 'block', marginBottom: '1rem' }}>
              {errors.noRecordingAccepted}
            </span>
          )}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Continue to Payment'}
          </button>
        </form>
      </div>

      {activeModal && (
        <div className="bio-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="bio-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="bio-modal-close"
              onClick={() => setActiveModal(null)}
              aria-label="Close"
            >
              &times;
            </button>
            {activeModal === 'terms' && (
              <>
                <h3 className="bio-modal-name">Terms &amp; Conditions</h3>
                <div className="bio-modal-body" style={{ marginTop: '1.5rem' }}>
                  <p>
                    By registering for the CreativeCircle cohort program operated by One39, you agree to the following terms and conditions.
                  </p>
                  <p>
                    <strong>Program Commitment.</strong> CreativeCircle is a 10-month coaching cohort. By enrolling, you commit to attending scheduled live sessions and participating actively. Sessions are conducted live and are not recorded or available for on-demand replay.
                  </p>
                  <p>
                    <strong>No Recording Policy.</strong> Recording of any kind — audio, video, or screen capture — is strictly prohibited during all live sessions. Violation of this policy may result in immediate removal from the program without refund.
                  </p>
                  <p>
                    <strong>Payment &amp; Refunds.</strong> All payments are processed securely through Stripe. Payment plan participants agree to all scheduled charges. Refund requests must be submitted within 14 days of enrollment. After the first live session, no refunds will be issued.
                  </p>
                  <p>
                    <strong>Code of Conduct.</strong> Participants are expected to maintain a respectful, professional environment. One39 reserves the right to remove any participant whose behavior disrupts the learning experience.
                  </p>
                  <p>
                    <strong>Intellectual Property.</strong> All curriculum materials, session content, and resources provided during the program are the intellectual property of One39 and its coaches. Materials may not be reproduced, distributed, or shared without written permission.
                  </p>
                  <p>
                    <strong>Modifications.</strong> One39 reserves the right to modify session schedules, coaches, or program structure as needed. Participants will be notified of any material changes.
                  </p>
                </div>
              </>
            )}
            {activeModal === 'privacy' && (
              <>
                <h3 className="bio-modal-name">Privacy Policy</h3>
                <div className="bio-modal-body" style={{ marginTop: '1.5rem' }}>
                  <p>
                    One39 is committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data when you register for the CreativeCircle cohort program.
                  </p>
                  <p>
                    <strong>Information We Collect.</strong> We collect your name, email address, phone number, church name, and role/position when you register. Payment information is processed securely through Stripe and is never stored on our servers.
                  </p>
                  <p>
                    <strong>How We Use Your Information.</strong> Your information is used to manage your enrollment, communicate program updates, facilitate coach assignments, and process payments. We may also send you relevant updates about future One39 programs.
                  </p>
                  <p>
                    <strong>Data Sharing.</strong> We do not sell or rent your personal information to third parties. Your information may be shared with your assigned coach and program administrators for the purpose of delivering the cohort experience.
                  </p>
                  <p>
                    <strong>Data Security.</strong> We use industry-standard security measures to protect your information, including encrypted connections and secure payment processing through Stripe.
                  </p>
                  <p>
                    <strong>Your Rights.</strong> You may request access to, correction of, or deletion of your personal information at any time by contacting us at kylie@one39.co.
                  </p>
                  <p>
                    <strong>Contact.</strong> For questions about this privacy policy, please contact kylie@one39.co.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

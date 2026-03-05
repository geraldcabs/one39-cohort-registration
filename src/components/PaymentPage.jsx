import { useState, useMemo, useEffect  } from 'react'
import { Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { PLANS, EARLY_BIRD_END } from '../data/pricing'
import { useCountdown } from '../hooks/useCountdown'

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
)

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '15px',
      fontWeight: '500',
      color: '#FFFFFF',
      '::placeholder': { color: '#8A857E' },
    },
    invalid: { color: '#C0392B' },
  },
}

export default function PaymentPage({ formData, mondayItemId, onBack }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        formData={formData}
        mondayItemId={mondayItemId}
        onBack={onBack}
      />
    </Elements>
  )
}

function CheckoutForm({ formData, mondayItemId, onBack }) {
  const stripe = useStripe()
  const elements = useElements()
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [cardComplete, setCardComplete] = useState(false)

  useEffect(() => {
    window.parent.postMessage({ 
      event: 'abandoned',
      email: formData.email,
    }, '*');
  }, []);

  const countdown = useCountdown(EARLY_BIRD_END)
  const earlyBirdActive = countdown !== null

  const selectedPlan = useMemo(() => {
    const id = earlyBirdActive ? 'early-monthly' : 'general-monthly'
    return PLANS.find((p) => p.id === id)
  }, [earlyBirdActive])

 async function handleSubmit(e) {
  e.preventDefault()
  if (!stripe || !elements) return

  setStatus('processing')
  setErrorMsg('')

  try {
    console.log('🚀 Creating customer and setup intent for plan:', selectedPlan.id)
    const res = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: selectedPlan.id,
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        coach: formData.coach,
        churchName: formData.churchName,
        position: formData.position,
      }),
    })

    const data = await res.json()

    if (!data.clientSecret) {
      setErrorMsg(data.error || 'Payment setup failed')
      setStatus('error')
      return
    }

    const { error, setupIntent } = await stripe.confirmCardSetup(
      data.clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
          },
        },
      },
    )

    if (error) {
      console.error('❌ Card setup error:', error.message)
      setErrorMsg(error.message)
      setStatus('error')
      return
    }

    const confirmRes = await fetch('/api/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: data.customerId,
        paymentMethodId: setupIntent.payment_method,
        planId: selectedPlan.id,
        coach: formData.coach,
        churchName: formData.churchName,
        position: formData.position,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        mondayItemId,
      }),
    })

    const confirmData = await confirmRes.json()

    if (confirmData.success) {
       window.parent.postMessage({ 
        event: 'success',
        email: formData.email,
      }, '*');
      setStatus('success')
    } else {
      setErrorMsg(confirmData.error || 'Payment failed')
      setStatus('error')
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err)
    setErrorMsg('Unable to process payment. Please check your connection and try again.')
    setStatus('error')
  }
}

  if (status === 'success') {
    return (
      <section className="form-section form-section--dark">
        <div className="form-container">
          <div className="success-card">
            <div className="success-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" fill="var(--gold)" />
                <path
                  d="M15 25L21 31L33 19"
                  stroke="var(--black)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="form-title" style={{ textAlign: 'center' }}>
              You're In
            </h1>
            <p
              className="form-subtitle"
              style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}
            >
              Welcome to CreativeCircle, {formData.firstName}. Check your
              email for next steps.
            </p>
            <Link to="/" className="btn-primary hero-cta" style={{ marginTop: '2rem', display: 'inline-block', width: 'auto' }}>
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="form-section form-section--dark">
      <div className="form-container">
        <div className="form-header">
          <p className="form-step-label">Step 2 of 2</p>
          <h1 className="form-title">Complete Payment</h1>
          <p className="form-subtitle">
            Secure your spot in the CreativeCircle cohort.
          </p>
        </div>

        <div className="order-summary">
          <h2 className="order-summary-title">Registration Summary</h2>
          <div className="order-row">
            <span className="order-label">Name</span>
            <span className="order-value">
              {formData.firstName} {formData.lastName}
            </span>
          </div>
          <div className="order-row">
            <span className="order-label">Email</span>
            <span className="order-value">{formData.email}</span>
          </div>
          <div className="order-row">
            <span className="order-label">Coach</span>
            <span className="order-value">{formData.coach}</span>
          </div>
          <div className="order-divider" />
          <div className="order-row">
            <span className="order-label" style={{ fontWeight: 700 }}>
              {selectedPlan?.name}
            </span>
            <span className="order-value" style={{ fontWeight: 800 }}>
              {selectedPlan?.display}{selectedPlan?.interval}
            </span>
          </div>
          {earlyBirdActive && (
            <>
              <div className="order-divider" />
              <div className="order-row">
                <span className="order-label" style={{ color: 'var(--gold)', fontWeight: 600 }}>
                  Early Bird Pricing
                </span>
                <span className="order-value" style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>
                  {countdown.d}d {String(countdown.h).padStart(2, '0')}h {String(countdown.m).padStart(2, '0')}m remaining
                </span>
              </div>
            </>
          )}
          <div className="order-divider" />
          <div className="order-row order-row--policy">
            <span className="order-policy-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="var(--red)" strokeWidth="1.5" />
                <line x1="4" y1="4" x2="10" y2="10" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <span className="order-policy-text">No Recording Permitted</span>
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
          * Group pricing is available. Email{' '}
          <a href="mailto:kylie@one39.co" style={{ color: 'var(--gold)' }}>kylie@one39.co</a>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="stripe-card-wrapper">
            <label className="form-label" style={{ marginBottom: '0.75rem' }}>
              Card Details
            </label>
            <div className="stripe-card-element">
              <CardElement
                options={CARD_ELEMENT_OPTIONS}
                onChange={(e) => setCardComplete(e.complete)}
              />
            </div>
          </div>

          <p className="payment-recurring-note">
            Your card will be charged {selectedPlan?.display} monthly for 10 months.
            You can cancel anytime.
          </p>

          {errorMsg && (
            <div className="payment-error">
              <span className="form-error">{errorMsg}</span>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onBack}
              disabled={status === 'processing'}
            >
              Back
            </button>
            <button
              type="submit"
              className="btn-primary btn-primary--payment"
              disabled={!stripe || !cardComplete || status === 'processing'}
            >
              {status === 'processing'
                ? 'Processing...'
                : `Pay ${selectedPlan?.display}${selectedPlan?.interval || ''}`}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

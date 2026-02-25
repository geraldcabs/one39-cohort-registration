import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
)

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: '15px',
      color: '#000000',
      '::placeholder': { color: '#8A857E' },
    },
    invalid: { color: '#C0392B' },
  },
}

export default function PaymentPage({ formData, selectedPlan, onBack }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        formData={formData}
        selectedPlan={selectedPlan}
        onBack={onBack}
      />
    </Elements>
  )
}

function CheckoutForm({ formData, selectedPlan, onBack }) {
  const stripe = useStripe()
  const elements = useElements()
  const [status, setStatus] = useState('idle') // idle | processing | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [cardComplete, setCardComplete] = useState(false)

  const isRecurring = selectedPlan?.interval

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return

    setStatus('processing')
    setErrorMsg('')

    try {
      // 1. Create PaymentIntent (or Subscription) on your backend
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

      const { clientSecret } = await res.json()

      // 2. Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
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
        setErrorMsg(error.message)
        setStatus('error')
      } else if (paymentIntent.status === 'succeeded') {
        setStatus('success')
      }
    } catch {
      setErrorMsg(
        'Unable to process payment. Please check your connection and try again.',
      )
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <section className="form-section">
        <div className="form-container">
          <div className="success-card">
            <div className="success-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="var(--gold)" />
                <path
                  d="M15 25L21 31L33 19"
                  stroke="#fff"
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
              style={{ textAlign: 'center', maxWidth: '360px', margin: '0 auto' }}
            >
              Welcome to the Creative Circle, {formData.firstName}. Check your
              email for next steps.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="form-section">
      <div className="form-container">
        <div className="form-header">
          <p className="form-step-label">Step 3 of 3</p>
          <h1 className="form-title">Complete Payment</h1>
          <p className="form-subtitle">
            Secure your spot in the Creative Circle cohort.
          </p>
        </div>

        {/* Order summary */}
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
            <span className="order-label" style={{ fontWeight: 600 }}>
              {selectedPlan?.name}
            </span>
            <span className="order-value" style={{ fontWeight: 600 }}>
              {selectedPlan?.display}
              {selectedPlan?.interval}
            </span>
          </div>
          {selectedPlan?.total && (
            <div className="order-row">
              <span className="order-label">Total</span>
              <span className="order-value">{selectedPlan.total}</span>
            </div>
          )}
        </div>

        {/* Stripe Card Element */}
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

          {isRecurring && (
            <p className="payment-recurring-note">
              {selectedPlan.id.includes('semi')
                ? `Your card will be charged ${selectedPlan.display} on the 1st and 15th of each month for 10 months.`
                : `Your card will be charged ${selectedPlan.display} monthly for 10 months.`}{' '}
              You can cancel anytime.
            </p>
          )}

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

import { useState, useEffect } from 'react'

// Early bird window: 139 hours starting March 2, 2026 at 12:00 AM ET
const EARLY_BIRD_START = new Date('2026-03-02T00:00:00-05:00')
const EARLY_BIRD_END = new Date(
  EARLY_BIRD_START.getTime() + 139 * 60 * 60 * 1000,
)

const PLANS = [
  {
    id: 'early-semi',
    tier: 'early',
    name: 'Early Bird Semi-Monthly',
    price: 249.5,
    display: '$249.50',
    interval: '/2x mo',
    note: 'Charged 1st & 15th · 10 months',
    total: '$4,990 total',
  },
  {
    id: 'early-monthly',
    tier: 'early',
    name: 'Early Bird Monthly',
    price: 499,
    display: '$499',
    interval: '/mo',
    note: '10 monthly payments',
    total: '$4,990 total',
  },
  {
    id: 'early-once',
    tier: 'early',
    name: 'Early Bird One-Time',
    price: 4500,
    display: '$4,500',
    interval: '',
    note: 'One-time payment',
    badge: 'Best Value',
  },
  {
    id: 'general-semi',
    tier: 'general',
    name: 'General Semi-Monthly',
    price: 299.5,
    display: '$299.50',
    interval: '/2x mo',
    note: 'Charged 1st & 15th · 10 months',
    total: '$5,990 total',
  },
  {
    id: 'general-monthly',
    tier: 'general',
    name: 'General Monthly',
    price: 599,
    display: '$599',
    interval: '/mo',
    note: '10 monthly payments',
    total: '$5,990 total',
  },
  {
    id: 'general-once',
    tier: 'general',
    name: 'General One-Time',
    price: 5500,
    display: '$5,500',
    interval: '',
    note: 'One-time payment',
  },
  {
    id: 'group-monthly',
    tier: 'group',
    name: 'Group Monthly',
    price: 1200,
    display: '$1,200',
    interval: '/mo',
    note: '3–8 people · 10 monthly payments',
    total: '$12,000 total',
  },
  {
    id: 'group-once',
    tier: 'group',
    name: 'Group One-Time',
    price: 10000,
    display: '$10,000',
    interval: '',
    note: '3–8 people · One-time payment',
  },
]

function useCountdown(endDate) {
  const [remaining, setRemaining] = useState(() => calc(endDate))

  function calc(end) {
    const diff = end.getTime() - Date.now()
    if (diff <= 0) return null
    const d = Math.floor(diff / 86400000)
    const h = Math.floor((diff % 86400000) / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return { d, h, m, s, total: diff }
  }

  useEffect(() => {
    const id = setInterval(() => setRemaining(calc(endDate)), 1000)
    return () => clearInterval(id)
  }, [endDate])

  return remaining
}

export default function PricingPage({
  selectedPlan,
  setSelectedPlan,
  onNext,
  onBack,
}) {
  const countdown = useCountdown(EARLY_BIRD_END)
  const earlyBirdActive = countdown !== null
  const [error, setError] = useState('')

  function handleContinue() {
    if (!selectedPlan) {
      setError('Please select a plan')
      return
    }
    onNext()
  }

  function selectPlan(plan) {
    setSelectedPlan(plan)
    setError('')
  }

  const earlyPlans = PLANS.filter((p) => p.tier === 'early')
  const generalPlans = PLANS.filter((p) => p.tier === 'general')
  const groupPlans = PLANS.filter((p) => p.tier === 'group')

  return (
    <section className="form-section">
      <div className="form-container pricing-container">
        <div className="form-header">
          <p className="form-step-label">Step 2 of 3</p>
          <h1 className="form-title">Choose Your Plan</h1>
          <p className="form-subtitle">
            Select the pricing option that works best for you.
          </p>
        </div>

        {/* Countdown timer */}
        {earlyBirdActive && (
          <div className="countdown-banner">
            <div className="countdown-label">
              Early Bird Pricing — 139 Hour Window
            </div>
            <div className="countdown-timer">
              <div className="countdown-unit">
                <span className="countdown-number">{countdown.d}</span>
                <span className="countdown-desc">Days</span>
              </div>
              <span className="countdown-colon">:</span>
              <div className="countdown-unit">
                <span className="countdown-number">
                  {String(countdown.h).padStart(2, '0')}
                </span>
                <span className="countdown-desc">Hrs</span>
              </div>
              <span className="countdown-colon">:</span>
              <div className="countdown-unit">
                <span className="countdown-number">
                  {String(countdown.m).padStart(2, '0')}
                </span>
                <span className="countdown-desc">Min</span>
              </div>
              <span className="countdown-colon">:</span>
              <div className="countdown-unit">
                <span className="countdown-number">
                  {String(countdown.s).padStart(2, '0')}
                </span>
                <span className="countdown-desc">Sec</span>
              </div>
            </div>
            <p className="countdown-ends">
              Ends{' '}
              {EARLY_BIRD_END.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        )}

        {/* Early Bird Plans */}
        {earlyBirdActive && (
          <div className="pricing-tier">
            <h2 className="pricing-tier-title">
              <span className="pricing-tier-dot pricing-tier-dot--gold" />
              Early Bird
            </h2>
            <div className="pricing-row">
              {earlyPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selectedPlan?.id === plan.id}
                  onSelect={() => selectPlan(plan)}
                />
              ))}
            </div>
          </div>
        )}

        {/* General Plans */}
        <div className="pricing-tier">
          <h2 className="pricing-tier-title">
            <span className="pricing-tier-dot" />
            General Admission
          </h2>
          <div className="pricing-row">
            {generalPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                selected={selectedPlan?.id === plan.id}
                onSelect={() => selectPlan(plan)}
              />
            ))}
          </div>
        </div>

        {/* Group Plans */}
        <div className="pricing-tier">
          <h2 className="pricing-tier-title">
            <span className="pricing-tier-dot" />
            Group Registration
          </h2>
          <p className="pricing-tier-sub">For teams of 3–8 people</p>
          <div className="pricing-row">
            {groupPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                selected={selectedPlan?.id === plan.id}
                onSelect={() => selectPlan(plan)}
              />
            ))}
          </div>
        </div>

        {error && <span className="form-error">{error}</span>}

        <div className="form-actions" style={{ marginTop: '1.5rem' }}>
          <button type="button" className="btn-secondary" onClick={onBack}>
            Back
          </button>
          <button
            type="button"
            className="btn-primary btn-primary--payment"
            onClick={handleContinue}
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </section>
  )
}

function PlanCard({ plan, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`plan-card${selected ? ' plan-card--selected' : ''}${plan.tier === 'early' ? ' plan-card--early' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      {plan.badge && <span className="plan-badge">{plan.badge}</span>}
      <span className="plan-name">{plan.name}</span>
      <div className="plan-price-row">
        <span className="plan-price">{plan.display}</span>
        {plan.interval && (
          <span className="plan-interval">{plan.interval}</span>
        )}
      </div>
      <span className="plan-note">{plan.note}</span>
      {plan.total && <span className="plan-total">{plan.total}</span>}
      <div className="plan-check">
        {selected && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="var(--gold)" />
            <path
              d="M6 10.5L8.5 13L14 7.5"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </button>
  )
}

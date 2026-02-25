import { useState } from 'react'
import { useCountdown } from '../hooks/useCountdown'
import { PLANS, EARLY_BIRD_END } from '../data/pricing'

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
    <section className="form-section form-section--light">
      <div className="form-container pricing-container">
        <div className="form-header">
          <p className="form-step-label">Step 2 of 3</p>
          <h1 className="form-title" style={{ color: 'var(--black)' }}>Choose Your Plan</h1>
          <p className="form-subtitle">
            Select the pricing option that works best for you.
          </p>
        </div>

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

        <div className="pricing-tier">
          <h2 className="pricing-tier-title">
            <span className="pricing-tier-dot" />
            Group Registration
          </h2>
          <p className="pricing-tier-sub">For teams of 3-8 people</p>
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
          <p className="pricing-group-contact">
            For groups larger than 8, email{' '}
            <a href="mailto:kylie@one39.co" className="pricing-group-link">
              kylie@one39.co
            </a>
          </p>
        </div>

        <div className="pricing-live-callout">
          <span className="pricing-live-dot" />
          All Sessions Are Live — Not Pre-Recorded, Not a Webinar
        </div>

        {error && <span className="form-error">{error}</span>}

        <div className="form-actions" style={{ marginTop: '2rem' }}>
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
            <rect width="20" height="20" fill="var(--gold)" />
            <path
              d="M6 10.5L8.5 13L14 7.5"
              stroke="var(--black)"
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

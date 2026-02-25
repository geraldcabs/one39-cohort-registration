import { useCountdown } from '../../hooks/useCountdown'
import { EARLY_BIRD_END } from '../../data/pricing'

export default function CountdownBanner() {
  const countdown = useCountdown(EARLY_BIRD_END)

  if (!countdown) return null

  return (
    <div className="countdown-banner">
      <span className="countdown-banner-label">Early bird closes in</span>
      <span className="countdown-banner-time">
        {countdown.d}d {String(countdown.h).padStart(2, '0')}h{' '}
        {String(countdown.m).padStart(2, '0')}m{' '}
        {String(countdown.s).padStart(2, '0')}s
      </span>
    </div>
  )
}

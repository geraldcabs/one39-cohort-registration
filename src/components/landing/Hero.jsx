import { Link } from 'react-router-dom'
import StatsBar from './StatsBar'

export default function Hero() {
  return (
    <section className="hero">
      <img
        src="/Images/BTS/TCHX139-BTS-(64of80)-hero.jpg"
        alt=""
        className="hero-bg-img"
      />
      <div className="hero-overlay" />
      <div className="hero-grain" />
      <div className="hero-inner">
        <img
          src="/logo 4.png"
          alt="CreativeCircle"
          className="hero-logo"
        />
        <p className="hero-tagline">The Weight of the Room.</p>

        <p className="hero-sub">
          A 10-month coaching cohort for creatives who can feel the weight of
          the room and refuse to wing it another week.
        </p>

        <Link to="/register" className="btn-primary hero-cta">
          Register Now
        </Link>
      </div>
      <StatsBar />
    </section>
  )
}

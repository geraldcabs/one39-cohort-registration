import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-grain" />
      <div className="hero-inner">
        <h1 className="hero-headline">Creative Circle</h1>
        <p className="hero-tagline">The Weight of the Room.</p>

        <p className="hero-sub">
          A 10-month coaching cohort for worship leaders who are done guessing
          and ready to build systems that move rooms.
        </p>

        <Link to="/register" className="btn-primary hero-cta">
          Register Now
        </Link>
      </div>
    </section>
  )
}

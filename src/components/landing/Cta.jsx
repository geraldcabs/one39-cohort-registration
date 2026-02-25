import { Link } from 'react-router-dom'

export default function Cta() {
  return (
    <section className="cta">
      <div className="cta-bg" />
      <div className="cta-inner">
        <p className="section-label">Ready?</p>
        <h2 className="cta-headline">Your Room<br />Is Waiting</h2>
        <p className="cta-sub">
          Stop guessing. Start building. Join the next CreativeCircle cohort
          and change the way your church experiences Sunday.
        </p>
        <Link to="/register" className="btn-primary cta-btn">
          Register Now
        </Link>
      </div>
    </section>
  )
}

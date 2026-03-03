import Hero from './Hero'
import CountdownBanner from './CountdownBanner'
import StickyNav from './StickyNav'
import Vision from './Vision'
import Faculty from './Faculty'
import Curriculum from './Curriculum'
import Faq from './Faq'
import Cta from './Cta'

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="header">
        <div className="header-inner">
          <a href="https://one39.co" className="header-logo-link">
            <img
              src="/logo 5.png"
              alt="One39"
              className="header-logo"
            />
          </a>
          <nav className="header-nav">
            <a href="https://one39.co/who-we-are/" className="header-link">Who We Are</a>
            <a href="https://one39.co/coaching/" className="header-link">Coaching</a>
            <a href="https://one39.co/hire-talent/" className="header-link">Staffing</a>
            <a href="https://one39.co/find-a-job/" className="header-link">Find a Job</a>
          </nav>
          <a href="https://one39.co/#schedule" className="header-cta">
            Schedule a Call
          </a>
        </div>
      </header>

      <StickyNav />

      <main>
        <Hero />
        <CountdownBanner />
        <Vision />
        <Faculty />
        <Curriculum />
        <Faq />
        <Cta />
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} One39. All rights reserved.</p>
      </footer>
    </div>
  )
}

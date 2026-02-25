import Hero from './Hero'
import StatsBar from './StatsBar'
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
          <img
            src="/logo 2.png"
            alt="One39 CreativeCircle"
            className="header-logo"
          />
        </div>
      </header>

      <StickyNav />

      <main>
        <Hero />
        <StatsBar />
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

      <div className="mockup-badge">&#9888; Client Mockup</div>
    </div>
  )
}

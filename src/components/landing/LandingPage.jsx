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

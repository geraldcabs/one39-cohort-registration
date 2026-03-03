import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function StickyNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`sticky-nav sticky-nav--visible${scrolled ? ' sticky-nav--scrolled' : ''}`}>
      <div className="sticky-nav-inner">
        <img
          src="/logo 3.png"
          alt="One39 CreativeCircle"
          className="sticky-nav-logo"
        />
        <div className="sticky-nav-links">
          <a href="#vision" className="sticky-nav-link">Vision</a>
          <a href="#faculty" className="sticky-nav-link">Coaches</a>
          <a href="#curriculum" className="sticky-nav-link">Frameworks</a>
          <a href="#faq" className="sticky-nav-link">FAQ</a>
        </div>
        <Link to="/register" className="sticky-nav-cta">
          Register Now
        </Link>
      </div>
    </nav>
  )
}

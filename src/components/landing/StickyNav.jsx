import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function StickyNav() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      const hero = document.querySelector('.hero')
      if (!hero) return
      setVisible(window.scrollY > hero.offsetHeight - 60)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`sticky-nav${visible ? ' sticky-nav--visible' : ''}`}>
      <div className="sticky-nav-inner">
        <img
          src="/logo 2.png"
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

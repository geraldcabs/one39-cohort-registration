import { FRAMEWORKS } from '../../data/curriculum'

export default function Curriculum() {
  return (
    <section className="curriculum" id="curriculum">
      <div className="curriculum-bg" />
      <div className="curriculum-inner">
        <p className="section-label">The Frameworks</p>
        <h2 className="section-headline">
          Zero Guesswork.
        </h2>
        <p className="curriculum-intro">
          Each framework is taught, coached, and implemented over the 10-month
          cohort. These aren't theories — they're operating systems for your
          Sunday.
        </p>

        <div className="framework-grid">
          {FRAMEWORKS.map((fw, i) => (
            <div key={i} className="framework-card">
              <span className="framework-number">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="framework-title">{fw.title}</h3>
              <ul className="framework-bullets">
                {fw.bullets.map((b, j) => (
                  <li key={j} className="framework-bullet">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import {
  VISION_LABEL,
  VISION_HEADLINE,
  VISION_PARAGRAPHS,
} from '../../data/vision'

export default function Vision() {
  return (
    <section className="vision" id="vision">
      <div className="vision-bg" />
      <div className="vision-inner">
        <p className="section-label">{VISION_LABEL}</p>
        <h2 className="section-headline">{VISION_HEADLINE}</h2>
        <div className="vision-body">
          {VISION_PARAGRAPHS.map((p, i) => (
            <p key={i} className="vision-paragraph">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

import { techColor, techLabel } from '../data/tech'

export default function TechTag({ id, size = 'md', interactive = false, active = false, onClick }) {
  const color = techColor(id)
  const Element = interactive ? 'button' : 'span'
  return (
    <Element
      type={interactive ? 'button' : undefined}
      onClick={interactive ? onClick : undefined}
      className={`tech-tag tech-tag--${size} ${active ? 'is-active' : ''} ${interactive ? 'is-interactive' : ''}`.trim()}
      style={{ '--tech-color': color }}
    >
      <span className="tech-tag__dot" />
      {techLabel(id)}
    </Element>
  )
}
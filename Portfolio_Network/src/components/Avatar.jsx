import { buildIdenticon } from '../lib/avatar'
import { initialsOf } from '../lib/format'

export default function Avatar({ user, size = 40, radius = 10, showInitials = false, className = '' }) {
  if (!user) return null
  const { palette, cells } = buildIdenticon(user.id)
  const cellSize = 100 / 5

  return (
    <span
      className={`avatar ${className}`.trim()}
      style={{
        '--avatar-size': `${size}px`,
        '--avatar-radius': `${radius}px`,
      }}
      title={user.name}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`${user.name} avatar`}>
        <rect width="100" height="100" fill={palette.bg} />
        {cells.map((cell) => (
          <rect
            key={`${cell.x}-${cell.y}`}
            x={cell.x * cellSize}
            y={cell.y * cellSize}
            width={cellSize}
            height={cellSize}
            fill={palette.fg}
          />
        ))}
      </svg>
      {showInitials ? <span className="avatar__initials">{initialsOf(user.name)}</span> : null}
    </span>
  )
}
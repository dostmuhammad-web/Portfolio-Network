import Avatar from './Avatar'
import FollowButton from './FollowButton'
import { navigate, profilePath } from '../router'
import { formatCompact } from '../lib/format'
import { techLabel } from '../data/tech'

export default function UserCard({ user, compact = false }) {
  const open = (event) => {
    event.preventDefault()
    navigate(profilePath(user.username))
  }

  return (
    <article className={`user-card ${compact ? 'user-card--compact' : ''}`.trim()}>
      <a className="user-card__main" href={`#${profilePath(user.username)}`} onClick={open}>
        <Avatar user={user} size={compact ? 36 : 48} radius={12} />
        <span className="user-card__text">
          <span className="user-card__name">{user.name}</span>
          <span className="user-card__username">@{user.username}</span>
          {!compact ? <span className="user-card__headline">{user.headline}</span> : null}
        </span>
      </a>
      {!compact ? (
        <div className="user-card__tags">
          {user.skills.slice(0, 3).map((skill) => (
            <span key={skill.id} className="user-card__skill">
              {techLabel(skill.id)}
            </span>
          ))}
        </div>
      ) : null}
      <div className="user-card__footer">
        <span className="user-card__stat">
          <strong>{formatCompact(user.stats.followers)}</strong> followers
        </span>
        <FollowButton userId={user.id} size="sm" />
      </div>
    </article>
  )
}
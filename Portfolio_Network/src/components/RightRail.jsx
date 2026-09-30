import { useMemo } from 'react'
import Icon from './Icon'
import UserCard from './UserCard'
import { navigate } from '../router'
import { useAppState } from '../store/appContext'
import { suggestedUsers, trendingTechs } from '../lib/selectors'
import { techLabel, TECH_FILTERS } from '../data/tech'
import { formatCompact } from '../lib/format'

export default function RightRail() {
  const { projects, users, currentUser, followedIds, savedProjectIds } = useAppState()

  const trending = useMemo(() => trendingTechs(projects, 6), [projects])
  const suggestions = useMemo(
    () => suggestedUsers(currentUser.id, followedIds),
    [currentUser.id, followedIds],
  )
  const totalLikes = useMemo(() => projects.reduce((sum, project) => sum + project.likesCount, 0), [projects])

  const maxCount = trending[0]?.count ?? 1

  return (
    <aside className="right-rail">
      <section className="rail-card">
        <h2 className="rail-card__title">
          <Icon name="users" size={16} /> Suggested developers
        </h2>
        <div className="rail-card__list">
          {suggestions.map((user) => (
            <UserCard key={user.id} user={user} compact />
          ))}
        </div>
        <button type="button" className="rail-card__more" onClick={() => navigate('/discover')}>
          Browse all developers
        </button>
      </section>

      <section className="rail-card">
        <h2 className="rail-card__title">
          <Icon name="trending" size={16} /> Trending technologies
        </h2>
        <ul className="rail-card__tags">
          {trending.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => navigate(`/discover?tech=${item.id}`)}
                style={{ '--tag-width': `${Math.max(12, (item.count / maxCount) * 100)}%` }}
              >
                <span className="rail-card__tag-fill" />
                <span className="rail-card__tag-name">{techLabel(item.id)}</span>
                <span className="rail-card__tag-count">{item.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rail-card rail-card--pulse">
        <h2 className="rail-card__title">
          <Icon name="bolt" size={16} /> Network pulse
        </h2>
        <dl className="pulse">
          <div>
            <dt>Projects</dt>
            <dd>{formatCompact(projects.length)}</dd>
          </div>
          <div>
            <dt>Developers</dt>
            <dd>{formatCompact(users.length)}</dd>
          </div>
          <div>
            <dt>Likes</dt>
            <dd>{formatCompact(totalLikes)}</dd>
          </div>
          <div>
            <dt>Your saved</dt>
            <dd>{savedProjectIds.length}</dd>
          </div>
        </dl>
        <div className="rail-card__filters">
          <span>Filters</span>
          <div className="rail-card__filter-chips">
            {TECH_FILTERS.slice(0, 6).map((tech) => (
              <button key={tech.id} type="button" onClick={() => navigate(`/discover?tech=${tech.id}`)}>
                {tech.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </aside>
  )
}
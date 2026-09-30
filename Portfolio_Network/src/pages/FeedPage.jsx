import { useMemo, useState } from 'react'
import Icon from '../components/Icon'
import { FeedProjectCard } from '../components/ProjectCard'
import TechTag from '../components/TechTag'
import { useAppState } from '../store/appContext'
import { navigate, projectPath } from '../router'
import { TECH_FILTERS } from '../data/tech'
import { sortProjects } from '../lib/selectors'

const TABS = [
  { id: 'for-you', label: 'For you' },
  { id: 'following', label: 'Following' },
  { id: 'trending', label: 'Trending' },
]

export default function FeedPage() {
  const { projects, followedIds, currentUser } = useAppState()
  const [tab, setTab] = useState('for-you')
  const [tech, setTech] = useState(null)

  const visible = useMemo(() => {
    const base =
      tab === 'following'
        ? projects.filter(
            (project) =>
              followedIds.includes(project.authorId) || project.authorId === currentUser.id,
          )
        : projects
    const filtered = tech ? base.filter((project) => project.technologies.includes(tech)) : base
    return sortProjects(filtered, tab === 'trending' ? 'trending' : tab === 'for-you' ? 'newest' : 'trending')
  }, [projects, tab, tech, followedIds, currentUser.id])

  const openComments = (project) => {
    navigate(`${projectPath(project.id)}?focus=comments`)
  }

  return (
    <div className="page page--feed">
      <header className="page__header">
        <div>
          <h1 className="page__title">Developer feed</h1>
          <p className="page__subtitle">
            Projects shipped by the community. Like, save and discuss what you build.
          </p>
        </div>
      </header>

      <div className="feed-toolbar">
        <div className="tabs" role="tablist">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`tab ${tab === item.id ? 'is-active' : ''}`.trim()}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="chip-row">
          <button
            type="button"
            className={`chip ${tech === null ? 'is-active' : ''}`.trim()}
            onClick={() => setTech(null)}
          >
            All
          </button>
          {TECH_FILTERS.map((item) => (
            <TechTag
              key={item.id}
              id={item.id}
              size="sm"
              interactive
              active={tech === item.id}
              onClick={() => setTech(tech === item.id ? null : item.id)}
            />
          ))}
        </div>
      </div>

      {tab === 'following' && followedIds.length === 0 ? (
        <div className="banner">
          <Icon name="users" size={18} />
          <div>
            <strong>You are not following anyone yet.</strong>
            <p>Follow developers from Discover and their new projects will show up here.</p>
          </div>
          <button type="button" className="btn btn--primary btn--sm" onClick={() => navigate('/discover')}>
            Find developers
          </button>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className="empty-state">
          <Icon name="layers" size={22} />
          <h3>Nothing here yet</h3>
          <p>Try another filter or tab.</p>
        </div>
      ) : (
        <div className="feed">
          {visible.map((project) => (
            <FeedProjectCard key={project.id} project={project} onComment={() => openComments(project)} />
          ))}
        </div>
      )}
    </div>
  )
}
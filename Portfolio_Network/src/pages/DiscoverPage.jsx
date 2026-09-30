import { useMemo, useState } from 'react'
import Icon from '../components/Icon'
import { GridProjectCard } from '../components/ProjectCard'
import TechTag from '../components/TechTag'
import UserCard from '../components/UserCard'
import { useAppState } from '../store/appContext'
import { navigate, projectPath } from '../router'
import { TECH_FILTERS } from '../data/tech'
import { SORTS, matchesQuery, sortProjects } from '../lib/selectors'

export default function DiscoverPage({ query, setQuery }) {
  const { projects, users } = useAppState()
  const requestedTech = query.get('tech')
  const tech = requestedTech && TECH_FILTERS.some((item) => item.id === requestedTech) ? requestedTech : null
  const sort = query.get('sort') ?? 'trending'
  const search = query.get('q') ?? ''
  const [view, setView] = useState('projects')

  const results = useMemo(() => {
    const filtered = projects.filter((project) => {
      if (tech && !project.technologies.includes(tech)) return false
      return matchesQuery(project, project.author, search)
    })
    return sortProjects(filtered, sort)
  }, [projects, tech, search, sort])

  const people = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return users.filter((user) => {
      if (!needle) return true
      return (
        user.name.toLowerCase().includes(needle) ||
        user.username.toLowerCase().includes(needle) ||
        user.headline.toLowerCase().includes(needle) ||
        user.skills.some((skill) => skill.id.includes(needle) || skill.level.toLowerCase().includes(needle))
      )
    })
  }, [users, search])

  const applyParams = (nextTech, nextSearch, nextSort, options) => {
    const params = new URLSearchParams()
    if (nextTech) params.set('tech', nextTech)
    if (nextSearch) params.set('q', nextSearch)
    if (nextSort && nextSort !== 'trending') params.set('sort', nextSort)
    const searchString = params.toString()
    navigate(`/discover${searchString ? `?${searchString}` : ''}`, options)
  }

  const handleSearch = (value) => {
    setQuery(value, { replace: true })
    applyParams(tech, value, sort, { replace: true })
  }

  const handleTech = (value) => {
    applyParams(value === tech ? null : value, search, sort)
  }

  const handleSort = (value) => {
    applyParams(tech, search, value)
  }

  return (
    <div className="page page--discover">
      <header className="page__header">
        <div>
          <h1 className="page__title">Discover</h1>
          <p className="page__subtitle">
            Filter the network by stack. Every result is a real project with source and a live demo.
          </p>
        </div>
      </header>

      <div className="discover-controls">
        <label className="field field--search">
          <Icon name="compass" size={16} />
          <input
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Filter by name, stack or keyword"
            aria-label="Filter projects"
          />
        </label>
        <label className="field field--select">
          <span>Sort</span>
          <select value={sort} onChange={(event) => handleSort(event.target.value)} aria-label="Sort projects">
            {SORTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="chip-row chip-row--filters">
        <button
          type="button"
          className={`chip ${tech === null ? 'is-active' : ''}`.trim()}
          onClick={() => handleTech(null)}
        >
          All stacks
        </button>
        {TECH_FILTERS.map((item) => (
          <TechTag
            key={item.id}
            id={item.id}
            interactive
            active={tech === item.id}
            onClick={() => handleTech(item.id)}
          />
        ))}
      </div>

      <div className="segmented">
        <button
          type="button"
          className={view === 'projects' ? 'is-active' : ''}
          onClick={() => setView('projects')}
        >
          Projects ({results.length})
        </button>
        <button type="button" className={view === 'people' ? 'is-active' : ''} onClick={() => setView('people')}>
          Developers ({people.length})
        </button>
      </div>

      {view === 'projects' ? (
        results.length === 0 ? (
          <div className="empty-state">
            <Icon name="filter" size={22} />
            <h3>No projects match these filters</h3>
            <p>Clear a filter or try a broader keyword.</p>
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => applyParams(null, '', sort)}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid">
            {results.map((project) => (
              <GridProjectCard
                key={project.id}
                project={project}
                onComment={() => navigate(`${projectPath(project.id)}?focus=comments`)}
              />
            ))}
          </div>
        )
      ) : (
        <div className="user-grid">
          {people.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  )
}
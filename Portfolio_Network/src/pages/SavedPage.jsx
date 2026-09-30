import Icon from '../components/Icon'
import { GridProjectCard } from '../components/ProjectCard'
import { useAppState } from '../store/appContext'
import { navigate, projectPath } from '../router'

export default function SavedPage() {
  const { savedProjectIds, getProject } = useAppState()
  const projects = savedProjectIds.map((id) => getProject(id)).filter(Boolean)

  return (
    <div className="page page--saved">
      <header className="page__header">
        <div>
          <h1 className="page__title">Saved projects</h1>
          <p className="page__subtitle">
            Your private collection. Saved items stay in this browser.
          </p>
        </div>
        <span className="pill pill--lg">
          <Icon name="bookmark" size={15} /> {projects.length} saved
        </span>
      </header>

      {projects.length === 0 ? (
        <div className="empty-state">
          <Icon name="bookmark" size={22} />
          <h3>Nothing saved yet</h3>
          <p>Tap the bookmark icon on any project card to keep it here.</p>
          <button type="button" className="btn btn--sm" onClick={() => navigate('/discover')}>
            Discover projects
          </button>
        </div>
      ) : (
        <div className="grid">
          {projects.map((project) => (
            <GridProjectCard
              key={project.id}
              project={project}
              onComment={() => navigate(`${projectPath(project.id)}?focus=comments`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
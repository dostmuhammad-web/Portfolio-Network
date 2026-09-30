import Icon from './Icon'
import Avatar from './Avatar'
import ProjectArt from './ProjectArt'
import TechTag from './TechTag'
import ActionBar from './ActionBar'
import FollowButton from './FollowButton'
import { navigate, projectPath, profilePath } from '../router'
import { formatCompact, formatRelativeTime } from '../lib/format'

function goTo(event, to) {
  event.preventDefault()
  navigate(to)
}

function ProjectCardHeader({ project }) {
  return (
    <header className="project-card__header">
      <a
        className="project-card__author"
        href={`#${profilePath(project.author.username)}`}
        onClick={(event) => goTo(event, profilePath(project.author.username))}
      >
        <Avatar user={project.author} size={38} radius={10} />
        <span className="project-card__author-text">
          <span className="project-card__author-name">{project.author.name}</span>
          <span className="project-card__author-meta">
            @{project.author.username} · {formatRelativeTime(project.createdAt)}
          </span>
        </span>
      </a>
      <FollowButton userId={project.author.id} size="sm" />
    </header>
  )
}

export function FeedProjectCard({ project, onComment }) {
  return (
    <article className="project-card project-card--feed">
      <ProjectCardHeader project={project} />
      <a
        className="project-card__art-link"
        href={`#${projectPath(project.id)}`}
        onClick={(event) => goTo(event, projectPath(project.id))}
        aria-label={`Open ${project.title}`}
      >
        <ProjectArt projectId={project.id} kind="cover" label={`${project.title} cover`} />
      </a>
      <div className="project-card__body">
        <a
          className="project-card__title"
          href={`#${projectPath(project.id)}`}
          onClick={(event) => goTo(event, projectPath(project.id))}
        >
          {project.title}
        </a>
        <p className="project-card__tagline">{project.tagline}</p>
        <div className="project-card__tags">
          {project.technologies.slice(0, 5).map((tech) => (
            <TechTag key={tech} id={tech} size="sm" />
          ))}
        </div>
        <div className="project-card__stats">
          <span>
            <Icon name="star" size={15} /> {formatCompact(project.stars)}
          </span>
          <span>
            <Icon name="fork" size={15} /> {formatCompact(project.forks)}
          </span>
          <span>
            <Icon name="code" size={15} /> {project.license}
          </span>
          {project.github ? (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer noopener"
              className="project-card__repo"
              onClick={(event) => event.stopPropagation()}
            >
              <Icon name="github" size={15} /> Repository
            </a>
          ) : null}
        </div>
        <ActionBar project={project} variant="feed" onComment={onComment} />
      </div>
    </article>
  )
}

export function GridProjectCard({ project, onComment }) {
  return (
    <article className="project-card project-card--grid">
      <a
        className="project-card__art-link"
        href={`#${projectPath(project.id)}`}
        onClick={(event) => goTo(event, projectPath(project.id))}
        aria-label={`Open ${project.title}`}
      >
        <ProjectArt projectId={project.id} kind="cover" label={`${project.title} cover`} />
      </a>
      <div className="project-card__body">
        <a
          className="project-card__title"
          href={`#${projectPath(project.id)}`}
          onClick={(event) => goTo(event, projectPath(project.id))}
        >
          {project.title}
        </a>
        <a
          className="project-card__grid-author"
          href={`#${profilePath(project.author.username)}`}
          onClick={(event) => goTo(event, profilePath(project.author.username))}
        >
          <Avatar user={project.author} size={22} radius={6} />
          <span>{project.author.name}</span>
        </a>
        <div className="project-card__tags">
          {project.technologies.slice(0, 4).map((tech) => (
            <TechTag key={tech} id={tech} size="sm" />
          ))}
        </div>
        <ActionBar project={project} variant="grid" onComment={onComment} />
      </div>
    </article>
  )
}

export default FeedProjectCard
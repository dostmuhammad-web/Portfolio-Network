import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/Icon'
import Avatar from '../components/Avatar'
import ProjectArt from '../components/ProjectArt'
import TechTag from '../components/TechTag'
import ActionBar from '../components/ActionBar'
import FollowButton from '../components/FollowButton'
import CommentSection from '../components/CommentSection'
import { useAppState } from '../store/appContext'
import { navigate, profilePath } from '../router'
import { downloadArtwork } from '../lib/share'
import { toast } from '../lib/toast'
import { formatCompact, formatRelativeTime, formatDate } from '../lib/format'

export default function ProjectPage({ projectId, query }) {
  const { getProject, actions } = useAppState()
  const project = getProject(projectId)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    if (project) actions.registerView(project.id)
  }, [project, actions])

  useEffect(() => {
    if (lightbox === null) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setLightbox(null)
      if (event.key === 'ArrowRight') setLightbox((index) => (index + 1) % project.screenshots)
      if (event.key === 'ArrowLeft')
        setLightbox((index) => (index - 1 + project.screenshots) % project.screenshots)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [lightbox, project])

  const shotIndexes = useMemo(
    () => Array.from({ length: project?.screenshots ?? 0 }, (_, index) => index),
    [project],
  )

  if (!project) {
    return (
      <div className="page">
        <div className="empty-state">
          <Icon name="layers" size={22} />
          <h3>Project not found</h3>
          <p>This project does not exist or has been removed.</p>
          <button type="button" className="btn btn--sm" onClick={() => navigate('/discover')}>
            Back to Discover
          </button>
        </div>
      </div>
    )
  }

  const author = project.author
  const paragraphs = project.description.split('\n\n')

  return (
    <div className="page page--project">
      <button type="button" className="btn btn--ghost btn--back" onClick={() => window.history.back()}>
        <Icon name="arrowLeft" size={15} /> Back
      </button>

      <article className="project-detail">
        <div className="project-detail__art">
          <ProjectArt projectId={project.id} kind="cover" label={`${project.title} cover`} />
        </div>

        <header className="project-detail__head">
          <div className="project-detail__headline">
            <h1 className="project-detail__title">{project.title}</h1>
            <p className="project-detail__tagline">{project.tagline}</p>
          </div>
          <div className="project-detail__head-meta">
            <span className="pill">
              <Icon name="eye" size={14} /> {formatCompact(project.viewsCount)} views
            </span>
            <span className="pill">
              <Icon name="calendar" size={14} /> {formatDate(project.createdAt)}
            </span>
          </div>
        </header>

        <div className="project-detail__author">
          <a
            href={`#${profilePath(author.username)}`}
            onClick={(event) => {
              event.preventDefault()
              navigate(profilePath(author.username))
            }}
            className="project-detail__author-link"
          >
            <Avatar user={author} size={44} radius={12} />
            <span>
              <strong>{author.name}</strong>
              <small>@{author.username} · {author.headline}</small>
            </span>
          </a>
          <div className="project-detail__author-actions">
            <FollowButton userId={author.id} />
            {project.github ? (
              <a className="btn btn--sm" href={project.github} target="_blank" rel="noreferrer noopener">
                <Icon name="github" size={15} /> Source
              </a>
            ) : null}
            {project.liveDemo ? (
              <a className="btn btn--sm btn--primary" href={project.liveDemo} target="_blank" rel="noreferrer noopener">
                <Icon name="external" size={15} /> Live demo
              </a>
            ) : null}
          </div>
        </div>

        <div className="project-detail__actionrow">
          <ActionBar project={project} variant="detail" onComment={() => {
            document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })
          }} />
        </div>

        <div className="project-detail__stats">
          <Stat icon="star" label="GitHub stars" value={formatCompact(project.stars)} />
          <Stat icon="fork" label="Forks" value={formatCompact(project.forks)} />
          <Stat icon="heart" label="Likes" value={formatCompact(project.likesCount)} />
          <Stat icon="eye" label="Views" value={formatCompact(project.viewsCount)} />
          <Stat icon="code" label="License" value={project.license} />
        </div>

        <section className="project-detail__section">
          <h2>About this project</h2>
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </section>

        <section className="project-detail__section">
          <h2>Built with</h2>
          <div className="project-detail__tags">
            {project.technologies.map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => navigate(`/discover?tech=${tech}`)}
                title="Filter the network by this technology"
              >
                <TechTag id={tech} size="md" />
              </button>
            ))}
          </div>
        </section>

        <section className="project-detail__section">
          <div className="project-detail__section-head">
            <h2>Screenshots</h2>
            <span className="muted">
              {shotIndexes.length} bound to project <code>{project.id}</code>
            </span>
          </div>
          <div className="gallery">
            {shotIndexes.map((index) => (
              <button
                key={index}
                type="button"
                className="gallery__item"
                onClick={() => setLightbox(index)}
                aria-label={`Open screenshot ${index + 1}`}
              >
                <ProjectArt
                  projectId={project.id}
                  kind="shot"
                  label={`Screenshot ${index + 1} of ${shotIndexes.length}`}
                />
              </button>
            ))}
          </div>
        </section>

        <CommentSection projectId={project.id} autoFocus={query.get('focus') === 'comments'} />

        <footer className="project-detail__foot">
          <span>Published {formatRelativeTime(project.createdAt)}</span>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              downloadArtwork(project.id, 'cover', `${project.id}-cover.svg`)
              toast('Cover artwork downloaded')
            }}
          >
            <Icon name="download" size={15} /> Download cover
          </button>
        </footer>
      </article>

      {lightbox !== null ? (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <div className="lightbox__inner" onClick={(event) => event.stopPropagation()}>
            <header className="lightbox__head">
              <span>
                {project.title} · screenshot {lightbox + 1}/{shotIndexes.length}
              </span>
              <div className="lightbox__tools">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => {
                    downloadArtwork(project.id, 'shot', `${project.id}-shot-${lightbox + 1}.svg`)
                    toast('Screenshot downloaded')
                  }}
                  title="Download"
                >
                  <Icon name="download" size={16} />
                </button>
                <button type="button" className="icon-btn" onClick={() => setLightbox(null)} title="Close">
                  <Icon name="close" size={16} />
                </button>
              </div>
            </header>
            <ProjectArt projectId={project.id} kind="shot" className="lightbox__art" />
            <div className="lightbox__nav">
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => setLightbox((index) => (index - 1 + shotIndexes.length) % shotIndexes.length)}
              >
                <Icon name="chevronRight" size={14} className="flip" /> Previous
              </button>
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => setLightbox((index) => (index + 1) % shotIndexes.length)}
              >
                Next <Icon name="chevronRight" size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Stat({ icon, label, value }) {
  return (
    <div className="stat">
      <Icon name={icon} size={16} />
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  )
}
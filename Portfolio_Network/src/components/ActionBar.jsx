import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { navigate } from '../router'
import { useAppState } from '../store/appContext'
import { toast } from '../lib/toast'
import { copyText, projectUrl, shareLink } from '../lib/share'
import { formatCompact } from '../lib/format'

export default function ActionBar({ project, variant = 'full', onComment }) {
  const { actions } = useAppState()
  const [menuOpen, setMenuOpen] = useState(false)
  const [burst, setBurst] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  const handleLike = () => {
    actions.toggleLike(project.id)
    if (!project.likedByMe) {
      setBurst(true)
      window.setTimeout(() => setBurst(false), 420)
    }
  }

  const handleSave = () => {
    actions.toggleSave(project.id)
    toast(project.savedByMe ? 'Removed from saved projects' : 'Saved to your collection')
  }

  const handleShare = async () => {
    const url = projectUrl(project.id)
    const result = await shareLink({
      title: `${project.title} by @${project.author.username}`,
      text: project.tagline,
      url,
    })
    if (result === 'copied') toast('Link copied to clipboard')
    if (result === 'failed') toast('Could not copy the link', 'error')
    setMenuOpen(false)
  }

  const handleCopy = async () => {
    const ok = await copyText(projectUrl(project.id))
    toast(ok ? 'Link copied to clipboard' : 'Could not copy the link', ok ? 'default' : 'error')
    setMenuOpen(false)
  }

  const commentCount = useCommentCount(project.id)

  return (
    <div className={`action-bar action-bar--${variant}`}>
      <button
        type="button"
        className={`action-btn ${project.likedByMe ? 'is-active is-liked' : ''} ${burst ? 'is-bursting' : ''}`.trim()}
        onClick={handleLike}
        aria-pressed={project.likedByMe}
        title={project.likedByMe ? 'Unlike' : 'Like'}
      >
        <Icon name="heart" size={17} filled={project.likedByMe} />
        <span className="action-btn__count">{formatCompact(project.likesCount)}</span>
      </button>

      <button type="button" className="action-btn" onClick={onComment} title="Comment">
        <Icon name="comment" size={17} />
        <span className="action-btn__count">{commentCount}</span>
      </button>

      <span className="action-bar__views" title={`${project.viewsCount} views`}>
        <Icon name="eye" size={16} />
        <span className="action-btn__count">{formatCompact(project.viewsCount)}</span>
      </span>

      <button
        type="button"
        className={`action-btn ${project.savedByMe ? 'is-active' : ''}`.trim()}
        onClick={handleSave}
        aria-pressed={project.savedByMe}
        title={project.savedByMe ? 'Remove from saved' : 'Save project'}
      >
        <Icon name="bookmark" size={17} filled={project.savedByMe} />
      </button>

      <div className="action-bar__share">
        <button
          type="button"
          className="action-btn"
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          title="Share"
        >
          <Icon name="share" size={17} />
        </button>
        {menuOpen ? (
          <div className="share-menu" role="menu" ref={menuRef}>
            <button type="button" role="menuitem" onClick={handleShare}>
              <Icon name="share" size={15} /> Share via…
            </button>
            <button type="button" role="menuitem" onClick={handleCopy}>
              <Icon name="copy" size={15} /> Copy link
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                navigate(`/project/${project.id}`)
                setMenuOpen(false)
              }}
            >
              <Icon name="image" size={15} /> Open project
            </button>
            <span className="share-menu__meta">Project by @{project.author.username}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function useCommentCount(projectId) {
  const { commentsFor } = useAppState()
  return commentsFor(projectId).length
}
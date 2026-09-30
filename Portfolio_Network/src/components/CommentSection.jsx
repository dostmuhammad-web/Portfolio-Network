import { useState } from 'react'
import Icon from './Icon'
import Avatar from './Avatar'
import { useAppState } from '../store/appContext'
import { navigate, profilePath } from '../router'
import { formatCompact, formatRelativeTime } from '../lib/format'
import { toast } from '../lib/toast'

function CommentItem({ comment, currentUserId, liked, onToggleLike, onDelete }) {
  const author = comment.author
  return (
    <li className="comment">
      <Avatar user={author} size={36} radius={10} />
      <div className="comment__body">
        <div className="comment__head">
          <a
            className="comment__author"
            href={author ? `#${profilePath(author.username)}` : undefined}
            onClick={(event) => {
              if (!author) return
              event.preventDefault()
              navigate(profilePath(author.username))
            }}
          >
            {author ? author.name : 'Unknown developer'}
          </a>
          {author ? <span className="comment__username">@{author.username}</span> : null}
          <span className="comment__dot">·</span>
          <time className="comment__time" dateTime={comment.createdAt}>
            {formatRelativeTime(comment.createdAt)}
          </time>
        </div>
        <p className="comment__text">{comment.body}</p>
        <div className="comment__actions">
          <button
            type="button"
            className={`comment__action ${liked ? 'is-active' : ''}`.trim()}
            onClick={onToggleLike}
            aria-pressed={liked}
          >
            <Icon name="heart" size={14} filled={liked} />
            {formatCompact((comment.likes ?? 0) + (liked ? 1 : 0))}
          </button>
          <button
            type="button"
            className="comment__action"
            onClick={() => {
              navigator.clipboard?.writeText(comment.body).catch(() => {})
              toast('Comment copied')
            }}
          >
            <Icon name="copy" size={14} />
            Copy
          </button>
          {comment.authorId === currentUserId ? (
            <button type="button" className="comment__action comment__action--danger" onClick={onDelete}>
              <Icon name="close" size={14} />
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </li>
  )
}

export default function CommentSection({ projectId, autoFocus = false }) {
  const { commentsFor, currentUser, actions, likedComments, getUser } = useAppState()
  const [draft, setDraft] = useState('')
  const comments = commentsFor(projectId)

  const sorted = [...comments].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  const submit = (event) => {
    event.preventDefault()
    const body = draft.trim()
    if (!body) return
    actions.addComment(projectId, body)
    setDraft('')
    toast('Comment added')
  }

  return (
    <section className="comments" id="comments">
      <header className="comments__header">
        <h2>
          Comments <span className="comments__count">{comments.length}</span>
        </h2>
      </header>

      <form className="comment-form" onSubmit={submit}>
        <Avatar user={currentUser} size={36} radius={10} />
        <div className="comment-form__field">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`Comment as ${currentUser.name}…`}
            rows={3}
            autoFocus={autoFocus}
            maxLength={600}
          />
          <div className="comment-form__footer">
            <span className="comment-form__count">{draft.length}/600</span>
            <button type="submit" className="btn btn--primary btn--sm" disabled={!draft.trim()}>
              Comment
            </button>
          </div>
        </div>
      </form>

      {sorted.length === 0 ? (
        <p className="empty-note">No comments yet. Start the conversation.</p>
      ) : (
        <ul className="comments__list">
          {sorted.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={{ ...comment, author: getUser(comment.authorId) }}
              currentUserId={currentUser.id}
              liked={Boolean(likedComments[comment.id])}
              onToggleLike={() => actions.toggleCommentLike(comment.id)}
              onDelete={() => {
                actions.removeComment(projectId, comment.id)
                toast('Comment deleted')
              }}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
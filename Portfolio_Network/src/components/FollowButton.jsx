import Icon from './Icon'
import { useAppState } from '../store/appContext'
import { toast } from '../lib/toast'

export default function FollowButton({ userId, size = 'md', showName = false, className = '' }) {
  const { currentUser, followedIds, actions } = useAppState()
  const isSelf = currentUser.id === userId
  const following = followedIds.includes(userId)

  if (isSelf) {
    return (
      <span className={`follow-btn follow-btn--${size} is-self ${className}`.trim()}>This is you</span>
    )
  }

  return (
    <button
      type="button"
      className={`follow-btn follow-btn--${size} ${following ? 'is-following' : ''} ${className}`.trim()}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        actions.toggleFollow(userId)
        toast(following ? 'Unfollowed' : 'Following')
      }}
      aria-pressed={following}
    >
      {showName && !following ? <Icon name="plus" size={15} /> : null}
      {following ? 'Following' : 'Follow'}
    </button>
  )
}
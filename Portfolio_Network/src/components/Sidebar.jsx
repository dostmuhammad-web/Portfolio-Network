import Icon from './Icon'
import Avatar from './Avatar'
import { navigate, profilePath } from '../router'
import { useAppState } from '../store/appContext'

const NAV_ITEMS = [
  { id: 'feed', to: '/', icon: 'home', label: 'Feed' },
  { id: 'discover', to: '/discover', icon: 'compass', label: 'Discover' },
  { id: 'saved', to: '/saved', icon: 'bookmark', label: 'Saved' },
]

export default function Sidebar({ route }) {
  const { currentUser, users, followedIds, savedProjectIds } = useAppState()
  const following = users.filter((user) => followedIds.includes(user.id))
  const activeTab = route.name === 'profile' ? 'profile' : route.name

  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar__link ${activeTab === item.id ? 'is-active' : ''}`.trim()}
            onClick={() => navigate(item.to)}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            <Icon name={item.icon} size={17} />
            <span>{item.label}</span>
            {item.id === 'saved' && savedProjectIds.length > 0 ? (
              <span className="sidebar__badge">{savedProjectIds.length}</span>
            ) : null}
          </button>
        ))}
        <button
          type="button"
          className={`sidebar__link ${activeTab === 'profile' ? 'is-active' : ''}`.trim()}
          onClick={() => navigate(profilePath(currentUser.username))}
          aria-current={activeTab === 'profile' ? 'page' : undefined}
        >
          <Avatar user={currentUser} size={20} radius={6} />
          <span>Your profile</span>
        </button>
      </nav>

      <div className="sidebar__section">
        <h3 className="sidebar__title">Following</h3>
        {following.length === 0 ? (
          <p className="sidebar__empty">
            Follow developers to build your feed. <button type="button" onClick={() => navigate('/discover')}>Discover</button>
          </p>
        ) : (
          <ul className="sidebar__people">
            {following.slice(0, 8).map((user) => (
              <li key={user.id}>
                <button type="button" onClick={() => navigate(profilePath(user.username))}>
                  <Avatar user={user} size={26} radius={7} />
                  <span className="sidebar__person-name">{user.name}</span>
                  <span className="sidebar__person-handle">@{user.username}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="sidebar__footer">
        <p>Demo data lives in your browser.</p>
        <p className="sidebar__keys">Interactions persist to localStorage.</p>
      </footer>
    </aside>
  )
}
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import RightRail from './RightRail'
import Toaster from './Toaster'
import FeedPage from '../pages/FeedPage'
import DiscoverPage from '../pages/DiscoverPage'
import ProjectPage from '../pages/ProjectPage'
import ProfilePage from '../pages/ProfilePage'
import SavedPage from '../pages/SavedPage'
import Icon from './Icon'
import { useRoute, navigate } from '../router'
import { useAppState } from '../store/appContext'

export default function AppShell() {
  const route = useRoute()
  const { savedProjectIds } = useAppState()

  const searchTerm = route.query.get('q') ?? ''

  const content = renderRoute(route)

  return (
    <div className="app">
      <Navbar
        onSearch={(value) => {
          if (!value) {
            navigate('/discover')
            return
          }
          navigate(`/discover?q=${encodeURIComponent(value)}`)
        }}
      />
      <div className="app__layout">
        <Sidebar route={route} />
        <main className="app__main">
          {content}
          <footer className="app__footer">
            <span>DevNetwork · developer portfolio network demo</span>
            <span>
              {searchTerm ? `Search: ${searchTerm} · ` : ''}
              {savedProjectIds.length} saved · likes, saves, follows and comments persist in localStorage
            </span>
          </footer>
        </main>
        <RightRail />
      </div>
      <Toaster />
    </div>
  )
}

function renderRoute(route) {
  switch (route.name) {
    case 'feed':
      return <FeedPage />
    case 'discover':
      return <DiscoverPage query={route.query} setQuery={(value, options) => setDiscoverQuery(route.query, value, options)} />
    case 'project':
      return <ProjectPage projectId={route.params.projectId} query={route.query} />
    case 'profile':
      return <ProfilePage key={route.params.username} username={route.params.username} query={route.query} />
    case 'saved':
      return <SavedPage />
    default:
      return (
        <div className="empty-state">
          <Icon name="compass" size={22} />
          <h3>Page not found</h3>
          <p>The link you followed does not exist on DevNetwork.</p>
          <button type="button" className="btn btn--sm" onClick={() => navigate('/')}>
            Back to feed
          </button>
        </div>
      )
  }
}

function setDiscoverQuery(query, value, options) {
  const params = new URLSearchParams(query)
  if (value) params.set('q', value)
  else params.delete('q')
  const search = params.toString()
  navigate(`/discover${search ? `?${search}` : ''}`, options)
}
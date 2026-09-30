import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import Avatar from './Avatar'
import { navigate, profilePath } from '../router'
import { useAppState } from '../store/appContext'
import { toast } from '../lib/toast'

const THEMES = [
  { id: 'auto', label: 'System', icon: 'bolt' },
  { id: 'light', label: 'Light', icon: 'sun' },
  { id: 'dark', label: 'Dark', icon: 'moon' },
]

export default function Navbar({ onSearch }) {
  const { currentUser, users, actions, state, followedIds } = useAppState()
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const menuRef = useRef(null)
  const theme = THEMES.find((item) => item.id === state.theme) ?? THEMES[0]

  useEffect(() => {
    if (!menuOpen) return undefined
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [menuOpen])

  const submit = (event) => {
    event.preventDefault()
    onSearch(query.trim())
  }

  const cycleTheme = () => {
    const index = THEMES.findIndex((item) => item.id === state.theme)
    const next = THEMES[(index + 1) % THEMES.length]
    actions.setTheme(next.id)
    toast(`Theme: ${next.label}`)
  }

  const following = users.filter((user) => followedIds.includes(user.id))

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <a
          className="navbar__brand"
          href="#/"
          onClick={(event) => {
            event.preventDefault()
            navigate('/')
          }}
        >
          <span className="navbar__brand-mark">&lt;/&gt;</span>
          <span className="navbar__brand-name">DEVNETWORK</span>
        </a>

        <form className="navbar__search" onSubmit={submit} role="search">
          <Icon name="compass" size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects, developers, tech…"
            aria-label="Search DevNetwork"
          />
          {query ? (
            <button type="button" className="navbar__search-clear" onClick={() => setQuery('')} aria-label="Clear search">
              <Icon name="close" size={14} />
            </button>
          ) : null}
        </form>

        <div className="navbar__actions">
          <button type="button" className="icon-btn" onClick={cycleTheme} title={`Theme: ${theme.label}`}>
            <Icon name={theme.icon} size={17} />
          </button>
          <button
            type="button"
            className="icon-btn"
            title="Saved projects"
            onClick={() => navigate('/saved')}
          >
            <Icon name="bookmark" size={17} />
          </button>

          <div className="account" ref={menuRef}>
            <button
              type="button"
              className="account__trigger"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <Avatar user={currentUser} size={30} radius={8} />
              <span className="account__name">{currentUser.username}</span>
              <Icon name="chevronDown" size={14} />
            </button>
            {menuOpen ? (
              <div className="account__menu" role="menu">
                <div className="account__head">
                  <Avatar user={currentUser} size={40} radius={10} />
                  <span>
                    <strong>{currentUser.name}</strong>
                    <small>@{currentUser.username}</small>
                  </span>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    navigate(profilePath(currentUser.username))
                    setMenuOpen(false)
                  }}
                >
                  <Icon name="user" size={15} /> Your profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    navigate('/saved')
                    setMenuOpen(false)
                  }}
                >
                  <Icon name="bookmark" size={15} /> Saved projects
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    actions.reset()
                    setMenuOpen(false)
                    toast('Demo data reset')
                  }}
                >
                  <Icon name="reset" size={15} /> Reset demo data
                </button>
                <span className="account__divider" />
                <span className="account__label">Switch account (demo)</span>
                <div className="account__list">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      role="menuitem"
                      className={user.id === currentUser.id ? 'is-active' : ''}
                      onClick={() => {
                        actions.setCurrentUser(user.id)
                        setMenuOpen(false)
                        toast(`Now viewing as @${user.username}`)
                      }}
                    >
                      <Avatar user={user} size={22} radius={6} />
                      <span className="account__list-name">{user.name}</span>
                      <small>@{user.username}</small>
                      {user.id === currentUser.id ? <Icon name="check" size={14} /> : null}
                    </button>
                  ))}
                </div>
                {following.length > 0 ? (
                  <span className="account__hint">
                    Following {following.length} {following.length === 1 ? 'developer' : 'developers'}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
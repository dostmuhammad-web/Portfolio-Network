import { useMemo, useState } from 'react'
import Icon from '../components/Icon'
import Avatar from '../components/Avatar'
import ProjectArt from '../components/ProjectArt'
import TechTag from '../components/TechTag'
import UserCard from '../components/UserCard'
import FollowButton from '../components/FollowButton'
import { GridProjectCard } from '../components/ProjectCard'
import { useAppState } from '../store/appContext'
import { navigate, projectPath } from '../router'
import { formatCompact, formatDate, formatDuration, formatMonthRange } from '../lib/format'
import { toast } from '../lib/toast'

const TABS = [
  { id: 'projects', label: 'Projects' },
  { id: 'followers', label: 'Followers' },
  { id: 'following', label: 'Following' },
  { id: 'likes', label: 'Likes' },
  { id: 'skills', label: 'Skills' },
]

const SOCIALS = [
  { key: 'github', icon: 'github', label: 'GitHub', build: (value) => `https://github.com/${value}` },
  { key: 'twitter', icon: 'twitter', label: 'X', build: (value) => `https://x.com/${value}` },
  { key: 'linkedin', icon: 'linkedin', label: 'LinkedIn', build: (value) => `https://linkedin.com/in/${value}` },
  { key: 'website', icon: 'globe', label: 'Website', build: (value) => value },
]

export default function ProfilePage({ username, query }) {
  const app = useAppState()
  const { users, currentUser, actions } = app
  const tab = TABS.some((item) => item.id === query.get('tab')) ? query.get('tab') : 'projects'
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ headline: '', bio: '', location: '' })

  const user = useMemo(
    () => users.find((item) => item.username === username) ?? (currentUser.username === username ? currentUser : null),
    [users, username, currentUser],
  )

  const isSelf = Boolean(user && currentUser.id === user.id)

  if (!user) {
    return (
      <div className="page">
        <div className="empty-state">
          <Icon name="user" size={22} />
          <h3>Profile not found</h3>
          <p>No developer with the handle @{username} lives on this network.</p>
          <button type="button" className="btn btn--sm" onClick={() => navigate('/discover?')}>
            Browse developers
          </button>
        </div>
      </div>
    )
  }

  const profileUser = isSelf ? { ...user, ...(app.state.profileEdits[user.id] ?? {}) } : user
  const projects = app.projectsByAuthor(user.id)
  const followers = app.followersOf(user.id).map((id) => app.getUser(id)).filter(Boolean)
  const following = app.followingOf(user.id).map((id) => app.getUser(id)).filter(Boolean)
  const likedIds = app.likedProjectIdsFor(user.id)
  const likedProjects = likedIds.map((id) => app.getProject(id)).filter(Boolean)

  const setTab = (next) => {
    navigate(`/u/${user.username}${next === 'projects' ? '' : `?tab=${next}`}`)
  }

  const saveProfile = (event) => {
    event.preventDefault()
    actions.updateProfile(user.id, {
      headline: draft.headline.trim(),
      bio: draft.bio.trim(),
      location: draft.location.trim(),
    })
    setEditing(false)
    toast('Profile updated and saved locally')
  }

  return (
    <div className="page page--profile">
      <section className="profile-header">
        <div className="profile-header__cover">
          <ProjectArt projectId={profileUser.id} kind="cover" label={`${profileUser.name} profile cover`} />
        </div>
        <div className="profile-header__body">
          <div className="profile-header__top">
            <Avatar user={profileUser} size={92} radius={20} />
            <div className="profile-header__actions">
              {isSelf ? (
                <>
                  <button
                    type="button"
                    className="btn btn--sm"
                    onClick={() => {
                      setDraft({
                        headline: profileUser.headline,
                        bio: profileUser.bio,
                        location: profileUser.location,
                      })
                      setEditing((open) => !open)
                    }}
                  >
                    <Icon name={editing ? 'close' : 'code'} size={15} />
                    {editing ? 'Cancel' : 'Edit profile'}
                  </button>
                  <a className="btn btn--sm" href="#/saved" onClick={(event) => { event.preventDefault(); navigate('/saved') }}>
                    <Icon name="bookmark" size={15} /> Saved
                  </a>
                </>
              ) : (
                <FollowButton userId={profileUser.id} size="lg" showName />
              )}
            </div>
          </div>

          {editing ? (
            <form className="profile-editor" onSubmit={saveProfile}>
              <label className="field">
                <span>Headline</span>
                <input
                  value={draft.headline}
                  onChange={(event) => setDraft({ ...draft, headline: event.target.value })}
                  maxLength={80}
                />
              </label>
              <label className="field">
                <span>Bio</span>
                <textarea
                  value={draft.bio}
                  onChange={(event) => setDraft({ ...draft, bio: event.target.value })}
                  rows={3}
                  maxLength={280}
                />
              </label>
              <label className="field">
                <span>Location</span>
                <input
                  value={draft.location}
                  onChange={(event) => setDraft({ ...draft, location: event.target.value })}
                  maxLength={60}
                />
              </label>
              <div className="profile-editor__actions">
                <button type="submit" className="btn btn--primary btn--sm">
                  Save changes
                </button>
                <span className="muted">Stored in localStorage only.</span>
              </div>
            </form>
          ) : (
            <>
              <h1 className="profile-header__name">{profileUser.name}</h1>
              <p className="profile-header__handle">@{profileUser.username}</p>
              {profileUser.headline ? <p className="profile-header__headline">{profileUser.headline}</p> : null}
              {profileUser.bio ? <p className="profile-header__bio">{profileUser.bio}</p> : null}
              <div className="profile-header__meta">
                <span>
                  <Icon name="mapPin" size={15} /> {profileUser.location}
                </span>
                <span>
                  <Icon name="calendar" size={15} /> Joined {formatDate(profileUser.joined)}
                </span>
                {SOCIALS.filter((social) => profileUser.socials?.[social.key]).map((social) => (
                  <a key={social.key} href={social.build(profileUser.socials[social.key])} target="_blank" rel="noreferrer noopener">
                    <Icon name={social.icon} size={15} /> {social.label}
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        <dl className="profile-stats">
          <Stat value={projects.length} label="Projects" onClick={() => setTab('projects')} active={tab === 'projects'} />
          <Stat value={formatCompact(app.followerCount(user.id))} label="Followers" onClick={() => setTab('followers')} active={tab === 'followers'} />
          <Stat value={formatCompact(app.followingCount(user.id))} label="Following" onClick={() => setTab('following')} active={tab === 'following'} />
          <Stat value={formatCompact(app.totalLikesFor(user.id))} label="Likes" onClick={() => setTab('likes')} active={tab === 'likes'} />
          <Stat value={profileUser.skills.length} label="Skills" onClick={() => setTab('skills')} active={tab === 'skills'} />
        </dl>
      </section>

      <div className="tabs tabs--underline" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`tab ${tab === item.id ? 'is-active' : ''}`.trim()}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'projects' ? (
        projects.length === 0 ? (
          <div className="empty-state">
            <Icon name="layers" size={22} />
            <h3>No projects published yet</h3>
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
        )
      ) : null}

      {tab === 'followers' ? (
        <UserList
          users={followers}
          empty="No followers yet."
          emptyHint="Published projects attract followers."
        />
      ) : null}

      {tab === 'following' ? (
        <UserList
          users={following}
          empty="Not following anyone yet."
          emptyHint="Find developers in Discover."
          action={{ label: 'Find developers', onClick: () => navigate('/discover') }}
        />
      ) : null}

      {tab === 'likes' ? (
        likedProjects.length === 0 ? (
          <div className="empty-state">
            <Icon name="heart" size={22} />
            <h3>No liked projects yet</h3>
            <p>Tap the heart on any project to add it here.</p>
            <button type="button" className="btn btn--sm" onClick={() => navigate('/discover')}>
              Browse projects
            </button>
          </div>
        ) : (
          <div className="grid">
            {likedProjects.map((project) => (
              <GridProjectCard
                key={project.id}
                project={project}
                onComment={() => navigate(`${projectPath(project.id)}?focus=comments`)}
              />
            ))}
          </div>
        )
      ) : null}

      {tab === 'skills' ? (
        <div className="skills">
          <section className="skills__block">
            <h2>Skills</h2>
            <ul className="skills__list">
              {profileUser.skills.map((skill) => (
                <li key={skill.id} className="skill">
                  <div className="skill__head">
                    <TechTag id={skill.id} size="sm" />
                    <span className="skill__level">{skill.level}</span>
                    <span className="skill__years">
                      {skill.years} {skill.years === 1 ? 'year' : 'years'}
                    </span>
                  </div>
                  <div className="skill__bar">
                    <span style={{ width: levelWidth(skill.level) }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="skills__block">
            <h2>Experience</h2>
            <ol className="timeline">
              {profileUser.experience.map((item) => (
                <li key={`${item.company}-${item.role}`} className="timeline__item">
                  <span className="timeline__marker" />
                  <div className="timeline__content">
                    <strong>{item.role}</strong>
                    <span className="timeline__company">
                      <Icon name="briefcase" size={14} /> {item.company}
                      {item.current ? <span className="badge badge--live">Current</span> : null}
                    </span>
                    <span className="timeline__period">
                      {formatMonthRange(item.start, item.end)} · {formatDuration(item.start, item.end)}
                    </span>
                    <p>{item.summary}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : null}
    </div>
  )
}

function levelWidth(level) {
  switch (level) {
    case 'Expert':
      return '96%'
    case 'Advanced':
      return '76%'
    case 'Intermediate':
      return '52%'
    default:
      return '32%'
  }
}

function Stat({ value, label, onClick, active }) {
  return (
    <div className={`profile-stat ${active ? 'is-active' : ''}`.trim()}>
      <button type="button" onClick={onClick}>
        <strong>{value}</strong>
        <span>{label}</span>
      </button>
    </div>
  )
}

function UserList({ users, empty, emptyHint, action }) {
  if (users.length === 0) {
    return (
      <div className="empty-state">
        <Icon name="users" size={22} />
        <h3>{empty}</h3>
        <p>{emptyHint}</p>
        {action ? (
          <button type="button" className="btn btn--sm" onClick={action.onClick}>
            {action.label}
          </button>
        ) : null}
      </div>
    )
  }
  return (
    <div className="user-grid">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
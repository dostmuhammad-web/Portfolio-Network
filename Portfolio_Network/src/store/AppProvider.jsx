import { useEffect, useMemo, useReducer, useRef } from 'react'
import { AppStateContext } from './appContext'
import { loadState } from './appStore'
import { STORAGE_KEYS, writeStore } from '../lib/storage'
import { PROJECTS, getProject, projectsByAuthor } from '../data/projects'
import { USERS, getUser } from '../data/users'
import { baseFollowersOf, baseFollowingOf, seededLikesFor } from '../lib/selectors'

function toggleIn(object, key) {
  const next = { ...object }
  if (next[key]) delete next[key]
  else next[key] = true
  return next
}

function reducer(state, action) {
  switch (action.type) {
    case 'toggle-like':
      return { ...state, liked: toggleIn(state.liked, action.projectId) }
    case 'toggle-save':
      return { ...state, saved: toggleIn(state.saved, action.projectId) }
    case 'toggle-follow': {
      if (action.userId === state.currentUserId) return state
      return { ...state, follows: toggleIn(state.follows, action.userId) }
    }
    case 'toggle-comment-like':
      return { ...state, likedCommentIds: toggleIn(state.likedCommentIds, action.commentId) }
    case 'add-comment': {
      const list = state.comments[action.comment.projectId] ?? []
      return {
        ...state,
        comments: {
          ...state.comments,
          [action.comment.projectId]: [...list, action.comment],
        },
      }
    }
    case 'remove-comment': {
      const list = (state.comments[action.projectId] ?? []).filter(
        (comment) => comment.id !== action.commentId,
      )
      return { ...state, comments: { ...state.comments, [action.projectId]: list } }
    }
    case 'register-view': {
      if (state.viewedProjectIds[action.projectId]) return state
      return { ...state, viewedProjectIds: { ...state.viewedProjectIds, [action.projectId]: true } }
    }
    case 'set-current-user':
      return { ...state, currentUserId: action.userId }
    case 'update-profile':
      return {
        ...state,
        profileEdits: { ...state.profileEdits, [action.userId]: action.patch },
      }
    case 'set-theme':
      return { ...state, theme: action.theme }
    case 'reset':
      return loadState()
    default:
      return state
  }
}

export default function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)
  const saveTimer = useRef(null)

  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      writeStore(STORAGE_KEYS.state, state)
    }, 120)
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
  }, [state])

  useEffect(() => {
    writeStore(STORAGE_KEYS.session, {
      currentUserId: state.currentUserId,
      theme: state.theme,
    })
  }, [state.currentUserId, state.theme])

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const resolved = state.theme === 'auto' ? (media.matches ? 'dark' : 'light') : state.theme
      root.dataset.theme = resolved
      root.style.colorScheme = resolved
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [state.theme])

  const followedIds = useMemo(
    () => Object.keys(state.follows).filter((id) => state.follows[id]),
    [state.follows],
  )

  const api = useMemo(() => {
    const baseUser = getUser(state.currentUserId) ?? USERS[0]
    const edit = state.profileEdits[baseUser.id]
    const currentUser = edit ? { ...baseUser, ...edit } : baseUser

    const decorate = (project) => {
      if (!project) return null
      const likedByMe = Boolean(state.liked[project.id])
      return {
        ...project,
        author: getUser(project.authorId),
        likedByMe,
        savedByMe: Boolean(state.saved[project.id]),
        likesCount: project.likes + (likedByMe ? 1 : 0),
        viewsCount: project.views + (state.viewedProjectIds[project.id] ? 1 : 0),
      }
    }

    const allProjects = PROJECTS.map(decorate)

    const projectById = new Map(allProjects.map((project) => [project.id, project]))

    const followedByMeSet = new Set(followedIds)

    const followersOf = (userId) => {
      const ids = baseFollowersOf(userId)
      if (userId !== state.currentUserId && followedByMeSet.has(userId)) {
        return [...ids, state.currentUserId]
      }
      return ids
    }

    const followingOf = (userId) => {
      if (userId === state.currentUserId) return followedIds
      return baseFollowingOf(userId)
    }

    const followerCount = (userId) => {
      const base = getUser(userId)?.stats.followers ?? 0
      const extra = userId === state.currentUserId ? followedIds.length : followedByMeSet.has(userId) ? 1 : 0
      return base + extra
    }

    const followingCount = (userId) => {
      const base = getUser(userId)?.stats.following ?? 0
      const extra = userId === state.currentUserId ? followedIds.length : 0
      return base + extra
    }

    const likedProjectIdsFor = (userId) => {
      const ids = new Set(seededLikesFor(userId))
      if (userId === state.currentUserId) {
        for (const [projectId, liked] of Object.entries(state.liked)) {
          if (liked) ids.add(projectId)
        }
      }
      return [...ids]
    }

    const totalLikesFor = (userId) => {
      const base = getUser(userId)?.stats.likes ?? 0
      const extra = userId === state.currentUserId ? Object.values(state.liked).filter(Boolean).length : 0
      return base + extra
    }

    return {
      state,
      users: USERS,
      projects: allProjects,
      currentUser,
      followedIds,
      followersOf,
      followingOf,
      followerCount,
      followingCount,
      likedProjectIdsFor,
      totalLikesFor,
      getProject: (projectId) => projectById.get(projectId) ?? getProject(projectId),
      getUser,
      projectsByAuthor: (authorId) => projectsByAuthor(authorId).map((p) => projectById.get(p.id)),
      commentsFor: (projectId) => state.comments[projectId] ?? [],
      likedComments: state.likedCommentIds,
      savedProjectIds: Object.keys(state.saved).filter((id) => state.saved[id]),
      actions: {
        toggleLike: (projectId) => dispatch({ type: 'toggle-like', projectId }),
        toggleSave: (projectId) => dispatch({ type: 'toggle-save', projectId }),
        toggleFollow: (userId) => dispatch({ type: 'toggle-follow', userId }),
        toggleCommentLike: (commentId) => dispatch({ type: 'toggle-comment-like', commentId }),
        addComment: (projectId, body) => {
          const comment = {
            id: `c_local_${Date.now().toString(36)}_${Math.floor(performance.now() % 1000)}`,
            projectId,
            authorId: state.currentUserId,
            body,
            createdAt: new Date().toISOString(),
            likes: 0,
            local: true,
          }
          dispatch({ type: 'add-comment', comment })
          return comment
        },
        removeComment: (projectId, commentId) => dispatch({ type: 'remove-comment', projectId, commentId }),
        registerView: (projectId) => dispatch({ type: 'register-view', projectId }),
        setCurrentUser: (userId) => dispatch({ type: 'set-current-user', userId }),
        updateProfile: (userId, patch) => dispatch({ type: 'update-profile', userId, patch }),
        setTheme: (theme) => dispatch({ type: 'set-theme', theme }),
        reset: () => dispatch({ type: 'reset' }),
      },
    }
  }, [state, followedIds])

  return <AppStateContext.Provider value={api}>{children}</AppStateContext.Provider>
}
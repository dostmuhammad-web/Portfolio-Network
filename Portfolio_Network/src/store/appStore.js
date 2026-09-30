import { PROJECTS } from '../data/projects'
import { SEED_COMMENTS, SEED_FOLLOWS } from '../data/comments'
import { DEFAULT_USER_ID } from '../data/users'
import { STORAGE_KEYS, readStore, removeStore } from '../lib/storage'

const SESSION_VERSION = 1

function buildInitialState() {
  const seededFollows = SEED_FOLLOWS[DEFAULT_USER_ID] ?? []
  const commentsByProject = {}
  for (const comment of SEED_COMMENTS) {
    if (!commentsByProject[comment.projectId]) commentsByProject[comment.projectId] = []
    commentsByProject[comment.projectId].push(comment)
  }

  return {
    version: SESSION_VERSION,
    currentUserId: DEFAULT_USER_ID,
    liked: {},
    saved: {},
    follows: Object.fromEntries(seededFollows.map((id) => [id, true])),
    comments: commentsByProject,
    likedCommentIds: {},
    viewedProjectIds: {},
    profileEdits: {},
    theme: 'auto',
  }
}

function sanitize(state) {
  if (!state || typeof state !== 'object' || state.version !== SESSION_VERSION) return null
  const validProjectIds = new Set(PROJECTS.map((project) => project.id))
  const liked = {}
  const saved = {}
  const follows = {}
  const comments = {}
  const likedCommentIds = {}
  const viewedProjectIds = {}

  for (const [key, value] of Object.entries(state.liked ?? {})) {
    if (value && validProjectIds.has(key)) liked[key] = true
  }
  for (const [key, value] of Object.entries(state.saved ?? {})) {
    if (value && validProjectIds.has(key)) saved[key] = true
  }
  for (const [key, value] of Object.entries(state.follows ?? {})) {
    if (value) follows[key] = true
  }
  const storedComments = []
const isComment = (value) =>
    Boolean(value) && typeof value === 'object' && typeof value.projectId === 'string' && typeof value.body === 'string'
const collectComments = (value) => {
    if (Array.isArray(value)) {
      for (const item of value) collectComments(item)
      return
    }
    if (!value || typeof value !== 'object') return
    if (isComment(value)) storedComments.push(value)
    else for (const item of Object.values(value)) collectComments(item)
  }
  collectComments(state.comments)
  for (const comment of storedComments) {
    if (!comment || !validProjectIds.has(comment.projectId) || !comment.body) continue
    if (!comments[comment.projectId]) comments[comment.projectId] = []
    comments[comment.projectId].push(comment)
  }
  for (const [key, value] of Object.entries(state.likedCommentIds ?? {})) {
    if (value) likedCommentIds[key] = true
  }
  for (const [key, value] of Object.entries(state.viewedProjectIds ?? {})) {
    if (value && validProjectIds.has(key)) viewedProjectIds[key] = true
  }

  return {
    version: SESSION_VERSION,
    currentUserId: state.currentUserId ?? DEFAULT_USER_ID,
    liked,
    saved,
    follows,
    comments,
    likedCommentIds,
    viewedProjectIds,
    profileEdits: state.profileEdits ?? {},
    theme: state.theme ?? 'auto',
  }
}

export function loadState() {
  try {
    const persisted = sanitize(readStore(STORAGE_KEYS.state, null))
    if (persisted) return persisted
  } catch {
    removeStore(STORAGE_KEYS.state)
  }
  const session = readStore(STORAGE_KEYS.session, null)
  const fresh = buildInitialState()
  if (session?.currentUserId) fresh.currentUserId = session.currentUserId
  if (session?.theme) fresh.theme = session.theme
  return fresh
}

export function createInitialState() {
  return loadState()
}
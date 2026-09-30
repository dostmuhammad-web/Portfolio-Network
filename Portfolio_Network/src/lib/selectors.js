import { PROJECTS } from '../data/projects'
import { USERS } from '../data/users'
import { SEED_FOLLOWS } from '../data/comments'
import { seededRandom } from './identity'

const likesCache = new Map()

export function seededLikesFor(userId) {
  if (likesCache.has(userId)) return likesCache.get(userId)
  const rng = seededRandom(userId, 'seeded-likes')
  const pool = PROJECTS.filter((project) => project.authorId !== userId)
  const target = Math.min(pool.length, intFrom(rng, 4, 9))
  const picked = []
  const used = new Set()
  let guard = 0
  while (picked.length < target && guard < 200) {
    guard += 1
    const index = Math.floor(rng() * pool.length)
    if (used.has(index)) continue
    used.add(index)
    picked.push(pool[index].id)
  }
  likesCache.set(userId, picked)
  return picked
}

function intFrom(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1))
}

export function baseFollowersOf(userId) {
  return USERS.filter((user) => (SEED_FOLLOWS[user.id] ?? []).includes(userId)).map((user) => user.id)
}

export function baseFollowingOf(userId) {
  return SEED_FOLLOWS[userId] ?? []
}

export function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
}

export function matchesQuery(project, author, query) {
  const needle = normalize(query)
  if (!needle) return true
  const haystack = [
    project.title,
    project.tagline,
    project.description,
    author?.name,
    author?.username,
    project.technologies.join(' '),
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(needle)
}

export const SORTS = [
  { id: 'trending', label: 'Trending' },
  { id: 'newest', label: 'Newest' },
  { id: 'most-liked', label: 'Most liked' },
  { id: 'most-viewed', label: 'Most viewed' },
]

export function sortProjects(projects, sort) {
  const sorted = [...projects]
  if (sort === 'newest') {
    return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
  if (sort === 'most-liked') {
    return sorted.sort((a, b) => b.likes - a.likes)
  }
  if (sort === 'most-viewed') {
    return sorted.sort((a, b) => b.views - a.views)
  }
  return sorted.sort((a, b) => b.likes / Math.max(1, Math.sqrt(b.views + 1)) - a.likes / Math.max(1, Math.sqrt(a.views + 1)))
}

export function trendingTechs(projects, limit = 8) {
  const counts = new Map()
  for (const project of projects) {
    for (const tech of project.technologies) {
      counts.set(tech, (counts.get(tech) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([id, count]) => ({ id, count }))
}

export function suggestedUsers(currentUserId, followedIds) {
  return USERS.filter((user) => user.id !== currentUserId && !followedIds.includes(user.id))
    .sort((a, b) => b.stats.followers - a.stats.followers)
    .slice(0, 4)
}
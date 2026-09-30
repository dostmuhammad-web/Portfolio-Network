import { useEffect, useState } from 'react'

export function navigate(to, { replace = false } = {}) {
  const target = to.startsWith('#') ? to : `#${to}`
  if (window.location.hash === target) return
  if (replace) {
    window.history.replaceState(null, '', target)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    return
  }
  window.location.hash = target
}

export function currentPath() {
  const raw = window.location.hash.replace(/^#/, '')
  return raw === '' ? '/' : raw
}

export function parseRoute(path) {
  const [pathname, search = ''] = path.split('?')
  const query = new URLSearchParams(search)
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return { name: 'feed', params: {}, query }
  }

  const [head, second] = segments

  if (head === 'discover') return { name: 'discover', params: {}, query }
  if (head === 'saved') return { name: 'saved', params: {}, query }
  if (head === 'project' && second) return { name: 'project', params: { projectId: second }, query }
  if (head === 'u' && second) return { name: 'profile', params: { username: second }, query }

  return { name: 'not-found', params: { segment: head }, query }
}

export function useRoute() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onChange = () => {
      setPath(currentPath())
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return parseRoute(path)
}

export function profilePath(username, tab) {
  return tab && tab !== 'projects' ? `/u/${username}?tab=${tab}` : `/u/${username}`
}

export function projectPath(projectId) {
  return `/project/${projectId}`
}
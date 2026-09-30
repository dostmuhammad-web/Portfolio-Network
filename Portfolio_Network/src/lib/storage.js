const NAMESPACE = 'devnetwork'
const VERSION = 'v1'
export const STORAGE_KEYS = {
  session: `${NAMESPACE}:${VERSION}:session`,
  state: `${NAMESPACE}:${VERSION}:state`,
  seen: `${NAMESPACE}:${VERSION}:viewed`,
}

function available() {
  try {
    const probe = `${NAMESPACE}:probe`
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

const hasStorage = typeof window !== 'undefined' && available()
const memory = new Map()

export function readStore(key, fallback) {
  if (!hasStorage) return memory.has(key) ? memory.get(key) : fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeStore(key, value) {
  memory.set(key, value)
  if (!hasStorage) return value
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return value
  }
  return value
}

export function removeStore(key) {
  memory.delete(key)
  if (!hasStorage) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    return
  }
}

export function clearSession() {
  Object.values(STORAGE_KEYS).forEach(removeStore)
}
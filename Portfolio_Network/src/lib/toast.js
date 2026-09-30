const listeners = new Set()
let counter = 0

export function subscribeToasts(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function toast(message, tone = 'default') {
  counter += 1
  const entry = { id: `t_${counter}`, message, tone }
  for (const listener of listeners) listener(entry)
  return entry.id
}
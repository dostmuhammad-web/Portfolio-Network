const FNV_OFFSET = 2166136261
const FNV_PRIME = 16777619

export function hashString(input) {
  let hash = FNV_OFFSET
  const text = String(input)
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, FNV_PRIME)
  }
  return hash >>> 0
}

export function mulberry32(seed) {
  let state = seed >>> 0
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seededRandom(id, salt = '') {
  return mulberry32(hashString(`${id}::${salt}`))
}

export function pick(rng, list) {
  return list[Math.floor(rng() * list.length) % list.length]
}

export function range(rng, min, max) {
  return min + rng() * (max - min)
}

export function intRange(rng, min, max) {
  return Math.floor(range(rng, min, max + 1))
}
import { hashString, seededRandom } from './identity'

export const AVATAR_PALETTES = [
  { bg: '#dbeafe', fg: '#1d4ed8' },
  { bg: '#e0e7ff', fg: '#4338ca' },
  { bg: '#ccfbf1', fg: '#0f766e' },
  { bg: '#fee2e2', fg: '#b91c1c' },
  { bg: '#fef3c7', fg: '#b45309' },
  { bg: '#dcfce7', fg: '#15803d' },
  { bg: '#fce7f3', fg: '#be185d' },
  { bg: '#ede9fe', fg: '#6d28d9' },
  { bg: '#e0f2fe', fg: '#0369a1' },
  { bg: '#f1f5f9', fg: '#334155' },
]

const GRID = 5

export function buildIdenticon(userId) {
  const palette = AVATAR_PALETTES[hashString(`avatar::${userId}`) % AVATAR_PALETTES.length]
  const rng = seededRandom(userId, 'identicon')
  const cells = []
  const half = Math.ceil(GRID / 2)
  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < half; x += 1) {
      if (rng() > 0.52) {
        cells.push({ x, y })
        const mirror = GRID - 1 - x
        if (mirror !== x) cells.push({ x: mirror, y })
      }
    }
  }
  return { palette, cells, size: GRID }
}

export function identiconDataUri(userId) {
  const { palette, cells, size } = buildIdenticon(userId)
  const rects = cells
    .map((cell) => `<rect x="${cell.x}" y="${cell.y}" width="1" height="1" fill="${palette.fg}"/>`)
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="64" height="64"><rect width="${size}" height="${size}" fill="${palette.bg}"/>${rects}</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
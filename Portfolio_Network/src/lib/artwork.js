import { hashString, seededRandom, intRange, range } from './identity'

export const ART_PALETTES = [
  { id: 'deep-space', from: '#0b1020', to: '#131a2e', glow: '#3b82f6', accents: ['#60a5fa', '#a78bfa', '#22d3ee', '#f472b6'] },
  { id: 'graphite', from: '#0d1117', to: '#1b2029', glow: '#58a6ff', accents: ['#58a6ff', '#3fb950', '#d29922', '#a371f7'] },
  { id: 'aurora', from: '#071a16', to: '#0f2a24', glow: '#34d399', accents: ['#34d399', '#22d3ee', '#fbbf24', '#4ade80'] },
  { id: 'ember', from: '#1a0f0d', to: '#2a1613', glow: '#fb7185', accents: ['#fb7185', '#fbbf24', '#f97316', '#f472b6'] },
  { id: 'violet', from: '#120b1f', to: '#1e1338', glow: '#a78bfa', accents: ['#a78bfa', '#60a5fa', '#f0abfc', '#22d3ee'] },
  { id: 'ocean', from: '#041520', to: '#0a2537', glow: '#38bdf8', accents: ['#38bdf8', '#2dd4bf', '#818cf8', '#facc15'] },
  { id: 'moss', from: '#0d1408', to: '#18230f', glow: '#a3e635', accents: ['#a3e635', '#4ade80', '#facc15', '#2dd4bf'] },
  { id: 'plum', from: '#140a18', to: '#241026', glow: '#e879f9', accents: ['#e879f9', '#c084fc', '#fb7185', '#60a5fa'] },
]

const GRID_OPACITY = 0.07

function pickPalette(projectId) {
  const index = hashString(`palette::${projectId}`) % ART_PALETTES.length
  return ART_PALETTES[index]
}

function buildGrid(w, h, step, color) {
  const lines = []
  for (let x = step; x < w; x += step) {
    lines.push({ type: 'v', x, color })
  }
  for (let y = step; y < h; y += step) {
    lines.push({ type: 'h', y, color })
  }
  return lines
}

function buildBlobs(rng, w, h, glow) {
  const count = intRange(rng, 2, 3)
  const blobs = []
  for (let i = 0; i < count; i += 1) {
    blobs.push({
      cx: Math.round(range(rng, -0.1, 1.1) * w),
      cy: Math.round(range(rng, -0.15, 1.15) * h),
      r: Math.round(range(rng, 0.22, 0.46) * Math.min(w, h) * 1.4),
      color: i === 0 ? glow : rng() > 0.5 ? glow : '#ffffff',
      opacity: range(rng, 0.06, 0.16),
    })
  }
  return blobs
}

function buildRings(rng, w, h, accent) {
  const count = intRange(rng, 0, 2)
  const rings = []
  for (let i = 0; i < count; i += 1) {
    rings.push({
      cx: Math.round(range(rng, 0.1, 0.9) * w),
      cy: Math.round(range(rng, 0.1, 0.9) * h),
      r: Math.round(range(rng, 0.08, 0.22) * Math.min(w, h)),
      color: accent,
      opacity: range(rng, 0.14, 0.3),
    })
  }
  return rings
}

function buildCodeBars(rng, box, accents) {
  const bars = []
  const { x, y, w, h } = box
  const lineHeight = Math.max(8, Math.round(h / 11))
  const gap = Math.round(lineHeight * 0.55)
  let cursorY = y
  let guard = 0
  while (cursorY < y + h && guard < 40) {
    guard += 1
    if (rng() > 0.18) {
      const indent = rng() > 0.62 ? Math.round(lineHeight * 2.2) : Math.round(lineHeight * 0.9)
      const barWidth = Math.round(range(rng, 0.18, 0.78) * (w - indent))
      bars.push({
        x: x + indent,
        y: cursorY,
        w: Math.max(lineHeight, barWidth),
        h: Math.max(5, Math.round(lineHeight * 0.52)),
        color: accents[Math.floor(rng() * accents.length) % accents.length],
        opacity: range(rng, 0.5, 0.95),
      })
    }
    cursorY += lineHeight + gap
  }
  return bars
}

function buildPanels(rng, box, accents, glow) {
  const { x, y, w, h } = box
  const panels = []
  const columns = rng() > 0.45 ? 3 : 2
  const gutter = Math.round(w * 0.035)
  const panelWidth = (w - gutter * (columns - 1)) / columns
  const topHeight = Math.round(h * range(rng, 0.34, 0.46))
  panels.push({ x, y, w: w, h: topHeight, r: 12, fill: glow, opacity: range(rng, 0.14, 0.24), stroke: accents[0], strokeOpacity: 0.35 })
  const lowerY = y + topHeight + gutter
  const lowerHeight = h - topHeight - gutter
  for (let col = 0; col < columns; col += 1) {
    panels.push({
      x: x + col * (panelWidth + gutter),
      y: lowerY,
      w: panelWidth,
      h: lowerHeight,
      r: 10,
      fill: accents[col % accents.length],
      opacity: range(rng, 0.08, 0.16),
      stroke: accents[(col + 1) % accents.length],
      strokeOpacity: 0.28,
    })
  }
  return panels
}

const artworkCache = new Map()

export function buildArtwork(projectId, kind = 'cover') {
  const cacheKey = `${projectId}::${kind}`
  if (artworkCache.has(cacheKey)) return artworkCache.get(cacheKey)
  const art = composeArtwork(projectId, kind)
  artworkCache.set(cacheKey, art)
  return art
}

function composeArtwork(projectId, kind) {
  const rng = seededRandom(projectId, kind)
  const palette = pickPalette(projectId)
  const isShot = kind === 'shot'
  const width = 1200
  const height = isShot ? 750 : 675
  const chromeHeight = isShot ? 56 : 0
  const margin = Math.round(width * 0.055)
  const contentBox = {
    x: margin,
    y: margin + chromeHeight,
    w: width - margin * 2,
    h: height - margin * 2 - chromeHeight,
  }
  const accents = [...palette.accents]
  if (rng() > 0.5) accents.reverse()

  return {
    projectId,
    kind,
    paletteId: palette.id,
    width,
    height,
    from: palette.from,
    to: palette.to,
    glow: palette.glow,
    accents,
    grid: buildGrid(width, height, isShot ? 60 : 75, '#ffffff'),
    gridOpacity: GRID_OPACITY,
    blobs: buildBlobs(rng, width, height, palette.glow),
    rings: buildRings(rng, width, height, accents[0]),
    chromeHeight,
    chromeDots: isShot ? accents.slice(0, 3) : [],
    panels: isShot ? buildPanels(rng, contentBox, accents, palette.glow) : [],
    bars: isShot ? [] : buildCodeBars(rng, contentBox, accents),
  }
}

function escapeAttr(value) {
  return String(value).replace(/"/g, '&quot;')
}

export function artworkToSvg(art) {
  const gradientId = `g-${art.paletteId}-${art.kind}`
  const blobs = art.blobs
    .map(
      (blob) =>
        `<circle cx="${blob.cx}" cy="${blob.cy}" r="${blob.r}" fill="${escapeAttr(blob.color)}" opacity="${blob.opacity.toFixed(3)}"/>`,
    )
    .join('')
  const rings = art.rings
    .map(
      (ring) =>
        `<circle cx="${ring.cx}" cy="${ring.cy}" r="${ring.r}" fill="none" stroke="${escapeAttr(ring.color)}" stroke-width="2" opacity="${ring.opacity.toFixed(3)}"/>`,
    )
    .join('')
  const grid = art.grid
    .map((line) =>
      line.type === 'v'
        ? `<line x1="${line.x}" y1="0" x2="${line.x}" y2="${art.height}"/>`
        : `<line x1="0" y1="${line.y}" x2="${art.width}" y2="${line.y}"/>`,
    )
    .join('')
  const chrome =
    art.chromeHeight > 0
      ? `<g>
        <rect x="0" y="0" width="${art.width}" height="${art.chromeHeight}" fill="#0b0e14" opacity="0.55"/>
        ${art.chromeDots
          .map(
            (color, index) =>
              `<circle cx="${28 + index * 22}" cy="${art.chromeHeight / 2}" r="7" fill="${escapeAttr(color)}" opacity="0.9"/>`,
          )
          .join('')}
        <rect x="${28 + art.chromeDots.length * 22 + 14}" y="${art.chromeHeight / 2 - 11}" width="${art.width * 0.28}" height="22" rx="11" fill="#ffffff" opacity="0.08"/>
      </g>`
      : ''
  const panels = art.panels
    .map(
      (panel) =>
        `<rect x="${Math.round(panel.x)}" y="${Math.round(panel.y)}" width="${Math.round(panel.w)}" height="${Math.round(panel.h)}" rx="${panel.r}" fill="${escapeAttr(panel.fill)}" fill-opacity="${panel.opacity.toFixed(3)}" stroke="${escapeAttr(panel.stroke)}" stroke-opacity="${panel.strokeOpacity.toFixed(3)}"/>`,
    )
    .join('')
  const bars = art.bars
    .map(
      (bar) =>
        `<rect x="${Math.round(bar.x)}" y="${Math.round(bar.y)}" width="${Math.round(bar.w)}" height="${Math.round(bar.h)}" rx="${Math.round(bar.h / 2)}" fill="${escapeAttr(bar.color)}" opacity="${bar.opacity.toFixed(3)}"/>`,
    )
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${art.width} ${art.height}" width="${art.width}" height="${art.height}" role="img"><defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${escapeAttr(art.from)}"/><stop offset="100%" stop-color="${escapeAttr(art.to)}"/></linearGradient></defs><rect width="${art.width}" height="${art.height}" fill="url(#${gradientId})"/><g stroke="#ffffff" stroke-width="1" opacity="${art.gridOpacity}">${grid}</g><g>${blobs}</g><g>${rings}</g>${chrome}${panels}${bars}</svg>`
}

export function artworkDataUri(projectId, kind = 'cover') {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(artworkToSvg(buildArtwork(projectId, kind)))}`
}
import { projectPath } from '../router'
import { artworkToSvg, buildArtwork } from './artwork'

export function projectUrl(projectId) {
  const { origin, pathname } = window.location
  return `${origin}${pathname}#${projectPath(projectId)}`
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const field = document.createElement('textarea')
    field.value = text
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.appendChild(field)
    field.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(field)
    return ok
  }
}

export async function shareLink({ title, text, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
      return 'shared'
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled'
    }
  }
  const copied = await copyText(url)
  return copied ? 'copied' : 'failed'
}

export function downloadArtwork(projectId, kind, filename) {
  const svg = artworkToSvg(buildArtwork(projectId, kind))
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const href = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(href)
}
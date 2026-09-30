const NUMBER_FORMAT = new Intl.NumberFormat('en-US')
const COMPACT_FORMAT = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

export function formatCount(value) {
  return NUMBER_FORMAT.format(value ?? 0)
}

export function formatCompact(value) {
  const count = value ?? 0
  if (count < 1000) return String(count)
  return COMPACT_FORMAT.format(count)
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : (plural ?? `${singular}s`)
}

export function initialsOf(name) {
  const parts = String(name || '?')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const RELATIVE_STEPS = [
  { limit: 60_000, divisor: 1000, unit: 'second' },
  { limit: 3_600_000, divisor: 60_000, unit: 'minute' },
  { limit: 86_400_000, divisor: 3_600_000, unit: 'hour' },
  { limit: 2_592_000_000, divisor: 86_400_000, unit: 'day' },
  { limit: 31_536_000_000, divisor: 2_592_000_000, unit: 'month' },
]

const RELATIVE_FORMAT = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function formatRelativeTime(isoDate) {
  const timestamp = new Date(isoDate).getTime()
  if (Number.isNaN(timestamp)) return ''
  const diff = timestamp - Date.now()
  const magnitude = Math.abs(diff)
  if (magnitude < 45_000) return 'just now'
  for (const step of RELATIVE_STEPS) {
    if (magnitude < step.limit) {
      return RELATIVE_FORMAT.format(Math.round(diff / step.divisor), step.unit)
    }
  }
  const years = Math.round(diff / 31_536_000_000)
  return RELATIVE_FORMAT.format(years, 'year')
}

export function formatDate(isoDate) {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

export function formatMonthRange(startIso, endIso) {
  const start = formatDate(startIso)
  const end = endIso ? formatDate(endIso) : 'Present'
  return `${start} – ${end}`
}

export function formatDuration(startIso, endIso) {
  const start = new Date(startIso)
  const end = endIso ? new Date(endIso) : new Date()
  const months = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30.44)))
  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts = []
  if (years > 0) parts.push(`${years} ${pluralize(years, 'yr')}`)
  if (rest > 0) parts.push(`${rest} ${pluralize(rest, 'mo')}`)
  return parts.join(' ') || '1 mo'
}
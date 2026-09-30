import { useMemo } from 'react'
import { buildArtwork } from '../lib/artwork'

export default function ProjectArt({ projectId, kind = 'cover', className = '', label }) {
  const art = useMemo(() => buildArtwork(projectId, kind), [projectId, kind])
  const gradientId = `art-${art.paletteId}-${projectId}-${kind}`
  const chromeHeight = art.chromeHeight

  return (
    <div className={`project-art project-art--${kind} ${className}`.trim()} data-project-id={projectId}>
      <svg viewBox={`0 0 ${art.width} ${art.height}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${kind} for project ${projectId}`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={art.from} />
            <stop offset="100%" stopColor={art.to} />
          </linearGradient>
        </defs>
        <rect width={art.width} height={art.height} fill={`url(#${gradientId})`} />
        <g stroke="#ffffff" strokeWidth="1" opacity={art.gridOpacity}>
          {art.grid.map((line, index) =>
            line.type === 'v' ? (
              <line key={`v${index}`} x1={line.x} y1="0" x2={line.x} y2={art.height} />
            ) : (
              <line key={`h${index}`} x1="0" y1={line.y} x2={art.width} y2={line.y} />
            ),
          )}
        </g>
        {art.blobs.map((blob, index) => (
          <circle
            key={`b${index}`}
            cx={blob.cx}
            cy={blob.cy}
            r={blob.r}
            fill={blob.color}
            opacity={blob.opacity}
          />
        ))}
        {art.rings.map((ring, index) => (
          <circle
            key={`r${index}`}
            cx={ring.cx}
            cy={ring.cy}
            r={ring.r}
            fill="none"
            stroke={ring.color}
            strokeWidth="2"
            opacity={ring.opacity}
          />
        ))}
        {chromeHeight > 0 ? (
          <g>
            <rect width={art.width} height={chromeHeight} fill="#0b0e14" opacity="0.55" />
            {art.chromeDots.map((color, index) => (
              <circle key={`d${index}`} cx={28 + index * 22} cy={chromeHeight / 2} r="7" fill={color} opacity="0.9" />
            ))}
            <rect
              x={28 + art.chromeDots.length * 22 + 14}
              y={chromeHeight / 2 - 11}
              width={art.width * 0.28}
              height="22"
              rx="11"
              fill="#ffffff"
              opacity="0.08"
            />
          </g>
        ) : null}
        {art.panels.map((panel, index) => (
          <rect
            key={`p${index}`}
            x={Math.round(panel.x)}
            y={Math.round(panel.y)}
            width={Math.round(panel.w)}
            height={Math.round(panel.h)}
            rx={panel.r}
            fill={panel.fill}
            fillOpacity={panel.opacity}
            stroke={panel.stroke}
            strokeOpacity={panel.strokeOpacity}
          />
        ))}
        {art.bars.map((bar, index) => (
          <rect
            key={`bar${index}`}
            x={Math.round(bar.x)}
            y={Math.round(bar.y)}
            width={Math.round(bar.w)}
            height={Math.round(bar.h)}
            rx={Math.max(2, Math.round(bar.h / 2))}
            fill={bar.color}
            opacity={bar.opacity}
          />
        ))}
      </svg>
      {label ? <span className="project-art__label">{label}</span> : null}
    </div>
  )
}
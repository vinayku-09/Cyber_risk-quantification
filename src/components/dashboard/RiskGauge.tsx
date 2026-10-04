import { useMemo } from 'react'
import { colors } from '../../constants/theme'
import { riskBands, riskScore } from '../../data/mockData'
import { clamp } from '../../utils'

const WIDTH = 340
const VIEW_HEIGHT = 164
const STROKE = 14
const RADIUS = 123
const CENTER_X = WIDTH / 2
const CENTER_Y = 148
const LABEL_RADIUS = RADIUS + 19

/** Sweeps 0 at the left, 100 at the right (0deg = left, 90deg = top). */
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx - r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

function arcPath(startPct: number, endPct: number): string {
  const startAngle = 180 * startPct
  const endAngle = 180 * endPct
  const start = polar(CENTER_X, CENTER_Y, RADIUS, startAngle)
  const end = polar(CENTER_X, CENTER_Y, RADIUS, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
}

const segmentGap = 1.4 / 100

export function RiskGauge() {
  const score = clamp(riskScore.score, 0, 100)

  const segments = useMemo(
    () =>
      riskBands.map((band, index) => ({
        ...band,
        d: arcPath(index * 20 + segmentGap, (index + 1) * 20 - segmentGap),
      })),
    [],
  )

  const activeIndex = Math.min(riskBands.length - 1, Math.floor(score / 20))
  const activeBand = riskBands[activeIndex] ?? riskBands[0]
  const activeColor = activeBand?.color ?? colors.amber

  const needleAngle = 180 * (score / 100)
  const needleLength = RADIUS - 24
  const marker = polar(CENTER_X, CENTER_Y, RADIUS, needleAngle)

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${WIDTH} ${VIEW_HEIGHT}`}
        className="h-[150px] w-full max-w-[320px]"
        role="img"
        aria-label={`Enterprise risk score ${score} out of 100, band ${activeBand?.label ?? ''}`}
      >
        {segments.map((segment) => (
          <path
            key={segment.label}
            d={segment.d}
            fill="none"
            stroke={segment.color}
            strokeOpacity={0.16}
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
        ))}

        {/* filled portion up to the current score */}
        {segments.map((segment, index) => {
          if (index * 20 > score) return null
          const from = index * 20 + segmentGap
          const to = clamp(score, 0, 100)
          const partial = to > index * 20
          return (
            <path
              key={`fill-${segment.label}`}
              d={partial ? arcPath(from, to) : segment.d}
              fill="none"
              stroke={segment.color}
              strokeWidth={STROKE}
              strokeLinecap="round"
            />
          )
        })}

        {/* tapered pointer */}
        <g transform={`rotate(${needleAngle - 90} ${CENTER_X} ${CENTER_Y})`}>
          <path
            d={`M ${CENTER_X} ${CENTER_Y - needleLength} L ${CENTER_X + 4} ${CENTER_Y} L ${CENTER_X} ${CENTER_Y - 6} L ${CENTER_X - 4} ${CENTER_Y} Z`}
            fill={activeColor}
          />
        </g>

        {/* score marker riding the arc */}
        <circle cx={marker.x} cy={marker.y} r={4.5} fill={activeColor} stroke={colors.card} strokeWidth={1.5} />
        <circle cx={CENTER_X} cy={CENTER_Y} r={4.5} fill={colors.card} stroke={activeColor} strokeWidth={2} />

        <text
          x={CENTER_X}
          y={CENTER_Y - 30}
          textAnchor="middle"
          className="fill-ink"
          style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-0.03em' }}
        >
          {score}
        </text>
        <text x={CENTER_X} y={CENTER_Y - 12} textAnchor="middle" className="fill-ink-faint" style={{ fontSize: 10 }}>
          / 100 RISK SCORE
        </text>

        {riskBands.map((band, index) => {
          const mid = (index * 20 + 10) / 100
          const anchor = polar(CENTER_X, CENTER_Y, LABEL_RADIUS, 180 * mid)
          return (
            <text
              key={`${band.label}-label`}
              x={anchor.x}
              y={anchor.y}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: 8.5, fontWeight: 500, letterSpacing: '0.06em' }}
              className={index === activeIndex ? 'fill-ink' : 'fill-ink-faint'}
            >
              {band.label.toUpperCase()}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

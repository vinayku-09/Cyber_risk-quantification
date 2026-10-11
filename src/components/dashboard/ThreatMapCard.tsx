import { useMemo, useState } from 'react'
import { Globe2, MapPin } from 'lucide-react'
import clsx from 'clsx'
import { Badge, Card } from '../ui'
import { mapMarkers, mapTotals, timeFilters } from '../../data/mockData'
import { useCurrency } from '../../context/CurrencyContext'
import type { MapMarker, Severity } from '../../types'

/* ---------------------------------------------------------------- */
/* Dot-matrix world (elliptical land masks in lon/lat space)         */
/* ---------------------------------------------------------------- */

const VIEW = { minLon: -170, maxLon: 190, minLat: 58, maxLat: -48 }

const LAND: Array<{ lon: number; lat: number; rx: number; ry: number }> = [
  { lon: -100, lat: 45, rx: 33, ry: 19 },
  { lon: -112, lat: 63, rx: 16, ry: 8 },
  { lon: -42, lat: 72, rx: 12, ry: 7 },
  { lon: -60, lat: -15, rx: 16, ry: 26 },
  { lon: 15, lat: 52, rx: 23, ry: 10 },
  { lon: 18, lat: 5, rx: 22, ry: 26 },
  { lon: 85, lat: 45, rx: 56, ry: 23 },
  { lon: 78, lat: 20, rx: 10, ry: 9 },
  { lon: 110, lat: 12, rx: 14, ry: 8 },
  { lon: 120, lat: -3, rx: 16, ry: 4 },
  { lon: 134, lat: -25, rx: 16, ry: 10 },
  { lon: 138, lat: 38, rx: 4, ry: 6 },
  { lon: -3, lat: 54, rx: 3.5, ry: 4 },
  { lon: 47, lat: -19, rx: 2.5, ry: 5 },
]

const STEP_LON = 4.2
const STEP_LAT = 4.6

function projectX(lon: number): number {
  return ((lon - VIEW.minLon) / (VIEW.maxLon - VIEW.minLon)) * 100
}

function projectY(lat: number): number {
  return ((VIEW.minLat - lat) / (VIEW.minLat - VIEW.maxLat)) * 100
}

const dots: Array<{ x: number; y: number }> = (() => {
  const result: Array<{ x: number; y: number }> = []
  for (let lon = VIEW.minLon; lon <= VIEW.maxLon; lon += STEP_LON) {
    for (let lat = VIEW.maxLat; lat <= VIEW.minLat; lat += STEP_LAT) {
      const onLand = LAND.some((shape) => {
        const dx = (lon - shape.lon) / shape.rx
        const dy = (lat - shape.lat) / shape.ry
        return dx * dx + dy * dy <= 1
      })
      if (onLand) result.push({ x: projectX(lon), y: projectY(lat) })
    }
  }
  return result
})()

/* ---------------------------------------------------------------- */

const severityColor: Record<Severity, string> = {
  critical: '#F0616D',
  high: '#F5B942',
  medium: '#5B7CFA',
  low: '#34D399',
}

const severityRadius: Record<Severity, number> = {
  critical: 5.5,
  high: 4.5,
  medium: 3.5,
  low: 3,
}

export function ThreatMapCard() {
  const { format } = useCurrency()
  const [filter, setFilter] = useState('ALL')
  const [activeId, setActiveId] = useState<string>(mapMarkers[0]?.id ?? '')

  const active = useMemo(
    () => mapMarkers.find((marker) => marker.id === activeId) ?? null,
    [activeId],
  )
  const totals = mapTotals[filter] ?? { events: 0, value: 0 }

  return (
    <Card
      className="h-full"
      title="Global Threat Surface"
      subtitle="Detected risk by geography"
      icon={<Globe2 className="h-4 w-4" aria-hidden="true" />}
      action={
        <div className="flex items-center gap-1 rounded-lg border border-line bg-white/[0.02] p-0.5">
          {timeFilters.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              aria-pressed={filter === item.key}
              className={clsx(
                'rounded-md px-2 py-1 text-2xs font-medium transition-colors duration-150',
                filter === item.key
                  ? 'bg-blue/20 text-blue'
                  : 'text-ink-faint hover:bg-white/5 hover:text-ink-soft',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pb-2.5 text-2xs text-ink-soft">
        <span className="tabular-nums">
          <span className="font-semibold text-ink">{totals.events}</span> events
        </span>
        <span className="tabular-nums">
          <span className="font-semibold text-ink">{format(totals.value)}</span> exposure
        </span>
        <span className="flex items-center gap-2.5">
          {(['critical', 'high', 'medium', 'low'] as const).map((severity) => (
            <span key={severity} className="flex items-center gap-1 capitalize text-ink-faint">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: severityColor[severity] }}
                aria-hidden="true"
              />
              {severity}
            </span>
          ))}
        </span>
      </div>

      <div className="relative w-full overflow-hidden rounded-[12px] border border-line bg-[#0A0C0F]">
        <svg viewBox="0 0 100 62" className="h-[190px] w-full" preserveAspectRatio="none" aria-hidden="true">
          {dots.map((dot, index) => (
            <circle
              key={index}
              cx={dot.x}
              cy={dot.y * 0.62}
              r={0.34}
              fill="#FFFFFF"
              fillOpacity={0.13}
            />
          ))}
        </svg>

        {/* marker layer keeps aspect ratio so pins stay circular */}
        <div className="absolute inset-0">
          {mapMarkers.map((marker) => (
            <Marker
              key={marker.id}
              marker={marker}
              active={marker.id === activeId}
              onHover={() => setActiveId(marker.id)}
            />
          ))}
        </div>
      </div>

      <div className="mt-2.5 flex min-h-[46px] items-center justify-between gap-3 rounded-[10px] border border-line bg-white/[0.02] px-3 py-2">
        {active ? (
          <>
            <div className="flex min-w-0 items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: severityColor[active.severity] }} aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-[11.5px] font-medium text-ink">{active.label}</p>
                <p className="truncate text-2xs capitalize text-ink-faint">
                  {active.severity} · {active.events} events
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge tone={active.severity === 'critical' || active.severity === 'high' ? 'red' : 'blue'}>
                {format(active.value)}
              </Badge>
            </div>
          </>
        ) : (
          <p className="text-2xs text-ink-faint">Hover a region to inspect exposure</p>
        )}
      </div>
    </Card>
  )
}

function Marker({
  marker,
  active,
  onHover,
}: {
  marker: MapMarker
  active: boolean
  onHover: () => void
}) {
  const { format } = useCurrency()
  const color = severityColor[marker.severity]
  const left = projectX(marker.lon)
  const top = projectY(marker.lat) * 0.62

  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onFocus={onHover}
      aria-label={`${marker.label} — ${marker.events} events, ${format(marker.value)}`}
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer p-1.5"
      style={{ left: `${left}%`, top: `${top}%` }}
    >
      <span className="relative flex items-center justify-center">
        <span
          className={clsx(
            'absolute rounded-full transition-all duration-200',
            active ? 'h-9 w-9 opacity-25' : 'h-6 w-6 opacity-0',
          )}
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        <span
          className={clsx(
            'rounded-full ring-2 transition-all duration-200',
            active ? 'scale-125' : 'scale-100',
          )}
          style={{
            width: severityRadius[marker.severity] * 2,
            height: severityRadius[marker.severity] * 2,
            backgroundColor: color,
            boxShadow: `0 0 0 2px rgba(11,13,16,0.85)${active ? `, 0 0 14px ${color}` : ''}`,
          }}
          aria-hidden="true"
        />
      </span>
    </button>
  )
}

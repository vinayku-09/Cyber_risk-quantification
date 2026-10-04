import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import { BrainCircuit, Info } from 'lucide-react'
import type { ComponentProps } from 'react'
import { Badge, Card } from '../ui'
import { chart, colors } from '../../constants/theme'
import { forecastInsight, forecastSeries } from '../../data/mockData'
import type { ForecastPoint } from '../../types'

const AXIS_TICK = { fill: colors.textSecondary, fontSize: 10 }

/**
 * Recharts supports `[min, max]` tuple keys for range areas at runtime, but its
 * `dataKey` type only models scalar keys, so this narrows the tuple through `unknown`.
 */
type AreaDataKey = ComponentProps<typeof Area>['dataKey']
const BAND_KEY = ['lower', 'upper'] as unknown as AreaDataKey

function isForecastPoint(value: unknown): value is ForecastPoint {
  return (
    typeof value === 'object' &&
    value !== null &&
    'date' in value &&
    'actual' in value &&
    'predicted' in value &&
    'confidence' in value
  )
}

function ForecastTooltip({ active, payload }: TooltipContentProps) {
  const raw = payload?.[0]?.payload
  const point = isForecastPoint(raw) ? raw : null
  if (!active || !point) return null

  const deviation =
    point.actual !== null && point.predicted !== null
      ? (point.predicted - point.actual) / point.actual * 100
      : null

  return (
    <div
      className="min-w-[186px] rounded-[10px] border p-2.5 shadow-xl"
      style={{ backgroundColor: chart.tooltipBg, borderColor: chart.tooltipBorder }}
    >
      <p className="mb-2 text-[11px] font-semibold text-ink">{point.date}</p>
      <dl className="space-y-1 text-[11px]">
        <Row label="Actual" value={point.actual === null ? '—' : String(point.actual)} dot={colors.blue} />
        <Row label="Predicted" value={point.predicted === null ? '—' : String(point.predicted)} dot={colors.green} />
        <Row
          label="Deviation"
          value={deviation === null ? '—' : `${deviation >= 0 ? '+' : ''}${deviation.toFixed(1)}%`}
          dot={deviation === null ? colors.textFaint : deviation > 5 ? colors.amber : colors.green}
        />
        <Row label="Confidence" value={`${point.confidence}%`} dot={colors.textFaint} />
      </dl>
    </div>
  )
}

function Row({ label, value, dot }: { label: string; value: string; dot: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-1.5 text-ink-soft">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} aria-hidden="true" />
        {label}
      </dt>
      <dd className="font-medium tabular-nums text-ink">{value}</dd>
    </div>
  )
}

export function ForecastCard() {
  return (
    <Card
      className="h-full"
      title="AI Risk Forecast"
      subtitle="Residual risk index · 12-month projection"
      icon={<BrainCircuit className="h-4 w-4" aria-hidden="true" />}
      action={
        <div className="flex items-center gap-2.5">
          <Legend color={colors.blue} label="Actual" dashed={false} />
          <Legend color={colors.green} label="Predicted" dashed />
          <Badge tone="blue">88% model conf.</Badge>
        </div>
      }
    >
      <div className="h-[236px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={forecastSeries} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.green} stopOpacity={0.20} />
                <stop offset="100%" stopColor={colors.green} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={chart.grid} vertical={false} />
            <XAxis
              dataKey="date"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={{ stroke: chart.grid }}
              interval="preserveStartEnd"
              minTickGap={12}
            />
            <YAxis
              domain={[30, 90]}
              ticks={[30, 40, 50, 60, 70, 80, 90]}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip
              content={ForecastTooltip}
              cursor={{ stroke: 'rgba(255,255,255,0.14)', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Area
              type="monotone"
              dataKey={BAND_KEY}
              stroke="none"
              fill="url(#confidenceBand)"
              isAnimationActive={false}
              activeDot={false}
              legendType="none"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke={colors.blue}
              strokeWidth={2}
              dot={{ r: 2.5, fill: colors.blue, strokeWidth: 0 }}
              activeDot={{ r: 4, fill: colors.blue, stroke: colors.card, strokeWidth: 2 }}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke={colors.green}
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 2.5, fill: colors.green, strokeWidth: 0 }}
              activeDot={{ r: 4, fill: colors.green, stroke: colors.card, strokeWidth: 2 }}
              connectNulls
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 rounded-[10px] border border-blue/20 bg-blue/[0.06] p-3">
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue/20 text-blue">
            <Info className="h-2.5 w-2.5" aria-hidden="true" />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue">{forecastInsight.headline}</p>
        </div>
        <p className="text-[11.5px] leading-relaxed text-ink-soft">{forecastInsight.body}</p>
      </div>
    </Card>
  )
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed: boolean }) {
  return (
    <span className="hidden items-center gap-1.5 text-2xs text-ink-soft sm:inline-flex">
      <svg width="14" height="8" aria-hidden="true">
        <line
          x1="0"
          y1="4"
          x2="14"
          y2="4"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={dashed ? '4 3' : undefined}
          strokeLinecap="round"
        />
      </svg>
      {label}
    </span>
  )
}

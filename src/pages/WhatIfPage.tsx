import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, RotateCcw, Scale, TrendingDown } from 'lucide-react'
import { Badge, Button, Card, ProgressBar } from '../components/ui'
import { riskScore, whatIfLevers } from '../data/mockData'
import { accentHex, chart, colors } from '../constants/theme'
import { clamp, formatINR } from '../utils'

const MAX_REDUCTION = 0.92

type Intensity = Record<string, number>

export default function WhatIfPage() {
  const [intensity, setIntensity] = useState<Intensity>(() =>
    Object.fromEntries(whatIfLevers.map((lever) => [lever.id, 0])),
  )

  const model = useMemo(() => {
    const ealReduction = clamp(
      whatIfLevers.reduce((sum, lever) => sum + lever.ealFactor * (intensity[lever.id] ?? 0) / 100, 0),
      0,
      MAX_REDUCTION,
    )
    const varReduction = clamp(
      whatIfLevers.reduce((sum, lever) => sum + lever.varFactor * (intensity[lever.id] ?? 0) / 100, 0),
      0,
      MAX_REDUCTION,
    )
    const investment = whatIfLevers.reduce(
      (sum, lever) => sum + lever.cost * (intensity[lever.id] ?? 0) / 100,
      0,
    )

    const ealAfter = riskScore.expectedAnnualLoss * (1 - ealReduction)
    const varAfter = riskScore.valueAtRisk95 * (1 - varReduction)
    const ealSaved = riskScore.expectedAnnualLoss - ealAfter
    const scoreAfter = clamp(riskScore.score - ealReduction * 38, 4, 100)
    const rosi = investment > 0 ? ((ealSaved - investment) / investment) * 100 : 0

    return { ealReduction, varReduction, investment, ealAfter, varAfter, ealSaved, scoreAfter, rosi }
  }, [intensity])

  const comparison = [
    { name: 'EAL / yr', before: riskScore.expectedAnnualLoss / 10_000_000, after: model.ealAfter / 10_000_000 },
    { name: 'VaR 95%', before: riskScore.valueAtRisk95 / 10_000_000, after: model.varAfter / 10_000_000 },
  ]

  const setLever = (id: string, value: number) => setIntensity((prev) => ({ ...prev, [id]: value }))
  const setAll = (value: number) =>
    setIntensity(Object.fromEntries(whatIfLevers.map((lever) => [lever.id, value])))

  const activeCount = whatIfLevers.filter((lever) => (intensity[lever.id] ?? 0) > 0).length

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-12 gap-3.5">
        <div className="col-span-12 lg:col-span-4">
          <DeltaCard
            label="Expected Annual Loss"
            before={riskScore.expectedAnnualLoss}
            after={model.ealAfter}
            saved={model.ealSaved}
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <DeltaCard
            label="Value at Risk 95%"
            before={riskScore.valueAtRisk95}
            after={model.varAfter}
            saved={riskScore.valueAtRisk95 - model.varAfter}
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <Card
            title="Enterprise Risk Score"
            subtitle="Recalculated from residual exposure"
            action={
              <Badge tone={model.scoreAfter < riskScore.score ? 'green' : 'neutral'}>
                {model.scoreAfter < riskScore.score ? (
                  <>
                    <TrendingDown className="h-3 w-3" aria-hidden="true" />
                    {Math.abs(riskScore.score - model.scoreAfter).toFixed(1)} pts
                  </>
                ) : (
                  'no change'
                )}
              </Badge>
            }
          >
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[30px] font-semibold leading-none tracking-tight text-ink tabular-nums">
                  {model.scoreAfter.toFixed(1)}
                </p>
                <p className="mt-1 text-2xs text-ink-faint">was {riskScore.score}.0</p>
              </div>
              <div className="text-right">
                <p className="text-2xs text-ink-soft">Blended spend</p>
                <p className="text-[15px] font-semibold text-ink tabular-nums">{formatINR(model.investment)}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-2xs text-ink-faint">Before</span>
                <ProgressBar value={riskScore.score} color={colors.red} label="Risk score before" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-2xs text-ink-faint">After</span>
                <ProgressBar value={model.scoreAfter} color={colors.green} label="Risk score after" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <div className="col-span-12 lg:col-span-7">
          <Card
            title="Control Levers"
            subtitle={`${activeCount} of ${whatIfLevers.length} controls active`}
            icon={<Scale className="h-4 w-4" aria-hidden="true" />}
            action={
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="ghost" onClick={() => setAll(100)}>
                  Full
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setAll(50)}>
                  Half
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<RotateCcw className="h-3 w-3" aria-hidden="true" />}
                  onClick={() => setAll(0)}
                >
                  Reset
                </Button>
              </div>
            }
          >
            <ul className="space-y-3">
              {whatIfLevers.map((lever) => {
                const value = intensity[lever.id] ?? 0
                const tone = value === 0 ? 'red' : value < 50 ? 'amber' : 'green'
                return (
                  <li key={lever.id} className="rounded-[10px] border border-line px-3 py-2.5 transition-colors hover:border-white/10">
                    <div className="mb-1.5 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-ink">{lever.label}</p>
                        <p className="truncate text-2xs text-ink-faint">{lever.description}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-2xs tabular-nums text-ink-soft">{formatINR(lever.cost)}</span>
                        <Badge tone={tone} className="w-11 justify-center tabular-nums">
                          {value}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={value}
                        aria-label={`${lever.label} coverage`}
                        onChange={(event) => setLever(lever.id, Number(event.target.value))}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-blue"
                      />
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: accentHex[tone] }}
                        aria-hidden="true"
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
              <p className="text-2xs text-ink-faint">
                Return on security investment{' '}
                <span className={model.rosi >= 0 ? 'font-semibold text-green' : 'font-semibold text-red'}>
                  {model.rosi.toFixed(0)}%
                </span>
              </p>
              <p className="text-2xs text-ink-faint">
                EAL reduction <span className="font-semibold text-ink-soft">{(model.ealReduction * 100).toFixed(0)}%</span>
              </p>
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <Card
            className="h-full"
            title="Before / After"
            subtitle="Modelled loss, ₹ crore"
            icon={<TrendingDown className="h-4 w-4" aria-hidden="true" />}
            action={
              <Badge tone={model.ealSaved > 0 ? 'green' : 'neutral'}>
                {formatINR(model.ealSaved)} saved /yr
              </Badge>
            }
          >
            <div className="h-[248px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparison} margin={{ top: 8, right: 6, left: -16, bottom: 0 }} barGap={6}>
                  <CartesianGrid stroke={chart.grid} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: chart.axis, fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: chart.grid }}
                  />
                  <YAxis
                    tick={{ fill: chart.axis, fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={42}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div
                          className="rounded-[10px] border px-2.5 py-2 text-[11px] shadow-xl"
                          style={{ backgroundColor: chart.tooltipBg, borderColor: chart.tooltipBorder }}
                        >
                          <p className="mb-1 font-semibold text-ink">{label}</p>
                          {payload.map((item) => (
                            <p key={String(item.dataKey)} className="flex items-center gap-2 text-ink-soft">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: String(item.color) }}
                                aria-hidden="true"
                              />
                              <span className="capitalize">{String(item.dataKey)}</span>
                              <span className="ml-auto font-medium tabular-nums text-ink">
                                {formatINR((typeof item.value === 'number' ? item.value : 0) * 10_000_000)}
                              </span>
                            </p>
                          ))}
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="before" radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false}>
                    {comparison.map((entry) => (
                      <Cell key={entry.name} fill={colors.red} />
                    ))}
                  </Bar>
                  <Bar dataKey="after" radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false}>
                    {comparison.map((entry) => (
                      <Cell key={entry.name} fill={colors.green} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-1.5 border-t border-line pt-3">
              <div className="flex items-center justify-between text-2xs">
                <span className="text-ink-soft">VaR reduction</span>
                <span className="font-medium tabular-nums text-green">{(model.varReduction * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between text-2xs">
                <span className="text-ink-soft">Blended investment</span>
                <span className="font-medium tabular-nums text-ink">{formatINR(model.investment)}</span>
              </div>
              <div className="flex items-center justify-between text-2xs">
                <span className="text-ink-soft">Payback</span>
                <span className="font-medium tabular-nums text-ink">4.2 months</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DeltaCard({
  label,
  before,
  after,
  saved,
}: {
  label: string
  before: number
  after: number
  saved: number
}) {
  const deltaPct = before > 0 ? ((after - before) / before) * 100 : 0

  return (
    <Card
      className="h-full"
      title={label}
      subtitle="Modelled from selected controls"
      action={
        <Badge tone={saved > 0 ? 'green' : 'neutral'}>
          {deltaPct > 0 ? '+' : ''}
          {deltaPct.toFixed(1)}%
        </Badge>
      }
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-2xs text-ink-soft">Before</p>
          <p className="text-[15px] font-medium tabular-nums text-ink-soft line-through decoration-red/50">
            {formatINR(before)}
          </p>
        </div>
        <ArrowRight className="mb-1 h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
        <div className="text-right">
          <p className="text-2xs text-ink-soft">After</p>
          <p className="text-[22px] font-semibold leading-tight tracking-tight text-ink tabular-nums">
            {formatINR(after)}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between text-2xs">
          <span className="text-ink-faint">Risk eliminated</span>
          <span className="font-medium tabular-nums text-green">{formatINR(saved)}</span>
        </div>
        <ProgressBar value={before > 0 ? (saved / before) * 100 : 0} color={colors.green} label={`${label} reduction`} />
      </div>
    </Card>
  )
}

import { useMemo, useState } from 'react'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Check, Target, TrendingUp, Wallet } from 'lucide-react'
import clsx from 'clsx'
import { Badge, Card, ProgressBar } from '../components/ui'
import { optimizerBudget, recommendedControls } from '../data/mockData'
import { chart, colors } from '../constants/theme'
import { useCurrency } from '../context/CurrencyContext'
import type { RecommendedControl } from '../types'

const rosiOf = (control: RecommendedControl): number =>
  control.cost > 0 ? ((control.riskReduction - control.cost) / control.cost) * 100 : 0

const tierTone = {
  Essential: 'red',
  Advanced: 'amber',
  Transformational: 'blue',
} as const

type Ranked = RecommendedControl & { rosi: number }
type Enriched = Ranked & { selected: boolean }

export default function OptimizerPage() {
  const { format, meta, chart: chartScale } = useCurrency()
  const [budget, setBudget] = useState(optimizerBudget.initial)

  const ranked = useMemo<Ranked[]>(
    () =>
      recommendedControls
        .map((control) => ({ ...control, rosi: rosiOf(control) }))
        .sort((a, b) => b.rosi - a.rosi),
    [],
  )

  const { selected, selectedCost, selectedReduction, selectedRosi, chartData } = useMemo(() => {
    const picked: Enriched[] = []
    let spent = 0
    for (const control of ranked) {
      if (control.rosi <= 0) continue
      if (spent + control.cost <= budget) {
        picked.push({ ...control, selected: true })
        spent += control.cost
      }
    }

    let runningCost = 0
    let runningReduction = 0
    const data = ranked.map((control) => {
      runningCost += control.cost
      runningReduction += control.riskReduction
      return {
        name: control.name.split(' ').slice(0, 2).join(' '),
        cost: control.cost / chartScale.divisor,
        reduction: control.riskReduction / chartScale.divisor,
        cumulativeCost: runningCost / chartScale.divisor,
        cumulativeReduction: runningReduction / chartScale.divisor,
        inPlan: picked.some((item) => item.id === control.id),
      }
    })

    const totalReduction = picked.reduce((sum, control) => sum + control.riskReduction, 0)
    return {
      selected: picked,
      selectedCost: spent,
      selectedReduction: totalReduction,
      selectedRosi: spent > 0 ? ((totalReduction - spent) / spent) * 100 : 0,
      chartData: data,
    }
  }, [budget, ranked, chartScale.divisor])

  const budgetPct = ((budget - optimizerBudget.min) / (optimizerBudget.max - optimizerBudget.min)) * 100
  const selectedIds = new Set(selected.map((control) => control.id))

  const summary = [
    { label: 'Annual budget', value: format(budget), tone: 'blue' as const, note: 'FY27 defence envelope' },
    { label: 'Allocated', value: format(selectedCost), tone: 'green' as const, note: `${pickedLabel(selected.length)}` },
    { label: 'EAL avoided', value: format(selectedReduction), tone: 'amber' as const, note: 'per year, modelled' },
    { label: 'Blended ROSI', value: `${selectedRosi.toFixed(0)}%`, tone: 'green' as const, note: 'risk reduction vs spend' },
  ]

  return (
    <div className="space-y-3.5">
      <div className="card-surface px-4 py-3.5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-ink-soft" aria-hidden="true" />
            <p className="text-[13px] font-semibold text-ink">Available budget</p>
            <Badge tone="blue">{format(budget)}</Badge>
          </div>
          <p className="text-2xs text-ink-faint">
            Greedy ROSI-ranked selection · unspent budget{' '}
            <span className="tabular-nums text-ink-soft">{format(Math.max(0, budget - selectedCost))}</span>
          </p>
        </div>
        <input
          type="range"
          min={optimizerBudget.min}
          max={optimizerBudget.max}
          step={optimizerBudget.step}
          value={budget}
          aria-label="Annual security budget"
          onChange={(event) => setBudget(Number(event.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-blue"
        />
        <div className="mt-2 flex items-center justify-between text-2xs text-ink-faint">
          <span>{format(optimizerBudget.min)}</span>
          <ProgressBar
            value={budgetPct}
            color={colors.blue}
            className="mx-3 max-w-[220px]"
            label="Budget utilisation"
          />
          <span>{format(optimizerBudget.max)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="card-surface px-3.5 py-3">
            <p className="text-2xs text-ink-soft">{item.label}</p>
            <p className="mt-1 text-[17px] font-semibold tracking-tight text-ink tabular-nums">{item.value}</p>
            <p className="mt-0.5 text-[10px] text-ink-faint">{item.note}</p>
            <span
              className={clsx(
                'mt-2 block h-[2px] w-8 rounded-full',
                item.tone === 'blue' && 'bg-blue',
                item.tone === 'green' && 'bg-green',
                item.tone === 'amber' && 'bg-amber',
              )}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <div className="col-span-12 xl:col-span-7">
          <Card
            className="h-full"
            title="Investment vs Risk Reduction"
            subtitle={`Per control, ROSI-ranked · ${meta.symbol} ${chartScale.label}`}
            icon={<TrendingUp className="h-4 w-4" aria-hidden="true" />}
            action={
              <div className="flex items-center gap-3 text-2xs text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-[2px] bg-blue" aria-hidden="true" /> Investment
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-[2px] bg-green" aria-hidden="true" /> Risk reduction
                </span>
              </div>
            }
          >
            <div className="h-[272px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke={chart.grid} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: chart.axis, fontSize: 9 }}
                    tickLine={false}
                    axisLine={{ stroke: chart.grid }}
                    interval={0}
                    angle={-24}
                    textAnchor="end"
                    height={52}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: chart.axis, fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const row = payload[0]?.payload as (typeof chartData)[number] | undefined
                      if (!row) return null
                      return (
                        <div
                          className="min-w-[176px] rounded-[10px] border px-2.5 py-2 text-[11px] shadow-xl"
                          style={{ backgroundColor: chart.tooltipBg, borderColor: chart.tooltipBorder }}
                        >
                          <p className="mb-1.5 font-semibold text-ink">{row.name}</p>
                          <dl className="space-y-1">
                            <MetricRow label="Investment" value={format(row.cost * chartScale.divisor)} />
                            <MetricRow label="Risk reduction" value={format(row.reduction * chartScale.divisor)} />
                            <MetricRow label="Cumulative" value={format(row.cumulativeCost * chartScale.divisor)} />
                          </dl>
                          <p className="mt-1.5 text-2xs text-ink-faint">
                            {row.inPlan ? 'Included in recommended plan' : 'Below budget line — deferred'}
                          </p>
                        </div>
                      )
                    }}
                  />
                  <Bar yAxisId="left" dataKey="cost" radius={[4, 4, 0, 0]} maxBarSize={30} isAnimationActive={false}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.inPlan ? colors.blue : 'rgba(91,124,250,0.32)'} />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulativeReduction"
                    stroke={colors.green}
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: colors.green, strokeWidth: 0 }}
                    isAnimationActive={false}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    y={budget / chartScale.divisor}
                    stroke={colors.amber}
                    strokeDasharray="4 4"
                    label={{ value: 'budget', position: 'right', fill: chart.axis, fontSize: 9 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="col-span-12 xl:col-span-5">
          <Card
            className="h-full"
            title="Recommended Controls"
            subtitle={`${selected.length} controls within ${format(budget)}`}
            icon={<Target className="h-4 w-4" aria-hidden="true" />}
            action={<Badge tone="green" dot>ROSI optimised</Badge>}
          >
            <ul className="space-y-2">
              {ranked.map((control) => (
                <li
                  key={control.id}
                  className={clsx(
                    'flex items-center gap-3 rounded-[10px] border px-3 py-2.5 transition-colors',
                    selectedIds.has(control.id)
                      ? 'border-green/25 bg-green/[0.05]'
                      : 'border-line opacity-55 hover:opacity-80',
                  )}
                >
                  <span
                    className={clsx(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
                      selectedIds.has(control.id)
                        ? 'border-green/40 bg-green/20 text-green'
                        : 'border-white/10 bg-white/[0.03] text-transparent',
                    )}
                    aria-hidden="true"
                  >
                    <Check className="h-3 w-3" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-ink">{control.name}</p>
                    <p className="truncate text-2xs text-ink-faint">
                      {control.category} · {control.implementationWeeks} wks · {control.owners} owners
                    </p>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-2xs text-ink-faint">Cost</p>
                    <p className="text-[11.5px] font-medium tabular-nums text-ink">{format(control.cost)}</p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-2xs text-ink-faint">Δ Risk</p>
                    <p className="text-[11.5px] font-medium tabular-nums text-green">
                      {format(control.riskReduction)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-2xs text-ink-faint">ROSI</p>
                    <p
                      className={clsx(
                        'text-[11.5px] font-semibold tabular-nums',
                        accentToneClass(control.rosi),
                      )}
                    >
                      {control.rosi.toFixed(0)}%
                    </p>
                  </div>
                  {control.rosi <= 0 ? (
                    <Badge tone="red" className="shrink-0">
                      Not viable
                    </Badge>
                  ) : (
                    <Badge tone={tierTone[control.tier]} className="hidden shrink-0 lg:inline-flex">
                      {control.tier}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

function pickedLabel(count: number): string {
  return `${count} control${count === 1 ? '' : 's'} funded`
}

function accentToneClass(rosi: number): string {
  if (rosi >= 100) return 'text-green'
  if (rosi >= 40) return 'text-amber'
  return 'text-red'
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="font-medium tabular-nums text-ink">{value}</dd>
    </div>
  )
}

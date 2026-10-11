import { useMemo, useState } from 'react'
import { ClipboardList, Sigma } from 'lucide-react'
import clsx from 'clsx'
import { Badge, Card, Table, type Column } from '../components/ui'
import { riskScenarios, riskStatusFilters, riskScore } from '../data/mockData'
import { useCurrency } from '../context/CurrencyContext'
import type { AccentColor, Likelihood, RiskScenario, RiskStatus } from '../types'

const likelihoodTone: Record<Likelihood, AccentColor> = {
  rare: 'green',
  unlikely: 'green',
  possible: 'amber',
  likely: 'red',
  'almost-certain': 'red',
}

const statusTone: Record<RiskStatus, AccentColor> = {
  open: 'red',
  mitigating: 'amber',
  accepted: 'blue',
  closed: 'green',
}

const statusLabel: Record<RiskStatus, string> = {
  open: 'Open',
  mitigating: 'Mitigating',
  accepted: 'Accepted',
  closed: 'Closed',
}

type MoneyFormatter = ReturnType<typeof useCurrency>['format']

function buildColumns(format: MoneyFormatter): Array<Column<RiskScenario>> {
  return [
    {
      key: 'scenario',
      header: 'Scenario',
      render: (row) => (
        <div className="min-w-0 max-w-[280px]">
          <p className="truncate font-medium text-ink">{row.scenario}</p>
          <p className="truncate text-2xs text-ink-faint">
            {row.id} · {row.threatActor} · {row.owner}
          </p>
        </div>
      ),
    },
    {
      key: 'asset',
      header: 'Asset',
      render: (row) => <span className="text-ink-soft">{row.asset}</span>,
    },
    {
      key: 'likelihood',
      header: 'Likelihood',
      width: '148px',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Badge tone={likelihoodTone[row.likelihood]} dot className="capitalize">
            {row.likelihood.replace('-', ' ')}
          </Badge>
          <span className="text-2xs tabular-nums text-ink-faint">{row.likelihoodPct}%</span>
        </div>
      ),
    },
    {
      key: 'loss',
      header: 'Single Loss',
      align: 'right',
      render: (row) => <span className="tabular-nums text-ink-soft">{format(row.singleLoss)}</span>,
    },
    {
      key: 'eal',
      header: 'EAL',
      align: 'right',
      render: (row) => <span className="font-medium tabular-nums text-ink">{format(row.eal)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={statusTone[row.status]} dot>
          {statusLabel[row.status]}
        </Badge>
      ),
    },
    {
      key: 'review',
      header: 'Last Review',
      align: 'right',
      render: (row) => <span className="text-2xs text-ink-faint">{row.lastReview}</span>,
    },
  ]
}

export default function RiskRegisterPage() {
  const { format } = useCurrency()
  const columns = useMemo(() => buildColumns(format), [format])
  const [filter, setFilter] = useState<(typeof riskStatusFilters)[number]>('all')

  const rows = useMemo(
    () => (filter === 'all' ? riskScenarios : riskScenarios.filter((row) => row.status === filter)),
    [filter],
  )

  const totals = useMemo(() => {
    const eal = riskScenarios.reduce((sum, row) => sum + row.eal, 0)
    const sli = riskScenarios.reduce((sum, row) => sum + row.singleLoss, 0)
    const discount = eal > 0 ? (1 - riskScore.expectedAnnualLoss / eal) * 100 : 0
    return { eal, sli, count: riskScenarios.length, avgPct: (eal / sli) * 100, discount }
  }, [])

  const controlDiscount = totals.discount.toFixed(0)

  const summary = [
    { label: 'Register entries', value: String(totals.count), tone: 'blue' as const, note: '10 modelled scenarios' },
    { label: 'Gross EAL (pre-control)', value: format(totals.eal), tone: 'red' as const, note: `${totals.avgPct.toFixed(1)}% of sum of loss` },
    { label: 'Sum of Insured Loss', value: format(totals.sli), tone: 'amber' as const, note: 'Worst-case aggregation' },
    { label: 'Portfolio VaR 95%', value: format(riskScore.valueAtRisk95), tone: 'green' as const, note: '1-in-20 year outcome' },
  ]

  return (
    <div className="space-y-3.5">
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
                item.tone === 'red' && 'bg-red',
                item.tone === 'amber' && 'bg-amber',
                item.tone === 'green' && 'bg-green',
              )}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>

      <Card
        title="Scenario Register"
        subtitle="Likelihood × single-loss expectancy, updated nightly"
        icon={<ClipboardList className="h-4 w-4" aria-hidden="true" />}
        action={
          <div className="flex items-center gap-1 rounded-lg border border-line bg-white/[0.02] p-0.5">
            {riskStatusFilters.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={clsx(
                  'rounded-md px-2 py-1 text-2xs font-medium capitalize transition-colors duration-150',
                  filter === key ? 'bg-blue/20 text-blue' : 'text-ink-faint hover:bg-white/5 hover:text-ink-soft',
                )}
              >
                {key}
              </button>
            ))}
          </div>
        }
      >
        <Table columns={columns} rows={rows} rowKey={(row) => row.id} />
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-2xs text-ink-faint">
          <span className="flex items-center gap-2">
            <Sigma className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            EAL = single loss × likelihood, before existing controls.
          </span>
          <span>
            Residual EAL on the Dashboard is <span className="font-medium text-ink-soft">{format(riskScore.expectedAnnualLoss)}</span>{' '}
            after a {controlDiscount}% control-effectiveness discount.
          </span>
        </div>
      </Card>
    </div>
  )
}

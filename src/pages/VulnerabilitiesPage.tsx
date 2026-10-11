import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Bug, ShieldAlert } from 'lucide-react'
import { Badge, Card, Table, type Column } from '../components/ui'
import { vulnerabilities } from '../data/mockData'
import { accentHex, chart, colors } from '../constants/theme'
import { useCurrency } from '../context/CurrencyContext'
import { riskAccent } from '../utils'
import type { AccentColor, Vulnerability } from '../types'

type MoneyFormatter = ReturnType<typeof useCurrency>['format']

const cvssTone = (cvss: number): AccentColor => (cvss >= 9 ? 'red' : cvss >= 7 ? 'amber' : 'blue')

function buildColumns(format: MoneyFormatter, symbol: string): Array<Column<Vulnerability>> {
  return [
    {
      key: 'cve',
      header: 'CVE',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink">{row.cve}</span>
          {row.kev && (
            <Badge tone="red" className="uppercase tracking-wide">
              KEV
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Vulnerability',
      render: (row) => (
        <div className="min-w-0 max-w-[300px]">
          <p className="truncate text-ink">{row.title}</p>
          <p className="truncate text-2xs text-ink-faint">
            {row.asset} · found {row.discovered}
          </p>
        </div>
      ),
    },
    {
      key: 'cvss',
      header: 'CVSS',
      align: 'right',
      width: '92px',
      render: (row) => (
        <Badge tone={cvssTone(row.cvss)} className="tabular-nums">
          {row.cvss.toFixed(1)}
        </Badge>
      ),
    },
    {
      key: 'epss',
      header: 'EPSS',
      align: 'right',
      width: '96px',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <span className="h-1.5 w-10 overflow-hidden rounded-full bg-white/[0.06]">
            <span
              className="block h-full rounded-full"
              style={{ width: `${row.epss * 100}%`, backgroundColor: accentHex[riskAccent(row.epss * 100)] }}
              aria-hidden="true"
            />
          </span>
          <span className="w-8 text-right tabular-nums text-ink-soft">{(row.epss * 100).toFixed(0)}%</span>
        </div>
      ),
    },
    {
      key: 'patch',
      header: 'Fix',
      render: (row) => (
        <Badge tone={row.patchAvailable ? 'green' : 'red'} dot>
          {row.patchAvailable ? 'Patch ready' : 'No patch'}
        </Badge>
      ),
    },
    {
      key: 'contribution',
      header: `${symbol} Contribution`,
      align: 'right',
      render: (row) => <span className="font-medium tabular-nums text-ink">{format(row.contribution)}</span>,
    },
  ]
}

export default function VulnerabilitiesPage() {
  const { format, meta, chart: chartScale } = useCurrency()
  const columns = useMemo(() => buildColumns(format, meta.symbol), [format, meta.symbol])

  const top = useMemo(
    () =>
      [...vulnerabilities]
        .sort((a, b) => b.contribution - a.contribution)
        .slice(0, 8)
        .map((row) => ({
          name: row.cve.replace('CVE-', ''),
          value: row.contribution / chartScale.divisor,
          tone: cvssTone(row.cvss),
        })),
    [chartScale.divisor],
  )

  const stats = useMemo(() => {
    const totalContribution = vulnerabilities.reduce((sum, row) => sum + row.contribution, 0)
    return {
      totalContribution,
      kev: vulnerabilities.filter((row) => row.kev).length,
      critical: vulnerabilities.filter((row) => row.cvss >= 9).length,
      noPatch: vulnerabilities.filter((row) => !row.patchAvailable).length,
    }
  }, [])

  const summary = [
    { label: 'Modelled CVE contribution', value: format(stats.totalContribution), tone: 'red' as const },
    { label: 'Critical (CVSS ≥ 9)', value: String(stats.critical), tone: 'red' as const },
    { label: 'In CISA KEV', value: String(stats.kev), tone: 'amber' as const },
    { label: 'No vendor patch', value: String(stats.noPatch), tone: 'amber' as const },
  ]

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="card-surface px-3.5 py-3">
            <p className="text-2xs text-ink-soft">{item.label}</p>
            <p className="mt-1 text-[17px] font-semibold tracking-tight text-ink tabular-nums">{item.value}</p>
            <span
              className={`mt-2 block h-[2px] w-8 rounded-full ${item.tone === 'red' ? 'bg-red' : 'bg-amber'}`}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <div className="col-span-12 xl:col-span-5">
          <Card
            className="h-full"
            title="Contribution by CVE"
            subtitle={`Modelled annual loss, ${meta.symbol} ${chartScale.label}`}
            icon={<Bug className="h-4 w-4" aria-hidden="true" />}
          >
            <div className="h-[262px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke={chart.grid} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: chart.axis, fontSize: 9.5 }}
                    tickLine={false}
                    axisLine={{ stroke: chart.grid }}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: chart.axis, fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.[0]) return null
                      const value = typeof payload[0].value === 'number' ? payload[0].value : 0
                      return (
                        <div
                          className="rounded-[10px] border px-2.5 py-2 text-[11px] shadow-xl"
                          style={{ backgroundColor: chart.tooltipBg, borderColor: chart.tooltipBorder }}
                        >
                          <p className="mb-1 font-semibold text-ink">CVE-{label}</p>
                          <p className="tabular-nums text-ink-soft">
                            {format(value * chartScale.divisor)} /yr modelled loss
                          </p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={34} isAnimationActive={false}>
                    {top.map((entry) => (
                      <Cell key={entry.name} fill={accentHex[entry.tone]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="col-span-12 xl:col-span-7">
          <Card
            className="h-full"
            title="CVE Inventory"
            subtitle="Ranked by financial contribution"
            icon={<ShieldAlert className="h-4 w-4" aria-hidden="true" />}
            action={<Badge tone="neutral">{vulnerabilities.length} tracked</Badge>}
          >
            <Table columns={columns} rows={vulnerabilities} rowKey={(row) => row.id} />
            <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-2xs text-ink-faint">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: colors.amber }}
                aria-hidden="true"
              />
              Contribution blends EPSS-weighted likelihood with blast-radius loss estimates from the asset graph.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

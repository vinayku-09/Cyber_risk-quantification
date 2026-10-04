import { ArrowUpRight } from 'lucide-react'
import { Badge, Card, ProgressBar, Table, type Column } from '../ui'
import { riskContributors } from '../../data/mockData'
import { formatINR, scoreAccent } from '../../utils'
import { accentHex, colors } from '../../constants/theme'
import type { RiskContributor } from '../../types'

const columns: Array<Column<RiskContributor>> = [
  {
    key: 'asset',
    header: 'Asset',
    render: (row) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-ink">{row.asset}</p>
        <p className="truncate text-2xs text-ink-faint">{row.id}</p>
      </div>
    ),
  },
  {
    key: 'bu',
    header: 'Business Unit',
    render: (row) => <span className="text-ink-soft">{row.businessUnit}</span>,
  },
  {
    key: 'score',
    header: 'Security Score',
    width: '150px',
    render: (row) => {
      const accent = scoreAccent(row.securityScore)
      return (
        <div className="flex items-center gap-2">
          <ProgressBar
            value={row.securityScore}
            color={accentHex[accent]}
            className="max-w-[86px]"
            label={`${row.asset} security score`}
          />
          <span className="w-6 text-right text-2xs font-medium tabular-nums text-ink-soft">
            {row.securityScore}
          </span>
        </div>
      )
    },
  },
  {
    key: 'exposure',
    header: 'Exposure',
    align: 'right',
    render: (row) => (
      <span className="font-medium tabular-nums text-ink">{formatINR(row.exposure)}</span>
    ),
  },
  {
    key: 'threat',
    header: 'Top Threat',
    render: (row) => (
      <Badge tone={row.threat} dot>
        {row.threatLabel}
      </Badge>
    ),
  },
  {
    key: 'fixes',
    header: 'Pending Fixes',
    align: 'right',
    render: (row) => (
      <span
        className={
          row.pendingFixes >= 20
            ? 'inline-flex items-center gap-1 font-medium tabular-nums text-red'
            : 'tabular-nums text-ink-soft'
        }
      >
        {row.pendingFixes}
        {row.pendingFixes >= 20 && <ArrowUpRight className="h-3 w-3" aria-hidden="true" />}
      </span>
    ),
  },
]

export function RiskContributorsCard() {
  const total = riskContributors.reduce((sum, row) => sum + row.exposure, 0)
  const topTwo = riskContributors
    .slice()
    .sort((a, b) => b.exposure - a.exposure)
    .slice(0, 2)
    .reduce((sum, row) => sum + row.exposure, 0)
  const concentration = total > 0 ? Math.round((topTwo / total) * 100) : 0

  return (
    <Card
      className="h-full"
      title="Top Risk Contributors"
      subtitle={`${riskContributors.length} assets · ${formatINR(total)} aggregate exposure`}
      action={<Badge tone="neutral">Sorted by exposure</Badge>}
    >
      <Table columns={columns} rows={riskContributors} rowKey={(row) => row.id} />
      <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-2xs text-ink-faint">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.red }} aria-hidden="true" />
        Two assets carry {concentration}% of modelled loss. Remediation sequencing is handled in the Investment
        Optimizer.
      </div>
    </Card>
  )
}

import { useState } from 'react'
import { BadgeCheck, Blocks, CircleX, ShieldCheck } from 'lucide-react'
import clsx from 'clsx'
import { Badge, Card, ProgressBar, Table, type Column } from '../components/ui'
import { complianceFrameworks } from '../data/mockData'
import { accentHex, colors } from '../constants/theme'
import { formatPct, scoreAccent } from '../utils'
import type { AccentColor, ComplianceDomain, ComplianceFramework } from '../types'

interface ControlRow {
  id: string
  domain: string
  control: string
  status: 'pass' | 'fail'
  evidence: string
}

const controlSeed: Record<string, Array<[string, string]>> = {
  'iso-27001': [
    ['A.5.15', 'Access control'],
    ['A.8.24', 'Use of cryptography'],
    ['A.8.13', 'Information backup'],
    ['A.8.16', 'Monitoring activities'],
    ['A.8.9', 'Configuration management'],
  ],
  'nist-csf': [
    ['PR.AA-01', 'Identities and credentials managed'],
    ['PR.DS-01', 'Data at rest protected'],
    ['DE.CM-01', 'Networks monitored'],
    ['RS.MA-02', 'Incident reports triaged'],
    ['RC.RP-01', 'Recovery plan executed'],
  ],
  'cis-v8': [
    ['4.6', 'Admin account access restricted'],
    ['7.5', 'Secure configuration baselines'],
    ['10.1', 'Anti-malware on all endpoints'],
    ['13.4', 'Endpoint detection deployed'],
    ['17.4', 'Secure development lifecycle'],
  ],
  'rbi-csf': [
    ['A.5', 'Cyber security governance'],
    ['C.3', 'Patch management process'],
    ['D.4', '24x7 monitoring arrangement'],
    ['E.2', 'Third-party risk framework'],
    ['F.6', 'Incident response drills'],
  ],
  'sebi-cscrf': [
    ['4.1', 'Information security policy'],
    ['6.2', 'Critical asset inventory'],
    ['8.3', 'Multi-factor authentication'],
    ['11.4', 'Continuous monitoring'],
    ['13.2', 'Vendor security assurance'],
  ],
}

function buildRows(framework: ComplianceFramework): ControlRow[] {
  const seed = controlSeed[framework.id] ?? []
  return seed.map(([id, control], index) => {
    const domain = framework.domains[index % Math.max(1, framework.domains.length)]
    const failing = domain ? domain.failed > index % 3 : false
    return {
      id: `${framework.id}-${id}`,
      domain: domain?.name ?? 'General',
      control: `${control} (${id})`,
      status: failing ? 'fail' : 'pass',
      evidence: failing ? 'Evidence expired' : 'Attested',
    }
  })
}

const columns: Array<Column<ControlRow>> = [
  { key: 'control', header: 'Control', render: (row) => <span className="text-ink">{row.control}</span> },
  { key: 'domain', header: 'Domain', render: (row) => <span className="text-ink-soft">{row.domain}</span> },
  {
    key: 'status',
    header: 'Result',
    render: (row) =>
      row.status === 'pass' ? (
        <Badge tone="green" dot>
          Pass
        </Badge>
      ) : (
        <Badge tone="red" dot>
          Fail
        </Badge>
      ),
  },
  { key: 'evidence', header: 'Evidence', align: 'right', render: (row) => <span className="text-2xs text-ink-faint">{row.evidence}</span> },
]

export default function CompliancePage() {
  const [activeId, setActiveId] = useState(complianceFrameworks[0]?.id ?? '')
  const framework = complianceFrameworks.find((item) => item.id === activeId) ?? complianceFrameworks[0]
  if (!framework) return null

  const rows = buildRows(framework)
  const accent = scoreAccent(framework.coverage)

  const stats: Array<{ label: string; value: string; tone: AccentColor }> = [
    { label: 'Coverage', value: formatPct(framework.coverage, 1), tone: accent },
    { label: 'Controls passing', value: `${framework.passed}`, tone: 'green' },
    { label: 'Controls failing', value: `${framework.failed}`, tone: 'red' },
    { label: 'Last audit', value: framework.lastAudit, tone: 'blue' },
  ]

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center gap-1.5 rounded-[14px] border border-line bg-card p-1.5">
        {complianceFrameworks.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveId(item.id)}
            aria-pressed={item.id === activeId}
            className={clsx(
              'rounded-[9px] px-3 py-1.5 text-[12px] font-medium transition-colors duration-150',
              item.id === activeId
                ? 'bg-blue/15 text-ink ring-1 ring-inset ring-blue/30'
                : 'text-ink-soft hover:bg-white/[0.05] hover:text-ink',
            )}
          >
            {item.shortName}
            <span className="ml-1.5 tabular-nums text-ink-faint">{item.coverage}%</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <div className="col-span-12 lg:col-span-7">
          <Card
            className="h-full"
            title={framework.name}
            subtitle={`${framework.regulator} · ${framework.controls} controls`}
            icon={<Blocks className="h-4 w-4" aria-hidden="true" />}
            action={
              framework.failed === 0 ? (
                <Badge tone="green" dot>Fully compliant</Badge>
              ) : (
                <Badge tone="amber" dot>{framework.failed} gaps open</Badge>
              )
            }
          >
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[34px] font-semibold leading-none tracking-tight text-ink tabular-nums">
                  {framework.coverage}
                  <span className="text-[16px] font-medium text-ink-faint">%</span>
                </p>
                <p className="mt-1 text-2xs text-ink-faint">
                  {framework.passed} of {framework.controls} controls evidenced
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xs text-ink-soft">Residual gap</p>
                <p className="text-[16px] font-semibold tabular-nums text-red">
                  {formatPct(100 - framework.coverage, 1)}
                </p>
              </div>
            </div>
            <ProgressBar value={framework.coverage} color={accentHex[accent]} label="Framework coverage" />

            <div className="mt-4 space-y-2.5 border-t border-line pt-3.5">
              {framework.domains.map((domain: ComplianceDomain) => (
                <DomainRow key={domain.name} domain={domain} />
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="grid grid-cols-2 gap-3.5">
            {stats.map((stat) => (
              <div key={stat.label} className="card-surface px-3.5 py-3">
                <p className="text-2xs text-ink-soft">{stat.label}</p>
                <p className="mt-1 text-[16px] font-semibold tracking-tight text-ink tabular-nums">{stat.value}</p>
                <span
                  className="mt-2 block h-[2px] w-8 rounded-full"
                  style={{ backgroundColor: colors[stat.tone] }}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>

          <Card
            className="mt-3.5"
            title="Sampled Controls"
            subtitle="Evidence register, 5 most material"
            icon={framework.failed === 0 ? <BadgeCheck className="h-4 w-4" /> : <CircleX className="h-4 w-4" />}
            action={
              framework.failed === 0 ? (
                <Badge tone="green">All sampled pass</Badge>
              ) : (
                <Badge tone="red">{rows.filter((row) => row.status === 'fail').length} failing</Badge>
              )
            }
          >
            <Table columns={columns} rows={rows} rowKey={(row) => row.id} />
          </Card>
        </div>
      </div>

      <div className="card-surface flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="flex items-center gap-2 text-2xs text-ink-soft">
          <ShieldCheck className="h-3.5 w-3.5 text-green" aria-hidden="true" />
          Continuous control monitoring is enabled — coverage refreshes on every scanner sync.
        </p>
        <Badge tone="neutral">{complianceFrameworks.length} frameworks tracked</Badge>
      </div>
    </div>
  )
}

function DomainRow({ domain }: { domain: ComplianceDomain }) {
  const accent = scoreAccent(domain.coverage)
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="truncate text-[11px] text-ink-soft">{domain.name}</span>
        <div className="flex shrink-0 items-center gap-1.5">
          {domain.failed > 0 ? (
            <Badge tone="red">{domain.failed} fail</Badge>
          ) : (
            <Badge tone="green">clean</Badge>
          )}
          <span className="w-8 text-right text-2xs font-medium tabular-nums text-ink-soft">{domain.coverage}%</span>
        </div>
      </div>
      <ProgressBar value={domain.coverage} color={accentHex[accent]} label={`${domain.name} coverage`} />
    </div>
  )
}

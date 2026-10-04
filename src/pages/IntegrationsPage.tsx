import {
  Boxes,
  Cloud,
  Fingerprint,
  Network,
  Plug,
  Radar,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Siren,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'
import { Badge, Button, Card, ProgressBar } from '../components/ui'
import { integrations } from '../data/mockData'
import { accentHex } from '../constants/theme'
import { formatCompactNumber, scoreAccent } from '../utils'
import type { AccentColor, Integration, IntegrationStatus } from '../types'

const statusMeta: Record<IntegrationStatus, { tone: AccentColor; label: string }> = {
  connected: { tone: 'green', label: 'Connected' },
  syncing: { tone: 'blue', label: 'Syncing' },
  degraded: { tone: 'amber', label: 'Degraded' },
  disconnected: { tone: 'red', label: 'Disconnected' },
}

const categoryIcons: Record<string, LucideIcon> = {
  Scanner: ScanLine,
  SIEM: Radar,
  EDR: ShieldCheck,
  IAM: Fingerprint,
  CSPM: Cloud,
  CMDB: Boxes,
  'Threat Intel': Siren,
}

const categoryOrder = ['Scanner', 'SIEM', 'EDR', 'IAM', 'CSPM', 'CMDB', 'Threat Intel']

export default function IntegrationsPage() {
  const counts = {
    connected: integrations.filter((item) => item.status === 'connected').length,
    attention: integrations.filter((item) => item.status === 'degraded' || item.status === 'disconnected').length,
    total: integrations.length,
    records: integrations.reduce((sum, item) => sum + item.records, 0),
  }

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {[
          { label: 'Connected sources', value: `${counts.connected}/${counts.total}`, tone: 'green' as const, note: 'streaming into the model' },
          { label: 'Needs attention', value: String(counts.attention), tone: 'amber' as const, note: 'degraded or offline' },
          { label: 'Records ingested', value: formatCompactNumber(counts.records), tone: 'blue' as const, note: 'across all sources' },
          { label: 'Mean coverage', value: `${Math.round(integrations.reduce((s, i) => s + i.coverage, 0) / counts.total)}%`, tone: 'green' as const, note: 'of the modelled estate' },
        ].map((item) => (
          <div key={item.label} className="card-surface px-3.5 py-3">
            <p className="text-2xs text-ink-soft">{item.label}</p>
            <p className="mt-1 text-[17px] font-semibold tracking-tight text-ink tabular-nums">{item.value}</p>
            <p className="mt-0.5 text-[10px] text-ink-faint">{item.note}</p>
            <span
              className={clsx(
                'mt-2 block h-[2px] w-8 rounded-full',
                item.tone === 'green' && 'bg-green',
                item.tone === 'amber' && 'bg-amber',
                item.tone === 'blue' && 'bg-blue',
              )}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>

      <Card
        title="Connected Sources"
        subtitle="Vulnerability, telemetry, identity, cloud and business context"
        icon={<Plug className="h-4 w-4" aria-hidden="true" />}
        action={<Badge tone="neutral">Read-only scopes</Badge>}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {categoryOrder.map((category) => {
            const items = integrations.filter((item) => item.category === category)
            if (items.length === 0) return null
            const Icon = categoryIcons[category] ?? Network

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2 px-0.5">
                  <Icon className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
                  <p className="text-2xs font-medium uppercase tracking-wider text-ink-faint">{category}</p>
                </div>
                {items.map((item) => (
                  <IntegrationCard key={item.id} integration={item} Icon={Icon} />
                ))}
              </div>
            )
          })}
        </div>
      </Card>

      <div className="card-surface flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="flex items-center gap-2 text-2xs text-ink-soft">
          <RefreshCw className="h-3.5 w-3.5 text-blue" aria-hidden="true" />
          Full re-sync runs at 02:00 IST. Credentials are stored in the platform key vault.
        </p>
        <Button size="sm" variant="secondary" icon={<RefreshCw className="h-3 w-3" aria-hidden="true" />}>
          Sync all
        </Button>
      </div>
    </div>
  )
}

function IntegrationCard({ integration, Icon }: { integration: Integration; Icon: LucideIcon }) {
  const meta = statusMeta[integration.status]
  const accent = scoreAccent(integration.coverage)

  return (
    <div
      className={clsx(
        'group rounded-[12px] border border-line bg-white/[0.02] p-3 transition-colors duration-150',
        'hover:border-white/12 hover:bg-white/[0.04]',
        integration.status === 'disconnected' && 'opacity-70',
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-white/[0.05] ring-1 ring-white/10 transition-colors group-hover:bg-blue/10 group-hover:ring-blue/25">
            <Icon className="h-3.5 w-3.5 text-ink-soft" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-medium text-ink">{integration.name}</p>
            <p className="truncate text-2xs text-ink-faint">{integration.lastSync}</p>
          </div>
        </div>
        <Badge tone={meta.tone} dot className="shrink-0">
          {meta.label}
        </Badge>
      </div>

      <p className="mb-2.5 line-clamp-2 min-h-[28px] text-2xs leading-relaxed text-ink-soft">
        {integration.description}
      </p>

      <div className="mb-2 flex items-center justify-between text-2xs">
        <span className="text-ink-faint">{formatCompactNumber(integration.records)} records</span>
        <span className="tabular-nums text-ink-soft">{integration.coverage}% covered</span>
      </div>
      <ProgressBar value={integration.coverage} color={accentHex[accent]} label={`${integration.name} coverage`} />

      <div className="mt-2.5 flex items-center gap-1.5">
        <Button size="sm" variant="ghost" className="flex-1">
          Configure
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="flex-1"
          icon={<RefreshCw className="h-3 w-3" aria-hidden="true" />}
        >
          Sync
        </Button>
      </div>
    </div>
  )
}

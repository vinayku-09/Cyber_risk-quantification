import { ShieldCheck, TrendingDown } from 'lucide-react'
import { Badge, Card, ProgressBar } from '../ui'
import { RiskGauge } from './RiskGauge'
import { colors } from '../../constants/theme'
import { riskScore } from '../../data/mockData'
import { useCurrency } from '../../context/CurrencyContext'
import type { AccentColor, ControlStatus } from '../../types'

const statusTone: Record<ControlStatus, AccentColor> = {
  strong: 'green',
  partial: 'amber',
  weak: 'red',
  missing: 'red',
}

const statusLabel: Record<ControlStatus, string> = {
  strong: 'Strong',
  partial: 'Partial',
  weak: 'Weak',
  missing: 'Missing',
}

const miniStats: Array<{ label: string; value: number; tone: AccentColor; suffix?: string }> = [
  { label: 'Financial Exposure', value: riskScore.financialExposure, tone: 'blue' },
  { label: 'Expected Annual Loss', value: riskScore.expectedAnnualLoss, tone: 'amber', suffix: '/yr' },
  { label: 'VaR 95%', value: riskScore.valueAtRisk95, tone: 'red' },
]

const statToneBar: Record<AccentColor, string> = {
  green: 'bg-green',
  blue: 'bg-blue',
  amber: 'bg-amber',
  red: 'bg-red',
}

export function EnterpriseRiskScoreCard() {
  const { format } = useCurrency()

  return (
    <Card
      className="h-full"
      title="Enterprise Risk Score"
      subtitle="Monte-Carlo · 100k simulations"
      icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
      action={
        <Badge tone="green" dot>
          <TrendingDown className="h-3 w-3" aria-hidden="true" />
          {Math.abs(riskScore.delta)}% QoQ
        </Badge>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex items-center justify-center">
          <RiskGauge />
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          {miniStats.map((stat) => (
            <div
              key={stat.label}
              className="group flex items-center justify-between gap-3 rounded-[10px] border border-line bg-white/[0.02] px-3 py-2 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`h-8 w-[3px] shrink-0 rounded-full ${statToneBar[stat.tone]}`}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate text-2xs text-ink-soft">{stat.label}</p>
                  <p className="text-[15px] font-semibold tracking-tight text-ink tabular-nums">
                    {format(stat.value)}
                    {stat.suffix ? (
                      <span className="ml-0.5 text-2xs font-normal text-ink-faint">{stat.suffix}</span>
                    ) : null}
                  </p>
                </div>
              </div>
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full opacity-70 transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: colors[stat.tone] }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-line pt-3.5 sm:grid-cols-3">
        {riskScore.controls.map((control) => (
          <div key={control.name} className="min-w-0">
            <div className="mb-1 flex items-center justify-between gap-1.5">
              <span className="truncate text-[11px] font-medium text-ink-soft">{control.name}</span>
              <Badge tone={statusTone[control.status]} dot>
                {statusLabel[control.status]}
              </Badge>
            </div>
            <ProgressBar
              value={control.coverage}
              color={colors[statusTone[control.status]]}
              label={`${control.name} coverage`}
            />
            <p className="mt-1 truncate text-[10px] text-ink-faint">{control.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

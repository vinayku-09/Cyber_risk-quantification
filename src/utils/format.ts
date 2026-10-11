import type { CurrencyMeta } from '../types'

/**
 * Indian currency formatter tuned for dense dashboards.
 * 4000000 -> "₹40 L", 12500000 -> "₹1.25 Cr", 85000 -> "₹85 K"
 */
export function formatINR(value: number, options: { decimals?: number; compact?: boolean } = {}): string {
  const { compact = true } = options
  if (!Number.isFinite(value)) return '₹0'

  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)

  if (!compact) {
    return `${sign}₹${abs.toLocaleString('en-IN', { maximumFractionDigits: options.decimals ?? 0 })}`
  }

  const units: Array<{ limit: number; suffix: string; decimals: number }> = [
    { limit: 1e7, suffix: ' Cr', decimals: 2 },
    { limit: 1e5, suffix: ' L', decimals: 1 },
    { limit: 1e3, suffix: ' K', decimals: 1 },
  ]

  for (const unit of units) {
    if (abs >= unit.limit) {
      const scaled = abs / unit.limit
      const decimals = options.decimals ?? trailingDecimals(scaled, unit.decimals)
      return `${sign}₹${trim(scaled.toFixed(decimals))}${unit.suffix}`
    }
  }

  return `${sign}₹${Math.round(abs)}`
}

/**
 * Currency-aware formatter. Input is always the base (INR) amount; the active
 * rate converts it, then the target currency's symbol and unit system are used.
 * INR -> "$148.15K" style output for international currencies.
 */
export function formatMoney(
  amountInInr: number,
  meta: CurrencyMeta,
  rate: number,
  options: { decimals?: number; compact?: boolean } = {},
): string {
  const symbol = meta.symbol
  const converted = amountInInr * rate
  if (!Number.isFinite(converted)) return `${symbol}0`

  const { compact = true } = options
  const sign = converted < 0 ? '-' : ''
  const abs = Math.abs(converted)

  if (!compact) {
    return `${sign}${symbol}${abs.toLocaleString(meta.locale, { maximumFractionDigits: options.decimals ?? 0 })}`
  }

  const units: Array<{ limit: number; suffix: string; decimals: number }> =
    meta.units === 'indian'
      ? [
          { limit: 1e7, suffix: ' Cr', decimals: 2 },
          { limit: 1e5, suffix: ' L', decimals: 1 },
          { limit: 1e3, suffix: ' K', decimals: 1 },
        ]
      : [
          { limit: 1e12, suffix: 'T', decimals: 2 },
          { limit: 1e9, suffix: 'B', decimals: 2 },
          { limit: 1e6, suffix: 'M', decimals: 2 },
          { limit: 1e3, suffix: 'K', decimals: 1 },
        ]

  for (const unit of units) {
    if (abs >= unit.limit) {
      const scaled = abs / unit.limit
      const decimals = options.decimals ?? trailingDecimals(scaled, unit.decimals)
      return `${sign}${symbol}${trim(scaled.toFixed(decimals))}${unit.suffix}`
    }
  }

  const fallbackDecimals = options.decimals ?? (abs > 0 && abs < 10 ? 2 : 0)
  return `${sign}${symbol}${abs.toLocaleString(meta.locale, { maximumFractionDigits: fallbackDecimals })}`
}

/**
 * Divisor + label used to scale monetary chart axes for a currency.
 * INR reads in crore (1e7); international currencies read in million (1e6).
 */
export function chartUnit(meta: CurrencyMeta): { divisor: number; label: string } {
  return meta.units === 'indian' ? { divisor: 1e7, label: 'crore' } : { divisor: 1e6, label: 'million' }
}

function trailingDecimals(value: number, max: number): number {
  if (Number.isInteger(value)) return 0
  if (max <= 1) return 1
  return 2
}

function trim(text: string): string {
  return text.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')
}

export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return '0'
  const abs = Math.abs(value)
  if (abs >= 1e7) return `${trim((value / 1e7).toFixed(1))}Cr`
  if (abs >= 1e5) return `${trim((value / 1e5).toFixed(1))}L`
  if (abs >= 1e3) return `${trim((value / 1e3).toFixed(1))}K`
  return `${Math.round(value)}`
}

export function formatPct(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Maps a 0-100 security/health score to an accent colour key (higher is better). */
export function scoreAccent(score: number): 'green' | 'amber' | 'red' {
  if (score >= 75) return 'green'
  if (score >= 50) return 'amber'
  return 'red'
}

/** Maps a 0-100 threat/severity metric to an accent colour key (higher is worse). */
export function riskAccent(risk: number): 'red' | 'amber' | 'blue' {
  if (risk >= 70) return 'red'
  if (risk >= 40) return 'amber'
  return 'blue'
}

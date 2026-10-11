import { currencies, currencyBase, exchangeRateEndpoint, fallbackRates } from '../data/mockData'
import type { ExchangeRates, RateStatus } from '../types'

const CACHE_KEY = 'cyberquant.exchange.v1'
const CACHE_TTL_MS = 6 * 60 * 60 * 1000
const REQUEST_TIMEOUT_MS = 8000

export interface RateSnapshot {
  rates: ExchangeRates
  status: RateStatus
  updatedAt: string
}

interface ApiPayload {
  time_last_update_utc?: unknown
  rates?: unknown
}

function asNumberRecord(value: unknown): Record<string, number> | null {
  if (typeof value !== 'object' || value === null) return null
  const out: Record<string, number> = {}
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === 'number' && Number.isFinite(raw)) out[key] = raw
  }
  return out
}

/** Keeps only the currencies this app supports, falling back to indicative rates. */
function normalizeRates(source: unknown): ExchangeRates | null {
  const record = asNumberRecord(source)
  if (!record) return null

  const result: ExchangeRates = { ...fallbackRates }
  let matched = 0

  for (const currency of currencies) {
    if (currency.code === currencyBase) continue
    const value = record[currency.code]
    if (typeof value === 'number' && value > 0) {
      result[currency.code] = value
      matched += 1
    }
  }

  return matched > 0 ? result : null
}

function readCache(): RateSnapshot | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null

    const { rates, updatedAt } = parsed as { rates?: unknown; updatedAt?: unknown }
    if (typeof updatedAt !== 'string') return null

    const age = Date.now() - Date.parse(updatedAt)
    if (!Number.isFinite(age) || age < 0 || age > CACHE_TTL_MS) return null

    const normalized = normalizeRates(rates)
    if (!normalized) return null

    return { rates: normalized, status: 'live', updatedAt }
  } catch {
    return null
  }
}

function writeCache(snapshot: RateSnapshot): void {
  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ rates: snapshot.rates, updatedAt: snapshot.updatedAt }),
    )
  } catch {
    // Storage can be unavailable (private mode) — caching is best-effort.
  }
}

async function requestLiveRates(): Promise<RateSnapshot> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(exchangeRateEndpoint, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`Exchange rate request failed (${response.status})`)

    const payload = (await response.json()) as ApiPayload
    const rates = normalizeRates(payload.rates)
    if (!rates) throw new Error('Exchange rate response contained no usable rates')

    const updatedAt =
      typeof payload.time_last_update_utc === 'string'
        ? payload.time_last_update_utc
        : new Date().toISOString()

    return { rates, status: 'live', updatedAt }
  } finally {
    window.clearTimeout(timer)
  }
}

export function fallbackSnapshot(): RateSnapshot {
  return { rates: { ...fallbackRates }, status: 'fallback', updatedAt: new Date().toISOString() }
}

/** Cache first, then live request, then offline fallback. Never throws. */
export async function loadRates(): Promise<RateSnapshot> {
  const cached = readCache()
  if (cached) return cached

  try {
    const live = await requestLiveRates()
    writeCache(live)
    return live
  } catch {
    return fallbackSnapshot()
  }
}

/** Forces a network refresh, bypassing the cache. */
export async function refreshRates(): Promise<RateSnapshot> {
  try {
    const live = await requestLiveRates()
    writeCache(live)
    return live
  } catch {
    return fallbackSnapshot()
  }
}

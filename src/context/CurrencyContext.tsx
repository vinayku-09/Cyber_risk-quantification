import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { currencies, currencyBase, defaultCurrency } from '../data/mockData'
import { fallbackSnapshot, loadRates, refreshRates, type RateSnapshot } from '../services/exchangeRates'
import { chartUnit, formatMoney } from '../utils'
import type { CurrencyCode, CurrencyMeta, ExchangeRates, RateStatus } from '../types'

const CURRENCY_STORAGE_KEY = 'cyberquant.currency'

const FALLBACK_NOTICE = 'Live rates unavailable — showing indicative offline rates.'

const currencyByCode = new Map<CurrencyCode, CurrencyMeta>(
  currencies.map((currency) => [currency.code, currency]),
)

export interface MoneyFormatOptions {
  decimals?: number
  compact?: boolean
}

export interface CurrencyContextValue {
  currency: CurrencyCode
  meta: CurrencyMeta
  supportedCurrencies: CurrencyMeta[]
  rates: ExchangeRates
  status: RateStatus
  updatedAt: string
  loading: boolean
  error: string | null
  setCurrency: (code: CurrencyCode) => void
  refresh: () => void
  convert: (amountInInr: number) => number
  format: (amountInInr: number, options?: MoneyFormatOptions) => string
  /** Divisor + label for scaling monetary chart axes. */
  chart: { divisor: number; label: string }
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

function readStoredCurrency(): CurrencyCode {
  try {
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (stored && currencyByCode.has(stored as CurrencyCode)) return stored as CurrencyCode
  } catch {
    // Storage unavailable — fall through to the base currency.
  }
  return currencyBase
}

function statusNotice(snapshot: RateSnapshot): string | null {
  return snapshot.status === 'fallback' ? FALLBACK_NOTICE : null
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(readStoredCurrency)
  const [snapshot, setSnapshot] = useState<RateSnapshot>(() => fallbackSnapshot())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    loadRates()
      .then((next) => {
        if (cancelled) return
        setSnapshot(next)
        setError(statusNotice(next))
      })
      .catch(() => {
        if (cancelled) return
        setError(FALLBACK_NOTICE)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code)
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, code)
    } catch {
      // Persisting the preference is best-effort only.
    }
  }, [])

  const refresh = useCallback(() => {
    setLoading(true)
    refreshRates()
      .then((next) => {
        setSnapshot(next)
        setError(statusNotice(next))
      })
      .catch(() => setError(FALLBACK_NOTICE))
      .finally(() => setLoading(false))
  }, [])

  const meta = currencyByCode.get(currency) ?? defaultCurrency
  const rate = snapshot.rates[currency]

  const convert = useCallback((amountInInr: number) => amountInInr * rate, [rate])

  const format = useCallback(
    (amountInInr: number, options?: MoneyFormatOptions) => formatMoney(amountInInr, meta, rate, options),
    [meta, rate],
  )

  const chart = useMemo(() => chartUnit(meta), [meta])

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      meta,
      supportedCurrencies: currencies,
      rates: snapshot.rates,
      status: snapshot.status,
      updatedAt: snapshot.updatedAt,
      loading,
      error,
      setCurrency,
      refresh,
      convert,
      format,
      chart,
    }),
    [currency, meta, snapshot, loading, error, setCurrency, refresh, convert, format, chart],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider')
  return context
}

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, RefreshCw } from 'lucide-react'
import clsx from 'clsx'
import { useCurrency } from '../../context/CurrencyContext'

export function CurrencySelector() {
  const {
    currency,
    meta,
    supportedCurrencies,
    rates,
    status,
    updatedAt,
    loading,
    error,
    setCurrency,
    refresh,
  } = useCurrency()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Active currency ${meta.name}. Change currency`}
        className={clsx(
          'flex h-8 items-center gap-1.5 rounded-lg border border-line bg-card px-2 text-2xs font-medium text-ink-soft transition-colors hover:bg-white/5 hover:text-ink',
          open && 'border-blue/40 text-ink',
        )}
      >
        <span className="text-[13px] leading-none" aria-hidden="true">
          {meta.symbol}
        </span>
        <span className="tabular-nums">{currency}</span>
        <ChevronDown className={clsx('h-3 w-3 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select currency"
          className="absolute right-0 z-40 mt-1.5 w-64 overflow-hidden rounded-[12px] border border-line bg-[#0E1116] shadow-2xl"
        >
          <ul className="max-h-64 overflow-y-auto p-1">
            {supportedCurrencies.map((item) => {
              const active = item.code === currency
              return (
                <li key={item.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setCurrency(item.code)
                      setOpen(false)
                    }}
                    className={clsx(
                      'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors',
                      active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]',
                    )}
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line text-[12px] text-ink-soft"
                      aria-hidden="true"
                    >
                      {item.symbol}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-medium text-ink">{item.code}</span>
                      <span className="block truncate text-2xs text-ink-faint">{item.name}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-2xs text-ink-faint">
                      1₹ ={' '}
                      {rates[item.code].toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </span>
                    {active && <Check className="h-3.5 w-3.5 shrink-0 text-blue" aria-hidden="true" />}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center justify-between gap-2 border-t border-line px-2.5 py-2">
            <span className="flex items-center gap-1.5 text-[10px] text-ink-faint">
              <span
                className={clsx('h-1.5 w-1.5 rounded-full', status === 'live' ? 'bg-green' : 'bg-amber')}
                aria-hidden="true"
              />
              {loading ? 'Updating rates…' : status === 'live' ? 'Live rates' : 'Indicative rates'}
            </span>
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              aria-label="Refresh exchange rates"
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-ink-soft transition-colors hover:bg-white/5 hover:text-ink disabled:opacity-40"
            >
              <RefreshCw className={clsx('h-3 w-3', loading && 'animate-spin')} aria-hidden="true" />
              Refresh
            </button>
          </div>

          <p className="border-t border-line px-2.5 py-1.5 text-[10px] text-ink-faint">
            {status === 'live' ? 'Updated' : 'Fallback'} {formatUpdated(updatedAt)}
            {error ? ` · ${error}` : ''}
          </p>
        </div>
      )}
    </div>
  )
}

function formatUpdated(value: string): string {
  const parsed = Date.parse(value)
  if (!Number.isFinite(parsed)) return 'just now'

  const minutes = Math.round((Date.now() - parsed) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

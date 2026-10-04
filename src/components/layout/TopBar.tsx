import { useLocation } from 'react-router-dom'
import { Bell, Menu, Search, Sparkles } from 'lucide-react'
import { pageMeta } from '../../data/mockData'
import { layout } from '../../constants/theme'
import { Button } from '../ui'

interface TopBarProps {
  onOpenMobile: () => void
}

function currentKey(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean)[0]
  return segment ?? 'dashboard'
}

export function TopBar({ onOpenMobile }: TopBarProps) {
  const { pathname } = useLocation()
  const meta = pageMeta[currentKey(pathname)] ?? pageMeta.dashboard

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-base/85 px-4 backdrop-blur-md"
      style={{ height: layout.topbarHeight }}
    >
      <button
        type="button"
        onClick={onOpenMobile}
        aria-label="Open navigation"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors hover:bg-white/5 hover:text-ink lg:hidden"
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[14px] font-semibold tracking-tight text-ink">{meta?.title}</h1>
        <p className="hidden truncate text-2xs text-ink-faint sm:block">{meta?.subtitle}</p>
      </div>

      <div className="hidden w-full max-w-[320px] items-center gap-2 rounded-[10px] border border-line bg-card px-2.5 py-1.5 transition-colors focus-within:border-blue/40 sm:flex">
        <Search className="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search assets, CVEs, scenarios…"
          aria-label="Search"
          className="w-full bg-transparent text-[12px] text-ink outline-none placeholder:text-ink-faint"
        />
        <kbd className="hidden shrink-0 rounded border border-white/10 bg-white/[0.04] px-1.5 py-px text-[10px] font-medium text-ink-faint md:block">
          ⌘K
        </kbd>
      </div>

      <Button variant="primary" size="sm" icon={<Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}>
        Run AI
      </Button>

      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-card text-ink-soft transition-colors hover:bg-white/5 hover:text-ink"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        <span
          className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red ring-2 ring-base"
          aria-hidden="true"
        />
      </button>
    </header>
  )
}

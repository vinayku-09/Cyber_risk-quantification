import { NavLink } from 'react-router-dom'
import {
  Blocks,
  CircleHelp,
  Gauge,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  Settings,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'
import { navItems, userProfile } from '../../data/mockData'
import type { NavKey } from '../../types'

const navIcons: Record<NavKey, LucideIcon> = {
  dashboard: Gauge,
  'risk-register': ListChecks,
  vulnerabilities: ShieldAlert,
  'what-if': Scale,
  optimizer: Target,
  compliance: Blocks,
  integrations: TrendingUp,
}

const secondaryLinks: Array<{ label: string; icon: LucideIcon }> = [
  { label: 'Help', icon: CircleHelp },
  { label: 'Settings', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: SidebarProps) {
  const isCollapsed = collapsed && !mobileOpen

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-line bg-card',
          'transition-[width,transform] duration-200 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:sticky lg:top-0 lg:bottom-auto lg:z-auto lg:h-screen lg:shrink-0 lg:translate-x-0',
          isCollapsed ? 'lg:w-[68px]' : 'lg:w-[248px]',
        )}
      >
        {/* Brand */}
        <div className={clsx('flex h-14 items-center border-b border-line', isCollapsed ? 'justify-center px-2' : 'gap-2 px-3')}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-blue/15 ring-1 ring-blue/30">
            <ShieldAlert className="h-4 w-4 text-blue" aria-hidden="true" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold tracking-tight text-ink">CyberQuant</p>
              <p className="truncate text-2xs text-ink-faint">Risk Intelligence</p>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={onToggle}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden h-6 w-6 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-white/5 hover:text-ink lg:flex"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <PanelLeftClose className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation"
              className="flex h-6 w-6 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-white/5 hover:text-ink lg:hidden"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Primary">
          {!isCollapsed && (
            <p className="px-2 pb-2 text-2xs font-medium uppercase tracking-wider text-ink-faint">Analyse</p>
          )}
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = navIcons[item.key]
              return (
                <li key={item.key}>
                  <NavLink
                    to={item.to}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      clsx(
                        'group relative flex h-[34px] items-center rounded-[9px] text-[12px] font-medium transition-colors duration-150',
                        isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5',
                        isActive
                          ? 'bg-blue/12 text-ink ring-1 ring-inset ring-blue/25'
                          : 'text-ink-soft hover:bg-white/[0.045] hover:text-ink',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span
                            className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-blue"
                            aria-hidden="true"
                          />
                        )}
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                        {!isCollapsed && item.badge !== undefined && (
                          <span
                            className={clsx(
                              'rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums',
                              isActive ? 'bg-blue/20 text-blue' : 'bg-white/[0.06] text-ink-faint',
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isCollapsed && item.badge !== undefined && (
                          <span
                            className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red"
                            aria-hidden="true"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>

          <div className="mt-4 space-y-0.5 border-t border-line pt-3">
            {secondaryLinks.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                title={isCollapsed ? label : undefined}
                className={clsx(
                  'flex h-[34px] w-full items-center rounded-[9px] text-[12px] font-medium text-ink-soft transition-colors duration-150',
                  'hover:bg-white/[0.045] hover:text-ink',
                  isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {!isCollapsed && <span className="truncate">{label}</span>}
              </button>
            ))}
          </div>
        </nav>

        {/* Promo */}
        {!isCollapsed && (
          <div className="px-3 pb-3">
            <div className="rounded-[12px] border border-blue/20 bg-gradient-to-br from-blue/12 to-transparent p-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue" aria-hidden="true" />
                <p className="text-[11px] font-semibold text-ink">AI Model v4</p>
              </div>
              <p className="text-2xs leading-relaxed text-ink-soft">
                Monte-Carlo engine recalibrated on 2.4M threat events.
              </p>
              <button
                type="button"
                className="mt-2 w-full rounded-lg bg-white/[0.06] py-1.5 text-2xs font-medium text-ink transition-colors hover:bg-white/[0.12]"
              >
                View methodology
              </button>
            </div>
          </div>
        )}

        {/* User */}
        <div
          className={clsx(
            'flex items-center border-t border-line py-2.5',
            isCollapsed ? 'justify-center px-2' : 'gap-2.5 px-3',
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green/15 text-2xs font-semibold text-green ring-1 ring-green/25">
            {userProfile.initials}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] font-medium text-ink">{userProfile.name}</p>
              <p className="truncate text-2xs text-ink-faint">{userProfile.role}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

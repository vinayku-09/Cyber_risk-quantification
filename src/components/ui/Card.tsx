import type { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  title?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  icon?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}

export function Card({ title, subtitle, action, icon, className, bodyClassName, children }: CardProps) {
  return (
    <section
      className={clsx(
        'card-surface flex min-w-0 flex-col transition-colors duration-200 hover:border-white/10',
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {icon && <span className="text-ink-soft shrink-0">{icon}</span>}
            <div className="min-w-0">
              <h2 className="truncate text-[13px] font-semibold tracking-tight text-ink">{title}</h2>
              {subtitle && <p className="mt-0.5 truncate text-2xs text-ink-soft">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex shrink-0 items-center gap-1.5">{action}</div>}
        </header>
      )}
      <div className={clsx('min-w-0 flex-1 px-4 pb-4', !title && 'pt-4', bodyClassName)}>{children}</div>
    </section>
  )
}

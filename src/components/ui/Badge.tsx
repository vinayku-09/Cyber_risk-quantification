import type { ReactNode } from 'react'
import clsx from 'clsx'
import { accentBgSoftClass, accentBorderSoftClass, accentTextClass } from '../../constants/theme'
import type { AccentColor } from '../../types'

type BadgeTone = AccentColor | 'neutral'

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  size?: 'xs' | 'sm'
  dot?: boolean
  className?: string
}

const toneClasses: Record<BadgeTone, string> = {
  ...Object.fromEntries(
    (['green', 'blue', 'amber', 'red'] as const).map((tone) => [
      tone,
      clsx(accentBgSoftClass[tone], accentBorderSoftClass[tone], accentTextClass[tone]),
    ]),
  ) as Record<AccentColor, string>,
  neutral: 'bg-white/[0.04] border-white/10 text-ink-soft',
}

export function Badge({ children, tone = 'neutral', size = 'xs', dot = false, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium',
        size === 'xs' ? 'px-2 py-[3px] text-2xs' : 'px-2.5 py-1 text-[11px]',
        toneClasses[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  )
}

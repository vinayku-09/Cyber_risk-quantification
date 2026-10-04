import clsx from 'clsx'
import { clamp } from '../../utils'

interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  className?: string
  trackClassName?: string
  label?: string
}

export function ProgressBar({ value, max = 100, color, className, trackClassName, label }: ProgressBarProps) {
  const pct = clamp((value / max) * 100, 0, 100)

  return (
    <div
      className={clsx('h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]', trackClassName)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={clsx('h-full rounded-full transition-[width] duration-500 ease-out', className)}
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

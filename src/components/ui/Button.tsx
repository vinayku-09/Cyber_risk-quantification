import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-blue text-white hover:bg-blue/90 border-transparent',
  secondary: 'bg-white/[0.04] text-ink hover:bg-white/[0.08] border-white/10',
  ghost: 'bg-transparent text-ink-soft hover:bg-white/[0.05] hover:text-ink border-transparent',
  danger: 'bg-red/15 text-red hover:bg-red/25 border-red/30',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-2xs gap-1.5 rounded-lg',
  md: 'h-[34px] px-3 text-[12px] gap-2 rounded-[10px]',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex shrink-0 items-center justify-center border font-medium transition-colors duration-150',
        'disabled:pointer-events-none disabled:opacity-45',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}

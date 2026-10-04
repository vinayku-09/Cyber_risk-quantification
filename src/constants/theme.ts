import type { AccentColor } from '../types'

export const colors = {
  page: '#0B0D10',
  card: '#12151A',
  cardHover: '#151920',
  surface: '#171B21',
  border: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.12)',
  textPrimary: '#E6E8EB',
  textSecondary: '#8B929B',
  textFaint: '#5C636D',
  green: '#34D399',
  blue: '#5B7CFA',
  amber: '#F5B942',
  red: '#F0616D',
} as const

export const accentHex: Record<AccentColor, string> = {
  green: colors.green,
  blue: colors.blue,
  amber: colors.amber,
  red: colors.red,
}

export const accentTextClass: Record<AccentColor, string> = {
  green: 'text-green',
  blue: 'text-blue',
  amber: 'text-amber',
  red: 'text-red',
}

export const accentBgClass: Record<AccentColor, string> = {
  green: 'bg-green',
  blue: 'bg-blue',
  amber: 'bg-amber',
  red: 'bg-red',
}

export const accentBgSoftClass: Record<AccentColor, string> = {
  green: 'bg-green/10',
  blue: 'bg-blue/10',
  amber: 'bg-amber/10',
  red: 'bg-red/10',
}

export const accentBorderSoftClass: Record<AccentColor, string> = {
  green: 'border-green/25',
  blue: 'border-blue/25',
  amber: 'border-amber/25',
  red: 'border-red/25',
}

export const layout = {
  sidebarWidth: 248,
  sidebarCollapsedWidth: 68,
  topbarHeight: 56,
  radius: 16,
  gap: 14,
} as const

export const chart = {
  grid: 'rgba(255,255,255,0.05)',
  axis: '#5C636D',
  tooltipBg: '#0E1116',
  tooltipBorder: 'rgba(255,255,255,0.10)',
} as const

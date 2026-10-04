import type { ReactNode } from 'react'
import clsx from 'clsx'
import { Inbox } from 'lucide-react'

export interface Column<T> {
  key: string
  header: ReactNode
  align?: 'left' | 'right' | 'center'
  width?: string
  className?: string
  cellClassName?: string
  render: (row: T, index: number) => ReactNode
}

interface TableProps<T> {
  columns: Array<Column<T>>
  rows: T[]
  rowKey: (row: T, index: number) => string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  className?: string
  dense?: boolean
}

const alignClasses = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
} as const

export function Table<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyMessage = 'No records found',
  className,
  dense = true,
}: TableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-ink-faint">
        <Inbox className="h-5 w-5" aria-hidden="true" />
        <p className="text-2xs">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={clsx('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={column.width ? { width: column.width } : undefined}
                className={clsx(
                  'whitespace-nowrap px-2 pb-2 text-2xs font-medium uppercase tracking-wider text-ink-faint',
                  'first:pl-0 last:pr-0',
                  alignClasses[column.align ?? 'left'],
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={rowKey(row, index)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={clsx(
                'border-b border-line/70 transition-colors duration-150 last:border-b-0',
                dense ? 'h-[42px]' : 'h-[52px]',
                onRowClick && 'cursor-pointer hover:bg-white/[0.025]',
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={clsx(
                    'whitespace-nowrap px-2 text-[12px] text-ink first:pl-0 last:pr-0',
                    alignClasses[column.align ?? 'left'],
                    column.cellClassName,
                  )}
                >
                  {column.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

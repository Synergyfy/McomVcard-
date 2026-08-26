import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header?: string
  label?: string
  render?: (item: T) => ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor?: (item: T) => string | number
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
  total?: number
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading,
  emptyMessage = 'No data found.',
  onRowClick,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="p-12 text-center text-gray-500 text-sm">
        {emptyMessage}
      </div>
    )
  }

  const hasActions = Boolean(onEdit || onDelete)

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {columns.map((col) => (
                <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {col.header || col.label || ''}
                </th>
              ))}
              {hasActions && (
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr
                key={keyExtractor ? keyExtractor(item) : i}
                onClick={() => onRowClick?.(item)}
                className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-gray-700">
                    {col.render ? col.render(item) : (item as any)[col.key] ?? '—'}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
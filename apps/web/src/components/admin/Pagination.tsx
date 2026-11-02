interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  label?: string
}

export default function Pagination({ page, totalPages, total, limit, onPageChange, label = 'results' }: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages || 1)
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  const pages: number[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(safeTotalPages, start + 4)
  for (let i = start; i <= end; i += 1) pages.push(i)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400">Showing {from}–{to} of {total} {label}</p>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700">
          Previous
        </button>
        {pages.map((value) => (
          <button key={value} type="button" onClick={() => onPageChange(value)} aria-current={value === page ? 'page' : undefined}
            className={`min-w-8 px-2 py-1.5 rounded-lg text-xs font-medium ${value === page ? 'bg-orange-500 text-white' : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            {value}
          </button>
        ))}
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= safeTotalPages}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700">
          Next
        </button>
      </div>
    </div>
  )
}

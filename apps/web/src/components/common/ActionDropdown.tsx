import { useState, useRef, useEffect } from 'react'

export interface ActionItem {
  label?: string
  icon?: string
  onClick?: () => void
  destructive?: boolean
  divider?: boolean
}

interface ActionDropdownProps {
  actions: ActionItem[]
}

export default function ActionDropdown({ actions }: ActionDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-48 origin-top-right rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100">
          {actions.map((action, i) => {
            if (action.divider) {
              return <div key={`d-${i}`} className="my-1 border-t border-gray-100 dark:border-gray-700" />
            }
            return (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); action.onClick?.(); setOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  action.destructive
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {action.icon && (
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                  </svg>
                )}
                {action.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

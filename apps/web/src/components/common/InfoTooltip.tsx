import { useId, useState, type ReactNode } from 'react'

interface InfoTooltipProps {
  /** Short explanation shown in the tooltip bubble. */
  text: ReactNode
  /** Accessible label for the trigger. */
  label?: string
  className?: string
}

/**
 * Small, keyboard-accessible information tooltip used next to form fields.
 * It works on hover and focus so it is usable on touch and with a keyboard.
 */
export default function InfoTooltip({ text, label = 'More information', className = '' }: InfoTooltipProps) {
  const id = useId()
  const [open, setOpen] = useState(false)

  return (
    <span className={`relative inline-flex items-center align-middle ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((value) => !value)}
        className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[10px] font-semibold leading-none text-gray-500 transition-colors hover:border-orange-400 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-gray-600 dark:text-gray-400 dark:hover:border-orange-400 dark:hover:text-orange-400"
      >
        i
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-left text-[11px] font-normal leading-relaxed text-white shadow-xl dark:bg-gray-700"
        >
          {text}
        </span>
      )}
    </span>
  )
}

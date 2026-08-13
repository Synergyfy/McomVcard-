import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: ReactNode
  rightIcon?: ReactNode
}

export default function InputField({ label, error, icon, rightIcon, className = '', ...props }: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`w-full px-4 py-2.5 rounded-lg border ${
            error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
          } focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-all ${
            icon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${className}`}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

import { Link } from 'react-router-dom'
import Logo from '../common/Logo'
import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <Logo />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6">{title}</h1>
          {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
        </div>
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-100/50 border border-gray-100 p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

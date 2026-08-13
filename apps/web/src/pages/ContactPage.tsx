import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import api from '../services/api'

export default function ContactPage() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await api.post('/contact', form)
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact Us - Mobile VCard Link</title>
        <meta name="description" content="Get in touch with the Mobile VCard Link team." />
      </Helmet>
      <section className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">{t('contact.subtitle')}</p>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.name')}</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.email')}</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.subject')}</label>
              <input
                type="text"
                name="subject"
                required
                value={form.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.message')}</label>
              <textarea
                name="message"
                required
                rows={6}
                value={form.message}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-70"
            >
              {status === 'loading' ? '...' : t('contact.send')}
            </button>
            {status === 'success' && (
              <p className="text-green-600 text-center font-medium">{t('contact.success')}</p>
            )}
            {status === 'error' && (
              <p className="text-red-600 text-center font-medium">{t('contact.error')}</p>
            )}
          </form>
        </div>
      </section>
    </>
  )
}

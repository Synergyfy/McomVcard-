import { useEffect } from 'react'
import { mockTemplates } from '../../services/mockData'
import type { VCard } from '../../types'

interface Props {
  vcard: VCard | null
  onClose: () => void
}

export default function VCardPreviewModal({ vcard, onClose }: Props) {
  useEffect(() => {
    if (!vcard) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = '' }
  }, [vcard, onClose])

  if (!vcard) return null

  const template = mockTemplates.find((t) => t.id === vcard.template_id)
  const primaryColor = template?.primary_color || '#FF5C00'
  const secondaryColor = template?.secondary_color || '#FF8A50'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">vCard Preview</h3>
            <p className="text-xs text-gray-400">/{vcard.url_slug}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Phone Frame */}
        <div className="flex justify-center">
          <div className="w-[280px] rounded-[2.5rem] border-[5px] border-gray-900 dark:border-gray-700 overflow-hidden bg-white shadow-2xl" style={{ aspectRatio: '9/19.5' }}>
            {/* Notch */}
            <div className="relative h-5 bg-gray-900 dark:bg-gray-700">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-900 dark:bg-gray-700 rounded-b-2xl" />
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-700 dark:bg-gray-500" />
            </div>

            {/* Content */}
            <div className="h-full overflow-y-auto" style={{ background: '#f8f9fa' }}>
              {/* Profile Header */}
              <div className="relative" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                <div className="text-center pt-8 pb-6 px-5">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full mx-auto mb-3 border-[3px] border-white/30 overflow-hidden shadow-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{vcard.name.charAt(0)}</span>
                  </div>
                  <h2 className="text-white font-bold text-base leading-tight">{vcard.name}</h2>
                  {vcard.occupation && <p className="text-white/70 text-[11px] mt-0.5">{vcard.occupation}</p>}
                  {vcard.location && (
                    <p className="text-white/50 text-[10px] mt-1 flex items-center justify-center gap-1">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {vcard.location}
                    </p>
                  )}
                </div>
                {/* Wave shape */}
                <svg className="absolute -bottom-1 left-0 right-0 w-full" viewBox="0 0 400 30" fill="none"><path d="M0 30V15C100 0 300 0 400 15V30H0Z" fill="#f8f9fa" /></svg>
              </div>

              <div className="px-4 pb-6 -mt-1">
                {/* Description */}
                {vcard.description && (
                  <div className="text-center mb-4">
                    <p className="text-[11px] text-gray-500 leading-relaxed">{vcard.description}</p>
                  </div>
                )}

                {/* Share Button */}
                <button className="w-full py-2.5 rounded-xl text-white text-[11px] font-semibold flex items-center justify-center gap-2 mb-4" style={{ background: primaryColor }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  Share Contact
                </button>

                {/* Contact Info Cards */}
                <div className="space-y-2 mb-4">
                  {vcard.email && (
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${primaryColor}15` }}>
                        <svg className="w-4 h-4" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase">Email</p>
                        <p className="text-[11px] text-gray-900 dark:text-white font-medium truncate">{vcard.email}</p>
                      </div>
                    </div>
                  )}
                  {vcard.phone && (
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${primaryColor}15` }}>
                        <svg className="w-4 h-4" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase">Phone</p>
                        <p className="text-[11px] text-gray-900 dark:text-white font-medium">{vcard.phone}</p>
                      </div>
                    </div>
                  )}
                  {vcard.website && (
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${primaryColor}15` }}>
                        <svg className="w-4 h-4" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase">Website</p>
                        <p className="text-[11px] text-gray-900 dark:text-white font-medium truncate">{vcard.website}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    <span className="text-[8px] text-gray-500">Call</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span className="text-[8px] text-gray-500">Email</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-[8px] text-gray-500">Map</span>
                  </button>
                </div>

                {/* Social Links */}
                <div className="flex justify-center gap-2 mb-4">
                  {['f', 'in', 'tw', 'ig', 'yt'].map((s) => (
                    <div key={s} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: primaryColor }}>
                      {s}
                    </div>
                  ))}
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-xl bg-white p-2 shadow-sm">
                    <div className="w-full h-full grid grid-cols-7 gap-[1px]">
                      {Array.from({ length: 49 }).map((_, i) => (
                        <div key={i} className="rounded-[1px]" style={{
                          background: [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48,9,12,16,19,23,26,30,33,37,40].includes(i) ? '#1a1a1a' : '#e5e7eb',
                        }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Powered By */}
                <p className="text-center text-[8px] text-gray-400">
                  Powered by <span className="font-semibold" style={{ color: '#FF5C00' }}>MCOM VCard</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-5">
          <a href={`/vcard/${vcard.url_slug}`} target="_blank" rel="noopener noreferrer"
            className="flex-1 text-center py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
            Load Full Page
          </a>
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

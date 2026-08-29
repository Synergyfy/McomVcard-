import { useState, useEffect } from 'react'

export interface PreviewCardData {
  id: string
  name: string
  type: 'Business' | 'Consumer' | 'Template'
  style?: string
  layout?: string
  primaryColor: string
  secondaryColor: string
  accentColor?: string
  category?: string
  businessName?: string
  owner?: string
  title?: string
  phone?: string
  email?: string
  website?: string
  logo?: string
  templateUrl?: string
}

interface Props {
  card: PreviewCardData | null
  onClose: () => void
}

export default function PreviewModal({ card, onClose }: Props) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    setFlipped(false)
  }, [card])

  useEffect(() => {
    if (!card) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [card, onClose])

  if (!card) return null

  const isTemplate = card.type === 'Template'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose} className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Flip hint */}
        <p className="text-center text-xs text-white/60 mb-3">Click card to flip</p>

        {/* Card container with perspective */}
        <div className="perspective-[1200px] cursor-pointer" onClick={() => setFlipped(!flipped)}>
          <div className={`relative w-full transition-transform duration-700 ease-in-out ${flipped ? '[transform:rotateY(180deg)]' : ''}`} style={{ transformStyle: 'preserve-3d' }}>

            {/* ── FRONT ── */}
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
              {isTemplate ? (
                /* Template front: show the template image */
                <div className="relative bg-gray-100">
                  <img src={card.templateUrl} alt={card.name} className="w-full object-contain max-h-[500px]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect fill="#f3f4f6" width="400" height="500"/><text fill="#9ca3af" font-family="Arial" font-size="14" x="50%" y="50%" text-anchor="middle">${card.name}</text></svg>`)}`
                    }} />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-bold text-lg">{card.name}</h3>
                        <p className="text-white/60 text-sm">{card.category}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
                        {card.style || 'Standard'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Card front: business card design */
                <div className="relative p-6 min-h-[320px] flex flex-col justify-between" style={{ background: `linear-gradient(135deg, ${card.primaryColor}, ${card.secondaryColor})` }}>
                  {/* Pattern */}
                  <div className="absolute inset-0 opacity-[0.07]" style={{
                    backgroundImage: card.layout === 'diagonal'
                      ? `repeating-linear-gradient(45deg, transparent, transparent 20px, white 20px, white 22px)`
                      : card.layout === 'bold'
                      ? `radial-gradient(circle at 80% 20%, white 0%, transparent 50%)`
                      : `linear-gradient(135deg, transparent 40%, white 40%, white 42%, transparent 42%)`
                  }} />

                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner">
                        {card.logo || card.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg leading-tight drop-shadow">{card.businessName || card.name}</h3>
                        <p className="text-white/50 text-xs mt-0.5">{card.style} Design · {card.type}</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-white text-sm font-medium">{card.owner}</p>
                        <p className="text-white/45 text-xs">{card.title}</p>
                      </div>
                      <div className="flex gap-1.5">
                        {['M', 'T', 'I'].map((l, i) => (
                          <div key={i} className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                            <span className="text-[10px] text-white/70 font-bold">{l}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-white/45">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {card.phone}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {card.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3" /></svg>
                        {card.website}
                      </span>
                    </div>
                  </div>

                  {/* Flip icon */}
                  <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </div>
                </div>
              )}
            </div>

            {/* ── BACK ── */}
            <div className="absolute inset-0 w-full rounded-2xl overflow-hidden shadow-2xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <div className="w-full h-full min-h-[320px] flex flex-col items-center justify-center p-8" style={{ background: `linear-gradient(135deg, ${card.secondaryColor}, ${card.primaryColor})` }}>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 text-center">
                  {/* Logo */}
                  <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg border border-white/10">
                    {card.logo || card.name?.charAt(0)}
                  </div>

                  {/* Business name */}
                  <h3 className="text-white font-bold text-2xl mb-2 drop-shadow-lg">{card.businessName || card.name}</h3>
                  <p className="text-white/50 text-sm mb-6">{card.title || card.style || 'Premium Design'}</p>

                  {/* Color palette */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="w-6 h-6 rounded-full border-2 border-white/30 shadow" style={{ backgroundColor: card.primaryColor }} />
                    <div className="w-6 h-6 rounded-full border-2 border-white/30 shadow -ml-2" style={{ backgroundColor: card.secondaryColor }} />
                    {card.accentColor && <div className="w-6 h-6 rounded-full border-2 border-white/30 shadow -ml-2" style={{ backgroundColor: card.accentColor }} />}
                  </div>

                  {/* Contact */}
                  <div className="flex items-center justify-center gap-4 text-xs text-white/40">
                    {card.phone && <span>{card.phone}</span>}
                    {card.email && <span>{card.email}</span>}
                    {card.website && <span>{card.website}</span>}
                  </div>

                  {/* Tagline */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-white/30 text-[10px] tracking-widest uppercase">Powered by MCOM VCard</p>
                  </div>
                </div>

                {/* Flip icon */}
                <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-5">
          <a href="/register" className="flex-1 py-3 bg-orange-500 text-white text-sm font-semibold rounded-xl text-center hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 dark:shadow-none">
            {isTemplate ? 'Use Template' : 'Claim Card'}
          </a>
          <button onClick={onClose} className="px-6 py-3 border border-white/20 text-white text-sm font-medium rounded-xl hover:bg-white/10 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

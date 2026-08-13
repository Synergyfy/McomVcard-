import { useState } from 'react'

export interface CardDesignData {
  id?: number
  name?: string
  style?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  layout: 'split' | 'centered' | 'header' | 'minimal' | 'bold' | 'diagonal'
  status?: string
  usage?: number
}

export function MiniCardPreview({ d, className }: { d: CardDesignData; className?: string }) {
  const { primaryColor, secondaryColor, accentColor } = d

  return (
    <div className={`w-full h-full rounded-xl overflow-hidden relative ${className || ''}`}>
      {d.layout === 'split' && (
        <div className="flex h-full">
          <div className="w-1/3 h-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg" style={{ backgroundColor: secondaryColor }}>M</div>
          </div>
          <div className="flex-1 p-2.5 flex flex-col justify-center" style={{ backgroundColor: accentColor }}>
            <p className="text-[9px] font-bold truncate" style={{ color: primaryColor }}>John Doe</p>
            <p className="text-[7px] truncate" style={{ color: primaryColor + '99' }}>CEO</p>
            <div className="flex gap-1.5 mt-1.5">
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: primaryColor + '44' }} />
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: primaryColor + '44' }} />
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: primaryColor + '44' }} />
            </div>
          </div>
        </div>
      )}
      {d.layout === 'centered' && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-3" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>M</div>
          <p className="text-[9px] font-bold text-white">John Doe</p>
          <p className="text-[7px] text-white/70">johndoe@email.com</p>
        </div>
      )}
      {d.layout === 'header' && (
        <div className="w-full h-full flex flex-col">
          <div className="h-1/3 flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
            <div className="w-5 h-5 rounded flex items-center justify-center text-white font-bold text-[8px]" style={{ backgroundColor: secondaryColor }}>M</div>
          </div>
          <div className="flex-1 p-2.5 flex flex-col justify-center" style={{ backgroundColor: accentColor }}>
            <p className="text-[9px] font-bold truncate" style={{ color: primaryColor }}>John Doe</p>
            <p className="text-[7px] truncate" style={{ color: primaryColor + '99' }}>CEO at Company</p>
          </div>
        </div>
      )}
      {d.layout === 'minimal' && (
        <div className="w-full h-full flex flex-col items-center justify-center p-3" style={{ backgroundColor: primaryColor, border: `1px solid ${secondaryColor}22` }}>
          <p className="text-[9px] font-bold truncate" style={{ color: secondaryColor }}>John Doe</p>
          <p className="text-[7px] truncate" style={{ color: secondaryColor + '77' }}>CEO</p>
          <div className="w-3 h-0.5 mt-1.5" style={{ backgroundColor: accentColor }} />
        </div>
      )}
      {d.layout === 'bold' && (
        <div className="w-full h-full flex flex-col items-center justify-center p-3" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
          <p className="text-[9px] font-bold text-white">John Doe</p>
          <p className="text-[7px] text-white/70">CEO</p>
          <div className="flex gap-1 mt-1.5">
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="w-1 h-1 rounded-full bg-white/30" />
          </div>
        </div>
      )}
      {d.layout === 'diagonal' && (
        <div className="w-full h-full relative overflow-hidden">
          <div className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)', backgroundColor: primaryColor }} />
          <div className="absolute inset-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)', backgroundColor: secondaryColor }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 rounded-lg p-1.5 shadow-lg">
              <p className="text-[8px] font-bold truncate" style={{ color: primaryColor }}>John Doe</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CardFront({ d }: { d: CardDesignData }) {
  const { primaryColor, secondaryColor, accentColor } = d

  if (d.layout === 'split') {
    return (
      <div className="flex h-full">
        <div className="w-2/5 h-full flex flex-col items-center justify-center gap-3 p-6" style={{ backgroundColor: primaryColor }}>
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ backgroundColor: secondaryColor }}>M</div>
          <p className="text-white/60 text-[10px]">Est. 2026</p>
        </div>
        <div className="flex-1 p-6 flex flex-col justify-center" style={{ backgroundColor: accentColor }}>
          <p className="text-lg font-bold" style={{ color: primaryColor }}>John Doe</p>
          <p className="text-sm" style={{ color: primaryColor + '99' }}>Chief Executive Officer</p>
          <p className="text-xs mt-4" style={{ color: primaryColor + '77' }}>johndoe@company.com</p>
          <p className="text-xs" style={{ color: primaryColor + '77' }}>+1 (555) 123-4567</p>
          <div className="flex gap-3 mt-4">
            <div className="w-5 h-5 rounded" style={{ backgroundColor: primaryColor + '22' }} />
            <div className="w-5 h-5 rounded" style={{ backgroundColor: primaryColor + '22' }} />
            <div className="w-5 h-5 rounded" style={{ backgroundColor: primaryColor + '22' }} />
          </div>
          <p className="text-[9px] mt-3" style={{ color: primaryColor + '44' }}>Tap to flip</p>
        </div>
      </div>
    )
  }

  if (d.layout === 'centered') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-8" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg relative" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>M</div>
        <div className="text-center relative">
          <p className="text-white font-bold text-xl">John Doe</p>
          <p className="text-white/70 text-sm">CEO</p>
        </div>
        <div className="flex gap-4 relative">
          <div className="w-6 h-6 rounded-full bg-white/20" />
          <div className="w-6 h-6 rounded-full bg-white/20" />
          <div className="w-6 h-6 rounded-full bg-white/20" />
        </div>
        <p className="text-white/40 text-[10px] relative mt-1">Tap to flip</p>
      </div>
    )
  }

  if (d.layout === 'bold') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-8 relative" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)' }} />
        <p className="relative text-white font-bold text-2xl tracking-wider">JOHN DOE</p>
        <p className="relative text-white/80 text-sm tracking-widest uppercase">CEO</p>
        <div className="w-12 h-0.5 relative my-2" style={{ backgroundColor: secondaryColor }} />
        <p className="relative text-white/60 text-xs">johndoe@company.com</p>
        <p className="relative text-white/60 text-xs">+1 (555) 123-4567</p>
        <p className="text-white/30 text-[10px] relative mt-2">Tap to flip</p>
      </div>
    )
  }

  if (d.layout === 'diagonal') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <div className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)', backgroundColor: primaryColor }} />
        <div className="absolute inset-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)', backgroundColor: secondaryColor }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/95 rounded-xl p-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-white font-bold shadow-lg" style={{ backgroundColor: primaryColor }}>M</div>
            <p className="text-base font-bold mt-2" style={{ color: primaryColor }}>John Doe</p>
            <p className="text-xs" style={{ color: primaryColor + '99' }}>CEO</p>
            <div className="flex justify-center gap-2 mt-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: primaryColor + '22' }} />
              <div className="w-4 h-4 rounded" style={{ backgroundColor: primaryColor + '22' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (d.layout === 'header') {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="h-1/3 flex items-center justify-center gap-4 p-4" style={{ backgroundColor: primaryColor }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-lg" style={{ backgroundColor: secondaryColor }}>M</div>
          <p className="text-white font-bold text-sm">COMPANY</p>
        </div>
        <div className="flex-1 p-5 flex flex-col justify-center" style={{ backgroundColor: accentColor }}>
          <p className="text-base font-bold" style={{ color: primaryColor }}>John Doe</p>
          <p className="text-xs" style={{ color: primaryColor + '99' }}>Chief Executive Officer</p>
          <div className="flex gap-2 mt-3">
            <div className="flex-1 h-7 rounded" style={{ backgroundColor: primaryColor + '11' }} />
            <div className="flex-1 h-7 rounded" style={{ backgroundColor: primaryColor + '11' }} />
          </div>
          <p className="text-[9px] mt-3" style={{ color: primaryColor + '44' }}>Tap to flip</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-8" style={{ backgroundColor: accentColor, border: `1px solid ${secondaryColor}22` }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shadow-sm" style={{ backgroundColor: primaryColor + '15', color: primaryColor }}>M</div>
      <div className="text-center">
        <p className="font-bold text-lg" style={{ color: secondaryColor }}>John Doe</p>
        <p className="text-sm" style={{ color: secondaryColor + '88' }}>CEO</p>
      </div>
      <div className="w-16 h-0.5 rounded" style={{ backgroundColor: primaryColor }} />
      <p className="text-xs" style={{ color: secondaryColor + '66' }}>johndoe@company.com</p>
      <p className="text-[10px] mt-1" style={{ color: secondaryColor + '44' }}>Tap to flip</p>
    </div>
  )
}

function CardBack({ d }: { d: CardDesignData }) {
  const { primaryColor, secondaryColor, accentColor } = d

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 relative" style={{ backgroundColor: accentColor }}>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 25% 25%, ${primaryColor} 0%, transparent 50%), radial-gradient(circle at 75% 75%, ${secondaryColor} 0%, transparent 50%)` }} />
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg relative" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: '#fff' }}>
        M
      </div>
      <p className="text-gray-900 dark:text-white font-bold text-lg relative">Logo Here</p>
      <p className="text-gray-400 dark:text-gray-500 text-xs relative">Brand Design</p>
      <div className="flex gap-4 relative" style={{ color: primaryColor + '44' }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      </div>
      <p className="text-gray-400 dark:text-gray-500 text-[9px] relative mt-2">Tap to flip back</p>
    </div>
  )
}

export function CardFlip({ d, className }: { d: CardDesignData; className?: string }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className={className || ''} style={{ perspective: '1200px' }}>
      <div
        className="relative w-full aspect-[1.75/1] cursor-pointer transition-transform duration-700"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="absolute inset-0 rounded-2xl shadow-xl overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
          <CardFront d={d} />
        </div>
        <div className="absolute inset-0 rounded-2xl shadow-xl overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <CardBack d={d} />
        </div>
      </div>
    </div>
  )
}

export function CardDesignPreview({ design, onClose, footer }: {
  design: CardDesignData
  onClose: () => void
  footer?: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">{design.name || 'Business Card'}</h2>
            {design.style && <p className="text-white/60 text-xs mt-0.5">{design.style} Design</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <CardFlip d={design} />
        {footer && <div className="flex gap-3 mt-4">{footer}</div>}
      </div>
    </div>
  )
}

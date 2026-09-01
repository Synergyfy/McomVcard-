import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import type { AdminTemplate } from '../../types'
import PreviewModal from '../common/PreviewModal'
import type { PreviewCardData } from '../common/PreviewModal'

interface CardDesign {
  id: string
  name: string
  type: 'Business' | 'Consumer'
  style: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  layout: string
}

function mapTemplateToCardDesign(t: AdminTemplate): CardDesign {
  return {
    id: t.id,
    name: t.name,
    type: t.is_consumer ? 'Consumer' : 'Business',
    style: t.category || 'Default',
    primaryColor: t.primary_color || '#FF5C00',
    secondaryColor: t.secondary_color || '#FF8A50',
    accentColor: t.primary_color || '#FF5C00',
    layout: t.bg_style || 'gradient',
  }
}

const CARD_DATA = [
  { name: 'GreenLeaf Coffee', owner: 'Sarah Johnson', title: 'Founder & CEO', phone: '+1 (555) 234-5678', email: 'sarah@greenleaf.com', website: 'greenleaf.com', logo: '☕' },
  { name: 'TechVision Inc', owner: 'Mike Chen', title: 'CTO', phone: '+1 (555) 345-6789', email: 'mike@techvision.io', website: 'techvision.io', logo: '💡' },
  { name: 'Bloom Beauty', owner: 'Elena Torres', title: 'Creative Director', phone: '+1 (555) 456-7890', email: 'elena@bloombeauty.com', website: 'bloombeauty.com', logo: '🌸' },
  { name: 'Pizza Roma', owner: 'Marco Rossi', title: 'Head Chef', phone: '+1 (555) 567-8901', email: 'marco@pizzaroma.com', website: 'pizzaroma.com', logo: '🍕' },
  { name: 'FitLife Studio', owner: 'James Wright', title: 'Personal Trainer', phone: '+1 (555) 678-9012', email: 'james@fitlifestudio.com', website: 'fitlifestudio.com', logo: '💪' },
  { name: 'Coastal Realty', owner: 'Lisa Park', title: 'Real Estate Agent', phone: '+1 (555) 789-0123', email: 'lisa@coastalrealty.com', website: 'coastalrealty.com', logo: '🏠' },
  { name: 'Swift Legal', owner: 'David Kim', title: 'Managing Partner', phone: '+1 (555) 890-1234', email: 'david@swiftlegal.com', website: 'swiftlegal.com', logo: '⚖️' },
  { name: 'Pixel Perfect', owner: 'Anna Garcia', title: 'Lead Designer', phone: '+1 (555) 901-2345', email: 'anna@pixelperfect.com', website: 'pixelperfect.com', logo: '🎨' },
]

const CONSUMER_DATA = [
  { name: 'Alex Morgan', owner: 'Alex Morgan', title: 'Digital Nomad', phone: '+1 (555) 111-2222', email: 'alex@morgan.com', website: 'alexmorgan.me', logo: '🌍' },
  { name: 'Jamie Lee', owner: 'Jamie Lee', title: 'Photographer', phone: '+1 (555) 222-3333', email: 'jamie@lee.photo', website: 'jamielee.photo', logo: '📸' },
  { name: 'Sam Wilson', owner: 'Sam Wilson', title: 'Content Creator', phone: '+1 (555) 333-4444', email: 'sam@wilson.tv', website: 'samwilson.tv', logo: '🎬' },
  { name: 'Chris Taylor', owner: 'Chris Taylor', title: 'Musician', phone: '+1 (555) 444-5555', email: 'chris@taylor.music', website: 'christaylor.music', logo: '🎵' },
]

function BusinessCard({ data, card, onPreview }: { data: typeof CARD_DATA[0]; card: CardDesign; onPreview: (c: PreviewCardData) => void }) {
  return (
    <div className="w-[320px] h-[190px] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex-shrink-0 relative group cursor-pointer"
      style={{ background: `linear-gradient(135deg, ${card.primaryColor}, ${card.secondaryColor})` }}
      onClick={() => onPreview({
        id: card.id, name: card.name, type: card.type as 'Business' | 'Consumer',
        style: card.style, layout: card.layout, primaryColor: card.primaryColor,
        secondaryColor: card.secondaryColor, accentColor: card.accentColor,
        businessName: data.name, owner: data.owner, title: data.title,
        phone: data.phone, email: data.email, website: data.website, logo: data.logo,
      })}>

      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: card.layout === 'diagonal'
          ? `repeating-linear-gradient(45deg, transparent, transparent 20px, white 20px, white 22px)`
          : card.layout === 'bold'
          ? `radial-gradient(circle at 80% 20%, white 0%, transparent 50%)`
          : `linear-gradient(135deg, transparent 40%, white 40%, white 42%, transparent 42%)`
      }} />

      <div className="relative p-4 h-full flex flex-col justify-between z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-base shadow-inner">
              {data.logo}
            </div>
            <div>
              <h3 className="text-white font-bold text-sm leading-tight drop-shadow">{data.name}</h3>
              <p className="text-white/50 text-[9px] mt-0.5">{card.style} Design</p>
            </div>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/15 text-white/80 font-medium backdrop-blur-sm border border-white/10">
            {card.type}
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-white text-xs font-medium">{data.owner}</p>
            <p className="text-white/45 text-[10px]">{data.title}</p>
          </div>
          <div className="flex gap-1">
            {['M', 'T', 'I'].map((l, i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center">
                <span className="text-[8px] text-white/70 font-bold">{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[9px] text-white/45">
          <span className="flex items-center gap-1">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            {data.phone}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>
            {data.website}
          </span>
        </div>
      </div>

      {/* Hover overlay — only eye icon, stopPropagation so card click opens modal */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20"
        onClick={(e) => {
          e.stopPropagation()
          onPreview({
            id: card.id, name: card.name, type: card.type as 'Business' | 'Consumer',
            style: card.style, layout: card.layout, primaryColor: card.primaryColor,
            secondaryColor: card.secondaryColor, accentColor: card.accentColor,
            businessName: data.name, owner: data.owner, title: data.title,
            phone: data.phone, email: data.email, website: data.website, logo: data.logo,
          })
        }}>
        <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        </div>
      </div>
    </div>
  )
}

export default function CardsShowcase() {
  const [activeTab, setActiveTab] = useState<'business' | 'consumer'>('business')
  const [isPaused, setIsPaused] = useState(false)
  const [previewCard, setPreviewCard] = useState<PreviewCardData | null>(null)
  const [allCards, setAllCards] = useState<CardDesign[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number | undefined>(undefined)
  const posRef = useRef(0)

  useEffect(() => {
    api.get('/templates', { params: { category: 'card-design' } })
      .then((res) => {
        const templates: AdminTemplate[] = res.data.data || res.data
        setAllCards(templates.map(mapTemplateToCardDesign))
      })
      .catch(() => {})
  }, [])

  const businessCards = allCards.filter((c) => c.type === 'Business')
  const consumerCards = allCards.filter((c) => c.type === 'Consumer')
  const cards = activeTab === 'business' ? businessCards : consumerCards
  const cardData = activeTab === 'business' ? CARD_DATA : CONSUMER_DATA

  const speed = 0.3

  const animate = useCallback((_ts?: number) => {
    if (!scrollRef.current) {
      animRef.current = requestAnimationFrame(animate)
      return
    }
    const el = scrollRef.current
    if (!isPaused) {
      posRef.current += speed
      const cardWidth = 320 + 24
      const singleSetWidth = cards.length * cardWidth
      if (posRef.current >= singleSetWidth) {
        posRef.current -= singleSetWidth
      }
      el.scrollLeft = posRef.current
    }
    animRef.current = requestAnimationFrame(animate)
  }, [isPaused, cards.length])

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [animate])

  useEffect(() => {
    posRef.current = 0
    if (scrollRef.current) scrollRef.current.scrollLeft = 0
  }, [activeTab])

  const tripled = [...cards, ...cards, ...cards]
  const tripledData = [...cardData, ...cardData, ...cardData]

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900" id="cards">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Card <span className="text-orange-500">Designs</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Professional business card designs ready to claim. Make a lasting impression with every scan.
          </p>

          <div className="inline-flex bg-gray-200 dark:bg-gray-700 rounded-xl p-1 mt-6">
            <button onClick={() => setActiveTab('business')} className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'business' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              Business
            </button>
            <button onClick={() => setActiveTab('consumer')} className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'consumer' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              Consumer
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-6 overflow-hidden py-2"
          >
            {tripled.map((card, i) => {
              const data = tripledData[i % tripledData.length]
              return <BusinessCard key={`${card.id}-${i}`} data={data} card={card} onPreview={setPreviewCard} />
            })}
          </div>
        </div>

        <div className="text-center mt-10">
          <Link to="/cards" className="inline-block px-8 py-3 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all duration-300">
            View all card designs
          </Link>
        </div>
      </div>

      <PreviewModal card={previewCard} onClose={() => setPreviewCard(null)} />
    </section>
  )
}

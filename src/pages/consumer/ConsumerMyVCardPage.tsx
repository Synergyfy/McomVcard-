import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { consumerService } from '../../services/consumer'
import type { MockConsumer, ExchangeItem } from '../../services/mockData'
import ScrollingVCard from '../../components/common/ScrollingVCard'
import VCardActions from '../../components/consumer/vcard/VCardActions'
import VCardActionModal, { type VCardAction } from '../../components/consumer/vcard/VCardActionModal'
import {
  SECTIONS,
  SECTION_CENTRES,
  buildDefaultCentreConfigs,
  type SectionState,
  type CentreConfig,
  type CentreContentItem,
} from '../admin/card-management/TemplateBuilderPage'
import { SERVICES } from '../../components/public/sharedCardSections'
import ErrorState from '../../components/common/ErrorState'

/* Map a consumer's live data into the same section/centre model the
   customer-facing VCard uses, so the Share / Exchange / Redeem tabs and
   centre content are real — not separate sheets or pages. */
function buildConsumerSections(p: MockConsumer, exchange: ExchangeItem[]): SectionState[] {
  const sections: SectionState[] = SECTIONS.map(s => {
    const values: Record<string, string> = {}
    const items: Record<string, Record<string, string>[]> = {}
    s.fields.forEach(f => {
      if (f.type === 'list' && f.itemFields) items[f.key] = []
      else values[f.key] = ''
    })
    return { uid: s.id, schemaId: s.id, name: s.name, enabled: true, values, items, blocks: [], centre: SECTION_CENTRES[s.id] ?? 'other' }
  })

  const byId = (id: string) => sections.find(s => s.schemaId === id)!

  const profile = byId('profile')
  profile.values.name = p.name
  profile.values.designation = p.membership
  profile.values.description = `Member since ${p.joined} · ${p.primaryIssuingBusiness}`

  const contacts = byId('contacts')
  contacts.items.cards = [
    { type: 'Email', label: 'Email', value: p.email },
    { type: 'Phone', label: 'Phone', value: p.phone },
    { type: 'Location', label: 'Location', value: p.location },
    { type: 'Website', label: 'Website', value: `mcomvcard.link/${p.cardId}` },
  ]

  const social = byId('social')
  social.items.links = [
    { platform: 'WhatsApp', url: 'https://wa.me/' },
    { platform: 'Instagram', url: 'https://instagram.com/' },
    { platform: 'LinkedIn', url: 'https://linkedin.com/' },
  ]

  const share = byId('share')
  share.values.downloadLabel = 'Download VCard'
  share.values.shareLabel = 'Share Card'

  const services = byId('services')
  services.items.items = SERVICES.map(s => ({ icon: '', title: s.name, description: s.desc }))

  const products = byId('products')
  products.items.items = exchange.map(e => ({ image: '', title: e.title, description: e.business, price: e.value }))

  const appointment = byId('appointment')
  appointment.values.heading = 'Make an Appointment'
  appointment.values.button = 'Request Appointment'

  const qr = byId('qr')
  qr.values.qrMode = 'Generate by System'
  qr.values.heading = 'Scan my QR Code'
  qr.values.qrType = 'Open this VCard'
  qr.values.qrPosition = 'Center'
  qr.values.qrSize = 'Medium'

  const hours = byId('hours')
  hours.items.days = [
    { day: 'Monday', hours: '8:00 AM – 6:00 PM' },
    { day: 'Tuesday', hours: '8:00 AM – 6:00 PM' },
    { day: 'Wednesday', hours: '8:00 AM – 6:00 PM' },
    { day: 'Thursday', hours: '8:00 AM – 6:00 PM' },
    { day: 'Friday', hours: '8:00 AM – 5:00 PM' },
    { day: 'Saturday', hours: '9:00 AM – 2:00 PM' },
    { day: 'Sunday', hours: '', closed: 'true' },
  ]

  ;['countdown', 'gallery', 'testimonials', 'blog', 'map', 'contactForm', 'buildGroup', 'password'].forEach(id => {
    byId(id).enabled = false
  })

  return sections
}

function buildConsumerCentres(exchange: ExchangeItem[], redeem: ExchangeItem[], profile: MockConsumer): Record<string, CentreConfig> {
  const centres = buildDefaultCentreConfigs()

  const toItems = (list: ExchangeItem[], linkLabel: string): CentreContentItem[] =>
    list.map(e => ({ image: '', title: e.title, description: `${e.business} · ${e.expires}`, value: e.value, linkLabel, linkUrl: '' }))

  centres.share = {
    ...centres.share,
    contentMode: 'items',
    contentTitle: 'Shareable content',
    items: profile.shareContent.map(s => ({ image: '', title: s.title, description: s.source, value: s.availableUntil })),
  }
  centres.exchange = {
    ...centres.exchange,
    contentMode: 'items',
    contentTitle: 'What you can exchange',
    items: toItems(exchange, 'Exchange'),
  }
  centres.redeem = {
    ...centres.redeem,
    contentMode: 'items',
    contentTitle: 'Ready to redeem',
    items: toItems(redeem, 'Redeem'),
  }
  return centres
}

export default function ConsumerMyVCardPage() {
  const [profile, setProfile] = useState<MockConsumer | null>(null)
  const [exchange, setExchange] = useState<ExchangeItem[]>([])
  const [redeem, setRedeem] = useState<ExchangeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [modalAction, setModalAction] = useState<VCardAction | null>(null)

  const loadVCard = () => {
    setLoading(true)
    setError(false)
    Promise.all([consumerService.getProfile(), consumerService.getExchangeItems(), consumerService.getRedeemItems()])
      .then(([p, ex, rd]) => {
        setProfile(p)
        setExchange(ex)
        setRedeem(rd)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadVCard()
  }, [])

  const sections = useMemo(
    () => (profile ? buildConsumerSections(profile, exchange) : []),
    [profile, exchange, redeem]
  )
  const centres = useMemo(
    () => (profile ? buildConsumerCentres(exchange, redeem, profile) : undefined),
    [profile, exchange, redeem]
  )

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  if (error || !profile) {
    return (
      <div>
        <Helmet><title>My VCard - MCOM VCard</title></Helmet>
        <div className="lg:max-w-2xl">
          <ErrorState title="We couldn't load your VCard" message="Please try again in a moment." onRetry={loadVCard} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <Helmet><title>My VCard - MCOM VCard</title></Helmet>

      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <Link to="/c/dashboard" className="hover:text-orange-600">Home</Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white">My VCard</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My VCard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              This is how customers see your card. Use the action points to Share, Exchange and Redeem.
            </p>
          </div>
          <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
            Live preview
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
        <div className="flex justify-center">
          <ScrollingVCard sections={sections} centres={centres} heightClass="h-[62vh]" widthClass="w-full max-w-[300px] sm:max-w-[340px]" />
        </div>

        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">Share / Exchange / Redeem</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    These are your VCard action points. Tap one to see everything you can share, exchange or redeem and
                    complete it from here.
                </p>
                <div className="mt-4">
                    <VCardActions onAction={setModalAction} />
                </div>
            </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">Wallet at a glance</h2>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Points', value: profile.wallet.points.toString() },
                { label: 'Cashback', value: `£${profile.wallet.cashback.toFixed(0)}` },
                { label: 'Vouchers', value: profile.wallet.vouchers.toString() },
              ].map((w) => (
                <div key={w.label} className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3 text-center">
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white">{w.value}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{w.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <VCardActionModal
        open={!!modalAction}
        action={modalAction}
        onClose={() => setModalAction(null)}
        profile={profile}
        exchange={exchange}
        redeem={redeem}
      />
    </div>
  )
}

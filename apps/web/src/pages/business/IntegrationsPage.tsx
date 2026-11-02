import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import PageHeader from '../../components/business/primitives/PageHeader'
import ComingSoonState from '../../components/business/states/ComingSoonState'
import { businessService, type BusinessPermissions } from '../../services/businessApi'

const INTEGRATIONS = [
  { id: 'mcom-rewards', name: 'MCOM Rewards', description: 'Points, coupons and cashback across the MCOM ecosystem.', status: 'coming-soon', icon: 'gift' },
  { id: 'mcom-mall', name: 'MCOM Mall', description: 'List products and gift cards for sale in the MCOM Mall.', status: 'coming-soon', icon: 'store' },
  { id: 'mcom-expo', name: 'MCOM Expo', description: 'Run promotions and appear at MCOM events and expos.', status: 'future', icon: 'sparkles' },
  { id: 'global-pay', name: 'MCOM Global Pay', description: 'Accept secure payments from your VCard and storefront.', status: 'future', icon: 'card' },
] as const

export default function IntegrationsPage() {
  const [perms, setPerms] = useState<BusinessPermissions | null>(null)
  useEffect(() => { businessService.getBusinessPermissions().then(setPerms).catch(() => setPerms(null)) }, [])

  return (
    <div>
      <Helmet><title>Integrations - MCOMVCard</title></Helmet>
      <PageHeader title="Integrations" subtitle="Connect your business to the MCOM ecosystem" />
      {!perms ? (
        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">Loading integrations…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATIONS.map((i) => <ComingSoonState key={i.id} title={i.name} description={i.description} icon={i.icon as 'gift' | 'store' | 'sparkles' | 'card'} badge={i.status === 'future' ? 'Future' : 'Coming soon'} />)}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-4">These integrations are managed by the MCOM ecosystem and will become available as they launch.</p>
    </div>
  )
}

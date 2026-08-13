import { Helmet } from 'react-helmet-async'
import PageHeader from '../../components/business/primitives/PageHeader'
import ComingSoonState from '../../components/business/states/ComingSoonState'
import PermissionDeniedState from '../../components/business/states/PermissionDeniedState'
import { getBusinessPermissions, mockIntegrations } from '../../services/businessStore'

export default function IntegrationsPage() {
    const perms = getBusinessPermissions()

    if (!perms.canSee.integrations) {
        return (
            <div>
                <Helmet><title>Integrations - MCOMVCard</title></Helmet>
                <PageHeader title="Integrations" subtitle="Connect your business to the MCOM ecosystem" />
                <PermissionDeniedState featureName="Integrations" />
            </div>
        )
    }

    return (
        <div>
            <Helmet><title>Integrations - MCOMVCard</title></Helmet>
            <PageHeader title="Integrations" subtitle="Connect your business to the MCOM ecosystem" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockIntegrations.map(i => (
                    <ComingSoonState
                        key={i.id}
                        title={i.name}
                        description={i.description}
                        icon={i.icon as 'gift' | 'store' | 'heart' | 'sparkles' | 'clipboard' | 'map' | 'image' | 'spark' | 'card' | 'default'}
                        badge={i.status === 'future' ? 'Future' : 'Coming soon'}
                    />
                ))}
            </div>

            <p className="text-xs text-gray-400 mt-4">These integrations are managed by the MCOM ecosystem and will become available as they launch.</p>
        </div>
    )
}
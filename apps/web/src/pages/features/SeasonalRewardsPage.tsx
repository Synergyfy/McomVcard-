import FeatureSeo from '../../components/features/FeatureSeo'
import { getCurrentSeasonalContent, getSeasonalRewardEvents } from '../../services/seasonalConfig'
import SeasonalStoryPage from '../../components/seasonal/SeasonalStoryPage'

/* ------------------------------------------------------------------ */
/*  /features/seasonal/rewards — the Seasonal Rewards page.            */
/*  A dedicated seasonal story (separate from Gifts) that changes      */
/*  with the configured season/campaign.                               */
/* ------------------------------------------------------------------ */

export default function SeasonalRewardsPage() {
  const content = getCurrentSeasonalContent()
  const rewardEvents = getSeasonalRewardEvents(content)

  return (
    <>
      <FeatureSeo
        title={`${content.heroTitle} — Seasonal Rewards`}
        description={`Seasonal rewards on MCOM VCard for ${content.heroTitle}: ${content.heroMessage} How the seasonal reward works, eligibility and the connected seasonal campaigns.`}
        path="/features/seasonal/rewards"
        keywords={['seasonal rewards', 'vcard rewards', 'reward campaigns', 'mcom vcard seasonal rewards']}
      />
      <SeasonalStoryPage kind="reward" content={content} events={rewardEvents} />
    </>
  )
}
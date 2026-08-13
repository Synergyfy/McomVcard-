import FeatureSeo from '../../components/features/FeatureSeo'
import { getCurrentSeasonalContent, getSeasonalGiftEvents } from '../../services/seasonalConfig'
import SeasonalStoryPage from '../../components/seasonal/SeasonalStoryPage'

/* ------------------------------------------------------------------ */
/*  /features/seasonal/gifts — the Seasonal Gifts page.                */
/*  A dedicated seasonal story (separate from Rewards) that changes    */
/*  with the configured season/campaign.                               */
/* ------------------------------------------------------------------ */

export default function SeasonalGiftsPage() {
  const content = getCurrentSeasonalContent()
  const giftEvents = getSeasonalGiftEvents(content)

  return (
    <>
      <FeatureSeo
        title={`${content.heroTitle} — Seasonal Gifts`}
        description={`Seasonal gifts on MCOM VCard for ${content.heroTitle}: ${content.heroMessage} How the seasonal gift works, eligibility and the connected seasonal campaigns.`}
        path="/features/seasonal/gifts"
        keywords={['seasonal gifts', 'vcard gift cards', 'e-gifts', 'gift vouchers', 'mcom vcard seasonal gifts']}
      />
      <SeasonalStoryPage kind="gift" content={content} events={giftEvents} />
    </>
  )
}
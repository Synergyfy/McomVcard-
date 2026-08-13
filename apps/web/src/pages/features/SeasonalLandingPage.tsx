import FeatureSeo from '../../components/features/FeatureSeo'
import {
  getCurrentSeasonalContent,
  getActiveSeason,
  getSeasonalGiftEvents,
  getSeasonalRewardEvents,
} from '../../services/seasonalConfig'
import SeasonalHero, { SeasonalVideos } from '../../components/seasonal/SeasonalHero'
import { SeasonalEventsSection, SeasonalGiftRewardSplit } from '../../components/seasonal/SeasonalEvents'
import { CTASection, ContentSection } from '../../components/features/FeatureShared'

/* ------------------------------------------------------------------ */
/*  /features/seasonal — the Seasonal landing page.                    */
/*  A dynamically loaded seasonal framework — never a static season.   */
/*  It shows the CURRENT season (from the season catalogue / config),  */
/*  the seasonal message, an overall season video, and the events      */
/*  (gifts, rewards) inside this season's 90-day period.               */
/* ------------------------------------------------------------------ */

export default function SeasonalLandingPage() {
  const content = getCurrentSeasonalContent()
  const season = getActiveSeason()
  const gifts = getSeasonalGiftEvents(content)
  const rewards = getSeasonalRewardEvents(content)
  const keywords = ['seasonal vcard', 'seasonal gifts', 'seasonal rewards', 'mcom vcard seasons', 'seasonal campaigns']

  return (
    <>
      <FeatureSeo
        title={`${content.heroTitle} — Seasonal Gifts, Rewards & MCOM VCard Experiences`}
        description={`Current seasonal story on MCOM VCard: ${content.heroMessage} Explore seasonal gifts, rewards and VCard experiences for the current campaign period.`}
        path="/features/seasonal"
        keywords={keywords}
      />

      <SeasonalHero content={content} season={season} />

      <SeasonalVideos content={content} />

      {/* 90-day period events */}
      {(gifts.length > 0 || rewards.length > 0) && <SeasonalEventsSection content={content} />}

      {/* Gifts vs Rewards split */}
      <SeasonalGiftRewardSplit content={content} />

      {/* Seasonal framework — how it changes */}
      <ContentSection
        badge="Alive every season"
        title="A seasonal framework, not a fixed page"
        subtitle="This page changes with the season — from Autumn, to Black Friday, to Christmas — without rebuilding anything. Admins set the season window and centrally supplied seasonal content appears here automatically."
        tone="orange"
        className="bg-white dark:bg-gray-950"
      >
        <div className="rounded-3xl border border-orange-100 dark:border-orange-500/20 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-gray-900 p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-5 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <p className="font-bold text-orange-600 dark:text-orange-400 uppercase text-[11px] tracking-wide mb-1">Central hub</p>
              Seasonal messages, gifts, rewards, campaigns and videos are produced and distributed from one place.
            </div>
            <div>
              <p className="font-bold text-orange-600 dark:text-orange-400 uppercase text-[11px] tracking-wide mb-1">90-day period</p>
              Each season is a campaign window that can hold several events — holidays, Black Friday, Christmas and more.
            </div>
            <div>
              <p className="font-bold text-orange-600 dark:text-orange-400 uppercase text-[11px] tracking-wide mb-1">No rebuilds</p>
              A new season just means new configuration — no page code changes.
            </div>
          </div>
        </div>
      </ContentSection>

      <CTASection
        title="Seasonal gifts and rewards are live stories"
        subtitle="Gifts and rewards are separate seasonal stories — connected, but with their own pages and campaigns."
        ctaLabel="Explore Seasonal Gifts"
        ctaTo="/features/seasonal/gifts"
        secondaryLabel="Explore Seasonal Rewards"
        secondaryTo="/features/seasonal/rewards"
      />
    </>
  )
}
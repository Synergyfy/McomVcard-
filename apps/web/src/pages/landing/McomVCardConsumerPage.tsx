import { Helmet } from 'react-helmet-async'
import ConsumerHero from '../../components/landing/ConsumerHero'
import LandingVideo from '../../components/landing/LandingVideo'
import ConsumerBenefits from '../../components/landing/ConsumerBenefits'
import ConsumerJourney from '../../components/landing/ConsumerJourney'
import StoreCardFlow from '../../components/landing/StoreCardFlow'
import MembershipExplorer from '../../components/landing/MembershipExplorer'
import FeaturedBusinesses from '../../components/landing/FeaturedBusinesses'
import CampaignSection from '../../components/landing/CampaignSection'
import ContentEmbeds from '../../components/landing/ContentEmbeds'
import FinalCTA from '../../components/landing/FinalCTA'

/* ------------------------------------------------------------------ */
/*  Consumer landing page (/mcomvcard/consumer) — consumer-only story. */
/* ------------------------------------------------------------------ */

export default function McomVCardConsumerPage() {
  return (
    <>
      <Helmet>
        <title>MCOMVCard for Consumers - Cashback, Rewards & Family Cards</title>
        <meta name="description" content="Get your MCOMVCard from a participating business. Collect cashback, vouchers, coupons, deals and rewards — and share family & friends cards from your wallet. No subscription to enter." />
      </Helmet>

      <ContentEmbeds pageId="consumer" region="hero" placement="top" />
      <ConsumerHero />
      <ContentEmbeds pageId="consumer" region="hero" placement="bottom" />
      <LandingVideo tone="purple" />
      <ConsumerBenefits />
      <ContentEmbeds pageId="consumer" region="body" placement="top" />
      <ConsumerJourney />
      <StoreCardFlow />
      <MembershipExplorer audience="consumer" tone="purple" />
      <FeaturedBusinesses />
      <CampaignSection tone="purple" />
      <ContentEmbeds pageId="consumer" region="body" placement="bottom" />
      <ContentEmbeds pageId="consumer" region="footer" placement="top" />
      <FinalCTA
        title="Your card is waiting — with a business you trust"
        subtitle="Find a participating business near you, receive your consumer card, then explore your MCOMVCard wallet of cashback, rewards and family & friends."
        ctaLabel="Find a Business"
        ctaTo="/find-a-business"
        tone="purple"
      />
      <ContentEmbeds pageId="consumer" region="footer" placement="bottom" />
    </>
  )
}
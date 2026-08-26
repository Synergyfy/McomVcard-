import { Helmet } from 'react-helmet-async'
import BusinessHero from '../../components/landing/BusinessHero'
import BusinessBenefits from '../../components/landing/BusinessBenefits'
import LandingVideo from '../../components/landing/LandingVideo'
import MembershipExplorer from '../../components/landing/MembershipExplorer'
import CampaignSection from '../../components/landing/CampaignSection'
import ContentEmbeds from '../../components/landing/ContentEmbeds'
import FinalCTA from '../../components/landing/FinalCTA'

/* ------------------------------------------------------------------ */
/*  Business landing page (/mcomvcard/business) — business-only story. */
/* ------------------------------------------------------------------ */

export default function McomVCardBusinessPage() {
  return (
    <>
      <Helmet>
        <title>MCOMVCard for Business - Digital Cards, Rewards & Cashback</title>
        <meta name="description" content="Build digital business cards and vCards, issue them to customers, and run rewards, cashback and campaigns. One membership — Bronze, Silver, Gold or Platinum with Standard, Pro or Pro+ access. 90-day, 180-day and annual terms." />
      </Helmet>

      <ContentEmbeds pageId="business" region="hero" placement="top" />
      <BusinessHero />
      <ContentEmbeds pageId="business" region="hero" placement="bottom" />
      <LandingVideo tone="blue" />
      <BusinessBenefits />
      <ContentEmbeds pageId="business" region="body" placement="top" />
      <MembershipExplorer tone="blue" />
      <CampaignSection tone="blue" />
      <ContentEmbeds pageId="business" region="body" placement="bottom" />
      <ContentEmbeds pageId="business" region="footer" placement="top" />
      <FinalCTA
        title="Ready to put your business on a card?"
        subtitle="Create your digital card, issue cards and vCards to your customers, and manage rewards, campaigns and bookings — all from one membership."
        ctaLabel="Start Your Business"
        ctaTo="/register"
        tone="blue"
      />
      <ContentEmbeds pageId="business" region="footer" placement="bottom" />
    </>
  )
}
import { Helmet } from 'react-helmet-async'
import GeneralHero from '../../components/landing/GeneralHero'
import AudienceButtons from '../../components/landing/AudienceButtons'
import VCardExplainer from '../../components/landing/VCardExplainer'
import LandingVideo from '../../components/landing/LandingVideo'
import CampaignSection from '../../components/landing/CampaignSection'
import ContentEmbeds from '../../components/landing/ContentEmbeds'
import FinalCTA from '../../components/landing/FinalCTA'

/* ------------------------------------------------------------------ */
/*  Main MCOM VCard landing page (/) — general, audience-neutral.      */
/*  After the hero the two landing-page buttons point to the business  */
/*  and consumer landing pages.                                        */
/* ------------------------------------------------------------------ */

export default function McomVCardLandingPage() {
  return (
    <>
      <Helmet>
        <title>MCOMVCard - One Card That Does More</title>
        <meta name="description" content="MCOMVCard is the digital card, vCard and reward platform. Businesses build and share them; customers collect them from the businesses they trust. Cashback, coupons, deals and family & friends in one place." />
      </Helmet>

      <ContentEmbeds pageId="general" region="hero" placement="top" />
      <GeneralHero />
      <ContentEmbeds pageId="general" region="hero" placement="bottom" />
      <AudienceButtons />
      <VCardExplainer />
      <LandingVideo />
      <ContentEmbeds pageId="general" region="body" placement="top" />
      <CampaignSection />
      <ContentEmbeds pageId="general" region="body" placement="bottom" />
      <ContentEmbeds pageId="general" region="footer" placement="top" />
      <FinalCTA
        title="Which side are you on?"
        subtitle="Businesses build and publish. Consumers collect from the businesses they trust. Pick your landing page to go straight to your story."
        ctaLabel="I'm a Business"
        ctaTo="/business"
        secondaryLabel="I'm a Consumer"
        secondaryTo="/consumer"
      />
      <ContentEmbeds pageId="general" region="footer" placement="bottom" />
    </>
  )
}
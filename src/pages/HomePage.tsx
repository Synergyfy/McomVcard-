import { Helmet } from 'react-helmet-async'
import Hero from '../components/home/Hero'
import TemplateShowcase from '../components/home/TemplateShowcase'
import CardsShowcase from '../components/home/CardsShowcase'
import Features from '../components/home/Features'
import AboutUs from '../components/home/AboutUs'
import Testimonials from '../components/home/Testimonials'
import PricingPlans from '../components/home/PricingPlans'
import ContactSection from '../components/home/ContactSection'
import Newsletter from '../components/common/Newsletter'

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Mobile VCard Link - Create Your Digital Business Card</title>
        <meta name="description" content="Create stunning digital business cards with customizable templates, appointment scheduling, and more." />
      </Helmet>
      <Hero />
      <TemplateShowcase />
      <CardsShowcase />
      <Features />
      <AboutUs />
      <PricingPlans />
      <Testimonials />
      <ContactSection />
      <Newsletter />
    </>
  )
}

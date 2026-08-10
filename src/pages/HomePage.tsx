import { Helmet } from 'react-helmet-async'
import Hero from '../components/home/Hero'
import ConsumerPath from '../components/home/ConsumerPath'
import ParticipatingBusinesses from '../components/home/ParticipatingBusinesses'
import TemplateShowcase from '../components/home/TemplateShowcase'
import CardsShowcase from '../components/home/CardsShowcase'
import Features from '../components/home/Features'
import AboutUs from '../components/home/AboutUs'
import Testimonials from '../components/home/Testimonials'
import ChooseMembership from '../components/home/ChooseMembership'
import ContactSection from '../components/home/ContactSection'
import Newsletter from '../components/common/Newsletter'

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>MCOMVCard - Digital Cards &amp; vCards for Businesses and Consumers</title>
        <meta name="description" content="MCOMVCard helps businesses create and share digital cards and vCards with appointments, rewards and NFC. Consumers get their MCOMVCard through a participating business — connect, receive your card, then sign in with your MCOM account. No subscription to enter." />
      </Helmet>
      <Hero />
      <ConsumerPath />
      <ParticipatingBusinesses />
      <TemplateShowcase />
      <CardsShowcase />
      <Features />
      <AboutUs />
      <ChooseMembership />
      <Testimonials />
      <ContactSection />
      <Newsletter />
    </>
  )
}

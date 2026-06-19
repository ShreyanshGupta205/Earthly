import type { Metadata } from 'next'
import HeroSection from '@/components/landing/HeroSection'
import HowItWorks from '@/components/landing/HowItWorks'
import FeaturesGrid from '@/components/landing/FeaturesGrid'
import StatsGlobal from '@/components/landing/StatsGlobal'
import GoogleBadge from '@/components/landing/GoogleBadge'
import LandingNav from '@/components/landing/LandingNav'
import Footer from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Earthly — Track Your Carbon Footprint with AI',
  description: 'Join thousands reducing their carbon footprint. Log activities, get AI-powered insights from Google Gemini, and take action every day.',
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg overflow-hidden">
      <LandingNav />
      <HeroSection />
      <StatsGlobal />
      <HowItWorks />
      <FeaturesGrid />
      <GoogleBadge />
      <Footer />
    </main>
  )
}

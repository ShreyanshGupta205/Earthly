import type { Metadata } from 'next'
import LandingNav from '@/components/landing/LandingNav'
import Footer from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service — Earthly',
  description: 'Terms of Service for Earthly.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col">
      <LandingNav />
      <div className="flex-1 max-w-3xl mx-auto px-6 py-32 w-full">
        <h1 className="font-display text-4xl font-bold text-sand mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert prose-p:text-muted prose-h2:text-sand max-w-none space-y-6">
          <p>Last updated: June 2026</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Earthly, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">2. Use License</h2>
          <p>
            Earthly is an open-source project built for Hack2skills 2025. You are granted a personal, non-exclusive, non-transferable, limited license to access and use the service strictly in accordance with these Terms.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">3. Accuracy of Carbon Calculations</h2>
          <p>
            While we strive for accuracy using emission factors sourced from the IPCC, CEA India, and UK DEFRA, Earthly is an informational tool. We do not guarantee the absolute scientific precision of the carbon footprint calculations and AI insights provided. The app is meant for personal guidance and educational purposes.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">4. Limitations</h2>
          <p>
            In no event shall Earthly or its creators be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Earthly.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}

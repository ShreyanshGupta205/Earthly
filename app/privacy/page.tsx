import type { Metadata } from 'next'
import LandingNav from '@/components/landing/LandingNav'
import Footer from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy — Earthly',
  description: 'Privacy Policy for Earthly.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col">
      <LandingNav />
      <div className="flex-1 max-w-3xl mx-auto px-6 py-32 w-full">
        <h1 className="font-display text-4xl font-bold text-sand mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-p:text-muted prose-h2:text-sand prose-a:text-lime max-w-none space-y-6">
          <p>Last updated: June 2026</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">1. Information We Collect</h2>
          <p>
            When you use Earthly, we collect information you provide directly to us when you create an account, log your carbon activities, or communicate with us. This may include your name, email address, and the specific details of your daily activities (transportation, food, energy usage) necessary to calculate your carbon footprint.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services. Specifically, we use your activity data to generate your personalized Green Score, calculate carbon emissions, and power the Google Gemini AI to provide you with tailored insights and reduction strategies.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">3. Data Security and Firebase</h2>
          <p>
            Your data is stored securely using Google Firebase, which implements robust row-level security. We do not sell your personal data to third parties. Your data is your own, and you can export or delete your activity history at any time from your account settings.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">4. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. If we make material changes, we will notify you by updating the date at the top of the policy and, depending on the specific changes, we may provide you with additional notice (such as adding a statement to our homepage or sending you a notification).
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}

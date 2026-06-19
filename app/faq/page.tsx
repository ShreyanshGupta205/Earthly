import type { Metadata } from 'next'
import LandingNav from '@/components/landing/LandingNav'
import Footer from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'FAQ — Earthly',
  description: 'Frequently Asked Questions about Earthly.',
}

export default function FAQPage() {
  const faqs = [
    {
      q: "How accurate is the carbon footprint calculation?",
      a: "Our calculations use scientifically backed emission factors from the IPCC 2023, CEA India, and UK DEFRA. While highly accurate for the data provided, they represent estimates designed to guide your daily decisions rather than exact scientific measurements."
    },
    {
      q: "Is Earthly really free?",
      a: "Yes! Earthly is 100% free to use. It was built as an open-source project powered entirely by Google's free-tier infrastructure, including Firebase and Gemini AI."
    },
    {
      q: "How does the Gemini AI coaching work?",
      a: "Google Gemini 1.5 Flash analyzes your weekly logged activities, identifies your highest emission categories, and generates personalized, actionable advice and insights tailored to your specific lifestyle patterns."
    },
    {
      q: "Can I export my data?",
      a: "Absolutely. You own your data. You can export your entire activity log as a CSV file at any time from your dashboard."
    },
    {
      q: "How is my data protected?",
      a: "Your data is stored securely in Google Firebase. We use row-level security rules to ensure that only you can access your logged activities. We do not sell your data."
    }
  ]

  return (
    <main className="min-h-screen bg-bg flex flex-col">
      <LandingNav />
      <div className="flex-1 max-w-3xl mx-auto px-6 py-32 w-full">
        <h1 className="font-display text-4xl font-bold text-sand mb-12">Frequently Asked Questions</h1>
        
        <div className="space-y-8">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card p-6 border border-border/50">
              <h3 className="font-display font-bold text-sand text-lg mb-3">{faq.q}</h3>
              <p className="text-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  )
}

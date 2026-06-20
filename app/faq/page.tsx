import type { Metadata } from 'next'
import LandingNav from '@/components/landing/LandingNav'
import Footer from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'FAQ — Earthly',
  description: 'Frequently Asked Questions about Earthly — your AI-powered carbon footprint tracker. Learn about accuracy, pricing, Gemini AI coaching, data export, and privacy.',
}

const faqs = [
  {
    id: 'faq-accuracy',
    q: 'How accurate is the carbon footprint calculation?',
    a: 'Our calculations use scientifically backed emission factors from the IPCC 2023, CEA India, and UK DEFRA. While highly accurate for the data provided, they represent estimates designed to guide your daily decisions rather than exact scientific measurements.',
  },
  {
    id: 'faq-pricing',
    q: 'Is Earthly really free?',
    a: "Yes! Earthly is 100% free to use. It was built as an open-source project powered entirely by Google's free-tier infrastructure, including Firebase and Gemini AI.",
  },
  {
    id: 'faq-ai',
    q: 'How does the Gemini AI coaching work?',
    a: 'Google Gemini 2.5 Flash analyzes your weekly logged activities, identifies your highest emission categories, and generates personalized, actionable advice and insights tailored to your specific lifestyle patterns.',
  },
  {
    id: 'faq-export',
    q: 'Can I export my data?',
    a: 'Absolutely. You own your data. You can export your entire activity log as a CSV file at any time from your dashboard.',
  },
  {
    id: 'faq-privacy',
    q: 'How is my data protected?',
    a: 'Your data is stored securely in Google Firebase with row-level security rules ensuring only you can access your logged activities. We do not sell your data to third parties.',
  },
]

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col">
      <LandingNav />
      <div className="flex-1 max-w-3xl mx-auto px-6 py-32 w-full">
        <h1 className="font-display text-4xl font-bold text-sand mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-muted text-lg mb-12">
          Everything you need to know about Earthly.
        </p>

        <section aria-label="FAQ list">
          <dl className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                id={faq.id}
                className="glass-card border border-border/50"
              >
                <details className="group">
                  <summary
                    className="flex items-center justify-between p-6 cursor-pointer list-none"
                    aria-expanded="false"
                  >
                    <dt className="font-display font-bold text-sand text-lg pr-4">
                      {faq.q}
                    </dt>
                    <span
                      className="text-lime flex-shrink-0 transition-transform group-open:rotate-45"
                      aria-hidden="true"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </span>
                  </summary>
                  <dd className="px-6 pb-6 text-muted leading-relaxed">
                    {faq.a}
                  </dd>
                </details>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <Footer />
    </main>
  )
}

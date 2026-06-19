import type { Metadata } from 'next'
import LandingNav from '@/components/landing/LandingNav'
import Footer from '@/components/landing/Footer'
import { Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us — Earthly',
  description: 'Get in touch with the creator of Earthly.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col">
      <LandingNav />
      <div className="flex-1 max-w-3xl mx-auto px-6 py-32 w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-lime/10 border border-lime/20 text-lime mb-6">
          <Mail size={32} />
        </div>
        <h1 className="font-display text-4xl font-bold text-sand mb-4">Get in Touch</h1>
        <p className="text-muted text-lg max-w-xl mx-auto mb-12">
          Have a question, feedback, or want to collaborate? I&apos;d love to hear from you. You can reach out to me through any of the platforms below.
        </p>
        
        <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <a href="https://www.linkedin.com/in/shreyanshgupta205/" target="_blank" rel="noopener noreferrer" 
             className="glass-card p-6 flex flex-col items-center gap-4 hover:border-[#0A66C2]/30 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center group-hover:bg-[#0A66C2] group-hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </div>
            <div>
              <div className="font-bold text-sand">LinkedIn</div>
              <div className="text-xs text-muted">Connect professionally</div>
            </div>
          </a>

          <a href="https://github.com/ShreyanshGupta205" target="_blank" rel="noopener noreferrer" 
             className="glass-card p-6 flex flex-col items-center gap-4 hover:border-lime/30 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-full bg-lime/10 text-lime flex items-center justify-center group-hover:bg-lime group-hover:text-black transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/><path d="M9 20c-5 1.5-5-2.5-7-3"/></svg>
            </div>
            <div>
              <div className="font-bold text-sand">GitHub</div>
              <div className="text-xs text-muted">Check out my code</div>
            </div>
          </a>

          <a href="https://www.instagram.com/shreyanshg2005/" target="_blank" rel="noopener noreferrer" 
             className="glass-card p-6 flex flex-col items-center gap-4 hover:border-[#E1306C]/30 transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-full bg-[#E1306C]/10 text-[#E1306C] flex items-center justify-center group-hover:bg-[#E1306C] group-hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </div>
            <div>
              <div className="font-bold text-sand">Instagram</div>
              <div className="text-xs text-muted">Follow my journey</div>
            </div>
          </a>
        </div>
      </div>
      <Footer />
    </main>
  )
}



export default function Footer() {
  return (
    <footer className="border-t py-12 px-6" style={{ borderColor: 'rgba(125,223,170,0.07)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2.5 font-display font-bold text-xl text-sand">
              <span className="text-2xl">🌍</span>
              <span>Earthly</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              Free forever · No credit card
            </div>
          </div>

          <p className="text-muted text-sm text-center">
            Built by Shreyansh Gupta · Powered by{' '}
            <span style={{ background: 'linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Google
            </span>
            {' '}· Open Source
          </p>

          <div className="flex items-center gap-5">
            <a href="https://github.com/ShreyanshGupta205" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-lime transition-colors" aria-label="GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/><path d="M9 20c-5 1.5-5-2.5-7-3"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/shreyanshgupta205/" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-[#0A66C2] transition-colors" aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="https://www.instagram.com/shreyanshg2005/" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-[#E1306C] transition-colors" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted/60" style={{ borderColor: 'rgba(125,223,170,0.05)' }}>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-sand transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-sand transition-colors">Terms of Service</a>
            <a href="/faq" className="hover:text-sand transition-colors">FAQ</a>
            <a href="/contact" className="hover:text-sand transition-colors">Contact Us</a>
          </div>
          <div>
            Emission factors sourced from IPCC 2023 · CEA India 2023 · UK DEFRA
          </div>
        </div>
      </div>
    </footer>
  )
}

import type { Metadata } from 'next'
import './globals.css'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'

export const metadata: Metadata = {
  title: {
    default:  'Earthly — Track Your Carbon Footprint',
    template: '%s | Earthly',
  },
  description: 'Track, understand, and reduce your carbon footprint with AI-powered insights. Powered by Google Gemini and Firebase.',
  keywords:    ['carbon footprint', 'climate change', 'sustainability', 'CO2 tracker', 'green living'],
  authors:     [{ name: 'Earthly Team' }],
  openGraph: {
    title:       'Earthly — Carbon Footprint Tracker',
    description: 'AI-powered carbon footprint tracking with personalized insights.',
    type:        'website',
    locale:      'en_IN',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Google Analytics 4 */}
        {measurementId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${measurementId}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="bg-bg text-sand font-sans antialiased">
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

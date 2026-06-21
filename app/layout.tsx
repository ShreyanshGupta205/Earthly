import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

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
      <body className={`${inter.variable} ${spaceGrotesk.variable} bg-bg text-sand font-sans antialiased`}>
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

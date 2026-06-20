import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** Security headers applied to every response. */
const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options':        'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy':        'strict-origin-when-cross-origin',
  'Permissions-Policy':     'camera=(), microphone=(), geolocation=()',
}

/**
 * Next.js middleware for:
 * 1. Protecting dashboard routes — redirects unauthenticated users to /login.
 * 2. Redirecting authenticated users away from auth pages (/login, /signup).
 * 3. Injecting security headers on all responses.
 */
export function middleware(req: NextRequest) {
  // Firebase Auth uses client-side session — we check cookie set by our app
  const session = req.cookies.get('earthly-auth')?.value

  const { pathname } = req.nextUrl

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') && !session) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    const response = NextResponse.redirect(url)
    Object.entries(SECURITY_HEADERS).forEach(([k, v]) => response.headers.set(k, v))
    return response
  }

  // Redirect logged-in users from auth pages
  if ((pathname === '/login' || pathname === '/signup') && session) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    const response = NextResponse.redirect(url)
    Object.entries(SECURITY_HEADERS).forEach(([k, v]) => response.headers.set(k, v))
    return response
  }

  const response = NextResponse.next()
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) => response.headers.set(k, v))
  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}

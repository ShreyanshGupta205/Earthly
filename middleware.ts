import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Firebase Auth uses client-side session — we check cookie set by our app
  const session = req.cookies.get('earthly-auth')?.value

  const { pathname } = req.nextUrl

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') && !session) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users from auth pages
  if ((pathname === '/login' || pathname === '/signup') && session) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}

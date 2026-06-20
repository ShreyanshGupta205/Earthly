/**
 * @jest-environment node
 *
 * Unit tests for middleware.ts
 * Tests authentication redirect logic for dashboard protection.
 */

// Polyfill Web Fetch API globals for Next.js middleware in Jest/Node
import 'next/dist/server/web/globals'

import { middleware } from '@/middleware'
import { NextRequest, NextResponse } from 'next/server'

// Helper to create mock NextRequest
function createMockRequest(pathname: string, hasAuthCookie = false): NextRequest {
  const url = `http://localhost${pathname}`
  const req = new NextRequest(url)

  if (hasAuthCookie) {
    // Simulate the auth cookie being set
    Object.defineProperty(req, 'cookies', {
      value: {
        get: (name: string) =>
          name === 'earthly-auth' ? { value: 'session_token_abc' } : undefined,
      },
      writable: false,
    })
  } else {
    Object.defineProperty(req, 'cookies', {
      value: {
        get: (_name: string) => undefined,
      },
      writable: false,
    })
  }

  return req
}

// ─── Dashboard protection ─────────────────────────────────────────────────────

describe('middleware — dashboard protection', () => {
  it('redirects unauthenticated request from /dashboard to /login', () => {
    const req = createMockRequest('/dashboard', false)
    const response = middleware(req)

    expect(response).toBeInstanceOf(NextResponse)
    const location = response?.headers.get('location')
    expect(location).toContain('/login')
  })

  it('includes "from" query param in redirect URL', () => {
    const req = createMockRequest('/dashboard', false)
    const response = middleware(req)

    const location = response?.headers.get('location') ?? ''
    expect(location).toContain('from=%2Fdashboard')
  })

  it('redirects unauthenticated request from /dashboard/log to /login', () => {
    const req = createMockRequest('/dashboard/log', false)
    const response = middleware(req)

    const location = response?.headers.get('location') ?? ''
    expect(location).toContain('/login')
  })

  it('redirects unauthenticated request from /dashboard/settings to /login', () => {
    const req = createMockRequest('/dashboard/settings', false)
    const response = middleware(req)

    const location = response?.headers.get('location') ?? ''
    expect(location).toContain('/login')
  })

  it('allows authenticated request to /dashboard through', () => {
    const req = createMockRequest('/dashboard', true)
    const response = middleware(req)

    // Should NOT redirect — response should be NextResponse.next()
    const location = response?.headers.get('location')
    expect(location).toBeNull()
  })

  it('allows authenticated request to /dashboard/insights through', () => {
    const req = createMockRequest('/dashboard/insights', true)
    const response = middleware(req)

    const location = response?.headers.get('location')
    expect(location).toBeNull()
  })
})

// ─── Auth page redirect for logged-in users ───────────────────────────────────

describe('middleware — auth page redirect', () => {
  it('redirects authenticated user from /login to /dashboard', () => {
    const req = createMockRequest('/login', true)
    const response = middleware(req)

    const location = response?.headers.get('location') ?? ''
    expect(location).toContain('/dashboard')
  })

  it('redirects authenticated user from /signup to /dashboard', () => {
    const req = createMockRequest('/signup', true)
    const response = middleware(req)

    const location = response?.headers.get('location') ?? ''
    expect(location).toContain('/dashboard')
  })

  it('allows unauthenticated user to access /login', () => {
    const req = createMockRequest('/login', false)
    const response = middleware(req)

    const location = response?.headers.get('location')
    expect(location).toBeNull()
  })

  it('allows unauthenticated user to access /signup', () => {
    const req = createMockRequest('/signup', false)
    const response = middleware(req)

    const location = response?.headers.get('location')
    expect(location).toBeNull()
  })
})

// ─── Security headers ─────────────────────────────────────────────────────────

describe('middleware — security headers', () => {
  it('adds X-Frame-Options header to all responses', () => {
    const req = createMockRequest('/', false)
    const response = middleware(req)
    expect(response?.headers.get('X-Frame-Options')).toBe('DENY')
  })

  it('adds X-Content-Type-Options header to all responses', () => {
    const req = createMockRequest('/', false)
    const response = middleware(req)
    expect(response?.headers.get('X-Content-Type-Options')).toBe('nosniff')
  })

  it('adds Referrer-Policy header to all responses', () => {
    const req = createMockRequest('/', false)
    const response = middleware(req)
    expect(response?.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
  })

  it('adds security headers even on redirect responses', () => {
    const req = createMockRequest('/dashboard', false)
    const response = middleware(req)
    expect(response?.headers.get('X-Frame-Options')).toBe('DENY')
    expect(response?.headers.get('X-Content-Type-Options')).toBe('nosniff')
  })
})


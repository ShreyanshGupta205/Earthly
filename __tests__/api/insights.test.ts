/**
 * @jest-environment node
 *
 * Unit tests for app/api/insights/route.ts
 * Tests POST and GET handlers for AI-generated insights with validation, caching, and security headers.
 */

// Polyfill Web Fetch API globals for Next.js route handlers in Jest/Node
import 'next/dist/server/web/globals'

// Mock the Gemini AI module to avoid real API calls in tests
jest.mock('@/lib/ai/gemini', () => ({
  generateInsights: jest.fn().mockResolvedValue([
    {
      type: 'win',
      title: 'Great progress',
      text: 'You reduced your emissions by 10% this week.',
      metric: '10% reduction',
      action: 'Keep up the good habits.',
    },
    {
      type: 'alert',
      title: 'Transport dominates',
      text: 'Your transport emissions are the highest.',
      metric: '5.2 kg from transport',
      action: 'Try public transport once this week.',
    },
    {
      type: 'pattern',
      title: 'Consistent logging',
      text: 'You logged every day this week.',
      metric: '7-day streak',
      action: 'Continue logging to track trends.',
    },
    {
      type: 'info',
      title: 'India comparison',
      text: "Your daily average is below India's average.",
      metric: '3.2 kg vs 4.7 kg India avg',
      action: 'Aim for the 1.5°C target of 5.5 kg/day.',
    },
  ]),
}))

import { POST, GET } from '@/app/api/insights/route'

// Helper to build a POST Request
function createPostRequest(body: unknown): Request {
  return new Request('http://localhost/api/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// Helper to build a GET Request
function createGetRequest(params: Record<string, string>): Request {
  const url = new URL('http://localhost/api/insights')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new Request(url.toString(), { method: 'GET' })
}

const VALID_WEEKLY_DATA = {
  totalCO2: 22.4,
  byCategory: { transport: 12, food: 8, energy: 2.4 },
  dailyAvg: 3.2,
  previousWeek: 24.8,
  topActivity: 'transport',
}

// ─── POST handler ─────────────────────────────────────────────────────────────

describe('POST /api/insights', () => {
  // ── Validation errors (400) ────────────────────────────────────────────────

  it('returns 400 when userId is missing', async () => {
    const req = createPostRequest({ weekStart: '2024-01-08' })
    const response = await POST(req)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toBeDefined()
  })

  it('returns 400 when weekStart is missing', async () => {
    const req = createPostRequest({ userId: 'user_123' })
    const response = await POST(req)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toBeDefined()
  })

  it('returns 400 when userId is empty string', async () => {
    const req = createPostRequest({ userId: '', weekStart: '2024-01-08' })
    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it('returns 400 when weekStart is empty string', async () => {
    const req = createPostRequest({ userId: 'user_123', weekStart: '' })
    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it('returns 400 when weeklyData has negative totalCO2', async () => {
    const req = createPostRequest({
      userId: 'user_123',
      weekStart: '2024-01-15',
      weeklyData: { ...VALID_WEEKLY_DATA, totalCO2: -5 },
    })
    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  // ── Successful responses (200) ─────────────────────────────────────────────

  it('returns 200 with insights array for valid request with weeklyData', async () => {
    const req = createPostRequest({
      userId: 'user_test_1',
      weekStart: '2024-01-22',
      userName: 'Alice',
      weeklyData: VALID_WEEKLY_DATA,
    })
    const response = await POST(req)
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(Array.isArray(json.insights)).toBe(true)
    expect(json.insights.length).toBeGreaterThan(0)
    expect(json.cached).toBe(false)
  })

  it('returns 200 with insights even without weeklyData (onboarding path)', async () => {
    const req = createPostRequest({
      userId: 'user_test_2',
      weekStart: '2024-01-29',
    })
    const response = await POST(req)
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(Array.isArray(json.insights)).toBe(true)
    expect(json.cached).toBe(false)
  })

  it('returns cached insights on second call with same userId+weekStart', async () => {
    const payload = {
      userId: 'user_cache_test',
      weekStart: '2024-02-05',
      weeklyData: VALID_WEEKLY_DATA,
    }

    // First call — populates cache
    const req1 = createPostRequest(payload)
    const res1 = await POST(req1)
    const json1 = await res1.json()
    expect(json1.cached).toBe(false)

    // Second call — should hit cache
    const req2 = createPostRequest(payload)
    const res2 = await POST(req2)
    const json2 = await res2.json()
    expect(json2.cached).toBe(true)
  })

  it('insights array items have required fields', async () => {
    const req = createPostRequest({
      userId: 'user_test_3',
      weekStart: '2024-02-12',
      weeklyData: VALID_WEEKLY_DATA,
    })
    const response = await POST(req)
    const json = await response.json()
    for (const insight of json.insights) {
      expect(insight).toHaveProperty('type')
      expect(insight).toHaveProperty('title')
      expect(insight).toHaveProperty('text')
      expect(insight).toHaveProperty('metric')
      expect(insight).toHaveProperty('action')
    }
  })

  // ── Security headers ───────────────────────────────────────────────────────

  it('includes X-Content-Type-Options header in successful response', async () => {
    const req = createPostRequest({
      userId: 'user_sec_1',
      weekStart: '2024-03-04',
      weeklyData: VALID_WEEKLY_DATA,
    })
    const response = await POST(req)
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
  })

  it('includes X-Frame-Options header in error response', async () => {
    const req = createPostRequest({ userId: '' })
    const response = await POST(req)
    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
  })

  it('includes Referrer-Policy header on all responses', async () => {
    const req = createPostRequest({
      userId: 'user_sec_2',
      weekStart: '2024-03-11',
    })
    const response = await POST(req)
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
  })
})

// ─── GET handler ──────────────────────────────────────────────────────────────

describe('GET /api/insights', () => {
  it('returns empty insights array when no userId or weekStart provided', async () => {
    const req = createGetRequest({})
    const response = await GET(req)
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.insights).toEqual([])
  })

  it('returns empty insights array when only userId is provided', async () => {
    const req = createGetRequest({ userId: 'user_123' })
    const response = await GET(req)
    const json = await response.json()
    expect(json.insights).toEqual([])
  })

  it('returns empty insights array for cache miss', async () => {
    const req = createGetRequest({ userId: 'user_no_cache', weekStart: '2020-01-01' })
    const response = await GET(req)
    const json = await response.json()
    expect(json.insights).toEqual([])
  })

  it('returns cached insights from a prior POST', async () => {
    const userId = 'user_get_cached'
    const weekStart = '2024-04-01'

    // Prime cache via POST
    const postReq = createPostRequest({ userId, weekStart, weeklyData: VALID_WEEKLY_DATA })
    await POST(postReq)

    // GET should return cached
    const getReq = createGetRequest({ userId, weekStart })
    const response = await GET(getReq)
    const json = await response.json()
    expect(Array.isArray(json.insights)).toBe(true)
    expect(json.cached).toBe(true)
  })

  it('includes X-Content-Type-Options security header', async () => {
    const req = createGetRequest({})
    const response = await GET(req)
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
  })

  it('includes X-Frame-Options security header', async () => {
    const req = createGetRequest({ userId: 'user_123', weekStart: '2024-01-01' })
    const response = await GET(req)
    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
  })
})

// ─── Error handling ───────────────────────────────────────────────────────────

describe('POST /api/insights — error handling', () => {
  const { generateInsights } = require('@/lib/ai/gemini')

  it('returns 500 when generateInsights throws an Error', async () => {
    generateInsights.mockRejectedValueOnce(new Error('Gemini quota exceeded'))
    const req = createPostRequest({
      userId: 'user_err_1',
      weekStart: '2024-05-06',
      weeklyData: VALID_WEEKLY_DATA,
    })
    const response = await POST(req)
    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.error).toContain('Gemini quota exceeded')
  })

  it('returns 500 with fallback message when generateInsights throws a non-Error', async () => {
    // Exercises the `error instanceof Error ? ... : 'Internal server error'` false branch
    generateInsights.mockRejectedValueOnce('string error')
    const req = createPostRequest({
      userId: 'user_err_2',
      weekStart: '2024-05-13',
      weeklyData: VALID_WEEKLY_DATA,
    })
    const response = await POST(req)
    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.error).toBe('Internal server error')
    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
  })

  it('prunes the cache when size exceeds MAX_CACHE_SIZE', async () => {
    // Call POST multiple times with different userIds to exceed cache limit of 500
    for (let i = 0; i < 505; i++) {
      const req = createPostRequest({
        userId: `user_prune_${i}`,
        weekStart: '2024-01-01',
        weeklyData: VALID_WEEKLY_DATA,
      })
      const response = await POST(req)
      expect(response.status).toBe(200)
    }
  })
})


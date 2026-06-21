/**
 * @jest-environment node
 *
 * Unit tests for app/api/log/route.ts
 * Tests the POST handler for activity logging with validation and CO₂ calculation.
 */

// Polyfill Web Fetch API globals for Next.js route handlers in Jest/Node
import 'next/dist/server/web/globals'

import { POST } from '@/app/api/log/route'

// Helper to create a mock Request object
function createRequest(body: unknown, method = 'POST'): Request {
  return new Request('http://localhost/api/log', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ─── POST handler ─────────────────────────────────────────────────────────────

describe('POST /api/log', () => {
  // ── Valid requests ────────────────────────────────────────────────────────

  it('returns 200 with co2Kg and success:true for valid car_petrol log', async () => {
    const req = createRequest({
      category: 'transport',
      subType: 'car_petrol',
      quantity: 10,
      unit: 'km',
      userId: 'user_123',
    })

    const response = await POST(req)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.co2Kg).toBeCloseTo(2.1, 4)
  })

  it('returns 200 with correct co2Kg for beef meal', async () => {
    const req = createRequest({
      category: 'food',
      subType: 'beef',
      quantity: 2,
      unit: 'meal',
      userId: 'user_abc',
    })

    const response = await POST(req)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.co2Kg).toBeCloseTo(13.22, 2)
  })

  it('returns 200 for zero-emission activity (bicycle)', async () => {
    const req = createRequest({
      category: 'transport',
      subType: 'bicycle',
      quantity: 20,
      unit: 'km',
      userId: 'user_456',
    })

    const response = await POST(req)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.co2Kg).toBe(0)
  })

  it('accepts optional date and notes fields', async () => {
    const req = createRequest({
      category: 'energy',
      subType: 'electricity_grid',
      quantity: 5,
      unit: 'kWh',
      userId: 'user_789',
      date: '2024-01-15',
      notes: 'Home office usage',
    })

    const response = await POST(req)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
  })

  // ── Validation errors (400) ────────────────────────────────────────────

  it('returns 400 when category is missing', async () => {
    const req = createRequest({
      subType: 'car_petrol',
      quantity: 10,
      unit: 'km',
      userId: 'user_123',
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toBeDefined()
  })

  it('returns 400 when userId is missing', async () => {
    const req = createRequest({
      category: 'transport',
      subType: 'car_petrol',
      quantity: 10,
      unit: 'km',
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it('returns 400 when quantity is missing', async () => {
    const req = createRequest({
      category: 'transport',
      subType: 'car_petrol',
      unit: 'km',
      userId: 'user_123',
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it('returns 400 when quantity is zero (not positive)', async () => {
    const req = createRequest({
      category: 'transport',
      subType: 'car_petrol',
      quantity: 0,
      unit: 'km',
      userId: 'user_123',
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it('returns 400 when quantity is negative', async () => {
    const req = createRequest({
      category: 'transport',
      subType: 'car_petrol',
      quantity: -5,
      unit: 'km',
      userId: 'user_123',
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it('returns 400 when category is invalid enum value', async () => {
    const req = createRequest({
      category: 'invalid_category',
      subType: 'car_petrol',
      quantity: 10,
      unit: 'km',
      userId: 'user_123',
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it('returns 400 when unit is an empty string', async () => {
    const req = createRequest({
      category: 'transport',
      subType: 'car_petrol',
      quantity: 10,
      unit: '',
      userId: 'user_123',
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it('returns 400 when userId is empty string', async () => {
    const req = createRequest({
      category: 'transport',
      subType: 'car_petrol',
      quantity: 10,
      unit: 'km',
      userId: '',
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  // ── Server error (500) ────────────────────────────────────────────────

  it('returns 500 when subType has no emission factor', async () => {
    const req = createRequest({
      category: 'transport',
      subType: 'unknown_vehicle_type',
      quantity: 10,
      unit: 'km',
      userId: 'user_123',
    })

    const response = await POST(req)
    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.error).toContain('unknown_vehicle_type')
  })

  // ── Valid categories ──────────────────────────────────────────────────

  it.each([
    ['transport', 'car_diesel', 1, 'km'],
    ['food', 'chicken', 1, 'meal'],
    ['energy', 'lpg', 1, 'kg'],
    ['shopping', 'clothing', 1, 'item'],
    ['waste', 'recycled', 1, 'kg'],
    ['travel', 'train', 1, 'km'],
    ['home', 'heating_oil', 1, 'liter'],
  ])('returns 200 for category "%s" with subType "%s"', async (category, subType, quantity, unit) => {
    const req = createRequest({ category, subType, quantity, unit, userId: 'test_user' })
    const response = await POST(req)
    expect(response.status).toBe(200)
  })

  // ── Content-Type validation ───────────────────────────────────────

  it('returns 415 when Content-Type is not application/json', async () => {
    const req = new Request('http://localhost/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'some text',
    })

    const response = await POST(req)
    expect(response.status).toBe(415)
    const json = await response.json()
    expect(json.error).toContain('application/json')
  })

  // ── Security headers ──────────────────────────────────────────────

  it('includes X-Content-Type-Options header in successful response', async () => {
    const req = createRequest({
      category: 'transport',
      subType: 'car_petrol',
      quantity: 10,
      unit: 'km',
      userId: 'user_123',
    })

    const response = await POST(req)
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
  })

  it('includes X-Frame-Options header in error response', async () => {
    const req = createRequest({})
    const response = await POST(req)
    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
  })

  it('returns 415 when Content-Type header is absent', async () => {
    // Exercises the `?? ''` nullish coalescing branch on line 32 (null → empty string → 415)
    const req = new Request('http://localhost/api/log', {
      method: 'POST',
      body: JSON.stringify({ category: 'transport', subType: 'car_petrol', quantity: 10, unit: 'km', userId: 'user_123' }),
    })
    req.headers.delete('content-type')
    // No Content-Type header set — defaults to null, then empty string ''
    const response = await POST(req)
    // Empty string does not include 'application/json' → 415
    expect(response.status).toBe(415)
  })
})

// ─── Non-Error exception branch coverage ─────────────────────────────────────

describe('POST /api/log — non-Error exception', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.mock('@/lib/co2/calculator', () => ({
      calculateCO2: () => { throw 'string error' }, // eslint-disable-line @typescript-eslint/no-throw-literal
    }))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('returns 500 with generic message when a non-Error is thrown (instanceof Error false branch)', async () => {
    // Re-import route after mocking calculateCO2 to throw a non-Error
    const { POST: postFn } = await import('@/app/api/log/route')
    const req = new Request('http://localhost/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'transport',
        subType: 'car_petrol',
        quantity: 10,
        unit: 'km',
        userId: 'user_123',
      }),
    })
    const response = await postFn(req)
    expect(response.status).toBe(500)
    const json = await response.json()
    // Non-Error → 'Internal server error'
    expect(json.error).toBe('Internal server error')
  })
})


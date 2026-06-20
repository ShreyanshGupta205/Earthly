import { NextResponse } from 'next/server'
import { z } from 'zod'
import { calculateCO2 } from '@/lib/co2/calculator'

/** Zod schema for validating incoming activity log requests. */
const LogSchema = z.object({
  category: z.enum(['transport', 'food', 'energy', 'shopping', 'waste', 'travel', 'home']),
  subType:  z.string().min(1),
  quantity: z.number().positive(),
  unit:     z.string().min(1),
  date:     z.string().optional(),
  notes:    z.string().optional(),
  userId:   z.string().min(1),
})

/** Common security headers for all API responses. */
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
} as const

/**
 * POST /api/log
 *
 * Validates the activity log payload with Zod, computes the CO₂ value
 * server-side using trusted emission factors, and returns it.
 * The actual Firestore write happens client-side for performance.
 */
export async function POST(req: Request) {
  try {
    // Reject non-JSON content types
    const contentType = req.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415, headers: SECURITY_HEADERS }
      )
    }

    const body = await req.json()
    const parsed = LogSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const { subType, quantity } = parsed.data
    const co2Kg = calculateCO2({ subType, quantity })

    return NextResponse.json(
      { co2Kg, success: true },
      { headers: SECURITY_HEADERS }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

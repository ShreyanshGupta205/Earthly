import { NextResponse } from 'next/server'
import { z } from 'zod'
import { calculateCO2 } from '@/lib/co2/calculator'

const LogSchema = z.object({
  category: z.enum(['transport', 'food', 'energy', 'shopping', 'waste', 'travel', 'home']),
  subType:  z.string().min(1),
  quantity: z.number().positive(),
  unit:     z.string().min(1),
  date:     z.string().optional(),
  notes:    z.string().optional(),
  userId:   z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = LogSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { subType, quantity } = parsed.data
    const co2Kg = calculateCO2({ subType, quantity })

    // The actual Firestore write happens client-side via firestore.ts
    // This route validates + computes CO₂ server-side for security
    return NextResponse.json({ co2Kg, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

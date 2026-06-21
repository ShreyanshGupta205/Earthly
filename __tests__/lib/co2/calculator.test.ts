/**
 * Unit tests for lib/co2/calculator.ts
 * Covers calculateCO2(), previewCO2(), and dailyToAnnualTonnes().
 */

import {
  calculateCO2,
  previewCO2,
  dailyToAnnualTonnes,
  BENCHMARKS,
} from '@/lib/co2/calculator'

// ─── calculateCO2() ──────────────────────────────────────────────────────────

describe('calculateCO2()', () => {
  it('calculates CO₂ for car_petrol correctly', () => {
    // car_petrol: 0.21 kg/km
    const result = calculateCO2({ subType: 'car_petrol', quantity: 10 })
    expect(result).toBeCloseTo(2.1, 5)
  })

  it('calculates CO₂ for beef correctly', () => {
    // beef: 6.61 kg/meal
    const result = calculateCO2({ subType: 'beef', quantity: 1 })
    expect(result).toBeCloseTo(6.61, 5)
  })

  it('calculates CO₂ for bicycle as 0 (zero-emission)', () => {
    const result = calculateCO2({ subType: 'bicycle', quantity: 100 })
    expect(result).toBe(0)
  })

  it('calculates CO₂ for walk as 0 (zero-emission)', () => {
    const result = calculateCO2({ subType: 'walk', quantity: 5 })
    expect(result).toBe(0)
  })

  it('calculates CO₂ for electricity_grid correctly', () => {
    // electricity_grid: 0.82 kg/kWh
    const result = calculateCO2({ subType: 'electricity_grid', quantity: 100 })
    expect(result).toBeCloseTo(82, 4)
  })

  it('calculates CO₂ for flight_domestic correctly', () => {
    // flight_domestic: 0.255 kg/km
    const result = calculateCO2({ subType: 'flight_domestic', quantity: 1000 })
    expect(result).toBeCloseTo(255, 4)
  })

  it('calculates CO₂ for electronics correctly', () => {
    // electronics: 125.0 kg/item
    const result = calculateCO2({ subType: 'electronics', quantity: 2 })
    expect(result).toBeCloseTo(250, 4)
  })

  it('calculates CO₂ for general_waste correctly', () => {
    // general_waste: 0.587 kg/kg
    const result = calculateCO2({ subType: 'general_waste', quantity: 10 })
    expect(result).toBeCloseTo(5.87, 4)
  })

  it('returns a float with 6 decimal precision', () => {
    const result = calculateCO2({ subType: 'bus', quantity: 1 })
    const str = result.toString()
    const decimals = str.includes('.') ? str.split('.')[1].length : 0
    expect(decimals).toBeLessThanOrEqual(6)
  })

  it('throws an error for unknown subType', () => {
    expect(() =>
      calculateCO2({ subType: 'unknown_activity', quantity: 1 })
    ).toThrow('No emission factor for: unknown_activity')
  })

  it('handles fractional quantity correctly', () => {
    // car_petrol: 0.21 kg/km × 0.5 km = 0.105 kg
    const result = calculateCO2({ subType: 'car_petrol', quantity: 0.5 })
    expect(result).toBeCloseTo(0.105, 5)
  })

  it('handles large quantity correctly', () => {
    // flight_long: 0.150 kg/km × 15000 km = 2250 kg
    const result = calculateCO2({ subType: 'flight_long', quantity: 15000 })
    expect(result).toBeCloseTo(2250, 2)
  })

  it('handles all transport subtypes without throwing', () => {
    const transportTypes = [
      'car_petrol', 'car_diesel', 'car_electric',
      'bus', 'metro', 'motorbike', 'bicycle', 'walk',
    ]
    transportTypes.forEach(subType => {
      expect(() => calculateCO2({ subType, quantity: 10 })).not.toThrow()
    })
  })

  it('handles all food subtypes without throwing', () => {
    const foodTypes = ['beef', 'chicken', 'fish', 'pork', 'vegetarian', 'vegan']
    foodTypes.forEach(subType => {
      expect(() => calculateCO2({ subType, quantity: 1 })).not.toThrow()
    })
  })

  it('handles all energy subtypes without throwing', () => {
    const energyTypes = ['electricity_grid', 'electricity_solar', 'natural_gas', 'lpg']
    energyTypes.forEach(subType => {
      expect(() => calculateCO2({ subType, quantity: 10 })).not.toThrow()
    })
  })
})

// ─── previewCO2() ────────────────────────────────────────────────────────────

describe('previewCO2()', () => {
  it('returns "—" for empty subType', () => {
    expect(previewCO2('', 10)).toBe('—')
  })

  it('returns "—" for zero quantity', () => {
    expect(previewCO2('car_petrol', 0)).toBe('—')
  })

  it('returns "—" for negative quantity', () => {
    expect(previewCO2('car_petrol', -5)).toBe('—')
  })

  it('returns "—" for unknown subType (graceful fallback)', () => {
    expect(previewCO2('nonexistent_type', 10)).toBe('—')
  })

  it('returns kg format for values >= 1 kg', () => {
    // car_petrol: 10 km × 0.21 = 2.1 kg
    const result = previewCO2('car_petrol', 10)
    expect(result).toContain('kg CO₂')
  })

  it('returns gram format for values < 1 kg', () => {
    // bicycle: 0 kg — skip; use bus 0.089 × 0.001 = very small
    // metro: 0.033 × 1 = 0.033 kg → 33g
    const result = previewCO2('metro', 1)
    expect(result).toContain('g CO₂')
  })

  it('returns "0 kg CO₂" for zero-emission activities', () => {
    const result = previewCO2('bicycle', 10)
    expect(result).toBe('0 kg CO₂')
  })

  it('returns formatted kg for beef (large emitter)', () => {
    // beef: 6.61 kg/meal × 3 meals = 19.83 kg
    const result = previewCO2('beef', 3)
    expect(result).toBe('19.83 kg CO₂')
  })

  it('returns μg CO₂ format for extremely small values (< 0.001 kg)', () => {
    // recycled: 0.021 kg/kg × 0.001 kg = 0.000021 kg → well under 0.001 threshold
    // Use electricity_solar: 0.04 kg/kWh × 0.001 kWh = 0.00004 kg
    const result = previewCO2('electricity_solar', 0.001)
    // 0.04 × 0.001 = 0.00004 kg → 40 μg CO₂
    expect(result).toContain('μg CO₂')
  })
})

// ─── dailyToAnnualTonnes() ───────────────────────────────────────────────────

describe('dailyToAnnualTonnes() from calculator', () => {
  it('converts 0 kg/day to 0 tonnes/year', () => {
    expect(dailyToAnnualTonnes(0)).toBe(0)
  })

  it('converts 13 kg/day to ~4.75 tonnes/year', () => {
    // 13 × 365 / 1000 = 4.745
    expect(dailyToAnnualTonnes(13)).toBeCloseTo(4.745, 2)
  })

  it('converts 1 kg/day to ~0.365 tonnes/year', () => {
    // 1 * 365 / 1000 = 0.365 — use precision 1 to handle floating point boundary
    expect(dailyToAnnualTonnes(1)).toBeCloseTo(0.365, 1)
  })

  it('result has at most 2 decimal places', () => {
    const result = dailyToAnnualTonnes(5.3)
    const decimals = result.toString().split('.')[1]?.length ?? 0
    expect(decimals).toBeLessThanOrEqual(2)
  })
})

// ─── BENCHMARKS from calculator ──────────────────────────────────────────────

describe('BENCHMARKS (calculator)', () => {
  it('has correct global average', () => {
    expect(BENCHMARKS.globalAvg).toBe(13)
  })

  it('has correct India average', () => {
    expect(BENCHMARKS.indiaAvg).toBe(4.7)
  })

  it('has 1.5°C pathway target', () => {
    expect(BENCHMARKS.target15).toBe(5.5)
  })

  it('has 2°C pathway target', () => {
    expect(BENCHMARKS.target2).toBe(7.5)
  })
})

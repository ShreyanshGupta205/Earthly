/**
 * Unit tests for lib/co2/factors.ts
 * Validates emission factor data integrity and helper functions.
 */

import {
  EMISSION_FACTORS,
  getFactorsByCategory,
  CATEGORIES,
} from '@/lib/co2/factors'
import type { Category } from '@/types'

// ─── EMISSION_FACTORS data integrity ─────────────────────────────────────────

describe('EMISSION_FACTORS', () => {
  it('contains at least 28 emission factors', () => {
    expect(Object.keys(EMISSION_FACTORS).length).toBeGreaterThanOrEqual(28)
  })

  it('every factor has a valid co2PerUnit >= 0', () => {
    Object.values(EMISSION_FACTORS).forEach(factor => {
      expect(factor.co2PerUnit).toBeGreaterThanOrEqual(0)
    })
  })

  it('every factor has a non-empty label', () => {
    Object.values(EMISSION_FACTORS).forEach(factor => {
      expect(factor.label.length).toBeGreaterThan(0)
    })
  })

  it('every factor has a non-empty unit', () => {
    Object.values(EMISSION_FACTORS).forEach(factor => {
      expect(factor.unit.length).toBeGreaterThan(0)
    })
  })

  it('every factor has a non-empty source', () => {
    Object.values(EMISSION_FACTORS).forEach(factor => {
      expect(factor.source.length).toBeGreaterThan(0)
    })
  })

  it('every factor key matches its subType property', () => {
    Object.entries(EMISSION_FACTORS).forEach(([key, factor]) => {
      expect(factor.subType).toBe(key)
    })
  })

  it('every factor belongs to a valid category', () => {
    const validCategories: Category[] = [
      'transport', 'food', 'energy', 'shopping', 'waste', 'travel', 'home'
    ]
    Object.values(EMISSION_FACTORS).forEach(factor => {
      expect(validCategories).toContain(factor.category)
    })
  })

  // ── Specific factor values ──────────────────────────────────────────────

  it('car_petrol factor is 0.21 kg/km', () => {
    expect(EMISSION_FACTORS['car_petrol'].co2PerUnit).toBe(0.21)
  })

  it('bicycle factor is 0 (zero-emission)', () => {
    expect(EMISSION_FACTORS['bicycle'].co2PerUnit).toBe(0)
  })

  it('beef factor is 6.61 kg/meal', () => {
    expect(EMISSION_FACTORS['beef'].co2PerUnit).toBe(6.61)
  })

  it('vegan factor is 0.56 kg/meal', () => {
    expect(EMISSION_FACTORS['vegan'].co2PerUnit).toBe(0.56)
  })

  it('electricity_grid factor is 0.82 kg/kWh', () => {
    expect(EMISSION_FACTORS['electricity_grid'].co2PerUnit).toBe(0.82)
  })

  it('electronics factor is 125.0 kg/item', () => {
    expect(EMISSION_FACTORS['electronics'].co2PerUnit).toBe(125.0)
  })

  it('flight_long factor is less than flight_domestic (longer but more efficient per km)', () => {
    expect(EMISSION_FACTORS['flight_long'].co2PerUnit)
      .toBeLessThan(EMISSION_FACTORS['flight_domestic'].co2PerUnit)
  })

  it('car_electric factor is significantly lower than car_petrol', () => {
    expect(EMISSION_FACTORS['car_electric'].co2PerUnit)
      .toBeLessThan(EMISSION_FACTORS['car_petrol'].co2PerUnit)
  })

  // ── Category coverage ──────────────────────────────────────────────────

  it('has transport factors', () => {
    const transportKeys = ['car_petrol', 'car_diesel', 'car_electric', 'bus', 'metro', 'motorbike', 'bicycle', 'walk']
    transportKeys.forEach(key => {
      expect(EMISSION_FACTORS).toHaveProperty(key)
    })
  })

  it('has food factors', () => {
    const foodKeys = ['beef', 'chicken', 'fish', 'pork', 'vegetarian', 'vegan']
    foodKeys.forEach(key => {
      expect(EMISSION_FACTORS).toHaveProperty(key)
    })
  })

  it('has energy factors', () => {
    const energyKeys = ['electricity_grid', 'electricity_solar', 'natural_gas', 'lpg']
    energyKeys.forEach(key => {
      expect(EMISSION_FACTORS).toHaveProperty(key)
    })
  })

  it('has travel factors', () => {
    const travelKeys = ['flight_domestic', 'flight_short', 'flight_long', 'train']
    travelKeys.forEach(key => {
      expect(EMISSION_FACTORS).toHaveProperty(key)
    })
  })

  it('has shopping factors', () => {
    const shoppingKeys = ['clothing', 'electronics', 'online_order']
    shoppingKeys.forEach(key => {
      expect(EMISSION_FACTORS).toHaveProperty(key)
    })
  })

  it('has waste factors', () => {
    const wasteKeys = ['general_waste', 'recycled']
    wasteKeys.forEach(key => {
      expect(EMISSION_FACTORS).toHaveProperty(key)
    })
  })

  it('has home factors', () => {
    const homeKeys = ['heating_oil', 'wood_burning']
    homeKeys.forEach(key => {
      expect(EMISSION_FACTORS).toHaveProperty(key)
    })
  })
})

// ─── getFactorsByCategory() ───────────────────────────────────────────────────

describe('getFactorsByCategory()', () => {
  it('returns only transport factors for "transport"', () => {
    const factors = getFactorsByCategory('transport')
    factors.forEach(f => expect(f.category).toBe('transport'))
  })

  it('returns only food factors for "food"', () => {
    const factors = getFactorsByCategory('food')
    factors.forEach(f => expect(f.category).toBe('food'))
  })

  it('returns at least 6 food factors', () => {
    const factors = getFactorsByCategory('food')
    expect(factors.length).toBeGreaterThanOrEqual(6)
  })

  it('returns at least 8 transport factors', () => {
    const factors = getFactorsByCategory('transport')
    expect(factors.length).toBeGreaterThanOrEqual(8)
  })

  it('returns at least 4 energy factors', () => {
    const factors = getFactorsByCategory('energy')
    expect(factors.length).toBeGreaterThanOrEqual(4)
  })

  it('returns non-empty array for all valid categories', () => {
    const categories: Category[] = ['transport', 'food', 'energy', 'shopping', 'waste', 'travel', 'home']
    categories.forEach(cat => {
      const factors = getFactorsByCategory(cat)
      expect(factors.length).toBeGreaterThan(0)
    })
  })

  it('returns factors with valid co2PerUnit', () => {
    const factors = getFactorsByCategory('energy')
    factors.forEach(f => {
      expect(typeof f.co2PerUnit).toBe('number')
      expect(f.co2PerUnit).toBeGreaterThanOrEqual(0)
    })
  })
})

// ─── CATEGORIES array ─────────────────────────────────────────────────────────

describe('CATEGORIES', () => {
  it('contains all 7 expected categories', () => {
    expect(CATEGORIES).toContain('transport')
    expect(CATEGORIES).toContain('food')
    expect(CATEGORIES).toContain('energy')
    expect(CATEGORIES).toContain('shopping')
    expect(CATEGORIES).toContain('waste')
    expect(CATEGORIES).toContain('travel')
    expect(CATEGORIES).toContain('home')
  })

  it('has exactly 7 categories', () => {
    expect(CATEGORIES).toHaveLength(7)
  })

  it('has no duplicate categories', () => {
    const unique = new Set(CATEGORIES)
    expect(unique.size).toBe(CATEGORIES.length)
  })
})

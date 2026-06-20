/**
 * Unit tests for lib/utils.ts
 * Covers all exported utility functions.
 */

import {
  cn,
  formatCO2,
  formatDate,
  getRelativeDate,
  calcGreenScore,
  getLevel,
  getCO2Color,
  getWeekStart,
  getLastNDays,
  kgToTonnes,
  dailyToAnnualTonnes,
  clamp,
  getShortDay,
  generateActions,
  formatNumber,
  BENCHMARKS,
} from '@/lib/utils'

// ─── cn() ────────────────────────────────────────────────────────────────────

describe('cn()', () => {
  it('joins truthy class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('filters out falsy values (undefined, false, null, empty)', () => {
    expect(cn('foo', undefined, false, null, '', 'bar')).toBe('foo bar')
  })

  it('returns empty string when all values are falsy', () => {
    expect(cn(undefined, false)).toBe('')
  })

  it('handles a single class', () => {
    expect(cn('only-class')).toBe('only-class')
  })
})

// ─── formatCO2() ─────────────────────────────────────────────────────────────

describe('formatCO2()', () => {
  it('formats values >= 1000 kg as tonnes with 2 decimal places', () => {
    expect(formatCO2(1000)).toBe('1.00t')
    expect(formatCO2(2500)).toBe('2.50t')
    expect(formatCO2(1500.5)).toBe('1.50t')
  })

  it('formats values >= 1 kg as kg with 2 decimal places', () => {
    expect(formatCO2(1)).toBe('1.00kg')
    expect(formatCO2(5.678)).toBe('5.68kg')
    expect(formatCO2(999.99)).toBe('999.99kg')
  })

  it('formats values < 1 kg as grams (rounded to integer)', () => {
    expect(formatCO2(0.5)).toBe('500g')
    expect(formatCO2(0.001)).toBe('1g')
    expect(formatCO2(0.2134)).toBe('213g')
  })

  it('handles zero', () => {
    expect(formatCO2(0)).toBe('0g')
  })
})

// ─── formatDate() ────────────────────────────────────────────────────────────

describe('formatDate()', () => {
  it('returns a formatted date string', () => {
    const result = formatDate('2024-01-15')
    // Should contain day, month, year
    expect(result).toMatch(/\d{2}/)
    expect(result).toMatch(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)
    expect(result).toMatch(/2024/)
  })

  it('formats different months correctly', () => {
    const dec = formatDate('2024-12-25')
    expect(dec).toMatch(/Dec/)
    const jun = formatDate('2024-06-01')
    expect(jun).toMatch(/Jun/)
  })
})

// ─── getRelativeDate() ───────────────────────────────────────────────────────

describe('getRelativeDate()', () => {
  it('returns "Today" for today\'s date', () => {
    const today = new Date().toISOString().split('T')[0]
    expect(getRelativeDate(today)).toBe('Today')
  })

  it('returns "Yesterday" for yesterday\'s date', () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    const yesterday = d.toISOString().split('T')[0]
    expect(getRelativeDate(yesterday)).toBe('Yesterday')
  })

  it('returns "Xd ago" for dates within the last week', () => {
    const d = new Date()
    d.setDate(d.getDate() - 3)
    const threeDaysAgo = d.toISOString().split('T')[0]
    expect(getRelativeDate(threeDaysAgo)).toBe('3d ago')
  })

  it('returns formatted date for dates older than 7 days', () => {
    const d = new Date()
    d.setDate(d.getDate() - 10)
    const tenDaysAgo = d.toISOString().split('T')[0]
    const result = getRelativeDate(tenDaysAgo)
    // Should be a formatted date, not "Xd ago"
    expect(result).not.toMatch(/d ago/)
    expect(result).not.toBe('Today')
    expect(result).not.toBe('Yesterday')
  })
})

// ─── calcGreenScore() ────────────────────────────────────────────────────────

describe('calcGreenScore()', () => {
  it('returns 100 for 0 kg/day', () => {
    expect(calcGreenScore(0)).toBe(100)
  })

  it('returns 0 for global average (13 kg/day)', () => {
    expect(calcGreenScore(13)).toBe(0)
  })

  it('returns 0 for values above global average', () => {
    expect(calcGreenScore(20)).toBe(0)
    expect(calcGreenScore(100)).toBe(0)
  })

  it('returns a value between 0 and 100 for average emissions', () => {
    const score = calcGreenScore(6.5)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(100)
  })

  it('returns approximately 50 for half the global average', () => {
    // (1 - 6.5/13) * 100 = 50
    expect(calcGreenScore(6.5)).toBeCloseTo(50, 0)
  })

  it('result is always rounded to 1 decimal place', () => {
    const score = calcGreenScore(7)
    const str = score.toString()
    const decimals = str.includes('.') ? str.split('.')[1].length : 0
    expect(decimals).toBeLessThanOrEqual(1)
  })
})

// ─── getLevel() ──────────────────────────────────────────────────────────────

describe('getLevel()', () => {
  it('returns the lowest level for score 0', () => {
    const level = getLevel(0)
    expect(level).toBeDefined()
    expect(level.label).toBe('Carbon Starter')
  })

  it('returns Planet Guardian for score >= 80', () => {
    const level = getLevel(80)
    expect(level.label).toBe('Planet Guardian')
  })

  it('returns Carbon Hero for score >= 95', () => {
    const level = getLevel(95)
    expect(level.label).toBe('Carbon Hero')
  })

  it('returns the correct level for score 50', () => {
    const level = getLevel(50)
    expect(['Green Thinker', 'Climate Champion']).toContain(level.label)
  })

  it('every level has required properties', () => {
    const level = getLevel(60)
    expect(level).toHaveProperty('min')
    expect(level).toHaveProperty('label')
    expect(level).toHaveProperty('color')
    expect(level).toHaveProperty('emoji')
  })
})

// ─── getCO2Color() ───────────────────────────────────────────────────────────

describe('getCO2Color()', () => {
  it('returns green color for annual tonnes <= 2', () => {
    expect(getCO2Color(0)).toBe('#CAFF33')
    expect(getCO2Color(2)).toBe('#CAFF33')
  })

  it('returns amber color for annual tonnes > 2 and <= 6', () => {
    expect(getCO2Color(3)).toBe('#F5A523')
    expect(getCO2Color(6)).toBe('#F5A523')
  })

  it('returns red color for annual tonnes > 6', () => {
    expect(getCO2Color(6.1)).toBe('#FF4F4F')
    expect(getCO2Color(20)).toBe('#FF4F4F')
  })
})

// ─── getWeekStart() ──────────────────────────────────────────────────────────

describe('getWeekStart()', () => {
  it('returns a date string in YYYY-MM-DD format', () => {
    const result = getWeekStart()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns the Monday of the current week', () => {
    const result = getWeekStart()
    const day = new Date(result).getDay()
    expect(day).toBe(1) // 1 = Monday
  })

  it('returns correct Monday for a Wednesday input', () => {
    const wednesday = new Date('2024-01-10') // Wednesday
    const weekStart = getWeekStart(wednesday)
    expect(weekStart).toBe('2024-01-08') // Monday
  })

  it('returns correct Monday when date is already Monday', () => {
    const monday = new Date('2024-01-08')
    expect(getWeekStart(monday)).toBe('2024-01-08')
  })

  it('returns correct Monday for a Sunday', () => {
    const sunday = new Date('2024-01-07') // Sunday
    const weekStart = getWeekStart(sunday)
    expect(weekStart).toBe('2024-01-01') // Previous Monday
  })
})

// ─── getLastNDays() ──────────────────────────────────────────────────────────

describe('getLastNDays()', () => {
  it('returns an array of n date strings', () => {
    const days = getLastNDays(7)
    expect(days).toHaveLength(7)
  })

  it('returns dates in ascending order (oldest first)', () => {
    const days = getLastNDays(3)
    const sorted = [...days].sort()
    expect(days).toEqual(sorted)
  })

  it('last element is today', () => {
    const days = getLastNDays(7)
    const today = new Date().toISOString().split('T')[0]
    expect(days[days.length - 1]).toBe(today)
  })

  it('all dates are in YYYY-MM-DD format', () => {
    const days = getLastNDays(5)
    days.forEach(d => {
      expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  it('returns 1 day for n=1 (today)', () => {
    const days = getLastNDays(1)
    expect(days).toHaveLength(1)
    const today = new Date().toISOString().split('T')[0]
    expect(days[0]).toBe(today)
  })
})

// ─── kgToTonnes() ────────────────────────────────────────────────────────────

describe('kgToTonnes()', () => {
  it('converts 1000 kg to 1.00 tonnes', () => {
    expect(kgToTonnes(1000)).toBe(1)
  })

  it('converts 2500 kg to 2.50 tonnes', () => {
    expect(kgToTonnes(2500)).toBe(2.5)
  })

  it('converts 0 kg to 0 tonnes', () => {
    expect(kgToTonnes(0)).toBe(0)
  })

  it('rounds to 2 decimal places', () => {
    // 1234 / 1000 = 1.234 → rounds to 1.23
    expect(kgToTonnes(1234)).toBe(1.23)
  })
})

// ─── dailyToAnnualTonnes() ───────────────────────────────────────────────────

describe('dailyToAnnualTonnes()', () => {
  it('converts 1 kg/day to ~0.365 tonnes/year', () => {
    // 1 * 365 / 1000 = 0.365 — use precision 1 to handle floating point boundary
    expect(dailyToAnnualTonnes(1)).toBeCloseTo(0.365, 1)
  })

  it('converts 13 kg/day (global avg) to ~4.75 tonnes/year', () => {
    expect(dailyToAnnualTonnes(13)).toBeCloseTo(4.745, 2)
  })

  it('returns 0 for 0 kg/day', () => {
    expect(dailyToAnnualTonnes(0)).toBe(0)
  })

  it('result has at most 2 decimal places', () => {
    const result = dailyToAnnualTonnes(7)
    const str = result.toString()
    const decimals = str.includes('.') ? str.split('.')[1].length : 0
    expect(decimals).toBeLessThanOrEqual(2)
  })
})

// ─── clamp() ─────────────────────────────────────────────────────────────────

describe('clamp()', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('returns min when value is below min', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('returns max when value is above max', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('returns min/max when value equals boundary', () => {
    expect(clamp(0, 0, 10)).toBe(0)
    expect(clamp(10, 0, 10)).toBe(10)
  })
})

// ─── formatNumber() ──────────────────────────────────────────────────────────

describe('formatNumber()', () => {
  it('formats numbers with default 1 decimal', () => {
    const result = formatNumber(1234.567)
    expect(result).toContain('1')
    expect(result).toContain('234')
  })

  it('respects custom decimal places', () => {
    const result = formatNumber(1.23456, 3)
    expect(result).toContain('1.23')
  })
})

// ─── getShortDay() ───────────────────────────────────────────────────────────

describe('getShortDay()', () => {
  it('returns a 3-letter weekday abbreviation', () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const result = getShortDay('2024-01-15') // Monday
    expect(days).toContain(result)
  })

  it('returns Mon for 2024-01-15 (a Monday)', () => {
    expect(getShortDay('2024-01-15')).toBe('Mon')
  })

  it('returns Fri for 2024-01-19 (a Friday)', () => {
    expect(getShortDay('2024-01-19')).toBe('Fri')
  })
})

// ─── BENCHMARKS constant ─────────────────────────────────────────────────────

describe('BENCHMARKS', () => {
  it('has expected benchmark values', () => {
    expect(BENCHMARKS.globalAvg).toBe(13)
    expect(BENCHMARKS.indiaAvg).toBe(4.7)
    expect(BENCHMARKS.target15).toBe(5.5)
    expect(BENCHMARKS.target2).toBe(7.5)
  })
})

// ─── generateActions() ───────────────────────────────────────────────────────

describe('generateActions()', () => {
  it('returns an action for each of the top 3 categories', () => {
    const topCategories = [
      { category: 'transport', co2: 5 },
      { category: 'food', co2: 3 },
      { category: 'energy', co2: 2 },
    ]
    const actions = generateActions(topCategories)
    expect(actions).toHaveLength(3)
  })

  it('each action has title, category, and savingKg', () => {
    const topCategories = [{ category: 'transport', co2: 5 }]
    const actions = generateActions(topCategories)
    expect(actions[0]).toHaveProperty('title')
    expect(actions[0]).toHaveProperty('category')
    expect(actions[0]).toHaveProperty('savingKg')
  })

  it('uses only top 3 even if more categories are provided', () => {
    const topCategories = [
      { category: 'transport', co2: 10 },
      { category: 'food', co2: 8 },
      { category: 'energy', co2: 6 },
      { category: 'shopping', co2: 4 },
      { category: 'waste', co2: 2 },
    ]
    const actions = generateActions(topCategories)
    expect(actions.length).toBeLessThanOrEqual(3)
  })

  it('handles unknown category gracefully', () => {
    const topCategories = [{ category: 'unknown_category', co2: 5 }]
    // Should not throw — just returns empty or partial
    expect(() => generateActions(topCategories as any)).not.toThrow()
  })

  it('returns empty array for empty input', () => {
    const actions = generateActions([])
    expect(actions).toHaveLength(0)
  })

  it('savingKg is a positive number', () => {
    const topCategories = [{ category: 'food', co2: 5 }]
    const actions = generateActions(topCategories)
    expect(actions[0].savingKg).toBeGreaterThan(0)
  })
})

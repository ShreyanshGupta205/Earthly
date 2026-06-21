/**
 * Unit tests for lib/analytics.ts
 * Tests the GA4 event tracking wrapper and predefined Analytics events.
 *
 * @jest-environment jsdom
 */

import { trackEvent, Analytics } from '@/lib/analytics'

// ─── Setup: mock window.gtag ─────────────────────────────────────────────────

const mockGtag = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  // Assign mock gtag directly to the jsdom window object
  window.gtag = mockGtag
})

afterEach(() => {
  // Clean up to avoid test pollution
  // @ts-expect-error intentional cleanup
  delete window.gtag
})

// ─── trackEvent() ─────────────────────────────────────────────────────────────

describe('trackEvent()', () => {
  it('calls window.gtag with event name when no params provided', () => {
    trackEvent('test_event')
    expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', undefined)
  })

  it('calls window.gtag with event name and params', () => {
    trackEvent('log_activity', { category: 'transport', co2_kg: 2.1 })
    expect(mockGtag).toHaveBeenCalledWith('event', 'log_activity', {
      category: 'transport',
      co2_kg: 2.1,
    })
  })

  it('does not throw when window.gtag is not defined', () => {
    // @ts-expect-error intentional test of missing gtag
    delete window.gtag
    expect(() => trackEvent('no_gtag_event')).not.toThrow()
    expect(mockGtag).not.toHaveBeenCalled()
    // Restore for afterEach
    window.gtag = mockGtag
  })

  it('passes through arbitrary params', () => {
    trackEvent('custom', { foo: 'bar', count: 42 })
    expect(mockGtag).toHaveBeenCalledWith('event', 'custom', { foo: 'bar', count: 42 })
  })

  it('calls gtag exactly once per invocation', () => {
    trackEvent('single_call')
    expect(mockGtag).toHaveBeenCalledTimes(1)
  })
})

// ─── Analytics.logActivity() ──────────────────────────────────────────────────

describe('Analytics.logActivity()', () => {
  it('tracks log_activity event with category and co2_kg', () => {
    Analytics.logActivity('transport', 2.1)
    expect(mockGtag).toHaveBeenCalledWith('event', 'log_activity', {
      category: 'transport',
      co2_kg: 2.1,
    })
  })

  it('works with zero co2 (zero-emission activities)', () => {
    Analytics.logActivity('transport', 0)
    expect(mockGtag).toHaveBeenCalledWith('event', 'log_activity', {
      category: 'transport',
      co2_kg: 0,
    })
  })

  it('works with multiple emission categories', () => {
    const categories = ['transport', 'food', 'energy', 'shopping', 'waste', 'travel', 'home']
    categories.forEach(category => {
      Analytics.logActivity(category, 1.0)
    })
    expect(mockGtag).toHaveBeenCalledTimes(categories.length)
  })
})

// ─── Analytics.viewInsights() ────────────────────────────────────────────────

describe('Analytics.viewInsights()', () => {
  it('tracks view_insights event with no params', () => {
    Analytics.viewInsights()
    expect(mockGtag).toHaveBeenCalledWith('event', 'view_insights', undefined)
  })
})

// ─── Analytics.completeAction() ──────────────────────────────────────────────

describe('Analytics.completeAction()', () => {
  it('tracks complete_action event with title and saving_kg', () => {
    Analytics.completeAction('Walk or cycle', 0.42)
    expect(mockGtag).toHaveBeenCalledWith('event', 'complete_action', {
      action_title: 'Walk or cycle',
      saving_kg: 0.42,
    })
  })
})

// ─── Analytics.signup() ──────────────────────────────────────────────────────

describe('Analytics.signup()', () => {
  it('tracks sign_up event with google method', () => {
    Analytics.signup('google')
    expect(mockGtag).toHaveBeenCalledWith('event', 'sign_up', { method: 'google' })
  })

  it('tracks sign_up event with email method', () => {
    Analytics.signup('email')
    expect(mockGtag).toHaveBeenCalledWith('event', 'sign_up', { method: 'email' })
  })
})

// ─── Analytics.login() ───────────────────────────────────────────────────────

describe('Analytics.login()', () => {
  it('tracks login event with google method', () => {
    Analytics.login('google')
    expect(mockGtag).toHaveBeenCalledWith('event', 'login', { method: 'google' })
  })

  it('tracks login event with email method', () => {
    Analytics.login('email')
    expect(mockGtag).toHaveBeenCalledWith('event', 'login', { method: 'email' })
  })
})

// ─── Analytics.exportCSV() ───────────────────────────────────────────────────

describe('Analytics.exportCSV()', () => {
  it('tracks export_csv event', () => {
    Analytics.exportCSV()
    expect(mockGtag).toHaveBeenCalledWith('event', 'export_csv', undefined)
  })
})

// ─── Analytics.viewDashboard() ───────────────────────────────────────────────

describe('Analytics.viewDashboard()', () => {
  it('tracks view_dashboard event', () => {
    Analytics.viewDashboard()
    expect(mockGtag).toHaveBeenCalledWith('event', 'view_dashboard', undefined)
  })
})

// ─── Analytics.generateInsights() ───────────────────────────────────────────

describe('Analytics.generateInsights()', () => {
  it('tracks generate_insights event', () => {
    Analytics.generateInsights()
    expect(mockGtag).toHaveBeenCalledWith('event', 'generate_insights', undefined)
  })
})

'use client'

// Google Analytics 4 event tracker
// Uses the GA4 Measurement ID configured in Firebase Analytics

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

// Predefined events
export const Analytics = {
  logActivity: (category: string, co2Kg: number) =>
    trackEvent('log_activity', { category, co2_kg: co2Kg }),

  viewInsights: () =>
    trackEvent('view_insights'),

  completeAction: (title: string, savingKg: number) =>
    trackEvent('complete_action', { action_title: title, saving_kg: savingKg }),

  signup: (method: 'google' | 'email') =>
    trackEvent('sign_up', { method }),

  login: (method: 'google' | 'email') =>
    trackEvent('login', { method }),

  exportCSV: () =>
    trackEvent('export_csv'),

  viewDashboard: () =>
    trackEvent('view_dashboard'),

  generateInsights: () =>
    trackEvent('generate_insights'),
}

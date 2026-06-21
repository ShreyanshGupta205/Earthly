/**
 * @jest-environment node
 */

const mockInitializeApp = jest.fn().mockReturnValue({ name: 'mocked-app' })
const mockGetApps = jest.fn().mockReturnValue([])
const mockGetApp = jest.fn()

jest.mock('firebase/app', () => ({
  initializeApp: (...args: any[]) => mockInitializeApp(...args),
  getApps: (...args: any[]) => mockGetApps(...args),
  getApp: (...args: any[]) => mockGetApp(...args),
}))

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
}))

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
}))

jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(),
  isSupported: jest.fn().mockResolvedValue(true),
}))

describe('lib/firebase/config SSR', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns null when window is undefined (SSR environment)', async () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key'
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project'
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id'

    const { getAnalyticsInstance } = require('@/lib/firebase/config')
    const analytics = await getAnalyticsInstance()
    expect(analytics).toBeNull()
  })
})

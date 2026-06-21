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

const mockGetAnalytics = jest.fn()
const mockIsSupported = jest.fn().mockResolvedValue(true)
jest.mock('firebase/analytics', () => ({
  getAnalytics: (...args: any[]) => mockGetAnalytics(...args),
  isSupported: (...args: any[]) => mockIsSupported(...args),
}))

describe('lib/firebase/config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should initialize firebase when configured', () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key'
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project'
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id'

    mockGetApps.mockReturnValueOnce([])

    const { isConfigured, app } = require('@/lib/firebase/config')
    expect(isConfigured).toBe(true)
    expect(app).toBeDefined()
    expect(mockInitializeApp).toHaveBeenCalled()
  })

  it('should reuse existing app instance if already initialized', () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key'
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project'
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id'

    mockGetApps.mockReturnValueOnce([{ name: '[DEFAULT]' }])
    mockGetApp.mockReturnValueOnce({ name: '[DEFAULT]' })

    const { isConfigured, app } = require('@/lib/firebase/config')
    expect(isConfigured).toBe(true)
    expect(app).toEqual({ name: '[DEFAULT]' })
    expect(mockInitializeApp).not.toHaveBeenCalled()
    expect(mockGetApp).toHaveBeenCalled()
  })

  it('should catch initialization errors and not throw', () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key'
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project'
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id'

    mockInitializeApp.mockImplementationOnce(() => {
      throw new Error('Firebase init failed')
    })
    
    // Suppress console.warn during test
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {})

    const { isConfigured, app } = require('@/lib/firebase/config')
    expect(isConfigured).toBe(true)
    expect(app).toBeNull()
    expect(console.warn).toHaveBeenCalled()
  })

  it('should not initialize firebase when credentials are missing', () => {
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    delete process.env.NEXT_PUBLIC_FIREBASE_APP_ID

    const { isConfigured, app } = require('@/lib/firebase/config')
    expect(isConfigured).toBe(false)
    expect(app).toBeNull()
    expect(mockInitializeApp).not.toHaveBeenCalled()
  })

  describe('getAnalyticsInstance', () => {
    it('returns null when app is not initialized', async () => {
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      const { getAnalyticsInstance } = require('@/lib/firebase/config')
      const analytics = await getAnalyticsInstance()
      expect(analytics).toBeNull()
    })

    it('returns null when analytics is not supported', async () => {
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key'
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project'
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id'

      mockIsSupported.mockResolvedValueOnce(false)

      const { getAnalyticsInstance } = require('@/lib/firebase/config')
      const analytics = await getAnalyticsInstance()
      expect(analytics).toBeNull()
    })

    it('returns analytics instance when app is initialized, in browser, and supported', async () => {
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key'
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project'
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id'

      mockIsSupported.mockResolvedValueOnce(true)
      const mockAnalyticsObj = { mock: 'analytics' }
      mockGetAnalytics.mockReturnValueOnce(mockAnalyticsObj)

      const { getAnalyticsInstance } = require('@/lib/firebase/config')
      const analytics = await getAnalyticsInstance()
      expect(analytics).toBe(mockAnalyticsObj)
    })
  })
})

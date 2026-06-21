import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  logActivity,
  getRecentLogs,
  getLogsByDateRange,
  deleteLog,
  upsertDailySummary,
  getDailySummary,
  getWeeklySummaries,
  getTodayActions,
  setTodayActions,
  toggleAction,
  getCachedInsights,
  saveInsights,
  calculateAndUpdateStreak,
} from '@/lib/firebase/firestore'

const mockDoc = jest.fn()
const mockGetDoc = jest.fn()
const mockSetDoc = jest.fn()
const mockUpdateDoc = jest.fn()
const mockAddDoc = jest.fn()
const mockDeleteDoc = jest.fn()
const mockCollection = jest.fn()
const mockQuery = jest.fn()
const mockWhere = jest.fn()
const mockOrderBy = jest.fn()
const mockLimit = jest.fn()
const mockGetDocs = jest.fn()
const mockServerTimestamp = jest.fn()
const mockWriteBatch = jest.fn()

jest.mock('firebase/firestore', () => {
  return {
    doc: (...args: any[]) => mockDoc(...args),
    getDoc: (...args: any[]) => mockGetDoc(...args),
    setDoc: (...args: any[]) => mockSetDoc(...args),
    updateDoc: (...args: any[]) => mockUpdateDoc(...args),
    addDoc: (...args: any[]) => mockAddDoc(...args),
    deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
    collection: (...args: any[]) => mockCollection(...args),
    query: (...args: any[]) => mockQuery(...args),
    where: (...args: any[]) => mockWhere(...args),
    orderBy: (...args: any[]) => mockOrderBy(...args),
    limit: (...args: any[]) => mockLimit(...args),
    getDocs: (...args: any[]) => mockGetDocs(...args),
    serverTimestamp: (...args: any[]) => mockServerTimestamp(...args),
    writeBatch: (...args: any[]) => mockWriteBatch(...args),
  }
})

const mockDbInstance = { name: 'mocked-firestore-db' }

jest.mock('@/lib/firebase/config', () => {
  return {
    get db() {
      return (global as any).__mockDb
    },
  }
})

describe('lib/firebase/firestore', () => {
  beforeAll(() => {
    ;(global as any).__mockDb = mockDbInstance
  })

  afterAll(() => {
    delete (global as any).__mockDb
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('unconfigured DB exceptions', () => {
    beforeAll(() => {
      ;(global as any).__mockDb = null
    })

    afterAll(() => {
      ;(global as any).__mockDb = mockDbInstance
    })

    it('should throw error when db is not configured', async () => {
      await expect(getUserProfile('uid')).rejects.toThrow('Firebase DB not configured')
    })
  })

  describe('USER PROFILE functions', () => {
    it('createUserProfile should set profile if it does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      })

      const profileData = {
        username: 'alice',
        fullName: 'Alice Doe',
        avatarUrl: '',
        country: 'IN',
        createdAt: '2024-01-01',
        streakDays: 0,
        lastActive: '2024-01-01',
        greenScore: 0,
        totalSaved: 0,
      }

      await createUserProfile('alice-123', profileData)
      expect(mockSetDoc).toHaveBeenCalledWith(undefined, { ...profileData, id: 'alice-123' })
    })

    it('createUserProfile should not set profile if it already exists', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
      })

      const profileData = {
        username: 'alice',
        fullName: 'Alice Doe',
        avatarUrl: '',
        country: 'IN',
        createdAt: '2024-01-01',
        streakDays: 0,
        lastActive: '2024-01-01',
        greenScore: 0,
        totalSaved: 0,
      }

      await createUserProfile('alice-123', profileData)
      expect(mockSetDoc).not.toHaveBeenCalled()
    })

    it('getUserProfile should return parsed profile when exists', async () => {
      const mockData = { id: 'alice-123', username: 'alice' }
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockData,
      })

      const profile = await getUserProfile('alice-123')
      expect(profile).toEqual(mockData)
    })

    it('getUserProfile should return null when profile does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      })

      const profile = await getUserProfile('alice-123')
      expect(profile).toBeNull()
    })

    it('updateUserProfile should call updateDoc', async () => {
      await updateUserProfile('alice-123', { fullName: 'Alice Smith' })
      expect(mockUpdateDoc).toHaveBeenCalled()
    })
  })

  describe('ACTIVITY LOGS functions', () => {
    it('logActivity should insert new doc, upsert summary, and update profile totals', async () => {
      // Mock addDoc to return doc reference with id
      mockAddDoc.mockResolvedValueOnce({ id: 'new-activity-id' })

      // Mock getDoc inside upsertDailySummary (exists: false)
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      })

      // Mock getDoc inside getUserProfile (profile exists)
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ totalSaved: 10, lastActive: '2024-01-01' }),
      })

      const activityInput = {
        category: 'transport' as const,
        subType: 'car_petrol',
        quantity: 15,
        unit: 'km',
        co2Kg: 3.15,
        date: '2024-06-20',
        notes: 'Commute',
      }

      const logId = await logActivity('user-123', activityInput)
      expect(logId).toBe('new-activity-id')
      expect(mockAddDoc).toHaveBeenCalled()
      expect(mockSetDoc).toHaveBeenCalled() // daily summary insert
      expect(mockUpdateDoc).toHaveBeenCalled() // profile updates
    })

    it('logActivity handles missing profile or missing totalSaved fields', async () => {
      mockAddDoc.mockResolvedValueOnce({ id: 'new-activity-id' })

      // Mock getDoc inside upsertDailySummary (exists: false)
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      })

      // Mock getDoc inside getUserProfile (profile is null)
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      })

      const activityInput = {
        category: 'transport' as const,
        subType: 'car_petrol',
        quantity: 15,
        unit: 'km',
        co2Kg: 3.15,
        date: '2024-06-20',
        notes: 'Commute',
      }

      await logActivity('user-123', activityInput)
      // Since profile does not exist, profile update shouldn't be called
      expect(mockUpdateDoc).not.toHaveBeenCalled()

      // Reset and test profile exists but totalSaved is undefined
      jest.clearAllMocks()
      mockAddDoc.mockResolvedValueOnce({ id: 'new-activity-id' })
      mockGetDoc
        .mockResolvedValueOnce({ exists: () => false }) // summary
        .mockResolvedValueOnce({ exists: () => true, data: () => ({ lastActive: '2024-01-01' }) }) // profile without totalSaved

      await logActivity('user-123', activityInput)
      // profile update should be called with totalSaved fallback to 0 + co2Kg
      expect(mockUpdateDoc).toHaveBeenCalledWith(undefined, {
        totalSaved: 3.15,
        lastActive: '2024-06-20',
      })
    })

    it('getRecentLogs should return logs array', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ notes: 'Log 1' }) },
        { id: '2', data: () => ({ notes: 'Log 2' }) },
      ]
      mockGetDocs.mockResolvedValue({
        docs: mockDocs,
      })

      const logs = await getRecentLogs('user-123', 5)
      expect(logs).toHaveLength(2)
      expect(logs[0]).toEqual({ id: '1', notes: 'Log 1' })

      // Call without the second argument to test default limit parameter n = 10
      const defaultLogs = await getRecentLogs('user-123')
      expect(defaultLogs).toHaveLength(2)
    })

    it('getLogsByDateRange should query with date ranges', async () => {
      mockGetDocs.mockResolvedValueOnce({ docs: [] })
      await getLogsByDateRange('user-123', '2024-06-01', '2024-06-07')
      expect(mockGetDocs).toHaveBeenCalled()
    })

    it('deleteLog should invoke deleteDoc', async () => {
      await deleteLog('user-123', 'log-123')
      expect(mockDeleteDoc).toHaveBeenCalled()
    })
  })

  describe('DAILY SUMMARIES functions', () => {
    it('upsertDailySummary should update daily summary if it already exists', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ totalCo2: 5, transportCo2: 2 }),
      })

      await upsertDailySummary('user-123', '2024-06-20', 'transport', 1.5)
      expect(mockUpdateDoc).toHaveBeenCalledWith(undefined, {
        totalCo2: 6.5,
        transportCo2: 3.5,
      })

      // Test when existing summary fields are undefined
      jest.clearAllMocks()
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({}), // missing totalCo2 and categoryCo2
      })

      await upsertDailySummary('user-123', '2024-06-20', 'transport', 1.5)
      expect(mockUpdateDoc).toHaveBeenCalledWith(undefined, {
        totalCo2: 1.5,
        transportCo2: 1.5,
      })
    })

    it('getDailySummary should return summary if it exists', async () => {
      const mockSummary = { date: '2024-06-20', totalCo2: 3.5 }
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockSummary,
      })

      const summary = await getDailySummary('user-123', '2024-06-20')
      expect(summary).toEqual(mockSummary)
    })

    it('getDailySummary should return null if it does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      })

      const summary = await getDailySummary('user-123', '2024-06-20')
      expect(summary).toBeNull()
    })

    it('getWeeklySummaries should fetch daily summaries for given number of days', async () => {
      // Mock getDoc to alternate between returning summary and null
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ totalCo2: 5.5 }),
      })

      const summaries = await getWeeklySummaries('user-123', 3)
      expect(summaries).toHaveLength(3)
      expect(summaries[0].totalCo2).toBe(5.5)
    })

    it('getWeeklySummaries falls back to default values for missing dates', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      })

      const summaries = await getWeeklySummaries('user-123', 2)
      expect(summaries).toHaveLength(2)
      expect(summaries[0].totalCo2).toBe(0)
    })

    it('getWeeklySummaries should default to 7 days if parameter is not supplied', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      })

      const summaries = await getWeeklySummaries('user-123')
      expect(summaries).toHaveLength(7)
    })
  })

  describe('ACTIONS functions', () => {
    it('getTodayActions should return actions array', async () => {
      mockGetDocs.mockResolvedValueOnce({
        docs: [
          { id: 'act-1', data: () => ({ title: 'Action 1' }) },
        ],
      })

      const actions = await getTodayActions('user-123')
      expect(actions).toHaveLength(1)
      expect(actions[0].id).toBe('act-1')
    })

    it('setTodayActions should commit batch operations', async () => {
      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      }
      mockWriteBatch.mockReturnValue(mockBatch)

      const actions = [
        { title: 'Reduce energy', co2Saving: 0.5, category: 'energy' as const },
      ]

      await setTodayActions('user-123', actions)
      expect(mockWriteBatch).toHaveBeenCalled()
      expect(mockBatch.set).toHaveBeenCalled()
      expect(mockBatch.commit).toHaveBeenCalled()
    })

    it('toggleAction should call updateDoc', async () => {
      await toggleAction('user-123', 'action-1', true)
      expect(mockUpdateDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({
        isCompleted: true,
        completedAt: expect.any(String),
      }))
    })

    it('toggleAction as false sets completedAt to null', async () => {
      await toggleAction('user-123', 'action-1', false)
      expect(mockUpdateDoc).toHaveBeenCalledWith(undefined, {
        isCompleted: false,
        completedAt: null,
      })
    })
  })

  describe('INSIGHTS cache functions', () => {
    it('getCachedInsights returns insights array if cache is valid (< 7 days)', async () => {
      const recentDate = new Date()
      recentDate.setDate(recentDate.getDate() - 3)

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          createdAt: recentDate.toISOString(),
          insightsJson: [{ type: 'win', title: 'Great job!' }],
        }),
      })

      const cached = await getCachedInsights('user-123', '2024-06-01')
      expect(cached).toHaveLength(1)
      expect(cached?.[0].title).toBe('Great job!')
    })

    it('getCachedInsights returns null if cache is expired (> 7 days)', async () => {
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 10)

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          createdAt: oldDate.toISOString(),
          insightsJson: [{ type: 'win', title: 'Great job!' }],
        }),
      })

      const cached = await getCachedInsights('user-123', '2024-06-01')
      expect(cached).toBeNull()
    })

    it('getCachedInsights returns null if document does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      })

      const cached = await getCachedInsights('user-123', '2024-06-01')
      expect(cached).toBeNull()
    })

    it('saveInsights should set insights document', async () => {
      await saveInsights('user-123', '2024-06-01', [{ type: 'win', title: 'Good', text: 'Good', metric: 'Good', action: 'Good' }])
      expect(mockSetDoc).toHaveBeenCalled()
    })
  })

  describe('STREAK calculation', () => {
    it('calculateAndUpdateStreak should return streak count and save to profile', async () => {
      // Mock getDoc to return daily summary with co2 > 0 for 5 consecutive days, then null (break)
      mockGetDoc
        .mockResolvedValueOnce({ exists: () => true, data: () => ({ totalCo2: 2.5 }) }) // today
        .mockResolvedValueOnce({ exists: () => true, data: () => ({ totalCo2: 1.2 }) }) // yesterday
        .mockResolvedValueOnce({ exists: () => true, data: () => ({ totalCo2: 3.4 }) }) // 2 days ago
        .mockResolvedValueOnce({ exists: () => false }) // 3 days ago (breaks here since i > 0)

      const streak = await calculateAndUpdateStreak('user-123')
      expect(streak).toBe(3)
      expect(mockUpdateDoc).toHaveBeenCalledWith(undefined, { streakDays: 3 })
    })

    it('calculateAndUpdateStreak should not break on day 0 if no emissions logged today', async () => {
      mockGetDoc
        .mockResolvedValueOnce({ exists: () => false }) // today (i = 0, should not break)
        .mockResolvedValueOnce({ exists: () => true, data: () => ({ totalCo2: 1.2 }) }) // yesterday
        .mockResolvedValueOnce({ exists: () => true, data: () => ({ totalCo2: 3.4 }) }) // 2 days ago
        .mockResolvedValueOnce({ exists: () => false }) // 3 days ago (breaks here since i > 0)

      const streak = await calculateAndUpdateStreak('user-123')
      expect(streak).toBe(2)
    })
  })
})

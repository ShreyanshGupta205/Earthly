import { generateInsights } from '@/lib/ai/gemini'
import type { WeeklyData } from '@/types'

const mockGenerateContent = jest.fn()

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockImplementation(() => {
          return {
            generateContent: (...args: any[]) => {
              const impl = (global as any).__mockGenerateContent
              if (!impl) {
                throw new Error('__mockGenerateContent is not set on global')
              }
              return impl(...args)
            },
          }
        }),
      }
    }),
    HarmCategory: {
      HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
      HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
      HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    },
    HarmBlockThreshold: {
      BLOCK_NONE: 'BLOCK_NONE',
    },
  }
})

describe('lib/ai/gemini', () => {
  const mockWeeklyData: WeeklyData = {
    totalCO2: 24.5,
    dailyAvg: 3.5,
    previousWeek: 20.0,
    byCategory: {
      transport: 12.0,
      food: 8.0,
      energy: 4.5,
    },
    topActivity: 'transport',
  }

  beforeAll(() => {
    ;(global as any).__mockGenerateContent = mockGenerateContent
  })

  afterAll(() => {
    delete (global as any).__mockGenerateContent
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress console.error inside tests to keep output clean
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    ;(console.error as jest.Mock).mockRestore()
  })

  it('should return parsed insights on happy path', async () => {
    const mockResponseText = JSON.stringify([
      {
        type: 'win',
        title: 'Great Job on Transport',
        text: 'You kept transport emissions low.',
        metric: '12 kg CO2',
        action: 'Try walking even more next week.',
      },
      {
        type: 'alert',
        title: 'Food emissions up',
        text: 'Food emissions are high.',
        metric: '8 kg CO2',
        action: 'Reduce meat consumption.',
      },
      {
        type: 'info',
        title: 'Energy tips',
        text: 'Energy emissions are stable.',
        metric: '4.5 kg CO2',
        action: 'Turn off lights.',
      },
      {
        type: 'pattern',
        title: 'Emission trend',
        text: 'Your emissions are looking stable.',
        metric: 'Stable',
        action: 'Keep tracking.',
      },
    ])

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => mockResponseText,
      },
    })

    const insights = await generateInsights(mockWeeklyData, 'John')

    expect(mockGenerateContent).toHaveBeenCalledTimes(1)
    expect(insights).toHaveLength(4)
    expect(insights[0]).toEqual({
      type: 'win',
      title: 'Great Job on Transport',
      text: 'You kept transport emissions low.',
      metric: '12 kg CO2',
      action: 'Try walking even more next week.',
    })
  })

  it('should fall back to default values for missing fields in API response', async () => {
    const mockResponseText = JSON.stringify([
      {
        // missing everything else
      },
    ])

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => mockResponseText,
      },
    })

    const insights = await generateInsights(mockWeeklyData, 'John')
    expect(insights[0]).toEqual({
      type: 'info',
      title: 'Weekly Insight',
      text: '',
      metric: '',
      action: '',
    })
  })

  it('should return fallback insights if the response does not contain a JSON array', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => 'Some random non-json text response from Gemini',
      },
    })

    const insights = await generateInsights(mockWeeklyData, 'John')
    expect(insights).toHaveLength(4)
    expect(insights[0].title).toBe('Your Weekly Summary')
    expect(insights[1].title).toBe('transport is your top source')
  })

  it('should return fallback insights if parsed JSON is not an array', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => '{"thisIs": "anObject"}',
      },
    })

    const insights = await generateInsights(mockWeeklyData, 'John')
    expect(insights).toHaveLength(4)
    expect(insights[0].title).toBe('Your Weekly Summary')
  })

  it('should return fallback insights if parsed JSON array is empty', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => '[]',
      },
    })

    const insights = await generateInsights(mockWeeklyData, 'John')
    expect(insights).toHaveLength(4)
    expect(insights[0].title).toBe('Your Weekly Summary')
  })

  it('should return fallback insights if the API call throws an error', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('API error'))

    const insights = await generateInsights(mockWeeklyData, 'John')
    expect(insights).toHaveLength(4)
    expect(insights[0].title).toBe('Your Weekly Summary')
    expect(insights[1].title).toBe('transport is your top source')
  })

  it('should handle zero previousWeek correctly in prompt formatting', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Trigger fallback'))
    const zeroPrevData = { ...mockWeeklyData, previousWeek: 0 }
    
    const insights = await generateInsights(zeroPrevData, 'John')
    expect(insights).toHaveLength(4)
  })

  it('should handle emissions reduction correctly in prompt formatting', async () => {
    const decreasedData = { ...mockWeeklyData, totalCO2: 15.0, previousWeek: 20.0 }
    const mockResponseText = JSON.stringify([
      { type: 'info', title: 'Test', text: 'Test', metric: 'Test', action: 'Test' }
    ])
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => mockResponseText,
      },
    })
    
    const insights = await generateInsights(decreasedData, 'John')
    expect(insights).toHaveLength(1)
  })

  it('should handle non-Error exceptions and empty categories for fallback insights', async () => {
    mockGenerateContent.mockRejectedValueOnce('Some string exception')

    const emptyCategoryData: WeeklyData = {
      totalCO2: 0,
      dailyAvg: 0,
      previousWeek: 10.0,
      byCategory: {},
      topActivity: 'none',
    }

    const insights = await generateInsights(emptyCategoryData, 'John')
    expect(insights).toHaveLength(4)
    expect(insights[1].title).toBe('transport is your top source')
    expect(insights[1].metric).toBe('0.0 kg from transport')
  })
})

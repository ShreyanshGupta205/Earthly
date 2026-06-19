import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { InsightItem, WeeklyData } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ],
  generationConfig: {
    temperature:     0.7,
    topK:            40,
    topP:            0.9,
    maxOutputTokens: 1024,
  },
})

export async function generateInsights(data: WeeklyData, userName: string): Promise<InsightItem[]> {
  const weekChange = data.previousWeek > 0
    ? `${data.totalCO2 > data.previousWeek ? '+' : ''}${((data.totalCO2 - data.previousWeek) / data.previousWeek * 100).toFixed(0)}%`
    : 'first week'

  const prompt = `You are a carbon footprint coach named Earthly AI powered by Google Gemini. Analyze this user's weekly emission data and generate exactly 4 personalized insights in JSON format.

User: ${userName}
This week total: ${data.totalCO2.toFixed(1)} kg CO₂
Daily average: ${data.dailyAvg.toFixed(1)} kg CO₂/day
vs last week: ${weekChange}
Category breakdown (kg CO₂):
${Object.entries(data.byCategory).map(([k, v]) => `  - ${k}: ${(v as number).toFixed(2)}`).join('\n')}
Top emitting activity: ${data.topActivity}

Benchmarks:
  - Global daily average: 13 kg CO₂/day
  - India daily average: 4.7 kg CO₂/day
  - 1.5°C climate target: 5.5 kg CO₂/day

Return ONLY a valid JSON array with exactly 4 objects. No markdown, no explanation, just the JSON array:
[
  {
    "type": "win",
    "title": "Short positive title (max 6 words)",
    "text": "2-3 sentences specific to their data, mention actual numbers",
    "metric": "Key statistic or comparison",
    "action": "One concrete actionable step"
  }
]

Rules:
- At least 1 "win" (celebrate something positive)
- At least 1 "alert" (biggest opportunity to reduce)
- Include "pattern" or "info" for the remaining
- Reference their specific numbers and top categories
- Be encouraging but honest
- Types allowed: "win" | "pattern" | "info" | "alert"`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON array found in response')

    const parsed = JSON.parse(jsonMatch[0]) as InsightItem[]

    // Validate structure
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Invalid insights structure')
    }

    return parsed.slice(0, 4).map(item => ({
      type:   item.type || 'info',
      title:  item.title || 'Weekly Insight',
      text:   item.text || '',
      metric: item.metric || '',
      action: item.action || '',
    }))
  } catch (error) {
    console.error('Gemini insights error:', error)
    // Fallback insights
    return generateFallbackInsights(data)
  }
}

function generateFallbackInsights(data: WeeklyData): InsightItem[] {
  const topCategory = Object.entries(data.byCategory)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'transport'

  return [
    {
      type: 'info',
      title: 'Your Weekly Summary',
      text: `You emitted ${data.totalCO2.toFixed(1)} kg CO₂ this week, averaging ${data.dailyAvg.toFixed(1)} kg per day. The global average is 13 kg/day.`,
      metric: `${data.dailyAvg.toFixed(1)} kg CO₂/day`,
      action: 'Log activities daily to get personalized AI insights.',
    },
    {
      type: 'alert',
      title: `${topCategory} is your top source`,
      text: `Your ${topCategory} emissions are your biggest contributor this week. Small changes here can have the biggest impact on your footprint.`,
      metric: `${((data.byCategory[topCategory] as number) || 0).toFixed(1)} kg from ${topCategory}`,
      action: `Find one way to reduce your ${topCategory} emissions this week.`,
    },
    {
      type: 'win',
      title: 'You\'re tracking your impact',
      text: 'Simply measuring your carbon footprint puts you ahead of 90% of people. Awareness is the first step to meaningful change.',
      metric: 'Top 10% for climate awareness',
      action: 'Keep logging daily to build your streak.',
    },
    {
      type: 'pattern',
      title: 'Compared to India average',
      text: `India's daily average is 4.7 kg CO₂. Your daily average of ${data.dailyAvg.toFixed(1)} kg gives you a clear picture of where you stand.`,
      metric: `India avg: 4.7 kg/day · 1.5°C target: 5.5 kg/day`,
      action: 'Aim to reduce your daily average by 10% each month.',
    },
  ]
}

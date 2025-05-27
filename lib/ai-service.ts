import { GoogleGenerativeAI } from '@google/generative-ai'
import { generateSampleResponse } from './sample-data'

export interface AIProvider {
  name: string
  generateResponse(message: string, context?: string): Promise<AIResponse>
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area'
  title: string
  data: any[]
  xKey?: string
  yKey?: string
  description?: string
}

export interface SummaryMetric {
  title: string
  value: string | number
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: 'revenue' | 'users' | 'target' | 'calendar' | 'warning' | 'success'
  description?: string
}

export interface AIResponse {
  text: string
  charts?: ChartData[]
  summary?: {
    title: string
    metrics: SummaryMetric[]
    insights: string[]
  }
}

class GeminiProvider implements AIProvider {
  name = 'Google Gemini'
  private genAI: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async generateResponse(message: string, context?: string): Promise<AIResponse> {
    try {
      // If no context (documents), try to provide sample data for demonstration
      if (!context || context.trim() === '') {
        const sampleResponse = generateSampleResponse(message)
        if (sampleResponse) {
          return sampleResponse
        }
      }

      // Using the latest Gemini 2.0 Flash-Lite model for cost efficiency
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

      const systemPrompt = `You are BoardBravo, an AI assistant specialized in analyzing board meeting documents and corporate governance materials. You help board members, executives, and governance professionals by:

1. Summarizing board decks, meeting minutes, and reports
2. Identifying key risks and mitigation strategies
3. Analyzing financial trends and KPIs
4. Evaluating investment pitches and opportunities
5. Extracting action items and strategic initiatives

When analyzing documents, focus on:
- Executive summaries and key decisions
- Financial performance and trends
- Risk assessments and compliance issues
- Strategic initiatives and market opportunities
- Governance matters and regulatory updates

IMPORTANT: When providing analysis that includes numerical data, financial metrics, or trends, you should structure your response to include:

1. A clear text explanation
2. Suggested charts/visualizations when relevant (format as JSON)
3. Key summary metrics when applicable (format as JSON)

For chart suggestions, use this format:
CHART_DATA: {"type": "bar|line|pie|area", "title": "Chart Title", "data": [{"name": "Item1", "value": 100}, {"name": "Item2", "value": 200}], "description": "Chart description"}

For summary metrics, use this format:
SUMMARY_DATA: {"title": "Summary Title", "metrics": [{"title": "Revenue", "value": "$2.5M", "change": 15, "changeType": "positive", "icon": "revenue"}], "insights": ["Key insight 1", "Key insight 2"]}

Provide clear, concise, and actionable insights. Use bullet points and structured responses when appropriate.

${context ? `\nDocument Context:\n${context}` : '\nNo documents have been uploaded yet. Ask the user to upload documents for analysis.'}`

      const fullPrompt = `${systemPrompt}\n\nUser Question: ${message}`
      
      const result = await model.generateContent(fullPrompt)
      const response = await result.response
      const text = response.text()
      
      // Parse the response to extract charts and summary data
      return this.parseAIResponse(text)
    } catch (error) {
      console.error('Gemini API error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      })
      
      // Check for specific Gemini error types
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) {
          throw new Error('Invalid Gemini API key. Please check your GOOGLE_AI_API_KEY.')
        }
        if (error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error('Gemini API quota exceeded. Please try again later.')
        }
        if (error.message.includes('SAFETY')) {
          throw new Error('Content blocked by Gemini safety filters. Please try rephrasing your request.')
        }
      }
      
      throw new Error(`Failed to generate response with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private parseAIResponse(text: string): AIResponse {
    let cleanText = text
    const charts: ChartData[] = []
    let summary: AIResponse['summary'] | undefined

    // Extract chart data
    const chartMatches = text.match(/CHART_DATA:\s*({.*?})/g)
    if (chartMatches) {
      chartMatches.forEach(match => {
        try {
          const jsonStr = match.replace('CHART_DATA:', '').trim()
          const chartData = JSON.parse(jsonStr)
          charts.push(chartData)
          cleanText = cleanText.replace(match, '')
        } catch (e) {
          console.warn('Failed to parse chart data:', e)
        }
      })
    }

    // Extract summary data - using a more compatible regex approach
    const summaryMatch = text.match(/SUMMARY_DATA:\s*({[\s\S]*?})/)
    if (summaryMatch) {
      try {
        const jsonStr = summaryMatch[1]
        summary = JSON.parse(jsonStr)
        cleanText = cleanText.replace(summaryMatch[0], '')
      } catch (e) {
        console.warn('Failed to parse summary data:', e)
      }
    }

    // Clean up the text
    cleanText = cleanText.trim()

    return {
      text: cleanText,
      charts: charts.length > 0 ? charts : undefined,
      summary
    }
  }
}

class OpenAIProvider implements AIProvider {
  name = 'OpenAI GPT'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateResponse(message: string, context?: string): Promise<AIResponse> {
    try {
      const OpenAI = (await import('openai')).default
      const openai = new OpenAI({ apiKey: this.apiKey })

      const systemPrompt = `You are BoardBravo, an AI assistant specialized in analyzing board meeting documents and corporate governance materials. You help board members, executives, and governance professionals by:

1. Summarizing board decks, meeting minutes, and reports
2. Identifying key risks and mitigation strategies
3. Analyzing financial trends and KPIs
4. Evaluating investment pitches and opportunities
5. Extracting action items and strategic initiatives

When analyzing documents, focus on:
- Executive summaries and key decisions
- Financial performance and trends
- Risk assessments and compliance issues
- Strategic initiatives and market opportunities
- Governance matters and regulatory updates

Provide clear, concise, and actionable insights. Use bullet points and structured responses when appropriate.

${context ? `\nDocument Context:\n${context}` : '\nNo documents have been uploaded yet. Ask the user to upload documents for analysis.'}`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })

      const text = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.'
      
      return { text }
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to generate response with OpenAI')
    }
  }
}

class AnthropicProvider implements AIProvider {
  name = 'Anthropic Claude'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateResponse(message: string, context?: string): Promise<AIResponse> {
    try {
      // Note: You would need to install @anthropic-ai/sdk for this to work
      // For now, this is a placeholder implementation
      throw new Error('Anthropic provider not yet implemented. Please install @anthropic-ai/sdk and implement.')
    } catch (error) {
      console.error('Anthropic API error:', error)
      throw new Error('Failed to generate response with Anthropic')
    }
  }
}

export function createAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || 'gemini'

  switch (provider.toLowerCase()) {
    case 'gemini':
      const geminiKey = process.env.GOOGLE_AI_API_KEY
      if (!geminiKey) {
        throw new Error('GOOGLE_AI_API_KEY environment variable is required for Gemini provider')
      }
      return new GeminiProvider(geminiKey)

    case 'openai':
      const openaiKey = process.env.OPENAI_API_KEY
      if (!openaiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required for OpenAI provider')
      }
      return new OpenAIProvider(openaiKey)

    case 'anthropic':
      const anthropicKey = process.env.ANTHROPIC_API_KEY
      if (!anthropicKey) {
        throw new Error('ANTHROPIC_API_KEY environment variable is required for Anthropic provider')
      }
      return new AnthropicProvider(anthropicKey)

    default:
      throw new Error(`Unsupported AI provider: ${provider}. Supported providers: gemini, openai, anthropic`)
  }
}

export function getAvailableProviders(): string[] {
  const providers = []
  
  if (process.env.GOOGLE_AI_API_KEY) providers.push('gemini')
  if (process.env.OPENAI_API_KEY) providers.push('openai')
  if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic')
  
  return providers
} 
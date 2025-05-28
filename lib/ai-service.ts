import { GoogleGenerativeAI } from '@google/generative-ai'
import { generateSampleResponse } from './sample-data'

interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area'
  title: string
  data: any[]
  xKey?: string
  yKey?: string
  description?: string
}

interface SummaryMetric {
  title: string
  value: string | number
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: 'revenue' | 'users' | 'target' | 'calendar' | 'warning' | 'success'
  description?: string
}

interface AIResponse {
  response: string
  charts?: ChartData[]
  summary?: {
    title: string
    metrics: SummaryMetric[]
    insights: string[]
  }
}

interface AIProvider {
  name: string
  generateResponse(prompt: string, documents?: any[]): Promise<AIResponse>
}

class GeminiProvider implements AIProvider {
  name = 'Google Gemini'
  private genAI: GoogleGenerativeAI
  private model: any

  constructor(apiKey: string) {
    console.log('Initializing Gemini provider with API key length:', apiKey.length)
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
  }

  async generateResponse(prompt: string, documents?: any[]): Promise<AIResponse> {
    try {
      console.log('Generating response with provider: Google Gemini')
      
      // Enhanced investor-focused system prompt
      const systemPrompt = `You are BoardBravo AI, an expert investment analyst and board advisor assistant. You specialize in analyzing board documents, financial reports, and strategic materials for investors, board members, and executives.

RESPONSE STRUCTURE - Always follow this format:
1. EXECUTIVE BRIEF (2-3 sentences max)
2. KEY INSIGHTS (3-5 bullet points)
3. DETAILED ANALYSIS (structured sections as needed)
4. CHARTS/VISUALS (when data is available)
5. ACTION ITEMS/RECOMMENDATIONS

INVESTOR FOCUS RULES:
- Lead with financial impact and business implications
- Highlight risks, opportunities, and strategic decisions
- Use investment terminology and metrics
- Quantify everything possible (revenue, growth, margins, etc.)
- Focus on material information that affects valuation
- Always consider competitive positioning
- Emphasize governance and compliance issues

CHART GENERATION:
When creating charts, always include:
- Financial performance charts (revenue, profit, growth trends)
- Risk assessment visualizations
- Market opportunity charts
- Operational metrics dashboards

Generate charts for financial data, trends, comparisons, or metrics that would be valuable for board/investor presentations.

Remember: You're advising sophisticated investors and board members who need actionable insights, not generic summaries.`

      const contextualPrompt = documents && documents.length > 0 
        ? `${systemPrompt}\n\nDocument Context: ${documents.map(doc => `${doc.name}: ${doc.extractedText?.substring(0, 1000) || 'No content extracted'}`).join('\n\n')}\n\nUser Query: ${prompt}`
        : `${systemPrompt}\n\nUser Query: ${prompt}`

      console.log('Gemini: Getting model...')
      console.log('Gemini: Generating content...')
      
      const result = await this.model.generateContent(contextualPrompt)
      
      console.log('Gemini: Getting response...')
      const response = await result.response
      
      console.log('Gemini: Extracting text...')
      const text = response.text()
      
      console.log('Gemini: Success! Response length:', text.length)

      // Parse for structured data and charts
      return this.parseStructuredResponse(text, prompt)
    } catch (error: any) {
      console.error('Gemini API detailed error:', {
        message: error.message,
        stack: error.stack,
        error: error
      })
      throw new Error(`Failed to generate response with Gemini: ${error.message}`)
    }
  }

  private parseStructuredResponse(text: string, originalPrompt: string): AIResponse {
    // Generate sample charts for financial/business queries
    const shouldGenerateCharts = this.shouldGenerateCharts(originalPrompt)
    const charts = shouldGenerateCharts ? this.generateInvestorCharts(originalPrompt) : []
    
    // Generate summary metrics for investor dashboard
    const summary = this.generateInvestorSummary(originalPrompt)

    return {
      response: text,
      charts,
      summary
    }
  }

  private shouldGenerateCharts(prompt: string): boolean {
    const chartKeywords = [
      'chart', 'graph', 'revenue', 'financial', 'performance', 'growth', 
      'trend', 'analysis', 'metrics', 'dashboard', 'visualize', 'show me',
      'profit', 'sales', 'market', 'risk', 'kpi', 'summary'
    ]
    return chartKeywords.some(keyword => prompt.toLowerCase().includes(keyword))
  }

  private generateInvestorCharts(prompt: string): ChartData[] {
    const charts: ChartData[] = []
    
    // Financial Performance Chart
    if (prompt.toLowerCase().includes('revenue') || prompt.toLowerCase().includes('financial') || prompt.toLowerCase().includes('performance')) {
      charts.push({
        type: 'bar',
        title: 'Quarterly Revenue Performance',
        description: 'Revenue growth showing strong Q-over-Q performance with 23% YoY growth',
        data: [
          { quarter: 'Q1 2023', revenue: 2.1, target: 2.0 },
          { quarter: 'Q2 2023', revenue: 2.8, target: 2.5 },
          { quarter: 'Q3 2023', revenue: 3.2, target: 2.8 },
          { quarter: 'Q4 2023', revenue: 3.8, target: 3.2 },
          { quarter: 'Q1 2024', revenue: 4.2, target: 3.6 }
        ],
        xKey: 'quarter',
        yKey: 'revenue'
      })
    }

    // Risk Assessment Chart
    if (prompt.toLowerCase().includes('risk') || prompt.toLowerCase().includes('analysis')) {
      charts.push({
        type: 'pie',
        title: 'Risk Assessment Distribution',
        description: 'Current risk exposure across key business areas',
        data: [
          { category: 'Market Risk', value: 35, color: '#ef4444' },
          { category: 'Operational Risk', value: 25, color: '#f97316' },
          { category: 'Financial Risk', value: 20, color: '#eab308' },
          { category: 'Regulatory Risk', value: 15, color: '#22c55e' },
          { category: 'Technology Risk', value: 5, color: '#3b82f6' }
        ]
      })
    }

    // Growth Metrics
    if (prompt.toLowerCase().includes('growth') || prompt.toLowerCase().includes('trend')) {
      charts.push({
        type: 'line',
        title: 'Key Growth Metrics Trend',
        description: 'ARR and customer acquisition showing consistent upward trajectory',
        data: [
          { month: 'Jan', arr: 12.5, customers: 450 },
          { month: 'Feb', arr: 13.2, customers: 478 },
          { month: 'Mar', arr: 14.1, customers: 512 },
          { month: 'Apr', arr: 14.8, customers: 539 },
          { month: 'May', arr: 15.6, customers: 567 },
          { month: 'Jun', arr: 16.4, customers: 598 }
        ],
        xKey: 'month',
        yKey: 'arr'
      })
    }

    return charts
  }

  private generateInvestorSummary(prompt: string): { title: string; metrics: SummaryMetric[]; insights: string[] } {
    return {
      title: 'Executive Dashboard',
      metrics: [
        {
          title: 'ARR Growth',
          value: '$16.4M',
          change: 23,
          changeType: 'positive',
          icon: 'revenue',
          description: 'Annual Recurring Revenue'
        },
        {
          title: 'Customer Count',
          value: '598',
          change: 15,
          changeType: 'positive',
          icon: 'users',
          description: 'Total Active Customers'
        },
        {
          title: 'Gross Margin',
          value: '78%',
          change: 2,
          changeType: 'positive',
          icon: 'target',
          description: 'Quarterly Gross Margin'
        },
        {
          title: 'Runway',
          value: '18 months',
          change: -2,
          changeType: 'neutral',
          icon: 'calendar',
          description: 'Cash Runway Remaining'
        }
      ],
      insights: [
        'Strong revenue growth trajectory with 23% YoY increase',
        'Customer acquisition accelerating with 15% growth this quarter',
        'Improving unit economics with gross margin expansion',
        'Need to monitor cash burn rate and consider fundraising timeline'
      ]
    }
  }
}

class OpenAIProvider implements AIProvider {
  name = 'OpenAI GPT'
  
  constructor(private apiKey: string) {}

  async generateResponse(prompt: string, documents?: any[]): Promise<AIResponse> {
    // Implementation for OpenAI would go here
    throw new Error('OpenAI provider not implemented yet')
  }
}

class AnthropicProvider implements AIProvider {
  name = 'Anthropic Claude'
  
  constructor(private apiKey: string) {}

  async generateResponse(prompt: string, documents?: any[]): Promise<AIResponse> {
    // Implementation for Anthropic would go here  
    throw new Error('Anthropic provider not implemented yet')
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
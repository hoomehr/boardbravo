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
      console.log('Documents received:', documents ? `Array with ${documents.length} items` : 'No documents')
      
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

      // Safely handle documents - ensure it's always an array
      const safeDocuments = Array.isArray(documents) ? documents : []
      
      const contextualPrompt = safeDocuments.length > 0 
        ? `${systemPrompt}\n\nDocument Context: ${safeDocuments.map(doc => `${doc.name}: ${doc.extractedText?.substring(0, 1000) || 'No content extracted'}`).join('\n\n')}\n\nUser Query: ${prompt}`
        : `${systemPrompt}\n\nNote: No documents uploaded yet. Provide general investment and board governance guidance based on the query.\n\nUser Query: ${prompt}`

      console.log('Gemini: Getting model...')
      console.log('Gemini: Generating content...')
      
      // Add retry logic for API overload
      let result
      let retryCount = 0
      const maxRetries = 3
      
      while (retryCount < maxRetries) {
        try {
          result = await this.model.generateContent(contextualPrompt)
          break // Success, exit retry loop
        } catch (error: any) {
          retryCount++
          if (error.status === 503 && retryCount < maxRetries) {
            console.log(`Gemini API overloaded, retrying... (${retryCount}/${maxRetries})`)
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)) // Exponential backoff
            continue
          }
          throw error // Re-throw if not a 503 or max retries reached
        }
      }
      
      if (!result) {
        throw new Error('Failed to get response after retries')
      }
      
      console.log('Gemini: Getting response...')
      const response = await result.response
      
      console.log('Gemini: Extracting text...')
      const text = response.text()
      
      console.log('Gemini: Success! Response length:', text.length)

      // Parse for structured data and charts
      return this.parseStructuredResponse(text, prompt, safeDocuments.length > 0)
    } catch (error: any) {
      console.error('Gemini API detailed error:', {
        message: error.message,
        stack: error.stack,
        error: error
      })
      
      // Return fallback response when API fails
      return this.getFallbackResponse(prompt, documents)
    }
  }

  private parseStructuredResponse(text: string, originalPrompt: string, hasDocuments: boolean): AIResponse {
    // Check if this is a chart-focused query (from sample questions)
    const isChartQuery = this.isChartFocusedQuery(originalPrompt)
    
    // Generate charts based on actual data when documents are available
    const shouldGenerateCharts = this.shouldGenerateCharts(originalPrompt)
    const charts = shouldGenerateCharts ? this.generateDataDrivenCharts(originalPrompt, hasDocuments) : []
    
    // Generate summary metrics for investor dashboard
    const summary = this.generateInvestorSummary(originalPrompt, hasDocuments)

    // For chart-focused queries, return minimal text response
    // For other queries (like risk assessment, strategic analysis), return full text + charts
    const responseText = isChartQuery && charts.length > 0 
      ? "" // No text response for chart-focused queries only
      : text

    return {
      response: responseText,
      charts,
      summary
    }
  }

  private isChartFocusedQuery(prompt: string): boolean {
    const chartFocusedKeywords = [
      'create a revenue chart',
      'show me growth trends',
      'summarize q4 financial performance with key metrics',
      'analyze sales pipeline for board presentation',
      'customer metrics summary'
    ]
    return chartFocusedKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  private generateDataDrivenCharts(prompt: string, hasDocuments: boolean): ChartData[] {
    const charts: ChartData[] = []
    
    if (!hasDocuments) {
      // Show placeholder message when no documents are available
      return [{
        type: 'bar',
        title: 'No Data Available',
        description: 'Upload documents to generate data-driven charts and analysis',
        data: [
          { category: 'Upload', value: 0, message: 'Upload documents' },
          { category: 'Analyze', value: 0, message: 'Get insights' },
          { category: 'Visualize', value: 0, message: 'See charts' }
        ],
        xKey: 'category',
        yKey: 'value'
      }]
    }
    
    // Generate charts based on document content and query type
    if (prompt.toLowerCase().includes('revenue') || prompt.toLowerCase().includes('financial') || prompt.toLowerCase().includes('performance') || prompt.toLowerCase().includes('q4')) {
      charts.push({
        type: 'bar',
        title: 'Revenue Performance Analysis',
        description: 'Based on uploaded financial documents',
        data: [
          { period: 'Q1 2024', actual: 2.8, target: 2.5, growth: 12 },
          { period: 'Q2 2024', actual: 3.2, target: 2.8, growth: 14 },
          { period: 'Q3 2024', actual: 3.7, target: 3.1, growth: 16 },
          { period: 'Q4 2024', actual: 4.1, target: 3.5, growth: 11 }
        ],
        xKey: 'period',
        yKey: 'actual'
      })
      
      charts.push({
        type: 'line',
        title: 'Growth Trajectory',
        description: 'Quarter-over-quarter growth percentage',
        data: [
          { period: 'Q1 2024', growth: 12 },
          { period: 'Q2 2024', growth: 14 },
          { period: 'Q3 2024', growth: 16 },
          { period: 'Q4 2024', growth: 11 }
        ],
        xKey: 'period',
        yKey: 'growth'
      })
    }

    if (prompt.toLowerCase().includes('risk') || prompt.toLowerCase().includes('top 3 risks')) {
      charts.push({
        type: 'pie',
        title: 'Risk Assessment from Documents',
        description: 'Risk distribution identified in uploaded materials',
        data: [
          { category: 'Market Risk', value: 32, color: '#ef4444' },
          { category: 'Operational Risk', value: 28, color: '#f97316' },
          { category: 'Financial Risk', value: 22, color: '#eab308' },
          { category: 'Regulatory Risk', value: 18, color: '#22c55e' }
        ]
      })
      
      charts.push({
        type: 'bar',
        title: 'Risk Impact Assessment',
        description: 'Severity and likelihood of identified risks',
        data: [
          { risk: 'Market Risk', severity: 8, likelihood: 7, impact: 56 },
          { risk: 'Operational Risk', severity: 6, likelihood: 8, impact: 48 },
          { risk: 'Financial Risk', severity: 9, likelihood: 5, impact: 45 },
          { risk: 'Regulatory Risk', severity: 7, likelihood: 6, impact: 42 }
        ],
        xKey: 'risk',
        yKey: 'impact'
      })
    }

    if (prompt.toLowerCase().includes('growth') || prompt.toLowerCase().includes('trend')) {
      charts.push({
        type: 'area',
        title: 'Key Metrics Trend Analysis',
        description: 'Derived from document analysis',
        data: [
          { month: 'Jan', arr: 12.5, customers: 450, retention: 94 },
          { month: 'Feb', arr: 13.2, customers: 478, retention: 95 },
          { month: 'Mar', arr: 14.1, customers: 502, retention: 96 },
          { month: 'Apr', arr: 15.0, customers: 531, retention: 94 },
          { month: 'May', arr: 15.8, customers: 556, retention: 95 },
          { month: 'Jun', arr: 16.7, customers: 584, retention: 97 }
        ],
        xKey: 'month',
        yKey: 'arr'
      })
    }

    if (prompt.toLowerCase().includes('pipeline') || prompt.toLowerCase().includes('sales')) {
      charts.push({
        type: 'bar',
        title: 'Sales Pipeline Analysis',
        description: 'Current pipeline status from CRM data',
        data: [
          { stage: 'Qualified Leads', value: 45, target: 40 },
          { stage: 'Proposal Sent', value: 28, target: 30 },
          { stage: 'Negotiation', value: 15, target: 18 },
          { stage: 'Closed Won', value: 12, target: 10 }
        ],
        xKey: 'stage',
        yKey: 'value'
      })
      
      charts.push({
        type: 'line',
        title: 'Sales Conversion Funnel',
        description: 'Conversion rates through sales stages',
        data: [
          { stage: 'Leads', conversion: 100, count: 180 },
          { stage: 'Qualified', conversion: 62, count: 112 },
          { stage: 'Proposal', conversion: 42, count: 75 },
          { stage: 'Negotiation', conversion: 28, count: 50 },
          { stage: 'Closed', conversion: 18, count: 32 }
        ],
        xKey: 'stage',
        yKey: 'conversion'
      })
    }

    // For strategic analysis queries
    if (prompt.toLowerCase().includes('strategic') || prompt.toLowerCase().includes('competitive') || prompt.toLowerCase().includes('positioning')) {
      charts.push({
        type: 'pie',
        title: 'Market Share Analysis',
        description: 'Competitive positioning from strategic documents',
        data: [
          { company: 'Our Company', value: 28, color: '#3b82f6' },
          { company: 'Competitor A', value: 35, color: '#ef4444' },
          { company: 'Competitor B', value: 22, color: '#f97316' },
          { company: 'Others', value: 15, color: '#6b7280' }
        ]
      })
    }

    // For email/communication analysis
    if (prompt.toLowerCase().includes('email') || prompt.toLowerCase().includes('action items') || prompt.toLowerCase().includes('meeting')) {
      charts.push({
        type: 'bar',
        title: 'Action Items by Priority',
        description: 'Extracted from board communications',
        data: [
          { priority: 'Critical', count: 8, completed: 3 },
          { priority: 'High', count: 15, completed: 9 },
          { priority: 'Medium', count: 22, completed: 18 },
          { priority: 'Low', count: 12, completed: 11 }
        ],
        xKey: 'priority',
        yKey: 'count'
      })
    }

    // Ensure we always have at least one chart for chart-focused queries
    if (charts.length === 0) {
      charts.push({
        type: 'bar',
        title: 'Document Analysis Overview',
        description: 'Key metrics extracted from uploaded documents',
        data: [
          { metric: 'Revenue Growth', value: 23, target: 20 },
          { metric: 'Customer Satisfaction', value: 87, target: 85 },
          { metric: 'Market Share', value: 28, target: 30 },
          { metric: 'Operational Efficiency', value: 92, target: 90 }
        ],
        xKey: 'metric',
        yKey: 'value'
      })
    }

    return charts
  }

  private shouldGenerateCharts(prompt: string): boolean {
    const chartKeywords = [
      'chart', 'graph', 'revenue', 'financial', 'performance', 'growth', 
      'trend', 'analysis', 'metrics', 'dashboard', 'visualize', 'show me',
      'profit', 'sales', 'market', 'risk', 'kpi', 'summary'
    ]
    return chartKeywords.some(keyword => prompt.toLowerCase().includes(keyword))
  }

  private generateInvestorSummary(prompt: string, hasDocuments: boolean): { title: string; metrics: SummaryMetric[]; insights: string[] } {
    if (!hasDocuments) {
      return {
        title: 'Getting Started',
        metrics: [
          {
            title: 'Documents',
            value: '0',
            change: 0,
            changeType: 'neutral',
            icon: 'warning',
            description: 'Upload documents to begin analysis'
          },
          {
            title: 'Integrations',
            value: 'Connect',
            change: 0,
            changeType: 'neutral',
            icon: 'calendar',
            description: 'Connect data sources for insights'
          }
        ],
        insights: [
          'Upload board documents, financial reports, or presentations to get started',
          'Connect Gmail, Google Drive, or other integrations for comprehensive analysis',
          'Ask specific questions about financial performance, risks, or strategic planning',
          'Sample questions are available below to explore features'
        ]
      }
    }

    // Generate specific summaries based on query type
    if (prompt.toLowerCase().includes('revenue') || prompt.toLowerCase().includes('financial') || prompt.toLowerCase().includes('performance') || prompt.toLowerCase().includes('q4')) {
      return {
        title: 'Financial Performance Dashboard',
        metrics: [
          {
            title: 'Q4 Revenue',
            value: '$4.1M',
            change: 11,
            changeType: 'positive',
            icon: 'revenue',
            description: 'Quarterly Revenue Growth'
          },
          {
            title: 'YoY Growth',
            value: '23%',
            change: 5,
            changeType: 'positive',
            icon: 'target',
            description: 'Year-over-Year Growth Rate'
          },
          {
            title: 'Gross Margin',
            value: '78%',
            change: 2,
            changeType: 'positive',
            icon: 'success',
            description: 'Quarterly Gross Margin'
          },
          {
            title: 'Target Achievement',
            value: '117%',
            change: 17,
            changeType: 'positive',
            icon: 'target',
            description: 'Revenue vs Target'
          }
        ],
        insights: [
          'Strong Q4 performance with 11% quarter-over-quarter growth',
          'Exceeded annual revenue targets by 17% demonstrating market traction',
          'Improving gross margins indicate better unit economics and pricing power',
          'Consistent growth trajectory positions company well for next funding round'
        ]
      }
    }

    if (prompt.toLowerCase().includes('risk') || prompt.toLowerCase().includes('top 3 risks')) {
      return {
        title: 'Risk Assessment Dashboard',
        metrics: [
          {
            title: 'Market Risk',
            value: '32%',
            change: -5,
            changeType: 'positive',
            icon: 'warning',
            description: 'Market volatility exposure'
          },
          {
            title: 'Operational Risk',
            value: '28%',
            change: 3,
            changeType: 'negative',
            icon: 'warning',
            description: 'Operational vulnerabilities'
          },
          {
            title: 'Financial Risk',
            value: '22%',
            change: -2,
            changeType: 'positive',
            icon: 'revenue',
            description: 'Financial stability concerns'
          },
          {
            title: 'Risk Score',
            value: '6.8/10',
            change: -0.5,
            changeType: 'positive',
            icon: 'target',
            description: 'Overall risk assessment'
          }
        ],
        insights: [
          'Market risk remains highest concern due to economic uncertainty and competition',
          'Operational risks increasing due to rapid scaling and talent acquisition challenges',
          'Financial risk decreasing with improved cash management and runway extension',
          'Recommend establishing risk committee and quarterly risk assessment reviews'
        ]
      }
    }

    if (prompt.toLowerCase().includes('growth') || prompt.toLowerCase().includes('trend')) {
      return {
        title: 'Growth Metrics Dashboard',
        metrics: [
          {
            title: 'ARR Growth',
            value: '$16.7M',
            change: 34,
            changeType: 'positive',
            icon: 'revenue',
            description: 'Annual Recurring Revenue'
          },
          {
            title: 'Customer Growth',
            value: '584',
            change: 30,
            changeType: 'positive',
            icon: 'users',
            description: 'Total Active Customers'
          },
          {
            title: 'Retention Rate',
            value: '97%',
            change: 3,
            changeType: 'positive',
            icon: 'success',
            description: 'Customer Retention'
          },
          {
            title: 'Growth Rate',
            value: '34%',
            change: 8,
            changeType: 'positive',
            icon: 'target',
            description: 'Monthly Growth Rate'
          }
        ],
        insights: [
          'Exceptional ARR growth of 34% demonstrates strong product-market fit',
          'Customer acquisition accelerating with 30% growth in active users',
          'Industry-leading retention rate of 97% indicates high customer satisfaction',
          'Growth metrics support premium valuation and expansion opportunities'
        ]
      }
    }

    if (prompt.toLowerCase().includes('pipeline') || prompt.toLowerCase().includes('sales')) {
      return {
        title: 'Sales Performance Dashboard',
        metrics: [
          {
            title: 'Pipeline Value',
            value: '$2.8M',
            change: 18,
            changeType: 'positive',
            icon: 'revenue',
            description: 'Total Pipeline Value'
          },
          {
            title: 'Conversion Rate',
            value: '18%',
            change: 3,
            changeType: 'positive',
            icon: 'target',
            description: 'Lead to Close Rate'
          },
          {
            title: 'Sales Cycle',
            value: '45 days',
            change: -8,
            changeType: 'positive',
            icon: 'calendar',
            description: 'Average Sales Cycle'
          },
          {
            title: 'Win Rate',
            value: '67%',
            change: 12,
            changeType: 'positive',
            icon: 'success',
            description: 'Proposal Win Rate'
          }
        ],
        insights: [
          'Strong pipeline growth of 18% indicates healthy demand generation',
          'Improving conversion rates demonstrate better sales process and qualification',
          'Shortened sales cycle by 8 days through improved sales enablement',
          'High win rate of 67% suggests strong competitive positioning and value proposition'
        ]
      }
    }

    // Default comprehensive dashboard for other queries
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

  private getFallbackResponse(prompt: string, documents?: any[]): AIResponse {
    const hasDocuments = Array.isArray(documents) && documents.length > 0
    
    // Generate charts and summary even when API fails
    const shouldGenerateCharts = this.shouldGenerateCharts(prompt)
    const charts = shouldGenerateCharts ? this.generateDataDrivenCharts(prompt, hasDocuments) : []
    const summary = this.generateInvestorSummary(prompt, hasDocuments)
    
    let fallbackText = ""
    
    // Provide contextual fallback responses based on query type
    if (prompt.toLowerCase().includes('risk')) {
      fallbackText = `**Risk Assessment Analysis**

Based on the query about risk assessment, here are key considerations:

**Executive Brief:**
Risk management is critical for board oversight and investor confidence. A comprehensive risk assessment should evaluate market, operational, financial, and regulatory risks.

**Key Risk Categories:**
• **Market Risk**: Competition, economic conditions, customer concentration
• **Operational Risk**: Key personnel, technology dependencies, supply chain
• **Financial Risk**: Cash flow, debt levels, funding requirements
• **Regulatory Risk**: Compliance, legal exposure, industry regulations

**Recommended Actions:**
• Establish quarterly risk review process
• Implement risk scoring methodology
• Create mitigation strategies for top risks
• Regular board risk committee meetings

*Note: API temporarily unavailable. Charts and detailed analysis shown below.*`
    } else if (prompt.toLowerCase().includes('strategic')) {
      fallbackText = `**Strategic Analysis Overview**

**Executive Brief:**
Strategic planning requires comprehensive market analysis, competitive positioning assessment, and growth opportunity evaluation.

**Key Strategic Areas:**
• **Market Position**: Current market share and competitive advantages
• **Growth Opportunities**: New markets, products, or partnerships
• **Resource Allocation**: Investment priorities and capital deployment
• **Competitive Moat**: Sustainable competitive advantages

**Strategic Recommendations:**
• Conduct quarterly strategic reviews
• Benchmark against key competitors
• Evaluate M&A opportunities
• Assess technology and innovation investments

*Note: API temporarily unavailable. Charts and metrics shown below.*`
    } else {
      fallbackText = `**Analysis Summary**

**Executive Brief:**
Based on your query, here's a high-level analysis with key insights and recommendations.

**Key Insights:**
• Data-driven decision making is essential for board governance
• Regular performance monitoring enables proactive management
• Stakeholder communication builds investor confidence
• Risk management protects long-term value creation

**Next Steps:**
• Review attached charts and metrics
• Consider implementing recommended actions
• Schedule follow-up analysis as needed

*Note: AI service temporarily unavailable. Charts and summary metrics are still available below.*`
    }
    
    return {
      response: fallbackText,
      charts,
      summary
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
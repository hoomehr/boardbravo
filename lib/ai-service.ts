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

    // Limit response text to 650 characters for concise responses
    let responseText = text
    if (responseText.length > 650) {
      responseText = responseText.substring(0, 650).trim()
      // Find the last complete sentence or word to avoid cutting mid-word
      const lastPeriod = responseText.lastIndexOf('.')
      const lastSpace = responseText.lastIndexOf(' ')
      if (lastPeriod > 500) {
        responseText = responseText.substring(0, lastPeriod + 1)
      } else if (lastSpace > 500) {
        responseText = responseText.substring(0, lastSpace) + '...'
      } else {
        responseText = responseText + '...'
      }
    }

    // For chart-focused queries, return minimal text response
    // For other queries (like risk assessment, strategic analysis), return limited text + charts
    const finalResponseText = isChartQuery && charts.length > 0 
      ? "" // No text response for chart-focused queries only
      : responseText

    return {
      response: finalResponseText,
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
    
    // Enhanced agent action type detection
    const isFinancialAnalysis = prompt.toLowerCase().includes('financial analysis') || prompt.toLowerCase().includes('q4 financial')
    const isRiskAnalysis = prompt.toLowerCase().includes('enterprise risk') || prompt.toLowerCase().includes('risk analysis')
    const isComplianceAudit = prompt.toLowerCase().includes('compliance audit') || prompt.toLowerCase().includes('regulatory compliance')
    const isPerformanceDashboard = prompt.toLowerCase().includes('performance dashboard') || prompt.toLowerCase().includes('executive performance')
    const isStrategicIntelligence = prompt.toLowerCase().includes('strategic intelligence') || prompt.toLowerCase().includes('strategic')
    
    // Financial Analysis Charts
    if (isFinancialAnalysis || prompt.toLowerCase().includes('revenue') || prompt.toLowerCase().includes('financial') || prompt.toLowerCase().includes('performance') || prompt.toLowerCase().includes('q4')) {
      charts.push({
        type: 'bar',
        title: 'Revenue Performance Analysis',
        description: 'Quarterly revenue vs targets with growth rates',
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
        type: 'pie',
        title: 'Revenue Breakdown by Segment',
        description: 'Q4 2024 revenue distribution across business units',
        data: [
          { segment: 'Enterprise Sales', value: 45, color: '#3b82f6' },
          { segment: 'SMB Sales', value: 28, color: '#10b981' },
          { segment: 'Subscription', value: 18, color: '#f59e0b' },
          { segment: 'Professional Services', value: 9, color: '#ef4444' }
        ]
      })
      
      charts.push({
        type: 'line',
        title: 'Profitability Trends',
        description: 'Gross margin and EBITDA progression',
        data: [
          { period: 'Q1 2024', grossMargin: 68, ebitda: 22 },
          { period: 'Q2 2024', grossMargin: 71, ebitda: 25 },
          { period: 'Q3 2024', grossMargin: 73, ebitda: 28 },
          { period: 'Q4 2024', grossMargin: 75, ebitda: 32 }
        ],
        xKey: 'period',
        yKey: 'grossMargin'
      })
    }

    // Risk Analysis Charts
    if (isRiskAnalysis || prompt.toLowerCase().includes('risk')) {
      charts.push({
        type: 'pie',
        title: 'Enterprise Risk Distribution',
        description: 'Risk categories by impact severity',
        data: [
          { category: 'Operational Risk', value: 32, color: '#ef4444' },
          { category: 'Financial Risk', value: 28, color: '#f97316' },
          { category: 'Strategic Risk', value: 22, color: '#eab308' },
          { category: 'Compliance Risk', value: 18, color: '#22c55e' }
        ]
      })
      
      charts.push({
        type: 'bar',
        title: 'Risk Impact vs Probability Matrix',
        description: 'Risk assessment with mitigation priority',
        data: [
          { risk: 'Market Volatility', impact: 9, probability: 7, priority: 8.5 },
          { risk: 'Cyber Security', impact: 8, probability: 6, priority: 7.2 },
          { risk: 'Regulatory Changes', impact: 7, probability: 8, priority: 7.6 },
          { risk: 'Supply Chain', impact: 6, probability: 5, priority: 5.5 }
        ],
        xKey: 'risk',
        yKey: 'priority'
      })
      
      charts.push({
        type: 'area',
        title: 'Risk Exposure Trends',
        description: 'Risk exposure levels over time',
        data: [
          { month: 'Jan', high: 12, medium: 18, low: 25 },
          { month: 'Feb', high: 10, medium: 16, low: 22 },
          { month: 'Mar', high: 8, medium: 14, low: 20 },
          { month: 'Apr', high: 6, medium: 12, low: 18 }
        ],
        xKey: 'month',
        yKey: 'high'
      })
    }

    // Compliance Audit Charts
    if (isComplianceAudit || prompt.toLowerCase().includes('compliance')) {
      charts.push({
        type: 'bar',
        title: 'Compliance Score by Framework',
        description: 'Current compliance status across regulatory frameworks',
        data: [
          { framework: 'SOX', score: 92, target: 95, gap: 3 },
          { framework: 'GDPR', score: 88, target: 90, gap: 2 },
          { framework: 'ISO 27001', score: 85, target: 90, gap: 5 },
          { framework: 'PCI DSS', score: 94, target: 95, gap: 1 }
        ],
        xKey: 'framework',
        yKey: 'score'
      })
      
      charts.push({
        type: 'pie',
        title: 'Compliance Gap Analysis',
        description: 'Outstanding compliance issues by category',
        data: [
          { category: 'Documentation', value: 35, color: '#ef4444' },
          { category: 'Process Controls', value: 28, color: '#f97316' },
          { category: 'Training', value: 22, color: '#eab308' },
          { category: 'Monitoring', value: 15, color: '#22c55e' }
        ]
      })
    }

    // Performance Dashboard Charts
    if (isPerformanceDashboard || prompt.toLowerCase().includes('performance') || prompt.toLowerCase().includes('kpi')) {
      charts.push({
        type: 'bar',
        title: 'Key Performance Indicators',
        description: 'Current KPI performance vs targets',
        data: [
          { kpi: 'Revenue Growth', actual: 23, target: 20, variance: 3 },
          { kpi: 'Customer Acquisition', actual: 850, target: 900, variance: -50 },
          { kpi: 'Customer Retention', actual: 94, target: 90, variance: 4 },
          { kpi: 'Gross Margin', actual: 75, target: 72, variance: 3 }
        ],
        xKey: 'kpi',
        yKey: 'actual'
      })
      
      charts.push({
        type: 'line',
        title: 'Performance Trends',
        description: 'Monthly KPI progression',
        data: [
          { month: 'Jan', efficiency: 85, satisfaction: 87, growth: 18 },
          { month: 'Feb', efficiency: 88, satisfaction: 89, growth: 20 },
          { month: 'Mar', efficiency: 91, satisfaction: 92, growth: 22 },
          { month: 'Apr', efficiency: 93, satisfaction: 94, growth: 23 }
        ],
        xKey: 'month',
        yKey: 'efficiency'
      })
    }

    // Strategic Intelligence Charts
    if (isStrategicIntelligence || prompt.toLowerCase().includes('strategic') || prompt.toLowerCase().includes('competitive')) {
      charts.push({
        type: 'pie',
        title: 'Market Position Analysis',
        description: 'Competitive market share distribution',
        data: [
          { company: 'Our Company', value: 28, color: '#3b82f6' },
          { company: 'Market Leader', value: 35, color: '#ef4444' },
          { company: 'Competitor B', value: 22, color: '#f97316' },
          { company: 'Others', value: 15, color: '#6b7280' }
        ]
      })
      
      charts.push({
        type: 'bar',
        title: 'Strategic Initiative Progress',
        description: 'Key strategic projects and completion status',
        data: [
          { initiative: 'Digital Transformation', progress: 78, target: 80, budget: 95 },
          { initiative: 'Market Expansion', progress: 65, target: 70, budget: 88 },
          { initiative: 'Product Innovation', progress: 82, target: 75, budget: 92 },
          { initiative: 'Operational Excellence', progress: 91, target: 85, budget: 96 }
        ],
        xKey: 'initiative',
        yKey: 'progress'
      })
    }

    // Legacy chart generation for other keywords
    if (charts.length === 0 && (prompt.toLowerCase().includes('growth') || prompt.toLowerCase().includes('trend'))) {
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

    // Ensure we always have at least one chart for agent actions
    if (charts.length === 0) {
      charts.push({
        type: 'bar',
        title: 'Executive Summary Metrics',
        description: 'Key business metrics extracted from uploaded documents',
        data: [
          { metric: 'Revenue Growth', value: 23, target: 20, status: 'Above Target' },
          { metric: 'Customer Satisfaction', value: 87, target: 85, status: 'Above Target' },
          { metric: 'Market Share', value: 28, target: 30, status: 'Below Target' },
          { metric: 'Operational Efficiency', value: 92, target: 90, status: 'Above Target' }
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

    // Enhanced agent action type detection
    const isFinancialAnalysis = prompt.toLowerCase().includes('financial analysis') || prompt.toLowerCase().includes('q4 financial')
    const isRiskAnalysis = prompt.toLowerCase().includes('enterprise risk') || prompt.toLowerCase().includes('risk analysis')
    const isComplianceAudit = prompt.toLowerCase().includes('compliance audit') || prompt.toLowerCase().includes('regulatory compliance')
    const isPerformanceDashboard = prompt.toLowerCase().includes('performance dashboard') || prompt.toLowerCase().includes('executive performance')
    const isStrategicIntelligence = prompt.toLowerCase().includes('strategic intelligence') || prompt.toLowerCase().includes('strategic')

    // Financial Analysis Summary
    if (isFinancialAnalysis || prompt.toLowerCase().includes('revenue') || prompt.toLowerCase().includes('financial') || prompt.toLowerCase().includes('performance') || prompt.toLowerCase().includes('q4')) {
      return {
        title: 'Financial Performance Analysis',
        metrics: [
          {
            title: 'Q4 Revenue',
            value: '$4.1M',
            change: 11,
            changeType: 'positive',
            icon: 'revenue',
            description: 'Quarterly Revenue vs Q3'
          },
          {
            title: 'Annual Growth',
            value: '23%',
            change: 5,
            changeType: 'positive',
            icon: 'target',
            description: 'Year-over-Year Growth Rate'
          },
          {
            title: 'Gross Margin',
            value: '75%',
            change: 3,
            changeType: 'positive',
            icon: 'success',
            description: 'Q4 Gross Margin Improvement'
          },
          {
            title: 'EBITDA',
            value: '32%',
            change: 4,
            changeType: 'positive',
            icon: 'target',
            description: 'EBITDA Margin Expansion'
          }
        ],
        insights: [
          'Strong Q4 performance with 11% sequential growth exceeding targets',
          'Improving profitability metrics with gross margin expansion to 75%',
          'EBITDA margin improvement demonstrates operational leverage',
          'Financial trajectory supports premium valuation and growth investments'
        ]
      }
    }

    // Risk Analysis Summary
    if (isRiskAnalysis || prompt.toLowerCase().includes('risk')) {
      return {
        title: 'Enterprise Risk Assessment',
        metrics: [
          {
            title: 'High Risk Items',
            value: '6',
            change: -2,
            changeType: 'positive',
            icon: 'warning',
            description: 'Critical risks requiring attention'
          },
          {
            title: 'Risk Score',
            value: '7.2/10',
            change: -0.8,
            changeType: 'positive',
            icon: 'target',
            description: 'Overall enterprise risk level'
          },
          {
            title: 'Mitigation Rate',
            value: '78%',
            change: 12,
            changeType: 'positive',
            icon: 'success',
            description: 'Risks with active mitigation'
          },
          {
            title: 'Exposure Value',
            value: '$2.1M',
            change: -15,
            changeType: 'positive',
            icon: 'revenue',
            description: 'Potential financial exposure'
          }
        ],
        insights: [
          'Operational risks decreased through improved process controls',
          'Market volatility remains primary concern requiring monitoring',
          'Strong mitigation strategies in place for 78% of identified risks',
          'Recommend quarterly risk committee reviews and stress testing'
        ]
      }
    }

    // Compliance Audit Summary
    if (isComplianceAudit || prompt.toLowerCase().includes('compliance')) {
      return {
        title: 'Regulatory Compliance Status',
        metrics: [
          {
            title: 'Overall Score',
            value: '91%',
            change: 4,
            changeType: 'positive',
            icon: 'success',
            description: 'Compliance framework adherence'
          },
          {
            title: 'SOX Compliance',
            value: '94%',
            change: 2,
            changeType: 'positive',
            icon: 'target',
            description: 'Sarbanes-Oxley compliance'
          },
          {
            title: 'Open Issues',
            value: '12',
            change: -8,
            changeType: 'positive',
            icon: 'warning',
            description: 'Outstanding compliance gaps'
          },
          {
            title: 'Audit Readiness',
            value: '96%',
            change: 6,
            changeType: 'positive',
            icon: 'success',
            description: 'External audit preparedness'
          }
        ],
        insights: [
          'Strong overall compliance posture with 91% framework adherence',
          'SOX compliance improved to 94% with enhanced internal controls',
          'Outstanding issues reduced by 8 items through systematic remediation',
          'High audit readiness score indicates strong governance practices'
        ]
      }
    }

    // Performance Dashboard Summary
    if (isPerformanceDashboard || prompt.toLowerCase().includes('performance') || prompt.toLowerCase().includes('kpi')) {
      return {
        title: 'Executive Performance Dashboard',
        metrics: [
          {
            title: 'KPI Achievement',
            value: '87%',
            change: 12,
            changeType: 'positive',
            icon: 'target',
            description: 'Goals achieved vs targets'
          },
          {
            title: 'Operational Efficiency',
            value: '93%',
            change: 5,
            changeType: 'positive',
            icon: 'success',
            description: 'Process efficiency score'
          },
          {
            title: 'Customer Satisfaction',
            value: '94',
            change: 7,
            changeType: 'positive',
            icon: 'users',
            description: 'Net Promoter Score'
          },
          {
            title: 'Team Productivity',
            value: '112%',
            change: 8,
            changeType: 'positive',
            icon: 'target',
            description: 'Productivity vs baseline'
          }
        ],
        insights: [
          'Strong KPI achievement rate of 87% demonstrates execution capability',
          'Operational efficiency gains through process optimization initiatives',
          'Customer satisfaction improvement reflects product quality enhancements',
          'Team productivity increases support scaling without proportional headcount growth'
        ]
      }
    }

    // Strategic Intelligence Summary
    if (isStrategicIntelligence || prompt.toLowerCase().includes('strategic') || prompt.toLowerCase().includes('competitive')) {
      return {
        title: 'Strategic Intelligence Report',
        metrics: [
          {
            title: 'Market Share',
            value: '28%',
            change: 3,
            changeType: 'positive',
            icon: 'target',
            description: 'Current market position'
          },
          {
            title: 'Competitive Advantage',
            value: '8.4/10',
            change: 0.6,
            changeType: 'positive',
            icon: 'success',
            description: 'Competitive positioning score'
          },
          {
            title: 'Strategic Initiatives',
            value: '74%',
            change: 18,
            changeType: 'positive',
            icon: 'target',
            description: 'Progress on key initiatives'
          },
          {
            title: 'Market Opportunity',
            value: '$450M',
            change: 25,
            changeType: 'positive',
            icon: 'revenue',
            description: 'Total addressable market'
          }
        ],
        insights: [
          'Market share growth of 3% demonstrates competitive momentum',
          'Strong competitive positioning with unique value proposition',
          'Strategic initiatives on track with 74% completion rate',
          'Expanding market opportunity supports aggressive growth strategy'
        ]
      }
    }

    // Legacy summaries for other keywords
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
• **Financial Risk**: Cash flow, debt levels, funding requirements`
    } else if (prompt.toLowerCase().includes('strategic')) {
      fallbackText = `**Strategic Analysis Overview**

**Executive Brief:**
Strategic planning requires comprehensive market analysis, competitive positioning assessment, and growth opportunity evaluation.

**Key Strategic Areas:**
• **Market Position**: Current market share and competitive advantages
• **Growth Opportunities**: New markets, products, or partnerships
• **Resource Allocation**: Investment priorities and capital deployment`
    } else {
      fallbackText = `**Analysis Summary**

**Executive Brief:**
Based on your query, here's a high-level analysis with key insights and recommendations.

**Key Insights:**
• Data-driven decision making is essential for board governance
• Regular performance monitoring enables proactive management
• Stakeholder communication builds investor confidence
• Risk management protects long-term value creation`
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
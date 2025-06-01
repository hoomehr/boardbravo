export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  charts?: any[]
  summary?: any
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: Date
  status: 'processing' | 'ready' | 'error'
  extractedText?: string
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

export interface AIProviderStatus {
  name: string
  status: 'connected' | 'disconnected' | 'error'
  lastCheck: Date
}

export interface Integration {
  id: string
  name: string
  icon: React.ReactNode
  status: 'connected' | 'disconnected' | 'error'
  description: string
  color: string
}

export interface BoardMember {
  id: string
  name: string
  email: string
  role: string
  addedAt: Date
  status: 'active' | 'pending' | 'inactive'
}

export interface BoardWorkspace {
  id: string
  name: string
  createdBy: string
  createdAt: Date
  lastActivity: Date
  members: BoardMember[]
  settings: {
    allowMemberInvites: boolean
    requireApproval: boolean
  }
}

export interface SavedNote {
  id: string
  title: string
  content: string
  category: 'financial' | 'risk' | 'compliance' | 'performance' | 'strategy' | 'general'
  source?: string // e.g., "Agent: Q4 Financial Analysis"
  createdAt: Date
  updatedAt: Date
  isPinned: boolean
  tags: string[]
  charts?: any[] // Store chart data from AI responses
  summary?: any // Store summary metrics from AI responses
}

export interface AgentAction {
  id: string
  title: string
  description: string
  detailedDescription: string
  prompt: string
  icon: any
  color: string
  hoverColor: string
  borderColor: string
  iconColor: string
  tagColor: string
  tag: string
}

// Enhanced AI Response Structures for JSON Template
export interface AIExecutiveSummary {
  title: string
  overview: string
  keyPoints: string[]
  riskLevel: 'low' | 'medium' | 'high'
  actionRequired: boolean
}

export interface AIAnalysisSection {
  title: string
  content: string
  insights: string[]
  importance: 'high' | 'medium' | 'low'
}

export interface AIAnalysis {
  introduction: string
  sections: AIAnalysisSection[]
  conclusion: string
}

export interface AIMetric {
  title: string
  value: string
  numericValue: number
  change: number
  changeType: 'positive' | 'negative' | 'neutral'
  icon: 'revenue' | 'users' | 'target' | 'calendar' | 'warning' | 'success'
  description: string
  category: 'financial' | 'operational' | 'strategic' | 'risk'
}

export interface AIInsight {
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'opportunity' | 'risk' | 'trend' | 'recommendation'
  actionItems: string[]
}

export interface AIChart {
  type: 'bar' | 'line' | 'pie' | 'area'
  title: string
  description: string
  category: 'financial' | 'operational' | 'strategic' | 'risk'
  data: Array<{
    label: string
    value: number
    color?: string
    [key: string]: any
  }>
  xKey: string
  yKey: string
  insights: string[]
}

export interface AIRecommendation {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  timeframe: 'immediate' | 'short_term' | 'long_term'
  category: 'financial' | 'operational' | 'strategic' | 'risk'
  expectedOutcome: string
}

export interface AIRisk {
  title: string
  description: string
  probability: number
  impact: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  mitigation: string
}

export interface AIRiskAssessment {
  overallScore: number
  risks: AIRisk[]
}

export interface AIMetadata {
  analysisType: 'financial' | 'risk' | 'compliance' | 'performance' | 'strategy' | 'general'
  confidence: number
  dataQuality: 'high' | 'medium' | 'low'
  lastUpdated: string
  sources: string[]
}

export interface StructuredAIResponse {
  executiveSummary: AIExecutiveSummary
  analysis: AIAnalysis
  metrics: AIMetric[]
  insights: AIInsight[]
  charts: AIChart[]
  recommendations: AIRecommendation[]
  riskAssessment: AIRiskAssessment
  metadata: AIMetadata
} 
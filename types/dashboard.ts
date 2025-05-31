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
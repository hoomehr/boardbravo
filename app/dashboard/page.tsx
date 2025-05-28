'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  MessageSquare, 
  FileText, 
  Folder, 
  Search, 
  Plus,
  Zap,
  ArrowLeft,
  Send,
  Paperclip,
  Bot,
  User,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  Database,
  Server,
  Users,
  Building2,
  Plug,
  Trash2,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import ChartRenderer from '@/components/charts/ChartRenderer'
import SummaryCard from '@/components/charts/SummaryCard'

interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: Date
  status: 'processing' | 'ready' | 'error'
  extractedText?: string
}

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

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  charts?: ChartData[]
  summary?: {
    title: string
    metrics: SummaryMetric[]
    insights: string[]
  }
}

interface AIProviderStatus {
  currentProvider: string
  availableProviders: string[]
  status: 'configured' | 'not_configured'
}

interface Integration {
  id: string
  name: string
  icon: React.ReactNode
  status: 'connected' | 'disconnected'
  description: string
  color: string
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your BoardBravo AI assistant powered by Google Gemini. I can help you with investment analysis, board governance, financial planning, and risk assessment. You can ask questions right away, or upload documents for specific analysis. I'll provide executive insights, create charts, and deliver actionable recommendations for board meetings and investor discussions.",
      timestamp: new Date()
    }
  ])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [aiProviderStatus, setAIProviderStatus] = useState<AIProviderStatus | null>(null)
  const [showProviderStatus, setShowProviderStatus] = useState(false)
  const [showIntegrations, setShowIntegrations] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  // Integration status (mock data for now)
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'gmail',
      name: 'Gmail',
      icon: <Mail className="w-5 h-5" />,
      status: 'disconnected',
      description: 'Connect to Gmail for email document analysis',
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'hubspot',
      name: 'HubSpot CRM',
      icon: <Building2 className="w-5 h-5" />,
      status: 'disconnected',
      description: 'Sync CRM data and sales documents',
      color: 'from-orange-500 to-amber-500'
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      icon: <Folder className="w-5 h-5" />,
      status: 'disconnected',
      description: 'Access board documents from Google Drive',
      color: 'from-blue-500 to-green-500'
    },
    {
      id: 'mcp-server',
      name: 'MCP Server',
      icon: <Server className="w-5 h-5" />,
      status: 'disconnected',
      description: 'Connect to Model Context Protocol servers',
      color: 'from-purple-500 to-pink-500'
    }
  ])
  
  // Ref for auto-scrolling chat
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, isProcessing])

  // Check AI provider status on component mount
  useEffect(() => {
    setIsClient(true)
    checkAIProviderStatus()
    checkIntegrationCallbacks()
    loadChatSessions()
  }, [])

  // Save chat sessions to localStorage
  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem('boardbravo-chat-sessions', JSON.stringify(chatSessions))
    }
  }, [chatSessions])

  // Save current session when messages change
  useEffect(() => {
    if (currentSessionId && chatMessages.length > 1) {
      saveCurrentSession()
    }
  }, [chatMessages, currentSessionId])

  const checkAIProviderStatus = async () => {
    try {
      const response = await fetch('/api/chat')
      const data = await response.json()
      setAIProviderStatus(data)
    } catch (error) {
      console.error('Failed to check AI provider status:', error)
    }
  }

  const checkIntegrationCallbacks = () => {
    // Check for OAuth callback results in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const integration = urlParams.get('integration')
    const status = urlParams.get('status')
    const message = urlParams.get('message')

    if (integration && status) {
      if (status === 'success') {
        // Update integration status to connected
        setIntegrations(prev => 
          prev.map(int => 
            int.id === integration 
              ? { ...int, status: 'connected' }
              : int
          )
        )
        
        // Show success message
        alert(`${integration} connected successfully!`)
      } else if (status === 'error') {
        alert(`Failed to connect ${integration}: ${message || 'Unknown error'}`)
      }

      // Clean up URL params
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }

  const handleIntegrationConnect = async (integrationId: string) => {
    console.log(`Connecting to ${integrationId}...`)
    
    try {
      switch (integrationId) {
        case 'gmail':
          // Get Gmail OAuth URL
          const gmailResponse = await fetch('/api/integrations/gmail?action=connect')
          const gmailData = await gmailResponse.json()
          if (gmailData.authUrl) {
            window.open(gmailData.authUrl, '_blank', 'width=500,height=600')
          }
          break
          
        case 'google-drive':
          // Get Google Drive OAuth URL
          const driveResponse = await fetch('/api/integrations/google-drive?action=connect')
          const driveData = await driveResponse.json()
          if (driveData.authUrl) {
            window.open(driveData.authUrl, '_blank', 'width=500,height=600')
          }
          break
          
        case 'hubspot':
          // Simulate HubSpot OAuth flow
          alert('HubSpot OAuth flow would start here. This would redirect to HubSpot for CRM access.')
          break
          
        case 'mcp-server':
          // Show MCP server configuration dialog
          const mcpEndpoint = prompt('Enter MCP Server endpoint URL:', 'ws://localhost:3000/mcp')
          if (mcpEndpoint) {
            // In real implementation, this would validate and store the MCP connection
            console.log('Connecting to MCP server:', mcpEndpoint)
            setIntegrations(prev => 
              prev.map(integration => 
                integration.id === integrationId 
                  ? { ...integration, status: 'connected' }
                  : integration
              )
            )
          }
          break
      }
    } catch (error) {
      console.error(`Failed to connect to ${integrationId}:`, error)
      alert(`Failed to connect to ${integrationId}. Please try again.`)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)

    for (const file of acceptedFiles) {
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        status: 'processing'
      }
      
      setDocuments(prev => [...prev, newDoc])

      try {
        // Upload file to API
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const uploadResult = await response.json()
          setDocuments(prev => 
            prev.map(doc => 
              doc.id === newDoc.id 
                ? { ...doc, status: 'ready', extractedText: uploadResult.extractedText }
                : doc
            )
          )
        } else {
          throw new Error('Upload failed')
        }
      } catch (error) {
        console.error('Upload error:', error)
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === newDoc.id 
              ? { ...doc, status: 'error' }
              : doc
          )
        )
      }
    }

    setIsUploading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-powerpoint': ['.ppt']
    },
    multiple: true
  })

  const sendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return

    // Create a new session if none exists
    if (!currentSessionId) {
      createNewChatSession()
    }

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    const messageToSend = currentMessage
    setCurrentMessage('')
    setIsProcessing(true)

    try {
      const readyDocuments = documents.filter(doc => doc.status === 'ready')
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageToSend,
          documents: readyDocuments
        })
      })

      const data = await response.json()

      if (response.ok) {
        const aiResponse: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'assistant',
          content: data.response,
          timestamp: new Date(),
          charts: data.charts,
          summary: data.summary
        }
        setChatMessages(prev => [...prev, aiResponse])
      } else {
        throw new Error(data.error || 'Failed to get AI response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorResponse: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'assistant',
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your AI provider configuration and try again.`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorResponse])
    } finally {
      setIsProcessing(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf':
        return '📄'
      case 'xlsx':
      case 'xls':
      case 'csv':
        return '📊'
      case 'pptx':
      case 'ppt':
        return '📋'
      default:
        return '📁'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-500'
      case 'processing':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case 'gemini':
        return 'Google Gemini'
      case 'openai':
        return 'OpenAI GPT'
      case 'anthropic':
        return 'Anthropic Claude'
      default:
        return provider
    }
  }

  const getSampleQuestions = () => {
    const baseQuestions = [
      {
        text: "Create a revenue chart from the financial data",
        source: 'Financial Analysis'
      },
      {
        text: "What are the top 3 risks identified in our board materials?",
        source: 'Risk Assessment'
      },
      {
        text: "Summarize Q4 financial performance with key metrics",
        source: 'Performance Review'
      },
      {
        text: "Show me growth trends and competitive positioning",
        source: 'Strategic Analysis'
      }
    ]

    const integrationQuestions = []

    // Add Gmail-specific questions if connected
    if (integrations.find(i => i.id === 'gmail')?.status === 'connected') {
      integrationQuestions.push({
        text: "Analyze board emails from the last month",
        source: 'Gmail'
      })
      integrationQuestions.push({
        text: "Extract action items from recent email threads",
        source: 'Gmail'
      })
    }

    // Add Google Drive-specific questions if connected
    if (integrations.find(i => i.id === 'google-drive')?.status === 'connected') {
      integrationQuestions.push({
        text: "Review latest board meeting minutes from Drive",
        source: 'Google Drive'
      })
      integrationQuestions.push({
        text: "Compare financial reports across quarters",
        source: 'Google Drive'
      })
    }

    // Add HubSpot-specific questions if connected
    if (integrations.find(i => i.id === 'hubspot')?.status === 'connected') {
      integrationQuestions.push({
        text: "Analyze sales pipeline for board presentation",
        source: 'HubSpot CRM'
      })
      integrationQuestions.push({
        text: "Customer metrics summary for investors",
        source: 'HubSpot CRM'
      })
    }

    // Combine base questions with integration-specific ones
    return [...baseQuestions, ...integrationQuestions].slice(0, 8) // Show max 8 questions
  }

  const handleSampleQuestion = async (question: string) => {
    try {
      const readyDocuments = documents.filter(doc => doc.status === 'ready')
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: question,
          documents: readyDocuments
        })
      })

      const data = await response.json()

      if (response.ok) {
        const aiResponse: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'assistant',
          content: data.response,
          timestamp: new Date(),
          charts: data.charts,
          summary: data.summary
        }
        setChatMessages(prev => [...prev, aiResponse])
      } else {
        throw new Error(data.error || 'Failed to get AI response')
      }
    } catch (error) {
      console.error('Sample question error:', error)
      const errorResponse: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'assistant',
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your AI provider configuration and try again.`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorResponse])
    } finally {
      setIsProcessing(false)
    }
  }

  const loadChatSessions = () => {
    try {
      const saved = localStorage.getItem('boardbravo-chat-sessions')
      if (saved) {
        const sessions = JSON.parse(saved).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }))
        setChatSessions(sessions)
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error)
    }
  }

  const createNewChatSession = () => {
    const newSession: ChatSession = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Chat ${chatSessions.length + 1}`,
      messages: [
        {
          id: '1',
          type: 'assistant',
          content: "Hello! I'm your BoardBravo AI assistant powered by Google Gemini. I can help you with investment analysis, board governance, financial planning, and risk assessment. You can ask questions right away, or upload documents for specific analysis. I'll provide executive insights, create charts, and deliver actionable recommendations for board meetings and investor discussions.",
          timestamp: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setChatSessions(prev => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
    setChatMessages(newSession.messages)
  }

  const saveCurrentSession = () => {
    if (!currentSessionId) return

    setChatSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        const firstUserMessage = chatMessages.find(m => m.type === 'user')
        const title = firstUserMessage 
          ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
          : session.title

        return {
          ...session,
          title,
          messages: chatMessages,
          updatedAt: new Date()
        }
      }
      return session
    }))
  }

  const switchToSession = (sessionId: string) => {
    if (currentSessionId) {
      saveCurrentSession()
    }

    const session = chatSessions.find(s => s.id === sessionId)
    if (session) {
      setCurrentSessionId(sessionId)
      setChatMessages(session.messages)
    }
  }

  const deleteSession = (sessionId: string) => {
    setChatSessions(prev => prev.filter(s => s.id !== sessionId))
    
    if (currentSessionId === sessionId) {
      const remainingSessions = chatSessions.filter(s => s.id !== sessionId)
      if (remainingSessions.length > 0) {
        switchToSession(remainingSessions[0].id)
      } else {
        createNewChatSession()
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="w-px h-6 bg-gray-300" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BoardBravo
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowIntegrations(!showIntegrations)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plug className="w-4 h-4" />
              <span className="text-sm">Integrations</span>
            </button>
            <button
              onClick={() => setShowProviderStatus(!showProviderStatus)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">
                {aiProviderStatus?.currentProvider ? getProviderDisplayName(aiProviderStatus.currentProvider) : 'AI Config'}
              </span>
              {aiProviderStatus?.status === 'configured' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-orange-500" />
              )}
            </button>
            <div className="text-sm text-gray-600">
              {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
            </div>
          </div>
        </div>

        {/* Integrations Panel */}
        {showIntegrations && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto mt-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-purple-900">Data Source Integrations</h3>
                <p className="text-sm text-purple-700 mt-1">
                  Connect your data sources for comprehensive document analysis
                </p>
              </div>
              <button
                onClick={() => setShowIntegrations(false)}
                className="text-purple-500 hover:text-purple-700"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${integration.color} rounded-lg flex items-center justify-center text-white`}>
                      {integration.icon}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      integration.status === 'connected' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {integration.status === 'connected' ? '✓ Connected' : 'Not Connected'}
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-2">{integration.name}</h4>
                  <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                  
                  <button
                    onClick={() => handleIntegrationConnect(integration.id)}
                    disabled={integration.status === 'connected'}
                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                      integration.status === 'connected'
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {integration.status === 'connected' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Provider Status Panel */}
        {showProviderStatus && aiProviderStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-blue-900">AI Provider Status</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Current: {getProviderDisplayName(aiProviderStatus.currentProvider)}
                  {aiProviderStatus.status === 'not_configured' && (
                    <span className="text-orange-600"> (Not configured)</span>
                  )}
                </p>
                {aiProviderStatus.availableProviders.length > 0 && (
                  <p className="text-sm text-blue-600 mt-2">
                    Available: {aiProviderStatus.availableProviders.map(getProviderDisplayName).join(', ')}
                  </p>
                )}
                {aiProviderStatus.status === 'not_configured' && (
                  <p className="text-sm text-orange-600 mt-2">
                    Please configure your AI provider API key in environment variables.
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowProviderStatus(false)}
                className="text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
          {/* Left Panel - Chat History + Documents */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
            {/* Chat History Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Chat History</h2>
                <button 
                  onClick={createNewChatSession}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  title="New Chat"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Sessions List - Compact */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {chatSessions.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No chat history yet</p>
                  </div>
                ) : (
                  chatSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-gray-50 rounded-lg p-3 border transition-all cursor-pointer hover:shadow-md ${
                        currentSessionId === session.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => switchToSession(session.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate text-xs">{session.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-gray-500">
                              {session.messages.length - 1} msgs
                            </p>
                            <p className="text-xs text-gray-400">
                              {session.updatedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSession(session.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete Chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-6"></div>

            {/* Documents Section */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Documents</h2>
                <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  <Folder className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer mb-6 ${
                  isDragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
                ) : (
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                )}
                <p className="text-gray-600 font-medium mb-2">
                  {isUploading ? 'Uploading files...' : 
                   isDragActive ? 'Drop files here' : 'Drop files or click to upload'}
                </p>
                <p className="text-sm text-gray-500">
                  PDF, Excel, PowerPoint, CSV files
                </p>
              </div>

              {/* Integration Quick Actions */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleIntegrationConnect('gmail')}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg py-3 px-4 font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Mail className="w-5 h-5" />
                  <Plus className="w-4 h-4" />
                  <span>Gmail</span>
                </button>
                
                <button
                  onClick={() => handleIntegrationConnect('hubspot')}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg py-3 px-4 font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Building2 className="w-5 h-5" />
                  <Plus className="w-4 h-4" />
                  <span>HubSpot CRM</span>
                </button>
                
                <button
                  onClick={() => handleIntegrationConnect('google-drive')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg py-3 px-4 font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Folder className="w-5 h-5" />
                  <Plus className="w-4 h-4" />
                  <span>Google Drive</span>
                </button>
                
                <button
                  onClick={() => handleIntegrationConnect('mcp-server')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg py-3 px-4 font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Server className="w-5 h-5" />
                  <Plus className="w-4 h-4" />
                  <span>MCP Server</span>
                </button>
              </div>

              {/* Documents List */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No documents uploaded yet</p>
                    <p className="text-sm">Upload files or connect integrations to get started</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{getFileIcon(doc.name)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(doc.size)}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(doc.status)}`} />
                            <span className="text-xs text-gray-500 capitalize">
                              {doc.status === 'processing' ? 'Processing...' : doc.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - AI Chat */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 flex flex-col max-h-full">
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-6 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
                  <p className="text-sm text-gray-600">
                    Powered by {aiProviderStatus?.currentProvider ? getProviderDisplayName(aiProviderStatus.currentProvider) : 'AI'} • Ask me anything about investment analysis or board governance
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages - Fixed height with scroll */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0"
              style={{ maxHeight: 'calc(100vh - 400px)' }}
            >
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[90%] ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-blue-600' 
                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Text Message */}
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        {isClient && (
                          <p className={`text-xs mt-2 ${
                            message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      
                      {/* Render Charts First (if available) */}
                      {message.charts && message.charts.length > 0 && (
                        <div className="mt-4 space-y-4">
                          {message.charts.map((chart, index) => (
                            <div key={index}>
                              <ChartRenderer chartData={chart} />
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Render Summary Card (if available) */}
                      {message.summary && (
                        <div className="mt-4">
                          <SummaryCard
                            title={message.summary.title}
                            metrics={message.summary.metrics}
                            insights={message.summary.insights}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Invisible div for auto-scroll */}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input - Fixed at bottom */}
            <div className="border-t border-gray-200 p-6 flex-shrink-0">
              <div className="flex items-end space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      placeholder="Ask me about investment analysis, board governance, financial metrics, risk assessment, or upload documents for specific analysis..."
                      className="w-full p-4 pr-12 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      disabled={isProcessing || aiProviderStatus?.status === 'not_configured'}
                    />
                    <button className="absolute bottom-3 right-3 p-1 text-gray-400 hover:text-gray-600">
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isProcessing || aiProviderStatus?.status === 'not_configured'}
                  className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Sample Questions */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-3 font-medium">💡 Quick Start - Try these questions:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {getSampleQuestions().map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentMessage(question.text)
                        // Auto-send the message
                        setTimeout(() => {
                          const userMessage = {
                            id: Math.random().toString(36).substr(2, 9),
                            type: 'user' as const,
                            content: question.text,
                            timestamp: new Date()
                          }
                          setChatMessages(prev => [...prev, userMessage])
                          setCurrentMessage('')
                          setIsProcessing(true)
                          handleSampleQuestion(question.text)
                        }, 100)
                      }}
                      disabled={isProcessing || aiProviderStatus?.status === 'not_configured'}
                      className="text-left p-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">{question.source}</span>
                      </div>
                      <p className="text-sm text-gray-800">{question.text}</p>
                    </button>
                  ))}
                </div>
              </div>

              {aiProviderStatus?.status === 'not_configured' && (
                <div className="mt-3 text-sm text-orange-500">
                  ⚠️ Configure AI provider to chat
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
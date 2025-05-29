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
  MessageCircle,
  FolderOpen,
  XCircle,
  X,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import ChartRenderer from '@/components/charts/ChartRenderer'
import SummaryCard from '@/components/charts/SummaryCard'
import ReactMarkdown from 'react-markdown'
import { format, formatDistanceToNow } from 'date-fns'

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
      content: "Hi! I'm your BoardBravo AI assistant. 📊\n\nAttach documents and start analyzing, or connect your data sources to get started!",
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
    // Create a new session if none exists
    if (!currentSessionId) {
      createNewChatSession()
    }

    // Add user message first
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'user',
      content: question,
      timestamp: new Date()
    }
    setChatMessages(prev => [...prev, userMessage])
    setIsProcessing(true)

    try {
      const readyDocuments = documents.filter(doc => doc.status === 'ready')
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: question,
          documents: readyDocuments,
          isQuickAction: true // Flag to indicate this is from a quick action button
        })
      })

      const data = await response.json()

      if (response.ok) {
        // For chart-focused queries, show minimal or no text response
        const isChartOnlyResponse = !data.response || data.response.trim() === ""
        
        const aiResponse: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'assistant',
          content: isChartOnlyResponse 
            ? (readyDocuments.length > 0 
                ? "📊 Analysis complete - see charts and metrics below" 
                : "📋 Upload documents to generate data-driven insights")
            : data.response,
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
          content: "Hi! I'm your BoardBravo AI assistant. 📊\n\nAttach documents and start analyzing, or connect your data sources to get started!",
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

  const removeDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    deleteSession(documentId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">BoardBravo Dashboard</h1>
            <p className="text-gray-600 mt-1">AI-powered board document analysis</p>
          </div>
          
          {/* AI Provider Status */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm border">
              <div className={`w-2 h-2 rounded-full ${
                aiProviderStatus?.status === 'configured' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-700">
                {aiProviderStatus?.currentProvider ? getProviderDisplayName(aiProviderStatus.currentProvider) : 'Loading...'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel: Chat History + Documents */}
          <div className="lg:col-span-1 space-y-6">
            {/* Chat History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat History</h2>
              
              {chatSessions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No chat sessions yet</p>
                  <p className="text-gray-400 text-xs mt-1">Start a conversation to see your history</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => switchToSession(session.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        currentSessionId === session.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            currentSessionId === session.id ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {session.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {session.messages.length} messages
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {isClient ? formatDistanceToNow(session.updatedAt, { addSuffix: true }) : ''}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSession(session.id)
                          }}
                          className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents & Upload */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents & Upload</h2>
              
              {/* Upload Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer mb-6 ${
                  isDragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                )}
                <p className="text-gray-600 font-medium mb-1 text-sm">
                  {isUploading ? 'Uploading files...' : 
                   isDragActive ? 'Drop files here' : 'Upload Documents'}
                </p>
                <p className="text-gray-500 text-xs">
                  {isUploading ? 'Please wait...' : 'PDF, Excel, PowerPoint, CSV supported'}
                </p>
              </div>

              {/* Integration Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => handleIntegrationConnect('gmail')}
                  className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 text-red-700 rounded-lg py-4 px-3 font-medium hover:shadow-md hover:from-red-100 hover:to-orange-100 transition-all duration-200 flex flex-col items-center justify-center space-y-2"
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">Gmail</span>
                </button>
                
                <button
                  onClick={() => handleIntegrationConnect('google-drive')}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 rounded-lg py-4 px-3 font-medium hover:shadow-md hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 flex flex-col items-center justify-center space-y-2"
                >
                  <FolderOpen className="w-5 h-5" />
                  <span className="text-sm">Drive</span>
                </button>
                
                <button
                  onClick={() => handleIntegrationConnect('hubspot')}
                  className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-orange-700 rounded-lg py-4 px-3 font-medium hover:shadow-md hover:from-orange-100 hover:to-amber-100 transition-all duration-200 flex flex-col items-center justify-center space-y-2"
                >
                  <Users className="w-5 h-5" />
                  <span className="text-sm">HubSpot</span>
                </button>
                
                <button
                  onClick={() => handleIntegrationConnect('mcp')}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 text-purple-700 rounded-lg py-4 px-3 font-medium hover:shadow-md hover:from-purple-100 hover:to-pink-100 transition-all duration-200 flex flex-col items-center justify-center space-y-2"
                >
                  <Server className="w-5 h-5" />
                  <span className="text-sm">MCP</span>
                </button>
              </div>

              {/* Documents List */}
              <div className="space-y-3">
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No documents uploaded</p>
                    <p className="text-gray-400 text-xs mt-1">Upload files to get started</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(doc.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {doc.status === 'processing' && (
                          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        )}
                        {doc.status === 'ready' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {doc.status === 'error' && (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <button
                          onClick={() => removeDocument(doc.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: AI Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[800px] flex flex-col">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
                    <p className="text-sm text-gray-500">
                      {currentSessionId ? `Session: ${chatSessions.find(s => s.id === currentSessionId)?.title || 'Current Chat'}` : 'Start a new conversation'}
                    </p>
                  </div>
                  <button
                    onClick={createNewChatSession}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Chat</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={chatContainerRef}>
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Hi! I'm your BoardBravo AI assistant. 📊
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Attach documents and start analyzing, or connect your data sources to get started!
                    </p>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white rounded-lg rounded-br-sm' 
                          : 'bg-gray-100 text-gray-900 rounded-lg rounded-bl-sm'
                      } px-4 py-3`}>
                        {message.type === 'user' ? (
                          <p className="text-sm">{message.content}</p>
                        ) : (
                          <div className="space-y-4">
                            {message.content && (
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>
                            )}
                            
                            {message.charts && message.charts.length > 0 && (
                              <div className="space-y-4">
                                {message.charts.map((chart, index) => (
                                  <ChartRenderer key={index} chartData={chart} />
                                ))}
                              </div>
                            )}
                            
                            {message.summary && (
                              <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900">{message.summary.title}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {message.summary.metrics.map((metric, index) => (
                                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-100">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-600">{metric.title}</span>
                                        {metric.change !== undefined && metric.changeType === 'positive' && (
                                          <TrendingUp className="w-4 h-4 text-green-500" />
                                        )}
                                        {metric.change !== undefined && metric.changeType === 'negative' && (
                                          <TrendingDown className="w-4 h-4 text-red-500" />
                                        )}
                                      </div>
                                      <div className="flex items-baseline space-x-2">
                                        <span className="text-xl font-bold text-gray-900">{metric.value}</span>
                                        {metric.change !== undefined && (
                                          <span className={`text-sm font-medium ${
                                            metric.changeType === 'positive' ? 'text-green-600' : 
                                            metric.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                                          }`}>
                                            {metric.change > 0 ? '+' : ''}{metric.change}%
                                          </span>
                                        )}
                                      </div>
                                        {metric.description && (
                                          <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                                        )}
                                    </div>
                                  ))}
                                </div>
                                {message.summary.insights && message.summary.insights.length > 0 && (
                                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <h5 className="font-medium text-blue-900 mb-2">Key Insights</h5>
                                    <ul className="space-y-1">
                                      {message.summary.insights.map((insight, index) => (
                                        <li key={index} className="text-sm text-blue-800">• {insight}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">
                            {isClient ? format(message.timestamp, 'HH:mm') : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Sample Questions */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Start</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {getSampleQuestions().map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleSampleQuestion(question.text)
                        }}
                        disabled={isProcessing || aiProviderStatus?.status === 'not_configured'}
                        className="text-left p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg border border-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-200/50 hover:shadow-xl"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs text-blue-600 uppercase tracking-wide font-medium">{question.source}</span>
                        </div>
                        <p className="text-sm text-blue-900 font-medium">{question.text}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-gray-200">
                <form onSubmit={sendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Ask about your documents..."
                    disabled={isProcessing || aiProviderStatus?.status === 'not_configured'}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={!currentMessage.trim() || isProcessing || aiProviderStatus?.status === 'not_configured'}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{isProcessing ? 'Processing...' : 'Send'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
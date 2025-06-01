'use client'

import React, { useRef, FormEvent, useEffect, useState } from 'react'
import { Plus, Users, User, Bot, Send, Loader2, TrendingUp, TrendingDown, Brain, Sparkles, Bookmark, BookmarkCheck, Maximize2, X } from 'lucide-react'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import ChartRenderer from '@/components/charts/ChartRenderer'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  charts?: any[]
  summary?: any
}

interface AgentAction {
  id: string
  title: string
  description: string
  detailedDescription: string
  prompt: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  hoverColor: string
  borderColor: string
  iconColor: string
  tagColor: string
  tag: string
}

interface ChatInterfaceCardProps {
  chatMessages: ChatMessage[]
  currentMessage: string
  isProcessing: boolean
  processingAction?: string
  boardMembers: any[]
  currentUser: any
  currentSessionId: string | null
  documents: any[]
  integrations: any[]
  isClient: boolean
  onCreateNewSession: () => void
  onSendMessage: (e: FormEvent) => void
  onMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAgentAction: (actionTitle: string, actionDescription: string) => void
  onShowManualAction: () => void
  onSaveMessageAsNote: (messageContent: string, messageType: 'user' | 'assistant') => void
  getAgentActions: () => AgentAction[]
}

const ProcessingAnimation = ({ actionTitle }: { actionTitle?: string }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          
          {/* Inner pulsing brain icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
          
          {/* Sparkles around the animation */}
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-4 h-4 text-yellow-500 animate-bounce" />
          </div>
          <div className="absolute -bottom-2 -left-2">
            <Sparkles className="w-3 h-3 text-purple-500 animate-bounce delay-150" />
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-900">
            {actionTitle ? `Processing ${actionTitle}...` : 'AI Agent Processing...'}
          </p>
          <p className="text-xs text-gray-500">
            Analyzing documents and generating insights
          </p>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-1 mt-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal component for full AI response
const MessageModal = ({ message, isOpen, onClose }: { message: ChatMessage | null, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen || !message) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Enhanced Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Complete AI Analysis</h3>
              <p className="text-sm text-gray-600">{format(message.timestamp, 'MMMM dd, yyyy • HH:mm')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 100px)' }}>
          <div className="p-8 space-y-8">
            {/* Full Text Response with Enhanced Typography */}
            {message.content && (
              <div className="bg-white">
                <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
                  <ReactMarkdown 
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3" {...props} />,
                      p: ({node, ...props}) => <p className="text-gray-700 mb-4 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="space-y-2 mb-4" {...props} />,
                      li: ({node, ...props}) => <li className="flex items-start space-x-2 text-gray-700"><span className="text-blue-600 mt-2">•</span><span {...props} /></li>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            )}
            
            {/* Enhanced Summary Stats Section */}
            {message.summary && (
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📊</span>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900">{message.summary.title}</h4>
                </div>
                
                {/* Enhanced 3x2 Grid of All Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {message.summary.metrics && message.summary.metrics.map((metric: any, idx: number) => {
                    const getIcon = (iconType: string) => {
                      switch(iconType) {
                        case 'revenue': return '💰'
                        case 'users': return '👥'
                        case 'target': return '🎯'
                        case 'calendar': return '📅'
                        case 'warning': return '⚠️'
                        case 'success': return '✅'
                        default: return '📊'
                      }
                    }
                    
                    const getChangeColor = (changeType: string) => {
                      switch(changeType) {
                        case 'positive': return 'text-green-600'
                        case 'negative': return 'text-red-600'
                        default: return 'text-gray-600'
                      }
                    }
                    
                    return (
                      <div key={idx} className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-4xl mb-3">{getIcon(metric.icon)}</div>
                        <div className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">{metric.title}</div>
                        <div className="text-3xl font-bold text-gray-900 mb-3">{metric.value}</div>
                        {metric.change !== undefined && metric.change !== 0 && (
                          <div className={`text-sm font-semibold ${getChangeColor(metric.changeType)} flex items-center justify-center space-x-2`}>
                            {metric.changeType === 'positive' ? (
                              <TrendingUp className="w-5 h-5" />
                            ) : metric.changeType === 'negative' ? (
                              <TrendingDown className="w-5 h-5" />
                            ) : null}
                            <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>
                          </div>
                        )}
                        {metric.description && (
                          <p className="text-xs text-gray-500 mt-3 leading-relaxed">{metric.description}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                {/* Enhanced Insights */}
                {message.summary.insights && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🔍</span>
                      </div>
                      <h5 className="text-lg font-bold text-gray-900">Key Insights</h5>
                    </div>
                    <div className="space-y-3">
                      {message.summary.insights.map((insight: string, idx: number) => (
                        <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">{idx + 1}</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Enhanced Charts Section */}
            {message.charts && message.charts.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📈</span>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900">Data Visualizations</h4>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {message.charts.length} {message.charts.length === 1 ? 'Chart' : 'Charts'}
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {message.charts.map((chart, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                      <div className="mb-4">
                        <h5 className="text-lg font-semibold text-gray-900 mb-2">{chart.title}</h5>
                        {chart.description && (
                          <p className="text-sm text-gray-600">{chart.description}</p>
                        )}
                      </div>
                      <div style={{ height: '350px' }}>
                        <ChartRenderer chartData={chart} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatInterfaceCard({
  chatMessages,
  currentMessage,
  isProcessing,
  processingAction,
  boardMembers,
  currentUser,
  currentSessionId,
  documents,
  integrations,
  isClient,
  onCreateNewSession,
  onSendMessage,
  onMessageChange,
  onAgentAction,
  onShowManualAction,
  onSaveMessageAsNote,
  getAgentActions
}: ChatInterfaceCardProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [savedMessages, setSavedMessages] = useState<Set<string>>(new Set())
  const [modalMessage, setModalMessage] = useState<ChatMessage | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Load saved message IDs from localStorage on mount
  useEffect(() => {
    if (isClient) {
      try {
        const saved = localStorage.getItem('boardbravo-saved-messages')
        if (saved) {
          const savedArray = JSON.parse(saved)
          setSavedMessages(new Set(savedArray))
        }
      } catch (error) {
        console.error('Failed to load saved messages from localStorage:', error)
      }
    }
  }, [isClient])

  // Save to localStorage whenever savedMessages changes
  useEffect(() => {
    if (isClient && savedMessages.size > 0) {
      try {
        localStorage.setItem('boardbravo-saved-messages', JSON.stringify(Array.from(savedMessages)))
      } catch (error) {
        console.error('Failed to save messages to localStorage:', error)
      }
    }
  }, [savedMessages, isClient])

  // Auto-scroll to bottom function
  const scrollToBottom = (behavior: 'smooth' | 'instant' = 'smooth') => {
    if (messagesEndRef.current && chatContainerRef.current) {
      // Only scroll if the chat container is visible and has content
      const container = chatContainerRef.current
      const isVisible = container.offsetHeight > 0
      
      if (isVisible) {
        // Use scrollIntoView with block: "nearest" to prevent page jumping
        messagesEndRef.current.scrollIntoView({ 
          behavior, 
          block: 'nearest',
          inline: 'nearest'
        })
      }
    }
  }

  // Auto-scroll to bottom when messages change, session changes, or component mounts
  useEffect(() => {
    // Add a small delay to ensure content is rendered
    const timer = setTimeout(() => {
      scrollToBottom('smooth')
    }, 50)
    
    return () => clearTimeout(timer)
  }, [chatMessages])

  // Handle session changes with controlled scrolling
  useEffect(() => {
    if (currentSessionId) {
      // Use instant scroll for session switches to avoid jarring movement
      const timer = setTimeout(() => {
        scrollToBottom('instant')
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [currentSessionId])

  // Auto-scroll when processing starts/ends
  useEffect(() => {
    if (isProcessing) {
      const timer = setTimeout(() => {
        scrollToBottom('smooth')
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isProcessing])

  // Initial scroll to bottom when component mounts (for dashboard opening)
  useEffect(() => {
    // Use instant scroll for initial load
    const timer = setTimeout(() => {
      scrollToBottom('instant')
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  // Handle modal functions
  const openModal = (message: ChatMessage) => {
    setModalMessage(message)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalMessage(null)
  }

  // Helper function to determine if content should be truncated
  const shouldTruncateContent = (content: string) => {
    return content.length > 300 // Truncate AI responses longer than 300 characters
  }

  const getTruncatedContent = (content: string) => {
    return content.length > 300 ? content.substring(0, 300) + '...' : content
  }

  // Helper function to detect action type from message content
  const getActionTypeFromContent = (content: string): {type: string, colors: {bg: string, text: string, border: string}} => {
    const agentActions = getAgentActions()
    
    // Check if this is an agent action message
    if (content.includes('🤖 Agent Action:')) {
      // Check for specific custom actions from manual modal
      if (content.includes('Document Summary')) {
        return { type: 'compliance', colors: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' } }
      }
      if (content.includes('Action Items Extraction')) {
        return { type: 'strategy', colors: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' } }
      }
      if (content.includes('Board Readiness Check')) {
        return { type: 'performance', colors: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' } }
      }
      if (content.includes('Stakeholder Communication')) {
        return { type: 'general', colors: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' } }
      }
      if (content.includes('Market Trends Analysis')) {
        return { type: 'financial', colors: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' } }
      }
      if (content.includes('Competitive Benchmarking')) {
        return { type: 'strategy', colors: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' } }
      }
      if (content.includes('Investment Readiness')) {
        return { type: 'financial', colors: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' } }
      }
      if (content.includes('ESG Assessment')) {
        return { type: 'compliance', colors: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' } }
      }
      // Generic custom analysis fallback
      if (content.includes('Custom Analysis')) {
        return { type: 'general', colors: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' } }
      }
      
      for (const action of agentActions) {
        if (content.includes(action.title)) {
          const colorMap: {[key: string]: {bg: string, text: string, border: string}} = {
            'financial': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
            'risk': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
            'compliance': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
            'performance': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
            'strategy': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' }
          }
          return { type: action.id, colors: colorMap[action.id] || colorMap['financial'] }
        }
      }
    }
    
    // Check if this is a response to an agent action (assistant message following agent action)
    const messageIndex = chatMessages.findIndex(m => m.content === content)
    if (messageIndex > 0) {
      const previousMessage = chatMessages[messageIndex - 1]
      if (previousMessage.content.includes('🤖 Agent Action:')) {
        // Check for specific custom action responses
        if (previousMessage.content.includes('Document Summary')) {
          return { type: 'compliance', colors: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' } }
        }
        if (previousMessage.content.includes('Action Items Extraction')) {
          return { type: 'strategy', colors: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' } }
        }
        if (previousMessage.content.includes('Board Readiness Check')) {
          return { type: 'performance', colors: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' } }
        }
        if (previousMessage.content.includes('Stakeholder Communication')) {
          return { type: 'general', colors: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' } }
        }
        if (previousMessage.content.includes('Market Trends Analysis')) {
          return { type: 'financial', colors: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' } }
        }
        if (previousMessage.content.includes('Competitive Benchmarking')) {
          return { type: 'strategy', colors: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' } }
        }
        if (previousMessage.content.includes('Investment Readiness')) {
          return { type: 'financial', colors: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' } }
        }
        if (previousMessage.content.includes('ESG Assessment')) {
          return { type: 'compliance', colors: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' } }
        }
        // Generic custom analysis responses
        if (previousMessage.content.includes('Custom Analysis')) {
          return { type: 'general', colors: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' } }
        }
        
        for (const action of agentActions) {
          if (previousMessage.content.includes(action.title)) {
            const colorMap: {[key: string]: {bg: string, text: string, border: string}} = {
              'financial': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
              'risk': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
              'compliance': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
              'performance': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
              'strategy': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' }
            }
            return { type: action.id, colors: colorMap[action.id] || colorMap['financial'] }
          }
        }
      }
    }
    
    // Default to gray for regular user messages and general content
    return { type: 'general', colors: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' } }
  }

  // Handle saving message as note
  const handleSaveMessageAsNote = async (messageId: string, content: string, type: 'user' | 'assistant') => {
    // Prevent saving if already saved
    if (savedMessages.has(messageId)) {
      return
    }

    try {
      await onSaveMessageAsNote(content, type)
      // Permanently mark this message as saved
      setSavedMessages(prev => new Set(prev).add(messageId))
      
      console.log(`Message ${messageId} saved to notes permanently`)
    } catch (error) {
      console.error('Failed to save message as note:', error)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
      {/* Chat Header - Compact */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Board Discussion</h2>
            <p className="text-xs text-gray-500">
              {boardMembers.length > 0 
                ? `${boardMembers.length} board members • Use @agent to get AI assistance`
                : 'Member communication and collaboration • Use @agent for AI help'
              }
            </p>
          </div>
          <button
            onClick={onCreateNewSession}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>New Discussion</span>
          </button>
        </div>
      </div>

      {/* Messages - Fixed Height Scrollable Container */}
      <div 
        ref={chatContainerRef}
        className="overflow-y-auto px-4 py-3 space-y-3"
        style={{ 
          height: '720px',
          scrollBehavior: 'smooth',
          overscrollBehavior: 'contain'
        }}
      >
        {chatMessages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="text-gray-500">
              <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-2">Welcome to Board Discussion</p>
              <p className="text-xs">Start a conversation or use agent actions below</p>
            </div>
          </div>
        )}

        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'} group`}>
              {message.type === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">BoardBravo AI</span>
                </div>
              )}
              
              <div className="relative">
                <div className={`rounded-lg px-3 py-2 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                } shadow-sm`}>
                  {/* Text Response - Fixed size with expand option for AI messages */}
                  {message.content && (
                    <div className="text-xs whitespace-pre-wrap leading-relaxed">
                      {message.type === 'assistant' && shouldTruncateContent(message.content) ? (
                        <div>
                          <ReactMarkdown>
                            {getTruncatedContent(message.content)}
                          </ReactMarkdown>
                          <button
                            onClick={() => openModal(message)}
                            className="inline-flex items-center space-x-1 mt-2 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-md transition-colors"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>View Full Response</span>
                          </button>
                        </div>
                      ) : (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      )}
                    </div>
                  )}
                  
                  {/* Summary Stats Section - 2x1 Grid (Preview Only) */}
                  {message.summary && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold text-gray-700">📊 {message.summary.title}</h4>
                        <button
                          onClick={() => openModal(message)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View All
                        </button>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-gray-200">
                        {/* 2x1 Grid - Only first 2 metrics as preview */}
                        <div className="grid grid-cols-2 gap-2">
                          {message.summary.metrics && message.summary.metrics.slice(0, 2).map((metric: any, idx: number) => {
                            const getIcon = (iconType: string) => {
                              switch(iconType) {
                                case 'revenue': return '💰'
                                case 'users': return '👥'
                                case 'target': return '🎯'
                                case 'calendar': return '📅'
                                case 'warning': return '⚠️'
                                case 'success': return '✅'
                                default: return '📊'
                              }
                            }
                            
                            const getChangeColor = (changeType: string) => {
                              switch(changeType) {
                                case 'positive': return 'text-green-600'
                                case 'negative': return 'text-red-600'
                                default: return 'text-gray-600'
                              }
                            }
                            
                            return (
                              <div key={idx} className="bg-gray-50 rounded-md p-2 text-center">
                                <div className="text-sm mb-1">{getIcon(metric.icon)}</div>
                                <div className="text-xs font-semibold text-gray-900 mb-1 truncate">{metric.title}</div>
                                <div className="text-sm font-bold text-gray-900">{metric.value}</div>
                                {metric.change !== undefined && metric.change !== 0 && (
                                  <div className={`text-xs ${getChangeColor(metric.changeType)} flex items-center justify-center space-x-1`}>
                                    {metric.changeType === 'positive' ? (
                                      <TrendingUp className="w-2 h-2" />
                                    ) : metric.changeType === 'negative' ? (
                                      <TrendingDown className="w-2 h-2" />
                                    ) : null}
                                    <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        
                        {/* Compact insights preview */}
                        {message.summary.insights && message.summary.insights.length > 0 && (
                          <div className="mt-2 text-xs text-gray-600">
                            <div className="font-medium mb-1">🔍 Key Insight:</div>
                            <p className="truncate">{message.summary.insights[0]}</p>
                            {message.summary.insights.length > 1 && (
                              <p className="text-gray-500 mt-1">+{message.summary.insights.length - 1} more insights...</p>
                            )}
                          </div>
                        )}
                        
                        {/* Charts indicator without preview */}
                        {message.charts && message.charts.length > 0 && (
                          <div className="mt-2 text-xs text-center">
                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              📈 {message.charts.length} {message.charts.length === 1 ? 'Chart' : 'Charts'} Available
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Save to Notes Button - Outside message bubble */}
                <div className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'} mt-2`}>
                  {(() => {
                    const actionInfo = getActionTypeFromContent(message.content)
                    return (
                      <button
                        onClick={() => handleSaveMessageAsNote(message.id, message.content, message.type)}
                        disabled={savedMessages.has(message.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                          savedMessages.has(message.id)
                            ? `${actionInfo.colors.bg} ${actionInfo.colors.text} cursor-default ${actionInfo.colors.border}`
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 border border-gray-200'
                        } shadow-sm`}
                        title={savedMessages.has(message.id) ? "Already saved to notes" : "Save as note"}
                      >
                        {savedMessages.has(message.id) ? (
                          <BookmarkCheck className="w-4 h-4" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                        <span className="text-xs font-medium">
                          {savedMessages.has(message.id) ? "Saved" : "Save to notes"}
                        </span>
                      </button>
                    )
                  })()}
                </div>
              </div>
              
              <div className={`text-xs text-gray-500 mt-1 ${
                message.type === 'user' ? 'text-right' : 'text-left'
              }`}>
                {format(message.timestamp, 'HH:mm')}
                {savedMessages.has(message.id) && (() => {
                  const actionInfo = getActionTypeFromContent(message.content)
                  return (
                    <span className={`ml-2 ${actionInfo.colors.text} font-medium`}>✓ Saved to notes</span>
                  )
                })()}
              </div>
            </div>
          </div>
        ))}
        
        {/* Processing Animation */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-700">BoardBravo AI</span>
              </div>
              
              <div className="bg-gray-100 text-gray-900 rounded-lg shadow-sm">
                <ProcessingAnimation actionTitle={processingAction} />
              </div>
            </div>
          </div>
        )}
        
        {/* Invisible scroll anchor */}
        <div ref={messagesEndRef} className="h-0" />
      </div>

      {/* Agent Actions - Compact */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Agent Actions</h3>
            {documents.filter((doc: any) => doc.status === 'ready').length > 0 && (
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">
                {documents.filter((doc: any) => doc.status === 'ready').length} docs ready
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {/* Dynamic Agent Actions */}
            {getAgentActions().map((action) => (
              <button
                key={action.id}
                onClick={() => onAgentAction(action.title, action.prompt)}
                disabled={isProcessing}
                className={`text-left p-2 ${action.color} ${action.hoverColor} rounded-lg border ${action.borderColor} transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-md`}
                title={action.detailedDescription}
              >
                <div className="flex items-center space-x-1 mb-1">
                  <action.icon className={`w-3 h-3 ${action.iconColor}`} />
                  <span className={`text-xs ${action.tagColor} uppercase tracking-wide font-semibold`}>
                    {action.tag}
                  </span>
                </div>
                <p className="text-xs text-gray-900 font-semibold mb-1">{action.title}</p>
                <p className="text-xs text-gray-600 line-clamp-2 leading-tight">{action.description}</p>
              </button>
            ))}

            {/* Manual Action Card */}
            <button
              onClick={onShowManualAction}
              disabled={isProcessing}
              className="text-left p-2 bg-gradient-to-br from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center space-x-1 mb-1">
                <Plus className="w-3 h-3 text-gray-500 group-hover:text-gray-600" />
                <span className="text-xs text-gray-500 group-hover:text-gray-600 uppercase tracking-wide font-semibold">Custom</span>
              </div>
              <p className="text-xs text-gray-900 font-semibold mb-1">Manual Action</p>
              <p className="text-xs text-gray-600 leading-tight">Custom AI analysis request</p>
            </button>
          </div>
        </div>
      </div>

      {/* Member Chat Input - Compact */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl flex-shrink-0">
        <form onSubmit={onSendMessage} className="flex space-x-2">
          <input
            key="chat-input"
            type="text"
            value={currentMessage}
            onChange={onMessageChange}
            placeholder="Message board members... (type @agent for AI assistance)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!currentMessage.trim() || isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-sm font-medium"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isProcessing ? 'Sending...' : 'Send'}</span>
          </button>
        </form>
      </div>

      {/* Message Modal for Full AI Responses */}
      <MessageModal 
        message={modalMessage}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  )
} 
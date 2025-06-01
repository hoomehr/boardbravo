'use client'

import React, { useRef, FormEvent, useEffect, useState } from 'react'
import { Plus, Users, User, Bot, Send, Loader2, TrendingUp, TrendingDown, Brain, Sparkles, Bookmark, BookmarkCheck } from 'lucide-react'
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

  // Scroll to bottom when client-side hydration completes
  useEffect(() => {
    if (isClient && chatMessages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom('instant')
      }, 150)
      
      return () => clearTimeout(timer)
    }
  }, [isClient])

  // Handle saving message as note
  const handleSaveMessageAsNote = async (messageId: string, content: string, type: 'user' | 'assistant') => {
    try {
      await onSaveMessageAsNote(content, type)
      setSavedMessages(prev => new Set(prev).add(messageId))
      
      // Remove from saved messages after 3 seconds to allow re-saving if needed
      setTimeout(() => {
        setSavedMessages(prev => {
          const newSet = new Set(prev)
          newSet.delete(messageId)
          return newSet
        })
      }, 3000)
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
                  <div className="text-xs whitespace-pre-wrap leading-relaxed">
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  
                  {/* Charts Section */}
                  {message.charts && message.charts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">📊 Generated Charts & Analytics</h4>
                      <div className="space-y-3">
                        {message.charts.map((chart, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                            <ChartRenderer chartData={chart} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Summary Section */}
                  {message.summary && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">📋 Key Insights Summary</h4>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-800 space-y-2">
                          {message.summary.keyMetrics && (
                            <div>
                              <span className="font-semibold text-blue-800">Key Metrics:</span>
                              <ul className="mt-1 ml-3 space-y-1">
                                {message.summary.keyMetrics.map((metric: string, idx: number) => (
                                  <li key={idx} className="text-xs">• {metric}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {message.summary.recommendations && (
                            <div>
                              <span className="font-semibold text-green-800">Recommendations:</span>
                              <ul className="mt-1 ml-3 space-y-1">
                                {message.summary.recommendations.map((rec: string, idx: number) => (
                                  <li key={idx} className="text-xs">• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {message.summary.riskFactors && (
                            <div>
                              <span className="font-semibold text-red-800">Risk Factors:</span>
                              <ul className="mt-1 ml-3 space-y-1">
                                {message.summary.riskFactors.map((risk: string, idx: number) => (
                                  <li key={idx} className="text-xs">• {risk}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Save to Notes Button */}
                <button
                  onClick={() => handleSaveMessageAsNote(message.id, message.content, message.type)}
                  className={`absolute top-1 ${message.type === 'user' ? 'left-1' : 'right-1'} opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full ${
                    message.type === 'user' 
                      ? 'bg-blue-700 hover:bg-blue-800' 
                      : 'bg-white hover:bg-gray-50 border border-gray-200'
                  } shadow-sm`}
                  title="Save as note"
                >
                  {savedMessages.has(message.id) ? (
                    <BookmarkCheck className={`w-3 h-3 ${
                      message.type === 'user' ? 'text-green-300' : 'text-green-600'
                    }`} />
                  ) : (
                    <Bookmark className={`w-3 h-3 ${
                      message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`} />
                  )}
                </button>
              </div>
              
              <div className={`text-xs text-gray-500 mt-1 ${
                message.type === 'user' ? 'text-right' : 'text-left'
              }`}>
                {format(message.timestamp, 'HH:mm')}
                {savedMessages.has(message.id) && (
                  <span className="ml-2 text-green-600 font-medium">✓ Saved to notes</span>
                )}
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
    </div>
  )
} 
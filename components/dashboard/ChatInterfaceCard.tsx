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
  onSaveMessageAsNote: (messageContent: string, messageType: 'user' | 'assistant', charts?: any[], summary?: any) => void
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

// Helper function to generate modal title based on message content
const getModalTitle = (message: ChatMessage) => {
  const content = message.content.toLowerCase()
  
  // Check for agent action types
  if (content.includes('financial analysis') || content.includes('q4 financial')) {
    return 'Financial Performance Analysis'
  }
  if (content.includes('enterprise risk') || content.includes('risk analysis')) {
    return 'Enterprise Risk Assessment'
  }
  if (content.includes('compliance audit') || content.includes('regulatory compliance')) {
    return 'Regulatory Compliance Report'
  }
  if (content.includes('performance dashboard') || content.includes('executive performance')) {
    return 'Executive Performance Dashboard'
  }
  if (content.includes('strategic intelligence') || content.includes('strategic')) {
    return 'Strategic Intelligence Report'
  }
  
  // Check for specific custom actions
  if (content.includes('document summary')) {
    return 'Document Summary & Analysis'
  }
  if (content.includes('action items extraction')) {
    return 'Action Items & Next Steps'
  }
  if (content.includes('board readiness check')) {
    return 'Board Meeting Readiness'
  }
  if (content.includes('stakeholder communication')) {
    return 'Stakeholder Communication Brief'
  }
  if (content.includes('market trends analysis')) {
    return 'Market Trends & Insights'
  }
  if (content.includes('competitive benchmarking')) {
    return 'Competitive Analysis Report'
  }
  if (content.includes('investment readiness')) {
    return 'Investment Readiness Assessment'
  }
  if (content.includes('esg assessment')) {
    return 'ESG & Sustainability Report'
  }
  
  // Check for general content types
  if (content.includes('revenue') || content.includes('financial')) {
    return 'Financial Analysis Report'
  }
  if (content.includes('growth') || content.includes('metrics')) {
    return 'Growth & Performance Metrics'
  }
  if (content.includes('risk')) {
    return 'Risk Analysis & Mitigation'
  }
  if (content.includes('market') || content.includes('competitive')) {
    return 'Market & Competitive Analysis'
  }
  if (content.includes('customer') || content.includes('user')) {
    return 'Customer Analytics Report'
  }
  
  // Default titles
  if (message.charts && message.charts.length > 0) {
    return 'Data Analysis & Visualizations'
  }
  if (message.summary && message.summary.metrics) {
    return 'Executive Summary & Metrics'
  }
  
  return 'AI Analysis Report'
}

// Enhanced Modal Component for Structured AI Response Display
const StructuredContentRenderer = ({ structuredData }: { structuredData: any }) => {
  if (!structuredData) return null

  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      {structuredData.executiveSummary && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl opacity-30"></div>
          <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">📋</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">{structuredData.executiveSummary.title}</h4>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    structuredData.executiveSummary.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                    structuredData.executiveSummary.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    Risk: {structuredData.executiveSummary.riskLevel}
                  </span>
                  {structuredData.executiveSummary.actionRequired && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                      Action Required
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">{structuredData.executiveSummary.overview}</p>
            
            {structuredData.executiveSummary.keyPoints?.length > 0 && (
              <div className="grid gap-3">
                {structuredData.executiveSummary.keyPoints.map((point: string, idx: number) => (
                  <div key={idx} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">{idx + 1}</span>
                    </div>
                    <span className="text-gray-700 flex-1 font-medium">{point}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analysis Sections */}
      {structuredData.analysis && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl opacity-30"></div>
          <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🔍</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900">Detailed Analysis</h4>
            </div>
            
            {structuredData.analysis.introduction && (
              <p className="text-gray-700 mb-8 text-lg leading-relaxed">{structuredData.analysis.introduction}</p>
            )}
            
            {structuredData.analysis.sections?.map((section: any, idx: number) => (
              <div key={idx} className="mb-8 last:mb-0">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                    section.importance === 'high' ? 'bg-red-500' :
                    section.importance === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <h5 className="text-lg font-bold text-gray-900">{section.title}</h5>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    section.importance === 'high' ? 'bg-red-100 text-red-700' :
                    section.importance === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {section.importance}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">{section.content}</p>
                
                {section.insights?.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-purple-500">
                    <h6 className="font-semibold text-gray-900 mb-2">Key Insights:</h6>
                    <div className="space-y-2">
                      {section.insights.map((insight: string, insightIdx: number) => (
                        <div key={insightIdx} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {structuredData.analysis.conclusion && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mt-6">
                <h6 className="font-bold text-gray-900 mb-2 flex items-center space-x-2">
                  <span className="text-lg">💡</span>
                  <span>Conclusion</span>
                </h6>
                <p className="text-gray-700 leading-relaxed">{structuredData.analysis.conclusion}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {structuredData.recommendations?.length > 0 && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl opacity-30"></div>
          <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🎯</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900">Strategic Recommendations</h4>
            </div>
            
            <div className="grid gap-6">
              {structuredData.recommendations.map((rec: any, idx: number) => (
                <div key={idx} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {idx + 1}
                        </div>
                        <h5 className="text-lg font-bold text-gray-900">{rec.title}</h5>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {rec.priority} priority
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {rec.timeframe.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">{rec.description}</p>
                    
                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                      <h6 className="font-semibold text-gray-900 mb-2">Expected Outcome:</h6>
                      <p className="text-gray-700 text-sm">{rec.expectedOutcome}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      {structuredData.riskAssessment && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl opacity-30"></div>
          <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">⚠️</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900">Risk Assessment</h4>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-black mb-1 ${
                  structuredData.riskAssessment.overallScore >= 7 ? 'text-red-600' :
                  structuredData.riskAssessment.overallScore >= 4 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {structuredData.riskAssessment.overallScore}/10
                </div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Overall Risk</div>
              </div>
            </div>
            
            {structuredData.riskAssessment.risks?.length > 0 && (
              <div className="grid gap-4">
                {structuredData.riskAssessment.risks.map((risk: any, idx: number) => (
                  <div key={idx} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
                    <div className="relative p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            risk.severity === 'critical' ? 'bg-red-600' :
                            risk.severity === 'high' ? 'bg-orange-500' :
                            risk.severity === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}>
                            {idx + 1}
                          </div>
                          <h6 className="font-bold text-gray-900">{risk.title}</h6>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          risk.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          risk.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {risk.severity}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-3">{risk.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">{risk.probability}/10</div>
                          <div className="text-xs text-gray-500">Probability</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">{risk.impact}/10</div>
                          <div className="text-xs text-gray-500">Impact</div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
                        <h6 className="font-semibold text-gray-900 mb-1 text-xs">Mitigation Strategy:</h6>
                        <p className="text-gray-700 text-sm">{risk.mitigation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Modal component for full AI response
const MessageModal = ({ message, isOpen, onClose }: { message: ChatMessage | null, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen || !message) return null

  // Clean content to remove chart data references
  const cleanContent = (content: string) => {
    // Remove chart-related content that might be embedded in text
    let cleaned = content
      .replace(/\*\*Charts?.*?\*\*/gi, '')
      .replace(/Chart \d+:.*?\n/gi, '')
      .replace(/\[Chart:.*?\]/gi, '')
      .replace(/📊.*?chart.*?\n/gi, '')
      .replace(/📈.*?chart.*?\n/gi, '')
      .replace(/\*\*Data Visualization.*?\*\*/gi, '')
      .replace(/\*\*Visual Analysis.*?\*\*/gi, '')
    
    return cleaned.trim()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-100">
        {/* Enhanced Modal Header with Gradient */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-10"></div>
          <div className="relative flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {getModalTitle(message)}
                </h3>
                <p className="text-sm text-gray-600 mt-1 flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <span>{format(message.timestamp, 'MMMM dd, yyyy • HH:mm')}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="group relative p-2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:bg-white rounded-xl hover:shadow-lg"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          <div className="p-8 pb-6 space-y-8">
            {/* Try to render structured data first, fallback to legacy format */}
            {message.summary && typeof message.summary === 'object' && (message.summary.executiveSummary || message.summary.analysis) ? (
              <StructuredContentRenderer structuredData={message.summary} />
            ) : (
              <>
                {/* Enhanced Text Response with Creative Typography */}
                {message.content && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl opacity-30"></div>
                    <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                          <span className="text-white text-lg">📝</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Analysis Report</h4>
                      </div>
                      
                      <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
                        <ReactMarkdown 
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-gray-200" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4 flex items-center space-x-2" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3" {...props} />,
                            p: ({node, ...props}) => <p className="text-gray-700 mb-4 leading-relaxed text-base" {...props} />,
                            ul: ({node, ...props}) => <div className="space-y-3 mb-6">{props.children}</div>,
                            li: ({node, ...props}) => (
                              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl border-l-4 border-blue-500">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700 flex-1">{props.children}</span>
                              </div>
                            ),
                            strong: ({node, ...props}) => <span className="font-bold text-gray-900 bg-yellow-100 px-1 rounded" {...props} />,
                          }}
                        >
                          {cleanContent(message.content)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Enhanced Summary Stats Section with Creative Cards */}
                {message.summary && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl opacity-5"></div>
                    <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-xl">📊</span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Executive Metrics Dashboard
                          </h4>
                          <p className="text-gray-600 mt-1">Key performance indicators and insights</p>
                        </div>
                      </div>
                      
                      {/* Creative 3x2 Grid with Floating Cards */}
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
                          
                          const getCardColor = (index: number) => {
                            const colors = [
                              'from-blue-500 to-cyan-500',
                              'from-purple-500 to-pink-500', 
                              'from-green-500 to-emerald-500',
                              'from-orange-500 to-red-500',
                              'from-indigo-500 to-purple-500',
                              'from-teal-500 to-blue-500'
                            ]
                            return colors[index % colors.length]
                          }
                          
                          return (
                            <div key={idx} className="group relative">
                              <div className="absolute inset-0 bg-gradient-to-br opacity-10 rounded-2xl blur-xl group-hover:opacity-20 transition-opacity"></div>
                              <div className="relative bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="relative mb-4">
                                  <div className={`w-16 h-16 bg-gradient-to-br ${getCardColor(idx)} rounded-2xl flex items-center justify-center shadow-lg mx-auto text-2xl transform group-hover:scale-110 transition-transform duration-300`}>
                                    {getIcon(metric.icon)}
                                  </div>
                                </div>
                                <div className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">{metric.title}</div>
                                <div className="text-3xl font-black text-gray-900 mb-3">{metric.value}</div>
                                {metric.change !== undefined && metric.change !== 0 && (
                                  <div className={`text-sm font-bold ${getChangeColor(metric.changeType)} flex items-center justify-center space-x-2 bg-gray-50 rounded-full px-3 py-1`}>
                                    {metric.changeType === 'positive' ? (
                                      <TrendingUp className="w-4 h-4" />
                                    ) : metric.changeType === 'negative' ? (
                                      <TrendingDown className="w-4 h-4" />
                                    ) : null}
                                    <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>
                                  </div>
                                )}
                                {metric.description && (
                                  <p className="text-xs text-gray-500 mt-3 leading-relaxed bg-gray-50 rounded-lg p-2">{metric.description}</p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Enhanced Insights with Creative Design */}
                      {message.summary.insights && (
                        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <span className="text-lg">🔍</span>
                            </div>
                            <h5 className="text-xl font-bold text-gray-900">Strategic Insights</h5>
                          </div>
                          <div className="grid gap-4">
                            {message.summary.insights.map((insight: string, idx: number) => (
                              <div key={idx} className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
                                <div className="relative flex items-start space-x-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                    <span className="text-white text-sm font-bold">{idx + 1}</span>
                                  </div>
                                  <p className="text-gray-700 leading-relaxed flex-1 font-medium">{insight}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Enhanced Charts Section with Better Containment */}
                {message.charts && message.charts.length > 0 && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl opacity-5"></div>
                    <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-xl">📈</span>
                          </div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {message.charts.length}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            Data Visualizations
                          </h4>
                          <p className="text-gray-600 mt-1">Interactive charts and analytics</p>
                        </div>
                      </div>
                      
                      {/* Enhanced Chart Grid with Better Containment */}
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {message.charts.map((chart, index) => (
                          <div key={index} className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-blue-100 rounded-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                            <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                              {/* Chart Container with Proper Containment - No Header to Avoid Double Titles */}
                              <div className="p-6 bg-white">
                                <div 
                                  className="w-full rounded-xl overflow-hidden" 
                                  style={{ 
                                    height: '400px',
                                    minHeight: '400px',
                                    maxHeight: '400px'
                                  }}
                                >
                                  <ChartRenderer chartData={chart} />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
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
  const handleSaveMessageAsNote = async (messageId: string, content: string, type: 'user' | 'assistant', message: ChatMessage) => {
    // Prevent saving if already saved
    if (savedMessages.has(messageId)) {
      // If already saved, open the modal to view the content
      openModal(message)
      return
    }

    try {
      // Pass complete message data including charts and summary
      await onSaveMessageAsNote(content, type, message.charts, message.summary)
      // Permanently mark this message as saved
      setSavedMessages(prev => new Set(prev).add(messageId))
      
      // Open the modal to show the saved content
      openModal(message)
      
      console.log(`Message ${messageId} saved to notes with charts and summary data`)
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
                        onClick={(e) => handleSaveMessageAsNote(message.id, message.content, message.type, message)}
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
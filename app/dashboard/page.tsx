'use client'

import { useState, useCallback, useEffect } from 'react'
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
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: Date
  status: 'processing' | 'ready' | 'error'
  extractedText?: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIProviderStatus {
  currentProvider: string
  availableProviders: string[]
  status: 'configured' | 'not_configured'
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your BoardBravo AI assistant powered by Google Gemini. Upload some documents and I'll help you analyze them. You can ask me to summarize board decks, extract key risks, identify trends, or prepare investment pitch summaries.",
      timestamp: new Date()
    }
  ])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [aiProviderStatus, setAIProviderStatus] = useState<AIProviderStatus | null>(null)
  const [showProviderStatus, setShowProviderStatus] = useState(false)

  // Check AI provider status on component mount
  useEffect(() => {
    checkAIProviderStatus()
  }, [])

  const checkAIProviderStatus = async () => {
    try {
      const response = await fetch('/api/chat')
      const data = await response.json()
      setAIProviderStatus(data)
    } catch (error) {
      console.error('Failed to check AI provider status:', error)
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
          timestamp: new Date()
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
          {/* Left Panel - Documents and Upload */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
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

            {/* Google Drive Integration */}
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg py-3 px-4 font-medium hover:shadow-lg transition-all duration-200 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <Folder className="w-5 h-5" />
                <span>Connect Google Drive</span>
              </div>
            </button>

            {/* Documents List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3">
              {documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No documents uploaded yet</p>
                  <p className="text-sm">Upload files to get started</p>
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

          {/* Right Panel - AI Chat */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
                  <p className="text-sm text-gray-600">
                    Powered by {aiProviderStatus?.currentProvider ? getProviderDisplayName(aiProviderStatus.currentProvider) : 'AI'} • Ask me anything about your documents
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${
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
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
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
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 p-6">
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
                      placeholder="Ask me to summarize documents, find risks, analyze trends..."
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
              <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                <span>💡 Try: "Summarize the latest board deck"</span>
                <span>•</span>
                <span>"What are the top risks?"</span>
                {aiProviderStatus?.status === 'not_configured' && (
                  <>
                    <span>•</span>
                    <span className="text-orange-500">⚠️ Configure AI provider to chat</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
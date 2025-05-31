'use client'

import { useState } from 'react'
import { MessageSquare, Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  charts?: any[]
  summary?: any
}

interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

interface ChatHistoryCardProps {
  chatSessions: ChatSession[]
  currentSessionId: string | null
  currentBoard: any
  chatMessages: ChatMessage[]
  isClient: boolean
  isAdmin: boolean
  onSwitchToSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onUpdateSessionTitle: (sessionId: string, newTitle: string) => void
}

export default function ChatHistoryCard({
  chatSessions,
  currentSessionId,
  currentBoard,
  chatMessages,
  isClient,
  isAdmin,
  onSwitchToSession,
  onDeleteSession,
  onUpdateSessionTitle
}: ChatHistoryCardProps) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const startEditing = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId)
    setEditingTitle(currentTitle)
  }

  const saveTitle = () => {
    if (editingSessionId && editingTitle.trim()) {
      onUpdateSessionTitle(editingSessionId, editingTitle.trim())
    }
    setEditingSessionId(null)
    setEditingTitle('')
  }

  const cancelEditing = () => {
    setEditingSessionId(null)
    setEditingTitle('')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Chat History</h2>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {chatSessions.length} sessions
          </span>
          <MessageSquare className="w-4 h-4 text-blue-600" />
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {chatSessions.map((session) => (
          <div
            key={session.id}
            className={`p-2 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
              currentSessionId === session.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
            }`}
            onClick={() => !editingSessionId && onSwitchToSession(session.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {editingSessionId === session.id ? (
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveTitle()
                        if (e.key === 'Escape') cancelEditing()
                      }}
                      autoFocus
                    />
                    <button
                      onClick={saveTitle}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <h3 className="text-xs font-medium text-gray-900 truncate">{session.title}</h3>
                )}
              </div>
              
              {!editingSessionId && (
                <div className="flex items-center space-x-1 ml-2">
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditing(session.id, session.title)
                      }}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Edit title"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSession(session.id)
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
              <span>{session.messages.length} messages</span>
              <span>{formatDistanceToNow(session.updatedAt, { addSuffix: true })}</span>
            </div>
          </div>
        ))}
      </div>

      {chatSessions.length === 0 && (
        <div className="text-center py-6">
          <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-xs">No chat sessions yet</p>
          <p className="text-gray-400 text-xs mt-1">Start a conversation to create your first session</p>
        </div>
      )}

      {isClient && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Debug: Current session ID: {currentSessionId || 'none'} | 
            Total sessions: {chatSessions.length} | 
            Current messages: {chatMessages.length}
          </div>
        </div>
      )}
    </div>
  )
} 
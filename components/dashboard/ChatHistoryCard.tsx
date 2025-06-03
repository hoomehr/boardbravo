'use client'

import { useState } from 'react'
import { MessageSquare, Calendar, MoreVertical, Trash2, Edit3, Plus, Clock, Loader2 } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import type { ChatSession, BoardWorkspace, ChatMessage } from '@/types/dashboard'

interface ChatHistoryCardProps {
  chatSessions: ChatSession[]
  currentSessionId: string | null
  currentBoard: BoardWorkspace | null
  chatMessages: ChatMessage[]
  isClient: boolean
  isAdmin: boolean
  isLoading?: boolean
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
  isLoading = false,
  onSwitchToSession,
  onDeleteSession,
  onUpdateSessionTitle
}: ChatHistoryCardProps) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [showMoreOptions, setShowMoreOptions] = useState<string | null>(null)

  const handleEditStart = (session: ChatSession) => {
    setEditingSessionId(session.id)
    setEditTitle(session.title)
    setShowMoreOptions(null)
  }

  const handleEditSave = () => {
    if (editingSessionId && editTitle.trim()) {
      onUpdateSessionTitle(editingSessionId, editTitle.trim())
    }
    setEditingSessionId(null)
    setEditTitle('')
  }

  const handleEditCancel = () => {
    setEditingSessionId(null)
    setEditTitle('')
  }

  const handleDeleteSession = (sessionId: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this conversation?')
    if (confirmDelete) {
      onDeleteSession(sessionId)
    }
    setShowMoreOptions(null)
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  )

  // Loading state for individual session
  const SessionLoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="w-4 h-4 bg-gray-300 rounded"></div>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-900">Chat History</h2>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
              <span className="text-xs text-blue-600">Loading...</span>
            </div>
          ) : (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {chatSessions.length} sessions
            </span>
          )}
        </div>
        {!isLoading && (
          <button
            onClick={() => {/* This will be handled by parent */}}
            className="text-blue-600 hover:text-blue-700 transition-colors p-1"
            title="New conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Chat Sessions List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {chatSessions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-gray-500 text-sm font-medium">No conversations yet</p>
                <p className="text-gray-400 text-xs mt-1">Start a new chat to begin</p>
              </div>
            ) : (
              chatSessions.map((session) => (
                <div key={session.id} className="relative group">
                  <div
                    onClick={() => onSwitchToSession(session.id)}
                    className={`relative p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                      currentSessionId === session.id
                        ? 'border-blue-200 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          currentSessionId === session.id ? 'bg-blue-100' : 'bg-white'
                        }`}>
                          <MessageSquare className={`w-4 h-4 ${
                            currentSessionId === session.id ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          {editingSessionId === session.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleEditSave()
                                  if (e.key === 'Escape') handleEditCancel()
                                }}
                                className="w-full text-xs font-medium bg-white border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                autoFocus
                              />
                              <div className="flex space-x-1">
                                <button
                                  onClick={handleEditSave}
                                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleEditCancel}
                                  className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="text-xs font-medium text-gray-900 truncate">
                                {session.title}
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {isClient ? formatDistanceToNow(session.updatedAt, { addSuffix: true }) : 'Recently'}
                                </span>
                                {session.messages && session.messages.length > 0 && (
                                  <span className="text-xs bg-white bg-opacity-60 text-gray-600 px-1 rounded">
                                    {session.messages.length} messages
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Options Menu */}
                      {editingSessionId !== session.id && isAdmin && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowMoreOptions(showMoreOptions === session.id ? null : session.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white hover:shadow-sm rounded"
                          >
                            <MoreVertical className="w-3 h-3 text-gray-500" />
                          </button>

                          {showMoreOptions === session.id && (
                            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditStart(session)
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Rename</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteSession(session.id)
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Active Session Indicator */}
                    {currentSessionId === session.id && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Stats */}
          {chatSessions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {chatSessions.length} conversation{chatSessions.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    Last: {isClient && chatSessions[0] ? formatDistanceToNow(chatSessions[0].updatedAt, { addSuffix: true }) : 'Recently'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
} 
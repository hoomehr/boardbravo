'use client'

import { useState } from 'react'
import { StickyNote, Plus, Trash2, Star, Edit2, Save, X, BarChart3, AlertCircle, CheckCircle, TrendingUp, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import ChartRenderer from '@/components/charts/ChartRenderer'
import { SavedNote } from '@/types/dashboard'

interface NoteBoardCardProps {
  savedNotes: SavedNote[]
  isAdmin: boolean
  onSaveNote: (note: Omit<SavedNote, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateNote: (noteId: string, updates: Partial<SavedNote>) => void
  onDeleteNote: (noteId: string) => void
  onTogglePin: (noteId: string) => void
}

export default function NoteBoardCard({
  savedNotes,
  isAdmin,
  onSaveNote,
  onUpdateNote,
  onDeleteNote,
  onTogglePin
}: NoteBoardCardProps) {
  const [showAddNote, setShowAddNote] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general' as const,
    isPinned: false,
    tags: [] as string[]
  })
  const [editingNote, setEditingNote] = useState<Partial<SavedNote>>({})

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return <BarChart3 className="w-4 h-4 text-green-600" />
      case 'risk':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'compliance':
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      case 'performance':
        return <TrendingUp className="w-4 h-4 text-purple-600" />
      case 'strategy':
        return <Zap className="w-4 h-4 text-orange-600" />
      default:
        return <StickyNote className="w-4 h-4 text-gray-600" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial':
        return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
      case 'risk':
        return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
      case 'compliance':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      case 'performance':
        return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
      case 'strategy':
        return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
    }
  }

  const handleSaveNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      onSaveNote({
        title: newNote.title.trim(),
        content: newNote.content.trim(),
        category: newNote.category,
        isPinned: newNote.isPinned,
        tags: newNote.tags
      })
      setNewNote({
        title: '',
        content: '',
        category: 'general',
        isPinned: false,
        tags: []
      })
      setShowAddNote(false)
    }
  }

  const handleUpdateNote = () => {
    if (editingNoteId && editingNote.title?.trim() && editingNote.content?.trim()) {
      onUpdateNote(editingNoteId, {
        title: editingNote.title.trim(),
        content: editingNote.content.trim(),
        category: editingNote.category,
        tags: editingNote.tags
      })
      setEditingNoteId(null)
      setEditingNote({})
    }
  }

  const startEditing = (note: SavedNote) => {
    setEditingNoteId(note.id)
    setEditingNote({
      title: note.title,
      content: note.content,
      category: note.category,
      tags: note.tags
    })
  }

  const cancelEditing = () => {
    setEditingNoteId(null)
    setEditingNote({})
  }

  const openNoteModal = (noteId: string) => {
    setSelectedNoteId(noteId)
  }

  const closeNoteModal = () => {
    setSelectedNoteId(null)
    setEditingNoteId(null)
    setEditingNote({})
  }

  // Sort notes: pinned first, then by date
  const sortedNotes = [...savedNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  const selectedNote = selectedNoteId ? savedNotes.find(note => note.id === selectedNoteId) : null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Note Board</h2>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {savedNotes.length} notes
          </span>
          <button
            onClick={() => setShowAddNote(!showAddNote)}
            className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
            title="Add note"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Note Form */}
      {showAddNote && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-xs font-medium text-blue-900 mb-2">Add New Note</h3>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Note title"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              placeholder="Note content"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows={3}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <select
              value={newNote.category}
              onChange={(e) => setNewNote({ ...newNote, category: e.target.value as any })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">General</option>
              <option value="financial">Financial</option>
              <option value="risk">Risk</option>
              <option value="compliance">Compliance</option>
              <option value="performance">Performance</option>
              <option value="strategy">Strategy</option>
            </select>
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={handleSaveNote}
                disabled={!newNote.title.trim() || !newNote.content.trim()}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Note
              </button>
              <button
                onClick={() => setShowAddNote(false)}
                className="px-3 py-1 text-gray-600 hover:text-gray-800 text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid - Compact Cards */}
      <div className="grid grid-cols-1 gap-1.5 max-h-80 overflow-y-auto">
        {sortedNotes.map((note) => (
          <div
            key={note.id}
            onClick={() => openNoteModal(note.id)}
            className={`p-2 rounded-lg border cursor-pointer transition-all duration-200 ${getCategoryColor(note.category)} ${
              note.isPinned ? 'ring-1 ring-yellow-300' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                {getCategoryIcon(note.category)}
                <h3 className="text-xs font-medium truncate">{note.title}</h3>
                {note.isPinned && <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />}
              </div>
              <div className="text-xs text-gray-500 ml-2 flex-shrink-0">
                {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
              </div>
            </div>
            {note.source && (
              <div className="mt-1 text-xs text-gray-500 truncate">
                From: {note.source}
              </div>
            )}
          </div>
        ))}
      </div>

      {savedNotes.length === 0 && (
        <div className="text-center py-6">
          <StickyNote className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-xs">No notes yet</p>
          <p className="text-gray-400 text-xs mt-1">Save agent results or create custom notes</p>
        </div>
      )}

      {/* Enhanced Note Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[95vh] shadow-2xl border border-gray-100 flex flex-col">
            {/* Enhanced Modal Header with Gradient */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-10"></div>
              <div className="relative flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300 ${
                      selectedNote.category === 'financial' ? 'bg-gradient-to-br from-green-600 to-emerald-600' :
                      selectedNote.category === 'risk' ? 'bg-gradient-to-br from-red-600 to-rose-600' :
                      selectedNote.category === 'compliance' ? 'bg-gradient-to-br from-blue-600 to-indigo-600' :
                      selectedNote.category === 'performance' ? 'bg-gradient-to-br from-purple-600 to-violet-600' :
                      selectedNote.category === 'strategy' ? 'bg-gradient-to-br from-orange-600 to-amber-600' :
                      'bg-gradient-to-br from-gray-600 to-slate-600'
                    }`}>
                      <div className="text-white text-xl">
                        {selectedNote.category === 'financial' ? '💰' :
                         selectedNote.category === 'risk' ? '⚠️' :
                         selectedNote.category === 'compliance' ? '✅' :
                         selectedNote.category === 'performance' ? '📈' :
                         selectedNote.category === 'strategy' ? '⚡' :
                         '📝'}
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {editingNoteId === selectedNote.id ? 'Edit Note' : selectedNote.title}
                      </h3>
                      {selectedNote.isPinned && (
                        <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Pinned</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      <span>{selectedNote.source ? `From: ${selectedNote.source}` : `${selectedNote.category.charAt(0).toUpperCase() + selectedNote.category.slice(1)} • ${formatDistanceToNow(selectedNote.updatedAt, { addSuffix: true })}`}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeNoteModal}
                  className="group relative p-2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:bg-white rounded-xl hover:shadow-lg"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
            </div>
            
            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 pb-6 space-y-8">
                {editingNoteId === selectedNote.id ? (
                  /* Edit Mode */
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Note Title</label>
                      <input
                        type="text"
                        value={editingNote.title || ''}
                        onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
                        placeholder="Enter note title..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                      <textarea
                        value={editingNote.content || ''}
                        onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 leading-relaxed"
                        placeholder="Enter note content..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <select
                        value={editingNote.category || 'general'}
                        onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value as any })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="general">📝 General</option>
                        <option value="financial">💰 Financial</option>
                        <option value="risk">⚠️ Risk</option>
                        <option value="compliance">✅ Compliance</option>
                        <option value="performance">📈 Performance</option>
                        <option value="strategy">⚡ Strategy</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="space-y-8">
                    {/* Enhanced Content Display */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl opacity-30"></div>
                      <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                            <span className="text-white text-lg">📝</span>
                          </div>
                          <h4 className="text-xl font-bold text-gray-900">Note Content</h4>
                        </div>
                        
                        <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
                          <ReactMarkdown 
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-gray-200" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4" {...props} />,
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
                            {selectedNote.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Summary Stats Section (from saved AI response) */}
                    {selectedNote.summary && (
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
                                Analysis Summary
                              </h4>
                              <p className="text-gray-600 mt-1">Key performance indicators and insights</p>
                            </div>
                          </div>
                          
                          {/* Enhanced 3x2 Grid of All Metrics */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {selectedNote.summary.metrics && selectedNote.summary.metrics.map((metric: any, idx: number) => {
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
                                          <TrendingUp className="w-4 h-4 rotate-180" />
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
                          
                          {/* Enhanced Insights */}
                          {selectedNote.summary.insights && (
                            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                              <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                  <span className="text-lg">🔍</span>
                                </div>
                                <h5 className="text-xl font-bold text-gray-900">Key Insights</h5>
                              </div>
                              <div className="grid gap-4">
                                {selectedNote.summary.insights.map((insight: string, idx: number) => (
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
                    
                    {/* Enhanced Charts Section (from saved AI response) */}
                    {selectedNote.charts && selectedNote.charts.length > 0 && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl opacity-5"></div>
                        <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                          <div className="flex items-center space-x-4 mb-8">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-xl">📈</span>
                              </div>
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {selectedNote.charts.length}
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
                            {selectedNote.charts.map((chart, index) => (
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
                    
                    {/* Enhanced Metadata Section */}
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                          <span className="text-lg">ℹ️</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">Note Details</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Category Card */}
                        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
                          <div className="text-2xl mb-2">
                            {selectedNote.category === 'financial' ? '💰' :
                             selectedNote.category === 'risk' ? '⚠️' :
                             selectedNote.category === 'compliance' ? '✅' :
                             selectedNote.category === 'performance' ? '📈' :
                             selectedNote.category === 'strategy' ? '⚡' :
                             '📝'}
                          </div>
                          <div className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Category</div>
                          <div className="text-lg font-bold text-gray-900 capitalize">{selectedNote.category}</div>
                        </div>
                        
                        {/* Created Date Card */}
                        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
                          <div className="text-2xl mb-2">📅</div>
                          <div className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Created</div>
                          <div className="text-lg font-bold text-gray-900">{formatDistanceToNow(selectedNote.createdAt, { addSuffix: true })}</div>
                        </div>
                        
                        {/* Updated Date Card (if different from created) */}
                        {selectedNote.updatedAt.getTime() !== selectedNote.createdAt.getTime() && (
                          <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
                            <div className="text-2xl mb-2">🔄</div>
                            <div className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Updated</div>
                            <div className="text-lg font-bold text-gray-900">{formatDistanceToNow(selectedNote.updatedAt, { addSuffix: true })}</div>
                          </div>
                        )}
                        
                        {/* Status Card */}
                        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
                          <div className="text-2xl mb-2">{selectedNote.isPinned ? '⭐' : '📌'}</div>
                          <div className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Status</div>
                          <div className="text-lg font-bold text-gray-900">{selectedNote.isPinned ? 'Pinned' : 'Standard'}</div>
                        </div>
                        
                        {/* Source Card (if available) */}
                        {selectedNote.source && (
                          <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm md:col-span-2">
                            <div className="text-2xl mb-2">🤖</div>
                            <div className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Source</div>
                            <div className="text-lg font-bold text-gray-900">{selectedNote.source}</div>
                          </div>
                        )}
                        
                        {/* Charts indicator card */}
                        {selectedNote.charts && selectedNote.charts.length > 0 && (
                          <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
                            <div className="text-2xl mb-2">📊</div>
                            <div className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Charts</div>
                            <div className="text-lg font-bold text-gray-900">{selectedNote.charts.length}</div>
                          </div>
                        )}
                        
                        {/* Summary indicator card */}
                        {selectedNote.summary && selectedNote.summary.metrics && (
                          <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
                            <div className="text-2xl mb-2">📈</div>
                            <div className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Metrics</div>
                            <div className="text-lg font-bold text-gray-900">{selectedNote.summary.metrics.length}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Enhanced Footer */}
            <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onTogglePin(selectedNote.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                    selectedNote.isPinned 
                      ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300' 
                      : 'text-gray-600 bg-white hover:bg-yellow-50 border border-gray-300 hover:border-yellow-300'
                  }`}
                  title={selectedNote.isPinned ? 'Unpin note' : 'Pin note'}
                >
                  <Star className={`w-4 h-4 ${selectedNote.isPinned ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{selectedNote.isPinned ? 'Unpin' : 'Pin'}</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                {editingNoteId === selectedNote.id ? (
                  <>
                    <button
                      onClick={handleUpdateNote}
                      disabled={!editingNote.title?.trim() || !editingNote.content?.trim()}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      <span className="font-medium">Save Changes</span>
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-white rounded-xl transition-colors"
                    >
                      <span className="font-medium">Cancel</span>
                    </button>
                  </>
                ) : (
                  <>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => startEditing(selectedNote)}
                          className="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
                          title="Edit note"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            onDeleteNote(selectedNote.id)
                            closeNoteModal()
                          }}
                          className="flex items-center space-x-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-200"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Delete</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={closeNoteModal}
                      className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors shadow-lg"
                    >
                      <span className="font-medium">Close</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
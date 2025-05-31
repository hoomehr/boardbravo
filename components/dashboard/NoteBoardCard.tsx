'use client'

import { useState } from 'react'
import { StickyNote, Plus, Trash2, Star, Edit2, Save, X, BarChart3, AlertCircle, CheckCircle, TrendingUp, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SavedNote {
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

      {/* Note Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                {getCategoryIcon(selectedNote.category)}
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingNoteId === selectedNote.id ? 'Edit Note' : selectedNote.title}
                </h2>
                {selectedNote.isPinned && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
              </div>
              <button
                onClick={closeNoteModal}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[70vh]">
              {editingNoteId === selectedNote.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editingNote.title || ''}
                    onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Note title"
                  />
                  <textarea
                    value={editingNote.content || ''}
                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Note content"
                  />
                  <select
                    value={editingNote.category || 'general'}
                    onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="financial">Financial</option>
                    <option value="risk">Risk</option>
                    <option value="compliance">Compliance</option>
                    <option value="performance">Performance</option>
                    <option value="strategy">Strategy</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                      {selectedNote.content}
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        {selectedNote.source && (
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            From: {selectedNote.source}
                          </span>
                        )}
                        <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                          {selectedNote.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div>Created {formatDistanceToNow(selectedNote.createdAt, { addSuffix: true })}</div>
                        {selectedNote.updatedAt.getTime() !== selectedNote.createdAt.getTime() && (
                          <div>Updated {formatDistanceToNow(selectedNote.updatedAt, { addSuffix: true })}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onTogglePin(selectedNote.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    selectedNote.isPinned ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                  }`}
                  title={selectedNote.isPinned ? 'Unpin note' : 'Pin note'}
                >
                  <Star className={`w-4 h-4 ${selectedNote.isPinned ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                {editingNoteId === selectedNote.id ? (
                  <>
                    <button
                      onClick={handleUpdateNote}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => startEditing(selectedNote)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit note"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            onDeleteNote(selectedNote.id)
                            closeNoteModal()
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={closeNoteModal}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      Close
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
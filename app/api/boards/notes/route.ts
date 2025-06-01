import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

interface SavedNote {
  id: string
  title: string
  content: string
  category: 'financial' | 'risk' | 'compliance' | 'performance' | 'strategy' | 'general'
  source?: string
  createdAt: string
  updatedAt: string
  isPinned: boolean
  tags: string[]
  charts?: any[] // Store chart data from AI responses
  summary?: any // Store summary metrics from AI responses
}

interface NotesData {
  notes: SavedNote[]
  metadata: {
    version: string
    lastUpdated: string
    totalNotes: number
    categories: Record<string, number>
  }
  history: {
    timestamp: string
    action: 'create' | 'update' | 'delete' | 'pin' | 'unpin'
    noteId: string
    noteTitle: string
    details?: string
  }[]
}

export async function POST(request: NextRequest) {
  try {
    const { boardId, notes } = await request.json()

    if (!boardId) {
      return NextResponse.json({ error: 'Board ID is required' }, { status: 400 })
    }

    // Create board-specific storage directory
    const storageDir = path.join(process.cwd(), 'storage')
    const boardDir = path.join(storageDir, 'boards', boardId)
    
    try {
      await mkdir(boardDir, { recursive: true })
    } catch (error) {
      console.error('Error creating board directory:', error)
    }

    // Load existing notes data to preserve history
    const notesPath = path.join(boardDir, 'notes.json')
    let existingData: NotesData = {
      notes: [],
      metadata: {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        totalNotes: 0,
        categories: {}
      },
      history: []
    }

    if (existsSync(notesPath)) {
      try {
        const existingRaw = await readFile(notesPath, 'utf8')
        existingData = JSON.parse(existingRaw)
      } catch (error) {
        console.error('Error reading existing notes:', error)
      }
    }

    // Calculate category counts
    const categories: Record<string, number> = {}
    notes.forEach((note: SavedNote) => {
      categories[note.category] = (categories[note.category] || 0) + 1
    })

    // Detect changes for history tracking
    const newHistory = [...(existingData.history || [])]
    const existingNotes = existingData.notes || []
    
    // Track new notes
    notes.forEach((note: SavedNote) => {
      const existing = existingNotes.find(n => n.id === note.id)
      if (!existing) {
        newHistory.push({
          timestamp: new Date().toISOString(),
          action: 'create',
          noteId: note.id,
          noteTitle: note.title,
          details: `Created in ${note.category} category`
        })
      } else if (existing.updatedAt !== note.updatedAt) {
        newHistory.push({
          timestamp: new Date().toISOString(),
          action: 'update',
          noteId: note.id,
          noteTitle: note.title,
          details: `Updated content or category`
        })
      } else if (existing.isPinned !== note.isPinned) {
        newHistory.push({
          timestamp: new Date().toISOString(),
          action: note.isPinned ? 'pin' : 'unpin',
          noteId: note.id,
          noteTitle: note.title
        })
      }
    })

    // Track deleted notes
    existingNotes.forEach((existing: SavedNote) => {
      if (!notes.find((n: SavedNote) => n.id === existing.id)) {
        newHistory.push({
          timestamp: new Date().toISOString(),
          action: 'delete',
          noteId: existing.id,
          noteTitle: existing.title,
          details: `Deleted from ${existing.category} category`
        })
      }
    })

    // Keep only last 100 history entries
    const trimmedHistory = newHistory.slice(-100)

    // Prepare notes data
    const notesData: NotesData = {
      notes: notes,
      metadata: {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        totalNotes: notes.length,
        categories: categories
      },
      history: trimmedHistory
    }

    // Save notes data
    await writeFile(notesPath, JSON.stringify(notesData, null, 2))

    // Create timestamped backup
    const backupPath = path.join(boardDir, `notes-backup-${Date.now()}.json`)
    await writeFile(backupPath, JSON.stringify(notesData, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Notes saved successfully',
      metadata: notesData.metadata,
      historyEntries: trimmedHistory.length
    })

  } catch (error) {
    console.error('Error saving notes:', error)
    return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('boardId') || 'board-demo'

    const storageDir = path.join(process.cwd(), 'storage')
    const boardDir = path.join(storageDir, 'boards', boardId)
    const notesPath = path.join(boardDir, 'notes.json')

    if (!existsSync(notesPath)) {
      return NextResponse.json({
        success: true,
        notes: [],
        metadata: {
          version: '1.0',
          lastUpdated: new Date().toISOString(),
          totalNotes: 0,
          categories: {}
        },
        history: []
      })
    }

    const notesRaw = await readFile(notesPath, 'utf8')
    const notesData: NotesData = JSON.parse(notesRaw)

    return NextResponse.json({
      success: true,
      ...notesData
    })

  } catch (error) {
    console.error('Error loading notes:', error)
    return NextResponse.json({ error: 'Failed to load notes' }, { status: 500 })
  }
} 
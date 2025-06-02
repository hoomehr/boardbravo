import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-service'
import { SavedNoteDocument } from '@/lib/models'

interface SavedNoteInput {
  id: string
  title: string
  content: string
  category: 'financial' | 'risk' | 'compliance' | 'performance' | 'strategy' | 'general'
  source?: string
  isPinned: boolean
  tags: string[]
  charts?: any[]
  summary?: any
}

export async function POST(request: NextRequest) {
  try {
    const { boardId, notes } = await request.json()

    if (!boardId) {
      return NextResponse.json({ error: 'Board ID is required' }, { status: 400 })
    }

    if (!notes || !Array.isArray(notes)) {
      return NextResponse.json({ error: 'Notes array is required' }, { status: 400 })
    }

    // Check if board exists
    const board = await DatabaseService.getBoardById(boardId)
    if (!board) {
      return NextResponse.json({
        error: 'Board not found',
        boardId
      }, { status: 404 })
    }

    // Get existing notes to compare for changes
    const existingNotes = await DatabaseService.getBoardSavedNotes(boardId)
    const existingNotesMap = new Map(existingNotes.map(note => [note.noteId, note]))

    let createdCount = 0
    let updatedCount = 0
    let errors: string[] = []

    // Process each note
    for (const noteInput of notes as SavedNoteInput[]) {
      try {
        // Validate required fields
        if (!noteInput.id || !noteInput.title || !noteInput.content) {
          errors.push(`Note ${noteInput.id || 'unknown'}: Missing required fields (id, title, content)`)
          continue
        }

        // Validate category
        const validCategories = ['financial', 'risk', 'compliance', 'performance', 'strategy', 'general']
        if (!validCategories.includes(noteInput.category)) {
          errors.push(`Note ${noteInput.id}: Invalid category. Must be one of: ${validCategories.join(', ')}`)
          continue
        }

        const existingNote = existingNotesMap.get(noteInput.id)

        if (existingNote) {
          // Update existing note
          const success = await DatabaseService.updateSavedNote(boardId, noteInput.id, {
            title: noteInput.title.trim(),
            content: noteInput.content.trim(),
            category: noteInput.category,
            source: noteInput.source,
            isPinned: noteInput.isPinned || false,
            tags: noteInput.tags || [],
            charts: noteInput.charts,
            summary: noteInput.summary
          })
          
          if (success) {
            updatedCount++
          } else {
            errors.push(`Note ${noteInput.id}: Failed to update`)
          }
        } else {
          // Create new note
          await DatabaseService.createSavedNote({
            boardId,
            noteId: noteInput.id,
            title: noteInput.title.trim(),
            content: noteInput.content.trim(),
            category: noteInput.category,
            source: noteInput.source,
            isPinned: noteInput.isPinned || false,
            tags: noteInput.tags || [],
            charts: noteInput.charts,
            summary: noteInput.summary
          })
          createdCount++
        }
      } catch (error) {
        console.error(`Error processing note ${noteInput.id}:`, error)
        errors.push(`Note ${noteInput.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Remove notes that are no longer in the input array
    const inputNoteIds = new Set(notes.map((n: SavedNoteInput) => n.id))
    let deletedCount = 0
    
    for (const existingNote of existingNotes) {
      if (!inputNoteIds.has(existingNote.noteId)) {
        const success = await DatabaseService.deleteSavedNote(boardId, existingNote.noteId)
        if (success) {
          deletedCount++
        } else {
          errors.push(`Note ${existingNote.noteId}: Failed to delete`)
        }
      }
    }

    // Update board metadata
    await DatabaseService.updateBoardMetadata(boardId)

    // Get updated notes for summary
    const updatedNotes = await DatabaseService.getBoardSavedNotes(boardId)
    
    // Calculate category counts
    const categories: Record<string, number> = {}
    updatedNotes.forEach(note => {
      categories[note.category] = (categories[note.category] || 0) + 1
    })

    const response: any = {
      success: true,
      message: `Notes processed successfully. Created: ${createdCount}, Updated: ${updatedCount}, Deleted: ${deletedCount}`,
      metadata: {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        totalNotes: updatedNotes.length,
        categories: categories
      },
      summary: {
        created: createdCount,
        updated: updatedCount,
        deleted: deletedCount,
        total: updatedNotes.length
      },
      storageInfo: {
        boardId,
        source: 'mongodb'
      }
    }

    if (errors.length > 0) {
      response.warnings = errors
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error saving notes:', error)
    return NextResponse.json({ 
      error: 'Failed to save notes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('boardId') || 'board-demo'

    // Check if board exists
    const board = await DatabaseService.getBoardById(boardId)
    if (!board) {
      return NextResponse.json({
        error: 'Board not found',
        boardId
      }, { status: 404 })
    }

    // Get notes from MongoDB
    const notes = await DatabaseService.getBoardSavedNotes(boardId)

    // Transform to expected frontend format
    const transformedNotes = notes.map(note => ({
      id: note.noteId,
      title: note.title,
      content: note.content,
      category: note.category,
      source: note.source,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      isPinned: note.isPinned,
      tags: note.tags,
      charts: note.charts,
      summary: note.summary
    }))

    // Calculate category counts
    const categories: Record<string, number> = {}
    transformedNotes.forEach(note => {
      categories[note.category] = (categories[note.category] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      notes: transformedNotes,
      metadata: {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        totalNotes: transformedNotes.length,
        categories: categories
      },
      storageInfo: {
        boardId,
        source: 'mongodb',
        hasNotes: transformedNotes.length > 0
      }
    })

  } catch (error) {
    console.error('Error loading notes:', error)
    return NextResponse.json({ 
      error: 'Failed to load notes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Remove a specific note
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('boardId')
    const noteId = searchParams.get('noteId')

    if (!boardId || !noteId) {
      return NextResponse.json({
        error: 'Missing required parameters: boardId and noteId'
      }, { status: 400 })
    }

    // Check if board exists
    const board = await DatabaseService.getBoardById(boardId)
    if (!board) {
      return NextResponse.json({
        error: 'Board not found',
        boardId
      }, { status: 404 })
    }

    // Check if note exists
    const existingNote = await DatabaseService.getSavedNoteById(boardId, noteId)
    if (!existingNote) {
      return NextResponse.json({
        error: 'Note not found',
        noteId
      }, { status: 404 })
    }

    // Delete note
    const success = await DatabaseService.deleteSavedNote(boardId, noteId)
    
    if (!success) {
      return NextResponse.json({
        error: 'Failed to delete note'
      }, { status: 500 })
    }

    // Update board metadata
    await DatabaseService.updateBoardMetadata(boardId)

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully',
      deletedNote: {
        id: existingNote.noteId,
        title: existingNote.title
      },
      boardId,
      storageInfo: {
        source: 'mongodb'
      }
    })

  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({
      error: 'Failed to delete note',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update a specific note
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('boardId')
    const noteId = searchParams.get('noteId')

    if (!boardId || !noteId) {
      return NextResponse.json({
        error: 'Missing required parameters: boardId and noteId'
      }, { status: 400 })
    }

    const updates = await request.json()

    // Check if board exists
    const board = await DatabaseService.getBoardById(boardId)
    if (!board) {
      return NextResponse.json({
        error: 'Board not found',
        boardId
      }, { status: 404 })
    }

    // Check if note exists
    const existingNote = await DatabaseService.getSavedNoteById(boardId, noteId)
    if (!existingNote) {
      return NextResponse.json({
        error: 'Note not found',
        noteId
      }, { status: 404 })
    }

    // Validate category if provided
    if (updates.category) {
      const validCategories = ['financial', 'risk', 'compliance', 'performance', 'strategy', 'general']
      if (!validCategories.includes(updates.category)) {
        return NextResponse.json({
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        }, { status: 400 })
      }
    }

    // Update note
    const success = await DatabaseService.updateSavedNote(boardId, noteId, updates)
    
    if (!success) {
      return NextResponse.json({
        error: 'Failed to update note'
      }, { status: 500 })
    }

    // Get updated note
    const updatedNote = await DatabaseService.getSavedNoteById(boardId, noteId)

    return NextResponse.json({
      success: true,
      message: 'Note updated successfully',
      note: updatedNote ? {
        id: updatedNote.noteId,
        title: updatedNote.title,
        content: updatedNote.content,
        category: updatedNote.category,
        source: updatedNote.source,
        createdAt: updatedNote.createdAt.toISOString(),
        updatedAt: updatedNote.updatedAt.toISOString(),
        isPinned: updatedNote.isPinned,
        tags: updatedNote.tags,
        charts: updatedNote.charts,
        summary: updatedNote.summary
      } : null,
      boardId,
      storageInfo: {
        source: 'mongodb'
      }
    })

  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json({
      error: 'Failed to update note',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-service'

interface BoardData {
  board: any
  members: any[]
  documents: any[]
  chatSessions: any[]
  savedNotes?: any[]
}

export async function POST(request: NextRequest) {
  try {
    const boardData: BoardData = await request.json()
    const { board, members, documents, chatSessions, savedNotes } = boardData

    if (!board?.id) {
      return NextResponse.json({ error: 'Board ID is required' }, { status: 400 })
    }

    // Create or update board (MongoDB only - no file system)
    const existingBoard = await DatabaseService.getBoardById(board.id)
    
    // Transform members to the correct format
    const transformedMembers = (members || []).map(member => ({
      memberId: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      addedAt: member.addedAt ? new Date(member.addedAt) : new Date(),
      status: member.status || 'active'
    }))
    
    if (existingBoard) {
      // Update existing board
      await DatabaseService.updateBoard(board.id, {
        name: board.name || existingBoard.name,
        lastActivity: new Date(),
        settings: board.settings || existingBoard.settings,
        members: transformedMembers, // Update embedded members
        metadata: {
          version: '1.0',
          documentsCount: documents?.length || 0,
          membersCount: transformedMembers.length,
          chatSessionsCount: chatSessions?.length || 0,
          savedNotesCount: savedNotes?.length || 0
        }
      })
    } else {
      // Create new board with embedded members
      await DatabaseService.createBoard({
        boardId: board.id,
        name: board.name || 'Untitled Board',
        createdBy: board.createdBy || 'unknown',
        lastActivity: new Date(),
        members: transformedMembers, // Embed members in board document
        settings: board.settings || {
          allowMemberInvites: true,
          requireApproval: false
        },
        metadata: {
          version: '1.0',
          documentsCount: documents?.length || 0,
          membersCount: transformedMembers.length,
          chatSessionsCount: chatSessions?.length || 0,
          savedNotesCount: savedNotes?.length || 0
        }
      })
    }

    // Save documents if provided
    if (documents && documents.length > 0) {
      for (const doc of documents) {
        const existingDoc = await DatabaseService.getDocumentById(board.id, doc.id)
        
        if (!existingDoc) {
          await DatabaseService.addDocument({
            boardId: board.id,
            documentId: doc.id,
            name: doc.name,
            type: doc.type,
            size: doc.size,
            uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt) : new Date(),
            status: doc.status || 'ready',
            extractedText: doc.extractedText,
            metadata: {
              originalName: doc.name,
              mimeType: doc.type,
              uploadedBy: doc.uploadedBy
            }
          })
        }
      }
    }

    // Save chat sessions if provided
    if (chatSessions && chatSessions.length > 0) {
      for (const session of chatSessions) {
        const existingSession = await DatabaseService.getChatSessionById(board.id, session.id)
        
        if (!existingSession) {
          await DatabaseService.createChatSession({
            boardId: board.id,
            sessionId: session.id,
            title: session.title,
            messages: session.messages || []
          })
        } else {
          await DatabaseService.updateChatSession(board.id, session.id, {
            title: session.title,
            messages: session.messages || []
          })
        }
      }
    }

    // Save notes if provided
    if (savedNotes && savedNotes.length > 0) {
      for (const note of savedNotes) {
        const existingNote = await DatabaseService.getSavedNoteById(board.id, note.id)
        
        if (!existingNote) {
          await DatabaseService.createSavedNote({
            boardId: board.id,
            noteId: note.id,
            title: note.title,
            content: note.content,
            category: note.category || 'general',
            source: note.source,
            isPinned: note.isPinned || false,
            tags: note.tags || [],
            charts: note.charts,
            summary: note.summary
          })
        }
      }
    }

    // Update board metadata
    await DatabaseService.updateBoardMetadata(board.id)

    // Get updated board data from MongoDB
    const updatedBoard = await DatabaseService.getBoardById(board.id)

    return NextResponse.json({
      success: true,
      message: 'Board data saved successfully to MongoDB',
      board: updatedBoard,
      storageInfo: {
        boardId: board.id,
        storage: 'mongodb',
        documentsCount: documents?.length || 0,
        membersCount: transformedMembers.length,
        savedNotesCount: savedNotes?.length || 0,
        membersEmbedded: true
      }
    })

  } catch (error) {
    console.error('Error saving board data to MongoDB:', error)
    return NextResponse.json({ 
      error: 'Failed to save board data to MongoDB',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('boardId') || 'board-demo'

    // Get complete board data from MongoDB only (no file system fallback)
    const boardSummary = await DatabaseService.getBoardSummary(boardId)

    if (!boardSummary.board) {
      return NextResponse.json({ 
        error: 'Board not found in MongoDB',
        boardId 
      }, { status: 404 })
    }

    // Transform MongoDB documents to match expected frontend format
    const transformedMembers = boardSummary.members.map(member => ({
      id: member.memberId,
      name: member.name,
      email: member.email,
      role: member.role,
      addedAt: member.addedAt,
      status: member.status
    }))

    const transformedDocuments = boardSummary.documents.map(doc => ({
      id: doc.documentId,
      name: doc.name,
      type: doc.type,
      size: doc.size,
      uploadedAt: doc.uploadedAt,
      status: doc.status,
      extractedText: doc.extractedText
    }))

    const transformedChatSessions = boardSummary.chatSessions.map(session => ({
      id: session.sessionId,
      title: session.title,
      messages: session.messages,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }))

    const transformedSavedNotes = boardSummary.savedNotes.map(note => ({
      id: note.noteId,
      title: note.title,
      content: note.content,
      category: note.category,
      source: note.source,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      isPinned: note.isPinned,
      tags: note.tags,
      charts: note.charts,
      summary: note.summary
    }))

    return NextResponse.json({
      success: true,
      board: {
        id: boardSummary.board.boardId,
        name: boardSummary.board.name,
        createdBy: boardSummary.board.createdBy,
        createdAt: boardSummary.board.createdAt,
        lastActivity: boardSummary.board.lastActivity,
        settings: boardSummary.board.settings,
        lastSaved: boardSummary.board.updatedAt
      },
      members: transformedMembers,
      documents: transformedDocuments,
      chatSessions: transformedChatSessions,
      savedNotes: transformedSavedNotes,
      metadata: boardSummary.board.metadata,
      storageInfo: {
        boardId,
        storage: 'mongodb',
        hasDocuments: transformedDocuments.length > 0,
        membersEmbedded: true,
        dataSource: 'mongodb_only'
      }
    })

  } catch (error) {
    console.error('Error loading board data from MongoDB:', error)
    return NextResponse.json({ 
      error: 'Failed to load board data from MongoDB',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 
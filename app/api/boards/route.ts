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
      return NextResponse.json({ 
        error: 'Board ID is required' 
      }, { status: 400 })
    }

    console.log('Saving board data to MongoDB:', {
      boardId: board.id,
      membersCount: members?.length || 0,
      documentsCount: documents?.length || 0,
      chatSessionsCount: chatSessions?.length || 0,
      savedNotesCount: savedNotes?.length || 0
    })

    // Check if board exists, if not create it
    let existingBoard = await DatabaseService.getBoardById(board.id)
    
    if (!existingBoard) {
      // Convert old member format to new user-reference format
      const transformedMembers = []
      
      if (members && members.length > 0) {
        for (const member of members) {
          // Check if user exists, if not create them
          let user = await DatabaseService.getUserByEmail(member.email || `${member.name}@example.com`)
          
          if (!user) {
            user = await DatabaseService.createUserFromBasicInfo(
              member.name || `User ${member.id}`,
              member.email || `${member.name || member.id}@example.com`,
              member.id
            )
          }
          
          transformedMembers.push({
            userId: user.userId,
            role: member.role || 'Member',
            addedAt: member.addedAt ? new Date(member.addedAt) : new Date(),
            addedBy: board.createdBy || 'system',
            permissions: {
              canInviteMembers: (member.role || 'Member') === 'Admin',
              canEditDocuments: (member.role || 'Member') !== 'Viewer',
              canDeleteDocuments: (member.role || 'Member') === 'Admin',
              canManageNotes: (member.role || 'Member') !== 'Viewer'
            },
            status: member.status || 'active'
          })
        }
      }

      existingBoard = await DatabaseService.createBoard({
        boardId: board.id,
        name: board.name || 'Untitled Board',
        description: board.description,
        createdBy: board.createdBy || 'system',
        lastActivity: new Date(),
        members: transformedMembers,
        settings: {
          allowMemberInvites: true,
          requireApproval: false,
          isPublic: false,
          allowGuestAccess: false
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
            uploadedBy: doc.uploadedBy || board.createdBy || 'system',
            status: doc.status || 'ready',
            extractedText: doc.extractedText,
            metadata: {
              originalName: doc.name,
              mimeType: doc.type,
              uploadedBy: doc.uploadedBy || board.createdBy || 'system'
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
            createdBy: session.createdBy || board.createdBy || 'system',
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
            createdBy: note.createdBy || board.createdBy || 'system',
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
        membersCount: members?.length || 0,
        savedNotesCount: savedNotes?.length || 0,
        architecture: 'user_references'
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
    // Fix: Use the new user-reference structure
    const transformedMembers = boardSummary.members.map(memberWithUser => ({
      id: memberWithUser.userId,
      name: memberWithUser.user.name,
      email: memberWithUser.user.email,
      role: memberWithUser.role,
      addedAt: memberWithUser.addedAt,
      status: memberWithUser.status,
      avatar: memberWithUser.user.avatar,
      company: memberWithUser.user.company,
      jobTitle: memberWithUser.user.jobTitle
    }))

    const transformedDocuments = boardSummary.documents.map(doc => ({
      id: doc.documentId,
      name: doc.name,
      type: doc.type,
      size: doc.size,
      uploadedAt: doc.uploadedAt,
      status: doc.status,
      extractedText: doc.extractedText,
      uploadedBy: doc.uploadedBy
    }))

    const transformedChatSessions = boardSummary.chatSessions.map(session => ({
      id: session.sessionId,
      title: session.title,
      messages: session.messages,
      createdBy: session.createdBy,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }))

    const transformedSavedNotes = boardSummary.savedNotes.map(note => ({
      id: note.noteId,
      title: note.title,
      content: note.content,
      category: note.category,
      source: note.source,
      createdBy: note.createdBy,
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
        hasChatSessions: transformedChatSessions.length > 0,
        architecture: 'user_references',
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
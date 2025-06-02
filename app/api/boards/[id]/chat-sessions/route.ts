import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-service'
import { ChatMessageData } from '@/lib/models'

// GET - Fetch all chat sessions for a board
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = params.id

    // Check if board exists
    const board = await DatabaseService.getBoardById(boardId)
    if (!board) {
      return NextResponse.json({
        error: 'Board not found',
        boardId
      }, { status: 404 })
    }

    // Get all chat sessions for this board
    const chatSessions = await DatabaseService.getBoardChatSessions(boardId)

    return NextResponse.json({
      success: true,
      chatSessions: chatSessions.map(session => ({
        id: session.sessionId,
        title: session.title,
        createdBy: session.createdBy,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messagesCount: session.messages?.length || 0,
        lastMessage: session.messages && session.messages.length > 0 
          ? session.messages[session.messages.length - 1] 
          : null
      })),
      boardId,
      sessionCount: chatSessions.length,
      storageInfo: {
        source: 'mongodb',
        architecture: 'user_references'
      }
    })

  } catch (error) {
    console.error('Error fetching chat sessions:', error)
    return NextResponse.json({
      error: 'Failed to fetch chat sessions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Create a new chat session
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = params.id
    const { title, createdBy, sessionId, initialMessage } = await request.json()

    // Validate required fields
    if (!title || !createdBy) {
      return NextResponse.json({
        error: 'Missing required fields: title and createdBy are required'
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

    // Generate session ID if not provided
    const newSessionId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Check if session already exists
    const existingSession = await DatabaseService.getChatSessionById(boardId, newSessionId)
    if (existingSession) {
      return NextResponse.json({
        error: 'Chat session with this ID already exists',
        sessionId: newSessionId
      }, { status: 409 })
    }

    // Prepare initial messages
    const messages: ChatMessageData[] = []
    if (initialMessage) {
      messages.push({
        id: `msg-${Date.now()}`,
        type: 'user',
        content: initialMessage,
        timestamp: new Date(),
        userId: createdBy
      })
    }

    // Create new chat session
    const newSession = await DatabaseService.createChatSession({
      boardId,
      sessionId: newSessionId,
      title,
      createdBy,
      messages
    })

    // Update board metadata
    await DatabaseService.updateBoardMetadata(boardId)

    return NextResponse.json({
      success: true,
      message: 'Chat session created successfully',
      chatSession: {
        id: newSession.sessionId,
        title: newSession.title,
        createdBy: newSession.createdBy,
        createdAt: newSession.createdAt,
        updatedAt: newSession.updatedAt,
        messages: newSession.messages,
        messagesCount: newSession.messages.length
      },
      boardId,
      storageInfo: {
        source: 'mongodb',
        architecture: 'user_references'
      }
    })

  } catch (error) {
    console.error('Error creating chat session:', error)
    return NextResponse.json({
      error: 'Failed to create chat session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update chat session (title, add messages)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = params.id
    const { sessionId, title, newMessage, messages } = await request.json()

    if (!sessionId) {
      return NextResponse.json({
        error: 'Missing required field: sessionId'
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

    // Check if session exists
    const existingSession = await DatabaseService.getChatSessionById(boardId, sessionId)
    if (!existingSession) {
      return NextResponse.json({
        error: 'Chat session not found',
        sessionId
      }, { status: 404 })
    }

    // Prepare updates
    const updates: any = {}
    if (title) updates.title = title
    if (messages) updates.messages = messages

    // Add new message if provided
    if (newMessage) {
      const messageData: ChatMessageData = {
        id: newMessage.id || `msg-${Date.now()}`,
        type: newMessage.type || 'user',
        content: newMessage.content,
        timestamp: new Date(),
        userId: newMessage.userId,
        charts: newMessage.charts,
        summary: newMessage.summary
      }

      await DatabaseService.addMessageToSession(boardId, sessionId, messageData)
    } else if (Object.keys(updates).length > 0) {
      // Update session details
      await DatabaseService.updateChatSession(boardId, sessionId, updates)
    }

    // Get updated session
    const updatedSession = await DatabaseService.getChatSessionById(boardId, sessionId)

    return NextResponse.json({
      success: true,
      message: 'Chat session updated successfully',
      chatSession: {
        id: updatedSession!.sessionId,
        title: updatedSession!.title,
        createdBy: updatedSession!.createdBy,
        createdAt: updatedSession!.createdAt,
        updatedAt: updatedSession!.updatedAt,
        messages: updatedSession!.messages,
        messagesCount: updatedSession!.messages.length
      },
      boardId,
      storageInfo: {
        source: 'mongodb',
        architecture: 'user_references'
      }
    })

  } catch (error) {
    console.error('Error updating chat session:', error)
    return NextResponse.json({
      error: 'Failed to update chat session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Delete a chat session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = params.id
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({
        error: 'Missing required parameter: sessionId'
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

    // Check if session exists
    const existingSession = await DatabaseService.getChatSessionById(boardId, sessionId)
    if (!existingSession) {
      return NextResponse.json({
        error: 'Chat session not found',
        sessionId
      }, { status: 404 })
    }

    // Delete the session
    const success = await DatabaseService.deleteChatSession(boardId, sessionId)
    
    if (!success) {
      return NextResponse.json({
        error: 'Failed to delete chat session'
      }, { status: 500 })
    }

    // Update board metadata
    await DatabaseService.updateBoardMetadata(boardId)

    return NextResponse.json({
      success: true,
      message: 'Chat session deleted successfully',
      deletedSession: {
        id: existingSession.sessionId,
        title: existingSession.title,
        messagesCount: existingSession.messages.length
      },
      boardId,
      storageInfo: {
        source: 'mongodb',
        architecture: 'user_references'
      }
    })

  } catch (error) {
    console.error('Error deleting chat session:', error)
    return NextResponse.json({
      error: 'Failed to delete chat session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-service'

// GET - Get a specific chat session with full message history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; sessionId: string } }
) {
  try {
    const boardId = params.id
    const sessionId = params.sessionId

    // Check if board exists
    const board = await DatabaseService.getBoardById(boardId)
    if (!board) {
      return NextResponse.json({
        error: 'Board not found',
        boardId
      }, { status: 404 })
    }

    // Get the specific chat session
    const chatSession = await DatabaseService.getChatSessionById(boardId, sessionId)
    if (!chatSession) {
      return NextResponse.json({
        error: 'Chat session not found',
        sessionId,
        boardId
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      chatSession: {
        id: chatSession.sessionId,
        title: chatSession.title,
        createdBy: chatSession.createdBy,
        createdAt: chatSession.createdAt,
        updatedAt: chatSession.updatedAt,
        messages: chatSession.messages.map(msg => ({
          id: msg.id,
          type: msg.type,
          content: msg.content,
          timestamp: msg.timestamp,
          userId: msg.userId,
          charts: msg.charts,
          summary: msg.summary
        })),
        messagesCount: chatSession.messages.length
      },
      boardId,
      storageInfo: {
        source: 'mongodb',
        architecture: 'user_references'
      }
    })

  } catch (error) {
    console.error('Error fetching chat session:', error)
    return NextResponse.json({
      error: 'Failed to fetch chat session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update a specific chat session or add message
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; sessionId: string } }
) {
  try {
    const boardId = params.id
    const sessionId = params.sessionId
    const { title, newMessage, messages } = await request.json()

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
        sessionId,
        boardId
      }, { status: 404 })
    }

    // Add new message if provided
    if (newMessage) {
      const messageData = {
        id: newMessage.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: newMessage.type || 'user',
        content: newMessage.content,
        timestamp: new Date(),
        userId: newMessage.userId,
        charts: newMessage.charts,
        summary: newMessage.summary
      }

      await DatabaseService.addMessageToSession(boardId, sessionId, messageData)
    }

    // Update other fields if provided
    const updates: any = {}
    if (title) updates.title = title
    if (messages) updates.messages = messages

    if (Object.keys(updates).length > 0) {
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

// DELETE - Delete a specific chat session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; sessionId: string } }
) {
  try {
    const boardId = params.id
    const sessionId = params.sessionId

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
        sessionId,
        boardId
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
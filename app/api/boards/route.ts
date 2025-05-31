import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

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

    // Create board-specific storage directory
    const storageDir = path.join(process.cwd(), 'storage')
    const boardDir = path.join(storageDir, 'boards', board.id)
    
    try {
      await mkdir(boardDir, { recursive: true })
    } catch (error) {
      console.error('Error creating board directory:', error)
    }

    // Save board data to JSON file
    const boardDataPath = path.join(boardDir, 'board-data.json')
    const dataToSave = {
      board: {
        ...board,
        lastSaved: new Date().toISOString()
      },
      members: members || [],
      documents: documents || [],
      chatSessions: chatSessions || [],
      savedNotes: savedNotes || [],
      metadata: {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        documentsCount: documents?.length || 0,
        membersCount: members?.length || 0,
        chatSessionsCount: chatSessions?.length || 0,
        savedNotesCount: savedNotes?.length || 0
      }
    }

    await writeFile(boardDataPath, JSON.stringify(dataToSave, null, 2))

    // Also save a backup with timestamp
    const backupPath = path.join(boardDir, `backup-${Date.now()}.json`)
    await writeFile(backupPath, JSON.stringify(dataToSave, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Board data saved successfully',
      board: dataToSave.board,
      storageInfo: {
        boardId: board.id,
        directory: boardDir,
        documentsCount: dataToSave.metadata.documentsCount,
        membersCount: dataToSave.metadata.membersCount,
        savedNotesCount: dataToSave.metadata.savedNotesCount
      }
    })

  } catch (error) {
    console.error('Error saving board data:', error)
    return NextResponse.json({ error: 'Failed to save board data' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('boardId') || 'board-demo'

    const storageDir = path.join(process.cwd(), 'storage')
    const boardDir = path.join(storageDir, 'boards', boardId)
    const boardDataPath = path.join(boardDir, 'board-data.json')

    // Check if board data exists
    if (!existsSync(boardDataPath)) {
      return NextResponse.json({ 
        error: 'Board not found',
        boardId 
      }, { status: 404 })
    }

    // Read board data
    const boardDataRaw = await readFile(boardDataPath, 'utf8')
    const boardData = JSON.parse(boardDataRaw)

    // Also load documents metadata if available
    const documentsPath = path.join(boardDir, 'documents.json')
    let documentsMetadata = []
    try {
      if (existsSync(documentsPath)) {
        const documentsRaw = await readFile(documentsPath, 'utf8')
        documentsMetadata = JSON.parse(documentsRaw)
      }
    } catch (error) {
      console.error('Error loading documents metadata:', error)
    }

    return NextResponse.json({
      success: true,
      board: boardData.board,
      members: boardData.members || [],
      documents: boardData.documents || documentsMetadata,
      chatSessions: boardData.chatSessions || [],
      savedNotes: boardData.savedNotes || [],
      metadata: boardData.metadata,
      storageInfo: {
        boardId,
        directory: boardDir,
        hasDocuments: documentsMetadata.length > 0
      }
    })

  } catch (error) {
    console.error('Error loading board data:', error)
    return NextResponse.json({ error: 'Failed to load board data' }, { status: 500 })
  }
} 
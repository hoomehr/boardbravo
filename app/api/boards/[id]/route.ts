import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = params.id

    const storageDir = path.join(process.cwd(), 'storage')
    const boardDir = path.join(storageDir, 'boards', boardId)
    const boardDataPath = path.join(boardDir, 'board-data.json')

    // Check if board exists
    if (!existsSync(boardDataPath)) {
      return NextResponse.json({
        error: 'Board not found',
        boardId,
        message: `No board data found for ID: ${boardId}`
      }, { status: 404 })
    }

    // Read board data
    const boardDataRaw = await readFile(boardDataPath, 'utf8')
    const boardData = JSON.parse(boardDataRaw)

    // Load documents metadata separately
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

    // Merge documents from both sources (prioritize metadata file)
    const allDocuments = documentsMetadata.length > 0 ? documentsMetadata : (boardData.documents || [])

    return NextResponse.json({
      success: true,
      board: boardData.board,
      members: boardData.members || [],
      documents: allDocuments,
      chatSessions: boardData.chatSessions || [],
      metadata: {
        ...boardData.metadata,
        loadedAt: new Date().toISOString(),
        boardDirectory: boardDir,
        documentsDirectory: path.join(boardDir, 'documents'),
        hasDocumentsMetadata: documentsMetadata.length > 0
      }
    })

  } catch (error) {
    console.error('Error loading board:', error)
    return NextResponse.json({
      error: 'Failed to load board data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = params.id
    const updateData = await request.json()

    const storageDir = path.join(process.cwd(), 'storage')
    const boardDir = path.join(storageDir, 'boards', boardId)
    const boardDataPath = path.join(boardDir, 'board-data.json')

    // Ensure directory exists
    await mkdir(boardDir, { recursive: true })

    // Load existing data or create new
    let existingData = {
      board: null,
      members: [],
      documents: [],
      chatSessions: [],
      metadata: {}
    }

    if (existsSync(boardDataPath)) {
      const existingRaw = await readFile(boardDataPath, 'utf8')
      existingData = JSON.parse(existingRaw)
    }

    // Merge updates with existing data
    const updatedData = {
      board: updateData.board || existingData.board,
      members: updateData.members || existingData.members,
      documents: updateData.documents || existingData.documents,
      chatSessions: updateData.chatSessions || existingData.chatSessions,
      metadata: {
        ...existingData.metadata,
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        updatedFields: Object.keys(updateData)
      }
    }

    // Save updated data
    await writeFile(boardDataPath, JSON.stringify(updatedData, null, 2))

    return NextResponse.json({
      success: true,
      message: `Board ${boardId} updated successfully`,
      board: updatedData.board,
      metadata: updatedData.metadata
    })

  } catch (error) {
    console.error('Error updating board:', error)
    return NextResponse.json({
      error: 'Failed to update board data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import pdfParse from 'pdf-parse'
import * as XLSX from 'xlsx'

interface DocumentData {
  id: string
  filename: string
  originalName: string
  storedFilename: string
  relativePath: string
  absolutePath: string
  type: string
  size: number
  uploadedAt: string
  uploadedBy: string
  extractedText: string
  status: string
  boardId: string
}

interface BoardData {
  documents: DocumentData[]
  members: any[]
  chatSessions: any[]
  board: any
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const boardId: string | null = data.get('boardId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!boardId) {
      return NextResponse.json({ error: 'Board ID is required' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not supported' }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large (max 10MB)' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create board-specific storage directory structure
    const storageDir = path.join(process.cwd(), 'storage')
    const boardDir = path.join(storageDir, 'boards', boardId)
    const documentsDir = path.join(boardDir, 'documents')
    
    try {
      await mkdir(documentsDir, { recursive: true })
    } catch (error) {
      console.error('Error creating directories:', error)
      return NextResponse.json({ error: 'Failed to create storage directory' }, { status: 500 })
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const baseName = path.basename(file.name, fileExtension)
    const filename = `${timestamp}-${baseName}${fileExtension}`
    const filepath = path.join(documentsDir, filename)

    // Save file to board-specific directory
    await writeFile(filepath, buffer)

    // Extract text content based on file type
    let extractedText = ''
    try {
      if (file.type === 'application/pdf') {
        const pdfData = await pdfParse(buffer)
        extractedText = pdfData.text
      } else if (file.type.includes('spreadsheet') || file.type.includes('excel') || file.type === 'text/csv') {
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        let text = ''
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName]
          const sheetText = XLSX.utils.sheet_to_txt(worksheet)
          text += `Sheet: ${sheetName}\n${sheetText}\n\n`
        })
        extractedText = text
      } else if (file.type.includes('presentation') || file.type.includes('powerpoint')) {
        // For PowerPoint files, we'll extract basic text
        extractedText = 'PowerPoint content - text extraction in development'
      } else {
        extractedText = 'Content extraction not yet implemented for this file type'
      }
    } catch (error) {
      console.error('Error extracting text:', error)
      extractedText = 'Error extracting text from file'
    }

    // Save document metadata to board's JSON file
    const metadataPath = path.join(boardDir, 'documents.json')
    const documentData: DocumentData = {
      id: Math.random().toString(36).substr(2, 9),
      filename: file.name,
      originalName: file.name,
      storedFilename: filename,
      relativePath: path.join('boards', boardId, 'documents', filename),
      absolutePath: filepath,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'current-user', // In real app, this would come from auth
      extractedText: extractedText.substring(0, 50000), // Increased limit for better analysis
      status: 'ready',
      boardId: boardId
    }

    // Update or create documents metadata file
    try {
      let documentsMetadata: DocumentData[] = []
      try {
        const existingData = await import('fs').then(fs => 
          fs.promises.readFile(metadataPath, 'utf8')
        )
        documentsMetadata = JSON.parse(existingData)
      } catch (error) {
        // File doesn't exist yet, start with empty array
      }

      documentsMetadata.push(documentData)
      
      await writeFile(metadataPath, JSON.stringify(documentsMetadata, null, 2))
    } catch (error) {
      console.error('Error saving document metadata:', error)
      // Continue anyway - the file is saved even if metadata fails
    }

    // Also save to board's main data file
    try {
      const boardDataPath = path.join(boardDir, 'board-data.json')
      let boardData: BoardData = {
        documents: [],
        members: [],
        chatSessions: [],
        board: null
      }

      try {
        const existingBoardData = await import('fs').then(fs => 
          fs.promises.readFile(boardDataPath, 'utf8')
        )
        boardData = JSON.parse(existingBoardData)
      } catch (error) {
        // File doesn't exist yet
      }

      // Ensure documents array exists and has proper type
      if (!Array.isArray(boardData.documents)) {
        boardData.documents = []
      }
      boardData.documents.push(documentData)

      await writeFile(boardDataPath, JSON.stringify(boardData, null, 2))
    } catch (error) {
      console.error('Error updating board data:', error)
    }

    // Return document data for frontend
    return NextResponse.json({
      success: true,
      document: documentData,
      message: `Document uploaded successfully to board ${boardId}`,
      storageInfo: {
        boardId,
        directory: documentsDir,
        filename
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
} 
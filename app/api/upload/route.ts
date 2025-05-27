import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import pdfParse from 'pdf-parse'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Save file
    const filename = `${Date.now()}-${file.name}`
    const filepath = path.join(uploadsDir, filename)
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
      } else {
        // For PowerPoint and other formats, we'll need additional libraries
        extractedText = 'Content extraction not yet implemented for this file type'
      }
    } catch (error) {
      console.error('Error extracting text:', error)
      extractedText = 'Error extracting text from file'
    }

    const documentData = {
      id: Math.random().toString(36).substr(2, 9),
      filename: file.name,
      originalName: file.name,
      filepath: filename,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      extractedText: extractedText.substring(0, 10000), // Limit text length
      status: 'ready'
    }

    return NextResponse.json(documentData)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
} 
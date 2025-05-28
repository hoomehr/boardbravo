import { NextRequest, NextResponse } from 'next/server'

// Google Drive OAuth configuration
const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file'
]

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const DRIVE_REDIRECT_URI = process.env.NEXTAUTH_URL + '/api/integrations/google-drive/callback'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'connect') {
      // Generate OAuth URL for Google Drive authorization
      const authUrl = generateDriveAuthUrl()
      return NextResponse.json({ authUrl })
    }

    if (action === 'status') {
      // Check if Google Drive is connected
      return NextResponse.json({ 
        connected: false,
        email: null 
      })
    }

    if (action === 'documents') {
      // Fetch documents from Google Drive
      const documents = await fetchDriveDocuments()
      return NextResponse.json({ documents })
    }

    if (action === 'folders') {
      // Fetch board document folders
      const folders = await fetchBoardFolders()
      return NextResponse.json({ folders })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Google Drive integration error:', error)
    return NextResponse.json(
      { error: 'Failed to process Google Drive integration request' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, code, folderId } = body

    if (action === 'exchange_code') {
      // Exchange authorization code for access token
      const tokens = await exchangeCodeForTokens(code)
      
      return NextResponse.json({ 
        success: true,
        message: 'Google Drive connected successfully' 
      })
    }

    if (action === 'sync_folder') {
      // Sync specific folder documents
      const documents = await syncFolderDocuments(folderId)
      return NextResponse.json({ documents })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Google Drive OAuth error:', error)
    return NextResponse.json(
      { error: 'Failed to process Google Drive request' },
      { status: 500 }
    )
  }
}

function generateDriveAuthUrl(): string {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID not configured')
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: DRIVE_REDIRECT_URI,
    scope: DRIVE_SCOPES.join(' '),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent'
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

async function exchangeCodeForTokens(code: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: DRIVE_REDIRECT_URI,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange code for tokens')
  }

  return await response.json()
}

async function fetchDriveDocuments() {
  // Mock implementation - real version would use Google Drive API
  return [
    {
      id: 'drive-doc-1',
      name: 'Board Meeting Minutes - Q4 2023.pdf',
      source: 'google-drive',
      folderId: 'board-meetings-2023',
      folderName: 'Board Meetings 2023',
      modifiedAt: new Date('2024-01-12'),
      type: 'application/pdf',
      size: 1024000,
      webViewLink: 'https://drive.google.com/file/d/1234567890/view',
      extractedText: 'Meeting called to order at 10:00 AM. Present: CEO, CFO, Board Members...'
    },
    {
      id: 'drive-doc-2',
      name: 'Financial Dashboard Q4.xlsx',
      source: 'google-drive', 
      folderId: 'financial-reports',
      folderName: 'Financial Reports',
      modifiedAt: new Date('2024-01-08'),
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 512000,
      webViewLink: 'https://drive.google.com/file/d/9876543210/view',
      extractedText: 'Q4 Revenue: $4.2M, Expenses: $2.8M, Net Income: $1.4M...'
    },
    {
      id: 'drive-doc-3',
      name: 'Investment Pitch Deck.pptx',
      source: 'google-drive',
      folderId: 'fundraising',
      folderName: 'Series A Fundraising',
      modifiedAt: new Date('2024-01-05'),
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      size: 8192000,
      webViewLink: 'https://drive.google.com/file/d/1122334455/view',
      extractedText: 'Market Opportunity: $50B TAM, Growing at 25% CAGR...'
    }
  ]
}

async function fetchBoardFolders() {
  // Mock board-related folders
  return [
    {
      id: 'board-meetings-2024',
      name: 'Board Meetings 2024',
      documentCount: 6,
      lastModified: new Date('2024-01-15')
    },
    {
      id: 'financial-reports', 
      name: 'Financial Reports',
      documentCount: 12,
      lastModified: new Date('2024-01-12')
    },
    {
      id: 'fundraising',
      name: 'Series A Fundraising', 
      documentCount: 8,
      lastModified: new Date('2024-01-10')
    },
    {
      id: 'governance',
      name: 'Corporate Governance',
      documentCount: 15,
      lastModified: new Date('2024-01-08')
    }
  ]
}

async function syncFolderDocuments(folderId: string) {
  // Mock folder sync - real implementation would fetch documents from specific Drive folder
  const allDocs = await fetchDriveDocuments()
  return allDocs.filter(doc => doc.folderId === folderId)
} 
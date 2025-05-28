import { NextRequest, NextResponse } from 'next/server'

// Gmail OAuth configuration
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose'
]

const GMAIL_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GMAIL_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GMAIL_REDIRECT_URI = process.env.NEXTAUTH_URL + '/api/integrations/gmail/callback'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'connect') {
      // Generate OAuth URL for Gmail authorization
      const authUrl = generateGmailAuthUrl()
      return NextResponse.json({ authUrl })
    }

    if (action === 'status') {
      // Check if Gmail is connected (you'd check stored tokens in real implementation)
      return NextResponse.json({ 
        connected: false,
        email: null 
      })
    }

    if (action === 'documents') {
      // Fetch email attachments and documents
      const documents = await fetchGmailDocuments()
      return NextResponse.json({ documents })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Gmail integration error:', error)
    return NextResponse.json(
      { error: 'Failed to process Gmail integration request' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, code } = body

    if (action === 'exchange_code') {
      // Exchange authorization code for access token
      const tokens = await exchangeCodeForTokens(code)
      
      // Store tokens securely (implement proper token storage)
      // In production, you'd store this in a database associated with the user
      
      return NextResponse.json({ 
        success: true,
        message: 'Gmail connected successfully' 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Gmail OAuth error:', error)
    return NextResponse.json(
      { error: 'Failed to connect Gmail' },
      { status: 500 }
    )
  }
}

function generateGmailAuthUrl(): string {
  if (!GMAIL_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID not configured')
  }

  const params = new URLSearchParams({
    client_id: GMAIL_CLIENT_ID,
    redirect_uri: GMAIL_REDIRECT_URI,
    scope: GMAIL_SCOPES.join(' '),
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
      client_id: GMAIL_CLIENT_ID!,
      client_secret: GMAIL_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: GMAIL_REDIRECT_URI,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange code for tokens')
  }

  return await response.json()
}

async function fetchGmailDocuments() {
  // Mock implementation - in real version, this would:
  // 1. Use stored access token to authenticate with Gmail API
  // 2. Search for emails with PDF/Excel attachments
  // 3. Download and extract text from attachments
  // 4. Return structured document data

  return [
    {
      id: 'gmail-doc-1',
      name: 'Q4 Financial Report.pdf',
      source: 'gmail',
      sender: 'finance@company.com',
      subject: 'Q4 Financial Results',
      receivedAt: new Date('2024-01-15'),
      type: 'application/pdf',
      size: 2048576,
      extractedText: 'Q4 revenue increased by 23% to $4.2M...'
    },
    {
      id: 'gmail-doc-2', 
      name: 'Board Deck - January.pptx',
      source: 'gmail',
      sender: 'ceo@company.com',
      subject: 'January Board Meeting Materials',
      receivedAt: new Date('2024-01-10'),
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      size: 5242880,
      extractedText: 'Executive Summary: Strong Q4 performance...'
    }
  ]
} 
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const config = {
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Missing',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Configured' : 'Missing',
      nextauthUrl: process.env.NEXTAUTH_URL || 'Missing',
      redirectUris: {
        gmail: (process.env.NEXTAUTH_URL || '') + '/api/integrations/gmail/callback',
        drive: (process.env.NEXTAUTH_URL || '') + '/api/integrations/google-drive/callback'
      }
    }

    return NextResponse.json({
      status: 'OAuth Configuration Check',
      config,
      instructions: 'Make sure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and NEXTAUTH_URL are configured in .env.local'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check OAuth configuration', details: error },
      { status: 500 }
    )
  }
} 
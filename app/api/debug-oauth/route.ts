import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const config = {
      // Environment variables status
      googleClientId: {
        configured: !!process.env.GOOGLE_CLIENT_ID,
        length: process.env.GOOGLE_CLIENT_ID?.length || 0,
        preview: process.env.GOOGLE_CLIENT_ID ? 
          process.env.GOOGLE_CLIENT_ID.substring(0, 12) + '...' + process.env.GOOGLE_CLIENT_ID.slice(-12) : 
          'Not configured'
      },
      googleClientSecret: {
        configured: !!process.env.GOOGLE_CLIENT_SECRET,
        length: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
        preview: process.env.GOOGLE_CLIENT_SECRET ? 
          process.env.GOOGLE_CLIENT_SECRET.substring(0, 6) + '...' + process.env.GOOGLE_CLIENT_SECRET.slice(-6) : 
          'Not configured'
      },
      nextauthUrl: {
        configured: !!process.env.NEXTAUTH_URL,
        value: process.env.NEXTAUTH_URL || 'Not configured'
      },
      
      // Current server info
      currentUrl: request.url,
      host: request.headers.get('host'),
      
      // Expected redirect URIs
      expectedRedirectUris: [
        (process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/api/integrations/gmail/callback',
        (process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/api/integrations/google-drive/callback'
      ],
      
      // OAuth URL generation test
      authUrlTest: generateTestAuthUrl(),
      
      // Common issues checklist
      troubleshooting: {
        'Client ID Format': process.env.GOOGLE_CLIENT_ID?.endsWith('.apps.googleusercontent.com') ? '✅ Correct' : '❌ Should end with .apps.googleusercontent.com',
        'Client Secret Length': (process.env.GOOGLE_CLIENT_SECRET?.length || 0) >= 20 ? '✅ Reasonable length' : '❌ Too short - check if copied correctly',
        'NEXTAUTH_URL Port': process.env.NEXTAUTH_URL?.includes('3000') ? '✅ Matches current port' : '⚠️ Port mismatch - update to current port',
        'Environment File': process.env.NODE_ENV || 'development'
      }
    }

    return NextResponse.json({
      status: 'OAuth Debug Information',
      timestamp: new Date().toISOString(),
      config,
      instructions: {
        '1': 'Check that GOOGLE_CLIENT_ID ends with .apps.googleusercontent.com',
        '2': 'Verify GOOGLE_CLIENT_SECRET is copied correctly (no extra spaces/newlines)',
        '3': 'Ensure NEXTAUTH_URL matches your current port',
        '4': 'Confirm redirect URIs in Google Cloud Console match expectedRedirectUris above',
        '5': 'Make sure OAuth consent screen is configured with correct scopes'
      }
    }, { 
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to check OAuth configuration', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generateTestAuthUrl() {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.NEXTAUTH_URL) {
      return 'Cannot generate - missing credentials'
    }

    const redirectUri = process.env.NEXTAUTH_URL + '/api/integrations/gmail/callback'
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.compose'
    ]
    
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  } catch (error) {
    return `Error generating URL: ${error}`
  }
} 
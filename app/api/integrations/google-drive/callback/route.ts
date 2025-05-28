import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const DRIVE_REDIRECT_URI = process.env.NEXTAUTH_URL + '/api/integrations/google-drive/callback'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      // Handle OAuth error - common errors include access_denied, invalid_request, etc.
      console.error('Google Drive OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/dashboard?integration=google-drive&status=error&message=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard?integration=google-drive&status=error&message=No authorization code received', request.url)
      )
    }

    try {
      // Exchange code for tokens directly in the callback
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
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

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text()
        console.error('Token exchange failed:', errorData)
        throw new Error('Failed to exchange code for tokens')
      }

      const tokens = await tokenResponse.json()
      console.log('Google Drive OAuth success, tokens received')
      
      // TODO: Store tokens securely in database
      // For now, we'll just mark as successful
      
      // Success - redirect back to dashboard
      return NextResponse.redirect(
        new URL('/dashboard?integration=google-drive&status=success', request.url)
      )
    } catch (tokenError) {
      console.error('Google Drive token exchange error:', tokenError)
      return NextResponse.redirect(
        new URL(`/dashboard?integration=google-drive&status=error&message=${encodeURIComponent('Token exchange failed')}`, request.url)
      )
    }
  } catch (error) {
    console.error('Google Drive OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard?integration=google-drive&status=error&message=Authentication failed', request.url)
    )
  }
} 
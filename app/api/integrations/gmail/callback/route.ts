import { NextRequest, NextResponse } from 'next/server'

const GMAIL_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GMAIL_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GMAIL_REDIRECT_URI = process.env.NEXTAUTH_URL + '/api/integrations/gmail/callback'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      // Handle OAuth error - common errors include access_denied, invalid_request, etc.
      console.error('Gmail OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/dashboard?integration=gmail&status=error&message=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard?integration=gmail&status=error&message=No authorization code received', request.url)
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
          client_id: GMAIL_CLIENT_ID!,
          client_secret: GMAIL_CLIENT_SECRET!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: GMAIL_REDIRECT_URI,
        }),
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text()
        console.error('Token exchange failed:', errorData)
        throw new Error('Failed to exchange code for tokens')
      }

      const tokens = await tokenResponse.json()
      console.log('Gmail OAuth success, tokens received')
      
      // TODO: Store tokens securely in database
      // For now, we'll just mark as successful
      
      // Success - redirect back to dashboard
      return NextResponse.redirect(
        new URL('/dashboard?integration=gmail&status=success', request.url)
      )
    } catch (tokenError) {
      console.error('Gmail token exchange error:', tokenError)
      return NextResponse.redirect(
        new URL(`/dashboard?integration=gmail&status=error&message=${encodeURIComponent('Token exchange failed')}`, request.url)
      )
    }
  } catch (error) {
    console.error('Gmail OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard?integration=gmail&status=error&message=Authentication failed', request.url)
    )
  }
} 
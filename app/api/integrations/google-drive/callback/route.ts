import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      // Handle OAuth error
      return NextResponse.redirect(
        new URL(`/dashboard?integration=google-drive&status=error&message=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard?integration=google-drive&status=error&message=No authorization code received', request.url)
      )
    }

    // Exchange code for tokens
    const response = await fetch('/api/integrations/google-drive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'exchange_code',
        code
      })
    })

    if (response.ok) {
      // Success - redirect back to dashboard
      return NextResponse.redirect(
        new URL('/dashboard?integration=google-drive&status=success', request.url)
      )
    } else {
      const errorData = await response.json()
      return NextResponse.redirect(
        new URL(`/dashboard?integration=google-drive&status=error&message=${encodeURIComponent(errorData.error)}`, request.url)
      )
    }
  } catch (error) {
    console.error('Google Drive OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard?integration=google-drive&status=error&message=Authentication failed', request.url)
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { createAIProvider, getAvailableProviders } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { message, documents } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Build context from documents
    let documentContext = ''
    if (documents && documents.length > 0) {
      documentContext = documents.map((doc: any) => 
        `Document: ${doc.name}\nContent: ${doc.extractedText || 'No content extracted'}\n\n`
      ).join('')
    }

    // Create AI provider based on configuration
    let aiProvider
    try {
      aiProvider = createAIProvider()
    } catch (error) {
      console.error('AI Provider creation error:', error)
      return NextResponse.json({ 
        error: 'AI provider not configured. Please set up your API keys in environment variables.',
        availableProviders: getAvailableProviders(),
        currentProvider: process.env.AI_PROVIDER || 'gemini'
      }, { status: 500 })
    }

    // Generate response using the configured provider
    const aiResponse = await aiProvider.generateResponse(message, documentContext)

    return NextResponse.json({ 
      response: aiResponse.text,
      charts: aiResponse.charts,
      summary: aiResponse.summary,
      provider: aiProvider.name,
      availableProviders: getAvailableProviders()
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Provide specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json({ 
          error: 'API key not configured. Please set up your AI provider API key.',
          currentProvider: process.env.AI_PROVIDER || 'gemini',
          availableProviders: getAvailableProviders()
        }, { status: 500 })
      }
      
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return NextResponse.json({ 
          error: 'API rate limit exceeded. Please try again in a moment.',
          provider: process.env.AI_PROVIDER || 'gemini'
        }, { status: 429 })
      }
    }

    return NextResponse.json({ 
      error: 'Failed to process chat request. Please try again.',
      provider: process.env.AI_PROVIDER || 'gemini'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Endpoint to check available AI providers
  try {
    const availableProviders = getAvailableProviders()
    const currentProvider = process.env.AI_PROVIDER || 'gemini'
    
    return NextResponse.json({
      currentProvider,
      availableProviders,
      status: availableProviders.length > 0 ? 'configured' : 'not_configured'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check AI provider status' 
    }, { status: 500 })
  }
} 
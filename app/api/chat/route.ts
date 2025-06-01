import { NextRequest, NextResponse } from 'next/server'
import { createAIProvider, getAvailableProviders } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      documents, 
      integrations,
      isAgentAction,
      actionTitle,
      boardId,
      isMention,
      isQuickAction,
      generateCharts,
      includeStatistics,
      chartTypes,
      requestVisualAnalysis,
      isAgentMention
    } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
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

    // Add context for agent actions and integrations
    let contextualMessage = message
    
    if (isAgentAction && actionTitle) {
      contextualMessage = `Agent Action: ${actionTitle}\n\nRequest: ${message}\n\nPlease provide detailed analysis based on all available documents${integrations && integrations.length > 0 ? ' and connected integrations' : ''}.`
      
      // Add chart and statistics requirements for agent actions
      if (generateCharts) {
        contextualMessage += `\n\nIMPORTANT: Generate visual charts and graphs to support your analysis. Include:`
        if (chartTypes && chartTypes.length > 0) {
          contextualMessage += `\n- Chart types: ${chartTypes.join(', ')} charts`
        }
        contextualMessage += `\n- Bar charts for comparisons and categorical data`
        contextualMessage += `\n- Line charts for trends over time`
        contextualMessage += `\n- Pie charts for proportional data`
        contextualMessage += `\n- Include specific numerical data points`
      }
      
      if (includeStatistics) {
        contextualMessage += `\n\nInclude detailed statistics such as:`
        contextualMessage += `\n- Key performance metrics with numerical values`
        contextualMessage += `\n- Percentage changes and growth rates`
        contextualMessage += `\n- Comparative analysis with benchmarks`
        contextualMessage += `\n- Risk assessments with probability scores`
        contextualMessage += `\n- Recommendations with priority levels`
      }
      
      if (requestVisualAnalysis) {
        contextualMessage += `\n\nProvide visual analysis summaries including:`
        contextualMessage += `\n- Key insights with supporting data`
        contextualMessage += `\n- Actionable recommendations`
        contextualMessage += `\n- Risk factors and mitigation strategies`
        contextualMessage += `\n- Performance indicators and benchmarks`
      }
    } else if (isAgentMention) {
      contextualMessage = `@Agent Request: ${message}\n\nPlease provide helpful analysis based on available documents and context. Focus on actionable insights relevant to board governance and business decisions.`
    }
    
    if (integrations && integrations.length > 0) {
      const integrationNames = integrations.map((i: any) => i.name).join(', ')
      contextualMessage += `\n\nNote: The following integrations are available: ${integrationNames}`
    }

    // Generate response using the configured provider
    const aiResponse = await aiProvider.generateResponse(contextualMessage, documents)

    return NextResponse.json({ 
      response: aiResponse.response,
      charts: aiResponse.charts, // Only include if AI provides chart data
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
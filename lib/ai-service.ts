import { GoogleGenerativeAI } from '@google/generative-ai'

export interface AIProvider {
  name: string
  generateResponse(message: string, context?: string): Promise<string>
}

class GeminiProvider implements AIProvider {
  name = 'Google Gemini'
  private genAI: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async generateResponse(message: string, context?: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })

      const systemPrompt = `You are BoardBravo, an AI assistant specialized in analyzing board meeting documents and corporate governance materials. You help board members, executives, and governance professionals by:

1. Summarizing board decks, meeting minutes, and reports
2. Identifying key risks and mitigation strategies
3. Analyzing financial trends and KPIs
4. Evaluating investment pitches and opportunities
5. Extracting action items and strategic initiatives

When analyzing documents, focus on:
- Executive summaries and key decisions
- Financial performance and trends
- Risk assessments and compliance issues
- Strategic initiatives and market opportunities
- Governance matters and regulatory updates

Provide clear, concise, and actionable insights. Use bullet points and structured responses when appropriate.

${context ? `\nDocument Context:\n${context}` : '\nNo documents have been uploaded yet. Ask the user to upload documents for analysis.'}`

      const fullPrompt = `${systemPrompt}\n\nUser Question: ${message}`
      
      const result = await model.generateContent(fullPrompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API error:', error)
      throw new Error('Failed to generate response with Gemini')
    }
  }
}

class OpenAIProvider implements AIProvider {
  name = 'OpenAI GPT'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateResponse(message: string, context?: string): Promise<string> {
    try {
      const OpenAI = (await import('openai')).default
      const openai = new OpenAI({ apiKey: this.apiKey })

      const systemPrompt = `You are BoardBravo, an AI assistant specialized in analyzing board meeting documents and corporate governance materials. You help board members, executives, and governance professionals by:

1. Summarizing board decks, meeting minutes, and reports
2. Identifying key risks and mitigation strategies
3. Analyzing financial trends and KPIs
4. Evaluating investment pitches and opportunities
5. Extracting action items and strategic initiatives

When analyzing documents, focus on:
- Executive summaries and key decisions
- Financial performance and trends
- Risk assessments and compliance issues
- Strategic initiatives and market opportunities
- Governance matters and regulatory updates

Provide clear, concise, and actionable insights. Use bullet points and structured responses when appropriate.

${context ? `\nDocument Context:\n${context}` : '\nNo documents have been uploaded yet. Ask the user to upload documents for analysis.'}`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })

      return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.'
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to generate response with OpenAI')
    }
  }
}

class AnthropicProvider implements AIProvider {
  name = 'Anthropic Claude'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateResponse(message: string, context?: string): Promise<string> {
    try {
      // Note: You would need to install @anthropic-ai/sdk for this to work
      // For now, this is a placeholder implementation
      throw new Error('Anthropic provider not yet implemented. Please install @anthropic-ai/sdk and implement.')
    } catch (error) {
      console.error('Anthropic API error:', error)
      throw new Error('Failed to generate response with Anthropic')
    }
  }
}

export function createAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || 'gemini'

  switch (provider.toLowerCase()) {
    case 'gemini':
      const geminiKey = process.env.GOOGLE_AI_API_KEY
      if (!geminiKey) {
        throw new Error('GOOGLE_AI_API_KEY environment variable is required for Gemini provider')
      }
      return new GeminiProvider(geminiKey)

    case 'openai':
      const openaiKey = process.env.OPENAI_API_KEY
      if (!openaiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required for OpenAI provider')
      }
      return new OpenAIProvider(openaiKey)

    case 'anthropic':
      const anthropicKey = process.env.ANTHROPIC_API_KEY
      if (!anthropicKey) {
        throw new Error('ANTHROPIC_API_KEY environment variable is required for Anthropic provider')
      }
      return new AnthropicProvider(anthropicKey)

    default:
      throw new Error(`Unsupported AI provider: ${provider}. Supported providers: gemini, openai, anthropic`)
  }
}

export function getAvailableProviders(): string[] {
  const providers = []
  
  if (process.env.GOOGLE_AI_API_KEY) providers.push('gemini')
  if (process.env.OPENAI_API_KEY) providers.push('openai')
  if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic')
  
  return providers
} 
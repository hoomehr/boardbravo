import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  Zap, 
  Settings, 
  User, 
  Menu, 
  X
} from 'lucide-react'

interface AIProviderStatus {
  currentProvider: string
  availableProviders: string[]
  status: 'configured' | 'not_configured'
}

interface NavbarProps {
  currentPage?: string
}

export default function Navbar({ currentPage = 'dashboard' }: NavbarProps) {
  const [aiProviderStatus, setAIProviderStatus] = useState<AIProviderStatus | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    checkAIProviderStatus()
  }, [])

  const checkAIProviderStatus = async () => {
    try {
      const response = await fetch('/api/chat')
      const data = await response.json()
      setAIProviderStatus(data)
    } catch (error) {
      console.error('Failed to check AI provider status:', error)
    }
  }

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case 'gemini':
        return 'Google Gemini'
      case 'openai':
        return 'OpenAI GPT'
      case 'anthropic':
        return 'Anthropic Claude'
      default:
        return provider
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">BoardBravo</span>
            </Link>
          </div>

          {/* Right Side - AI Status and User Menu */}
          <div className="flex items-center space-x-4">
            {/* AI Provider Status */}
            <div className="hidden sm:flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2 border">
              <div className={`w-2 h-2 rounded-full ${
                aiProviderStatus?.status === 'configured' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-700">
                {aiProviderStatus?.currentProvider ? getProviderDisplayName(aiProviderStatus.currentProvider) : 'Loading...'}
              </span>
            </div>

            {/* Settings */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              <User className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {/* Mobile AI Status */}
            <div className="px-4 py-2">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  aiProviderStatus?.status === 'configured' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium text-gray-700">
                  AI: {aiProviderStatus?.currentProvider ? getProviderDisplayName(aiProviderStatus.currentProvider) : 'Loading...'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 
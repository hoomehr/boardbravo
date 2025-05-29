import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  Zap, 
  Settings, 
  User, 
  Menu, 
  X,
  Home,
  BarChart3,
  FileText,
  MessageSquare
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

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, id: 'dashboard' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, id: 'analytics' },
    { name: 'Documents', href: '/documents', icon: FileText, id: 'documents' },
    { name: 'Chat', href: '/chat', icon: MessageSquare, id: 'chat' }
  ]

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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Mobile AI Status */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 px-4 py-2">
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
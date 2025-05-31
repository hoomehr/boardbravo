import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { 
  Zap, 
  Settings, 
  User, 
  Menu, 
  X,
  Brain,
  Key,
  CreditCard,
  Check,
  ChevronDown,
  Star,
  Sparkles
} from 'lucide-react'

interface AIProviderStatus {
  currentProvider: string
  availableProviders: string[]
  status: 'configured' | 'not_configured'
}

interface NavbarProps {
  currentPage?: string
}

interface APIKeyConfig {
  provider: string
  hasUserKey: boolean
  usingCredits: boolean
  creditsRemaining?: number
}

export default function Navbar({ currentPage = 'dashboard' }: NavbarProps) {
  const [aiProviderStatus, setAIProviderStatus] = useState<AIProviderStatus | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showProviderCard, setShowProviderCard] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('gemini')
  const [apiKeys, setApiKeys] = useState<{ [key: string]: string }>({
    gemini: '',
    openai: '',
    anthropic: ''
  })
  const [keyConfigs, setKeyConfigs] = useState<{ [key: string]: APIKeyConfig }>({
    gemini: { provider: 'gemini', hasUserKey: false, usingCredits: true, creditsRemaining: 150 },
    openai: { provider: 'openai', hasUserKey: false, usingCredits: false },
    anthropic: { provider: 'anthropic', hasUserKey: false, usingCredits: false }
  })
  const [tempApiKey, setTempApiKey] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    checkAIProviderStatus()
    loadSavedConfigs()
  }, [])

  // Close card when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && buttonRef.current && 
          !cardRef.current.contains(event.target as Node) && 
          !buttonRef.current.contains(event.target as Node)) {
        setShowProviderCard(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const checkAIProviderStatus = async () => {
    try {
      const response = await fetch('/api/chat')
      const data = await response.json()
      setAIProviderStatus(data)
      if (data.currentProvider) {
        setSelectedProvider(data.currentProvider)
      }
    } catch (error) {
      console.error('Failed to check AI provider status:', error)
    }
  }

  const loadSavedConfigs = () => {
    // Load from localStorage if available
    const saved = localStorage.getItem('boardbravo-ai-configs')
    if (saved) {
      try {
        const configs = JSON.parse(saved)
        setKeyConfigs(configs)
      } catch (error) {
        console.error('Failed to load saved configs:', error)
      }
    }
  }

  const saveConfigs = (newConfigs: { [key: string]: APIKeyConfig }) => {
    localStorage.setItem('boardbravo-ai-configs', JSON.stringify(newConfigs))
    setKeyConfigs(newConfigs)
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

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'gemini':
        return <Sparkles className="w-4 h-4 text-blue-500" />
      case 'openai':
        return <Brain className="w-4 h-4 text-green-500" />
      case 'anthropic':
        return <Star className="w-4 h-4 text-orange-500" />
      default:
        return <Brain className="w-4 h-4 text-gray-500" />
    }
  }

  const handleProviderSwitch = async (provider: string) => {
    setSelectedProvider(provider)
    
    // Update the backend
    try {
      await fetch('/api/ai-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          provider,
          apiKey: keyConfigs[provider].hasUserKey ? apiKeys[provider] : null,
          useCredits: keyConfigs[provider].usingCredits
        })
      })
      
      // Refresh status
      checkAIProviderStatus()
    } catch (error) {
      console.error('Failed to switch provider:', error)
    }
  }

  const handleSaveApiKey = (provider: string) => {
    if (!tempApiKey.trim()) return

    const newApiKeys = { ...apiKeys, [provider]: tempApiKey }
    const newConfigs = {
      ...keyConfigs,
      [provider]: {
        ...keyConfigs[provider],
        hasUserKey: true,
        usingCredits: false
      }
    }

    setApiKeys(newApiKeys)
    saveConfigs(newConfigs)
    setTempApiKey('')

    // Save to backend
    fetch('/api/ai-provider/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey: tempApiKey })
    }).catch(console.error)
  }

  const handleToggleCredits = (provider: string) => {
    const newConfigs = {
      ...keyConfigs,
      [provider]: {
        ...keyConfigs[provider],
        usingCredits: !keyConfigs[provider].usingCredits,
        hasUserKey: keyConfigs[provider].hasUserKey && !keyConfigs[provider].usingCredits
      }
    }
    saveConfigs(newConfigs)
  }

  const currentConfig = keyConfigs[selectedProvider]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-14">
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

          {/* Right Side - AI Provider Selector and User Menu */}
          <div className="flex items-center space-x-4">
            {/* AI Provider Selector with Hover Card */}
            <div className="relative">
              <button
                ref={buttonRef}
                onMouseEnter={() => setShowProviderCard(true)}
                onClick={() => setShowProviderCard(!showProviderCard)}
                className="hidden sm:flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 border border-gray-200 hover:border-gray-300 transition-all duration-200"
              >
                {getProviderIcon(selectedProvider)}
                <span className="text-sm font-medium text-gray-700">
                  {getProviderDisplayName(selectedProvider)}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  aiProviderStatus?.status === 'configured' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* Provider Selection Card */}
              {showProviderCard && (
                <div
                  ref={cardRef}
                  onMouseLeave={() => setShowProviderCard(false)}
                  className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-xl border border-gray-200 p-6 z-50"
                >
                  <div className="space-y-6">
                    {/* Header */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">AI Provider Settings</h3>
                      <p className="text-sm text-gray-500">Choose your AI provider and manage API keys</p>
                    </div>

                    {/* Provider Selection */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Select Provider</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {['gemini', 'openai', 'anthropic'].map((provider) => (
                          <button
                            key={provider}
                            onClick={() => handleProviderSwitch(provider)}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                              selectedProvider === provider
                                ? 'bg-blue-50 border-blue-200 text-blue-900'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {getProviderIcon(provider)}
                              <span className="font-medium">{getProviderDisplayName(provider)}</span>
                            </div>
                            {selectedProvider === provider && (
                              <Check className="w-4 h-4 text-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Current Provider Configuration */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">
                        Configure {getProviderDisplayName(selectedProvider)}
                      </h4>

                      {/* Credits Option */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-900">Use BoardBravo Credits</span>
                            {currentConfig.creditsRemaining && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {currentConfig.creditsRemaining} remaining
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleToggleCredits(selectedProvider)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              currentConfig.usingCredits ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                currentConfig.usingCredits ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <p className="text-xs text-blue-700">
                          Use our pre-configured API with included credits. No setup required.
                        </p>
                      </div>

                      {/* API Key Option */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Key className="w-4 h-4 text-gray-600" />
                            <span className="font-medium text-gray-700">Your API Key</span>
                          </div>
                          {currentConfig.hasUserKey && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Configured
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <input
                            type="password"
                            value={tempApiKey}
                            onChange={(e) => setTempApiKey(e.target.value)}
                            placeholder={`Enter ${getProviderDisplayName(selectedProvider)} API key`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => handleSaveApiKey(selectedProvider)}
                            disabled={!tempApiKey.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Save
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Use your own API key for unlimited usage and better privacy.
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Current status:</span>
                        <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                aiProviderStatus?.status === 'configured' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
                          <span className={aiProviderStatus?.status === 'configured' ? 'text-green-600' : 'text-red-600'}>
                            {aiProviderStatus?.status === 'configured' ? 'Connected' : 'Not configured'}
              </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                {getProviderIcon(selectedProvider)}
                <span className="text-sm font-medium text-gray-700">
                  AI: {getProviderDisplayName(selectedProvider)}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  aiProviderStatus?.status === 'configured' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 
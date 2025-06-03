'use client'

import { useState } from 'react'
import { 
  Database, 
  Mail, 
  Users, 
  Building2, 
  Plus, 
  Settings, 
  Check, 
  X, 
  ExternalLink,
  Zap,
  FileText,
  Calendar,
  BarChart3,
  GitBranch,
  CheckSquare,
  AlertCircle,
  Loader2,
  Globe,
  Shield,
  Key
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  icon: React.ComponentType<any>
  status: 'connected' | 'disconnected' | 'connecting' | 'error'
  description: string
  color: string
  category: 'productivity' | 'communication' | 'data' | 'development'
  features: string[]
  setupComplexity: 'easy' | 'medium' | 'advanced'
  lastSync?: string
  dataCount?: number
}

interface IntegrationsCardProps {
  integrations: Integration[]
  onConnect: (integrationId: string) => void
}

export default function IntegrationsCard({ integrations, onConnect }: IntegrationsCardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  // Enhanced integrations list with Jira and Notion
  const enhancedIntegrations: Integration[] = [
    {
      id: 'notion',
      name: 'Notion',
      icon: FileText,
      status: 'disconnected',
      description: 'Sync board documentation, meeting notes, and knowledge base',
      color: 'bg-gray-900',
      category: 'productivity',
      features: ['Document sync', 'Meeting notes', 'Task management', 'Knowledge base'],
      setupComplexity: 'easy',
      dataCount: 0
    },
    {
      id: 'jira',
      name: 'Jira',
      icon: GitBranch,
      status: 'disconnected',
      description: 'Track development progress, sprint metrics, and project status',
      color: 'bg-blue-600',
      category: 'development',
      features: ['Sprint tracking', 'Issue management', 'Progress reports', 'Team metrics'],
      setupComplexity: 'medium',
      dataCount: 0
    },
    {
      id: 'gmail',
      name: 'Gmail',
      icon: Mail,
      status: 'disconnected',
      description: 'Connect Gmail for email document analysis and communication tracking',
      color: 'bg-red-500',
      category: 'communication',
      features: ['Email analysis', 'Document extraction', 'Communication metrics'],
      setupComplexity: 'easy',
      dataCount: 0
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      icon: Database,
      status: 'disconnected',
      description: 'Access and analyze board documents from Google Drive',
      color: 'bg-blue-500',
      category: 'data',
      features: ['Document sync', 'File analysis', 'Version tracking'],
      setupComplexity: 'easy',
      dataCount: 0
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      icon: Users,
      status: 'disconnected',
      description: 'Connect CRM data for customer insights and revenue analytics',
      color: 'bg-orange-500',
      category: 'data',
      features: ['Customer data', 'Sales analytics', 'Revenue tracking'],
      setupComplexity: 'medium',
      dataCount: 0
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: Zap,
      status: 'disconnected',
      description: 'Monitor team communications and extract key discussions',
      color: 'bg-purple-600',
      category: 'communication',
      features: ['Team chat analysis', 'Key discussions', 'Communication insights'],
      setupComplexity: 'easy',
      dataCount: 0
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      icon: BarChart3,
      status: 'disconnected',
      description: 'Enterprise CRM integration for comprehensive sales analytics',
      color: 'bg-cyan-600',
      category: 'data',
      features: ['Sales pipeline', 'Customer analytics', 'Revenue forecasting'],
      setupComplexity: 'advanced',
      dataCount: 0
    },
    {
      id: 'microsoft-teams',
      name: 'Microsoft Teams',
      icon: Users,
      status: 'disconnected',
      description: 'Connect Teams for meeting transcripts and collaboration data',
      color: 'bg-indigo-600',
      category: 'communication',
      features: ['Meeting transcripts', 'Team collaboration', 'File sharing'],
      setupComplexity: 'medium',
      dataCount: 0
    }
  ]

  const categories = [
    { id: 'all', name: 'All', icon: Globe, count: enhancedIntegrations.length },
    { id: 'productivity', name: 'Productivity', icon: CheckSquare, count: enhancedIntegrations.filter(i => i.category === 'productivity').length },
    { id: 'communication', name: 'Communication', icon: Mail, count: enhancedIntegrations.filter(i => i.category === 'communication').length },
    { id: 'data', name: 'Data Sources', icon: Database, count: enhancedIntegrations.filter(i => i.category === 'data').length },
    { id: 'development', name: 'Development', icon: GitBranch, count: enhancedIntegrations.filter(i => i.category === 'development').length }
  ]

  const filteredIntegrations = selectedCategory === 'all' 
    ? enhancedIntegrations 
    : enhancedIntegrations.filter(integration => integration.category === selectedCategory)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200'
      case 'connecting': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Check className="w-3 h-3" />
      case 'connecting': return <Loader2 className="w-3 h-3 animate-spin" />
      case 'error': return <AlertCircle className="w-3 h-3" />
      default: return <X className="w-3 h-3" />
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'easy': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'advanced': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration)
    setShowSetupModal(true)
  }

  const handleConfirmConnect = () => {
    if (selectedIntegration) {
      onConnect(selectedIntegration.id)
      setShowSetupModal(false)
      setSelectedIntegration(null)
    }
  }

  const connectedCount = enhancedIntegrations.filter(i => i.status === 'connected').length

  return (
    <>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-semibold text-gray-900">Data Connections</h2>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              {connectedCount}/{enhancedIntegrations.length} connected
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">{filteredIntegrations.length} available</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1 mb-4">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                }`}
              >
                <IconComponent className="w-3 h-3" />
                <span>{category.name}</span>
                <span className="text-xs bg-white bg-opacity-50 px-1 rounded">
                  {category.count}
        </span>
              </button>
            )
          })}
      </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
          {filteredIntegrations.map((integration) => {
            const IconComponent = integration.icon
            return (
          <div 
            key={integration.id} 
                className={`relative p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                  integration.status === 'connected'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Integration Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${integration.color} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">{integration.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(integration.status)}`}>
                          {getStatusIcon(integration.status)}
                          <span className="ml-1">{integration.status}</span>
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(integration.setupComplexity)}`}>
                          {integration.setupComplexity} setup
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <button
                    onClick={() => handleConnect(integration)}
                    disabled={integration.status === 'connecting'}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              integration.status === 'connected'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : integration.status === 'connecting'
                        ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {integration.status === 'connected' ? (
                      <>
                        <Settings className="w-3 h-3" />
                        <span>Manage</span>
                      </>
                    ) : integration.status === 'connecting' ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Connecting</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                  {integration.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-1">
                  {integration.features.slice(0, 3).map((feature, index) => (
                    <span
                      key={index}
                      className="inline-block text-xs bg-white bg-opacity-60 text-gray-700 px-2 py-1 rounded border"
                    >
                      {feature}
                    </span>
                  ))}
                  {integration.features.length > 3 && (
                    <span className="inline-block text-xs text-gray-500 px-2 py-1">
                      +{integration.features.length - 3} more
                    </span>
                  )}
                </div>

                {/* Connected Data Count */}
                {integration.status === 'connected' && integration.dataCount !== undefined && (
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-700 font-medium">
                        {integration.dataCount} items synced
                      </span>
                      {integration.lastSync && (
                        <span className="text-green-600">
                          Last sync: {integration.lastSync}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
            </div>
            
        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Secure OAuth connections</span>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Enterprise security</span>
            </div>
          </div>
        </div>
            </div>
            
      {/* Connection Setup Modal */}
      {showSetupModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            {/* Modal Header */}
            <div className={`${selectedIntegration.color} px-6 py-4 rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <selectedIntegration.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Connect {selectedIntegration.name}
                    </h3>
                    <p className="text-sm text-white text-opacity-80">
                      {selectedIntegration.setupComplexity} setup • {selectedIntegration.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSetupModal(false)}
                  className="text-white hover:text-gray-200 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">What you'll get:</h4>
                  <p className="text-sm text-gray-600">{selectedIntegration.description}</p>
                </div>

                {/* Features */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Features included:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedIntegration.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
          </div>
        ))}
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-medium text-blue-900">Secure Connection</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        We use OAuth 2.0 for secure authentication. Your credentials are never stored on our servers.
                      </p>
                    </div>
                  </div>
      </div>

                {/* Setup Steps */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Setup process:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</div>
                      <span className="text-sm text-gray-700">Authorize BoardBravo to access your {selectedIntegration.name} account</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</div>
                      <span className="text-sm text-gray-700">Select data sources and permissions</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</div>
                      <span className="text-sm text-gray-700">Start syncing data to your board workspace</span>
                    </div>
                  </div>
                </div>
          </div>
        </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Setup typically takes 2-3 minutes
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowSetupModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmConnect}
                    className={`px-6 py-2 ${selectedIntegration.color} text-white rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2 font-medium shadow-lg`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Connect {selectedIntegration.name}</span>
          </button>
        </div>
      </div>
    </div>
          </div>
        </div>
      )}
    </>
  )
} 
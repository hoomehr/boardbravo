'use client'

import { Mail, FolderOpen, Users, Server, Database } from 'lucide-react'

interface Integration {
  id: string
  name: string
  icon: React.ReactNode
  status: 'connected' | 'disconnected' | 'error'
  description: string
  color: string
}

interface IntegrationsCardProps {
  integrations: Integration[]
  onConnect: (integrationId: string) => void
}

export default function IntegrationsCard({
  integrations,
  onConnect
}: IntegrationsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-900">Data Connections</h2>
        </div>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          {integrations.filter(i => i.status === 'connected').length} / {integrations.length} connected
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {integrations.map((integration) => (
          <div 
            key={integration.id} 
            className={`relative p-3 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer group ${
              integration.status === 'connected'
                ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                : 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 hover:border-gray-300'
            }`}
            onClick={() => onConnect(integration.id)}
          >
            {/* Connection Status Indicator */}
            <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
              integration.status === 'connected' ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            
            {/* Integration Icon */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 ${
              integration.id === 'gmail' ? 'bg-red-500' :
              integration.id === 'google-drive' ? 'bg-blue-500' :
              integration.id === 'hubspot' ? 'bg-orange-500' :
              integration.id === 'mcp-server' ? 'bg-purple-500' :
              'bg-gray-500'
            }`}>
              <div className="text-white">
                {integration.icon}
              </div>
            </div>
            
            {/* Integration Info */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-gray-900">{integration.name}</h3>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{integration.description}</p>
            </div>
            
            {/* Status Badge */}
            <div className="mt-3 flex items-center justify-between">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                integration.status === 'connected'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  integration.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                {integration.status === 'connected' ? 'Connected' : 'Available'}
              </span>
              
              {/* Connect Button */}
              {integration.status !== 'connected' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onConnect(integration.id)
                  }}
                  className="px-2 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors opacity-0 group-hover:opacity-100"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {integrations.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Database className="w-6 h-6 text-gray-500" />
          </div>
          <p className="text-gray-500 text-sm font-medium">No integrations available</p>
          <p className="text-gray-400 text-xs mt-1">Connect data sources to enhance analysis</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Quick setup available</span>
          <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            View All →
          </button>
        </div>
      </div>
    </div>
  )
} 
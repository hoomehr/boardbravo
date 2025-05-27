'use client'

import React from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Users, Target, Calendar } from 'lucide-react'

interface SummaryMetric {
  title: string
  value: string | number
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: 'revenue' | 'users' | 'target' | 'calendar' | 'warning' | 'success'
  description?: string
}

interface SummaryCardProps {
  title: string
  metrics: SummaryMetric[]
  insights?: string[]
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, metrics, insights }) => {
  const getIcon = (iconType?: string) => {
    const iconClass = "w-5 h-5"
    switch (iconType) {
      case 'revenue':
        return <DollarSign className={iconClass} />
      case 'users':
        return <Users className={iconClass} />
      case 'target':
        return <Target className={iconClass} />
      case 'calendar':
        return <Calendar className={iconClass} />
      case 'warning':
        return <AlertTriangle className={iconClass} />
      case 'success':
        return <CheckCircle className={iconClass} />
      default:
        return <TrendingUp className={iconClass} />
    }
  }

  const getChangeIcon = (changeType?: string) => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getChangeColor = (changeType?: string) => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-gray-200 p-6 my-4">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getIcon(metric.icon)}
                <span className="text-sm font-medium text-gray-600">{metric.title}</span>
              </div>
              {metric.change !== undefined && getChangeIcon(metric.changeType)}
            </div>
            
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
              {metric.change !== undefined && (
                <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
              )}
            </div>
            
            {metric.description && (
              <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Key Insights */}
      {insights && insights.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
            Key Insights
          </h4>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SummaryCard 
// Sample data for testing chart and summary functionality

export const sampleChartData = {
  revenue: {
    type: 'bar' as const,
    title: 'Quarterly Revenue Growth',
    data: [
      { name: 'Q1 2023', value: 2400000 },
      { name: 'Q2 2023', value: 2800000 },
      { name: 'Q3 2023', value: 3200000 },
      { name: 'Q4 2023', value: 3600000 },
      { name: 'Q1 2024', value: 4100000 }
    ],
    description: 'Revenue has shown consistent growth over the past 5 quarters'
  },

  risks: {
    type: 'pie' as const,
    title: 'Risk Distribution by Category',
    data: [
      { name: 'Market Risk', value: 35 },
      { name: 'Operational Risk', value: 25 },
      { name: 'Financial Risk', value: 20 },
      { name: 'Regulatory Risk', value: 15 },
      { name: 'Technology Risk', value: 5 }
    ],
    description: 'Current risk exposure across different categories'
  },

  performance: {
    type: 'line' as const,
    title: 'Key Performance Indicators Trend',
    data: [
      { name: 'Jan', value: 85 },
      { name: 'Feb', value: 88 },
      { name: 'Mar', value: 92 },
      { name: 'Apr', value: 89 },
      { name: 'May', value: 94 },
      { name: 'Jun', value: 97 }
    ],
    description: 'Overall performance score trending upward'
  },

  expenses: {
    type: 'area' as const,
    title: 'Operating Expenses Over Time',
    data: [
      { name: 'Q1', value: 1200000 },
      { name: 'Q2', value: 1350000 },
      { name: 'Q3', value: 1400000 },
      { name: 'Q4', value: 1500000 }
    ],
    description: 'Operating expenses showing controlled growth'
  }
}

export const sampleSummaryData = {
  financial: {
    title: 'Financial Performance Summary',
    metrics: [
      {
        title: 'Total Revenue',
        value: '$4.1M',
        change: 15.2,
        changeType: 'positive' as const,
        icon: 'revenue' as const,
        description: 'Q1 2024 vs Q1 2023'
      },
      {
        title: 'Active Users',
        value: '125K',
        change: 8.7,
        changeType: 'positive' as const,
        icon: 'users' as const,
        description: 'Monthly active users'
      },
      {
        title: 'Market Share',
        value: '23%',
        change: -2.1,
        changeType: 'negative' as const,
        icon: 'target' as const,
        description: 'Industry market share'
      },
      {
        title: 'Burn Rate',
        value: '$850K',
        change: -12.5,
        changeType: 'positive' as const,
        icon: 'calendar' as const,
        description: 'Monthly burn rate'
      },
      {
        title: 'Risk Score',
        value: '7.2/10',
        change: 0,
        changeType: 'neutral' as const,
        icon: 'warning' as const,
        description: 'Overall risk assessment'
      },
      {
        title: 'Compliance',
        value: '98%',
        change: 3.2,
        changeType: 'positive' as const,
        icon: 'success' as const,
        description: 'Regulatory compliance'
      }
    ],
    insights: [
      'Revenue growth accelerated to 15.2% year-over-year, exceeding board targets',
      'User acquisition costs decreased by 18% while maintaining quality metrics',
      'Market share decline attributed to new competitor entry, recovery plan in progress',
      'Operational efficiency improvements reduced burn rate significantly',
      'All major compliance requirements met with room for improvement in data governance'
    ]
  },

  risks: {
    title: 'Risk Assessment Overview',
    metrics: [
      {
        title: 'High Priority',
        value: '3',
        icon: 'warning' as const,
        description: 'Critical risks requiring immediate attention'
      },
      {
        title: 'Medium Priority',
        value: '7',
        icon: 'target' as const,
        description: 'Risks under active monitoring'
      },
      {
        title: 'Mitigated',
        value: '12',
        icon: 'success' as const,
        description: 'Successfully addressed risks'
      }
    ],
    insights: [
      'Cybersecurity risk elevated due to recent industry incidents',
      'Supply chain disruption risk decreased with new vendor partnerships',
      'Regulatory compliance risk stable with upcoming policy changes monitored'
    ]
  }
}

export function generateSampleResponse(query: string) {
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('revenue') || lowerQuery.includes('financial') || lowerQuery.includes('money')) {
    return {
      text: "Based on the financial documents, here's an analysis of revenue performance and key financial metrics:",
      charts: [sampleChartData.revenue],
      summary: sampleSummaryData.financial
    }
  }
  
  if (lowerQuery.includes('risk') || lowerQuery.includes('threat') || lowerQuery.includes('danger')) {
    return {
      text: "Here's a comprehensive risk analysis based on the board documents:",
      charts: [sampleChartData.risks],
      summary: sampleSummaryData.risks
    }
  }
  
  if (lowerQuery.includes('performance') || lowerQuery.includes('kpi') || lowerQuery.includes('metric')) {
    return {
      text: "Performance analysis shows positive trends across key indicators:",
      charts: [sampleChartData.performance, sampleChartData.expenses],
      summary: sampleSummaryData.financial
    }
  }
  
  if (lowerQuery.includes('chart') || lowerQuery.includes('graph') || lowerQuery.includes('visual')) {
    return {
      text: "Here are some key visualizations from your board documents:",
      charts: [sampleChartData.revenue, sampleChartData.risks, sampleChartData.performance]
    }
  }
  
  if (lowerQuery.includes('summary') || lowerQuery.includes('overview') || lowerQuery.includes('dashboard')) {
    return {
      text: "Here's a comprehensive summary of your board documents with key metrics and insights:",
      summary: sampleSummaryData.financial
    }
  }
  
  return null
} 